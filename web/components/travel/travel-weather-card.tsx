"use client";

import Link from "next/link";
import { LoadingSpinner } from "@/components/feedback";
import { WeatherCityPickerModal } from "@/components/weather/weather-city-picker-modal";
import { WeatherConditionIcon } from "@/components/weather/weather-icons";
import { WeatherLocateButton } from "@/components/weather/weather-locate-button";
import { forecastDayLabel, useWeather, useWeatherCityPicker } from "@/lib/weather-api";

const FORECAST_DAYS = 3;

function CardSectionHead({
  cityName,
  onCityClick,
  onLocate,
  locating,
  loading,
  moreHref,
}: {
  cityName: string;
  onCityClick: () => void;
  onLocate: () => void;
  locating: boolean;
  loading: boolean;
  moreHref?: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
        <h2 className="min-w-0 text-sm font-semibold text-foreground">
          <button
            type="button"
            onClick={onCityClick}
            className="truncate text-primary hover:underline"
            aria-label={`切换城市，当前${cityName}`}
          >
            {cityName}
          </button>
          <span className="text-foreground">天气</span>
        </h2>
        <WeatherLocateButton
          onClick={onLocate}
          disabled={loading || locating}
          locating={locating}
          className="shrink-0 rounded-md border border-border bg-card p-1 text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
          iconClassName="h-4 w-4"
        />
      </div>
      {moreHref ? (
        <Link href={moreHref} className="shrink-0 text-xs text-muted hover:text-primary">
          更多 &gt;
        </Link>
      ) : null}
    </div>
  );
}

function WeatherCardMessage({
  loading = false,
  message,
}: {
  loading?: boolean;
  message: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center"
      role="status"
      aria-label={message}
    >
      {loading ? <LoadingSpinner size={28} /> : null}
      <p className="text-xs text-muted">{message}</p>
    </div>
  );
}

export function TravelWeatherCard() {
  const weatherState = useWeather();
  const { openPicker, modalProps } = useWeatherCityPicker(weatherState);
  const { weather, loading, locating, error } = weatherState;

  const cityName = weather?.cityName ?? "当地";
  const forecastDays = weather?.forecast.slice(0, FORECAST_DAYS) ?? [];

  return (
    <>
      <aside className="border-t border-border bg-background lg:h-[340px] lg:border-t-0 lg:border-l">
        <div className="flex h-full flex-col px-3 py-3 md:px-4">
          <CardSectionHead
            cityName={cityName}
            onCityClick={openPicker}
            onLocate={weatherState.locateCurrentCity}
            locating={locating}
            loading={loading}
            moreHref="/weather"
          />

          <div
            className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-linear-to-br from-primary/8 via-card to-card"
          >
            {loading ? (
              <WeatherCardMessage loading message="天气加载中..." />
            ) : error ? (
              <WeatherCardMessage message={error} />
            ) : weather ? (
              <>
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-3xl font-bold tracking-tight text-foreground">
                        {weather.currentTemp}
                        <span className="text-lg font-semibold text-muted">°</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <WeatherConditionIcon weatherText={weather.weatherText} size={28} className="shrink-0" />
                        {weather.weatherText}
                      </p>
                    </div>
                    <div className="shrink-0 space-y-0.5 text-right text-[10px] leading-snug text-muted">
                      {weather.humidity ? <p>湿度 {weather.humidity}%</p> : null}
                      {weather.windText ? <p className="max-w-[7rem] truncate">{weather.windText}</p> : null}
                    </div>
                  </div>
                  {weather.travelTip ? (
                    <p className="mt-2 line-clamp-1 text-[11px] text-muted/90">
                      {weather.travelTip}
                    </p>
                  ) : null}
                </div>

                {forecastDays.length > 0 ? (
                  <div className="grid min-h-0 flex-1 grid-cols-3 gap-1 border-t border-border/80 bg-card/40 p-2">
                    {forecastDays.map((f, index) => (
                      <div
                        key={f.date}
                        className="flex min-w-0 flex-col items-center justify-center rounded-lg bg-background/80 px-1 py-2 text-center"
                      >
                        <span className="text-[11px] font-medium text-muted">
                          {forecastDayLabel(f.date, index)}
                        </span>
                        <WeatherConditionIcon
                          weatherText={f.weatherText}
                          size={36}
                          className="mt-1 shrink-0"
                        />
                        <span className="mt-1 line-clamp-1 w-full text-[10px] text-muted">
                          {f.weatherText}
                        </span>
                        <span className="mt-1.5 text-xs font-semibold tabular-nums text-foreground">
                          {f.hi}°
                          <span className="text-muted font-normal"> / </span>
                          {f.lo}°
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <WeatherCardMessage message="暂无预报" />
                )}
              </>
            ) : (
              <WeatherCardMessage message="暂无天气数据" />
            )}
          </div>

          {weather?.updatedAt ? (
            <p className="mt-1 line-clamp-1 text-[10px] text-muted">更新 {weather.updatedAt}</p>
          ) : null}
        </div>
      </aside>

      <WeatherCityPickerModal {...modalProps} />
    </>
  );
}
