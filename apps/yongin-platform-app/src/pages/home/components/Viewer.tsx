import { Widget, cn } from "@pf-dev/ui";
import { ViewerProps } from "./types";

export function Viewer({ id, className }: ViewerProps) {
  return (
    <Widget id={id} className={cn(className, "4k:text-4xl 4k:p-8")} contentClassName="h-full">
      Viewer
    </Widget>
  );
}
