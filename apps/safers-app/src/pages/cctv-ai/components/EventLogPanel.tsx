import { useEffect, useRef, useState } from "react";
import type { StompEventResponse, StompEventType } from "@/services";
import aiCircleIcon from "@/assets/icons/ai-circle.svg";

// ─── 이벤트 타입 → 표시 정보 ───

type DisplayLevel = "danger" | "warning" | "info";

interface EventTypeConfig {
  label: string;
  level: DisplayLevel;
}

const EVENT_TYPE_CONFIG: Record<StompEventType, EventTypeConfig> = {
  NO_HELMET: { label: "안전모 미착용", level: "danger" },
  FALLEN_PERSON: { label: "쓰러짐 감지", level: "danger" },
  INTRUSION: { label: "위험지역 접근", level: "warning" },
  LINE_CROSSING: { label: "라인 크로싱", level: "warning" },
  EXIT: { label: "퇴장 감지", level: "warning" },
  HELMET: { label: "안전모 착용", level: "info" },
};

const LEVEL_STYLE: Record<DisplayLevel, { badge: string }> = {
  danger: { badge: "bg-[#CA0014]/20 text-[#FF6B6B]" },
  warning: { badge: "bg-[#FDC200]/20 text-[#FDC200]" },
  info: { badge: "bg-[#4D7EFF]/20 text-[#4D7EFF]" },
};

const LEVEL_LABEL: Record<DisplayLevel, string> = {
  danger: "위험",
  warning: "경고",
  info: "정보",
};

// ─── 시간 포맷 ───

function formatDateTime(isoStr: string): { date: string; time: string } {
  const d = new Date(isoStr);
  return {
    date: d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }),
    time: d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };
}

// ─── 이벤트 행 ───

interface EventRowProps {
  event: StompEventResponse;
  isSelected: boolean;
  onSelect: (event: StompEventResponse) => void;
}

function EventRow({ event, isSelected, onSelect }: EventRowProps) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const style = LEVEL_STYLE[config.level];
  const hasVideo = !!event.video?.url;
  const hasSnapshot = !!event.snapshot?.url;
  const { date, time } = formatDateTime(event.timestamp);

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`flex w-full gap-3 border-b border-[#2A2D3A] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#1E2130] ${
        isSelected ? "bg-[#1E2130] ring-1 ring-inset ring-brand/50" : ""
      }`}
    >
      {/* 썸네일 */}
      <div className="relative h-[4.5rem] w-[6.5rem] shrink-0 overflow-hidden rounded-md bg-[#252833]">
        {hasSnapshot ? (
          <img
            src={event.snapshot!.url}
            alt={config.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-6 w-6 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* 영상 상태 뱃지 */}
        <div className="absolute bottom-1 right-1">
          {hasVideo ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-green-500/90 px-1.5 py-0.5 text-[0.5625rem] font-bold text-white">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              영상
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[0.5625rem] text-white/60 backdrop-blur-sm">
              <svg
                className="h-2.5 w-2.5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              제작중
            </span>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* 레벨 badge */}
            <span
              className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-bold ${style.badge}`}
            >
              {LEVEL_LABEL[config.level]}
            </span>
            {event.confidence != null && (
              <span className="ml-auto shrink-0 text-xs text-white/30">
                {(event.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          {/* 이벤트 타입 */}
          <span className="text-sm font-medium text-white/90">{config.label}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 카메라 이름 */}
          <span className="truncate text-xs text-white/50">{event.name}</span>
          <span className="shrink-0 text-xs text-white/20">|</span>
          {/* 날짜 + 시간 */}
          <span className="shrink-0 font-mono text-xs text-white/40">
            {date} {time}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── EventLogPanel ───

interface EventLogPanelProps {
  events: StompEventResponse[];
  isLoading: boolean;
  isSearching?: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  selectedEventId: string | null;
  onSelectEvent: (event: StompEventResponse) => void;
  pendingCount?: number;
  onRefreshToLatest?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function EventLogPanel({
  events,
  isLoading,
  isSearching,
  query,
  onQueryChange,
  selectedEventId,
  onSelectEvent,
  pendingCount,
  onRefreshToLatest,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: EventLogPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(query);
  const [autoScroll, setAutoScroll] = useState(true);

  // 외부(STOMP 신규 이벤트)에서 query가 초기화되면 입력창도 초기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (query === "") setInputValue("");
  }, [query]);

  const filtered = events;

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length, autoScroll]);

  function handleScroll() {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setAutoScroll(scrollTop < 10);

    // 하단 150px 이내 도달 시 다음 페이지 로드
    if (scrollHeight - scrollTop - clientHeight < 150) {
      onLoadMore?.();
    }
  }

  // 레벨별 카운트
  const counts: Record<DisplayLevel, number> = { danger: 0, warning: 0, info: 0 };
  for (const e of events) {
    counts[EVENT_TYPE_CONFIG[e.type].level]++;
  }

  return (
    <div className="flex h-full flex-col">
      {/* 상단: SafeLog 타이틀 + AI 검색 입력 */}
      <div className="border-b border-[#2A2D3A] p-3">
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-white">
          <img src={aiCircleIcon} alt="" className="h-5 w-5" />
          <span className="text-lg flex-shrink-0 text-white leading-[unset]">SafeLog</span>
        </h2>
        <div className="relative">
          {/* AI 아이콘 or 검색 중 스피너 */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <svg className="h-4 w-4 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <img src={aiCircleIcon} alt="" className="h-4 w-4 opacity-50" />
            )}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onQueryChange(inputValue);
            }}
            placeholder="자연어로 검색  예) 어제 안전모 미착용"
            className="w-full rounded-md border border-[#2A2D3A] bg-[#252833] py-2 pl-9 pr-8 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand/60 transition-colors"
          />
          {inputValue && (
            <button
              onClick={() => {
                setInputValue("");
                if (onRefreshToLatest) onRefreshToLatest();
                else onQueryChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 레벨별 카운트 서머리 */}
      <div className="flex items-center gap-2 border-b border-[#2A2D3A] px-3 py-2">
        <div className="flex items-center gap-1.5 rounded-md bg-[#CA0014]/10 px-2 py-1">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF6B6B]" />
          <span className="text-xs font-bold text-[#FF6B6B]">{counts.danger}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#FDC200]/10 px-2 py-1">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#FDC200]" />
          <span className="text-xs font-bold text-[#FDC200]">{counts.warning}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-[#4D7EFF]/10 px-2 py-1">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#4D7EFF]" />
          <span className="text-xs font-bold text-[#4D7EFF]">{counts.info}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/40">{`전체 ${events.length}건`}</span>
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (listRef.current) listRef.current.scrollTop = 0;
              }}
              className="text-xs text-brand hover:text-brand/80"
            >
              최신으로
            </button>
          )}
        </div>
      </div>

      {/* 신규 이벤트 pill */}
      {(pendingCount ?? 0) > 0 && (
        <button
          onClick={onRefreshToLatest}
          className="flex w-full items-center justify-center gap-2 border-b border-[#2A2D3A] bg-brand/10 py-2 text-xs font-bold text-brand hover:bg-brand/20 transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />새 이벤트{" "}
          {pendingCount}건 · 최신으로
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* 이벤트 리스트 */}
      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/30">
            {query ? "검색 결과가 없습니다" : "이벤트 대기 중..."}
          </div>
        ) : (
          filtered.map((event) => (
            <EventRow
              key={event.eventId}
              event={event}
              isSelected={event.eventId === selectedEventId}
              onSelect={onSelectEvent}
            />
          ))
        )}

        {/* 무한스크롤 하단 상태 */}
        {!isLoading &&
          (isLoadingMore ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : !hasMore && events.length > 0 ? (
            <div className="py-4 text-center text-xs text-white/20">모든 이벤트를 불러왔습니다</div>
          ) : null)}
      </div>
    </div>
  );
}
