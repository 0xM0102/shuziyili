"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  hotConvenienceNav,
  hotHomeNav,
  hotNewsNav,
  hotTravelNav,
  type NavItem,
} from "@/lib/nav";
import type { NavActiveVariant } from "@/lib/nav-active";
import { ChannelSideNav } from "./channel-side-nav";
import { SectionSubnavMobile } from "./section-subnav-mobile";
import { SiteFooter } from "./site-footer";

type SidebarGroup = { title: string; items: NavItem[] };

type SidebarConfig = {
  variant: NavActiveVariant;
  groups: SidebarGroup[];
  showSidebar: boolean;
};

function hotspotNavItem(href: string): NavItem {
  return { href, label: "热点", icon: "hot" };
}

const GROUP_HOME: SidebarGroup = {
  title: "热点",
  items: [hotspotNavItem("/"), ...hotHomeNav],
};
const GROUP_TRAVEL: SidebarGroup = {
  title: "热点",
  items: [hotspotNavItem("/travel"), ...hotTravelNav],
};
const GROUP_CONVENIENCE: SidebarGroup = {
  title: "热点",
  items: [hotspotNavItem("/convenience"), ...hotConvenienceNav],
};
const GROUP_NEWS: SidebarGroup = {
  title: "热点",
  items: [hotspotNavItem("/news"), ...hotNewsNav],
};

/** 顺序即匹配优先级：先命中先返回。 */
const SIDEBAR_RULES: {
  match: (pathname: string) => boolean;
  variant: NavActiveVariant;
  groups: SidebarGroup[];
}[] = [
  { match: (p) => p === "/" || p.startsWith("/a/"), variant: "primary", groups: [GROUP_HOME] },
  { match: (p) => p.startsWith("/travel"), variant: "nested", groups: [GROUP_TRAVEL] },
  { match: (p) => p.startsWith("/convenience"), variant: "nested", groups: [GROUP_CONVENIENCE] },
  { match: (p) => p.startsWith("/news"), variant: "nested", groups: [GROUP_NEWS] },
];

function getSidebarConfig(pathname: string): SidebarConfig {
  const hit = SIDEBAR_RULES.find((r) => r.match(pathname));
  if (hit) {
    return { variant: hit.variant, groups: hit.groups, showSidebar: true };
  }
  return { variant: "primary", groups: [], showSidebar: false };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cfg = getSidebarConfig(pathname);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  /** 客户端路由切换时主列滚动位置保留在旧页，会导致新页「顶部像被挡住」；回到内容区顶部。 */
  useLayoutEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 items-stretch overflow-hidden">
      {cfg.showSidebar ? (
        <aside
          className="hidden min-h-0 w-56 shrink-0 self-stretch overflow-y-auto overscroll-contain border-r border-border bg-sidebar md:block lg:w-60"
          aria-label="二级菜单"
        >
          <div className="min-h-0">
            {cfg.groups.map((g) => (
              <ChannelSideNav
                key={g.title}
                items={g.items}
                title={g.title}
                variant={cfg.variant}
                embedded
                showTitle={false}
              />
            ))}
          </div>
        </aside>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
        <div
          ref={mainScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {cfg.showSidebar ? (
            <div className="px-4 py-3 md:hidden">
              {cfg.groups.map((g) => (
                <SectionSubnavMobile
                  key={g.title}
                  items={g.items}
                  title={g.title}
                  variant={cfg.variant}
                  showTitle={false}
                />
              ))}
            </div>
          ) : null}
          {children}
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
