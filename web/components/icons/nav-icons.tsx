"use client";

import type { ComponentProps, ReactElement } from "react";

export type NavIconName =
  | "hot"
  | "event"
  | "news"
  | "nomad"
  | "convenience"
  | "travel"
  | "attractions"
  | "stay"
  | "food"
  | "guide"
  | "government"
  | "health"
  | "shipping";

type IconProps = ComponentProps<"svg">;

/**
 * 导航图标约定：
 * - 统一 `viewBox=24`，使用 `stroke="currentColor"`，由外层 class 控制颜色（适配主题/hover/active）。
 * - 统一线宽 `strokeWidth=1.8`，确保在 18px 尺寸下清晰且不显粗糙。
 * - 侧边栏统一用 `h-[18px] w-[18px] shrink-0`（见 `ChannelSideNav`），后续你替换 path 也不会破坏对齐与密度。
 */
function IconBase(props: IconProps) {
  const { className, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    />
  );
}

export function HotIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2c2.5 3 4.5 6 4.5 9.2A4.5 4.5 0 0 1 12 15.7a4.5 4.5 0 0 1-4.5-4.5C7.5 8 9.5 5 12 2Z" />
      <path d="M9.8 14.2A3.2 3.2 0 0 0 12 22a3.2 3.2 0 0 0 2.2-7.8c-.2 1.4-1.2 2.3-2.2 2.3s-2-.9-2.2-2.3Z" />
    </IconBase>
  );
}

export function EventIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3v3M17 3v3" />
      <path d="M4.5 7.5h15" />
      <path d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 12h3M8 16h6" />
    </IconBase>
  );
}

export function NewsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 8h7" />
      <path d="M8 12h7" />
      <path d="M8 16h4" />
    </IconBase>
  );
}

export function NomadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19l6-8 4 5 3-4 3 7H4Z" />
      <path d="M10 11l2-7 2 7" />
      <path d="M12 4h0" />
    </IconBase>
  );
}

export function ConvenienceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10h16" />
      <path d="M6 10v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M10 14h4" />
    </IconBase>
  );
}

export function TravelIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2l3 8 7 2-7 2-3 8-3-8-7-2 7-2 3-8Z" />
    </IconBase>
  );
}

export function AttractionsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h16" />
      <path d="M6 20V9l6-4 6 4v11" />
      <path d="M10 20v-6h4v6" />
    </IconBase>
  );
}

export function StayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 11h14" />
      <path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      <path d="M6 20v-5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
      <path d="M8.5 9h0M15.5 9h0" />
    </IconBase>
  );
}

export function FoodIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3v7" />
      <path d="M9.5 3v7" />
      <path d="M7 10c0 5 0 10 0 10" />
      <path d="M9.5 10c0 5 0 10 0 10" />
      <path d="M14 3v10" />
      <path d="M18 3v10a4 4 0 0 1-4 4" />
      <path d="M14 17v3" />
    </IconBase>
  );
}

export function GuideIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 4h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </IconBase>
  );
}

export function GovernmentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9h16" />
      <path d="M6 9V7l6-3 6 3v2" />
      <path d="M6 9v9M10 9v9M14 9v9M18 9v9" />
      <path d="M5 18h14" />
      <path d="M4 21h16" />
    </IconBase>
  );
}

export function HealthIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-7-4.5-9-9.5C1.5 7.5 4 5 6.8 5c1.6 0 3.1.8 3.9 2 0 0 .8 1 1.3 1.7.5-.7 1.3-1.7 1.3-1.7 0 0 1.6-2 4-2C20 5 22.5 7.5 21 11.5c-2 5-9 9.5-9 9.5Z" />
      <path d="M9.5 12h5" />
      <path d="M12 9.5v5" />
    </IconBase>
  );
}

export function ShippingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <path d="M7 17a2 2 0 1 0 0 .01" />
      <path d="M18 17a2 2 0 1 0 0 .01" />
    </IconBase>
  );
}

/** 图标表：`NavItem.icon` 存 key，渲染时从这里取组件，便于统一替换与管理。 */
export const navIcons: Record<NavIconName, (p: IconProps) => ReactElement> = {
  hot: HotIcon,
  event: EventIcon,
  news: NewsIcon,
  nomad: NomadIcon,
  convenience: ConvenienceIcon,
  travel: TravelIcon,
  attractions: AttractionsIcon,
  stay: StayIcon,
  food: FoodIcon,
  guide: GuideIcon,
  government: GovernmentIcon,
  health: HealthIcon,
  shipping: ShippingIcon,
};

