"use client";

import { WeatherConditionIcon } from "@/components/weather/weather-icons";
import type { WeatherPayload } from "@/lib/weather/types";

type WeatherHeroHeaderProps = {
  weather: WeatherPayload;
  todayRange: string | null;
  onOpenPicker: () => void;
};

export function WeatherHeroHeader({ weather, todayRange, onOpenPicker }: WeatherHeroHeaderProps) {
  return (
    <header className="w-full overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 via-sky-400 to-primary text-white shadow-sm">
      <div className="p-5 md:p-8">
        <h1 className="sr-only">天气</h1>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/85">{weather.cityName}</p>
            <div className="mt-2 flex items-end gap-3 sm:gap-4">
              <p className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                {weather.currentTemp}°
              </p>
              <div className="pb-1 sm:pb-2">
                <WeatherConditionIcon
                  weatherText={weather.weatherText}
                  size={48}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                />
                <p className="text-base font-medium sm:text-lg">{weather.weatherText}</p>
              </div>
            </div>
            {todayRange ? (
              <p className="mt-2 text-sm text-white/90">今日 {todayRange}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onOpenPicker}
            className="shrink-0 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/25"
          >
            切换城市
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {weather.humidity ? (
            <div className="rounded-xl bg-white/12 px-3 py-2 backdrop-blur-sm">
              <dt className="text-white/75">湿度</dt>
              <dd className="mt-0.5 font-semibold">{weather.humidity}%</dd>
            </div>
          ) : null}
          {weather.windText ? (
            <div className="rounded-xl bg-white/12 px-3 py-2 backdrop-blur-sm">
              <dt className="text-white/75">风力</dt>
              <dd className="mt-0.5 font-semibold line-clamp-2 sm:line-clamp-none">
                {weather.windText}
              </dd>
            </div>
          ) : null}
          {weather.travelTip ? (
            <div className="col-span-2 rounded-xl bg-white/12 px-3 py-2 backdrop-blur-sm">
              <dt className="text-white/75">出行提示</dt>
              <dd className="mt-0.5 font-semibold line-clamp-2">{weather.travelTip}</dd>
            </div>
          ) : null}
        </dl>

        {weather.updatedAt ? (
          <p className="mt-4 text-xs text-white/75">更新：{weather.updatedAt}</p>
        ) : null}
      </div>
    </header>
  );
}
