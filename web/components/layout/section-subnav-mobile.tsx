"use client";

import Link from "next/link";
import { Suspense } from "react";
import { type ChannelNavListProps, useChannelEntryActive } from "@/lib/channel-nav";

function SectionSubnavMobileInner({
  items,
  title,
  variant,
  showTitle = true,
}: ChannelNavListProps & { title: string }) {
  const isActive = useChannelEntryActive(variant);

  return (
    <div className="mb-4 md:hidden">
      {showTitle ? <p className="mb-2 text-xs font-medium text-muted">{title}</p> : null}
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                active ? "bg-primary text-white" : "border border-border bg-card text-foreground/85"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** 窄屏：与桌面侧栏条目一致，横向 pills 展示。 */
export function SectionSubnavMobile(props: ChannelNavListProps & { title: string }) {
  return (
    <Suspense fallback={<div className="mb-4 h-10 animate-pulse rounded-md bg-muted md:hidden" aria-hidden />}>
      <SectionSubnavMobileInner {...props} />
    </Suspense>
  );
}
