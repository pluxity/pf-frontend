import { Widget, cn } from "@pf-dev/ui";
import { ProcessStatusProps } from "./types";

export function ProcessStatus({ id, className }: ProcessStatusProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="font-bold mb-2">공정현황 타이틀</div>
      <div className="text-sm">공정현황 컨텐츠</div>
    </Widget>
  );
}
