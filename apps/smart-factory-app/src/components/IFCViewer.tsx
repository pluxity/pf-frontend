import { useEffect, useRef, useState } from "react";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { createIFCScene, type IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";
import type { Discipline, ElementMeta } from "@/babylon/types";
import {
  useIFCViewerStore,
  selectSelectedElement,
  selectDisciplineVisibility,
} from "@/stores/ifc-viewer.store";
import { startDemoSimulation, stopDemoSimulation } from "@/services/ifc-demo-simulator";

import { StoreyPanel } from "./ifc/StoreyPanel";
import { SectionControls } from "./ifc/SectionControls";
import { MepStatusPanel } from "./ifc/MepStatusPanel";
import { MonitoringBar } from "./ifc/MonitoringBar";
import { AlarmPanel } from "./ifc/AlarmPanel";
import { DemoControls } from "./ifc/DemoControls";
import { IFCViewModeSelector } from "./ifc/IFCViewModeSelector";
import { IFCCameraModeSelector } from "./ifc/IFCCameraModeSelector";

const DISCIPLINE_CONFIG: Array<{ key: Discipline; label: string; color: string }> = [
  { key: "arc", label: "ARC", color: "#3B82F6" },
  { key: "mep", label: "MEP", color: "#10B981" },
  { key: "str", label: "STR", color: "#F59E0B" },
];

interface IFCViewerProps {
  modelConfigs: Array<{
    basePath: string;
    disciplines?: Discipline[];
  }>;
  className?: string;
}

/** Hover tooltip information */
interface HoverInfo {
  element: ElementMeta;
  x: number;
  y: number;
}

export function IFCViewer({ modelConfigs, className }: IFCViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneApiRef = useRef<IFCSceneApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const selectedElement = useIFCViewerStore(selectSelectedElement);
  const disciplineVisibility = useIFCViewerStore(selectDisciplineVisibility);
  const { setDisciplineVisible, setSelectedElement, setStoreys } = useIFCViewerStore();

  // Initialize scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    async function init() {
      try {
        const api = await createIFCScene(canvas!, modelConfigs);
        if (disposed) {
          api.dispose();
          return;
        }
        sceneApiRef.current = api;

        // Initialize storey list in store
        const storeys = api.getStoreys();
        setStoreys(storeys);

        // Click: select element + highlight
        api.onSelect((element, mesh) => {
          setSelectedElement(element);
          if (mesh) {
            api.selectMesh(mesh);
          } else {
            api.clearSelection();
          }
        });

        // Hover: highlight mesh + show tooltip with mesh info
        api.scene.onPointerObservable.add((pointerInfo) => {
          if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) return;

          const pickResult = pointerInfo.pickInfo;
          if (!pickResult?.hit || !pickResult.pickedMesh) {
            setHoverInfo(null);
            api.hoverMesh(null);
            return;
          }

          const ids = api.getMeshExpressIDs(pickResult.pickedMesh);
          if (ids.length > 0 && ids[0] != null) {
            const meta = api.getElementByExpressID(ids[0]);
            if (meta) {
              const evt = pointerInfo.event as PointerEvent;
              setHoverInfo({ element: meta, x: evt.offsetX, y: evt.offsetY });
              api.hoverMesh(pickResult.pickedMesh);
            } else {
              setHoverInfo(null);
              api.hoverMesh(null);
            }
          } else {
            setHoverInfo(null);
            api.hoverMesh(null);
          }
        });

        setLoading(false);
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "Failed to load IFC models");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      disposed = true;
      if (sceneApiRef.current) {
        stopDemoSimulation(sceneApiRef.current);
      }
      sceneApiRef.current?.dispose();
      sceneApiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle discipline visibility
  function handleToggle(disc: Discipline) {
    const next = !disciplineVisibility[disc];
    setDisciplineVisible(disc, next);
    sceneApiRef.current?.setDisciplineVisible(disc, next);
  }

  function handleStartDemo() {
    if (sceneApiRef.current) {
      startDemoSimulation(sceneApiRef.current);
    }
  }

  function handleStopDemo() {
    if (sceneApiRef.current) {
      stopDemoSimulation(sceneApiRef.current);
    }
  }

  const api = sceneApiRef.current;

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-white text-lg">IFC 모델 로딩 중...</div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      )}

      {/* Controls (only after load) */}
      {!loading && !error && (
        <>
          {/* Top-left: Discipline toggles + Fit + Demo */}
          <div className="absolute top-4 left-4 flex gap-2 items-center">
            {DISCIPLINE_CONFIG.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => handleToggle(key)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: disciplineVisibility[key] ? color : "#374151",
                  color: disciplineVisibility[key] ? "#fff" : "#9CA3AF",
                  opacity: disciplineVisibility[key] ? 1 : 0.6,
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => sceneApiRef.current?.fitCamera()}
              className="px-3 py-1.5 rounded text-sm font-medium bg-[#6B7280] text-white"
            >
              Fit
            </button>
            <DemoControls onStart={handleStartDemo} onStop={handleStopDemo} />
          </div>

          {/* Top-center: Section controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <SectionControls sceneApi={api} />
          </div>

          {/* Top-right: View & Camera mode */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <IFCViewModeSelector sceneApi={api} />
            <IFCCameraModeSelector sceneApi={api} />
          </div>

          {/* Left: Storey panel */}
          <StoreyPanel sceneApi={api} />

          {/* Right: MEP Status panel */}
          <MepStatusPanel />

          {/* Bottom-center: Monitoring toggles */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <MonitoringBar sceneApi={api} />
          </div>

          {/* Bottom-right: Alarm summary */}
          <AlarmPanel sceneApi={api} />

          {/* Hover tooltip */}
          {hoverInfo && (
            <div
              className="absolute pointer-events-none bg-[#1F2937]/95 text-white rounded-md px-3 py-2 shadow-lg border border-[#374151] max-w-xs"
              style={{
                left: hoverInfo.x + 16,
                top: hoverInfo.y - 8,
              }}
            >
              <div className="text-xs font-semibold truncate">
                {hoverInfo.element.name || hoverInfo.element.type}
              </div>
              <div className="text-[10px] text-gray-400 flex gap-2 mt-0.5">
                <span>{hoverInfo.element.type}</span>
                {hoverInfo.element.discipline && (
                  <span className="text-blue-400">
                    {hoverInfo.element.discipline.toUpperCase()}
                  </span>
                )}
                <span className="text-gray-600">#{hoverInfo.element.expressID}</span>
              </div>
              {Object.keys(hoverInfo.element.properties).length > 0 && (
                <div className="mt-1 pt-1 border-t border-gray-700 text-[10px] text-gray-400">
                  {Object.entries(hoverInfo.element.properties)
                    .slice(0, 3)
                    .map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-gray-600">{k}: </span>
                        {String(v)}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Selected element detail panel */}
          {selectedElement && (
            <div className="absolute bottom-16 left-4 max-w-sm bg-[#1F2937] text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">
                  {selectedElement.name || selectedElement.type}
                </h3>
                <button
                  onClick={() => {
                    setSelectedElement(null);
                    sceneApiRef.current?.clearSelection();
                  }}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  X
                </button>
              </div>
              <div className="text-xs space-y-1 text-gray-300">
                <div>
                  <span className="text-gray-500">Type: </span>
                  {selectedElement.type}
                </div>
                {selectedElement.discipline && (
                  <div>
                    <span className="text-gray-500">Discipline: </span>
                    {selectedElement.discipline.toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Express ID: </span>
                  {selectedElement.expressID}
                </div>
                {selectedElement.storeyId != null && (
                  <div>
                    <span className="text-gray-500">Storey ID: </span>
                    {selectedElement.storeyId}
                  </div>
                )}
                {Object.keys(selectedElement.properties).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-gray-500 mb-1">Properties:</div>
                    <div className="max-h-40 overflow-y-auto">
                      {Object.entries(selectedElement.properties).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-gray-500">{k}: </span>
                          {String(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
