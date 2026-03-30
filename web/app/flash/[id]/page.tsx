import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareRow } from "@/components/article/share-row";
import { FlashKindBadge } from "@/components/flash/flash-kind-badge";
import { FlashTagBadge } from "@/components/flash/flash-tag-badge";
import { getFlashLinkById } from "@/lib/flash-links";
import { absoluteUrl, siteConfig } from "@/lib/site";

function flashDetailDescription(item: { title: string; sourceLabel: string }): string {
  return item.sourceLabel ? `${item.title} · 来源：${item.sourceLabel}` : `${siteConfig.name} · 快讯`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return { title: "快讯" };
  const item = await getFlashLinkById(n);
  if (!item) return { title: "快讯" };
  return {
    title: item.title,
    description: flashDetailDescription(item),
    alternates: { canonical: `/flash/${id}` },
    openGraph: {
      title: item.title,
      description: `${siteConfig.name} · 快讯`,
      url: `/flash/${id}`,
    },
  };
}

export default async function FlashDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) notFound();
  const item = await getFlashLinkById(n);
  if (!item) notFound();

  const pageUrl = absoluteUrl(`/flash/${id}`);
  const dateLabel = new Date(item.publishedAt).toLocaleString("zh-CN", { hour12: false });
  const isInternal = item.linkKind === "INTERNAL";
  const primaryBtn =
    "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-95";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <nav className="mb-6 text-xs text-muted" aria-label="面包屑">
        <Link href="/flash" className="hover:text-primary">
          快讯
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground/80">详情</span>
      </nav>

      <article className="rounded-xl border border-border bg-background p-5 md:p-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <FlashKindBadge kind={item.linkKind} density="comfortable" />
          <FlashTagBadge label={item.tagLabel} density="default" />
          {item.sourceLabel ? (
            <span className="text-xs text-muted">来源：{item.sourceLabel}</span>
          ) : null}
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{item.title}</h1>

        <div className="mt-6 border-t border-border pt-4">
          <ShareRow url={pageUrl} dateLabel={dateLabel} shareTitle={item.title} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {isInternal ? (
            <Link href="/flash" className={primaryBtn}>
              返回快讯列表
            </Link>
          ) : (
            <>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
                访问原文
              </a>
              <Link href="/flash" className="text-sm text-muted hover:text-primary">
                返回快讯列表
              </Link>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
