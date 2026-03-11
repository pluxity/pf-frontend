import type { IFCSceneApi } from "@/babylon/loaders/create-ifc-scene";
import type { MepAlarm, SensorReading, MepStatus } from "@/babylon/types";
import { useIFCViewerStore } from "@/stores/ifc-viewer.store";

let sensorTimer: ReturnType<typeof setInterval> | null = null;
let alarmTimer: ReturnType<typeof setInterval> | null = null;
let heatmapTimer: ReturnType<typeof setInterval> | null = null;
let alarmCounter = 0;

/**
 * Start the demo simulation.
 * - Every 2s: update random sensor readings
 * - Every 10s: generate random MEP alarm
 * - Every 3s: micro-fluctuate heatmap values
 * - Auto-start pipe flow + open demo CCTV panels
 */
export function startDemoSimulation(api: IFCSceneApi): void {
  const store = useIFCViewerStore.getState();
  store.setDemoActive(true);

  const mepIds = api.getMepExpressIDs();
  const storeys = api.getStoreys();

  console.group("[Demo Simulator] Start");
  console.log(`MEP device IDs found: ${mepIds.length}`);
  console.log(
    `Storeys found: ${storeys.length}`,
    storeys.map((s) => s.name)
  );
  console.groupEnd();

  // Start pipe flow
  store.setPipeFlowVisible(true);
  api.setPipeFlowVisible(true);

  // Start sensor billboards
  store.setBillboardsVisible(true);
  api.setSensorBillboardsVisible(true);

  // Generate initial sensor readings for a subset of MEP devices
  const sensorSubset = mepIds.slice(0, Math.min(8, mepIds.length));
  const sensorLabels = ["온도", "습도", "압력", "유량", "전력", "CO2", "진동", "RPM"];
  const sensorUnits = ["°C", "%RH", "kPa", "L/min", "kW", "ppm", "mm/s", "RPM"];

  function generateReadings(): SensorReading[] {
    return sensorSubset.map((eid, i) => {
      const baseValues = [25, 55, 101, 12, 5.5, 420, 1.2, 1800];
      const ranges = [15, 20, 10, 8, 3, 200, 2, 600];
      const base = baseValues[i % baseValues.length]!;
      const range = ranges[i % ranges.length]!;
      const value = base + (Math.random() - 0.5) * range;

      let status: MepStatus = "normal";
      const ratio = Math.abs(value - base) / (range / 2);
      if (ratio > 0.8) status = "error";
      else if (ratio > 0.5) status = "warning";

      return {
        expressID: eid,
        label: sensorLabels[i % sensorLabels.length]!,
        value,
        unit: sensorUnits[i % sensorUnits.length]!,
        status,
      };
    });
  }

  // Initial sensor readings
  const initialReadings = generateReadings();
  api.updateSensorReadings(initialReadings);
  store.setSensorReadings(initialReadings);

  // Sensor update timer (every 2s)
  sensorTimer = setInterval(() => {
    const readings = generateReadings();
    api.updateSensorReadings(readings);
    useIFCViewerStore.getState().setSensorReadings(readings);
  }, 2000);

  // Alarm timer (every 10s)
  alarmTimer = setInterval(() => {
    if (mepIds.length === 0) return;

    const targetIdx = Math.floor(Math.random() * mepIds.length);
    const targetId = mepIds[targetIdx]!;
    const level = Math.random() > 0.6 ? "critical" : "warning";
    const types = ["과열 감지", "압력 이상", "진동 초과", "유량 부족", "전류 과부하"];
    const messages = [
      "설정 임계값을 초과했습니다",
      "즉시 점검이 필요합니다",
      "자동 차단 준비 중",
      "운전 파라미터 이상",
    ];

    const alarm: MepAlarm = {
      id: `alarm-${++alarmCounter}`,
      expressID: targetId,
      type: types[Math.floor(Math.random() * types.length)]!,
      message: messages[Math.floor(Math.random() * messages.length)]!,
      level: level as "warning" | "critical",
      timestamp: Date.now(),
    };

    api.addMepAlarm(alarm);
    useIFCViewerStore.getState().addMepAlarm(alarm);
  }, 10000);

  // Heatmap auto-enable + fluctuation
  if (storeys.length > 0) {
    store.setHeatmapActive(true);

    // Initial heatmap values
    for (const storey of storeys) {
      api.setStoreyHeat(storey.expressID, 0.3 + Math.random() * 0.4);
    }

    heatmapTimer = setInterval(() => {
      for (const storey of storeys) {
        const base = 0.3 + Math.random() * 0.4;
        const jitter = (Math.random() - 0.5) * 0.1;
        api.setStoreyHeat(storey.expressID, Math.max(0, Math.min(1, base + jitter)));
      }
    }, 3000);
  }

  // Open demo CCTV panels (first 2 storeys)
  const cctvStoreys = storeys.slice(0, 2);
  for (let i = 0; i < cctvStoreys.length; i++) {
    const storey = cctvStoreys[i]!;
    api.openCCTVPanel(`demo-cctv-${i}`, `CCTV-${storey.name}`, storey.expressID);
    // Set to "failed" status immediately (no real video source)
    setTimeout(() => {
      api.updateCCTVStatus(`demo-cctv-${i}`, "failed");
    }, 2000);
  }
}

/**
 * Stop the demo simulation and clean up.
 */
export function stopDemoSimulation(api: IFCSceneApi): void {
  const store = useIFCViewerStore.getState();
  store.setDemoActive(false);

  if (sensorTimer) {
    clearInterval(sensorTimer);
    sensorTimer = null;
  }
  if (alarmTimer) {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }
  if (heatmapTimer) {
    clearInterval(heatmapTimer);
    heatmapTimer = null;
  }

  // Clean up scene
  api.clearAllMepAlarms();
  api.clearHeatmap();
  api.setPipeFlowVisible(false);
  api.setSensorBillboardsVisible(false);
  api.closeAllCCTVPanels();

  // Clean up store
  store.clearMepAlarms();
  store.setSensorReadings([]);
  store.setHeatmapActive(false);
  store.setPipeFlowVisible(false);
  store.setBillboardsVisible(false);
}
