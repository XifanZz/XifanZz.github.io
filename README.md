# 从夯到拉 · 番剧排行

一个本地运行的番剧 Tier List 网站，内置 43 部番剧与 Bangumi 海报。页面可在“共同看过的番”（完整 43 部）和“2025新番”（16 部）两个独立榜单之间切换。

## 运行

```powershell
npm.cmd install
npm.cmd run dev
```

打开终端显示的本地地址即可开始排行。

## 常用命令

```powershell
npm.cmd test                # 运行测试
npm.cmd run build           # 生成 dist 生产构建
npm.cmd run preview         # 预览生产构建
npm.cmd run download:posters # 按目录重新下载 Bangumi 海报
```

排行会自动保存在当前浏览器的 `localStorage` 中。“保存长图”只导出六个评级档位，不包含未评级番剧。

番剧目录位于 `src/data/anime.json`，海报位于 `public/posters`。

## GitHub Pages

推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动构建并发布网站。
在仓库的 `Settings → Pages` 中将 `Source` 设置为 `GitHub Actions`，公开地址为：

`https://xifanzz.github.io/`
