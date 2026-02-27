import { Button, Settings } from "@pf-dev/ui";
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
                onClick={() => (window.location.href = ADMIN_URL)}
                className="bg-white/50 rounded-[0.9375rem] border border-[#999] w-10 h-10"
              >
                <Settings size="lg" className="text-gray-600" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
