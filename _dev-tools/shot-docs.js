/**
 * 截取 README / 文档用的效果图（线上真实页面 + 本地构建产物）。
 *
 *   node _dev-tools/shot-docs.js
 *
 * 输出到 docs/images/：
 *   home-v7.png         首页浅色（三栏 + 顶部分类筛选条）
 *   post-v7.png         文章页浅色（左栏 H1–H4 目录 + 标题下分类标签）
 *   home-v7-dark.png    首页暗色
 *   mobile-v7.png       手机列表（390px，裁到两条卡片：780x1360）
 *   mobile-menu-v7.png  手机导航抽屉（同上，展开态，同样裁到 780x1360 与列表等高）
 *
 * 为什么不用线上现成那份 js / CSS：
 *   线上「页面定制 CSS」字段与兜底 js 往往落后于仓库（发版要手工贴字段、上传文件），
 *   直接截会拍到上一版的样子。这里把 jsdelivr 请求拦下来换成本地 dist/document-theme.js，
 *   再补一份本地 theme-v7.min.css —— 截图反映的是**当前工作区**的样子。
 *   合并包检测到 CSS 字段已就位（html{--qb-field:1}）会跳过样式注入，所以补 CSS 这步不能省。
 *
 * 等 html.qb-ready（首帧闸门放行）再截，否则可能拍到半成品。
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'images');
const SITE = 'https://www.cnblogs.com/zhangshuaiyin/';
const BUNDLE = fs.readFileSync(path.join(ROOT, 'dist', 'document-theme.js'), 'utf8');
const CSS = path.join(ROOT, 'css', 'theme-v7.min.css');

async function routeLocalBundle(page) {
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (/jsdelivr\.net.*document-theme\.js/.test(u)) {
      return r.fulfill({ contentType: 'application/javascript', body: BUNDLE });
    }
    /* 兜底源（博客园文件空间）版本更旧，让它 404，免得走兜底拿到旧包 */
    if (u.includes('blog-static.cnblogs.com')) return r.fulfill({ status: 404, body: '' });
    return r.continue();
  });
}

async function ready(page) {
  try {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('qb-ready'),
      null,
      { timeout: 9000 }
    );
  } catch (e) {
    console.warn('  ! 未等到 qb-ready，按当前状态截图');
  }
  await page.addStyleTag({ path: CSS });
  // 右栏卡片是 XHR 异步填的，再给一点稳定时间
  await page.waitForTimeout(900);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  /* ---------- 桌面 ---------- */
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'zh-CN',
  });
  const p = await ctx.newPage();
  await routeLocalBundle(p);

  console.log('打开首页 …');
  await p.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await ready(p);
  await p.screenshot({ path: path.join(OUT, 'home-v7.png') });
  console.log('  ✓ home-v7.png');

  const postUrl = await p.evaluate(() => {
    const a = document.querySelector('#mainContent .postTitle a, .postTitle a');
    return a ? a.href : null;
  });
  if (!postUrl) throw new Error('首页没找到文章链接');

  console.log('打开文章页 …', postUrl);
  await p.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await ready(p);
  await p.screenshot({ path: path.join(OUT, 'post-v7.png') });
  console.log('  ✓ post-v7.png');

  console.log('切暗色 …');
  await p.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await ready(p);
  await p.evaluate(() => {
    const btn = document.querySelector('#qb-dark-toggle, .qb-dark-toggle');
    if (btn) btn.click();
    else document.body.classList.add('qb-dark');
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, 'home-v7-dark.png') });
  console.log('  ✓ home-v7-dark.png');
  await ctx.close();

  /* ---------- 手机 ---------- */
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'zh-CN',
  });
  const m = await mctx.newPage();
  await routeLocalBundle(m);
  await m.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await ready(m);

  /* 只截「能说清这件事」的高度（2026-11-18：README / 文章里这两张竖着太占位）。
     视口仍是 390x844 的真实手机尺寸 —— 布局、断点、行宽都不变，只把下面用不上的部分裁掉：
       · 列表 680 CSS px：筛选条 + 两条完整卡片，正好停在第二条卡片下边界；
       · 抽屉同样 680：菜单「管理」在 y≈470 结束，再往下是整屏白底（原图有 40% 是这个）。
     两张等高（780x1360）才好并排 —— 等高比「裁到最紧」重要，差一截会显得散。
     宽高比从 2.16 降到 1.74。
     改这两个数之前先量一下：列表页第二条卡片的下边界在 CSS y≈680。 */
  const CLIP_LIST = { x: 0, y: 0, width: 390, height: 680 };
  const CLIP_MENU = { x: 0, y: 0, width: 390, height: 680 };

  await m.screenshot({ path: path.join(OUT, 'mobile-v7.png'), clip: CLIP_LIST });
  console.log('  ✓ mobile-v7.png');

  await m.evaluate(() => {
    const btn = document.getElementById('qb-burger');
    if (btn) btn.click();
  });
  await m.waitForTimeout(500);
  await m.screenshot({ path: path.join(OUT, 'mobile-menu-v7.png'), clip: CLIP_MENU });
  console.log('  ✓ mobile-menu-v7.png');
  await mctx.close();

  await browser.close();
  console.log('完成，输出目录：docs/images/');
})().catch((e) => {
  console.error('截图失败：', e.message);
  process.exit(1);
});
