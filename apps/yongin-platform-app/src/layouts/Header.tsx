import { Button } from "@pf-dev/ui";
import ciLogo from "../assets/images/ci.svg";
import hobanLogo from "../assets/images/hoban.svg";
import arrowPrev from "@/assets/icons/arrow-prev.svg";
import arrowNext from "@/assets/icons/arrow-next.svg";
import playIcon from "@/assets/icons/play.svg";
import pauseIcon from "@/assets/icons/pause.svg";
import { DateTime } from "@/components/DateTime";
import { useDashboardStore, selectIsPlaying } from "@/stores/dashboard.store";
import { useSystemSettings } from "@/hooks";

const ADMIN_URL = import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : "/admin";

export function Header() {
  const isPlaying = useDashboardStore(selectIsPlaying);
  const togglePlay = useDashboardStore((select) => select.togglePlay);
  const prev = useDashboardStore((select) => select.prev);
  const next = useDashboardStore((select) => select.next);
  const { systemSettings } = useSystemSettings();
  const autoRollDisabled = (systemSettings?.rollingIntervalSeconds ?? 10) <= 0;

  return (
    <header className="relative h-[var(--header-height)] px-5">
      <div className="flex items-center justify-center h-full">
        <div className="flex w-full">
          <h1 className="flex-1 min-w-0 flex justify-start items-center">
            <img src={ciLogo} alt="경기주택도시공사" className="h-[2.25rem]" />
          </h1>
          <div className="flex-1 min-w-0 flex items-center justify-center gap-4">
            <img src={hobanLogo} alt="HOBAN" className="h-[1.9375rem]" />
            <span className="font-bold text-[1.875rem] text-[#555]">
              용인 플랫폼시티 1공구 스마트건설
            </span>
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-end gap-2.5">
            <div className="flex items-baseline gap-2.5 text-[#55596C]">
              <DateTime format="YYYY년 MM월 DD일(ddd)" className="font-bold text-base leading-4" />
              <DateTime format="HH:mm:ss" className="text-base leading-4" />
            </div>
            <div className="flex border border-[#999] rounded-[0.625rem]">
              <Button
                variant="ghost"
                className="w-8 h-10 p-0 rounded-l-[0.625rem] rounded-r-none"
                onClick={prev}
              >
                <img src={arrowPrev} alt="이전" className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="border-x border-[#999] rounded-none w-8 h-10 p-0"
                onClick={togglePlay}
                disabled={autoRollDisabled}
              >
                <img
                  src={isPlaying && !autoRollDisabled ? pauseIcon : playIcon}
                  alt={isPlaying && !autoRollDisabled ? "일시정지" : "재생"}
                  className={autoRollDisabled ? "w-5 h-5 opacity-30" : "w-5 h-5"}
                />
              </Button>
              <Button
                variant="ghost"
                className="w-8 h-10 p-0 rounded-r-[0.625rem] rounded-l-none"
                onClick={next}
              >
                <img src={arrowNext} alt="다음" className="w-5 h-5" />
              </Button>
            </div>
            <nav>
              <Button
                variant="ghost"
                size="icon"
                aria-label="관리자 페이지로 이동"
                onClick={() => window.open(ADMIN_URL, "_blank", "noopener,noreferrer")}
                className="bg-white/50 rounded-[0.9375rem] border border-[#999] w-10 h-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M11.2705 2.1582C12.2206 2.46844 13.0956 2.97043 13.8408 3.63184L15.7285 2.55176L17.999 6.44824L16.1133 7.52832C16.3167 8.49896 16.3167 9.50104 16.1133 10.4717L18 11.5518L15.7295 15.4482L13.8408 14.3682C13.0953 15.0297 12.22 15.5317 11.2695 15.8418V18H6.72852V15.8418C5.77874 15.5314 4.90413 15.0294 4.15918 14.3682L2.27148 15.4482L0.000976562 11.5518L1.88672 10.4717C1.68315 9.50105 1.68315 8.49895 1.88672 7.52832L0 6.44824L2.27051 2.55176L4.15918 3.63184C4.90441 2.97043 5.77937 2.46844 6.72949 2.1582V0H11.2705V2.1582ZM9 5C6.79086 5 5 6.79086 5 9C5 11.2091 6.79086 13 9 13C11.2091 13 13 11.2091 13 9C13 6.79086 11.2091 5 9 5Z"
                    fill="#9499B1"
                  />
                </svg>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
