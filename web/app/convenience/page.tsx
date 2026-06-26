import type { Metadata } from "next";
import {
  ConvenienceCategoryCard,
  ConvenienceEmergencyCard,
  ConvenienceStatCard,
} from "@/components/convenience/convenience-cards";
import { ConvenienceServiceCard } from "@/components/convenience/convenience-service-card";
import { SectionHead } from "@/components/layout/section-head";
import { fetchConveniencePayload } from "@/lib/convenience-api";
import {
  filterConvenienceServices,
  getEmergencyConvenienceServices,
} from "@/lib/convenience-data";
import { sidebarContentWidthClassName } from "@/lib/page-layout";
import { parseFirstQueryValue } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "便民",
  description: "伊犁便民黄页：政务、医疗、快递、交通、通信、银行、采购、维修与应急电话。",
  alternates: { canonical: "/convenience" },
};

type PageProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

export default async function BianminPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = parseFirstQueryValue(params.q)?.trim() ?? "";
  const { categories, services } = await fetchConveniencePayload();
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));
  const filteredServices = filterConvenienceServices(query, categories, services);
  const emergencyServices = getEmergencyConvenienceServices(services);
  const pendingCount = services.filter((item) => item.status === "pending").length;

  return (
    <div className={`${sidebarContentWidthClassName} bg-background`}>
      <section className="border-b border-border px-4 py-8 md:px-5 md:py-10">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            找电话、找网点、找办事入口
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            先把高频生活服务集中到一个入口：政务、医疗、快递、交通、通信、银行、
            采购、维修与应急电话。标记为「外部平台」的条目只做来源跳转，具体发布内容以来源页面为准。
          </p>

          <form action="/convenience" className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="convenience-search">
              搜索便民服务
            </label>
            <input
              id="convenience-search"
              name="q"
              defaultValue={query}
              placeholder="搜索医院、快递、电话卡、缴费、维修..."
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
            >
              搜索
            </button>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ConvenienceStatCard value={categories.length} label="服务分类" />
            <ConvenienceStatCard value={services.length} label="目录项" />
            <ConvenienceStatCard value={pendingCount} label="待运营核实" />
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-8 md:px-5 md:py-10">
        <SectionHead title="常用入口" />
        <p className="mt-2 text-sm text-muted">按问题找服务，分类页会展示对应服务目录。</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => (
            <ConvenienceCategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-sidebar-hover/40 px-4 py-8 md:px-5 md:py-10">
        <SectionHead title="应急专区" dotTone="pink" />
        <p className="mt-2 text-sm text-muted">紧急情况优先拨打对应号码，并清楚说明当前位置。</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {emergencyServices.map((service) => (
            <ConvenienceEmergencyCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="px-4 py-8 md:px-5 md:py-10">
        <SectionHead title={query ? "搜索结果" : "精选服务"} />
        <p className="mt-2 text-sm text-muted">
          {query
            ? `关键词「${query}」共找到 ${filteredServices.length} 条服务。`
            : "优先展示高频服务、外部来源和待核实目录。"}
        </p>

        {filteredServices.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredServices.map((service) => (
              <ConvenienceServiceCard
                key={service.id}
                service={service}
                category={categoryBySlug.get(service.category)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-medium text-foreground">没有找到匹配的便民服务</p>
            <p className="mt-2 text-sm text-muted">可以换个关键词，或先查看左侧分类入口。</p>
          </div>
        )}
      </section>
    </div>
  );
}
