import { cache } from "react";
import { fetchNewsApiData } from "@/lib/api-base";
import { normalizeNewsType, type NewsChannelType } from "@/lib/news-channels";

export * from "@/lib/news-channels";

export type NewsItem = {
  uniquekey: string;
  title: string;
  date: string;
  category: string;
  authorName: string;
  url: string;
  thumbnailUrl: string;
};

export type NewsHeadlinesPayload = {
  items: NewsItem[];
  cachedAtEpochMs: number;
  refreshIntervalSeconds: number;
  upstreamConfigured: boolean;
  channelType?: string;
};

export type NewsDetailPayload = {
  item: NewsItem;
  contentHtml?: string;
  attribution: string;
};

const emptyHeadlines: NewsHeadlinesPayload = {
  items: [],
  cachedAtEpochMs: 0,
  refreshIntervalSeconds: 3600,
  upstreamConfigured: false,
};

function trimUniquekey(uniquekey: string): string {
  return uniquekey.trim();
}

function resolveChannelType(channelType?: NewsChannelType | string): NewsChannelType | undefined {
  return typeof channelType === "string" ? normalizeNewsType(channelType) : channelType;
}

/** 解析资讯列表 API 单条（首页地区块与 /news 列表共用字段）。 */
export function parseNewsListRow(raw: unknown): NewsItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const uniquekey = String(row.uniquekey ?? "").trim();
  const title = String(row.title ?? "").trim();
  if (!uniquekey || !title) return null;
  return {
    uniquekey,
    title,
    date: String(row.date ?? ""),
    category: String(row.category ?? ""),
    authorName: String(row.authorName ?? ""),
    url: String(row.url ?? ""),
    thumbnailUrl: String(row.thumbnailUrl ?? ""),
  };
}

export function buildNewsArticleHref(uniquekey: string, channelType?: string): string {
  const key = encodeURIComponent(trimUniquekey(uniquekey));
  const type = resolveChannelType(channelType);
  return type ? `/news/${key}?type=${encodeURIComponent(type)}` : `/news/${key}`;
}

export async function getNewsHeadlines(
  channelType: NewsChannelType | string
): Promise<NewsHeadlinesPayload> {
  const type = resolveChannelType(channelType) ?? normalizeNewsType(undefined);
  return fetchNewsApiData<NewsHeadlinesPayload>(
    `/news/headlines?type=${encodeURIComponent(type)}`,
    emptyHeadlines
  );
}

async function fetchNewsDetailOnce(
  uniquekey: string,
  channelType?: NewsChannelType | string
): Promise<NewsDetailPayload | null> {
  const key = trimUniquekey(uniquekey);
  if (!key) return null;
  const type = resolveChannelType(channelType);
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return fetchNewsApiData<NewsDetailPayload | null>(
    `/news/headlines/${encodeURIComponent(key)}${query}`,
    null
  );
}

/** 同一 RSC 请求内 `generateMetadata` 与页面正文去重。 */
export const getNewsDetail = cache(fetchNewsDetailOnce);
