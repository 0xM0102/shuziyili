import Link from "next/link";
import type { Metadata } from "next";
import { getPublicApiV1Base } from "@/lib/api-base";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "旅游",
  description: `${siteConfig.name} · 伊犁旅游：路线、攻略与本地体验。`,
  alternates: { canonical: "/travel" },
  openGraph: {
    title: `旅游 · ${siteConfig.name}`,
    description: "伊犁旅游：路线、攻略与本地体验。",
    url: "/travel",
  },
};

type TravelBanner = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  slot: string;
  sortOrder: number;
};

async function getTravelBanners(): Promise<TravelBanner[]> {
  const base = getPublicApiV1Base();
  try {
    const res = await fetch(`${base}/travel/banners`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { ok: boolean; data?: { items?: TravelBanner[] } };
    if (!json.ok) return [];
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

/** 场景入口：与侧栏二级栏目对应，后续可加 query 或 CMS 配置 */
const SCENE_ENTRIES = [
  { label: "花海", href: "/travel/guide", hint: "花季·摄影" },
  { label: "草原", href: "/travel/attractions", hint: "牧场·风光" },
  { label: "雪山", href: "/travel/attractions", hint: "徒步·观景" },
  { label: "自驾", href: "/travel/transport", hint: "路况·补给" },
] as const;

/** 精选路线：暂无独立 API，结构化占位，后续可接「路线」接口或文章标签 */
const FEATURED_ROUTES = [
  {
    title: "杏花沟一日游",
    meta: "春季 · 轻徒步",
    href: "/travel/guide",
    tone: "from-pink-200/40 via-white to-white" as const,
  },
  {
    title: "赛里木湖2日游",
    meta: "环湖 · 自驾友好",
    href: "/travel/transport",
    tone: "from-sky-200/45 via-white to-white" as const,
  },
  {
    title: "草原深度游",
    meta: "牧区 · 慢旅行",
    href: "/travel/attractions",
    tone: "from-emerald-200/35 via-white to-white" as const,
  },
] as const;

/** 攻略：公开接口暂无文章列表，链到资讯列表占位 */
const INSPIRATION_TEASERS = [
  { title: "伊犁杏花节什么时候去最好？", href: "/news", meta: "攻略" },
  { title: "新疆自驾避坑指南", href: "/news", meta: "自驾" },
] as const;

const LOCAL_PILLARS = [
  { title: "民宿", desc: "短住与特色院落", href: "/travel/stay", emoji: "🏠" },
  { title: "美食", desc: "本地味与夜市", href: "/travel/food", emoji: "🍜" },
  { title: "打卡点", desc: "出片与地标", href: "/travel/attractions", emoji: "📷" },
] as const;

function pickBanner(banners: TravelBanner[], slot: string) {
  return banners.find((b) => b.slot === slot) ?? null;
}

function toneClass() {
  return "from-primary/15 via-white to-white";
}

function SectionHead({
  title,
  moreHref,
}: {
  title: string;
  moreHref?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
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

type Forecast = { day: string; icon: string; hi: number; lo: number; note: string };

function WeatherCard() {
  // 先用占位数据；后续可接入真实天气 API（避免现在就引入外部依赖与 key 管理）
  const now = new Date();
  const stamp = now.toLocaleString("zh-CN", { hour12: false });
  const forecast: Forecast[] = [
    { day: "今天", icon: "☀️", hi: 18, lo: 6, note: "晴" },
    { day: "明天", icon: "⛅️", hi: 16, lo: 5, note: "多云" },
    { day: "后天", icon: "🌧️", hi: 12, lo: 3, note: "小雨" },
  ];

  return (
    <aside className="border-t border-border bg-background lg:border-t-0 lg:border-l">
      <div className="px-4 py-4 md:px-5">
        <SectionHead title="伊宁天气（占位）" moreHref="/travel/guide" />
        <p className="mt-1 text-xs text-muted">更新时间：{stamp}</p>

        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted">当前</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">14°</p>
              <p className="mt-1 text-xs text-muted">体感 12° · 风 3 级</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">晴间多云</p>
              <p className="mt-1 text-xs text-muted">建议：防晒 + 备外套</p>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <ul className="space-y-2">
              {forecast.map((f) => (
                <li key={f.day} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{f.day}</span>
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{f.icon}</span>
                    <span className="text-muted">{f.note}</span>
                  </span>
                  <span className="font-medium text-foreground">
                    {f.hi}° / {f.lo}°
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default async function TravelPage() {
  const banners = await getTravelBanners();
  const hero = pickBanner(banners, "travel_main") ?? banners[0] ?? null;

  const heroTitle = hero?.title?.trim() || "伊犁 · 杏花季";
  const heroSub = "去天山脚下看一场春天";
  const heroImage = hero?.imageUrl?.trim();
  const primaryCta = hero?.linkUrl?.trim() || "/travel/guide";
  const secondaryCta = "/travel/attractions";
  const heroIsPhoto = Boolean(heroImage);

  return (
    <div className="space-y-0">
      {/* 顶部：一个大 Banner + 右侧天气模块（对齐首页两列结构） */}
      <section className="mx-0 grid gap-0 border-b border-border lg:grid-cols-[1fr_360px]">
        <div className="relative overflow-hidden bg-background">
          <div
            className={`relative h-[240px] w-full md:h-[340px] ${
              heroIsPhoto ? "bg-cover bg-center" : `bg-linear-to-br ${toneClass()}`
            }`}
            style={heroIsPhoto ? { backgroundImage: `url(${heroImage})` } : undefined}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,149,249,0.12),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(0,0,0,0.08),transparent_50%)]" />
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t ${
                heroIsPhoto ? "from-black/65 via-black/25 to-transparent" : "from-white/85 via-white/55 to-transparent"
              }`}
              aria-hidden
            />

            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className={`text-xs font-semibold uppercase tracking-widest ${heroIsPhoto ? "text-white/80" : "text-muted"}`}>
                伊犁旅游
              </p>
              <h1 className={`mt-2 line-clamp-2 text-2xl font-bold tracking-tight md:text-3xl ${heroIsPhoto ? "text-white" : "text-foreground"}`}>
                {heroTitle}
              </h1>
              <p className={`mt-2 line-clamp-2 max-w-xl text-sm md:text-base ${heroIsPhoto ? "text-white/90" : "text-muted"}`}>
                {heroSub}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {primaryCta.startsWith("http") ? (
                  <a
                    href={primaryCta}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
                  >
                    查看路线
                  </a>
                ) : (
                  <Link
                    href={primaryCta}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
                  >
                    查看路线
                  </Link>
                )}
                <Link
                  href={secondaryCta}
                  className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    heroIsPhoto
                      ? "border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                      : "border border-border bg-card text-foreground hover:bg-sidebar-hover"
                  }`}
                >
                  开始探索
                </Link>
              </div>
            </div>
          </div>
        </div>

        <WeatherCard />
      </section>

      {/* 下半区：按首页风格，用分区标题+卡片+边框 */}
      <div className="mx-auto max-w-6xl space-y-0">
        {/* ========== 你想怎么玩 ========== */}
        <section aria-labelledby="travel-scenes" className="bg-background px-4 py-10 md:px-5">
          <SectionHead title="你想怎么玩" moreHref="/travel/guide" />
          <p className="mt-2 text-sm text-muted">选一个场景，从攻略与交通开始</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SCENE_ENTRIES.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-sidebar-hover"
              >
                <div className="text-base font-semibold text-foreground group-hover:text-primary">
                  {s.label}
                </div>
                <div className="mt-1 text-xs text-muted">{s.hint}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== 精选路线 ========== */}
        <section aria-labelledby="travel-routes" className="border-t border-border bg-background px-4 py-10 md:px-5">
          <SectionHead title="精选路线" moreHref="/travel/guide" />
          <p className="mt-2 text-sm text-muted">示例结构，后续可接路线数据或文章合集</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {FEATURED_ROUTES.map((r) => (
              <Link
                key={r.title}
                href={r.href}
                className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-linear-to-br ${r.tone} transition hover:border-primary/35`}
              >
                <div className="h-28 border-b border-border/60 bg-white/30 dark:bg-white/5" />
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-medium text-primary">{r.meta}</span>
                  <span className="mt-1 text-base font-semibold text-foreground">{r.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== 旅行灵感 / 攻略 ========== */}
        <section aria-labelledby="travel-guides" className="border-t border-border bg-background px-4 py-10 md:px-5">
          <SectionHead title="旅行灵感 · 攻略" moreHref="/news" />
          <p className="mt-2 text-sm text-muted">公开接口暂无文章列表；先链到资讯，接入列表 API 后可替换为真实数据</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {INSPIRATION_TEASERS.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/35"
              >
                <span className="text-xs font-medium text-primary">{a.meta}</span>
                <p className="mt-2 text-base font-semibold text-foreground">{a.title}</p>
                <p className="mt-3 text-sm text-muted">阅读全文 →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== 本地体验 ========== */}
        <section aria-labelledby="travel-local" className="border-t border-border bg-background px-4 py-10 md:px-5">
          <SectionHead title="本地体验" />
          <p className="mt-2 text-sm text-muted">住宿、美食与打卡，一站跳转</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {LOCAL_PILLARS.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/35 hover:bg-sidebar-hover"
              >
                <span className="text-2xl" aria-hidden>
                  {p.emoji}
                </span>
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="mt-1 text-sm text-muted">{p.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
