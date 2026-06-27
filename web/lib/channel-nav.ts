"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { channelEntryIsActive, type NavActiveVariant } from "@/lib/nav-active";

/** 频道侧栏与窄屏横滑子导航的共用 props（`ChannelSideNav` / `SectionSubnavMobile`）。 */
export type ChannelNavListProps = {
  items: NavItem[];
  title?: string;
  variant: NavActiveVariant;
  showTitle?: boolean;
};

/**
 * 基于当前 pathname 与 searchParams 判断侧栏条目是否高亮。
 * 资讯频道 query（`?type=`）由 `channelEntryIsActive` 统一处理。
 */
export function useChannelEntryActive(variant: NavActiveVariant) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (href: string) => channelEntryIsActive(pathname, searchParams, href, variant);
}
