import { useState, useEffect } from "react";
import type { SafersCCTV, TimeRange } from "@/services";

interface ControlPanelProps {
  cctvs: SafersCCTV[];
  selectedCCTV: SafersCCTV | null;
  isLoading: boolean;
  selectedDate: Date;
  includeNextDay: boolean;
  timeRange: TimeRange | null;
  validationError: string | null;
  onSelectCCTV: (cctv: SafersCCTV | null) => void;
  onDateChange: (date: Date) => void;
  onIncludeNextDayChange: (include: boolean) => void;
  onRequestPlayback: () => void;
  isMobile?: boolean;
}

function formatMinutesToTime(
  totalMinutes: number,
  baseDate: Date,
  includeNextDay: boolean
): string {
  const days = Math.floor(totalMinutes / 1440);
  const minutes = totalMinutes % 1440;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (includeNextDay && days > 0) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    return `${dateStr} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function ControlPanel({
  cctvs,
  selectedCCTV,
  isLoading,
  selectedDate,
  includeNextDay,
  timeRange,
  validationError,
  onSelectCCTV,
  onDateChange,
  onIncludeNextDayChange,
  onRequestPlayback,
  isMobile,
}: ControlPanelProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const canRequest = selectedCCTV && timeRange && !validationError;

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  // 모바일 레이아웃: 접을 수 있는 아코디언
  if (isMobile) {
    return (
      <div className="border-b border-[#2A2D3A] bg-[#1A1D27]">
        {/* 아코디언 헤더 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-semibold text-white">
            {selectedCCTV ? selectedCCTV.name : "CCTV 선택"}
            {selectedCCTV && timeRange && (
              <span className="ml-2 text-xs font-normal text-white/40">
                {formatMinutesToTime(timeRange.start, selectedDate, includeNextDay)} ~{" "}
                {formatMinutesToTime(timeRange.end, selectedDate, includeNextDay)}
              </span>
            )}
          </span>
          <svg
            className={`h-4 w-4 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* CCTV 선택 — 드롭다운 */}
            <section>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-white/40">
                CCTV 선택
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center rounded-lg bg-[#252833] px-4 py-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                </div>
              ) : cctvs.length === 0 ? (
                <p className="rounded-lg bg-[#252833] px-4 py-3 text-sm text-white/30">
                  등록된 CCTV가 없습니다
                </p>
              ) : (
                <select
                  value={selectedCCTV?.id ?? ""}
                  onChange={(e) => {
                    const cctv = cctvs.find((c) => c.id === Number(e.target.value));
                    onSelectCCTV(cctv ?? null);
                  }}
                  className="w-full rounded-lg border border-[#2A2D3A] bg-[#252833] px-4 py-3 text-sm text-white outline-none focus:border-brand"
                >
                  <option value="">선택하세요</option>
                  {cctvs.map((cctv) => (
                    <option key={cctv.id} value={cctv.id}>
                      {cctv.name}
                      {cctv.nvrName ? ` · ${cctv.nvrName}` : ""}
                      {cctv.channel != null ? ` · CH-${String(cctv.channel).padStart(2, "0")}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {/* 날짜 선택 — 네이티브 input */}
            <section>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-white/40">
                날짜
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  if (y && m && d) onDateChange(new Date(y, m - 1, d));
                }}
                className="w-full rounded-lg border border-[#2A2D3A] bg-[#252833] px-4 py-3 text-sm text-white outline-none focus:border-brand"
              />
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={includeNextDay}
                  onChange={(e) => onIncludeNextDayChange(e.target.checked)}
                  className="h-4 w-4 rounded border-[#2A2D3A] bg-[#252833] accent-brand"
                />
                다음날까지 포함 (48h)
              </label>
            </section>

            {/* 선택된 범위 */}
            {timeRange && (
              <section>
                <div className="flex items-center justify-between rounded-lg border border-[#2A2D3A] bg-[#252833] px-4 py-2.5 text-sm">
                  <span className="text-white/50">
                    {formatMinutesToTime(timeRange.start, selectedDate, includeNextDay)}
                  </span>
                  <span className="text-white/30">~</span>
                  <span className="text-white/50">
                    {formatMinutesToTime(timeRange.end, selectedDate, includeNextDay)}
                  </span>
                </div>
              </section>
            )}

            {/* 재생 버튼 */}
            <button
              disabled={!canRequest}
              onClick={() => {
                onRequestPlayback();
                setIsExpanded(false);
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                canRequest
                  ? "bg-brand text-white hover:bg-brand/90"
                  : "cursor-not-allowed bg-[#252833] text-white/20"
              }`}
              style={{ minHeight: 44 }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              재생 요청
            </button>
            {validationError && (
              <p className="text-center text-xs text-error-brand">{validationError}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // 데스크톱 레이아웃 (기존 유지)
  return (
    <div className="flex h-full flex-col p-5">
      {/* CCTV 선택 — 스크롤 영역 */}
      <section className="mb-5 flex min-h-0 shrink flex-col">
        <label className="mb-2 block shrink-0 text-xs font-semibold tracking-wide text-white/40">
          CCTV 선택
        </label>
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg bg-[#252833] px-4 py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          </div>
        ) : cctvs.length === 0 ? (
          <p className="rounded-lg bg-[#252833] px-4 py-3 text-sm text-white/30">
            등록된 CCTV가 없습니다
          </p>
        ) : (
          <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">
            {cctvs.map((cctv) => (
              <button
                key={cctv.id}
                onClick={() => onSelectCCTV(cctv)}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                  selectedCCTV?.id === cctv.id
                    ? "bg-brand/15 text-brand border border-brand/30"
                    : "border border-transparent bg-[#252833] text-white/70 hover:bg-[#2A2D3A] hover:text-white"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    selectedCCTV?.id === cctv.id ? "bg-brand" : "bg-white/20"
                  }`}
                />
                <div className="flex flex-col">
                  <span>{cctv.name}</span>
                  {(cctv.nvrName || cctv.channel != null) && (
                    <span className="text-xs text-white/30">
                      {[
                        cctv.nvrName,
                        cctv.channel != null ? `CH-${String(cctv.channel).padStart(2, "0")}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 날짜 선택 */}
      <section className="shrink-0">
        <label className="mb-2 block text-xs font-semibold tracking-wide text-white/40">날짜</label>
        <div className="relative">
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex w-full items-center gap-3 rounded-lg border border-[#2A2D3A] bg-[#252833] px-4 py-2.5 text-sm text-white transition-colors hover:border-white/20"
          >
            <svg
              className="h-4 w-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {dateStr}
          </button>
          {isCalendarOpen && (
            <SimpleDateCalendar
              value={selectedDate}
              onChange={(d) => {
                onDateChange(d);
                setIsCalendarOpen(false);
              }}
              onClose={() => setIsCalendarOpen(false)}
            />
          )}
        </div>

        {/* 다음날까지 체크 */}
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={includeNextDay}
            onChange={(e) => onIncludeNextDayChange(e.target.checked)}
            className="h-4 w-4 rounded border-[#2A2D3A] bg-[#252833] accent-brand"
          />
          다음날까지 포함 (48h)
        </label>
      </section>

      {/* 선택된 범위 */}
      {timeRange && (
        <section className="mt-5 shrink-0">
          <label className="mb-2 block text-xs font-semibold tracking-wide text-white/40">
            선택된 범위
          </label>
          <div className="rounded-lg border border-[#2A2D3A] bg-[#252833] px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">시작</span>
              <span className="font-mono text-white">
                {formatMinutesToTime(timeRange.start, selectedDate, includeNextDay)}
              </span>
            </div>
            <div className="my-2 border-t border-[#2A2D3A]" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">종료</span>
              <span className="font-mono text-white">
                {formatMinutesToTime(timeRange.end, selectedDate, includeNextDay)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 재생 버튼 */}
      <div className="shrink-0 pt-4">
        <button
          disabled={!canRequest}
          onClick={onRequestPlayback}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
            canRequest
              ? "bg-brand text-white hover:bg-brand/90"
              : "cursor-not-allowed bg-[#252833] text-white/20"
          }`}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          재생 요청
        </button>
        {validationError && (
          <p className="mt-2 text-center text-xs text-error-brand">{validationError}</p>
        )}
      </div>
    </div>
  );
}

/** 다크 테마 인라인 캘린더 */
function SimpleDateCalendar({
  value,
  onChange,
  onClose,
}: {
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}) {
  const [viewDate, setViewDate] = useState(new Date(value));

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-calendar]")) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div
      data-calendar
      className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-[#2A2D3A] bg-[#1A1D27] p-4 shadow-xl"
    >
      {/* 네비게이션 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="rounded p-1 text-white/40 hover:bg-[#252833] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">
          {year}년 {month + 1}월
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="rounded p-1 text-white/40 hover:bg-[#252833] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-white/30">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day ? (
              <button
                onClick={() => onChange(new Date(year, month, day))}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                  value.getFullYear() === year &&
                  value.getMonth() === month &&
                  value.getDate() === day
                    ? "bg-brand font-bold text-white"
                    : "text-white/70 hover:bg-[#252833] hover:text-white"
                }`}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
