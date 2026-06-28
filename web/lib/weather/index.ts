export {
  DEFAULT_WEATHER_ADCODE,
  GEOLOCATION_OPTIONS,
  WEATHER_ADCODE_PATTERN,
} from "@/lib/weather/constants";

export type {
  WeatherForecastDay,
  WeatherHourly,
  WeatherIconKey,
  WeatherLifeIndex,
  WeatherPayload,
  WeatherRegion,
} from "@/lib/weather/types";

export {
  fetchWeatherByAdcode,
  fetchWeatherByLocation,
  fetchWeatherNearby,
  fetchWeatherMeta,
  fetchWeatherRegions,
} from "@/lib/weather/api";

export {
  getStoredWeatherAdcode,
  getWeatherAdcodeServerSnapshot,
  getWeatherAdcodeSnapshot,
  isWeatherAdcode,
  resolveInitialWeatherAdcode,
  storeWeatherAdcode,
  subscribeWeatherAdcode,
} from "@/lib/weather/storage";

export { weatherIconKey, weatherIconSrc } from "@/lib/weather/icon-map";

export {
  forecastDayLabel,
  formatForecastDate,
  formatForecastDayLabel,
  formatTodayForecastRange,
  isYesterdayInShanghai,
  lifeIndexEmoji,
  shanghaiCalendarDate,
} from "@/lib/weather/format";

export {
  isGeolocationSupported,
  requestCurrentPosition,
} from "@/lib/weather/geolocation";

export { PRIMARY_LIFE_INDEX_KEYS, sortLifeIndices } from "@/lib/weather/life-index";

export {
  WEATHER_FIELD_HEIGHT_CLASS,
  weatherCityChipActiveClassName,
  weatherCityChipIdleClassName,
  weatherSideLinkClassName,
} from "@/lib/weather/ui";

export { YILI_WEATHER_REGIONS, yiliWeatherRegions } from "@/lib/weather/yili-regions";

export { useWeather } from "@/lib/weather/use-weather";
export { useWeatherCityPicker } from "@/lib/weather/use-weather-city-picker";
export { toWeatherNavSnapshot, type WeatherNavSnapshot } from "@/lib/weather/snapshot";
export {
  buildForecastChartGeometry,
  minForecastScrollWidth,
  type ForecastChartGeometry,
} from "@/lib/weather/forecast-chart";
