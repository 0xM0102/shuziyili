import { fetchNewsApiData } from "@/lib/api-base";
import { parseNewsListRow, type NewsItem } from "@/lib/news-api";

export type HomeAreaNewsItem = NewsItem & { summary: string };

export type HomeAreaNewsTag = {
  kind: "region" | "source";
  label: string;
};

export type HomeAreaNewsPayload = {
  enabled: boolean;
  items: HomeAreaNewsItem[];
  regionName: string;
  upstreamConfigured: boolean;
};

const emptyPayload: HomeAreaNewsPayload = {
  enabled: false,
  items: [],
  regionName: "新疆",
  upstreamConfigured: false,
};

/** 行内标签：地区与来源样式区分，二者文案相同时只保留一条。 */
export function buildAreaNewsTags(
  item: Pick<HomeAreaNewsItem, "category" | "authorName">
): HomeAreaNewsTag[] {
  const tags: HomeAreaNewsTag[] = [];
  const category = item.category.trim();
  const author = item.authorName.trim();

  if (category) tags.push({ kind: "region", label: category });
  if (author && author !== category) tags.push({ kind: "source", label: author });
  return tags;
}

function parseHomeAreaItem(raw: unknown): HomeAreaNewsItem | null {
  const base = parseNewsListRow(raw);
  if (!base) return null;
  const row = raw as Record<string, unknown>;
  return { ...base, summary: String(row.summary ?? "") };
}

/** 首页地区资讯（天聚数行，与主资讯 Provider 无关）。 */
export async function getHomeAreaNews(): Promise<HomeAreaNewsPayload> {
  const data = await fetchNewsApiData<Partial<HomeAreaNewsPayload> & { items?: unknown[] }>(
    "/home/area-news",
    emptyPayload
  );
  const items: HomeAreaNewsItem[] = [];
  for (const row of data.items ?? []) {
    const parsed = parseHomeAreaItem(row);
    if (parsed) items.push(parsed);
  }
  return {
    enabled: data.enabled !== false,
    items,
    regionName: String(data.regionName ?? emptyPayload.regionName),
    upstreamConfigured: Boolean(data.upstreamConfigured),
  };
}
