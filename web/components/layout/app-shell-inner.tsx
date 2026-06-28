"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSidebarConfig, type SidebarGroup } from "@/lib/app-shell-config";
import type { NavActiveVariant } from "@/lib/nav-active";
import { appFrameClassName } from "@/lib/page-layout";
import { ChannelSideNav } from "./channel-side-nav";
import { SectionSubnavMobile } from "./section-subnav-mobile";
import { SiteFooter } from "./site-footer";

type Props = {
  children: React.ReactNode;
  /** 来自 `useSearchParams`；仅 pathname 不变时（如资讯频道 query）也要回到内容区顶部。 */
  searchKey: string;
};

function SidebarGroups({
  groups,
  variant,
  placement,
}: {
  groups: SidebarGroup[];
  variant: NavActiveVariant;
  placement: "desktop" | "mobile";
}) {
  return groups.map((group) => {
    const groupKey = group.items[0]?.href ?? group.title;

    if (placement === "desktop") {
      return (
        <ChannelSideNav
          key={groupKey}
          items={group.items}
          title={group.title}
          variant={variant}
          embedded
          showTitle={false}
        />
      );
    }

    return (
      <SectionSubnavMobile
        key={groupKey}
        items={group.items}
        title={group.title}
        variant={variant}
        showTitle={false}
      />
    );
  });
}

export function AppShellInner({ children, searchKey }: Props) {
  const pathname = usePathname();
  const sidebar = getSidebarConfig(pathname);
  const showSidebar = sidebar.groups.length > 0;
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    const resetScroll = () => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    };

    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, searchKey]);

  return (
    <div
      className={`${appFrameClassName} flex h-full min-h-0 min-w-0 flex-1 items-stretch overflow-hidden`}
    >
      {showSidebar ? (
        <aside
          className="hidden min-h-0 w-56 shrink-0 self-stretch overflow-y-auto overscroll-contain border-r border-border bg-sidebar md:block lg:w-60"
          aria-label="二级菜单"
        >
          <div className="min-h-0">
            <SidebarGroups
              groups={sidebar.groups}
              variant={sidebar.variant}
              placement="desktop"
            />
          </div>
        </aside>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
        <div ref={mainScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {showSidebar ? (
            <div className="px-4 py-3 md:hidden">
              <SidebarGroups
                groups={sidebar.groups}
                variant={sidebar.variant}
                placement="mobile"
              />
            </div>
          ) : null}
          {children}
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
