import Link from "next/link";

type Props = {
  title: string;
  moreHref?: string;
  /** `blue` 主栏目；`pink` 用于快讯等高频块，与首页下半区一致。 */
  dotTone?: "blue" | "pink";
};

/**
 * 区块标题：左侧色点 + 标题 + 可选「更多」，与首页「数伊精选 / 7×24 快讯」同一套视觉。
 */
export function SectionHead({ title, moreHref, dotTone = "blue" }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${dotTone === "pink" ? "bg-pink-500" : "bg-primary"}`}
          aria-hidden
        />
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
