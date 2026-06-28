"use client";

import { WeatherConditionIcon } from "@/components/weather/weather-icons";
import { WeatherHorizontalScroll } from "@/components/weather/weather-horizontal-scroll";
import { WeatherPanel } from "@/components/weather/weather-panel";
import { WeatherPanelEmpty } from "@/components/weather/weather-panel-empty";
import type { WeatherHourly } from "@/lib/weather/types";

type WeatherHourlyStripProps = {
  hourly: WeatherHourly[];
};

export function WeatherHourlyStrip({ hourly }: WeatherHourlyStripProps) {
  const isEmpty = hourly.length === 0;

  return (
    <WeatherPanel title="逐小时预报" titleId={isEmpty ? undefined : "hourly-forecast"}>
      {isEmpty ? (
        <WeatherPanelEmpty />
      ) : (
        <WeatherHorizontalScroll className="mt-4">
          <div className="flex min-w-max gap-2">
            {hourly.map((h, index) => (
              <div
                key={`${h.time}-${index}`}
                className="flex w-[4.25rem] flex-col items-center rounded-xl border border-border/80 bg-background px-2 py-3 text-center"
              >
                <span className="text-xs text-muted">{h.time}</span>
                <WeatherConditionIcon weatherText={h.weatherText} size={32} className="mt-2" />
                <span className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                  {h.temp}°
                </span>
              </div>
            ))}
          </div>
        </WeatherHorizontalScroll>
      )}
    </WeatherPanel>
  );
}
