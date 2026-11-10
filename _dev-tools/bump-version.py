# -*- coding: utf-8 -*-
"""版本号统一维护：文件头注释 / CHANGELOG / min 版，三处一次同步。

用法
    python _dev-tools/bump-version.py --check           只校验，不改动
    python _dev-tools/bump-version.py -n "改动摘要"       版本 +1 并同步全部
    python _dev-tools/bump-version.py -v 7.0 -n "摘要"    指定版本号
    python _dev-tools/bump-version.py --major -n "摘要"    主版本 +1（6.30 → 7.0）
    python _dev-tools/bump-version.py -n "摘要" --no-changelog

约定
    所有文件头都用同一个 token：`流苏主题 v7.N · YYYY-MM-DD`
    版本真源是 css/theme-v7.css 头部那一行；其余文件由本脚本写成一致。
    任何手改版本号都会被 --check 判为不一致。
"""

import argparse
import datetime
import io
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

TOKEN = re.compile(r'流苏主题\s+(v\d+\.\d+)\s*·\s*(\d{4}-\d{2}-\d{2})')

FILES = [
    'css/theme-v7.css',
    'snippets/head-nav-v7.html',
    'snippets/footer-script-v7.html',
]

SRC = FILES[0]
MIN = 'css/theme-v7.min.css'
MIN_HTML = 'snippets/footer-script-v7.min.html'
BUNDLE = 'dist/document-theme.js'
LOG = 'CHANGELOG.md'
TODAY = datetime.date.today().strftime('%Y-%m-%d')


def read(path):
    """保留原换行符读入，避免把 CRLF 文件洗成 LF。"""
    with io.open(path, encoding='utf-8', newline='') as f:
        return f.read()


def write(path, text):
    with io.open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def scan():
    """返回 {文件: [(版本, 日期), ...]}"""
    found = {}
    for p in FILES:
        found[p] = TOKEN.findall(read(p))
    return found


def current_version(found):
    hits = found.get(SRC) or []
    if not hits:
        sys.exit('✗ %s 头部没有版本 token「流苏主题 v6.N · YYYY-MM-DD」' % SRC)
    return hits[0][0]


def bump(ver, major=False):
    """默认只加次版本号，主版本号保持不变；major=True 时主版本 +1、次版本归零。"""
    cur = ver.lstrip('v').split('.')
    if major:
        return 'v%d.0' % (int(cur[0]) + 1)
    return 'v%s.%d' % (cur[0], int(cur[1]) + 1)


def check(found, quiet=False):
    ok = True
    versions = set()
    for p, hits in found.items():
        if not hits:
            print('✗ %-32s 未找到版本 token' % p)
            ok = False
            continue
        vers = set(h[0] for h in hits)
        days = set(h[1] for h in hits)
        versions |= vers
        mark = '✓' if len(vers) == 1 else '✗'
        if len(vers) != 1:
            ok = False
        if not quiet or not ok:
            print('%s %-32s %s  日期 %s  (%d 处)' % (
                mark, p, '/'.join(sorted(vers)), '/'.join(sorted(days)), len(hits)))

    if len(versions) > 1:
        print('✗ 跨文件版本不一致：%s' % ', '.join(sorted(versions)))
        ok = False

    # 三个生成产物都应带同版本横幅（最后一个是合并托管版）
    for path in (MIN, MIN_HTML, BUNDLE):
        if not os.path.exists(path):
            print('✗ %-32s 不存在（跑一次生成脚本）' % path)
            ok = False
            continue
        mm = TOKEN.search(read(path))
        src_ver = current_version(found)
        if not mm:
            print('✗ %-32s 缺少版本横幅' % path)
            ok = False
        elif mm.group(1) != src_ver:
            print('✗ %-32s %s ≠ 源码 %s' % (path, mm.group(1), src_ver))
            ok = False
        elif not quiet:
            print('✓ %-32s %s' % (path, mm.group(1)))

    return ok


def insert_changelog(ver, day, note):
    text = read(LOG)
    row = '| **%s** | %s | %s | 待提交 |' % (ver, day, note)
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('| 版本 | 日期 |'):
            body_start = i + 2  # 跳过表头与分隔行
            if body_start < len(lines) and lines[body_start].startswith('| **v'):
                # 旧的最新一条去掉加粗
                lines[body_start] = lines[body_start].replace('| **v', '| v', 1).replace('** |', ' |', 1)
            lines.insert(body_start, row)
            write(LOG, '\n'.join(lines))
            return True
    return False


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument('-v', '--version', help='指定版本号，如 6.27；省略则自动 +1')
    ap.add_argument('-n', '--note', default='', help='本次改动摘要，写入 CSS 头部「最近：」与 CHANGELOG')
    ap.add_argument('-d', '--date', default=TODAY, help='日期，默认今天')
    ap.add_argument('--check', action='store_true', help='只校验，不改动')
    ap.add_argument('--major', action='store_true', help='主版本 +1（次版本归零），如 6.30 → 7.0')
    ap.add_argument('--no-changelog', action='store_true', help='不写 CHANGELOG')
    args = ap.parse_args()

    found = scan()

    if args.check:
        print('版本一致性检查\n' + '-' * 56)
        sys.exit(0 if check(found) else 1)

    old = current_version(found)
    ver = ('v' + args.version.lstrip('v')) if args.version else bump(old, args.major)
    if ver == old:
        sys.exit('✗ 新版本号与当前相同（%s），换一个' % ver)
    if not re.match(r'^v\d+\.\d+$', ver):
        sys.exit('✗ 版本号格式应为 7.0 或 v7.0')

    # 1) 文件头 token
    for p in FILES:
        text = read(p)
        new, cnt = TOKEN.subn('流苏主题 %s · %s' % (ver, args.date), text)
        if cnt == 0:
            sys.exit('✗ %s 里没找到版本 token，先确认头部格式' % p)
        write(p, new)

    # 2) CSS 头部「最近：」摘要
    if args.note:
        css = read(SRC)
        css = re.sub(r'(最近：)[^\r\n]*', lambda m: m.group(1) + args.note, css, count=1)
        write(SRC, css)

    # 3) 重建两个压缩产物（横幅版本都取自源码头部）
    print('— 重建 min 版 —')
    subprocess.check_call([sys.executable, '_dev-tools/gen-min.py'])
    print('— 重建页脚压缩版 —')
    subprocess.check_call([sys.executable, '_dev-tools/gen-footer-min.py'])
    print('— 重建合并托管版 —')
    subprocess.check_call([sys.executable, '_dev-tools/gen-bundle.py'])
    print('— 刷新后台粘贴包 —')
    subprocess.check_call([sys.executable, '_dev-tools/gen-deploy.py'])

    # 4) CHANGELOG
    if not args.no_changelog and args.note:
        if insert_changelog(ver, args.date, args.note):
            print('— CHANGELOG 已插入 %s —' % ver)
        else:
            print('! CHANGELOG 表头未找到，跳过（请手工补一行）')

    print('\n版本一致性检查\n' + '-' * 56)
    ok = check(scan())
    print('\n%s  %s → %s' % ('✓' if ok else '✗', old, ver))
    if ok:
        print('提示：提交后把 CHANGELOG 里的「待提交」换成提交哈希。')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
