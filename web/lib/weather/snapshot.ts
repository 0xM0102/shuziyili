import type { WeatherPayload } from "@/lib/weather/types";

export type WeatherNavSnapshot = {
  cityName: string;
  currentTemp: number;
  weatherText: string;
};

/** 无实况文案、温度为 0 且无预报时视为空数据。 */
export function isWeatherPayloadEmpty(data: WeatherPayload): boolean {
  return !data.weatherText && data.currentTemp === 0 && data.forecast.length === 0;
}

/** 顶栏天气入口展示用快照。 */
export function toWeatherNavSnapshot(data: WeatherPayload | null): WeatherNavSnapshot | null {
  if (!data?.upstreamConfigured) return null;
  if (isWeatherPayloadEmpty(data)) return null;
  return {
    cityName: data.cityName,
    currentTemp: data.currentTemp,
    weatherText: data.weatherText,
  };
}
