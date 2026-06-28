import type { ReactNode } from "react";
import {
  standaloneContentCardClassName,
  standaloneSideCardClassName,
} from "@/lib/page-layout";
import { WeatherSectionTitle } from "@/components/weather/weather-section-title";

type WeatherPanelProps = {
  title: string;
  titleId?: string;
  subtitle?: string;
  /** 侧栏卡片使用与关于页一致的更大内边距 */
  variant?: "main" | "side";
  children: ReactNode;
  className?: string;
};

/** 天气专页区块容器（对齐关于页卡片与标题样式）。 */
export function WeatherPanel({
  title,
  titleId,
  subtitle,
  variant = "main",
  children,
  className,
}: WeatherPanelProps) {
  const sectionClass = [
    variant === "side" ? standaloneSideCardClassName : standaloneContentCardClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`${sectionClass} min-w-0`} {...(titleId ? { "aria-labelledby": titleId } : {})}>
      <WeatherSectionTitle id={titleId}>{title}</WeatherSectionTitle>
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
      {children}
    </section>
  );
}
