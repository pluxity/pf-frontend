import { Widget, cn } from "@pf-dev/ui";
import type { IoT1Props } from "./types";

export function IoT1({ id, className }: IoT1Props) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        <span>Iot 위젯</span>
      </div>
    </Widget>
  );
}
