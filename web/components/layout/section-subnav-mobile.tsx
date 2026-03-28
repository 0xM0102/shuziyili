"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { navItemIsActive, type NavActiveVariant } from "@/lib/nav-active";

/** 窄屏：与桌面侧栏一致的横向二级入口 */
export function SectionSubnavMobile({
  items,
  title,
  variant,
  showTitle = true,
}: {
  items: NavItem[];
  title: string;
  variant: NavActiveVariant;
  /** 如果热点是选项而非小标题，则传 false 隐藏标题文字 */
  showTitle?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="mb-4 md:hidden">
      {showTitle ? <p className="mb-2 text-xs font-medium text-muted">{title}</p> : null}
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
              navItemIsActive(pathname, item.href, variant)
                ? "bg-primary text-white"
                : "border border-border bg-card text-foreground/85"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
