import { DEFAULT_WEATHER_ADCODE, WEATHER_ADCODE_PATTERN } from "@/lib/weather/constants";

const WEATHER_STORAGE_KEY = "shuziyili-weather-adcode";

let adcodeListeners: Array<() => void> = [];

function notifyWeatherAdcodeChange() {
  adcodeListeners.forEach((listener) => listener());
}

export function isWeatherAdcode(value: string): boolean {
  return WEATHER_ADCODE_PATTERN.test(value);
}

export function getStoredWeatherAdcode(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(WEATHER_STORAGE_KEY);
  return raw && isWeatherAdcode(raw) ? raw : null;
}

/** 无本地记录时默认伊犁（伊宁市）；有记录则沿用上次选城或定位结果。 */
export function resolveInitialWeatherAdcode(): string {
  return getStoredWeatherAdcode() ?? DEFAULT_WEATHER_ADCODE;
}

export function getWeatherAdcodeSnapshot(): string {
  return resolveInitialWeatherAdcode();
}

export function getWeatherAdcodeServerSnapshot(): string {
  return DEFAULT_WEATHER_ADCODE;
}

export function subscribeWeatherAdcode(listener: () => void): () => void {
  adcodeListeners.push(listener);
  return () => {
    adcodeListeners = adcodeListeners.filter((item) => item !== listener);
  };
}

export function storeWeatherAdcode(adcode: string): void {
  if (typeof window === "undefined" || !isWeatherAdcode(adcode)) return;
  localStorage.setItem(WEATHER_STORAGE_KEY, adcode);
  notifyWeatherAdcodeChange();
}
