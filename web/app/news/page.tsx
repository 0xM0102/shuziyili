import type { Metadata } from "next";
import { ContentEmptyState } from "@/components/feedback";
import { NewsHeadlineList } from "@/components/news/news-headline-list";
import { getNewsHeadlines, normalizeNewsType } from "@/lib/news-api";
import { newsIndexMainClassName } from "@/lib/news-layout";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "资讯",
  description: `${siteConfig.name} · 热点资讯聚合浏览。`,
  alternates: { canonical: "/news" },
};

type PageProps = {
  searchParams?: Promise<{ type?: string }>;
};

export default async function NewsIndexPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const channelType = normalizeNewsType(typeof sp.type === "string" ? sp.type : undefined);
  const { items } = await getNewsHeadlines(channelType);

  return (
    <div className={newsIndexMainClassName}>
      {items.length === 0 ? (
        <ContentEmptyState />
      ) : (
        <NewsHeadlineList items={items} channelType={channelType} />
      )}
    </div>
  );
}
