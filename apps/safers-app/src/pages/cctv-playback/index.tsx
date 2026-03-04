import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { SafersCCTV, TimeRange } from "@/services";
import { useCCTVStreams } from "@/hooks/useCCTVStreams";
import biLogo from "@/assets/images/BI.svg";
import { PlaybackPanel } from "./components/PlaybackPanel";
import { ControlPanel } from "./components/ControlPanel";

export function CCTVPlaybackPage() {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId: string }>();

  // 현장 CCTV 목록
  const { items, isLoading } = useCCTVStreams(Number(siteId));
  const cctvs = items.map((item) => item.cctv);

  // 선택된 CCTV
  const [selectedCCTV, setSelectedCCTV] = useState<SafersCCTV | null>(null);

  // 날짜/시간
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [includeNextDay, setIncludeNextDay] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null);

  const totalMinutes = includeNextDay ? 2880 : 1440;

  // 날짜 변경 시 타임라인 범위 초기화
  function handleDateChange(date: Date) {
    setSelectedDate(date);
    setTimeRange(null);
  }

  function handleIncludeNextDayChange(include: boolean) {
    setIncludeNextDay(include);
    if (!include && timeRange && timeRange.end > 1440) {
      setTimeRange(null);
    }
  }

  // 재생 요청
  function handleRequestPlayback() {
    if (!selectedCCTV || !timeRange) return;

    // TODO: 실제 API 연동 시 교체
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0F1117]">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#2A2D3A] px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center rounded-md p-1.5 text-white/60 transition-colors hover:bg-[#1A1D27] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <img src={biLogo} alt="Safers" className="h-6" />
            <span className="text-brand mb-[-0.25rem]">녹화영상</span>
          </h1>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex min-h-0 flex-1">
        {/* 좌측: 영상 + 타임라인 */}
        <section className="flex flex-[3] flex-col border-r border-[#2A2D3A] p-4">
          <PlaybackPanel
            selectedCCTV={selectedCCTV}
            totalMinutes={totalMinutes}
            timeRange={timeRange}
            baseDate={selectedDate}
            includeNextDay={includeNextDay}
            onTimeRangeChange={setTimeRange}
          />
        </section>

        {/* 우측: 컨트롤 패널 */}
        <section className="flex w-[22rem] shrink-0 flex-col border-l border-[#2A2D3A] bg-[#1A1D27]">
          <ControlPanel
            cctvs={cctvs}
            selectedCCTV={selectedCCTV}
            isLoading={isLoading}
            selectedDate={selectedDate}
            includeNextDay={includeNextDay}
            timeRange={timeRange}
            onSelectCCTV={setSelectedCCTV}
            onDateChange={handleDateChange}
            onIncludeNextDayChange={handleIncludeNextDayChange}
            onRequestPlayback={handleRequestPlayback}
          />
        </section>
      </main>
    </div>
  );
}
