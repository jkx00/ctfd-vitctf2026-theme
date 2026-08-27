# HackVerse 赛博朋克主题

一个深色、技术风、赛博安全主题的 CTFd 主题。基于 Jinja2 + Vite + SCSS 构建（并非独立的 SPA），因此登录、注册、题目、提交 flag、hint、积分榜、战队、用户、通知、后台管理等 CTFd 原生功能均保持不变。

## 设计

- **配色**: 近黑背景（`#050505` / `#0D1110`），霓虹绿（`#00FF88`）与青色（`#00D9FF`）主色调，紫色（`#B084FF`）作为 crypto 等类别的辅助色。
- **字体**: 常规内容使用系统无衬线字体，终端输出、flag、题目元信息使用等宽字体（`JetBrains Mono` / `Fira Code` / 系统等宽回退）。
- **动效**: 动态网格背景（节点漂移、连线、鼠标交互，是对 Vanta.NET 效果的轻量自实现）、鼠标聚光灯、卡片磁吸倾斜、扫描线、首页标题的克制故障（glitch）效果，以及一次性开机加载动画——均在 `prefers-reduced-motion` 下自动关闭，移动端也会降低强度。
- **首页终端**: 首页的终端组件是纯装饰、沙盒化的，绝不执行真实命令，只匹配一个固定命令白名单（`whoami`、`system-status`、`ls`、`date`、`clear`、`./enter_ctf`），输出内容取自当前登录用户的真实会话数据（`window.init`），不含任何硬编码演示数据。
- **实时数据**: 首页的统计卡片（题目数 / 解题数 / 玩家数）在运行时通过 CTFd API 获取真实数据，并用 `IntersectionObserver` 触发数字滚动动画——主题中不存在任何硬编码的战队数/解题数。

## 技术栈

- Jinja2 模板（`templates/`）
- Vite + SCSS（`assets/scss/main.scss`）——Bootstrap 5 变量被重写为赛博朋克配色
- `assets/js/theme/cyberpunk/` 下的原生 JS 模块，负责背景画布、聚光灯/倾斜、故障文字、终端、统计计数、加载动画
- Alpine.js 继续驱动 CTFd 原有的交互组件（题目面板、积分榜、hint）

## 开发

```bash
yarn install
yarn dev     # vite build --watch
yarn build   # 构建到 static/
```

### 安装到 CTFd

```bash
git clone <this-repo-url> CTFd/themes/hackverse
```

然后在 CTFd 后台的主题设置中选择该主题。

### 目录结构

```
assets/
├── img/                       # 图片与 SVG 资源
├── js/
│   └── theme/cyberpunk/       # 背景、聚光灯、故障文字、终端、计数器、加载动画
├── scss/
│   └── main.scss              # 设计变量与全部组件样式
templates/
├── base.html                  # 页面外壳：加载动画、背景层、导航栏、页脚
├── page.html                  # 渲染后台自定义页面；在根路径 "/" 上追加英雄区+终端
├── challenges.html            # 题目面板
├── challenge.html             # 题目弹窗
├── scoreboard.html            # 积分榜与解题矩阵
└── components/                # 导航栏等公共组件
static/                        # 构建产物（由 `yarn build` 生成）
```

## 无障碍与性能

- 遵循 `prefers-reduced-motion`：网格背景、聚光灯、倾斜、故障文字、扫描线效果均会被禁用或跳过。
- 背景画布与鼠标追踪均节流到 `requestAnimationFrame`，移动端降低粒子密度，并在 `pagehide` 时清理。
- 保留 focus-visible 轮廓、语义化 HTML 以及 CTFd 原有的 ARIA 标注。

## 许可证

Apache License 2.0，详见 [LICENSE](LICENSE)。
