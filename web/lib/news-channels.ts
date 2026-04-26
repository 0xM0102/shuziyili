/**
 * 资讯 Juhe 频道：与后端 `JuheNewsTypes` 一致；供客户端 `nav`、`AppShell`、`nav-active` 使用。
 * 勿从 `news-api` 引用（含服务端 fetch / `react.cache`），以免打进客户端包。
 */
export const NEWS_JUHE_TYPES = [
  "top",
  "shehui",
  "guonei",
  "guoji",
  "yule",
  "tiyu",
  "junshi",
  "keji",
  "caijing",
  "shishang",
] as const;

export type NewsJuheType = (typeof NEWS_JUHE_TYPES)[number];

export const NEWS_CHANNEL_LABELS: Record<NewsJuheType, string> = {
  top: "头条",
  shehui: "社会",
  guonei: "国内",
  guoji: "国际",
  yule: "娱乐",
  tiyu: "体育",
  junshi: "军事",
  keji: "科技",
  caijing: "财经",
  shishang: "时尚",
};

const JUHE_TYPE_SET = new Set<string>(NEWS_JUHE_TYPES);

export function normalizeNewsType(raw: string | undefined): NewsJuheType {
  const t = (raw ?? "").trim().toLowerCase();
  return (JUHE_TYPE_SET.has(t) ? t : "top") as NewsJuheType;
}

export function buildNewsIndexHref(juheType: NewsJuheType): string {
  return juheType === "top" ? "/news" : `/news?type=${encodeURIComponent(juheType)}`;
}

/** 解析侧栏/移动条中的 `/news` 链接，供 `channelEntryIsActive` 与 query 组合判断。 */
export type ParsedNewsNavLink =
  | { kind: "not-news" }
  | { kind: "news-hotspot" }
  | { kind: "news-channel"; channel: NewsJuheType };

export function parseNewsNavLinkHref(href: string): ParsedNewsNavLink {
  let u: URL;
  try {
    u = new URL(href, "https://placeholder.local");
  } catch {
    return { kind: "not-news" };
  }
  if (u.pathname !== "/news") return { kind: "not-news" };
  const raw = u.searchParams.get("type");
  if (raw === null || raw.trim() === "") {
    return { kind: "news-hotspot" };
  }
  return { kind: "news-channel", channel: normalizeNewsType(raw) };
}
