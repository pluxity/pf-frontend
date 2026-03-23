import { useEffect, useRef } from "react";
import {
  GeoJsonDataSource,
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  DistanceDisplayCondition,
} from "cesium";
import { useMapStore } from "../store/mapStore";
import { useGeoJsonStore } from "../store/geoJsonStore";
import type {
  GeoJsonLayerProps,
  GeoJsonLayerStyle,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
} from "../types/geojson";

export type { GeoJsonLayerProps, GeoJsonLayerStyle };

function applyGeoJsonStyle(
  ds: GeoJsonDataSource,
  style: GeoJsonLayerStyle,
  data: GeoJsonFeatureCollection | string,
  styleResolver?: (feature: GeoJsonFeature, index: number) => Partial<GeoJsonLayerStyle>
) {
  const entities = ds.entities.values;
  const features = typeof data !== "string" ? data.features : undefined;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (!entity?.polygon) continue;

    const feature = features?.[i];
    const resolved = styleResolver && feature ? styleResolver(feature, i) : {};
    const merged: GeoJsonLayerStyle = { ...style, ...resolved };

    // Fill
    if (merged.fill !== undefined) {
      entity.polygon.fill = new ConstantProperty(merged.fill);
    }

    if (merged.fillColor) {
      const opacity = merged.fillOpacity ?? 1;
      const color = Color.fromAlpha(merged.fillColor, opacity);
      entity.polygon.material = new ColorMaterialProperty(color);
    }

    // Outline
    if (merged.outline !== undefined) {
      entity.polygon.outline = new ConstantProperty(merged.outline);
    }

    if (merged.outlineColor) {
      entity.polygon.outlineColor = new ConstantProperty(merged.outlineColor);
    }

    if (merged.outlineWidth !== undefined) {
      entity.polygon.outlineWidth = new ConstantProperty(merged.outlineWidth);
    }

    // Extrusion
    if (merged.extrudedHeight !== undefined) {
      entity.polygon.extrudedHeight = new ConstantProperty(merged.extrudedHeight);
    }

    // Height reference
    if (merged.heightReference !== undefined) {
      entity.polygon.heightReference = new ConstantProperty(merged.heightReference);
    }

    // Distance display condition
    if (merged.distanceDisplayCondition) {
      const { near = 0, far = Number.MAX_VALUE } = merged.distanceDisplayCondition;
      entity.polygon.distanceDisplayCondition = new ConstantProperty(
        new DistanceDisplayCondition(near, far)
      );
    }
  }
}

export function GeoJsonLayer({
  data,
  layerName,
  style = {},
  styleResolver,
  show = true,
  onReady,
  onError,
}: GeoJsonLayerProps) {
  const viewer = useMapStore((state) => state.viewer);
  const dsRef = useRef<GeoJsonDataSource | null>(null);

  useEffect(() => {
    if (!data || !layerName) {
      console.warn("GeoJsonLayer: data와 layerName은 필수입니다.");
      return;
    }

    if (!viewer || viewer.isDestroyed()) return;

    let isCancelled = false;

    const loadGeoJson = async () => {
      try {
        const ds = await GeoJsonDataSource.load(data, {
          clampToGround: true,
        });

        if (isCancelled || viewer.isDestroyed()) {
          return;
        }

        ds.show = show;
        applyGeoJsonStyle(ds, style, data, styleResolver);

        await viewer.dataSources.add(ds);
        dsRef.current = ds;

        useGeoJsonStore.getState().addLayer(layerName, {
          dataSource: ds,
          data: typeof data !== "string" ? data : undefined,
          style,
          show,
        });

        viewer.scene.requestRender();
        onReady?.(ds.entities.values.length);
      } catch (error) {
        if (isCancelled) return;
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Failed to load GeoJSON:", err);
        onError?.(err);
      }
    };

    loadGeoJson();

    return () => {
      isCancelled = true;
      if (dsRef.current) {
        if (viewer && !viewer.isDestroyed()) {
          viewer.dataSources.remove(dsRef.current);
        }
        useGeoJsonStore.getState().removeLayer(layerName);
        dsRef.current = null;
      }
    };
  }, [viewer, data, layerName, style, styleResolver, onReady, onError, show]);

  useEffect(() => {
    if (dsRef.current) {
      dsRef.current.show = show;
      useGeoJsonStore.getState().setLayerVisibility(layerName, show);
    }
  }, [show, layerName]);

  return null;
}
