import type { WeatherIconKey } from "@/lib/weather/types";

/** 将中国天气网文案映射到本地 3D 图标（public/images/weather）。 */
export function weatherIconKey(text: string): WeatherIconKey {
  const t = text.trim();
  if (!t) return "partly-cloudy";
  if (t.includes("冰雹")) return "hail";
  if (t.includes("冻雨")) return "freezing-rain";
  if (t.includes("雨夹雪")) return "sleet";
  if (t.includes("雷")) return "thunderstorm";
  if (t.includes("龙卷")) return "tornado";
  if (t.includes("浮尘") || t.includes("扬沙") || t.includes("沙尘")) return "dust";
  if (t.includes("彩虹")) return "rainbow";
  if (t.includes("暴雪") || t.includes("大雪")) return "snow-heavy";
  if (t.includes("雪")) return "snow-light";
  if (t.includes("暴雨") || t.includes("大雨")) return "rain-heavy";
  if (t.includes("小雨") || t.includes("阵雨")) return "rain-light";
  if (t.includes("雨")) {
    return t.includes("阴") ? "rain-overcast" : "rain";
  }
  if (t.includes("霾")) return "haze";
  if (t.includes("雾")) return "fog";
  if (t.includes("风")) return "breeze";
  if (t.includes("阴")) return "overcast";
  if (t.includes("多云")) return "partly-cloudy";
  if (t.includes("云")) return "cloudy";
  if (t.includes("晴")) return "sunny";
  return "partly-cloudy";
}

export function weatherIconSrc(text: string): string {
  return `/images/weather/${weatherIconKey(text)}.webp`;
}
