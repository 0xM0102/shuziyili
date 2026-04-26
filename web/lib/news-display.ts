import type { NewsItem } from "@/lib/news-api";

/** 资讯条目的元信息行（日期、可选分类、可选作者）。列表与详情按需传入 `includeCategory`。 */
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
