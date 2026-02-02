import { Widget, cn } from "@pf-dev/ui";
import { AttendanceProps } from "./types";

export function Attendance({ id, className }: AttendanceProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="font-bold mb-2">출역현황 타이틀</div>
      <div className="text-sm">출역현황 컨텐츠</div>
    </Widget>
  );
}
