import { create } from "zustand";
import type { GeoJsonDataSource } from "cesium";
import type { GeoJsonFeatureCollection, GeoJsonLayerStyle } from "../types/geojson";

// ============================================================================
// Types
// ============================================================================

export interface GeoJsonLayerEntry {
  name: string;
  dataSource: GeoJsonDataSource;
  data?: GeoJsonFeatureCollection;
  style: GeoJsonLayerStyle;
  show: boolean;
}

interface GeoJsonStoreState {
  layers: Map<string, GeoJsonLayerEntry>;
  selectedFeatureId: string | null;
}

interface GeoJsonStoreActions {
  addLayer: (name: string, layer: Omit<GeoJsonLayerEntry, "name">) => void;
  removeLayer: (name: string) => boolean;
  getLayer: (name: string) => GeoJsonLayerEntry | null;
  updateLayerStyle: (name: string, style: Partial<GeoJsonLayerStyle>) => void;
  setLayerVisibility: (name: string, show: boolean) => void;
  selectFeature: (featureId: string | null) => void;
  getSelectedFeatureId: () => string | null;
  clearAll: () => void;
  getLayerNames: () => string[];
}

// ============================================================================
// Store
// ============================================================================

export const useGeoJsonStore = create<GeoJsonStoreState & GeoJsonStoreActions>((set, get) => ({
  layers: new Map(),
  selectedFeatureId: null,

  addLayer: (name, layer) => {
    set((state) => {
      const newLayers = new Map(state.layers);
      newLayers.set(name, { ...layer, name });
      return { layers: newLayers };
    });
  },

  removeLayer: (name) => {
    const exists = get().layers.has(name);
    if (!exists) return false;

    set((state) => {
      const newLayers = new Map(state.layers);
      newLayers.delete(name);
      return { layers: newLayers };
    });
    return true;
  },

  getLayer: (name) => {
    return get().layers.get(name) ?? null;
  },

  updateLayerStyle: (name, style) => {
    set((state) => {
      const layer = state.layers.get(name);
      if (!layer) return state;

      const newLayers = new Map(state.layers);
      newLayers.set(name, { ...layer, style: { ...layer.style, ...style } });
      return { layers: newLayers };
    });
  },

  setLayerVisibility: (name, show) => {
    set((state) => {
      const layer = state.layers.get(name);
      if (!layer) return state;

      const newLayers = new Map(state.layers);
      newLayers.set(name, { ...layer, show });
      return { layers: newLayers };
    });
  },

  selectFeature: (featureId) => {
    set({ selectedFeatureId: featureId });
  },

  getSelectedFeatureId: () => {
    return get().selectedFeatureId;
  },

  clearAll: () => {
    set({ layers: new Map(), selectedFeatureId: null });
  },

  getLayerNames: () => {
    return Array.from(get().layers.keys());
  },
}));

export const geoJsonStore = useGeoJsonStore;
