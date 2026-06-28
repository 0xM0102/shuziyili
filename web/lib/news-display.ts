import type { NewsItem } from "@/lib/news-api";

/** 资讯条目的元信息行（日期、可选分类、可选作者）。 */
export function formatNewsByline(
  item: Pick<NewsItem, "date" | "category" | "authorName">,
  opts?: { includeCategory?: boolean }
): string {
  const includeCategory = opts?.includeCategory ?? false;
  const parts: string[] = [item.date];
  if (includeCategory && item.category) parts.push(item.category);
  if (item.authorName) parts.push(item.authorName);
  return parts.join(" · ");
}

/** 列表是否展示缩略图区域（有 URL 时尝试加载，失败由 NewsThumbnail 回退占位）。 */
export function hasNewsThumbnail(thumbnailUrl: string | undefined): boolean {
  return Boolean(thumbnailUrl?.trim());
}
