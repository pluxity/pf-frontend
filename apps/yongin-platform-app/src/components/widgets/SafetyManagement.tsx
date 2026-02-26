import { Widget, cn } from "@pf-dev/ui";
import type { SafetyManagementProps } from "./types";

export function SafetyManagement({ id, className }: SafetyManagementProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        <span>안전 관리 위젯</span>
      </div>
    </Widget>
  );
}
