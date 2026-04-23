import { ProgressChart } from "./ProgressChart";
import { PersonnelChart } from "./PersonnelChart";
import type { SiteDetail } from "@/services";

interface SiteInfoPanelProps {
  data: SiteDetail;
}

export function SiteInfoPanel({ data }: SiteInfoPanelProps) {
  return (
    <aside className="z-10 flex h-full w-[22rem] flex-shrink-0 flex-col gap-4 p-4">
      {/* 기성률 차트 */}
      <div className="flex h-1/2 flex-col rounded-lg border border-neutral-300 bg-white/80 p-4 backdrop-blur-sm">
        <ProgressChart data={data.progress} />
      </div>

      {/* 인원 현황 차트 */}
      <div className="flex flex-1 flex-col rounded-lg border border-neutral-300 bg-white/80 p-4 backdrop-blur-sm">
        <PersonnelChart data={data.personnel} total={data.totalPersonnel} />
      </div>
    </aside>
  );
}
