#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""带 CORS 的静态服务：供博客园设置页的 Console 脚本拉取主题 CSS / HTML。"""
import http.server
import socketserver
import os

PORT = 8766
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        # 允许 https 页面（i.cnblogs.com）跨域读取本地文件
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), Handler) as httpd:
    print(f'serving {ROOT} at http://127.0.0.1:{PORT}')
    httpd.serve_forever()
