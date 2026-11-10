// 源版 vs 压缩版 行为对拍：同一页面分别注入两个版本，比较 DOM 结果是否一致。
// 任何一处不同都打印出来 —— 压缩器只该删注释和空白，不该改变行为。
const { chromium } = require('playwright-core');
const fs = require('fs');
const base = 'E://Documents//WorkBuddy//2026-10-11-15-08-36//blogcn-nicen-theme//';
const CSS_SRC = fs.readFileSync(base + 'css//theme-v7.css', 'utf8');
const CSS_MIN = fs.readFileSync(base + 'css//theme-v7.min.css', 'utf8');
const pick = (f) => (fs.readFileSync(base + f, 'utf8').match(/<script>([\s\S]*?)<\/script>/) || [])[1];
const SRC = pick('snippets//footer-script-v7.html');
const MIN = pick('snippets//footer-script-v7.min.html');

const pages = [
  ['首页 p1', 'https://www.cnblogs.com/zhangshuaiyin/'],
  ['随笔 p2', 'https://www.cnblogs.com/zhangshuaiyin/default.html?page=2'],
  ['文章页', 'https://www.cnblogs.com/zhangshuaiyin/p/23587183.html'],
  ['归档页', 'https://www.cnblogs.com/zhangshuaiyin/p/archive/2021/07'],
  ['标签页', 'https://www.cnblogs.com/zhangshuaiyin/tag/%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/'],
  ['分类页', 'https://www.cnblogs.com/zhangshuaiyin/category/2051348.html'],
];

async function run(browser, url, css, code) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 120)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 100)); });

  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);

  // 清掉线上旧版脚本留下的结构，模拟「首跑」
  await page.evaluate(() => {
    document.querySelectorAll('link[rel=stylesheet]').forEach((l) => {
      if (l.href.indexOf('/custom.css') >= 0) l.disabled = true;
    });
    document.querySelectorAll('#leftcontentcontainer .qb-panel').forEach((e) => e.remove());
    document.querySelectorAll('[data-qb-pg]').forEach((e) => {
      e.removeAttribute('data-qb-pg');
      e.classList.remove('qb-pager', 'qb-pager-top');
      e.style.display = '';
    });
    document.querySelectorAll('.qb-pager-bar').forEach((b) => {
      b.classList.remove('qb-pager-bar');
      b.removeAttribute('data-qb-empty');
      b.style.display = '';
    });
    const old = document.getElementById('qb-top');
    if (old) old.remove();
    // 关键：不清掉 .qb-archive 就会命中幂等守卫，新脚本直接 return，等于没测
    document.querySelectorAll('.qb-archive, .qb-arc-wait, .qb-arc-idx').forEach((e) => e.remove());
    document.querySelectorAll('#mainContent [data-qb-arc]').forEach((e) => e.remove());
  });
  await page.evaluate((css) => {
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }, css);
  await page.evaluate(code);
  await page.waitForTimeout(3400);

  const r = await page.evaluate(() => {
    const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
    const panels = [].slice.call(document.querySelectorAll('#leftcontentcontainer .qb-panel')).map((p) => txt(p.querySelector('.qb-panel-title')));
    const items = [].slice.call(document.querySelectorAll('#leftcontentcontainer .qb-toc-list > li, #leftcontentcontainer .qb-list > li')).map(txt);
    const pager = [].slice.call(document.querySelectorAll('#mainContent .pager, #mainContent #nav_next_page')).map((u) => {
      const cs = getComputedStyle(u);
      return { t: txt(u), d: cs.display, h: Math.round(u.getBoundingClientRect().height) };
    });
    const days = [].slice.call(document.querySelectorAll('#mainContent .day, #mainContent .post')).slice(0, 4).map((d) => Math.round(d.getBoundingClientRect().height));
    const arc = document.querySelector('.qb-archive');
    const arcYears = document.querySelectorAll('.qb-arc-yh').length;
    const arcMonths = document.querySelectorAll('.qb-arc-mo').length;
    const arcItems = document.querySelectorAll('.qb-arc-item').length;
    const arcTitle = txt(document.querySelector('.qb-arc-title'));
    const top = document.getElementById('qb-top');
    const ring = top && top.querySelector('.qb-top-ring-fg');
    const right = document.querySelector('#qb-right');
    const sels = ['body', '#mainContent .day', '#mainContent .post', '.qb-panel', '.qb-panel-title',
      '#qb-right', '#qb-right .qb-card', '#qb-top', '#mainContent .qb-pager a', '#mainContent .pager .qb-cur',
      '#post_detail .postTitle', '#header .qb-nav', '.qb-toc-list a', '.qb-arc-mo', '.qb-arc-item'];
    const props = ['backgroundColor', 'color', 'fontSize', 'fontWeight', 'paddingTop', 'paddingLeft',
      'marginTop', 'borderTopWidth', 'borderTopColor', 'borderRadius', 'boxShadow', 'lineHeight',
      'display', 'width', 'height'];
    const styles = {};
    sels.forEach((q) => {
      const e = document.querySelector(q);
      if (!e) { styles[q] = null; return; }
      const cs = getComputedStyle(e);
      const o = {};
      props.forEach((k) => { o[k] = cs[k]; });
      styles[q] = o;
    });

    return {
      styles: styles,
      panels: panels,
      items: items.slice(0, 6),
      itemCount: items.length,
      pager: pager,
      days: days,
      archive: arc ? { years: arcYears, months: arcMonths, items: arcItems, title: arcTitle } : null,
      topBtn: top ? { tag: top.tagName, cls: top.className, aria: top.getAttribute('aria-label'), dash: ring ? ring.style.strokeDasharray : null } : null,
      rightH: right ? Math.round(right.getBoundingClientRect().height) : null,
      rightKids: right ? right.children.length : null,
    };
  });
  r.errors = errs.filter((e) => !/Permissions policy|unload|favicon/i.test(e));
  await page.close();
  return r;
}

(async () => {
  const browser = await chromium.launch();
  let bad = 0;
  for (const [name, url] of pages) {
    const a = await run(browser, url, CSS_SRC, SRC);
    const b = await run(browser, url, CSS_MIN, MIN);
    const ja = JSON.stringify(a), jb = JSON.stringify(b);
    if (ja === jb) {
      console.log('✓ ' + name + '  一致  panels=' + a.panels.length + ' pager=' + JSON.stringify(a.pager.map((p) => p.t)) + ' arc=' + (a.archive ? a.archive.items : '-'));
    } else {
      bad++;
      console.log('✗ ' + name + '  不一致');
      const keys = Object.keys(a);
      keys.forEach((k) => {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
          console.log('    [' + k + ']');
          console.log('      src: ' + JSON.stringify(a[k]).slice(0, 260));
          console.log('      min: ' + JSON.stringify(b[k]).slice(0, 260));
        }
      });
    }
  }
  console.log(bad === 0 ? '\n全部一致：压缩版行为等同源版' : '\n' + bad + ' 个页面存在差异');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
