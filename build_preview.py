#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用线上真实 HTML 生成离线预览页，验证 theme-v6.css 的实际渲染效果。"""
import re, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = BASE
SRC = {'home': os.path.join(BASE, 'preview', '_src', 'home.html'),
       'post': os.path.join(BASE, 'preview', '_src', 'post.html')}

SIDEBAR = '''
<div id="sidebar_categories">
  <h3 class="catListTitle">分类</h3>
  <ul>
    <li><a href="#">Java <span>(18)</span></a></li>
    <li><a href="#">Spring / SpringBoot <span>(7)</span></a></li>
    <li><a href="#">MySQL <span>(6)</span></a></li>
    <li><a href="#">中间件 <span>(5)</span></a></li>
    <li><a href="#">前端 <span>(4)</span></a></li>
    <li><a href="#">Python <span>(3)</span></a></li>
    <li><a href="#">工具与排错 <span>(9)</span></a></li>
  </ul>
</div>
<div id="sidebar_postarchive">
  <h3 class="catListTitle">归档</h3>
  <ul>
    <li><a href="#">2021年7月 <span>(3)</span></a></li>
    <li><a href="#">2019年12月 <span>(21)</span></a></li>
    <li><a href="#">2019年10月 <span>(1)</span></a></li>
    <li><a href="#">2019年6月 <span>(1)</span></a></li>
  </ul>
</div>
<div id="sidebar_search">
  <h3 class="catListTitle">搜索</h3>
  <div class="mySearch">
    <input id="q" type="text" placeholder="搜索文章…">
    <input id="btnZzk" type="button" value="搜索">
  </div>
</div>
<div id="sidebar_topviewedposts">
  <h3 class="catListTitle">阅读排行</h3>
  <ul>
    <li><a href="#">SpringBoot 构造器注入、Setter 注入和 Field 注入对比</a></li>
    <li><a href="#">Webpack 4 : Entry module not found</a></li>
    <li><a href="#">PageHelper 使用以及 PageInfo 转化</a></li>
    <li><a href="#">Zookeeper 学习记录及 Java 客户端示例</a></li>
  </ul>
</div>
'''

NEWS = '''
<p>👋 你好，我是 Ep流苏。</p>
<p>这里记录 Java 后端、中间件与工具排错的笔记。<br>文章多为实践中踩坑后的整理，欢迎交流。</p>
<p style="color:#9aa5b1">GitHub：<a href="https://github.com/zsy0216">zsy0216</a></p>
'''

CALENDAR = '''
<h3 class="catListTitle">日历</h3>
<table>
<tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>
<tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
<tr><td>8</td><td>9</td><td>10</td><td>11</td><td><a href="#">12</a></td><td>13</td><td>14</td></tr>
<tr><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td><a href="#">21</a></td></tr>
</table>
'''

BADGE = '''<div style="position:fixed;left:8px;bottom:8px;z-index:99999;background:#111;color:#0f0;font:22px monospace;padding:8px 14px;border-radius:6px" id="vpbadge">?</div><script>document.getElementById('vpbadge').textContent='vp '+innerWidth+'x'+innerHeight;</script>'''

HEAD_NAV = '''
<div class="qb-nav">
  <div class="qb-nav-inner">
    <a class="qb-brand" href="https://www.cnblogs.com/zhangshuaiyin/">Ep流苏</a>
    <nav class="qb-links">
      <a class="on" href="https://www.cnblogs.com/zhangshuaiyin/">首页</a>
      <a href="https://www.cnblogs.com/zhangshuaiyin/p/archive/2021/07">归档</a>
      <a href="https://www.cnblogs.com/zhangshuaiyin/category/1.html">分类</a>
      <a href="https://www.cnblogs.com/zhangshuaiyin/tag/1.html">标签</a>
      <a href="https://msg.cnblogs.com/send/Ep%E6%B5%81%E8%8B%8F">留言</a>
      <a href="https://github.com/zsy0216" target="_blank">GitHub</a>
    </nav>
  </div>
</div>
'''

NAV_CSS = '''
<style>
.qb-nav{position:sticky;top:0;z-index:999;background:rgba(255,255,255,.86);
  backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid #ecedf0}
.qb-nav-inner{max-width:1320px;margin:0 auto;height:58px;padding:0 24px;
  display:flex;align-items:center;justify-content:space-between;box-sizing:border-box}
.qb-brand{font-size:17px;font-weight:700;color:#1f2329;letter-spacing:.01em}
.qb-links{display:flex;align-items:center;gap:4px}
.qb-links a{font-size:14px;color:#4b5563;padding:6px 12px;border-radius:8px;font-weight:500}
.qb-links a:hover{background:rgba(208,92,232,.10);color:#b843d0}
.qb-links a.on{color:#b843d0;background:rgba(208,92,232,.10);font-weight:600}
@media(max-width:860px){.qb-brand{font-size:16px}.qb-links a{padding:6px 8px;font-size:13px}
  .qb-links a:nth-child(n+5){display:none}}
</style>
'''


def convert(src, dst):
    s = open(src, encoding='utf-8', errors='ignore').read()

    # 1) 相对资源改成绝对地址，保证离线也能取到博客园基础样式与图片
    s = s.replace('href="/css/', 'href="https://www.cnblogs.com/css/')
    s = s.replace('src="/', 'src="https://www.cnblogs.com/')
    s = s.replace('href="/', 'href="https://www.cnblogs.com/')

    # 2) 干掉页面定制 CSS（线上是空模板）与 awescnb；页脚换成主题脚本
    s = re.sub(r'<link[^>]*custom\.css[^>]*>', '', s)
    foot = open(os.path.join(ROOT, 'snippets', 'footer-script-v6.html'), encoding='utf-8').read()
    s = re.sub(r'<div id="page_end_html">.*?</div>',
               lambda m: '<div id="page_end_html">' + foot + '</div>', s, flags=re.S)
    # 3) 清掉页首默认 loading
    s = re.sub(r'<div id="page_begin_html">.*?</div>\s*(<div id="home")',
               r'<div id="page_begin_html"></div>\g<1>', s, flags=re.S)

    # 4) 注入自建顶栏与主题样式
    inject = ('<link rel="stylesheet" href="../css/theme-v6.css">') + NAV_CSS + open(os.path.join(ROOT,'snippets','head-nav-v6.html'),encoding='utf-8').read() + BADGE
    s = s.replace('<div id="page_begin_html"></div>',
                  '<div id="page_begin_html">' + inject + '</div>')

    # 5) 侧栏填充（模拟 loadBlogSideColumn / loadBlogNews 的返回结果）
    s = s.replace('<div id="blog-sidecolumn"></div>',
                  '<div id="blog-sidecolumn">' + SIDEBAR + '</div>')
    s = re.sub(r'<div id="sidebar_news_container">\s*</div>',
               '<div id="sidebar_news_container">' + NEWS + '</div>', s)
    s = s.replace('<div id="blog-calendar" style="display:none"></div>',
                  '<div id="blog-calendar">' + CALENDAR + '</div>')

    # 6) 去掉会请求网络的脚本（会把侧栏内容清空）
    s = re.sub(r'<script[^>]*>(?:(?!</script>).)*loadBlogSideColumn\(\)(?:(?!</script>).)*</script>', '', s, flags=re.S)
    s = re.sub(r'<script>loadBlogNews\(\);</script>', '', s)
    s = re.sub(r'<script>loadBlogDefaultCalendar\(\);</script>', '', s)
    s = re.sub(r'<script>loadBlogStats\(\);</script>', '', s)


    open(dst, 'w', encoding='utf-8').write(s)
    print(dst, len(s))


os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
convert(SRC['home'], os.path.join(ROOT, 'preview', 'home-v6.html'))
convert(SRC['post'], os.path.join(ROOT, 'preview', 'post-v6.html'))
