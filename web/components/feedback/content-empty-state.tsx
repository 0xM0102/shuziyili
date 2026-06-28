import Image from "next/image";

/** 无内容占位插画（透明 WebP；须 `unoptimized` 以免 Next 优化去掉 Alpha）。 */
export const EMPTY_CONTENT_ILLUSTRATION = "/illustrations/empty-content.webp";
export const EMPTY_CONTENT_LABEL = "暂无内容";

const ILLUSTRATION_LABEL_COLOR = "#735037";
const ILLUSTRATION_LABEL_TOP = "55%";
const ILLUSTRATION_LABEL_LEFT = "52%";

const SIZE_PRESETS = {
  default: {
    maxWidth: "max-w-[400px] md:max-w-[520px]",
    width: 520,
    height: 347,
    sectionPadding: "py-10 md:py-14",
    labelClamp: "text-[clamp(0.8125rem,5.5cqw,1.25rem)]",
  },
  compact: {
    maxWidth: "max-w-[220px]",
    width: 260,
    height: 173,
    sectionPadding: "py-4",
    labelClamp: "text-[clamp(0.6875rem,4.5cqw,0.875rem)]",
  },
} as const;

type ContentEmptyStateProps = {
  className?: string;
  /** 叠在插画上的文案，默认「暂无内容」。 */
  label?: string;
  size?: keyof typeof SIZE_PRESETS;
  /** 是否显示虚线外框，嵌套在卡片内时可关闭。 */
  bordered?: boolean;
};

export function ContentEmptyState({
  className,
  label = EMPTY_CONTENT_LABEL,
  size = "default",
  bordered = true,
}: ContentEmptyStateProps) {
  const preset = SIZE_PRESETS[size];
  const sectionClass = [
    "flex flex-col items-center px-4 text-center",
    preset.sectionPadding,
    bordered ? "border border-dashed border-border" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass} role="status" aria-label={label}>
      <div className={`@container relative w-full ${preset.maxWidth}`}>
        <Image
          src={EMPTY_CONTENT_ILLUSTRATION}
          alt=""
          width={preset.width}
          height={preset.height}
          sizes={size === "compact" ? "220px" : "(max-width: 768px) 400px, 520px"}
          unoptimized
          className="h-auto w-full object-contain"
        />
        <p
          className={`pointer-events-none absolute w-max max-w-[70%] text-center font-semibold tracking-wide ${preset.labelClamp}`}
          style={{
            color: ILLUSTRATION_LABEL_COLOR,
            top: ILLUSTRATION_LABEL_TOP,
            left: ILLUSTRATION_LABEL_LEFT,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden="true"
        >
          {label}
        </p>
      </div>
    </section>
  );
}
