"use client";

import { WeatherLocateIcon } from "@/components/weather/weather-icons";
import { WEATHER_FIELD_HEIGHT_CLASS } from "@/lib/weather/ui";

type WeatherLocateButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  locating?: boolean;
  variant?: "icon" | "text";
  className?: string;
  iconClassName?: string;
};

export function WeatherLocateButton({
  onClick,
  disabled = false,
  locating = false,
  variant = "icon",
  className,
  iconClassName,
}: WeatherLocateButtonProps) {
  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={
          className ??
          "rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-sidebar-hover disabled:opacity-60"
        }
      >
        {locating ? "定位中…" : "当前定位"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={locating ? "定位中" : "定位当前城市"}
      className={
        className ??
        `flex ${WEATHER_FIELD_HEIGHT_CLASS} w-[38px] shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/40 hover:bg-sidebar-hover disabled:opacity-60`
      }
    >
      <WeatherLocateIcon className={iconClassName ?? "h-[18px] w-[18px]"} />
    </button>
  );
}
