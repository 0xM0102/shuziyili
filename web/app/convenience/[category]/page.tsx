import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const labels: Record<string, string> = {
  government: "政务便民",
  health: "医疗健康",
  shipping: "快递物流",
};

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return Object.keys(labels).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const title = labels[category];
  if (!title) return { title: "未找到" };
  return {
    title,
    description: `${title}便民信息。`,
    alternates: { canonical: `/convenience/${category}` },
  };
}

export default async function BianminCategoryPage({ params }: Props) {
  const { category } = await params;
  const title = labels[category];
  if (!title) notFound();

  return (
    <div>
      <nav className="text-sm text-muted" aria-label="面包屑">
        <Link href="/convenience" className="hover:text-primary">
          便民
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">列表接 API 后再做。</p>
    </div>
  );
}
