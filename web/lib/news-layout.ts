/** 主内容区水平内边距：列表与资讯详情共用，避免与活动页等漂移。 */
const mainColumnXPad = "px-4 md:px-5";

/**
 * 资讯列表根容器：占满 AppShell 右侧（不设 max-w），宽屏不留大块空白。
 */
export const newsIndexMainClassName = `w-full min-w-0 ${mainColumnXPad} pb-8 pt-2 md:pb-10 md:pt-3`;

/** 详情标题区下方的正文、外链与版权说明。 */
export const newsArticleSectionClassName = `w-full min-w-0 ${mainColumnXPad} space-y-6 py-6`;

/** 上游 HTML：限制行长，超宽屏不致一行过长；图片仍 max-w-full。 */
export const newsArticleBodyClassName =
  "news-article-body mx-auto w-full max-w-[min(100%,70ch)] text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_img]:my-3 [&_img]:max-h-[min(70vh,520px)] [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain [&_p]:mb-3 [&_p]:last:mb-0";
