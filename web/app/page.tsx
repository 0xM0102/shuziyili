import Link from "next/link";
import type { Metadata } from "next";
import { FlashQuickAside } from "@/components/flash/flash-quick-aside";
import { HomeAreaNewsBlock } from "@/components/home/home-area-news-block";
import { SectionHead } from "@/components/layout/section-head";
import { fetchPublicApiData } from "@/lib/api-base";
import { getFlashLinks } from "@/lib/flash-links";
import { getHomeAreaNews } from "@/lib/home-area-news";
import { siteConfig } from "@/lib/site";

type HomeBanner = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  slot: "home_main" | "home_side_top" | "home_side_bottom";
  sortOrder: number;
};

export const metadata: Metadata = {
  title: "首页",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
};

type Teaser = {
  title: string;
  tag?: string;
  meta?: string;
  href: string;
  tone?: "blue" | "dark" | "warm";
};

type CuratedArticle = {
  id: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  updatedAt: number;
  href: string;
};

async function getHomeFeatured(): Promise<CuratedArticle[]> {
  const data = await fetchPublicApiData<{ featured?: CuratedArticle[] }>("/home/curated", {});
  return data.featured ?? [];
}

/** 首页 Hero 标题下角标：相对更新时间（中文）。 */
function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 172_800_000) return "昨天";
  return new Date(ms).toLocaleDateString("zh-CN");
}

async function getHomeBanners(): Promise<HomeBanner[]> {
  const data = await fetchPublicApiData<{ items?: HomeBanner[] }>("/home/banners", { items: [] });
  return data.items ?? [];
}

/** 无主 Banner 且无后台精选首条时的 Hero 兜底。 */
const featured: Teaser[] = [
  {
    title: "伊犁春季赏花路线与避堵建议",
    tag: "焦点",
    meta: "今日更新",
    href: "/news",
    tone: "blue",
  },
  {
    title: "本周活动合集：市集/露营/展览",
    tag: "活动",
    meta: "本周",
    href: "/events",
    tone: "warm",
  },
  {
    title: "数字游民短住：选址、网络与空间",
    tag: "游民",
    meta: "指南",
    href: "/nomad",
    tone: "dark",
  },
];

function toneClass(tone: Teaser["tone"]) {
  if (tone === "warm") return "from-amber-200/50 via-white to-white";
  if (tone === "dark") return "from-slate-200/55 via-white to-white";
  return "from-primary/15 via-white to-white";
}

/** 轮播指示点：统一高度与圆角，active 走品牌蓝点缀 */
function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-1.5 w-4 rounded-full transition-colors ${
        active ? "bg-primary" : "bg-border"
      }`}
      aria-hidden
    />
  );
}

/** 右侧小卡（上半区）：保持与大焦点一致的“封面位 + 标题 + 简述 + 导流”结构。 */
function RailCard({
  title,
  sub,
  href,
  imageUrl,
  tone,
  className,
}: {
  title: string;
  sub?: string | null;
  href: string;
  imageUrl?: string | null;
  tone: "blue" | "dark";
  className?: string;
}) {
  const bg =
    tone === "dark"
      ? "bg-linear-to-br from-slate-200/70 via-white to-white"
      : "bg-linear-to-br from-primary/18 via-white to-white";
  // 有封面图时与左侧主 Banner 一致：整卡为图 + 底部暗色渐变条，白字压在底部
  const containerCls = imageUrl
    ? `group relative min-h-[140px] overflow-hidden md:min-h-[160px] ${className ?? ""}`
    : `group relative overflow-hidden ${bg} p-4 transition-colors hover:bg-sidebar-hover ${className ?? ""}`;

  const content = imageUrl ? (
    <>
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,149,249,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(0,0,0,0.08),transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 via-black/20 to-transparent p-4">
        <p className="line-clamp-2 text-sm font-semibold tracking-tight text-white">{title}</p>
        {sub ? <p className="mt-1 line-clamp-2 text-xs text-white/85">{sub}</p> : null}
        <span className="mt-2 inline-flex text-xs font-medium text-white/90 transition-opacity group-hover:text-white">
          查看 →
        </span>
      </div>
    </>
  ) : (
    <>
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {sub ? <p className="mt-2 line-clamp-2 text-xs text-muted">{sub}</p> : null}
        <span className="mt-3 inline-flex text-xs font-medium text-primary opacity-80 group-hover:opacity-100">
          查看 →
        </span>
      </div>
    </>
  );

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} className={containerCls} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={containerCls}>
      {content}
    </Link>
  );
}

export default async function HomePage() {
  const [banners, flashLinks, featuredCurated, areaNews] = await Promise.all([
    getHomeBanners(),
    getFlashLinks(),
    getHomeFeatured(),
    getHomeAreaNews(),
  ]);
  const mains = banners.filter((b) => b.slot === "home_main");
  const hero = mains[0];
  const sideTop = banners.find((b) => b.slot === "home_side_top");
  const sideBottom = banners.find((b) => b.slot === "home_side_bottom");
  const firstCurated = featuredCurated[0];
  // 「今日推荐」日期应始终表示今天（本地时区），而非某条内容的更新时间。
  const calDate = new Date();
  const month2 = String(calDate.getMonth() + 1).padStart(2, "0");
  const day2 = String(calDate.getDate()).padStart(2, "0");
  const featuredTop = featuredCurated.slice(0, 4);

  return (
    <div className="space-y-0">
      {/* 上半区：大焦点 + 右侧双卡（对齐参考图结构） */}
      <section className="mx-0 grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="relative overflow-hidden bg-background">
          <div
            className={`relative h-[240px] w-full md:h-[340px] ${
              hero ? "bg-cover bg-center" : `bg-linear-to-br ${toneClass(firstCurated ? "blue" : featured[0].tone)}`
            }`}
            style={
              hero
                ? { backgroundImage: `url(${hero.imageUrl})` }
                : undefined
            }
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,149,249,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(0,0,0,0.06),transparent_50%)]" />
            </div>

            {/* 伪“左右切换”按钮（仅箭头，无背景） */}
            <button
              type="button"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-4xl leading-none text-white/85 transition-colors hover:text-white md:flex"
              aria-label="上一条"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-4xl leading-none text-white/85 transition-colors hover:text-white md:flex"
              aria-label="下一条"
            >
              ›
            </button>

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 via-black/20 to-transparent p-4 md:p-6">
              <div className="flex items-center gap-2">
                {hero ? null : (
                  <>
                    <span className="rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                      {firstCurated ? "精选" : (featured[0].tag ?? "焦点")}
                    </span>
                    <span className="text-xs text-white/80">
                      {firstCurated
                        ? formatRelativeTime(firstCurated.updatedAt)
                        : (featured[0].meta ?? "更新")}
                    </span>
                  </>
                )}
              </div>
              <Link
                href={hero?.linkUrl ?? firstCurated?.href ?? featured[0].href}
                className="mt-3 block"
              >
                <h1 className="line-clamp-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
                  {hero?.title ?? firstCurated?.title ?? featured[0].title}
                </h1>
              </Link>

              <div className="mt-3 flex items-center gap-2">
                {(mains.length ? mains : [1, 2, 3]).slice(0, 5).map((_, idx) => (
                  <Dot key={idx} active={idx === 0} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-0 border-t border-border lg:border-t-0 lg:grid-rows-2 lg:border-l">
          <RailCard
            title={sideTop?.title ?? "AI 数智课程：从入门到实战"}
            sub={sideTop ? null : "适合本地从业者/游客：快速了解数字工具与本地资源。"}
            href={sideTop?.linkUrl ?? "/news"}
            imageUrl={sideTop?.imageUrl ?? null}
            tone="blue"
          />
          <RailCard
            className="border-t border-border"
            title={sideBottom?.title ?? "伊犁周末去哪儿：露营/自驾/美食"}
            sub={sideBottom ? null : "精选路线与时间表，让你少做攻略也能玩得舒服。"}
            href={sideBottom?.linkUrl ?? "/travel"}
            imageUrl={sideBottom?.imageUrl ?? null}
            tone="dark"
          />
        </aside>
      </section>

      {/* 下半区：左精选 + 右快讯（对齐参考图） */}
      <section className="grid gap-0 border-t border-border lg:grid-cols-[1fr_360px]">
        <div className="space-y-0">
          <div className="bg-background p-4 md:p-5">
            <SectionHead title="数伊精选" moreHref="/news" dotTone="blue" />
            <div className="mt-4 bg-primary/10">
              <div className="grid gap-0 md:grid-cols-[160px_1fr]">
                {/* 左侧日期牌 */}
                <div className="flex items-center justify-center p-4 md:p-5">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-primary">今日推荐</p>
                    <p className="mt-3 text-xs text-muted">
                      {calDate.getFullYear()} 年 {month2} 月
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                      {day2} / {month2}
                    </p>
                  </div>
                </div>

                {/* 右侧要点列表 */}
                <div className="p-4 md:p-5">
                  {featuredTop.length === 0 ? (
                    <p className="text-sm text-muted">
                      暂无精选条目。请登录管理后台 → 内容管理 → 首页运营，添加已发布文章。
                    </p>
                  ) : (
                    <ul className="space-y-2.5 text-sm">
                      {featuredTop.map((it) => (
                        <li key={it.id} className="flex min-w-0 items-start gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 rounded-[2px] bg-primary/60" aria-hidden />
                          <Link href={it.href} className="min-w-0 line-clamp-1 font-medium text-foreground/95 hover:text-primary">
                            {it.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {areaNews.enabled ? (
            <HomeAreaNewsBlock regionName={areaNews.regionName} items={areaNews.items} />
          ) : null}
        </div>

        <FlashQuickAside items={flashLinks} emptyLabel="暂无快讯" />
      </section>
    </div>
  );
}
