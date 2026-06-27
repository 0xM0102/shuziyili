# shuziyili-web

Next.js 前端（App Router + Tailwind）。**先搭骨架与首页**，业务数据接 `../api` 后再扩。

```bash
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>。生产域名默认 `https://shuziyili.com`（见 `.env.example`）。

若本地页面能打开但接口无数据，先补齐本地环境变量：

```bash
cp .env.example .env.local
# 然后把 .env.local 中 NEXT_PUBLIC_API_BASE_URL 改为 http://localhost:8080
```

## 结构速览

| 路径 | 作用 |
|------|------|
| `app/layout.tsx` | 根布局、SEO、顶栏、页脚；主区包在 `AppShell` 内 |
| `app/page.tsx` | 首页 |
| `app/travel/` | 旅游各页（侧栏热点由 `AppShell` 按路径切换） |
| `app/convenience/` | 便民各页 |
| `components/layout/app-shell.tsx` | **左栏 + 主列**：按路径切换首页 / 旅游 / 便民 / 资讯侧栏 |
| `lib/nav.ts` | `primaryNav`、`hotHomeNav`、`hotTravelNav`、`hotConvenienceNav`、`hotNewsNav` |
| `lib/app-shell-config.ts` | `getSidebarConfig`：路径 → 侧栏分组与高亮策略 |
| `lib/channel-nav.ts` | 频道侧栏共用 hook / props（`useChannelEntryActive`） |
| `lib/site.ts` | 站名、域名 |
| `components/layout/` | `TopNav`、`ThemeToggle` 等 |
