# -*- coding: utf-8 -*-
"""把页脚脚本压成发布版 footer-script-v7.min.html。

为什么只压页脚：CSS 已经有 min 版（31KB），页脚 HTML 一直是 42KB 原文直接贴进
博客园后台，是唯一没压缩过的发布产物。

压缩只做三件事，全部无损：
  1. 删注释（块注释 56 个约 10.8KB + 行首 // 注释）
  2. 删每行缩进、行尾空格、连续空行
  3. 行内多余空格折叠为 1 个

不动的东西（改动风险 > 收益）：变量名、表达式、语句顺序、换行位置。
保留换行是为了 ASI 语义不变，出错时也还能按行定位。

字符串与正则字面量先整体抽出为占位符再压缩，避免把 'a  b' 里的空格、
/  s+ / 里的空格误折叠 —— 这是自己写压缩器最容易翻车的地方。
"""

import io
import re
import sys

SRC = 'snippets/footer-script-v7.html'
OUT = 'snippets/footer-script-v7.min.html'

src = io.open(SRC, encoding='utf-8').read()

m = re.search(r'流苏主题\s+(v\d+\.\d+)\s*·\s*(\d{4}-\d{2}-\d{2})', src)
if not m:
    sys.exit('✗ %s 头部没有版本 token' % SRC)
ver, day = m.group(1), m.group(2)

s_start = src.index('<script>') + len('<script>')
s_end = src.rindex('</script>')
js = src[s_start:s_end]

REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^')


def protect(code):
    """抽出字符串/正则字面量，换成 \\x00N\\x00 占位符；同时删注释。"""
    out = []
    lits = []
    i, n = 0, len(code)
    prev = ''            # 上一个有意义的代码字符，用来判断 / 是除号还是正则
    while i < n:
        c = code[i]

        # ---- 注释 ----
        if c == '/' and i + 1 < n and code[i + 1] == '/':
            j = code.find('\n', i)
            i = n if j < 0 else j
            out.append(' ')
            continue
        if c == '/' and i + 1 < n and code[i + 1] == '*':
            j = code.find('*/', i + 2)
            i = n if j < 0 else j + 2
            out.append(' ')
            continue

        # ---- 字符串 ----
        if c in '"\'':
            j = i + 1
            while j < n:
                if code[j] == '\\':
                    j += 2
                    continue
                if code[j] == c:
                    j += 1
                    break
                j += 1
            lits.append(code[i:j])
            out.append('\x00%d\x00' % (len(lits) - 1))
            prev = 'x'
            i = j
            continue

        # ---- 正则 ----
        if c == '/' and (prev == '' or prev in REGEX_PREV):
            j = i + 1
            in_class = False
            while j < n:
                ch = code[j]
                if ch == '\\':
                    j += 2
                    continue
                if ch == '[':
                    in_class = True
                elif ch == ']':
                    in_class = False
                elif ch == '/' and not in_class:
                    j += 1
                    break
                elif ch == '\n':
                    break
                j += 1
            while j < n and code[j].isalpha():   # flags
                j += 1
            lits.append(code[i:j])
            out.append('\x00%d\x00' % (len(lits) - 1))
            prev = 'x'
            i = j
            continue

        out.append(c)
        if not c.isspace():
            prev = c
        i += 1

    return ''.join(out), lits


def squeeze(code):
    """删缩进、行尾空格、空行，折叠行内多空格。此时字符串已不在里面。"""
    lines = []
    for line in code.split('\n'):
        line = re.sub(r'[ \t]+', ' ', line).strip()
        if line:
            lines.append(line)
    return '\n'.join(lines)


def restore(code, lits):
    def sub(mm):
        return lits[int(mm.group(1))]
    return re.sub(r'\x00(\d+)\x00', sub, code)


body, lits = protect(js)
body = squeeze(body)
body = restore(body, lits)

if len(lits) == 0:
    sys.exit('✗ 没抽到任何字符串/正则字面量，说明状态机没生效，别继续')

# 注释掉的旧签名不该出现在发布版里
assert '/*' not in body.replace('*/', ''), '块注释残留'
assert '</script' not in body, '正文里出现 </script，会截断脚本'

banner = (
    '<!-- 流苏主题 %s · %s 页脚 HTML（压缩版）\n'
    '     位置：博客园后台 -> 设置 -> 页脚 HTML 代码（粘贴前先清空）\n'
    '     说明：本文件由 _dev-tools/gen-footer-min.py 从 footer-script-v7.html 生成，\n'
    '           功能完全一致，只删注释与缩进。要改逻辑请改源文件后重新生成，不要改这里。 -->\n'
) % (ver, day)

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(
    banner + '<script>' + body + '</script>\n')

print('version:', ver, day)
print('字面量抽出 %d 个' % len(lits))
print('源  %8d 字节' % len(src.encode('utf-8')))
out_size = len((banner + '<script>' + body + '</script>\n').encode('utf-8'))
print('压缩 %8d 字节  (-%.1f%%)' % (out_size, (1 - out_size * 1.0 / len(src.encode('utf-8'))) * 100))
print('行数 %d -> %d' % (js.count('\n') + 1, body.count('\n') + 1))
