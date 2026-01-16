import { useState, useCallback } from "react";
import * as THREE from "three";
import type { PotreeViewerProps, GISCoordinate } from "../types";
import { usePotreeScene, useStaticModels, useTrackingObjects } from "../hooks";
import { LoadingOverlay } from "./LoadingOverlay";
import { CoordinateDisplay } from "./CoordinateDisplay";
import { POINTCLOUD_URL } from "../config";

export function PotreeViewer({
  pointCloudUrl = POINTCLOUD_URL,
  cctvConfigUrl,
  trackingObjects = [],
  showCoordinates = true,
  showPointCount = true,
  onError,
}: PotreeViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hoverCoord, setHoverCoord] = useState<GISCoordinate | null>(null);
  const [pointCount, setPointCount] = useState(0);
  const [offset, setOffset] = useState<THREE.Vector3>(() => new THREE.Vector3());

  const handlePointCloudLoaded = useCallback((loadedOffset: THREE.Vector3) => {
    setOffset(loadedOffset.clone());
    setIsLoading(false);
  }, []);

  const handleHoverCoordChange = useCallback((coord: GISCoordinate | null) => {
    setHoverCoord(coord);
  }, []);

  const handlePointCountChange = useCallback((count: number) => {
    setPointCount(count);
  }, []);

  const { containerRef, addToScene } = usePotreeScene({
    pointCloudUrl,
    onPointCloudLoaded: handlePointCloudLoaded,
    onHoverCoordChange: handleHoverCoordChange,
    onPointCountChange: handlePointCountChange,
    onError,
  });

  useStaticModels({
    configUrl: cctvConfigUrl,
    offset,
    addToScene,
    onError,
  });

  useTrackingObjects({
    objects: trackingObjects,
    offset,
    addToScene,
    onError,
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <LoadingOverlay isLoading={isLoading} message="Loading point cloud..." />

      {showCoordinates && (
        <CoordinateDisplay
          coordinate={hoverCoord}
          pointCount={showPointCount ? pointCount : undefined}
        />
      )}
    </div>
  );
}
