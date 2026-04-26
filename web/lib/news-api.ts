import { cache } from "react";
import { fetchNewsApiData } from "@/lib/api-base";
import { normalizeNewsType, type NewsJuheType } from "@/lib/news-channels";

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
  juheType?: string;
};

export function buildNewsArticleHref(uniquekey: string): string {
  return `/news/${encodeURIComponent(uniquekey.trim())}`;
}

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

function resolvedNewsType(type: NewsJuheType | string): string {
  return typeof type === "string" ? normalizeNewsType(type) : type;
}

export async function getNewsHeadlines(type: NewsJuheType | string): Promise<NewsHeadlinesPayload> {
  const t = resolvedNewsType(type);
  return fetchNewsApiData<NewsHeadlinesPayload>(
    `/news/headlines?type=${encodeURIComponent(t)}`,
    emptyHeadlines
  );
}

async function fetchNewsDetailOnce(uniquekey: string): Promise<NewsDetailPayload | null> {
  const key = uniquekey.trim();
  if (!key) return null;
  return fetchNewsApiData<NewsDetailPayload | null>(
    `/news/headlines/${encodeURIComponent(key)}`,
    null
  );
}

/**
 * 同一 RSC 请求内 `generateMetadata` 与页面正文去重，避免对同一 `uniquekey` 打两次自家 API。
 */
export const getNewsDetail = cache(fetchNewsDetailOnce);
