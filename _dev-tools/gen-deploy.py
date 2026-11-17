# -*- coding: utf-8 -*-
"""生成「v7 全托管」的后台粘贴包 —— 后台只需贴两个字段，产物就两份，版本号自动跟随源码。

用法
    python _dev-tools/gen-deploy.py                 输出到 dist/paste（随仓库分发）
    python _dev-tools/gen-deploy.py --out D:/x      指定输出目录
    python _dev-tools/gen-deploy.py --check         只比对，不写盘

产物（全托管 = 后台只填 CSS 与页首两个字段，页脚与公告保持空白；**不需要上传任何文件**）
    样式.css          = 「页面定制 CSS 代码」字段：首帧标记 + 完整压缩样式
    页首.html         = 「页首 HTML 代码」字段（通用版，发给别人用）：
                        配置整块留空，脚本按当前站点推导品牌名与站内链接；
                        js 从 jsDelivr 取，主源 gcore、备源 cdn，两个地址都钉版本号。
    页首-我的站.html  = 同一套模板，但配置是作者本站的（品牌 / 头像 / 公告 / 菜单），
                        备源换成作者自己的博客园文件空间。只有作者自己贴这一份。
    页脚、公告两个字段留空即可，不再生成占位文件。

    为什么通用版不能共用作者那份配置：v7.26 之前只有一份，别人照 README 贴完，
    顶栏写着作者的名字、头像是作者的头像、菜单全指向作者博客 —— 那不叫装好了。

    --mode inline / hybrid 是备选形态，仍会生成四份（1-页首 / 2-页脚 / 3-公告 / 4-样式），
    分别落在 dist/paste/inline/ 与 dist/paste/hybrid/；两份都用通用配置。

设计说明
    这些文件是「给博客园后台复制粘贴用的拼装件」，不是主题源码：
    真源永远是 snippets/ + css/ + dist/document-theme.js。改源码后重跑本脚本即可，
    不要手改产物；版本号从 css/theme-v7.css 头部读，避免 ?v= 与产物对不上。

    为什么必须用 document.write 加载（v7.2 的关键）：
      博客园会把页首字段里的 <script src> 自动改写成 defer（实测原始 HTML 里带 defer），
      脚本因此不阻塞解析 —— 顶栏先画、60KB 脚本后到，中间整页是无样式状态。
      v7.1 只是把顶栏藏起来，页面主体照样裸奔，用户看到的就是「先没样式，再套样式」。
      内联脚本不会被改写，document.write 插入的脚本按解析期同步执行，
      样式在首次绘制前就注入 → 从第一帧起就是完整主题。

    v7.4 补充：样式改由页首 <link> 承担（阻塞渲染，样式不再依赖脚本），
      脚本也回到 document.write 同步加载，并在脚本内用 MutationObserver 盯着解析进度，
      #main 一出现就初始化 —— 这样顶栏、目录、侧栏、公告都赶在首帧之前就位，
      不会再出现「页面先出现、200ms 后侧栏啪地冒出来」的闪动。
"""

import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'css/theme-v7.css')
SNIP = os.path.join(ROOT, 'snippets')
DEFAULT_OUT = os.path.join(ROOT, 'dist', 'paste')

# 合并版在博客园文件空间的直链。换账号 / 换文件名时改这一行。
BUNDLE_URL = 'https://blog-static.cnblogs.com/files/blogs/477677/document-theme.js'
# GitHub 仓库镜像（jsDelivr），页首优先取它。改版只要 push 并打 tag，不必再登后台传文件；
# 缺点在国际线路，所以页首里配了 onerror 兜底回 BUNDLE_URL。
#
# 为什么钉 tag 而不是 @master（实测有据，别再改回去）：
#   · jsDelivr 各节点会长期缓存分支引用。实测 push 完 v7.22 后，fastly / cdn 已回源
#     到新包，gcore 仍返回两周前的 v7.17；带 ?v=7.22 也一样 —— gcore 的缓存键不含
#     query，所以「加 ?v= 防旧缓存」对它无效。
#   · purge.jsdelivr.net 只覆盖 CF / FY 两条链路，gcore 不在其中，清不动。
#   · tag 是不可变 ref（新路径 = 无旧缓存），实测 @06359f6 立即拿到完整 109628 B 新包。
#
# v7.30：从「钉死某个 tag」改成「@latest + 当天日期参数」。
#   上一版把 tag 写进页首，副作用是每发一版都得重贴页首 —— 这跟「装一次就不用再管」
#   的初衷正好相反（作者本人 2026-11-17 指出）。现在：
#     · @latest 由 CDN 端解析成最新 tag（实测 2026-11-17 返回 v7.29 的包，gcore/cdn 均 200）；
#     · 响应头 Cache-Control 是 max-age=604800（浏览器 7 天）、s-maxage=43200（边缘 12 小时），
#       所以 URL 里拼一个「当天日期」——每天换一次 key，浏览器不会拿 7 天前的缓存，
#       发版后最迟次日全网生效，不需要任何人动后台；
#     · 忘了打 tag 也不会 404：@latest 仍解析到上一个 tag，页面停在旧版但不破。
MIRROR_REPO = 'https://gcore.jsdelivr.net/gh/zsy0216/cnblogs-document-theme'


def mirror_url(ver):
    """镜像地址：跟随最新标签（@latest）。日期参数由页首在运行时拼上，见 HEAD_TOP。"""
    return '%s@latest/dist/document-theme.js' % MIRROR_REPO
# 样式永远内联在「页面定制 CSS 代码」字段里，不走外链。
# 理由：首帧闸门（html:not(.qb-ready) body{opacity:0}）就写在 CSS 里 —— CSS 若从外部
# 加载，那个请求一旦失败，页面连闸门都没有，整站裸奔；内联进 HTML 则由博客园服务端直出，
# 零请求、零失败面。代价是发版后要重贴 50KB，这是唯一但值得付的账。
# （曾经留过一条指向 blog-static 的 CSS_URL 但从未启用，2026-11-17 查该地址还是 404。）
ICON_URL = ('https://images.cnblogs.com/cnblogs_com/blogs/477677/galleries/1560097/'
            't_261107101943_blog-icon.jpeg')

TOKEN = re.compile(r'流苏主题\s+(v\d+\.\d+)')

# 归档页标记。三种形态都要，因为「原生按月列表先露脸、再被时间线替换」这件事
# 跟加载方式无关：原生列表 633ms 就渲染完，时间线 884ms 才建好，中间那一下就是闪。
# 页首里做一次路径判断、给 <html> 挂个类，CSS 的 html.qb-arc-page 规则据此先藏起
# 原生列表；脚本建好时间线后接管，若最终没建成（只有一个月）则在 unlock 时解类。
# 不碰 DOM、不引资源，纯字符串判断，放在页首最前面。
ARC_FLAG = '''<script>
/* 归档页标记：见 CSS 里 html.qb-arc-page 一节 */
if (/\\/(?:p\\/)?archive\\/\\d{4}\\/\\d{1,2}/.test(location.pathname)) {
  document.documentElement.className += ' qb-arc-page';
}
</script>
'''

# 首帧闸门：写进 CSS 字段的最前面。
#
# 位置很关键，这一条踩了整整一轮：
#   放页首字段（body 内 10.9KB 处）→ body 从 5KB 处就开始解析，闸门生效前浏览器
#   已经画了一帧「博客园原生皮肤、无顶栏」的画面，实测 293ms 那一帧 op=1 —— 就是闪。
#   放 CSS 字段（博客园编译成 head 里的 custom.css）→ 阻塞渲染，首绘前就生效，
#   实测第一帧起 op 一直是 0，直到结构齐才放开。
#
# 为什么不能放在 CSS 源文件里再由脚本注入：托管形态下 CSS 是脚本注入的，
# 脚本晚到 = 闸门晚到，那之前照样画了一整页。必须在 head 里、随 HTML 首字节生效。
#
# 兜底 2.5 秒：脚本 404 / 被拦 / 禁 JS 都不会永远白屏。
# 「页面定制 CSS 代码」字段 = 完整主题样式 + 一条首帧标记。
#
# 为什么必须是完整样式，而不是几百字节的骨架：
#   托管形态下样式在 document-theme.js 里，脚本没到就没有样式。浏览器在脚本之前
#   就已经会画一帧，这一帧如果只有骨架，看到的是「顶栏白条 + 博客园原生内容」，
#   脚本一到整页换样式 —— 切页那一下「刷」就是它。实测新页首帧左右两栏是空的，
#   跨页过渡的新快照也跟着空。
#   把完整样式放字段 = 首帧就是最终外观，脚本到达后只填内容，不再换样式。
#
# 为什么只贴一次就够：
#   本文件里的样式与 theme-v7.css 是同一份（生成时直接取 min 产物），
#   js 里的那份只在检测不到本字段时才注入。以后改配色、改卡片样式只上传
#   document-theme.js，后台这个字段不用再动。
#
# html{--qb-field:1} 是给 js 的标记：脚本看到它就知道字段里有样式，跳过注入，
# 避免同一份 33KB 样式被塞两遍（无视觉差异，但会白算一次全量样式）。
FIELD_MARK = 'html{--qb-field:1}\n'


def field_css(css):
    """「页面定制 CSS 代码」字段的内容：标记 + 完整主题样式。"""
    return FIELD_MARK + css + '\n'


# 作者本站的配置块（只进「页首-我的站.html」）：
# 默认值是作者本站的实际配置，贴上去与当前线上外观一致。
CFG_AUTHOR = '''/* ===== 配置区：整个主题只有这一处要改，改完保存就生效 =====
   ① 每个键都可以删。删光会按「当前站点」自动生成：首页 / 归档（当月）/ 分类 / 标签 / RSS，
      品牌名取页面标题里的博客名，公告取后台「公告」字段原文。
   ② 只写想改的键即可：nav、notice 逐项覆盖，links 整体替换。
   ③ 字段速查
      基础  accent 强调色 | dark 'auto'|'on'|'off' | backToTop | pager | archive | archiveTtl | gate
      代码块 code { lineNumbers 行号, copy 复制按钮 }，写 code: false 整块关掉
      顶栏  nav { brand 博客名, home 首页, logo 头像图, mark 十字标记, dark 暗色按钮,
                  links [{ t 文字, h 地址, b 1=新窗口, on 1=强制高亮 }] }
      公告  notice { show 是否显示, title 标题, html 正文（支持 HTML，留空则用后台公告字段） }
   ④ 地址里的 {ym} 会展开成当前年月（归档必须带年月，根路径实测 404），不用每月手改。
   ⑤ 换成自己的站：改 nav.home 与 links 里的域名即可。 */
window.LS_CONFIG = {
  /* 下面两项默认就够用，所以留成注释而不是写死值。
     原因：本对象里的键会盖掉旧名 window.QB_CONFIG 的同名键 ——
     写死 accent: '' 就等于把 QB_CONFIG 里设的强调色整个吞掉。
     要用时去掉行首的两个斜杠即可。 */
  // accent: '#3b82f6',
  // code: { lineNumbers: false, copy: false },

  /* 顶栏导航 */
  nav: {
    brand: 'Ep流苏',
    home: 'https://www.cnblogs.com/zhangshuaiyin/',
    logo: 'https://images.cnblogs.com/cnblogs_com/blogs/477677/galleries/1560097/t_261107102128_QQ%E5%9B%BE%E7%89%8720201122102348.jpg',
    links: [
      { t: '首页', h: 'https://www.cnblogs.com/zhangshuaiyin/' },
      { t: '归档', h: 'https://www.cnblogs.com/zhangshuaiyin/p/archive/{ym}' },
      { t: '分类', h: 'https://www.cnblogs.com/zhangshuaiyin/categories' },
      { t: '标签', h: 'https://www.cnblogs.com/zhangshuaiyin/tag' },
      { t: '留言', h: 'https://msg.cnblogs.com/send/Ep%E6%B5%81%E8%8B%8F' },
      { t: 'GitHub', h: 'https://github.com/zsy0216', b: 1 },
      { t: 'RSS', h: 'https://www.cnblogs.com/zhangshuaiyin/rss', b: 1 },
      { t: '主页', h: 'https://home.cnblogs.com/u/zhangshuaiyin' },
      { t: '管理', h: 'https://i.cnblogs.com/settings/', b: 1 }
    ]
  },

  /* 公告（右栏第一张卡） */
  notice: {
    show: true,
    title: '公告',
    html: '<p>你好，我是 <b>EP流苏</b></p>'
        + '<p>记录 Java 后端、中间件与工具排错的笔记。<br>多为实践中踩坑后的整理，欢迎交流</p>'
        + '<p class="qb-notice-tip">文章均为个人实践总结，转载请注明出处</p>'
        + '<p class="qb-notice-links">'
        + '<a href="https://github.com/zsy0216" target="_blank" rel="noopener">GitHub</a>'
        + '<a href="https://www.cnblogs.com/zhangshuaiyin/rss" target="_blank" rel="noopener">RSS</a>'
        + '<a href="https://msg.cnblogs.com/send/Ep%E6%B5%81%E8%8B%8F">留言</a>'
        + '</p>'
  }
};'''


# 通用配置块：给「别人装」用。全部留空，脚本按当前站点推导 —— 品牌名取博客名、
# 站内链接指向自己的站、公告用后台「公告」字段原文，不会带出作者的任何信息。
#
# 为什么不再把作者那套 nav/notice 塞进通用模板：v7.26 之前只有一份配置，别人照
# README 贴完，顶栏写着「Ep流苏」、头像和公告都是作者的、菜单全指向作者博客。
# 这不叫「装好了」，叫「把别人的站套在自己域名上」。
CFG_GENERIC = '''/* ===== 配置区：不改也能用，想更像自己的站再动 =====
   全部留空时，脚本按「当前站点」自动推导：
     · 顶栏品牌 = 页面标题里的博客名；
     · 首页 / 归档（当月）/ 分类 / 标签 / RSS 都指向你自己的博客；
     · 公告用博客园后台「公告」字段的原文，不内置任何人的文案。
   下面两块都是注释，需要哪块就把 // 去掉再改。完整字段表见仓库 README「配置项」。 */
window.LS_CONFIG = {
  /* ① 强调色：换一个 hex 就是另一套配色，暗色下会自动派生深/浅两档 */
  // accent: '#3b82f6',

  /* ② 顶栏菜单：links 是「整体替换」不是追加，写了就只显示你写的这几条。
        地址里 {ym} 会展开成当前年月（归档必须带年月，根路径实测 404）。 */
  // nav: {
  //   brand: '我的博客',
  //   home: 'https://www.cnblogs.com/你的博客名/',
  //   links: [
  //     { t: '首页', h: 'https://www.cnblogs.com/你的博客名/' },
  //     { t: '归档', h: 'https://www.cnblogs.com/你的博客名/p/archive/{ym}' },
  //     { t: 'GitHub', h: 'https://github.com/你的账号', b: 1 }
  //   ]
  // }
};'''


HEAD_TOP = '''<!-- 流苏主题 __VER__ · 页首 HTML（__HDR__）
     __NOTE__ -->

__ARC__
__HEADLINKS__

<!-- 1) 顶栏占位：先给 59px 白条，菜单由紧随其后的脚本填进来 -->
<div class="qb-nav" id="qb-nav"><div class="qb-nav-inner"></div></div>

<script>
// 2) 配置层 —— 本字段里唯一需要改的就是下面这一块
__CFG__
</script>

<script>
/* 3) 同步加载：主源 + 备源，失败自动切换（不需要你上传任何文件）。
     · 主源 = GitHub 仓库（jsDelivr 的 @latest）：作者发版只要 push 打 tag，
       这里永远取最新那版，你不需要为了升级再贴一次页首；
     · 备源 = 主源失效时自动接管（装配脚本按发放对象写入，见下方 FALLBACK 常量）；
     · 主源失败过就 1 小时内直接走备源，免得每次进站都等一遍超时（记 localStorage，
       不写 cookie，换设备互不影响，也不会把失败态永久钉死）；
     · 地址后面拼一个「当天日期」：jsDelivr 给文件的缓存是浏览器 7 天 / 边缘 12 小时，
       每天换一次 URL，浏览器就不会一直吃旧缓存，发版最迟次日生效；
     · 仍然必须是 document.write：博客园会把页首里的外部 <script src> 改写成 defer，
       那样样式就排到首帧之后；内联脚本不会被改写，document.write 插入的是「解析期
       脚本」—— 阻塞解析、按序立刻执行，顶栏/目录/侧栏/公告全部赶在首帧之前就位。
     · 标签名拆开拼，是为了页面上不出现脚本标签的开闭字面量（HTML 校验器会误判）。 */
(function () {
  var s = 'script';
  var d = new Date(), pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var stamp = '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  var q = function (u) { return u + (u.indexOf('?') < 0 ? '?' : '&') + 'd=' + stamp; };
  var MIRROR = q('__MIRROR__');
  var FALLBACK = q('__FALLBACK__');
  var KEY = 'qb-src-fail', TTL = 3600000;

  function recentlyFailed() {
    try {
      var t = +localStorage.getItem(KEY) || 0;
      return t > 0 && Date.now() - t < TTL;
    } catch (e) { return false; }
  }

  function write(url, tag) {
    document.write('<' + s + ' src="' + url + '"' + (tag || '') + '><' + '/' + s + '>');
  }

  /* 主源挂了：记下时间，再异步补一份备源。
     这里不能用 document.write —— 失败事件可能已经晚于解析期，再写会清空文档。 */
  window.__qbSrcFail = function () {
    try { localStorage.setItem(KEY, Date.now()); } catch (e) {}
    var e = document.createElement(s);
    e.src = FALLBACK;
    (document.head || document.documentElement).appendChild(e);
  };

  if (recentlyFailed()) write(FALLBACK, '');
  else write(MIRROR, ' onerror="window.__qbSrcFail()"');
})();
</script>
'''

# 全托管形态下「页脚」「公告」两个字段保持空白，曾生成过占位注释文件，
# 现已取消 —— 说明写进 README 与安装文档，仓库里不再放两份纯注释的产物。

# ---------- 零闪版（inline）：三个字段全内联，零外部请求 ----------
HEAD_INLINE = '''<!-- 流苏主题 __VER__ · 页首 HTML（零闪版）
     本字段只有三样东西：收藏夹图标、预连接、配置对象。没有任何主题资源请求。
     样式在「页面定制 CSS 代码」字段，脚本在「页脚 HTML 代码」字段 ——
     三段全部内联，加载时序与 6.x 完全一致，切页不会闪。 -->

__ARC__
<link rel="preconnect" href="https://assets.cnblogs.com" />
<link rel="preconnect" href="https://cdn-www.cnblogs.com" />
<link rel="preconnect" href="https://img2023.cnblogs.com" />
<link rel="preconnect" href="https://pic.cnblogs.com" />
<link rel="icon" href="__ICON__" />

<script>
// 配置层 —— 本字段里唯一需要改的就是下面这一块
/* 闸门保持开启（gate 默认 true）：脚本在页脚跑完、右栏那十张卡到位后才让页面可见。
   实测关掉闸门反而更差 —— 园方会在右栏还是空的时候把 body 淡入，
   用户看到的是「公告下面一路长出来」。开启闸门后，可见第一帧右栏就是满的。 */
__CFG__
</script>
'''

FOOT_INLINE_HEAD = '''<!-- 流苏主题 __VER__ · 页脚 HTML（零闪版）
     位置：博客园后台 → 设置 → 页脚 HTML 代码（粘贴前先清空）
     本段是主题的全部脚本，内联在页面里、不发起任何请求。脚本在解析到页脚时执行，
     此时 DOM 已完整：顶栏、文章目录、侧栏、公告一次建成，赶在首帧之前完成，
     所以不会出现「先出页面、后补内容」的闪动。
     要改逻辑请改 snippets/footer-script-v7.html 再重跑生成脚本，不要手改这里。 -->
'''

NOTICE_INLINE = ('<!-- 零闪版：本字段请留空。\n'
                 '     公告由脚本按 LS_CONFIG.notice 渲染（默认已内置你原来的文案），\n'
                 '     这里再写会重复显示。 -->\n')

# ---------- 混合版（hybrid）：样式内联进 CSS 字段，脚本仍托管 ----------
# 这是唯一能同时做到「首帧就是三栏」和「改逻辑只传文件」的形态：
#   · 样式在「页面定制 CSS 代码」字段 → 随 HTML 首字节到达，零请求、零等待，
#     浏览器的第一帧布局就是 260/1fr/292 三栏，不会出现「单列 → 三栏」的整页重排；
#   · 顶栏是静态 HTML（v6 的做法）→ 首帧就有 59px 白条与菜单，不等脚本；
#   · 脚本仍从博客园文件空间同步加载 → 目录、公告、归档这些加工逻辑改动时，
#     只需上传 document-theme.js，不必重贴 CSS。
# 代价：样式若有改动，需要重贴一次 CSS 字段（脚本改动不受影响）。
HEAD_HYBRID = '''<!-- 流苏主题 __VER__ · 页首 HTML（混合版）
     本字段只放两样东西：静态顶栏、配置 + 同步加载脚本。
     样式在「页面定制 CSS 代码」字段（必须贴，否则首帧是单列布局，加载后整页重排）。 -->

__ARC__
<link rel="preconnect" href="https://blog-static.cnblogs.com" />
<link rel="icon" href="__ICON__" />

__NAV__

<script>
// 配置层 —— 本字段里唯一需要改的就是下面这一块
/* 混合版上面的静态顶栏只作首帧兜底：一旦这里写了 nav，静态顶栏会被按配置重建的顶栏取代。 */
__CFG__
</script>

<script>
/* 同步加载：不能改成 createElement + async。
     博客园会把页首里的外部脚本标签自动改写成 defer，那样脚本就排到首帧之后；
     内联脚本不会被改写，document.write 插入的是解析期脚本，按序立刻执行。
     样式已由 CSS 字段保证，所以脚本只负责加工，不承担「首帧有没有样式」。 */
(function () {
  var s = 'script';
  document.write('<' + s + ' src="__BUNDLE__?v=__NUM__"><' + '/' + s + '>');
})();
</script>
'''

FOOT_HYBRID = ('<!-- 混合版：本字段请留空。\n'
               '     配置与加载脚本都在「页首 HTML 代码」里，这里再放一份会重复执行。 -->\n')

NOTICE_HYBRID = ('<!-- 混合版：本字段请留空。\n'
                 '     公告由 LS_CONFIG.notice 渲染（默认已内置你原来的文案）。 -->\n')



# 首帧闸门（html:not(.qb-ready) body{opacity:0}）必须保留 —— 它是「可见时刻 = 结构齐时刻」的唯一保证。
#
# 曾经以为内联版不需要它（脚本在页脚同步执行，看起来不用等），实测打脸：
#   无闸门 → 园方自己在 ~600ms 把 body 淡入，那一刻右栏那十张卡（博客园 XHR）还没到，
#            实测 #qb-right 319px，200ms 后才长到 1590px → 用户看到右栏一路长出来 = 闪。
#   有闸门 → 脚本在页脚 settle() 等到右栏卡到位才放行，可见第一帧右栏就是 1590px，中间态 0 帧。
# 6.28 之所以"不闪"，是因为园方的淡入碰巧落在结构齐之后；这是运气，不是设计。
# 闸门把它变成必然。
#
# 兜底：CSS 里 2.5s 纯样式解锁，脚本里 1.5s 强制解锁 —— 脚本被拦/报错也不会留白。
def read(path):
    with io.open(path, encoding='utf-8', newline='') as f:
        return f.read()


def write(path, text):
    with io.open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def build(ver, mode='hosted'):
    css = read(os.path.join(ROOT, 'css/theme-v7.min.css')).rstrip()
    if mode == 'inline':
        foot = read(os.path.join(SNIP, 'footer-script-v7.min.html')).strip()
        head = (HEAD_INLINE.replace('__VER__', ver).replace('__ICON__', ICON_URL)
                          .replace('__ARC__', ARC_FLAG)
                          .replace('__CFG__', CFG_GENERIC)
)
        return {
            '1-页首.html': head,
            '2-页脚.html': FOOT_INLINE_HEAD.replace('__VER__', ver) + foot + '\n',
            '3-公告.html': NOTICE_INLINE,
            '4-样式.css': field_css(css),
        }
    if mode == 'hybrid':
        navsrc = read(os.path.join(SNIP, 'head-nav-v7.html'))
        i = navsrc.find('<div class="qb-nav">')
        if i < 0:
            sys.exit('✗ snippets/head-nav-v7.html 里没找到 <div class="qb-nav">')
        head = (HEAD_HYBRID.replace('__VER__', ver)
                           .replace('__ICON__', ICON_URL)
                           .replace('__NAV__', navsrc[i:].strip())
                           .replace('__BUNDLE__', BUNDLE_URL)
                           .replace('__ARC__', ARC_FLAG)
                           .replace('__CFG__', CFG_GENERIC)
                           .replace('__NUM__', ver.lstrip('v')))
        return {
            '1-页首.html': head,
            '2-页脚.html': FOOT_HYBRID,
            '3-公告.html': NOTICE_HYBRID,
            '4-样式.css': field_css(css),
        }
    def head_for(cfg, fallback, hdr, note, links):
        """同一套模板，按发放对象换四样东西：配置、备源、头注释、预连接/图标。"""
        return (HEAD_TOP.replace('__VER__', ver)
                        .replace('__HDR__', hdr)
                        .replace('__NOTE__', note)
                        .replace('__HEADLINKS__', links)
                        .replace('__MIRROR__', mirror_url(ver))
                        .replace('__FALLBACK__', fallback)
                        .replace('__ARC__', ARC_FLAG)
                        .replace('__CFG__', cfg))

    # 通用版备源 = 同一 CDN 的另一个节点（cdn.jsdelivr.net）：版本一致、跨域可用。
    # 不用作者的 blog-static 做备源，两个理由都有实测撑：
    #   · 它对 Referer 只放行 *.cnblogs.com（2026-11-17 实测 https://example.com/ → 403），
    #     绑了自定义域名的博客用不了；
    #   · 那份文件是手工上传的，同一天查还是 109628 B 的旧包 —— 兜底下来会和用户刚贴的
    #     新 CSS 版本错配，有样式没功能，比干脆没有更难看。
    generic_fallback = mirror_url(ver).replace('//gcore.jsdelivr.net', '//cdn.jsdelivr.net')
    # 作者版备源 = 自己的博客园文件空间：同域 CDN 最快，且作者自己能保证每次发版都传
    author_fallback = '%s?v=%s' % (BUNDLE_URL, ver.lstrip('v'))

    # 通用版不写 <link rel="icon">：那是作者的头像，别人贴了会把人家站的图标换掉；
    # 不写就沿用博客园自己的 favicon。
    generic_links = ('<link rel="preconnect" href="https://gcore.jsdelivr.net" crossorigin />\n'
                     '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />')
    author_links = ('<link rel="preconnect" href="https://blog-static.cnblogs.com" />\n'
                    '<link rel="preconnect" href="https://gcore.jsdelivr.net" crossorigin />\n'
                    '<link rel="icon" href="%s" />' % ICON_URL)

    return {
        '样式.css': field_css(css),
        '页首.html': head_for(
            CFG_GENERIC, generic_fallback,
            hdr='全托管 · 通用版',
            note='贴到「页首 HTML 代码」字段即可：js 从 GitHub 仓库（jsDelivr @latest）加载，'
                 '不需要上传任何文件。\n'
                 '     配置留空就用你自己的博客信息；以后升级不用再动这个字段 —— 自动跟随作者最新版。',
            links=generic_links),
        '页首-我的站.html': head_for(
            CFG_AUTHOR, author_fallback,
            hdr='全托管 · 作者自用',
            note='带本站品牌 / 头像 / 公告与菜单；备源用自己博客园文件空间。\n'
                 '     别人装主题请用「页首.html」，那份不带任何作者信息。',
            links=author_links),
    }

def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument('--out', default=None, help='输出目录，默认 dist/paste/<mode>')
    ap.add_argument('--mode', default='hosted', choices=['inline', 'hosted', 'hybrid'],
                    help='hosted=全托管（默认，贴 CSS + 页首两个字段，js 走 jsDelivr，零上传）；'
                         'hybrid=样式贴字段+脚本托管（首帧样式更早到位，但要重贴 CSS）；'
                         'inline=三字段全内联零请求（与 6.x 加载时序一致）')
    ap.add_argument('--both', action='store_true', help='三种模式各生成一套（分目录）')
    ap.add_argument('--check', action='store_true', help='只比对现有产物，不写盘')
    args = ap.parse_args()

    ver = TOKEN.search(read(CSS))
    if not ver:
        sys.exit('✗ %s 头部没找到「流苏主题 v7.N」' % CSS)
    ver = ver.group(1)

    modes = ['inline', 'hybrid', 'hosted'] if args.both else [args.mode]
    ok = True
    for mode in modes:
        # 全托管是默认形态，两份产物直接落在 dist/paste；备选形态各占一个子目录
        out = args.out or (DEFAULT_OUT if mode == 'hosted'
                           else os.path.join(DEFAULT_OUT, mode))
        if args.both and args.out:
            out = os.path.join(args.out, mode)
        files = build(ver, mode)
        print('[%s]' % mode)
        for name, text in files.items():
            path = os.path.join(out, name)
            if args.check:
                same = os.path.exists(path) and read(path) == text
                print('  %s %-14s %s' % ('✓' if same else '✗', name, '一致' if same else '不一致/缺失'))
                ok = ok and same
            else:
                os.makedirs(out, exist_ok=True)
                write(path, text)
                print('  ✓ %-14s %6d B' % (name, len(text.encode('utf-8'))))
        print('  目录：%s' % out)

    if not args.check:
        print('\n版本：%s' % ver)
        if 'inline' in modes:
            print('零闪版（推荐）：样式贴「页面定制 CSS 代码」，页脚贴「2-页脚.html」，页首贴「1-页首.html」')
        if 'hosted' in modes:
            print('托管版（发给别人）：CSS 字段贴「样式.css」，页首字段贴「页首.html」；页脚与公告留空。')
            print('                   别人照这个装就行 —— 不用 fork、不用上传、不用打 tag。')
            print('作者自用：页首改贴「页首-我的站.html」（带本站品牌/头像/公告），其余同上。')
            print('镜像：%s' % mirror_url(ver))
            print('      ↑ 不可变 ref，必须先 push 并 git tag %s，否则 404 会落到备源' % ver)
            print('作者备源：%s?v=%s （改了 js 记得重新上传到这个地址，否则作者自己的站会停在旧版）'
                  % (BUNDLE_URL, ver.lstrip('v')))
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
