import { Widget, Spinner } from "@pf-dev/ui";
import type { BaseWidgetProps } from "./types";
import { useProcessStatus } from "@/hooks/useProcessStatus";

function OverallSection({ plannedRate, actualRate }: { plannedRate: number; actualRate: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* 목표 바 */}
      <div className="flex items-center gap-2">
        <span className="w-[1.875rem] shrink-0 text-sm font-bold text-[#55596C]">목표</span>
        <div className="relative h-4 flex-1 rounded-lg">
          <div
            className="flex items-center justify-end h-full rounded-lg px-1 min-w-fit"
            style={{
              width: `${Math.min(plannedRate, 100)}%`,
              background: "linear-gradient(to right, #CACACA, #646464)",
            }}
          >
            <span className="text-[0.625rem] text-white leading-none">{plannedRate}%</span>
          </div>
        </div>
      </div>
      {/* 실적 바 */}
      <div className="flex items-center gap-2">
        <span className="w-[1.875rem] shrink-0 text-sm font-bold text-[#55596C]">실적</span>
        <div className="relative h-4 flex-1 rounded-lg">
          <div
            className="flex items-center justify-end h-full rounded-lg px-1 min-w-fit"
            style={{
              width: `${Math.min(actualRate, 100)}%`,
              background: "linear-gradient(to right, #FFB033, #F37021)",
            }}
          >
            <span className="text-[0.625rem] text-white leading-none">{actualRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, actualRate }: { label: string; actualRate: number }) {
  return (
    <div className="flex items-center gap-2 pb-1.5">
      <span className="w-[3.75rem] shrink-0 truncate text-xs text-[#333]" title={label}>
        {label}
      </span>
      <div className="relative h-[0.1875rem] flex-1 rounded-full bg-[#CCC]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#333]"
          style={{ width: `${Math.min(actualRate, 100)}%` }}
        />
      </div>
      <span className="w-[2rem] shrink-0 text-right text-xs text-[#55596C]">{actualRate}%</span>
    </div>
  );
}

export function ProcessStatus({ id, className }: BaseWidgetProps) {
  const { overallStatus, workStatuses, isLoading, isError, error } = useProcessStatus();

  if (isLoading) {
    return (
      <Widget id={id} className={className} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Widget>
    );
  }

  if (isError) {
    return (
      <Widget id={id} className={className} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다."}
          </p>
        </div>
      </Widget>
    );
  }

  const overall = overallStatus ?? { plannedRate: 0, actualRate: 0 };

  return (
    <Widget id={id} className={className} contentClassName="h-full">
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-2.5 shrink-0">
          <div className="font-bold text-base text-[#333]">공정현황</div>
          <OverallSection plannedRate={overall.plannedRate} actualRate={overall.actualRate} />
        </div>

        {workStatuses.length > 0 && (
          <div className="flex flex-col gap-1.5 min-h-0 flex-1 overflow-y-auto mt-3 pt-2">
            {workStatuses.map((ws) => (
              <ProgressBar key={ws.id} label={ws.workTypeName} actualRate={ws.actualRate} />
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
}
