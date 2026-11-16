/**
 * v7.19 专项验证：代码块行号 / 语言标签 / 复制。
 *
 * 造一份含四种代码块的假页面，覆盖「该加工的」和「必须跳过的」：
 *   A 普通 Markdown 块（language-java，含空行与 < > && 特殊字符）
 *   B 长行块（横向溢出，验证行号 sticky）
 *   C .cnblogs_code 富文本块（园方自带表格行号，必须跳过）
 *   D code 内已有 span 的高亮块（拆行会丢色，必须跳过）
 *
 * 再跑三组配置：默认 / code:false / {lineNumbers:false, copy:false}。
 * 断言里最要紧的两条：拆行后文本逐字不变、复制的文本带换行。
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

const JAVA = [
  'public class A {',
  '    public static void main(String[] a) {',
  '        if (a.length < 2 && b > 3) { System.out.println("<b>不是标签</b>"); }',
  '',
  '    }',
  '}',
].join('\n');

const LONG = 'x'.repeat(240) + ' END';

const FAKE = `<!doctype html><html><head><meta charset="utf-8">
<title>代码块测试 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div id="cnblogs_post_body">
<h1>代码块测试</h1><p>x</p>
<pre><code class="language-java">${JAVA.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
<pre class="brush:bash"><code>${LONG}</code></pre>
<div class="cnblogs_code"><pre>rich text code line</pre></div>
<pre><code class="language-js"><span style="color:#f00">var</span> x = 1;</code></pre>
</div></div>
<div id="sideBar"><div id="sideBarMain">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告</p></div></div>
</div></div></div></body></html>`;

function expect(label, got, want) {
  const ok = String(got) === String(want);
  console.log(`  ${ok ? '✓' : '✗'} ${label}: ${JSON.stringify(got)}${ok ? '' : '  (期望 ' + JSON.stringify(want) + ')'}`);
  return ok;
}
function truthy(label, got) {
  const ok = !!got;
  console.log(`  ${ok ? '✓' : '✗'} ${label}: ${got}`);
  return ok;
}

async function open(browser, cfgScript) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'https://www.cnblogs.com',
  });
  const page = await ctx.newPage();
  const html = cfgScript ? FAKE.replace('<div id="page_begin_html">', cfgScript + '<div id="page_begin_html">') : FAKE;
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
  });
  await page.goto('https://www.cnblogs.com/myblog/p/1.html');
  await page.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  /* 自建行号改到 load 之后再画（要给园方 Prism 让位的机会），多等一会儿 */
  await page.waitForTimeout(1800);
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let allOk = true;

  // ================= A. 默认配置 =================
  {
    const { ctx, page } = await open(browser, '');
    const info = await page.evaluate(() => {
      const wraps = [...document.querySelectorAll('.qb-code')];
      const first = wraps[0];
      const cls = first ? [...first.querySelectorAll('.qb-cl')] : [];
      const heights = cls.map((el) => Math.round(el.getBoundingClientRect().height));
      const lnNums = cls.map((el) => getComputedStyle(el, '::before').content);
      const firstBefore = cls[0] ? getComputedStyle(cls[0], '::before') : null;
      const lnReset = first ? getComputedStyle(first.querySelector('code')).counterReset : '';
      const lnInc = firstBefore ? firstBefore.content : '';
      const longPre = document.querySelectorAll('.qb-code > pre')[1];
      const skipHi = [...document.querySelectorAll('#cnblogs_post_body > pre')]
        .filter((p) => !p.closest('.qb-code'));
      return {
        wrapCount: wraps.length,
        lineCount: cls.length,
        texts: cls.map((el) => el.textContent),
        heights,
        lnNums,
        lnReset,
        lnInc,
        langTransform: first ? getComputedStyle(first.querySelector('.qb-code-lang')).textTransform : '',
        gutterWidth: firstBefore ? firstBefore.width : '',
        gutterPos: firstBefore ? firstBefore.position : '',
        gutterSelect: firstBefore ? firstBefore.userSelect : '',
        codeHasTag: !!first.querySelector('code b'),
        langs: wraps.map((w) => w.querySelector('.qb-code-lang').textContent),
        barBeforePre: wraps.every((w) => w.firstElementChild.classList.contains('qb-code-bar')),
        copyBtns: document.querySelectorAll('.qb-code-copy').length,
        lnVar: first.querySelector('code').style.getPropertyValue('--qb-ln-w'),
        // 未加工的 pre：高亮块(cnblogs_code 已不在 body 直接子级) + 高亮 span 块
        skipCount: skipHi.length,
        hiSpanAlive: !!document.querySelector('#cnblogs_post_body pre code span'),
        richInsideWrap: !!document.querySelector('.cnblogs_code .qb-code'),
        longScrollable: longPre ? longPre.scrollWidth > longPre.clientWidth : false,
        longPadLeft: longPre ? getComputedStyle(longPre).paddingLeft : '',
        totalCl: document.querySelectorAll('.qb-cl').length,
        preBg: first ? getComputedStyle(first.querySelector('pre')).backgroundColor : '',
      };
    });

    const nowRaw = JAVA;
    console.log('\n[A] 默认配置：加工与跳过');
    allOk = expect('加工块数（3 个：java/bash/高亮块各一条工具条）', info.wrapCount, 3) && allOk;
    allOk = expect('java 块行数', info.lineCount, 6) && allOk;
    allOk = expect('逐行文本逐字一致', info.texts.join('\u0001'), nowRaw.split('\n').join('\u0001')) && allOk;
    allOk = expect('特殊字符没被解析成标签', info.codeHasTag, false) && allOk;
    allOk = expect('语言标签（文本小写，靠 CSS 转大写）', info.langs.join(','), 'java,code,js') && allOk;
    allOk = expect('语言标签视觉大写', info.langTransform, 'uppercase') && allOk;
    allOk = expect('工具条在代码前面', info.barBeforePre, true) && allOk;
    allOk = expect('复制按钮数', info.copyBtns, 3) && allOk;
    allOk = expect('行号列宽变量（6 行 → 2ch）', info.lnVar, '2ch') && allOk;
    allOk = expect('行号用 sticky 贴左', info.gutterPos, 'sticky') && allOk;
    allOk = expect('行号不可选中', info.gutterSelect, 'none') && allOk;
    /* 行号数字由 counter 生成，Chromium 的 computed content 只回字面量
       "counter(qb-ln)"，不会解析成 1/2/3。这里只能断言计数器接上了，
       实际显示的数字靠截图核验（_tmp_code_scroll.png）。 */
    allOk = expect('代码区重置行号计数器', info.lnReset.split(/\s+/)[0], 'qb-ln') && allOk;
    allOk = expect('每个 .qb-cl 都在自增', info.lnInc, 'counter(qb-ln)') && allOk;
    allOk = truthy('空行与普通行等高（min-height 生效）', info.heights[3] === info.heights[0] || Math.abs(info.heights[3] - info.heights[0]) <= 1) && allOk;
    allOk = expect('直接子级 pre 全部挂上工具条', info.skipCount, 0) && allOk;
    allOk = expect('.qb-cl 总数（java 6 + bash 1，高亮块 0）', info.totalCl, 7) && allOk;
    allOk = expect('高亮块的 span 被保留', info.hiSpanAlive, true) && allOk;
    allOk = expect('.cnblogs_code 未被包进去', info.richInsideWrap, false) && allOk;
    allOk = expect('长行块可横向滚动', info.longScrollable, true) && allOk;
    allOk = expect('pre 左内边距为 0（行号列不留缝）', info.longPadLeft, '0px') && allOk;

    // 复制：点击按钮 → 读剪贴板，必须与原文逐字一致（含换行与空行）
    await page.click('.qb-code-copy');
    await page.waitForTimeout(350);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    const btnText = await page.textContent('.qb-code-copy');
    console.log('\n[A2] 复制');
    /* Windows 剪贴板把 \n 统一成 \r\n，这是系统行为，不是主题写坏的 */
    allOk = expect('剪贴板内容 = 原文（含空行/换行）', clip.replace(/\r\n/g, '\n'), nowRaw) && allOk;
    allOk = expect('按钮反馈', btnText, '已复制') && allOk;

    // 横向滚动后截图，人工核验行号是否仍贴左
    await page.evaluate(() => {
      const pre = document.querySelectorAll('.qb-code > pre')[1];
      pre.scrollLeft = 300;
    });
    await page.waitForTimeout(200);
    await page.locator('.qb-code').nth(1).screenshot({ path: ROOT + '_tmp_code_scroll.png' });
    await page.screenshot({ path: ROOT + '_tmp_code_full.png', fullPage: false });
    await ctx.close();
  }

  // ================= B. code:false 全关 =================
  {
    const { ctx, page } = await open(browser, '<script>window.LS_CONFIG={code:false};</script>');
    const info = await page.evaluate(() => ({
      wrapCount: document.querySelectorAll('.qb-code').length,
      rawPre: document.querySelectorAll('#cnblogs_post_body pre').length,
    }));
    console.log('\n[B] code:false');
    allOk = expect('不生成任何包裹', info.wrapCount, 0) && allOk;
    allOk = expect('原始 pre 全部保留', info.rawPre, 4) && allOk;
    await ctx.close();
  }

  // ================= C. 关行号 + 关复制 =================
  {
    const { ctx, page } = await open(
      browser,
      '<script>window.LS_CONFIG={code:{lineNumbers:false,copy:false}};</script>'
    );
    const info = await page.evaluate(() => {
      const w = document.querySelector('.qb-code');
      return {
        hasClass: w.className,
        clCount: document.querySelectorAll('.qb-cl').length,
        copyBtns: document.querySelectorAll('.qb-code-copy').length,
        barCount: document.querySelectorAll('.qb-code-bar').length,
        prePadLeft: getComputedStyle(w.querySelector('pre')).paddingLeft,
      };
    });
    console.log('\n[C] lineNumbers:false + copy:false');
    allOk = expect('挂上 no-line-numbers', info.hasClass.indexOf('no-line-numbers') > -1, true) && allOk;
    allOk = expect('不拆行、不画行号', info.clCount, 0) && allOk;
    allOk = expect('没有复制按钮', info.copyBtns, 0) && allOk;
    allOk = expect('工具条仍在（3 个块含高亮块）', info.barCount, 3) && allOk;
    allOk = expect('左内边距收回到 0', info.prePadLeft, '0px') && allOk;
    await ctx.close();
  }

  // ================= D. 移动端 + 暗色 =================
  {
    const { ctx, page } = await open(browser, '');
    await page.setViewportSize({ width: 375, height: 720 });
    await page.waitForTimeout(250);
    const m = await page.evaluate(() => {
      const pre = document.querySelector('.qb-code > pre');
      return {
        fontSize: getComputedStyle(pre).fontSize,
        overflowX: document.documentElement.scrollWidth <= window.innerWidth + 1,
      };
    });
    await page.evaluate(() => document.body.classList.add('qb-dark'));
    await page.waitForTimeout(120);
    const dark = await page.evaluate(() => {
      const cl = document.querySelector('.qb-cl');
      const b = getComputedStyle(cl, '::before');
      return { color: b.color, bg: b.backgroundColor };
    });
    console.log('\n[D] 移动端 / 暗色');
    allOk = expect('小屏字号降到 12px', m.fontSize, '12px') && allOk;
    allOk = expect('页面无横向溢出', m.overflowX, true) && allOk;
    allOk = expect('暗色行号颜色', dark.color, 'rgb(125, 133, 144)') && allOk;
    allOk = expect('暗色行号底色跟随 pre', dark.bg, 'rgb(22, 27, 34)') && allOk;
    await page.screenshot({ path: ROOT + '_tmp_code_mobile.png' });
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + (allOk ? '✓ 全部通过' : '✗ 存在不符项'));
  process.exit(allOk ? 0 : 1);
})();
