"use client";

import { useEffect, useRef, useState } from "react";
import { WeatherConditionIcon } from "@/components/weather/weather-icons";
import { WeatherForecastChart } from "@/components/weather/weather-forecast-chart";
import { WeatherPanel } from "@/components/weather/weather-panel";
import { WeatherPanelEmpty } from "@/components/weather/weather-panel-empty";
import {
  formatForecastDate,
  formatForecastDayLabel,
  isYesterdayInShanghai,
  type WeatherForecastDay,
} from "@/lib/weather-api";
import {
  buildForecastChartGeometry,
  minForecastScrollWidth,
} from "@/lib/weather/forecast-chart";

type WeatherForecastWeekProps = {
  forecast: WeatherForecastDay[];
};

function highlightCellClass(highlight: boolean, edge: "top" | "bottom") {
  if (!highlight) return "";
  return edge === "top" ? "rounded-t-lg bg-primary/5" : "rounded-b-lg bg-primary/5";
}

function ForecastDayHeader({ day }: { day: WeatherForecastDay }) {
  const highlight = isYesterdayInShanghai(day.date);
  return (
    <div className={`px-1 py-2 text-center ${highlightCellClass(highlight, "top")}`}>
      <p className="text-sm font-medium text-foreground">{formatForecastDayLabel(day.date)}</p>
      <p className="text-xs text-muted">{formatForecastDate(day.date)}</p>
      <WeatherConditionIcon weatherText={day.weatherText} size={36} className="mx-auto mt-2" />
      <p className="mt-1 line-clamp-1 text-xs text-muted">{day.weatherText}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-orange-500">{day.hi}°</p>
    </div>
  );
}

function ForecastDayFooter({ day }: { day: WeatherForecastDay }) {
  const highlight = isYesterdayInShanghai(day.date);
  const nightText = day.nightWeatherText || day.weatherText;
  return (
    <div className={`px-1 py-2 text-center ${highlightCellClass(highlight, "bottom")}`}>
      <p className="text-sm font-semibold tabular-nums text-sky-500">{day.lo}°</p>
      <WeatherConditionIcon weatherText={nightText} size={28} className="mx-auto mt-1" />
      <p className="mt-1 line-clamp-1 text-xs text-muted">{nightText}</p>
      {day.windText ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted">{day.windText}</p>
      ) : null}
    </div>
  );
}

function useForecastChartWidth(dayCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(Math.max(dayCount * 72, 360));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const syncWidth = () => {
      setChartWidth(Math.max(el.clientWidth, dayCount * 72, 360));
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [dayCount]);

  return { containerRef, chartWidth };
}

export function WeatherForecastWeek({ forecast }: WeatherForecastWeekProps) {
  const { containerRef, chartWidth } = useForecastChartWidth(Math.max(forecast.length, 1));

  if (forecast.length === 0) {
    return (
      <WeatherPanel title="7日天气预报" titleId="week-forecast">
        <WeatherPanelEmpty />
      </WeatherPanel>
    );
  }
  const geometry = buildForecastChartGeometry(forecast, chartWidth);
  const columnStyle = {
    gridTemplateColumns: `repeat(${forecast.length}, minmax(4.5rem, 1fr))`,
  };

  return (
    <WeatherPanel title="7日天气预报" titleId="week-forecast">
      <div className="mt-4 overflow-x-auto sm:overflow-visible [-webkit-overflow-scrolling:touch]">
        <div
          ref={containerRef}
          className="w-full sm:min-w-0"
          style={{ minWidth: minForecastScrollWidth(forecast.length) }}
        >
          <div className="grid gap-0 sm:min-w-0" style={columnStyle}>
            {forecast.map((day) => <ForecastDayHeader key={day.date} day={day} />)}
          </div>
          <WeatherForecastChart geometry={geometry} />
          <div className="grid gap-0 sm:min-w-0" style={columnStyle}>
            {forecast.map((day) => <ForecastDayFooter key={`${day.date}-foot`} day={day} />)}
          </div>
        </div>
      </div>
    </WeatherPanel>
  );
}
