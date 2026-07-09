import type { NavIconName } from "@/components/icons/nav-icons";
import {
  buildConvenienceCategoryHref,
  convenienceCategories,
} from "@/lib/convenience-data";
import {
  NEWS_CHANNEL_LABELS,
  NEWS_CHANNEL_TYPES,
  buildNewsIndexHref,
  type NewsChannelType,
} from "@/lib/news-channels";

export type NavItem = { href: string; label: string; icon?: NavIconName };

/** 顶栏一级导航 */
export const primaryNav: NavItem[] = [
  { href: "/", label: "首页" },
  { href: "/travel", label: "旅游" },
  { href: "/convenience", label: "便民" },
  { href: "/nomad", label: "数字游民" },
  { href: "/events", label: "活动" },
  { href: "/news", label: "资讯" },
  { href: "/about", label: "关于" },
];

/** 旅游频道二级导航（AppShell 侧栏 / 窄屏横滑子导航） */
export const hotTravelNav: NavItem[] = [
  { href: "/travel/attractions", label: "景点", icon: "attractions" },
  { href: "/travel/stay", label: "住宿", icon: "stay" },
  { href: "/travel/food", label: "美食", icon: "food" },
  { href: "/travel/guide", label: "攻略", icon: "guide" },
];

/** 便民频道二级导航（分类来自静态 seed，运行时页面可读 API） */
export const hotConvenienceNav: NavItem[] = convenienceCategories.map((item) => ({
  href: buildConvenienceCategoryHref(item.slug),
  label: item.title,
  icon: item.icon,
}));

/** 首页侧栏快捷入口（与顶栏一级菜单互补） */
export const hotHomeNav: NavItem[] = [
  { href: "/events", label: "活动报名", icon: "event" },
  { href: "/news", label: "本地资讯", icon: "news" },
  { href: "/nomad", label: "数字游民", icon: "nomad" },
  { href: "/convenience", label: "便民黄页", icon: "convenience" },
];

/** 资讯频道二级导航；侧栏首项「热点」(`/news`) 由 app-shell-config 注入。 */
export const hotNewsNav: NavItem[] = (
  NEWS_CHANNEL_TYPES.filter((t) => t !== "top") as NewsChannelType[]
).map((channelType) => ({
  href: buildNewsIndexHref(channelType),
  label: NEWS_CHANNEL_LABELS[channelType],
}));
