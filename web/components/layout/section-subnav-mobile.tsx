"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { channelEntryIsActive, type NavActiveVariant } from "@/lib/nav-active";

function SectionSubnavMobileInner({
  items,
  title,
  variant,
  showTitle = true,
}: {
  items: NavItem[];
  title: string;
  variant: NavActiveVariant;
  showTitle?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="mb-4 md:hidden">
      {showTitle ? <p className="mb-2 text-xs font-medium text-muted">{title}</p> : null}
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
              channelEntryIsActive(pathname, searchParams, item.href, variant)
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

/** 窄屏：与桌面侧栏一致的横向二级入口 */
export function SectionSubnavMobile(props: {
  items: NavItem[];
  title: string;
  variant: NavActiveVariant;
  showTitle?: boolean;
}) {
  return (
    <Suspense fallback={<div className="mb-4 h-10 animate-pulse rounded-md bg-muted md:hidden" aria-hidden />}>
      <SectionSubnavMobileInner {...props} />
    </Suspense>
  );
}
