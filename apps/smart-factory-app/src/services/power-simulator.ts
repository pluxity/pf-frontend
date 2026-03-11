import type { PowerReading, PowerAlert, LoadLevel } from "@/babylon/types";
import { PANELS } from "@/config/electrical.config";
import { SCENE_DEFINITIONS } from "@/config/scene-schedule.config";

export type ScenarioMode = "normal" | "overload" | "blackout" | "energy-monitor" | null;

const UPDATE_INTERVAL_MS = 3000;

/** Panels that spike in overload scenario (본관 분전반 + 하위) */
const OVERLOAD_PANEL_IDS = new Set(["DP-MAIN", "SP-MAIN-MACH", "SP-MAIN-ASSY"]);

/** Panels that spike in energy-monitor anomaly demo (유틸리티동 + 품질동) */
const ENERGY_ANOMALY_PANEL_IDS = new Set(["DP-QL", "DP-UTIL"]);

/** Determine load level from percentage */
function getLoadLevel(percent: number): LoadLevel {
  if (percent > 90) return "critical";
  if (percent > 70) return "high";
  if (percent > 40) return "normal";
  return "low";
}

/** Base rated kW per panel (derived from amps, ~0.4 kW per amp for simplicity) */
function getPanelRatedKw(ratedAmps: number): number {
  return ratedAmps * 0.4;
}

/** Get expected max kW for a panel from scene definitions based on simulated time */
function getExpectedKwForPanel(panelId: string, _simulatedHour: number): number | null {
  for (const scene of SCENE_DEFINITIONS) {
    if (scene.panelIds.includes(panelId)) {
      return scene.expectedPower.maxKw / scene.panelIds.length;
    }
  }
  return null;
}

/** Generate a single reading for a panel */
function generateReading(
  panelId: string,
  ratedKw: number,
  now: number,
  scenario: ScenarioMode,
  simulatedHour: number | null
): PowerReading {
  let loadPercent: number;

  if (scenario === null) {
    // Idle: stable low load, no spikes, no alerts
    loadPercent = 20 + Math.random() * 5; // 20~25%
  } else if (scenario === "overload" && OVERLOAD_PANEL_IDS.has(panelId)) {
    // Overload scenario: forced high load with fluctuation
    loadPercent = 88 + Math.random() * 12; // 88~100%
  } else if (scenario === "blackout") {
    // Blackout: all panels near zero
    loadPercent = 1 + Math.random() * 3; // 1~4%
  } else if (scenario === "energy-monitor") {
    // Energy monitor: generate power based on simulated time + scene definitions
    const hour = simulatedHour ?? new Date(now).getHours();
    const isOffHours = hour >= 18 || hour < 8;

    if (isOffHours && ENERGY_ANOMALY_PANEL_IDS.has(panelId)) {
      // Anomaly: 품질동 generates 3x expected power during off-hours
      const expectedPerPanel = getExpectedKwForPanel(panelId, hour);
      if (expectedPerPanel !== null) {
        const anomalyKw = expectedPerPanel * (2.5 + Math.random() * 1.0); // 2.5~3.5x
        loadPercent = Math.min(100, (anomalyKw / ratedKw) * 100);
      } else {
        loadPercent = 15 + Math.random() * 5;
      }
    } else if (isOffHours) {
      // Off-hours normal: low power matching expected levels
      loadPercent = 5 + Math.random() * 8; // 5~13%
    } else {
      // Working hours: normal operation
      const dayFactor = 0.5 + 0.5 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
      const basePercent = 30 + dayFactor * 30;
      loadPercent = basePercent + (Math.random() - 0.5) * 10;
    }
  } else {
    // Normal scenario: realistic fluctuation with time-of-day variation
    const hour = new Date(now).getHours();
    const dayFactor = 0.5 + 0.5 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
    const basePercent = 30 + dayFactor * 30;
    const noise = (Math.random() - 0.5) * 20;
    const spike = Math.random() < 0.05 ? 20 + Math.random() * 10 : 0;
    loadPercent = basePercent + noise + spike;
  }

  loadPercent = Math.min(100, Math.max(1, loadPercent));
  const currentKw = (loadPercent / 100) * ratedKw;

  return {
    panelId,
    currentKw: Math.round(currentKw * 10) / 10,
    ratedKw,
    loadPercent: Math.round(loadPercent * 10) / 10,
    level: getLoadLevel(loadPercent),
    timestamp: now,
  };
}

/** Check for alerts based on readings */
function checkAlerts(readings: PowerReading[]): PowerAlert[] {
  const alerts: PowerAlert[] = [];

  for (const r of readings) {
    if (r.loadPercent >= 95) {
      alerts.push({
        id: `alert-${r.panelId}-${r.timestamp}`,
        panelId: r.panelId,
        level: "critical",
        message: `${r.panelId} 과부하 위험 (${r.loadPercent}%)`,
        loadPercent: r.loadPercent,
        timestamp: r.timestamp,
      });
    } else if (r.loadPercent >= 85) {
      alerts.push({
        id: `alert-${r.panelId}-${r.timestamp}`,
        panelId: r.panelId,
        level: "warning",
        message: `${r.panelId} 부하 경고 (${r.loadPercent}%)`,
        loadPercent: r.loadPercent,
        timestamp: r.timestamp,
      });
    }
  }

  return alerts;
}

export interface PowerSimulatorCallbacks {
  onUpdate: (readings: PowerReading[]) => void;
  onAlert: (alerts: PowerAlert[]) => void;
}

/**
 * Create a timer-based mock power data generator.
 * Supports scenario modes: normal, overload, blackout, energy-monitor.
 * Returns control object with dispose, setScenario, and setSimulatedTime.
 */
export function createPowerSimulator(callbacks: PowerSimulatorCallbacks) {
  let timerId: ReturnType<typeof setInterval> | null = null;
  let scenario: ScenarioMode = null;
  let simulatedHour: number | null = null;

  function tick(): void {
    const now = Date.now();
    const readings: PowerReading[] = PANELS.map((panel) => {
      const ratedKw = getPanelRatedKw(panel.ratedAmps);
      return generateReading(panel.id, ratedKw, now, scenario, simulatedHour);
    });

    callbacks.onUpdate(readings);

    const alerts = checkAlerts(readings);
    if (alerts.length > 0) {
      callbacks.onAlert(alerts);
    }
  }

  // Initial tick
  tick();

  // Start interval
  timerId = setInterval(tick, UPDATE_INTERVAL_MS);

  function setScenario(mode: ScenarioMode): void {
    scenario = mode;
    if (mode !== "energy-monitor") {
      simulatedHour = null;
    }
    // Immediate re-tick for instant visual feedback
    tick();
  }

  function setSimulatedTime(hour: number): void {
    simulatedHour = hour;
    tick();
  }

  function getSimulatedTime(): number | null {
    return simulatedHour;
  }

  function dispose(): void {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return { dispose, setScenario, setSimulatedTime, getSimulatedTime };
}
