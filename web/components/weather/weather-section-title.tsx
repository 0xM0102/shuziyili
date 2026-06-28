import { standaloneSectionTitleClassName } from "@/lib/page-layout";

type WeatherSectionTitleProps = {
  id?: string;
  children: string;
};

export function WeatherSectionTitle({ id, children }: WeatherSectionTitleProps) {
  return (
    <h2 id={id} className={standaloneSectionTitleClassName}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
      {children}
    </h2>
  );
}
