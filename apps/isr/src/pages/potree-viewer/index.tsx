import { PotreeViewer } from "@/potree";

export function PotreeViewerPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      <div className="fixed inset-0 w-screen h-screen">
        <PotreeViewer />
      </div>

      <div className="absolute top-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur border-b border-slate-700 z-40 flex items-center px-4">
        <h1 className="text-lg font-semibold text-white">Potree Point Cloud Viewer</h1>
        <div className="ml-auto flex gap-4">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            Cesium Viewer
          </a>
          <a href="/deckgl" className="text-sm text-slate-400 hover:text-white transition-colors">
            DeckGL Viewer
          </a>
        </div>
      </div>

      <div className="absolute top-20 left-4 bg-slate-800/80 backdrop-blur text-slate-300 text-xs px-3 py-2 rounded z-30">
        <div>좌클릭 드래그: 회전</div>
        <div>우클릭 드래그: 이동</div>
        <div>스크롤: 줌</div>
        <div>더블클릭: 회전 중심 변경</div>
        <div>호버: 좌표 확인</div>
      </div>
    </div>
  );
}
