import { getPublicApiV1Base } from "@/lib/api-base";
import type { WeatherPayload, WeatherRegion } from "@/lib/weather/types";

type ApiEnvelope<T> = { ok?: boolean; data?: T };

async function fetchWeatherApi<T>(path: string, fallback: T): Promise<T> {
  const base = getPublicApiV1Base();
  try {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    const json = (await res.json()) as ApiEnvelope<T>;
    if (!json.ok || json.data === undefined) return fallback;
    return json.data;
  } catch {
    return fallback;
  }
}

export async function fetchWeatherRegions(): Promise<WeatherRegion[]> {
  return fetchWeatherApi<WeatherRegion[]>("/weather/regions", []);
}

export async function fetchWeatherByAdcode(adcode: string): Promise<WeatherPayload | null> {
  return fetchWeatherApi<WeatherPayload | null>(
    `/weather?adcode=${encodeURIComponent(adcode)}`,
    null
  );
}

export async function fetchWeatherByLocation(): Promise<WeatherPayload | null> {
  return fetchWeatherApi<WeatherPayload | null>("/weather/location", null);
}

export async function fetchWeatherNearby(lat: number, lng: number): Promise<WeatherPayload | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  return fetchWeatherApi<WeatherPayload | null>(`/weather/nearby?${params}`, null);
}

export async function fetchWeatherMeta(): Promise<{ attribution: string }> {
  return fetchWeatherApi<{ attribution: string }>("/weather/meta", { attribution: "" });
}
