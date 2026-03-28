/** 侧栏 / 移动端二级导航的激活规则 */

export type NavActiveVariant = "primary" | "nested";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * primary：顶栏级，如 /travel 在 /travel/... 下也高亮。
 * nested：栏目内，/travel、/convenience 仅精确匹配，子路径走子项高亮。
 */
export function navItemIsActive(
  pathname: string,
  href: string,
  variant: NavActiveVariant
): boolean {
  const p = normalizePath(pathname);

  if (variant === "nested") {
    if (href === "/travel" || href === "/convenience") {
      return p === href;
    }
  } else {
    if (href === "/") {
      return p === "/" || p === "";
    }
  }

  return p === href || p.startsWith(`${href}/`);
}
