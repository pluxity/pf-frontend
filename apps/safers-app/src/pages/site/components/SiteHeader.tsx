import { useNavigate } from "react-router-dom";
import { HeaderClock } from "@/pages/home/components/HeaderClock";
import { HeaderUserInfo } from "@/pages/home/components/HeaderUserInfo";
import { SegmentedSwitch } from "./SegmentedSwitch";
import type { MapStyleKey } from "./mapbox-viewer";

const MAP_STYLE_OPTIONS: { value: MapStyleKey; label: string; ariaLabel: string }[] = [
  { value: "day", label: "Day", ariaLabel: "주간 모드" },
  { value: "mono", label: "Mono", ariaLabel: "모노 모드" },
  { value: "night", label: "Night", ariaLabel: "야간 모드" },
];

interface SiteHeaderProps {
  siteName: string;
  mapStyle: MapStyleKey;
  onMapStyleChange: (style: MapStyleKey) => void;
}

export function SiteHeader({ siteName, mapStyle, onMapStyleChange }: SiteHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-between bg-white/80 px-4 shadow-[0_0.1875rem_0.1875rem_rgba(164,164,164,0.15)] backdrop-blur-[0.3125rem]">
      {/* 좌측: 햄버거 메뉴 + 시계 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex h-10 w-10 items-center justify-center rounded-[0.9375rem] text-[#55596C] transition-colors hover:bg-neutral-100"
          aria-label="메뉴"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path
              d="M1 1h16M1 7h16M1 13h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <HeaderClock />
      </div>

      {/* 중앙: 로고 + 현장명 */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
        <span className="text-xl font-bold text-[#555555]">{siteName}</span>
      </div>

      {/* 우측: 맵 스타일 토글 + 사용자 */}
      <div className="flex items-center gap-2">
        <SegmentedSwitch
          options={MAP_STYLE_OPTIONS}
          value={mapStyle}
          onValueChange={onMapStyleChange}
        />
        <HeaderUserInfo />
      </div>
    </div>
  );
}
