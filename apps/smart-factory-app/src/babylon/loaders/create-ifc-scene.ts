import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

// Side-effect imports — register material types, loaders, and features
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Layers/glowLayer";
import "@babylonjs/core/Animations/animatable";

import { loadIFCModel, type IFCModelResult } from "./ifc-model-loader";
import { getOrCreateMaterial, clearMaterialCache } from "./ifc-material-presets";
import { buildIFCIndices } from "./ifc-index-builder";
import {
  createStoreyFilterManager,
  createIFCHighlightManager,
  createIFCInteractionManager,
  createMepStatusManager,
  createSectionViewManager,
  createSensorBillboardManager,
  createZoneHeatmapManager,
  createPipeFlowManager,
  createIFCCCTVManager,
  createIFCViewModeManager,
  createIFCCameraManager,
} from "../ifc-features";
import type {
  Discipline,
  ElementMeta,
  IFCIndices,
  ViewMode,
  IFCCameraMode,
  MepStatus,
  MepAlarm,
  SectionAxis,
  SensorReading,
  StoreyInfo,
} from "../types";

// --- Extended IFC Scene API ---

export interface IFCSceneApi {
  scene: Scene;
  models: IFCModelResult[];
  indices: IFCIndices;

  // Discipline
  setDisciplineVisible(discipline: Discipline, visible: boolean): void;
  getElementByExpressID(expressID: number): ElementMeta | undefined;
  getMeshExpressIDs(mesh: AbstractMesh): number[];
  fitCamera(): void;

  // Storey
  getStoreys(): StoreyInfo[];
  setStoreyVisible(storeyId: number, visible: boolean): void;
  isolateStorey(storeyId: number): void;
  showAllStoreys(): void;

  // Highlight
  selectMesh(mesh: AbstractMesh): void;
  hoverMesh(mesh: AbstractMesh | null): void;
  clearSelection(): void;

  // Interaction
  onSelect(callback: (element: ElementMeta | null, mesh: AbstractMesh | null) => void): void;

  // MEP Status
  updateMepStatus(expressID: number, status: MepStatus): void;
  addMepAlarm(alarm: MepAlarm): void;
  clearMepAlarm(expressID: number): void;
  clearAllMepAlarms(): void;
  getMepAlarms(): MepAlarm[];
  getMepExpressIDs(): number[];

  // Section View
  enableSection(axis: SectionAxis, position: number): void;
  setSectionPosition(position: number): void;
  disableSection(): void;
  isSectionEnabled(): boolean;

  // Sensor Billboards
  updateSensorReadings(readings: SensorReading[]): void;
  setSensorBillboardsVisible(visible: boolean): void;

  // Heatmap
  setElementHeat(expressID: number, value: number): void;
  setStoreyHeat(storeyId: number, value: number): void;
  clearHeatmap(): void;

  // Pipe Flow
  setPipeFlowVisible(visible: boolean): void;
  setPipeFlowSpeed(speed: number): void;

  // CCTV
  openCCTVPanel(id: string, label: string, storeyId: number): void;
  setCCTVVideoSource(id: string, videoElement: HTMLVideoElement): void;
  updateCCTVStatus(id: string, status: "idle" | "connecting" | "connected" | "failed"): void;
  closeCCTVPanel(id: string): void;
  closeAllCCTVPanels(): void;

  // View Mode
  setViewMode(mode: ViewMode): void;
  getViewMode(): ViewMode;

  // Camera Mode
  setCameraMode(mode: IFCCameraMode): void;
  getCameraMode(): IFCCameraMode;
  focusStorey(storeyId: number): void;

  // Cleanup
  dispose(): void;
}

/**
 * Create a Babylon.js scene optimized for viewing IFC models
 * with full building monitoring capabilities.
 */
export async function createIFCScene(
  canvas: HTMLCanvasElement,
  modelConfigs: Array<{
    basePath: string;
    disciplines?: Discipline[];
  }>
): Promise<IFCSceneApi> {
  // --- Engine & Scene ---
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true,
  });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.12, 0.13, 0.15, 1);
  scene.ambientColor = new Color3(0.15, 0.15, 0.18);

  // --- Camera (ArcRotate — main) ---
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 4,
    Math.PI / 3,
    50,
    Vector3.Zero(),
    scene
  );
  camera.minZ = 0.1;
  camera.maxZ = 5000;
  camera.wheelPrecision = 5;
  camera.panningSensibility = 50;
  camera.lowerRadiusLimit = 1;
  camera.attachControl(canvas, true);

  // --- FPS Camera (initially detached) ---
  const fpsCamera = new UniversalCamera("ifcFpsCamera", new Vector3(0, 2, 0), scene);
  fpsCamera.speed = 0.3;
  fpsCamera.angularSensibility = 2000;
  fpsCamera.ellipsoid = new Vector3(0.3, 0.8, 0.3);
  fpsCamera.checkCollisions = true;
  fpsCamera.minZ = 0.1;
  fpsCamera.keysUp = [87]; // W
  fpsCamera.keysDown = [83]; // S
  fpsCamera.keysLeft = [65]; // A
  fpsCamera.keysRight = [68]; // D

  // --- Lighting ---
  const hemiLight = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.9;
  hemiLight.groundColor = new Color3(0.4, 0.4, 0.45);

  const dirLight = new DirectionalLight("dir", new Vector3(-0.5, -1, 0.5).normalize(), scene);
  dirLight.intensity = 1.0;
  dirLight.position = new Vector3(50, 100, -50);

  const fillLight = new DirectionalLight("fill", new Vector3(0.5, -0.5, -0.5).normalize(), scene);
  fillLight.intensity = 0.4;

  // --- Glow Layers ---
  const glowLayer = new GlowLayer("ifcGlow", scene, {
    mainTextureSamples: 4,
    blurKernelSize: 32,
  });
  glowLayer.intensity = 0.6;

  const alarmGlowLayer = new GlowLayer("ifcAlarmGlow", scene, {
    mainTextureSamples: 4,
    blurKernelSize: 64,
  });
  alarmGlowLayer.intensity = 0.8;

  // --- Load IFC Models ---
  const models: IFCModelResult[] = [];
  for (const config of modelConfigs) {
    try {
      const result = await loadIFCModel(scene, config.basePath, config.disciplines);
      models.push(result);
      applyIFCMaterials(scene, result);
    } catch (err) {
      console.warn(`[IFC Scene] Failed to load model ${config.basePath}:`, err);
    }
  }

  // --- Build Indices ---
  const indices = buildIFCIndices(models);

  // --- Diagnostics ---
  console.group("[IFC Scene] Load Summary");
  console.log(`Models loaded: ${models.length}`);
  for (const m of models) {
    const meshCount = m.meshes.length;
    const withIds = m.meshes.filter(
      (mesh) => ((mesh.metadata?.ifcExpressIDs as number[] | undefined) ?? []).length > 0
    ).length;
    console.log(`  Model meshes: ${meshCount}, with expressIDs: ${withIds}`);
  }
  console.log(`Index — storeys: ${indices.storeys.length}`);
  console.log(`Index — expressIdToMesh: ${indices.expressIdToMesh.size}`);
  console.log(`Index — typeMeshes keys: ${[...indices.typeMeshes.keys()].join(", ")}`);
  for (const [type, meshes] of indices.typeMeshes) {
    console.log(`  ${type}: ${meshes.length} meshes`);
  }
  console.groupEnd();

  // --- Create Feature Managers ---
  const storeyFilter = createStoreyFilterManager(indices);
  const highlight = createIFCHighlightManager(glowLayer, alarmGlowLayer);
  const interaction = createIFCInteractionManager(scene, models);
  const mepStatus = createMepStatusManager(scene, indices, alarmGlowLayer);
  const sectionView = createSectionViewManager(scene);
  const sensorBillboard = createSensorBillboardManager(scene, indices);
  const heatmap = createZoneHeatmapManager(indices);
  const pipeFlow = createPipeFlowManager(scene, indices, glowLayer);
  const cctvManager = createIFCCCTVManager(scene, glowLayer, indices);
  const viewMode = createIFCViewModeManager(scene, [camera, fpsCamera]);
  const cameraManager = createIFCCameraManager(scene, camera, fpsCamera, indices);

  // --- Fit camera to loaded geometry ---
  function fitCamera() {
    const allMeshes = models
      .flatMap((m) => m.meshes)
      .filter((m) => m.getTotalVertices() > 0 && m.isEnabled());
    if (allMeshes.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const mesh of allMeshes) {
      mesh.refreshBoundingInfo({});
      const bounds = mesh.getBoundingInfo().boundingBox;
      const worldMin = bounds.minimumWorld;
      const worldMax = bounds.maximumWorld;
      minX = Math.min(minX, worldMin.x);
      minY = Math.min(minY, worldMin.y);
      minZ = Math.min(minZ, worldMin.z);
      maxX = Math.max(maxX, worldMax.x);
      maxY = Math.max(maxY, worldMax.y);
      maxZ = Math.max(maxZ, worldMax.z);
    }

    const center = new Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
    const extent = new Vector3(maxX - minX, maxY - minY, maxZ - minZ);
    const radius = extent.length() * 0.7;

    camera.target = center;
    camera.radius = radius;
    camera.alpha = -Math.PI / 4;
    camera.beta = Math.PI / 3;
  }

  fitCamera();

  // --- Render loop ---
  engine.runRenderLoop(() => scene.render());
  const handleResize = () => engine.resize();
  window.addEventListener("resize", handleResize);

  // --- Discipline helpers ---
  function setDisciplineVisible(disc: Discipline, visible: boolean) {
    for (const model of models) model.setDisciplineVisible(disc, visible);
  }

  function getElementByExpressID(expressID: number): ElementMeta | undefined {
    for (const model of models) {
      const el = model.getElementByExpressID(expressID);
      if (el) return el;
    }
    return undefined;
  }

  function getMeshExpressIDs(mesh: AbstractMesh): number[] {
    for (const model of models) {
      const ids = model.getMeshExpressIDs(mesh);
      if (ids.length > 0) return ids;
    }
    return [];
  }

  function dispose() {
    window.removeEventListener("resize", handleResize);
    cameraManager.dispose();
    viewMode.dispose();
    cctvManager.dispose();
    pipeFlow.dispose();
    heatmap.dispose();
    sensorBillboard.dispose();
    sectionView.dispose();
    mepStatus.dispose();
    interaction.dispose();
    highlight.dispose();
    storeyFilter.dispose();
    for (const model of models) model.dispose();
    clearMaterialCache();
    scene.dispose();
    engine.dispose();
  }

  return {
    scene,
    models,
    indices,

    // Discipline
    setDisciplineVisible,
    getElementByExpressID,
    getMeshExpressIDs,
    fitCamera,

    // Storey
    getStoreys: () => storeyFilter.getStoreys(),
    setStoreyVisible: (id, v) => storeyFilter.setStoreyVisible(id, v),
    isolateStorey: (id) => storeyFilter.isolateStorey(id),
    showAllStoreys: () => storeyFilter.showAllStoreys(),

    // Highlight
    selectMesh: (mesh) => highlight.selectMesh(mesh),
    hoverMesh: (mesh) => highlight.hoverMesh(mesh),
    clearSelection: () => highlight.clearSelection(),

    // Interaction
    onSelect: (cb) => interaction.onSelect(cb),

    // MEP
    updateMepStatus: (eid, s) => mepStatus.updateStatus(eid, s),
    addMepAlarm: (a) => mepStatus.addAlarm(a),
    clearMepAlarm: (eid) => mepStatus.clearAlarm(eid),
    clearAllMepAlarms: () => mepStatus.clearAllAlarms(),
    getMepAlarms: () => mepStatus.getAlarms(),
    getMepExpressIDs: () => mepStatus.getMepExpressIDs(),

    // Section
    enableSection: (axis, pos) => sectionView.enableSection(axis, pos),
    setSectionPosition: (pos) => sectionView.setPosition(pos),
    disableSection: () => sectionView.disableSection(),
    isSectionEnabled: () => sectionView.isEnabled(),

    // Sensor
    updateSensorReadings: (r) => sensorBillboard.updateFromReadings(r),
    setSensorBillboardsVisible: (v) => sensorBillboard.setVisible(v),

    // Heatmap
    setElementHeat: (eid, v) => heatmap.setElementHeat(eid, v),
    setStoreyHeat: (sid, v) => heatmap.setStoreyHeat(sid, v, indices),
    clearHeatmap: () => heatmap.clearHeatmap(),

    // Pipe Flow
    setPipeFlowVisible: (v) => pipeFlow.setFlowVisible(v),
    setPipeFlowSpeed: (s) => pipeFlow.setFlowSpeed(s),

    // CCTV
    openCCTVPanel: (id, label, sid) => cctvManager.openPanel(id, label, sid),
    setCCTVVideoSource: (id, ve) => cctvManager.setVideoSource(id, ve),
    updateCCTVStatus: (id, s) => cctvManager.updateStatus(id, s),
    closeCCTVPanel: (id) => cctvManager.closePanel(id),
    closeAllCCTVPanels: () => cctvManager.closeAll(),

    // View Mode
    setViewMode: (m) => viewMode.setMode(m),
    getViewMode: () => viewMode.getMode(),

    // Camera Mode
    setCameraMode: (m) => cameraManager.setMode(m),
    getCameraMode: () => cameraManager.getMode(),
    focusStorey: (sid) => cameraManager.focusStorey(sid),

    dispose,
  };
}

// --- Material application (unchanged) ---

function applyIFCMaterials(scene: Scene, model: IFCModelResult): void {
  let applied = 0;
  let skipped = 0;

  for (const mesh of model.meshes) {
    const expressIDs = model.getMeshExpressIDs(mesh);
    if (expressIDs.length === 0) {
      skipped++;
      continue;
    }

    const typeCounts = new Map<string, number>();
    for (const eid of expressIDs) {
      const meta = model.getElementByExpressID(eid);
      if (meta) {
        typeCounts.set(meta.type, (typeCounts.get(meta.type) ?? 0) + 1);
      }
    }

    let dominantType = "Unknown";
    let maxCount = 0;
    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    }

    if (dominantType === "IfcOpeningElement") {
      mesh.setEnabled(false);
      continue;
    }

    const mat = getOrCreateMaterial(scene, dominantType);
    mesh.material = mat;
    applied++;
  }

  console.log(`[IFC Materials] Applied: ${applied}, Skipped (no expressIDs): ${skipped}`);
}
