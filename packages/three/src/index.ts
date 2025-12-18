export {
  Canvas,
  SceneLighting,
  CameraControls,
  GLTFModel,
  FBXModel,
  CSS2DOverlay,
  MeshOutline,
  MeshInfo,
  MeshInfoCompact,
  FeatureRenderer,
} from "./components/index";
export type {
  CanvasProps,
  LightingPreset,
  SceneGridProps,
  SceneLightingProps,
  DirectionalLightConfig,
  CameraControlsProps,
  GLTFModelProps,
  FBXModelProps,
  MeshInfoProps,
} from "./components/index";

export {
  useFacilityStore,
  facilityStore,
  useCameraStore,
  cameraStore,
  useInteractionStore,
  interactionStore,
  useAssetStore,
  assetStore,
  useFeatureStore,
  featureStore,
} from "./store/index";
export type {
  FacilityState,
  FacilityActions,
  FacilityStore,
  CameraState,
  CameraActions,
  CameraStore,
  InteractionState,
  InteractionActions,
  AssetState,
  AssetActions,
  AssetStore,
  FeatureState,
  FeatureActions,
  FeatureStore,
} from "./store/index";

export {
  useModelTraverse,
  useMeshTraverse,
  useRaycast,
  useMeshFinder,
  useMeshFinderAll,
  useMeshHover,
  useAssetLoader,
} from "./hooks/index";
export type { UseRaycastOptions, UseRaycastReturn, MeshPredicate } from "./hooks/index";

export {
  traverseModel,
  traverseMeshes,
  filterMeshes,
  findMeshByName,
  findMeshesByName,
  disposeMesh,
  disposeScene,
  disposeMeshes,
  disposeMaterial,
  disposeGeometry,
  getMeshInfo,
  computeBoundingBox,
  getCenterPoint,
  getSize,
  cloneMaterial,
  updateMaterialProps,
  setMaterialColor,
  setMaterialOpacity,
  getAllMaterials,
} from "./utils/index";
export type { TraverseCallback, MeshCallback, MeshInfoData } from "./utils/index";

export type {
  FacilityStatus,
  Facility,
  CameraPosition,
  CameraConfig,
  LoaderState,
  LoaderProgress,
  LoaderOptions,
  OverlayPosition,
  CSS2DOverlayProps,
  HoveredMesh,
  RaycastOptions,
  AssetType,
  Asset,
  Feature,
} from "./types/index";
