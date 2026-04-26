import type { NewsItem } from "@/lib/news-api";

/** 聚合返回可能为空串，统一用 trim 判断是否有可用封面。 */
export function hasNewsCover(item: Pick<NewsItem, "thumbnailUrl">): boolean {
  return Boolean(item.thumbnailUrl?.trim());
}

/** 资讯详情头图行内样式；无图时返回 `undefined`。 */
export function newsHeroCoverStyle(
  thumbnailUrl: string | undefined
):
  | {
      backgroundImage: string;
      backgroundSize: "cover";
      backgroundPosition: "center";
    }
  | undefined {
  const u = thumbnailUrl?.trim();
  if (!u) return undefined;
  return {
    backgroundImage: `url(${u})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
