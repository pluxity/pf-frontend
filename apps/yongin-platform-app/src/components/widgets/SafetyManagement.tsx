import { Widget } from "@pf-dev/ui";
import type { BaseWidgetProps } from "./types";
import safetyManagementImg from "@/assets/images/safety-management.svg";

export function SafetyManagement({ id, className }: BaseWidgetProps) {
  return (
    <Widget id={id} className={className} contentClassName="h-full">
      <div className="flex flex-col h-full">
        <span className="font-bold">안전 관리</span>
        <div className="flex-1 flex items-center justify-center min-h-0">
          {/* TODO: 안전관리 사이트 URL 확정 후 새탭 이동(target="_blank") 연결 */}
          <a href="#" className="block h-full">
            <img
              src={safetyManagementImg}
              alt="안전관리"
              className="w-full h-full object-contain"
            />
          </a>
        </div>
      </div>
    </Widget>
  );
}
