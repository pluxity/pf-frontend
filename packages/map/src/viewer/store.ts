import { create } from "zustand";
import type { ViewerStore } from "../types.ts";

export const useViewerStore = create<ViewerStore>((set, get) => ({
  viewer: null,
  markers: new Map(),
  clusters: new Map(),

  setViewer: (viewer) => {
    set({ viewer });
  },

  addMarker: (id, entity) => {
    const markers = new Map(get().markers);
    markers.set(id, entity);
    set({ markers });
  },

  removeMarker: (id) => {
    const { viewer, markers } = get();
    const marker = markers.get(id);

    if (marker && viewer) {
      viewer.entities.remove(marker);
    }

    const newMarkers = new Map(markers);
    newMarkers.delete(id);
    set({ markers: newMarkers });
  },

  getMarker: (id) => {
    return get().markers.get(id);
  },

  addCluster: (id, dataSource) => {
    const clusters = new Map(get().clusters);
    clusters.set(id, dataSource);
    set({ clusters });
  },

  removeCluster: (id) => {
    const { viewer, clusters } = get();
    const cluster = clusters.get(id);

    if (cluster && viewer) {
      viewer.dataSources.remove(cluster);
    }

    const newClusters = new Map(clusters);
    newClusters.delete(id);
    set({ clusters: newClusters });
  },

  getCluster: (id) => {
    return get().clusters.get(id);
  },

  clear: () => {
    const { viewer, markers, clusters } = get();

    if (viewer) {
      // Remove all markers
      markers.forEach((marker) => {
        viewer.entities.remove(marker);
      });

      // Remove all clusters
      clusters.forEach((cluster) => {
        viewer.dataSources.remove(cluster);
      });
    }

    set({ markers: new Map(), clusters: new Map() });
  },
}));
