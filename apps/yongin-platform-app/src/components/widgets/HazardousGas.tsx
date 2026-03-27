import { Widget } from "@pf-dev/ui";
import type { BaseWidgetProps } from "./types";
import linkIcon from "@/assets/icons/link.svg";
import hazardousGasImg from "@/assets/images/hazardous-gas.svg";

export function HazardousGas({ id, className }: BaseWidgetProps) {
  return (
    <Widget id={id} className={className} contentClassName="h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="font-bold">유해가스 모니터링</span>
          <img src={linkIcon} alt="link icon" className="w-4 h-4" />
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          {/* TODO: URL 확정 후 새탭 이동(target="_blank") 연결 */}
          <a href="#" className="block w-full h-full">
            <img src={hazardousGasImg} alt="유해가스 모니터링" className="w-full" />
          </a>
        </div>
      </div>
    </Widget>
  );
}
