export type WeatherForecastDay = {
  date: string;
  weatherText: string;
  nightWeatherText?: string;
  windText?: string;
  hi: number;
  lo: number;
};

export type WeatherHourly = {
  time: string;
  weatherText: string;
  temp: number;
};

export type WeatherLifeIndex = {
  key: string;
  name: string;
  info: string;
  detail: string;
};

export type WeatherPayload = {
  adcode: string;
  cityName: string;
  updatedAt: string;
  currentTemp: number;
  weatherText: string;
  humidity: string;
  windText: string;
  travelTip: string;
  forecast: WeatherForecastDay[];
  hourly: WeatherHourly[];
  lifeIndices: WeatherLifeIndex[];
  upstreamConfigured: boolean;
};

export type WeatherRegion = {
  adcode: string;
  name: string;
  province: string;
  featured: boolean;
};

export type WeatherIconKey =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "overcast"
  | "rain-overcast"
  | "rain-light"
  | "rain"
  | "rain-heavy"
  | "thunderstorm"
  | "snow-light"
  | "snow-heavy"
  | "sleet"
  | "freezing-rain"
  | "hail"
  | "windy"
  | "breeze"
  | "fog"
  | "haze"
  | "partly-cloudy-night"
  | "rain-night"
  | "snow-night"
  | "fog-night"
  | "dust"
  | "tornado"
  | "rainbow";
