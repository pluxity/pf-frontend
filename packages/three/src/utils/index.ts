// Traverse
export {
  traverseModel,
  traverseMeshes,
  filterMeshes,
  findMeshByName,
  findMeshesByName,
} from "./traverse";

// Dispose
export {
  disposeMesh,
  disposeScene,
  disposeMeshes,
  disposeMaterial,
  disposeGeometry,
} from "./dispose";

// Geometry
export { getMeshInfo, computeBoundingBox, getCenterPoint, getSize } from "./geometry";

// Materials
export {
  cloneMaterial,
  updateMaterialProps,
  setMaterialColor,
  setMaterialOpacity,
  getAllMaterials,
  findMatchingPreset,
  applyMaterialPresets,
} from "./materials";

// Types
export type { TraverseCallback, MeshCallback, MeshPredicate, MeshInfoData } from "./types";
