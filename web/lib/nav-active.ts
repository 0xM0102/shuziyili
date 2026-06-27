import type { ReadonlyURLSearchParams } from "next/navigation";
import { normalizeNewsType, parseNewsNavLinkHref } from "@/lib/news-channels";

/**
 * 导航高亮策略：
 * - `primary`：顶栏一级菜单；`/` 仅精确匹配首页。
 * - `nested`：频道侧栏；`/travel`、`/convenience` 根路径仅精确匹配「热点」，子路径走前缀匹配。
 */
export type NavActiveVariant = "primary" | "nested";

/** nested 模式下频道根路径仅精确匹配「热点」，子路径走前缀匹配。 */
const NESTED_EXACT_ROOT_PATHS = new Set(["/travel", "/convenience"]);

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * 通用路径高亮：`primary` 用于顶栏级前缀；`nested` 下 `/travel`、`/convenience` 根路径精确匹配。
 */
export function navItemIsActive(
  pathname: string,
  href: string,
  variant: NavActiveVariant
): boolean {
  const p = normalizePath(pathname);

  if (variant === "nested" && NESTED_EXACT_ROOT_PATHS.has(href)) {
    return p === href;
  } else if (href === "/") {
    return p === "/" || p === "";
  }

  return p === href || p.startsWith(`${href}/`);
}

/**
 * 含 `/news?type=` 的侧栏条目：列表页按 query 与 `href` 对齐；详情 `/news/slug` 仅「热点」(`/news` 无 query) 高亮。
 */
export function channelEntryIsActive(
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  href: string,
  variant: NavActiveVariant
): boolean {
  const link = parseNewsNavLinkHref(href);
  if (link.kind === "not-news") {
    return navItemIsActive(pathname, href, variant);
  }

  const p = normalizePath(pathname);
  if (!p.startsWith("/news")) return false;

  if (p !== "/news" && p.startsWith("/news/")) {
    return link.kind === "news-hotspot";
  }

  const current = normalizeNewsType(searchParams.get("type") ?? undefined);
  if (link.kind === "news-hotspot") {
    return current === "top";
  }
  return link.channel === current;
}
