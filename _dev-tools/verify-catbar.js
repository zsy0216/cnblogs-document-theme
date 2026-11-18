/**
 * v7.38 专项验证：列表页顶部分类筛选条的可配置项（LS_CONFIG.catbar）。
 *
 * 之前这条子是全自动的：抓到几个分类就画几个、顺序照分类页、名字后面一定带篇数。
 * 现在要钉住「作者真能按自己的意思挑」这件事，而且**写错配置不能白屏**：
 *
 *   1) 不配 → 和以前完全一致（全部 + 7 个分类，带篇数，顺序同分类页）
 *   2) mode:'pick' → 只留名单里那几个，顺序按名单
 *   3) mode:'auto' + list → 名单里的前置，其余按原顺序跟随
 *   4) hide → 精确摘掉个别分类（和 pick 叠加时也生效）
 *   5) max → 截断 + 末尾「更多」指向分类页（不能凭空少掉却不给入口）
 *   6) count:false / all:false → 去篇数 / 去「全部」
 *   7) show:false → 整条不出现
 *   8) pick 名单全写错 → 退化为全自动，别让条子消失
 *   9) list 允许逗号字符串 / [{n}] 两种写法
 *  10) 分类页保留高亮；窄屏不横向溢出
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

const SITE = 'https://www.cnblogs.com/zhangshuaiyin/';

const CATS = [
  { n: 'Linux', c: 3, id: '1475104' },
  { n: 'Web前端', c: 9, id: '2051348' },
  { n: '编程语言', c: 3, id: '1475102' },
  { n: '后端', c: 34, id: '2540496' },
  { n: '计算机网络', c: 1, id: '2542354' },
  { n: '软件教程', c: 9, id: '1348147' },
  { n: '英语', c: 6, id: '2541174' },
];

const CATS_HTML = `<div class="forFlow"><div class="category-block-list"><div class="category-block">
${CATS.map((c) => `<div class="category-list-item"><a href="${SITE}category/${c.id}.html">${c.n}(${c.c})</a></div>`).join('')}
</div></div></div>`;

const PARA = '这一段用来凑字数，讨论的是列表页顶部分类筛选条的配置方式。'.repeat(4);

const LIST_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div class="day"><div class="postTitle"><a class="postTitle2" href="${SITE}p/1">一篇文章</a></div>
<div class="postCon"><div class="c_b_p_desc">摘要：${PARA}</div></div>
<div class="postDesc">posted @ 2026-11-18 09:00 Ep流苏 <span class="post-view-count">阅读(12)</span></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告内容</p></div></div>
</div></div></div></div></body></html>`;

const CATPAGE_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>后端 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div class="entrylist"><div class="entrylistItem">
<h2 class="entrylistItemTitle"><a class="entrylistPosttitle" href="${SITE}p/2">Redis 学习记录</a></h2>
<div class="entrylistPostSummary">${PARA}</div>
<div class="entrylistItemPostDesc">posted @ 2026-11-01</div>
</div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告内容</p></div></div>
</div></div></div></div></body></html>`;

let bad = 0;
function ck(label, ok, got) {
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : '  → ' + JSON.stringify(got)));
}
function eq(label, got, want) {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  ck(label + ': ' + a, a === b, '期望 ' + b);
}

/* cfg 传 null 表示「完全不写 LS_CONFIG」 */
async function run(browser, opts) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  const isCat = /\/category\/\d+\.html$/.test(opts.url);
  await p.route('**/*', async (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (/\/categories$/.test(u)) {
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: CATS_HTML });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: isCat ? CATPAGE_HTML : LIST_HTML });
  });
  await p.goto(opts.url, { waitUntil: 'load' });
  if (opts.cfg) {
    await p.evaluate((c) => { window.LS_CONFIG = c; }, opts.cfg);
  }
  await p.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const bars = [].slice.call(document.querySelectorAll('.qb-catbar'));
    const bar = bars[0];
    const links = bar ? [].slice.call(bar.querySelectorAll('a')) : [];
    return {
      n: bars.length,
      items: links.map((a) => a.textContent.replace(/\s+/g, ' ').trim()),
      on: links.filter((a) => a.classList.contains('on')).map((a) => a.textContent.trim()),
      hrefs: links.map((a) => a.getAttribute('href')),
      hasMore: !!(bar && bar.querySelector('.qb-cat-more')),
      moreHref: bar && bar.querySelector('.qb-cat-more') ? bar.querySelector('.qb-cat-more').getAttribute('href') : '',
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    };
  });
  await ctx.close();
  return { ...r, errs };
}

const ALL = ['全部', 'Linux 3', 'Web前端 9', '编程语言 3', '后端 34', '计算机网络 1', '软件教程 9', '英语 6'];

(async () => {
  const browser = await chromium.launch();
  const HOME = SITE;
  const CAT = SITE + 'category/2540496.html';

  console.log('\n[1] 不配置 = 和以前完全一样');
  {
    const r = await run(browser, { url: HOME });
    eq('筛选条只有一条', r.n, 1);
    eq('内容与顺序', r.items, ALL);
    eq('首页高亮「全部」', r.on, ['全部']);
    eq('无 JS 报错', r.errs, []);
  }

  console.log('\n[2] mode:pick 只留名单里的，顺序按名单');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick', list: ['后端', '英语'] } } });
    eq('只显示两项（+全部）', r.items, ['全部', '后端 34', '英语 6']);
    eq('无 JS 报错', r.errs, []);
  }

  console.log('\n[3] mode:auto + list：名单前置，其余跟随');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { list: ['英语', '后端'] } } });
    eq('英语、后端排到最前，其余按原序', r.items, ['全部', '英语 6', '后端 34', 'Linux 3', 'Web前端 9', '编程语言 3', '计算机网络 1', '软件教程 9']);
  }

  console.log('\n[4] hide 精确摘掉个别分类');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { hide: ['Web前端', '软件教程'] } } });
    eq('去掉两项后剩 5 个', r.items, ['全部', 'Linux 3', '编程语言 3', '后端 34', '计算机网络 1', '英语 6']);
    const r2 = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick', list: ['后端', '英语'], hide: ['英语'] } } });
    eq('pick 与 hide 叠加：hide 优先', r2.items, ['全部', '后端 34']);
  }

  console.log('\n[5] max 截断 + 「更多」入口');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { max: 3 } } });
    eq('只显示 3 个分类（全部不计入）', r.items, ['全部', 'Linux 3', 'Web前端 9', '编程语言 3', '更多']);
    ck('有「更多」入口', r.hasMore, r);
    eq('「更多」指向分类页', r.moreHref, SITE + 'categories');
    eq('无 JS 报错', r.errs, []);
  }

  console.log('\n[6] count:false 去篇数 / all:false 去「全部」');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { count: false } } });
    eq('名字后面不带数字', r.items, ['全部', 'Linux', 'Web前端', '编程语言', '后端', '计算机网络', '软件教程', '英语']);
    const r2 = await run(browser, { url: HOME, cfg: { catbar: { all: false } } });
    ck('没有「全部」', r2.items[0] === 'Linux 3', r2.items);
    eq('项数 = 分类数', r2.items.length, 7);
  }

  console.log('\n[7] show:false 整条不出现');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { show: false } } });
    eq('不建筛选条', r.n, 0);
    eq('无 JS 报错', r.errs, []);
  }

  console.log('\n[8] 名单写错 / 忘写 name 都不消失（退化为全自动）');
  {
    const r = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick', list: ['不存在的分类', '另一个错名'] } } });
    eq('名单全写错：退回全部 7 个分类', r.items, ALL);
    const r2 = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick' } } });
    eq('pick 但忘了写 list：同样退回全自动', r2.items, ALL);
  }

  console.log('\n[9] list 的三种写法');
  {
    const r1 = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick', list: '后端, 英语' } } });
    eq('逗号字符串', r1.items, ['全部', '后端 34', '英语 6']);
    const r2 = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick', list: [{ n: '后端' }, { name: '英语' }] } } });
    eq('对象数组', r2.items, ['全部', '后端 34', '英语 6']);
    const r3 = await run(browser, { url: HOME, cfg: { catbar: { mode: 'pick', list: [' 后端 ', '后端'] } } });
    eq('去空白 + 去重', r3.items, ['全部', '后端 34']);
  }

  console.log('\n[10] 分类页高亮 / 窄屏不溢出');
  {
    const r = await run(browser, { url: CAT, cfg: { catbar: { mode: 'pick', list: ['后端', '英语'] } } });
    eq('当前分类高亮', r.on, ['后端 34']);
    ck('不横向溢出（1440）', r.scrollW <= r.clientW + 1, r);
    const m = await run(browser, { url: HOME, viewport: { width: 390, height: 844 } });
    ck('不横向溢出（390）', m.scrollW <= m.clientW + 1, m);
    const m2 = await run(browser, { url: HOME, viewport: { width: 390, height: 844 }, cfg: { catbar: { max: 3 } } });
    ck('窄屏截断后仍不溢出', m2.scrollW <= m2.clientW + 1, m2);
  }

  await browser.close();
  console.log(bad ? `\n✗ ${bad} 项未通过` : '\n✓ 全部通过');
  process.exit(bad ? 1 : 0);
})();
