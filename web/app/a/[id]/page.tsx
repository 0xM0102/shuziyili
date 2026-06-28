import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareRow } from "@/components/article/share-row";
import { FlashQuickAside } from "@/components/flash/flash-quick-aside";
import { getPublicApiV1Base } from "@/lib/api-base";
import { getFlashLinks } from "@/lib/flash-links";
import { siteConfig } from "@/lib/site";

type ApiResponse<T> = { ok: boolean; message?: string | null; data?: T | null };
type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverUrl: string | null;
  updatedAt: number;
};

async function fetchArticle(id: string): Promise<Article | null> {
  const base = getPublicApiV1Base();
  const res = await fetch(`${base}/articles/${encodeURIComponent(id)}`, { next: { revalidate: 30 } });
  const json = (await res.json()) as ApiResponse<Article>;
  if (!json.ok || !json.data) return null;
  return json.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await fetchArticle(id);
  if (!a) return { title: "内容不存在" };
  return {
    title: a.title,
    description: a.summary || siteConfig.description,
    alternates: { canonical: `/a/${a.id}` },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [a, flash] = await Promise.all([fetchArticle(id), getFlashLinks()]);
  if (!a) notFound();

  const pageUrl = `${siteConfig.url.replace(/\/$/, "")}/a/${a.id}`;
  const articleDateLabel = new Date(a.updatedAt).toLocaleString("zh-CN", { hour12: false });

  return (
    <div className="space-y-0">
      <section className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 bg-background">
          {/* 封面区：图在上；图底部小渐变到白；文字区白底 */}
          <section className="relative overflow-hidden bg-background">
            <div
              className={`relative h-[260px] w-full md:h-[420px] ${
                a.coverUrl ? "bg-cover bg-center" : "bg-linear-to-br from-primary/15 via-background to-background"
              }`}
              style={a.coverUrl ? { backgroundImage: `url(${a.coverUrl})` } : undefined}
            >
              {/* 图片底部渐变到白底（不要铺太大） */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent via-white/70 to-background md:h-32" />
            </div>
            <div className="px-4 py-5 md:px-6 md:py-6">
              <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {a.title}
              </h1>
              {a.summary ? <p className="mt-2 max-w-4xl text-sm text-muted">{a.summary}</p> : null}
              <div className="mt-4 max-w-4xl">
                <ShareRow url={pageUrl} dateLabel={articleDateLabel} shareTitle={a.title} />
              </div>
            </div>
          </section>

          {/* 分割线：只在主内容列内左右贴边（不跨快讯列） */}
          <div className="border-b border-border" />

          <div className="px-4 py-5 md:px-6 md:py-8">
            {a.content ? (
              <div className="bg-background">
                <pre className="whitespace-pre-wrap font-sans text-[15px] leading-7 text-foreground">
                  {a.content}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted">暂无正文。</p>
            )}
          </div>
        </div>

        <FlashQuickAside items={flash} />
      </section>
    </div>
  );
}
