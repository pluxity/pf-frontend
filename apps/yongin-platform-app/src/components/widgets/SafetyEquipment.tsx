import { Widget, cn } from "@pf-dev/ui";
import type { SafetyEquipmentProps } from "./types";

export function SafetyEquipment({ id, className }: SafetyEquipmentProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        <span>안전 장비 위젯</span>
      </div>
    </Widget>
  );
}
