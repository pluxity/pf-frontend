import { Widget, cn } from "@pf-dev/ui";
import { useProcessStatus } from "@/hooks";
import type { ProcessStatusProps } from "./types";

function ProgressBar({
  value,
  color,
  className,
}: {
  value: number;
  color: string;
  className?: string;
}) {
  return (
    <div className={cn("h-6 w-full rounded-sm bg-neutral-200/50 4k:h-10", className)}>
      <div
        className={cn("h-full rounded-sm transition-all duration-500", color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function ProcessStatus({ id, className }: ProcessStatusProps) {
  const { items, overallPlanned, overallActual } = useProcessStatus();

  return (
    <Widget
      id={id}
      title="공정현황"
      className={cn(className, "4k:text-4xl 4k:p-8")}
      contentClassName="h-full overflow-y-auto"
    >
      <div className="flex flex-col gap-3 4k:gap-6">
        <div className="flex flex-col gap-2 4k:gap-4">
          <div className="flex items-center gap-3 4k:gap-6">
            <span className="w-8 shrink-0 text-sm font-semibold 4k:w-16 4k:text-2xl">목표</span>
            <ProgressBar value={overallPlanned} color="bg-blue-300" />
            <span className="w-10 shrink-0 text-right text-sm 4k:w-20 4k:text-2xl">
              {overallPlanned}%
            </span>
          </div>
          <div className="flex items-center gap-3 4k:gap-6">
            <span className="w-8 shrink-0 text-sm font-semibold 4k:w-16 4k:text-2xl">실적</span>
            <ProgressBar value={overallActual} color="bg-blue-600" />
            <span className="w-10 shrink-0 text-right text-sm 4k:w-20 4k:text-2xl">
              {overallActual}%
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t pt-3 4k:gap-3 4k:pt-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 4k:gap-6">
                <span className="w-20 shrink-0 truncate text-xs text-neutral-600 4k:w-40 4k:text-xl">
                  {item.workType.name}
                </span>
                <ProgressBar
                  value={item.actualRate}
                  color="bg-blue-400/70"
                  className="h-4 4k:h-7"
                />
                <span className="w-10 shrink-0 text-right text-xs 4k:w-20 4k:text-xl">
                  {item.actualRate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
}
