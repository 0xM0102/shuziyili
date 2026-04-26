/**
 * 资讯相关页面布局类名集中定义，避免列表/详情各处手写不一致（列表主列保持 max-w-4xl）。
 */
export const newsIndexMainClassName =
  "mx-auto max-w-4xl px-4 pb-8 pt-2 md:px-6 md:pb-10 md:pt-3";

export const newsEmptyHeadlinesClassName =
  "border border-dashed border-border py-14 text-center text-sm text-muted";

export const newsArticleSectionClassName =
  "mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-5";

/** 上游 HTML 正文外层：无 typography 插件时的最小可读样式。 */
export const newsArticleBodyClassName =
  "news-article-body max-w-none text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_img]:my-3 [&_img]:max-h-[min(70vh,520px)] [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain [&_p]:mb-3 [&_p]:last:mb-0";
