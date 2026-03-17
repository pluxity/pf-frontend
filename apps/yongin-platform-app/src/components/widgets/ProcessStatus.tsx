import { Widget, Spinner } from "@pf-dev/ui";
import { ProcessStatusProps } from "./types";
import { useProcessStatus } from "@/hooks/useProcessStatus";

function OverallSection({ plannedRate, actualRate }: { plannedRate: number; actualRate: number }) {
  return (
    <div className="flex flex-col gap-[10px]">
      {/* 목표 바 */}
      <div className="flex items-center gap-2">
        <span className="w-[30px] shrink-0 text-[14px] font-bold text-[#55596C]">목표</span>
        <div className="relative h-[16px] flex-1 rounded-[8px] bg-[#E7E7E7]">
          <div
            className="h-full rounded-[8px]"
            style={{
              width: `${Math.min(plannedRate, 100)}%`,
              background: "linear-gradient(to right, #CACACA, #646464)",
            }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white">
            {plannedRate}%
          </span>
        </div>
      </div>
      {/* 실적 바 */}
      <div className="flex items-center gap-2">
        <span className="w-[30px] shrink-0 text-[14px] font-bold text-[#55596C]">실적</span>
        <div className="relative h-[16px] flex-1 rounded-[8px] bg-[#E7E7E7]">
          <div
            className="h-full rounded-[8px]"
            style={{
              width: `${Math.min(actualRate, 100)}%`,
              background: "linear-gradient(to right, #FFB033, #F37021)",
            }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white">
            {actualRate}%
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  actualRate,
  isLast,
}: {
  label: string;
  actualRate: number;
  isLast: boolean;
}) {
  return (
    <div
      className={
        isLast
          ? "flex items-center gap-2 pb-[6px]"
          : "flex items-center gap-2 pb-[6px] border-b border-[#E7E7E7]"
      }
    >
      <span className="w-[60px] shrink-0 truncate text-[12px] text-[#333]" title={label}>
        {label}
      </span>
      <div className="relative h-[3px] flex-1 rounded-full bg-[#CCC]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#333]"
          style={{ width: `${Math.min(actualRate, 100)}%` }}
        />
      </div>
      <span className="w-[32px] shrink-0 text-right text-[12px] text-[#55596C]">{actualRate}%</span>
    </div>
  );
}

export function ProcessStatus({ id, className }: ProcessStatusProps) {
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
        <div className="flex flex-col gap-[10px] shrink-0">
          <div className="font-bold text-[16px] text-[#333] tracking-[-0.16px]">공정현황</div>
          <OverallSection plannedRate={overall.plannedRate} actualRate={overall.actualRate} />
        </div>

        {workStatuses.length > 0 && (
          <div className="flex flex-col gap-[6px] min-h-0 flex-1 overflow-y-auto mt-3 pt-2">
            {workStatuses.map((ws, index) => (
              <ProgressBar
                key={ws.id}
                label={ws.workTypeName}
                actualRate={ws.actualRate}
                isLast={index === workStatuses.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
}
