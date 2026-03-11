import type { IFCIndices, StoreyInfo } from "../types";

/**
 * Storey-level visibility filtering for IFC models.
 * Allows toggling individual storeys or isolating a single one.
 */
export function createStoreyFilterManager(indices: IFCIndices) {
  const visibility = new Map<number, boolean>();
  let isolatedStoreyId: number | null = null;

  // Initialize all storeys as visible
  for (const storey of indices.storeys) {
    visibility.set(storey.expressID, true);
  }

  function setStoreyVisible(storeyId: number, visible: boolean): void {
    visibility.set(storeyId, visible);
    isolatedStoreyId = null;

    const meshes = indices.storeyMeshes.get(storeyId);
    if (meshes) {
      for (const mesh of meshes) {
        mesh.setEnabled(visible);
      }
    }
  }

  function isolateStorey(storeyId: number): void {
    isolatedStoreyId = storeyId;

    for (const [sid, meshes] of indices.storeyMeshes) {
      const show = sid === storeyId;
      visibility.set(sid, show);
      for (const mesh of meshes) {
        mesh.setEnabled(show);
      }
    }
  }

  function showAllStoreys(): void {
    isolatedStoreyId = null;

    for (const [sid, meshes] of indices.storeyMeshes) {
      visibility.set(sid, true);
      for (const mesh of meshes) {
        mesh.setEnabled(true);
      }
    }
  }

  function isVisible(storeyId: number): boolean {
    return visibility.get(storeyId) ?? true;
  }

  function getIsolatedStoreyId(): number | null {
    return isolatedStoreyId;
  }

  function getStoreys(): StoreyInfo[] {
    return indices.storeys;
  }

  function dispose(): void {
    showAllStoreys();
    visibility.clear();
  }

  return {
    setStoreyVisible,
    isolateStorey,
    showAllStoreys,
    isVisible,
    getIsolatedStoreyId,
    getStoreys,
    dispose,
  };
}
