import { Widget, cn } from "@pf-dev/ui";
import { ManagementProps } from "./types";

export function Management({ id, className }: ManagementProps) {
  return (
    <Widget id={id} className={cn(className, "")} contentClassName="h-full">
      <div className="font-bold mb-2">주요 관리 사항 타이틀</div>
      <div className="text-sm">주요 관리 사항 컨텐츠</div>
    </Widget>
  );
}
