import { useRef, useState, useEffect } from "react";
import { BabylonCanvas } from "@/components/BabylonCanvas";
import type { SimulatorControl } from "@/components/BabylonCanvas";
import { CampusHeader } from "@/components/CampusHeader";
import { EquipmentPanel } from "@/components/EquipmentPanel";
import { PowerDashboard } from "@/components/PowerDashboard";
import { BuildingSelector } from "@/components/BuildingSelector";
import { AlertPanel } from "@/components/AlertPanel";
import { MepControls } from "@/components/MepControls";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { CameraModeSelector } from "@/components/CameraModeSelector";
import { ViewModeSelector } from "@/components/ViewModeSelector";
import { EnergyMonitorPanel } from "@/components/EnergyMonitorPanel";
import { SceneTimeline } from "@/components/SceneTimeline";
import { AnomalyAlert } from "@/components/AnomalyAlert";
import { CCTV3DBridge } from "@/components/CCTV3DBridge";
import { useFactoryStore, selectMonitoringActive } from "@/stores/factory.store";
import { INITIAL_EQUIPMENT } from "@/config/equipment.config";
import type { CampusSceneApi, BuildingId } from "@/babylon/types";

export function FactoryView() {
  const sceneRef = useRef<CampusSceneApi | null>(null);
  const simulatorRef = useRef<SimulatorControl | null>(null);
  const setSelectedId = useFactoryStore((s) => s.setSelectedId);
  const setFocusedBuildingId = useFactoryStore((s) => s.setFocusedBuildingId);
  const monitoringActive = useFactoryStore(selectMonitoringActive);

  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setSimulatedHour(simulatorRef.current?.getSimulatedTime() ?? null);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleEquipmentClick = (id: string | null) => {
    setSelectedId(id);

    const api = sceneRef.current;
    if (!api) return;

    if (id) {
      api.highlightEquipment(id);
    } else {
      api.clearHighlight();
    }
  };

  const handleBuildingClick = (buildingId: BuildingId | null) => {
    const api = sceneRef.current;
    if (!api) return;

    setFocusedBuildingId(buildingId);
    if (buildingId) {
      api.focusBuilding(buildingId);
    }
  };

  const handleBuildingSelect = (buildingId: BuildingId | null) => {
    const api = sceneRef.current;
    if (!api) return;

    setFocusedBuildingId(buildingId);
    if (buildingId) {
      api.focusBuilding(buildingId);
    } else {
      api.focusCampus();
    }
  };

  const handleToggleCables = (visible: boolean) => {
    sceneRef.current?.setCablesVisible(visible);
  };

  const handleToggleFlow = (visible: boolean) => {
    sceneRef.current?.setFlowVisible(visible);
  };

  const handleToggleBillboards = (visible: boolean) => {
    sceneRef.current?.setBillboardsVisible(visible);
  };

  return (
    <div className="h-screen flex flex-col bg-[#12121A]">
      <CampusHeader />

      <div className="relative flex-1">
        <BabylonCanvas
          sceneRef={sceneRef}
          simulatorRef={simulatorRef}
          equipmentList={INITIAL_EQUIPMENT}
          onEquipmentClick={handleEquipmentClick}
          onBuildingClick={handleBuildingClick}
          className="w-full h-full"
        />

        {/* Headless anomaly detector */}
        <AnomalyAlert sceneRef={sceneRef} simulatedHour={simulatedHour} />

        {/* UI Overlays */}
        <BuildingSelector onSelect={handleBuildingSelect} />
        <CameraModeSelector sceneRef={sceneRef} />
        <ViewModeSelector sceneRef={sceneRef} />

        {/* Left panel: energy monitor or power dashboard */}
        {monitoringActive ? (
          <div className="absolute top-4 left-4">
            <EnergyMonitorPanel sceneRef={sceneRef} />
          </div>
        ) : (
          <PowerDashboard />
        )}

        <EquipmentPanel />
        <MepControls
          onToggleCables={handleToggleCables}
          onToggleFlow={handleToggleFlow}
          onToggleBillboards={handleToggleBillboards}
        />

        {/* Right-bottom stacked panels */}
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
          <AlertPanel />
          <ScenarioPanel sceneRef={sceneRef} simulatorRef={simulatorRef} />
        </div>

        {/* Bottom: scene timeline (only in energy monitor mode) */}
        {monitoringActive && (
          <div className="absolute bottom-4 left-4 right-72">
            <SceneTimeline simulatedHour={simulatedHour} />
          </div>
        )}

        {/* 3D CCTV Bridge (renders hidden videos, syncs to Babylon 3D panels) */}
        <CCTV3DBridge sceneRef={sceneRef} />
      </div>
    </div>
  );
}
