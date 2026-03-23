import { useEffect, useRef } from "react";
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  NearFarScalar,
  DistanceDisplayCondition,
  defined,
  type Cartesian2,
} from "cesium";
import { useMapStore } from "../store/mapStore";
import { useFeatureStore } from "../store/featureStore";
import { useGeoJsonStore } from "../store/geoJsonStore";
import { calculatePolygonCenter } from "../utils/geojson";
import type { Feature } from "../types/feature";
import type { GeoJsonMarkersProps, GeoJsonFeature } from "../types/geojson";

const MARKER_LAYER_PREFIX = "geojson-markers-";

/**
 * GeoJSON 레이어의 각 Feature 중심점에 마커를 표시하는 컴포넌트
 *
 * @example
 * ```tsx
 * <MapViewer>
 *   <Imagery provider="osm" />
 *   <GeoJsonLayer data={geojson} layerName="buildings" />
 *   <GeoJsonMarkers
 *     layerName="buildings"
 *     style={{
 *       image: "/icons/marker.png",
 *       selectedImage: "/icons/marker-selected.png",
 *       width: 32,
 *       height: 32,
 *     }}
 *     onClick={(id, props) => console.log(id, props)}
 *   />
 * </MapViewer>
 * ```
 */
export function GeoJsonMarkers({ layerName, style, show = true, onClick }: GeoJsonMarkersProps) {
  const viewer = useMapStore((s) => s.viewer);
  const layer = useGeoJsonStore((s) => s.layers.get(layerName));
  const selectedFeatureId = useGeoJsonStore((s) => s.selectedFeatureId);

  const markerIdsRef = useRef<string[]>([]);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const featurePropsRef = useRef<Map<string, Record<string, unknown>>>(new Map());

  // ========================================================================
  // 1. Marker creation — when layer data becomes available
  // ========================================================================
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || !layer?.data) return;

    // 기존 마커 정리 (React Strict Mode 대응)
    if (markerIdsRef.current.length > 0) {
      useFeatureStore.getState().removeFeatures(markerIdsRef.current);
      markerIdsRef.current = [];
      featurePropsRef.current.clear();
    }

    const features = layer.data.features;
    const markerLayerName = `${MARKER_LAYER_PREFIX}${layerName}`;
    const ids: string[] = [];
    const propsMap = new Map<string, Record<string, unknown>>();

    const featuresToAdd = features
      .map((feature: GeoJsonFeature, index: number) => {
        const center = getFeatureCenter(feature);
        if (!center) return null;

        const markerId = `${MARKER_LAYER_PREFIX}${layerName}-${index}`;
        ids.push(markerId);
        propsMap.set(markerId, feature.properties);

        return {
          id: markerId,
          position: { longitude: center.longitude, latitude: center.latitude, height: 0 },
          properties: feature.properties,
          visual: {
            type: "billboard" as const,
            image: style.image,
            width: style.width,
            height: style.height,
            scale: style.scale,
            heightReference: style.heightReference,
            disableDepthTestDistance: style.disableDepthTestDistance,
            distanceDisplayCondition: style.distanceDisplayCondition,
          },
          // default DataSource에 추가 (removeFeatures 호환성)
          meta: {
            tags: [markerLayerName],
          },
        };
      })
      .filter(Boolean) as Feature[];

    // Batch add all markers
    const addedEntities = useFeatureStore.getState().addFeatures(featuresToAdd);

    // Apply scaleByDistance and distanceDisplayCondition on billboard entities AFTER creation
    if (style.scaleByDistance || style.distanceDisplayCondition) {
      for (const entity of addedEntities) {
        if (entity.billboard) {
          if (style.scaleByDistance) {
            const sbd = style.scaleByDistance;
            entity.billboard.scaleByDistance = new NearFarScalar(
              sbd.near,
              sbd.nearScale,
              sbd.far,
              sbd.farScale
            ) as unknown as import("cesium").Property;
          }

          if (style.distanceDisplayCondition) {
            const ddc = style.distanceDisplayCondition;
            entity.billboard.distanceDisplayCondition = new DistanceDisplayCondition(
              ddc.near ?? 0,
              ddc.far ?? Number.MAX_VALUE
            ) as unknown as import("cesium").Property;
          }

          if (style.disableDepthTestDistance !== undefined) {
            entity.billboard.disableDepthTestDistance =
              style.disableDepthTestDistance as unknown as import("cesium").Property;
          }
        }
      }
    }

    markerIdsRef.current = ids;
    featurePropsRef.current = propsMap;

    if (addedEntities.length > 0) {
      viewer.scene.requestRender();
    }

    return () => {
      const currentIds = markerIdsRef.current;
      if (currentIds.length > 0) {
        useFeatureStore.getState().removeFeatures(currentIds);
        markerIdsRef.current = [];
        featurePropsRef.current.clear();
      }
    };
  }, [viewer, layer?.data, layerName, style]);

  // ========================================================================
  // 2. Selection effect — swap image on selectedFeatureId change
  // ========================================================================
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    if (!style.selectedImage) return;

    const ids = markerIdsRef.current;
    if (ids.length === 0) return;

    const featureStore = useFeatureStore.getState();

    for (const markerId of ids) {
      const isSelected = selectedFeatureId === markerId;
      const image = isSelected ? style.selectedImage : style.image;

      featureStore.updateFeature(markerId, {
        visual: {
          type: "billboard",
          image,
          width: style.width,
          height: style.height,
          scale: style.scale,
          heightReference: style.heightReference,
        },
      });
    }
  }, [viewer, selectedFeatureId, style]);

  // ========================================================================
  // 3. Click handler — ScreenSpaceEventHandler
  // ========================================================================
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    const markerPrefix = `${MARKER_LAYER_PREFIX}${layerName}`;

    handler.setInputAction((event: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(event.position);

      if (defined(picked) && picked.id?.id && typeof picked.id.id === "string") {
        const entityId: string = picked.id.id;

        if (entityId.startsWith(markerPrefix)) {
          const geoJsonStore = useGeoJsonStore.getState();
          const properties = featurePropsRef.current.get(entityId) ?? {};

          // Toggle selection: deselect if clicking the same marker
          if (geoJsonStore.selectedFeatureId === entityId) {
            geoJsonStore.selectFeature(null);
          } else {
            geoJsonStore.selectFeature(entityId);
          }

          onClick?.(entityId, properties);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (handlerRef.current && !handlerRef.current.isDestroyed()) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
    };
  }, [viewer, layerName, onClick]);

  // ========================================================================
  // 4. Visibility effect — show/hide markers
  // ========================================================================
  useEffect(() => {
    const ids = markerIdsRef.current;
    if (ids.length === 0) return;

    useFeatureStore.getState().setVisibility(ids, show);
  }, [show]);

  return null;
}

// ============================================================================
// Helpers
// ============================================================================

function getFeatureCenter(feature: GeoJsonFeature): { longitude: number; latitude: number } | null {
  switch (feature.geometry.type) {
    case "Polygon":
      return calculatePolygonCenter(feature.geometry.coordinates);
    case "MultiPolygon": {
      const polygons = feature.geometry.coordinates;
      if (!polygons || polygons.length === 0) return null;

      // 꼭짓점 수가 가장 많은 폴리곤을 대표로 사용
      const mainPolygon = polygons.reduce((a, b) =>
        (a[0]?.length ?? 0) > (b[0]?.length ?? 0) ? a : b
      );

      return calculatePolygonCenter(mainPolygon);
    }
    default:
      return null;
  }
}
