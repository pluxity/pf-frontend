// ============================================================================
// Components
// ============================================================================
export { GLTFModel, FBXModel, CSS2DOverlay } from "./components/index.ts";
export type { GLTFModelProps, FBXModelProps } from "./components/index.ts";

// ============================================================================
// Loaders
// ============================================================================
export { useGLTFLoader, useFBXLoader } from "./loaders/index.ts";
export type {
  UseGLTFLoaderOptions,
  UseGLTFLoaderReturn,
  UseFBXLoaderOptions,
  UseFBXLoaderReturn,
} from "./loaders/index.ts";

// ============================================================================
// Stores
// ============================================================================
export { useModelStore, modelStore, useCameraStore, cameraStore } from "./store/index.ts";
export type {
  ModelState,
  ModelActions,
  ModelStore,
  CameraState,
  CameraActions,
  CameraStore,
} from "./store/index.ts";

// ============================================================================
// Hooks
// ============================================================================
export {
  useModelTraverse,
  useMeshTraverse,
  useRaycast,
  useMeshFinder,
  useMeshFinderAll,
} from "./hooks/index.ts";
export type { UseRaycastOptions, UseRaycastReturn, MeshPredicate } from "./hooks/index.ts";

// ============================================================================
// Utils (순수 함수)
// ============================================================================
export {
  // Traverse
  traverseModel,
  traverseMeshes,
  filterMeshes,
  findMeshByName,
  findMeshesByName,
  // Dispose
  disposeMesh,
  disposeScene,
  disposeMeshes,
  disposeMaterial,
  disposeGeometry,
  // Geometry
  getMeshInfo,
  computeBoundingBox,
  getCenterPoint,
  getSize,
  // Materials
  cloneMaterial,
  updateMaterialProps,
  setMaterialColor,
  setMaterialOpacity,
  getAllMaterials,
} from "./utils/index.ts";
export type { TraverseCallback, MeshCallback, MeshInfo } from "./utils/index.ts";

// ============================================================================
// Types
// ============================================================================
export type {
  ModelStatus,
  LoadedModel,
  CameraPosition,
  CameraConfig,
  LoaderState,
  LoaderProgress,
  LoaderOptions,
  OverlayPosition,
  CSS2DOverlayProps,
} from "./types/index.ts";
