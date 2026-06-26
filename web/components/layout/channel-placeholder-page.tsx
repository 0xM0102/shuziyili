import Link from "next/link";
import { sidebarContentPageClassName, sidebarReadableClassName } from "@/lib/page-layout";

type PlaceholderAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type ChannelPlaceholderPageProps = {
  title: string;
  description: string;
  actions?: PlaceholderAction[];
};

export function ChannelPlaceholderPage({
  title,
  description,
  actions = [],
}: ChannelPlaceholderPageProps) {
  return (
    <div className={sidebarContentPageClassName}>
      <div className={`${sidebarReadableClassName} space-y-5`}>
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  action.variant === "primary"
                    ? "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    : "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-sidebar-hover"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
