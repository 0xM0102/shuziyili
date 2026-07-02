import {
  standaloneReadableClassName,
  standaloneWideContainerClassName,
} from "@/lib/page-layout";

const mainColumnXPad = "px-4 md:px-5";

/** 资讯列表根容器：占满 AppShell 右侧主栏。 */
export const newsIndexMainClassName = `w-full min-w-0 ${mainColumnXPad} pb-8 pt-2 md:pb-10 md:pt-3`;

/** 详情页顶区（全宽封面 + 标题叠层）。 */
export const newsArticleHeroClassName = "relative min-h-[200px] bg-muted md:min-h-[260px]";

/** 详情正文外框：与关于页同级的 max-w-7xl 容器。 */
export const newsArticlePageClassName = `${standaloneWideContainerClassName} py-6 md:py-8`;

/** 详情正文阅读宽：max-w-4xl。 */
export const newsArticleContentClassName = `${standaloneReadableClassName} space-y-6`;

/** 上游 HTML 排版（图片 max-w-full，段落间距）。 */
export const newsArticleBodyClassName =
  "news-article-body w-full text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_img]:my-3 [&_img]:max-h-[min(70vh,520px)] [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain [&_p]:mb-3 [&_p]:last:mb-0";
