import { standaloneSectionTitleClassName } from "@/lib/page-layout";

type TravelSpotSectionTitleProps = {
  title: string;
  /** 标题前圆点颜色，默认 primary。 */
  accentClassName?: string;
};

/** 景区页区块标题（圆点 + 文案）。 */
export function TravelSpotSectionTitle({
  title,
  accentClassName = "bg-primary",
}: TravelSpotSectionTitleProps) {
  return (
    <h2 className={standaloneSectionTitleClassName}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${accentClassName}`} aria-hidden />
      {title}
    </h2>
  );
}
