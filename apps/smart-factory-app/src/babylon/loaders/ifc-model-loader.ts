import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Discipline, IFCMetadata, ElementMeta } from "../types";

export interface IFCModelResult {
  /** All loaded meshes across all disciplines */
  meshes: AbstractMesh[];
  /** Parsed metadata from the -meta.json file */
  metadata: IFCMetadata;
  /** Show or hide all meshes belonging to a discipline */
  setDisciplineVisible(discipline: Discipline, visible: boolean): void;
  /** Look up element metadata by IFC expressID */
  getElementByExpressID(expressID: number): ElementMeta | undefined;
  /**
   * Given a picked mesh, return the array of IFC expressIDs stored in
   * its glTF extras (set during the IFC → GLB conversion).
   */
  getMeshExpressIDs(mesh: AbstractMesh): number[];
  /** Dispose all loaded meshes */
  dispose(): void;
}

/**
 * Load IFC-converted GLB models + metadata JSON into a Babylon.js scene.
 *
 * Expects the IFC converter output in `basePath`:
 *   - `{basePath}-arc.glb`  (architectural)
 *   - `{basePath}-mep.glb`  (MEP)
 *   - `{basePath}-str.glb`  (structural)
 *   - `{basePath}-meta.json` (metadata)
 *
 * @param scene       The Babylon.js scene to load into
 * @param basePath    URL prefix, e.g. "/models/main-factory"
 * @param disciplines Which disciplines to load (defaults to all)
 */
export async function loadIFCModel(
  scene: Scene,
  basePath: string,
  disciplines: Discipline[] = ["arc", "mep", "str"]
): Promise<IFCModelResult> {
  // 1. Load metadata JSON
  const metaUrl = `${basePath}-meta.json`;
  const metaResponse = await fetch(metaUrl);
  if (!metaResponse.ok) {
    throw new Error(`Failed to load IFC metadata: ${metaUrl} (${metaResponse.status})`);
  }
  const metadata: IFCMetadata = await metaResponse.json();

  // 2. Load discipline GLBs in parallel
  const disciplineMeshes = new Map<Discipline, AbstractMesh[]>();
  const allMeshes: AbstractMesh[] = [];

  // Separate the base directory and filename prefix for SceneLoader
  const lastSlash = basePath.lastIndexOf("/");
  const rootUrl = basePath.substring(0, lastSlash + 1);
  const filePrefix = basePath.substring(lastSlash + 1);

  const loadPromises = disciplines.map(async (disc) => {
    const fileName = `${filePrefix}-${disc}.glb`;
    try {
      const result = await SceneLoader.ImportMeshAsync("", rootUrl, fileName, scene);
      const meshes = result.meshes;

      // Attach expressIDs from glTF extras to mesh metadata
      for (const mesh of meshes) {
        const extras = mesh.metadata?.gltf?.extras as { expressIDs?: number[] } | undefined;
        if (extras?.expressIDs) {
          mesh.metadata = {
            ...mesh.metadata,
            ifcExpressIDs: extras.expressIDs,
            ifcDiscipline: disc,
          };
        }
      }

      // Log expressID extraction stats
      const withIds = meshes.filter(
        (m) => ((m.metadata?.ifcExpressIDs as number[] | undefined) ?? []).length > 0
      ).length;
      console.log(`[IFC Loader] ${disc}: ${meshes.length} meshes, ${withIds} with expressIDs`);

      disciplineMeshes.set(disc, meshes);
      allMeshes.push(...meshes);
    } catch (err) {
      console.warn(`[IFC Loader] Failed to load ${disc} GLB (${fileName}):`, err);
      disciplineMeshes.set(disc, []);
    }
  });

  await Promise.all(loadPromises);

  // 3. Build lookup helpers

  function setDisciplineVisible(disc: Discipline, visible: boolean): void {
    const meshes = disciplineMeshes.get(disc);
    if (meshes) {
      for (const m of meshes) m.setEnabled(visible);
    }
  }

  function getElementByExpressID(expressID: number): ElementMeta | undefined {
    return metadata.elements[expressID];
  }

  function getMeshExpressIDs(mesh: AbstractMesh): number[] {
    const ids = mesh.metadata?.ifcExpressIDs as number[] | undefined;
    return ids ?? [];
  }

  function dispose(): void {
    for (const meshes of disciplineMeshes.values()) {
      for (const m of meshes) m.dispose();
    }
    disciplineMeshes.clear();
    allMeshes.length = 0;
  }

  return {
    meshes: allMeshes,
    metadata,
    setDisciplineVisible,
    getElementByExpressID,
    getMeshExpressIDs,
    dispose,
  };
}
