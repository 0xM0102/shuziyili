import type { WeatherForecastDay } from "@/lib/weather/types";

export function lifeIndexEmoji(key: string): string {
  switch (key) {
    case "clothes":
      return "👕";
    case "umbrella":
      return "🌧️";
    case "cold":
    case "chill":
      return "🤧";
    case "sports":
      return "🏃";
    case "carwash":
      return "🚗";
    case "tourism":
      return "🧳";
    case "comfort":
      return "🌡️";
    case "ultraviolet":
    case "sunscreen":
      return "☀️";
    case "morning":
      return "🌅";
    case "makeup":
      return "💄";
    case "drying":
      return "👔";
    case "fish":
      return "🎣";
    case "diffusion":
    case "air":
      return "💨";
    case "traffic":
    case "dry":
      return "🛣️";
    case "sunglasses":
      return "🕶️";
    case "allergy":
      return "🌿";
    case "airconditioner":
      return "❄️";
    case "mood":
      return "😊";
    case "heatstroke":
      return "🥵";
    default:
      return "📋";
  }
}

export function formatForecastDate(date: string): string {
  const parts = date.split("-");
  if (parts.length === 3) {
    return `${parts[1]}月${parts[2]}日`;
  }
  return date;
}

/** 上海时区日历日期，格式 YYYY-MM-DD。 */
export function shanghaiCalendarDate(offsetDays = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Date.now() + offsetDays * 86400000));
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

export function isYesterdayInShanghai(date: string): boolean {
  return date === shanghaiCalendarDate(-1);
}

/** 结合日期生成「昨天 / 今天 / 明天」等标签。 */
export function formatForecastDayLabel(date: string): string {
  if (date === shanghaiCalendarDate(-1)) return "昨天";
  if (date === shanghaiCalendarDate(0)) return "今天";
  if (date === shanghaiCalendarDate(1)) return "明天";
  if (date === shanghaiCalendarDate(2)) return "后天";
  return formatForecastDate(date);
}

export function forecastDayLabel(date: string, index: number): string {
  const labels = ["今天", "明天", "后天"];
  if (index < labels.length) return labels[index];
  return date;
}

/** 今日预报气温区间，用于实况 hero。 */
export function formatTodayForecastRange(
  forecast: WeatherForecastDay[] | undefined
): string | null {
  const today = forecast?.[0];
  if (!today) return null;
  return `${today.lo}° ~ ${today.hi}°`;
}
