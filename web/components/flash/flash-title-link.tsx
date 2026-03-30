import Link from "next/link";
import type { FlashLinkItem } from "@/lib/flash-links";

type FlashTitleLinkProps = {
  item: FlashLinkItem;
  /**
   * detail：先进 /flash/[id] 再分享；
   * direct：侧栏直达目标（站内 Link、外链新窗口）。
   */
  mode: "detail" | "direct";
};

const titleClass = {
  detail: "line-clamp-2 text-[15px] font-semibold text-foreground/95 hover:text-primary",
  direct: "line-clamp-2 text-sm font-medium text-foreground/95 hover:text-primary",
} as const;

export function FlashTitleLink({ item, mode }: FlashTitleLinkProps) {
  const cls = titleClass[mode];
  if (mode === "detail") {
    return (
      <Link href={`/flash/${item.id}`} className={cls}>
        {item.title}
      </Link>
    );
  }
  if (item.linkKind === "INTERNAL") {
    return (
      <Link href={`/flash/${item.id}`} className={cls}>
        {item.title}
      </Link>
    );
  }
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {item.title}
    </a>
  );
}
