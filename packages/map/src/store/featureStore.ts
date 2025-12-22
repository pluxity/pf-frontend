import { create } from "zustand";
import {
  Cartesian3,
  Cartographic,
  ConstantPositionProperty,
  ConstantProperty,
  DistanceDisplayCondition,
  JulianDate,
  BillboardGraphics,
  ModelGraphics,
  PointGraphics,
  PolygonGraphics,
  PolygonHierarchy,
  ImageMaterialProperty,
  Math as CesiumMath,
  type Entity,
} from "cesium";
import { useMapStore } from "./mapStore.ts";
import type {
  FeatureStoreState,
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
        heightReference: visual.heightReference,
        color: visual.color,
        silhouetteColor: visual.silhouetteColor,
        silhouetteSize: visual.silhouetteSize,
        distanceDisplayCondition,
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
    case "rectangle": {
      // 중심점에서 width/height만큼 떨어진 4개 코너 계산
      const position = entity.position?.getValue(JulianDate.now());
      if (!position) break;

      // Cartesian3를 Cartographic으로 변환
      const cartographic = Cartographic.fromCartesian(position);
      const lon = CesiumMath.toDegrees(cartographic.longitude);
      const lat = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      const width = visual.width ?? 50; // meters
      const rectHeight = visual.height ?? 50; // meters

      // 4개 코너 좌표 계산 (중심점 기준으로 동/서/남/북으로 offset)
      // 1도 = 약 111km (위도), 경도는 위도에 따라 다름
      const halfWidthDeg = width / 2 / (111320 * Math.cos(CesiumMath.toRadians(lat)));
      const halfHeightDeg = rectHeight / 2 / 110540;

      const corners = [
        Cartesian3.fromDegrees(lon - halfWidthDeg, lat - halfHeightDeg, height),
        Cartesian3.fromDegrees(lon + halfWidthDeg, lat - halfHeightDeg, height),
        Cartesian3.fromDegrees(lon + halfWidthDeg, lat + halfHeightDeg, height),
        Cartesian3.fromDegrees(lon - halfWidthDeg, lat + halfHeightDeg, height),
      ];

      entity.polygon = new PolygonGraphics({
        hierarchy: new PolygonHierarchy(corners),
        material: visual.image
          ? new ImageMaterialProperty({ image: visual.image })
          : visual.material,
        fill: visual.fill ?? true,
        outline: visual.outline ?? false,
        outlineColor: visual.outlineColor,
        outlineWidth: visual.outlineWidth ?? 1,
        stRotation: visual.stRotation,
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

export const useFeatureStore = create<FeatureStoreState & FeatureActions>((set, get) => ({
  entities: new Map(),
  meta: new Map(),
  featureStates: new Map(),

  addFeature: (id, options) => {
    const mapState = useMapStore.getState();
    const { viewer, dataSource, getOrCreateLayerDataSource } = mapState;
    if (!viewer || viewer.isDestroyed()) return null;

    if (get().entities.has(id)) {
      console.warn(`Feature already exists: ${id}`);
      return null;
    }

    const cartesian = coordinateToCartesian3(options.position);
    const meta = options.meta;

    let targetDataSource = dataSource;
    if (meta?.layerName) {
      const layerDS = getOrCreateLayerDataSource(meta.layerName);
      if (layerDS) {
        targetDataSource = layerDS;
      }
    }

    if (!targetDataSource) return null;

    const entity = targetDataSource.entities.add({
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
    const { viewer, dataSource } = useMapStore.getState();
    const entity = get().entities.get(id);

    if (!entity) return false;

    if (viewer && !viewer.isDestroyed() && dataSource) {
      dataSource.entities.remove(entity);
      viewer.scene.requestRender();
    }

    set((state) => {
      const newEntities = new Map(state.entities);
      const newMeta = new Map(state.meta);
      const newFeatureStates = new Map(state.featureStates);
      newEntities.delete(id);
      newMeta.delete(id);
      newFeatureStates.delete(id);
      return { entities: newEntities, meta: newMeta, featureStates: newFeatureStates };
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

    if (patch.orientation !== undefined) {
      entity.orientation = new ConstantProperty(patch.orientation);
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

  addFeatures: (features: Feature[]) => {
    const mapState = useMapStore.getState();
    const { viewer, dataSource, getOrCreateLayerDataSource } = mapState;
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

      let targetDataSource = dataSource;
      if (meta?.layerName) {
        const layerDS = getOrCreateLayerDataSource(meta.layerName);
        if (layerDS) {
          targetDataSource = layerDS;
        }
      }

      if (!targetDataSource) continue;

      const entity = targetDataSource.entities.add({
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
    const { viewer, dataSource } = useMapStore.getState();
    const toRemove: string[] = [];
    const { entities, meta } = get();

    entities.forEach((entity, id) => {
      if (matchSelector(selector, id, entity, meta.get(id))) {
        toRemove.push(id);
        if (viewer && !viewer.isDestroyed() && dataSource) {
          dataSource.entities.remove(entity);
        }
      }
    });

    if (toRemove.length > 0) {
      set((state) => {
        const newEntities = new Map(state.entities);
        const newMeta = new Map(state.meta);
        const newFeatureStates = new Map(state.featureStates);
        toRemove.forEach((id) => {
          newEntities.delete(id);
          newMeta.delete(id);
          newFeatureStates.delete(id);
        });
        return { entities: newEntities, meta: newMeta, featureStates: newFeatureStates };
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
    const { viewer, dataSource } = useMapStore.getState();

    if (viewer && !viewer.isDestroyed() && dataSource) {
      get().entities.forEach((entity) => {
        dataSource.entities.remove(entity);
      });
      viewer.scene.requestRender();
    }

    set({ entities: new Map(), meta: new Map(), featureStates: new Map() });
  },

  setFeatureState: (id, state) => {
    set((prevState) => {
      const newFeatureStates = new Map(prevState.featureStates);
      newFeatureStates.set(id, state);
      return { featureStates: newFeatureStates };
    });
  },

  getFeatureState: (id) => {
    return get().featureStates.get(id);
  },

  clearFeatureState: (id) => {
    set((prevState) => {
      const newFeatureStates = new Map(prevState.featureStates);
      newFeatureStates.delete(id);
      return { featureStates: newFeatureStates };
    });
  },
}));

export const featureStore = useFeatureStore;
