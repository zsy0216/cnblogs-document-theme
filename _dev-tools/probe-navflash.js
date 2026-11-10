/* 测「切换页面」全过程：从点击链接到新页面结构齐，逐帧看画面。
   这是跨文档导航，页面内采样测不到 —— 旧文档一 commit 就被销毁。
   所以用 CDP screencast 录屏：每帧拿 base64 jpeg，用「字节数」判断是不是白屏
   （1360x900 的纯白 jpeg 压完只有几 KB，有内容的一般 40KB 以上）。

   用法：
     node _dev-tools/probe-navflash.js                    当前产物（有闸门）
     NOGATE=1 node _dev-tools/probe-navflash.js           去掉整页闸门
     VT=1     node _dev-tools/probe-navflash.js           加跨文档视图过渡
     NOGATE=1 VT=1 node _dev-tools/probe-navflash.js      两者都开
*/
const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FROM = 'https://www.cnblogs.com/zhangshuaiyin/p/23587183';   // 文章页（起点）
const TO = 'https://www.cnblogs.com/zhangshuaiyin/';                // 首页（终点）
const BUNDLE = fs.readFileSync(path.join(ROOT, 'dist', 'document-theme.js'), 'utf8');
const HEAD = fs.readFileSync(path.join(ROOT, 'dist', 'paste', 'hosted', '1-页首.html'), 'utf8');
const CSS_FIELD = fs.readFileSync(path.join(ROOT, 'dist', 'paste', 'hosted', '4-样式.css'), 'utf8');

const NOGATE = process.env.NOGATE === '1';
const VT = process.env.VT === '1';
const NOVT = process.env.NOVT === '1';
// REALCSS=1：不内联 <style>，改为拦截 /zhangshuaiyin/custom.css 返回新样式
// —— 这是线上真实形态（外链 CSS，阻塞渲染），时序和 <style> 不一样
const REALCSS = process.env.REALCSS === '1';

function endOfDiv(html, start) {
  let d = 0, i = start + 4;
  while (i < html.length) {
    if (html.startsWith('<!--', i)) { const j = html.indexOf('-->', i); i = j < 0 ? html.length : j + 3; continue; }
    if (html.startsWith('<script', i)) { const j = html.indexOf('</script>', i); i = j < 0 ? html.length : j + 9; continue; }
    if (html.startsWith('<style', i)) { const j = html.indexOf('</style>', i); i = j < 0 ? html.length : j + 8; continue; }
    if (html.startsWith('<div', i)) { d++; i += 4; continue; }
    if (html.startsWith('</div>', i)) { if (d === 0) return i + 6; d--; i += 6; continue; }
    i++;
  }
  return -1;
}
function swapBegin(raw, headHtml) {
  const s = raw.indexOf('<div id="page_begin_html">');
  const e = endOfDiv(raw, s);
  return raw.slice(0, s) + '<div id="page_begin_html">' + headHtml + '</div>' + raw.slice(e);
}

let css = CSS_FIELD;
// NOVT：把跨页过渡整段摘掉，用来对比「有过渡 / 无过渡」的差别
if (NOVT) {
  css = css
    .replace(/@view-transition\{[^}]*\}/g, '')
    .replace(/@keyframes qb-vt-in\{[^}]*\{[^}]*\}[^}]*\}/g, '')
    .replace(/::view-transition[^{]*\{[^}]*\}/g, '')
    .replace(/\.qb-nav\{view-transition-name:qb-nav\}/g, '');
}
if (NOGATE) css = css.replace(/html:not\(\.qb-ready\) body\{[^}]*\}/, '/* 闸门已关 */');
if (VT) css += `
@view-transition { navigation: auto; }
.qb-nav { view-transition-name: qb-nav; }
#mainContent { view-transition-name: qb-main; }
::view-transition-group(qb-nav) { animation-duration: .28s; }
`;

function build(raw) {
  let doc = swapBegin(raw, HEAD);
  doc = doc.replace(/<script>([\s\S]*?)<\/script>/g, (m, body) =>
    body.length > 8000 ? '<!-- removed old inline theme -->' : m);
  if (!REALCSS) doc = doc.replace(/<\/head>/i, '<style id="field-css">' + css + '</style></head>');
  return doc;
}

(async () => {
  const b = await chromium.launch({
    args: ['--disable-web-security', '--disable-features=BlockInsecurePrivateNetworkRequests'],
  });
  const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  p.on('pageerror', e => console.log('[pageerror]', e.message));

  // 本地托管 js（可延迟模拟弱网）
  const PORT = 8951;
  const srv = http.createServer((q, r) => {
    r.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    r.end(BUNDLE);
  });
  await new Promise(r => srv.listen(PORT, r));

  const docs = {};
  for (const u of [FROM, TO]) {
    const raw = await (await p.request.get(u)).text();
    docs[u] = build(raw).split('https://blog-static.cnblogs.com/files/blogs/477677/document-theme.js')
      .join('http://127.0.0.1:' + PORT + '/dt.js');
  }

  await p.route(u => {
    const h = u.href.split('#')[0].split('?')[0];
    return h === FROM || h === TO || h === TO.replace(/\/$/, '') || h === FROM + '/';
  }, route => {
    const h = route.request().url().split('#')[0].split('?')[0];
    const key = (h === FROM || h === FROM + '/') ? FROM : TO;
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: docs[key] });
  });
  await p.route(u => u.href.indexOf('custom.css') >= 0, route =>
    route.fulfill({ status: 200, contentType: 'text/css',
      body: REALCSS ? css : '/* 线上旧 CSS 已屏蔽 */' }));

  await p.goto(FROM, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(2500);

  // 起始页的顶栏/正文位置，作为对照基线
  const base = await p.evaluate(() => {
    const R = el => el ? el.getBoundingClientRect().top : -1;
    return {
      navTop: R(document.querySelector('.qb-nav')),
      mainTop: R(document.getElementById('mainContent')),
      cols: getComputedStyle(document.getElementById('main')).gridTemplateColumns,
      sidetop: R(document.getElementById('sideBarMain')),
    };
  });
  console.log('起点基线: nav.top=' + base.navTop + ' main.top=' + base.mainTop +
    ' 右栏.top=' + base.sidetop + ' cols=' + base.cols);

  // 开录屏，点链接，录 4 秒
  const cdp = await p.context().newCDPSession(p);
  const frames = [];
  const t0 = Date.now();
  const DIR = path.join(ROOT, '_dev-tools', 'dumps', 'nav');
  fs.mkdirSync(DIR, { recursive: true });
  const TAG = (NOVT ? 'novt' : (NOGATE ? 'nogate' : 'gate')) + (VT ? '-vt' : '');
  cdp.on('Page.screencastFrame', async (f) => {
    const t = Date.now() - t0;
    const buf = Buffer.from(f.data, 'base64');
    frames.push({ t, bytes: buf.length, file: TAG + '-' + String(t).padStart(5, '0') + '.jpg' });
    fs.writeFileSync(path.join(DIR, frames[frames.length - 1].file), buf);
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1, maxWidth: 1360, maxHeight: 900 });

  const link = await p.$('a[href="https://www.cnblogs.com/zhangshuaiyin/"], a[href="/zhangshuaiyin/"]');
  if (!link) { console.log('✗ 页面上没找到指向首页的链接'); await b.close(); srv.close(); return; }
  const navStart = Date.now();
  await link.click({ noWaitAfter: true }).catch(e => console.log('[click]', e.message.split('\n')[0]));

  // 等新文档出现新的 #main（跨文档后旧 page 对象仍可用）
  await p.waitForFunction(() => {
    const m = document.getElementById('main');
    return m && getComputedStyle(document.body).opacity === '1' &&
           document.getElementById('qb-left') && document.getElementById('qb-left').children.length > 0;
  }, { timeout: 20000 }).catch(() => console.log('[warn] 等待结构齐超时'));
  await p.waitForTimeout(1200);
  await cdp.send('Page.stopScreencast').catch(() => {});

  const navMs = Date.now() - navStart;
  console.log('\n点击 → 新页结构齐: ' + navMs + 'ms，录到 ' + frames.length + ' 帧');

  // 白帧判定：jpeg 小于 12KB 基本就是整屏纯色
  const WHITE = 12000;
  console.log('\n时间轴（Δt 为相对点击时刻，size 单位 KB）：');
  let whiteRun = 0, whiteStart = -1, maxWhite = 0, maxWhiteAt = -1;
  frames.forEach((f, i) => {
    const isWhite = f.bytes < WHITE;
    if (isWhite) { if (whiteRun === 0) whiteStart = f.t; whiteRun++; }
    if (whiteRun > maxWhite) { maxWhite = whiteRun; maxWhiteAt = whiteStart; }
    if (!isWhite && whiteRun > 0) whiteRun = 0;
    if (i % 2 === 0 || i < 6 || isWhite)
      console.log('  ' + String(f.t).padStart(5) + 'ms  ' + String(Math.round(f.bytes / 1024)).padStart(4) +
        'KB ' + (isWhite ? '<<< 白' : '') + '  ' + f.file);
  });
  console.log('\n最长连续白帧: ' + maxWhite + ' 帧, 起于 ' + maxWhiteAt + 'ms');
  const fps = frames.length / ((Date.now() - t0) / 1000);
  console.log('平均 ' + fps.toFixed(1) + ' fps（白帧时长 ≈ 帧数/帧率）');

  await b.close();
  srv.close();
})();
