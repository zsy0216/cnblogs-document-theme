# -*- coding: utf-8 -*-
"""生成「v7 全托管」的后台粘贴包 —— 后台只需贴两个字段，产物就两份，版本号自动跟随源码。

用法
    python _dev-tools/gen-deploy.py                 输出到 dist/paste（随仓库分发）
    python _dev-tools/gen-deploy.py --out D:/x      指定输出目录
    python _dev-tools/gen-deploy.py --check         只比对，不写盘

产物（全托管 = 后台只填 CSS 与页首两个字段，页脚与公告保持空白；**不需要上传任何文件**）
    落点遵循一条规矩（作者 2026-11-18）：**paste 目录只放要粘贴的文件**，别的一律挪开。
    dist/paste/样式.min.css       = 「页面定制 CSS 代码」字段（压缩成一行，3 KB）
    dist/paste/页首.html          = 「页首 HTML 代码」字段（通用版，发给别人用）：
                                    配置整块留空，脚本按当前站点推导品牌名与站内链接；
                                    js 从 jsDelivr 取，主源 cdn、备源 fastly，都跟随 @master。
    dist/paste/页首-我的站.html    = 同一套模板，但配置是作者本站的（品牌 / 头像 / 公告 / 菜单）。
                                    只有作者自己贴这一份。
    dist/readable/样式-字段可读版.css = 同内容带注释，只用来读，不往后台贴。
    dist/fallback/样式-内联备份.css   = CDN 全挂或退回内联形态时贴的全量样式（54 KB）。
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

# 全托管模式的落点（作者 2026-11-18 的要求：paste 目录只放「要粘贴的文件」）：
#   paste/    样式.min.css、页首.html、页首-我的站.html   ← 打开就知道该贴哪个
#   readable/ 样式-字段可读版.css   ← 带注释，想读懂这个字段在干什么时看（内容与 min 等价）
#   fallback/ 样式-内联备份.css      ← 应急回滚 / 内联模式要贴的全量样式（54 KB）
HOSTED_LAYOUT = {
    '样式.css': ('readable', '样式-字段可读版.css'),
    '样式-内联备份.css': ('fallback', '样式-内联备份.css'),
}

# 合并版在博客园文件空间的直链。换账号 / 换文件名时改这一行。
# v7.34 起不再当备源：那份文件是手工上传的，发版后很容易停在旧包（实测 v7.32 发布当天
# 该地址仍是上一版），兜底下来会和刚贴的 CSS 版本错配。留作应急手工回滚用。
BUNDLE_URL = 'https://blog-static.cnblogs.com/files/blogs/477677/document-theme.js'
# GitHub 仓库镜像（jsDelivr），页首优先取它。改版只要 push，不必再登后台传文件。
#
# v7.36：锚点从 @latest（最新 tag）改成 @master（分支）。
#   起因是作者 2026-11-18 的要求：「不用每次都打 tag，大版本的时候才打」。@latest 的语义是
#   「最新 tag」，不打 tag 就永远停在旧版 —— 所以这两件事只能二选一：
#     · @latest + 每次发版打 tag（v7.28~v7.35 的做法，tag 列表成了一本流水账）
#     · @master + 大版本才打 tag（现在这个）
#   选后者。以前不敢用分支引用的两个理由，现在都不成立了：
#     ① gcore 会把分支引用缓存两周、且 purge 清不掉 —— gcore 已不用（v7.36 起备源换
#        fastly.jsdelivr.net）。实测 @master 在 cdn / fastly 上都立刻拿到当前 HEAD，
#        且 purge 返回 providers {"CF":true,"FY":true}，两条链路都清得动。
#     ② 浏览器侧 max-age=604800（7 天）—— 跟 @latest 完全一样，靠页首运行时拼的
#        「当天日期」参数打散：每天一个 key，发版最迟次日全网生效，谁都不用动后台。
#   tag 从此只当里程碑：够得上一个版本节点（v8.0、大改版）时才打；平时 push 就是发布。
#
# 历史（记着别再走回头路）：
#   · v7.30 之前把某个具体 tag 钉进页首，于是每发一版都得重贴页首，与「装一次就不用再管」
#     的初衷相反（作者 2026-11-17 指出）；v7.30 改成 @latest + 当天日期参数。
#   · v7.34 主源从 gcore 换成 cdn，只因可清除性：gcore 会缓存「@latest 解析出的版本」12 小时，
#     而 purge.jsdelivr.net 只覆盖 CF / FY，gcore 不在名单里 —— 发版后 cdn 已是新版、gcore 还
#     停在两版前，换全新查询串也绕不过（它缓存的是解析结果，不是 URL）。
MIRROR_REPO = 'https://cdn.jsdelivr.net/gh/zsy0216/cnblogs-document-theme'
MIRROR_BACKUP = MIRROR_REPO.replace('//cdn.jsdelivr.net', '//fastly.jsdelivr.net')


def mirror_url(ver):
    """镜像地址：跟随 master 分支。日期参数由页首在运行时拼上，见 HEAD_TOP。"""
    return '%s@master/dist/document-theme.js' % MIRROR_REPO


def css_url():
    """样式外链：与 js 同源同版本，同样 @master，日期参数同样运行时拼。"""
    return '%s@master/css/theme-v7.min.css' % MIRROR_REPO


# v7.31：样式从「内联进 CSS 字段」改成「外链 + 字段只留闸门」。
#
# 上一版的账：js 跟 @latest 走了，但 54KB 样式仍内联在「页面定制 CSS 代码」字段里，
# 于是每次改样式（形态、间距、配色）还是要回后台重贴一次 —— 用户 2026-11-17 追问
# 「每次改版本都要重新贴页首，不就违背更新不再粘贴配置的初衷了吗」，指的正是这个半拉子。
# 现在字段只剩 ~450 字节，样式与脚本都不再需要人碰。
#
# 为什么可以这样改（上一版不敢改的两个理由，逐条消解）：
#   ① 「CSS 挂了连闸门都没有，整站裸奔」→ 闸门留在字段里，外链只负责正文样式。
#      外链失败时页面是「白屏 2.5 秒后放出博客园原样」，不会裸奔到不可用；
#   ② 「首帧会先白一帧再变暗」→ 闸门让 body 全程 opacity:0，首绘前本就是空白，
#      那一眼白由字段里的 prefers-color-scheme 兜（暗色系统直接给 #0d1117 底）。
#   ③ 「CDN 挂掉没有兜底样式」→ document-theme.js 里本来就内嵌了完整样式，且已能
#      识别外链是否成功（见 gen-bundle.py 的 inject）；外链失败它会自己注入一份。
#
# 代价：样式晚一个 RTT 到位。闸门把它藏在白屏期里，与脚本同一时刻开始下载（并行），
# 实测可见时刻不变（见 CHANGELOG v7.31 的实测记录）。
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
# 「页面定制 CSS 代码」字段 = 首帧闸门 +（内联模式下额外的）完整主题样式。
#
# v7.31 起，全托管形态里这个字段只放闸门（约 450 字节），完整样式改由页首外链。
# 之前坚持「必须是完整样式」的理由是首帧观感，但那个前提已经被闸门本身化解：
# body 全程 opacity:0，首帧本来就是空白，不存在「骨架 → 完整样式」的换装；
# 样式晚到只是让空白期稍长，而它和脚本是并行下载的，可见时刻由更慢的脚本决定。
#
# 为什么只贴一次就够：
#   字段里没有样式了，改配色、改卡片、改布局都只动仓库里的 css —— 用户零操作。
#
# html{--qb-field:1|2} 是给 js 的标记：
#   1 = 完整样式在字段里（内联/混合版）→ 跳过注入；
#   2 = 字段只有闸门，样式在外链 → 外链死了才注入内嵌那份（见 gen-bundle.py）。
FIELD_MARK = 'html{--qb-field:1}\n'


def field_css(css):
    """「页面定制 CSS 代码」字段的内容：标记 + 完整主题样式。

    只给零闪版 / 混合版用 —— 那两种形态本来就要求样式内联。
    """
    return FIELD_MARK + css + '\n'


FIELD_MARK_LINK = 'html{--qb-field:2}\n'


def min_css(src):
    """把字段 CSS 压成一行。口径与 gen-min.py 相同：括号内原样保留
    （calc(...) 里的空格、rgba(...) 里的逗号都不能动）。

    为什么单独出一份压缩版（v7.35）：
      字段内容不到 5 KB，压缩只省 2.5 KB，性能上无所谓 —— 真正的理由是「贴进去以后
      后台编辑器里是三百行中文注释 + 缩进」，作者 2026-11-18 直接问「粘贴的 css 没有压缩」。
      压缩版去掉注释、收成一行，视觉上就是一段 CSS；解释性文字在 README / 开发指南里。
    """
    body = re.sub(r'/\*[\s\S]*?\*/', '', src)
    body = body.replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    parts = re.split(r'(\([^\)]*\))', body)     # 括号内原样保留
    out = []
    for part in parts:
        if part.startswith('(') and part.endswith(')'):
            out.append(part)
        else:
            part = re.sub(r'\s+', ' ', part)
            part = re.sub(r'\s*([{};:,>~+])\s*', r'\1', part)
            out.append(part)
    body = ''.join(out).strip()
    body = body.replace(';}', '}')                                  # 块尾分号
    body = re.sub(r'(?<![\w#.])0\.(\d+)', r'.\1', body)             # 0.5 -> .5
    body = re.sub(r'(?<![\w.])0px\b', '0', body)                    # 0px -> 0
    return body


def field_css_external(url):
    """全托管形态的「页面定制 CSS 代码」字段：首帧必需的那一段（约 5.0 KB）。

    --qb-field:2 是给脚本的暗号：字段里只有这段，正文样式在外链那儿；
    gen-bundle.py 见到 2 会去看外链死没死，死了才自己注入内嵌的那份。

    为什么不能只剩「body 透明」这一条（v7.31 的失误，v7.32 修）：
      这三段必须早于「新页首绘」生效，放进外链就晚了 ——
      ① @view-transition 晚于首绘 = 跨页过渡整段失效，退回白屏硬切；
      ② 外链未到时 .qb-nav 高度是 0，还带着博客园默认 body margin 8px，
         首帧是「贴在 8px 处的一条线」，落地后才弹回 0 并撑到 59px；
      ③ 藏 body 会让跨页过渡拍到一张空白快照，顶栏同样消失。
      三件事叠加，观感就是用户说的「切页时导航栏跟着跳」。
      代价是本字段从 649 B 涨到 ~5.0 KB（顶栏骨架占了绝大部分，见下面 ①），
      且这几段几乎永不随版本变化。
    """
    return FIELD_MARK_LINK + '''/* 流苏主题 · 样式外链模式（v7.31 起）
   完整样式由页首从 __CSS__ 加载，改配色/布局不需要再回来贴这个字段。
   本字段只保留「必须早于首绘生效」的三段：布局零点 + 顶栏骨架、闸门、跨页过渡。
   样式或脚本挂了，2.5 秒纯 CSS 兜底放行，不会白屏。 */
html { background: #fff }
@media (prefers-color-scheme: dark) {
    html { background: #0d1117 }
}

/* ① 布局零点 + 顶栏。数值与 css/theme-v7.css 的同名规则一致；
      写在这里是为了让首帧的顶栏就已经长成最终样子 —— 跨页过渡会拿
      「新页首绘那一帧」的顶栏去做 morph，晚一帧就是「顶栏跳一下」。 */
html, body { margin: 0 !important; padding: 0 !important }
.qb-nav {
    position: sticky;
    top: 0;
    z-index: 999;
    min-height: 58px;
    background: #fff;
    border-bottom: 1px solid #ecedf0
}
/* 暗色靠 html.qb-dark，类由页首的预判脚本在本样式之后立刻加上（见页首第 2 段）。
   不在这里用 prefers-color-scheme：那会跟「手动选浅色 / 配置里 dark:'off'」打架，
   且媒体查询一旦命中就再也压不住（同特异性下它排在后面）。 */
html.qb-dark .qb-nav,
body.qb-dark .qb-nav { background: #161b22; border-bottom-color: #30363d }

.qb-nav-inner {
    max-width: 1320px;
    margin: 0 auto;
    height: 58px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box
}
.qb-brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    flex: 0 0 auto;
    font-size: 17px;
    font-weight: 700;
    color: #1f2329;
    letter-spacing: .01em;
    white-space: nowrap;
    text-decoration: none
}
.qb-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex: 0 0 30px
}
.qb-logo svg { width: 100%; height: 100%; display: block }
.qb-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(15, 23, 42, .08)
}
.qb-logo .qb-logo-dot { fill: #ff5f3d }
.qb-links { display: flex; align-items: center; gap: 4px }
.qb-links a {
    font-size: 14px;
    font-weight: 500;
    color: #3f4753;
    padding: 6px 12px;
    border-radius: 8px;
    white-space: nowrap;
    text-decoration: none
}
.qb-actions { display: flex; align-items: center; gap: 2px; flex: 0 0 auto }
.qb-theme { position: relative; display: flex; align-items: center; flex: 0 0 auto }
.qb-theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: none;
    color: #3f4753;
    cursor: pointer
}
.qb-theme-btn svg { width: 18px; height: 18px; display: block }
#qb-dark-toggle,
.qb-dark-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #3f4753;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer
}
html.qb-dark .qb-brand { color: #e6edf3 }
html.qb-dark .qb-links a,
html.qb-dark #qb-dark-toggle,
html.qb-dark .qb-theme-btn { color: #c9d1d9 }
html.qb-dark .qb-logo img { box-shadow: 0 0 0 1px rgba(255, 255, 255, .14) }
html.qb-dark .qb-logo .qb-logo-dot { fill: #ff7a5c }

@media screen and (max-width: 860px) {
    .qb-nav { min-height: 52px }
    .qb-nav-inner { padding: 0 14px; height: 52px; gap: 10px }
    .qb-brand { gap: 7px; font-size: 15px }
    .qb-logo { width: 24px; height: 24px; flex: 0 0 24px }
    .qb-links {
        flex: 1 1 auto;
        min-width: 0;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none
    }
    .qb-links::-webkit-scrollbar { display: none }
}

/* ② 闸门：只藏博客园原生容器，不藏 body。
      藏 body 会让跨页过渡拍到空白快照，顶栏跟着消失。 */
html:not(.qb-ready) #home,
html:not(.qb-ready) #top_nav {
    opacity: 0;
    animation: qb-unlock 0s linear 2.5s forwards
}
@keyframes qb-unlock { to { opacity: 1 } }

/* ③ 跨页过渡：切页时顶栏原地不动。
      必须写在 render-blocking 的样式里、且早于新页首绘 —— 外链做不到。 */
@view-transition { navigation: auto; }
.qb-nav { view-transition-name: qb-nav; }
::view-transition-group(qb-nav) { animation-duration: .18s; }
::view-transition-old(qb-nav),
::view-transition-new(qb-nav) { animation: none; opacity: 1; }
::view-transition-old(root) { animation: none; opacity: 1; }
::view-transition-new(root) { animation: qb-vt-in .16s ease-out both; }
@keyframes qb-vt-in { from { opacity: 0 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) { animation-duration: 0s !important }
}
'''.replace('__CSS__', url)


# 作者本站的配置块（只进「页首-我的站.html」）：
# 默认值是作者本站的实际配置，贴上去与当前线上外观一致。
# 通用版（配置里没有 nav，品牌名和站点路径只能到运行时才推得出来）用这段脚本现场拼顶栏。
# 作者版不用它 —— 见 nav_static_html()，那边直接把 HTML 写进页首，连这段脚本都不需要。
NAV_RUNTIME = r'''<script>
/* 3) 顶栏（通用版）：解析期用 document.write 直接吐出 HTML。
    为什么不是「先放空 div、脚本再填」：浏览器可能在空 div 解析完、填充脚本还没执行时
    就首绘，跨页过渡正好拍在那一刻，拍到的是空条 —— 观感就是「切页时顶栏跳一下」。
    document.write 让结构和内容在同一次解析里落地，没有中间态。
    这里生成的 DOM 与 document-theme.js 的 renderNav() 完全同构；后者到达后会清空重建
    （data-qb-pre=1 标记，见 footer-script），内容一致所以看不出重建，交互也一并接管。 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var cfg = window.LS_CONFIG || window.QB_CONFIG || {};
  var n = cfg.nav || {};
  var RESERVED = { p: 1, categories: 1, tag: 1, rss: 1, archive: 1, admin: 1, sitemap: 1 };
  var seg = String(location.pathname || '/').split('/').filter(Boolean);
  var APP = (seg.length && !RESERVED[String(seg[0]).toLowerCase()]) ? seg[0] : '';
  var HOME = location.origin + '/' + (APP ? APP + '/' : '');
  var NOW = new Date();

  /* 与 footer-script 的 resolveHref 同一口径：{ym} 不补零 */
  function href(h) {
    return String(h == null ? '' : h).replace(/\{(ym|y|m)\}/g, function (_, k) {
      if (k === 'y') return String(NOW.getFullYear());
      if (k === 'm') return String(NOW.getMonth() + 1);
      return NOW.getFullYear() + '/' + (NOW.getMonth() + 1);
    });
  }

  var brand = n.brand || '';
  if (!brand) {
    var p = String(document.title || '').split(' - ').map(function (s) { return s.trim(); });
    while (p.length && /^博客园$/.test(p[p.length - 1])) p.pop();
    brand = p.length ? p[p.length - 1] : '';
  }

  var MARK = '<svg width="30" height="30" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">'
    + '<g fill="none" stroke="currentColor" stroke-width="7.4" stroke-linecap="round">'
    + '<path d="M9.8 9.8 L22.2 22.2"/><path d="M22.2 9.8 L9.8 22.2"/></g>'
    + '<circle class="qb-logo-dot" cx="4.9" cy="27.1" r="3.1"/></svg>';
  var PALETTE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
    + 'stroke-width="1.9" stroke-linejoin="round">'
    + '<path d="M12 3.4c3.5 3.7 6.1 6.7 6.1 9.9a6.1 6.1 0 0 1-12.2 0c0-3.2 2.6-6.2 6.1-9.9z"/>'
    + '<path d="M9.3 13.4a2.7 2.7 0 0 0 2.7 2.7" stroke-linecap="round"/></svg>';

  var h = '<div class="qb-nav" id="qb-nav" data-qb-pre="1"><div class="qb-nav-inner">';
  h += '<a class="qb-brand" href="' + esc(href(n.home || HOME)) + '">';
  if (n.logo) {
    h += '<span class="qb-logo"><img src="' + esc(n.logo) + '" alt="' + esc(brand)
       + '" width="30" height="30"></span>';
  } else if (n.mark !== false) {
    h += '<span class="qb-logo" aria-hidden="true">' + MARK + '</span>';
  }
  if (brand) h += '<span class="qb-brand-text">' + esc(brand) + '</span>';
  h += '</a>';

  var links = n.links instanceof Array ? n.links : [
    { t: '首页', h: HOME },
    { t: '归档', h: HOME + 'p/archive/{ym}' },
    { t: '分类', h: HOME + 'categories' },
    { t: '标签', h: HOME + 'tag' },
    { t: 'RSS', h: HOME + 'rss', b: 1 }
  ];
  if (links.length) {
    h += '<nav class="qb-links">';
    for (var i = 0; i < links.length; i++) {
      var it = links[i];
      if (!it) continue;
      var txt = it.t || it.text;
      if (!txt) continue;
      h += '<a' + (it.on ? ' class="on"' : '') + ' href="' + esc(href(it.h || it.href || '#')) + '"'
         + ((it.b || it.blank) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(txt) + '</a>';
    }
    h += '</nav>';
  }

  h += '<div class="qb-actions"><div class="qb-theme"><button type="button" class="qb-theme-btn"'
     + ' id="qb-theme-toggle" title="主题色" aria-label="切换主题色" aria-haspopup="true"'
     + ' aria-expanded="false">' + PALETTE + '</button></div>';
  if (n.dark !== false) {
    var moon = document.documentElement.classList.contains('qb-dark') ? '☀️' : '🌙';
    h += '<a class="qb-dark-btn" id="qb-dark-toggle" href="javascript:void(0)" title="切换暗色模式"'
       + ' rel="nofollow noopener"><i id="qb-dark-icon">' + moon + '</i></a>';
  }
  h += '</div></div></div>';

  if (document.readyState === 'loading') document.write(h);
  else {
    /* 兜底：解析期已过（脚本被延后执行）时不能再 write，那会清空文档 */
    var box = document.createElement('div');
    box.innerHTML = h;
    var nav = box.firstChild;
    if (nav && document.body) document.body.insertBefore(nav, document.body.firstChild);
  }
})();
</script>'''


LOGO_MARK_SVG = (
    '<svg width="30" height="30" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">'
    '<g fill="none" stroke="currentColor" stroke-width="7.4" stroke-linecap="round">'
    '<path d="M9.8 9.8 L22.2 22.2"/><path d="M22.2 9.8 L9.8 22.2"/></g>'
    '<circle class="qb-logo-dot" cx="4.9" cy="27.1" r="3.1"/></svg>')

PALETTE_SVG = (
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
    'stroke-width="1.9" stroke-linejoin="round">'
    '<path d="M12 3.4c3.5 3.7 6.1 6.7 6.1 9.9a6.1 6.1 0 0 1-12.2 0c0-3.2 2.6-6.2 6.1-9.9z"/>'
    '<path d="M9.3 13.4a2.7 2.7 0 0 0 2.7 2.7" stroke-linecap="round"/></svg>')

# 静态顶栏后面紧跟的补齐脚本：{ym} 展开、暗色图标。两者都是运行时才知道的值。
NAV_FIXUP = '''<script>
/* 顶栏是静态写进字段的，这里只补两处运行时才知道的值：
   归档地址里的 {ym}、暗色图标。本段紧跟静态 HTML，首绘还没发生，看不到占位值。 */
(function () {
  var d = new Date(), ym = d.getFullYear() + '/' + (d.getMonth() + 1);
  var as = document.querySelectorAll('.qb-nav a[href*="{ym}"]');
  for (var i = 0; i < as.length; i++) {
    as[i].setAttribute('href', as[i].getAttribute('href').replace('{ym}', ym));
  }
  if (document.documentElement.classList.contains('qb-dark')) {
    var ic = document.getElementById('qb-dark-icon');
    if (ic) ic.textContent = '☀️';
  }
})();
</script>'''


def parse_nav_block(cfg):
    """从配置块文本里取出 nav 的 brand / home / logo / links。

    只解析本项目自己维护的模板（格式固定），不是通用 JS 解析器；
    取不到就返回 None —— 通用版的 nav 整段被注释掉了，走的就是这条。
    """
    m = re.search(r"nav:\s*\{(.*?)\n  \},", cfg, re.S)
    if not m:
        return None
    body = m.group(1)

    def one(key):
        mm = re.search(r"\b%s:\s*'([^']*)'" % key, body)
        return mm.group(1) if mm else ''

    links = []
    for lm in re.finditer(r"\{\s*t:\s*'([^']*)'\s*,\s*h:\s*'([^']*)'([^}]*)\}", body):
        links.append((lm.group(1), lm.group(2), 'b:' in lm.group(3)))
    brand, home, logo = one('brand'), one('home'), one('logo')
    if not (brand or home or links):
        return None
    return {'brand': brand, 'home': home, 'logo': logo, 'links': links}


def nav_static_html(nav):
    """页首里的顶栏 HTML —— 直接写进字段，不由脚本生成。

    为什么必须是静态 HTML：跨页过渡取的是「新页首绘那一帧」的画面。用脚本
    （哪怕 document.write）生成，首绘都可能落在「节点已建、内容还没填」的缝里，
    过渡拍到的就是一条空条 —— 观感即「切页时顶栏跳一下」。静态写在字段里，
    解析器在首绘之前就已经把它变成 DOM 了。
    """
    def e(v):
        return (str(v).replace('&', '&amp;').replace('<', '&lt;')
                .replace('>', '&gt;').replace('"', '&quot;'))

    out = ['<div class="qb-nav" id="qb-nav" data-qb-pre="1"><div class="qb-nav-inner">']
    out.append('<a class="qb-brand" href="%s">' % e(nav['home'] or '/'))
    if nav['logo']:
        out.append('<span class="qb-logo"><img src="%s" alt="%s" width="30" height="30" /></span>'
                   % (e(nav['logo']), e(nav['brand'])))
    else:
        out.append('<span class="qb-logo" aria-hidden="true">%s</span>' % LOGO_MARK_SVG)
    if nav['brand']:
        out.append('<span class="qb-brand-text">%s</span>' % e(nav['brand']))
    out.append('</a>')
    if nav['links']:
        out.append('<nav class="qb-links">')
        for t, h, b in nav['links']:
            out.append('<a href="%s"%s>%s</a>'
                       % (e(h), ' target="_blank" rel="noopener"' if b else '', e(t)))
        out.append('</nav>')
    out.append('<div class="qb-actions">')
    out.append('<div class="qb-theme"><button type="button" class="qb-theme-btn" id="qb-theme-toggle"'
               ' title="主题色" aria-label="切换主题色" aria-haspopup="true" aria-expanded="false">%s</button></div>'
               % PALETTE_SVG)
    out.append('<a class="qb-dark-btn" id="qb-dark-toggle" href="javascript:void(0)"'
               ' title="切换暗色模式" rel="nofollow noopener"><i id="qb-dark-icon">🌙</i></a>')
    out.append('</div></div></div>\n\n')
    out.append(NAV_FIXUP)
    return ''.join(out)


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
      分类条 catbar { show 是否显示, mode 'auto'|'pick', list 分类名数组（顺序即显示顺序）,
                      hide 想藏掉的分类名, count 是否带篇数, all 是否要「全部」, max 最多几个 }
             不写 = 全自动（抓到几个分类就显示几个）；只想去掉个别分类用 hide；
             只显示固定几个用 mode:'pick' + list，超出的自动补「更多 ›」指向分类页。
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

  /* 列表页顶部的分类条：不写 = 全自动（站里有几个分类就显示几个，带篇数）。
     想自己挑就放开下面这行 —— 顺序即显示顺序，hide 优先级最高，
     max 超出的部分会自动补一个「更多 ›」指向分类页。 */
  // catbar: { mode: 'pick', list: ['后端', '计算机网络', '英语'], hide: ['随笔'], max: 6 }
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

  /* ③ 列表页顶部的分类筛选条：默认全自动 —— 站里有几个分类就显示几个，带篇数。
        只想去掉个别分类：写 hide；只显示固定几个：mode:'pick' + list（顺序即显示顺序），
        剩下的自动补一个「更多 ›」指向分类页。 */
  // catbar: { mode: 'pick', list: ['后端', '计算机网络', '英语'], hide: ['随笔'], max: 6 }
};'''


HEAD_TOP = '''<!-- 流苏主题 __VER__ · 页首 HTML（__HDR__）
     __NOTE__ -->

__ARC__
__HEADLINKS__

<!-- 顶栏整条在这里一次性落地，不「先放空壳、再回填」：
     跨页视图过渡的快照取的是「新页首绘那一帧」，壳已解析、内容还没填的中间态
     一旦被拍进去，就是一条空条 —— 那正是「切页时顶栏跟着跳一下」的来源。 -->

<script>
// 1) 配置层 —— 本字段里唯一需要改的就是下面这一块
__CFG__
</script>

<script>
/* 2) 首帧暗色：把「手动选择 → 配置 → 系统偏好」的结论提前落到 <html> 上。
     顶栏的白条是「页面定制 CSS 代码」字段里画的，那里只认 html.qb-dark，
     等 document-theme.js 到达再判定的话，暗色用户会先看到一条白顶栏再变黑；
     切页时这一下尤其刺眼（跨页过渡会把两页的顶栏叠在一起比）。
     逻辑与 document-theme.js 的 darkPref() 完全一致，只是提前执行。 */
(function () {
  try {
    var m = localStorage.getItem('qb-dark');
    var c = window.LS_CONFIG && window.LS_CONFIG.dark;
    var dark;
    if (m === '1') dark = true;
    else if (m === '0') dark = false;
    else if (c === 'on') dark = true;
    else if (c === 'off') dark = false;
    else dark = !!(window.matchMedia &&
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.className += ' qb-dark';
  } catch (e) {}
})();
</script>

__NAVBLOCK__

<script>
/* 4) 同步加载：样式与脚本都从这里取，主源 + 备源，失败自动切换（不需要你上传任何文件）。
     · 主源 = GitHub 仓库（jsDelivr 的 @master 分支）：作者 push 即发布，
       这里永远取最新那版，你不需要为了升级再贴一次页首，也不用重贴样式字段；
     · 备源 = 主源失效时自动接管（装配脚本按发放对象写入，见下方 FALLBACK 常量）；
     · 主源失败过就 1 小时内直接走备源，免得每次进站都等一遍超时（记 localStorage，
       不写 cookie，换设备互不影响，也不会把失败态永久钉死）；
     · 地址后面拼一个「年月日时」：jsDelivr 给文件的缓存是浏览器 7 天 / 边缘 12 小时，
       换 URL 是唯一能让浏览器重新取的可靠手段（-H 的 no-cache 只对本次请求有效）。
       按天拼过一次，结果一天里发第二版时浏览器仍吃旧 CSS（同一个 key、7 天不过期），
       表现为「样式改了但页面没变」—— 所以这里细到小时，发版最迟 1 小时生效，
       急着看就 Ctrl+F5（硬刷新会跳过缓存）。一次贴好，此后不用再动本字段；
     · 仍然必须是 document.write：博客园会把页首里的外部 <script src> 改写成 defer，
       那样样式就排到首帧之后；内联脚本不会被改写，document.write 插入的是「解析期
       脚本」—— 阻塞解析、按序立刻执行，顶栏/目录/侧栏/公告全部赶在首帧之前就位。
     · 标签名拆开拼，是为了页面上不出现脚本标签的开闭字面量（HTML 校验器会误判）。 */
(function () {
  var s = 'script';
  var d = new Date(), pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var stamp = '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours());
  var q = function (u) { return u + (u.indexOf('?') < 0 ? '?' : '&') + 'd=' + stamp; };
  var MIRROR = q('__MIRROR__');
  var FALLBACK = q('__FALLBACK__');
  var CSS_M = q('__CSS_MIRROR__');
  var CSS_F = q('__CSS_FALLBACK__');
  var KEY = 'qb-src-fail', TTL = 3600000;

  /* 样式：解析期就写进去，和下面的脚本并行下载（不是串行等）。
     字段里只剩闸门，正文样式全在这一份里 —— 所以它加载失败时脚本要能知道：
     __qbCssDead=1 表示主源挂了（已换备源）、=2 表示两个源都没成。 */
  window.__qbCssDead = 0;
  window.__qbCssFail = function () {
    if (window.__qbCssDead) { window.__qbCssDead = 2; return; }
    window.__qbCssDead = 1;
    var n = document.createElement('link');
    n.rel = 'stylesheet';
    n.href = CSS_F;
    n.onerror = function () { window.__qbCssDead = 2; };
    (document.head || document.documentElement).appendChild(n);
  };
  document.write('<' + 'link rel="stylesheet" id="qb-theme-css" href="' + CSS_M +
                 '" onerror="window.__qbCssFail()">');

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
    def head_for(cfg, fallback, hdr, note, links, css_m, css_f, navblock):
        """同一套模板，按发放对象换几样东西：配置、备源、头注释、预连接/图标、样式地址。"""
        return (HEAD_TOP.replace('__VER__', ver)
                        .replace('__HDR__', hdr)
                        .replace('__NOTE__', note)
                        .replace('__HEADLINKS__', links)
                        .replace('__MIRROR__', mirror_url(ver))
                        .replace('__FALLBACK__', fallback)
                        .replace('__CSS_MIRROR__', css_m)
                        .replace('__CSS_FALLBACK__', css_f)
                        .replace('__ARC__', ARC_FLAG)
                        .replace('__CFG__', cfg)
                        .replace('__NAVBLOCK__', navblock))

    # 备源 = 同一 CDN 的另一个节点（fastly.jsdelivr.net）：版本一致、跨域可用。
    # v7.36 起不再用 gcore：它会把分支引用缓存两周，且 purge 覆盖不到（它缓存的是解析结果）。
    # 不用作者的 blog-static 做备源，两个理由都有实测撑：
    #   · 它对 Referer 只放行 *.cnblogs.com（2026-11-17 实测 https://example.com/ → 403），
    #     绑了自定义域名的博客用不了；
    #   · 那份文件是手工上传的，同一天查还是 109628 B 的旧包 —— 兜底下来会和用户刚贴的
    #     新 CSS 版本错配，有样式没功能，比干脆没有更难看。
    generic_fallback = mirror_url(ver).replace('//cdn.jsdelivr.net', '//fastly.jsdelivr.net')
    # 作者版备源同理走 fastly：blog-static 那份要手工上传，忘了传就会把读者按在旧包上。
    author_fallback = mirror_url(ver).replace('//cdn.jsdelivr.net', '//fastly.jsdelivr.net')

    # 样式的外链与备源：同一个 @master，换节点就是备源（样式没有手工上传的副本可用）。
    css_m = css_url()
    css_f = css_m.replace('//cdn.jsdelivr.net', '//fastly.jsdelivr.net')

    # 通用版不写 <link rel="icon">：那是作者的头像，别人贴了会把人家站的图标换掉；
    # 不写就沿用博客园自己的 favicon。
    generic_links = ('<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />\n'
                     '<link rel="preconnect" href="https://fastly.jsdelivr.net" crossorigin />')
    author_links = ('<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />\n'
                    '<link rel="preconnect" href="https://fastly.jsdelivr.net" crossorigin />\n'
                    '<link rel="icon" href="%s" />' % ICON_URL)

    return {
        # 可读版：落地在 readable/（见 HOSTED_LAYOUT），只用来读，不往后台贴。
        '样式.css': field_css_external(css_m),
        # 压缩版：内容与上一份完全等价，只是去掉注释、收成一行。这是 paste/ 里贴的那份。
        '样式.min.css': min_css(field_css_external(css_m)),
        # 内联备份：CDN 全挂、或想退回「样式贴字段」的老形态时，贴这份即可（手动应急用，
        # 页首字段同时要换回 --qb-field:1 的老版本，见 README「应急回滚」）。落地在 fallback/。
        '样式-内联备份.css': field_css(css),
        '页首.html': head_for(
            CFG_GENERIC, generic_fallback,
            hdr='全托管 · 通用版',
            note='贴到「页首 HTML 代码」字段即可：样式和脚本都从 GitHub 仓库（jsDelivr，跟随 master）加载，'
                 '不需要上传任何文件。\n'
                 '     配置留空就用你自己的博客信息；以后升级不用再动任何字段 —— 自动跟随作者最新版。',
            links=generic_links, css_m=css_m, css_f=css_f, navblock=NAV_RUNTIME),
        '页首-我的站.html': head_for(
            CFG_AUTHOR, author_fallback,
            hdr='全托管 · 作者自用',
            note='带本站品牌 / 头像 / 公告与菜单；主源 cdn、备源 fastly，两个都跟随 master 分支、都能 purge。\n'
                 '     别人装主题请用「页首.html」，那份不带任何作者信息。',
            links=author_links, css_m=css_m, css_f=css_f,
            # 作者站的 nav 是确定的，直接渲染成静态 HTML，跨页过渡才拍得到完整顶栏
            navblock=nav_static_html(parse_nav_block(CFG_AUTHOR))),
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
            # 全托管：只有「现在就要贴」的几份留在 paste，可读版与应急备份挪去同级目录
            sub, fname = HOSTED_LAYOUT.get(name, (None, name)) if mode == 'hosted' else (None, name)
            out_dir = os.path.join(os.path.dirname(out), sub) if sub else out
            path = os.path.join(out_dir, fname)
            if args.check:
                same = os.path.exists(path) and read(path) == text
                print('  %s %-14s %s' % ('✓' if same else '✗', fname, '一致' if same else '不一致/缺失'))
                ok = ok and same
            else:
                os.makedirs(out_dir, exist_ok=True)
                write(path, text)
                print('  ✓ %-14s %6d B   %s' % (fname, len(text.encode('utf-8')),
                                                os.path.relpath(out_dir, ROOT)))
        print('  目录：%s' % out)

    if not args.check:
        print('\n版本：%s' % ver)
        if 'inline' in modes:
            print('零闪版（推荐）：样式贴「页面定制 CSS 代码」，页脚贴「2-页脚.html」，页首贴「1-页首.html」')
        if 'hosted' in modes:
            print('托管版（发给别人）：CSS 字段贴 paste/样式.min.css，'
                  '页首字段贴 paste/页首.html；页脚与公告留空。')
            print('                   样式和脚本都跟随 @master —— 以后发版两个字段都不用再动。')
            print('作者自用：页首改贴 paste/页首-我的站.html（带本站品牌/头像/公告），其余同上。')
            print('镜像 js：%s' % mirror_url(ver))
            print('镜像 css：%s' % css_url())
            print('      ↑ @master 跟随分支：push 就是发布，不需要打 tag（大版本才打）')
            print('      ↑ 想让前台立刻生效，push 后 curl purge.jsdelivr.net 清一次 cdn 边缘缓存：')
            print('        curl https://purge.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@master/dist/document-theme.js')
            print('        同法清 css/theme-v7.min.css；不清也行，最迟次日换日期参数后全网生效')
            print('备源：fastly.jsdelivr.net（同样 @master，主源挂了自动接管）')
            print('应急：CDN 全挂时贴 fallback/样式-内联备份.css，页首换回 tag v7.30 那份（内联模式不受影响）')
            print('读字段说明：readable/样式-字段可读版.css（带注释，与 paste 里那份内容等价）')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
