import { Widget, cn } from "@pf-dev/ui";
import { DailyStatsProps } from "./types";

export function DailyStats({ id, className }: DailyStatsProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="font-bold mb-2">일일목표 타이틀</div>
      <div className="text-sm">일일목표 컨텐츠</div>
    </Widget>
  );
}
