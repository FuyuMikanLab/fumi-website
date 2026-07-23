# 字体源文件与子集

## ChillRoundGothic

| 文件 | 说明 |
|------|------|
| `fonts/source/ChillRoundGothic_Normal.ttf` | 完整源字体（约 12MB，已 gitignore） |
| `public/fonts/ChillRoundGothic_Normal.woff2` | 按站点用字子集 |
| `fonts/glyphs.txt` | 最近一次子集用到的字符表 |

文案改动后若出现缺字，重新打包：

```bash
pnpm subset:font
```

CI 没有本地源字体时会默认从 CDN 拉取；也可覆盖：

```bash
FONT_SOURCE_URL=https://assert.vrfan.icu/website/fonts/ChillRoundGothic_Normal.ttf pnpm subset:font
```

## Vercel CI

工作流：`.github/workflows/vercel.yml`

在 GitHub → Settings → Secrets and variables → Actions 配置：

| Secret | 说明 |
|--------|------|
| `VERCEL_TOKEN` | [Vercel Token](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | 项目 `.vercel/project.json` 里的 `orgId` |
| `VERCEL_PROJECT_ID` | 同上的 `projectId` |

本地生成 org/project id：

```bash
npx vercel link
cat .vercel/project.json
```

`dev` 推送 → 生产；向 `dev` 提的 PR → Preview，并评论部署地址。

若已在 Vercel 控制台开启 Git 自动部署，请关掉其一，避免重复发布。
