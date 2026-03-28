"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { navItemIsActive, type NavActiveVariant } from "@/lib/nav-active";
import { navIcons } from "@/components/icons/nav-icons";

export function ChannelSideNav({
  items,
  title,
  variant,
  embedded,
  showTitle = true,
}: {
  items: NavItem[];
  title?: string;
  variant: NavActiveVariant;
  /** 全高侧栏内：去掉卡片圆角边框，贴近 Bee 侧栏 */
  embedded?: boolean;
  /** 是否在列表上方显示小标题（例如“热点”）；如果“热点本身是选项”，应传 false */
  showTitle?: boolean;
}) {
  const pathname = usePathname();

  const shell = embedded ? "" : "bg-sidebar p-3 md:p-4";

  return (
    <nav className={shell} aria-label={title ?? "二级菜单"}>
      {showTitle && title ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      ) : null}
      <ul className="space-y-1">
        {items.map((item) => {
          const active = navItemIsActive(pathname, item.href, variant);
          const Icon = item.icon ? navIcons[item.icon] : null;
          /**
           * 侧栏条目视觉约定：
           * - 图标固定 18px，避免不同 SVG 自带尺寸导致对不齐或“忽大忽小”
           * - active 用品牌蓝点缀（背景淡蓝 + 文字蓝），保持白底风格更克制
           * - 交互：hover 背景变化；active 左侧蓝色标线 + 右侧箭头
           * - 颜色：icon 与箭头始终蓝色（primary），文字走灰阶/active 蓝
           */
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group relative flex items-center gap-2 px-3 py-3 text-[15px] font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/85 hover:bg-sidebar-hover hover:text-foreground"
                }`}
              >
                {active ? (
                  <span
                    className="absolute left-0 top-0 h-full w-0.5 bg-primary"
                    aria-hidden
                  />
                ) : null}
                {Icon ? (
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      "text-primary"
                    }`}
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {active ? (
                  <span className="ml-2 shrink-0 text-primary" aria-hidden>
                    ›
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
