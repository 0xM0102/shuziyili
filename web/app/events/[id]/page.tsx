import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "活动详情",
    robots: { index: false, follow: false },
    alternates: { canonical: `/events/${id}` },
  };
}

/** 路由预留：有数据后改为服务端取数并允许收录 */
export default async function HuodongDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <nav className="text-sm text-muted" aria-label="面包屑">
        <Link href="/events" className="hover:text-primary">
          活动
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">详情</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">活动详情</h1>
      <p className="mt-2 text-sm text-muted">占位 · id：{id}</p>
    </div>
  );
}
