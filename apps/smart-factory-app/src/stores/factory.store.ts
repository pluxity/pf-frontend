import { create } from "zustand";
import type {
  EquipmentStatus,
  BuildingId,
  PowerReading,
  PowerAlert,
  GeneratorStatus,
  CameraMode,
  ViewMode,
} from "@/babylon/types";
import { INITIAL_EQUIPMENT } from "@/config/equipment.config";
import type { ActiveScene, EnergyAnomaly } from "@/services/scene-engine";

interface EquipmentState {
  id: string;
  label: string;
  type: string;
  status: EquipmentStatus;
  buildingId?: string;
  ratedPowerKw?: number;
}

interface FactoryState {
  /** Equipment status map */
  equipmentMap: Map<string, EquipmentState>;
  /** Currently selected equipment id */
  selectedId: string | null;
  /** Currently focused building (null = campus overview) */
  focusedBuildingId: BuildingId | null;
  /** Whether MEP cables are visible */
  cablesVisible: boolean;
  /** Latest power readings per panel */
  powerReadings: PowerReading[];
  /** Active power alerts */
  powerAlerts: PowerAlert[];
  /** Currently disconnected cable IDs */
  disconnectedCables: string[];
  /** Emergency generator status */
  emergencyPowerStatus: GeneratorStatus;
  /** Power flow particles visible */
  flowVisible: boolean;
  /** Billboard labels visible */
  billboardsVisible: boolean;
  /** Camera mode */
  cameraMode: CameraMode;
  /** View mode (post-processing) */
  viewMode: ViewMode;
  /** Active scenario */
  activeScenario:
    | "normal"
    | "overload"
    | "blackout"
    | "energy-monitor"
    | "emergency-evacuation"
    | "fire"
    | null;
  /** Energy monitor: active scenes evaluated by scene engine */
  activeScenes: ActiveScene[];
  /** Energy monitor: detected anomalies */
  energyAnomalies: EnergyAnomaly[];
  /** Energy monitor: whether monitoring mode is active */
  monitoringActive: boolean;
}

interface FactoryActions {
  setSelectedId: (id: string | null) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;
  setFocusedBuildingId: (id: BuildingId | null) => void;
  setCablesVisible: (visible: boolean) => void;
  setPowerReadings: (readings: PowerReading[]) => void;
  addPowerAlerts: (alerts: PowerAlert[]) => void;
  dismissAlert: (alertId: string) => void;
  clearAlerts: () => void;
  disconnectCable: (cableId: string) => void;
  reconnectCable: (cableId: string) => void;
  setEmergencyPower: (status: GeneratorStatus) => void;
  setFlowVisible: (visible: boolean) => void;
  setBillboardsVisible: (visible: boolean) => void;
  setCameraMode: (mode: CameraMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveScenario: (
    scenario:
      | "normal"
      | "overload"
      | "blackout"
      | "energy-monitor"
      | "emergency-evacuation"
      | "fire"
      | null
  ) => void;
  setActiveScenes: (scenes: ActiveScene[]) => void;
  addAnomaly: (anomaly: EnergyAnomaly) => void;
  acknowledgeAnomaly: (id: string) => void;
  clearAnomalies: () => void;
  setMonitoringActive: (active: boolean) => void;
}

type FactoryStore = FactoryState & FactoryActions;

const initialMap = new Map<string, EquipmentState>();
for (const eq of INITIAL_EQUIPMENT) {
  initialMap.set(eq.id, {
    id: eq.id,
    label: eq.label,
    type: eq.type,
    status: eq.status,
    buildingId: eq.buildingId,
    ratedPowerKw: eq.ratedPowerKw,
  });
}

const MAX_ALERTS = 20;

export const useFactoryStore = create<FactoryStore>()((set) => ({
  equipmentMap: initialMap,
  selectedId: null,
  focusedBuildingId: null,
  cablesVisible: true,
  powerReadings: [],
  powerAlerts: [],
  disconnectedCables: [],
  emergencyPowerStatus: "standby" as GeneratorStatus,
  flowVisible: true,
  billboardsVisible: true,
  cameraMode: "orbit" as CameraMode,
  viewMode: "default" as ViewMode,
  activeScenario: null,
  activeScenes: [],
  energyAnomalies: [],
  monitoringActive: false,

  setSelectedId: (id) => set({ selectedId: id }),

  updateEquipmentStatus: (id, status) =>
    set((state) => {
      const next = new Map(state.equipmentMap);
      const eq = next.get(id);
      if (eq) {
        next.set(id, { ...eq, status });
      }
      return { equipmentMap: next };
    }),

  setFocusedBuildingId: (id) => set({ focusedBuildingId: id }),

  setCablesVisible: (visible) => set({ cablesVisible: visible }),

  setPowerReadings: (readings) => set({ powerReadings: readings }),

  addPowerAlerts: (alerts) =>
    set((state) => ({
      powerAlerts: [...alerts, ...state.powerAlerts].slice(0, MAX_ALERTS),
    })),

  dismissAlert: (alertId) =>
    set((state) => ({
      powerAlerts: state.powerAlerts.filter((a) => a.id !== alertId),
    })),

  clearAlerts: () => set({ powerAlerts: [] }),

  disconnectCable: (cableId) =>
    set((state) => ({
      disconnectedCables: state.disconnectedCables.includes(cableId)
        ? state.disconnectedCables
        : [...state.disconnectedCables, cableId],
    })),

  reconnectCable: (cableId) =>
    set((state) => ({
      disconnectedCables: state.disconnectedCables.filter((id) => id !== cableId),
    })),

  setEmergencyPower: (status) => set({ emergencyPowerStatus: status }),

  setFlowVisible: (visible) => set({ flowVisible: visible }),

  setBillboardsVisible: (visible) => set({ billboardsVisible: visible }),

  setCameraMode: (mode) => set({ cameraMode: mode }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setActiveScenario: (scenario) =>
    set({
      activeScenario: scenario,
      disconnectedCables: [],
      emergencyPowerStatus: "standby",
      activeScenes: [],
      energyAnomalies: [],
      monitoringActive: scenario === "energy-monitor",
    }),

  setActiveScenes: (scenes) => set({ activeScenes: scenes }),

  addAnomaly: (anomaly) =>
    set((state) => {
      // Avoid duplicate anomalies for the same scene
      if (state.energyAnomalies.some((a) => a.sceneId === anomaly.sceneId && !a.acknowledged)) {
        return state;
      }
      return { energyAnomalies: [anomaly, ...state.energyAnomalies].slice(0, MAX_ALERTS) };
    }),

  acknowledgeAnomaly: (id) =>
    set((state) => ({
      energyAnomalies: state.energyAnomalies.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    })),

  clearAnomalies: () => set({ energyAnomalies: [] }),

  setMonitoringActive: (active) => set({ monitoringActive: active }),
}));

// Selectors
export const selectSelectedId = (s: FactoryStore) => s.selectedId;
export const selectEquipmentMap = (s: FactoryStore) => s.equipmentMap;
export const selectSelectedEquipment = (s: FactoryStore) => {
  if (!s.selectedId) return null;
  return s.equipmentMap.get(s.selectedId) ?? null;
};
export const selectFocusedBuildingId = (s: FactoryStore) => s.focusedBuildingId;
export const selectCablesVisible = (s: FactoryStore) => s.cablesVisible;
export const selectPowerReadings = (s: FactoryStore) => s.powerReadings;
export const selectPowerAlerts = (s: FactoryStore) => s.powerAlerts;
export const selectDisconnectedCables = (s: FactoryStore) => s.disconnectedCables;
export const selectEmergencyPowerStatus = (s: FactoryStore) => s.emergencyPowerStatus;
export const selectFlowVisible = (s: FactoryStore) => s.flowVisible;
export const selectBillboardsVisible = (s: FactoryStore) => s.billboardsVisible;
export const selectCameraMode = (s: FactoryStore) => s.cameraMode;
export const selectViewMode = (s: FactoryStore) => s.viewMode;
export const selectActiveScenario = (s: FactoryStore) => s.activeScenario;
export const selectActiveScenes = (s: FactoryStore) => s.activeScenes;
export const selectEnergyAnomalies = (s: FactoryStore) => s.energyAnomalies;
export const selectMonitoringActive = (s: FactoryStore) => s.monitoringActive;
