import { BrandPanelBackdrop } from "@/components/brand/brand-panel-backdrop";
import { siteConfig } from "@/lib/site";

type Variant = "list" | "hero";

const logoTileClass: Record<Variant, string> = {
  list: "flex items-center justify-center rounded-md bg-white/90 p-1 shadow-sm shadow-black/30 transition-shadow group-hover:shadow-md group-hover:shadow-black/35",
  hero: "flex items-center justify-center rounded-xl bg-white/90 p-2 shadow-md shadow-black/35 md:p-2.5",
};

const imgClass: Record<Variant, string> = {
  list: "block h-7 w-auto max-w-[5.5rem] object-contain opacity-90",
  hero: "block h-14 w-auto max-w-[9rem] object-contain opacity-95 md:h-[4.5rem] md:max-w-[10rem]",
};

type Props = { variant?: Variant };

/**
 * 无封面图时的品牌占位：`siteConfig.logoPath`；衬底与登录弹窗左侧共用 `BrandPanelBackdrop`。
 */
export function SiteLogoPlaceholder({ variant = "list" }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <BrandPanelBackdrop />
      <div className="relative z-[1] flex h-full w-full items-center justify-center p-2 md:p-3">
        <div className={logoTileClass[variant]}>
          {/* eslint-disable-next-line @next/next/no-img-element -- public 品牌 SVG */}
          <img src={siteConfig.logoPath} alt="" width={160} height={160} className={imgClass[variant]} />
        </div>
      </div>
    </div>
  );
}
