"use client";

import { useMemo, useState } from "react";
import type { WeatherRegion } from "@/lib/weather/types";
import { filterWeatherRegions } from "@/lib/weather-region-search";
import { WEATHER_FIELD_HEIGHT_CLASS } from "@/lib/weather/ui";

type WeatherCitySearchFieldProps = {
  regions: WeatherRegion[];
  adcode: string;
  onSelect: (adcode: string) => void;
  placeholder?: string;
  className?: string;
};

export function WeatherCitySearchField({
  regions,
  adcode,
  onSelect,
  placeholder = "搜索全国城市，如深圳、杭州…",
  className,
}: WeatherCitySearchFieldProps) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchResults = useMemo(
    () => filterWeatherRegions(regions, query),
    [regions, query]
  );
  const showDropdown = dropdownOpen && query.trim().length > 0;

  const handleSelect = (code: string) => {
    onSelect(code);
    setQuery("");
    setDropdownOpen(false);
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <label className="block">
        <span className="sr-only">搜索城市</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setDropdownOpen(false), 120);
          }}
          placeholder={placeholder}
          className={`${WEATHER_FIELD_HEIGHT_CLASS} w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted`}
        />
      </label>

      {showDropdown ? (
        <ul
          id="weather-city-search-listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {searchResults.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              未找到匹配城市
            </li>
          ) : (
            searchResults.map((city) => (
              <li key={city.adcode}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-sidebar-hover ${
                    city.adcode === adcode ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(city.adcode)}
                >
                  <span>{city.name}</span>
                  <span className="text-xs text-muted">{city.province}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
