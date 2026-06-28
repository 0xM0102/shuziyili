"use client";

import { PageLoading } from "@/components/feedback";
import { WeatherCityPickerModal } from "@/components/weather/weather-city-picker-modal";
import { WeatherForecastWeek } from "@/components/weather/weather-forecast-week";
import { WeatherHourlyStrip } from "@/components/weather/weather-hourly-strip";
import { WeatherLifeIndexPanel } from "@/components/weather/weather-life-index-panel";
import { WeatherPageHeader } from "@/components/weather/weather-page-header";
import { WeatherAttribution, WeatherMoreLinks } from "@/components/weather/weather-sidebar";
import {
  standaloneContentGridClassName,
  standaloneSideRailClassName,
  standaloneWideContentOffsetClassName,
  standaloneWideMainStackClassName,
  standaloneWidePageClassName,
} from "@/lib/page-layout";
import { useWeather } from "@/lib/weather-api";
import { useWeatherCityPicker } from "@/lib/weather/use-weather-city-picker";

export function WeatherPageContent() {
  const weather = useWeather();
  const { openPicker, modalProps } = useWeatherCityPicker(weather);
  const hasWeather = !weather.loading && !weather.error && weather.weather;

  if (weather.loading) {
    return (
      <>
        <div className={standaloneWidePageClassName}>
          <PageLoading variant="section" label="天气加载中" size={72} />
        </div>
        <WeatherCityPickerModal {...modalProps} />
      </>
    );
  }

  return (
    <div className={standaloneWidePageClassName}>
      <WeatherPageHeader
        error={weather.error}
        weather={weather.weather}
        onOpenPicker={openPicker}
      />

      <div className={`${standaloneWideContentOffsetClassName} ${standaloneContentGridClassName}`}>
        <div className={`${standaloneWideMainStackClassName} min-w-0`}>
          {hasWeather ? (
            <>
              <WeatherHourlyStrip hourly={weather.weather!.hourly} />
              <WeatherForecastWeek forecast={weather.weather!.forecast} />
              <WeatherLifeIndexPanel indices={weather.weather!.lifeIndices} />
            </>
          ) : null}
        </div>

        <aside className={`${standaloneSideRailClassName} min-w-0`}>
          {weather.attribution ? <WeatherAttribution text={weather.attribution} /> : null}
          <WeatherMoreLinks />
        </aside>
      </div>

      <WeatherCityPickerModal {...modalProps} />
    </div>
  );
}
