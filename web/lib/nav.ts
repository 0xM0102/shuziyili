import type { NavIconName } from "@/components/icons/nav-icons";
import {
  NEWS_CHANNEL_LABELS,
  NEWS_JUHE_TYPES,
  buildNewsIndexHref,
  type NewsJuheType,
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

/** 旅游频道侧栏二级 */
export const lvyouNav: NavItem[] = [
  { href: "/travel", label: "概览" },
  { href: "/travel/attractions", label: "景点" },
  { href: "/travel/stay", label: "住宿" },
  { href: "/travel/food", label: "美食" },
  { href: "/travel/transport", label: "交通" },
  { href: "/travel/guide", label: "攻略" },
];

/**
 * 热点（二级分类）——先把侧栏收敛到少数高价值入口
 * 说明：后续当你逐步补齐真实内容，再把完整二级分类替换/扩展回来。
 */
export const hotTravelNav: NavItem[] = [
  { href: "/travel/attractions", label: "景点", icon: "attractions" },
  { href: "/travel/stay", label: "住宿", icon: "stay" },
  { href: "/travel/food", label: "美食", icon: "food" },
  { href: "/travel/guide", label: "攻略", icon: "guide" },
];

/** 便民侧栏二级 */
export const bianminNav: NavItem[] = [
  { href: "/convenience", label: "总览" },
  { href: "/convenience/government", label: "政务便民" },
  { href: "/convenience/health", label: "医疗健康" },
  { href: "/convenience/shipping", label: "快递物流" },
];

/** 便民热点（二级分类） */
export const hotConvenienceNav: NavItem[] = [
  { href: "/convenience/government", label: "政务便民", icon: "government" },
  { href: "/convenience/health", label: "医疗健康", icon: "health" },
  { href: "/convenience/shipping", label: "快递物流", icon: "shipping" },
];

/** 全局默认热点（二级分类） */
export const hotDefaultNav: NavItem[] = hotTravelNav;

/** 首页热点（二级分类） */
export const hotHomeNav: NavItem[] = [
  { href: "/events", label: "活动报名", icon: "event" },
  { href: "/news", label: "本地资讯", icon: "news" },
  { href: "/nomad", label: "数字游民", icon: "nomad" },
  { href: "/convenience", label: "便民黄页", icon: "convenience" },
];

/** 首页其它（二级分类） */
export const homeMoreNav: NavItem[] = [
  { href: "/travel", label: "旅游指南" },
  { href: "/about", label: "关于我们" },
];

/** 资讯频道（Juhe type），不含头条：与侧栏首项「热点」(`/news`) 组合使用。 */
export const hotNewsNav: NavItem[] = (NEWS_JUHE_TYPES.filter((t) => t !== "top") as NewsJuheType[]).map(
  (t) => ({
    href: buildNewsIndexHref(t),
    label: NEWS_CHANNEL_LABELS[t],
  })
);
