import type { WeatherRegion } from "@/lib/weather/types";

/** 伊犁州县市静态目录（与 region-catalog featured 一致，不依赖接口加载）。 */
export const YILI_WEATHER_REGIONS: WeatherRegion[] = [
  { adcode: "654002", name: "伊宁市", province: "新疆", featured: true },
  { adcode: "654003", name: "奎屯市", province: "新疆", featured: true },
  { adcode: "654004", name: "霍尔果斯市", province: "新疆", featured: true },
  { adcode: "654021", name: "伊宁县", province: "新疆", featured: true },
  { adcode: "654022", name: "察布查尔县", province: "新疆", featured: true },
  { adcode: "654023", name: "霍城县", province: "新疆", featured: true },
  { adcode: "654024", name: "巩留县", province: "新疆", featured: true },
  { adcode: "654025", name: "新源县", province: "新疆", featured: true },
  { adcode: "654026", name: "昭苏县", province: "新疆", featured: true },
  { adcode: "654027", name: "特克斯县", province: "新疆", featured: true },
  { adcode: "654028", name: "尼勒克县", province: "新疆", featured: true },
];

/** 伊犁快捷入口：优先用接口目录补全，否则回退静态列表。 */
export function yiliWeatherRegions(regions: WeatherRegion[]): WeatherRegion[] {
  if (regions.length === 0) return YILI_WEATHER_REGIONS;
  const byAdcode = new Map(regions.map((r) => [r.adcode, r]));
  return YILI_WEATHER_REGIONS.map((item) => byAdcode.get(item.adcode) ?? item);
}
