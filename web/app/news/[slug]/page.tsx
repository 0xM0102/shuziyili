import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleHero, NewsArticleMain } from "@/components/news/news-article-sections";
import { formatNewsByline, resolveNewsOpenGraphImage } from "@/lib/news-display";
import { getNewsDetail } from "@/lib/news-api";
import { newsArticlePageClassName } from "@/lib/news-layout";
import { absoluteUrl, siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ type?: string }>;
};

async function loadArticle(slug: string, channelType?: string) {
  const detail = await getNewsDetail(slug, channelType);
  if (!detail) return null;
  return {
    ...detail,
    byline: formatNewsByline(detail.item, { includeCategory: true }),
    bodyHtml: (detail.contentHtml ?? "").trim(),
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const article = await loadArticle(slug, sp.type);
  if (!article) {
    return {
      title: "资讯",
      alternates: { canonical: `/news/${encodeURIComponent(slug)}` },
    };
  }

  const { item } = article;
  const canonical = `/news/${encodeURIComponent(slug)}`;
  return {
    title: `${item.title} · 资讯`,
    description: `${item.category} · ${item.date}`,
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description: item.date,
      images: [{ url: resolveNewsOpenGraphImage(item.thumbnailUrl, absoluteUrl(siteConfig.logoPath)) }],
      url: canonical,
    },
  };
}

export default async function NewsArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const article = await loadArticle(slug, sp.type);
  if (!article) notFound();

  const { item, attribution, byline, bodyHtml } = article;

  return (
    <div className="space-y-0 bg-background">
      <NewsArticleHero item={item} byline={byline} />
      <div className={newsArticlePageClassName}>
        <NewsArticleMain bodyHtml={bodyHtml} originalUrl={item.url} attribution={attribution} />
      </div>
    </div>
  );
}
