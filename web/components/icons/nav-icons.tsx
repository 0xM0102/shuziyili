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
 * - 侧边栏尺寸统一用 `h-[18px] w-[18px] shrink-0`（见 `ChannelSideNav`），避免不同 SVG 自带尺寸导致对不齐。
 * - 大多数图标采用 24x24 线框（`stroke="currentColor"`）以适配主题色；但允许个别入口使用彩色填充 SVG（例如“热点”）。
 * - 无论线框还是填充图标，都要保留 `className/props` 透传，让外层能控制尺寸与可访问性属性。
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
  const { className, ...rest } = props;
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...rest}
    >
      <path
        d="M511.0784 513.28m-458.9056 0a458.9056 458.9056 0 1 0 917.8112 0 458.9056 458.9056 0 1 0-917.8112 0Z"
        fill="#FD9191"
      />
      <path
        d="M644.5056 264.6528A459.1616 459.1616 0 0 0 204.8 855.04a459.0592 459.0592 0 0 0 746.0864-473.088 457.216 457.216 0 0 0-306.3808-117.2992z"
        fill="#FC6060"
      />
      <path
        d="M795.4432 568.576c-8.8576-155.2384-132.1984-300.0832-212.736-349.1328a22.1184 22.1184 0 0 0-32.3072 11.5712c-14.7456 42.1888-43.8784 116.5824-81.2544 168.96-30.4128-20.48-78.2336-51.2-99.7888-63.744a22.1184 22.1184 0 0 0-28.9792 6.4C286.72 418.6112 257.1264 499.3024 257.1264 569.856a269.4656 269.4656 0 0 0 269.2096 269.1584A276.48 276.48 0 0 0 726.7328 752.64a246.0672 246.0672 0 0 0 68.7104-184.064zM419.3792 689.152a22.0672 22.0672 0 0 1-30.72-5.12c-56.32-79.9744-38.2976-158.0544-37.5296-161.3312A22.0672 22.0672 0 0 1 394.24 532.48c-0.6144 2.816-13.568 62.7712 30.72 125.696a22.1184 22.1184 0 0 1-5.5808 30.976z"
        fill="#FC413F"
      />
      <path
        d="M766.464 521.5744c-8.704-151.3984-128.9728-292.6592-207.5136-340.48a21.504 21.504 0 0 0-31.488 11.264c-14.3872 40.96-42.752 113.7152-79.2576 164.8128-29.6448-19.9168-76.2368-50.1248-97.28-62.1568A21.504 21.504 0 0 0 322.56 301.2608c-52.2752 74.0864-81.1008 152.7296-81.1008 221.5424a262.8096 262.8096 0 0 0 262.5024 262.5024A269.824 269.824 0 0 0 699.4432 701.44a240.128 240.128 0 0 0 67.0208-179.8656z m-366.7968 117.76a21.1968 21.1968 0 0 1-12.3392 3.8912 21.504 21.504 0 0 1-17.6128-9.1136c-54.8352-78.0288-37.376-154.112-36.5568-157.3376a21.504 21.504 0 0 1 41.8304 10.24c-0.6144 2.7136-13.2608 61.44 29.9008 122.88a21.4528 21.4528 0 0 1-5.2224 29.2352z"
        fill="#FFFFFF"
      />
      <path
        d="M264.1408 629.3504a262.8608 262.8608 0 0 0 239.8208 155.9552 266.6496 266.6496 0 0 0 57.4976-6.3488A170.0864 170.0864 0 0 0 372.8384 512a170.9568 170.9568 0 0 0 32.0512 97.28 21.4528 21.4528 0 0 1-5.12 29.952 21.1968 21.1968 0 0 1-12.3392 3.8912 21.504 21.504 0 0 1-17.6128-9.1136 214.5792 214.5792 0 0 1-38.5536-100.6592 170.1888 170.1888 0 0 0-67.1232 96z"
        fill="#FFD4D4"
      />
    </svg>
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

