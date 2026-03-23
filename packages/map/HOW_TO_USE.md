# @pf-dev/map 사용 가이드

**CesiumJS 기반 3D 지도 시각화 React 패키지**

## 개요

| 구분            | 기능                           | 설명                                                         |
| --------------- | ------------------------------ | ------------------------------------------------------------ |
| **지도 표시**   | MapViewer                      | Cesium Viewer를 React 컴포넌트로 제공                        |
|                 | Imagery                        | 위성/지도 이미지 레이어 (OSM, VWorld, Ion 등)                |
|                 | Terrain                        | 지형 데이터 (평면, Ion, Custom)                              |
|                 | Tiles3D                        | 3D Tiles 건물/모델 로딩                                      |
|                 | FeatureStateEffects            | Feature 상태별 시각 효과 (Silhouette, Ripple, Glow, Outline) |
| **카메라 제어** | flyTo                          | 특정 좌표로 이동 (duration:0 = 즉시)                         |
|                 | lookAt                         | 대상(좌표/Feature)을 바라보기                                |
|                 | zoomTo                         | 여러 대상을 한눈에 보기                                      |
| **Entity 관리** | addFeature / addFeatures       | 단일/복수 마커 추가 (레이어 지원)                            |
|                 | removeFeature / removeFeatures | 단일/복수 마커 삭제                                          |
|                 | getFeature / getFeatures       | 단일/복수 마커 조회                                          |
|                 | updateFeature                  | 위치/속성/시각화 갱신                                        |
|                 | setVisibility                  | 조건/레이어명 기반 가시화 토글                               |
|                 | findByProperty                 | 속성으로 검색                                                |
|                 | setFeatureState                | Feature 상태 설정 (selected, warning 등)                     |

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

### FeatureStateEffects (상태별 시각 효과)

Feature의 상태(selected, warning, critical 등)에 따라 자동으로 시각 효과를 적용합니다.

```tsx
import { Color } from "cesium";

<MapViewer>
  <Imagery provider="osm" />

  <FeatureStateEffects
    selected={{ type: "silhouette", color: Color.YELLOW, size: 3 }}
    warning={{ type: "ripple", color: Color.ORANGE, period: 1200 }}
    critical={{ type: "ripple", color: Color.RED, period: 600 }}
    highlighted={{ type: "glow", color: Color.CYAN, intensity: 0.9 }}
  />
</MapViewer>;
```

**효과 타입**:

- `silhouette`: 3D Model 외곽선 (color, size)
- `ripple`: 바닥 물결 애니메이션 (color, period, maxSize, baseSize)
- `glow`: Billboard/Point 빛나는 효과 (color, intensity)
- `outline`: Point 외곽선 강조 (color, width)

**사용 예시**:

```tsx
// Feature 상태 설정
featureStore.getState().setFeatureState("sensor-001", "warning");

// 상태 조회
const state = featureStore.getState().getFeatureState("sensor-001"); // 'warning'

// 상태 제거
featureStore.getState().clearFeatureState("sensor-001");
```

**Note**: `FeatureStateEffects` 컴포넌트가 없으면 상태는 저장되지만 시각 효과는 적용되지 않습니다.

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
    layerName: "sensors", // 레이어별 DataSource 분리
    tags: ["iot", "temperature"],
    visible: true,
  },
});

// 3D Model 예시
addFeature("worker-01", {
  position: { longitude: 127.0, latitude: 37.5, height: 0 },
  visual: {
    type: "model",
    uri: "/models/worker.glb",
    scale: 1,
    minimumPixelSize: 32,
    heightReference: HeightReference.CLAMP_TO_GROUND,
  },
  meta: {
    layerName: "workers",
  },
});

// Rectangle (이미지/텍스처) 예시
addFeature("building-overlay", {
  position: { longitude: 127.0, latitude: 37.5, height: 0 },
  visual: {
    type: "rectangle",
    image: "/textures/building-plan.png",
    width: 50, // meters
    height: 30, // meters
    stRotation: Math.PI / 4, // 45도 회전
  },
});
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
│  ├── dataSource: CustomDataSource | null (기본)             │
│  ├── layerDataSources: Map<layerName, CustomDataSource>    │
│  ├── setViewer(viewer)                                      │
│  ├── getViewer()                                            │
│  ├── getLayerDataSource(layerName)                         │
│  └── getOrCreateLayerDataSource(layerName)                 │
│                                                             │
│  useCameraStore (카메라 제어)                                │
│  ├── cameraPosition: CameraPosition | null                  │
│  ├── flyTo(options)      → 좌표로 이동 (duration:0 = 즉시)  │
│  ├── lookAt(options)     → 대상 바라보기 (좌표/Feature ID)  │
│  └── zoomTo(options)     → 영역/다중 대상 맞춤              │
│                                                             │
│  useFeatureStore (Entity 관리)                              │
│  ├── entities: Map<featureId, Entity>                       │
│  ├── meta: Map<featureId, FeatureMeta>                      │
│  ├── featureStates: Map<featureId, state>                   │
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
│  ├── clearAll()                                             │
│  │                                                          │
│  │  [상태 관리]                                             │
│  ├── setFeatureState(id, state)   → void                    │
│  ├── getFeatureState(id)          → string | undefined      │
│  └── clearFeatureState(id)        → void                    │
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
      uri: string | Resource;
      scale?: number;
      minimumPixelSize?: number;
      heightReference?: HeightReference;
      color?: Color;
      silhouetteColor?: Color;
      silhouetteSize?: number;
      distanceDisplayCondition?: DisplayConditionRange;
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
    }
  | {
      type: "rectangle";
      image?: string;
      material?: MaterialProperty;
      width?: number; // meters
      height?: number; // meters
      rotation?: number; // radians
      stRotation?: number; // texture rotation in radians
      fill?: boolean;
      outline?: boolean;
      outlineColor?: Color;
      outlineWidth?: number;
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
export { FeatureStateEffects } from "./components/FeatureStateEffects";

// Stores (hooks)
export { useMapStore } from "./store/mapStore";
export { useCameraStore } from "./store/cameraStore";
export { useFeatureStore } from "./store/featureStore";

// Stores (direct access)
export { mapStore, cameraStore, featureStore } from "./store";

// Types
export type {
  // Feature
  Coordinate,
  Feature,
  FeatureOptions,
  FeaturePatch,
  FeatureVisual,
  BillboardVisual,
  ModelVisual,
  PointVisual,
  RectangleVisual,
  FeatureMeta,
  PropertyFilter,
  FeatureSelector,
  // Camera
  FlyToOptions,
  LookAtOptions,
  ZoomToOptions,
  // Feature State Effects
  FeatureStateEffectsProps,
  StateEffect,
  SilhouetteEffect,
  RippleEffect,
  GlowEffect,
  OutlineEffect,
  // ...
} from "./types";

// Type Guards
export { isLookAtFeature, isZoomToCoordinates, isZoomToFeatures, isZoomToBoundary } from "./types";
```

## GeoJSON 기능

GeoJSON 데이터를 지도 위에 폴리곤으로 렌더링하고, 각 폴리곤 중심에 인터랙티브 마커를 표시할 수 있습니다.

### GeoJsonLayer 컴포넌트

GeoJSON 데이터를 폴리곤/라인/포인트로 렌더링합니다.

#### 기본 사용법

```tsx
import { GeoJsonLayer } from "@pf-dev/map";
import { Color } from "cesium";

// URL로 데이터 로드
<GeoJsonLayer
  data="/data/districts.json"
  layerName="districts"
  style={{
    fillColor: Color.BLUE,
    fillOpacity: 0.3,
    outline: true,
    outlineColor: Color.WHITE,
  }}
/>

// 객체로 직접 전달
<GeoJsonLayer
  data={geoJsonObject}
  layerName="zones"
  style={{
    fillColor: Color.GREEN,
    fillOpacity: 0.2,
    extrudedHeight: 50,
  }}
/>
```

#### 스타일 커스터마이징

```tsx
<GeoJsonLayer
  data="/data/regions.json"
  layerName="regions"
  style={{
    fillColor: Color.CYAN, // 채우기 색상
    fillOpacity: 0.4, // 채우기 투명도 (0~1)
    outline: true, // 외곽선 표시
    outlineColor: Color.WHITE, // 외곽선 색상
    extrudedHeight: 100, // 돌출 높이 (m)
  }}
/>
```

#### Feature별 개별 스타일 (styleResolver)

각 Feature의 속성에 따라 개별 스타일을 적용할 수 있습니다.

```tsx
<GeoJsonLayer
  data="/data/districts.json"
  layerName="districts"
  style={{
    fillColor: Color.GRAY,
    fillOpacity: 0.3,
  }}
  styleResolver={(properties) => {
    // properties는 GeoJSON Feature의 properties 객체
    const population = properties.population as number;
    if (population > 500000) {
      return { fillColor: Color.RED, fillOpacity: 0.5 };
    }
    if (population > 200000) {
      return { fillColor: Color.ORANGE, fillOpacity: 0.4 };
    }
    return {}; // 기본 스타일 사용
  }}
/>
```

#### 표시/숨기기

```tsx
const [showLayer, setShowLayer] = useState(true);

<GeoJsonLayer
  data="/data/districts.json"
  layerName="districts"
  show={showLayer}
  style={{ fillColor: Color.BLUE, fillOpacity: 0.3 }}
/>

<button onClick={() => setShowLayer((prev) => !prev)}>
  레이어 토글
</button>
```

#### 이벤트 콜백

```tsx
<GeoJsonLayer
  data="/data/districts.json"
  layerName="districts"
  style={{ fillColor: Color.BLUE, fillOpacity: 0.3 }}
  onReady={(dataSource) => {
    console.log("GeoJSON 로드 완료:", dataSource.entities.values.length, "개 엔티티");
  }}
  onError={(error) => {
    console.error("GeoJSON 로드 실패:", error);
  }}
/>
```

---

### GeoJsonMarkers 컴포넌트

GeoJsonLayer에서 로드한 폴리곤의 중심점에 마커를 표시합니다. `layerName`으로 연결합니다.

#### 기본 사용법

```tsx
import { GeoJsonLayer, GeoJsonMarkers } from "@pf-dev/map";

<MapViewer>
  <Imagery provider="osm" />

  <GeoJsonLayer
    data="/data/districts.json"
    layerName="districts"
    style={{ fillColor: Color.BLUE, fillOpacity: 0.3 }}
  />

  <GeoJsonMarkers
    layerName="districts"
    style={{
      image: "/icons/pin.png",
      selectedImage: "/icons/pin-active.png",
      width: 32,
      height: 32,
    }}
  />
</MapViewer>;
```

#### 마커 스타일

```tsx
<GeoJsonMarkers
  layerName="districts"
  style={{
    image: "/icons/marker.png", // 기본 마커 이미지
    selectedImage: "/icons/marker-on.png", // 선택 시 이미지
    width: 28, // 마커 너비 (px)
    height: 28, // 마커 높이 (px)
  }}
/>
```

#### 거리 기반 스케일링 (scaleByDistance)

카메라 거리에 따라 마커 크기를 자동 조절합니다.

```tsx
<GeoJsonMarkers
  layerName="districts"
  style={{
    image: "/icons/pin.png",
    width: 32,
    height: 32,
  }}
  scaleByDistance={{
    near: 1000, // 가까운 거리 (m)
    nearValue: 1.5, // 가까울 때 스케일
    far: 50000, // 먼 거리 (m)
    farValue: 0.5, // 멀 때 스케일
  }}
/>
```

#### 클릭 이벤트

```tsx
<GeoJsonMarkers
  layerName="districts"
  style={{
    image: "/icons/pin.png",
    selectedImage: "/icons/pin-active.png",
    width: 32,
    height: 32,
  }}
  onClick={(featureId, properties) => {
    console.log("클릭된 Feature:", featureId);
    console.log("속성:", properties);
    // { name: "강남구", population: 550000, ... }
  }}
/>
```

#### 선택 상태 관리

```tsx
import { useGeoJsonStore } from "@pf-dev/map";

function DistrictInfo() {
  const { selectFeature } = useGeoJsonStore();

  // 프로그래밍 방식으로 선택
  const handleSelect = (id: string) => {
    selectFeature("districts", id);
  };

  return <button onClick={() => handleSelect("gangnam")}>강남구 선택</button>;
}
```

---

### useGeoJsonStore

GeoJSON 레이어의 상태를 관리하는 Zustand Store입니다.

```tsx
import { useGeoJsonStore } from "@pf-dev/map";

function GeoJsonManager() {
  const {
    addLayer,
    removeLayer,
    getLayer,
    updateLayerStyle,
    setLayerVisibility,
    selectFeature,
    clearAll,
    getLayerNames,
  } = useGeoJsonStore();

  // ...
}
```

#### API 참조

| 메서드               | 시그니처                                                    | 설명                 |
| -------------------- | ----------------------------------------------------------- | -------------------- |
| `addLayer`           | `(layerName: string, data: GeoJsonLayerData) => void`       | 레이어 등록          |
| `removeLayer`        | `(layerName: string) => void`                               | 레이어 제거          |
| `getLayer`           | `(layerName: string) => GeoJsonLayerData \| undefined`      | 레이어 조회          |
| `updateLayerStyle`   | `(layerName: string, style: Partial<GeoJsonStyle>) => void` | 스타일 업데이트      |
| `setLayerVisibility` | `(layerName: string, visible: boolean) => void`             | 가시성 토글          |
| `selectFeature`      | `(layerName: string, featureId: string \| null) => void`    | Feature 선택/해제    |
| `clearAll`           | `() => void`                                                | 모든 레이어 제거     |
| `getLayerNames`      | `() => string[]`                                            | 등록된 레이어명 목록 |

#### Store 직접 접근 (컴포넌트 외부)

```tsx
import { geoJsonStore } from "@pf-dev/map";

// 레이어 가시성 토글
geoJsonStore.getState().setLayerVisibility("districts", false);

// 특정 Feature 선택
geoJsonStore.getState().selectFeature("districts", "gangnam");

// 선택 해제
geoJsonStore.getState().selectFeature("districts", null);
```

---

### 유틸리티 함수

GeoJSON 데이터 전처리를 위한 유틸리티 함수들입니다.

#### calculatePolygonCenter

폴리곤의 중심점(centroid)을 계산합니다.

```tsx
import { calculatePolygonCenter } from "@pf-dev/map";

const coordinates = [
  [127.0, 37.5],
  [127.1, 37.5],
  [127.1, 37.6],
  [127.0, 37.6],
  [127.0, 37.5], // 닫힌 폴리곤
];

const center = calculatePolygonCenter(coordinates);
// { longitude: 127.05, latitude: 37.55 }
```

#### simplifyGeoJSON

좌표 수를 줄여 렌더링 성능을 개선합니다. Douglas-Peucker 알고리즘을 사용합니다.

```tsx
import { simplifyGeoJSON } from "@pf-dev/map";

// tolerance가 클수록 더 많이 단순화됨
const simplified = simplifyGeoJSON(featureCollection, 0.001);
console.log("원본 좌표:", original.features[0].geometry.coordinates[0].length);
console.log("단순화 좌표:", simplified.features[0].geometry.coordinates[0].length);
```

#### removeSmallIslands

면적이 작은 폴리곤(섬, 작은 영역)을 필터링합니다.

```tsx
import { removeSmallIslands } from "@pf-dev/map";

// minArea 이하의 면적을 가진 폴리곤 제거
const filtered = removeSmallIslands(featureCollection, 0.0001);
console.log("필터링 전:", featureCollection.features.length);
console.log("필터링 후:", filtered.features.length);
```

#### 전처리 파이프라인 예시

```tsx
import { simplifyGeoJSON, removeSmallIslands } from "@pf-dev/map";

async function loadAndPreprocess(url: string) {
  const response = await fetch(url);
  const raw = await response.json();

  // 1. 작은 섬 제거
  const noIslands = removeSmallIslands(raw, 0.0001);

  // 2. 좌표 단순화
  const simplified = simplifyGeoJSON(noIslands, 0.001);

  return simplified;
}

// 컴포넌트에서 사용
function Map() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    loadAndPreprocess("/data/districts.json").then(setGeoData);
  }, []);

  if (!geoData) return null;

  return (
    <MapViewer>
      <Imagery provider="osm" />
      <GeoJsonLayer
        data={geoData}
        layerName="districts"
        style={{ fillColor: Color.BLUE, fillOpacity: 0.3 }}
      />
    </MapViewer>
  );
}
```

---

## License

MIT
