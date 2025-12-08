import { useEffect, useRef } from "react";
import { Viewer } from "cesium";
import { createViewer, setupImagery, setupTerrain, createCluster, flyTo } from "@pf-dev/map";
import { seoulMarkers } from "../data/markers";

export default function IonImageryEllipsoidTerrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = async () => {
      const viewer = createViewer(containerRef.current!, {
        ionToken: import.meta.env.VITE_CESIUM_ION_TOKEN,
        timeline: false,
        animation: false,
      });

      viewerRef.current = viewer;

      // Ion Imagery (사용자 지정 assetId: 3830182)
      await setupImagery(viewer, {
        provider: "ion",
        assetId: 3830182,
      });

      // Ellipsoid Terrain (평면 지구, Ion 불필요)
      await setupTerrain(viewer, {
        provider: "ellipsoid",
      });

      // 서울 마커 클러스터
      await createCluster(viewer, "seoul-cluster", seoulMarkers, {
        enabled: true,
        pixelRange: 80,
        minimumClusterSize: 2,
      });

      // 서울 상공으로 카메라 이동
      flyTo(viewer, {
        destination: {
          longitude: 126.978,
          latitude: 37.5665,
          height: 5000,
          heading: 0,
          pitch: -45,
          roll: 0,
        },
        duration: 2,
      });
    };

    initMap();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
