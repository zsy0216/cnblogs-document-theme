/**
 * 配置层与托管加载的专项验证。
 *
 * 1) 真实 script src 加载：模拟托管后浏览器插入外链，而不是 evaluate 直接执行
 * 2) 暗色三层优先级：localStorage > LS_CONFIG.dark > 系统偏好（本次改动了这段逻辑，必须回归）
 * 2b) 旧名 QB_CONFIG 兼容 + LS_CONFIG 优先
 * 3) 非法配置不崩
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const base = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(base + 'dist/document-theme.js', 'utf8');
const CSS = fs.readFileSync(base + 'css/theme-v7.min.css', 'utf8');
const INLINE = (fs.readFileSync(base + 'snippets/footer-script-v7.min.html', 'utf8')
  .match(/<script>([\s\S]*?)<\/script>/) || [])[1];
const URL = 'https://www.cnblogs.com/zhangshuaiyin/';
const FAKE = 'https://qb.test/document-theme.js';

async function page(browser, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: opts.scheme || 'light',
  });
  if (opts.storage) {
    await ctx.addInitScript((s) => {
      if (s.dark === null) localStorage.removeItem('qb-dark');
      else localStorage.setItem('qb-dark', s.dark);
    }, { dark: opts.storage });
  }
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  await p.route('**/*', async (route) => {
    const req = route.request();
    if (req.url() === FAKE) {
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: BUNDLE });
    }
    if (req.resourceType() !== 'document') return route.continue();
    const resp = await route.fetch();
    let body = await resp.text();
    body = body.replace(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/g, (m) =>
      m.indexOf('buildFullArchive') >= 0 ? '' : m);
    await route.fulfill({ response: resp, body });
  });
  await p.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    document.querySelectorAll('link[rel=stylesheet]').forEach((l) => {
      if (l.href.indexOf('/custom.css') >= 0) l.disabled = true;
    });
    /* v7.4 起页首不再引外链 css（样式在 js 里），线上旧页首那份 link 会干扰断言：
       它排在 body 里，级联顺序压过后注入的 style，导致 accent 断言假失败。
       测的是 v7.4 的形态，所以先摘掉它。 */
    document.querySelectorAll('link[href*="theme-v7.min.css"]').forEach((l) => l.remove());
    document.querySelectorAll('#leftcontentcontainer .qb-panel').forEach((e) => e.remove());
    ['qb-top', 'qb-cfg-accent', 'qb-theme-style', 'loading'].forEach((id) => {
      const e = document.getElementById(id);
      if (e) e.remove();
    });
  });
  return { ctx, p, errs };
}

function state() {
  const top = document.getElementById('qb-top');
  const root = getComputedStyle(document.documentElement);
  return {
    panels: document.querySelectorAll('.qb-panel-title').length,
    top: !!top,
    dark: document.documentElement.classList.contains('qb-dark'),
    accent: root.getPropertyValue('--accent').trim(),
    bg: getComputedStyle(document.body).backgroundColor,
    styleInjected: !!document.getElementById('qb-theme-style'),
  };
}

(async () => {
  const browser = await chromium.launch();
  let bad = 0;
  const line = (ok, name, extra) => {
    if (!ok) bad += 1;
    console.log(`  ${ok ? '✓' : '✗'} ${name}${extra ? '  ' + extra : ''}`);
  };

  console.log('\n=== 1. 外链 <script src> 真实加载 ===');
  {
    const { ctx, p, errs } = await page(browser);
    const loaded = await p.evaluate((url) => new Promise((res) => {
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.body.appendChild(s);
    }), FAKE);
    await p.waitForTimeout(1800);
    const st = await p.evaluate(state);
    line(loaded, 'script 加载成功');
    line(st.styleInjected, '样式已注入', 'id=qb-theme-style');
    line(st.panels > 0, '左栏面板已生成', st.panels + ' 个');
    line(st.top, '回到顶部已创建');
    line(st.bg !== 'rgba(0, 0, 0, 0)', '样式已生效', 'body=' + st.bg);
    line(errs.length === 0, '无 JS 报错', errs.join(' / '));
    await ctx.close();
  }

  console.log('\n=== 2. 暗色三层优先级 ===');
  const cases = [
    ['localStorage=1（手动开过）', { storage: '1', scheme: 'light', cfg: { dark: 'off' } }, true],
    ['localStorage=0（手动关过）', { storage: '0', scheme: 'dark', cfg: { dark: 'on' } }, false],
    ['无记录 + 系统浅色', { storage: null, scheme: 'light', cfg: {} }, false],
    ['无记录 + 系统深色', { storage: null, scheme: 'dark', cfg: {} }, true],
    ['无记录 + 系统浅色 + cfg=on', { storage: null, scheme: 'light', cfg: { dark: 'on' } }, true],
    ['无记录 + 系统深色 + cfg=off', { storage: null, scheme: 'dark', cfg: { dark: 'off' } }, false],
    ['cfg 给错值 xxx 不崩', { storage: null, scheme: 'light', cfg: { dark: 'xxx' } }, false],
  ];
  for (const [name, o, expect] of cases) {
    const { ctx, p, errs } = await page(browser, o);
    if (Object.keys(o.cfg).length) await p.evaluate((c) => { window.LS_CONFIG = c; }, o.cfg);
    await p.evaluate(INLINE);
    await p.waitForTimeout(600);
    const st = await p.evaluate(state);
    line(st.dark === expect && errs.length === 0, name,
      `暗色=${st.dark} 期望=${expect}${errs.length ? ' 报错:' + errs[0] : ''}`);
    await ctx.close();
  }

  console.log('\n=== 2b. 旧名 QB_CONFIG 兼容与优先级 ===');
  {
    const a = await page(browser, { storage: null, scheme: 'light' });
    await a.p.evaluate(() => { window.QB_CONFIG = { dark: 'on' }; });
    await a.p.evaluate(INLINE);
    await a.p.waitForTimeout(600);
    const sa = await a.p.evaluate(state);
    line(sa.dark === true, '只写旧名 QB_CONFIG 仍生效', 'dark=' + sa.dark);
    line(a.errs.length === 0, '无报错', a.errs.join(' / '));
    await a.ctx.close();

    const b = await page(browser, { storage: null, scheme: 'dark' });
    await b.p.evaluate(() => {
      window.QB_CONFIG = { dark: 'on' };
      window.LS_CONFIG = { dark: 'off' };
    });
    await b.p.evaluate(INLINE);
    await b.p.waitForTimeout(600);
    const sb = await b.p.evaluate(state);
    line(sb.dark === false, '同时写时 LS_CONFIG 优先', 'dark=' + sb.dark);
    line(b.errs.length === 0, '无报错', b.errs.join(' / '));
    await b.ctx.close();
  }

  console.log('\n=== 3. 配置不影响未提及的项 ===');
  {
    const { ctx, p, errs } = await page(browser);
    await p.evaluate(() => { window.LS_CONFIG = { accent: '#2f9e44' }; });
    await p.evaluate(INLINE);
    await p.waitForTimeout(1200);
    const st = await p.evaluate(state);
    line(st.accent === '#2f9e44', 'accent 生效', st.accent);
    line(st.top === true, 'backToTop 保持默认开启');
    line(st.panels > 0, '面板仍生成', st.panels + ' 个');
    line(errs.length === 0, '无报错', errs.join(' / '));
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${bad === 0 ? '✓ 全部通过' : '✗ ' + bad + ' 项异常'}`);
  process.exit(bad === 0 ? 0 : 1);
})();
