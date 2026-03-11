import { useEffect, useRef } from "react";
import { createCampusScene } from "@/babylon/create-factory-scene";
import { createPowerSimulator } from "@/services/power-simulator";
import type { ScenarioMode } from "@/services/power-simulator";
import { useFactoryStore } from "@/stores/factory.store";
import type { CampusSceneApi, EquipmentDefinition, BuildingId } from "@/babylon/types";

export interface SimulatorControl {
  setScenario: (mode: ScenarioMode) => void;
  setSimulatedTime: (hour: number) => void;
  getSimulatedTime: () => number | null;
}

interface BabylonCanvasProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
  simulatorRef: React.RefObject<SimulatorControl | null>;
  equipmentList: EquipmentDefinition[];
  onEquipmentClick?: (id: string | null) => void;
  onBuildingClick?: (buildingId: BuildingId | null) => void;
  className?: string;
}

export function BabylonCanvas({
  sceneRef,
  simulatorRef,
  equipmentList,
  onEquipmentClick,
  onBuildingClick,
  className,
}: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize scene + power simulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const api = createCampusScene(canvas);
    (sceneRef as React.MutableRefObject<CampusSceneApi | null>).current = api;

    // Add initial equipment
    for (const eq of equipmentList) {
      api.addEquipment(eq);
    }

    // Start power simulator
    const simulator = createPowerSimulator({
      onUpdate(readings) {
        useFactoryStore.getState().setPowerReadings(readings);
        api.updateCableLoads(readings);
      },
      onAlert(alerts) {
        useFactoryStore.getState().addPowerAlerts(alerts);
      },
    });

    // Expose simulator control
    (simulatorRef as React.MutableRefObject<SimulatorControl | null>).current = {
      setScenario: simulator.setScenario,
      setSimulatedTime: simulator.setSimulatedTime,
      getSimulatedTime: simulator.getSimulatedTime,
    };

    return () => {
      simulator.dispose();
      api.dispose();
      (sceneRef as React.MutableRefObject<CampusSceneApi | null>).current = null;
      (simulatorRef as React.MutableRefObject<SimulatorControl | null>).current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wire up click handlers
  useEffect(() => {
    const api = sceneRef.current;
    if (!api) return;
    if (onEquipmentClick) api.onEquipmentClick(onEquipmentClick);
    if (onBuildingClick) api.onBuildingClick(onBuildingClick);
  }, [onEquipmentClick, onBuildingClick, sceneRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
