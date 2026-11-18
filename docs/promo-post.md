# 给博客园换一身「文档站」皮肤：一个三栏 + 暗黑模式的开源主题

> 仓库：<https://github.com/zsy0216/cnblogs-document-theme>
> 技术栈：纯 CSS（Grid）+ 原生 JS，零依赖、零构建、零后端
> 当前版本：v7.28，MIT

## 长什么样

**首页**：左中右三栏，左边文章列表，中间文章卡片，右边公告和常用链接。列表顶上有一行分类筛选（`全部` + 每个分类及其篇数），点一下进对应分类页。

![首页效果](https://gcore.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@v7.28/docs/images/home-v7.png)

**文章页**：左边正文 H1–H4 自动生成的目录，右边卡片式侧栏，正文独占中栏；标题下面一行是这篇文章的分类和标签。

![文章页效果](https://gcore.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@v7.28/docs/images/post-v7.png)

**暗色模式**：配色对齐 GitHub Dark —— 底色 `#0d1117`、卡片 `#161b22`、描边 `#30363d`、正文 `#c9d1d9`。右上角 🌙 一键切换，状态存本地，首次访问跟随系统偏好。

![暗色首页](https://gcore.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@v7.28/docs/images/home-v7-dark.png)

**手机**：断点以下收成单栏，顶栏换成汉堡按钮 + 右侧抽屉，条目和桌面菜单同源。

![手机导航](https://gcore.jsdelivr.net/gh/zsy0216/cnblogs-document-theme@v7.28/docs/images/mobile-menu-v7.png)

## 功能

| 功能 | 说明 |
|:---|:---|
| 三栏布局 | Grid 实现，不搬动任何 DOM 节点，切页不闪不抖 |
| 自动目录 | 文章页正文 H1–H4 生成侧栏目录，点击跳转 |
| 暗黑模式 | 一套变量全局换肤，支持跟随系统偏好 |
| 分类筛选 | 列表页顶部按分类筛选，文章页标题下显示分类 + 标签 |
| 手机端 | 汉堡菜单 + 抽屉，锁滚动，遮罩 / Esc 关闭 |
| 回到页首 | 滚动超过 300px 出现，点击平滑回顶 |
| 列表卡片化 | 分类页、标签页、归档页跟首页统一观感 |
| favicon 接管 | 把自定义图标搬进 `<head>` 并拦截园方默认图标 |

## 怎么装（两个字段）

> ⚠️ 第 0 步最重要：**设置 → 皮肤 → 选 `Custom`（自定义）**，否则后面全都不生效。

样式和逻辑都托管在仓库里，你只需要往后台贴两个字段 —— **不用上传文件，不用 fork，不用打 tag**：

| 步骤 | 贴到哪 | 贴什么 | 大小 |
|:---:|:---|:---|---:|
| 1 | 页面定制 CSS 代码 | `dist/paste/样式.min.css` | 3 KB |
| 2 | 页首 HTML 代码 | `dist/paste/页首.html` | 11.5 KB |
| 3 | 页脚 HTML 代码 / 公告 | 全选删除（公告留空即可） | — |

保存后前台 `Ctrl+F5` 强刷。

页首里那段加载器会从 `cdn.jsdelivr.net`（GitHub 仓库镜像）取 js，取不到自动换 `fastly.jsdelivr.net`；地址跟随仓库主线（`@master`），所以我推上去就是发布，你不用动任何字段。页首里没有任何我的信息：首标题取你页面标题里的博客名，菜单指向你自己的站，公告用你后台那份原文。

顶栏菜单、公告文案、强调色在页首那段 `window.LS_CONFIG` 里配，不用改源码：

```js
window.LS_CONFIG = {
  accent: '#d05ce8',
  nav: {
    brand: '你的博客名',
    links: [
      { t: '首页', h: 'https://www.cnblogs.com/你的博客名/' },
      { t: '归档', h: 'https://www.cnblogs.com/你的博客名/p/archive/2026/11' },
      { t: 'GitHub', h: 'https://github.com/你的账号', b: 1 }   // b:1 = 新窗口
    ]
  },
  notice: { show: true, title: '公告', html: '<p>写点什么</p>' }
};
```

**回滚**：清空「页面定制 CSS」「页首 HTML」「页脚 HTML」三个字段，恢复默认外观。旧版 v6.28 封存在 tag `v6.28`，需要时从仓库取出重贴。

## 用了它

不用打招呼，直接拿走。页脚固定带一行 `Theme powered by cnblogs-document-theme ↗`，链回仓库。

用着顺，欢迎到 [仓库 issue](https://github.com/zsy0216/cnblogs-document-theme/issues/new?template=showcase.yml) 登记你的站（地址 + 一句话说明），我会加进 README 的「谁在用」。

## 最后

仓库地址：**<https://github.com/zsy0216/cnblogs-document-theme>**

代码全部开源，MIT 随意改。变量表在 `css/变量说明.md`，想换主色调只改 `--accent` 一行就够。

有样式对不上的页面，提 issue 时把页面 URL 和截图带上，我按真实 DOM 补。
