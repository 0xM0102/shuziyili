"use client";

import type { WeatherRegion } from "@/lib/weather/types";
import { yiliWeatherRegions } from "@/lib/weather/yili-regions";
import {
  weatherCityChipActiveClassName,
  weatherCityChipIdleClassName,
} from "@/lib/weather/ui";

type YiliWeatherShortcutsProps = {
  regions: WeatherRegion[];
  adcode: string;
  onSelect: (adcode: string) => void;
  title?: string;
};

export function YiliWeatherShortcuts({
  regions,
  adcode,
  onSelect,
  title = "伊犁州县",
}: YiliWeatherShortcutsProps) {
  const cities = yiliWeatherRegions(regions);

  return (
    <section aria-label={title}>
      <p className="text-xs font-medium text-muted">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city.adcode}
            type="button"
            onClick={() => onSelect(city.adcode)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              city.adcode === adcode
                ? weatherCityChipActiveClassName
                : weatherCityChipIdleClassName
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>
    </section>
  );
}
