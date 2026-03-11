import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import type {
  ModelTier,
  PFModelMeta,
  UnifiedModelResult,
  UnifiedLoadOptions,
  ModelStats,
} from "../types";
import { detectModelTier } from "./tier-detector";
import { buildUnifiedIndex } from "./unified-index-builder";

/**
 * Load a GLB file (from File object or URL) + optional sidecar JSON
 * into a Babylon.js scene. Returns UnifiedModelResult with auto-detected tier.
 */
export async function loadUnifiedModel(
  scene: Scene,
  options: UnifiedLoadOptions
): Promise<UnifiedModelResult> {
  const { glbSource, metaSource } = options;

  // --- Load sidecar JSON (Tier 2) ---
  let metadata: PFModelMeta | null = null;
  if (metaSource) {
    metadata = await loadMetadata(metaSource);
  }

  // --- Load GLB ---
  let meshes: AbstractMesh[];
  let fileName: string;
  let fileSize = 0;

  if (glbSource instanceof File) {
    fileName = glbSource.name;
    fileSize = glbSource.size;
    meshes = await loadGLBFromFile(scene, glbSource);
  } else {
    fileName = glbSource.split("/").pop() ?? glbSource;
    meshes = await loadGLBFromURL(scene, glbSource);
  }

  // --- Collect node names from scene ---
  const nodeNames = collectNodeNames(scene, meshes);

  // --- Detect tier ---
  const tier = detectModelTier(nodeNames, metadata);

  // --- Create root transform node ---
  const root = new TransformNode("unified-root", scene);
  for (const mesh of meshes) {
    if (!mesh.parent) {
      mesh.parent = root;
    }
  }

  // --- Build index ---
  const index = buildUnifiedIndex(meshes, scene, metadata, tier);

  // --- Compute stats ---
  const stats = computeStats(meshes, tier, fileSize);

  console.group("[Unified Loader] Load Summary");
  console.log(`File: ${fileName}`);
  console.log(`Tier: ${tier}`);
  console.log(`Meshes: ${stats.meshCount}, Triangles: ${stats.triangleCount.toLocaleString()}`);
  console.log(`Materials: ${stats.materialCount}`);
  if (metadata) {
    console.log(`Metadata: ${Object.keys(metadata.elements).length} elements`);
    console.log(`Equipment: ${Object.keys(metadata.equipment).length}`);
    console.log(`Systems: ${Object.keys(metadata.systems).length}`);
  }
  console.groupEnd();

  return {
    tier,
    fileName,
    metadata,
    meshes,
    root,
    index,
    stats,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function loadGLBFromFile(scene: Scene, file: File): Promise<AbstractMesh[]> {
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: "model/gltf-binary" });
  const url = URL.createObjectURL(blob);

  try {
    const result = await SceneLoader.ImportMeshAsync("", url, "", scene, undefined, ".glb");
    return result.meshes;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadGLBFromURL(scene: Scene, url: string): Promise<AbstractMesh[]> {
  const lastSlash = url.lastIndexOf("/");
  const rootUrl = url.substring(0, lastSlash + 1);
  const fileName = url.substring(lastSlash + 1);

  const result = await SceneLoader.ImportMeshAsync("", rootUrl, fileName, scene);
  return result.meshes;
}

async function loadMetadata(source: File | string): Promise<PFModelMeta | null> {
  try {
    if (source instanceof File) {
      const text = await source.text();
      return JSON.parse(text) as PFModelMeta;
    } else {
      const response = await fetch(source);
      if (!response.ok) {
        console.warn(`[Unified Loader] Failed to load metadata: ${source}`);
        return null;
      }
      return (await response.json()) as PFModelMeta;
    }
  } catch (err) {
    console.warn("[Unified Loader] Failed to parse metadata:", err);
    return null;
  }
}

function collectNodeNames(scene: Scene, meshes: AbstractMesh[]): string[] {
  const names: string[] = [];
  for (const mesh of meshes) {
    if (mesh.name) names.push(mesh.name);
  }
  // Also check transform nodes
  for (const tn of scene.transformNodes) {
    if (tn.name) names.push(tn.name);
  }
  return names;
}

function computeStats(meshes: AbstractMesh[], tier: ModelTier, fileSize: number): ModelStats {
  let triangleCount = 0;
  let vertexCount = 0;
  const materials = new Set<string>();

  for (const mesh of meshes) {
    const indices = mesh.getTotalIndices();
    triangleCount += Math.floor(indices / 3);
    vertexCount += mesh.getTotalVertices();
    if (mesh.material) {
      materials.add(mesh.material.name);
    }
  }

  return {
    meshCount: meshes.length,
    triangleCount,
    vertexCount,
    materialCount: materials.size,
    tier,
    fileSize,
  };
}
