type FlashTagBadgeProps = {
  label: string;
  /** compact：侧栏；default：列表/时间线 */
  density?: "compact" | "default";
};

export function FlashTagBadge({ label, density = "default" }: FlashTagBadgeProps) {
  const text = (label ?? "").trim();
  if (!text) return null;
  const box =
    density === "compact" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={`rounded bg-primary/10 ${box} font-medium text-primary`} aria-label={`标签：${text}`}>
      {text}
    </span>
  );
}

