export const siteConfig = {
  name: "数字伊犁",
  /** 放在 `public/yl_logo.svg`，浏览器访问路径为 `/yl_logo.svg` */
  logoPath: "/yl_logo.svg",
  /** 字形版站点名：`public/shuziyili.svg`；页面内请用 `SiteWordmark` 组件以支持明暗色 */
  wordmarkPath: "/shuziyili.svg",
  /** 生产环境 canonical 与 Open Graph 使用；本地开发可在 .env.local 覆盖 */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shuziyili.com",
  description: "伊犁便民门户：资讯、活动、旅游、便民与数字游民。",
  locale: "zh_CN",
  /** 工信部 ICP 备案（页脚展示并链至全国备案查询） */
  icp: {
    number: "粤ICP备2026022255号-2",
    href: "https://beian.miit.gov.cn/",
  },
} as const;

export function absoluteUrl(path: string) {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
