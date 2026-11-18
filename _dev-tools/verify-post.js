/**
 * v7.20 专项验证：主题色选择 / 阅读时长 / 标题锚点 / 文末版权。
 *
 * 用真实详情页的 DOM 结构造一份假页（.post > h1.postTitle + .postBody > #cnblogs_post_body + .postDesc），
 * 只替换正文内容，其余结构照抄线上，避免「测试页对了、线上不对」。
 *
 * 重点断言的四个坑：
 *   1) 锚点里不能有文本，否则目录每条后面多一个 #
 *   2) 版权块不能算进字数
 *   3) 重复调用不能出现两块版权 / 两个阅读时长（boot 与 DCL 各跑一次）
 *   4) 主题色必须在首帧前生效，且「默认」项不能盖掉 LS_CONFIG.accent
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');
/* 真实样式表：默认「不塞进页面」（这些用例只关心脚本行为）。
   cssInBody 的用例把它放到 body 末尾，复现线上「样式在 body、脚本注入的变量在 head」的顺序。 */
const THEME_CSS = fs.readFileSync(ROOT + 'css/theme-v7.min.css', 'utf8');

const PARA = '这是一段用来凑字数的正文，讨论的是 ArrayList 的扩容与随机访问。'.repeat(12);
const CODE = ['public class A {', '    int n = 1;', '}'].join('\n');

const FAKE = `<!doctype html><html><head><meta charset="utf-8">
<title>ArrayList 深入浅出 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div id="post_detail"><div id="topics"><div class="post">
<h1 class="postTitle"><a id="cb_post_title_url" href="https://www.cnblogs.com/zhangshuaiyin/p/fake.html"><span>ArrayList 深入浅出</span></a></h1>
<div class="clear"></div>
<div class="postBody">
<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">
<p>${PARA}</p>
<h2 id="huanrong">扩容原理</h2><p>${PARA}</p>
<h3>1.5 倍</h3><p>${PARA}</p>
<h2>随机访问</h2><p>${PARA}</p>
<h3>下标定位</h3><p>${PARA}</p>
<pre><code class="language-java">${CODE.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
<h2>线程安全</h2><p>${PARA}</p>
</div>
<div id="blog_post_info_block"><div id="blog_post_info"></div><div id="post_next_prev"></div></div>
</div>
<div class="postDesc">posted @
<span id="post-date" data-date-updated="2021-07-23 17:15">2021-07-23 17:15</span>&nbsp;
<a href="https://www.cnblogs.com/zhangshuaiyin">Ep流苏</a>&nbsp;
阅读(<span id="post_view_count">375</span>)&nbsp;
评论(<span id="post_comment_count">0</span>)&nbsp;
<a href="javascript:void(0)">收藏</a>&nbsp;
<a href="https://report.cnblogs.com?targetId=1" target="_blank">举报</a>
</div>
</div></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告</p></div></div>
</div></div></div></body></html>`;

let bad = 0;
function expect(label, got, want) {
  const ok = String(got) === String(want);
  if (!ok) bad++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}: ${JSON.stringify(got)}${ok ? '' : '  (期望 ' + JSON.stringify(want) + ')'}`);
}
function truthy(label, got) {
  const ok = !!got;
  if (!ok) bad++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}: ${got}`);
}
function match(label, got, re) {
  const ok = re.test(String(got));
  if (!ok) bad++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}: ${JSON.stringify(got)}${ok ? '' : '  (应匹配 ' + re + ')'}`);
}

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1440, height: 900 },
    colorScheme: opts.scheme || 'light',
  });
  await ctx.addInitScript((s) => {
    if (s.theme) localStorage.setItem('qb-theme', s.theme);
  }, { theme: opts.theme || '' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  const cfg = opts.config || '';
  let html = cfg ? FAKE.replace('<div id="page_begin_html">', cfg + '<div id="page_begin_html">') : FAKE;
  if (opts.cssInBody) html = html.replace('</body>', '<style>' + THEME_CSS + '</style></body>');
  await p.route('**/*', (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
  });
  await p.goto('https://www.cnblogs.com/zhangshuaiyin/p/fake.html', { waitUntil: 'load' });
  /* 和线上一致：脚本由页首字段 document.write 同步加载，这里补一个同样的外链 */
  await p.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  await p.waitForTimeout(1200);
  return { ctx, p, errs };
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. 文章页三项 ---------- */
  console.log('\n[1] 阅读时长 / 锚点 / 版权');
  {
    const { ctx, p, errs } = await open(browser);
    const r = await p.evaluate(() => {
      const rt = document.querySelector('.qb-readtime');
      const cr = document.querySelector('.qb-copyright');
      const body = document.getElementById('cnblogs_post_body');
      const hs = body.querySelectorAll('h2, h3');
      const anchors = body.querySelectorAll('.qb-hanchor');
      const tocLabels = [].slice.call(document.querySelectorAll('.qb-toc-list a')).map((a) => a.textContent);
      return {
        rtCount: document.querySelectorAll('.qb-readtime').length,
        rtText: rt ? rt.textContent.trim() : '',
        rtBeforeBody: rt ? !!(rt.compareDocumentPosition(body) & 4) : false,
        heads: hs.length,
        anchors: anchors.length,
        anchorText: [].slice.call(anchors).filter((a) => a.textContent !== '').length,
        anchorOk: [].slice.call(anchors).every((a) =>
          a.getAttribute('href') === '#' + a.parentNode.id && a.parentNode.id),
        crCount: document.querySelectorAll('.qb-copyright').length,
        crText: cr ? cr.textContent.replace(/\s+/g, ' ').trim() : '',
        crUrl: cr ? cr.querySelector('a[href^="http"]:not([href*="/zhangshuaiyin"])') !== null : false,
        crInsideBody: cr ? cr.parentNode.id === 'cnblogs_post_body' : false,
        crLast: cr ? body.lastElementChild === cr : false,
        tocHash: tocLabels.filter((t) => t.indexOf('#') >= 0).length,
        tocCount: tocLabels.length,
        code: !!document.querySelector('.qb-code'),
        codeLines: document.querySelectorAll('.qb-cl').length,
      };
    });
    match('阅读时长文案', r.rtText, /^约 \d+ 分钟·[\d,]+ 字$/);
    expect('阅读时长只有一个', r.rtCount, 1);
    truthy('阅读时长在正文之前', r.rtBeforeBody);
    expect('标题数 = 锚点数', r.anchors, r.heads);
    expect('锚点里没有文本节点（# 靠 CSS 画）', r.anchorText, 0);
    truthy('锚点 href 与标题 id 一致', r.anchorOk);
    expect('目录条目不掺 #', r.tocHash, 0);
    truthy('目录已生成', r.tocCount > 3);
    expect('版权块只有一个', r.crCount, 1);
    truthy('版权块在正文内且为末元素', r.crInsideBody && r.crLast);
    match('版权署名 + 首发日期', r.crText, /本文作者：Ep流苏\s首发：2021-07-23(?! )/);
    match('版权原文链接', r.crText, /原文链接：https:\/\/www\.cnblogs\.com\/zhangshuaiyin\/p\/fake\.html/);
    match('版权提示语', r.crText, /转载请注明作者与原文链接/);
    expect('代码块仍正常加工', r.code, true);
    expect('代码行数未被版权块污染', r.codeLines, 3);
    expect('无脚本异常', errs.join('|'), '');
    await ctx.close();
  }

  /* ---------- 2. 字数口径 ---------- */
  console.log('\n[2] 字数不含版权块 / 代码工具条');
  {
    const { ctx, p } = await open(browser);
    const w = await p.evaluate(() => {
      const t = document.querySelector('.qb-rt-word').textContent;
      return parseInt(t.replace(/[^\d]/g, ''), 10);
    });
    truthy('字数已解析: ' + w, w > 300 && w < 3000);
    const again = await p.evaluate(() => {
      /* 再等一轮：boot 与 DCL 各调一次 enhancePost，重复插入会在这里暴露 */
      return new Promise((res) => setTimeout(() => res({
        rt: document.querySelectorAll('.qb-readtime').length,
        cr: document.querySelectorAll('.qb-copyright').length,
        an: document.querySelectorAll('.qb-hanchor').length,
      }), 600));
    });
    expect('重复调用后阅读时长仍为 1', again.rt, 1);
    expect('重复调用后版权仍为 1', again.cr, 1);
    expect('重复调用后锚点数不变', again.an, 5);
    await ctx.close();
  }

  /* ---------- 3. 主题色：默认 / 切换 / 记忆 / 暗色 ---------- */
  console.log('\n[3] 主题色选择');
  {
    const { ctx, p, errs } = await open(browser);
    const d = await p.evaluate(() => ({
      dots: document.querySelectorAll('.qb-theme-dot').length,
      on: (document.querySelector('.qb-theme-dot.on') || {}).dataset &&
          document.querySelector('.qb-theme-dot.on').dataset.theme,
      hidden: document.getElementById('qb-theme-pop').hidden,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      styleId: !!document.getElementById('qb-theme-sel'),
    }));
    expect('色点 6 个', d.dots, 6);
    expect('默认选中紫', d.on, 'purple');
    expect('面板默认收起', d.hidden, true);
    expect('默认不注入样式', d.styleId, false);
    expect('默认强调色', d.accent, '#d05ce8');

    /* 打开面板 -> 点蓝 */
    await p.click('#qb-theme-toggle');
    const opened = await p.evaluate(() => document.getElementById('qb-theme-pop').hidden);
    expect('点按钮展开面板', opened, false);
    const box = await p.locator('#qb-theme-pop').boundingBox();
    truthy('面板在视口内', box && box.x >= 0 && box.x + box.width <= 1440);

    await p.click('.qb-theme-dot[data-theme="blue"]');
    await p.waitForTimeout(120);
    const b = await p.evaluate(() => ({
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      deep: getComputedStyle(document.documentElement).getPropertyValue('--accent-deep').trim(),
      soft: getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim(),
      ls: localStorage.getItem('qb-theme'),
      on: document.querySelector('.qb-theme-dot.on').dataset.theme,
      hidden: document.getElementById('qb-theme-pop').hidden,
    }));
    expect('切蓝后 --accent', b.accent, '#3b82f6');
    expect('deep 由色值派生', b.deep, '#306bca');
    match('soft 跟着变', b.soft, /rgba\(59,\s*130,\s*246,\s*0?\.11\)/);
    expect('写入 localStorage', b.ls, 'blue');
    expect('选中态跟着走', b.on, 'blue');
    expect('选完自动收起', b.hidden, true);

    /* 暗色下的同一套色必须是提亮值 */
    await p.click('#qb-dark-toggle');
    await p.waitForTimeout(120);
    const dark = await p.evaluate(() => ({
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      dots: getComputedStyle(document.querySelector('.qb-theme-dot[data-theme="blue"]')).backgroundColor,
    }));
    expect('暗色下 --accent 用提亮值', dark.accent, '#58a6ff');
    match('暗色色点用 --d2', dark.dots, /rgba?\(88, 166, 255/);

    /* 切回浅色再验「默认」：暗色下的默认强调色本来就是 #58a6ff，不切回来会误判 */
    await p.click('#qb-dark-toggle');
    await p.waitForTimeout(120);

    /* 点回默认：样式必须被移除，把配色还给样式表 / accent */
    await p.click('#qb-theme-toggle');
    await p.click('.qb-theme-dot[data-theme="purple"]');
    await p.waitForTimeout(120);
    const back = await p.evaluate(() => ({
      styleId: !!document.getElementById('qb-theme-sel'),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    }));
    expect('回默认后移除注入样式', back.styleId, false);
    expect('回默认后强调色回到样式表值', back.accent, '#d05ce8');

    /* Esc 收起 */
    await p.click('#qb-theme-toggle');
    await p.keyboard.press('Escape');
    expect('Esc 收起面板', await p.evaluate(() => document.getElementById('qb-theme-pop').hidden), true);

    /* 点页面空白收起 */
    await p.click('#qb-theme-toggle');
    await p.mouse.click(300, 500);
    expect('点空白收起面板', await p.evaluate(() => document.getElementById('qb-theme-pop').hidden), true);
    expect('无脚本异常', errs.join('|'), '');
    await ctx.close();
  }

  /* ---------- 4. 刷新后记住 + accent 优先级 ---------- */
  console.log('\n[4] 记忆与优先级');
  {
    const { ctx, p } = await open(browser, { theme: 'rose' });
    const r = await p.evaluate(() => ({
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      on: document.querySelector('.qb-theme-dot.on').dataset.theme,
    }));
    expect('刷新后仍是玫红', r.accent, '#e11d48');
    expect('选中态来自 localStorage', r.on, 'rose');
    await ctx.close();

    /* 站长在 LS_CONFIG 里设了 accent，读者选「默认」时必须回到站长的色 */
    const cfg = '<script>window.LS_CONFIG={accent:"#0ea5e9"};</scr' + 'ipt>';
    const o = await open(browser, { config: cfg });
    const got = await o.p.evaluate(() => getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim());
    expect('默认项不盖掉 LS_CONFIG.accent', got, '#0ea5e9');
    await o.ctx.close();

    /* 读者选了蓝，就该盖住站长的色 */
    const o2 = await open(browser, { config: cfg, theme: 'blue' });
    const got2 = await o2.p.evaluate(() => getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim());
    expect('读者选择优先于 accent', got2, '#3b82f6');
    await o2.ctx.close();

    /* v7.33 回归：样式表在 body 里的时候也必须能改色。
       线上主题样式是页首里的 document.write 写进 #page_begin_html（body 开头）的，
       而 applyTheme 的 <style> 是解析期追加到 <head> 末尾 —— 文档顺序反而更靠前。
       同为 :root、同特异度，后出现的赢，曾经把配色按回紫色（色点能点、选中态也对，
       只有颜色不动）。旧版本样式内联在 CSS 字段里（head）所以从没暴露。 */
    const o3 = await open(browser, { theme: 'blue', cssInBody: true });
    const got3 = await o3.p.evaluate(() => getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim());
    expect('样式在 body 里也能改色', got3, '#3b82f6');
    await o3.ctx.close();
  }

  /* ---------- 5. 移动端 ---------- */
  console.log('\n[5] 移动端 375px');
  {
    const { ctx, p } = await open(browser, { viewport: { width: 375, height: 780 } });
    const m = await p.evaluate(() => {
      const nav = document.querySelector('.qb-nav-inner');
      const pop = document.getElementById('qb-theme-pop');
      pop.hidden = false;
      const b = pop.getBoundingClientRect();
      const r = {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        navOverflow: nav.scrollWidth - nav.clientWidth,
        popLeft: Math.round(b.left),
        popRight: Math.round(b.right),
      };
      pop.hidden = true;
      return r;
    });
    expect('整页无横向溢出', m.overflow <= 0, true);
    truthy('展开面板不出屏: ' + m.popLeft + '~' + m.popRight,
      m.popLeft >= 0 && m.popRight <= 375);
    truthy('色点仍可见(6 个)', await p.evaluate(() => document.querySelectorAll('.qb-theme-dot').length === 6));
    await ctx.close();
  }

  await browser.close();
  console.log(bad ? `\n✗ ${bad} 条未通过` : '\n✓ 全部通过');
  process.exit(bad ? 1 : 0);
})();
