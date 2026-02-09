import { useNavigate } from "react-router-dom";
import { HeaderClock } from "@/pages/home/components/HeaderClock";
import { HeaderUserInfo } from "@/pages/home/components/HeaderUserInfo";

interface SiteHeaderProps {
  siteName: string;
}

export function SiteHeader({ siteName }: SiteHeaderProps) {
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

      {/* 우측: 알림 + 사용자 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[0.9375rem] text-[#55596C] transition-colors hover:bg-neutral-100"
          aria-label="알림"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6ZM8 15a2 2 0 1 0 4 0H8Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <HeaderUserInfo />
      </div>
    </div>
  );
}
