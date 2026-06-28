import type { WeatherRegion } from "@/lib/weather/types";

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(省|市|县|区|州|盟|地区|壮族|回族|维吾尔|特别行政区)$/g, "");
}

/** 模糊搜索城市（名称 / 省份 / adcode），默认最多 20 条。 */
export function filterWeatherRegions(
  regions: WeatherRegion[],
  query: string,
  limit = 20
): WeatherRegion[] {
  const raw = query.trim();
  if (!raw) return [];

  const tokens = raw.split(/\s+/).map(normalizeToken).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored = regions
    .map((region) => {
      const name = normalizeToken(region.name);
      const province = normalizeToken(region.province);
      const adcode = region.adcode;
      let score = 0;
      for (const token of tokens) {
        if (name.includes(token) || province.includes(token) || adcode.includes(token)) {
          score += 1;
        }
      }
      return { region, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.region.featured !== b.region.featured) {
        return a.region.featured ? -1 : 1;
      }
      return a.region.name.localeCompare(b.region.name, "zh-CN");
    });

  return scored.slice(0, limit).map((item) => item.region);
}
