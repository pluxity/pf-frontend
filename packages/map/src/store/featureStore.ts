import { create } from "zustand";
import {
  Cartesian3,
  ConstantPositionProperty,
  DistanceDisplayCondition,
  JulianDate,
  BillboardGraphics,
  ModelGraphics,
  PointGraphics,
  type Entity,
} from "cesium";
import { useMapStore } from "./mapStore.ts";
import type {
  FeatureState,
  FeatureActions,
  PropertyFilter,
  FeatureSelector,
  Coordinate,
  Feature,
  FeatureVisual,
  FeatureMeta,
  DisplayConditionRange,
} from "../types/feature.ts";

// ============================================================================
// Helpers
// ============================================================================

function coordinateToCartesian3(coord: Coordinate): Cartesian3 {
  return Cartesian3.fromDegrees(coord.longitude, coord.latitude, coord.height ?? 0);
}

function matchesPropertyFilter(
  properties: Record<string, unknown>,
  filter: PropertyFilter
): boolean {
  if (typeof filter === "function") {
    return filter(properties);
  }
  return Object.entries(filter).every(([key, value]) => properties[key] === value);
}

function toDistanceDisplayCondition(range?: DisplayConditionRange) {
  if (!range) return undefined;
  const near = range.near ?? 0;
  const far = range.far ?? Number.MAX_VALUE;
  return new DistanceDisplayCondition(near, far);
}

function matchSelector(
  selector: FeatureSelector,
  id: string,
  entity: Entity,
  meta: FeatureMeta | undefined
) {
  if (Array.isArray(selector)) return selector.includes(id);
  return selector(entity, meta);
}

function applyVisual(entity: Entity, visual?: FeatureVisual) {
  if (!visual) return;

  const distanceDisplayCondition = toDistanceDisplayCondition(visual.distanceDisplayCondition);

  switch (visual.type) {
    case "billboard": {
      entity.billboard = new BillboardGraphics({
        image: visual.image,
        color: visual.color,
        width: visual.width,
        height: visual.height,
        scale: visual.scale,
        heightReference: visual.heightReference,
        verticalOrigin: visual.verticalOrigin,
        disableDepthTestDistance: visual.disableDepthTestDistance,
        distanceDisplayCondition,
        show: visual.show,
      });
      break;
    }
    case "model": {
      entity.model = new ModelGraphics({
        uri: visual.uri,
        scale: visual.scale,
        minimumPixelSize: visual.minimumPixelSize,
        color: visual.color,
        silhouetteColor: visual.silhouetteColor,
        silhouetteSize: visual.silhouetteSize,
        show: visual.show,
      });
      break;
    }
    case "point": {
      entity.point = new PointGraphics({
        pixelSize: visual.pixelSize,
        color: visual.color,
        outlineColor: visual.outlineColor,
        outlineWidth: visual.outlineWidth,
        heightReference: visual.heightReference,
        disableDepthTestDistance: visual.disableDepthTestDistance,
        distanceDisplayCondition,
        show: visual.show,
      });
      break;
    }
    default:
      break;
  }
}

function resolveVisibility(meta?: FeatureMeta, visual?: FeatureVisual) {
  if (typeof meta?.visible === "boolean") return meta.visible;
  if (typeof visual?.show === "boolean") return visual.show;
  return true;
}

// ============================================================================
// Store
// ============================================================================

export const useFeatureStore = create<FeatureState & FeatureActions>((set, get) => ({
  // State
  entities: new Map(),
  meta: new Map(),

  // ========== 단일 Feature ==========

  addFeature: (id, options) => {
    const viewer = useMapStore.getState().viewer;
    if (!viewer || viewer.isDestroyed()) return null;

    if (get().entities.has(id)) {
      console.warn(`Feature already exists: ${id}`);
      return null;
    }

    const cartesian = coordinateToCartesian3(options.position);

    const meta = options.meta;

    const entity = viewer.entities.add({
      id,
      position: cartesian,
      properties: options.properties as unknown as Entity["properties"],
    });

    const resolvedShow = resolveVisibility(meta, options.visual);
    entity.show = resolvedShow;
    applyVisual(entity, options.visual);

    set((state) => {
      const newEntities = new Map(state.entities);
      const newMeta = new Map(state.meta);
      newEntities.set(id, entity);
      newMeta.set(id, { ...(meta ?? {}), visible: resolvedShow });
      return { entities: newEntities, meta: newMeta };
    });

    viewer.scene.requestRender();
    return entity;
  },

  getFeature: (id) => {
    return get().entities.get(id) ?? null;
  },

  removeFeature: (id) => {
    const viewer = useMapStore.getState().viewer;
    const entity = get().entities.get(id);

    if (!entity) return false;

    if (viewer && !viewer.isDestroyed()) {
      viewer.entities.remove(entity);
      viewer.scene.requestRender();
    }

    set((state) => {
      const newEntities = new Map(state.entities);
      const newMeta = new Map(state.meta);
      newEntities.delete(id);
      newMeta.delete(id);
      return { entities: newEntities, meta: newMeta };
    });

    return true;
  },

  hasFeature: (id) => {
    return get().entities.has(id);
  },

  updatePosition: (id, position) => {
    const viewer = useMapStore.getState().viewer;
    const entity = get().getFeature(id);

    if (!entity || !viewer || viewer.isDestroyed()) return false;

    const cartesian = coordinateToCartesian3(position);
    entity.position = new ConstantPositionProperty(cartesian);
    viewer.scene.requestRender();
    return true;
  },

  updateFeature: (id, patch) => {
    const viewer = useMapStore.getState().viewer;
    const entity = get().getFeature(id);
    if (!entity || !viewer || viewer.isDestroyed()) return false;

    if (patch.position) {
      const cartesian = coordinateToCartesian3(patch.position);
      entity.position = new ConstantPositionProperty(cartesian);
    }

    if (patch.properties) {
      // Cesium PropertyBag accepts runtime object; cast for typing convenience
      entity.properties = patch.properties as unknown as Entity["properties"];
    }

    if (patch.visual) {
      applyVisual(entity, patch.visual);
    }

    const previousMeta = get().meta.get(id) ?? {};
    const nextMeta: FeatureMeta = { ...previousMeta, ...(patch.meta ?? {}) };
    const show = resolveVisibility(nextMeta, patch.visual);
    entity.show = show;
    nextMeta.visible = show;

    set((state) => {
      const newMeta = new Map(state.meta);
      newMeta.set(id, nextMeta);
      return { meta: newMeta };
    });

    viewer.scene.requestRender();
    return true;
  },

  // ========== 복수 Features ==========

  addFeatures: (features: Feature[]) => {
    const viewer = useMapStore.getState().viewer;
    if (!viewer || viewer.isDestroyed()) return [];

    const added: Entity[] = [];
    const newEntities = new Map(get().entities);
    const newMeta = new Map(get().meta);

    for (const feature of features) {
      if (newEntities.has(feature.id)) {
        console.warn(`Feature already exists: ${feature.id}`);
        continue;
      }

      const cartesian = coordinateToCartesian3(feature.position);
      const meta = feature.meta;

      const entity = viewer.entities.add({
        id: feature.id,
        position: cartesian,
        properties: feature.properties as unknown as Entity["properties"],
      });

      const resolvedShow = resolveVisibility(meta, feature.visual);
      entity.show = resolvedShow;
      applyVisual(entity, feature.visual);

      newEntities.set(feature.id, entity);
      newMeta.set(feature.id, { ...(meta ?? {}), visible: resolvedShow });
      added.push(entity);
    }

    if (added.length > 0) {
      set({ entities: newEntities, meta: newMeta });
      viewer.scene.requestRender();
    }

    return added;
  },

  getFeatures: (selector: FeatureSelector) => {
    const results: Entity[] = [];
    const { entities, meta } = get();

    entities.forEach((entity, id) => {
      if (matchSelector(selector, id, entity, meta.get(id))) {
        results.push(entity);
      }
    });

    return results;
  },

  removeFeatures: (selector: FeatureSelector) => {
    const viewer = useMapStore.getState().viewer;
    const toRemove: string[] = [];
    const { entities, meta } = get();

    entities.forEach((entity, id) => {
      if (matchSelector(selector, id, entity, meta.get(id))) {
        toRemove.push(id);
        if (viewer && !viewer.isDestroyed()) {
          viewer.entities.remove(entity);
        }
      }
    });

    if (toRemove.length > 0) {
      set((state) => {
        const newEntities = new Map(state.entities);
        const newMeta = new Map(state.meta);
        toRemove.forEach((id) => newEntities.delete(id));
        toRemove.forEach((id) => newMeta.delete(id));
        return { entities: newEntities, meta: newMeta };
      });

      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.requestRender();
      }
    }

    return toRemove.length;
  },

  setVisibility: (selector, visible) => {
    const viewer = useMapStore.getState().viewer;
    if (!viewer || viewer.isDestroyed()) return 0;

    const targetIds: string[] = [];
    const { entities, meta } = get();

    entities.forEach((entity, id) => {
      if (matchSelector(selector, id, entity, meta.get(id))) {
        targetIds.push(id);
      }
    });

    if (targetIds.length === 0) return 0;

    set((state) => {
      const newMeta = new Map(state.meta);

      targetIds.forEach((id) => {
        const entity = state.entities.get(id);
        if (!entity) return;
        entity.show = visible;
        const previousMeta = newMeta.get(id) ?? {};
        newMeta.set(id, { ...previousMeta, visible });
      });

      return { meta: newMeta };
    });

    viewer.scene.requestRender();
    return targetIds.length;
  },

  // ========== Query ==========

  findByProperty: (filter) => {
    const results: Entity[] = [];

    get().entities.forEach((entity) => {
      const props = entity.properties?.getValue(JulianDate.now()) ?? {};
      if (matchesPropertyFilter(props, filter)) {
        results.push(entity);
      }
    });

    return results;
  },

  // ========== Bulk ==========

  getFeatureCount: () => {
    return get().entities.size;
  },

  getAllFeatures: () => {
    return Array.from(get().entities.values());
  },

  clearAll: () => {
    const viewer = useMapStore.getState().viewer;

    if (viewer && !viewer.isDestroyed()) {
      get().entities.forEach((entity) => {
        viewer.entities.remove(entity);
      });
      viewer.scene.requestRender();
    }

    set({ entities: new Map(), meta: new Map() });
  },
}));

export const featureStore = useFeatureStore;
