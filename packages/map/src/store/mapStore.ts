import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { CustomDataSource, type Viewer } from "cesium";

// ============================================================================
// State & Actions
// ============================================================================

interface MapState {
  viewer: Viewer | null;
  dataSource: CustomDataSource | null; // 기본 DataSource (하위 호환)
  layerDataSources: Map<string, CustomDataSource>; // 레이어별 DataSource
}

interface MapActions {
  setViewer: (viewer: Viewer | null) => void;
  getViewer: () => Viewer | null;
  getLayerDataSource: (layerName: string) => CustomDataSource | null;
  getOrCreateLayerDataSource: (layerName: string) => CustomDataSource | null;
}

// ============================================================================
// Store
// ============================================================================

export const useMapStore = create<MapState & MapActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    viewer: null,
    dataSource: null,
    layerDataSources: new Map(),

    // Actions
    setViewer: (viewer) => {
      const prevViewer = get().viewer;
      const prevDataSource = get().dataSource;
      const prevLayerDataSources = get().layerDataSources;

      // 이전 DataSource들 제거
      if (prevViewer && !prevViewer.isDestroyed()) {
        if (prevDataSource) {
          prevViewer.dataSources.remove(prevDataSource);
        }
        prevLayerDataSources.forEach((ds) => {
          prevViewer.dataSources.remove(ds);
        });
      }

      let dataSource: CustomDataSource | null = null;
      const layerDataSources = new Map<string, CustomDataSource>();

      // 새 Viewer 설정
      if (viewer && !viewer.isDestroyed()) {
        // 기본 CustomDataSource 생성 (하위 호환)
        dataSource = new CustomDataSource("pf-dev-map");
        viewer.dataSources.add(dataSource);
      }

      set({ viewer, dataSource, layerDataSources });
    },

    getViewer: () => get().viewer,

    getLayerDataSource: (layerName: string) => {
      return get().layerDataSources.get(layerName) ?? null;
    },

    getOrCreateLayerDataSource: (layerName: string) => {
      const viewer = get().viewer;
      if (!viewer || viewer.isDestroyed()) return null;

      const existing = get().layerDataSources.get(layerName);
      if (existing) {
        console.log(`MapStore: Found existing DataSource for layer "${layerName}"`);
        return existing;
      }

      // 새 DataSource 생성
      console.log(`MapStore: Creating new DataSource for layer "${layerName}"`);
      const newDataSource = new CustomDataSource(`pf-dev-map-layer-${layerName}`);
      viewer.dataSources.add(newDataSource);

      set((state) => {
        const newMap = new Map(state.layerDataSources);
        newMap.set(layerName, newDataSource);
        console.log(
          `MapStore: Updated layerDataSources Map, now has ${newMap.size} layers:`,
          Array.from(newMap.keys())
        );
        return { layerDataSources: newMap };
      });

      return newDataSource;
    },
  }))
);

// 컴포넌트 외부에서 사용할 때 편의를 위한 alias
export const mapStore = useMapStore;
