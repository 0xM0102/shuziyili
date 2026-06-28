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
  /** 聚合「新闻详情」返回的正文 HTML，可能为空 */
  contentHtml?: string;
  attribution: string;
};

const emptyHeadlines: NewsHeadlinesPayload = {
  items: [],
  cachedAtEpochMs: 0,
  refreshIntervalSeconds: 3600,
  upstreamConfigured: false,
};

function normalizedUniquekey(uniquekey: string): string {
  return uniquekey.trim();
}

export function buildNewsArticleHref(uniquekey: string, channelType?: string): string {
  const key = encodeURIComponent(normalizedUniquekey(uniquekey));
  const type = typeof channelType === "string" ? normalizeNewsType(channelType) : undefined;
  return type ? `/news/${key}?type=${encodeURIComponent(type)}` : `/news/${key}`;
}

export async function getNewsHeadlines(
  channelType: NewsChannelType | string
): Promise<NewsHeadlinesPayload> {
  const type =
    typeof channelType === "string" ? normalizeNewsType(channelType) : channelType;
  return fetchNewsApiData<NewsHeadlinesPayload>(
    `/news/headlines?type=${encodeURIComponent(type)}`,
    emptyHeadlines
  );
}

async function fetchNewsDetailOnce(
  uniquekey: string,
  channelType?: NewsChannelType | string
): Promise<NewsDetailPayload | null> {
  const key = normalizedUniquekey(uniquekey);
  if (!key) return null;
  const type =
    typeof channelType === "string" ? normalizeNewsType(channelType) : undefined;
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return fetchNewsApiData<NewsDetailPayload | null>(
    `/news/headlines/${encodeURIComponent(key)}${query}`,
    null
  );
}

/**
 * 同一 RSC 请求内 `generateMetadata` 与页面正文去重，避免对同一 `uniquekey` 打两次自家 API。
 */
export const getNewsDetail = cache(fetchNewsDetailOnce);
