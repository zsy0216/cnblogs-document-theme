/**
 * v7.18 专项验证：不写 LS_CONFIG 时，顶栏/公告是否按「当前站点」推导。
 *
 * 做法：拦截所有请求，返回一份模仿博客园的假页面，地址设为 /myblog/p/1.html，
 * title 设为「某篇文章 - 我的博客 - 博客园」，再注入 dist/document-theme.js。
 * 这样 location.pathname 与 document.title 都受控，能确定推导结果是不是来自当前站点，
 * 而不是来自脚本里的硬编码。
 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = 'E:/Documents/WorkBuddy/2026-10-11-15-08-36/blogcn-nicen-theme/';
const BUNDLE = fs.readFileSync(ROOT + 'dist/document-theme.js', 'utf8');

const FAKE = `<!doctype html><html><head><meta charset="utf-8">
<title>某篇文章 - 我的博客 - 博客园</title></head><body>
<div id="page_begin_html"><div class="qb-nav" id="qb-nav"><div class="qb-nav-inner"></div></div></div>
<div id="main"><div id="mainContent"><div id="cnblogs_post_body">
<h1>某篇文章</h1><p>x</p><h2>一节</h2><p>x</p><h2>二节</h2><p>x</p></div></div>
<div id="sideBar"><div id="sideBarMain">
<div id="sidebar_news"><h3>公告</h3><div id="blog-news"><p>后台公告原文</p></div></div>
</div></div></div></body></html>`;

function expect(label, got, want) {
  const ok = String(got) === String(want);
  console.log(`  ${ok ? '✓' : '✗'} ${label}: ${got}${ok ? '' : '  (期望 ' + want + ')'}`);
  return ok;
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let allOk = true;

  // A. 完全不写配置
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.route('**/*', (route) => {
      const u = route.request().url();
      if (u.endsWith('/document-theme.js')) {
        return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
      }
      if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
        return route.fulfill({ status: 404, body: '' });
      }
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: FAKE });
    });
    await page.goto('https://www.cnblogs.com/myblog/p/1.html');
    await page.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
    await page.waitForTimeout(1200);

    const info = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const links = [...document.querySelectorAll('.qb-links a')].map((a) => a.textContent + '=' + a.getAttribute('href'));
      return {
        brand: (q('.qb-brand-text') || {}).textContent || '',
        brandHref: q('.qb-brand') ? q('.qb-brand').getAttribute('href') : '',
        logo: !!q('.qb-brand img'),
        links,
        notice: (q('#qb-notice') || {}).textContent || '',
        nativeHidden: q('#blog-news') ? getComputedStyle(q('#blog-news')).display : 'gone',
        hasNav: !!q('.qb-nav-inner .qb-brand'),
      };
    });

    const now = new Date();
    const ym = now.getFullYear() + '/' + (now.getMonth() + 1);
    console.log('\n[A] 无配置（LS_CONFIG 不存在）');
    allOk = expect('品牌名来自 title', info.brand, '我的博客') && allOk;
    allOk = expect('品牌链接指向本站', info.brandHref, 'https://www.cnblogs.com/myblog/') && allOk;
    allOk = expect('默认不显示头像', info.logo, false) && allOk;
    allOk = expect('菜单数量', info.links.length, 5) && allOk;
    allOk = expect('归档按月展开', info.links[1], '归档=https://www.cnblogs.com/myblog/p/archive/' + ym) && allOk;
    allOk = expect('分类', info.links[2], '分类=https://www.cnblogs.com/myblog/categories') && allOk;
    allOk = expect('标签', info.links[3], '标签=https://www.cnblogs.com/myblog/tag') && allOk;
    allOk = expect('RSS', info.links[4], 'RSS=https://www.cnblogs.com/myblog/rss') && allOk;
    allOk = expect('公告不接管（保留后台原文）', info.notice, '') && allOk;
    allOk = expect('后台公告可见', info.nativeHidden, 'block') && allOk;
    allOk = expect('不出现作者博客地址', info.links.join().includes('zhangshuaiyin'), false) && allOk;
    await ctx.close();
  }

  // B. 显式配置覆盖：brand/links/notice 应完全按配置走
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.route('**/*', (route) => {
      const u = route.request().url();
      if (u.endsWith('/document-theme.js')) {
        return route.fulfill({ contentType: 'application/javascript', body: BUNDLE });
      }
      if (u.includes('images.cnblogs.com') || u.includes('blog-static')) {
        return route.fulfill({ status: 404, body: '' });
      }
      return route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: FAKE.replace('<div id="page_begin_html">',
          `<script>window.LS_CONFIG={accent:'#3b82f6',nav:{brand:'自定义站',home:'https://example.com/',links:[{t:'甲',h:'/a'},{t:'乙',h:'/b',b:1}]},notice:{html:'<p>自定义公告</p>'}};</script><div id="page_begin_html">`),
      });
    });
    await page.goto('https://www.cnblogs.com/myblog/p/1.html');
    await page.addScriptTag({ url: 'https://www.cnblogs.com/document-theme.js' });
    await page.waitForTimeout(1200);

    const info = await page.evaluate(() => ({
      brand: (document.querySelector('.qb-brand-text') || {}).textContent || '',
      links: [...document.querySelectorAll('.qb-links a')].map((a) => a.textContent + '=' + a.getAttribute('href')),
      notice: (document.querySelector('#qb-notice') || {}).textContent || '',
      nativeHidden: document.querySelector('#blog-news') ? getComputedStyle(document.querySelector('#blog-news')).display : 'gone',
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    }));

    console.log('\n[B] 显式配置');
    allOk = expect('品牌名按配置', info.brand, '自定义站') && allOk;
    allOk = expect('links 整体替换', info.links.join('|'), '甲=/a|乙=/b') && allOk;
    allOk = expect('公告按配置', info.notice.trim(), '自定义公告') && allOk;
    allOk = expect('后台公告被隐藏', info.nativeHidden, 'none') && allOk;
    allOk = expect('强调色注入', info.accent.toLowerCase(), '#3b82f6') && allOk;
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + (allOk ? '✓ 全部通过' : '✗ 存在不符项'));
  process.exit(allOk ? 0 : 1);
})();
