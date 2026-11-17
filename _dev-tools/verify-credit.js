/**
 * v7.26 专项验证：页脚署名（默认反链 + meta generator + 可关闭）。
 *
 * 要钉住的几条：
 *   1) 默认在 #footer 内加一行「主题 · 流苏」，有且只有一条（boot 与 DCL 各跑一次）
 *   2) 链接指向仓库，target=_blank 且 rel 含 noopener
 *   3) <meta name="generator"> 只写一次，内容标识主题
 *   4) credit:false 时整段不出现（包括 generator）—— 说了可关就得真关得掉
 *   5) credit 传字符串时替换文案，地址不变
 *   6) 页面没有 #footer 时不抛错，其余功能照常
 *   7) 打印样式里页脚整块隐藏，署名不会印在纸上
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');
const REPO = 'https://github.com/zsy0216/cnblogs-document-theme';

const SITE = 'https://www.cnblogs.com/zhangshuaiyin/';
const PARA = '这一段用来凑字数，讨论的是页脚署名的展示方式。'.repeat(5);

/* 园方页脚的真实长相（2026-11-17 抓线上首页）：一行品牌 + 版权，一行备案 */
const FOOTER = `<div id="footer">
<a href="https://www.cnblogs.com/" id="footer_site_link" class="footer-brand">博客园</a>
<span class="footer-copyright"> &nbsp;&copy;&nbsp; 2004-2026</span>
<br /><span class="footer-icp"><a href="https://beian.miit.gov.cn" target="_blank">浙ICP备2021040463号-3</a></span>
</div>`;

function page(opts) {
  return `<!doctype html><html><head><meta charset="utf-8">
<title>我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div class="day"><div class="postTitle"><a class="postTitle2" href="${SITE}p/23690291">一次网页请求的完整链路</a></div>
<div class="postCon"><div class="c_b_p_desc">摘要：${PARA}</div></div>
<div class="postDesc">posted @ 2026-11-17 09:35 Ep流苏 <span class="post-view-count">阅读(128)</span></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告内容</p></div></div>
</div></div></div></div>
${opts && opts.noFooter ? '' : FOOTER}
</body></html>`;
}

let bad = 0;
function ck(label, ok, got) {
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : '  → ' + JSON.stringify(got)));
}
function eq(label, got, want) {
  ck(label + ': ' + JSON.stringify(got), String(got) === String(want), '期望 ' + JSON.stringify(want));
}

async function open(browser, opts) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  await p.route('**/*', async (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: page(opts) });
  });
  await p.goto(SITE, { waitUntil: 'load' });
  /* 配置必须在脚本执行前挂上，页首字段在真实页面里就是这么做的 */
  if (opts.cfg) await p.evaluate((c) => { window.LS_CONFIG = c; }, opts.cfg);
  await p.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  await p.waitForTimeout(900);
  return { ctx, p, errs };
}

const probe = () => {
  const boxes = document.querySelectorAll('.qb-credit');
  const box = boxes[0];
  const a = box ? box.querySelector('a') : null;
  const ft = document.getElementById('footer');
  const gen = document.querySelector('meta[name="generator"]');
  return {
    n: boxes.length,
    text: a ? a.textContent : '',
    href: a ? a.getAttribute('href') : '',
    target: a ? a.getAttribute('target') : '',
    rel: a ? a.getAttribute('rel') : '',
    inFooter: !!(box && ft && ft.contains(box)),
    lastChild: !!(box && ft && ft.lastElementChild === box),
    genN: document.querySelectorAll('meta[name="generator"]').length,
    gen: gen ? gen.getAttribute('content') : '',
    left: !!document.getElementById('qb-left'),
    footerVisible: ft ? getComputedStyle(ft).display : '',
  };
};

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. 默认：有署名、指向仓库、只有一条 ---------- */
  console.log('\n[1] 默认开启');
  {
    const { ctx, p, errs } = await open(browser, {});
    const r = await p.evaluate(probe);
    eq('署名只有一个', r.n, 1);
    ck('挂在 #footer 里面', r.inFooter, r);
    ck('是 #footer 的最后一个子节点', r.lastChild, r);
    eq('默认文案', r.text, '主题 · 流苏');
    eq('指向仓库', r.href, REPO);
    eq('新窗口打开', r.target, '_blank');
    ck('rel 带 noopener', /noopener/.test(r.rel || ''), r.rel);
    eq('generator 只写一次', r.genN, 1);
    ck('generator 内容标识主题', /cnblogs-document-theme/.test(r.gen), r.gen);
    ck('页面没有 JS 报错', errs.length === 0, errs);
    await ctx.close();
  }

  /* ---------- 2. 幂等：结构重建 / DCL 补调后仍是一条 ---------- */
  console.log('\n[2] 重复调用不叠加');
  {
    const { ctx, p } = await open(browser, {});
    const r = await p.evaluate(() => {
      /* 模拟「正文后到时补一次」那条路径：boot 已跑过，再走一遍 DCL 里的调用 */
      document.dispatchEvent(new Event('DOMContentLoaded'));
      const n1 = document.querySelectorAll('.qb-credit').length;
      /* 再极端一点：把脚本的整体初始化逻辑重复触发（幂等判据必须扛住） */
      document.dispatchEvent(new Event('DOMContentLoaded'));
      return {
        n1,
        n2: document.querySelectorAll('.qb-credit').length,
        genN: document.querySelectorAll('meta[name="generator"]').length,
      };
    });
    eq('DCL 一次后仍一条', r.n1, 1);
    eq('DCL 两次后仍一条', r.n2, 1);
    eq('generator 不重复', r.genN, 1);
    await ctx.close();
  }

  /* ---------- 3. credit:false 真的能关掉 ---------- */
  console.log('\n[3] credit:false');
  {
    const { ctx, p, errs } = await open(browser, { cfg: { credit: false } });
    const r = await p.evaluate(probe);
    eq('署名不出现', r.n, 0);
    eq('generator 也不写', r.genN, 0);
    ck('页面其余功能正常（左栏已建）', r.left, r);
    ck('没有 JS 报错', errs.length === 0, errs);
    await ctx.close();
  }

  /* ---------- 4. 自定义文案 ---------- */
  console.log('\n[4] 自定义文案');
  {
    const { ctx, p } = await open(browser, { cfg: { credit: 'Theme by Ep' } });
    const r = await p.evaluate(probe);
    eq('文案被替换', r.text, 'Theme by Ep');
    eq('地址仍指向仓库', r.href, REPO);
    await ctx.close();
  }

  /* ---------- 5. 没有 #footer 的页面 ---------- */
  console.log('\n[5] 无 #footer 时不崩');
  {
    const { ctx, p, errs } = await open(browser, { noFooter: true });
    const r = await p.evaluate(probe);
    eq('不硬塞署名', r.n, 0);
    eq('generator 照写（与页脚无关）', r.genN, 1);
    ck('页面照常初始化', r.left, r);
    ck('没有 JS 报错', errs.length === 0, errs);
    await ctx.close();
  }

  /* ---------- 6. 打印不署名 ---------- */
  console.log('\n[6] 打印');
  {
    const { ctx, p } = await open(browser, {});
    await p.emulateMedia({ media: 'print' });
    const r = await p.evaluate(probe);
    eq('打印时 #footer 隐藏', r.footerVisible, 'none');
    await p.emulateMedia({ media: 'screen' });
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + (bad ? '✗ 失败 ' + bad + ' 项' : '✓ 全部通过'));
  process.exit(bad ? 1 : 0);
})();
