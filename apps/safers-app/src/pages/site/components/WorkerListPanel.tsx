import { cn } from "@pf-dev/ui";
import { DraggablePanel } from "./DraggablePanel";

// ─── Types ───

type WorkerStatus = "normal" | "abnormal";

interface WorkerEntry {
  id: string;
  name: string;
  status: WorkerStatus;
  info: string;
}

interface Attendance {
  working: number;
  standby: number;
  offDuty: number;
  absent: number;
}

interface WorkerListPanelProps {
  attendance: Attendance;
  workers: WorkerEntry[];
  selectedWorkerId?: string | null;
  onWorkerClick?: (workerId: string) => void;
  className?: string;
}

export type { WorkerEntry, WorkerStatus, Attendance };

// ─── Constants ───

const STAT_CARDS = [
  { key: "working" as const, label: "작업인원", bg: "#5E81F4", labelColor: "#0020AC", flex: true },
  { key: "standby" as const, label: "대기", bg: "#9F31FF", labelColor: "#1A032C", flex: false },
  { key: "offDuty" as const, label: "퇴근", bg: "#BBBFCF", labelColor: "#55596C", flex: false },
  { key: "absent" as const, label: "결근", bg: "#FF808B", labelColor: "#60021A", flex: false },
];

const STATUS_DOT: Record<WorkerStatus, string> = {
  normal: "bg-[#12C308]",
  abnormal: "bg-[#CA0014]",
};

// ─── Component ───

export function WorkerListPanel({
  attendance,
  workers,
  selectedWorkerId,
  onWorkerClick,
  className,
}: WorkerListPanelProps) {
  return (
    <DraggablePanel title="작업자 정보" className={cn("w-[18.75rem]", className)}>
      {/* 출근현황 카드 */}
      <div className="mt-3 flex overflow-hidden rounded-[0.3125rem]">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className={cn(
              "flex flex-col gap-[0.0625rem] px-[0.3125rem] py-[0.3125rem]",
              card.flex && "flex-1"
            )}
            style={{ backgroundColor: card.bg }}
          >
            <span className="text-[0.6875rem] leading-tight" style={{ color: card.labelColor }}>
              {card.label}
            </span>
            <span className="text-xs font-bold leading-tight text-white">
              {attendance[card.key]}명
            </span>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div className="mt-3 flex flex-1 flex-col overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="flex h-[1.875rem] shrink-0 items-center border-b border-[#BBC0CF] bg-[#DFE4EB]/90 [border-top:0.125rem_solid_#BBC0CF]">
          <div className="flex flex-1 items-center justify-center border-r border-[#BBC0CF] px-5 text-xs font-bold tracking-[-0.015rem] text-[#949AB1]">
            현재 작업 인원
          </div>
          <div className="flex w-[9.6875rem] items-center justify-center px-[0.3125rem] text-xs font-bold tracking-[-0.015rem] text-[#949AB1]">
            정보
          </div>
        </div>

        {/* 테이블 바디 */}
        <div className="flex-1 overflow-y-auto">
          {workers.map((worker) => {
            const isSelected = selectedWorkerId === worker.id;
            return (
              <button
                key={worker.id}
                type="button"
                onClick={() => onWorkerClick?.(worker.id)}
                className={cn(
                  "flex h-[1.5625rem] w-full items-center border-b border-[#BBC0CF] transition-colors hover:bg-[#F5F7FA]",
                  isSelected && "bg-[#EEF2FF]"
                )}
              >
                {/* 이름 열 */}
                <div className="flex flex-1 items-center justify-center gap-[0.3125rem] border-r border-[#BBC0CF] px-5">
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[worker.status])}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold tracking-[-0.015rem]",
                      isSelected ? "text-[#0057FF]" : "text-[#555]"
                    )}
                  >
                    {worker.name}
                  </span>
                </div>
                {/* 정보 열 */}
                <div className="w-[9.6875rem] truncate px-[0.3125rem] text-center text-xs tracking-[-0.015rem] text-[#555]">
                  {worker.info}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DraggablePanel>
  );
}
