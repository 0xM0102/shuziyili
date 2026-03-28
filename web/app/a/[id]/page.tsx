import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicApiV1Base } from "@/lib/api-base";
import { siteConfig } from "@/lib/site";
import { ShareRow } from "@/components/article/share-row";

type ApiResponse<T> = { ok: boolean; message?: string | null; data?: T | null };
type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverUrl: string | null;
  updatedAt: number;
};

type QuickItem = { time: string; text: string };

async function fetchArticle(id: string): Promise<Article | null> {
  const base = getPublicApiV1Base();
  const res = await fetch(`${base}/articles/${encodeURIComponent(id)}`, { next: { revalidate: 30 } });
  const json = (await res.json()) as ApiResponse<Article>;
  if (!json.ok || !json.data) return null;
  return json.data;
}

function QuickAside({ items }: { items: QuickItem[] }) {
  return (
    <aside className="border-t border-border bg-background lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-pink-500" aria-hidden />
          <h2 className="text-base font-semibold text-foreground">7×24 快讯</h2>
        </div>
        <Link href="/news" className="text-xs text-muted hover:text-primary">
          更多 &gt;
        </Link>
      </div>
      <ul>
        {items.map((it) => (
          <li key={`${it.time}-${it.text}`} className="px-4 py-4">
            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-xs text-muted">{it.time}</span>
              <p className="line-clamp-2 text-sm text-foreground/95">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
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
  const a = await fetchArticle(id);
  if (!a) notFound();

  const quick: QuickItem[] = [
    { time: "12:15", text: "伊犁本地活动报名新增 3 场（占位）。" },
    { time: "11:40", text: "春季出行提示：山区温差与路况（占位）。" },
    { time: "10:10", text: "便民：政务服务入口更新（占位）。" },
    { time: "09:30", text: "数字游民：短住房源上新（占位）。" },
    { time: "08:20", text: "旅游：热门景点客流提示（占位）。" },
  ];

  const pageUrl = `${siteConfig.url.replace(/\/$/, "")}/a/${a.id}`;

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
                <ShareRow url={pageUrl} />
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

        <QuickAside items={quick} />
      </section>
    </div>
  );
}

