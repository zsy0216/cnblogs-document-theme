/**
 * 三方案对拍：内联版 / 合并版 / 合并版+配置
 *
 * A 内联版   = theme-v7.min.css + footer-script-v7.min.html 的 script（当前线上分发方式）
 * B 合并版   = dist/document-theme.js 一个文件，不设配置
 * C 带配置   = 同一个文件 + window.QB_CONFIG
 *
 * A 与 B 必须完全一致（证明合并只是换个分发形式，没有第二套实现）。
 * C 用来证明配置真的生效，而不是写了个装饰性的对象。
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const base = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const CSS = fs.readFileSync(base + 'css/theme-v7.min.css', 'utf8');
const INLINE = (fs.readFileSync(base + 'snippets/footer-script-v7.min.html', 'utf8')
  .match(/<script>([\s\S]*?)<\/script>/) || [])[1];
const BUNDLE = fs.readFileSync(base + 'dist/document-theme.js', 'utf8');

const PAGES = [
  ['首页 p1', 'https://www.cnblogs.com/zhangshuaiyin/'],
  ['随笔 p2', 'https://www.cnblogs.com/zhangshuaiyin/default.html?page=2'],
  ['文章页', 'https://www.cnblogs.com/zhangshuaiyin/p/23587183.html'],
  ['归档页', 'https://www.cnblogs.com/zhangshuaiyin/p/archive/2026/11'],
  ['标签页', 'https://www.cnblogs.com/zhangshuaiyin/tag/%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/'],
];

const CFG = { accent: '#e8590c', dark: 'on', backToTop: false };

async function open(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => {
    if (!/Permissions policy/i.test(e.message)) errs.push(e.message);
  });
  /* 线上页脚字段里跑着旧版脚本，会自己建 .qb-archive 抢占，必须从 HTML 层摘掉 */
  await page.route('**/*', async (route) => {
    const req = route.request();
    if (req.resourceType() !== 'document') return route.continue();
    const resp = await route.fetch();
    let body = await resp.text();
    body = body.replace(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/g, (m) =>
      m.indexOf('buildFullArchive') >= 0 ? '' : m);
    await route.fulfill({ response: resp, body });
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => {
    document.querySelectorAll('link[rel=stylesheet]').forEach((l) => {
      if (l.href.indexOf('/custom.css') >= 0) l.disabled = true;
    });
  });
  return { ctx, page, errs };
}

function cleanup() {
  document.querySelectorAll('#leftcontentcontainer .qb-panel').forEach((e) => e.remove());
  document.querySelectorAll('.qb-archive, .qb-arc-wait, .qb-arc-idx').forEach((e) => e.remove());
  document.querySelectorAll('#mainContent [data-qb-arc]').forEach((e) => e.remove());
  /* v7.4 起页首不再引外链 css（样式在 js 里）。线上旧页首那份 <link> 排在 body 里，
     级联顺序压过后注入的 style，会让 accent 配置假失败，先摘掉它。 */
  document.querySelectorAll('link[href*="theme-v7.min.css"]').forEach((l) => l.remove());
  ['qb-top', 'qb-cfg-accent', 'qb-theme-style', 'loading'].forEach((id) => {
    const e = document.getElementById(id);
    if (e) e.remove();
  });
  document.querySelectorAll('style[data-qb-variant]').forEach((e) => e.remove());
}

async function snapshot(page) {
  return page.evaluate(() => {
    const txt = (s) => [].slice.call(document.querySelectorAll(s)).map((e) => e.textContent.trim());
    const pager = [].slice.call(document.querySelectorAll('#mainContent .pager, #mainContent #nav_next_page'))
      .map((u) => (u.textContent || '').replace(/\s+/g, ' ').trim())
      .filter((t) => t.length);
    const top = document.getElementById('qb-top');
    const sels = ['body', '#mainContent .day', '#mainContent .post', '.qb-panel', '.qb-panel-title',
      '#qb-right', '#mainContent .qb-pager a', '#mainContent .pager .qb-cur', '#post_detail .postTitle'];
    const props = ['backgroundColor', 'color', 'fontSize', 'paddingTop', 'marginTop',
      'borderTopWidth', 'borderRadius', 'lineHeight', 'display', 'width', 'height'];
    const styles = {};
    sels.forEach((q) => {
      const e = document.querySelector(q);
      if (!e) { styles[q] = null; return; }
      const cs = getComputedStyle(e);
      const o = {};
      props.forEach((k) => { o[k] = cs[k]; });
      styles[q] = o;
    });
    const root = getComputedStyle(document.documentElement);
    return {
      panels: txt('.qb-panel-title'),
      pager: pager,
      cards: document.querySelectorAll('#mainContent .post').length,
      toc: document.querySelectorAll('.qb-toc-list a').length,
      arc: document.querySelectorAll('.qb-arc-item').length,
      arcMonths: document.querySelectorAll('.qb-arc-mo').length,
      top: top ? { tag: top.tagName, label: top.getAttribute('aria-label'), w: top.offsetWidth } : null,
      dark: document.documentElement.classList.contains('qb-dark') &&
            document.body.classList.contains('qb-dark'),
      accent: root.getPropertyValue('--accent').trim(),
      accentDeep: root.getPropertyValue('--accent-deep').trim(),
      accentStyle: !!document.getElementById('qb-cfg-accent'),
      themeStyle: !!document.getElementById('qb-theme-style'),
      styles: styles,
    };
  });
}

async function run(browser, url, variant) {
  const { ctx, page, errs } = await open(browser, url);

  if (variant === 'A') {
    /* 顺序不能反：cleanup 会删掉 style[data-qb-variant]，必须先清再注入 */
    await page.evaluate(cleanup);
    await page.evaluate((css) => {
      const st = document.createElement('style');
      st.setAttribute('data-qb-variant', 'A');
      st.textContent = css;
      document.head.appendChild(st);
    }, CSS);
    await page.evaluate(INLINE);
  } else if (variant === 'B') {
    await page.evaluate(cleanup);
    await page.evaluate(BUNDLE);
  } else {
    await page.evaluate((cfg) => { window.QB_CONFIG = cfg; }, CFG);
    await page.evaluate(cleanup);
    await page.evaluate(BUNDLE);
  }

  await page.waitForTimeout(variant === 'A' ? 2600 : 3000);
  const r = await snapshot(page);
  r.errs = errs;
  await ctx.close();
  return r;
}

function diff(a, b) {
  const out = [];
  const keys = ['panels', 'pager', 'cards', 'toc', 'arc', 'arcMonths', 'top', 'dark', 'accent', 'accentDeep'];
  keys.forEach((k) => {
    const x = JSON.stringify(a[k]), y = JSON.stringify(b[k]);
    if (x !== y) out.push(`${k}: A=${x}  B=${y}`);
  });
  Object.keys(a.styles).forEach((sel) => {
    const x = a.styles[sel], y = b.styles[sel];
    if (!x || !y) { if (JSON.stringify(x) !== JSON.stringify(y)) out.push(`style ${sel}: 存在性不同`); return; }
    Object.keys(x).forEach((p) => {
      if (x[p] !== y[p]) out.push(`style ${sel} ${p}: ${x[p]} -> ${y[p]}`);
    });
  });
  return out;
}

(async () => {
  const browser = await chromium.launch();
  let bad = 0;

  for (const [name, url] of PAGES) {
    const a = await run(browser, url, 'A');
    const b = await run(browser, url, 'B');
    const c = await run(browser, url, 'C');
    const d = diff(a, b);
    const ok = d.length === 0 && a.errs.length === 0 && b.errs.length === 0;
    if (!ok) bad += 1;

    console.log(`\n=== ${name} ===`);
    console.log(`  A 内联  面板${a.panels.length} 卡${a.cards} 目录${a.toc} 归档${a.arc}/${a.arcMonths} 分页${a.pager.length} 回顶${a.top ? a.top.w + 'px' : '无'} 暗${a.dark} accent=${a.accent}`);
    console.log(`  B 合并  面板${b.panels.length} 卡${b.cards} 目录${b.toc} 归档${b.arc}/${b.arcMonths} 分页${b.pager.length} 回顶${b.top ? b.top.w + 'px' : '无'} 暗${b.dark} accent=${b.accent}`);
    console.log(`  ${ok ? '✓ A≡B 一致' : '✗ 不一致'}${a.errs.length || b.errs.length ? ' | 报错 ' + a.errs.concat(b.errs).join(' / ') : ''}`);
    d.forEach((x) => console.log('     差异 ' + x));
    console.log(`  C 配置  accent=${c.accent} deep=${c.accentDeep} 配置样式${c.accentStyle ? '已注入' : '未注入'} 暗色${c.dark} 回顶${c.top ? '仍在' : '已关'}`);
    const cfgOk = c.accent === CFG.accent && c.dark === true && c.top === null && c.accentStyle;
    if (!cfgOk) bad += 1;
    console.log(`  ${cfgOk ? '✓ 三项配置均生效' : '✗ 配置未按预期生效'}`);
  }

  await browser.close();
  console.log(`\n${bad === 0 ? '✓ 全部通过' : '✗ ' + bad + ' 项异常'}`);
  process.exit(bad === 0 ? 0 : 1);
})();
