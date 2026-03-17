import { Widget } from "@pf-dev/ui";
import type { BaseWidgetProps } from "./types";

export function IoTWidget({ id, className }: BaseWidgetProps) {
  return (
    <Widget id={id} className={className} contentClassName="h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        <span>Iot 위젯</span>
      </div>
    </Widget>
  );
}
