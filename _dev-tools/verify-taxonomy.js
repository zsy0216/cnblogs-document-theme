/**
 * v7.25 专项验证：分类与标签（详情页标题下胶囊 + 列表页顶部分类条）。
 *
 * 真实前提（2026-11-17 curl 实测，别按别的皮肤猜）：
 *   · 列表页 .day 里没有分类/标签，只能靠全站分类页提供筛选条；
 *   · 详情页没有 #EntryTag / #BlogPostCategory，标签只能从 <meta name="keywords"> 读，
 *     该 meta 的内容 = 本文标签 + 分类名（分类在末位，4 篇抽样与 /rss 比对吻合）。
 *
 * 要钉住的几条：
 *   1) 胶囊插在标题与正文之间，只插一次（boot 与 DCL 各跑一次）
 *   2) 分类走实心样式、标签走浅底，视觉上分得开
 *   3) 标签超过 4 个折叠成 +n，点开能全部展开
 *   4) 分类页保留筛选条并高亮当前项，首页高亮「全部」
 *   5) 分类名单 7 天内走 localStorage，第二次访问不再打 /categories
 *   6) 取不到名单时降级：不留空壳、不硬编分类、不建筛选条
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

const SITE = 'https://www.cnblogs.com/zhangshuaiyin/';

const CATS_HTML = `<div class="forFlow"><div class="category-block-list"><div class="category-block">
<div class="category-list-item"><a href="${SITE}category/1475104.html">Linux(3)</a></div>
<div class="category-list-item"><a href="${SITE}category/2051348.html">Web前端(9)</a></div>
<div class="category-list-item"><a href="${SITE}category/1475102.html">编程语言(3)</a></div>
<div class="category-list-item"><a href="${SITE}category/2540496.html">后端(34)</a></div>
<div class="category-list-item"><a href="${SITE}category/2542354.html">计算机网络(1)</a></div>
<div class="category-list-item"><a href="${SITE}category/1348147.html">软件教程(9)</a></div>
<div class="category-list-item"><a href="${SITE}category/2541174.html">英语(6)</a></div>
</div></div></div>`;

const PARA = '这一段用来凑字数，讨论的是博客园分类与标签的展示方式。'.repeat(6);

function postPage(keywords) {
  const meta = keywords ? `<meta name="keywords" content="${keywords}">` : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<title>一次网页请求的完整链路 - 我的博客 - 博客园</title>${meta}</head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div id="post_detail"><div id="topics"><div class="post">
<h1 class="postTitle"><a id="cb_post_title_url" href="${SITE}p/fake.html"><span>一次网页请求的完整链路</span></a></h1>
<div class="clear"></div>
<div class="postBody">
<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">
<h2>阶段一</h2><p>${PARA}</p><h2>阶段二</h2><p>${PARA}</p>
</div>
<div id="blog_post_info_block"><div id="blog_post_info"></div></div>
</div>
<div class="postDesc">posted @ <span id="post-date" data-date-updated="2026-11-17 09:35">2026-11-17 09:35</span>
<a href="${SITE}">Ep流苏</a> 阅读(<span id="post_view_count">128</span>)</div>
</div></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告内容</p></div></div>
</div></div></div></div></body></html>`;
}

const LIST_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div class="day"><div class="postTitle"><a class="postTitle2" href="${SITE}p/23690291">一次网页请求的完整链路</a></div>
<div class="postCon"><div class="c_b_p_desc">摘要：${PARA}</div></div>
<div class="postDesc">posted @ 2026-11-17 09:35 Ep流苏 <span class="post-view-count">阅读(128)</span></div></div>
<div class="day"><div class="postTitle"><a class="postTitle2" href="${SITE}p/23598351">新概念英语第一册 · 词法 · 数词笔记</a></div>
<div class="postCon"><div class="c_b_p_desc">摘要：${PARA}</div></div>
<div class="postDesc">posted @ 2026-11-16 21:00 Ep流苏 <span class="post-view-count">阅读(41)</span></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告内容</p></div></div>
</div></div></div></div></body></html>`;

const CATPAGE_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>后端 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div class="entrylist"><div class="entrylistItem">
<h2 class="entrylistItemTitle"><a class="entrylistPosttitle" href="${SITE}p/12038091">Redis 学习记录</a></h2>
<div class="entrylistPostSummary">${PARA}</div>
<div class="entrylistItemPostDesc">posted @ 2019-01-01</div>
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
function eq(label, got, want) { ck(label + ': ' + JSON.stringify(got), String(got) === String(want), '期望 ' + JSON.stringify(want)); }

async function open(browser, opts) {
  /* 传 opts.ctx 表示复用同一个浏览器上下文（localStorage 才留得住），
     缓存那条断言必须这么做：新上下文一定没有缓存，测了等于没测。 */
  const ctx = opts.ctx || await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [], catHits = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  await p.route('**/*', async (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (/\/categories$/.test(u)) {
      catHits.push(u);
      if (opts.catsFail) return route.fulfill({ status: 500, body: 'boom' });
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: CATS_HTML });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: opts.html });
  });
  await p.goto(opts.url, { waitUntil: 'load' });
  await p.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  await p.waitForTimeout(1000);
  return { ctx, p, errs, catHits };
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. 详情页：胶囊 ---------- */
  console.log('\n[1] 详情页分类 + 标签胶囊');
  let shared = null;
  {
    const { ctx, p, errs, catHits } = await open(browser, {
      url: SITE + 'p/fake.html',
      html: postPage('TCP/IP,DHCP,ARP,NAT,子网掩码,计算机网络'),
    });
    const r = await p.evaluate(() => {
      const box = document.querySelector('.qb-tax');
      const title = document.querySelector('#post_detail .postTitle');
      const chips = box ? [].slice.call(box.children) : [];
      return {
        n: document.querySelectorAll('.qb-tax').length,
        afterTitle: box ? title.nextElementSibling === box : false,
        cat: box ? (box.querySelector('.qb-tax-cat') || {}).textContent : '',
        catHref: box ? (box.querySelector('.qb-tax-cat') || {}).getAttribute('href') : '',
        catWeight: box ? getComputedStyle(box.querySelector('.qb-tax-cat')).fontWeight : '',
        tags: chips.filter((c) => c.classList.contains('qb-tax-tag')).map((c) => c.textContent),
        more: box ? (box.querySelector('.qb-tax-more') || {}).textContent : '',
        href: box ? box.querySelector('.qb-tax-tag').getAttribute('href') : '',
        inBody: box ? !!box.closest('#cnblogs_post_body') : false,
      };
    });
    eq('胶囊只有一个', r.n, 1);
    ck('插在标题之下、正文之外', r.afterTitle && !r.inBody, r);
    eq('分类名', r.cat, '计算机网络');
    ck('分类链接指向分类页', /\/category\/2542354\.html$/.test(r.catHref), r.catHref);
    eq('标签先显示 4 个', r.tags.length, 4);
    eq('标签顺序保持 keywords 原序', r.tags.join('|'), 'TCP/IP|DHCP|ARP|NAT');
    eq('多出来的折成 +1', r.more, '+1');
    ck('标签链接做了 URL 编码', /\/tag\/(TCP%2FIP|台)/.test(r.href), r.href);
    eq('分类要加粗（和标签分得开）', r.catWeight, '600');

    await p.click('.qb-tax-more');
    const after = await p.evaluate(() => ({
      tags: [].slice.call(document.querySelectorAll('.qb-tax-tag')).length,
      more: !!document.querySelector('.qb-tax-more'),
    }));
    eq('展开后 5 个标签', after.tags, 5);
    ck('展开后按钮消失', !after.more, after.more);
    eq('首访请求过分类名单', catHits.length, 1);
    eq('无 JS 报错', errs.length, 0);
    shared = ctx;            /* 留给第 2 项验缓存，别关 */
  }

  /* ---------- 2. 详情页：缓存命中不再请求 ---------- */
  console.log('\n[2] 二次访问走缓存');
  {
    const { ctx, p, catHits } = await open(browser, {
      ctx: shared,
      url: SITE + 'p/fake.html',
      html: postPage('TCP/IP,DHCP,ARP,NAT,子网掩码,计算机网络'),
    });
    eq('再次打开不再打 /categories', catHits.length, 0);
    const cat = await p.evaluate(() => (document.querySelector('.qb-tax-cat') || {}).textContent);
    eq('缓存里的分类照常显示', cat, '计算机网络');
    await ctx.close();
  }

  /* ---------- 3. 详情页：没有 keywords 就不留空壳 ---------- */
  console.log('\n[3] 无 meta keywords');
  {
    const { ctx, p, errs } = await open(browser, {
      url: SITE + 'p/fake.html',
      html: postPage(''),
    });
    eq('不生成胶囊', await p.evaluate(() => document.querySelectorAll('.qb-tax').length), 0);
    eq('无 JS 报错', errs.length, 0);
    await ctx.close();
  }

  /* ---------- 4. 列表页：筛选条 ---------- */
  console.log('\n[4] 列表页分类筛选条');
  {
    const { ctx, p, errs } = await open(browser, { url: SITE, html: LIST_HTML });
    const r = await p.evaluate(() => {
      const bar = document.querySelector('.qb-catbar');
      const flow = document.querySelector('#mainContent .forFlow');
      const links = bar ? [].slice.call(bar.querySelectorAll('a')) : [];
      return {
        n: document.querySelectorAll('.qb-catbar').length,
        first: bar ? flow.firstElementChild === bar : false,
        count: links.length,
        labels: links.map((a) => a.textContent),
        on: links.filter((a) => a.classList.contains('on')).map((a) => a.textContent),
        href: links[1] ? links[1].getAttribute('href') : '',
        abovePosts: bar ? !!(bar.compareDocumentPosition(document.querySelector('.day')) & 4) : false,
      };
    });
    eq('筛选条只有一个', r.n, 1);
    ck('挂在文章列表最前面', r.first && r.abovePosts, r);
    eq('全部 + 7 个分类', r.count, 8);
    eq('末位分类文案带篇数', r.labels[7], '英语 6');
    eq('首页高亮「全部」', r.on.join('|'), '全部');
    ck('分类链接正确', /\/category\/1475104\.html$/.test(r.href), r.href);
    eq('无 JS 报错', errs.length, 0);

    const of = await p.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    ck('桌面端无横向溢出', of.scroll <= of.client + 1, of);
    await ctx.close();
  }

  /* ---------- 5. 列表页：窄屏不换行、不撑破 ---------- */
  console.log('\n[5] 360px 窄屏');
  {
    const { ctx, p } = await open(browser, {
      url: SITE, html: LIST_HTML, viewport: { width: 360, height: 780 },
    });
    const r = await p.evaluate(() => {
      const bar = document.querySelector('.qb-catbar');
      return {
        scrollX: bar.scrollWidth,
        clientX: bar.clientWidth,
        pageScroll: document.documentElement.scrollWidth,
        pageClient: document.documentElement.clientWidth,
        wrap: getComputedStyle(bar).flexWrap,
        fade: bar.classList.contains('qb-fade-r'),
      };
    });
    ck('筛选条自身可横滑（内容超宽）', r.scrollX > r.clientX, r);
    eq('不换行', r.wrap, 'nowrap');
    ck('末个胶囊被裁时加右缘渐隐', r.fade, r);
    ck('整页无横向溢出', r.pageScroll <= r.pageClient + 1, r);
    await ctx.close();
  }

  /* ---------- 6. 分类页：保留筛选条并高亮当前项 ---------- */
  console.log('\n[6] 分类页');
  {
    const { ctx, p } = await open(browser, { url: SITE + 'category/2540496.html', html: CATPAGE_HTML });
    const r = await p.evaluate(() => {
      const bar = document.querySelector('.qb-catbar');
      return {
        n: document.querySelectorAll('.qb-catbar').length,
        on: bar ? [].slice.call(bar.querySelectorAll('a.on')).map((a) => a.textContent) : [],
      };
    });
    eq('筛选条保留', r.n, 1);
    eq('高亮当前分类', r.on.join('|'), '后端 34');
    await ctx.close();
  }

  /* ---------- 7. 取不到名单时降级 ---------- */
  console.log('\n[7] /categories 失败');
  {
    const a = await open(browser, {
      url: SITE + 'p/fake.html', catsFail: true,
      html: postPage('TCP/IP,DHCP,ARP,NAT,子网掩码,计算机网络'),
    });
    const d = await a.p.evaluate(() => ({
      cat: document.querySelectorAll('.qb-tax-cat').length,
      tags: document.querySelectorAll('.qb-tax-tag').length,
      box: document.querySelectorAll('.qb-tax').length,
    }));
    eq('不显示分类（不硬编）', d.cat, 0);
    eq('全部当标签显示', d.tags, 4);
    ck('胶囊本身还在', d.box === 1, d.box);
    await a.ctx.close();

    const b = await open(browser, { url: SITE, html: LIST_HTML, catsFail: true });
    eq('列表页不建空筛选条', await b.p.evaluate(() => document.querySelectorAll('.qb-catbar').length), 0);
    await b.ctx.close();
  }

  await browser.close();
  console.log('\n' + (bad ? '✗ ' + bad + ' 项失败' : '✓ 全部通过'));
  process.exit(bad ? 1 : 0);
})();
