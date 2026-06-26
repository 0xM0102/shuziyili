import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ConvenienceCategoryCard,
  ConvenienceStatCard,
} from "@/components/convenience/convenience-cards";
import { ConvenienceServiceCard } from "@/components/convenience/convenience-service-card";
import { SectionHead } from "@/components/layout/section-head";
import { fetchConveniencePayload } from "@/lib/convenience-api";
import {
  buildConvenienceCategoryHref,
  getConvenienceCategory,
  getConvenienceServicesByCategory,
} from "@/lib/convenience-data";
import { sidebarContentWidthClassName } from "@/lib/page-layout";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const data = await fetchConveniencePayload();
  return data.categories.map((item) => ({ category: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const data = await fetchConveniencePayload();
  const item = getConvenienceCategory(category, data.categories);
  if (!item) return { title: "未找到" };
  return {
    title: item.title,
    description: `${item.title}便民信息：${item.description}`,
    alternates: { canonical: buildConvenienceCategoryHref(item.slug) },
  };
}

export default async function BianminCategoryPage({ params }: Props) {
  const { category } = await params;
  const data = await fetchConveniencePayload();
  const item = getConvenienceCategory(category, data.categories);
  if (!item) notFound();

  const services = getConvenienceServicesByCategory(item.slug, data.services);
  const relatedCategories = data.categories.filter((entry) => entry.slug !== item.slug).slice(0, 4);
  const pendingCount = services.filter((service) => service.status === "pending").length;

  return (
    <div className={`${sidebarContentWidthClassName} bg-background`}>
      <section className="border-b border-border px-4 py-8 md:px-5 md:py-10">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {item.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{item.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ConvenienceStatCard value={services.length} label="目录项" />
            <ConvenienceStatCard value={pendingCount} label="待核实" />
            <ConvenienceStatCard value={item.keywords[0]} label="高频关键词" />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-sidebar-hover/40 px-4 py-5 md:px-5">
        <p className="max-w-4xl text-sm leading-relaxed text-muted">
          「待核实」表示信息仍需确认，请以官方渠道或来源页面为准；「外部平台」条目只做来源跳转。
        </p>
      </section>

      <section className="px-4 py-8 md:px-5 md:py-10">
        <SectionHead title="服务目录" />
        {services.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {services.map((service) => (
              <ConvenienceServiceCard key={service.id} service={service} category={item} />
            ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-medium text-foreground">暂无目录项</p>
            <p className="mt-2 text-sm text-muted">可以先回到便民总览查看其他分类。</p>
          </div>
        )}
      </section>

      <section className="border-t border-border px-4 py-8 md:px-5 md:py-10">
        <SectionHead title="其他便民分类" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {relatedCategories.map((entry) => (
            <ConvenienceCategoryCard key={entry.slug} category={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
