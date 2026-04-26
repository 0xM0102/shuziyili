/**
 * 品牌暗色衬底：登录弹窗左侧、资讯无图占位等共用（深蓝渐变 + 顶光 + 极淡网格）。
 * 父级须为 `position: relative` 且预留 `overflow-hidden`（若需裁切圆角）。
 */
export function BrandPanelBackdrop() {
  return (
    <>
      <div
        className="absolute inset-0 bg-linear-to-br from-[#0c1220] via-[#111827] to-[#1e3a5f]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(33,116,255,0.2),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px]"
        aria-hidden
      />
    </>
  );
}
