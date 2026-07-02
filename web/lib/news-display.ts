import type { NewsItem } from "@/lib/news-api";

const GTIMG_HOST_PATTERN = /(?:^|\.)gtimg\.com$/i;

/** 列表日期行：2026.07.01 - 昨天（用于首页地区资讯等卡片列表）。 */
export function formatNewsListDateLine(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (!trimmed) return "";

  const ms = Date.parse(trimmed.replace(/-/g, "/"));
  if (Number.isNaN(ms)) return trimmed;

  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const formatted = `${y}.${m}.${day}`;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfItem = new Date(y, d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.floor((startOfToday - startOfItem) / 86_400_000);

  if (dayDiff === 0) return `${formatted} - 今天`;
  if (dayDiff === 1) return `${formatted} - 昨天`;
  if (dayDiff === 2) return `${formatted} - 前天`;
  return formatted;
}

/** 资讯条目的元信息行（日期、可选分类、可选作者）。 */
export function formatNewsByline(
  item: Pick<NewsItem, "date" | "category" | "authorName">,
  opts?: { includeCategory?: boolean }
): string {
  const parts: string[] = [item.date];
  if (opts?.includeCategory && item.category) parts.push(item.category);
  if (item.authorName) parts.push(item.authorName);
  return parts.filter(Boolean).join(" · ");
}

/** 腾讯图床防盗链：分享预览回退站内 logo，页面内仍尝试加载。 */
export function isBlockedNewsThumbnailHost(thumbnailUrl: string): boolean {
  try {
    return GTIMG_HOST_PATTERN.test(new URL(thumbnailUrl.trim()).hostname);
  } catch {
    return false;
  }
}

export function resolveNewsOpenGraphImage(
  thumbnailUrl: string | undefined,
  fallbackUrl: string
): string {
  const thumb = thumbnailUrl?.trim();
  if (!thumb || isBlockedNewsThumbnailHost(thumb)) return fallbackUrl;
  return thumb;
}
