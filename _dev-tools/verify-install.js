/**
 * 安装包的「不泄露作者信息」验证。
 *
 * 背景：v7.26 之前只有一份页首，配置块里写死了作者的品牌名、头像、公告和菜单。
 * 别人照 README 贴完，顶栏写着「Ep流苏」、头像是作者的头像、菜单全指向作者博客 ——
 * 那不叫装好了，叫把别人的站套在自己域名上。v7.27 拆成两份：
 *   dist/paste/页首.html          通用版：配置整块注释掉，靠脚本按当前站点推导
 *   dist/paste/页首-我的站.html    作者版：作者自己的品牌 / 头像 / 公告 / 菜单
 *
 * 要钉住的：
 *   静态 ① 通用版里不该出现作者的域名、博客名、GitHub、博客 ID、头像 icon
 *   静态 ② 通用版两个源地址都是 jsDelivr、版本号一致、不含 blog-static（它对第三方 403）
 *   运行 ③ 在「别人的博客」上跑通用版：品牌 / 菜单 / 首页链接 / 公告全部是别人的
 *   运行 ④ 页脚署名照常出现（默认开），链回仓库
 *   对照 ⑤ 作者版在同一假页上仍然是作者的品牌 —— 两份确实是两份
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');
const HEAD_GENERIC = fs.readFileSync(ROOT + 'dist/paste/页首.html', 'utf8');
const HEAD_AUTHOR = fs.readFileSync(ROOT + 'dist/paste/页首-我的站.html', 'utf8');
const REPO = 'https://github.com/zsy0216/cnblogs-document-theme';

/* 别人的站：域名、博客名、公告、文章都得是「不是作者」的 */
const OTHER = 'https://www.cnblogs.com/other-blog/';
const OTHER_NAME = '某某的技术博客';
const OTHER_NOTICE = '这是别人自己写的公告';

const BODY = `
<div id="main"><div id="mainContent"><div class="forFlow">
<div class="day">
  <div class="postTitle"><a class="postTitle2" href="${OTHER}p/1.html">别人的一篇文章</a></div>
  <div class="postCon"><div class="c_b_p_desc">摘要</div></div>
  <div class="postDesc">posted @ 2026-11-17 09:00 别人</div>
</div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
  <div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>${OTHER_NOTICE}</p></div></div>
</div></div></div></div>
<div id="footer"><a href="https://www.cnblogs.com/">博客园</a><span>© 2004-2026</span></div>`;

let bad = 0;
function ck(label, ok, got) {
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : '  → ' + JSON.stringify(got)));
}
function eq(label, got, want) {
  ck(label + ': ' + JSON.stringify(got), String(got) === String(want), '期望 ' + JSON.stringify(want));
}

async function open(browser, head) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  await p.route('**/*', (route) => {
    const u = route.request().url();
    if (/jsdelivr\.net|blog-static\.cnblogs\.com\/files/.test(u)) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com')) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: `<!doctype html><html><head><meta charset="utf-8">
<title>${OTHER_NAME} - 博客园</title></head><body>${head}${BODY}</body></html>`,
    });
  });
  await p.goto(OTHER, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const brand = q('.qb-brand-text');
    const links = [].slice.call(document.querySelectorAll('.qb-links a'));
    const credit = q('.qb-credit a');
    const native = q('#blog-news');
    return {
      brand: brand ? brand.textContent : '',
      n: links.length,
      hrefs: links.map((a) => a.getAttribute('href')),
      home: links.length ? links[0].getAttribute('href') : '',
      qbNotice: !!q('#qb-notice'),
      nativeDisplay: native ? getComputedStyle(native).display : 'missing',
      credit: credit ? credit.textContent : '',
      creditHref: credit ? credit.getAttribute('href') : '',
      ready: /qb-ready/.test(document.documentElement.className),
    };
  });
  return { ctx, p, r, errs };
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. 静态：通用版里不该有作者的东西 ---------- */
  console.log('\n[1] 通用版页首的静态检查');
  {
    const leaks = [
      ['作者博客名 Ep流苏', 'Ep流苏'],
      ['作者博客路径 zhangshuaiyin', 'zhangshuaiyin'],
      ['作者博客 ID 477677（头像 / 公告图）', '477677'],
      ['作者头像 <link rel="icon">', '<link rel="icon"'],
      ['blog-static（对第三方 Referer 403）', 'blog-static.cnblogs.com'],
    ];
    leaks.forEach(([label, needle]) => {
      ck('不含 ' + label, !HEAD_GENERIC.includes(needle), needle);
    });
    /* 仓库路径里的 zsy0216 是必需的（jsDelivr 的 gh/<账号>/<仓库>），页脚署名也指它，
       这两处都是设计的一部分。真正不能出现的是「作者个人主页」那种身份链接。 */
    ck('不含作者个人 GitHub 主页', !/github\.com\/zsy0216(?!\/)/.test(HEAD_GENERIC), 'github.com/zsy0216');

    /* 地址可能直接是字符串，也可能被 q() 包一层（拼当天日期参数用，v7.30 起） */
    const m = HEAD_GENERIC.match(/var MIRROR = (?:q\()?'([^']+)'/);
    const f = HEAD_GENERIC.match(/var FALLBACK = (?:q\()?'([^']+)'/);
    ck('主源是 jsDelivr', !!m && /jsdelivr\.net/.test(m[1]), m && m[1]);
    ck('备源也是 jsDelivr', !!f && /jsdelivr\.net/.test(f[1]), f && f[1]);
    /* v7.36 起锚点是分支（@master），不再钉版本号 tag：两个源必须跟同一个引用、同一路径 */
    const am = m && (m[1].match(/@([\w.-]+)\//) || [])[1];
    const af = f && (f[1].match(/@([\w.-]+)\//) || [])[1];
    ck('两个源跟随同一个引用（' + am + ' / ' + af + '）', !!am && am === af, [am, af]);
    ck('两个源路径一致', !!m && !!f
       && m[1].replace(/^https?:\/\/[^/]+/, '') === f[1].replace(/^https?:\/\/[^/]+/, ''),
       [m && m[1], f && f[1]]);
    ck('两个源不是同一节点', !!m && !!f && m[1] !== f[1], [m && m[1], f && f[1]]);
  }

  /* ---------- 2. 静态：作者版必须还是作者那份 ---------- */
  console.log('\n[2] 作者版页首的对照检查');
  {
    ck('含作者品牌名', HEAD_AUTHOR.includes('Ep流苏'), '');
    ck('含作者头像 icon', HEAD_AUTHOR.includes('<link rel="icon"'), '');
    ck('备源是同一路径的另一个 jsDelivr 节点', /fastly\.jsdelivr\.net/.test(HEAD_AUTHOR), '');
    ck('作者版也不再引用 blog-static 当备源', !/blog-static\.cnblogs\.com\/files/.test(HEAD_AUTHOR), '');
  }

  /* ---------- 3. 运行：别人的站上，通用版应该长成别人的样子 ---------- */
  console.log('\n[3] 在别人的博客上跑通用版');
  {
    const { ctx, r, errs } = await open(browser, HEAD_GENERIC);
    eq('顶栏品牌是别人的博客名', r.brand, OTHER_NAME);
    eq('首页链接指向别人的站', r.home, OTHER);
    ck('菜单是默认那几条（' + r.n + ' 条）', r.n >= 5, r.n);
    ck('所有菜单都在别人域名下', r.hrefs.every((h) => !h || h.indexOf(OTHER) === 0), r.hrefs);
    ck('没有建作者风格的公告卡（用后台原文）', !r.qbNotice, r.qbNotice);
    ck('后台公告仍然显示', r.nativeDisplay !== 'none', r.nativeDisplay);
    ck('页脚署名照常出现', !!r.credit, r.credit);
    eq('署名链回仓库', r.creditHref, REPO);
    ck('首帧闸门已放行', r.ready, r.ready);
    ck('没有 JS 报错', errs.length === 0, errs);
    await ctx.close();
  }

  /* ---------- 4. 运行：作者版在同一假页上仍是作者 ---------- */
  console.log('\n[4] 同一假页上跑作者版（对照）');
  {
    const { ctx, r } = await open(browser, HEAD_AUTHOR);
    eq('品牌仍是作者的', r.brand, 'Ep流苏');
    ck('菜单是作者那套（' + r.n + ' 条）', r.n > 5, r.n);
    await ctx.close();
  }

  await browser.close();
  console.log(bad ? '\n✗ ' + bad + ' 项不通过' : '\n✓ 安装包全部通过');
  process.exit(bad ? 1 : 0);
})();
