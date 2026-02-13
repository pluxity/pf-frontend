import { Button, Settings } from "@pf-dev/ui";
import ciLogo from "../assets/images/ci.svg";
import hobanLogo from "../assets/images/hoban.svg";
import { DateTime } from "@/components/DateTime";
import { useDashboardStore, selectIsPlaying } from "@/stores/dashboard.store";

const ADMIN_URL = import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : "/admin";

export function Header() {
  const isPlaying = useDashboardStore(selectIsPlaying);
  const togglePlay = useDashboardStore((select) => select.togglePlay);
  const prev = useDashboardStore((select) => select.prev);
  const next = useDashboardStore((select) => select.next);

  return (
    <header className="relative h-[var(--header-height)] px-[0.75rem] bg-surface-body/70">
      <div className="flex flex-col gap-1 items-center justify-center">
        <div className="w-[41.25rem] h-[0.9375rem] rounded-b-[1.25rem] bg-linear-to-b from-white from-[23.33%] to-[rgba(78,176,255,0.2)] shadow-[0_0_0.3125rem_0_#BAC3E8]" />
        <div className="flex w-full gap-2">
          <h1 className="flex-1 min-w-0 flex justify-start items-center">
            <img src={ciLogo} alt="경기주택도시공사" className="h-[2.5em]" />
          </h1>
          <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
            <img src={hobanLogo} alt="HOBAN" className="h-[1.625rem]" />
            <span className="font-extrabold text-2xl text-[#555]">
              용인 플랫폼시티 1공구 스마트건설
            </span>
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
            <div className="flex items-center gap-2 text-lg text-[#55596C]">
              <DateTime format="YYYY년 MM월 DD일(ddd)" className="font-bold text-lg" />
              <DateTime format="HH:mm:ss" className="text-lg" />
            </div>
            <div className="border-1 border-gray-400 rounded-md">
              <Button variant="ghost" className="w-10 p-0" onClick={prev}>
                <img
                  src={`${import.meta.env.BASE_URL}assets/icons/arrow-prev.svg`}
                  alt="이전"
                  className="w-6 h-6"
                />
              </Button>
              <Button
                variant="ghost"
                className="border-x-1 border-gray-400 rounded-none w-10 p-0"
                onClick={togglePlay}
              >
                <img
                  src={`${import.meta.env.BASE_URL}assets/icons/${isPlaying ? "pause" : "play"}.svg`}
                  alt={isPlaying ? "일시정지" : "재생"}
                  className="w-6 h-6"
                />
              </Button>
              <Button variant="ghost" className="w-10 p-0" onClick={next}>
                <img
                  src={`${import.meta.env.BASE_URL}assets/icons/arrow-next.svg`}
                  alt="다음"
                  className="w-6 h-6"
                />
              </Button>
            </div>
            <nav>
              <Button
                variant="ghost"
                size="icon"
                aria-label="관리자 페이지로 이동"
                onClick={() => (window.location.href = ADMIN_URL)}
                className="bg-white rounded-lg w-[2.5rem] h-[2.5rem]"
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
