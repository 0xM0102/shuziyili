import { ContentEmptyState } from "@/components/feedback";
import { SectionHead } from "@/components/layout/section-head";
import { formatFlashTime, type FlashLinkItem } from "@/lib/flash-links";
import { joinClassNames } from "@/lib/class-names";
import { FlashTagBadge } from "./flash-tag-badge";
import { FlashTitleLink } from "./flash-title-link";

type FlashQuickAsideProps = {
  items: FlashLinkItem[];
  className?: string;
  emptyLabel?: string;
  moreHref?: string;
  title?: string;
};

export function FlashQuickAside({
  items,
  className,
  emptyLabel = "暂无快讯",
  moreHref = "/flash",
  title = "7×24 快讯",
}: FlashQuickAsideProps) {
  return (
    <aside
      className={joinClassNames(
        "border-t border-border bg-background lg:border-t-0 lg:border-l",
        className,
      )}
    >
      <div className="px-4 py-4">
        <SectionHead title={title} moreHref={moreHref} dotTone="pink" />
      </div>
      {items.length === 0 ? (
        <ContentEmptyState
          label={emptyLabel}
          size="compact"
          bordered={false}
          className="px-4 py-6"
        />
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} className="border-b border-border px-4 py-4 last:border-b-0">
              <div className="flex gap-3">
                <span className="w-14 shrink-0 text-xs text-muted">
                  {formatFlashTime(item.publishedAt)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FlashTagBadge label={item.tagLabel} density="compact" />
                    <FlashTitleLink item={item} mode="direct" />
                  </div>
                  {item.sourceLabel ? (
                    <p className="mt-1 text-xs text-muted">来源：{item.sourceLabel}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
