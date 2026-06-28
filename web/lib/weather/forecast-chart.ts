import type { WeatherForecastDay } from "@/lib/weather/types";

export const FORECAST_CHART_HEIGHT = 72;
export const FORECAST_CHART_PAD_X = 24;
export const FORECAST_MOBILE_COLUMN_REM = 4.5;

export type ForecastChartGeometry = {
  chartWidth: number;
  hiPoints: Array<{ x: number; y: number }>;
  loPoints: Array<{ x: number; y: number }>;
  hiPath: string;
  loPath: string;
};

/** 按容器宽度生成 7 日高低温折线路径。 */
export function buildForecastChartGeometry(
  days: WeatherForecastDay[],
  chartWidth: number
): ForecastChartGeometry {
  const padY = 14;
  const minLo = Math.min(...days.map((d) => d.lo));
  const maxHi = Math.max(...days.map((d) => d.hi));
  const span = Math.max(maxHi - minLo, 1);
  const step =
    days.length > 1
      ? (chartWidth - FORECAST_CHART_PAD_X * 2) / (days.length - 1)
      : 0;

  const hiPoints = days.map((day, index) => {
    const x = FORECAST_CHART_PAD_X + step * index;
    const y = padY + ((maxHi - day.hi) / span) * (FORECAST_CHART_HEIGHT - padY * 2);
    return { x, y };
  });
  const loPoints = days.map((day, index) => {
    const x = FORECAST_CHART_PAD_X + step * index;
    const y = padY + ((maxHi - day.lo) / span) * (FORECAST_CHART_HEIGHT - padY * 2);
    return { x, y };
  });

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return {
    chartWidth,
    hiPoints,
    loPoints,
    hiPath: toPath(hiPoints),
    loPath: toPath(loPoints),
  };
}

export function minForecastScrollWidth(dayCount: number): string {
  return `${dayCount * FORECAST_MOBILE_COLUMN_REM}rem`;
}
