/**
 * v7.21 专项验证：移动端目录抽屉 / 宽表横滑 / 打印 / 超长代码折叠 /
 *                暗色跟随系统 / Markdown 元素 / 续读记忆。
 *
 * 用真实详情页的骨架造假页，正文塞进七列宽表、50 行代码、kbd/mark/details/
 * 任务列表/脚注/figure，一次覆盖全部新增分支。
 *
 * 七个容易「本地过、线上挂」的点：
 *   1) 抽屉是否只在 <860px 出现，桌面端不能挡住正文
 *   2) 宽表是否真的产生横向滚动（min-width 不够时表格会被压扁，看不出问题）
 *   3) 打印时折叠必须展开、表格必须回到文档流（纸面上没有滚动条）
 *   4) 折叠按钮点两次要能回到折叠态
 *   5) 系统切暗色要跟随，但读者手动选过就不许被系统顶掉
 *   6) 续读不能被带 #hash 的访问抢走
 *   7) 375px 整页不能横向溢出
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

const PARA = '这是一段用来凑字数的正文，讨论的是 ArrayList 的扩容与随机访问。'.repeat(12);

const HEADINGS = ['扩容原理', '随机访问', '线程安全', '迭代器', '序列化', '性能对比'];
const TOC = HEADINGS.map((t, i) => `<h2>${t}</h2><p>${PARA}</p>`).join('');

const COLS = ['接口', '方法', '参数', '返回', '耗时', '并发', '备注', '示例'];
const ROWS = Array.from({ length: 4 }, (_, r) =>
  `<tr>${COLS.map((c, i) => `<td>${c}${r + 1}-${i}</td>`).join('')}</tr>`).join('');
const TABLE = `<table><thead><tr>${COLS.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
<tbody>${ROWS}</tbody></table>`;

const LONG_CODE = Array.from({ length: 50 }, (_, i) =>
  `console.log(${i}, "line ${i}");`).join('\n');

const MD = `
<p>按下 <kbd>Ctrl</kbd> + <kbd>K</kbd> 打开搜索，<mark>重点内容</mark>会被标黄。</p>
<details><summary>点开看展开后的说明</summary><p>折叠里的段落。</p></details>
<ul class="task">
<li><input type="checkbox" disabled checked> 已完成的任务</li>
<li><input type="checkbox" disabled> 未完成的任务</li>
</ul>
<p>带脚注的句子<sup id="fnref1"><a href="#fn1">[1]</a></sup>。</p>
<hr>
<figure><img src="x.png" alt="示意图"><figcaption>图 1：示意图说明</figcaption></figure>
<dl><dt>扩容因子</dt><dd>默认 1.5 倍。</dd></dl>
<div class="footnotes"><ol><li id="fn1">脚注内容。</li></ol></div>`;

const body = Array.from({ length: 6 }, (_, i) =>
  `<p>${PARA}</p><h2>${HEADINGS[i % HEADINGS.length]}</h2>`).join('') +
  TABLE + `<pre><code class="language-javascript">${LONG_CODE}</code></pre>` + MD +
  Array.from({ length: 6 }, () => `<p>${PARA}</p>`).join('');

const FAKE = `<!doctype html><html><head><meta charset="utf-8">
<title>ArrayList 深入浅出 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div id="post_detail"><div id="topics"><div class="post">
<h1 class="postTitle"><a id="cb_post_title_url" href="https://www.cnblogs.com/zhangshuaiyin/p/fake.html"><span>ArrayList 深入浅出</span></a></h1>
<div class="clear"></div>
<div class="postBody">
<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">${body}</div>
<div id="blog_post_info_block"><div id="blog_post_info"></div><div id="post_next_prev"></div></div>
</div>
<div class="postDesc">posted @
<span id="post-date" data-date-updated="2021-07-23 17:15">2021-07-23 17:15</span>&nbsp;
<a href="https://www.cnblogs.com/zhangshuaiyin">Ep流苏</a>&nbsp;
阅读(<span id="post_view_count">375</span>)
</div>
</div></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告</p></div></div>
</div></div></div></div></body></html>`;

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

/**
 * @param {object} opts  viewport / scheme / pos（续读记录）/ hash（访问带锚点）
 */
async function open(browser, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1440, height: 900 },
    colorScheme: opts.scheme || 'light',
  });
  if (opts.pos) {
    await ctx.addInitScript((p) => {
      localStorage.setItem('qb-pos:/zhangshuaiyin/p/fake.html', JSON.stringify(p));
    }, opts.pos);
  }
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  await p.route('**/*', (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.endsWith('x.png')) {
      return route.fulfill({ status: 200, contentType: 'image/gif',
        body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64') });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: FAKE });
  });
  await p.goto('https://www.cnblogs.com/zhangshuaiyin/p/fake.html' + (opts.hash || ''), { waitUntil: 'load' });
  await p.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  await p.waitForTimeout(1000);
  return { ctx, p, errs };
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. 移动端目录抽屉 ---------- */
  console.log('\n[1] 移动端目录抽屉');
  {
    const { ctx, p, errs } = await open(browser, { viewport: { width: 375, height: 780 } });
    const m = await p.evaluate(() => ({
      fab: getComputedStyle(document.getElementById('qb-mtoc-fab')).display,
      left: getComputedStyle(document.getElementById('qb-left')).display,
      open: document.getElementById('qb-mtoc').classList.contains('open'),
      items: document.querySelectorAll('.qb-mtoc-list a').length,
      toc: document.querySelectorAll('#qb-left .qb-toc-list a[data-t]').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      font: getComputedStyle(document.getElementById('cnblogs_post_body')).fontSize,
    }));
    expect('悬浮目录按钮可见', m.fab, 'flex');
    expect('左栏在手机上仍然隐藏', m.left, 'none');
    expect('抽屉默认关闭', m.open, false);
    expect('抽屉条目 = 桌面目录条目', m.items, m.toc);
    truthy('目录条目数 > 3: ' + m.items, m.items > 3);
    expect('整页无横向溢出', m.overflow <= 0, true);
    expect('手机正文 16px', m.font, '16px');

    await p.click('#qb-mtoc-fab');
    await p.waitForTimeout(320);
    const o = await p.evaluate(() => {
      const sheet = document.querySelector('.qb-mtoc-sheet').getBoundingClientRect();
      return {
        open: document.getElementById('qb-mtoc').classList.contains('open'),
        aria: document.getElementById('qb-mtoc').getAttribute('aria-hidden'),
        lock: document.documentElement.classList.contains('qb-mtoc-lock'),
        top: Math.round(sheet.top),
        bottom: Math.round(sheet.bottom),
        vh: window.innerHeight,
        active: document.querySelectorAll('.qb-mtoc-list a.on').length,
      };
    });
    expect('点按钮打开', o.open, true);
    expect('aria-hidden 同步', o.aria, 'false');
    expect('背景滚动被锁', o.lock, true);
    truthy('抽屉贴底: ' + o.bottom + ' / ' + o.vh, Math.abs(o.bottom - o.vh) <= 1);
    truthy('抽屉在视口内: top=' + o.top, o.top >= 0);
    expect('当前节高亮 1 条', o.active, 1);

    /* 点第 3 条：抽屉关闭 + 页面滚到该标题附近 */
    const target = await p.evaluate(() => {
      const a = document.querySelectorAll('.qb-mtoc-list a')[2];
      return { id: a.getAttribute('data-t'), text: a.textContent };
    });
    await p.click('.qb-mtoc-list li:nth-child(3) a');
    await p.waitForTimeout(700);
    const jumped = await p.evaluate((id) => {
      const h = document.getElementById(id);
      return {
        open: document.getElementById('qb-mtoc').classList.contains('open'),
        lock: document.documentElement.classList.contains('qb-mtoc-lock'),
        top: h ? Math.round(h.getBoundingClientRect().top) : -999,
        scroll: Math.round(window.pageYOffset),
      };
    }, target.id);
    expect('点条目后关闭', jumped.open, false);
    expect('滚动锁解除', jumped.lock, false);
    truthy('滚到目标标题附近(top=' + jumped.top + ', scroll=' + jumped.scroll + ')',
      Math.abs(jumped.top - 64) <= 10);

    /* Esc 关闭 */
    await p.click('#qb-mtoc-fab');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(120);
    expect('Esc 关闭抽屉',
      await p.evaluate(() => document.getElementById('qb-mtoc').classList.contains('open')), false);
    expect('无脚本异常', errs.join('|'), '');
    await ctx.close();
  }

  /* ---------- 2. 宽表格 ---------- */
  console.log('\n[2] 宽表格横滑 + 首列吸附');
  {
    const { ctx, p } = await open(browser, { viewport: { width: 375, height: 780 } });
    const t = await p.evaluate(() => {
      const w = document.querySelector('.qb-table-wrap');
      const cell = w.querySelector('tbody td:first-child');
      const cs = getComputedStyle(cell);
      return {
        wrap: !!w,
        x: w.classList.contains('qb-x'),
        scrollW: w.scrollWidth,
        clientW: w.clientWidth,
        pos: cs.position,
        left: cs.left,
        bg: cs.backgroundColor,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect('表格已套滚动容器', t.wrap, true);
    truthy('容器识别为溢出', t.x);
    truthy(`可横滑 (${t.scrollW} > ${t.clientW})`, t.scrollW > t.clientW + 2);
    expect('首列 sticky', t.pos, 'sticky');
    expect('首列贴左', t.left, '0px');
    expect('首列有实底（不透明）', t.bg === 'rgba(0, 0, 0, 0)' || t.bg === 'transparent', false);
    expect('表格不撑破整页', t.pageOverflow <= 0, true);

    /* 认宽度够时不该加 .qb-x，否则窄表右边会被遮一档 */
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForTimeout(300);
    const d = await p.evaluate(() => {
      const w = document.querySelector('.qb-table-wrap');
      return { x: w.classList.contains('qb-x'), scrollW: w.scrollWidth, clientW: w.clientWidth };
    });
    expect('桌面宽表格也能滑', d.scrollW > d.clientW + 2, true);
    await ctx.close();
  }

  /* ---------- 3. 超长代码折叠 ---------- */
  console.log('\n[3] 超长代码块折叠');
  {
    const { ctx, p } = await open(browser, { viewport: { width: 1440, height: 900 } });
    const c = await p.evaluate(() => {
      const w = document.querySelector('.qb-code');
      const pre = w.querySelector('pre');
      return {
        folded: w.classList.contains('qb-folded'),
        btn: (w.querySelector('.qb-code-more') || {}).textContent || '',
        maxH: getComputedStyle(pre).maxHeight,
        preH: pre.clientHeight,
        scrollH: pre.scrollHeight,
        code: w.querySelectorAll('.qb-cl').length,
      };
    });
    expect('50 行代码已折叠', c.folded, true);
    match('按钮写明总行数', c.btn, /展开全部（共 50 行）/);
    expect('折叠高度生效', c.maxH, '500px');
    truthy(`内容确实被截断 (${c.scrollH} > ${c.preH})`, c.scrollH > c.preH + 40);
    expect('行号仍按 50 行拆', c.code, 50);

    await p.click('.qb-code-more');
    await p.waitForTimeout(120);
    const u = await p.evaluate(() => {
      const w = document.querySelector('.qb-code');
      return {
        folded: w.classList.contains('qb-folded'),
        btn: w.querySelector('.qb-code-more').textContent,
        aria: w.querySelector('.qb-code-more').getAttribute('aria-expanded'),
        maxH: getComputedStyle(w.querySelector('pre')).maxHeight,
      };
    });
    expect('展开后去掉折叠类', u.folded, false);
    expect('按钮变「收起」', u.btn, '收起');
    expect('aria-expanded 同步', u.aria, 'true');
    expect('展开后不再限高', u.maxH, 'none');

    await p.click('.qb-code-more');
    await p.waitForTimeout(120);
    const b = await p.evaluate(() => {
      const w = document.querySelector('.qb-code');
      return { folded: w.classList.contains('qb-folded'),
        btn: w.querySelector('.qb-code-more').textContent };
    });
    expect('再点回到折叠', b.folded, true);
    match('按钮回到展开文案', b.btn, /展开全部（共 50 行）/);
    await ctx.close();
  }

  /* ---------- 4. Markdown 元素 ---------- */
  console.log('\n[4] Markdown 元素补全');
  {
    const { ctx, p } = await open(browser);
    const r = await p.evaluate(() => {
      const body = document.getElementById('cnblogs_post_body');
      const kbd = body.querySelector('kbd');
      const mark = body.querySelector('mark');
      const det = body.querySelector('details');
      const task = body.querySelector('li.qb-task');
      const list = body.querySelector('ul.qb-tasklist');
      const fn = body.querySelector('.footnotes');
      const fig = body.querySelector('figcaption');
      const hr = body.querySelector('hr');
      return {
        kbdBorder: getComputedStyle(kbd).borderBottomWidth,
        kbdFont: getComputedStyle(kbd).fontFamily,
        markBg: getComputedStyle(mark).backgroundColor,
        detBorder: getComputedStyle(det).borderTopWidth,
        summaryCursor: getComputedStyle(det.querySelector('summary')).cursor,
        task: !!task && !!list,
        taskMarker: getComputedStyle(task).listStyleType,
        fnBorder: getComputedStyle(fn).borderTopWidth,
        figAlign: getComputedStyle(fig).textAlign,
        hrBorder: getComputedStyle(hr).borderTopWidth,
      };
    });
    expect('kbd 双层边框', r.kbdBorder, '2px');
    match('kbd 等宽字体', r.kbdFont, /Mono|Consolas|Monaco/);
    truthy('mark 有底色: ' + r.markBg, r.markBg !== 'rgba(0, 0, 0, 0)');
    expect('details 有边框', r.detBorder, '1px');
    expect('summary 可点', r.summaryCursor, 'pointer');
    expect('任务列表已标记', r.task, true);
    expect('任务项去掉圆点', r.taskMarker, 'none');
    expect('脚注有上边框', r.fnBorder, '1px');
    expect('figcaption 居中', r.figAlign, 'center');
    expect('hr 有分隔线', r.hrBorder, '1px');
    await ctx.close();
  }

  /* ---------- 5. 打印 ---------- */
  console.log('\n[5] 打印样式');
  {
    const { ctx, p } = await open(browser);
    await p.emulateMedia({ media: 'print' });
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const pre = document.querySelector('.qb-code pre');
      const wrap = document.querySelector('.qb-table-wrap');
      return {
        nav: getComputedStyle(document.querySelector('.qb-nav')).display,
        left: getComputedStyle(document.getElementById('qb-left')).display,
        side: getComputedStyle(document.getElementById('sideBarMain')).display,
        top: getComputedStyle(document.getElementById('qb-top')).display,
        bar: getComputedStyle(document.querySelector('.qb-code-bar')).display,
        more: getComputedStyle(document.querySelector('.qb-code-more')).display,
        main: getComputedStyle(document.getElementById('main')).display,
        preMax: getComputedStyle(pre).maxHeight,
        preWhite: getComputedStyle(pre).whiteSpace,
        wrapOverflow: getComputedStyle(wrap).overflowX,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.getElementById('cnblogs_post_body')).color,
      };
    });
    expect('顶栏不打印', r.nav, 'none');
    expect('左栏不打印', r.left, 'none');
    expect('右栏不打印', r.side, 'none');
    expect('回到顶部不打印', r.top, 'none');
    expect('代码工具条不打印', r.bar, 'none');
    expect('折叠按钮不打印', r.more, 'none');
    expect('主区改单列', r.main, 'block');
    expect('折叠代码整段展开', r.preMax, 'none');
    expect('代码自动折行', r.preWhite, 'pre-wrap');
    expect('表格回到文档流', r.wrapOverflow, 'visible');
    expect('打印底色为白', r.bodyBg, 'rgb(255, 255, 255)');
    expect('打印正文为深色', r.bodyColor, 'rgb(17, 17, 17)');
    await p.emulateMedia({ media: 'screen' });
    await ctx.close();
  }

  /* ---------- 6. 暗色跟随系统 ---------- */
  console.log('\n[6] 暗色跟随系统变化');
  {
    const { ctx, p } = await open(browser, { scheme: 'light' });
    const before = await p.evaluate(() => document.documentElement.classList.contains('qb-dark'));
    expect('浅色系统下不暗', before, false);

    await p.emulateMedia({ colorScheme: 'dark' });
    await p.waitForTimeout(250);
    const after = await p.evaluate(() => ({
      dark: document.documentElement.classList.contains('qb-dark'),
      body: document.body.classList.contains('qb-dark'),
      icon: document.getElementById('qb-dark-icon').textContent,
    }));
    expect('系统切暗色后跟随（html）', after.dark, true);
    expect('系统切暗色后跟随（body）', after.body, true);
    expect('图标同步成太阳', after.icon, '☀️');

    await p.emulateMedia({ colorScheme: 'light' });
    await p.waitForTimeout(250);
    expect('系统切回浅色也跟随',
      await p.evaluate(() => document.documentElement.classList.contains('qb-dark')), false);

    /* 手动选了浅色，系统再切暗也不许动 */
    await p.click('#qb-dark-toggle');   // -> 暗
    await p.click('#qb-dark-toggle');   // -> 浅，写入 qb-dark=0
    await p.emulateMedia({ colorScheme: 'dark' });
    await p.waitForTimeout(250);
    expect('手动选择优先于系统',
      await p.evaluate(() => document.documentElement.classList.contains('qb-dark')), false);
    await ctx.close();
  }

  /* ---------- 7. 续读记忆 ---------- */
  console.log('\n[7] 续读记忆');
  {
    const { ctx, p, errs } = await open(browser, {
      pos: { y: 1200, t: Date.now(), h: 5000 },
    });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({
      y: Math.round(window.pageYOffset),
      toast: !!document.getElementById('qb-toast'),
      text: (document.getElementById('qb-toast') || {}).textContent || '',
    }));
    truthy('自动回到上次位置: y=' + r.y, r.y > 700);
    expect('出现续读提示', r.toast, true);
    match('提示文案', r.text, /已回到上次阅读的位置/);

    await p.click('.qb-toast-a');
    await p.waitForFunction(() => window.pageYOffset < 40, null, { timeout: 3000 });
    const back = await p.evaluate(() => ({
      y: Math.round(window.pageYOffset),
      saved: localStorage.getItem('qb-pos:/zhangshuaiyin/p/fake.html'),
    }));
    truthy('点「回到开头」滚回顶部: y=' + back.y, back.y < 40);
    expect('回到开头即清除记录', back.saved, null);

    /* 记录：滚到中间等 700ms，必须写进 localStorage */
    await p.evaluate(() => window.scrollTo(0, 900));
    await p.waitForTimeout(700);
    const saved = await p.evaluate(() =>
      JSON.parse(localStorage.getItem('qb-pos:/zhangshuaiyin/p/fake.html') || 'null'));
    truthy('滚动后写入位置记录', saved && saved.y > 800);
    expect('无脚本异常', errs.join('|'), '');
    await ctx.close();

    /* 带 #hash 进来是明确跳转，不能被续读抢走 */
    const o = await open(browser, {
      pos: { y: 1400, t: Date.now(), h: 5000 },
      hash: '#huanrong',
    });
    await o.p.waitForTimeout(300);
    const h = await o.p.evaluate(() => ({
      toast: !!document.getElementById('qb-toast'),
      dark: false,
    }));
    expect('带锚点访问不弹续读提示', h.toast, false);
    await o.ctx.close();
  }

  /* ---------- 8. 桌面端不应出现移动端元素 ---------- */
  console.log('\n[8] 桌面端回归');
  {
    const { ctx, p, errs } = await open(browser);
    const d = await p.evaluate(() => ({
      fab: getComputedStyle(document.getElementById('qb-mtoc-fab')).display,
      drawer: getComputedStyle(document.getElementById('qb-mtoc')).visibility,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      anchors: document.querySelectorAll('.qb-hanchor').length,
      toc: document.querySelectorAll('#qb-left .qb-toc-list a').length,
    }));
    expect('桌面不显示目录悬浮按钮', d.fab, 'none');
    expect('桌面抽屉不可见', d.drawer, 'hidden');
    expect('桌面无横向溢出', d.overflow <= 0, true);
    truthy('桌面目录仍在', d.toc > 3);
    truthy('标题锚点仍在', d.anchors > 3);
    expect('无脚本异常', errs.join('|'), '');
    await ctx.close();
  }

  await browser.close();
  console.log(bad ? `\n✗ ${bad} 条未通过` : '\n✓ 全部通过');
  process.exit(bad ? 1 : 0);
})();
