import { create } from "zustand";
import {
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRange,
  BoundingSphere,
  Ellipsoid,
  JulianDate,
} from "cesium";
import type {
  CameraPosition,
  FlyToOptions,
  LookAtOptions,
  ZoomToOptions,
  Coordinate,
} from "../types/index";
import {
  isLookAtFeature,
  isZoomToCoordinates,
  isZoomToFeatures,
  isZoomToBoundary,
} from "../types/index";
import { useMapStore } from "./mapStore";
import { useFeatureStore } from "./featureStore";

// ============================================================================
// Helpers
// ============================================================================

function coordinateToCartesian3(coord: Coordinate): Cartesian3 {
  return Cartesian3.fromDegrees(coord.longitude, coord.latitude, coord.height ?? 0);
}

function parseWKTPolygon(wkt: string): Coordinate[] {
  // POLYGON((lon1 lat1, lon2 lat2, ...)) 파싱
  const match = wkt.match(/POLYGON\s*\(\s*\(\s*(.+?)\s*\)\s*\)/i);
  if (!match || !match[1]) return [];

  const coordPairs = match[1].split(",").map((s) => s.trim());
  const coordinates: Coordinate[] = [];

  for (const pair of coordPairs) {
    const parts = pair.split(/\s+/).map(Number);
    const lon = parts[0];
    const lat = parts[1];
    const height = parts[2] ?? 0;

    if (lon !== undefined && lat !== undefined && !isNaN(lon) && !isNaN(lat)) {
      coordinates.push({ longitude: lon, latitude: lat, height });
    }
  }

  return coordinates;
}

function getEntityCoordinate(entity: {
  position?: { getValue: (time: JulianDate) => Cartesian3 | undefined };
}): Coordinate | null {
  if (!entity.position) return null;
  const cartesian = entity.position.getValue(JulianDate.now());
  if (!cartesian) return null;

  const cartographic = Ellipsoid.WGS84.cartesianToCartographic(cartesian);
  return {
    longitude: CesiumMath.toDegrees(cartographic.longitude),
    latitude: CesiumMath.toDegrees(cartographic.latitude),
    height: cartographic.height,
  };
}

// ============================================================================
// State & Actions
// ============================================================================

interface CameraState {
  cameraPosition: CameraPosition | null;
}

interface CameraActions {
  flyTo: (options: FlyToOptions) => void;
  lookAt: (options: LookAtOptions) => void;
  zoomTo: (options: ZoomToOptions) => void;
  // Internal
  _updateCameraPosition: () => void;
  _resetCameraPosition: () => void;
}

// ============================================================================
// Store
// ============================================================================

export const useCameraStore = create<CameraState & CameraActions>((set) => {
  const flyToBoundingSphere = (
    boundingSphere: BoundingSphere,
    heading: number,
    pitch: number,
    duration: number
  ) => {
    const viewer = useMapStore.getState().viewer;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.camera.flyToBoundingSphere(boundingSphere, {
      offset: new HeadingPitchRange(
        CesiumMath.toRadians(heading),
        CesiumMath.toRadians(pitch),
        0 // 자동 계산
      ),
      duration,
    });
  };

  return {
    cameraPosition: null,

    _updateCameraPosition: () => {
      const viewer = useMapStore.getState().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      const cartographic = viewer.camera.positionCartographic;
      set({
        cameraPosition: {
          longitude: CesiumMath.toDegrees(cartographic.longitude),
          latitude: CesiumMath.toDegrees(cartographic.latitude),
          height: cartographic.height,
          heading: CesiumMath.toDegrees(viewer.camera.heading),
          pitch: CesiumMath.toDegrees(viewer.camera.pitch),
        },
      });
    },

    _resetCameraPosition: () => {
      set({ cameraPosition: null });
    },

    flyTo: ({ longitude, latitude, height = 1000, heading = 0, pitch = -45, duration = 1 }) => {
      const viewer = useMapStore.getState().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
          heading: CesiumMath.toRadians(heading),
          pitch: CesiumMath.toRadians(pitch),
          roll: 0,
        },
        duration,
      });
    },

    lookAt: (options) => {
      const viewer = useMapStore.getState().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      const { distance = 1000, heading = 0, pitch = -45, duration = 1 } = options;

      if (isLookAtFeature(options)) {
        const entity = useFeatureStore.getState().getFeature(options.feature);
        if (!entity) return;

        const coord = getEntityCoordinate(entity);
        if (!coord) return;

        const target = coordinateToCartesian3(coord);
        const offset = new HeadingPitchRange(
          CesiumMath.toRadians(heading),
          CesiumMath.toRadians(pitch),
          distance
        );

        viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 0), {
          offset,
          duration,
        });
        return;
      }

      const { longitude, latitude, height = 0 } = options;
      const target = Cartesian3.fromDegrees(longitude, latitude, height);
      const offset = new HeadingPitchRange(
        CesiumMath.toRadians(heading),
        CesiumMath.toRadians(pitch),
        distance
      );

      viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 0), {
        offset,
        duration,
      });
    },

    zoomTo: (options) => {
      const viewer = useMapStore.getState().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      const { heading = 0, pitch = -45, duration = 1 } = options;

      if (isZoomToCoordinates(options)) {
        const points = options.coordinates.map(coordinateToCartesian3);
        if (points.length === 0) return;

        const boundingSphere = BoundingSphere.fromPoints(points);
        flyToBoundingSphere(boundingSphere, heading, pitch, duration);
        return;
      }

      if (isZoomToFeatures(options)) {
        const { features } = options;
        const coordinates: Coordinate[] = [];

        if (Array.isArray(features)) {
          for (const featureId of features) {
            const entity = useFeatureStore.getState().getFeature(featureId);
            if (entity) {
              const coord = getEntityCoordinate(entity);
              if (coord) coordinates.push(coord);
            }
          }
        } else {
          const entities = useFeatureStore.getState().getFeatures(features);
          for (const entity of entities) {
            const coord = getEntityCoordinate(entity);
            if (coord) coordinates.push(coord);
          }
        }

        if (coordinates.length === 0) return;

        const points = coordinates.map(coordinateToCartesian3);
        const boundingSphere = BoundingSphere.fromPoints(points);
        flyToBoundingSphere(boundingSphere, heading, pitch, duration);
        return;
      }

      if (isZoomToBoundary(options)) {
        const coordinates = parseWKTPolygon(options.boundary);
        if (coordinates.length === 0) return;

        const points = coordinates.map(coordinateToCartesian3);
        const boundingSphere = BoundingSphere.fromPoints(points);
        flyToBoundingSphere(boundingSphere, heading, pitch, duration);
      }
    },
  };
});

export const cameraStore = useCameraStore;

// ============================================================================
// Viewer 변경 구독 - 카메라 이벤트 리스너 자동 등록/해제
// ============================================================================

let cameraUpdateHandler: (() => void) | null = null;

useMapStore.subscribe(
  (state) => state.viewer,
  (viewer, prevViewer) => {
    // 이전 viewer에서 리스너 제거
    if (prevViewer && !prevViewer.isDestroyed() && cameraUpdateHandler) {
      prevViewer.camera.changed.removeEventListener(cameraUpdateHandler);
    }

    // 카메라 위치 초기화
    useCameraStore.getState()._resetCameraPosition();

    // 새 viewer에 리스너 등록
    if (viewer && !viewer.isDestroyed()) {
      cameraUpdateHandler = useCameraStore.getState()._updateCameraPosition;
      viewer.camera.changed.addEventListener(cameraUpdateHandler);
      viewer.camera.percentageChanged = 0.01;
    }
  }
);
