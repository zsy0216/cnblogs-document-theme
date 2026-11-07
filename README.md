# Ep流苏 · 博客园自定义皮肤

> 白卡片、左中右三栏、粉紫强调色、可定制顶栏。
> **本版基于 2026-11 实测的博客园真实 DOM 重写**，不再假设 `#rightColumn` 等不存在的节点。

## 一、为什么之前一直"没变化"

| 根因 | 实测证据 |
|---|---|
| 定制 CSS 没保存成功 | 线上 `custom.css` 仅 **468 字节**（默认 loading 模板），本地主题 24,056 字节 |
| 页脚 HTML 被第三方框架占用 | `#page_end_html` 内是 `cdn.cnblogs.com/awescnb/index.js`，`theme:'element'`，会重构 DOM |
| 选择器指向不存在的节点 | 真实 DOM 无 `#rightColumn`；`#main` 内顺序是"正文 → 侧栏" |

皮肤选择本身**没有问题**：`body` 的 class 已含 `skin-custom`。

## 二、安装（5 步，务必按顺序）

1. **清空页脚 HTML** —— 设置 → 页脚 HTML 代码 → 全选删除（停用 awescnb，不做这步后面全白费）
2. **页面定制 CSS 代码** → 全选替换为 `css/theme-v6.css` → 保存
3. **页首 HTML 代码** → 粘贴 `snippets/head-nav-v6.html` → 保存
4. **公告** → 粘贴 `snippets/announcement-v6.html` → 保存
5. 前台 `Ctrl+F5` 强刷

## 三、验证是否真的生效

```bash
curl -s https://www.cnblogs.com/zhangshuaiyin/custom.css | wc -c
```

- 预期 **> 20000**
- 若仍是 **468**，说明 CSS 又没保存成功，重做第 2 步

## 四、定制顶栏

只需改 `snippets/head-nav-v6.html` 里的 `.qb-links`：

```html
<nav class="qb-links">
  <a class="on" href="https://www.cnblogs.com/zhangshuaiyin/">首页</a>
  <a href="https://www.cnblogs.com/zhangshuaiyin/p/archive/2021/07">归档</a>
  <!-- 加一项：复制一行改 href 与文字；删一项：删整行 -->
</nav>
```

- 当前页高亮：给对应 `<a>` 加 `class="on"`
- 不要顶栏：删掉整段 `<div class="qb-nav">…</div>`
- 顶栏样式在 `theme-v6.css` 的「2. 自建顶栏」段，改 `.qb-nav` 即可

## 五、布局原理

```css
#main { display:grid; grid-template-columns:224px minmax(0,1fr) 288px; }
#sideBar, #sideBarMain { display:contents; }   /* 侧栏子节点提升为网格项 */
#leftcontentcontainer { grid-column:1; }        /* 左：分类/归档/搜索/排行 */
#mainContent        { grid-column:2; }          /* 中：文章列表/正文 */
#sidebar_news       { grid-column:3; }          /* 右：公告 */
```

纯 CSS，不依赖 JS 权限。断点：≤1180px 收两栏，≤860px 单栏。

## 六、文件

```
css/theme-v6.css              全部样式（唯一需要粘贴的 CSS）
snippets/head-nav-v6.html     顶栏结构（页首 HTML）
snippets/announcement-v6.html 公告模板（内联样式，抗覆盖）
preview/home-v6.html          首页离线预览（真实 DOM 复刻）
preview/post-v6.html          文章页离线预览
build_preview.py              用线上 HTML 生成预览页
可行性评估-v6.md               完整评估报告（含证据与风险）
```

## 七、已知限制

- **无大封面图**：博客园文章没有封面图字段，参考站的大图卡片无法复刻
- **文章页 TOC**：需要「JS 权限」才能做滚动高亮，未开通时只能用静态链接
- **日历默认隐藏**：单行网格下跨行会有空档；需要就把 `#blog-calendar{display:none}` 改回 `block`
- **平台改版即失效**：选择器绑定平台 DOM，改版后需按新结构调

## 八、回滚

清空「页面定制 CSS」「页首 HTML」「页脚 HTML」三个字段即恢复默认外观。
