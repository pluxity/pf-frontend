import { Widget, cn } from "@pf-dev/ui";
import { AttendanceProps } from "./types";

export function Attendance({ id, className }: AttendanceProps) {
  return (
    <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
      <div className="font-bold mb-2 4k:text-4xl 4k:mb-6">출역현황 타이틀</div>
      <div className="text-sm 4k:text-3xl">출역현황 컨텐츠</div>
    </Widget>
  );
}
