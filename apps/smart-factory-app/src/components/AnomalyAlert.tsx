import { useEffect, useRef } from "react";
import {
  useFactoryStore,
  selectEnergyAnomalies,
  selectMonitoringActive,
  selectPowerReadings,
} from "@/stores/factory.store";
import { useCCTVPopupStore } from "@/stores/cctv.store";
import { getCameraById, getWHEPUrl } from "@/config/cctv.config";
import { SCENE_DEFINITIONS } from "@/config/scene-schedule.config";
import { getActiveScenes, evaluateScenes, detectAnomalies } from "@/services/scene-engine";
import type { CampusSceneApi } from "@/babylon/types";

interface AnomalyAlertProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
  simulatedHour: number | null;
}

/**
 * Headless component that runs the scene engine evaluation loop.
 * When anomalies are detected, it:
 * 1. Updates the store with active scenes
 * 2. Fires anomaly events
 * 3. Auto-opens CCTV popups
 * 4. Highlights 3D zones
 */
export function AnomalyAlert({ sceneRef, simulatedHour }: AnomalyAlertProps) {
  const monitoringActive = useFactoryStore(selectMonitoringActive);
  const readings = useFactoryStore(selectPowerReadings);
  const anomalies = useFactoryStore(selectEnergyAnomalies);
  const openPopup = useCCTVPopupStore((s) => s.openPopup);
  const prevAnomalyIdsRef = useRef<Set<string>>(new Set());

  // Run scene engine evaluation whenever readings update while monitoring is active
  useEffect(() => {
    if (!monitoringActive || readings.length === 0) return;

    // Create a date object with the simulated hour
    const now = new Date();
    if (simulatedHour !== null) {
      const activeSceneDefs = getActiveScenes(createFakeDate(simulatedHour, 3), SCENE_DEFINITIONS);

      const evaluated = evaluateScenes(activeSceneDefs, readings);
      useFactoryStore.getState().setActiveScenes(evaluated);

      const newAnomalies = detectAnomalies(evaluated, activeSceneDefs);
      for (const anomaly of newAnomalies) {
        useFactoryStore.getState().addAnomaly(anomaly);
      }
    } else {
      const activeSceneDefs = getActiveScenes(now, SCENE_DEFINITIONS);
      const evaluated = evaluateScenes(activeSceneDefs, readings);
      useFactoryStore.getState().setActiveScenes(evaluated);

      const newAnomalies = detectAnomalies(evaluated, activeSceneDefs);
      for (const anomaly of newAnomalies) {
        useFactoryStore.getState().addAnomaly(anomaly);
      }
    }
  }, [monitoringActive, readings, simulatedHour]);

  // React to new anomalies: auto-open CCTV + highlight zones
  useEffect(() => {
    if (!monitoringActive) return;

    const currentIds = new Set(anomalies.filter((a) => !a.acknowledged).map((a) => a.sceneId));
    const prevIds = prevAnomalyIdsRef.current;
    const api = sceneRef.current;

    for (const anomaly of anomalies) {
      if (anomaly.acknowledged) continue;
      if (prevIds.has(anomaly.sceneId)) continue;

      // New anomaly detected!
      // 1. Auto-open CCTV popups
      for (const cctvId of anomaly.cctvIds) {
        const camera = getCameraById(cctvId);
        if (!camera) continue;
        openPopup({
          id: camera.id,
          label: camera.label,
          streamUrl: getWHEPUrl(camera.streamName),
          triggeredBy: anomaly.label,
        });
      }

      // 2. Highlight 3D zone
      if (api) {
        api.highlightBuilding(anomaly.buildingId, "#DE4545", true);
      }
    }

    // Clear highlights for resolved anomalies
    if (api) {
      for (const prevId of prevIds) {
        if (!currentIds.has(prevId)) {
          const def = SCENE_DEFINITIONS.find((s) => s.id === prevId);
          if (def) {
            api.clearZoneHighlight(def.buildingId);
          }
        }
      }

      // Show normal highlights for non-anomaly active scenes
      const activeScenes = useFactoryStore.getState().activeScenes;
      for (const scene of activeScenes) {
        if (scene.status === "normal" && !currentIds.has(scene.sceneId)) {
          api.highlightBuilding(scene.buildingId, "#00C48C", false);
        }
      }
    }

    prevAnomalyIdsRef.current = currentIds;
  }, [anomalies, monitoringActive, sceneRef, openPopup]);

  // Cleanup when monitoring stops
  useEffect(() => {
    if (!monitoringActive) {
      sceneRef.current?.clearAllZoneHighlights();
      prevAnomalyIdsRef.current.clear();
    }
  }, [monitoringActive, sceneRef]);

  // This is a headless component
  return null;
}

/** Create a fake Date with a specific hour and day-of-week for demo purposes */
function createFakeDate(hour: number, dayOfWeek: number): Date {
  const now = new Date();
  // Find the next occurrence of the target day
  const currentDay = now.getDay();
  const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  const target = new Date(now);
  target.setDate(target.getDate() + daysToAdd);
  target.setHours(hour, 0, 0, 0);
  return target;
}
