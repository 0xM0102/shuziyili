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
};

const CHANNEL_HOTSPOT = { label: "热点", icon: "hot" as const };

const EMPTY_SIDEBAR: SidebarConfig = { variant: "primary", groups: [] };

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function buildChannelSidebarGroup(channelRoot: string, entries: NavItem[]): SidebarGroup {
  return {
    title: CHANNEL_HOTSPOT.label,
    items: [{ href: channelRoot, label: CHANNEL_HOTSPOT.label, icon: CHANNEL_HOTSPOT.icon }, ...entries],
  };
}

function channelSidebar(
  variant: NavActiveVariant,
  channelRoot: string,
  entries: NavItem[]
): SidebarConfig {
  return { variant, groups: [buildChannelSidebarGroup(channelRoot, entries)] };
}

type SidebarRule = {
  match: (pathname: string) => boolean;
  variant: NavActiveVariant;
  root: string;
  entries: NavItem[];
};

/** 顺序即匹配优先级：先命中先返回。 */
const SIDEBAR_RULES: SidebarRule[] = [
  {
    match: (pathname) => pathname === "/" || pathname.startsWith("/a/"),
    variant: "primary",
    root: "/",
    entries: hotHomeNav,
  },
  {
    match: (pathname) => matchesPathPrefix(pathname, "/travel"),
    variant: "nested",
    root: "/travel",
    entries: hotTravelNav,
  },
  {
    match: (pathname) => matchesPathPrefix(pathname, "/convenience"),
    variant: "nested",
    root: "/convenience",
    entries: hotConvenienceNav,
  },
  {
    match: (pathname) => matchesPathPrefix(pathname, "/news"),
    variant: "nested",
    root: "/news",
    entries: hotNewsNav,
  },
];

export function getSidebarConfig(pathname: string): SidebarConfig {
  const rule = SIDEBAR_RULES.find((entry) => entry.match(pathname));
  return rule ? channelSidebar(rule.variant, rule.root, rule.entries) : EMPTY_SIDEBAR;
}
