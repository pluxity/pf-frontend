# @pf-dev/map

CesiumJS 기반 3D 지도 시각화 패키지입니다.

## 설치

```bash
pnpm add @pf-dev/map cesium
```

## 주요 기능

- **Viewer 관리** - Cesium Viewer 생성 및 설정
- **Imagery 설정** - Ion, OSM, Bing, ArcGIS 이미지리 지원
- **Terrain 설정** - Ion 터레인 및 대안
- **Marker 시스템** - 단일/다중 마커 생성 및 관리
- **Cluster 기능** - 마커 클러스터링
- **Camera 제어** - flyTo, setView 등 카메라 조작
- **Zustand Store** - 중앙화된 상태 관리

## 기본 사용법

### 1. Viewer 생성

```typescript
import { createViewer, setupImagery, setupTerrain } from "@pf-dev/map";

// Viewer 생성
const viewer = createViewer("cesiumContainer", {
  ionToken: import.meta.env.VITE_ION_TOKEN,
  timeline: false,
  animation: false,
});

// 이미지리 설정 (Ion)
await setupImagery(viewer, {
  provider: "ion",
  assetId: 2,
});

// 오프라인 이미지리 설정 (OSM)
await setupImagery(viewer, {
  provider: "osm",
});

// 터레인 설정
await setupTerrain(viewer, {
  enabled: true,
});
```

### 2. Marker 생성

```typescript
import { createMarker, createMarkers } from "@pf-dev/map";

// 단일 마커
createMarker(viewer, {
  id: "marker-01",
  position: { longitude: 127.1, latitude: 37.5, height: 0 },
  icon: "/icons/pin.png",
  label: "서울역",
  onClick: (entity) => {
    console.log("Marker clicked:", entity.id);
  },
});

// 다중 마커
createMarkers(viewer, [
  {
    id: "marker-01",
    position: { longitude: 127.1, latitude: 37.5, height: 0 },
    label: "서울역",
  },
  {
    id: "marker-02",
    position: { longitude: 127.2, latitude: 37.6, height: 0 },
    label: "강남역",
  },
]);
```

### 3. Cluster 생성

```typescript
import { createCluster } from "@pf-dev/map";

const markers = [
  {
    id: "marker-01",
    position: { longitude: 127.1, latitude: 37.5, height: 0 },
    label: "서울역",
  },
  {
    id: "marker-02",
    position: { longitude: 127.2, latitude: 37.6, height: 0 },
    label: "강남역",
  },
];

const cluster = await createCluster(viewer, "cluster-01", markers, {
  enabled: true,
  pixelRange: 50,
  minimumClusterSize: 2,
});
```

### 4. Camera 제어

```typescript
import { flyTo, setView, zoomToEntity } from "@pf-dev/map";

// 애니메이션과 함께 이동
flyTo(viewer, {
  destination: {
    longitude: 127.1,
    latitude: 37.5,
    height: 1000,
  },
  duration: 2,
});

// 즉시 카메라 설정
setView(viewer, {
  longitude: 127.1,
  latitude: 37.5,
  height: 1000,
  heading: 0,
  pitch: -90,
  roll: 0,
});

// Entity로 줌
const entity = viewer.entities.getById("marker-01");
if (entity) {
  zoomToEntity(viewer, entity, {
    range: 1000,
    pitch: -45,
  });
}
```

### 5. Store 사용

```typescript
import { useViewerStore } from "@pf-dev/map";

const { viewer, markers, clusters } = useViewerStore();

// 마커 조회
const marker = useViewerStore.getState().getMarker("marker-01");

// 마커 제거
useViewerStore.getState().removeMarker("marker-01");

// 전체 초기화
useViewerStore.getState().clear();
```

## API 문서

### Viewer

#### `createViewer(container, config)`

Cesium Viewer를 생성합니다.

**Parameters:**

- `container`: HTMLElement | string - Viewer를 렌더링할 컨테이너
- `config`: ViewerConfig - Viewer 설정 옵션

**Returns:** `Viewer`

#### `setupImagery(viewer, config)`

이미지리 프로바이더를 설정합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `config`: ImageryConfig - 이미지리 설정

**Supported Providers:**

- `ion` - Cesium Ion (assetId 필요)
- `osm` - OpenStreetMap
- `bing` - Bing Maps (API key 필요)
- `arcgis` - ArcGIS

#### `setupTerrain(viewer, config)`

터레인을 설정합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `config`: TerrainConfig - 터레인 설정

### Marker

#### `createMarker(viewer, config)`

단일 마커를 생성합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `config`: MarkerConfig - 마커 설정

**Returns:** `Entity`

#### `updateMarker(entity, updates)`

마커를 업데이트합니다.

**Parameters:**

- `entity`: Entity - 업데이트할 마커 엔티티
- `updates`: Partial<MarkerConfig> - 업데이트할 속성

#### `removeMarker(id)`

마커를 제거합니다.

**Parameters:**

- `id`: string - 마커 ID

### Cluster

#### `createCluster(viewer, id, markers, config)`

클러스터를 생성합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `id`: string - 클러스터 ID
- `markers`: MarkerConfig[] - 마커 설정 배열
- `config`: ClusterConfig - 클러스터 설정

**Returns:** `Promise<CustomDataSource>`

### Camera

#### `flyTo(viewer, options)`

애니메이션과 함께 카메라를 이동합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `options`: FlyToOptions - FlyTo 옵션

#### `setView(viewer, destination)`

즉시 카메라를 설정합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `destination`: CameraDestination - 카메라 목적지

#### `zoomToEntity(viewer, entity, offset?)`

특정 Entity로 줌합니다.

**Parameters:**

- `viewer`: Viewer - Cesium Viewer 인스턴스
- `entity`: Entity - 대상 엔티티
- `offset`: { heading?, pitch?, range? } - 카메라 오프셋

## 타입 정의

```typescript
interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

interface MarkerConfig {
  id: string;
  position: Coordinate;
  icon?: string;
  label?: string;
  description?: string;
  color?: string;
  scale?: number;
  onClick?: (entity: Entity) => void;
}

interface ClusterConfig {
  enabled: boolean;
  pixelRange?: number;
  minimumClusterSize?: number;
}

interface FlyToOptions {
  destination: CameraDestination;
  duration?: number;
  complete?: () => void;
  cancel?: () => void;
}
```

## License

MIT
