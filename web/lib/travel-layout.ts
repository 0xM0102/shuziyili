import {
  sidebarContentPageClassName,
  sidebarReadableClassName,
} from "@/lib/page-layout";

/** 旅游频道子页：占满 AppShell 主栏（与便民、资讯一致）。 */
export const travelChannelPageClassName = sidebarContentPageClassName;

/** 子页引言/标题区可读宽度；地图与卡片列表应放在此容器外以保持全宽。 */
export const travelChannelProseClassName = sidebarReadableClassName;
