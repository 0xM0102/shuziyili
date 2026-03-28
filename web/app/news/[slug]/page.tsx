import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "资讯详情",
    robots: { index: false, follow: false },
    alternates: { canonical: `/news/${slug}` },
  };
}

/** 路由预留：正文由 API / CMS 注入后再开收录 */
export default async function ZixunArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="text-sm text-muted" aria-label="面包屑">
        <Link href="/news" className="hover:text-primary">
          资讯
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">详情</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">资讯详情</h1>
      <p className="mt-2 text-sm text-muted">占位 · slug：{slug}</p>
    </article>
  );
}
