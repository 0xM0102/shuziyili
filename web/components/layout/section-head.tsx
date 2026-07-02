import Link from "next/link";

type Props = {
  title: string;
  moreHref?: string;
  /** `blue` 主栏目；`pink` 快讯；`warm` 地区资讯等暖色块。 */
  dotTone?: "blue" | "pink" | "warm";
};

const dotToneClass: Record<NonNullable<Props["dotTone"]>, string> = {
  blue: "bg-primary",
  pink: "bg-pink-500",
  warm: "bg-amber-500",
};

/**
 * 区块标题：左侧色点 + 标题 + 可选「更多」，与首页「数伊精选 / 7×24 快讯」同一套视觉。
 */
export function SectionHead({ title, moreHref, dotTone = "blue" }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dotToneClass[dotTone]}`} aria-hidden />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {moreHref ? (
        <Link href={moreHref} className="shrink-0 text-xs text-muted hover:text-primary">
          更多 &gt;
        </Link>
      ) : null}
    </div>
  );
}
