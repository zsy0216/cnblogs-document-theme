/**
 * v7.22 专项验证：页首加载器的双源逻辑（镜像优先 / 博客园兜底 / 失败记忆）。
 *
 * 这条链路极易「本地看不出来、线上才炸」，所以必须真跑三种情况：
 *   A 镜像正常   → 只发一个脚本请求，主题生效，不写失败记忆
 *   B 镜像失效   → 先试镜像（失败）再自动补兜底源，主题仍然生效，写入失败记忆
 *   C 记忆生效   → 同一 context 再进站，直接走兜底源，不再空等镜像
 *
 * 做法：读真实的 dist/paste/页首.html，把两个源地址替换成测试域名，
 * 再用 page.route 决定哪个域名给内容、哪个 abort —— 不依赖外网，也不改产物。
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const HEAD = fs.readFileSync(ROOT + 'dist/paste/页首.html', 'utf8');
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

// 镜像地址按 tag 钉死（@v7.22 这种），版本号随发版变化，所以用正则取，别硬编码版本。
const MIRROR_LIT = (HEAD.match(/'https:\/\/gcore\.jsdelivr\.net\/gh\/zsy0216\/cnblogs-document-theme@[^']+'/) || [])[0];
const ORIGIN_LIT = "'https://blog-static.cnblogs.com/files/blogs/477677/document-theme.js?v='";
const MIRROR = 'https://mirror.test/bundle.js';
const ORIGIN = 'https://origin.test/bundle.js';

if (!MIRROR_LIT || !HEAD.includes(ORIGIN_LIT)) {
  console.error('✗ 页首里找不到两个源地址的字面量，加载器可能被改写了');
  process.exit(1);
}

const PAGE = '<!doctype html><html><head><meta charset="utf-8"><title>loader</title></head><body>'
  + HEAD.replace(MIRROR_LIT, "'" + MIRROR + "'").replace(ORIGIN_LIT, "'" + ORIGIN + "?v='")
  + '<div id="main"><div id="post_detail"><h1 class="postTitle">测试</h1>'
  + '<div class="postBody"><h2>一、小节</h2><p>正文。</p></div></div></div>'
  + '</body></html>';

let bad = 0;
function ck(label, ok, got) {
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : '  → ' + JSON.stringify(got)));
}

async function open(ctx, mirrorOk) {
  const p = await ctx.newPage();
  const order = [];
  p.on('request', (r) => {
    const u = r.url();
    if (u.startsWith(MIRROR)) order.push('mirror');
    else if (u.startsWith(ORIGIN)) order.push('origin');
  });
  await p.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(MIRROR)) {
      return mirrorOk
        ? route.fulfill({ contentType: 'application/javascript', body: BUNDLE })
        : route.abort('failed');
    }
    if (u.startsWith(ORIGIN)) {
      return mirrorOk
        ? route.abort('failed')                                  // A 里不该被请求
        : route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: PAGE });
  });
  await p.goto('https://www.cnblogs.com/zhangshuaiyin/p/fake.html', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const nav = await p.evaluate(() => document.querySelectorAll('#qb-nav a').length);
  const cls = await p.evaluate(() => document.documentElement.className);
  const mem = await p.evaluate(() => localStorage.getItem('qb-src-fail'));
  return { p, order, nav, cls, mem };
}

(async () => {
  const browser = await chromium.launch();

  console.log('\n[A] 镜像正常');
  {
    const ctx = await browser.newContext();
    const r = await open(ctx, true);
    ck('只请求镜像一个源', JSON.stringify(r.order) === '["mirror"]', r.order);
    ck('主题生效（顶栏 11 条链接）', r.nav === 11, r.nav);
    ck('首帧闸门已放行（html.qb-ready）', /qb-ready/.test(r.cls), r.cls);
    ck('不写失败记忆', r.mem === null, r.mem);
    await ctx.close();
  }

  console.log('\n[B] 镜像失效 → 兜底');
  {
    const ctx = await browser.newContext();
    const r = await open(ctx, false);
    ck('先试镜像再走兜底', JSON.stringify(r.order) === '["mirror","origin"]', r.order);
    ck('兜底后主题仍生效', r.nav === 11, r.nav);
    ck('写入失败记忆（时间戳）', /^\d{10,}$/.test(r.mem || ''), r.mem);

    console.log('\n[C] 失败记忆生效（同 context 再进一次）');
    const r2 = await open(ctx, false);
    ck('不再尝试镜像', !r2.order.includes('mirror'), r2.order);
    ck('首个请求就是兜底源', r2.order[0] === 'origin', r2.order);
    ck('主题生效', r2.nav === 11, r2.nav);

    console.log('\n[D] 记忆过期后回到镜像优先');
    await r2.p.evaluate((ttl) => {
      localStorage.setItem('qb-src-fail', String(Date.now() - ttl - 1000));
    }, 3600000);
    const r3 = await open(ctx, false);
    ck('过期后重新试镜像', r3.order[0] === 'mirror', r3.order);
    await ctx.close();
  }

  await browser.close();
  console.log(bad ? '\n✗ ' + bad + ' 项不通过' : '\n✓ 双源加载器全部通过');
  process.exit(bad ? 1 : 0);
})();
