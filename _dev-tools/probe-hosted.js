/* 测「全托管」形态首帧。
   页首字段只贴 2.6KB（含内联闸门 + 配置 + document.write 加载器），
   CSS 与逻辑全在 document-theme.js 里。
   本次要测的 js 由本地 http 服务提供（可延迟，模拟 CDN 慢）。

   用法：
     node _dev-tools/probe-hosted.js              正常延迟
     node _dev-tools/probe-hosted.js 800          js 延迟 800ms
     HEADGATE=1 node _dev-tools/probe-hosted.js   闸门放 head（模拟"贴到 CSS 字段"）
     URL=... node _dev-tools/probe-hosted.js      换页面
*/
const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const URL_PAGE = process.env.URL || 'https://www.cnblogs.com/zhangshuaiyin/p/23587183';
const DELAY = Number(process.argv[2] || 0);
const BUNDLE = fs.readFileSync(path.join(ROOT, 'dist', 'document-theme.js'), 'utf8');
const HEAD = fs.readFileSync(path.join(ROOT, 'dist', 'paste', 'hosted', '1-页首.html'), 'utf8');
// 闸门就在 dist/paste/hosted/4-样式.css 里（贴到「页面定制 CSS 代码」字段的内容）
const CSS_FIELD = fs.readFileSync(path.join(ROOT, 'dist', 'paste', 'hosted', '4-样式.css'), 'utf8');

/* <div> 开闭配对找 page_begin_html 的结束位。
   ⚠ 必须跳过注释 / <script> / <style> 的内容：博客园页首字段的注释里常出现
   「<div>」「a 标签」这类字样，纯字符串计数会多算并返回 -1，
   slice(-1) 直接砍掉整页 —— 表现为「页面只剩一个顶栏、所有 id 都不存在」。
   2026-11-10 踩过两次。 */
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
  if (s < 0) throw new Error('没找到 page_begin_html');
  const e = endOfDiv(raw, s);
  if (e < 0) throw new Error('page_begin_html 边界配对失败');
  return raw.slice(0, s) + '<div id="page_begin_html">' + headHtml + '</div>' + raw.slice(e);
}

const INIT = `(function(){
  window.__P=[];
  function snap(tag){
    var b=document.body; if(!b) return;
    var nav=document.querySelector('.qb-nav');
    var left=document.getElementById('qb-left');
    var right=document.getElementById('sideBarMain');
    var main=document.getElementById('main');
    var cs=null; try{cs=getComputedStyle(b);}catch(e){}
    window.__P.push({t:Math.round(performance.now()),tag:tag,
      op:cs?cs.opacity:'?',
      navH:nav?Math.round(nav.getBoundingClientRect().height):-1,
      leftH:left?Math.round(left.getBoundingClientRect().height):-1,
      rightH:right?Math.round(right.getBoundingClientRect().height):-1,
      rightKids:right?right.children.length:-1,
      cols:main?getComputedStyle(main).gridTemplateColumns:'-',
      rs:document.readyState});
  }
  var last='';
  function loop(){
    if(!document.body){requestAnimationFrame(loop);return;}
    var nav=document.querySelector('.qb-nav');
    var left=document.getElementById('qb-left');
    var right=document.getElementById('sideBarMain');
    var cs=null; try{cs=getComputedStyle(document.body);}catch(e){}
    var key=[cs?cs.opacity:'?', nav?Math.round(nav.getBoundingClientRect().height):-1,
             left?Math.round(left.getBoundingClientRect().height):-1,
             right?Math.round(right.getBoundingClientRect().height):-1].join('|');
    if(key!==last){last=key;snap('mut');}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){
    window.__P.push({t:Math.round(e.startTime),tag:'paint:'+e.name});});
  }).observe({type:'paint',buffered:true});}catch(e){}
})();`;

(async () => {
  // loopback 请求会被 Chromium 的私有网络访问策略拦掉（CORS），
  // 放开 web security 才能让 CNBlogs 页面去取 127.0.0.1 的 js。
  const b = await chromium.launch({ args: ['--disable-web-security', '--disable-features=BlockInsecurePrivateNetworkRequests'] });
  const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  p.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.addInitScript(INIT);

  const raw = await (await p.request.get(URL_PAGE)).text();

  let head = HEAD;
  let restyle = '';
  if (process.env.HEADGATE === '1') {
    head = head.replace(/<!-- 首帧闸门[\s\S]*?<\/style>\s*/, '<!-- 闸门已移到 head（模拟贴到 CSS 字段） -->\n');
    restyle = '<style>' + CSS_FIELD + '</style>';
  }
  let doc = swapBegin(raw, head);

  /* 线上页脚字段里还留着旧版内联脚本（实测 26KB，会建 #qb-right、注入旧 CSS）。
     测托管形态必须把它摘掉，否则新旧两版同时跑，数据全失真：
     dump 出来的右栏里会同时有 #qb-right（旧）和 #qb-left（新）。
     判断：内联 <script> 正文超过 8KB 的就是主题脚本。 */
  let removed = 0;
  doc = doc.replace(/<script>([\s\S]*?)<\/script>/g, (m, body) => {
    if (body.length > 8000) { removed += 1; return '<!-- 已移除旧版内联主题脚本 -->'; }
    return m;
  });
  if (removed) console.log('已移除页脚旧脚本 ' + removed + ' 段');

  if (restyle) doc = doc.replace(/<\/head>/i, restyle + '</head>');

  const PORT = 8941;
  const srv = http.createServer((req, res) => {
    const done = () => {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(BUNDLE);
    };
    if (DELAY > 0) setTimeout(done, DELAY); else done();
  });
  await new Promise(r => srv.listen(PORT, r));

  // js 地址换成本地服务：用字符串切分，避免正则转义出错
  doc = doc.split('https://blog-static.cnblogs.com/files/blogs/477677/document-theme.js')
           .join('http://127.0.0.1:' + PORT + '/dt.js');

  // 只拦文档本身。不要全局拦 **/*，否则侧栏 XHR 全部过代理层，右栏永远填不满。
  await p.route(u => u.href.indexOf(URL_PAGE) === 0, route =>
    route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: doc }));
  // 线上 CSS 字段里那份旧样式也屏蔽掉（hosted 形态要求该字段为空）
  await p.route(u => u.href.indexOf('custom.css') >= 0, route =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '/* 旧 CSS 已屏蔽 */' }));

  // commit：只等导航提交，不等资源。首页有会长时间挂着的第三方脚本，
  // 等 load / domcontentloaded 都会超时，超时后再采样拿到的是被中断的页面。
  await p.goto(URL_PAGE, { waitUntil: 'commit', timeout: 60000 }).catch(e => console.log('[goto] ' + e.message.split('\n')[0]));
  await p.waitForTimeout(3500);

  const ev = await p.evaluate(() => window.__P);
  console.log('延迟 ' + DELAY + 'ms · HEADGATE=' + (process.env.HEADGATE || '0') + ' · ' + URL_PAGE);
  let first = null;
  ev.forEach(e => {
    console.log('  ' + String(e.t).padStart(5) + 'ms  ' + (e.tag || '').padEnd(14) +
      ' op=' + String(e.op).padEnd(4) +
      ' nav=' + String(e.navH).padStart(4) +
      ' left=' + String(e.leftH).padStart(5) +
      ' right=' + String(e.rightH).padStart(5) + '/' + String(e.rightKids).padStart(2) + '子' +
      ' cols=' + (e.cols === '-' ? '-' : '三栏'));
    if (e.op === '1' && !first) first = e;
  });

  const dump = await p.evaluate(() => {
    const sb = document.getElementById('sideBarMain');
    if (!sb) return '无 sideBarMain';
    return [...sb.children].map(c => {
      const r = c.getBoundingClientRect();
      return (c.id || c.className) + '[' + Math.round(r.width) + 'x' + Math.round(r.height) + ']';
    }).join(' ');
  });
  console.log('右栏子项: ' + dump);

  const res = await p.evaluate(() => ({
    styles: [...document.querySelectorAll('style')].map(x => (x.textContent || '').length),
    links: [...document.querySelectorAll('link[rel=stylesheet]')].map(x => x.getAttribute('href')),
    hasLeftRule: [...document.querySelectorAll('style')].some(x => x.textContent.indexOf('#qb-left') >= 0),
    hasOldContents: [...document.querySelectorAll('style')].some(x => x.textContent.indexOf('#sideBar,#sideBarMain') >= 0)
  }));
  console.log('style 段: ' + res.styles.join(',') + ' | 已加载 CSS: ' + res.links.join(' ') +
    ' | 含 #qb-left 规则: ' + res.hasLeftRule + ' | 含旧 display:contents: ' + res.hasOldContents);

  if (first) console.log('\n>>> 可见那一帧：' + first.t + 'ms  nav=' + first.navH +
    ' left=' + first.leftH + ' right=' + first.rightH + '/' + first.rightKids + '子');
  else console.log('\n>>> 采样期内从未可见');

  await b.close();
  srv.close();
})();
