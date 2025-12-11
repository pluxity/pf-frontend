# @pf-dev/map

CesiumJS 기반 3D 지도 시각화 React 패키지입니다.

## 설치

```bash
pnpm add @pf-dev/map cesium
```

## 개요

| 구분            | 기능                           | 설명                                          |
| --------------- | ------------------------------ | --------------------------------------------- |
| **지도 표시**   | MapViewer                      | Cesium Viewer를 React 컴포넌트로 제공         |
|                 | Imagery                        | 위성/지도 이미지 레이어 (OSM, VWorld, Ion 등) |
|                 | Terrain                        | 지형 데이터 (평면, Ion, Custom)               |
|                 | Tiles3D                        | 3D Tiles 건물/모델 로딩                       |
| **카메라 제어** | flyTo                          | 특정 좌표로 이동 (duration:0 = 즉시)          |
|                 | lookAt                         | 대상(좌표/Feature)을 바라보기                 |
|                 | zoomTo                         | 여러 대상을 한눈에 보기                       |
| **Entity 관리** | addFeature / addFeatures       | 단일/복수 마커 추가                           |
|                 | removeFeature / removeFeatures | 단일/복수 마커 삭제                           |
|                 | getFeature / getFeatures       | 단일/복수 마커 조회                           |
|                 | updateFeature                  | 위치/속성/시각화 갱신                         |
|                 | setVisibility                  | 조건/레이어명 기반 가시화 토글                |
|                 | findByProperty                 | 속성으로 검색                                 |

---

## 빠른 시작

### 1. 기본 지도 표시

```tsx
import { MapViewer, Imagery, Terrain } from "@pf-dev/map";

function App() {
  return (
    <MapViewer className="w-full h-screen">
      <Imagery provider="osm" />
      <Terrain provider="ellipsoid" />
    </MapViewer>
  );
}
```

### 2. 한국 지도 (VWorld 위성)

```tsx
<MapViewer className="w-full h-screen">
  <Imagery provider="vworld" apiKey={import.meta.env.VITE_VWORLD_API_KEY} vworldLayer="Satellite" />
  <Terrain provider="ellipsoid" />
</MapViewer>
```

### 3. Ion 기반 (글로벌)

```tsx
<MapViewer className="w-full h-screen" ionToken={import.meta.env.VITE_ION_TOKEN}>
  <Imagery provider="ion" assetId={2} />
  <Terrain provider="ion" assetId={1} />
  <Tiles3D ionAssetId={96188} /> {/* 3D 건물 */}
</MapViewer>
```

---

## 컴포넌트 상세

### MapViewer

Cesium Viewer를 감싸는 루트 컴포넌트입니다.

```tsx
<MapViewer
  className="w-full h-screen"
  ionToken="your-ion-token" // Ion 사용 시 필수
>
  {/* 자식 컴포넌트 */}
</MapViewer>
```

**기본 카메라 위치**: 플럭시티 HQ (126.970445, 37.394434), 높이 500m

### Imagery (이미지 레이어)

| Provider | 설명            | 필수 옵션               |
| -------- | --------------- | ----------------------- |
| `osm`    | OpenStreetMap   | -                       |
| `ion`    | Cesium Ion      | `assetId`               |
| `bing`   | Bing Maps       | `apiKey`                |
| `arcgis` | ArcGIS          | -                       |
| `vworld` | 브이월드 (한국) | `apiKey`, `vworldLayer` |

```tsx
// VWorld 예시
<Imagery
  provider="vworld"
  apiKey="YOUR_KEY"
  vworldLayer="Base" // Base, Satellite, Hybrid, Gray, Midnight
/>
```

### Terrain (지형)

| Provider    | 설명               | 필수 옵션 |
| ----------- | ------------------ | --------- |
| `ellipsoid` | 평면 지구 (기본값) | -         |
| `ion`       | Cesium Ion 지형    | `assetId` |
| `custom`    | 커스텀 서버        | `url`     |

```tsx
// 평면 (Ion 토큰 불필요)
<Terrain provider="ellipsoid" />

// Ion 지형
<Terrain provider="ion" assetId={1} />
```

### Tiles3D (3D Tiles)

3D 건물, 모델, 포인트클라우드 등을 로드합니다.

```tsx
// Ion Asset
<Tiles3D
  ionAssetId={96188}
  show={true}
  onReady={(tileset) => console.log("로드 완료")}
/>

// URL
<Tiles3D url="/path/to/tileset.json" />
```

---

## 카메라 제어 (useCameraStore)

```tsx
import { useCameraStore } from "@pf-dev/map";

function Controls() {
  const { flyTo, lookAt, zoomTo, cameraPosition } = useCameraStore();

  // ...
}
```

### flyTo - 좌표로 이동

카메라가 해당 위치로 이동합니다.

```tsx
// 애니메이션 이동 (기본)
flyTo({
  longitude: 127.0,
  latitude: 37.5,
  height: 1000, // 카메라 높이 (m)
  heading: 0, // 방향 (도)
  pitch: -45, // 기울기 (도)
  duration: 2, // 애니메이션 시간 (초)
});

// 즉시 이동 (애니메이션 없음)
flyTo({
  longitude: 127.0,
  latitude: 37.5,
  height: 1000,
  duration: 0, // 즉시 이동
});
```

### lookAt - 대상 바라보기

대상을 중심으로 일정 거리에서 바라봅니다.

```tsx
// 좌표 기반
lookAt({
  longitude: 127.0,
  latitude: 37.5,
  distance: 500, // 대상과의 거리 (m)
  pitch: -30,
});

// Feature ID 기반 (저장된 Entity 바라보기)
lookAt({
  feature: "sensor-001", // featureId만 전달
  distance: 300,
  pitch: -45,
});
```

### zoomTo - 여러 대상 한눈에

여러 위치/객체를 모두 볼 수 있도록 카메라를 자동 조정합니다.

```tsx
// 좌표 배열
zoomTo({
  coordinates: [
    { longitude: 127.0, latitude: 37.5 },
    { longitude: 127.1, latitude: 37.4 },
    { longitude: 126.9, latitude: 37.6 },
  ],
  pitch: -45,
  duration: 1.5,
});

// Feature ID 배열
zoomTo({
  features: ["sensor-001", "sensor-002", "sensor-003"],
  pitch: -45,
});

// 필터 함수 (조건에 맞는 Feature들)
zoomTo({
  features: (entity) => {
    const props = entity.properties?.getValue(JulianDate.now());
    return props?.status === "warning";
  },
  pitch: -45,
});

// 전체 Feature 보기
zoomTo({
  features: () => true, // 모든 Feature
  pitch: -60,
});

// WKT Boundary
zoomTo({
  boundary: "POLYGON((126.9 37.4, 127.1 37.4, 127.1 37.6, 126.9 37.6, 126.9 37.4))",
  pitch: -45,
});
```

### cameraPosition - 현재 위치 구독

```tsx
function CameraInfo() {
  const cameraPosition = useCameraStore((state) => state.cameraPosition);

  if (!cameraPosition) return null;

  return (
    <div>
      경도: {cameraPosition.longitude.toFixed(6)}
      위도: {cameraPosition.latitude.toFixed(6)}
      높이: {cameraPosition.height.toFixed(0)}m
    </div>
  );
}
```

---

## Entity 관리 (useFeatureStore)

지도 위의 마커, 객체 등을 관리합니다.

```tsx
import { useFeatureStore } from "@pf-dev/map";

function FeatureManager() {
  const {
    // 단일
    addFeature,
    getFeature,
    removeFeature,
    // 복수
    addFeatures,
    getFeatures,
    removeFeatures,
    // 검색/기타
    findByProperty,
    clearAll,
  } = useFeatureStore();

  // ...
}
```

### 단일 Feature API

#### addFeature - Entity 추가

```tsx
import { Color, VerticalOrigin, HeightReference } from "cesium";

// 시각화/레이어 메타까지 한번에 추가
addFeature("sensor-001", {
  position: { longitude: 127.0, latitude: 37.5, height: 0 },
  properties: { type: "temperature", status: "active", value: 25.5 },
  visual: {
    type: "billboard",
    image: "/icons/sensor.png",
    width: 32,
    height: 32,
    verticalOrigin: VerticalOrigin.BOTTOM,
    heightReference: HeightReference.CLAMP_TO_GROUND,
  },
  meta: {
    layerName: "sensors",
    tags: ["iot", "temperature"],
    visible: true,
  },
});

// label처럼 추가 그래픽은 반환된 Entity에 후처리로 덧붙일 수 있습니다.
```

#### getFeature / removeFeature / hasFeature

```tsx
// 존재 여부 확인
if (hasFeature("sensor-001")) {
  // Entity 조회
  const entity = getFeature("sensor-001");

  // 삭제
  removeFeature("sensor-001"); // boolean 반환
}
```

### 복수 Feature API

#### addFeatures - 여러 Entity 일괄 추가

```tsx
// Feature 배열로 일괄 추가
const features = [
  {
    id: "sensor-001",
    position: { longitude: 127.0, latitude: 37.5 },
    properties: { status: "normal" },
  },
  {
    id: "sensor-002",
    position: { longitude: 127.1, latitude: 37.4 },
    properties: { status: "warning" },
  },
  {
    id: "sensor-003",
    position: { longitude: 126.9, latitude: 37.6 },
    properties: { status: "critical" },
  },
];

const entities = addFeatures(features); // Entity[] 반환

// 각 Entity에 스타일 적용
entities.forEach((entity, i) => {
  if (entity) {
    entity.point = {
      pixelSize: new ConstantProperty(10),
      color: new ConstantProperty(Color.RED),
    };
  }
});
```

#### getFeatures - 복수 조회

```tsx
// ID 배열로 조회
const entities = getFeatures(["sensor-001", "sensor-002", "sensor-003"]);

// 필터 함수로 조회
const warningEntities = getFeatures((entity) => {
  const props = entity.properties?.getValue(JulianDate.now());
  return props?.status === "warning";
});
```

#### removeFeatures - 복수 삭제

```tsx
// ID 배열로 삭제
const deletedCount = removeFeatures(["sensor-001", "sensor-002"]);
console.log(`${deletedCount}개 삭제됨`);

// 필터 함수로 삭제
const deletedCount2 = removeFeatures((entity) => {
  const props = entity.properties?.getValue(JulianDate.now());
  return props?.status === "inactive";
});
```

### 가시화 토글 / 필터링

```tsx
import { Color, JulianDate } from "cesium";

const { setVisibility, addFeatures } = useFeatureStore();

// 레이어/태그 정보를 가진 Feature 등록
addFeatures([
  {
    id: "cam-1",
    position: { longitude: 127, latitude: 37.5 },
    meta: { layerName: "cctv", tags: ["critical"] },
    visual: { type: "point", pixelSize: 12, color: Color.RED },
  },
  {
    id: "cam-2",
    position: { longitude: 127.1, latitude: 37.51 },
    meta: { layerName: "cctv", tags: ["normal"] },
    visual: { type: "point", pixelSize: 10, color: Color.GRAY },
  },
]);

// ID 배열로 토글
setVisibility(["cam-1"], false);

// 조건 함수로 토글 (properties/시각화 상태 접근 가능)
setVisibility(
  (entity) => entity.properties?.getValue(JulianDate.now())?.status === "warning",
  true
);

// 레이어명 기반 토글 (필터 함수에서 meta 참조)
setVisibility((_, meta) => meta?.layerName === "cctv", true);
```

### 검색/기타 API

#### findByProperty - 속성 검색

```tsx
// 객체 매칭 (AND 조건)
const activeAlerts = findByProperty({
  status: "active",
  type: "alert",
});

// 함수 필터 (복잡한 조건)
const highValue = findByProperty((props) => {
  return (props.value as number) > 50;
});
```

#### updatePosition - 위치 업데이트

```tsx
updatePosition("sensor-001", {
  longitude: 127.1,
  latitude: 37.6,
  height: 100,
});
```

#### updateFeature - 위치/속성/시각화/메타 갱신

```tsx
updateFeature("sensor-001", {
  properties: { status: "warning" },
  visual: { type: "billboard", image: "/icons/warning.png", width: 28, height: 28 },
  meta: { visible: true, layerName: "sensors" },
});
```

#### Bulk Operations

```tsx
// 전체 개수
const count = getFeatureCount();

// 모든 Feature 조회
const allFeatures = getAllFeatures();

// 전체 삭제
clearAll();
```

---

## Store 직접 접근

컴포넌트 외부에서 Store에 접근할 때:

```tsx
import { mapStore, cameraStore, featureStore } from "@pf-dev/map";

// Viewer 직접 접근
const viewer = mapStore.getState().viewer;

// 카메라 제어
cameraStore.getState().flyTo({ longitude: 127, latitude: 37, height: 500 });

// Feature 일괄 추가
featureStore.getState().addFeatures([
  { id: "marker-1", position: { longitude: 127, latitude: 37 } },
  { id: "marker-2", position: { longitude: 127.1, latitude: 37.1 } },
]);
```

## Store 구조

```text
┌─────────────────────────────────────────────────────────────┐
│                        @pf-dev/map                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useMapStore (Viewer 관리)                                  │
│  ├── viewer: Viewer | null                                  │
│  ├── setViewer(viewer)                                      │
│  └── getViewer()                                            │
│                                                             │
│  useCameraStore (카메라 제어)                                │
│  ├── cameraPosition: CameraPosition | null                  │
│  ├── flyTo(options)      → 좌표로 이동 (duration:0 = 즉시)  │
│  ├── lookAt(options)     → 대상 바라보기 (좌표/Feature ID)  │
│  └── zoomTo(options)     → 영역/다중 대상 맞춤              │
│                                                             │
│  useFeatureStore (Entity 관리)                              │
│  ├── entities: Map<featureId, Entity>                       │
│  │                                                          │
│  │  [단일]                                                  │
│  ├── addFeature(id, options)    → Entity | null             │
│  ├── getFeature(id)             → Entity | null             │
│  ├── removeFeature(id)          → boolean                   │
│  ├── hasFeature(id)             → boolean                   │
│  ├── updatePosition(id, pos)    → boolean                   │
│  ├── updateFeature(id, patch)   → boolean                   │
│  │                                                          │
│  │  [복수]                                                  │
│  ├── addFeatures(features)      → Entity[]                  │
│  ├── getFeatures(selector)      → Entity[]                  │
│  ├── removeFeatures(selector)   → number (삭제 개수)        │
│  ├── setVisibility(selector, visible) → number (토글 개수)  │
│  │                                                          │
│  │  [검색/기타]                                             │
│  ├── findByProperty(filter)     → Entity[]                  │
│  ├── getFeatureCount()          → number                    │
│  ├── getAllFeatures()           → Entity[]                  │
│  └── clearAll()                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 타입 정의

### 공통

```typescript
interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

interface DisplayConditionRange {
  near?: number;
  far?: number;
}
```

### Feature 관련

```typescript
type FeatureVisual =
  | {
      type: "billboard";
      image?: string;
      width?: number;
      height?: number;
      scale?: number;
      color?: Color;
      heightReference?: HeightReference;
      verticalOrigin?: VerticalOrigin;
      distanceDisplayCondition?: DisplayConditionRange;
      disableDepthTestDistance?: number;
      show?: boolean;
    }
  | {
      type: "model";
      uri: string;
      scale?: number;
      minimumPixelSize?: number;
      color?: Color;
      silhouetteColor?: Color;
      silhouetteSize?: number;
      show?: boolean;
    }
  | {
      type: "point";
      pixelSize?: number;
      color?: Color;
      outlineColor?: Color;
      outlineWidth?: number;
      heightReference?: HeightReference;
      distanceDisplayCondition?: DisplayConditionRange;
      disableDepthTestDistance?: number;
      show?: boolean;
    };

interface FeatureMeta {
  layerName?: string; // 그룹/레이어 이름
  tags?: string[];
  category?: string;
  visible?: boolean;
}

interface Feature {
  id: string;
  position: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
}

interface FeatureOptions {
  position: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
}

interface FeaturePatch {
  position?: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
}

type PropertyFilter = Record<string, unknown> | ((properties: Record<string, unknown>) => boolean);

type FeatureSelector = string[] | ((entity: Entity, meta?: FeatureMeta) => boolean);
```

### Camera 관련

```typescript
interface FlyToOptions {
  longitude: number;
  latitude: number;
  height?: number;
  heading?: number;
  pitch?: number;
  duration?: number; // 0 = 즉시 이동
}

type LookAtOptions =
  | {
      longitude: number;
      latitude: number;
      height?: number;
      distance?: number;
      heading?: number;
      pitch?: number;
      duration?: number;
    }
  | { feature: string; distance?: number; heading?: number; pitch?: number; duration?: number };

type ZoomToOptions =
  | { coordinates: Coordinate[]; heading?: number; pitch?: number; duration?: number }
  | { features: FeatureSelector; heading?: number; pitch?: number; duration?: number }
  | { boundary: string; heading?: number; pitch?: number; duration?: number };
```

---

## Exports

```typescript
// Components
export { MapViewer } from "./components/MapViewer";
export { Imagery } from "./components/Imagery";
export { Terrain } from "./components/Terrain";
export { Tiles3D } from "./components/Tiles3D";

// Stores (hooks)
export { useMapStore } from "./store/mapStore";
export { useCameraStore } from "./store/cameraStore";
export { useFeatureStore } from "./store/featureStore";

// Stores (direct access)
export { mapStore, cameraStore, featureStore } from "./store";

// Types
export type {
  Coordinate,
  Feature,
  FeatureOptions,
  FeaturePatch,
  FeatureVisual,
  FeatureMeta,
  PropertyFilter,
  FeatureSelector,
  FlyToOptions,
  LookAtOptions,
  ZoomToOptions,
  // ...
} from "./types";

// Type Guards
export { isLookAtFeature, isZoomToCoordinates, isZoomToFeatures, isZoomToBoundary } from "./types";
```

## License

MIT
