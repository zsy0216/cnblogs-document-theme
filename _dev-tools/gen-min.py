import io
import re

SRC = 'css/theme-v6.css'
OUT = 'css/theme-v6.min.css'

src = io.open(SRC, encoding='utf-8').read()

# 版本横幅：从源文件头部抽出来，压缩后仍然保留这段注释。
# 目的：正式环境粘贴的是 min 版，线上 Ctrl+U 搜「流苏主题 v6.」就能确认版本；
# 否则压缩把注释全删了，线上跑的是哪一版无从查证。
m = re.search(r'流苏主题\s+(v\d+\.\d+)\s*·\s*(\d{4}-\d{2}-\d{2})', src)
if not m:
    raise SystemExit('未在 %s 头部找到版本行（格式应为「流苏主题 v6.N · YYYY-MM-DD」）' % SRC)
ver, day = m.group(1), m.group(2)
banner = '/* 流苏主题 %s · %s · 压缩版，源码见 theme-v6.css */\n' % (ver, day)

body = re.sub(r'/\*[\s\S]*?\*/', '', src)
body = body.replace('\n', ' ').replace('\t', ' ')

# 按括号分组：括号内原样保留（rgba(...)、calc(...) 里的空格和逗号不能动）
parts = re.split(r'(\([^\)]*\))', body)
out = ''
for part in parts:
    if part.startswith('(') and part.endswith(')'):
        out += part
    else:
        part = re.sub(r'\s+', ' ', part)
        part = re.sub(r'\s*([{};:,>~+])\s*', r'\1', part)
        out += part
body = out.strip()

# 等价替换收尾（都是不会改变渲染结果的写法变换）
body = body.replace(';}', '}')                                       # 块尾分号
body = re.sub(r'(?<![\w#.])0\.(\d+)', r'.\1', body)                  # 0.5 -> .5
body = re.sub(r'(?<![\w.])0px\b', '0', body)                         # 0px -> 0
body = re.sub(r':0 0 0 0(?=[;}])', ':0', body)                       # 四值全 0


def _shrink_hex(m):
    h = m.group(1).lower()
    if h[0] == h[1] and h[2] == h[3] and h[4] == h[5]:
        return '#' + h[0] + h[2] + h[4]
    return m.group(0)


body = re.sub(r'#([0-9a-fA-F]{6})(?![0-9a-fA-F])', _shrink_hex, body)  # #ffffff -> #fff

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(banner + body)

print('version:', ver, day)
print('size:', len((banner + body).encode('utf-8')))
print('braces:', body.count('{'), body.count('}'))
print('has rgba ok:', 'rgba(110,118,129,.4)' in body.replace(' ', ''))
print('shadow:', [s for s in body.split('}') if '--shadow:' in s][:1])
