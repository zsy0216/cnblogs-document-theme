# 给博客园换一身「文档站」皮肤：一个三栏 + 暗黑模式的开源主题

> 仓库：<https://github.com/zsy0216/cnblogs-document-theme>
> 技术栈：纯 CSS（Grid）+ 原生 JS，零依赖、零构建、零后端

## 一、为什么想换皮

博客园自带的皮肤，基本都是「博客时间线」审美：正文居中、侧栏堆在右边、区块之间靠缩进和分割线区分。

写技术笔记的时候，这套版式有三个明显的不顺手：

1. **长文没有目录**。文章一长，只能靠滚动条硬扛，回头找某一节要翻半天。
2. **侧栏和正文挤在一起**。公告、搜索、常用链接全堆在同一列，视觉噪音比信息还多。
3. **没有暗色**。晚上看白底文章，眼睛是真的累；自己写 CSS 又容易和园方样式打架。

于是我按「文档站」（类似 VitePress / Docusaurus）的版式思路，把博客园重写了一遍。所有选择器都对着 2026 年 11 月博客园真实 DOM 校准过，不再假设不存在的节点。

## 二、长什么样

**首页（浅色）**：左中右三栏，左边是全文文章列表，中间是文章卡片，右边是公告和常用链接。

![首页浅色效果](https://cdn.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@master/docs/images/home-light.png)

**首页（暗色）**：配色对齐 GitHub Dark —— 底色 `#0d1117`、卡片 `#161b22`、描边 `#30363d`、正文 `#c9d1d9`。不是简单把白底刷黑，而是每个层级都重新定了一套色。

![首页暗色效果](https://cdn.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@master/docs/images/home-dark.png)

**文章页（暗色）**：左边是正文 H1–H4 自动生成的目录，右边是卡片式侧栏，正文独占中栏。

![文章页暗色效果](https://cdn.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@master/docs/images/post-dark.png)

## 三、都做了哪些事

### 1. 三栏布局：纯 CSS，不动一行 HTML

博客园的 DOM 结构是 `#main` 里塞 `#mainContent` 和 `#sideBar`。想做成三栏，常规做法是 JS 搬节点，但那样每次刷新都会闪一下。

这里用的是 Grid + `display: contents`：

```css
#main {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 292px;
}
#sideBar, #sideBarMain { display: contents; }  /* 侧栏子节点直接变成 grid 项 */
#leftcontentcontainer { grid-column: 1; }      /* 左：文章列表 / 文章目录 */
#mainContent         { grid-column: 2; }       /* 中：正文 */
#qb-right            { grid-column: 3; }       /* 右：公告 + 小部件 */
```

`display: contents` 会把容器本身「消掉」、让子元素直接参与父级 grid 布局，所以不用改 HTML 也能把侧栏拆到两列去。断点也很好写：≤1024px 收成两栏（隐藏右栏），≤860px 单栏。

### 2. 左栏目录：按页面类型自动切换

同一个左栏，在不同页面显示不同内容：

| 页面 | 左栏内容 |
|:---|:---|
| 首页 | 全部文章标题 + 日期 |
| 文章详情 | 正文 H1–H4 目录（点击跳转） |
| 分类 / 标签 / 归档 | 分类名 / 标签名 / 月份 |

逻辑很简单：进入页面 → 左栏拿到什么就渲染什么，正文里有标题就写目录，没有标题就写文章列表。没有额外请求，也没有额外配置。

### 3. 暗黑模式：一套变量，全局换肤

整个主题的配色都走 CSS 变量，暗色只需要覆盖变量值：

```css
body.qb-dark {
  --bg:     #0d1117;
  --card:   #161b22;
  --line:   #30363d;
  --ink:    #e6edf3;
  --body:   #c9d1d9;
  --meta:   #8b949e;
  --accent: #58a6ff;
}
```

右上角的 🌙 按钮切换，状态存在 `localStorage`，刷新不丢；首次访问会跟随系统的 `prefers-color-scheme`。

值得一提的是，博客园有些原生区块（公告、评论框、代码块）自带内联浅色，光靠变量覆盖不掉。这部分单独写了层暗色补丁，把它们压成半透明深底，保证整页没有「白块残留」。

### 4. 顺手修的几个老问题

- **回到页首**：滚动超过 300px 出现，点击平滑回顶
- **列表页统一卡片化**：分类页、标签页、归档页不再是裸列表，跟首页一个观感
- **右侧「搜索」标题被压成竖排**：`flex` 布局下 `white-space` 没锁住，两行挤成一列字，加 `flex-shrink: 0` 解决
- **favicon 接管**：见下一节

### 5. favicon：一个被很多人踩过的坑

博客园的「页首 HTML 代码」并不是插到 `<head>` 里，而是塞在 **body 里的 `#page_begin_html`** 容器中。而浏览器只认 `<head>` 里的 `<link rel="icon">` —— 所以你往页首贴 favicon，**基本不会生效**。

更麻烦的是两件事：

1. 博客园 `<head>` 里本来就写死了 `favicon_v3_3.ico` 和 `.svg` 两个默认图标，你追加一个，就变成三个图标并存，浏览器爱用哪个用哪个；
2. 园方脚本在页面加载完几秒后，还会再往 `<head>` 里补一次默认图标。

所以页脚脚本干了三件事：把用户图标搬进 `<head>`、清掉所有非用户图标、用 `MutationObserver` 持续拦截后续插入。搬完 check 一遍，`<head>` 里只剩你设置的那一个。

## 四、怎么装（4 步）

> ⚠️ 第 0 步最重要：**设置 → 皮肤 → 选 `Custom`（自定义）**，否则后面全都不生效。

1. **页面定制 CSS 代码** → 全选替换为 `css/theme-v6.min.css`
2. **页首 HTML 代码** → 粘贴 `snippets/head-nav-v6.html`
3. **页脚 HTML 代码** → 清空后粘贴 `snippets/footer-script-v6.html`
4. **公告** → 粘贴 `snippets/announcement-v6.html`

保存后前台 `Ctrl+F5` 强刷。

顶栏要加/删菜单，只改 `head-nav-v6.html` 里的 `.qb-links` 这一段就行：

```html
<nav class="qb-links">
  <a class="on" href="https://www.cnblogs.com/你的博客名/">首页</a>
  <a href="https://www.cnblogs.com/你的博客名/p/archive/">归档</a>
  <a href="https://www.cnblogs.com/你的博客名/categories">分类</a>
  <a href="https://www.cnblogs.com/你的博客名/tag">标签</a>
</nav>
```

当前页高亮就给对应 `<a>` 加 `class="on"`；不想要顶栏，把整个 `<div class="qb-nav">…</div>` 删掉即可。

**回滚**：清空「页面定制 CSS」「页首 HTML」「页脚 HTML」三个字段，就恢复默认外观。

## 五、几个设计取舍

**为什么不用框架？** 博客园的自定义代码是直接贴进页面的，没有构建流程。引入 Vue/React 意味着要么上 CDN（多一个外部依赖、多一次阻塞），要么把运行时整个贴进去（几十 KB）。这个主题的交互只有「切暗色」「回顶」「生成目录」三件小事，原生 JS 加起来不到 10KB，没必要。

**为什么 CSS 要分全版和压缩版？** `theme-v6.css` 是带完整注释的开发版，`theme-v6.min.css` 是发布版（体积小 34%）。博客园的 CSS 字段有长度限制，压一下更安全。

**为什么强调「对着真实 DOM 写」？** 网上很多博客园美化代码是几年前的，选择器早就失效了，贴上去一半样式不生效，还容易和园方新样式打架。这个主题的每条选择器我都在线上页面验证过。

## 六、最后

仓库地址：**<https://github.com/zsy0216/cnblogs-document-theme>**

代码全部开源，MIT 随意改。变量表在 `css/变量说明.md`，想换主色调只改 `--accent` 一行就够。

如果你也在博客园写技术笔记，欢迎拿去用；有样式对不上的页面，提 issue 时把页面 URL 和截图带上，我按真实 DOM 补。
