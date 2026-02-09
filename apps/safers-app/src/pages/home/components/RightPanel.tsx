import { EnvironmentMonitor } from "./EnvironmentMonitor";
import { mockEnvironments } from "../../../services/mocks/environments.mock";

export function RightPanel() {
  return (
    <aside className="z-10 flex h-full w-full flex-shrink-0 flex-col gap-4 p-4">
      <div className="flex items-center gap-2 rounded-3xl bg-[#FF7500] p-4 h-[3rem] text-white text-lg">
        {/* 현장 정보 영역 */}
      </div>

      {/* 현장 정보 + 날씨 */}
      <div className="rounded-lg h-[11rem] border border-neutral-300 bg-white/50 p-4">
        {/* 현장 정보 + 날씨 영역 */}
      </div>

      {/* 환경 데이터 */}
      <div className="rounded-lg bg-white h-[15rem] p-4 shadow-[0_0_1px_#0000000A,0_2px_6px_#0000000A]">
        <EnvironmentMonitor data={mockEnvironments} />
      </div>

      {/* 안전 모니터링 */}
      <div className="rounded-lg bg-white h-[19rem] p-4 shadow-[0_0_1px_#0000000A,0_2px_6px_#0000000A]">
        <div className="text-[#B5BBD3] font-semibold text-sm mb-5">안전 모니터링</div>
      </div>

      {/* CCTV */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white border border-2 border-gray-200">{/* CCTV 1 */}</div>
        <div className="rounded-lg bg-white border border-2 border-gray-200">{/* CCTV 2 */}</div>
        <div className="rounded-lg bg-white border border-2 border-gray-200">{/* CCTV 3 */}</div>
      </div>
    </aside>
  );
}
