"use client";

import { usePathname } from "next/navigation";
import {
  hotConvenienceNav,
  hotHomeNav,
  hotTravelNav,
  type NavItem,
} from "@/lib/nav";
import type { NavActiveVariant } from "@/lib/nav-active";
import { ChannelSideNav } from "./channel-side-nav";
import { SectionSubnavMobile } from "./section-subnav-mobile";
import { SiteFooter } from "./site-footer";

type SidebarGroup = {
  title: string;
  items: NavItem[];
};

type SidebarConfig = {
  variant: NavActiveVariant;
  groups: SidebarGroup[];
  showSidebar: boolean;
};

function getSidebarConfig(pathname: string): SidebarConfig {
  // 首页与文章详情：沿用首页热点侧栏，保证左侧二级菜单一致
  if (pathname === "/" || pathname.startsWith("/a/")) {
    return {
      variant: "primary",
      groups: [
        {
          title: "热点",
          items: [{ href: "/", label: "热点", icon: "hot" }, ...hotHomeNav],
        },
      ],
      showSidebar: true,
    };
  }

  // 旅游父级：只显示旅游热点
  if (pathname.startsWith("/travel")) {
    return {
      variant: "nested",
      groups: [
        {
          title: "热点",
          items: [{ href: "/travel", label: "热点", icon: "hot" }, ...hotTravelNav],
        },
      ],
      showSidebar: true,
    };
  }

  // 便民父级：只显示便民热点
  if (pathname.startsWith("/convenience")) {
    return {
      variant: "nested",
      groups: [
        {
          title: "热点",
          items: [
            { href: "/convenience", label: "热点", icon: "hot" },
            ...hotConvenienceNav,
          ],
        },
      ],
      showSidebar: true,
    };
  }

  // 其他一级页面：侧边栏先留空（不展示）
  return {
    variant: "primary",
    groups: [],
    showSidebar: false,
  };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cfg = getSidebarConfig(pathname);

  // 顶栏高度已统一为 64px（h-16）。RootLayout 中 main 已是 flex-1 + min-h-0，
  // 这里使用 h-full/min-h-0，保证侧栏与右侧内容列以“内部滚动”方式工作，不随 body 一起滚动。
  return (
    <div className="flex min-h-0 h-full w-full min-w-0 flex-1 items-stretch overflow-hidden">
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

      {/* 主列：独立滚动；页脚跟随在内容末尾（不固定置底）。 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
