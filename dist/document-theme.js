/* 流苏主题 v7.34 · 2026-11-18 · document-theme.js 合并版（样式 + 脚本，托管分发用）
   由 _dev-tools/gen-bundle.py 生成，不要直接编辑。
   来源：css/theme-v7.min.css（54759 B） + snippets/footer-script-v7.min.html（67591 B）
   用法：先可选地赋值 window.LS_CONFIG，再引入本文件，例如
     window.LS_CONFIG = { accent: "#d05ce8", dark: "auto" };
   内联粘贴版（两个后台字段）与本文件共用同一份源码，行为一致。 */
(function () {
  /* 只负责把样式送进文档，不解锁首帧闸门（qb-ready）。
     解锁时机由页脚逻辑的 unlock() 统一决定：顶栏、目录、右栏、公告全部就位之后。
     早先这里顺手加 qb-ready，实测会让闸门在 529ms 就打开（结构 613ms 才齐），
     于是又出现「正文先到、右栏半秒后补」的闪动。 */
  /* 优先认「页面定制 CSS 代码」字段里的标记：
       --qb-field:1 = 完整样式就在字段里（内联/混合版）→ 直接不用管；
       --qb-field:2 = 字段只放了闸门，样式在页首写的那个 <link> 里（v7.31 起）。 */
  var f = getComputedStyle(document.documentElement).getPropertyValue("--qb-field");
  f = f ? f.trim() : "";
  if (f === "1") return;
  /* 外链模式：页首在失败时会把 __qbCssDead 置 1（已换备源）或 2（两个源全挂）。
     只有在确认全挂时才自己补一份内嵌样式；还在下载中就等它，不要重复塞 54KB。 */
  if (f === "2" && window.__qbCssDead !== 2) return;
  /* 老页首没写标记时，也认一下 <link> 是否已加载成功。 */
  var l = document.querySelector('link[href*="theme-v7.min.css"]');
  if (l && l.sheet) return;
  if (document.getElementById("qb-theme-style")) return;
  var st = document.createElement("style");
  st.id = "qb-theme-style";
  st.textContent = "/* 流苏主题 v7.34 · 2026-11-18 · 压缩版，源码见 theme-v7.css */\n@view-transition{navigation:auto}.qb-nav{view-transition-name:qb-nav}::view-transition-group(qb-nav){animation-duration:.18s}::view-transition-old(qb-nav),::view-transition-new(qb-nav){animation:none;opacity:1}::view-transition-old(root){animation:none;opacity:1}::view-transition-new(root){animation:qb-vt-in .16s ease-out both}@keyframes qb-vt-in{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion: reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation-duration:0s !important}}:root{--bg:#f4f5f7;--card:#fff;--line:#ecedf0;--ink:#1f2329;--body:#3f4753;--meta:#9aa5b1;--accent:#d05ce8;--accent-soft:rgba(208, 92, 232, .10);--accent-deep:#b843d0;--radius:12px;--radius-sm:8px;--shadow:0 1px 3px rgba(16, 24, 40, .04),0 6px 18px rgba(16, 24, 40, .05);--shadow-hover:0 4px 10px rgba(16, 24, 40, .08),0 12px 28px rgba(16, 24, 40, .08);--font:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",Roboto,sans-serif;--code-bg:#f3f4f6;--code-ink:#cf222e;--pre-bg:#161b22;--pre-ink:#e6edf3;--pre-line:#30363d;--pre-num:#7d8590;--pre-hover:#1c2129;--num:#c3c9d2}html.qb-dark,body.qb-dark{--bg:#0d1117;--card:#161b22;--line:#30363d;--ink:#e6edf3;--body:#c9d1d9;--meta:#8b949e;--accent:#58a6ff;--accent-soft:rgba(56, 139, 253, .15);--accent-deep:#79c0ff;--shadow:0 1px 3px rgba(1, 4, 9, .6),0 6px 18px rgba(1, 4, 9, .45);--shadow-hover:0 4px 10px rgba(1, 4, 9, .7),0 12px 28px rgba(1, 4, 9, .55);--code-bg:rgba(110, 118, 129, .4);--code-ink:#e6edf3;--pre-bg:#161b22;--pre-ink:#e6edf3;--pre-line:#30363d;--num:#6e7681;color-scheme:dark}html,body{background:var(--bg) !important;font-family:var(--font) !important;color:var(--body);font-size:14px;line-height:1.75;margin:0 !important;padding:0 !important;-webkit-font-smoothing:antialiased}html{scroll-padding-top:74px}@media (min-width: 1024px){html{overflow-y:scroll;scrollbar-gutter:stable}}#home{background:transparent !important}a{text-decoration:none;transition:color .18s ease}#top_nav{display:none !important}body.has-navbar{padding-top:0 !important;margin-top:0 !important}#header{display:none !important}#cnblogs_c1,#cnblogs_c2,#ad_t2,#under_post_news,#under_post_kb,#under_post_card1,#under_post_card2,#under_post_card3,#comment_cache,#right_zhbs,#blog_post_info_block,#green_channel{display:none !important}#qb-dark-toggle,.qb-dark-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:var(--body);font-size:16px;cursor:pointer;transition:background .2s ease,color .2s ease}#qb-dark-toggle:hover,.qb-dark-btn:hover{background:var(--accent-soft);color:var(--accent-deep)}body.qb-dark #qb-dark-toggle,body.qb-dark .qb-dark-btn{color:var(--accent-deep)}body.qb-dark #qb-dark-toggle:hover,body.qb-dark .qb-dark-btn:hover{background:var(--accent-soft)}.qb-actions{display:flex;align-items:center;gap:2px;flex:0 0 auto}.qb-theme{position:relative;display:flex;align-items:center;flex:0 0 auto}.qb-theme-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:0;border-radius:50%;background:none;color:var(--body);cursor:pointer;transition:background .2s ease,color .2s ease}.qb-theme-btn svg{width:18px;height:18px;display:block}.qb-theme-btn:hover,.qb-theme-btn[aria-expanded=\"true\"]{background:var(--accent-soft);color:var(--accent-deep)}body.qb-dark .qb-theme-btn{color:var(--accent-deep)}.qb-theme-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.qb-theme-pop{position:absolute;top:calc(100% + 13px);right:0;z-index:1000;display:flex;align-items:center;gap:9px;padding:10px 12px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-hover)}.qb-theme-pop[hidden]{display:none}.qb-theme-dot{width:20px;height:20px;padding:0;border:0;border-radius:50%;background:var(--d);box-shadow:inset 0 0 0 1px rgba(15, 23, 42, .12);cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}body.qb-dark .qb-theme-dot{background:var(--d2);box-shadow:inset 0 0 0 1px rgba(255, 255, 255, .16)}.qb-theme-dot:hover{transform:scale(1.14)}.qb-theme-dot.on{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--d)}body.qb-dark .qb-theme-dot.on{box-shadow:0 0 0 2px var(--card),0 0 0 4px var(--d2)}.qb-theme-dot:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.qb-nav{position:sticky;top:0;z-index:999;background:var(--card);border-bottom:1px solid var(--line);min-height:58px}.qb-nav-inner{max-width:1320px;margin:0 auto;height:58px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box}.qb-brand{display:inline-flex;align-items:center;gap:9px;flex:0 0 auto;font-size:17px;font-weight:700;color:var(--ink);letter-spacing:.01em;white-space:nowrap}.qb-brand:hover{color:var(--accent-deep)}.qb-logo{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;flex:0 0 30px}.qb-logo svg{width:100%;height:100%;display:block}.qb-logo img{width:100%;height:100%;object-fit:contain;display:block;border-radius:6px;box-shadow:0 0 0 1px rgba(15, 23, 42, .08)}body.qb-dark .qb-logo img{box-shadow:0 0 0 1px rgba(255, 255, 255, .14)}.qb-logo .qb-logo-dot{fill:#ff5f3d}body.qb-dark .qb-logo .qb-logo-dot{fill:#ff7a5c}.qb-links{display:flex;align-items:center;gap:4px}.qb-links a{font-size:14px;font-weight:500;color:var(--body);padding:6px 12px;border-radius:8px;white-space:nowrap}.qb-links a:hover{background:var(--accent-soft);color:var(--accent-deep)}.qb-links a.on{background:var(--accent-soft);color:var(--accent-deep);font-weight:600}#main{display:grid !important;grid-template-columns:260px minmax(0, 1fr) 292px;gap:22px;align-items:start;max-width:1360px;margin:0 auto;padding:24px 24px 8px;box-sizing:border-box;float:none !important;width:auto !important}@media screen and (min-width: 1221px){#main:has(#post_detail){grid-template-columns:224px minmax(0, 1fr) 256px;gap:20px}}#sideBar{display:contents !important}#sideBarMain{grid-column:3;grid-row:1;display:flex;flex-direction:column;gap:16px;min-width:0;width:auto !important;float:none !important;margin:0 !important;padding:0 !important;background:none !important;border:0 !important}#mainContent{grid-column:2;grid-row:1;min-width:0;width:auto !important;float:none !important;margin:0 !important;padding:0 !important}#qb-left{grid-column:1;grid-row:1;min-width:0;display:flex;flex-direction:column;gap:16px;position:sticky;top:74px;max-height:calc(100vh - 96px);overflow-y:auto;overflow-x:hidden;padding-right:2px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}#qb-left::-webkit-scrollbar{width:4px}#qb-left::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px}#leftcontentcontainer{display:flex;flex-direction:column;gap:16px;min-width:0;width:auto !important;float:none !important;margin:0 !important;padding:0 !important;position:static;max-height:none;overflow:visible}#sidebar_news{min-width:0}#sidebar_recentposts,#sidebar_shortcut,#sidebar_toptags,#sidebar_categories{display:none !important}#blog-calendar{display:none !important}html.qb-arc-page #mainContent .entrylist{visibility:hidden;animation:qb-arc-unlock 0s linear 3s forwards}@keyframes qb-arc-unlock{to{visibility:visible}}.qb-archive{animation:qb-fade-in .18s ease-out both}#blog-sidecolumn,#sidebar_news,#blog-calendar,#post_detail,#blog-comments-placeholder,.commentform,.day{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box}.qb-catbar{display:flex;align-items:center;gap:4px;margin:0 0 14px;padding:9px 12px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch}.qb-catbar::-webkit-scrollbar{display:none}.qb-catbar a{flex:none;padding:4px 11px;border-radius:20px;background:var(--bg);font-size:12.5px;line-height:1.5;color:var(--body) !important;text-decoration:none;white-space:nowrap}.qb-catbar a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.qb-catbar a.on{background:var(--accent-soft);color:var(--accent-deep) !important;font-weight:600}.qb-catbar.qb-fade-r{-webkit-mask-image:linear-gradient(to right, #000 calc(100% - 26px),transparent);mask-image:linear-gradient(to right, #000 calc(100% - 26px),transparent)}#blog-sidecolumn{animation:qb-fade-in .16s ease-out both}#blog-sidecolumn{display:flex;flex-direction:column;gap:16px;padding:0;background:none !important;border:0 !important;box-shadow:none !important}#blog-sidecolumn>div{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:16px 16px 14px}#blog-sidecolumn h3,#sidebar_news h3,#blog-calendar h3,.catListTitle{font-size:13px !important;font-weight:600 !important;color:var(--ink) !important;letter-spacing:.02em;margin:0 0 12px !important;padding:0 0 10px !important;border-bottom:1px solid var(--line) !important;background:none !important}#blog-sidecolumn ul{list-style:none;margin:0;padding:0}.qb-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:15px 14px 12px;box-sizing:border-box;flex:0 0 auto}@keyframes qb-panel-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}@keyframes qb-fade-in{from{opacity:0}to{opacity:1}}.qb-panel{animation:qb-panel-in .16s ease-out both}#sideBarMain{animation:qb-fade-in .18s ease-out both}.qb-panel-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px;padding:0 3px 10px;border-bottom:1px solid var(--line);font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}.qb-panel-hd .qb-panel-title{flex:1 1 auto}.qb-panel-hd .qb-count{flex:0 0 auto;font-size:11.5px;font-weight:400;color:var(--meta);letter-spacing:0}.qb-toc-list{list-style:none;margin:0;padding:0 3px 0 0;counter-reset:qbtoc}.qb-toc-list li{margin:0;counter-increment:qbtoc}.qb-toc-list a{position:relative;display:block;padding:6px 8px 6px 32px;border-radius:6px;font-size:13px;line-height:1.55;color:var(--body) !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background .16s ease,color .16s ease}.qb-toc-list a::before{content:counter(qbtoc) \".\";position:absolute;left:2px;top:6px;width:24px;text-align:right;color:var(--num);font-weight:600;font-size:12px;font-variant-numeric:tabular-nums}.qb-toc-list a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.qb-toc-list a:hover::before{color:var(--accent)}.qb-toc-list a.on{background:var(--accent-soft);color:var(--accent-deep) !important;font-weight:600}.qb-toc-list a.on::before{color:var(--accent)}.qb-toc-list .qb-lv3 a{padding-left:42px;font-size:12.5px}.qb-toc-list .qb-lv4 a{padding-left:52px;font-size:12.5px;color:var(--meta) !important}.qb-toc-list .qb-lv3 a::before{left:12px;width:24px;font-size:11.5px;color:var(--num)}.qb-toc-list .qb-lv4 a::before{left:22px;width:24px;font-size:11px;color:var(--num)}.qb-toc-list .qb-lv2 a{padding-left:32px}.qb-toc-list li.qb-nonum a{padding-left:10px}.qb-toc-list li.qb-nonum a::before{content:none}.qb-toc-list li.qb-nonum.qb-lv3 a{padding-left:20px}.qb-toc-list li.qb-nonum.qb-lv4 a{padding-left:30px}.qb-toc-list.qb-scroll{-webkit-mask-image:linear-gradient(to bottom, #000 calc(100% - 18px),transparent 100%);mask-image:linear-gradient(to bottom, #000 calc(100% - 18px),transparent 100%)}#sidebar_categories{position:static;display:flex;flex-direction:column;max-height:none;overflow:visible}#sidebar_categories .catListTitle{font-size:0 !important;display:flex;align-items:center;gap:7px;flex:0 0 auto}#sidebar_categories .catListTitle::before{content:\"分类导航\";font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}#sidebar_postarchive .catListTitle::before{content:\"随笔档案\"}#sidebar_categories [id^=\"sidebar_links\"] .catListTitle::before{content:\"站点\"}#sidebar_categories .catListTitle::after{content:\"\";flex:1;height:1px;background:var(--line)}#sidebar_categories ul{counter-reset:navitem;overflow:visible;margin:0;padding-right:0}#sidebar_categories ul::-webkit-scrollbar{width:4px}#sidebar_categories ul::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px}#sidebar_categories ul li{counter-increment:navitem;margin:0}#sideBar #sidebar_categories ul li a{position:relative;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding:7px 8px 7px 24px;border-radius:6px;color:var(--body) !important;font-size:13px;line-height:1.5}#sideBar #sidebar_categories ul li a::before{content:counter(navitem) \".\";position:absolute;left:5px;top:7px;width:17px;color:var(--num);font-weight:600;font-size:12.5px;font-variant-numeric:tabular-nums}#sideBar #sidebar_categories ul li a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}#sideBar #sidebar_categories ul li a:hover::before{color:var(--accent)}#sideBar #sidebar_categories ul li a.current,#sideBar #sidebar_categories ul li a.active,#sideBar #sidebar_categories ul li a[style*=\"color\"]{color:var(--accent-deep) !important;background:var(--accent-soft);font-weight:600}#sideBar #sidebar_categories ul li a.current::before,#sideBar #sidebar_categories ul li a.active::before{color:var(--accent)}#blog-sidecolumn ul li{margin:0 0 2px;line-height:1.6}#blog-sidecolumn ul li a{display:block;padding:4px 9px;border-radius:var(--radius-sm);color:var(--body) !important;font-size:13px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#blog-sidecolumn ul li a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}#blog-sidecolumn ul li a span,#blog-sidecolumn ul li a .small{color:var(--meta) !important;font-size:11.5px}#blog-sidecolumn .mySearch{display:flex;flex-wrap:wrap;gap:8px}#blog-sidecolumn .mySearch .catListTitle,#blog-sidecolumn .mySearch h3{flex:0 0 100%;width:100% !important;margin:0 0 8px !important}#blog-sidecolumn #q,#blog-sidecolumn input[type=\"text\"]{flex:1 1 auto;min-width:0;height:34px;padding:0 10px;box-sizing:border-box;font-size:13px;color:var(--body);background:var(--bg);border:1px solid var(--line);border-radius:var(--radius-sm);outline:none}#blog-sidecolumn #q:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}#blog-sidecolumn #btnZzk,#blog-sidecolumn input[type=\"button\"]{height:34px;padding:0 14px;font-size:13px;color:#fff;background:var(--accent);border:0;border-radius:var(--radius-sm);cursor:pointer}#sidebar_news{padding:18px}#sidebar_news .sidebar-news,#sidebar_news_container{font-size:13px;color:var(--body);line-height:1.75;max-height:none;overflow:visible;text-wrap:pretty}#sidebar_news_container p{margin:0 0 8px}#sidebar_news_container p:last-child{margin-bottom:0}#sidebar_news_container blockquote{margin:10px 0;padding:8px 12px;background:var(--accent-soft);border-left:2px solid var(--accent);border-radius:var(--radius-sm);color:var(--body)}#sidebar_news_container img{max-width:100%;border-radius:var(--radius-sm)}#qb-notice{font-size:13px;line-height:1.85;color:var(--body)}#qb-notice p{margin:0 0 10px}#qb-notice p:last-child{margin-bottom:0}#qb-notice b,#qb-notice strong{color:var(--ink);font-weight:600}#qb-notice a{color:var(--accent);text-decoration:none}#qb-notice a:hover{color:var(--accent-deep);text-decoration:underline}#qb-notice .qb-notice-tip{padding:10px 12px;background:var(--accent-soft);border-radius:var(--radius-sm);color:var(--body)}#qb-notice .qb-notice-links{margin:0;padding-top:10px;border-top:1px solid var(--line);font-size:12.5px}#qb-notice .qb-notice-links a{margin-right:12px}.qb-panel>#qb-notice{padding:2px 2px 2px}#sidebar_news a{color:var(--accent-deep)}#sidebar_news #profile_block{margin-top:12px;font-size:12.5px;line-height:1.9;color:var(--meta)}#sidebar_news #profile_block a{color:var(--accent-deep);font-weight:500}#sidebar_news #profile_block .follow-tip{margin-top:4px}#sidebar_news br+br{display:none}#blog-calendar{padding:16px}#blog-calendar table{width:100%;font-size:12px;border-collapse:collapse}#blog-calendar th,#blog-calendar td{text-align:center;padding:3px 0;color:var(--body);border:0}#blog-calendar td a{color:var(--accent-deep) !important;font-weight:600}#mainContent .forFlow{padding:0 !important}.day,.post,#taglist_main,#taglist,.category-block{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 16px;margin:0 0 16px}.day:hover{box-shadow:var(--shadow-hover);transform:translateY(-1px)}.dayTitle{display:none}.entrylistItem{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 16px;margin:0 0 16px}.entrylistTitle{font-size:20px !important;font-weight:600 !important;color:var(--ink) !important;margin:0 0 16px !important}.entrylistItemTitle{font-size:16px !important;font-weight:600 !important;color:var(--ink) !important;line-height:1.5}.entrylistItemTitle:hover{color:var(--accent-deep) !important}.entrylistPostSummary{margin:10px 0 !important}.entrylistItemPostDesc{font-size:12.5px !important;color:var(--meta) !important}.entrylistItemPostDesc a{color:var(--meta) !important}.entrylistItemPostDesc a:hover{color:var(--accent-deep) !important}.qb-archive{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 14px;margin:0 0 16px}.qb-arc-hd{display:flex;align-items:baseline;flex-wrap:wrap;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}.qb-arc-title{font-size:18px;font-weight:700;color:var(--ink);letter-spacing:.01em}.qb-arc-meta{font-size:12.5px;color:var(--meta);font-variant-numeric:tabular-nums}.qb-arc-yhd{display:flex;align-items:center;gap:10px;margin:20px 0 2px;font-size:14px;font-weight:700;color:var(--ink);letter-spacing:.06em;font-variant-numeric:tabular-nums}.qb-arc-yname{color:var(--ink)}.qb-arc-ytotal{font-size:11.5px;font-weight:500;color:var(--meta);letter-spacing:0;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:1px 7px}.qb-arc-yhd::after{content:\"\";flex:1;height:1px;background:var(--line)}.qb-arc-mo{padding:8px 0 2px;scroll-margin-top:74px}.qb-arc-mhd{display:flex;align-items:center;gap:9px;margin:0 0 4px}.qb-arc-mname{font-size:13px;font-weight:600;color:var(--body);font-variant-numeric:tabular-nums;text-decoration:none !important;border-bottom:1px dotted transparent;transition:color .16s ease,border-color .16s ease}.qb-arc-mname:hover{color:var(--accent-deep);border-bottom-color:var(--accent)}.qb-arc-mcount{font-size:11.5px;color:var(--meta);background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:1px 7px;font-variant-numeric:tabular-nums}.qb-arc-mline{flex:1;height:1px;background:var(--line);opacity:.7}.qb-arc-mo.qb-arc-cur .qb-arc-mname{color:var(--accent-deep)}.qb-arc-mo.qb-arc-cur .qb-arc-mcount{color:var(--accent-deep);border-color:var(--accent)}.qb-arc-list{list-style:none;margin:0;padding:0}.qb-arc-item{margin:0}.qb-arc-link{display:flex;align-items:baseline;gap:12px;padding:6px 10px;border-radius:var(--radius-sm);text-decoration:none !important;transition:background .16s ease}.qb-arc-link:hover{background:var(--accent-soft)}.qb-arc-d{flex:0 0 86px;width:86px;font-size:11.5px;color:var(--num);font-variant-numeric:tabular-nums;white-space:nowrap}.qb-arc-t{flex:1;min-width:0;font-size:13.5px;color:var(--body);line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qb-arc-link:hover .qb-arc-t{color:var(--accent-deep)}.qb-arc-r{flex:0 0 auto;font-size:11px;color:var(--meta);font-variant-numeric:tabular-nums}.qb-arc-r::after{content:\" 阅\";font-size:10px;opacity:.75}.qb-arc-tip{font-size:12.5px;color:var(--meta);padding:7px 10px;list-style:none}.qb-arc-jump{color:var(--accent-deep) !important;text-decoration:none !important;border-bottom:1px dotted var(--accent)}.qb-arc-jump:hover{color:var(--accent) !important}.qb-arc-pend{letter-spacing:.2em;opacity:.45;padding:6px 10px}.qb-arc-wait{font-size:12.5px;line-height:1.7;color:var(--meta);padding:4px 2px 2px}.qb-arc-idx{padding:2px 0 2px}.qb-arc-idx-row{display:flex;gap:10px;padding:9px 0;border-top:1px dashed var(--line)}.qb-arc-idx-row:first-child{border-top:0;padding-top:4px}.qb-arc-idx-y{flex:0 0 36px;font-size:12.5px;font-weight:700;color:var(--ink);padding-top:5px;font-variant-numeric:tabular-nums}.qb-arc-idx-ms{display:flex;flex-wrap:wrap;gap:6px}.qb-arc-idx-m{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:var(--bg);border:1px solid var(--line);font-size:12px;line-height:1.4;color:var(--body) !important;text-decoration:none !important;transition:background .16s ease,border-color .16s ease,color .16s ease}.qb-arc-idx-m i{font-style:normal;font-size:10.5px;color:var(--meta);font-variant-numeric:tabular-nums}.qb-arc-idx-m:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-deep) !important}.qb-arc-idx-m.on{background:var(--accent-deep);border-color:var(--accent-deep);color:#fff !important}.qb-arc-idx-m.on i{color:rgba(255, 255, 255, .82)}body.qb-dark .qb-arc-idx-m.on{background:var(--accent);border-color:var(--accent);color:#0d1117 !important}body.qb-dark .qb-arc-idx-m.on i{color:rgba(13, 17, 23, .7)}.PostList{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 16px;margin:0 0 16px}.PostListTitle{font-size:20px !important;font-weight:600 !important;color:var(--ink) !important;margin:0 0 16px !important}.postTitl2 a{font-size:16px !important;font-weight:600 !important;color:var(--ink) !important;line-height:1.5;display:block}.postTitl2 a:hover{color:var(--accent-deep) !important}.postDesc2{font-size:12.5px !important;color:var(--meta) !important;margin:12px 0 0 !important}.postDesc2 a{color:var(--meta) !important}.postDesc2 a:hover{color:var(--accent-deep) !important}.postText2{margin:12px 0 0 !important;color:var(--body) !important;font-size:13.5px !important}#taglist_main table{width:100% !important}#MyTag1_dtTagList a,#taglist a{display:inline-block;padding:5px 10px;margin:4px;border-radius:20px;background:var(--bg);color:var(--body) !important;font-size:13px;transition:background .16s ease,color .16s ease}#MyTag1_dtTagList a:hover,#taglist a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.category-block-title{font-size:15px !important;font-weight:600 !important;color:var(--ink) !important;letter-spacing:.02em;margin:0 0 12px !important;padding:0 0 10px;border-bottom:1px solid var(--line)}.category-block-list{padding:0 !important}.category-list-item a{display:block;padding:8px 10px;margin:6px 0;border-radius:var(--radius-sm);background:var(--bg);color:var(--body) !important;font-size:13.5px;line-height:1.5;transition:background .16s ease,color .16s ease}.category-list-item a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.category-list-item a span,.category-list-item .small{color:var(--meta) !important;font-size:11.5px;float:right}.day .postTitle{margin:0 0 8px !important;padding:0 !important;font-size:17.5px !important;font-weight:600 !important;line-height:1.5;border:0 !important}.day .postTitle a{color:var(--ink) !important;font-weight:600}.day .postTitle a:hover{color:var(--accent-deep) !important}.day .postCon{padding:0 !important}.day .c_b_p_desc{font-size:13.5px !important;line-height:1.8 !important;color:var(--body) !important;margin:0 !important}.day .c_b_p_desc a{color:var(--accent-deep) !important;font-weight:500}.day .postDesc{margin:12px 0 0 !important;padding:10px 0 0 !important;border-top:1px solid var(--line) !important;border-bottom:0 !important;background:none !important;font-size:12.5px !important;color:var(--meta) !important;text-align:left !important}.day .postDesc a{color:var(--meta) !important}.day .postDesc a:hover{color:var(--accent-deep) !important}.pinned-post-mark{display:inline-block;background:var(--accent);color:#fff !important;font-size:11px;font-weight:500;line-height:1;padding:3px 7px;border-radius:4px;margin-right:6px;vertical-align:2px}.qb-pager-top{display:none !important}.qb-pager-bar{margin:10px 0 0;padding:22px 0 28px;border-top:1px solid var(--line);text-align:center}.qb-pager-bar[data-qb-empty]{display:none !important}.qb-pager{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;margin:0;padding:0;font-size:13px;line-height:1;color:var(--meta)}#nav_next_page.qb-pager{padding:0;margin:0}.qb-pager a,.qb-pager .qb-cur,.qb-pager .qb-dis{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:34px;height:34px;padding:0 11px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);color:var(--body) !important;font-size:13px;line-height:1;text-decoration:none !important;box-shadow:0 1px 2px rgba(16, 24, 40, .04);transition:border-color .15s ease,color .15s ease,box-shadow .15s ease,transform .15s ease}.qb-pager a:hover{border-color:var(--accent);color:var(--accent-deep) !important;transform:translateY(-1px);box-shadow:0 3px 10px rgba(208, 92, 232, .16)}.qb-pager a:active{transform:translateY(0);box-shadow:none}.qb-pager .qb-cur{border-color:var(--accent);background:var(--accent);color:#fff !important;font-weight:600;box-shadow:0 2px 8px rgba(208, 92, 232, .26)}.qb-pager .qb-dis{border-color:transparent;background:transparent;color:var(--meta) !important;opacity:.5;cursor:default}.qb-pager .qb-prev::before,.qb-pager .qb-next::after{font-size:14px;line-height:0;opacity:.8}.qb-pager .qb-prev::before{content:'‹';margin-right:5px}.qb-pager .qb-next::after{content:'›';margin-left:5px}@media (max-width: 640px){.qb-pager{gap:5px}.qb-pager a,.qb-pager .qb-cur,.qb-pager .qb-dis{min-width:30px;height:30px;padding:0 9px;font-size:12.5px}.qb-pager-bar{padding:18px 0 22px}}#post_detail{padding:30px 32px 24px;margin:0 0 18px}#post_detail .post{padding:0;margin:0;background:none;border:0;box-shadow:none}#post_detail .postTitle{margin:0 0 14px !important;padding:0 !important;border:0 !important;font-size:26px !important;font-weight:700 !important;line-height:1.42;color:var(--ink)}#post_detail .postTitle a{color:var(--ink) !important}#post_detail .postDesc{font-size:12.5px !important;color:var(--meta) !important;margin:0 0 22px !important;padding:0 0 16px !important;border-bottom:1px solid var(--line) !important;text-align:left !important}#post_detail .postDesc a{color:var(--meta) !important}#cnblogs_post_body{font-size:15px !important;line-height:1.9;color:var(--body)}#cnblogs_post_body p{margin:0 0 1.05em}#cnblogs_post_body h1{font-size:22px;margin:1.5em 0 .6em;color:var(--ink)}#cnblogs_post_body h2{font-size:19px;font-weight:600;color:var(--ink);margin:1.6em 0 .7em;padding-left:12px;border-left:4px solid var(--accent);line-height:1.5}#cnblogs_post_body h3{font-size:16.5px;font-weight:600;color:var(--ink);margin:1.4em 0 .6em}#cnblogs_post_body h4{font-size:15px;color:var(--ink);margin:1.2em 0 .5em}#cnblogs_post_body img{max-width:100%;height:auto;border-radius:var(--radius-sm)}#cnblogs_post_body blockquote{margin:1.2em 0;padding:12px 18px;background:var(--bg);border-left:3px solid var(--line);border-radius:0 var(--radius-sm) var(--radius-sm) 0;color:var(--meta)}#cnblogs_post_body code{background:var(--code-bg);padding:2px 6px;border-radius:4px;font-size:.9em;color:var(--code-ink);font-family:\"JetBrains Mono\",Consolas,Monaco,monospace}#cnblogs_post_body pre{background:var(--pre-bg) !important;color:var(--pre-ink) !important;padding:16px 18px !important;border:0 !important;border-radius:10px !important;overflow-x:auto;font-size:13px;line-height:1.7}#cnblogs_post_body pre code{background:none;color:inherit;padding:0}#cnblogs_post_body .qb-code{margin:1.35em 0;border:1px solid var(--pre-line);border-radius:var(--radius-sm);background:var(--pre-bg);overflow:hidden}#cnblogs_post_body .qb-code>pre{margin:0 !important;padding:14px 0 16px !important;border:0 !important;border-radius:0 !important;background:transparent !important;position:relative;scrollbar-width:thin;scrollbar-color:#3b434d transparent}#cnblogs_post_body .qb-code>pre.line-numbers{padding-left:3.8em !important}#cnblogs_post_body .qb-code .line-numbers-rows{border-right:1px solid var(--pre-line);color:var(--pre-num)}#cnblogs_post_body .qb-code .line-numbers-rows>span::before{color:var(--pre-num)}#cnblogs_post_body .qb-code.no-line-numbers>pre.line-numbers{padding-left:0 !important}#cnblogs_post_body .qb-code.no-line-numbers .line-numbers-rows{display:none}#cnblogs_post_body .qb-code>pre::-webkit-scrollbar{height:9px}#cnblogs_post_body .qb-code>pre::-webkit-scrollbar-track{background:transparent}#cnblogs_post_body .qb-code>pre::-webkit-scrollbar-thumb{background:#3b434d;border-radius:9px}#cnblogs_post_body .qb-code>pre::-webkit-scrollbar-thumb:hover{background:#4b545f}#cnblogs_post_body .qb-code-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:5px 10px 5px 14px;border-bottom:1px solid var(--pre-line);background:rgba(255, 255, 255, .035);font-family:\"JetBrains Mono\",Consolas,Monaco,monospace;font-size:12px;line-height:1.5;color:var(--pre-num)}#cnblogs_post_body .qb-code-lang{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pre-num)}#cnblogs_post_body .qb-code-copy{appearance:none;padding:3px 9px;border:0;border-radius:5px;background:transparent;font:inherit;color:var(--pre-num);cursor:pointer;transition:background .15s,color .15s}#cnblogs_post_body .qb-code-copy:hover{background:rgba(255, 255, 255, .09);color:var(--pre-ink)}#cnblogs_post_body .qb-code-copy.done{color:#3fb950}#cnblogs_post_body .qb-code>pre>code{display:block;counter-reset:qb-ln;background:none;color:var(--pre-ink);padding:0}#cnblogs_post_body .qb-cl{display:block;min-height:1.7em;padding-right:18px}#cnblogs_post_body .qb-cl::before{counter-increment:qb-ln;content:counter(qb-ln);position:sticky;left:0;display:inline-block;box-sizing:content-box;width:var(--qb-ln-w, 2ch);margin-right:.9em;padding:0 .7em 0 14px;text-align:right;color:var(--pre-num);background:var(--pre-bg);user-select:none;-webkit-user-select:none}#cnblogs_post_body .qb-cl:hover{background:rgba(110, 118, 129, .10)}#cnblogs_post_body .qb-cl:hover::before{background:var(--pre-hover)}#cnblogs_post_body .qb-code.no-line-numbers .qb-cl{padding-left:18px}#cnblogs_post_body .qb-code.no-line-numbers .qb-cl::before{display:none}#cnblogs_post_body .qb-code.qb-folded>pre{max-height:500px;overflow-y:hidden}#cnblogs_post_body .qb-code-more{position:relative;display:block;width:100%;margin:0;padding:9px 12px;border:0;border-top:1px solid var(--pre-line);background:rgba(255, 255, 255, .035);font-family:\"JetBrains Mono\",Consolas,Monaco,monospace;font-size:12px;line-height:1.4;color:var(--pre-num);cursor:pointer;transition:background .15s,color .15s}#cnblogs_post_body .qb-code-more::before{content:'';position:absolute;left:0;right:0;bottom:100%;height:64px;background:linear-gradient(to bottom, rgba(22, 27, 34, 0),var(--pre-bg) 78%);pointer-events:none}#cnblogs_post_body .qb-code-more:hover{background:rgba(255, 255, 255, .09);color:var(--pre-ink)}#post_detail .qb-readtime{display:flex;align-items:center;gap:7px;margin:-2px 0 20px;font-size:12.5px;color:var(--meta);letter-spacing:.01em}#post_detail .qb-readtime .qb-rt-sep{color:var(--line)}#cnblogs_post_body h2,#cnblogs_post_body h3{position:relative}#cnblogs_post_body .qb-hanchor{margin-left:8px;font-weight:400;color:var(--meta);text-decoration:none;opacity:0;transition:opacity .15s ease,color .15s ease}#cnblogs_post_body .qb-hanchor::before{content:'#'}#cnblogs_post_body h2:hover .qb-hanchor,#cnblogs_post_body h3:hover .qb-hanchor,#cnblogs_post_body .qb-hanchor:focus-visible{opacity:.5}#cnblogs_post_body .qb-hanchor:hover{opacity:1;color:var(--accent-deep)}@media (hover: none){#cnblogs_post_body .qb-hanchor{opacity:.38}}#cnblogs_post_body .qb-copyright{margin:2.4em 0 0;padding:15px 18px 14px;border:1px dashed rgba(31, 35, 41, .16);border-radius:var(--radius-sm);background:var(--bg);font-size:12.5px;line-height:1.95;color:var(--meta)}#cnblogs_post_body .qb-copyright p{margin:0}#cnblogs_post_body .qb-copyright .qb-cr-h{margin-bottom:3px;font-weight:600;color:var(--body);letter-spacing:.02em}#cnblogs_post_body .qb-copyright a{color:var(--body);text-decoration:none;border-bottom:1px dotted var(--line);word-break:break-all}#cnblogs_post_body .qb-copyright a:hover{color:var(--accent-deep);border-bottom-color:var(--accent)}#cnblogs_post_body .qb-copyright .qb-cr-tip{color:var(--meta)}body.qb-dark #cnblogs_post_body .qb-copyright{border-color:rgba(255, 255, 255, .16)}#cnblogs_post_body .cnblogs-toc-button{display:none !important}#cnblogs_post_body table{width:100%;border-collapse:collapse;margin:1.2em 0;font-size:13.5px}#cnblogs_post_body th,#cnblogs_post_body td{border:1px solid var(--line);padding:8px 12px;text-align:left}#cnblogs_post_body th{background:var(--bg);font-weight:600;color:var(--ink)}#cnblogs_post_body .qb-table-wrap{margin:1.2em 0;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}#cnblogs_post_body .qb-table-wrap table{margin:0}#cnblogs_post_body .qb-table-wrap th,#cnblogs_post_body .qb-table-wrap td{min-width:92px}#cnblogs_post_body .qb-table-wrap.qb-x th:first-child,#cnblogs_post_body .qb-table-wrap.qb-x td:first-child{position:sticky;left:0;z-index:2;background:var(--card);box-shadow:1px 0 0 var(--line)}#cnblogs_post_body .qb-table-wrap.qb-x th:first-child{background:var(--bg)}@media (hover: none){#cnblogs_post_body .qb-table-wrap.qb-x{-webkit-mask-image:linear-gradient(to right, #000 calc(100% - 26px),transparent);mask-image:linear-gradient(to right, #000 calc(100% - 26px),transparent)}}#cnblogs_post_body hr{height:0;margin:2.2em 0;border:0;border-top:1px solid var(--line)}#cnblogs_post_body kbd{display:inline-block;min-width:1.7em;padding:1px 6px;border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;background:var(--card);box-shadow:0 1px 0 var(--line);font-family:\"JetBrains Mono\",Consolas,Monaco,monospace;font-size:.82em;line-height:1.55;text-align:center;color:var(--ink);vertical-align:1px}#cnblogs_post_body mark{padding:0 2px;border-radius:2px;background:rgba(255, 214, 102, .55);color:inherit}body.qb-dark #cnblogs_post_body mark{background:rgba(187, 128, 9, .40);color:#f0e6d2}#cnblogs_post_body details{margin:1.2em 0;padding:0;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);overflow:hidden}#cnblogs_post_body summary{padding:9px 14px;font-weight:600;color:var(--ink);cursor:pointer;list-style:none;user-select:none}#cnblogs_post_body summary::-webkit-details-marker{display:none}#cnblogs_post_body summary::before{content:'▸';display:inline-block;width:1.2em;color:var(--meta);transition:transform .15s}#cnblogs_post_body details[open]>summary::before{transform:rotate(90deg)}#cnblogs_post_body details[open]>summary{border-bottom:1px solid var(--line)}#cnblogs_post_body details>*:not(summary){margin-left:14px;margin-right:14px}#cnblogs_post_body details>*:last-child{margin-bottom:12px}#cnblogs_post_body .qb-tasklist{padding-left:1.4em}#cnblogs_post_body .qb-task{list-style:none}#cnblogs_post_body .qb-task>input[type=\"checkbox\"]{margin:0 .5em 0 -1.3em;vertical-align:-1px;accent-color:var(--accent)}#cnblogs_post_body sup a{padding:0 2px;font-size:.78em;text-decoration:none;color:var(--accent-deep)}#cnblogs_post_body .footnotes{margin-top:2em;padding-top:.9em;border-top:1px solid var(--line);font-size:13px;color:var(--meta)}#cnblogs_post_body figure{margin:1.4em 0}#cnblogs_post_body figcaption{margin-top:6px;font-size:12.5px;line-height:1.7;text-align:center;color:var(--meta)}#cnblogs_post_body dl{margin:1.1em 0}#cnblogs_post_body dt{margin-top:.7em;font-weight:600;color:var(--ink)}#cnblogs_post_body dd{margin:.2em 0 0 1.4em}#cnblogs_post_body abbr[title]{text-decoration:underline dotted var(--meta);cursor:help}#EntryTag{margin:20px 0 8px !important;font-size:0}#EntryTag a{display:inline-block;font-size:12px;padding:4px 11px;margin:0 6px 8px 0;border-radius:20px;background:var(--bg);color:var(--body) !important}#EntryTag a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.qb-tax{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 22px !important;font-size:12px;line-height:1.5}.qb-tax a{display:inline-block;padding:3px 10px;border-radius:20px;background:var(--bg);color:var(--body) !important;text-decoration:none}.qb-tax a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.qb-tax .qb-tax-cat{display:inline-flex;align-items:center;gap:6px;background:var(--accent-soft);color:var(--accent-deep) !important;font-weight:600}.qb-tax .qb-tax-cat:hover{background:var(--accent);color:#fff !important}.qb-tax-dot{flex:none;width:5px;height:5px;border-radius:50%;background:currentColor}.qb-tax-more{padding:3px 8px;border:0;border-radius:20px;background:transparent;color:var(--meta);font:inherit;font-size:12px;line-height:1.5;cursor:pointer}.qb-tax-more:hover{background:var(--accent-soft);color:var(--accent-deep)}#post_next_prev{font-size:13px !important;color:var(--meta);line-height:1.9;margin:18px 0 0 !important;padding:14px 0 0 !important;border-top:1px solid var(--line);text-align:left !important}#post_next_prev a{color:var(--accent-deep) !important}#blog-comments-placeholder{padding:22px 24px;margin:0 0 18px}#blog-comments-placeholder .feedback_area_title,#blog-comments-placeholder h4{font-size:15px;font-weight:600;color:var(--ink);margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid var(--line)}.commentform{padding:22px 24px;margin:0 0 18px}.commentform .comment_textarea,.commentform textarea{width:100% !important;box-sizing:border-box;border:1px solid var(--line) !important;border-radius:var(--radius-sm) !important;padding:10px 12px !important;font-size:13.5px;outline:none}.commentform .comment_textarea:focus,.commentform textarea:focus{border-color:var(--accent) !important;box-shadow:0 0 0 3px var(--accent-soft)}#footer{max-width:1320px;margin:8px auto 0;padding:22px 24px 34px;text-align:center;font-size:12.5px;color:var(--meta);line-height:2;background:none !important;border-top:1px solid var(--line)}#footer a{color:var(--meta) !important}#footer a:hover{color:var(--accent-deep) !important}#footer img{vertical-align:-3px;height:14px}#footer .qb-credit{margin-top:6px;font-size:12px;line-height:1.9;opacity:.85;transition:opacity .15s}#footer .qb-credit:hover{opacity:1}#footer .qb-credit a{color:var(--meta) !important;text-decoration:none;border-bottom:1px dashed transparent}#footer .qb-credit a::after{content:'↗';margin-left:2px;font-size:.92em;opacity:.8}#footer .qb-credit .qb-credit-name{white-space:nowrap}#footer .qb-credit a:hover{color:var(--accent-deep) !important;border-bottom-color:currentColor}#qb-top{position:fixed;right:24px;bottom:32px;z-index:1000;width:44px;height:44px;padding:0;border-radius:50%;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer;opacity:0;visibility:hidden;transform:translateY(10px) scale(.96);transition:opacity .18s ease,transform .18s ease,visibility .18s ease,box-shadow .2s ease,border-color .2s ease,color .2s ease;display:flex;align-items:center;justify-content:center;color:var(--ink);-webkit-tap-highlight-color:transparent}#qb-top.show{opacity:1;visibility:visible;transform:translateY(0) scale(1)}#qb-top:hover{color:var(--accent-deep);transform:translateY(-2px);box-shadow:var(--shadow-hover)}#qb-top:active{transform:translateY(0) scale(.94)}#qb-top:focus-visible{outline:2px solid var(--accent);outline-offset:3px}#qb-top .qb-top-ico{position:relative;z-index:1;width:18px;height:18px;transition:transform .2s ease}#qb-top:hover .qb-top-ico{transform:translateY(-1.5px)}#qb-top .qb-top-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none}#qb-top .qb-top-ring circle{fill:none;stroke-width:2;stroke-linecap:round}#qb-top .qb-top-ring-bg{stroke:var(--line)}#qb-top .qb-top-ring-fg{stroke:var(--accent);stroke-dasharray:116.2;stroke-dashoffset:116.2;transition:stroke-dashoffset .12s linear}@media (max-width: 640px){#qb-top{right:16px;bottom:20px}}@media (prefers-reduced-motion: reduce){#qb-top,#qb-top .qb-top-ico,#qb-top .qb-top-ring-fg{transition:none}#qb-top.show{transform:none}#qb-top:hover{transform:none}#qb-top:hover .qb-top-ico{transform:none}.qb-panel,#sideBarMain{animation:none}}body.qb-dark,body.qb-dark #home,body.qb-dark #main{background:var(--bg) !important}html:has(> body.qb-dark){background:#0d1117 !important}body.qb-dark #cnblogs_post_body a,body.qb-dark #sidebar_news a,body.qb-dark #blog-comments-placeholder a,body.qb-dark .commentform a{color:var(--accent) !important}body.qb-dark #cnblogs_post_body a:hover,body.qb-dark #sidebar_news a:hover{color:var(--accent-deep) !important}body.qb-dark #cnblogs_post_body blockquote{background:#161b22;border-left-color:#3b434b;color:var(--meta)}body.qb-dark #cnblogs_post_body code{background:rgba(110, 118, 129, .4);color:#e6edf3;border:0}body.qb-dark #cnblogs_post_body pre,body.qb-dark .cnblogs_code,body.qb-dark .cnblogs_code pre{background:#161b22 !important;color:#e6edf3 !important;border:1px solid var(--line) !important;border-radius:10px !important}body.qb-dark .cnblogs_code_toolbar,body.qb-dark .cnblogs_code_collapse{background:transparent !important;border-color:var(--line) !important}body.qb-dark .cnblogs_code_toolbar a,body.qb-dark .cnblogs_code_collapse{color:var(--meta) !important}body.qb-dark #cnblogs_post_body table{border-color:var(--line)}body.qb-dark #cnblogs_post_body th{background:#161b22;color:var(--ink);border-color:var(--line)}body.qb-dark #cnblogs_post_body td{border-color:var(--line)}body.qb-dark #cnblogs_post_body hr{border-color:var(--line)}body.qb-dark #cnblogs_post_body img{background:transparent}body.qb-dark .commentform textarea,body.qb-dark #tbCommentBody,body.qb-dark .comment_textarea{background:#0d1117 !important;color:var(--body) !important;border-color:var(--line) !important}body.qb-dark .comment_btn,body.qb-dark #btn_comment_submit{background:#21262d !important;color:var(--ink) !important;border:1px solid var(--line) !important;border-radius:6px !important}body.qb-dark .feedbackItem,body.qb-dark .blog_comment_body,body.qb-dark #blog-comments-placeholder .comment_item{background:transparent !important;color:var(--body) !important;border-color:var(--line) !important}body.qb-dark .feedbackCon,body.qb-dark .comment_vote{background:transparent !important}body.qb-dark #sidebar_news_container [style*=\"background\"],body.qb-dark #blog-news [style*=\"background\"]{background:rgba(255, 255, 255, .04) !important;color:var(--body) !important}body.qb-dark #sidebar_news_container [style*=\"color\"],body.qb-dark #blog-news [style*=\"color\"]{color:var(--body) !important}body.qb-dark #sidebar_news_container [style*=\"border-top\"],body.qb-dark #blog-news [style*=\"border-top\"]{border-top-color:var(--line) !important}body.qb-dark .qb-pager a{box-shadow:none}body.qb-dark .qb-pager a:hover,body.qb-dark .qb-pager .qb-cur{box-shadow:none}body.qb-dark #qb-top{background:var(--card);border-color:var(--line)}body.qb-dark #qb-top .qb-top-ring-bg{stroke:var(--line)}body.qb-dark #blog-sidecolumn #q,body.qb-dark #blog-sidecolumn input[type=\"text\"],body.qb-dark #blog-sidecolumn input[type=\"button\"]{color:var(--body)}body.qb-dark #blog-calendar td,body.qb-dark #blog-calendar th{color:var(--body)}body.qb-dark #post_detail img,body.qb-dark #cnblogs_post_body img,body.qb-dark #sidebar_news_container img{filter:brightness(.9)}body.qb-dark #post_detail img:hover,body.qb-dark #cnblogs_post_body img:hover{filter:none}@media screen and (max-width: 1220px){#main{grid-template-columns:216px minmax(0, 1fr) 236px;gap:16px;padding:20px 16px 8px}}@media screen and (max-width: 1024px){#main{grid-template-columns:220px minmax(0, 1fr);gap:16px}#mainContent{grid-column:2}#sideBarMain,#blog-calendar{display:none !important}}@media screen and (max-width: 860px){#main{display:flex !important;flex-direction:column;grid-template-columns:none;padding:14px 14px 4px;gap:14px;align-items:stretch}#mainContent,#qb-left,#sideBarMain,#blog-calendar{grid-column:auto;grid-row:auto;width:100%;max-width:100%}#sideBar,#sideBarMain{display:block !important}#sideBar,#qb-left,#sideBarMain{display:none !important}#blog-calendar{display:none}#post_detail{padding:20px 18px}#post_detail .postTitle{font-size:21px !important}#cnblogs_post_body .qb-code>pre{font-size:12px !important}#cnblogs_post_body .qb-cl::before{padding:0 .45em 0 10px}#cnblogs_post_body .qb-cl{padding-right:12px}#cnblogs_post_body .qb-code-bar{padding:4px 8px 4px 10px}.day{padding:16px 16px 12px}.qb-nav-inner{padding:0 14px;height:52px;gap:10px}.qb-nav{min-height:52px}.qb-brand{gap:7px;font-size:15px}.qb-logo{width:24px;height:24px;flex:0 0 24px}.qb-links{flex:1 1 auto;min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}.qb-links::-webkit-scrollbar{display:none}html.qb-mnav .qb-links{display:none}html.qb-mnav .qb-burger{flex:0 0 36px;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);cursor:pointer}.qb-burger svg{width:18px;height:18px}#qb-dark-toggle{flex:0 0 36px}#qb-theme-toggle{flex:0 0 36px}.qb-theme{flex:0 0 36px}.qb-theme-pop{right:-4px;gap:8px;padding:9px 11px}}.qb-mtoc-fab{display:none}.qb-mtoc{position:fixed;inset:0;z-index:1200;visibility:hidden;pointer-events:none}.qb-mtoc.open{visibility:visible;pointer-events:auto}.qb-mtoc-mask{position:absolute;inset:0;background:rgba(9, 12, 17, .44);opacity:0;transition:opacity .22s ease}.qb-mtoc.open .qb-mtoc-mask{opacity:1}.qb-mtoc-sheet{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;max-height:76vh;padding-bottom:env(safe-area-inset-bottom);border-radius:16px 16px 0 0;background:var(--card);box-shadow:0 -8px 32px rgba(16, 24, 40, .22);transform:translateY(100%);transition:transform .26s cubic-bezier(.22, .61, .36, 1)}.qb-mtoc.open .qb-mtoc-sheet{transform:none}.qb-mtoc-hd{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:13px 14px 10px;border-bottom:1px solid var(--line)}.qb-mtoc-title{font-size:14px;font-weight:600;color:var(--ink)}.qb-mtoc-n{padding:1px 7px;border-radius:10px;background:var(--bg);font-size:11.5px;color:var(--meta)}.qb-mtoc-x{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin-left:auto;padding:0;border:0;border-radius:8px;background:transparent;color:var(--meta);cursor:pointer}.qb-mtoc-x:hover{background:var(--bg);color:var(--ink)}.qb-mtoc-x svg{width:16px;height:16px}.qb-mtoc-list{flex:1 1 auto;margin:0;padding:8px 10px 14px;list-style:none;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}.qb-mtoc-list li{margin:0}.qb-mtoc-list a{display:block;padding:8px 12px;border-radius:8px;font-size:13.5px;line-height:1.65;color:var(--body);text-decoration:none}.qb-mtoc-list a.on{background:var(--accent-soft);color:var(--accent-deep);font-weight:600}html.qb-mtoc-lock,html.qb-mtoc-lock body{overflow:hidden !important}.qb-burger{display:none}.qb-mmenu{position:fixed;inset:0;z-index:1400;visibility:hidden;pointer-events:none}.qb-mmenu.open{visibility:visible;pointer-events:auto}.qb-mmenu-mask{position:absolute;inset:0;background:rgba(16, 24, 40, .42);opacity:0;transition:opacity .22s ease}.qb-mmenu.open .qb-mmenu-mask{opacity:1}.qb-mmenu-panel{position:absolute;top:0;right:0;bottom:0;width:76%;max-width:300px;display:flex;flex-direction:column;box-sizing:border-box;padding-top:env(safe-area-inset-top, 0);padding-bottom:env(safe-area-inset-bottom, 0);background:var(--card);border-left:1px solid var(--line);box-shadow:-8px 0 28px rgba(16, 24, 40, .14);transform:translateX(102%);transition:transform .24s cubic-bezier(.22, .61, .36, 1)}.qb-mmenu.open .qb-mmenu-panel{transform:none}.qb-mmenu-hd{display:flex;align-items:center;gap:10px;flex:0 0 auto;padding:14px 12px 12px 16px;border-bottom:1px solid var(--line)}.qb-mmenu-title{flex:1 1 auto;font-size:14px;font-weight:600;color:var(--ink)}.qb-mmenu-x{flex:0 0 32px;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--meta);cursor:pointer;transition:background .16s,color .16s}.qb-mmenu-x:hover{background:var(--bg);color:var(--ink)}.qb-mmenu-x svg{width:16px;height:16px}.qb-mmenu-list{flex:1 1 auto;margin:0;padding:8px;list-style:none;overflow-y:auto;-webkit-overflow-scrolling:touch}.qb-mmenu-list li{margin:0}.qb-mmenu-list a{display:block;padding:12px 14px;border-radius:8px;color:var(--body);font-size:15px;line-height:1.4;text-decoration:none}.qb-mmenu-list a.on{background:var(--accent-soft);color:var(--accent-deep);font-weight:600}html.qb-mmenu-lock,html.qb-mmenu-lock body{overflow:hidden !important}.qb-toast{position:fixed;left:50%;bottom:26px;z-index:1300;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:9px 12px 9px 15px;border:1px solid var(--line);border-radius:22px;background:var(--card);box-shadow:var(--shadow-hover);font-size:13px;color:var(--body);opacity:0;transform:translate(-50%, 12px);transition:opacity .22s ease,transform .22s ease}.qb-toast.show{opacity:1;transform:translate(-50%, 0)}.qb-toast-t{white-space:nowrap}.qb-toast-a{flex:0 0 auto;padding:2px 8px;border:0;border-radius:6px;background:var(--accent-soft);font:inherit;color:var(--accent-deep);cursor:pointer}.qb-toast-a:hover{background:var(--accent);color:#fff}.qb-toast-x{flex:0 0 auto;width:22px;height:22px;padding:0;border:0;border-radius:50%;background:transparent;font-size:15px;line-height:1;color:var(--meta);cursor:pointer}.qb-toast-x:hover{background:var(--bg);color:var(--ink)}@media screen and (max-width: 860px){.qb-mtoc-fab{position:fixed;left:14px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:1001;display:flex;align-items:center;gap:5px;height:44px;padding:0 14px 0 12px;border:1px solid var(--line);border-radius:22px;background:var(--card);box-shadow:var(--shadow);font-family:var(--font);font-size:12.5px;color:var(--ink);cursor:pointer;-webkit-tap-highlight-color:transparent}.qb-mtoc-fab svg{width:16px;height:16px}.qb-mtoc-fab:active{transform:scale(.97)}#qb-top{bottom:calc(20px + env(safe-area-inset-bottom))}.qb-toast{bottom:calc(78px + env(safe-area-inset-bottom));font-size:12.5px}#cnblogs_post_body .qb-table-wrap th,#cnblogs_post_body .qb-table-wrap td{min-width:84px;padding:7px 9px;font-size:12.5px}#cnblogs_post_body .qb-code.qb-folded>pre{max-height:360px}.qb-arc-d{flex:0 0 52px}.qb-arc-link{padding:7px 10px}}@media screen and (max-width: 480px){#main{padding:10px 10px 4px;gap:10px}#post_detail{padding:18px 15px 16px}#post_detail .postTitle{font-size:20px !important;line-height:1.42}#post_detail .postDesc{margin-bottom:18px !important;font-size:12px !important}#cnblogs_post_body{font-size:16px !important;line-height:1.85}#cnblogs_post_body h2{font-size:18px;padding-left:10px;border-left-width:3px}#cnblogs_post_body h3{font-size:16px}#cnblogs_post_body blockquote{margin:1em 0;padding:10px 14px}#cnblogs_post_body .qb-code{margin:1em 0}#cnblogs_post_body .qb-code-bar{font-size:11px}.day{padding:14px 14px 10px}.day .postTitle{font-size:18px}#post_detail .qb-readtime{margin-bottom:16px}#cnblogs_post_body .qb-copyright{padding:12px 13px 11px;line-height:1.85}#post_detail .qb-hanchor{display:none}}@media print{@page{margin:16mm 14mm}:root,html.qb-dark,body.qb-dark{--bg:#fff;--card:#fff;--line:#d7d7d7;--ink:#000;--body:#1a1a1a;--meta:#555;--accent:#000;--accent-deep:#000;--accent-soft:#f0f0f0;--code-bg:#f3f3f3;--code-ink:#111;--pre-bg:#f6f6f6;--pre-ink:#111;--pre-line:#ddd;--pre-num:#888;--shadow:none;--shadow-hover:none}html,body{background:#fff !important;color:#111 !important;font-size:11.5pt}#qb-nav,.qb-nav,#qb-left,#sideBar,#sideBarMain,#qb-top,.qb-mtoc,.qb-mtoc-fab,.qb-toast,.qb-code-bar,.qb-code-more,.qb-hanchor,#blog-comments-placeholder,.commentform,#footer,#blog_post_info_block,#post_next_prev,#EntryTag,.qb-catbar,.qb-arc-idx,#cnblogs_post_body .cnblogs-toc-button{display:none !important}#main{display:block !important;max-width:none;margin:0;padding:0;gap:0}#mainContent{width:100% !important;max-width:none}#post_detail,.day{margin:0 !important;padding:0 !important;border:0 !important;background:#fff !important;box-shadow:none !important}#post_detail .postTitle{font-size:20pt !important;margin-bottom:8pt !important}#post_detail .postDesc{border-bottom:1px solid #ddd !important}#cnblogs_post_body{font-size:11pt !important;line-height:1.72;color:#111 !important}#cnblogs_post_body h2,#cnblogs_post_body h3{break-after:avoid;page-break-after:avoid}#cnblogs_post_body h2{border-left-color:#000}#cnblogs_post_body p{orphans:3;widows:3}#cnblogs_post_body img{max-width:100% !important;page-break-inside:avoid;break-inside:avoid;filter:none !important}#cnblogs_post_body blockquote,#cnblogs_post_body .qb-copyright{background:#fff !important;border-color:#ccc !important}#cnblogs_post_body a{color:#000 !important;text-decoration:underline}#cnblogs_post_body .qb-code.qb-folded>pre{max-height:none !important;overflow:visible !important}#cnblogs_post_body .qb-code>pre{padding-left:0 !important;overflow:visible !important;white-space:pre-wrap !important;word-break:break-word;border:1px solid #ddd !important}#cnblogs_post_body .qb-code .line-numbers-rows{display:none !important}#cnblogs_post_body .qb-code>pre.line-numbers{padding-left:14px !important}#cnblogs_post_body .qb-code pre,#cnblogs_post_body .qb-code pre *{color:#111 !important}#cnblogs_post_body .qb-cl{background:transparent !important}#cnblogs_post_body .qb-cl::before{background:#f6f6f6 !important;color:#888 !important}#cnblogs_post_body .qb-code{border-color:#ddd !important;background:#f6f6f6 !important}#cnblogs_post_body .qb-table-wrap{overflow:visible !important;-webkit-mask-image:none !important;mask-image:none !important}#cnblogs_post_body .qb-table-wrap th,#cnblogs_post_body .qb-table-wrap td{min-width:0 !important;font-size:9.5pt}#cnblogs_post_body .qb-table-wrap th:first-child,#cnblogs_post_body .qb-table-wrap td:first-child{position:static;box-shadow:none;background:transparent !important}#cnblogs_post_body th{background:#f3f3f3 !important}#cnblogs_post_body th,#cnblogs_post_body td{border-color:#ccc !important}}";
  (document.head || document.documentElement).appendChild(st);
})();
(function () {
'use strict';
var RESERVED = { p: 1, categories: 1, tag: 1, rss: 1, archive: 1, admin: 1, sitemap: 1 };
var APP = (function () {
var seg = String(location.pathname || '/').split('/').filter(Boolean);
if (!seg.length) return '';
return RESERVED[seg[0].toLowerCase()] ? '' : seg[0];
})();
var HOME = location.origin + '/' + (APP ? APP + '/' : '');
var SITE_NAME = (function () {
var parts = String(document.title || '').split(' - ').map(function (s) { return s.trim(); });
while (parts.length && /^博客园$/.test(parts[parts.length - 1])) parts.pop();
return parts.length ? parts[parts.length - 1] : '';
})();
var REPO = 'https://github.com/zsy0216/cnblogs-document-theme';
var NOW = new Date();
function resolveHref(h) {
return String(h == null ? '' : h).replace(/\{(ym|y|m)\}/g, function (_, k) {
if (k === 'y') return String(NOW.getFullYear());
if (k === 'm') return String(NOW.getMonth() + 1);
return NOW.getFullYear() + '/' + (NOW.getMonth() + 1);
});
}
var CFG = (function () {
var d = {
accent: '',
dark: 'auto',
backToTop: true,
pager: true,
archive: true,
archiveTtl: 24,
gate: true,
code: {
lineNumbers: true,
copy: true
},
nav: {
brand: SITE_NAME,
home: HOME,
logo: '',
mark: null,
dark: true,
links: [
{ t: '首页', h: HOME },
{ t: '归档', h: HOME + 'p/archive/{ym}' },
{ t: '分类', h: HOME + 'categories' },
{ t: '标签', h: HOME + 'tag' },
{ t: 'RSS', h: HOME + 'rss', b: 1 }
]
},
notice: {
show: true,
title: '公告',
html: ''
}
};
var u = {};
[window.QB_CONFIG, window.LS_CONFIG].forEach(function (src) {
if (!src || typeof src !== 'object') return;
for (var k in src) {
if (Object.prototype.hasOwnProperty.call(src, k)) u[k] = src[k];
}
});
(function merge(dst, src, depth) {
for (var k in dst) {
if (!Object.prototype.hasOwnProperty.call(dst, k)) continue;
var sv = src ? src[k] : undefined;
if (sv === undefined || sv === null) continue;
var dv = dst[k];
if (depth < 2 && dv && typeof dv === 'object' && !(dv instanceof Array) &&
sv && typeof sv === 'object' && !(sv instanceof Array)) {
merge(dv, sv, depth + 1);
} else {
dst[k] = sv;
}
}
})(d, u, 0);
var hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(d.accent || '').trim());
if (hex) {
var h = hex[1];
if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
var r = parseInt(h.slice(0, 2), 16);
var g = parseInt(h.slice(2, 4), 16);
var b = parseInt(h.slice(4, 6), 16);
var deep = '#' + [r, g, b].map(function (v) {
return ('0' + Math.max(0, Math.round(v * 0.82)).toString(16)).slice(-2);
}).join('');
try {
var st = document.createElement('style');
st.id = 'qb-cfg-accent';
st.textContent = ':root,html.qb-dark,body.qb-dark{--accent:#' + h +
';--accent-deep:' + deep + ';--accent-soft:rgba(' + r + ',' + g + ',' + b + ',.13)}';
(document.head || document.documentElement).appendChild(st);
} catch (e) { }
}
return d;
})();
function mk(tag, cls, text) {
var d = document.createElement(tag);
if (cls) d.className = cls;
if (text != null) d.textContent = text;
return d;
}
function makePanel(title, extra) {
var panel = mk('div', 'qb-panel');
var hd = mk('div', 'qb-panel-hd');
hd.appendChild(mk('span', 'qb-panel-title', title));
if (extra) hd.appendChild(mk('span', 'qb-count', extra));
panel.appendChild(hd);
return panel;
}
var LOGO_SVG =
'<svg width="30" height="30" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
'<g fill="none" stroke="currentColor" stroke-width="7.4" stroke-linecap="round">' +
'<path d="M9.8 9.8 L22.2 22.2"/><path d="M22.2 9.8 L9.8 22.2"/></g>' +
'<circle class="qb-logo-dot" cx="4.9" cy="27.1" r="3.1"/></svg>';
function renderNav() {
if (!document.body) return null;
var explicit = !!((window.LS_CONFIG && window.LS_CONFIG.nav) ||
(window.QB_CONFIG && window.QB_CONFIG.nav));
var nav = document.querySelector('.qb-nav');
var shell = !!nav && !nav.querySelector('.qb-brand');
if (nav && !shell && !explicit && nav.getAttribute('data-qb-pre') !== '1') return nav;
var dup = document.querySelectorAll('.qb-nav');
for (var j = dup.length - 1; j >= 0; j--) {
if (dup[j] !== nav && dup[j].parentNode) dup[j].parentNode.removeChild(dup[j]);
}
if (!nav) {
nav = mk('div', 'qb-nav');
nav.id = 'qb-nav';
document.body.insertBefore(nav, document.body.firstChild);
} else {
nav.innerHTML = '';
if (nav.parentNode !== document.body) document.body.insertBefore(nav, document.body.firstChild);
}
var n = CFG.nav || {};
var links = n.links instanceof Array ? n.links : [];
var brand = n.brand || '';
var inner = mk('div', 'qb-nav-inner');
var brandA = mk('a', 'qb-brand');
brandA.href = resolveHref(n.home || '/');
if (n.logo) {
var lbox = mk('span', 'qb-logo');
var img = document.createElement('img');
img.src = n.logo;
img.alt = brand;
img.width = 30;
img.height = 30;
lbox.appendChild(img);
brandA.appendChild(lbox);
}
if (brand) brandA.appendChild(mk('span', 'qb-brand-text', brand));
var markOn = (n.mark === false) ? false : (n.mark === true ? true : !n.logo);
if (markOn) {
var mbox = mk('span', 'qb-logo');
mbox.setAttribute('aria-hidden', 'true');
mbox.innerHTML = LOGO_SVG;
brandA.appendChild(mbox);
}
inner.appendChild(brandA);
if (links.length) {
var wrap = mk('nav', 'qb-links');
links.forEach(function (it) {
if (!it) return;
var txt = it.t || it.text;
if (!txt) return;
var a = mk('a', it.on ? 'on' : null, txt);
a.href = resolveHref(it.h || it.href || '#');
if (it.b || it.blank) {
a.target = '_blank';
a.rel = 'noopener';
}
wrap.appendChild(a);
});
inner.appendChild(wrap);
}
var actions = mk('div', 'qb-actions');
renderThemeUi(actions);
if (n.dark !== false) {
var btn = mk('a', 'qb-dark-btn');
btn.id = 'qb-dark-toggle';
btn.href = 'javascript:void(0)';
btn.title = '切换暗色模式';
btn.setAttribute('rel', 'nofollow noopener');
var icon = mk('i', null, '🌙');
icon.id = 'qb-dark-icon';
btn.appendChild(icon);
actions.appendChild(btn);
}
if (actions.children.length) inner.appendChild(actions);
nav.appendChild(inner);
if (document.body.firstElementChild !== nav) {
document.body.insertBefore(nav, document.body.firstElementChild);
}
return nav;
}
function renderNotice() {
var c = CFG.notice;
if (!c || c.show === false) return;
var html = c.html || '';
if (!html) return;
if (document.getElementById('qb-notice')) return;
var host = document.getElementById('sidebar_news');
if (host) {
var h3 = host.querySelector('h3');
if (h3 && c.title) h3.textContent = c.title;
var native = document.getElementById('blog-news');
if (native) native.style.display = 'none';
var box = mk('div', 'sidebar-news');
box.id = 'qb-notice';
box.innerHTML = html;
host.appendChild(box);
return;
}
var right = document.getElementById('sideBarMain');
if (!right || right.querySelector('#qb-notice')) return;
var panel = makePanel(c.title || '公告');
var bd = mk('div', null);
bd.id = 'qb-notice';
bd.innerHTML = html;
panel.appendChild(bd);
right.insertBefore(panel, right.firstChild);
}
var NUM_HEAD = /^(\d+(?:\.\d+)*\s*[.、)）]|[（(][一二三四五六七八九十百\d]+[)）]|[一二三四五六七八九十]+\s*[、.]|第[一二三四五六七八九十百\d]+[章节部篇]|(?:step|chapter|part)\s*\d)/i;
function buildToc(body, left) {
var heads = [].slice.call(body.querySelectorAll('h1, h2, h3, h4')).filter(function (h) {
var t = (h.textContent || '').trim();
return t.length > 1 && h.offsetParent !== null;
});
if (!(heads.length > 1)) return false;
var panel = makePanel('文章目录', heads.length + ' 节');
var list = mk('ul', 'qb-toc-list');
heads.forEach(function (h, i) {
if (!h.id) h.id = 'qb-h-' + i;
var lv = h.tagName === 'H1' ? 2 : (h.tagName === 'H2' ? 2 : (h.tagName === 'H3' ? 3 : 4));
var txt = (h.textContent || '').trim();
var li = mk('li', 'qb-lv' + lv + (NUM_HEAD.test(txt) ? ' qb-nonum' : ''));
var a = mk('a');
a.href = '#' + h.id;
a.title = txt;
a.textContent = txt;
a.setAttribute('data-t', h.id);
li.appendChild(a);
list.appendChild(li);
});
panel.appendChild(list);
left.insertBefore(panel, left.firstChild);
list.addEventListener('click', function (e) {
var a = e.target.closest ? e.target.closest('a') : null;
if (!a) return;
var t = document.getElementById(a.getAttribute('data-t'));
if (!t) return;
e.preventDefault();
window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 72, behavior: 'smooth' });
history.replaceState(null, '', a.getAttribute('href'));
});
var links = [].slice.call(list.querySelectorAll('a'));
var byId = {};
links.forEach(function (a) { byId[a.getAttribute('data-t')] = a; });
var box = left;
var lock = false;
function spy() {
lock = false;
var line = 120, cur = links[0];
heads.forEach(function (h) {
if (line >= h.getBoundingClientRect().top) cur = byId[h.id];
});
if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 60) {
cur = links[links.length - 1];
}
links.forEach(function (a) {
if (a === cur) { a.classList.add('on'); } else { a.classList.remove('on'); }
});
if (cur && (box.scrollTop > cur.offsetTop ||
cur.offsetTop > box.scrollTop + box.clientHeight - 40)) {
box.scrollTo({ top: cur.offsetTop - box.clientHeight / 2, behavior: 'smooth' });
}
}
window.addEventListener('scroll', function () {
if (lock) return;
lock = true;
requestAnimationFrame(spy);
}, { passive: true });
spy();
return true;
}
function buildPostList(left) {
var posts = [].slice.call(document.querySelectorAll(
'#mainContent .day .postTitle a,' +
'#mainContent .PostList .postTitl2 a,' +
'#mainContent .entrylistItemTitle,' +
'#mainContent .category-list-item a'
));
if (!posts.length) { return false; }
var panel = makePanel('文章列表', '');
var list = mk('ul', 'qb-toc-list');
posts.forEach(function (src) {
var txt = (src.textContent || '').replace(/\[\s*置顶\s*\]/g, '').replace(/\s+/g, ' ').trim();
if (!txt) return;
var li = mk('li', 'qb-lv2');
var a = mk('a');
a.href = src.href;
a.textContent = txt;
a.title = txt;
var day = src.closest ? src.closest('.day') : null;
var dt = day ? day.querySelector('.dayTitle') : null;
if (dt) a.title = (dt.textContent || '').replace(/\s+/g, ' ').trim() + ' · ' + txt;
li.appendChild(a);
list.appendChild(li);
});
if (!list.children.length) return false;
panel.appendChild(list);
var n = list.children.length;
list.style.overflowY = 'auto';
list.style.overscrollBehavior = 'contain';
panel.children[0].appendChild(mk('span', 'qb-count', n + ' 篇'));
left.insertBefore(panel, left.firstChild);
fitPostList(list, panel);
watchOverflow(list, function () { fitPostList(list, panel); });
return true;
}
function fitPostList(list, panel) {
var left = document.getElementById('qb-left');
if (!left || !panel) return;
var mh = parseFloat(getComputedStyle(left).maxHeight);
if (!mh || isNaN(mh)) mh = window.innerHeight - 96;
list.style.maxHeight = '';
var chrome = panel.offsetHeight - list.offsetHeight;
var avail = Math.floor(mh - chrome);
if (avail >= 260 && list.scrollHeight > avail) list.style.maxHeight = avail + 'px';
}
function watchOverflow(el, extra) {
function upd() {
if (extra) extra();
var over = el.scrollHeight - el.clientHeight > 4;
if (over) { el.classList.add('qb-scroll'); } else { el.classList.remove('qb-scroll'); }
}
upd();
requestAnimationFrame(upd);
window.addEventListener('resize', upd);
window.addEventListener('load', upd);
}
function moveSideWidgets() {}
function watchSideColumn() {}
function lazyImages() {
var imgs = [].slice.call(document.querySelectorAll('#cnblogs_post_body img'));
imgs.forEach(function (img, i) {
if (!(i > 1)) return;
if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
img.setAttribute('decoding', 'async');
});
}
function markNav() {
var links = document.querySelectorAll('.qb-links a');
if (!links.length) return;
var here = location.href.replace(/[?#].*$/, '').replace(/\/$/, '');
links.forEach(function (a) {
var t = a.href.replace(/[?#].*$/, '').replace(/\/$/, '');
if (t === here) { a.classList.add('on'); } else { a.classList.remove('on'); }
});
}
function hoistNav() {
var nav = document.querySelector('.qb-nav');
if (!nav || !document.body) return;
if (nav.parentNode === document.body) return;
document.body.insertBefore(nav, document.body.firstChild);
}
function splitDayGroups() {
[].forEach.call(document.querySelectorAll('#mainContent .day'), function (day) {
if (day.getAttribute('data-qb-split')) return;
var seps = 0;
[].forEach.call(day.children, function (c) {
if (c.classList && c.classList.contains('postSeparator')) seps++;
});
if (!seps) return;
var groups = [[]];
[].slice.call(day.childNodes).forEach(function (n) {
if (n.nodeType === 1 && n.classList && n.classList.contains('postSeparator')) {
groups.push([]);
return;
}
groups[groups.length - 1].push(n);
});
var valid = groups.filter(function (g) {
return g.some(function (n) {
return n.nodeType === 1 && n.classList && n.classList.contains('postTitle');
});
});
if (valid.length < 2) return;
var anchor = day;
valid.forEach(function (g) {
var box = document.createElement('div');
box.className = day.className;
box.setAttribute('data-qb-split', '1');
g.forEach(function (n) { box.appendChild(n); });
anchor.parentNode.insertBefore(box, anchor.nextSibling);
anchor = box;
});
if (day.parentNode) day.parentNode.removeChild(day);
});
}
function enhancePager() {
var main = document.getElementById('mainContent');
if (!main) return;
var firstArt = main.querySelector('.day, .entrylistItem, .PostList');
[].forEach.call(main.querySelectorAll('.pager, #nav_next_page'), function (unit) {
if (unit.getAttribute('data-qb-pg')) return;
unit.setAttribute('data-qb-pg', '1');
var bar = unit.parentNode;
if (bar && bar.classList && bar.classList.contains('topicListFooter')) {
bar.classList.add('qb-pager-bar');
}
if (!(unit.textContent || '').replace(/\s+/g, '')) {
unit.style.display = 'none';
return;
}
if (firstArt && firstArt !== unit && !unit.contains(firstArt)) {
var rel = firstArt.compareDocumentPosition(unit);
if (!(rel & 4)) {
unit.classList.add('qb-pager-top');
return;
}
}
unit.classList.add('qb-pager');
[].forEach.call(unit.querySelectorAll('a'), function (a) {
var t = (a.textContent || '').replace(/\s+/g, '');
if (t === '上一页') a.classList.add('qb-prev');
else if (t === '下一页') a.classList.add('qb-next');
});
[].slice.call(unit.childNodes).forEach(function (n) {
if (n.nodeType === 3 && n.nodeValue.replace(/\s+/g, '')) {
unit.replaceChild(mk('span', 'qb-cur', n.nodeValue.replace(/\s+/g, '')), n);
}
});
var hasNext = unit.querySelector('.qb-next');
if (!unit.querySelector('.qb-cur')) {
var cur = mk('span', 'qb-cur', '1');
if (hasNext) unit.insertBefore(cur, hasNext);
else unit.appendChild(cur);
}
if (!unit.querySelector('.qb-prev')) {
unit.insertBefore(mk('span', 'qb-dis qb-prev', '上一页'), unit.firstChild);
}
if (!unit.querySelector('.qb-next')) {
unit.appendChild(mk('span', 'qb-dis qb-next', '下一页'));
}
});
[].forEach.call(main.querySelectorAll('.qb-pager-bar'), function (bar) {
var vis = [].slice.call(bar.querySelectorAll('.pager, #nav_next_page')).filter(function (u) {
return u.style.display !== 'none' && !u.classList.contains('qb-pager-top');
});
if (!vis.length) bar.setAttribute('data-qb-empty', '1');
});
}
var LANG_RE = /(?:^|\s)(?:language|lang)-([\w+#.-]+)/i;
var FOLD_LINES = 34;
var CODE_PENDING = [];
function legacyCopy(t) {
var ta = document.createElement('textarea');
ta.value = t;
ta.setAttribute('readonly', '');
ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0';
document.body.appendChild(ta);
ta.select();
var ok = false;
try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
document.body.removeChild(ta);
return ok;
}
function copyText(t) {
if (navigator.clipboard && navigator.clipboard.writeText) {
return navigator.clipboard.writeText(t).catch(function () {
return legacyCopy(t) ? null : Promise.reject(new Error('copy'));
});
}
return legacyCopy(t) ? Promise.resolve() : Promise.reject(new Error('copy'));
}
function enhanceCode() {
var opt = (CFG.code && typeof CFG.code === 'object') ? CFG.code : {};
var wantNo = opt.lineNumbers !== false;
var wantCopy = opt.copy !== false;
var body = document.getElementById('cnblogs_post_body');
if (!body || !body.querySelectorAll) return;
var pres = body.querySelectorAll('pre');
for (var i = 0; i < pres.length; i++) {
var pre = pres[i];
if (pre.getAttribute('data-qb-code')) continue;
if (pre.closest && pre.closest('.cnblogs_code')) continue;
var code = pre.querySelector('code');
if (!code) continue;
var raw = code.textContent.replace(/\r\n?/g, '\n');
if (!raw.trim()) continue;
raw = raw.replace(/\n+$/, '');
var lines = raw.split('\n');
var m = LANG_RE.exec(code.className || '');
var lang = m ? m[1].toLowerCase() : '';
pre.setAttribute('data-qb-code', '1');
var wrap = document.createElement('div');
wrap.className = 'qb-code' + (wantNo ? '' : ' no-line-numbers');
pre.parentNode.insertBefore(wrap, pre);
wrap.appendChild(pre);
if (wantNo) CODE_PENDING.push({ pre: pre, code: code, raw: raw, lines: lines });
var bar = document.createElement('div');
bar.className = 'qb-code-bar';
var tag = document.createElement('span');
tag.className = 'qb-code-lang';
tag.textContent = lang || 'code';
bar.appendChild(tag);
if (wantCopy) {
var btn = document.createElement('button');
btn.type = 'button';
btn.className = 'qb-code-copy';
btn.textContent = '复制';
btn.setAttribute('aria-label', '复制代码');
(function (b, txt) {
b.addEventListener('click', function () {
copyText(txt).then(function () {
b.textContent = '已复制';
b.className = 'qb-code-copy done';
}, function () {
b.textContent = '复制失败';
b.className = 'qb-code-copy';
}).then(function () {
setTimeout(function () {
b.textContent = '复制';
b.className = 'qb-code-copy';
}, 1400);
});
});
})(btn, raw);
bar.appendChild(btn);
}
wrap.insertBefore(bar, pre);
if (lines.length > FOLD_LINES) {
wrap.className += ' qb-folded';
var more = document.createElement('button');
more.type = 'button';
more.className = 'qb-code-more';
more.setAttribute('aria-expanded', 'false');
more.textContent = '展开全部（共 ' + lines.length + ' 行）';
(function (w, b, n) {
b.addEventListener('click', function () {
var back = w.classList.toggle('qb-folded');
b.setAttribute('aria-expanded', back ? 'false' : 'true');
b.textContent = back ? '展开全部（共 ' + n + ' 行）' : '收起';
if (back && w.getBoundingClientRect().top < 60) {
window.scrollTo({
top: w.getBoundingClientRect().top + window.pageYOffset - 80,
behavior: 'smooth'
});
}
});
})(wrap, more, lines.length);
wrap.appendChild(more);
}
}
}
function settleCode() {
var pend = CODE_PENDING;
CODE_PENDING = [];
for (var i = 0; i < pend.length; i++) {
var it = pend[i];
var wrap = it.pre.parentNode;
if (!wrap || !wrap.classList || !wrap.classList.contains('qb-code')) continue;
if (wrap.classList.contains('no-line-numbers')) continue;
if (it.pre.querySelector('.line-numbers-rows')) continue;
if (it.code.children.length) continue;
it.code.textContent = '';
var frag = document.createDocumentFragment();
for (var j = 0; j < it.lines.length; j++) {
var ln = document.createElement('span');
ln.className = 'qb-cl';
ln.textContent = it.lines[j];
frag.appendChild(ln);
}
it.code.appendChild(frag);
it.code.style.setProperty('--qb-ln-w', Math.max(2, String(it.lines.length).length) + 'ch');
}
}
if (document.readyState === 'complete') {
setTimeout(settleCode, 0);
} else {
window.addEventListener('load', function () { setTimeout(settleCode, 350); });
}
function initFavicon() {
var head = document.head || document.querySelector('head');
if (!head) return;
var src = document.getElementById('page_begin_html');
if (!src) return;
function iconType(href) {
var p = href.split('?')[0].split('#')[0].toLowerCase();
if (p.slice(-4) === '.png') return 'image/png';
if (p.slice(-4) === '.svg') return 'image/svg+xml';
if (p.slice(-5) === '.jpeg') return 'image/jpeg';
if (p.slice(-4) === '.jpg') return 'image/jpeg';
if (p.slice(-4) === '.gif') return 'image/gif';
if (p.slice(-4) === '.webp') return 'image/webp';
if (p.slice(-4) === '.ico') return 'image/x-icon';
return '';
}
var userHrefs = [];
[].forEach.call(src.querySelectorAll('link[rel="shortcut icon"], link[rel="icon"]'), function (el) {
var h = el.getAttribute('href') || el.href;
if (h && userHrefs.indexOf(h) === -1) userHrefs.push(h);
});
if (!userHrefs.length) return;
function isIconLink(el) {
if (!el || el.nodeName !== 'LINK') return false;
var rel = (el.getAttribute('rel') || '').toLowerCase();
return rel === 'icon' || rel === 'shortcut icon';
}
var FAV_VER = '6.20';
function bust(href) {
if (/[?&]v=/.test(href)) return href;
return href + (href.indexOf('?') === -1 ? '?' : '&') + 'v=' + FAV_VER;
}
var desired = [];
userHrefs.forEach(function (h) {
var b = bust(h);
if (desired.indexOf(b) === -1) desired.push(b);
});
function alreadyOK() {
var cur = [].slice.call(head.querySelectorAll('link[rel="shortcut icon"], link[rel="icon"]'));
if (cur.length !== desired.length) return false;
for (var i = 0; i < cur.length; i++) {
if (desired.indexOf(cur[i].getAttribute('href')) === -1) return false;
}
return document.querySelectorAll('body link[rel="shortcut icon"], body link[rel="icon"]').length === 0;
}
function apply() {
if (alreadyOK()) return;
[].forEach.call(document.querySelectorAll('body link[rel="shortcut icon"], body link[rel="icon"]'), function (el) {
if (el.parentNode) el.parentNode.removeChild(el);
});
[].forEach.call(head.querySelectorAll('link[rel="shortcut icon"], link[rel="icon"]'), function (el) {
if (el.parentNode) el.parentNode.removeChild(el);
});
desired.forEach(function (href) {
var link = document.createElement('link');
link.setAttribute('rel', 'icon');
var t = iconType(href);
if (t) link.setAttribute('type', t);
link.setAttribute('href', href);
head.appendChild(link);
});
var touch = head.querySelector('link[rel="apple-touch-icon"]');
if (touch) touch.setAttribute('href', desired[0]);
}
apply();
try {
new MutationObserver(function (ms) {
var dirty = false;
ms.forEach(function (m) {
if (m.type === 'childList') {
[].forEach.call(m.addedNodes, function (n) {
if (!isIconLink(n)) return;
var h = n.getAttribute('href');
if (!h || desired.indexOf(h) === -1) {
if (n.parentNode) n.parentNode.removeChild(n);
dirty = true;
}
});
} else if (m.type === 'attributes' && m.attributeName === 'href') {
var n2 = m.target;
if (!isIconLink(n2) || !head.contains(n2)) return;
if (desired.indexOf(n2.getAttribute('href')) === -1) dirty = true;
}
});
if (dirty) apply();
}).observe(head, { childList: true, attributes: true });
} catch (e) { }
var n = 0;
var t = setInterval(function () {
n++;
apply();
if (n >= 10) clearInterval(t);
}, 1000);
}
function syncDarkClass(on) {
var root = document.documentElement;
var body = document.body;
if (on) {
root.classList.add('qb-dark');
if (body) body.classList.add('qb-dark');
} else {
root.classList.remove('qb-dark');
if (body) body.classList.remove('qb-dark');
}
}
function manualDark() {
var v = null;
try { v = localStorage && localStorage.getItem('qb-dark'); } catch (e) { }
return (v === '1' || v === '0') ? v : null;
}
function darkPref() {
var v = manualDark();
if (v === '1') return true;
if (v === '0') return false;
if (CFG.dark === 'on') return true;
if (CFG.dark === 'off') return false;
return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function initDarkMode() {
var btn = document.getElementById('qb-dark-toggle');
var icon = document.getElementById('qb-dark-icon');
if (!btn) return;
var on = darkPref();
syncDarkClass(on);
if (icon) icon.textContent = on ? '☀️' : '🌙';
btn.addEventListener('click', function (e) {
e.preventDefault();
on = !on;
syncDarkClass(on);
if (icon) icon.textContent = on ? '☀️' : '🌙';
if (localStorage) localStorage.setItem('qb-dark', on ? '1' : '0');
});
if (window.matchMedia) {
var mq = window.matchMedia('(prefers-color-scheme: dark)');
var onChange = function () {
if (manualDark() !== null) return;
on = darkPref();
syncDarkClass(on);
if (icon) icon.textContent = on ? '☀️' : '🌙';
};
if (mq.addEventListener) mq.addEventListener('change', onChange);
else if (mq.addListener) mq.addListener(onChange);
}
}
var THEMES = [
{ k: 'purple', n: '紫（默认）', l: '#d05ce8', d: '#d98bf0' },
{ k: 'blue', n: '蓝', l: '#3b82f6', d: '#58a6ff' },
{ k: 'teal', n: '青', l: '#0d9488', d: '#2dd4bf' },
{ k: 'orange', n: '橙', l: '#ea580c', d: '#fb923c' },
{ k: 'green', n: '绿', l: '#16a34a', d: '#4ade80' },
{ k: 'rose', n: '玫红', l: '#e11d48', d: '#fb7185' }
];
var PALETTE_SVG =
'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
'stroke-width="1.9" stroke-linejoin="round">' +
'<path d="M12 3.4c3.5 3.7 6.1 6.7 6.1 9.9a6.1 6.1 0 0 1-12.2 0c0-3.2 2.6-6.2 6.1-9.9z"/>' +
'<path d="M9.3 13.4a2.7 2.7 0 0 0 2.7 2.7" stroke-linecap="round"/></svg>';
function themePref() {
var v = null;
try { v = localStorage && localStorage.getItem('qb-theme'); } catch (e) { }
for (var i = 0; i < THEMES.length; i++) {
if (THEMES[i].k === v) return v;
}
return 'purple';
}
function rgbOf(h) {
var m = /^#?([0-9a-f]{6})$/i.exec(h);
if (!m) return [0, 0, 0];
var v = m[1];
return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function shade(h, f) {
return '#' + rgbOf(h).map(function (v) {
return ('0' + Math.max(0, Math.min(255, Math.round(v * f))).toString(16)).slice(-2);
}).join('');
}
function tint(h, f) {
return '#' + rgbOf(h).map(function (v) {
return ('0' + Math.max(0, Math.min(255, Math.round(v + (255 - v) * f))).toString(16)).slice(-2);
}).join('');
}
function applyTheme(k) {
var t = null, i;
for (i = 0; i < THEMES.length; i++) {
if (THEMES[i].k === k) t = THEMES[i];
}
var old = document.getElementById('qb-theme-sel');
if (old && old.parentNode) old.parentNode.removeChild(old);
if (!t || t.k === 'purple') return;
var lr = rgbOf(t.l).join(','), dr = rgbOf(t.d).join(',');
try {
var st = document.createElement('style');
st.id = 'qb-theme-sel';
st.textContent =
':root{--accent:' + t.l + ' !important;--accent-deep:' + shade(t.l, .82) +
' !important;--accent-soft:rgba(' + lr + ',.11) !important}' +
'html.qb-dark,body.qb-dark{--accent:' + t.d + ' !important;--accent-deep:' +
tint(t.d, .2) + ' !important;--accent-soft:rgba(' + dr + ',.16) !important}';
(document.head || document.documentElement).appendChild(st);
} catch (e) { }
}
function renderThemeUi(inner) {
var wrap = mk('div', 'qb-theme');
var btn = mk('button', 'qb-theme-btn');
btn.type = 'button';
btn.id = 'qb-theme-toggle';
btn.title = '主题色';
btn.setAttribute('aria-label', '切换主题色');
btn.setAttribute('aria-haspopup', 'true');
btn.setAttribute('aria-expanded', 'false');
btn.innerHTML = PALETTE_SVG;
var pop = mk('div', 'qb-theme-pop');
pop.id = 'qb-theme-pop';
pop.setAttribute('role', 'menu');
pop.hidden = true;
THEMES.forEach(function (t) {
var d = mk('button', 'qb-theme-dot');
d.type = 'button';
d.setAttribute('role', 'menuitemradio');
d.setAttribute('data-theme', t.k);
d.setAttribute('aria-label', t.n);
d.title = t.n;
d.style.setProperty('--d', t.l);
d.style.setProperty('--d2', t.d);
pop.appendChild(d);
});
wrap.appendChild(btn);
wrap.appendChild(pop);
inner.appendChild(wrap);
return wrap;
}
function markTheme(k) {
var dots = document.querySelectorAll('.qb-theme-dot');
for (var i = 0; i < dots.length; i++) {
var on = dots[i].getAttribute('data-theme') === k;
if (on) { dots[i].classList.add('on'); } else { dots[i].classList.remove('on'); }
dots[i].setAttribute('aria-checked', on ? 'true' : 'false');
}
}
function initTheme() {
var btn = document.getElementById('qb-theme-toggle');
var pop = document.getElementById('qb-theme-pop');
if (!btn || !pop) return;
markTheme(themePref());
function close() {
pop.hidden = true;
btn.setAttribute('aria-expanded', 'false');
}
function open() {
markTheme(themePref());
pop.hidden = false;
btn.setAttribute('aria-expanded', 'true');
}
btn.addEventListener('click', function (e) {
e.preventDefault();
e.stopPropagation();
if (pop.hidden) { open(); } else { close(); }
});
pop.addEventListener('click', function (e) {
var d = e.target.closest ? e.target.closest('.qb-theme-dot') : null;
if (!d) return;
e.preventDefault();
var k = d.getAttribute('data-theme');
applyTheme(k);
try { if (localStorage) localStorage.setItem('qb-theme', k); } catch (err) { }
markTheme(k);
close();
btn.focus();
});
document.addEventListener('click', function (e) {
if (pop.hidden) return;
if (pop.contains(e.target) || btn.contains(e.target)) return;
close();
});
document.addEventListener('keydown', function (e) {
if (e.key !== 'Escape' || pop.hidden) return;
close();
btn.focus();
});
}
var CJK_RE = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g;
function postChars(body) {
var c = body.cloneNode(true);
var junk = c.querySelectorAll('script, style, .qb-copyright, .qb-readtime, .qb-code-bar');
for (var i = 0; i < junk.length; i++) junk[i].parentNode.removeChild(junk[i]);
var t = (c.textContent || '').replace(/\s+/g, '');
var cjk = (t.match(CJK_RE) || []).length;
var other = t.length - cjk;
return { chars: t.length, units: cjk + Math.round(other / 6) };
}
function fmtNum(n) {
var s = String(n), out = '';
for (var i = 0; i < s.length; i++) {
if (i && (s.length - i) % 3 === 0) out += ',';
out += s.charAt(i);
}
return out;
}
function buildReadTime(body) {
if (document.querySelector('.qb-readtime')) return;
var st = postChars(body);
if (st.chars < 80) return;
var min = Math.max(1, Math.round(st.units / 350));
var el = mk('div', 'qb-readtime');
el.appendChild(mk('span', 'qb-rt-min', '约 ' + min + ' 分钟'));
el.appendChild(mk('span', 'qb-rt-sep', '·'));
el.appendChild(mk('span', 'qb-rt-word', fmtNum(st.chars) + ' 字'));
var pb = body.parentNode;
if (pb && pb.parentNode) pb.parentNode.insertBefore(el, pb);
}
function buildAnchors(body) {
var hs = body.querySelectorAll('h2, h3');
for (var i = 0; i < hs.length; i++) {
var h = hs[i];
if (h.querySelector('.qb-hanchor')) continue;
if (!h.id) h.id = 'qb-sec-' + i;
var a = mk('a', 'qb-hanchor');
a.href = '#' + h.id;
a.title = '本节链接';
a.setAttribute('aria-label', '本节链接');
h.appendChild(a);
}
}
function buildCopyright(body) {
if (document.querySelector('.qb-copyright')) return;
var author = '';
var pa = document.querySelector('#post_detail .postDesc a[href^="http"]');
if (pa && pa.textContent && pa.textContent.trim().length < 24) author = pa.textContent.trim();
if (!author) author = SITE_NAME || '博主';
var dateEl = document.getElementById('post-date');
var date = dateEl ? (dateEl.textContent || '').trim().split(/\s+/)[0] : '';
var url = location.origin + location.pathname;
var box = mk('div', 'qb-copyright');
box.appendChild(mk('p', 'qb-cr-h', '版权声明'));
var p1 = mk('p', 'qb-cr-line');
p1.appendChild(mk('span', null, '本文作者：'));
var aa = mk('a', null, author);
aa.href = HOME;
p1.appendChild(aa);
if (date) {
p1.appendChild(mk('span', null, '　首发：' + date));
}
box.appendChild(p1);
var p2 = mk('p', 'qb-cr-line');
p2.appendChild(mk('span', null, '原文链接：'));
var al = mk('a', null, url);
al.href = url;
p2.appendChild(al);
box.appendChild(p2);
box.appendChild(mk('p', 'qb-cr-tip', '文章均为个人实践总结，转载请注明作者与原文链接。'));
body.appendChild(box);
}
function enhancePost() {
var body = document.getElementById('cnblogs_post_body');
if (!body) return;
buildReadTime(body);
buildAnchors(body);
buildCopyright(body);
}
var CAT_KEY = 'qb-cats-v1:';
var CAT_TTL = 7 * 24 * 3600 * 1000;
var TAXO = { list: null, pending: false, done: false };
function catStoreKey() {
return CAT_KEY + location.host + (APP ? '/' + APP : '');
}
function readCats() {
try {
var o = JSON.parse(localStorage.getItem(catStoreKey()) || 'null');
if (!o || !o.t || !(o.list instanceof Array) || !o.list.length) return null;
if (Math.abs(Date.now() - o.t) > CAT_TTL) return null;
return o.list;
} catch (e) { return null; }
}
function writeCats(list) {
try {
localStorage.setItem(catStoreKey(), JSON.stringify({ t: Date.now(), list: list }));
} catch (e) { }
}
function parseCats(html) {
var doc = new DOMParser().parseFromString(html, 'text/html');
var nodes = doc.querySelectorAll('.category-list-item a');
var out = [], seen = {};
[].forEach.call(nodes, function (a) {
var t = (a.textContent || '').replace(/\s+/g, ' ').trim();
var m = t.match(/^(.*?)\s*[（(]\s*(\d+)\s*[)）]\s*$/);
var name = (m ? m[1] : t).trim();
var href = a.getAttribute('href') || '';
if (!name || !href || seen[name]) return;
seen[name] = 1;
out.push({ n: name, u: href, c: m ? parseInt(m[2], 10) : 0 });
});
return out;
}
function loadCats(cb) {
var hit = readCats();
if (hit) { TAXO.list = hit; TAXO.done = true; if (cb) cb(); return; }
if (!window.fetch) { TAXO.done = true; if (cb) cb(); return; }
TAXO.pending = true;
fetch(HOME + 'categories', { credentials: 'same-origin' })
.then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
.then(function (h) {
var list = parseCats(h);
if (list.length) { TAXO.list = list; writeCats(list); }
})
.catch(function () { })
.then(function () { TAXO.pending = false; TAXO.done = true; if (cb) cb(); });
}
function postKeywords() {
var m = document.querySelector('meta[name="keywords"]');
if (!m) return [];
var out = [], seen = {};
String(m.getAttribute('content') || '').split(/[,，]/).forEach(function (s) {
var t = s.replace(/\s+/g, ' ').trim();
if (!t || seen[t]) return;
seen[t] = 1;
out.push(t);
});
return out;
}
function tagHref(name) {
return HOME + 'tag/' + encodeURIComponent(name);
}
function splitTaxo(toks) {
var list = TAXO.list || [];
var tags = toks.slice();
var cat = null, i, j;
if (list.length) {
for (i = toks.length - 1; i >= 0; i--) {
for (j = 0; j < list.length; j++) {
if (list[j].n === toks[i]) { cat = list[j]; break; }
}
if (cat) { tags.splice(i, 1); break; }
}
} else if (!TAXO.done && toks.length) {
cat = { n: toks[toks.length - 1], u: HOME + 'categories', c: 0 };
tags.pop();
}
return { cat: cat, tags: tags };
}
function paintTax(box, toks) {
var parts = splitTaxo(toks);
box.textContent = '';
if (parts.cat) {
var c = mk('a', 'qb-tax-cat');
c.href = parts.cat.u || (HOME + 'categories');
c.title = '分类：' + parts.cat.n;
c.appendChild(mk('span', 'qb-tax-dot'));
c.appendChild(mk('span', null, parts.cat.n));
box.appendChild(c);
}
var MAX = 4;
var all = box.getAttribute('data-open') === '1';
var shown = all ? parts.tags.length : Math.min(parts.tags.length, MAX);
for (var i = 0; i < shown; i++) {
var a = mk('a', 'qb-tax-tag', parts.tags[i]);
a.href = tagHref(parts.tags[i]);
a.title = '标签：' + parts.tags[i];
box.appendChild(a);
}
var rest = parts.tags.length - shown;
if (rest > 0) {
var b = mk('button', 'qb-tax-more', '+' + rest);
b.type = 'button';
b.title = '展开其余 ' + rest + ' 个标签';
b.addEventListener('click', function () {
box.setAttribute('data-open', '1');
paintTax(box, box._qbToks || toks);
});
box.appendChild(b);
}
if (!box.children.length && box.parentNode) box.parentNode.removeChild(box);
}
function initPostTax() {
var title = document.querySelector('#post_detail .postTitle');
if (!title || !title.parentNode) return null;
var box = document.querySelector('.qb-tax');
var toks = postKeywords();
if (!toks.length) {
if (box && box.parentNode) box.parentNode.removeChild(box);
return null;
}
if (!box) {
box = mk('div', 'qb-tax');
box.setAttribute('role', 'group');
box.setAttribute('aria-label', '文章分类与标签');
title.parentNode.insertBefore(box, title.nextSibling);
}
box._qbToks = toks;
paintTax(box, toks);
return box;
}
function watchCatFade(bar) {
function upd() {
var more = bar.scrollWidth - bar.clientWidth - bar.scrollLeft > 4;
if (more) { bar.classList.add('qb-fade-r'); } else { bar.classList.remove('qb-fade-r'); }
}
upd();
requestAnimationFrame(upd);
bar.addEventListener('scroll', upd, { passive: true });
window.addEventListener('resize', upd);
window.addEventListener('load', upd);
}
function initCatBar() {
var flow = document.querySelector('#mainContent .forFlow');
if (!flow || !TAXO.list || !TAXO.list.length) return null;
var isHome = !!flow.querySelector('.day');
var m = location.pathname.match(/\/category\/(\d+)\.html$/);
if (!isHome && !m) return null;
var bar = document.querySelector('.qb-catbar');
if (!bar) {
bar = mk('nav', 'qb-catbar');
bar.setAttribute('aria-label', '文章分类');
bar.setAttribute('data-qb-catbar', '1');
flow.insertBefore(bar, flow.firstChild);
watchCatFade(bar);
}
bar.textContent = '';
var cur = m ? location.pathname : '';
var all = mk('a', 'qb-cat', '全部');
all.href = HOME;
if (!cur) all.className += ' on';
bar.appendChild(all);
TAXO.list.forEach(function (c) {
var a = mk('a', 'qb-cat', c.c ? c.n + ' ' + c.c : c.n);
a.href = c.u;
a.title = '分类：' + c.n + (c.c ? '（' + c.c + ' 篇）' : '');
var path = String(c.u).replace(/^https?:\/\/[^/]+/, '');
if (cur && path === cur) a.className += ' on';
bar.appendChild(a);
});
return bar;
}
function initTaxonomy() {
if (!TAXO.list) {
var hit = readCats();
if (hit) { TAXO.list = hit; TAXO.done = true; }
}
var box = initPostTax();
initCatBar();
if (TAXO.list) return;
loadCats(function () {
if (box && box._qbToks && box.getAttribute('data-open') !== '1') paintTax(box, box._qbToks);
initCatBar();
});
}
function enhanceTables() {
var body = document.getElementById('cnblogs_post_body');
if (!body) return;
var tables = [].slice.call(body.querySelectorAll('table'));
tables.forEach(function (t) {
var host = t.parentNode;
if (host && host.classList && host.classList.contains('qb-table-wrap')) return;
var wrap = mk('div', 'qb-table-wrap');
host.insertBefore(wrap, t);
wrap.appendChild(t);
function upd() {
var over = wrap.scrollWidth - wrap.clientWidth > 2;
if (over) { wrap.classList.add('qb-x'); } else { wrap.classList.remove('qb-x'); }
}
upd();
requestAnimationFrame(upd);
window.addEventListener('resize', upd);
window.addEventListener('load', upd);
if ('ResizeObserver' in window) {
try { new ResizeObserver(upd).observe(t); } catch (e) { }
}
});
}
function enhanceMarkdown() {
var body = document.getElementById('cnblogs_post_body');
if (!body) return;
var boxes = body.querySelectorAll('li > input[type="checkbox"]');
for (var i = 0; i < boxes.length; i++) {
var li = boxes[i].parentNode;
if (li && li.tagName === 'LI') li.classList.add('qb-task');
var ul = li && li.parentNode;
if (ul && /^(UL|OL)$/.test(ul.tagName)) ul.classList.add('qb-tasklist');
}
}
var MTOC_MQ = window.matchMedia ? window.matchMedia('(max-width: 860px)') : null;
function initMobileToc() {
var src = document.querySelector('#qb-left .qb-toc-list');
if (!src) return;
if (document.getElementById('qb-mtoc')) return;
var items = [].slice.call(src.querySelectorAll('a[data-t]'));
if (items.length < 2) return;
var fab = mk('button', 'qb-mtoc-fab');
fab.type = 'button';
fab.id = 'qb-mtoc-fab';
fab.setAttribute('aria-label', '打开文章目录');
fab.setAttribute('aria-expanded', 'false');
fab.innerHTML =
'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
'stroke-width="2" stroke-linecap="round"><path d="M4 6h16"/><path d="M4 12h11"/>' +
'<path d="M4 18h7"/></svg><span>目录</span>';
document.body.appendChild(fab);
var root = mk('div', 'qb-mtoc');
root.id = 'qb-mtoc';
root.setAttribute('aria-hidden', 'true');
var mask = mk('div', 'qb-mtoc-mask');
var sheet = mk('div', 'qb-mtoc-sheet');
sheet.setAttribute('role', 'dialog');
sheet.setAttribute('aria-modal', 'true');
sheet.setAttribute('aria-label', '文章目录');
var hd = mk('div', 'qb-mtoc-hd');
hd.appendChild(mk('span', 'qb-mtoc-title', '文章目录'));
hd.appendChild(mk('span', 'qb-mtoc-n', items.length + ' 节'));
var x = mk('button', 'qb-mtoc-x');
x.type = 'button';
x.setAttribute('aria-label', '关闭目录');
x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
'stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';
hd.appendChild(x);
var list = mk('ul', 'qb-mtoc-list');
var links = [];
items.forEach(function (it) {
var li = mk('li');
var a = mk('a', null, (it.textContent || '').trim());
a.href = it.getAttribute('href');
a.setAttribute('data-t', it.getAttribute('data-t'));
li.appendChild(a);
list.appendChild(li);
links.push(a);
});
sheet.appendChild(hd);
sheet.appendChild(list);
root.appendChild(mask);
root.appendChild(sheet);
document.body.appendChild(root);
function close() {
if (!root.classList.contains('open')) return;
root.classList.remove('open');
root.setAttribute('aria-hidden', 'true');
fab.setAttribute('aria-expanded', 'false');
document.documentElement.classList.remove('qb-mtoc-lock');
}
function open() {
root.classList.add('open');
root.setAttribute('aria-hidden', 'false');
fab.setAttribute('aria-expanded', 'true');
document.documentElement.classList.add('qb-mtoc-lock');
spy();
}
fab.addEventListener('click', function () {
if (root.classList.contains('open')) { close(); } else { open(); }
});
mask.addEventListener('click', close);
x.addEventListener('click', close);
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape') close();
});
if (MTOC_MQ && MTOC_MQ.addEventListener) {
MTOC_MQ.addEventListener('change', function (e) { if (!e.matches) close(); });
}
list.addEventListener('click', function (e) {
var a = e.target.closest ? e.target.closest('a') : null;
if (!a) return;
var t = document.getElementById(a.getAttribute('data-t'));
if (!t) return;
e.preventDefault();
close();
window.scrollTo({
top: t.getBoundingClientRect().top + window.pageYOffset - 64,
behavior: 'smooth'
});
history.replaceState(null, '', a.getAttribute('href'));
});
var lock = false, heads = [];
links.forEach(function (a) {
var h = document.getElementById(a.getAttribute('data-t'));
if (h) heads.push({ h: h, a: a });
});
function spy() {
lock = false;
if (!heads.length) return;
var line = 110, cur = heads[0].a;
heads.forEach(function (it) {
if (line >= it.h.getBoundingClientRect().top) cur = it.a;
});
if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 60) {
cur = heads[heads.length - 1].a;
}
links.forEach(function (a) {
if (a === cur) { a.classList.add('on'); } else { a.classList.remove('on'); }
});
if (cur && (cur.offsetTop > list.scrollTop + list.clientHeight - 48 ||
cur.offsetTop < list.scrollTop)) {
list.scrollTop = Math.max(0, cur.offsetTop - list.clientHeight / 2);
}
}
window.addEventListener('scroll', function () {
if (lock) return;
lock = true;
requestAnimationFrame(spy);
}, { passive: true });
}
function initMobileMenu() {
var links = document.querySelector('.qb-links');
var inner = document.querySelector('.qb-nav-inner');
var actions = document.querySelector('.qb-actions');
if (!links || !inner || document.getElementById('qb-mmenu')) return;
var items = [].slice.call(links.querySelectorAll('a'));
if (!items.length) return;
var btn = mk('button', 'qb-burger');
btn.type = 'button';
btn.id = 'qb-burger';
btn.setAttribute('aria-label', '打开导航菜单');
btn.setAttribute('aria-expanded', 'false');
btn.innerHTML =
'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
'stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/>' +
'<path d="M4 17h16"/></svg>';
(actions || inner).appendChild(btn);
var root = mk('div', 'qb-mmenu');
root.id = 'qb-mmenu';
root.setAttribute('aria-hidden', 'true');
var mask = mk('div', 'qb-mmenu-mask');
var panel = mk('div', 'qb-mmenu-panel');
panel.setAttribute('role', 'dialog');
panel.setAttribute('aria-modal', 'true');
panel.setAttribute('aria-label', '站点导航');
var hd = mk('div', 'qb-mmenu-hd');
hd.appendChild(mk('span', 'qb-mmenu-title', '导航'));
var x = mk('button', 'qb-mmenu-x');
x.type = 'button';
x.setAttribute('aria-label', '关闭导航');
x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
'stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';
hd.appendChild(x);
var list = mk('ul', 'qb-mmenu-list');
items.forEach(function (src) {
var li = mk('li');
var a = mk('a', src.className || null, src.textContent);
a.href = src.href;
if (src.target) { a.target = src.target; a.rel = 'noopener'; }
li.appendChild(a);
list.appendChild(li);
});
panel.appendChild(hd);
panel.appendChild(list);
root.appendChild(mask);
root.appendChild(panel);
document.body.appendChild(root);
function open() {
root.classList.add('open');
root.setAttribute('aria-hidden', 'false');
btn.setAttribute('aria-expanded', 'true');
document.documentElement.classList.add('qb-mmenu-lock');
}
function close() {
if (!root.classList.contains('open')) return;
root.classList.remove('open');
root.setAttribute('aria-hidden', 'true');
btn.setAttribute('aria-expanded', 'false');
document.documentElement.classList.remove('qb-mmenu-lock');
}
btn.addEventListener('click', function () {
if (root.classList.contains('open')) close(); else open();
});
mask.addEventListener('click', close);
x.addEventListener('click', close);
list.addEventListener('click', function (e) {
var a = e.target.closest ? e.target.closest('a') : null;
if (a) close();
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape') close();
});
var mq = window.matchMedia('(max-width: 860px)');
var onMq = function () { if (!mq.matches) close(); };
if (mq.addEventListener) mq.addEventListener('change', onMq);
else if (mq.addListener) mq.addListener(onMq);
document.documentElement.classList.add('qb-mnav');
}
function posKey() { return 'qb-pos:' + location.pathname; }
var posPruned = false;
function prunePos() {
if (posPruned) return;
posPruned = true;
try {
var keys = [], i, k;
for (i = 0; i < localStorage.length; i++) {
k = localStorage.key(i);
if (k && k.indexOf('qb-pos:') === 0) keys.push(k);
}
if (keys.length <= 60) return;
keys.map(function (key) {
var t = 0;
try { t = (JSON.parse(localStorage.getItem(key)) || {}).t || 0; } catch (e) { t = 0; }
return { k: key, t: t };
}).sort(function (a, b) { return a.t - b.t; })
.slice(0, keys.length - 40)
.forEach(function (it) { localStorage.removeItem(it.k); });
} catch (e) { }
}
function savePos() {
if (!document.getElementById('cnblogs_post_body')) return;
try {
var max = document.documentElement.scrollHeight - window.innerHeight;
if (max < 1200) return;
var y = window.pageYOffset;
if (y < 300) { localStorage.removeItem(posKey()); return; }
localStorage.setItem(posKey(), JSON.stringify({
y: Math.round(y),
h: Math.round(max),
t: Date.now()
}));
prunePos();
} catch (e) { }
}
function initResume() {
if (!document.getElementById('cnblogs_post_body')) return;
if (location.hash) return;
var d = null;
try {
d = JSON.parse(localStorage.getItem(posKey()) || 'null');
} catch (e) { d = null; }
if (!d || !d.y || !d.t) return;
if (Date.now() - d.t > 7 * 864e5) {
try { localStorage.removeItem(posKey()); } catch (e) {}
return;
}
if (d.y < 500) return;
function restore() {
if (window.pageYOffset > 120) return;
var max = document.documentElement.scrollHeight - window.innerHeight;
if (max < 700) return;
var y = Math.min(d.y, max - 40);
if (y < 400) return;
window.scrollTo(0, y);
showToast('已回到上次阅读的位置', '回到开头', function () {
window.scrollTo({ top: 0, behavior: 'smooth' });
try { localStorage.removeItem(posKey()); } catch (e) {}
});
}
if (document.readyState === 'complete') {
setTimeout(restore, 60);
} else {
window.addEventListener('load', function () { setTimeout(restore, 60); });
}
var timer = null;
window.addEventListener('scroll', function () {
if (timer) return;
timer = setTimeout(function () { timer = null; savePos(); }, 450);
}, { passive: true });
window.addEventListener('pagehide', savePos);
document.addEventListener('visibilitychange', function () {
if (document.visibilityState === 'hidden') savePos();
});
}
function showToast(text, actionText, onAction) {
var old = document.getElementById('qb-toast');
if (old && old.parentNode) old.parentNode.removeChild(old);
var box = mk('div', 'qb-toast');
box.id = 'qb-toast';
box.setAttribute('role', 'status');
box.appendChild(mk('span', 'qb-toast-t', text));
var t = null;
function hide() {
if (t) { clearTimeout(t); t = null; }
box.classList.remove('show');
setTimeout(function () {
if (box.parentNode) box.parentNode.removeChild(box);
}, 260);
}
if (actionText) {
var b = mk('button', 'qb-toast-a', actionText);
b.type = 'button';
b.addEventListener('click', function () {
if (onAction) onAction();
hide();
});
box.appendChild(b);
}
var x = mk('button', 'qb-toast-x');
x.type = 'button';
x.setAttribute('aria-label', '关闭提示');
x.textContent = '×';
x.addEventListener('click', hide);
box.appendChild(x);
document.body.appendChild(box);
requestAnimationFrame(function () { box.classList.add('show'); });
t = setTimeout(hide, 7000);
}
function initCredit() {
if (!document.querySelector('meta[name="generator"]')) {
var gen = mk('meta');
gen.setAttribute('name', 'generator');
gen.setAttribute('content', 'cnblogs-document-theme');
(document.head || document.documentElement).appendChild(gen);
}
var ft = document.getElementById('footer');
if (!ft || ft.querySelector('.qb-credit')) return;
var bar = mk('div', 'qb-credit');
var a = mk('a', null, '');
a.appendChild(document.createTextNode('Theme powered by '));
a.appendChild(mk('span', 'qb-credit-name', 'cnblogs-document-theme'));
a.href = REPO;
a.target = '_blank';
a.rel = 'noopener';
a.title = 'cnblogs-document-theme · 博客园文档风主题 · MIT';
bar.appendChild(a);
ft.appendChild(bar);
}
var TOP_ARROW_SVG =
'<svg class="qb-top-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" ' +
'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
'<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>' +
'<svg class="qb-top-ring" viewBox="0 0 44 44" aria-hidden="true">' +
'<circle class="qb-top-ring-bg" cx="22" cy="22" r="18.5"/>' +
'<circle class="qb-top-ring-fg" cx="22" cy="22" r="18.5"/></svg>';
function createBackToTop() {
var btn = document.getElementById('qb-top');
if (!btn) {
btn = document.createElement('button');
btn.type = 'button';
btn.id = 'qb-top';
btn.className = 'qb-top';
document.body.appendChild(btn);
}
if (!btn.querySelector('.qb-top-ico')) btn.innerHTML = TOP_ARROW_SVG;
if (btn.tagName !== 'BUTTON') {
btn.setAttribute('role', 'button');
btn.setAttribute('tabindex', '0');
}
if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', '回到顶部');
btn.setAttribute('title', '回到顶部');
var ring = btn.querySelector('.qb-top-ring-fg');
var CIRC = 2 * Math.PI * (ring ? parseFloat(ring.getAttribute('r')) || 18.5 : 18.5);
if (ring) {
ring.style.strokeDasharray = CIRC;
ring.style.strokeDashoffset = CIRC;
}
var isHidden = true;
var ticking = false;
function paint() {
ticking = false;
var doc = document.documentElement;
var max = doc.scrollHeight - window.innerHeight;
var p = max > 0 ? window.pageYOffset / max : 0;
if (p < 0) p = 0;
if (p > 1) p = 1;
if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - p));
var show = window.pageYOffset > 300;
if (show === isHidden) {
isHidden = !show;
if (show) btn.classList.add('show'); else btn.classList.remove('show');
}
}
paint();
window.addEventListener('scroll', function () {
if (ticking) return;
ticking = true;
requestAnimationFrame(paint);
}, { passive: true });
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var lock = false;
function toTop() {
if (lock) return;
lock = true;
window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
setTimeout(function () { lock = false; }, 800);
}
btn.addEventListener('click', toTop);
btn.addEventListener('keydown', function (e) {
if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
e.preventDefault();
toTop();
}
});
}
function readArchiveMonths() {
var out = [], seen = {};
[].forEach.call(document.querySelectorAll('#sidebar_postarchive a'), function (a) {
var m = (a.textContent || '').replace(/\s+/g, ' ')
.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*[（(]\s*(\d+)/);
if (!m) return;
var key = m[1] + '-' + ('0' + m[2]).slice(-2);
if (seen[key]) return;
seen[key] = 1;
out.push({ key: key, y: +m[1], m: +m[2], n: +m[3], url: a.href.split('#')[0] });
});
out.sort(function (a, b) { return a.key < b.key ? 1 : -1; });
return out;
}
function parseMonthPage(html, mo) {
var doc = new DOMParser().parseFromString(html, 'text/html');
var items = [].slice.call(doc.querySelectorAll('.entrylistItem')).map(function (it) {
var a = it.querySelector('.entrylistItemTitle');
var desc = (it.querySelector('.entrylistItemPostDesc') || {}).textContent || '';
var d = desc.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})/);
var r = desc.match(/阅读\s*[（(]\s*(\d+)/);
return {
t: ((a ? a.textContent : '') || '').replace(/\s+/g, ' ').trim() || '(无标题)',
u: a ? a.href : mo.url,
d: d ? d[1] + '-' + d[2] + '-' + d[3] : mo.key + '-01',
hm: d ? d[4] : '',
r: r ? +r[1] : 0
};
});
return { key: mo.key, y: mo.y, m: mo.m, n: mo.n, url: mo.url, items: items };
}
var ARC_TTL = (CFG.archiveTtl || 24) * 3600 * 1000;
var ARC_PREFIX = 'qb-arc-v3:';
function arcSiteKey() {
return location.pathname.split('/p/')[0];
}
function arcCacheKey(key) {
return ARC_PREFIX + arcSiteKey() + ':' + key;
}
function readArcCache(key, expect) {
try {
var c = JSON.parse(localStorage.getItem(arcCacheKey(key)) || 'null');
if (!c || !c.t || Date.now() - c.t >= ARC_TTL || !c.d || !c.d.length) return null;
if (expect && c.n !== expect) return null;
return c.d;
} catch (e) { }
return null;
}
function writeArcCache(key, items, expect) {
if (!items || !items.length) return;
if (expect && items.length < expect) return;
try { localStorage.setItem(arcCacheKey(key), JSON.stringify({ t: Date.now(), n: items.length, d: items })); }
catch (e) { }
}
function clearArcCacheOld() {
try {
var site = arcSiteKey();
var dead = ['qb-arc-v1:' + site, 'qb-arc-v2:' + site];
Object.keys(localStorage).forEach(function (k) {
if (dead.indexOf(k) >= 0 || k.indexOf('qb-arc-v2:' + site + ':') === 0) localStorage.removeItem(k);
});
} catch (e) { }
}
function fetchArchiveMonth(mo) {
var hit = readArcCache(mo.key, mo.n);
if (hit) return Promise.resolve(hit);
return fetch(mo.url, { credentials: 'same-origin', cache: 'no-cache' }).then(function (r) {
if (!r.ok) throw new Error('HTTP ' + r.status);
return r.text();
}).then(function (h) {
var items = parseMonthPage(h, mo).items;
writeArcCache(mo.key, items, mo.n);
return items;
});
}
function arcQueue(max) {
var q = [], running = 0;
function pump() {
while (running < max && q.length) {
var job = q.shift();
running += 1;
var fin = function () { running -= 1; pump(); };
Promise.resolve().then(job.fn).then(job.ok, job.bad).then(fin, fin);
}
}
return function (fn, ok, bad) { q.push({ fn: fn, ok: ok, bad: bad }); pump(); };
}
function buildArchiveShell(box, months, curKey) {
var map = {}, lastY = 0;
months.forEach(function (mo) {
if (mo.y !== lastY) {
lastY = mo.y;
var yTotal = 0;
months.forEach(function (x) { if (x.y === mo.y) { yTotal += x.n; } });
var yh = mk('div', 'qb-arc-yhd');
yh.appendChild(mk('span', 'qb-arc-yname', String(mo.y)));
yh.appendChild(mk('span', 'qb-arc-ytotal', yTotal + ' 篇'));
box.appendChild(yh);
}
var sec = mk('section', 'qb-arc-mo' + (mo.key === curKey ? ' qb-arc-cur' : ''));
sec.id = 'qb-arc-' + mo.key;
var hd = mk('div', 'qb-arc-mhd');
var name = mk('a', 'qb-arc-mname', mo.m + ' 月');
name.href = mo.url;
name.title = '打开 ' + mo.y + ' 年 ' + mo.m + ' 月的归档页';
hd.appendChild(name);
hd.appendChild(mk('span', 'qb-arc-mcount', mo.n + ' 篇'));
hd.appendChild(mk('span', 'qb-arc-mline'));
sec.appendChild(hd);
var ul = mk('ul', 'qb-arc-list');
ul.style.minHeight = (mo.n * 30 + 6) + 'px';
ul.appendChild(mk('li', 'qb-arc-tip qb-arc-pend', '· · ·'));
sec.appendChild(ul);
box.appendChild(sec);
map[mo.key] = ul;
});
return map;
}
function fillArchiveMonth(ul, mo, items) {
ul.innerHTML = '';
ul.style.minHeight = '';
if (!items || !items.length) {
var li0 = mk('li', 'qb-arc-tip');
var a0 = mk('a', 'qb-arc-jump', '打开该月 · ' + mo.n + ' 篇 ↗');
a0.href = mo.url;
li0.appendChild(a0);
ul.appendChild(li0);
return;
}
items.forEach(function (it) {
var li = mk('li', 'qb-arc-item');
var a = mk('a', 'qb-arc-link');
a.href = it.u;
a.title = it.d + (it.hm ? ' ' + it.hm : '') + ' · ' + it.t;
a.appendChild(mk('span', 'qb-arc-d', it.d.slice(5) + (it.hm ? ' ' + it.hm : '')));
a.appendChild(mk('span', 'qb-arc-t', it.t));
if (it.r) a.appendChild(mk('span', 'qb-arc-r', String(it.r)));
li.appendChild(a);
ul.appendChild(li);
});
if (mo.n && items.length < mo.n) {
var miss = mk('li', 'qb-arc-tip');
var am = mk('a', 'qb-arc-jump',
'另有 ' + (mo.n - items.length) + ' 篇未取到 · 打开该月 ↗');
am.href = mo.url;
miss.appendChild(am);
ul.appendChild(miss);
}
}
function renderArchiveIndex(panel, months, curKey, onJump) {
var total = 0, years = [];
months.forEach(function (mo) {
total += mo.n;
var y = years[years.length - 1];
if (!y || y.y !== mo.y) { y = { y: mo.y, ms: [] }; years.push(y); }
y.ms.push(mo);
});
var cnt = panel.querySelector('.qb-count');
if (cnt) cnt.textContent = total + ' 篇';
var wrap = mk('div', 'qb-arc-idx');
years.forEach(function (y) {
var row = mk('div', 'qb-arc-idx-row');
row.appendChild(mk('span', 'qb-arc-idx-y', String(y.y)));
var ms = mk('div', 'qb-arc-idx-ms');
y.ms.forEach(function (mo) {
var a = mk('a', 'qb-arc-idx-m' + (mo.key === curKey ? ' on' : ''));
a.href = '#qb-arc-' + mo.key;
a.setAttribute('data-t', 'qb-arc-' + mo.key);
a.setAttribute('data-key', mo.key);
a.title = mo.y + ' 年 ' + mo.m + ' 月 · ' + mo.n + ' 篇';
a.appendChild(document.createTextNode(mo.m + '月'));
a.appendChild(mk('i', 'qb-arc-idx-n', String(mo.n)));
ms.appendChild(a);
});
row.appendChild(ms);
wrap.appendChild(row);
});
panel.appendChild(wrap);
wrap.addEventListener('click', function (e) {
var a = e.target.closest ? e.target.closest('a') : null;
if (!a) return;
var t = document.getElementById(a.getAttribute('data-t'));
if (!t) return;
e.preventDefault();
[].forEach.call(wrap.querySelectorAll('.qb-arc-idx-m'), function (x) { x.classList.remove('on'); });
a.classList.add('on');
if (onJump) onJump(a.getAttribute('data-key'));
window.scrollTo({
top: t.getBoundingClientRect().top + window.pageYOffset - 72,
behavior: 'smooth'
});
history.replaceState(null, '', a.getAttribute('href'));
});
}
function normalizeArchiveUrl(months) {
var latest = months && months[0];
if (!latest) return;
try {
var u = new URL(latest.url, location.href);
u.search = '?view=all';
u.hash = '';
if (u.pathname + u.search !== location.pathname + location.search) {
history.replaceState(null, '', u.pathname + u.search);
}
} catch (e) { }
var site = (document.querySelector('.qb-brand-text') || {}).textContent || '';
site = site.replace(/\s+/g, ' ').trim();
if (site) document.title = '全部归档 - ' + site;
}
var ARC_WAITING = 0;
function retryFullArchive(left) {
if (!CFG.archive) return false;
if (!left || document.querySelector('.qb-archive')) return false;
if (!/\/p\/archive\/\d{4}\/\d{1,2}/.test(location.pathname)) return false;
if (readArchiveMonths().length < 2) return false;
if (!document.querySelector('#mainContent .entrylist')) return false;
[].forEach.call(left.querySelectorAll('.qb-panel'), function (p) {
if (p.parentNode) p.parentNode.removeChild(p);
});
buildFullArchive(left);
return !!document.querySelector('.qb-archive');
}
function waitArchiveReady(left) {
if (ARC_WAITING) return 'wait';
ARC_WAITING = 1;
if (!left.querySelector('.qb-panel')) {
var ph = makePanel('全部归档', '读取中');
ph.appendChild(mk('div', 'qb-arc-wait', '正在读取月份索引…'));
left.insertBefore(ph, left.firstChild);
}
var tries = 0, timer = null, mo = null;
function isReady() {
return !!(document.querySelector('#mainContent .entrylist') && readArchiveMonths().length >= 2);
}
function stop() {
if (timer) { clearInterval(timer); timer = null; }
if (mo) { mo.disconnect(); mo = null; }
ARC_WAITING = 0;
}
function done() {
if (document.querySelector('.qb-archive')) { stop(); return true; }
if (!isReady()) return false;
stop();
retryFullArchive(left);
syncArchiveNav();
return true;
}
if ('MutationObserver' in window) {
mo = new MutationObserver(function () { done(); });
mo.observe(document.documentElement, { childList: true, subtree: true });
}
timer = setInterval(function () {
tries += 1;
if (done()) return;
if (tries >= 60) {
stop();
if (document.querySelector('.qb-archive')) return;
[].forEach.call(left.querySelectorAll('.qb-panel'), function (p) {
if (p.parentNode) p.parentNode.removeChild(p);
});
buildPostList(left);
}
}, 200);
return 'wait';
}
function buildFullArchive(left) {
if (!/\/p\/archive\/\d{4}\/\d{1,2}/.test(location.pathname)) return false;
if (document.querySelector('.qb-archive')) return true;
var entry = document.querySelector('#mainContent .entrylist');
var months = readArchiveMonths();
if (!entry || !months.length) return waitArchiveReady(left);
if (months.length < 2) return false;
var curKey = months[0].key;
var total = 0;
months.forEach(function (mo) { total += mo.n; });
var staleWait = left.querySelector('.qb-arc-wait');
if (staleWait) {
var stalePanel = staleWait.closest ? staleWait.closest('.qb-panel') : null;
(stalePanel || staleWait).parentNode.removeChild(stalePanel || staleWait);
}
var panel = makePanel('全部归档', total + ' 篇');
left.insertBefore(panel, left.firstChild);
var box = mk('div', 'qb-archive');
var hd = mk('div', 'qb-arc-hd');
hd.appendChild(mk('span', 'qb-arc-title', '全部归档'));
hd.appendChild(mk('span', 'qb-arc-meta',
total + ' 篇 · ' + months.length + ' 个月 · ' +
months[months.length - 1].key + ' → ' + months[0].key));
box.appendChild(hd);
var bodyBox = mk('div', 'qb-arc-body');
box.appendChild(bodyBox);
entry.parentNode.insertBefore(box, entry);
entry.style.display = 'none';
var map = buildArchiveShell(bodyBox, months, curKey);
var byKey = {}, state = {};
months.forEach(function (mo) { byKey[mo.key] = mo; });
var enqueue = arcQueue(4);
function loadMonth(key) {
var mo = byKey[key];
if (!mo || state[key]) return;
state[key] = 'load';
var ul = map[key];
if (ul) { ul.innerHTML = ''; ul.appendChild(mk('li', 'qb-arc-tip', '加载中…')); }
enqueue(function () { return fetchArchiveMonth(mo); }, function (items) {
state[key] = 'ok';
fillArchiveMonth(ul, mo, items);
}, function () {
delete state[key];
fillArchiveMonth(ul, mo, null);
});
}
if ('IntersectionObserver' in window) {
var io = new IntersectionObserver(function (ents) {
ents.forEach(function (en) {
if (!en.isIntersecting) return;
var k = en.target.getAttribute('data-arc-key');
if (!k) return;
io.unobserve(en.target);
loadMonth(k);
});
}, { rootMargin: '600px 0px' });
months.forEach(function (mo) {
var sec = document.getElementById('qb-arc-' + mo.key);
if (!sec) return;
sec.setAttribute('data-arc-key', mo.key);
io.observe(sec);
});
} else {
months.forEach(function (mo) { loadMonth(mo.key); });
}
renderArchiveIndex(panel, months, curKey, loadMonth);
clearArcCacheOld();
normalizeArchiveUrl(months);
return true;
}
function syncArchiveNav() {
var link = document.querySelector('.qb-nav a[href*="/p/archive/"]');
if (!link) return;
var months = readArchiveMonths();
if (!months.length) return;
link.href = months[0].url;
if (location.pathname.indexOf('/p/archive/') > -1) link.classList.add('on');
}
function dropLoading() {
var l = document.getElementById('loading');
if (!l) return;
l.style.transition = 'opacity .3s';
l.style.opacity = '0';
setTimeout(function () {
if (l.parentNode) l.parentNode.removeChild(l);
}, 350);
}
function syncSide(left) {
splitDayGroups();
if (CFG.pager) enhancePager();
moveSideWidgets();
watchSideColumn();
renderNotice();
retryFullArchive(left);
syncArchiveNav();
}
function sideReady() {
return !!(document.getElementById('main') &&
document.getElementById('mainContent') &&
document.getElementById('leftcontentcontainer'));
}
function leftBox() {
var box = document.getElementById('qb-left');
if (box) return box;
var main = document.getElementById('main');
if (!main) return null;
box = mk('div', 'qb-left');
box.id = 'qb-left';
var mc = document.getElementById('mainContent');
if (mc && mc.parentNode === main) main.insertBefore(box, mc);
else main.insertBefore(box, main.firstChild);
return box;
}
var unlocked = false;
var gateHold = true;
function unlock(force) {
if (unlocked || !document.documentElement) return;
if (gateHold && !force) return;
unlocked = true;
var de = document.documentElement;
if (de.className.indexOf('qb-arc-page') >= 0 && !document.querySelector('.qb-archive')) {
de.className = de.className.replace(/\s*qb-arc-page\b/, '');
}
if (de.classList) de.classList.add('qb-ready');
else de.className += ' qb-ready';
}
var leftDone = false;
function buildLeft() {
if (leftDone) return true;
var left = leftBox();
if (!left) return false;
var body = document.getElementById('cnblogs_post_body');
if (body) {
if (body.querySelectorAll('h1, h2, h3, h4').length < 2 &&
document.readyState === 'loading') return false;
if (buildToc(body, left)) { leftDone = true; return true; }
}
if (CFG.archive && buildFullArchive(left)) { leftDone = true; return true; }
if (buildPostList(left)) { leftDone = true; return true; }
return false;
}
function settle(left, n) {
var ok = sideReady() && buildLeft();
if (ok) syncSide(left);
var de = document.documentElement;
var readyToShow = ok || n >= 12 || document.readyState !== 'loading';
var arcBox = document.querySelector('.qb-archive');
var arcPending = de.className.indexOf('qb-arc-page') >= 0 &&
(!arcBox || !arcBox.querySelector('li:not(.qb-arc-tip)'));
var col = document.getElementById('blog-sidecolumn');
var colPending = !col || !col.children.length;
if ((arcPending && n < 60) || (colPending && n < 30) || (TAXO.pending && n < 30)) {
requestAnimationFrame(function () { settle(left, n + 1); });
return;
}
if (readyToShow) {
gateHold = false;
unlock();
return;
}
requestAnimationFrame(function () { settle(left, n + 1); });
}
function boot() {
hoistNav();
splitDayGroups();
if (CFG.pager) enhancePager();
buildLeft();
var left = document.getElementById('qb-left');
syncSide(left);
lazyImages();
if (CFG.code) enhanceCode();
enhanceTables();
enhanceMarkdown();
enhancePost();
initTaxonomy();
initMobileToc();
markNav();
initMobileMenu();
initFavicon();
initDarkMode();
initTheme();
initCredit();
if (CFG.backToTop) createBackToTop();
initResume();
settle(left, 0);
var tries = 0;
var timer = setInterval(function () {
tries += 1;
syncSide(left);
if (tries > 12) clearInterval(timer);
}, 500);
dropLoading();
}
if (document.body) renderNav();
syncDarkClass(darkPref());
applyTheme(themePref());
if (CFG.gate === false) { gateHold = false; unlock(); }
window.__QB_READY__ = true;
var booted = false;
function bootOnce() {
if (booted) return true;
if (!document.getElementById('mainContent')) return false;
if (document.readyState === 'loading' && !sideReady()) return false;
booted = true;
boot();
return true;
}
if (!bootOnce()) {
var mo = new MutationObserver(function () {
if (bootOnce()) mo.disconnect();
});
mo.observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', function () {
if (bootOnce()) mo.disconnect();
});
setTimeout(function () { bootOnce(); mo.disconnect(); }, 1500);
}
document.addEventListener('DOMContentLoaded', function () {
if (!booted) return;
if (!leftDone) buildLeft();
enhanceTables();
enhanceMarkdown();
enhancePost();
initTaxonomy();
initCredit();
initMobileToc();
initMobileMenu();
var lc = document.getElementById('qb-left');
syncSide(lc);
settle(lc, 12);
});
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', function () { bootOnce(); });
} else {
bootOnce();
}
window.addEventListener('load', function () { bootOnce(); });
setTimeout(function () { unlock(true); }, 1500);
})();
