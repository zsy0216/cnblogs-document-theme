/* 流苏主题 v7.17 · 2026-11-10 · document-theme.js 合并版（样式 + 脚本，托管分发用）
   由 _dev-tools/gen-bundle.py 生成，不要直接编辑。
   来源：css/theme-v7.min.css（33145 B） + snippets/footer-script-v7.min.html（36115 B）
   用法：先可选地赋值 window.LS_CONFIG，再引入本文件，例如
     window.LS_CONFIG = { accent: "#d05ce8", dark: "auto" };
   内联粘贴版（两个后台字段）与本文件共用同一份源码，行为一致。 */
(function () {
  /* 只负责把样式送进文档，不解锁首帧闸门（qb-ready）。
     解锁时机由页脚逻辑的 unlock() 统一决定：顶栏、目录、右栏、公告全部就位之后。
     早先这里顺手加 qb-ready，实测会让闸门在 529ms 就打开（结构 613ms 才齐），
     于是又出现「正文先到、右栏半秒后补」的闪动。 */
  /* 优先认「页面定制 CSS 代码」字段里的那份：生成脚本会在该字段开头写
     html{--qb-field:1}，这里读到 1 就说明首帧样式已经就位，不必再塞一遍。
     重复塞同一份 33KB 样式没有视觉差异，但会让浏览器白算一次全量样式，
     在低端机上是几十毫秒的卡顿。 */
  var f = getComputedStyle(document.documentElement).getPropertyValue("--qb-field");
  if (f && f.trim() === "1") return;
  /* 页首若已用 <link rel=stylesheet> 引入托管 CSS，这里不再重复注入；
     l.sheet 非空说明外链确实加载成功了。外链 404 / MIME 不对时仍走下面的兜底。 */
  var l = document.querySelector('link[href*="theme-v7.min.css"]');
  if (l && l.sheet) return;
  if (document.getElementById("qb-theme-style")) return;
  var st = document.createElement("style");
  st.id = "qb-theme-style";
  st.textContent = "/* 流苏主题 v7.17 · 2026-11-10 · 压缩版，源码见 theme-v7.css */\n@view-transition{navigation:auto}.qb-nav{view-transition-name:qb-nav}::view-transition-group(qb-nav){animation-duration:.18s}::view-transition-old(qb-nav),::view-transition-new(qb-nav){animation:none;opacity:1}::view-transition-old(root){animation:none;opacity:1}::view-transition-new(root){animation:qb-vt-in .16s ease-out both}@keyframes qb-vt-in{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion: reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation-duration:0s !important}}:root{--bg:#f4f5f7;--card:#fff;--line:#ecedf0;--ink:#1f2329;--body:#3f4753;--meta:#9aa5b1;--accent:#d05ce8;--accent-soft:rgba(208, 92, 232, .10);--accent-deep:#b843d0;--radius:12px;--radius-sm:8px;--shadow:0 1px 3px rgba(16, 24, 40, .04),0 6px 18px rgba(16, 24, 40, .05);--shadow-hover:0 4px 10px rgba(16, 24, 40, .08),0 12px 28px rgba(16, 24, 40, .08);--font:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",\"Segoe UI\",Roboto,sans-serif;--code-bg:#f3f4f6;--code-ink:#cf222e;--pre-bg:#161b22;--pre-ink:#e6edf3;--pre-line:#30363d;--num:#c3c9d2}html.qb-dark,body.qb-dark{--bg:#0d1117;--card:#161b22;--line:#30363d;--ink:#e6edf3;--body:#c9d1d9;--meta:#8b949e;--accent:#58a6ff;--accent-soft:rgba(56, 139, 253, .15);--accent-deep:#79c0ff;--shadow:0 1px 3px rgba(1, 4, 9, .6),0 6px 18px rgba(1, 4, 9, .45);--shadow-hover:0 4px 10px rgba(1, 4, 9, .7),0 12px 28px rgba(1, 4, 9, .55);--code-bg:rgba(110, 118, 129, .4);--code-ink:#e6edf3;--pre-bg:#161b22;--pre-ink:#e6edf3;--pre-line:#30363d;--num:#6e7681;color-scheme:dark}html,body{background:var(--bg) !important;font-family:var(--font) !important;color:var(--body);font-size:14px;line-height:1.75;margin:0 !important;padding:0 !important;-webkit-font-smoothing:antialiased}html{scroll-padding-top:74px}@media (min-width: 1024px){html{overflow-y:scroll;scrollbar-gutter:stable}}#home{background:transparent !important}a{text-decoration:none;transition:color .18s ease}#top_nav{display:none !important}body.has-navbar{padding-top:0 !important;margin-top:0 !important}#header{display:none !important}#cnblogs_c1,#cnblogs_c2,#ad_t2,#under_post_news,#under_post_kb,#under_post_card1,#under_post_card2,#under_post_card3,#comment_cache,#right_zhbs,#blog_post_info_block,#green_channel{display:none !important}#qb-dark-toggle,.qb-dark-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:var(--body);font-size:16px;cursor:pointer;transition:background .2s ease,color .2s ease}#qb-dark-toggle:hover,.qb-dark-btn:hover{background:var(--accent-soft);color:var(--accent-deep)}body.qb-dark #qb-dark-toggle,body.qb-dark .qb-dark-btn{color:var(--accent-deep)}body.qb-dark #qb-dark-toggle:hover,body.qb-dark .qb-dark-btn:hover{background:var(--accent-soft)}.qb-nav{position:sticky;top:0;z-index:999;background:var(--card);border-bottom:1px solid var(--line);min-height:58px}.qb-nav-inner{max-width:1320px;margin:0 auto;height:58px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box}.qb-brand{display:inline-flex;align-items:center;gap:9px;flex:0 0 auto;font-size:17px;font-weight:700;color:var(--ink);letter-spacing:.01em;white-space:nowrap}.qb-brand:hover{color:var(--accent-deep)}.qb-logo{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;flex:0 0 30px}.qb-logo svg{width:100%;height:100%;display:block}.qb-logo img{width:100%;height:100%;object-fit:contain;display:block;border-radius:6px;box-shadow:0 0 0 1px rgba(15, 23, 42, .08)}body.qb-dark .qb-logo img{box-shadow:0 0 0 1px rgba(255, 255, 255, .14)}.qb-logo .qb-logo-dot{fill:#ff5f3d}body.qb-dark .qb-logo .qb-logo-dot{fill:#ff7a5c}.qb-links{display:flex;align-items:center;gap:4px}.qb-links a{font-size:14px;font-weight:500;color:var(--body);padding:6px 12px;border-radius:8px;white-space:nowrap}.qb-links a:hover{background:var(--accent-soft);color:var(--accent-deep)}.qb-links a.on{background:var(--accent-soft);color:var(--accent-deep);font-weight:600}#main{display:grid !important;grid-template-columns:260px minmax(0, 1fr) 292px;gap:22px;align-items:start;max-width:1360px;margin:0 auto;padding:24px 24px 8px;box-sizing:border-box;float:none !important;width:auto !important}#sideBar{display:contents !important}#sideBarMain{grid-column:3;grid-row:1;display:flex;flex-direction:column;gap:16px;min-width:0;width:auto !important;float:none !important;margin:0 !important;padding:0 !important;background:none !important;border:0 !important}#mainContent{grid-column:2;grid-row:1;min-width:0;width:auto !important;float:none !important;margin:0 !important;padding:0 !important}#qb-left{grid-column:1;grid-row:1;min-width:0;display:flex;flex-direction:column;gap:16px;position:sticky;top:74px;max-height:calc(100vh - 96px);overflow-y:auto;overflow-x:hidden;padding-right:2px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}#qb-left::-webkit-scrollbar{width:4px}#qb-left::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px}#leftcontentcontainer{display:flex;flex-direction:column;gap:16px;min-width:0;width:auto !important;float:none !important;margin:0 !important;padding:0 !important;position:static;max-height:none;overflow:visible}#sidebar_news{min-width:0}#sidebar_recentposts,#sidebar_shortcut,#sidebar_toptags,#sidebar_categories{display:none !important}#blog-calendar{display:none !important}html.qb-arc-page #mainContent .entrylist{visibility:hidden;animation:qb-arc-unlock 0s linear 3s forwards}@keyframes qb-arc-unlock{to{visibility:visible}}.qb-archive{animation:qb-fade-in .18s ease-out both}#blog-sidecolumn,#sidebar_news,#blog-calendar,#post_detail,#blog-comments-placeholder,.commentform,.day{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box}#blog-sidecolumn{animation:qb-fade-in .16s ease-out both}#blog-sidecolumn{display:flex;flex-direction:column;gap:16px;padding:0;background:none !important;border:0 !important;box-shadow:none !important}#blog-sidecolumn>div{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:16px 16px 14px}#blog-sidecolumn h3,#sidebar_news h3,#blog-calendar h3,.catListTitle{font-size:13px !important;font-weight:600 !important;color:var(--ink) !important;letter-spacing:.02em;margin:0 0 12px !important;padding:0 0 10px !important;border-bottom:1px solid var(--line) !important;background:none !important}#blog-sidecolumn ul{list-style:none;margin:0;padding:0}.qb-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:15px 14px 12px;box-sizing:border-box;flex:0 0 auto}@keyframes qb-panel-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}@keyframes qb-fade-in{from{opacity:0}to{opacity:1}}.qb-panel{animation:qb-panel-in .16s ease-out both}#sideBarMain{animation:qb-fade-in .18s ease-out both}.qb-panel-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px;padding:0 3px 10px;border-bottom:1px solid var(--line);font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}.qb-panel-hd .qb-panel-title{flex:1 1 auto}.qb-panel-hd .qb-count{flex:0 0 auto;font-size:11.5px;font-weight:400;color:var(--meta);letter-spacing:0}.qb-toc-list{list-style:none;margin:0;padding:0 3px 0 0;counter-reset:qbtoc}.qb-toc-list li{margin:0;counter-increment:qbtoc}.qb-toc-list a{position:relative;display:block;padding:6px 8px 6px 32px;border-radius:6px;font-size:13px;line-height:1.55;color:var(--body) !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background .16s ease,color .16s ease}.qb-toc-list a::before{content:counter(qbtoc) \".\";position:absolute;left:2px;top:6px;width:24px;text-align:right;color:var(--num);font-weight:600;font-size:12px;font-variant-numeric:tabular-nums}.qb-toc-list a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.qb-toc-list a:hover::before{color:var(--accent)}.qb-toc-list a.on{background:var(--accent-soft);color:var(--accent-deep) !important;font-weight:600}.qb-toc-list a.on::before{color:var(--accent)}.qb-toc-list .qb-lv3 a{padding-left:42px;font-size:12.5px}.qb-toc-list .qb-lv4 a{padding-left:52px;font-size:12.5px;color:var(--meta) !important}.qb-toc-list .qb-lv3 a::before{left:12px;width:24px;font-size:11.5px;color:var(--num)}.qb-toc-list .qb-lv4 a::before{left:22px;width:24px;font-size:11px;color:var(--num)}.qb-toc-list .qb-lv2 a{padding-left:32px}.qb-toc-list li.qb-nonum a{padding-left:10px}.qb-toc-list li.qb-nonum a::before{content:none}.qb-toc-list li.qb-nonum.qb-lv3 a{padding-left:20px}.qb-toc-list li.qb-nonum.qb-lv4 a{padding-left:30px}.qb-toc-list.qb-scroll{-webkit-mask-image:linear-gradient(to bottom, #000 calc(100% - 18px),transparent 100%);mask-image:linear-gradient(to bottom, #000 calc(100% - 18px),transparent 100%)}#sidebar_categories{position:static;display:flex;flex-direction:column;max-height:none;overflow:visible}#sidebar_categories .catListTitle{font-size:0 !important;display:flex;align-items:center;gap:7px;flex:0 0 auto}#sidebar_categories .catListTitle::before{content:\"分类导航\";font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.02em}#sidebar_postarchive .catListTitle::before{content:\"随笔档案\"}#sidebar_categories [id^=\"sidebar_links\"] .catListTitle::before{content:\"站点\"}#sidebar_categories .catListTitle::after{content:\"\";flex:1;height:1px;background:var(--line)}#sidebar_categories ul{counter-reset:navitem;overflow:visible;margin:0;padding-right:0}#sidebar_categories ul::-webkit-scrollbar{width:4px}#sidebar_categories ul::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px}#sidebar_categories ul li{counter-increment:navitem;margin:0}#sideBar #sidebar_categories ul li a{position:relative;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding:7px 8px 7px 24px;border-radius:6px;color:var(--body) !important;font-size:13px;line-height:1.5}#sideBar #sidebar_categories ul li a::before{content:counter(navitem) \".\";position:absolute;left:5px;top:7px;width:17px;color:var(--num);font-weight:600;font-size:12.5px;font-variant-numeric:tabular-nums}#sideBar #sidebar_categories ul li a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}#sideBar #sidebar_categories ul li a:hover::before{color:var(--accent)}#sideBar #sidebar_categories ul li a.current,#sideBar #sidebar_categories ul li a.active,#sideBar #sidebar_categories ul li a[style*=\"color\"]{color:var(--accent-deep) !important;background:var(--accent-soft);font-weight:600}#sideBar #sidebar_categories ul li a.current::before,#sideBar #sidebar_categories ul li a.active::before{color:var(--accent)}#blog-sidecolumn ul li{margin:0 0 2px;line-height:1.6}#blog-sidecolumn ul li a{display:block;padding:4px 9px;border-radius:var(--radius-sm);color:var(--body) !important;font-size:13px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#blog-sidecolumn ul li a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}#blog-sidecolumn ul li a span,#blog-sidecolumn ul li a .small{color:var(--meta) !important;font-size:11.5px}#blog-sidecolumn .mySearch{display:flex;flex-wrap:wrap;gap:8px}#blog-sidecolumn .mySearch .catListTitle,#blog-sidecolumn .mySearch h3{flex:0 0 100%;width:100% !important;margin:0 0 8px !important}#blog-sidecolumn #q,#blog-sidecolumn input[type=\"text\"]{flex:1 1 auto;min-width:0;height:34px;padding:0 10px;box-sizing:border-box;font-size:13px;color:var(--body);background:var(--bg);border:1px solid var(--line);border-radius:var(--radius-sm);outline:none}#blog-sidecolumn #q:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}#blog-sidecolumn #btnZzk,#blog-sidecolumn input[type=\"button\"]{height:34px;padding:0 14px;font-size:13px;color:#fff;background:var(--accent);border:0;border-radius:var(--radius-sm);cursor:pointer}#sidebar_news{padding:18px}#sidebar_news .sidebar-news,#sidebar_news_container{font-size:13px;color:var(--body);line-height:1.75;max-height:none;overflow:visible;text-wrap:pretty}#sidebar_news_container p{margin:0 0 8px}#sidebar_news_container p:last-child{margin-bottom:0}#sidebar_news_container blockquote{margin:10px 0;padding:8px 12px;background:var(--accent-soft);border-left:2px solid var(--accent);border-radius:var(--radius-sm);color:var(--body)}#sidebar_news_container img{max-width:100%;border-radius:var(--radius-sm)}#qb-notice{font-size:13px;line-height:1.85;color:var(--body)}#qb-notice p{margin:0 0 10px}#qb-notice p:last-child{margin-bottom:0}#qb-notice b,#qb-notice strong{color:var(--ink);font-weight:600}#qb-notice a{color:var(--accent);text-decoration:none}#qb-notice a:hover{color:var(--accent-deep);text-decoration:underline}#qb-notice .qb-notice-tip{padding:10px 12px;background:var(--accent-soft);border-radius:var(--radius-sm);color:var(--body)}#qb-notice .qb-notice-links{margin:0;padding-top:10px;border-top:1px solid var(--line);font-size:12.5px}#qb-notice .qb-notice-links a{margin-right:12px}.qb-panel>#qb-notice{padding:2px 2px 2px}#sidebar_news a{color:var(--accent-deep)}#sidebar_news #profile_block{margin-top:12px;font-size:12.5px;line-height:1.9;color:var(--meta)}#sidebar_news #profile_block a{color:var(--accent-deep);font-weight:500}#sidebar_news #profile_block .follow-tip{margin-top:4px}#sidebar_news br+br{display:none}#blog-calendar{padding:16px}#blog-calendar table{width:100%;font-size:12px;border-collapse:collapse}#blog-calendar th,#blog-calendar td{text-align:center;padding:3px 0;color:var(--body);border:0}#blog-calendar td a{color:var(--accent-deep) !important;font-weight:600}#mainContent .forFlow{padding:0 !important}.day,.post,#taglist_main,#taglist,.category-block{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 16px;margin:0 0 16px}.day:hover{box-shadow:var(--shadow-hover);transform:translateY(-1px)}.dayTitle{display:none}.entrylistItem{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 16px;margin:0 0 16px}.entrylistTitle{font-size:20px !important;font-weight:600 !important;color:var(--ink) !important;margin:0 0 16px !important}.entrylistItemTitle{font-size:16px !important;font-weight:600 !important;color:var(--ink) !important;line-height:1.5}.entrylistItemTitle:hover{color:var(--accent-deep) !important}.entrylistPostSummary{margin:10px 0 !important}.entrylistItemPostDesc{font-size:12.5px !important;color:var(--meta) !important}.entrylistItemPostDesc a{color:var(--meta) !important}.entrylistItemPostDesc a:hover{color:var(--accent-deep) !important}.qb-archive{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 14px;margin:0 0 16px}.qb-arc-hd{display:flex;align-items:baseline;flex-wrap:wrap;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}.qb-arc-title{font-size:18px;font-weight:700;color:var(--ink);letter-spacing:.01em}.qb-arc-meta{font-size:12.5px;color:var(--meta);font-variant-numeric:tabular-nums}.qb-arc-yhd{display:flex;align-items:center;gap:10px;margin:20px 0 2px;font-size:14px;font-weight:700;color:var(--ink);letter-spacing:.06em;font-variant-numeric:tabular-nums}.qb-arc-yname{color:var(--ink)}.qb-arc-ytotal{font-size:11.5px;font-weight:500;color:var(--meta);letter-spacing:0;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:1px 7px}.qb-arc-yhd::after{content:\"\";flex:1;height:1px;background:var(--line)}.qb-arc-mo{padding:8px 0 2px;scroll-margin-top:74px}.qb-arc-mhd{display:flex;align-items:center;gap:9px;margin:0 0 4px}.qb-arc-mname{font-size:13px;font-weight:600;color:var(--body);font-variant-numeric:tabular-nums;text-decoration:none !important;border-bottom:1px dotted transparent;transition:color .16s ease,border-color .16s ease}.qb-arc-mname:hover{color:var(--accent-deep);border-bottom-color:var(--accent)}.qb-arc-mcount{font-size:11.5px;color:var(--meta);background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:1px 7px;font-variant-numeric:tabular-nums}.qb-arc-mline{flex:1;height:1px;background:var(--line);opacity:.7}.qb-arc-mo.qb-arc-cur .qb-arc-mname{color:var(--accent-deep)}.qb-arc-mo.qb-arc-cur .qb-arc-mcount{color:var(--accent-deep);border-color:var(--accent)}.qb-arc-list{list-style:none;margin:0;padding:0}.qb-arc-item{margin:0}.qb-arc-link{display:flex;align-items:baseline;gap:12px;padding:6px 10px;border-radius:var(--radius-sm);text-decoration:none !important;transition:background .16s ease}.qb-arc-link:hover{background:var(--accent-soft)}.qb-arc-d{flex:0 0 86px;width:86px;font-size:11.5px;color:var(--num);font-variant-numeric:tabular-nums;white-space:nowrap}.qb-arc-t{flex:1;min-width:0;font-size:13.5px;color:var(--body);line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qb-arc-link:hover .qb-arc-t{color:var(--accent-deep)}.qb-arc-r{flex:0 0 auto;font-size:11px;color:var(--meta);font-variant-numeric:tabular-nums}.qb-arc-r::after{content:\" 阅\";font-size:10px;opacity:.75}.qb-arc-tip{font-size:12.5px;color:var(--meta);padding:7px 10px;list-style:none}.qb-arc-jump{color:var(--accent-deep) !important;text-decoration:none !important;border-bottom:1px dotted var(--accent)}.qb-arc-jump:hover{color:var(--accent) !important}.qb-arc-pend{letter-spacing:.2em;opacity:.45;padding:6px 10px}.qb-arc-wait{font-size:12.5px;line-height:1.7;color:var(--meta);padding:4px 2px 2px}.qb-arc-idx{padding:2px 0 2px}.qb-arc-idx-row{display:flex;gap:10px;padding:9px 0;border-top:1px dashed var(--line)}.qb-arc-idx-row:first-child{border-top:0;padding-top:4px}.qb-arc-idx-y{flex:0 0 36px;font-size:12.5px;font-weight:700;color:var(--ink);padding-top:5px;font-variant-numeric:tabular-nums}.qb-arc-idx-ms{display:flex;flex-wrap:wrap;gap:6px}.qb-arc-idx-m{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:var(--bg);border:1px solid var(--line);font-size:12px;line-height:1.4;color:var(--body) !important;text-decoration:none !important;transition:background .16s ease,border-color .16s ease,color .16s ease}.qb-arc-idx-m i{font-style:normal;font-size:10.5px;color:var(--meta);font-variant-numeric:tabular-nums}.qb-arc-idx-m:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-deep) !important}.qb-arc-idx-m.on{background:var(--accent-deep);border-color:var(--accent-deep);color:#fff !important}.qb-arc-idx-m.on i{color:rgba(255, 255, 255, .82)}body.qb-dark .qb-arc-idx-m.on{background:var(--accent);border-color:var(--accent);color:#0d1117 !important}body.qb-dark .qb-arc-idx-m.on i{color:rgba(13, 17, 23, .7)}.PostList{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);box-sizing:border-box;padding:20px 22px 16px;margin:0 0 16px}.PostListTitle{font-size:20px !important;font-weight:600 !important;color:var(--ink) !important;margin:0 0 16px !important}.postTitl2 a{font-size:16px !important;font-weight:600 !important;color:var(--ink) !important;line-height:1.5;display:block}.postTitl2 a:hover{color:var(--accent-deep) !important}.postDesc2{font-size:12.5px !important;color:var(--meta) !important;margin:12px 0 0 !important}.postDesc2 a{color:var(--meta) !important}.postDesc2 a:hover{color:var(--accent-deep) !important}.postText2{margin:12px 0 0 !important;color:var(--body) !important;font-size:13.5px !important}#taglist_main table{width:100% !important}#MyTag1_dtTagList a,#taglist a{display:inline-block;padding:5px 10px;margin:4px;border-radius:20px;background:var(--bg);color:var(--body) !important;font-size:13px;transition:background .16s ease,color .16s ease}#MyTag1_dtTagList a:hover,#taglist a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.category-block-title{font-size:15px !important;font-weight:600 !important;color:var(--ink) !important;letter-spacing:.02em;margin:0 0 12px !important;padding:0 0 10px;border-bottom:1px solid var(--line)}.category-block-list{padding:0 !important}.category-list-item a{display:block;padding:8px 10px;margin:6px 0;border-radius:var(--radius-sm);background:var(--bg);color:var(--body) !important;font-size:13.5px;line-height:1.5;transition:background .16s ease,color .16s ease}.category-list-item a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}.category-list-item a span,.category-list-item .small{color:var(--meta) !important;font-size:11.5px;float:right}.day .postTitle{margin:0 0 8px !important;padding:0 !important;font-size:17.5px !important;font-weight:600 !important;line-height:1.5;border:0 !important}.day .postTitle a{color:var(--ink) !important;font-weight:600}.day .postTitle a:hover{color:var(--accent-deep) !important}.day .postCon{padding:0 !important}.day .c_b_p_desc{font-size:13.5px !important;line-height:1.8 !important;color:var(--body) !important;margin:0 !important}.day .c_b_p_desc a{color:var(--accent-deep) !important;font-weight:500}.day .postDesc{margin:12px 0 0 !important;padding:10px 0 0 !important;border-top:1px solid var(--line) !important;border-bottom:0 !important;background:none !important;font-size:12.5px !important;color:var(--meta) !important;text-align:left !important}.day .postDesc a{color:var(--meta) !important}.day .postDesc a:hover{color:var(--accent-deep) !important}.pinned-post-mark{display:inline-block;background:var(--accent);color:#fff !important;font-size:11px;font-weight:500;line-height:1;padding:3px 7px;border-radius:4px;margin-right:6px;vertical-align:2px}.qb-pager-top{display:none !important}.qb-pager-bar{margin:10px 0 0;padding:22px 0 28px;border-top:1px solid var(--line);text-align:center}.qb-pager-bar[data-qb-empty]{display:none !important}.qb-pager{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;margin:0;padding:0;font-size:13px;line-height:1;color:var(--meta)}#nav_next_page.qb-pager{padding:0;margin:0}.qb-pager a,.qb-pager .qb-cur,.qb-pager .qb-dis{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:34px;height:34px;padding:0 11px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);color:var(--body) !important;font-size:13px;line-height:1;text-decoration:none !important;box-shadow:0 1px 2px rgba(16, 24, 40, .04);transition:border-color .15s ease,color .15s ease,box-shadow .15s ease,transform .15s ease}.qb-pager a:hover{border-color:var(--accent);color:var(--accent-deep) !important;transform:translateY(-1px);box-shadow:0 3px 10px rgba(208, 92, 232, .16)}.qb-pager a:active{transform:translateY(0);box-shadow:none}.qb-pager .qb-cur{border-color:var(--accent);background:var(--accent);color:#fff !important;font-weight:600;box-shadow:0 2px 8px rgba(208, 92, 232, .26)}.qb-pager .qb-dis{border-color:transparent;background:transparent;color:var(--meta) !important;opacity:.5;cursor:default}.qb-pager .qb-prev::before,.qb-pager .qb-next::after{font-size:14px;line-height:0;opacity:.8}.qb-pager .qb-prev::before{content:'‹';margin-right:5px}.qb-pager .qb-next::after{content:'›';margin-left:5px}@media (max-width: 640px){.qb-pager{gap:5px}.qb-pager a,.qb-pager .qb-cur,.qb-pager .qb-dis{min-width:30px;height:30px;padding:0 9px;font-size:12.5px}.qb-pager-bar{padding:18px 0 22px}}#post_detail{padding:30px 34px 24px;margin:0 0 18px}#post_detail .postTitle{margin:0 0 14px !important;padding:0 !important;border:0 !important;font-size:26px !important;font-weight:700 !important;line-height:1.42;color:var(--ink)}#post_detail .postTitle a{color:var(--ink) !important}#post_detail .postDesc{font-size:12.5px !important;color:var(--meta) !important;margin:0 0 22px !important;padding:0 0 16px !important;border-bottom:1px solid var(--line) !important;text-align:left !important}#post_detail .postDesc a{color:var(--meta) !important}#cnblogs_post_body{font-size:15px !important;line-height:1.9;color:var(--body)}#cnblogs_post_body p{margin:0 0 1.05em}#cnblogs_post_body h1{font-size:22px;margin:1.5em 0 .6em;color:var(--ink)}#cnblogs_post_body h2{font-size:19px;font-weight:600;color:var(--ink);margin:1.6em 0 .7em;padding-left:12px;border-left:4px solid var(--accent);line-height:1.5}#cnblogs_post_body h3{font-size:16.5px;font-weight:600;color:var(--ink);margin:1.4em 0 .6em}#cnblogs_post_body h4{font-size:15px;color:var(--ink);margin:1.2em 0 .5em}#cnblogs_post_body img{max-width:100%;height:auto;border-radius:var(--radius-sm)}#cnblogs_post_body blockquote{margin:1.2em 0;padding:12px 18px;background:var(--bg);border-left:3px solid var(--line);border-radius:0 var(--radius-sm) var(--radius-sm) 0;color:var(--meta)}#cnblogs_post_body code{background:var(--code-bg);padding:2px 6px;border-radius:4px;font-size:.9em;color:var(--code-ink);font-family:\"JetBrains Mono\",Consolas,Monaco,monospace}#cnblogs_post_body pre{background:var(--pre-bg) !important;color:var(--pre-ink) !important;padding:16px 18px !important;border:0 !important;border-radius:10px !important;overflow-x:auto;font-size:13px;line-height:1.7}#cnblogs_post_body pre code{background:none;color:inherit;padding:0}#cnblogs_post_body table{width:100%;border-collapse:collapse;margin:1.2em 0;font-size:13.5px}#cnblogs_post_body th,#cnblogs_post_body td{border:1px solid var(--line);padding:8px 12px;text-align:left}#cnblogs_post_body th{background:var(--bg);font-weight:600;color:var(--ink)}#EntryTag{margin:20px 0 8px !important;font-size:0}#EntryTag a{display:inline-block;font-size:12px;padding:4px 11px;margin:0 6px 8px 0;border-radius:20px;background:var(--bg);color:var(--body) !important}#EntryTag a:hover{background:var(--accent-soft);color:var(--accent-deep) !important}#post_next_prev{font-size:13px !important;color:var(--meta);line-height:1.9;margin:18px 0 0 !important;padding:14px 0 0 !important;border-top:1px solid var(--line);text-align:left !important}#post_next_prev a{color:var(--accent-deep) !important}#blog-comments-placeholder{padding:22px 24px;margin:0 0 18px}#blog-comments-placeholder .feedback_area_title,#blog-comments-placeholder h4{font-size:15px;font-weight:600;color:var(--ink);margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid var(--line)}.commentform{padding:22px 24px;margin:0 0 18px}.commentform .comment_textarea,.commentform textarea{width:100% !important;box-sizing:border-box;border:1px solid var(--line) !important;border-radius:var(--radius-sm) !important;padding:10px 12px !important;font-size:13.5px;outline:none}.commentform .comment_textarea:focus,.commentform textarea:focus{border-color:var(--accent) !important;box-shadow:0 0 0 3px var(--accent-soft)}#footer{max-width:1320px;margin:8px auto 0;padding:22px 24px 34px;text-align:center;font-size:12.5px;color:var(--meta);line-height:2;background:none !important;border-top:1px solid var(--line)}#footer a{color:var(--meta) !important}#footer a:hover{color:var(--accent-deep) !important}#footer img{vertical-align:-3px;height:14px}#qb-top{position:fixed;right:24px;bottom:32px;z-index:1000;width:44px;height:44px;padding:0;border-radius:50%;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer;opacity:0;visibility:hidden;transform:translateY(10px) scale(.96);transition:opacity .18s ease,transform .18s ease,visibility .18s ease,box-shadow .2s ease,border-color .2s ease,color .2s ease;display:flex;align-items:center;justify-content:center;color:var(--ink);-webkit-tap-highlight-color:transparent}#qb-top.show{opacity:1;visibility:visible;transform:translateY(0) scale(1)}#qb-top:hover{color:var(--accent-deep);transform:translateY(-2px);box-shadow:var(--shadow-hover)}#qb-top:active{transform:translateY(0) scale(.94)}#qb-top:focus-visible{outline:2px solid var(--accent);outline-offset:3px}#qb-top .qb-top-ico{position:relative;z-index:1;width:18px;height:18px;transition:transform .2s ease}#qb-top:hover .qb-top-ico{transform:translateY(-1.5px)}#qb-top .qb-top-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none}#qb-top .qb-top-ring circle{fill:none;stroke-width:2;stroke-linecap:round}#qb-top .qb-top-ring-bg{stroke:var(--line)}#qb-top .qb-top-ring-fg{stroke:var(--accent);stroke-dasharray:116.2;stroke-dashoffset:116.2;transition:stroke-dashoffset .12s linear}@media (max-width: 640px){#qb-top{right:16px;bottom:20px}}@media (prefers-reduced-motion: reduce){#qb-top,#qb-top .qb-top-ico,#qb-top .qb-top-ring-fg{transition:none}#qb-top.show{transform:none}#qb-top:hover{transform:none}#qb-top:hover .qb-top-ico{transform:none}.qb-panel,#sideBarMain{animation:none}}body.qb-dark,body.qb-dark #home,body.qb-dark #main{background:var(--bg) !important}html:has(> body.qb-dark){background:#0d1117 !important}body.qb-dark #cnblogs_post_body a,body.qb-dark #sidebar_news a,body.qb-dark #blog-comments-placeholder a,body.qb-dark .commentform a{color:var(--accent) !important}body.qb-dark #cnblogs_post_body a:hover,body.qb-dark #sidebar_news a:hover{color:var(--accent-deep) !important}body.qb-dark #cnblogs_post_body blockquote{background:#161b22;border-left-color:#3b434b;color:var(--meta)}body.qb-dark #cnblogs_post_body code{background:rgba(110, 118, 129, .4);color:#e6edf3;border:0}body.qb-dark #cnblogs_post_body pre,body.qb-dark .cnblogs_code,body.qb-dark .cnblogs_code pre{background:#161b22 !important;color:#e6edf3 !important;border:1px solid var(--line) !important;border-radius:10px !important}body.qb-dark .cnblogs_code_toolbar,body.qb-dark .cnblogs_code_collapse{background:transparent !important;border-color:var(--line) !important}body.qb-dark .cnblogs_code_toolbar a,body.qb-dark .cnblogs_code_collapse{color:var(--meta) !important}body.qb-dark #cnblogs_post_body table{border-color:var(--line)}body.qb-dark #cnblogs_post_body th{background:#161b22;color:var(--ink);border-color:var(--line)}body.qb-dark #cnblogs_post_body td{border-color:var(--line)}body.qb-dark #cnblogs_post_body hr{border-color:var(--line)}body.qb-dark #cnblogs_post_body img{background:transparent}body.qb-dark .commentform textarea,body.qb-dark #tbCommentBody,body.qb-dark .comment_textarea{background:#0d1117 !important;color:var(--body) !important;border-color:var(--line) !important}body.qb-dark .comment_btn,body.qb-dark #btn_comment_submit{background:#21262d !important;color:var(--ink) !important;border:1px solid var(--line) !important;border-radius:6px !important}body.qb-dark .feedbackItem,body.qb-dark .blog_comment_body,body.qb-dark #blog-comments-placeholder .comment_item{background:transparent !important;color:var(--body) !important;border-color:var(--line) !important}body.qb-dark .feedbackCon,body.qb-dark .comment_vote{background:transparent !important}body.qb-dark #sidebar_news_container [style*=\"background\"],body.qb-dark #blog-news [style*=\"background\"]{background:rgba(255, 255, 255, .04) !important;color:var(--body) !important}body.qb-dark #sidebar_news_container [style*=\"color\"],body.qb-dark #blog-news [style*=\"color\"]{color:var(--body) !important}body.qb-dark #sidebar_news_container [style*=\"border-top\"],body.qb-dark #blog-news [style*=\"border-top\"]{border-top-color:var(--line) !important}body.qb-dark .qb-pager a{box-shadow:none}body.qb-dark .qb-pager a:hover,body.qb-dark .qb-pager .qb-cur{box-shadow:none}body.qb-dark #qb-top{background:var(--card);border-color:var(--line)}body.qb-dark #qb-top .qb-top-ring-bg{stroke:var(--line)}body.qb-dark #blog-sidecolumn #q,body.qb-dark #blog-sidecolumn input[type=\"text\"],body.qb-dark #blog-sidecolumn input[type=\"button\"]{color:var(--body)}body.qb-dark #blog-calendar td,body.qb-dark #blog-calendar th{color:var(--body)}body.qb-dark #post_detail img,body.qb-dark #cnblogs_post_body img,body.qb-dark #sidebar_news_container img{filter:brightness(.9)}body.qb-dark #post_detail img:hover,body.qb-dark #cnblogs_post_body img:hover{filter:none}@media screen and (max-width: 1220px){#main{grid-template-columns:216px minmax(0, 1fr) 236px;gap:16px;padding:20px 16px 8px}}@media screen and (max-width: 1024px){#main{grid-template-columns:220px minmax(0, 1fr);gap:16px}#mainContent{grid-column:2}#sideBarMain,#blog-calendar{display:none !important}}@media screen and (max-width: 860px){#main{display:flex !important;flex-direction:column;grid-template-columns:none;padding:14px 14px 4px;gap:14px}#mainContent,#qb-left,#sideBarMain,#blog-calendar{grid-column:auto;grid-row:auto;width:100%}#sideBar,#sideBarMain{display:block !important}#qb-left,#sideBarMain{display:none}#blog-calendar{display:none}#post_detail{padding:20px 18px}#post_detail .postTitle{font-size:21px !important}.day{padding:16px 16px 12px}.qb-nav-inner{padding:0 14px;height:52px;gap:10px}.qb-nav{min-height:52px}.qb-brand{gap:7px;font-size:15px}.qb-logo{width:24px;height:24px;flex:0 0 24px}.qb-links{flex:1 1 auto;min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}.qb-links::-webkit-scrollbar{display:none}#qb-dark-toggle{flex:0 0 36px}}";
  (document.head || document.documentElement).appendChild(st);
})();
(function () {
'use strict';
var HOME = 'https://www.cnblogs.com/zhangshuaiyin/';
var NOTICE_HTML =
'<p>你好，我是 <b>EP流苏</b></p>' +
'<p>记录 Java 后端、中间件与工具排错的笔记。<br>多为实践中踩坑后的整理，欢迎交流</p>' +
'<p class="qb-notice-tip">文章均为个人实践总结，转载请注明出处</p>' +
'<p class="qb-notice-links">' +
'<a href="https://github.com/zsy0216" target="_blank" rel="noopener">GitHub</a>' +
'<a href="' + HOME + 'rss" target="_blank" rel="noopener">RSS</a>' +
'<a href="https://msg.cnblogs.com/send/Ep%E6%B5%81%E8%8B%8F">留言</a>' +
'</p>';
var CFG = (function () {
var d = {
accent: '',
dark: 'auto',
backToTop: true,
pager: true,
archive: true,
archiveTtl: 24,
gate: true,
nav: {
brand: 'Ep流苏',
home: HOME,
logo: 'https://images.cnblogs.com/cnblogs_com/blogs/477677/galleries/1560097/t_261107102128_QQ%E5%9B%BE%E7%89%8720201122102348.jpg',
mark: true,
dark: true,
links: [
{ t: '首页', h: HOME },
{ t: '归档', h: HOME + 'p/archive/2026/11' },
{ t: '分类', h: HOME + 'categories' },
{ t: '标签', h: HOME + 'tag' },
{ t: '留言', h: 'https://msg.cnblogs.com/send/Ep%E6%B5%81%E8%8B%8F' },
{ t: 'GitHub', h: 'https://github.com/zsy0216', b: 1 },
{ t: 'RSS', h: HOME + 'rss', b: 1 },
{ t: '主页', h: 'https://home.cnblogs.com/u/zhangshuaiyin' },
{ t: '管理', h: 'https://i.cnblogs.com/settings/', b: 1 }
]
},
notice: {
show: true,
title: '公告',
html: NOTICE_HTML
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
if (nav && !shell && !explicit) return nav;
if (!nav || !shell) {
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
brandA.href = n.home || '/';
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
if (n.mark !== false) {
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
a.href = it.h || it.href || '#';
if (it.b || it.blank) {
a.target = '_blank';
a.rel = 'noopener';
}
wrap.appendChild(a);
});
inner.appendChild(wrap);
}
if (n.dark !== false) {
var btn = mk('a', 'qb-dark-btn');
btn.id = 'qb-dark-toggle';
btn.href = 'javascript:void(0)';
btn.title = '切换暗色模式';
btn.setAttribute('rel', 'nofollow noopener');
var icon = mk('i', null, '🌙');
icon.id = 'qb-dark-icon';
btn.appendChild(icon);
inner.appendChild(btn);
}
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
list.style.maxHeight = 'calc(100vh - 220px)';
list.style.overflowY = 'auto';
list.style.overscrollBehavior = 'contain';
panel.children[0].appendChild(mk('span', 'qb-count', n + ' 篇'));
watchOverflow(list);
left.insertBefore(panel, left.firstChild);
return true;
}
function watchOverflow(el) {
function upd() {
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
function darkPref() {
var v = null;
try { v = localStorage && localStorage.getItem('qb-dark'); } catch (e) { }
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
if ((arcPending && n < 60) || (colPending && n < 30)) {
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
markNav();
initFavicon();
initDarkMode();
if (CFG.backToTop) createBackToTop();
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
