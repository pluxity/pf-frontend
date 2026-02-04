interface HeaderTitleProps {
  logo?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HeaderTitle({
  logo = "HOBAN",
  title = "SUMMIT",
  subtitle = "통합관제 플랫폼",
  className = "",
}: HeaderTitleProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* SVG 배경 */}
      <svg
        viewBox="0 0 500 63"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* 하단 주황색 그라데이션 라인 */}
        <line
          x1="75"
          y1="58.5"
          x2="425"
          y2="58.5"
          stroke="url(#headerTitleGradient)"
          strokeWidth="3"
        />

        {/* 흰색 커브 배경 (드롭섀도우 포함) */}
        <g filter="url(#headerTitleShadow)">
          <path
            d="M5 0H495L483.763 31.4564C478.076 47.3746 462.998 58 446.094 58H53.9058C37.0023 58 21.9236 47.3746 16.2371 31.4563L5 0Z"
            fill="white"
          />
        </g>

        <defs>
          {/* 드롭 섀도우 필터 */}
          <filter
            id="headerTitleShadow"
            x="0"
            y="-5"
            width="500"
            height="68"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="2.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.729544 0 0 0 0 0.765898 0 0 0 0 0.908654 0 0 0 1 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>

          {/* 주황색 그라데이션 (양쪽 페이드) */}
          <linearGradient
            id="headerTitleGradient"
            x1="75"
            y1="60.5"
            x2="425"
            y2="60.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF7500" stopOpacity="0" />
            <stop offset="0.2" stopColor="#FF7500" />
            <stop offset="0.8" stopColor="#FF7500" />
            <stop offset="1" stopColor="#FF7500" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 텍스트 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center pb-[2%]">
        <div className="flex items-baseline gap-2">
          {logo && (
            <span className="text-[clamp(0.75rem,1.5vw,1.25rem)] font-medium text-[#C47753]">
              {logo}
            </span>
          )}
          {title && (
            <span className="text-[clamp(1rem,2.5vw,2rem)] font-semibold tracking-wide text-neutral-700">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="text-[clamp(0.875rem,2vw,1.5rem)] font-medium text-neutral-600">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
