import { useEffect, useRef, useState } from "react";
import { DraggablePanel } from "./DraggablePanel";
import type { SiteEvent, EventType } from "@/services";
import { EVENT_TYPE_SEVERITY } from "@/services";
import { STATUS_COLORS } from "@/styles/tokens";

// ─── Figma 디자인 토큰 ───

type Severity = "danger" | "warning" | "info";

const SEVERITY_COLORS: Record<
  Severity,
  { border: string; icon: string; text: string; cardBg: string; cardShadow: string }
> = {
  danger: {
    border: STATUS_COLORS.dangerDetection,
    icon: STATUS_COLORS.dangerDetection,
    text: STATUS_COLORS.dangerDetection,
    cardBg: "#FFE7E7",
    cardShadow: "0px 4px 4px rgba(255, 49, 36, 0.1)",
  },
  warning: {
    border: STATUS_COLORS.warningAlt,
    icon: STATUS_COLORS.warningAlt,
    text: "#9E6523",
    cardBg: "#FFFCEE",
    cardShadow: "0px 4px 4px rgba(255, 207, 36, 0.1)",
  },
  info: {
    border: "#4D7EFF",
    icon: "#4D7EFF",
    text: "#4D7EFF",
    cardBg: "#EBF1FF",
    cardShadow: "0px 4px 4px rgba(77, 126, 255, 0.1)",
  },
};

const SEVERITY_LABELS: Record<Severity, { ko: string; en: string }> = {
  danger: { ko: "위험", en: "Critical" },
  warning: { ko: "주의", en: "Minor" },
  info: { ko: "정보", en: "Info" },
};

type SortMode = "latest" | "grade";

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "지금";
  if (minutes < 60) return `${minutes}분전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간전`;
  return `${Math.floor(hours / 24)}일전`;
}

const SEVERITY_PRIORITY: Record<Severity, number> = { danger: 0, warning: 1, info: 2 };

function getSeverity(type: EventType): Severity {
  return EVENT_TYPE_SEVERITY[type];
}

// ─── 서브 컴포넌트 ───

function SummaryCard({ severity, count }: { severity: Severity; count: number }) {
  const colors = SEVERITY_COLORS[severity];
  const label = SEVERITY_LABELS[severity];

  return (
    <div
      className="flex flex-1 flex-col items-center rounded-[5px] px-3 py-2"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.cardShadow,
      }}
    >
      <svg width="16" height="15" viewBox="0 0 21 20" fill="none">
        <path d="M10.5 2L19.5 18H1.5L10.5 2Z" fill={colors.icon} />
        <text x="10.5" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
          !
        </text>
      </svg>
      <span
        className="mt-0.5 text-[0.6875rem] leading-none"
        style={{ color: colors.text, letterSpacing: "-0.18px" }}
      >
        {label.en}
      </span>
      <span
        className="mt-1 text-xl font-bold leading-none"
        style={{ color: colors.text, letterSpacing: "-0.42px" }}
      >
        {count}
      </span>
    </div>
  );
}

function EventRow({ event }: { event: SiteEvent }) {
  const [isNew, setIsNew] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 60_000);
    return () => clearTimeout(timer);
  }, []);

  const severity = getSeverity(event.type);
  const colors = SEVERITY_COLORS[severity];

  return (
    <div
      className="flex items-start gap-[11px] py-[12px] pl-[15px] pr-2"
      style={{ borderLeft: `5px solid ${colors.border}` }}
    >
      <div
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[5px]"
        style={{ backgroundColor: colors.icon }}
      >
        <svg width="14" height="16" viewBox="0 0 16 18" fill="none">
          <path
            d="M8 0C8 0 3 4 3 9C3 12 5 14 8 14C11 14 13 12 13 9C13 4 8 0 8 0ZM8 12C6.3 12 5 10.7 5 9C5 7 8 3 8 3C8 3 11 7 11 9C11 10.7 9.7 12 8 12Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[0.8125rem] leading-[1.2]"
          style={{ color: colors.text, letterSpacing: "-0.24px" }}
        >
          {event.name}
        </p>
        <div className="mt-[8px] flex items-center gap-[5px]">
          <span className="text-[0.75rem]" style={{ color: "#555B6C", letterSpacing: "-0.18px" }}>
            {relativeTime(event.timestamp)}
          </span>
          {isNew && (
            <span
              className="inline-flex h-[13px] items-center rounded-sm px-1 text-[0.5625rem] font-bold leading-none text-white"
              style={{ backgroundColor: "#FC4768" }}
            >
              N
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EventPanel ───

interface EventPanelProps {
  events: SiteEvent[];
  className?: string;
}

export function EventPanel({ events, className }: EventPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [sortMode, setSortMode] = useState<SortMode>("latest");

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length]);

  // 등급별 카운트
  const counts: Record<Severity, number> = { danger: 0, warning: 0, info: 0 };
  for (const e of events) {
    counts[getSeverity(e.type)]++;
  }

  // 정렬
  const sorted = [...events].sort((a, b) => {
    if (sortMode === "grade") {
      const diff = SEVERITY_PRIORITY[getSeverity(a.type)] - SEVERITY_PRIORITY[getSeverity(b.type)];
      if (diff !== 0) return diff;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <DraggablePanel title="이벤트 현황" className={className}>
      {/* 요약 카드 */}
      <div className="mt-2 flex gap-2">
        <SummaryCard severity="danger" count={counts.danger} />
        <SummaryCard severity="warning" count={counts.warning} />
        <SummaryCard severity="info" count={counts.info} />
      </div>

      {/* 정렬 토글 */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setSortMode("latest")}
          className="flex items-center gap-1 rounded-[5px] px-2 py-1 text-[0.8125rem] font-bold"
          style={{ color: sortMode === "latest" ? "#555B6C" : "#949AB0" }}
        >
          <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
            <path d="M4 0L7.5 5H0.5L4 0Z" fill={sortMode === "latest" ? "#555B6C" : "#949AB0"} />
          </svg>
          최신순
        </button>
        <button
          type="button"
          onClick={() => setSortMode("grade")}
          className="flex items-center gap-1 rounded-[5px] px-2 py-1 text-[0.8125rem] font-bold"
          style={{ color: sortMode === "grade" ? "#555B6C" : "#949AB0" }}
        >
          <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
            <path d="M4 0L7.5 5H0.5L4 0Z" fill={sortMode === "grade" ? "#555B6C" : "#949AB0"} />
          </svg>
          등급순
        </button>
      </div>

      <div className="mt-2 h-px w-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#999]">이벤트 데이터 없음</p>
      ) : (
        <div ref={listRef} className="mt-1 max-h-[20rem] overflow-y-auto">
          {sorted.map((event, i) => (
            <div key={event.id}>
              {i > 0 && <div className="mx-2 h-px" style={{ backgroundColor: "#BBBFCF" }} />}
              <EventRow event={event} />
            </div>
          ))}
        </div>
      )}
    </DraggablePanel>
  );
}
