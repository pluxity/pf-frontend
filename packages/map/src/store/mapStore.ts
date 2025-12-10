import { create } from "zustand";
import type { Viewer } from "cesium";

// ============================================================================
// State & Actions
// ============================================================================

interface MapState {
  viewer: Viewer | null;
}

interface MapActions {
  setViewer: (viewer: Viewer | null) => void;
  getViewer: () => Viewer | null;
}

// ============================================================================
// Store
// ============================================================================

// cameraStore 순환 참조 방지를 위해 lazy import
let cameraStoreModule: typeof import("./cameraStore.ts") | null = null;
async function getCameraStore() {
  if (!cameraStoreModule) {
    cameraStoreModule = await import("./cameraStore.ts");
  }
  return cameraStoreModule.useCameraStore;
}

export const useMapStore = create<MapState & MapActions>((set, get) => {
  // 카메라 위치 업데이트 핸들러 (cameraStore에 위임)
  let cameraUpdateHandler: (() => void) | null = null;

  return {
    // State
    viewer: null,

    // Actions
    setViewer: (viewer) => {
      const prevViewer = get().viewer;

      // 이전 Viewer 이벤트 리스너 제거
      if (prevViewer && !prevViewer.isDestroyed() && cameraUpdateHandler) {
        prevViewer.camera.changed.removeEventListener(cameraUpdateHandler);
      }

      // 새 Viewer 이벤트 리스너 등록
      if (viewer && !viewer.isDestroyed()) {
        getCameraStore().then((useCameraStore) => {
          const cameraStore = useCameraStore.getState();
          cameraUpdateHandler = cameraStore._updateCameraPosition;
          viewer.camera.changed.addEventListener(cameraUpdateHandler);
          viewer.camera.percentageChanged = 0.01;
        });
      }

      // 카메라 위치 초기화
      getCameraStore().then((useCameraStore) => {
        useCameraStore.getState()._resetCameraPosition();
      });

      set({ viewer });
    },

    getViewer: () => get().viewer,
  };
});

// 컴포넌트 외부에서 사용할 때 편의를 위한 alias
export const mapStore = useMapStore;
