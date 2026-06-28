import type { CSSProperties } from "react";
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

export function hasNewsThumbnail(thumbnailUrl: string | undefined): boolean {
  return Boolean(thumbnailUrl?.trim());
}

/** 列表缩略图 / 详情头图共用的 `background-image` 样式；无图时返回 `undefined`。 */
export function newsThumbnailStyle(thumbnailUrl: string | undefined): CSSProperties | undefined {
  const url = thumbnailUrl?.trim();
  if (!url) return undefined;
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
