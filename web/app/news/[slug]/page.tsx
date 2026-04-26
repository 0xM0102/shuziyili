import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteLogoPlaceholder } from "@/components/brand/site-logo-placeholder";
import { formatNewsByline } from "@/lib/news-display";
import { getNewsDetail } from "@/lib/news-api";
import { sanitizeNewsContentHtml } from "@/lib/news-html";
import { newsArticleBodyClassName, newsArticleSectionClassName } from "@/lib/news-layout";
import { hasNewsCover, newsHeroCoverStyle } from "@/lib/news-helpers";
import { absoluteUrl, siteConfig } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getNewsDetail(slug);
  if (!detail) {
    return {
      title: "资讯",
      alternates: { canonical: `/news/${encodeURIComponent(slug)}` },
    };
  }
  const { item } = detail;
  const ogImage = item.thumbnailUrl?.trim()
    ? item.thumbnailUrl
    : absoluteUrl(siteConfig.logoPath);
  return {
    title: `${item.title} · 资讯`,
    description: `${item.category} · ${item.date}`,
    alternates: { canonical: `/news/${encodeURIComponent(slug)}` },
    openGraph: {
      title: item.title,
      description: item.date,
      images: [{ url: ogImage }],
      url: `/news/${encodeURIComponent(slug)}`,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const detail = await getNewsDetail(slug);
  if (!detail) notFound();

  const { item, attribution, contentHtml } = detail;
  const byline = formatNewsByline(item, { includeCategory: true });
  const hasCover = hasNewsCover(item);
  const bodyHtml = (contentHtml ?? "").trim();

  return (
    <div className="space-y-0 bg-background">
      <section
        className="relative min-h-[200px] bg-muted bg-cover bg-center md:min-h-[260px]"
        style={newsHeroCoverStyle(item.thumbnailUrl)}
      >
        {!hasCover ? <SiteLogoPlaceholder variant="hero" /> : null}
        {hasCover ? <div className="absolute inset-0 bg-black/40" /> : null}
        <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/35 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/50"
          >
            <span aria-hidden>←</span>
            返回资讯列表
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-4 md:p-6">
          <nav className="text-xs text-white/85" aria-label="面包屑">
            <Link href="/news" className="hover:text-white">
              资讯
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">正文</span>
          </nav>
          <h1 className="mt-3 text-xl font-bold text-white md:text-2xl">{item.title}</h1>
          <p className="mt-2 text-xs text-white/90 md:text-sm">{byline}</p>
        </div>
      </section>

      <section className={newsArticleSectionClassName}>
        {bodyHtml ? (
          <article
            className={newsArticleBodyClassName}
            dangerouslySetInnerHTML={{ __html: sanitizeNewsContentHtml(bodyHtml) }}
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90">
            暂无正文片段。完整报道请查看原文链接（第三方页面）。
          </p>
        )}
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            阅读原文
          </a>
        ) : null}
        <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted">{attribution}</p>
      </section>
    </div>
  );
}
