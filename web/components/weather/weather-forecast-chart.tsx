import type { ForecastChartGeometry } from "@/lib/weather/forecast-chart";
import { FORECAST_CHART_HEIGHT } from "@/lib/weather/forecast-chart";

type WeatherForecastChartProps = {
  geometry: ForecastChartGeometry;
};

export function WeatherForecastChart({ geometry }: WeatherForecastChartProps) {
  return (
    <svg
      viewBox={`0 0 ${geometry.chartWidth} ${FORECAST_CHART_HEIGHT}`}
      className="mt-1 w-full text-orange-500"
      aria-hidden
    >
      <path
        d={geometry.hiPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {geometry.hiPoints.map((p, i) => (
        <circle key={`hi-${i}`} cx={p.x} cy={p.y} r="3" fill="currentColor" />
      ))}
      <path
        d={geometry.loPath}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {geometry.loPoints.map((p, i) => (
        <circle key={`lo-${i}`} cx={p.x} cy={p.y} r="3" fill="#38bdf8" />
      ))}
    </svg>
  );
}
