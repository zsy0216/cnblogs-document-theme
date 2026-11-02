# 友人主题 · 博客园个人皮肤

> 一套参考 nicen.cn 风格的博客园定制皮肤，核心视觉：纯白卡片 / 大封面图 / 左中右三栏 / 粉紫强调色。

## 用途

博客园「页面定制 CSS 代码」+「页脚 HTML 代码」，一次粘贴即可生效。

## 安装

1. 博客园 → 设置 → 博客设置
2. 皮肤选择 **Custom**（必须）
3. 申请 **JS 权限**（页面最下方「申请 JS 权限」）
4. 把 `style.css` 全部代码粘贴到 **页面定制 CSS 代码**
5. 把 `footer-nav-template.html` 全部代码粘贴到 **页脚 HTML 代码**
6. 保存，**Ctrl+F5** 强制刷新

## 定制导航条

`footer-nav-template.html` 第 1 部分：

```html
<div class="custom-top-nav">
    <div class="nav-left">
        <div class="site-name" id="siteName">友人a丶的笔记</div>
        <ul class="nav-links">
            <li><a data-nav="home" href="https://www.cnblogs.com/">首页</a></li>
            <li><a href="https://i.cnblogs.com/posts/edit">新随笔</a></li>
            <li><a data-nav="contact" href="mailto:you@example.com">联系</a></li>
            <li><a data-nav="rss" href="https://www.cnblogs.com/你的用户名/rss/">订阅</a></li>
            <li><a href="https://i.cnblogs.com/">管理</a></li>
        </ul>
    </div>
    <div class="nav-right" id="navStats">
        <span id="navPost">随笔 - -</span>
        <span id="navArticle">文章 - -</span>
        <span id="navComment">评论 - -</span>
        <span id="navView">阅读 - -</span>
    </div>
</div>
```

- 加菜单项：复制一行 `<li><a href="地址">文字</a></li>`
- 删菜单项：删除整行
- 带 `data-nav` 的三项（首页/联系/订阅）由脚本自动补全真实地址
  - data-nav="home"   → 博客首页
  - data-nav="contact" → 私信
  - data-nav="rss"     → RSS 地址
- 隐藏统计：删掉 `nav-stats` 整块
- 隐藏导航条：删掉整个 `custom-top-nav` div 即可变回纯默认页

## 配色方案

全局颜色在 `style.css` 顶部的 `:root` 中定义，修改变量即可换肤：

| 变量 | 说明 | 默认值 |
| ---- | ---- | ------ |
| `--bg-page` | 页面背景 | `#f5f6f8` |
| `--bg-card` | 卡片背景 | `#ffffff` |
| `--accent` | 品牌主色（链接/按钮/高亮） | `#d05ce8` |
| `--accent-hover` | 悬停色 | `#c03ecf` |
| `--ink-title` | 标题色 | `#1f2329` |
| `--ink-body` | 正文色 | `#4a5568` |
| `--ink-meta` | 次要/元数据色 | `#a0aec0` |
| `--tag-bg` | 标签背景 | `#edf2f7` |
| `--border-card` | 卡片边框 | `#eef0f2` |
| `--radius` | 圆角 | `12px` |

示例：把主色改成蓝色，只需两行：

```css
--accent: #2b6cb0;
--accent-hover: #2c5282;
```

## 效果

- 页面背景：纯色浅灰（`#f5f6f8`），非渐变
- **左中右三栏布局**：左侧文章目录 / 中间文章列表 / 右侧个人信息 + 最新评论
- 文章列表：**大封面图白卡**，图片圆角隐藏，底部摘要 + 元数据行
- 文章内页：整张白卡包裹标题 + 正文，标签粉紫胶囊，推荐/关注按钮
- 左侧目录：白卡片模块，展开项粉紫左条高亮，折叠三角
- 右侧面板：个人资料（圆头像 + 统计格）+ 最新评论列表，白卡片
- 顶部导航：纯白横条，左侧站点名 + 菜单，右侧统计；js 启动后自动同步数据
- 推荐/关注：白卡按钮，状态存储在 localStorage

## 隐私

所有状态（推荐/关注按钮）仅保存在浏览器的 localStorage，不会上传到服务器。导航条的统计数字通过 AJAX 同步博客园后台数据。

## 许可

MIT License — 可自由修改、分发、用于个人博客。
