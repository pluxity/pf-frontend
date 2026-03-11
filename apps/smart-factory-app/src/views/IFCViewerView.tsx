import { IFCViewer } from "@/components/IFCViewer";
import type { Discipline } from "@/babylon/types";

const MODEL_CONFIGS: Array<{ basePath: string; disciplines?: Discipline[] }> = [
  // ARC 파일: 건축(벽, 바닥, 문, 창) + 일부 MEP/STR
  {
    basePath: "/models/01_BIMcollab_Example_ARC",
    disciplines: ["arc", "mep", "str"],
  },
  // STR 전용 파일: 구조(기둥, 보)
  {
    basePath: "/models/02_BIMcollab_Example_STR_optimized",
    disciplines: ["arc", "str"],
  },
  // MEP 전용 파일: 설비(배관, 덕트, 케이블, 위생기구)
  {
    basePath: "/models/03_BIMcollab_Example_MEP_optimized",
    disciplines: ["mep"],
  },
];

export function IFCViewerView() {
  return (
    <div className="flex flex-col h-screen bg-[#0F1117]">
      <header className="flex items-center justify-between px-6 py-3 bg-[#1A1D27] border-b border-[#2D3140]">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-lg font-semibold">IFC Building Monitor</h1>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
            Babylon.js
          </span>
        </div>
        <span className="text-gray-400 text-sm">BIMcollab Example Project</span>
      </header>
      <div className="flex-1 min-h-0">
        <IFCViewer modelConfigs={MODEL_CONFIGS} />
      </div>
    </div>
  );
}
