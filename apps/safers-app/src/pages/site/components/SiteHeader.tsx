import { useNavigate } from "react-router-dom";
import { HeaderClock } from "@/pages/home/components/HeaderClock";
import { HeaderUserInfo } from "@/pages/home/components/HeaderUserInfo";

interface SiteHeaderProps {
  siteName: string;
  isDarkMap?: boolean;
  onToggleMapStyle?: () => void;
}

export function SiteHeader({ siteName, isDarkMap = false, onToggleMapStyle }: SiteHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-between bg-white/80 px-4 shadow-[0_3px_3px_rgba(164,164,164,0.15)] backdrop-blur-[5px]">
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

      {/* 우측: 다크모드 토글 + 알림 + 사용자 */}
      <div className="flex items-center gap-2">
        {onToggleMapStyle && (
          <button
            type="button"
            onClick={onToggleMapStyle}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0] transition-colors hover:bg-[#E5E5E5]"
            aria-label={isDarkMap ? "주간 모드로 전환" : "야간 모드로 전환"}
          >
            {isDarkMap ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="#F59E0B" />
                <path
                  d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.07 15.07A8.5 8.5 0 0 1 8.93 2.93a8.5 8.5 0 1 0 12.14 12.14Z"
                  fill="#1E293B"
                />
              </svg>
            )}
          </button>
        )}
        <HeaderUserInfo />
      </div>
    </div>
  );
}
