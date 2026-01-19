import { DeckViewer } from "@/three";

export function DeckGLViewerPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* deck.gl 3D Tiles 뷰어 */}
      <div className="fixed inset-0 w-screen h-screen">
        <DeckViewer />
      </div>

      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur border-b border-slate-700 z-40 flex items-center px-4">
        <h1 className="text-lg font-semibold text-white">deck.gl 3D Tiles Viewer</h1>
        <div className="ml-auto">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            Cesium Viewer
          </a>
        </div>
      </div>

      {/* 컨트롤 힌트 */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur text-slate-300 text-xs px-3 py-2 rounded z-30">
        <div>좌클릭 드래그: 회전</div>
        <div>우클릭 드래그: 이동</div>
        <div>스크롤: 줌</div>
      </div>
    </div>
  );
}
