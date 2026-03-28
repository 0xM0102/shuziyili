import Link from "next/link";
import type { Metadata } from "next";
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

async function getHomeBanners(): Promise<HomeBanner[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
  try {
    const res = await fetch(`${base}/home/banners`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { ok: boolean; data?: { items?: HomeBanner[] } };
    if (!json.ok) return [];
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

/**
 * 首页「热点」结构说明（参考资讯门户形态）：
 * - 上半区：左侧大焦点（轮播位） + 右侧两张小卡（补充曝光/导流）
 * - 下半区：左侧精选/热榜（更强的信息密度） + 右侧 7×24 快讯（高频短内容）
 *
 * 这里先用静态占位数据与渐变背景模拟“封面图位”，后续接入真实内容时：
 * - 用真实 cover 图替换掉渐变块（例如 Next/Image + 图片 URL）
 * - 用真实接口数据替换 featured/列表数组即可，不需要重改布局。
 */
const featured: Teaser[] = [
  {
    title: "伊犁春季赏花路线与避堵建议（占位）",
    tag: "焦点",
    meta: "今日更新",
    href: "/news",
    tone: "blue",
  },
  {
    title: "本周活动合集：市集/露营/展览（占位）",
    tag: "活动",
    meta: "本周",
    href: "/events",
    tone: "warm",
  },
  {
    title: "数字游民短住：选址、网络与空间（占位）",
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

/**
 * 右侧小卡（上半区）：保持与大焦点一致的“封面位 + 标题 + 简述 + 导流”结构。
 * 说明：这里的背景同样是占位渐变，后续可替换为真实封面图。
 */
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

/**
 * 区块标题（复用）：左侧彩色圆点用于“栏目识别”，右侧更多链接保持弱化视觉。
 * dotTone=blue 用于主栏目；pink 用于快讯等“高频”块，形成视觉分组。
 */
function SectionHead({
  title,
  moreHref,
  dotTone = "blue",
}: {
  title: string;
  moreHref?: string;
  dotTone?: "blue" | "pink";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${dotTone === "pink" ? "bg-pink-500" : "bg-primary"}`}
          aria-hidden
        />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {moreHref ? (
        <Link href={moreHref} className="text-xs text-muted hover:text-primary">
          更多 &gt;
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const banners = await getHomeBanners();
  const mains = banners.filter((b) => b.slot === "home_main");
  const hero = mains[0];
  const sideTop = banners.find((b) => b.slot === "home_side_top");
  const sideBottom = banners.find((b) => b.slot === "home_side_bottom");

  return (
    <div className="space-y-0">
      {/* 上半区：大焦点 + 右侧双卡（对齐参考图结构） */}
      <section className="mx-0 grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="relative overflow-hidden bg-background">
          <div
            className={`relative h-[240px] w-full md:h-[340px] ${
              hero ? "bg-cover bg-center" : `bg-linear-to-br ${toneClass(featured[0].tone)}`
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
              aria-label="上一条（占位）"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-4xl leading-none text-white/85 transition-colors hover:text-white md:flex"
              aria-label="下一条（占位）"
            >
              ›
            </button>

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 via-black/20 to-transparent p-4 md:p-6">
              <div className="flex items-center gap-2">
                {hero ? null : (
                  <>
                    <span className="rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                      {featured[0].tag ?? "焦点"}
                    </span>
                    <span className="text-xs text-white/80">{featured[0].meta ?? "更新"}</span>
                  </>
                )}
              </div>
              <Link href={hero?.linkUrl ?? featured[0].href} className="mt-3 block">
                <h1 className="line-clamp-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
                  {hero?.title ?? featured[0].title}
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
            title={sideTop?.title ?? "AI 数智课程：从入门到实战（占位）"}
            sub={sideTop ? null : "适合本地从业者/游客：快速了解数字工具与本地资源。"}
            href={sideTop?.linkUrl ?? "/news"}
            imageUrl={sideTop?.imageUrl ?? null}
            tone="blue"
          />
          <RailCard
            className="border-t border-border"
            title={sideBottom?.title ?? "伊犁周末去哪儿：露营/自驾/美食（占位）"}
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
            <div className="mt-4 grid gap-3 md:grid-cols-[140px_1fr]">
              <div className="bg-sidebar-hover p-3">
                <p className="text-xs text-muted">今日推荐</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">03</p>
                <p className="text-xs text-muted">2026 / 03 / 25</p>
              </div>
              <div className="bg-background p-3">
                <ul className="space-y-2 text-sm">
                  {[
                    "伊犁本周活动：市集、展览、报名入口汇总（占位）",
                    "春季自驾：天气、路况、补给点建议（占位）",
                    "数字游民：短住选址与网络测速经验（占位）",
                    "便民黄页：常用电话与办事入口（占位）",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                      <span className="line-clamp-1 text-foreground/95">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-background">
            <div className="flex items-center justify-between px-4 py-4 md:px-5">
              <SectionHead title={`${siteConfig.name} 今日热榜（占位）`} moreHref="/news" dotTone="blue" />
            </div>
            <ul>
              {[
                { title: "本周末活动报名入口整理（占位）", meta: "34 分钟前" },
                { title: "伊宁周边轻徒步线路推荐（占位）", meta: "2 小时前" },
                { title: "便民：医院挂号与急救电话（占位）", meta: "今天" },
                { title: "数字游民：共享办公与咖啡馆（占位）", meta: "昨天" },
              ].map((it) => (
                <li key={it.title} className="px-4 py-4 md:px-5">
                  <p className="line-clamp-1 text-sm font-medium text-foreground/95">{it.title}</p>
                  <p className="mt-1 text-xs text-muted">{it.meta}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="border-t border-border bg-background lg:border-t-0 lg:border-l">
          <div className="flex items-center justify-between px-4 py-4">
            <SectionHead title="7×24 快讯" moreHref="/news" dotTone="pink" />
          </div>
          <ul>
            {[
              { time: "12:15", text: "伊犁本地活动报名新增 3 场（占位）。" },
              { time: "11:40", text: "春季出行提示：山区温差与路况（占位）。" },
              { time: "10:10", text: "便民：政务服务入口更新（占位）。" },
              { time: "09:30", text: "数字游民：短住房源上新（占位）。" },
              { time: "08:20", text: "旅游：热门景点客流提示（占位）。" },
            ].map((it) => (
              <li key={`${it.time}-${it.text}`} className="px-4 py-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-xs text-muted">{it.time}</span>
                  <p className="line-clamp-2 text-sm text-foreground/95">{it.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
