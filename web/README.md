# shuziyili-web

Next.js 前端（App Router + Tailwind）。**先搭骨架与首页**，业务数据接 `../api` 后再扩。

```bash
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>。生产域名默认 `https://shuziyili.com`（见 `.env.example`）。

## 结构速览

| 路径 | 作用 |
|------|------|
| `app/layout.tsx` | 根布局、SEO、顶栏、页脚；主区包在 `AppShell` 内 |
| `app/page.tsx` | 首页 |
| `app/travel/` | 旅游各页（侧栏热点由 `AppShell` 按路径切换） |
| `app/convenience/` | 便民各页 |
| `components/layout/app-shell.tsx` | **左栏 + 右栏**：全站导航 / 旅游二级 / 便民二级 |
| `lib/nav.ts` | `primaryNav`、`hotHomeNav`、`hotTravelNav`、`hotConvenienceNav` |
| `lib/site.ts` | 站名、域名 |
| `components/layout/` | `TopNav`、`ThemeToggle` 等 |
