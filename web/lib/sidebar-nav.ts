/**
 * 页面内嵌筛选列（如活动页左侧），与 AppShell `ChannelSideNav` 视觉不同：左竖线 + 选中底。
 */
export function sidebarFilterLinkClass(active: boolean): string {
  return active
    ? "flex w-full items-center justify-between border-l-2 border-primary bg-primary/6 px-3 py-2 text-sm font-medium text-primary"
    : "flex w-full items-center justify-between border-l-2 border-transparent px-3 py-2 text-sm text-muted hover:border-primary/40 hover:bg-sidebar-hover hover:text-foreground";
}
