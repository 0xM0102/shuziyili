/**
 * 资讯侧栏频道 slug（与后端 {@code NewsChannelTypes} 一致；Juhe / TianAPI 地区新闻、腾讯搜索共用）。
 * 勿从 `news-api` 引用（含服务端 fetch / `react.cache`），以免打进客户端包。
 */
export const NEWS_CHANNEL_TYPES = [
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

export type NewsChannelType = (typeof NEWS_CHANNEL_TYPES)[number];

export const NEWS_CHANNEL_LABELS: Record<NewsChannelType, string> = {
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

const CHANNEL_TYPE_SET = new Set<string>(NEWS_CHANNEL_TYPES);

export function normalizeNewsType(raw: string | undefined): NewsChannelType {
  const t = (raw ?? "").trim().toLowerCase();
  return (CHANNEL_TYPE_SET.has(t) ? t : "top") as NewsChannelType;
}

export function buildNewsIndexHref(channelType: NewsChannelType): string {
  return channelType === "top" ? "/news" : `/news?type=${encodeURIComponent(channelType)}`;
}

/** 解析侧栏/移动条中的 `/news` 链接，供 `channelEntryIsActive` 与 query 组合判断。 */
export type ParsedNewsNavLink =
  | { kind: "not-news" }
  | { kind: "news-hotspot" }
  | { kind: "news-channel"; channel: NewsChannelType };

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
