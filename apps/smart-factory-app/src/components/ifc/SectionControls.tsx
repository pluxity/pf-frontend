import {
  useIFCViewerStore,
  selectSectionEnabled,
  selectSectionAxis,
  selectSectionPosition,
} from "@/stores/ifc-viewer.store";
import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";
import type { SectionAxis } from "@/babylon/types";

interface SectionControlsProps {
  sceneApi: IFCSceneApi | null;
}

const AXES: Array<{ key: SectionAxis; label: string }> = [
  { key: "x", label: "X" },
  { key: "y", label: "Y" },
  { key: "z", label: "Z" },
];

export function SectionControls({ sceneApi }: SectionControlsProps) {
  const enabled = useIFCViewerStore(selectSectionEnabled);
  const axis = useIFCViewerStore(selectSectionAxis);
  const position = useIFCViewerStore(selectSectionPosition);
  const { setSectionEnabled, setSectionAxis, setSectionPosition } = useIFCViewerStore();

  function handleToggle() {
    if (enabled) {
      setSectionEnabled(false);
      sceneApi?.disableSection();
    } else {
      setSectionEnabled(true);
      sceneApi?.enableSection(axis, position);
    }
  }

  function handleAxisChange(newAxis: SectionAxis) {
    setSectionAxis(newAxis);
    if (enabled) {
      sceneApi?.enableSection(newAxis, position);
    }
  }

  function handlePositionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setSectionPosition(val);
    if (enabled) {
      sceneApi?.setSectionPosition(val);
    }
  }

  return (
    <div className="flex items-center gap-2 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] px-3 py-2">
      <button
        onClick={handleToggle}
        className={`px-2 py-1 rounded text-xs font-medium ${
          enabled ? "bg-blue-500 text-white" : "bg-[#2D3140] text-gray-400 hover:text-white"
        }`}
      >
        단면
      </button>

      {enabled && (
        <>
          <div className="flex gap-1">
            {AXES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleAxisChange(key)}
                className={`w-6 h-6 rounded text-[10px] font-bold ${
                  axis === key
                    ? "bg-blue-500 text-white"
                    : "bg-[#2D3140] text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={0.5}
            value={position}
            onChange={handlePositionChange}
            className="w-32 h-1 accent-blue-500"
          />
          <span className="text-gray-400 text-[10px] w-10 text-right">{position.toFixed(1)}</span>
        </>
      )}
    </div>
  );
}
