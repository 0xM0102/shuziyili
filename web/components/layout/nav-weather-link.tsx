"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { WeatherConditionIcon } from "@/components/weather/weather-icons";
import {
  fetchWeatherByAdcode,
  getWeatherAdcodeServerSnapshot,
  getWeatherAdcodeSnapshot,
  subscribeWeatherAdcode,
  toWeatherNavSnapshot,
} from "@/lib/weather-api";

/** 顶栏天气入口：小图标 + 气温 + 地区（链到天气专页）。 */
export function NavWeatherLink() {
  const pathname = usePathname();
  const adcode = useSyncExternalStore(
    subscribeWeatherAdcode,
    getWeatherAdcodeSnapshot,
    getWeatherAdcodeServerSnapshot
  );
  const [snapshot, setSnapshot] = useState(() => null as ReturnType<typeof toWeatherNavSnapshot>);
  const active = pathname === "/weather" || pathname.startsWith("/weather/");

  useEffect(() => {
    let cancelled = false;
    fetchWeatherByAdcode(adcode).then((data) => {
      if (cancelled) return;
      setSnapshot(toWeatherNavSnapshot(data));
    });
    return () => {
      cancelled = true;
    };
  }, [adcode]);

  const ariaLabel = snapshot
    ? `${snapshot.cityName} ${snapshot.weatherText} ${snapshot.currentTemp}°`
    : "查看天气";

  return (
    <Link
      href="/weather"
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-1.5 transition-colors sm:gap-1.5 sm:px-2 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/85 hover:bg-sidebar-hover hover:text-foreground"
      }`}
    >
      {snapshot ? (
        <>
          <WeatherConditionIcon weatherText={snapshot.weatherText} size={20} className="shrink-0" />
          <span className="text-sm font-semibold tabular-nums leading-none">
            {snapshot.currentTemp}°
          </span>
          <span className="hidden max-w-[4.5rem] truncate text-xs text-muted md:inline">
            {snapshot.cityName}
          </span>
        </>
      ) : (
        <span className="px-1 text-xs text-muted">天气</span>
      )}
    </Link>
  );
}
