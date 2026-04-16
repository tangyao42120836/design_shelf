# Design Shelf（本机版）

一个本地运行的“设计网页收藏库”：你只需要粘贴网址并保存，后端会自动抓取标题/站点信息并生成高清预览截图，列表以卡片形式展示，点开可看大图并一键跳转原站。

## 首次安装与运行

这是你**第一次**拿到这个项目，或者换了一台新电脑时需要执行的步骤：

```bash
# 1. 安装项目依赖（只需执行一次）
npm install

# 2. 安装截图依赖的浏览器内核（只需执行一次，如果下载慢可以加镜像前缀）
PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/ npx playwright install chromium chromium-headless-shell

# 3. 启动项目
npm run dev
```

- 前端界面：http://localhost:5173
- 后端服务：http://localhost:3001

## 日常使用

你平时使用这个项目，**完全不需要**再执行 `npm install`。只需要打开终端进入项目目录，运行启动命令即可：

```bash
npm run dev
```

等终端提示 `➜ Local: http://localhost:5173/` 后，直接在浏览器打开即可。

## 使用

- 点击右上角“新增”，粘贴 URL 保存
- 系统会异步生成预览：pending/processing/ready/failed
- 列表点卡片进入详情，可刷新预览、编辑标签/备注、删除

## 标签管理规则

### 预设标签（推荐）

项目内置了一套“中文 / English”的预设标签，包含材质、风格、布局、动效、场景等分组，用于快速统一口径和后续筛选。

- **展示方式**：UI 中显示为 `中文 / English`（例如 `玻璃 / Glass`）。
- **存储方式**：数据库中存的是稳定的 key（例如 `glass`），便于去重与筛选。
- **输入归一化**：当你手动输入 `玻璃` / `Glass` / `glass`，会自动归一到同一个 key：`glass`（避免出现同义重复）。

### 自定义标签

你也可以输入不在预设里的标签：

- 会原样存储（不做翻译），并参与筛选
- 建议遵循一个固定写法，避免出现同义不同写（例如 `type` vs `typography`）

### 维护预设词库

编辑预设标签词库：

- 文件位置：[tagPresets.ts](file:///Users/yigu-01/Desktop/Design_collection/src/lib/tagPresets.ts)
- 你可以增删分组、增删标签，以及维护每个标签的 `zh/en/key`
- **注意**：`key` 相当于“唯一 ID”，一旦大量使用后不建议频繁更改；如果一定要改，建议保留旧 key 并新建一个 key，再逐步迁移

## 数据位置

- SQLite：data/app.db
- 截图文件：data/assets/

## 导出为静态网站（发布到 GitHub Pages）

如果你想在手机上随时访问你的收藏（只读模式），最简单、免费的方法是将其部署到 GitHub Pages。

**前置准备：**
1. 确保你已经在本地配置了 Git，并将当前代码 push 到了一个 GitHub 仓库。
2. 项目已经默认配置了 `gh-pages` 工具。

**一键发布步骤：**

在终端运行以下命令：
```bash
npm run deploy
```
这个命令会自动完成三件事：
1. 抓取你本地的 SQLite 数据库和所有截图资源。
2. 自动打包成一个纯静态的网页放在 `dist/` 目录下。
3. 自动将 `dist/` 目录的内容 push 到你仓库的 `gh-pages` 分支。

**在 GitHub 上开启访问：**
1. 去你的 GitHub 仓库，点击 **Settings** -> **Pages**。
2. 在 `Build and deployment` 下的 Source 选择 `Deploy from a branch`。
3. Branch 选择 `gh-pages` 分支，文件夹选 `/ (root)`，点击 Save。
4. 等待几分钟，GitHub 会给出一个形如 `https://<你的用户名>.github.io/<仓库名>/` 的链接，你在手机上打开这个链接就能看了。

*(注：静态模式下所有的“新增/修改/删除”操作都会被拦截，保证数据安全，别人只能看不能改。你的 SQLite 原数据也不会被上传到 GitHub 主分支中)*
