import Link from "next/link";
import {
  buildConvenienceCategoryHref,
  type ConvenienceCategory,
  type ConvenienceService,
} from "@/lib/convenience-data";

export function ConvenienceStatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

export function ConvenienceCategoryCard({ category }: { category: ConvenienceCategory }) {
  return (
    <Link
      href={buildConvenienceCategoryHref(category.slug)}
      className="group border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-sidebar-hover"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground group-hover:text-primary">
          {category.shortTitle}
        </h2>
        <span className="text-xs text-muted" aria-hidden>
          →
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
        {category.description}
      </p>
    </Link>
  );
}

export function ConvenienceEmergencyCard({ service }: { service: ConvenienceService }) {
  return (
    <article className="border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{service.title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-primary">{service.contact}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{service.summary}</p>
    </article>
  );
}
