import { useIFCViewerStore, selectCameraMode } from "@/stores/ifc-viewer.store";
import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";
import type { IFCCameraMode } from "@/babylon/types";

interface IFCCameraModeSelectorProps {
  sceneApi: IFCSceneApi | null;
}

const MODES: Array<{ key: IFCCameraMode; label: string }> = [
  { key: "orbit", label: "궤도" },
  { key: "interior", label: "인테리어" },
  { key: "fps", label: "FPS" },
];

export function IFCCameraModeSelector({ sceneApi }: IFCCameraModeSelectorProps) {
  const currentMode = useIFCViewerStore(selectCameraMode);
  const { setCameraMode } = useIFCViewerStore();

  function handleChange(mode: IFCCameraMode) {
    setCameraMode(mode);
    sceneApi?.setCameraMode(mode);
  }

  return (
    <div className="flex items-center gap-1 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] px-2 py-1.5">
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleChange(key)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            currentMode === key
              ? "bg-blue-500 text-white"
              : "bg-[#2D3140] text-gray-400 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
