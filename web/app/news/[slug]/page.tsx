import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleHero, NewsArticleMain } from "@/components/news/news-article-sections";
import { formatNewsByline } from "@/lib/news-display";
import { getNewsDetail } from "@/lib/news-api";
import { absoluteUrl, siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ type?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const detail = await getNewsDetail(slug, sp.type);
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

export default async function NewsArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const detail = await getNewsDetail(slug, sp.type);
  if (!detail) notFound();

  const { item, attribution, contentHtml } = detail;
  const byline = formatNewsByline(item, { includeCategory: true });
  const bodyHtml = (contentHtml ?? "").trim();

  return (
    <div className="space-y-0 bg-background">
      <NewsArticleHero item={item} byline={byline} />
      <NewsArticleMain bodyHtml={bodyHtml} originalUrl={item.url} attribution={attribution} />
    </div>
  );
}
