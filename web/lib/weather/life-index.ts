import type { WeatherLifeIndex } from "@/lib/weather/types";

/** 侧栏与主区展示顺序（对齐腾讯天气常见项）。 */
export const PRIMARY_LIFE_INDEX_KEYS = [
  "clothes",
  "umbrella",
  "cold",
  "carwash",
  "sports",
  "sunscreen",
  "morning",
  "makeup",
  "drying",
  "fish",
  "tourism",
  "comfort",
] as const;

const LIFE_INDEX_ORDER = new Map(
  PRIMARY_LIFE_INDEX_KEYS.map((key, index) => [key, index])
);

/** 前端展示排序；未列入的指数保持 API 返回顺序并排在已知项之后。 */
export function sortLifeIndices(indices: WeatherLifeIndex[]): WeatherLifeIndex[] {
  return [...indices].sort((a, b) => {
    const ai = LIFE_INDEX_ORDER.get(a.key as typeof PRIMARY_LIFE_INDEX_KEYS[number]) ?? 99;
    const bi = LIFE_INDEX_ORDER.get(b.key as typeof PRIMARY_LIFE_INDEX_KEYS[number]) ?? 99;
    return ai - bi;
  });
}
