import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, PowerReading, BuildingId, GeneratorStatus } from "../types";
import { buildCableRoute, updateCableColor } from "../geometry/electrical/cable-route";
import { buildDistributionPanel } from "../geometry/electrical/distribution-panel";
import { buildTransformer } from "../geometry/electrical/transformer";
import { buildExternalPower } from "../geometry/electrical/external-power";
import {
  buildEmergencyGenerator,
  setGeneratorStatus,
} from "../geometry/electrical/emergency-generator";
import { createPowerFlowEffect } from "../effects/power-flow-effect";
import { createOverloadEffect } from "../effects/overload-effect";
import { createDisconnectSimulator } from "../effects/disconnect-simulator";
import { createPanelBillboards } from "../effects/panel-billboard";
import {
  TRANSFORMER,
  PANELS,
  CABLE_ROUTES,
  EXTERNAL_POWER,
  EMERGENCY_GENERATOR,
} from "@/config/electrical.config";

export function createElectricalManager(ctx: SceneContext) {
  const { scene, shadowGenerator, glowLayer, overloadGlowLayer } = ctx;

  const cables = new Map<string, Mesh>();
  const panels = new Map<string, TransformNode>();
  let transformerNode: TransformNode | null = null;
  let externalPowerNode: TransformNode | null = null;
  let generatorNode: TransformNode | null = null;
  let visible = true;

  // Effects (initialized after build)
  let flowEffect: ReturnType<typeof createPowerFlowEffect> | null = null;
  let overloadEffect: ReturnType<typeof createOverloadEffect> | null = null;
  let disconnectSim: ReturnType<typeof createDisconnectSimulator> | null = null;
  let billboards: ReturnType<typeof createPanelBillboards> | null = null;

  // Generator animation state
  let generatorStatus: GeneratorStatus = "standby";
  let generatorBlinkTimer: ReturnType<typeof setInterval> | null = null;

  /** Build all electrical elements + effects */
  function build(buildingNodes: Map<BuildingId, TransformNode>): void {
    // Transformer
    transformerNode = buildTransformer(scene, shadowGenerator, TRANSFORMER);

    // External power source
    externalPowerNode = buildExternalPower(scene, shadowGenerator, EXTERNAL_POWER);

    // Emergency generator
    generatorNode = buildEmergencyGenerator(scene, shadowGenerator, EMERGENCY_GENERATOR);

    // Distribution panels
    for (const panelCfg of PANELS) {
      const node = buildDistributionPanel(scene, shadowGenerator, panelCfg);
      panels.set(panelCfg.id, node);
    }

    // Cable routes
    for (const routeCfg of CABLE_ROUTES) {
      const mesh = buildCableRoute(scene, routeCfg);
      cables.set(routeCfg.id, mesh);
    }

    // --- Effects ---
    flowEffect = createPowerFlowEffect(scene, cables, CABLE_ROUTES, glowLayer);
    overloadEffect = createOverloadEffect(scene, overloadGlowLayer, buildingNodes);
    disconnectSim = createDisconnectSimulator(scene, cables, flowEffect, panels, CABLE_ROUTES);
    billboards = createPanelBillboards(scene, panels, PANELS);
  }

  /** Toggle cable/panel/transformer visibility */
  function setCablesVisible(show: boolean): void {
    visible = show;
    for (const cable of cables.values()) {
      cable.setEnabled(show);
    }
    if (transformerNode) {
      transformerNode.setEnabled(show);
    }
    if (externalPowerNode) {
      externalPowerNode.setEnabled(show);
    }
    if (generatorNode) {
      generatorNode.setEnabled(show);
    }
    for (const panel of panels.values()) {
      panel.setEnabled(show);
    }
  }

  /** Toggle power flow particles */
  function setFlowVisible(show: boolean): void {
    flowEffect?.setFlowVisible(show);
  }

  /** Toggle billboard labels */
  function setBillboardsVisible(show: boolean): void {
    billboards?.setVisible(show);
  }

  /** Update cable colors + effects based on power readings */
  function updateLoads(readings: PowerReading[]): void {
    // Map panel readings to their parent cable
    const panelLevels = new Map<string, PowerReading>();
    for (const r of readings) {
      panelLevels.set(r.panelId, r);
    }

    for (const routeCfg of CABLE_ROUTES) {
      const cable = cables.get(routeCfg.id);
      if (!cable) continue;

      const reading = panelLevels.get(routeCfg.toId);
      if (reading) {
        updateCableColor(cable, reading.level);
      }
    }

    // Update effects
    flowEffect?.updateFlowLoads(readings);
    overloadEffect?.updateOverload(readings);
    billboards?.updateBillboards(readings);
  }

  /** Disconnect a cable (with cascade) */
  function disconnectCable(cableId: string): void {
    disconnectSim?.disconnect(cableId);
  }

  /** Reconnect a cable (with cascade) */
  function reconnectCable(cableId: string): void {
    disconnectSim?.reconnect(cableId);
  }

  /** Check if cable is disconnected */
  function isCableDisconnected(cableId: string): boolean {
    return disconnectSim?.isDisconnected(cableId) ?? false;
  }

  /** Start emergency generator (with startup sequence) */
  function setGeneratorRunning(active: boolean): void {
    if (!generatorNode) return;

    if (active && generatorStatus === "standby") {
      // Starting phase
      generatorStatus = "starting";
      setGeneratorStatus(generatorNode, "starting");

      // Blink effect during starting
      let blinkOn = true;
      generatorBlinkTimer = setInterval(() => {
        if (!generatorNode) return;
        if (blinkOn) {
          setGeneratorStatus(generatorNode, "starting");
        } else {
          setGeneratorStatus(generatorNode, "standby");
        }
        blinkOn = !blinkOn;
      }, 500);

      // After 3 seconds, switch to running
      setTimeout(() => {
        if (generatorBlinkTimer) {
          clearInterval(generatorBlinkTimer);
          generatorBlinkTimer = null;
        }
        if (!generatorNode) return;
        generatorStatus = "running";
        setGeneratorStatus(generatorNode, "running");
      }, 3000);
    } else if (!active) {
      // Stop generator
      if (generatorBlinkTimer) {
        clearInterval(generatorBlinkTimer);
        generatorBlinkTimer = null;
      }
      generatorStatus = "standby";
      if (generatorNode) {
        setGeneratorStatus(generatorNode, "standby");
      }
    }
  }

  function getGeneratorStatus(): GeneratorStatus {
    return generatorStatus;
  }

  function isVisible(): boolean {
    return visible;
  }

  function dispose(): void {
    if (generatorBlinkTimer) {
      clearInterval(generatorBlinkTimer);
      generatorBlinkTimer = null;
    }

    flowEffect?.dispose();
    overloadEffect?.dispose();
    disconnectSim?.dispose();
    billboards?.dispose();

    for (const cable of cables.values()) {
      cable.dispose();
    }
    cables.clear();
    for (const panel of panels.values()) {
      panel.dispose(false, true);
    }
    panels.clear();
    if (transformerNode) {
      transformerNode.dispose(false, true);
      transformerNode = null;
    }
    if (externalPowerNode) {
      externalPowerNode.dispose(false, true);
      externalPowerNode = null;
    }
    if (generatorNode) {
      generatorNode.dispose(false, true);
      generatorNode = null;
    }
  }

  return {
    build,
    setCablesVisible,
    setFlowVisible,
    setBillboardsVisible,
    updateLoads,
    disconnectCable,
    reconnectCable,
    isCableDisconnected,
    setGeneratorRunning,
    getGeneratorStatus,
    isVisible,
    dispose,
  };
}
