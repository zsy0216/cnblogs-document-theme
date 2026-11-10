/* 切页过程中，视口顶部的关键元素是否位移。
   跨文档导航会销毁旧文档，所以每帧采样写进 sessionStorage（同源同 tab 保留），
   最后在新文档里汇总。

   用法：NOGATE=1 VT=1 node _dev-tools/probe-navmove.js
*/
const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FROM = 'https://www.cnblogs.com/zhangshuaiyin/p/23587183';
const TO = 'https://www.cnblogs.com/zhangshuaiyin/';
const BUNDLE = fs.readFileSync(path.join(ROOT, 'dist', 'document-theme.js'), 'utf8');
const HEAD = fs.readFileSync(path.join(ROOT, 'dist', 'paste', 'hosted', '1-页首.html'), 'utf8');
const CSS_FIELD = fs.readFileSync(path.join(ROOT, 'dist', 'paste', 'hosted', '4-样式.css'), 'utf8');

const NOGATE = process.env.NOGATE === '1';
const VT = process.env.VT === '1';

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
if (NOGATE) css = css.replace(/html:not\(\.qb-ready\) body\{[^}]*\}/, '/* gate off */');
if (VT) css += `
@view-transition { navigation: auto; }
.qb-nav { view-transition-name: qb-nav; }
`;
function build(raw) {
  let doc = swapBegin(raw, HEAD);
  doc = doc.replace(/<script>([\s\S]*?)<\/script>/g, (m, body) =>
    body.length > 8000 ? '<!-- removed -->' : m);
  return doc.replace(/<\/head>/i, '<style id="field-css">' + css + '</style></head>');
}

const INIT = `(function(){
  if (!sessionStorage.getItem('__mv')) sessionStorage.setItem('__mv','[]');
  var t0 = Date.now();
  var base = +sessionStorage.getItem('__mvT0') || 0;
  if (!base) { base = t0; sessionStorage.setItem('__mvT0', String(base)); }
  var last = '';
  function tick(){
    if (!document.body) return requestAnimationFrame(tick);
    var nav = document.querySelector('.qb-nav');
    var mc  = document.getElementById('mainContent');
    var lf  = document.getElementById('qb-left');
    var rt  = document.getElementById('sideBarMain');
    var R = function(el){ if(!el) return -1; return Math.round(el.getBoundingClientRect().top); };
    var H = function(el){ if(!el) return -1; return Math.round(el.getBoundingClientRect().height); };
    var op = getComputedStyle(document.body).opacity;
    var key = [op, R(nav), R(mc), H(lf), H(rt), document.documentElement.scrollHeight,
               document.documentElement.clientWidth].join('|');
    if (key !== last) {
      last = key;
      var arr = JSON.parse(sessionStorage.getItem('__mv'));
      arr.push({ t: Date.now()-base, u: location.pathname.slice(0,22), op: op,
                 navTop: R(nav), navH: H(nav), mcTop: R(mc),
                 leftH: H(lf), rightH: H(rt),
                 sh: document.documentElement.scrollHeight,
                 cw: document.documentElement.clientWidth });
      sessionStorage.setItem('__mv', JSON.stringify(arr));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();`;

(async () => {
  const b = await chromium.launch({
    args: ['--disable-web-security', '--disable-features=BlockInsecurePrivateNetworkRequests'],
  });
  const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  await p.addInitScript(INIT);
  const PORT = 8952;
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
    return h === FROM || h === TO || h === TO.replace(/\/$/, '');
  }, route => {
    const h = route.request().url().split('#')[0].split('?')[0];
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
      body: (h.indexOf('/p/') >= 0) ? docs[FROM] : docs[TO] });
  });
  await p.route(u => u.href.indexOf('custom.css') >= 0, route =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await p.goto(FROM, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { sessionStorage.setItem('__mv', '[]'); sessionStorage.removeItem('__mvT0'); });

  const link = await p.$('a[href="https://www.cnblogs.com/zhangshuaiyin/"], a[href="/zhangshuaiyin/"]');
  const t = Date.now();
  await link.click({ noWaitAfter: true }).catch(() => {});
  await p.waitForTimeout(4000);

  const mv = await p.evaluate(() => JSON.parse(sessionStorage.getItem('__mv') || '[]'));
  console.log('模式: NOGATE=' + (NOGATE ? 1 : 0) + ' VT=' + (VT ? 1 : 0) + '  采样 ' + mv.length + ' 条');
  console.log('\n    Δt  op  navTop navH  mcTop leftH rightH  页高  视宽  路径');
  mv.forEach(e => console.log(
    String(e.t).padStart(6) + '  ' + String(e.op).padEnd(4) +
    String(e.navTop).padStart(6) + String(e.navH).padStart(5) +
    String(e.mcTop).padStart(7) + String(e.leftH).padStart(6) + String(e.rightH).padStart(7) +
    String(e.sh).padStart(6) + String(e.cw).padStart(6) + '  ' + e.u));

  const navs = mv.map(e => e.navTop);
  const mcs = mv.map(e => e.mcTop);
  console.log('\nnavTop 取值集合: ' + [...new Set(navs)].join('/') +
    ' | mcTop 取值集合: ' + [...new Set(mcs)].join('/'));
  console.log('视宽取值集合: ' + [...new Set(mv.map(e => e.cw))].join('/'));

  await b.close(); srv.close();
})();
