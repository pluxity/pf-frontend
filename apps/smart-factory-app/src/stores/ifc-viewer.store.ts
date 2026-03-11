import { create } from "zustand";
import type {
  Discipline,
  ElementMeta,
  MepStatus,
  MepAlarm,
  SectionAxis,
  SensorReading,
  StoreyInfo,
  ViewMode,
  IFCCameraMode,
  HeatmapMode,
} from "@/babylon/types";

interface IFCViewerState {
  // Discipline visibility
  disciplineVisibility: Record<Discipline, boolean>;

  // Storey
  storeyVisibility: Map<number, boolean>;
  isolatedStoreyId: number | null;
  storeys: StoreyInfo[];

  // Selection
  selectedElement: ElementMeta | null;

  // MEP Status
  mepStatuses: Map<number, MepStatus>;
  mepAlarms: MepAlarm[];
  alarmMonitorActive: boolean;

  // Section View
  sectionEnabled: boolean;
  sectionAxis: SectionAxis;
  sectionPosition: number;

  // Sensor Billboards
  sensorReadings: SensorReading[];
  billboardsVisible: boolean;

  // Heatmap
  heatmapActive: boolean;
  heatmapMode: HeatmapMode;

  // Pipe Flow
  pipeFlowVisible: boolean;
  pipeFlowSpeed: number;

  // View / Camera Mode
  viewMode: ViewMode;
  cameraMode: IFCCameraMode;

  // Demo
  demoActive: boolean;
}

interface IFCViewerActions {
  // Discipline
  setDisciplineVisible: (disc: Discipline, visible: boolean) => void;

  // Storey
  setStoreys: (storeys: StoreyInfo[]) => void;
  setStoreyVisible: (storeyId: number, visible: boolean) => void;
  setIsolatedStoreyId: (id: number | null) => void;

  // Selection
  setSelectedElement: (el: ElementMeta | null) => void;

  // MEP
  setMepStatus: (expressID: number, status: MepStatus) => void;
  setMepAlarms: (alarms: MepAlarm[]) => void;
  addMepAlarm: (alarm: MepAlarm) => void;
  dismissMepAlarm: (alarmId: string) => void;
  clearMepAlarms: () => void;
  setAlarmMonitorActive: (active: boolean) => void;

  // Section
  setSectionEnabled: (enabled: boolean) => void;
  setSectionAxis: (axis: SectionAxis) => void;
  setSectionPosition: (position: number) => void;

  // Sensors
  setSensorReadings: (readings: SensorReading[]) => void;
  setBillboardsVisible: (visible: boolean) => void;

  // Heatmap
  setHeatmapActive: (active: boolean) => void;
  setHeatmapMode: (mode: HeatmapMode) => void;

  // Pipe Flow
  setPipeFlowVisible: (visible: boolean) => void;
  setPipeFlowSpeed: (speed: number) => void;

  // View / Camera
  setViewMode: (mode: ViewMode) => void;
  setCameraMode: (mode: IFCCameraMode) => void;

  // Demo
  setDemoActive: (active: boolean) => void;

  // Reset
  resetAll: () => void;
}

type IFCViewerStore = IFCViewerState & IFCViewerActions;

const MAX_ALARMS = 30;

const initialState: IFCViewerState = {
  disciplineVisibility: { arc: true, mep: true, str: true },
  storeyVisibility: new Map(),
  isolatedStoreyId: null,
  storeys: [],
  selectedElement: null,
  mepStatuses: new Map(),
  mepAlarms: [],
  alarmMonitorActive: false,
  sectionEnabled: false,
  sectionAxis: "y",
  sectionPosition: 0,
  sensorReadings: [],
  billboardsVisible: false,
  heatmapActive: false,
  heatmapMode: "temperature",
  pipeFlowVisible: false,
  pipeFlowSpeed: 0.2,
  viewMode: "default",
  cameraMode: "orbit",
  demoActive: false,
};

export const useIFCViewerStore = create<IFCViewerStore>()((set) => ({
  ...initialState,

  // Discipline
  setDisciplineVisible: (disc, visible) =>
    set((s) => ({
      disciplineVisibility: { ...s.disciplineVisibility, [disc]: visible },
    })),

  // Storey
  setStoreys: (storeys) => {
    const vis = new Map<number, boolean>();
    for (const s of storeys) vis.set(s.expressID, true);
    set({ storeys, storeyVisibility: vis });
  },

  setStoreyVisible: (storeyId, visible) =>
    set((s) => {
      const next = new Map(s.storeyVisibility);
      next.set(storeyId, visible);
      return { storeyVisibility: next, isolatedStoreyId: null };
    }),

  setIsolatedStoreyId: (id) =>
    set((s) => {
      const next = new Map(s.storeyVisibility);
      for (const key of next.keys()) {
        next.set(key, key === id);
      }
      return { storeyVisibility: next, isolatedStoreyId: id };
    }),

  // Selection
  setSelectedElement: (el) => set({ selectedElement: el }),

  // MEP
  setMepStatus: (expressID, status) =>
    set((s) => {
      const next = new Map(s.mepStatuses);
      next.set(expressID, status);
      return { mepStatuses: next };
    }),

  setMepAlarms: (alarms) => set({ mepAlarms: alarms }),

  addMepAlarm: (alarm) =>
    set((s) => ({
      mepAlarms: [alarm, ...s.mepAlarms].slice(0, MAX_ALARMS),
    })),

  dismissMepAlarm: (alarmId) =>
    set((s) => ({
      mepAlarms: s.mepAlarms.filter((a) => a.id !== alarmId),
    })),

  clearMepAlarms: () => set({ mepAlarms: [] }),

  setAlarmMonitorActive: (active) => set({ alarmMonitorActive: active }),

  // Section
  setSectionEnabled: (enabled) => set({ sectionEnabled: enabled }),
  setSectionAxis: (axis) => set({ sectionAxis: axis }),
  setSectionPosition: (position) => set({ sectionPosition: position }),

  // Sensors
  setSensorReadings: (readings) => set({ sensorReadings: readings }),
  setBillboardsVisible: (visible) => set({ billboardsVisible: visible }),

  // Heatmap
  setHeatmapActive: (active) => set({ heatmapActive: active }),
  setHeatmapMode: (mode) => set({ heatmapMode: mode }),

  // Pipe Flow
  setPipeFlowVisible: (visible) => set({ pipeFlowVisible: visible }),
  setPipeFlowSpeed: (speed) => set({ pipeFlowSpeed: speed }),

  // View / Camera
  setViewMode: (mode) => set({ viewMode: mode }),
  setCameraMode: (mode) => set({ cameraMode: mode }),

  // Demo
  setDemoActive: (active) => set({ demoActive: active }),

  // Reset
  resetAll: () => set(initialState),
}));

// --- Selectors ---
export const selectDisciplineVisibility = (s: IFCViewerStore) => s.disciplineVisibility;
export const selectStoreys = (s: IFCViewerStore) => s.storeys;
export const selectStoreyVisibility = (s: IFCViewerStore) => s.storeyVisibility;
export const selectIsolatedStoreyId = (s: IFCViewerStore) => s.isolatedStoreyId;
export const selectSelectedElement = (s: IFCViewerStore) => s.selectedElement;
export const selectMepAlarms = (s: IFCViewerStore) => s.mepAlarms;
export const selectAlarmMonitorActive = (s: IFCViewerStore) => s.alarmMonitorActive;
export const selectSectionEnabled = (s: IFCViewerStore) => s.sectionEnabled;
export const selectSectionAxis = (s: IFCViewerStore) => s.sectionAxis;
export const selectSectionPosition = (s: IFCViewerStore) => s.sectionPosition;
export const selectSensorReadings = (s: IFCViewerStore) => s.sensorReadings;
export const selectBillboardsVisible = (s: IFCViewerStore) => s.billboardsVisible;
export const selectHeatmapActive = (s: IFCViewerStore) => s.heatmapActive;
export const selectHeatmapMode = (s: IFCViewerStore) => s.heatmapMode;
export const selectPipeFlowVisible = (s: IFCViewerStore) => s.pipeFlowVisible;
export const selectPipeFlowSpeed = (s: IFCViewerStore) => s.pipeFlowSpeed;
export const selectViewMode = (s: IFCViewerStore) => s.viewMode;
export const selectCameraMode = (s: IFCViewerStore) => s.cameraMode;
export const selectDemoActive = (s: IFCViewerStore) => s.demoActive;
