/**
 * v7.24 专项验证：移动端导航抽屉 + 窄屏侧栏真正隐藏。
 *
 * 两个「线上才发现」的问题，本地必须先钉住：
 *   1) <860px 顶栏菜单 64% 藏在横滑里（实测可视 188px / 内容 517px），
 *      手机上等于没有导航 → 改为汉堡 + 右侧抽屉；
 *   2) 右栏 #sideBar 在窄屏没被隐藏（display:block !important 盖掉了后面的
 *      display:none），370×1408px 整个堆在正文下面 → 隐藏规则补 !important。
 *
 * 还要守住两条底线：
 *   · 桌面端不受影响：汉堡不出现、横滑菜单照旧；
 *   · 抽屉建好之前不许隐藏横滑菜单（脚本挂了也得有导航入口）。
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

const PARA = '这是一段用来凑字数的正文，讨论的是 ArrayList 的扩容与随机访问。'.repeat(8);
const HEADS = ['扩容原理', '随机访问', '线程安全', '迭代器', '序列化', '性能对比'];
const body = HEADS.map((t) => `<h2>${t}</h2><p>${PARA}</p>`).join('') + `<p>${PARA}</p>`;

const FAKE = `<!doctype html><html><head><meta charset="utf-8">
<title>ArrayList 深入浅出 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"></div>
<div id="main"><div id="mainContent"><div class="forFlow">
<div id="post_detail"><div id="topics"><div class="post">
<h1 class="postTitle"><a id="cb_post_title_url" href="https://www.cnblogs.com/zhangshuaiyin/p/fake.html"><span>ArrayList 深入浅出</span></a></h1>
<div class="clear"></div>
<div class="postBody">
<div id="cnblogs_post_body" class="blogpost-body cnblogs-markdown">${body}</div>
<div id="blog_post_info_block"><div id="blog_post_info"></div></div>
</div>
<div class="postDesc">posted @ <span id="post-date" data-date-updated="2021-07-23 17:15">2021-07-23 17:15</span>
<a href="https://www.cnblogs.com/zhangshuaiyin">Ep流苏</a> 阅读(<span id="post_view_count">375</span>)</div>
</div></div></div>
</div></div>
<div id="sideBar"><div id="sideBarMain"><div id="leftcontentcontainer">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>公告内容</p></div></div>
<div id="sidebar_categories"><h3>分类</h3><ul><li><a href="#">Java</a></li></ul></div>
</div></div></div></div></body></html>`;

let bad = 0;
function ck(label, ok, got) {
  if (!ok) bad++;
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + label + (ok ? '' : '  → ' + JSON.stringify(got)));
}

async function open(browser, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height: height || 844 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => { if (!/Permissions policy/i.test(e.message)) errs.push(e.message); });
  await p.route('**/*', (route) => {
    const u = route.request().url();
    if (u.endsWith('/document-theme.js')) {
      return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: FAKE });
  });
  await p.goto('https://www.cnblogs.com/zhangshuaiyin/p/fake.html', { waitUntil: 'load' });
  await p.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
  await p.waitForTimeout(900);
  return { ctx, p, errs };
}

(async () => {
  const browser = await chromium.launch();

  for (const w of [360, 390]) {
    console.log(`\n[1] ${w}px 顶栏：汉堡替换横滑`);
    const { ctx, p, errs } = await open(browser, w);
    const s = await p.evaluate(() => ({
      mnav: document.documentElement.classList.contains('qb-mnav'),
      links: getComputedStyle(document.querySelector('.qb-links')).display,
      burger: getComputedStyle(document.getElementById('qb-burger')).display,
      burgerW: Math.round(document.getElementById('qb-burger').getBoundingClientRect().width),
      deskLinks: document.querySelectorAll('.qb-links a').length,
      // 顶栏里三个按钮是否都被挤出屏幕
      actionsRight: Math.round(document.querySelector('.qb-actions').getBoundingClientRect().right),
      vw: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    ck('挂了 qb-mnav', s.mnav, s.mnav);
    ck('横滑菜单已隐藏', s.links === 'none', s.links);
    ck('汉堡按钮可见', s.burger !== 'none' && s.burgerW > 0, s.burger + '/' + s.burgerW);
    ck('菜单项都还在 DOM 里（不丢配置）', s.deskLinks >= 5, s.deskLinks);
    ck('右侧按钮没被挤出屏幕', s.actionsRight <= s.vw + 1, [s.actionsRight, s.vw]);
    ck('无横向溢出', s.overflow <= 1, s.overflow);
    ck('无 JS 报错', errs.length === 0, errs);

    console.log(`[2] ${w}px 抽屉开关`);
    await p.click('#qb-burger');
    await p.waitForTimeout(320);
    const o = await p.evaluate(() => {
      const root = document.getElementById('qb-mmenu');
      const panel = root.querySelector('.qb-mmenu-panel');
      const r = panel.getBoundingClientRect();
      return {
        open: root.classList.contains('open'),
        aria: root.getAttribute('aria-hidden'),
        expanded: document.getElementById('qb-burger').getAttribute('aria-expanded'),
        locked: document.documentElement.classList.contains('qb-mmenu-lock'),
        panelX: Math.round(r.left),
        panelW: Math.round(r.width),
        vw: document.documentElement.clientWidth,
        items: root.querySelectorAll('.qb-mmenu-list a').length,
        sameHref: (() => {
          const a = [...document.querySelectorAll('.qb-links a')].map((x) => x.getAttribute('href'));
          const b = [...root.querySelectorAll('.qb-mmenu-list a')].map((x) => x.getAttribute('href'));
          return a.length === b.length && a.every((h, i) => h === b[i]);
        })(),
        onCopied: root.querySelectorAll('.qb-mmenu-list a.on').length,
        onDesk: document.querySelectorAll('.qb-links a.on').length,
      };
    });
    ck('抽屉已打开', o.open, o.open);
    ck('aria-hidden=false', o.aria === 'false', o.aria);
    ck('按钮 aria-expanded=true', o.expanded === 'true', o.expanded);
    ck('背景已锁滚动', o.locked, o.locked);
    ck('抽屉从右侧滑入并贴合边缘', o.panelX + o.panelW >= o.vw - 1, [o.panelX, o.panelW, o.vw]);
    ck('条目数与桌面一致', o.items > 0 && o.items === s.deskLinks, [o.items, s.deskLinks]);
    ck('链接顺序与原菜单一致', o.sameHref, o.sameHref);
    ck('高亮状态与桌面一致', o.onCopied === o.onDesk, [o.onCopied, o.onDesk]);
    await p.screenshot({ path: ROOT + `_tmp_v724_drawer_${w}.png` });

    await p.click('.qb-mmenu-mask', { position: { x: 20, y: 400 } });
    await p.waitForTimeout(320);
    const c1 = await p.evaluate(() => ({
      open: document.getElementById('qb-mmenu').classList.contains('open'),
      locked: document.documentElement.classList.contains('qb-mmenu-lock'),
      scrollable: getComputedStyle(document.documentElement).overflow,
    }));
    ck('点遮罩关闭', !c1.open, c1.open);
    ck('滚动锁已解除', !c1.locked, c1.locked);
    ck('解锁后页面可滚动', c1.scrollable !== 'hidden', c1.scrollable);

    await p.click('#qb-burger');
    await p.waitForTimeout(280);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(280);
    const c2 = await p.evaluate(() => document.getElementById('qb-mmenu').classList.contains('open'));
    ck('Esc 关闭', !c2, c2);

    console.log(`[3] ${w}px 侧栏/目录`);
    const d = await p.evaluate(() => {
      const disp = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e).display : '-'; };
      const h = () => {
        const e = document.getElementById('sideBar');
        return e ? Math.round(e.getBoundingClientRect().height) : 0;
      };
      return {
        sideBar: disp('sideBar'),
        sideBarMain: disp('sideBarMain'),
        sideBarH: h(),
        left: disp('qb-left'),
        fab: (() => { const f = document.getElementById('qb-mtoc-fab'); return f ? getComputedStyle(f).display : '-'; })(),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    ck('#sideBar 已隐藏', d.sideBar === 'none', d.sideBar);
    ck('#sideBarMain 已隐藏', d.sideBarMain === 'none', d.sideBarMain);
    ck('侧栏不再占据纵向空间', d.sideBarH === 0, d.sideBarH);
    ck('#qb-left 已隐藏', d.left === 'none', d.left);
    ck('目录悬浮按钮仍在', d.fab === 'flex', d.fab);
    ck('整页仍无横向溢出', d.overflow <= 1, d.overflow);
    await p.screenshot({ path: ROOT + `_tmp_v724_${w}.png` });
    await ctx.close();
  }

  console.log('\n[4] 1440px 桌面回归');
  {
    const { ctx, p, errs } = await open(browser, 1440, 900);
    const s = await p.evaluate(() => ({
      burger: getComputedStyle(document.getElementById('qb-burger')).display,
      links: getComputedStyle(document.querySelector('.qb-links')).display,
      linksVisible: Math.round(document.querySelector('.qb-links').getBoundingClientRect().width),
      mmenu: getComputedStyle(document.getElementById('qb-mmenu')).visibility,
      sideBar: getComputedStyle(document.getElementById('sideBar')).display,
      sideW: (() => {
        const e = document.getElementById('leftcontentcontainer');
        return e ? Math.round(e.getBoundingClientRect().width) : 0;
      })(),
      tocItems: document.querySelectorAll('#qb-left .qb-toc-list a').length,
    }));
    ck('汉堡在桌面隐藏', s.burger === 'none', s.burger);
    ck('横滑菜单在桌面显示', s.links !== 'none', s.links);
    ck('菜单有实际宽度', s.linksVisible > 200, s.linksVisible);
    ck('抽屉在桌面不可见', s.mmenu === 'hidden', s.mmenu);
    ck('桌面侧栏内容正常显示', s.sideBar !== 'none' && s.sideW > 150, [s.sideBar, s.sideW]);
    ck('桌面目录正常', s.tocItems > 0, s.tocItems);
    ck('无 JS 报错', errs.length === 0, errs);
    await ctx.close();
  }

  console.log('\n[5] 脚本未跑时不能丢导航（无 qb-mnav）');
  {
    // 只加载样式不加载脚本时，横滑菜单必须仍然可用
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.route('**/*', (route) => {
      const u = route.request().url();
      if (u.includes('images.cnblogs.com')) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: FAKE });
    });
    await p.goto('https://www.cnblogs.com/zhangshuaiyin/p/fake.html', { waitUntil: 'load' });
    await p.waitForTimeout(300);
    const s = await p.evaluate(() => ({
      mnav: document.documentElement.classList.contains('qb-mnav'),
      burger: !!document.getElementById('qb-burger'),
    }));
    ck('没有 qb-mnav 类', !s.mnav, s.mnav);
    ck('没有汉堡按钮', !s.burger, s.burger);
    await ctx.close();
  }

  await browser.close();
  console.log(bad ? `\n✗ ${bad} 项不通过` : '\n✓ 移动端导航与侧栏全部通过');
  process.exit(bad ? 1 : 0);
})();
