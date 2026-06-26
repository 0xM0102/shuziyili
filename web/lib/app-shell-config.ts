import {
  hotConvenienceNav,
  hotHomeNav,
  hotNewsNav,
  hotTravelNav,
  type NavItem,
} from "@/lib/nav";
import type { NavActiveVariant } from "@/lib/nav-active";

export type SidebarGroup = { title: string; items: NavItem[] };

export type SidebarConfig = {
  variant: NavActiveVariant;
  groups: SidebarGroup[];
  showSidebar: boolean;
};

function hotspotNavItem(href: string): NavItem {
  return { href, label: "热点", icon: "hot" };
}

function channelGroup(rootHref: string, items: NavItem[]): SidebarGroup {
  return { title: "热点", items: [hotspotNavItem(rootHref), ...items] };
}

const GROUP_HOME = channelGroup("/", hotHomeNav);
const GROUP_TRAVEL = channelGroup("/travel", hotTravelNav);
const GROUP_CONVENIENCE = channelGroup("/convenience", hotConvenienceNav);
const GROUP_NEWS = channelGroup("/news", hotNewsNav);

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

export function getSidebarConfig(pathname: string): SidebarConfig {
  const hit = SIDEBAR_RULES.find((r) => r.match(pathname));
  if (hit) {
    return { variant: hit.variant, groups: hit.groups, showSidebar: true };
  }
  return { variant: "primary", groups: [], showSidebar: false };
}
