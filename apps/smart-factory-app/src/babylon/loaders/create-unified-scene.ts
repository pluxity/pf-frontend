import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";

// Side-effect imports: register materials, shaders & features with tree-shaking
import "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Layers/glowLayer";
import "@babylonjs/core/Animations/animatable";
import "@babylonjs/core/Misc/rgbdTextureTools";
import "@babylonjs/core/Shaders/rgbdDecode.fragment";
import "@babylonjs/core/Shaders/rgbdEncode.fragment";
import "@babylonjs/core/Shaders/pass.fragment";
import "@babylonjs/core/Shaders/imageProcessing.fragment";
import "@babylonjs/core/Shaders/kernelBlur.fragment";
import "@babylonjs/core/Shaders/kernelBlur.vertex";
import "@babylonjs/core/Shaders/glowMapMerge.fragment";
import "@babylonjs/core/Shaders/glowMapMerge.vertex";
import "@babylonjs/core/Shaders/glowMapGeneration.fragment";
import "@babylonjs/core/Shaders/glowMapGeneration.vertex";
import "@babylonjs/core/Shaders/glowBlurPostProcess.fragment";

import { loadUnifiedModel } from "./unified-model-loader";
import { createSectionViewManager } from "../ifc-features/section-view-manager";
import { createPathfindingManager } from "../ifc-features/pathfinding-manager";
import type {
  PFDiscipline,
  PFElementMeta,
  PFEquipmentDef,
  PFSystemDef,
  PFSpatialNode,
  UnifiedSceneApi,
  UnifiedLoadOptions,
} from "../types";

/**
 * Create a Babylon.js scene for the unified model viewer.
 * Supports all 3 tiers (raw GLB / pf: naming / full metadata).
 */
export async function createUnifiedScene(
  canvas: HTMLCanvasElement,
  loadOptions: UnifiedLoadOptions & { testBuilding?: boolean }
): Promise<UnifiedSceneApi> {
  // --- Engine & Scene ---
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true,
  });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.12, 0.13, 0.15, 1);
  scene.ambientColor = new Color3(0.15, 0.15, 0.18);

  // --- Camera ---
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
  camera.lowerRadiusLimit = 0.5;
  camera.attachControl(canvas, true);

  // --- Lighting ---
  const hemiLight = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.9;
  hemiLight.groundColor = new Color3(0.4, 0.4, 0.45);

  const dirLight = new DirectionalLight("dir", new Vector3(-0.5, -1, 0.5).normalize(), scene);
  dirLight.intensity = 1.0;
  dirLight.position = new Vector3(50, 100, -50);

  const fillLight = new DirectionalLight("fill", new Vector3(0.5, -0.5, -0.5).normalize(), scene);
  fillLight.intensity = 0.4;

  // --- Glow Layer (gracefully degrade if shader compilation fails) ---
  let glowLayer: GlowLayer | null = null;
  try {
    glowLayer = new GlowLayer("glow", scene, {
      mainTextureSamples: 4,
      blurKernelSize: 32,
    });
    glowLayer.intensity = 0.6;
  } catch (err) {
    console.warn("[createUnifiedScene] GlowLayer failed, continuing without glow:", err);
  }

  // --- Load Model ---
  const model = loadOptions.testBuilding
    ? await loadUnifiedModel(scene, { glbSource: "/test_model.glb", metaSource: null })
    : await loadUnifiedModel(scene, loadOptions);

  // --- Section View Manager (Tier 0+) ---
  const sectionView = createSectionViewManager(scene);

  // --- Pathfinding Manager ---
  const pathfinding = createPathfindingManager(scene, model.meshes);

  // Hide east walls (_WL_E) for testing convenience
  for (const m of model.meshes) {
    if (m.name.includes("_WL_E")) m.isVisible = false;
  }

  // Auto-initialize pathfinding & build NavMesh
  await pathfinding.initialize();
  pathfinding.buildNavMesh();

  // Pathfinding pick callback
  let pathfindingPickCallback: ((pos: { x: number; y: number; z: number }) => void) | null = null;
  // Wall pick callback (for Door mode — click wall to add door)
  let wallPickCallback:
    | ((wallId: string, hitPoint: { x: number; y: number; z: number }) => void)
    | null = null;

  // --- Fit camera to loaded geometry ---
  function fitCamera() {
    const visibleMeshes = model.meshes.filter((m) => m.getTotalVertices() > 0 && m.isEnabled());
    if (visibleMeshes.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const mesh of visibleMeshes) {
      mesh.refreshBoundingInfo({});
      const bounds = mesh.getBoundingInfo().boundingBox;
      const wMin = bounds.minimumWorld;
      const wMax = bounds.maximumWorld;
      minX = Math.min(minX, wMin.x);
      minY = Math.min(minY, wMin.y);
      minZ = Math.min(minZ, wMin.z);
      maxX = Math.max(maxX, wMax.x);
      maxY = Math.max(maxY, wMax.y);
      maxZ = Math.max(maxZ, wMax.z);
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

  // --- Selection state ---
  let selectedMesh: AbstractMesh | null = null;
  let selectCallbacks: ((mesh: AbstractMesh | null, element: PFElementMeta | null) => void)[] = [];

  function selectMesh(mesh: AbstractMesh | null) {
    // Clear previous highlight
    if (selectedMesh && glowLayer) {
      glowLayer.removeIncludedOnlyMesh(selectedMesh as Mesh);
    }

    selectedMesh = mesh;

    if (mesh && glowLayer) {
      glowLayer.addIncludedOnlyMesh(mesh as Mesh);
    }

    // Resolve element meta if Tier 2
    let element: PFElementMeta | null = null;
    if (mesh && model.metadata) {
      // Try to find by node name
      const nodeName = mesh.name;
      element = model.metadata.elements[nodeName] ?? null;
    }

    for (const cb of selectCallbacks) cb(mesh, element);
  }

  // --- Click handler ---
  // Use POINTERTAP for general clicks, and POINTERDOWN for pathfinding pick mode.
  // POINTERTAP includes pickInfo automatically via Babylon.js internal picking.
  scene.onPointerObservable.add((pointerInfo) => {
    const { type } = pointerInfo;

    if (type === PointerEventTypes.POINTERTAP) {
      const pickInfo = pointerInfo.pickInfo;

      // Wall pick mode (Door mode — click on wall to add door)
      if (wallPickCallback && pickInfo?.hit && pickInfo.pickedMesh && pickInfo.pickedPoint) {
        const wallId = pathfinding.findObstacleByMesh(pickInfo.pickedMesh);
        if (wallId) {
          const hp = pickInfo.pickedPoint;
          wallPickCallback(wallId, { x: hp.x, y: hp.y, z: hp.z });
          return;
        }
      }

      // Pathfinding pick mode intercepts normal selection
      if (pathfindingPickCallback && pickInfo?.hit && pickInfo.pickedPoint) {
        const p = pickInfo.pickedPoint;
        pathfindingPickCallback({ x: p.x, y: p.y, z: p.z });
        return;
      }

      if (pickInfo?.hit && pickInfo.pickedMesh) {
        selectMesh(pickInfo.pickedMesh);
      } else {
        selectMesh(null);
      }
    }
  });

  // --- Wireframe toggle ---
  function setWireframe(enabled: boolean) {
    for (const mesh of model.meshes) {
      if (mesh.material) {
        mesh.material.wireframe = enabled;
      }
    }
  }

  // --- Node visibility ---
  function setNodeVisible(nodeId: string, visible: boolean) {
    // Try by name first, then by uniqueId
    let node = model.index.nodeByName.get(nodeId);
    if (!node) {
      const id = parseInt(nodeId, 10);
      if (!isNaN(id)) {
        node =
          (scene.getMeshByUniqueId(id) as AbstractMesh | null) ??
          scene.getTransformNodeByUniqueId(id) ??
          undefined;
      }
    }
    if (!node) return;

    if ("setEnabled" in node) {
      (node as AbstractMesh).setEnabled(visible);
    }
    // Also toggle children
    const children = node.getChildMeshes();
    for (const child of children) {
      child.setEnabled(visible);
    }
  }

  // --- Tier 1: Storey filtering ---
  function setStoreyVisible(storeyId: string, visible: boolean) {
    const node = model.index.storeyNodes.get(storeyId);
    if (!node) return;
    node.setEnabled(visible);
    for (const child of node.getChildMeshes()) {
      child.setEnabled(visible);
    }
  }

  function isolateStorey(storeyId: string) {
    for (const [id, node] of model.index.storeyNodes) {
      const show = id === storeyId;
      node.setEnabled(show);
      for (const child of node.getChildMeshes()) {
        child.setEnabled(show);
      }
    }
  }

  function showAllStoreys() {
    for (const [, node] of model.index.storeyNodes) {
      node.setEnabled(true);
      for (const child of node.getChildMeshes()) {
        child.setEnabled(true);
      }
    }
  }

  function setSystemVisible(systemId: string, visible: boolean) {
    const node = model.index.systemNodes.get(systemId);
    if (!node) return;
    node.setEnabled(visible);
    for (const child of node.getChildMeshes()) {
      child.setEnabled(visible);
    }
  }

  function setDisciplineVisible(discipline: PFDiscipline, visible: boolean) {
    const nodes = model.index.disciplineNodes.get(discipline);
    if (!nodes) return;
    for (const node of nodes) {
      if ("setEnabled" in node) {
        (node as AbstractMesh).setEnabled(visible);
      }
      for (const child of node.getChildMeshes()) {
        child.setEnabled(visible);
      }
    }
  }

  function highlightEquipment(equipmentId: string) {
    clearHighlight();
    if (!glowLayer) return;
    const node = model.index.equipmentNodes.get(equipmentId);
    if (!node) return;
    if ("material" in node) {
      glowLayer.addIncludedOnlyMesh(node as Mesh);
    }
    for (const child of node.getChildMeshes()) {
      glowLayer.addIncludedOnlyMesh(child as Mesh);
    }
  }

  function clearHighlight() {
    if (!glowLayer) return;
    for (const m of model.meshes) {
      glowLayer.removeIncludedOnlyMesh(m as Mesh);
    }
  }

  // --- Tier 1: Queries ---
  function getStoreys() {
    if (model.metadata) {
      return flattenSpatialNodes(model.metadata.spatialHierarchy, "storey");
    }
    // Tier 1: derive from storey nodes
    return [...model.index.storeyNodes.entries()].map(([id]) => ({
      id,
      name: id,
      elevation: 0,
    }));
  }

  function getSystems() {
    if (model.metadata) {
      return Object.values(model.metadata.systems).map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        storeyId: s.storeyId,
      }));
    }
    return [...model.index.systemNodes.entries()].map(([id]) => ({
      id,
      name: id,
      type: "unknown",
      storeyId: null as string | null,
    }));
  }

  function getEquipment(): PFEquipmentDef[] {
    return model.metadata ? Object.values(model.metadata.equipment) : [];
  }

  function getSpatialHierarchy(): PFSpatialNode[] {
    return model.metadata?.spatialHierarchy ?? [];
  }

  // --- Tier 2: Metadata queries ---
  function getElementMeta(nodeId: string): PFElementMeta | null {
    return model.metadata?.elements[nodeId] ?? null;
  }

  function getEquipmentDef(equipmentId: string): PFEquipmentDef | null {
    return model.metadata?.equipment[equipmentId] ?? null;
  }

  function getSystemDef(systemId: string): PFSystemDef | null {
    return model.metadata?.systems[systemId] ?? null;
  }

  // --- Render loop ---
  engine.runRenderLoop(() => scene.render());
  const handleResize = () => engine.resize();
  window.addEventListener("resize", handleResize);

  // Force initial resize to pick up correct canvas dimensions
  engine.resize();

  // --- Dispose ---
  function dispose() {
    window.removeEventListener("resize", handleResize);
    selectCallbacks = [];
    pathfindingPickCallback = null;
    pathfinding.dispose();
    sectionView.dispose();
    model.root.dispose();
    scene.dispose();
    engine.dispose();
  }

  return {
    scene,
    model,

    // Engine
    resize: () => engine.resize(),

    // Tier 0
    fitCamera,
    setWireframe,
    setNodeVisible,
    selectMesh,
    onSelect: (cb) => {
      selectCallbacks.push(cb);
    },

    // Section
    enableSection: (axis, pos) => sectionView.enableSection(axis, pos),
    setSectionPosition: (pos) => sectionView.setPosition(pos),
    disableSection: () => sectionView.disableSection(),
    isSectionEnabled: () => sectionView.isEnabled(),

    // Tier 1
    setStoreyVisible,
    isolateStorey,
    showAllStoreys,
    setSystemVisible,
    setDisciplineVisible,
    highlightEquipment,
    clearHighlight,

    getStoreys,
    getSystems,
    getEquipment,
    getSpatialHierarchy,

    // Tier 2
    getElementMeta,
    getEquipmentDef,
    getSystemDef,

    // Pathfinding
    initPathfinding: () => pathfinding.initialize(),
    getWalkableMeshes: () => pathfinding.getWalkableMeshes(),
    setWalkableMeshes: (meshes) => pathfinding.setWalkableMeshes(meshes),
    buildNavMesh: () => pathfinding.buildNavMesh(),
    isNavMeshReady: () => pathfinding.isNavMeshReady(),
    setPathfindingStart: (pos) => pathfinding.setStartPoint(new Vector3(pos.x, pos.y, pos.z)),
    setPathfindingEnd: (pos) => pathfinding.setEndPoint(new Vector3(pos.x, pos.y, pos.z)),
    getPathInfo: () => {
      const wp = pathfinding.getWaypoints();
      if (wp.length === 0) return null;
      return { distance: pathfinding.getPathDistance(), waypoints: wp.length };
    },
    startPathAnimation: (speed) => pathfinding.startAnimation(speed),
    stopPathAnimation: () => pathfinding.stopAnimation(),
    isPathAnimating: () => pathfinding.isAnimating(),
    showNavMeshDebug: (show) => pathfinding.showDebugNavMesh(show),
    clearPath: () => pathfinding.clearPath(),
    pickNavMeshPoint: (callback) => {
      pathfindingPickCallback = callback;
    },
    clearPickCallback: () => {
      pathfindingPickCallback = null;
    },

    // Obstacles & Walls
    addObstacle: (pos, size) => pathfinding.addObstacle(new Vector3(pos.x, pos.y, pos.z), size),
    addWall: (from, to, height, thickness) =>
      pathfinding.addWall(
        new Vector3(from.x, from.y, from.z),
        new Vector3(to.x, to.y, to.z),
        height,
        thickness
      ),
    addWallWithDoor: (from, to, height, thickness, doorWidth, doorHeight) =>
      pathfinding.addWallWithDoor(
        new Vector3(from.x, from.y, from.z),
        new Vector3(to.x, to.y, to.z),
        height,
        thickness,
        doorWidth,
        doorHeight
      ),
    addDoorToWall: (wallId, doorWidth, doorHeight, hitPoint) => {
      const hp = hitPoint ? new Vector3(hitPoint.x, hitPoint.y, hitPoint.z) : undefined;
      return pathfinding.addDoorToWall(wallId, doorWidth, doorHeight, hp);
    },
    pickWall: (callback) => {
      for (const w of pathfinding.getWallMeshes()) {
        for (const m of w.meshes) m.isPickable = true;
      }
      wallPickCallback = callback;
    },
    pickObstacle: (callback) => {
      // Make all obstacle meshes pickable, reuse wallPickCallback with id-only
      for (const m of pathfinding.getAllObstacleMeshes()) m.isPickable = true;
      wallPickCallback = (id) => callback(id);
    },
    clearWallPick: () => {
      for (const m of pathfinding.getAllObstacleMeshes()) m.isPickable = false;
      wallPickCallback = null;
    },
    getWallEndpoints: () => pathfinding.getWallEndpoints(),
    removeObstacle: (id) => pathfinding.removeObstacle(id),
    getObstacles: () => pathfinding.getObstacles(),
    clearObstacles: () => pathfinding.clearObstacles(),

    dispose,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flattenSpatialNodes(
  nodes: PFSpatialNode[],
  type: string
): { id: string; name: string; elevation: number }[] {
  const result: { id: string; name: string; elevation: number }[] = [];

  function walk(node: PFSpatialNode) {
    if (node.type === type) {
      result.push({
        id: node.id,
        name: node.name,
        elevation: node.elevation ?? 0,
      });
    }
    for (const child of node.children) walk(child);
  }

  for (const root of nodes) walk(root);
  return result;
}
