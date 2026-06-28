import type { Metadata } from "next";
import { ContentEmptyState } from "@/components/feedback";
import { FlashKindBadge } from "@/components/flash/flash-kind-badge";
import { FlashTitleLink } from "@/components/flash/flash-title-link";
import { FlashTagBadge } from "@/components/flash/flash-tag-badge";
import { formatFlashTime, getFlashLinks } from "@/lib/flash-links";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "快讯",
  description: `${siteConfig.name} · 7×24 快讯列表。`,
  alternates: { canonical: "/flash" },
};

export default async function FlashPage() {
  const items = await getFlashLinks();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">7×24 快讯</h1>
        <p className="mt-2 text-sm text-muted">点击标题进入详情页，可复制或转发本页链接。</p>
      </header>

      {items.length === 0 ? (
        <ContentEmptyState />
      ) : (
        <ul className="relative ml-4 space-y-0 border-l border-border bg-background">
          {items.map((it) => (
            <li
              key={it.id}
              className="relative px-4 py-4 md:px-5"
            >
              <span className="absolute -left-3 top-6 h-2 w-2 rounded-full bg-pink-500" aria-hidden />

              <div className="flex flex-wrap items-start gap-4">
                <span className="w-14 shrink-0 text-xs text-muted">{formatFlashTime(it.publishedAt)}</span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FlashKindBadge kind={it.linkKind} />
                    <FlashTagBadge label={it.tagLabel} />
                    <FlashTitleLink item={it} mode="detail" />
                  </div>
                  {it.sourceLabel ? (
                    <p className="mt-1 text-xs text-muted">来源：{it.sourceLabel}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
