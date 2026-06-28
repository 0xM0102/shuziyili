/** 超宽屏整站外框：顶栏与 AppShell 共用，超过 1920px 时才显示左右边界。 */
export const appFrameClassName =
  "mx-auto w-full max-w-[1920px] border-border min-[1921px]:border-x";

export const standaloneWideWidthClassName = "mx-auto w-full max-w-7xl";

export const standaloneWideContainerClassName = `${standaloneWideWidthClassName} px-4 md:px-6`;

export const standalonePageVerticalClassName = "py-6 pb-20 md:py-10 md:pb-28";

export const standaloneWidePageClassName = `${standaloneWideContainerClassName} ${standalonePageVerticalClassName}`;

export const standaloneReadableClassName = "mx-auto w-full max-w-4xl";

export const standaloneHeaderClassName = "max-w-4xl";

export const standaloneContentGridClassName =
  "grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-8 lg:items-start";

/** 关于 / 天气等宽屏专页：主栏与页头间距 */
export const standaloneWideContentOffsetClassName = "mt-10";

/** 宽屏专页主栏区块纵向间距 */
export const standaloneWideMainStackClassName = "space-y-10";

export const standaloneSectionTitleClassName =
  "flex items-center gap-2.5 text-lg font-semibold text-foreground";

/** 宽屏专页主栏内容卡片（如天气逐小时、7 日） */
export const standaloneContentCardClassName =
  "rounded-2xl border border-border bg-card p-5 md:p-6";

/** 宽屏专页侧栏卡片 */
export const standaloneSideCardClassName =
  "rounded-2xl border border-border bg-card p-6 md:p-8";

export const standaloneSideDashedCardClassName =
  "rounded-2xl border border-dashed border-border bg-sidebar/50 p-6 md:p-8";

export const standaloneSideRailClassName = "space-y-6";

export const sidebarContentWidthClassName = "w-full min-w-0";

export const sidebarContentInsetClassName = "px-4 md:px-5";

export const sidebarContentContainerClassName = `${sidebarContentWidthClassName} ${sidebarContentInsetClassName}`;

export const sidebarContentPageClassName = `${sidebarContentContainerClassName} py-6 pb-12 md:py-8 md:pb-14`;

export const sidebarReadableClassName = "w-full max-w-3xl";
