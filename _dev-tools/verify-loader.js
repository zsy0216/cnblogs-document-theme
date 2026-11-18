/**
 * 页首加载器的双源逻辑，两份页首各测一遍。
 *
 * 现在有两份（gen-deploy.py 生成）：
 *   dist/paste/页首.html          通用版（发给别人）：主源 cdn、备源 fastly，两个都是 jsDelivr
 *   dist/paste/页首-我的站.html    作者版：同上（v7.36 起不再用作者的 blog-static）
 *
 * 每条链路都要真跑四种情况：
 *   A 主源正常   → 只发一个脚本请求，主题生效，不写失败记忆
 *   B 主源失效   → 先试主源再切备源，主题仍生效，写入失败记忆
 *   C 记忆生效   → 同 context 再进站，直接走备源，不再空等主源
 *   D 记忆过期   → 回到主源优先
 *
 * 做法：读真实的产物页首，把两个源地址换成测试域名，用 page.route 决定谁给内容、谁 abort。
 * 不依赖外网，也不改产物。正则取地址而不硬编码版本号 —— 版本随发版变化。
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

let bad = 0;
function ck(label, ok, got) {
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : '  → ' + JSON.stringify(got)));
}

function lit(head, name) {
  /* 地址可能被 q() 包着（拼当天日期参数用），两种写法都要认 */
  const m = head.match(new RegExp("var " + name + " = (?:q\\()?'([^']+)'"));
  return m && m[1];
}

/* 把真实的源地址换成测试域名：q('…') 与 '…' 两种写法都替换 */
function swap(head, name, litText, newUrl) {
  head = head.replace("var " + name + " = q('" + litText + "')", "var " + name + " = '" + newUrl + "'");
  return head.replace("var " + name + " = '" + litText + "'", "var " + name + " = '" + newUrl + "'");
}

function makeCase(file, tag) {
  const head = fs.readFileSync(ROOT + 'dist/paste/' + file, 'utf8');
  const mirrorLit = lit(head, 'MIRROR');
  const fallbackLit = lit(head, 'FALLBACK');
  if (!mirrorLit || !fallbackLit) {
    console.error('✗ ' + file + ' 里找不到 MIRROR / FALLBACK 字面量，加载器可能被改写了');
    process.exit(1);
  }
  const MIRROR = 'https://' + tag + '-main.test/bundle.js';
  const FALLBACK = 'https://' + tag + '-backup.test/bundle.js';
  const page = '<!doctype html><html><head><meta charset="utf-8"><title>loader</title></head><body>'
    + swap(swap(head, 'MIRROR', mirrorLit, MIRROR), 'FALLBACK', fallbackLit, FALLBACK)
    + '<div id="main"><div id="post_detail"><h1 class="postTitle">测试</h1>'
    + '<div class="postBody"><h2>一、小节</h2><p>正文。</p></div></div></div>'
    + '</body></html>';
  return { file, MIRROR, FALLBACK, page, mirrorLit, fallbackLit };
}

async function open(ctx, C, mainOk) {
  const p = await ctx.newPage();
  const order = [];
  p.on('request', (r) => {
    const u = r.url();
    if (u.startsWith(C.MIRROR)) order.push('main');
    else if (u.startsWith(C.FALLBACK)) order.push('backup');
  });
  await p.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(C.MIRROR)) {
      return mainOk
        ? route.fulfill({ contentType: 'application/javascript', body: BUNDLE })
        : route.abort('failed');
    }
    if (u.startsWith(C.FALLBACK)) {
      return mainOk
        ? route.abort('failed')                                   /* A 里不该被请求 */
        : route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: C.page });
  });
  await p.goto('https://www.cnblogs.com/zhangshuaiyin/p/fake.html', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({
    nav: document.querySelectorAll('#qb-nav a').length,
    cls: document.documentElement.className,
    mem: localStorage.getItem('qb-src-fail'),
  }));
  return { p, order, nav: st.nav, cls: st.cls, mem: st.mem };
}

async function runCase(browser, file, tag) {
  const C = makeCase(file, tag);
  console.log('\n=== ' + file + ' ===');
  console.log('  主源 ' + C.mirrorLit);
  console.log('  备源 ' + C.fallbackLit);

  console.log('\n  [A] 主源正常');
  {
    const ctx = await browser.newContext();
    const r = await open(ctx, C, true);
    ck('只请求主源一个', JSON.stringify(r.order) === '["main"]', r.order);
    ck('主题生效（顶栏有链接）', r.nav >= 5, r.nav);
    ck('首帧闸门已放行（html.qb-ready）', /qb-ready/.test(r.cls), r.cls);
    ck('不写失败记忆', r.mem === null, r.mem);
    await ctx.close();
  }

  console.log('\n  [B] 主源失效 → 备源接管');
  {
    const ctx = await browser.newContext();
    const r = await open(ctx, C, false);
    ck('先试主源再走备源', JSON.stringify(r.order) === '["main","backup"]', r.order);
    ck('切备源后主题仍生效', r.nav >= 5, r.nav);
    ck('写入失败记忆（时间戳）', /^\d{10,}$/.test(r.mem || ''), r.mem);

    console.log('\n  [C] 失败记忆生效（同 context 再进一次）');
    const r2 = await open(ctx, C, false);
    ck('不再尝试主源', !r2.order.includes('main'), r2.order);
    ck('首个请求就是备源', r2.order[0] === 'backup', r2.order);
    ck('主题生效', r2.nav >= 5, r2.nav);

    console.log('\n  [D] 记忆过期后回到主源优先');
    await r2.p.evaluate(() => {
      localStorage.setItem('qb-src-fail', String(Date.now() - 3600000 - 1000));
    });
    const r3 = await open(ctx, C, false);
    ck('过期后重新试主源', r3.order[0] === 'main', r3.order);
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  await runCase(browser, '页首.html', 'generic');
  await runCase(browser, '页首-我的站.html', 'author');
  await browser.close();
  console.log(bad ? '\n✗ ' + bad + ' 项不通过' : '\n✓ 两份页首的双源加载全部通过');
  process.exit(bad ? 1 : 0);
})();
