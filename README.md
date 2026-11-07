# Ep流苏 · 博客园自定义皮肤

> 纯白卡片、左中右三栏、粉紫强调色、可定制顶栏。
> 基于 2026-11 实测的博客园真实 DOM 重写，不再假设不存在的节点。

## 安装（6 步）

> ⚠️ **第 0 步（最重要）**：设置 → 皮肤 → 选择 **`Custom`（自定义）**，否则后续全部不生效！

1. **清空页脚 HTML**：设置 → 页脚 HTML 代码 → 全选删除（停用 awescnb，不做这步后面全废）
2. **页面定制 CSS 代码** → 全选**替换为 `css/theme-v6.min.css`（15.7KB，比全版 -34%）** → 保存
3. **页首 HTML 代码** → 粘贴 `snippets/head-nav-v6.html`（1.99KB）→ 保存
4. **公告** → 粘贴 `snippets/announcement-v6.html`（1.5KB）→ 保存
5. 前台 `Ctrl+F5` 强刷

### 一键粘贴（可选）

直接复制下面四个文件的内容到后台（` Ctrl+A ` 全选 + ` Ctrl+V ` 粘贴）：

| 文件 | 粘贴位置 |
|------|----------|
| `css/theme-v6.css` | 页面定制 CSS 代码 |
| `snippets/head-nav-v6.html` | 页首 HTML 代码 |
| `snippets/footer-script-v6.html` | 页脚 HTML 代码（需先清空） |
| `snippets/announcement-v6.html` | 侧边栏公告 |

粘贴完成后，页面滚到底部点**保存**，然后前台 `Ctrl+F5` 强刷。验证：F12 看 Elements 中 `<style>` 含 `theme-v6.css`，左栏出现编号目录。

> 本地 `preview/home-v6.html` / `preview/post-v6.html` 是离线预览页（把线上 DOM + 主题 CSS 合成），可在本地直接打开看效果，不算服务。

## 验证生效

粘贴代码后，F12 打开开发者工具，在 Elements 中看页面有没有 `<style>` 项含 `theme-v6.css`，普通文章页左栏有没有编号目录——有就成功。

## 定制顶栏

只需改 `snippets/head-nav-v6.html` 里的 `.qb-links`：

```html
<nav class="qb-links">
  <a class="on" href="https://www.cnblogs.com/zhangshuaiyin/">首页</a>
  <a href="https://www.cnblogs.com/zhangshuaiyin/p/archive/2021/07">归档</a>
  <a href="https://www.cnblogs.com/zhangshuaiyin/categories">分类</a>
  <a href="https://www.cnblogs.com/zhangshuaiyin/tag">标签</a>
  <a href="https://msg.cnblogs.com/send/Ep%E6%B5%81%E8%8B%8F">留言</a>
  <a href="https://home.cnblogs.com/u/zhangshuaiyin">主页</a>
  <!-- 加一项：复制一行改 href 与文字；删一项：删整行 -->
</nav>
```

博客园有效页面 URL（实测 200）：

| 菜单 | 格式 | 示例 |
|:---|:---|:---|
| 首页 | 博客名主页 | `https://<name>/` |
| 归档 | `/p/archive/` | `https://<name>/p/archive/` |
| 分类 | `/categories` | `https://<name>/categories` |
| 标签 | `/tag` | `https://<name>/tag` |
| 留言 | `https://msg.cnblogs.com/send/<名>` | 站内信 |
| 主页 | 管理页 | `https://home.cnblogs.com/u/<name>` |
| 管理 | 后台设置 | `https://i.cnblogs.com/settings/` |

- 当前页高亮：给对应 `<a>` 加 `class="on"`
- 不要顶栏：删掉整段 `<div class="qb-nav">…</div>`
- 顶栏样式在 `theme-v6.css` 的「2. 自建顶栏」段，改 `.qb-nav` 即可

## 适配页面

标签页（`/tag`）、分类页（`/categories`）、归档页（`/p/archive/`）的容器现在也被**统一卡片化**，和首页文章列表一样显示：
- 卡片白底、1px 分割线、圆角、悬浮阴影
- 归档页 12 篇文章，点击标题可跳转
- 标签页改标签色，分类页改分类色，悬浮粉紫高亮

页面右下角新增了 **回到页首** 按钮，滚动超过 300px 后自动出现（怀抱中 → 向下箭头），点击平滑滚动回顶部。

## 左栏目录

以下页面类型默认生成左侧文章列表/目录：

| 页面 | 左侧目录 | 样式 |
|:---|:---|:---|
| 首页 | 每篇标题 + 日期 | 卡片白底 |
| 文章详情 | 正文标题（H1-H4） | 专栏目录 |
| 标签列表 | 标签名（标签页） | 胶囊按钮 |
| 分类列表 | 分类名（分类页） | 分类条 |
| 归档列表 | 每月列表 | 胶囊按钮 |
| 标签文章页 | 文章标题 | 卡片白底 |

以上页面通过 `<nav class="qb-links">` 的对应菜单项进入。

## 布局原理

```css
#main { display:grid; grid-template-columns:216px minmax(0,1fr) 236px; }
#sideBar, #sideBarMain { display:contents; }   /* 侧栏子节点提升为网格项 */
#leftcontentcontainer { grid-column:1; }        /* 左：文章列表/文章目录 */
#mainContent          { grid-column:2; }        /* 中：文章列表/正文 */
#qb-right             { grid-column:3; }        /* 右：公告 + 侧栏小部件 */
```

纯 CSS，不依赖 JS 权限。断点：≤1024px 收两栏（隐藏右栏），≤860px 单栏。

## 文件说明

```
css/theme-v6.css              源文件（开发版，全注释，正式环境粘贴 min）
css/theme-v6.min.css          发布版（已压缩，效果与全版等同，大小 -34%）
css/变量说明.md               主题变量表（--accent 等）
snippets/head-nav-v6.html     顶栏结构（页首 HTML）
snippets/announcement-v6.html 公告模板（内联样式，抗覆盖）
snippets/footer-script-v6.html 左栏目录 + 右栏搬运（页脚 HTML）
preview/home-v6.html          首页离线预览（真实 DOM 复刻）
preview/post-v6.html          文章页离线预览
```

> **开发工作流**：本机只改 `theme-v6.css`，确定效果后再生成 `theme-v6.min.css`；发布时粘贴 `min` 版，正式环境立即生效。

## 回滚

清空「页面定制 CSS」「页首 HTML」「页脚 HTML」三个字段即恢复默认外观。
