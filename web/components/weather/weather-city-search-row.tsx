"use client";

import { WeatherCitySearchField } from "@/components/weather/weather-city-search-field";
import { WeatherLocateButton } from "@/components/weather/weather-locate-button";
import type { WeatherRegion } from "@/lib/weather/types";

type WeatherCitySearchRowProps = {
  regions: WeatherRegion[];
  adcode: string;
  loading: boolean;
  locating: boolean;
  onSelect: (adcode: string) => void;
  onLocate: () => void;
  fieldClassName?: string;
};

export function WeatherCitySearchRow({
  regions,
  adcode,
  loading,
  locating,
  onSelect,
  onLocate,
  fieldClassName,
}: WeatherCitySearchRowProps) {
  return (
    <div className="flex items-center gap-2">
      <WeatherCitySearchField
        className={fieldClassName ?? "min-w-0 flex-1"}
        regions={regions}
        adcode={adcode}
        onSelect={onSelect}
      />
      <WeatherLocateButton
        onClick={onLocate}
        disabled={loading || locating}
        locating={locating}
      />
    </div>
  );
}
