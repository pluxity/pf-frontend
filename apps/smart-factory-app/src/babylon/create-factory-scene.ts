import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { createEngineSetup } from "./core/engine-setup";
import { buildBuilding, buildCampusGround, buildPathways } from "./geometry";
import { addBuildingLights } from "./geometry/building-lights";
import {
  createEquipmentManager,
  createHighlightManager,
  createInteractionManager,
  createCameraManager,
  createElectricalManager,
} from "./features";
import { createZoneHighlight } from "./effects/zone-highlight";
import { createViewModeManager } from "./effects/view-mode-manager";
import { createEmergencyRouteManager } from "./effects/emergency-route";
import { createEvacuationSimulation } from "./effects/evacuation-simulation";
import { createFireSimulation } from "./effects/fire-simulation";
import { createCCTVPanelManager } from "./features/cctv-panel-manager";
import { BUILDINGS, PATHWAYS } from "@/config/campus-layout.config";
import type {
  CampusSceneApi,
  EquipmentDefinition,
  EquipmentStatus,
  BuildingId,
  PowerReading,
  CameraMode,
  ViewMode,
} from "./types";

/**
 * Create the entire multi-building campus scene and return an imperative API.
 */
export function createCampusScene(canvas: HTMLCanvasElement): CampusSceneApi {
  // 1. Core setup (engine, scene, camera, lights, shadows, glow)
  const ctx = createEngineSetup(canvas);

  // 2. Campus ground
  buildCampusGround(ctx);

  // 3. Buildings
  const buildingNodes = new Map<BuildingId, TransformNode>();
  for (const buildingCfg of BUILDINGS) {
    const node = buildBuilding(ctx, buildingCfg);
    buildingNodes.set(buildingCfg.id, node);
    addBuildingLights(ctx.scene, buildingCfg, node);
  }

  // 4. Pathways
  buildPathways(ctx, PATHWAYS);

  // 5. Feature managers
  const equipmentMgr = createEquipmentManager(ctx);
  const highlightMgr = createHighlightManager(ctx, equipmentMgr);
  const interactionMgr = createInteractionManager(ctx.scene);
  const cameraMgr = createCameraManager(ctx.scene, ctx.camera, ctx.fpsCamera, buildingNodes);
  const electricalMgr = createElectricalManager(ctx);

  // 6. Build electrical elements (pass buildingNodes for overload effects)
  electricalMgr.build(buildingNodes);

  // 7. Zone highlight effect
  const zoneHighlight = createZoneHighlight(ctx.scene, buildingNodes);

  // 8. CCTV 3D panel manager
  const cctvPanelMgr = createCCTVPanelManager(ctx.scene, ctx.glowLayer);

  // 9. View mode manager (post-processing)
  const viewModeMgr = createViewModeManager(ctx.scene, [ctx.camera, ctx.fpsCamera]);

  // 10. Emergency route manager
  const routeMgr = createEmergencyRouteManager(ctx.scene, ctx.glowLayer);

  // 11. Evacuation simulation
  const evacuationSim = createEvacuationSimulation(ctx.scene, ctx.glowLayer, routeMgr);

  // 12. Fire simulation
  const fireSim = createFireSimulation(ctx.scene, ctx.glowLayer, buildingNodes);

  // --- Public API ---
  const api: CampusSceneApi = {
    addEquipment(def: EquipmentDefinition) {
      equipmentMgr.addEquipment(def);
    },

    removeEquipment(id: string) {
      equipmentMgr.removeEquipment(id);
    },

    updateEquipmentStatus(id: string, status: EquipmentStatus) {
      equipmentMgr.updateStatus(id, status);
    },

    highlightEquipment(id: string) {
      highlightMgr.highlight(id);
    },

    clearHighlight() {
      highlightMgr.clearHighlight();
    },

    getEquipmentMesh(id: string) {
      return equipmentMgr.getMesh(id);
    },

    onEquipmentClick(handler: (id: string | null) => void) {
      interactionMgr.onEquipmentClick(handler);
    },

    onBuildingClick(handler: (buildingId: BuildingId | null) => void) {
      interactionMgr.onBuildingClick(handler);
    },

    focusBuilding(buildingId: BuildingId) {
      cameraMgr.focusBuilding(buildingId);
    },

    focusCampus() {
      cameraMgr.focusCampus();
    },

    setCablesVisible(visible: boolean) {
      electricalMgr.setCablesVisible(visible);
    },

    updateCableLoads(readings: PowerReading[]) {
      electricalMgr.updateLoads(readings);
    },

    getBuildingNode(buildingId: BuildingId) {
      return buildingNodes.get(buildingId) ?? null;
    },

    disconnectCable(cableId: string) {
      electricalMgr.disconnectCable(cableId);
    },

    reconnectCable(cableId: string) {
      electricalMgr.reconnectCable(cableId);
    },

    startEmergencyPower() {
      electricalMgr.setGeneratorRunning(true);
    },

    stopEmergencyPower() {
      electricalMgr.setGeneratorRunning(false);
    },

    setFlowVisible(visible: boolean) {
      electricalMgr.setFlowVisible(visible);
    },

    setBillboardsVisible(visible: boolean) {
      electricalMgr.setBillboardsVisible(visible);
    },

    highlightZone(buildingId: BuildingId, zoneIndex: number, color: string, pulse?: boolean) {
      zoneHighlight.highlightZone(buildingId, zoneIndex, color, pulse);
    },

    highlightBuilding(buildingId: BuildingId, color: string, pulse?: boolean) {
      zoneHighlight.highlightBuilding(buildingId, color, pulse);
    },

    clearZoneHighlight(buildingId: BuildingId) {
      zoneHighlight.clearZoneHighlight(buildingId);
    },

    clearAllZoneHighlights() {
      zoneHighlight.clearAllZoneHighlights();
    },

    openCCTVPanel(id: string, label: string, buildingId: BuildingId, triggerLabel?: string) {
      cctvPanelMgr.openPanel(id, label, buildingId, triggerLabel);
    },

    setCCTVVideoSource(id: string, videoElement: HTMLVideoElement) {
      cctvPanelMgr.setVideoSource(id, videoElement);
    },

    updateCCTVStatus(id: string, status: "idle" | "connecting" | "connected" | "failed") {
      cctvPanelMgr.updateStatus(id, status);
    },

    closeCCTVPanel(id: string) {
      cctvPanelMgr.closePanel(id);
    },

    closeAllCCTVPanels() {
      cctvPanelMgr.closeAll();
    },

    setCameraMode(mode: CameraMode, buildingId?: BuildingId) {
      cameraMgr.setMode(mode, buildingId);
    },

    getCameraMode() {
      return cameraMgr.getMode();
    },

    setViewMode(mode: ViewMode) {
      viewModeMgr.setMode(mode);
    },

    getViewMode() {
      return viewModeMgr.getMode();
    },

    showEmergencyRoute(routeId: string) {
      routeMgr.showRoute(routeId);
    },

    showAllEmergencyRoutes() {
      routeMgr.showAllRoutes();
    },

    hideEmergencyRoute() {
      routeMgr.hideAllRoutes();
    },

    startEvacuation() {
      evacuationSim.start();
    },

    stopEvacuation() {
      evacuationSim.stop();
    },

    startFire(buildingId: BuildingId, zoneIndex: number) {
      fireSim.startFire(buildingId, zoneIndex);
    },

    spreadFire(buildingId: BuildingId, zoneIndex: number) {
      fireSim.spreadFire(buildingId, zoneIndex);
    },

    startFireAlarm(buildingId: BuildingId) {
      fireSim.startAlarm(buildingId);
    },

    stopFire() {
      fireSim.stopFire();
    },

    dispose() {
      fireSim.dispose();
      evacuationSim.dispose();
      routeMgr.dispose();
      viewModeMgr.dispose();
      cctvPanelMgr.dispose();
      zoneHighlight.dispose();
      electricalMgr.dispose();
      interactionMgr.dispose();
      highlightMgr.dispose();
      equipmentMgr.dispose();
      ctx.scene.dispose();
      ctx.engine.dispose();
    },
  };

  return api;
}

// Backward compat alias
export const createFactoryScene = createCampusScene;
