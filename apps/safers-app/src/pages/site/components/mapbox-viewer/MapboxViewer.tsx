import { useEffect, useRef, useImperativeHandle } from "react";
import { Map as MapboxMap, type CustomLayerInterface } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ModelTransform } from "./types";
import { MAPBOX_TOKEN, MODEL_URL, INITIAL_VIEW, MAP_STYLES, type MapStyleKey } from "./constants";
import { createThreeLayer } from "./create-three-layer";

export interface MapboxViewerHandle {
  setStyle: (style: MapStyleKey) => void;
}

interface MapboxViewerProps {
  ref?: React.Ref<MapboxViewerHandle>;
}

export function MapboxViewer({ ref }: MapboxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  const transformRef = useRef<ModelTransform>({
    lng: 126.84714,
    lat: 37.498996,
    altitude: -13,
    rotationX: 90,
    rotationY: 112,
    rotationZ: 0,
    scale: 1,
  });

  useImperativeHandle(ref, () => ({
    setStyle(style: MapStyleKey) {
      if (mapRef.current) {
        mapRef.current.setStyle(MAP_STYLES[style]);
      }
    },
  }));

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
    });

    const onStyleLoad = () => {
      if (!map.getLayer("3d-model")) {
        map.addLayer(createThreeLayer(MODEL_URL, transformRef) as unknown as CustomLayerInterface);
      }

      // Mapbox Standard config — POI 라벨 숨기기
      const setConfig = (map as unknown as Record<string, unknown>).setConfigProperty as
        | ((namespace: string, key: string, value: unknown) => void)
        | undefined;
      if (setConfig) {
        setConfig.call(map, "basemap", "showPointOfInterestLabels", false);
      }
    };

    map.on("style.load", onStyleLoad);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
