import {
  convenienceStatusLabel,
  type ConvenienceCategory,
  type ConvenienceService,
  type ConvenienceServiceStatus,
} from "@/lib/convenience-data";

function statusClassName(status: ConvenienceServiceStatus) {
  if (status === "common") return "border-primary/20 bg-primary/10 text-primary";
  if (status === "external") return "border-sky-500/20 bg-sky-500/10 text-sky-700";
  if (status === "verified") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  return "border-border bg-sidebar-hover text-muted";
}

export function ConvenienceServiceCard({
  service,
  category,
}: {
  service: ConvenienceService;
  category?: ConvenienceCategory;
}) {
  return (
    <article className="flex h-full flex-col border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-sidebar-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-primary">{category?.title ?? "便民服务"}</p>
          <h3 className="mt-1 text-base font-semibold leading-snug text-foreground">
            {service.title}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(service.status)}`}
        >
          {convenienceStatusLabel[service.status]}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{service.summary}</p>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="grid grid-cols-[4.5rem_1fr] gap-2">
          <dt className="text-muted">区域</dt>
          <dd className="min-w-0 text-foreground">{service.area}</dd>
        </div>
        <div className="grid grid-cols-[4.5rem_1fr] gap-2">
          <dt className="text-muted">电话</dt>
          <dd className="min-w-0 font-medium text-foreground">{service.contact}</dd>
        </div>
        <div className="grid grid-cols-[4.5rem_1fr] gap-2">
          <dt className="text-muted">时间</dt>
          <dd className="min-w-0 text-foreground">{service.hours}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-2">
          {service.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-sidebar-hover px-2 py-1 text-xs text-muted">
              {tag}
            </span>
          ))}
        </div>

        {service.sourceUrl ? (
          <a
            href={service.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            查看来源
          </a>
        ) : null}
      </div>
    </article>
  );
}
