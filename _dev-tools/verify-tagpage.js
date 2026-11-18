/**
 * v7.37 专项验证：标签页（/tag）的表格网格化。
 *
 * 真实结构（2026-11-18 curl https://www.cnblogs.com/zhangshuaiyin/tag/ 实测）：
 *   #taglist_main > #taglist_title_wrap > h3#taglist_title（内含 float:right 的排序小字）
 *                 > #taglist > table#MyTag1_dtTagList > tbody > tr > td×4
 * 每行固定 4 个 td，列宽由内容撑开：390px 视口下表格 454px、#taglist 只有 324px，
 * 整页 scrollWidth 510px —— 就是「移动端标签页超出了」。
 *
 * v7.37 把 table/tbody/tr 摊平成网格（tr 用 display:contents 不生成盒子），
 * PC 四列、≤640 两列，块状样式对齐分类页的 .category-list-item。
 *
 * 要钉住的几条：
 *   1) 320~1440 任何宽度下整页不横向滚动
 *   2) 同一档位内每个 td 等宽（不再是「内容长的更宽」）
 *   3) 列数：>640 四列，≤640 两列
 *   4) 块状样式与分类页一致：--bg 底色 / 8px 圆角 / 8px 10px 内边距
 *   5) #taglist 不再是第二张卡片（无边框、无阴影、无内边距）
 *   6) 长标签不换行撑高、也不该被省略号截断（两列 136px 够放六个汉字）
 *   7) 标题与分类页同款：15px / 600 / 底部分隔线；float 排序小字已清除
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const CSS = fs.readFileSync(path.join(ROOT, 'css/theme-v7.min.css'), 'utf8');

const SITE = 'https://www.cnblogs.com/zhangshuaiyin/';

/* 线上原样结构：一行四个 td，名字与数量各占一个节点。
   第二行故意放两个长标签（六个汉字 / 带加号），第三行留一个空 td 槽位之外无特殊处理。 */
const TAGS = [
  ['个人博客', 6], ['英语语法', 1], ['依赖注入', 1], ['NAT', 1],
  ['编程语言注释', 1], ['hexo+github', 5], ['python爬虫', 1], ['子网掩码', 1],
  ['新概念英语', 5], ['springboot 依赖', 1], ['docker安装', 1], ['potplayer安装', 1],
];

function rows() {
  let out = '';
  for (let i = 0; i < TAGS.length; i += 4) {
    out += '<tr>';
    for (const [name, n] of TAGS.slice(i, i + 4)) {
      out += `<td data-custom-order="" data-use-count="${n}">` +
        `<a href="${SITE}tag/${encodeURIComponent(name)}/">${name}</a>` +
        `<span class="small">(${n})</span></td>`;
    }
    out += '</tr>';
  }
  return out;
}

const HTML = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>我的标签 - 博客园</title></head>
<body class="skin-custom has-navbar">
<div id="page_begin_html"></div>
<div id="home"><div id="header"><h1 id="blogTitle">测试站</h1></div></div>
<div id="main"><div id="mainContent"><div class="forFlow">
  <div id="taglist_main">
    <div id="taglist_title_wrap">
      <h3 id="taglist_title">我的标签
        <small style="float: right; margin: auto; font-weight: normal;">排序：
          <span style="display:none"><a href="javascript:void(0)" id="tags_orderby_custom">自定义</a> | </span>
          <a href="javascript:void(0);" id="tags_orderby_usecount" class="default-tag-order">博文数</a> |
          <a href="javascript:void(0)" id="tags_orderby_name">标签名</a>
        </small>
      </h3>
    </div>
    <div id="taglist">
      <table id="MyTag1_dtTagList" cellspacing="0" style="border-collapse:collapse;">
        <tbody>${rows()}</tbody>
      </table>
    </div>
  </div>
</div></div></div>
<script>${fs.readFileSync(path.join(ROOT, 'snippets/footer-script-v7.min.html'), 'utf8')
  .replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, '')}</script>
</body></html>`;

let pass = 0, fail = 0;
function ck(name, ok, extra) {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); }
}
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ck(name + '（' + JSON.stringify(got) + '）', ok, ok ? undefined : { got, want });
}

(async () => {
  const browser = await chromium.launch();
  const cases = [
    { w: 1440, h: 900, cols: 4, pad: '8px 10px', label: '1440 桌面' },
    { w: 1024, h: 900, cols: 4, pad: '8px 10px', label: '1024 小桌面' },
    { w: 768, h: 1024, cols: 4, pad: '8px 10px', label: '768 平板' },
    { w: 640, h: 900, cols: 2, pad: '8px 9px', label: '640 断点' },
    { w: 390, h: 844, cols: 2, pad: '8px 9px', label: '390 手机' },
    { w: 320, h: 700, cols: 2, pad: '8px 9px', label: '320 极窄' },
  ];

  for (const c of cases) {
    const page = await browser.newPage({ viewport: { width: c.w, height: c.h } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.setContent(HTML, { waitUntil: 'load' });
    await page.addStyleTag({ content: CSS });
    /* 块背景有 .16s 过渡，刚注入样式时量到的是插值中间色（rgba(...,.984)），
       等过渡结束再量，否则断言会被动画骗到 */
    await page.waitForTimeout(450);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const tds = [].slice.call(document.querySelectorAll('#MyTag1_dtTagList td'));
      const ws = tds.map((td) => Math.round(td.getBoundingClientRect().width * 100) / 100);
      const hs = tds.map((td) => Math.round(td.getBoundingClientRect().height));
      const tops = new Set(tds.map((td) => Math.round(td.getBoundingClientRect().top)));
      const cs = getComputedStyle(tds[0]);
      const clipped = tds.filter((td) => {
        const a = td.querySelector('a');
        return a && a.scrollWidth > a.clientWidth + 1;
      }).map((td) => td.innerText);
      const multiLine = tds.filter((td) => td.getBoundingClientRect().height > 40).map((td) => td.innerText);
      const tl = getComputedStyle(document.getElementById('taglist'));
      const title = document.getElementById('taglist_title');
      const tcs = getComputedStyle(title);
      const sm = title.querySelector('small');
      const firstRowCount = tds.filter((td) => Math.round(td.getBoundingClientRect().top) === Math.round(tds[0].getBoundingClientRect().top)).length;
      return {
        scrollW: de.scrollWidth, clientW: de.clientWidth,
        wMin: Math.min.apply(null, ws), wMax: Math.max.apply(null, ws),
        hMin: Math.min.apply(null, hs), hMax: Math.max.apply(null, hs),
        rows: tops.size, perRow: firstRowCount,
        bg: cs.backgroundColor, radius: cs.borderRadius, pad: cs.padding,
        clipped, multiLine,
        taglist: { bg: tl.backgroundColor, border: tl.borderTopWidth, shadow: tl.boxShadow, pad: tl.padding },
        title: { fs: tcs.fontSize, fw: tcs.fontWeight, bb: tcs.borderBottomWidth, float: sm ? getComputedStyle(sm).float : null },
      };
    });

    console.log('\n[' + c.label + ']');
    ck('整页无横向滚动', r.scrollW <= r.clientW, { scrollW: r.scrollW, clientW: r.clientW });
    ck('标签块等宽（最大-最小 ≤ 1px）', r.wMax - r.wMin <= 1, { wMin: r.wMin, wMax: r.wMax });
    eq('每行 ' + c.cols + ' 个', r.perRow, c.cols);
    eq('共 ' + Math.ceil(TAGS.length / c.cols) + ' 行', r.rows, Math.ceil(TAGS.length / c.cols));
    eq('块背景 = --bg', r.bg, 'rgb(244, 245, 247)');
    eq('圆角 8px（与分类页一致）', r.radius, '8px');
    eq('内边距', r.pad, c.pad);
    eq('块高度统一 36px', [r.hMin, r.hMax], [36, 36]);
    /* 320px 两列每格约 130px，「springboot 依赖」这种 15 字符的标签会被省略号收掉 ——
       这时宁可截断也不能撑破格子，所以只在 ≥360 时要求零截断 */
    if (c.w >= 360) eq('长标签没有被省略号截断', r.clipped, []);
    else ck('320 下最多 1 个长标签被省略（不撑破格子）', r.clipped.length <= 1, r.clipped);
    eq('标签名不换行撑高', r.multiLine, []);
    eq('#taglist 不再是第二张卡片', [r.taglist.bg, r.taglist.border, r.taglist.shadow, r.taglist.pad],
      ['rgba(0, 0, 0, 0)', '0px', 'none', '0px']);
    eq('标题 15px / 600 / 底部分隔线', [r.title.fs === '14.5px' ? 'small' : r.title.fs, r.title.fw, r.title.bb],
      [c.w <= 640 ? 'small' : '15px', '600', '1px']);
    eq('排序小字 float 已清除', r.title.float, 'none');
    eq('无 JS 报错', errs, []);
    await page.close();
  }

  await browser.close();
  console.log('\n' + (fail ? '✗ 失败 ' + fail + ' 项，通过 ' + pass + ' 项' : '✓ 标签页网格化全部通过（' + pass + ' 项）'));
  process.exit(fail ? 1 : 0);
})();
