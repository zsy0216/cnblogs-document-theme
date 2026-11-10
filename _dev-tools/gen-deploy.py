# -*- coding: utf-8 -*-
"""生成「v7 全托管」的后台粘贴包 —— 后台只需贴两个字段，产物就两份，版本号自动跟随源码。

用法
    python _dev-tools/gen-deploy.py                 输出到 dist/paste（随仓库分发）
    python _dev-tools/gen-deploy.py --out D:/x      指定输出目录
    python _dev-tools/gen-deploy.py --check         只比对，不写盘

产物（全托管 = 后台只填 CSS 与页首两个字段，页脚与公告保持空白）
    样式.css   = 「页面定制 CSS 代码」字段：首帧标记 + 完整压缩样式
    页首.html  = 「页首 HTML 代码」字段：DNS 预连接 + 收藏夹图标 + LS_CONFIG 配置段 + 同步加载脚本
                 （不含任何菜单 / 公告结构 —— 那些已改为脚本按配置生成）
    页脚、公告两个字段留空即可，不再生成占位文件。

    --mode inline / hybrid 是备选形态，仍会生成四份（1-页首 / 2-页脚 / 3-公告 / 4-样式），
    分别落在 dist/paste/inline/ 与 dist/paste/hybrid/。

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
CSS_URL = 'https://blog-static.cnblogs.com/files/blogs/477677/theme-v7.min.css'
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


HEAD_TOP = '''<!-- 流苏主题 __VER__ · 页首 HTML（全托管）
     只做三件事：占住顶栏位置、放配置、同步加载样式脚本。
     菜单与公告由脚本按配置渲染，这里没有任何菜单内容。
     除非升级版本号，本字段不需要再改。 -->

__ARC__
<link rel="preconnect" href="https://blog-static.cnblogs.com" />
<link rel="icon" href="__ICON__" />

<!-- 1) 顶栏占位：先给 59px 白条，菜单由紧随其后的脚本填进来 -->
<div class="qb-nav" id="qb-nav"><div class="qb-nav-inner"></div></div>

<script>
/* 2) 配置层：以后只改这一个对象，其余都不用动 =====
   基础  accent:'#d05ce8' 强调色 | dark:'on'|'off'|'auto' | backToTop | pager | archive | archiveTtl
   顶栏  nav:{ brand:'Ep流苏', home:'…', logo:'…jpg', links:[{ t:'首页', h:'…' }, { t:'GitHub', h:'…', b:1 }] }
   公告  notice:{ show:true, title:'公告', html:'<p>正文</p>' }
   以上都不写，则用内置默认（9 个菜单 + 原有公告文案） */
window.LS_CONFIG = {};
</script>

<script>
/* 3) 同步加载：这 4 行是整块脚本，不要改成 createElement + async。
      · 样式在脚本里（上传的那一个文件同时含 CSS 与 JS），脚本晚到 = 首帧无样式；
      · 博客园会把页首里的外部脚本标签自动改写成 defer，那样照样晚；
      · 内联脚本不会被改写，document.write 插入的是「解析期脚本」：阻塞解析、按序立刻
        执行，于是样式在首次绘制前就注入，脚本里的 MutationObserver 又能在 #main 解析
        完的那一刻初始化 —— 顶栏、目录、侧栏、公告全部赶在首帧之前就位，切页不再闪。
      标签名拆开拼，是为了页面上不出现脚本标签的开闭字面量（HTML 校验器会误判）。 */
(function () {
  var s = 'script';
  document.write('<' + s + ' src="__BUNDLE__?v=__NUM__"><' + '/' + s + '>');
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
/* 配置层：以后只改这一个对象 =====
   基础  accent:'#d05ce8' 强调色 | dark:'on'|'off'|'auto' | backToTop | pager | archive | archiveTtl
   顶栏  nav:{ brand:'Ep流苏', home:'…', logo:'…jpg', links:[{ t:'首页', h:'…' }, { t:'GitHub', h:'…', b:1 }] }
   公告  notice:{ show:true, title:'公告', html:'<p>正文</p>' }
   以上都不写，则用内置默认（9 个菜单 + 原有公告文案）

   闸门保持开启（gate 默认 true）：脚本在页脚跑完、右栏那十张卡到位后才让页面可见。
   实测关掉闸门反而更差 —— 园方会在右栏还是空的时候把 body 淡入，
   用户看到的是「公告下面一路长出来」。开启闸门后，可见第一帧右栏就是满的。 */
window.LS_CONFIG = { gate: true };
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
/* 配置层：以后只改这一个对象，其余都不用动 =====
   基础  accent:'#d05ce8' 强调色 | dark:'on'|'off'|'auto' | backToTop | pager | archive | archiveTtl
   顶栏  nav:{ brand:'Ep流苏', home:'…', logo:'…jpg', links:[{ t:'首页', h:'…' }, { t:'GitHub', h:'…', b:1 }] }
   公告  notice:{ show:true, title:'公告', html:'<p>正文</p>' }
   以上都不写，则用内置默认（9 个菜单 + 原有公告文案）。
   写了 nav 会覆盖上面的静态顶栏。 */
window.LS_CONFIG = {};
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
                           .replace('__NUM__', ver.lstrip('v')))
        return {
            '1-页首.html': head,
            '2-页脚.html': FOOT_HYBRID,
            '3-公告.html': NOTICE_HYBRID,
            '4-样式.css': field_css(css),
        }
    head = (HEAD_TOP.replace('__VER__', ver)
                   .replace('__ICON__', ICON_URL)
                   .replace('__BUNDLE__', BUNDLE_URL)
                   .replace('__CSS__', CSS_URL)
                   .replace('__ARC__', ARC_FLAG)
                   .replace('__NUM__', ver.lstrip('v')))
    return {
        '样式.css': field_css(css),
        '页首.html': head,
    }


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument('--out', default=None, help='输出目录，默认 dist/paste/<mode>')
    ap.add_argument('--mode', default='hosted', choices=['inline', 'hosted', 'hybrid'],
                    help='hosted=全托管（默认，后台只贴一次 2KB 页首，之后只上传 js）；'
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
            print('托管版：上传 %s；页首字段贴「页首.html」、CSS 字段贴「样式.css」，页脚与公告留空' % BUNDLE_URL)
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
