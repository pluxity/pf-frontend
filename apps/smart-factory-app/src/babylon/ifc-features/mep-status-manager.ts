import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { IFCIndices, MepStatus, MepAlarm } from "../types";

const STATUS_COLORS: Record<MepStatus, Color3> = {
  normal: new Color3(0.2, 0.7, 0.3), // Green
  warning: new Color3(1.0, 0.65, 0.0), // Orange
  error: new Color3(0.9, 0.15, 0.1), // Red
  offline: new Color3(0.3, 0.3, 0.35), // Gray
};

/** IFC types considered MEP equipment */
const MEP_TYPES = [
  "IfcFlowMovingDevice",
  "IfcEnergyConversionDevice",
  "IfcFlowController",
  "IfcFlowStorageDevice",
  "IfcFlowTerminal",
  "IfcFlowSegment",
  "IfcFlowFitting",
];

interface MepEntry {
  mesh: AbstractMesh;
  originalColor: Color3;
  status: MepStatus;
  hasAlarm: boolean;
}

/**
 * MEP equipment status monitoring and alarm manager.
 * Auto-discovers MEP devices from IFC indices and provides
 * status coloring + alarm glow pulse.
 */
export function createMepStatusManager(
  scene: Scene,
  indices: IFCIndices,
  alarmGlowLayer: GlowLayer
) {
  const entries = new Map<number, MepEntry>();
  let observer: Observer<Scene> | null = null;
  let time = 0;
  const alarms: MepAlarm[] = [];

  // Auto-discover MEP devices
  for (const typeName of MEP_TYPES) {
    const meshes = indices.typeMeshes.get(typeName);
    if (!meshes) continue;

    for (const mesh of meshes) {
      // Get expressIDs for this mesh
      const eids = (mesh.metadata?.ifcExpressIDs as number[] | undefined) ?? [];
      for (const eid of eids) {
        if (entries.has(eid)) continue;

        const mat = mesh.material as StandardMaterial | null;
        const baseColor = mat?.metadata?.baseColor as Color3 | undefined;

        entries.set(eid, {
          mesh,
          originalColor: baseColor?.clone() ?? new Color3(0.3, 0.35, 0.4),
          status: "normal",
          hasAlarm: false,
        });
      }
    }
  }

  // Alarm pulse animation
  observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    time += dt;

    for (const entry of entries.values()) {
      if (!entry.hasAlarm) continue;

      const mat = entry.mesh.material as StandardMaterial | null;
      if (!mat) continue;

      // Pulse emissive for alarm
      const pulse = 0.3 + 0.3 * Math.sin(time * 5);
      const statusColor = STATUS_COLORS[entry.status] ?? STATUS_COLORS.error;
      mat.emissiveColor = statusColor.scale(pulse);
    }
  });

  function updateStatus(expressID: number, status: MepStatus): void {
    const entry = entries.get(expressID);
    if (!entry) return;

    entry.status = status;
    const mat = entry.mesh.material as StandardMaterial | null;
    if (!mat) return;

    // Tint: 60% original + 40% status color
    const statusColor = STATUS_COLORS[status];
    if (statusColor) {
      mat.diffuseColor = Color3.Lerp(entry.originalColor, statusColor, 0.4);
    }
  }

  function setAlarm(expressID: number, active: boolean): void {
    const entry = entries.get(expressID);
    if (!entry) return;

    entry.hasAlarm = active;

    if (active) {
      if (entry.mesh instanceof Mesh) {
        alarmGlowLayer.addIncludedOnlyMesh(entry.mesh);
      }
    } else {
      if (entry.mesh instanceof Mesh) {
        alarmGlowLayer.removeIncludedOnlyMesh(entry.mesh);
      }
      // Reset emissive
      const mat = entry.mesh.material as StandardMaterial | null;
      if (mat) {
        mat.emissiveColor = Color3.Black();
      }
    }
  }

  function addAlarm(alarm: MepAlarm): void {
    alarms.push(alarm);
    setAlarm(alarm.expressID, true);
    updateStatus(alarm.expressID, alarm.level === "critical" ? "error" : "warning");
  }

  function clearAlarm(expressID: number): void {
    setAlarm(expressID, false);
    updateStatus(expressID, "normal");
    const idx = alarms.findIndex((a) => a.expressID === expressID);
    if (idx >= 0) alarms.splice(idx, 1);
  }

  function clearAllAlarms(): void {
    for (const entry of entries.values()) {
      if (entry.hasAlarm) {
        entry.hasAlarm = false;
        if (entry.mesh instanceof Mesh) {
          alarmGlowLayer.removeIncludedOnlyMesh(entry.mesh);
        }
        const mat = entry.mesh.material as StandardMaterial | null;
        if (mat) {
          mat.emissiveColor = Color3.Black();
          mat.diffuseColor = entry.originalColor.clone();
        }
      }
      entry.status = "normal";
    }
    alarms.length = 0;
  }

  function getAlarms(): MepAlarm[] {
    return [...alarms];
  }

  function getMepExpressIDs(): number[] {
    return [...entries.keys()];
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    clearAllAlarms();
    entries.clear();
  }

  return {
    updateStatus,
    setAlarm,
    addAlarm,
    clearAlarm,
    clearAllAlarms,
    getAlarms,
    getMepExpressIDs,
    dispose,
  };
}
