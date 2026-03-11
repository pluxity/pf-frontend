import type { BuildingId, PowerReading } from "@/babylon/types";
import type { SceneDefinition, SceneSchedule } from "@/config/scene-schedule.config";
import { PANELS } from "@/config/electrical.config";

// --- Exported types ---

export interface ActiveScene {
  sceneId: string;
  buildingId: BuildingId;
  label: string;
  expectedMaxKw: number;
  actualKw: number;
  status: "normal" | "warning" | "anomaly";
  excessKw: number;
  excessPercent: number;
}

export interface EnergyAnomaly {
  id: string;
  sceneId: string;
  buildingId: BuildingId;
  label: string;
  expectedMaxKw: number;
  actualKw: number;
  excessKw: number;
  detectedAt: number;
  cctvIds: string[];
  priority: "low" | "medium" | "high";
  acknowledged: boolean;
}

// --- Day of week helper ---

const DAY_MAP: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

function isScheduleActive(schedule: SceneSchedule, now: Date): boolean {
  if (schedule.type === "always") return true;

  const dayName = DAY_MAP[now.getDay()];
  if (!dayName || !schedule.days?.includes(dayName as never)) return false;

  const hour = now.getHours();
  const start = schedule.startHour ?? 0;
  const end = schedule.endHour ?? 24;

  // Handle overnight ranges (e.g., 18:00 ~ 08:00)
  if (start <= end) {
    return hour >= start && hour < end;
  } else {
    // Crosses midnight: active if hour >= start OR hour < end
    return hour >= start || hour < end;
  }
}

// --- Scene Engine functions ---

/** Get all scenes that are active at the given time */
export function getActiveScenes(now: Date, scenes: SceneDefinition[]): SceneDefinition[] {
  return scenes.filter((scene) => isScheduleActive(scene.schedule, now));
}

/** Calculate total kW for panels belonging to a scene from power readings */
function getScenePowerKw(scene: SceneDefinition, readings: PowerReading[]): number {
  let total = 0;
  for (const panelId of scene.panelIds) {
    const reading = readings.find((r) => r.panelId === panelId);
    if (reading) {
      total += reading.currentKw;
    }
  }
  return total;
}

/** Evaluate active scenes against power readings */
export function evaluateScenes(
  activeSceneDefs: SceneDefinition[],
  readings: PowerReading[]
): ActiveScene[] {
  return activeSceneDefs.map((scene) => {
    const actualKw = getScenePowerKw(scene, readings);
    const maxKw = scene.expectedPower.maxKw;
    const excessKw = Math.max(0, actualKw - maxKw);
    const excessPercent = maxKw > 0 ? (actualKw / maxKw) * 100 : 0;

    let status: ActiveScene["status"] = "normal";
    if (actualKw > maxKw * scene.anomalyThreshold) {
      status = "anomaly";
    } else if (actualKw > maxKw) {
      status = "warning";
    }

    return {
      sceneId: scene.id,
      buildingId: scene.buildingId,
      label: scene.label,
      expectedMaxKw: maxKw,
      actualKw: Math.round(actualKw * 10) / 10,
      status,
      excessKw: Math.round(excessKw * 10) / 10,
      excessPercent: Math.round(excessPercent),
    };
  });
}

/** Detect anomalies from evaluated scenes */
export function detectAnomalies(
  evaluatedScenes: ActiveScene[],
  sceneDefs: SceneDefinition[]
): EnergyAnomaly[] {
  const anomalies: EnergyAnomaly[] = [];

  for (const scene of evaluatedScenes) {
    if (scene.status !== "anomaly") continue;

    const def = sceneDefs.find((d) => d.id === scene.sceneId);
    if (!def) continue;

    anomalies.push({
      id: `anomaly-${scene.sceneId}-${Date.now()}`,
      sceneId: scene.sceneId,
      buildingId: scene.buildingId,
      label: `${scene.label} 과다 전력`,
      expectedMaxKw: scene.expectedMaxKw,
      actualKw: scene.actualKw,
      excessKw: scene.excessKw,
      detectedAt: Date.now(),
      cctvIds: def.cctvIds,
      priority: def.priority,
      acknowledged: false,
    });
  }

  return anomalies;
}

/** Get building label for a panel ID */
export function getPanelBuildingId(panelId: string): BuildingId | undefined {
  const panel = PANELS.find((p) => p.id === panelId);
  return panel?.buildingId;
}
