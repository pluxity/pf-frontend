import { Widget, cn, Spinner } from "@pf-dev/ui";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ProcessStatusProps } from "./types";
import { useProcessStatus } from "@/hooks/useProcessStatus";

const COLORS = {
  planned: "#94A3B8", // slate-400
  actual: "#3B82F6", // blue-500
  background: "#E2E8F0", // slate-200
};

function OverallSection({ plannedRate, actualRate }: { plannedRate: number; actualRate: number }) {
  const gaugeData = [
    { name: "actual", value: actualRate },
    { name: "remaining", value: 100 - actualRate },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="50%"
              innerRadius={18}
              outerRadius={26}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={COLORS.actual} />
              <Cell fill={COLORS.background} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-blue-600">{actualRate}%</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-7 shrink-0 text-[10px] text-gray-500">목표</span>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${Math.min(plannedRate, 100)}%`, backgroundColor: COLORS.planned }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-[10px] font-semibold text-gray-700">
            {plannedRate}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-7 shrink-0 text-[10px] text-gray-500">실적</span>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${Math.min(actualRate, 100)}%`, backgroundColor: COLORS.actual }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-[10px] font-semibold text-blue-600">
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
  plannedRate,
}: {
  label: string;
  actualRate: number;
  plannedRate: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 truncate text-xs text-gray-600" title={label}>
        {label}
      </span>
      <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all"
          style={{ width: `${Math.min(actualRate, 100)}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-gray-400"
          style={{ left: `${Math.min(plannedRate, 100)}%` }}
          title={`목표: ${plannedRate}%`}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-700">
        {actualRate}%
      </span>
    </div>
  );
}

export function ProcessStatus({ id, className }: ProcessStatusProps) {
  const { overallStatus, workStatuses, isLoading, isError, error } = useProcessStatus();

  if (isLoading) {
    return (
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Widget>
    );
  }

  if (isError) {
    return (
      <Widget id={id} className={cn(className, "")} contentClassName="h-full">
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
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-1.5 shrink-0">
          <div className="font-bold text-sm">공정현황</div>
          <OverallSection plannedRate={overall.plannedRate} actualRate={overall.actualRate} />
        </div>

        {workStatuses.length > 0 && (
          <div className="flex flex-col gap-1.5 min-h-0 flex-1 overflow-y-auto border-t border-gray-100 mt-3 pt-2">
            <div className="text-[11px] font-semibold text-gray-500 shrink-0">개별 공종</div>
            {workStatuses.map((ws) => (
              <ProgressBar
                key={ws.id}
                label={ws.workTypeName}
                actualRate={ws.actualRate}
                plannedRate={ws.plannedRate}
              />
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
}
