import {
  useIFCViewerStore,
  selectStoreys,
  selectStoreyVisibility,
  selectIsolatedStoreyId,
} from "@/stores/ifc-viewer.store";
import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";

interface StoreyPanelProps {
  sceneApi: IFCSceneApi | null;
}

export function StoreyPanel({ sceneApi }: StoreyPanelProps) {
  const storeys = useIFCViewerStore(selectStoreys);
  const visibility = useIFCViewerStore(selectStoreyVisibility);
  const isolatedId = useIFCViewerStore(selectIsolatedStoreyId);
  const { setStoreyVisible, setIsolatedStoreyId } = useIFCViewerStore();

  if (storeys.length === 0) return null;

  function handleToggle(storeyId: number) {
    const current = visibility.get(storeyId) ?? true;
    setStoreyVisible(storeyId, !current);
    sceneApi?.setStoreyVisible(storeyId, !current);
  }

  function handleIsolate(storeyId: number) {
    if (isolatedId === storeyId) {
      // Un-isolate
      setIsolatedStoreyId(null);
      sceneApi?.showAllStoreys();
    } else {
      setIsolatedStoreyId(storeyId);
      sceneApi?.isolateStorey(storeyId);
    }
  }

  function handleShowAll() {
    setIsolatedStoreyId(null);
    sceneApi?.showAllStoreys();
    for (const s of storeys) {
      setStoreyVisible(s.expressID, true);
    }
  }

  function handleFocus(storeyId: number) {
    sceneApi?.focusStorey(storeyId);
  }

  return (
    <div className="absolute top-16 left-4 w-56 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2D3140]">
        <span className="text-white text-xs font-semibold">층별 필터</span>
        <button onClick={handleShowAll} className="text-[10px] text-blue-400 hover:text-blue-300">
          전체 표시
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {[...storeys].reverse().map((storey) => {
          const isVisible = visibility.get(storey.expressID) ?? true;
          const isIsolated = isolatedId === storey.expressID;
          return (
            <div
              key={storey.expressID}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs ${
                isIsolated ? "bg-blue-500/20" : "hover:bg-[#2D3140]/60"
              }`}
            >
              <button
                onClick={() => handleToggle(storey.expressID)}
                className={`w-3.5 h-3.5 rounded border flex-shrink-0 ${
                  isVisible ? "bg-blue-500 border-blue-500" : "bg-transparent border-gray-600"
                }`}
              />
              <button
                onClick={() => handleFocus(storey.expressID)}
                className="flex-1 text-left text-gray-300 hover:text-white truncate"
                title={storey.name}
              >
                {storey.name}
              </button>
              <span className="text-gray-600 text-[10px]">{storey.meshCount}</span>
              <button
                onClick={() => handleIsolate(storey.expressID)}
                className={`text-[10px] px-1 rounded ${
                  isIsolated ? "text-blue-400 bg-blue-500/20" : "text-gray-500 hover:text-gray-300"
                }`}
                title="격리"
              >
                ISO
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
