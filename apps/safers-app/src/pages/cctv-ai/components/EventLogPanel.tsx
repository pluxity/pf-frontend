import { useEffect, useRef, useState } from "react";
import type { StompEventResponse, StompEventType, ConnectionStatus } from "@/services";

// ─── 이벤트 타입 → 표시 정보 ───

type DisplayLevel = "danger" | "warning" | "info";

interface EventTypeConfig {
  label: string;
  level: DisplayLevel;
}

const EVENT_TYPE_CONFIG: Record<StompEventType, EventTypeConfig> = {
  NO_HELMET: { label: "안전모 미착용", level: "danger" },
  FALLEN_PERSON: { label: "쓰러짐 감지", level: "danger" },
  INTRUSION: { label: "침입 감지", level: "warning" },
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

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`flex w-full gap-3 border-b border-[#2A2D3A] px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-[#252833] ${
        isSelected ? "bg-[#252833] ring-1 ring-inset ring-brand/40" : ""
      }`}
    >
      {/* 썸네일 */}
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-[#252833]">
        {hasSnapshot ? (
          <img
            src={event.snapshot!.url}
            alt={config.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-5 w-5 text-white/20"
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
        <div className="absolute bottom-0.5 right-0.5">
          {hasVideo ? (
            <span className="inline-flex items-center rounded bg-green-500/90 px-1 py-px text-[0.5rem] font-bold text-white">
              <svg className="mr-0.5 h-2 w-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              영상
            </span>
          ) : (
            <span className="inline-flex items-center rounded bg-white/20 px-1 py-px text-[0.5rem] text-white/60 backdrop-blur-sm">
              <svg
                className="mr-0.5 h-2 w-2 animate-spin"
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
        <div className="flex items-center gap-2">
          {/* 레벨 badge */}
          <span
            className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.625rem] font-bold ${style.badge}`}
          >
            {LEVEL_LABEL[config.level]}
          </span>

          {/* 타입 + 신뢰도 */}
          <span className="truncate text-xs text-white/80">{config.label}</span>
          {event.confidence != null && (
            <span className="shrink-0 text-[0.625rem] text-white/30">
              {(event.confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 카메라 이름 */}
          <span className="text-[0.625rem] text-white/40">{event.name}</span>
          <span className="text-[0.625rem] text-white/20">|</span>
          {/* 시간 */}
          <span className="font-mono text-[0.625rem] text-white/30">
            {formatTime(event.timestamp)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── EventLogPanel ───

interface EventLogPanelProps {
  events: StompEventResponse[];
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  selectedEventId: string | null;
  onSelectEvent: (event: StompEventResponse) => void;
}

export function EventLogPanel({
  events,
  connectionStatus,
  isLoading,
  selectedEventId,
  onSelectEvent,
}: EventLogPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [filterText, setFilterText] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  // 필터 적용
  const filtered = filterText
    ? events.filter((e) => {
        const q = filterText.toLowerCase();
        const config = EVENT_TYPE_CONFIG[e.type];
        return (
          config.label.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      })
    : events;

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length, autoScroll]);

  function handleScroll() {
    if (!listRef.current) return;
    setAutoScroll(listRef.current.scrollTop < 10);
  }

  // 레벨별 카운트
  const counts: Record<DisplayLevel, number> = { danger: 0, warning: 0, info: 0 };
  for (const e of events) {
    counts[EVENT_TYPE_CONFIG[e.type].level]++;
  }

  return (
    <div className="flex h-full flex-col">
      {/* 상단: 필터 입력 */}
      <div className="border-b border-[#2A2D3A] p-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="이벤트 필터링... (유형, 카메라명)"
            className="w-full rounded-md border border-[#2A2D3A] bg-[#252833] py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand"
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
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

      {/* 필터 결과 요약 */}
      <div className="flex items-center justify-between border-b border-[#2A2D3A] px-3 py-1.5">
        <span className="text-xs text-white/40">
          {filterText
            ? `${filtered.length}건 / 전체 ${events.length}건`
            : `전체 ${events.length}건`}
        </span>
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              if (listRef.current) listRef.current.scrollTop = 0;
            }}
            className="text-xs text-brand hover:text-brand/80"
          >
            최신으로 이동
          </button>
        )}
      </div>

      {/* 이벤트 리스트 */}
      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/30">
            {filterText ? "일치하는 이벤트 없음" : "이벤트 대기 중..."}
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
      </div>

      {/* 하단 상태바 */}
      <div className="flex items-center justify-between border-t border-[#2A2D3A] px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-400"
                : connectionStatus === "connecting"
                  ? "animate-pulse bg-yellow-400"
                  : "bg-red-400"
            }`}
          />
          <span className="text-xs text-white/40">
            {connectionStatus === "connected"
              ? "실시간 연결됨"
              : connectionStatus === "connecting"
                ? "연결 중..."
                : "연결 끊김"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span>
            위험 <span className="text-[#FF6B6B]">{counts.danger}</span>
          </span>
          <span>
            경고 <span className="text-[#FDC200]">{counts.warning}</span>
          </span>
          <span>
            정보 <span className="text-[#4D7EFF]">{counts.info}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
