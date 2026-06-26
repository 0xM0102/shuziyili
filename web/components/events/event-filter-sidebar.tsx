import Link from "next/link";
import { SectionHead } from "@/components/layout/section-head";
import { eventCategoryLabel, eventStatusLabel, type EventCategory, type EventStatus } from "@/lib/events-data";
import {
  buildEventsPageHref,
  EVENT_CATEGORY_OPTIONS,
  EVENT_STATUS_OPTIONS,
} from "@/lib/events-filters";
import { sidebarFilterLinkClass } from "@/lib/sidebar-nav";

type Props = {
  selectedStatus: EventStatus;
  selectedCategory: EventCategory | "all";
};

function FilterCheckmark({ active }: { active: boolean }) {
  return active ? <span className="text-xs">✓</span> : null;
}

export function EventFilterSidebar({ selectedStatus, selectedCategory }: Props) {
  return (
    <aside className="border-b border-border bg-background lg:min-h-[calc(100vh-220px)] lg:border-b-0 lg:border-r">
      <div className="bg-background p-4 md:p-5">
        <SectionHead title="状态筛选" />
        <nav className="mt-4 space-y-1" aria-label="按活动状态筛选">
          {EVENT_STATUS_OPTIONS.map((status) => {
            const active = selectedStatus === status;
            return (
              <Link
                key={status}
                href={buildEventsPageHref(status, selectedCategory)}
                className={sidebarFilterLinkClass(active)}
              >
                <span>{eventStatusLabel[status]}</span>
                <FilterCheckmark active={active} />
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-border pt-6">
          <SectionHead title="类型筛选" />
          <nav className="mt-4 space-y-1" aria-label="按活动类型筛选">
            {EVENT_CATEGORY_OPTIONS.map((category) => {
              const active = selectedCategory === category;
              const label = category === "all" ? "全部类型" : eventCategoryLabel[category];
              return (
                <Link
                  key={category}
                  href={buildEventsPageHref(selectedStatus, category)}
                  className={sidebarFilterLinkClass(active)}
                >
                  <span>{label}</span>
                  <FilterCheckmark active={active} />
                </Link>
              );
            })}
          </nav>
          <Link href="/events" className="mt-4 inline-flex text-xs text-muted hover:text-primary">
            重置筛选
          </Link>
        </div>
      </div>
    </aside>
  );
}
