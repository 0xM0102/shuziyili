import {
  sidebarContentPageClassName,
  standaloneWidePageClassName,
} from "@/lib/page-layout";
import { joinClassNames } from "@/lib/class-names";
import { LoadingSpinner } from "./loading-spinner";

type PageLoadingVariant = "route" | "standalone" | "sidebar" | "section";

type PageLoadingProps = {
  className?: string;
  label?: string;
  size?: number;
  variant?: PageLoadingVariant;
};

const variantClassNames: Record<PageLoadingVariant, string> = {
  route: "flex min-h-[45dvh] w-full items-center justify-center px-4 py-16",
  standalone: `${standaloneWidePageClassName} flex min-h-[45dvh] items-center justify-center`,
  sidebar: `${sidebarContentPageClassName} flex min-h-[45dvh] items-center justify-center`,
  section: "flex min-h-[18rem] w-full items-center justify-center px-4 py-10",
};

export function PageLoading({
  className,
  label = "页面加载中",
  size = 72,
  variant = "route",
}: PageLoadingProps) {
  return (
    <div className={joinClassNames(variantClassNames[variant], className)}>
      <LoadingSpinner label={label} size={size} />
    </div>
  );
}
