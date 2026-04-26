import type { Metadata } from "next";
import { NewsHeadlineList } from "@/components/news/news-headline-list";
import { getNewsHeadlines, normalizeNewsType } from "@/lib/news-api";
import { newsEmptyHeadlinesClassName, newsIndexMainClassName } from "@/lib/news-layout";
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
  const juheType = normalizeNewsType(typeof sp.type === "string" ? sp.type : undefined);
  const data = await getNewsHeadlines(juheType);

  return (
    <div className="min-h-0 w-full">
      <div className={newsIndexMainClassName}>
        {data.items.length === 0 ? (
          <section className={newsEmptyHeadlinesClassName} role="status">
            暂无资讯条目。若已配置聚合数据 Key，请稍后重试；不同分类会分别请求上游并计入配额。
          </section>
        ) : (
          <NewsHeadlineList items={data.items} />
        )}
      </div>
    </div>
  );
}
