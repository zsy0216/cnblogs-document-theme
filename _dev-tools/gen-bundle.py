# -*- coding: utf-8 -*-
"""把 CSS 与页脚脚本合成单文件 dist/document-theme.js（托管分发用）。

两种分发方式共用同一份源码，这里只是把已生成的 min 产物拼起来，不产生第二套实现：

    内联粘贴版：主题 CSS 字段 + 页脚 HTML 字段（两个字段，改版要重贴）
    合并托管版：dist/document-theme.js 一个 script 引用（改版只上传文件）

产物结构
    /* 版本横幅 */
    (function () { 注入 <style> })();      <- 来自 css/theme-v7.min.css
    (function () { 全部逻辑 })();          <- 来自 snippets/footer-script-v7.min.html

为什么 CSS 要放在 JS 里：博客园「页面定制 CSS」字段没有外链能力，想让后台只留
一行 script，样式就必须跟着脚本一起走，运行时 createElement('style') 注入。

放在哪个字段决定了会不会闪（实测结论）：
    页脚字段 → 样式等页脚脚本执行才注入，首帧是博客园默认皮肤，会闪
    页首字段 → 同步脚本阻塞解析，样式在首次绘制前就注入，白帧 0 / 重排帧 0
所以 v7 起推荐放在「页首 HTML 代码」字段，且顺序为 配置 → 本文件 → 顶栏结构。
snippets/loading-v7.html 遮罩已弃用：它本身会制造一次可见的遮盖，见 CHANGELOG v7.0。

首帧护栏（v7.1）
    博客园会把「页首 HTML 代码」里的 <script src> 自动改写成 defer，脚本不再阻塞解析。
    于是顶栏 HTML 先渲染、样式晚到，内联 SVG logo 会按默认尺寸画成 1424px 巨图闪一帧。
    对策两条：
      1. 顶栏里的 img / svg 必须带 width/height 属性（无 CSS 时也不会撑大）；
      2. 页首第一段放内联 <style>：html:not(.qb-ready) .qb-nav 先 opacity:0，
         本文件注入样式后给 <html> 加 qb-ready 解锁；并有 0.65s 纯 CSS 兜底自动显示。

注意
    CSS 转成 JS 字符串字面量必须走 json.dumps，不能手写引号。
    HTML 解析器只认 </script，CSS 里出现该序列会提前闭合标签，故转义成 <\\/。
"""

import io
import json
import os
import re
import sys

CSS = 'css/theme-v7.min.css'
HTML = 'snippets/footer-script-v7.min.html'
OUT = 'dist/document-theme.js'

TOKEN = re.compile(r'流苏主题\s+(v\d+\.\d+)\s*·\s*(\d{4}-\d{2}-\d{2})')

if not os.path.exists(CSS):
    sys.exit('✗ %s 不存在，先跑 _dev-tools/gen-min.py' % CSS)
if not os.path.exists(HTML):
    sys.exit('✗ %s 不存在，先跑 _dev-tools/gen-footer-min.py' % HTML)

css = io.open(CSS, encoding='utf-8').read()

m = TOKEN.search(css)
if not m:
    sys.exit('✗ %s 头部没有版本 token' % CSS)
ver, day = m.group(1), m.group(2)

src = io.open(HTML, encoding='utf-8').read()
i = src.index('<script>') + len('<script>')
j = src.rindex('</script>')
js = src[i:j].strip()

# 版本必须两边一致，否则说明有一个产物忘了重建
mh = TOKEN.search(src)
if not mh or mh.group(1) != ver:
    sys.exit('✗ 版本不一致：%s=%s, %s=%s' % (CSS, ver, HTML, mh.group(1) if mh else '无'))

# CSS -> JS 字符串字面量
lit = json.dumps(css, ensure_ascii=False)
lit = lit.replace('</', '<\\/')

# 压缩版 JS 理论上不含 </script>，仍兜一层
if '</script' in js.lower():
    sys.exit('✗ %s 的脚本里出现 </script，无法内嵌' % HTML)

banner = (
    '/* 流苏主题 %s · %s · document-theme.js 合并版（样式 + 脚本，托管分发用）\n'
    '   由 _dev-tools/gen-bundle.py 生成，不要直接编辑。\n'
    '   来源：%s（%d B） + %s（%d B）\n'
    '   用法：先可选地赋值 window.LS_CONFIG，再引入本文件，例如\n'
    '     window.LS_CONFIG = { accent: "#d05ce8", dark: "auto" };\n'
    '   内联粘贴版（两个后台字段）与本文件共用同一份源码，行为一致。 */\n'
) % (ver, day, CSS, len(css.encode('utf-8')), HTML, len(js.encode('utf-8')))

inject = (
    '(function () {\n'
    '  /* 只负责把样式送进文档，不解锁首帧闸门（qb-ready）。\n'
    '     解锁时机由页脚逻辑的 unlock() 统一决定：顶栏、目录、右栏、公告全部就位之后。\n'
    '     早先这里顺手加 qb-ready，实测会让闸门在 529ms 就打开（结构 613ms 才齐），\n'
    '     于是又出现「正文先到、右栏半秒后补」的闪动。 */\n'
    '  /* 优先认「页面定制 CSS 代码」字段里的那份：生成脚本会在该字段开头写\n'
    '     html{--qb-field:1}，这里读到 1 就说明首帧样式已经就位，不必再塞一遍。\n'
    '     重复塞同一份 33KB 样式没有视觉差异，但会让浏览器白算一次全量样式，\n'
    '     在低端机上是几十毫秒的卡顿。 */\n'
    '  var f = getComputedStyle(document.documentElement).getPropertyValue("--qb-field");\n'
    '  if (f && f.trim() === "1") return;\n'
    '  /* 页首若已用 <link rel=stylesheet> 引入托管 CSS，这里不再重复注入；\n'
    '     l.sheet 非空说明外链确实加载成功了。外链 404 / MIME 不对时仍走下面的兜底。 */\n'
    '  var l = document.querySelector(\'link[href*="theme-v7.min.css"]\');\n'
    '  if (l && l.sheet) return;\n'
    '  if (document.getElementById("qb-theme-style")) return;\n'
    '  var st = document.createElement("style");\n'
    '  st.id = "qb-theme-style";\n'
    '  st.textContent = %s;\n'
    '  (document.head || document.documentElement).appendChild(st);\n'
    '})();\n'
) % lit

out = banner + inject + js + '\n'

os.makedirs('dist', exist_ok=True)
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(out)

size = os.path.getsize(OUT)
paste = len(css.encode('utf-8')) + len(src.encode('utf-8'))
print('%s  %s' % (OUT, ver))
print('  CSS    %7d B' % len(css.encode('utf-8')))
print('  脚本   %7d B' % len(js.encode('utf-8')))
print('  合计   %7d B (%.1f KB)' % (size, size / 1024.0))
print('  对照   分别粘贴两个字段 %d B；合并后 %+d B' % (paste, size - paste))
print('  （体积基本打平，收益在分发：改版只上传本文件，后台不必重贴）')
