import { useEffect, useRef } from "react";
import { Map as MapboxMap, type CustomLayerInterface } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ThreeOverlayHandle } from "../types";
import { MAPBOX_TOKEN, MAP_STYLES, CLIP_OUTLINE_COLOR, type MapStyleKey } from "../constants";
import { INITIAL_VIEW } from "../config/site.config";

function parseWKTPolygonCoords(wkt: string): [number, number][] | null {
  const match = wkt.match(/POLYGON\s*\(\((.+)\)\)/i);
  if (!match?.[1]) return null;

  const coords = match[1].split(",").map((pair) => {
    const [lng, lat] = pair.trim().split(/\s+/).map(Number);
    return [lng!, lat!] as [number, number];
  });
  return coords.length > 0 ? coords : null;
}

interface UseMapboxSetupOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  selectedIdRef: React.RefObject<string | null>;
  renderCallbacksRef: React.RefObject<Set<() => void>>;
  sitePolygonWKT?: string;
  currentStyleRef: React.MutableRefObject<MapStyleKey>;
}

export function useMapboxSetup(opts: UseMapboxSetupOptions): {
  mapRef: React.RefObject<MapboxMap | null>;
} {
  const {
    containerRef,
    overlayRef,
    popupRef,
    selectedIdRef,
    renderCallbacksRef,
    sitePolygonWKT,
    currentStyleRef,
  } = opts;

  const mapRef = useRef<MapboxMap | null>(null);
  const sitePolygonWKTRef = useRef(sitePolygonWKT);

  useEffect(() => {
    sitePolygonWKTRef.current = sitePolygonWKT;
    const map = mapRef.current;
    if (!map || !sitePolygonWKT) return;

    const polygonCoords = parseWKTPolygonCoords(sitePolygonWKT);
    if (!polygonCoords) return;

    const clipSrc = map.getSource("model-clip-area") as mapboxgl.GeoJSONSource | undefined;
    if (clipSrc) {
      clipSrc.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [polygonCoords] },
      });
    } else if (!map.getSource("model-clip-area")) {
      map.addSource("model-clip-area", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [polygonCoords] },
        },
      });
      map.addLayer({
        id: "model-clip",
        type: "clip" as never,
        source: "model-clip-area",
        layout: { "clip-layer-types": ["model", "symbol"] } as never,
      });
      map.addLayer({
        id: "model-clip-outline",
        type: "line",
        source: "model-clip-area",
        paint: {
          "line-color": CLIP_OUTLINE_COLOR[currentStyleRef.current],
          "line-dasharray": [0, 4, 3],
          "line-width": 5,
          "line-emissive-strength": 1,
        } as never,
      });
    }
  }, [sitePolygonWKT]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapboxMap({
      container: containerRef.current,
      style: MAP_STYLES.day,
      accessToken: MAPBOX_TOKEN,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      antialias: true,
      // @ts-expect-error — useWebGL2 exists in Mapbox GL JS v3 but missing from types
      useWebGL2: true,
      performanceMetricsCollection: false,
      logoPosition: "bottom-left",
      attributionControl: false,
    });

    map.keyboard.disable();

    const onStyleLoad = () => {
      if (!map.getLayer("matrix-bridge")) {
        map.addLayer({
          id: "matrix-bridge",
          type: "custom",
          renderingMode: "3d",
          onAdd() {},
          render(_gl: WebGL2RenderingContext, matrix: number[]) {
            const needsRepaint = overlayRef.current?.render(matrix);
            if (needsRepaint) map.triggerRepaint();
          },
        } as unknown as CustomLayerInterface);
      }

      const setConfig = (map as unknown as Record<string, unknown>).setConfigProperty as
        | ((namespace: string, key: string, value: unknown) => void)
        | undefined;
      if (setConfig) {
        setConfig.call(map, "basemap", "showPointOfInterestLabels", false);
      }

      const clipCoords = sitePolygonWKTRef.current
        ? parseWKTPolygonCoords(sitePolygonWKTRef.current)
        : null;
      if (clipCoords && !map.getSource("model-clip-area")) {
        map.addSource("model-clip-area", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "Polygon", coordinates: [clipCoords] },
          },
        });

        map.addLayer({
          id: "model-clip",
          type: "clip" as never,
          source: "model-clip-area",
          layout: { "clip-layer-types": ["model", "symbol"] } as never,
        });

        map.addLayer({
          id: "model-clip-outline",
          type: "line",
          source: "model-clip-area",
          paint: {
            "line-color": CLIP_OUTLINE_COLOR[currentStyleRef.current],
            "line-dasharray": [0, 4, 3],
            "line-width": 5,
            "line-emissive-strength": 1,
          } as never,
        });
      }
    };

    map.on("render", () => {
      const canvas = map.getCanvas();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const selId = selectedIdRef.current;
      if (selId && popupRef.current) {
        const pos = overlayRef.current?.projectFeatureToScreen(selId, w, h);
        if (pos) {
          popupRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
          popupRef.current.style.display = "";
        } else {
          popupRef.current.style.display = "none";
        }
      }

      for (const cb of renderCallbacksRef.current) {
        cb();
      }
    });

    map.on("style.load", onStyleLoad);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return { mapRef };
}
