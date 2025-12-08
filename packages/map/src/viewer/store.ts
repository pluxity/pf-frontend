import { create } from "zustand";
import { ScreenSpaceEventHandler, ScreenSpaceEventType, defined, Cartesian2 } from "cesium";
import type { ViewerStore } from "../types.ts";

export const useViewerStore = create<ViewerStore>((set, get) => ({
  viewer: null,
  markers: new Map(),
  clusters: new Map(),
  eventHandler: null,
  markerClickHandlers: new Map(),

  setViewer: (viewer) => {
    const currentHandler = get().eventHandler;
    if (currentHandler && !currentHandler.isDestroyed()) {
      currentHandler.destroy();
    }

    let newHandler: ScreenSpaceEventHandler | null = null;
    if (viewer) {
      newHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      newHandler.setInputAction((movement: { position: Cartesian2 }) => {
        const pickedObject = viewer.scene.pick(movement.position);
        if (defined(pickedObject) && defined(pickedObject.id)) {
          const entityId = pickedObject.id.id as string;
          const handler = get().markerClickHandlers.get(entityId);
          if (handler) {
            handler(pickedObject.id);
          }
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
    }

    set({ viewer, eventHandler: newHandler });
  },

  addMarker: (id, entity) => {
    const markers = new Map(get().markers);
    markers.set(id, entity);
    set({ markers });
  },

  removeMarker: (id) => {
    const { viewer, markers, markerClickHandlers } = get();
    const marker = markers.get(id);

    if (marker && viewer) {
      viewer.entities.remove(marker);
    }

    const newMarkers = new Map(markers);
    newMarkers.delete(id);

    const newHandlers = new Map(markerClickHandlers);
    newHandlers.delete(id);

    set({ markers: newMarkers, markerClickHandlers: newHandlers });
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

  setMarkerClickHandler: (id, handler) => {
    const handlers = new Map(get().markerClickHandlers);
    handlers.set(id, handler);
    set({ markerClickHandlers: handlers });
  },

  removeMarkerClickHandler: (id) => {
    const handlers = new Map(get().markerClickHandlers);
    handlers.delete(id);
    set({ markerClickHandlers: handlers });
  },

  clear: () => {
    const { viewer, markers, clusters, eventHandler } = get();

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

    if (eventHandler && !eventHandler.isDestroyed()) {
      eventHandler.destroy();
    }

    set({
      markers: new Map(),
      clusters: new Map(),
      markerClickHandlers: new Map(),
      eventHandler: null,
    });
  },
}));
