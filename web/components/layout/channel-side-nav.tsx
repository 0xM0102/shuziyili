"use client";

import Link from "next/link";
import { Suspense } from "react";
import { type ChannelNavListProps, useChannelEntryActive } from "@/lib/channel-nav";
import { navIcons } from "@/components/icons/nav-icons";

type NavShellProps = {
  embedded?: boolean;
  title?: string;
  showTitle?: boolean;
  children: React.ReactNode;
};

function NavShell({ embedded, title, showTitle, children }: NavShellProps) {
  const shell = embedded ? "" : "bg-sidebar p-3 md:p-4";
  return (
    <nav className={shell} aria-label={title ?? "二级菜单"}>
      {showTitle && title ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      ) : null}
      {children}
    </nav>
  );
}

function ChannelSideNavInner({
  items,
  title,
  variant,
  embedded,
  showTitle = true,
}: ChannelNavListProps & { embedded?: boolean }) {
  const isActive = useChannelEntryActive(variant);

  return (
    <NavShell embedded={embedded} title={title} showTitle={showTitle}>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon ? navIcons[item.icon] : null;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group relative flex items-center gap-2 px-3 py-3 text-[15px] font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/85 hover:bg-sidebar-hover hover:text-foreground"
                }`}
              >
                {active ? (
                  <span className="absolute left-0 top-0 h-full w-0.5 bg-primary" aria-hidden />
                ) : null}
                {Icon ? <Icon className="h-[18px] w-[18px] shrink-0 text-primary" /> : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {active ? (
                  <span className="ml-2 shrink-0 text-primary" aria-hidden>
                    ›
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </NavShell>
  );
}

function ChannelSideNavFallback({ title, embedded, showTitle }: Omit<NavShellProps, "children">) {
  return (
    <NavShell embedded={embedded} title={title} showTitle={showTitle}>
      <div className="h-32 animate-pulse rounded-md bg-sidebar-hover/40" aria-hidden />
    </NavShell>
  );
}

export function ChannelSideNav({
  items,
  title,
  variant,
  embedded,
  showTitle = true,
}: ChannelNavListProps & { embedded?: boolean }) {
  return (
    <Suspense
      fallback={
        <ChannelSideNavFallback title={title} embedded={embedded} showTitle={showTitle} />
      }
    >
      <ChannelSideNavInner
        items={items}
        title={title}
        variant={variant}
        embedded={embedded}
        showTitle={showTitle}
      />
    </Suspense>
  );
}
