import { useId } from "react";
import { joinClassNames } from "@/lib/class-names";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
  size?: number;
};

const css = `
@keyframes shuziyili-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes shuziyili-loader-dash {
  0% {
    stroke-dashoffset: 230;
  }
  50% {
    stroke-dashoffset: 48;
  }
  100% {
    stroke-dashoffset: -135;
  }
}

.shuziyili-loader-orbit {
  animation: shuziyili-loader-spin 1.35s linear infinite;
  transform-box: view-box;
  transform-origin: center;
}

.shuziyili-loader-tube {
  animation: shuziyili-loader-dash 1.35s ease-in-out infinite;
  stroke-dasharray: 92 230;
}

.shuziyili-loader-delay-1 {
  animation-delay: -0.18s;
}

.shuziyili-loader-delay-1 .shuziyili-loader-tube {
  animation-delay: -0.18s;
}

.shuziyili-loader-delay-2 {
  animation-delay: -0.36s;
}

.shuziyili-loader-delay-2 .shuziyili-loader-tube {
  animation-delay: -0.36s;
}

@media (prefers-reduced-motion: reduce) {
  .shuziyili-loader-orbit,
  .shuziyili-loader-tube {
    animation: none;
  }
}
`;

/** Loading animation adapted as a dependency-free SVG, using the site primary color. */
export function LoadingSpinner({
  className,
  label = "加载中",
  size = 72,
}: LoadingSpinnerProps) {
  const glowId = `shuziyili-loader-soft-glow-${useId().replace(/:/g, "")}`;

  return (
    <div
      className={joinClassNames("inline-flex items-center justify-center text-primary", className)}
      role="status"
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        className="block overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${glowId})`}>
          <g className="shuziyili-loader-orbit">
            <ellipse
              cx="64"
              cy="64"
              rx="46"
              ry="21"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.16"
            />
            <ellipse
              className="shuziyili-loader-tube"
              cx="64"
              cy="64"
              rx="46"
              ry="21"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>
        </g>
        <g transform="rotate(60 64 64)" filter={`url(#${glowId})`}>
          <g className="shuziyili-loader-orbit shuziyili-loader-delay-1">
            <ellipse
              cx="64"
              cy="64"
              rx="46"
              ry="21"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.12"
            />
            <ellipse
              className="shuziyili-loader-tube"
              cx="64"
              cy="64"
              rx="46"
              ry="21"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>
        </g>
        <g transform="rotate(120 64 64)" filter={`url(#${glowId})`}>
          <g className="shuziyili-loader-orbit shuziyili-loader-delay-2">
            <ellipse
              cx="64"
              cy="64"
              rx="46"
              ry="21"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.1"
            />
            <ellipse
              className="shuziyili-loader-tube"
              cx="64"
              cy="64"
              rx="46"
              ry="21"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
      <span className="sr-only">{label}</span>
      <style>{css}</style>
    </div>
  );
}
