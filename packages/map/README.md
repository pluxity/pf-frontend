# @pf-dev/map

CesiumJS 기반 3D 지도 시각화 React 패키지입니다.

## 설치

```bash
pnpm add @pf-dev/map cesium
```

## 주요 기능

- **MapViewer** - Cesium Viewer React 컴포넌트
- **Imagery** - Ion, OSM, Bing, ArcGIS, VWorld, Kakao 이미지리 지원
- **Terrain** - Ellipsoid, Ion, Custom 터레인 지원
- **Tiles3D** - 3D Tiles 로딩 컴포넌트
- **Feature Store** - 그룹 기반 Entity 관리 및 검색
- **Camera Store** - 카메라 제어 (flyTo, lookAt, setView, zoomTo)

## 기본 사용법

### 1. MapViewer 설정

```tsx
import { MapViewer, Imagery, Terrain, Tiles3D } from "@pf-dev/map";

function App() {
  return (
    <MapViewer className="w-full h-screen" ionToken={import.meta.env.VITE_ION_TOKEN}>
      <Imagery provider="osm" />
      <Terrain provider="ellipsoid" />
      <Tiles3D ionAssetId={12345} />
    </MapViewer>
  );
}
```

### 2. Imagery 옵션

```tsx
// OpenStreetMap
<Imagery provider="osm" />

// Cesium Ion
<Imagery provider="ion" assetId={2} />

// Bing Maps
<Imagery provider="bing" apiKey="YOUR_BING_KEY" />

// ArcGIS
<Imagery provider="arcgis" />

// VWorld (한국)
<Imagery provider="vworld" apiKey="YOUR_VWORLD_KEY" vworldLayer="Base" />

// Kakao (한국)
<Imagery provider="kakao" />
```

### 3. Terrain 옵션

```tsx
// 평면 지구 (기본값, Ion 불필요)
<Terrain provider="ellipsoid" />

// Cesium Ion Terrain
<Terrain provider="ion" assetId={1} />

// 커스텀 Terrain 서버
<Terrain provider="custom" url="https://your-terrain-server.com/tiles" />
```

### 4. 3D Tiles

```tsx
// URL로 로드
<Tiles3D url="/path/to/tileset.json" />

// Ion Asset으로 로드
<Tiles3D
  ionAssetId={12345}
  show={true}
  onReady={(tileset) => console.log("Loaded:", tileset)}
  onError={(error) => console.error("Error:", error)}
/>
```

### 5. Camera 제어

카메라 제어는 `useCameraStore`를 사용합니다.

```tsx
import { useCameraStore } from "@pf-dev/map";

function CameraControls() {
  const { flyTo, lookAt, setView, zoomTo, cameraPosition } = useCameraStore();

  // flyTo: 특정 좌표로 카메라 이동
  const handleFlyTo = () => {
    flyTo({
      longitude: 127.1,
      latitude: 37.5,
      height: 1000,
      duration: 2,
    });
  };

  // lookAt: 좌표 기반 - 대상을 바라보며 거리 유지
  const handleLookAtCoordinate = () => {
    lookAt({
      longitude: 127.1,
      latitude: 37.5,
      distance: 500,
      pitch: -45,
    });
  };

  // lookAt: Feature 기반 - Feature ID로 바라보기
  const handleLookAtFeature = () => {
    lookAt({
      feature: { groupId: "sensors", featureId: "sensor-001" },
      distance: 300,
      pitch: -30,
    });
  };

  // setView: 즉시 카메라 설정 (애니메이션 없음)
  const handleSetView = () => {
    setView({
      longitude: 127.1,
      latitude: 37.5,
      height: 1000,
      heading: 0,
      pitch: -90,
    });
  };

  return (
    <div>
      <button onClick={handleFlyTo}>Fly To</button>
      <button onClick={handleLookAtCoordinate}>Look At (좌표)</button>
      <button onClick={handleLookAtFeature}>Look At (Feature)</button>
      <button onClick={handleSetView}>Set View</button>
      <p>Current: {JSON.stringify(cameraPosition)}</p>
    </div>
  );
}
```

### 6. zoomTo: 여러 대상 한눈에 보기

```tsx
import { useCameraStore } from "@pf-dev/map";

function ZoomControls() {
  const { zoomTo } = useCameraStore();

  // 좌표 배열로 zoomTo
  const handleZoomToCoordinates = () => {
    zoomTo({
      coordinates: [
        { longitude: 127.0, latitude: 37.5 },
        { longitude: 127.1, latitude: 37.4 },
        { longitude: 127.05, latitude: 37.55 },
      ],
      pitch: -45,
      duration: 1.5,
    });
  };

  // Feature 배열로 zoomTo
  const handleZoomToFeatures = () => {
    zoomTo({
      features: [
        { groupId: "sensors", featureId: "sensor-001" },
        { groupId: "sensors", featureId: "sensor-002" },
        { groupId: "sensors", featureId: "sensor-003" },
      ],
      pitch: -45,
    });
  };

  // 그룹 전체 zoomTo
  const handleZoomToGroup = () => {
    zoomTo({
      groupId: "sensors",
      pitch: -60,
    });
  };

  // WKT Boundary로 zoomTo
  const handleZoomToBoundary = () => {
    zoomTo({
      boundary: "POLYGON((126.9 37.4, 127.1 37.4, 127.1 37.6, 126.9 37.6, 126.9 37.4))",
      pitch: -45,
    });
  };

  return (
    <div>
      <button onClick={handleZoomToCoordinates}>좌표 배열</button>
      <button onClick={handleZoomToFeatures}>Feature 배열</button>
      <button onClick={handleZoomToGroup}>그룹 전체</button>
      <button onClick={handleZoomToBoundary}>WKT 영역</button>
    </div>
  );
}
```

### 7. Feature Store 사용

Feature Store는 그룹 기반으로 Entity를 관리합니다.

```tsx
import { useFeatureStore } from "@pf-dev/map";

function FeatureManager() {
  const { addFeature, removeFeature, getFeature, findByProperty, clearGroup } = useFeatureStore();

  // Feature 추가 (Entity 반환)
  const entity = addFeature("sensors", "sensor-001", {
    position: { longitude: 127.1, latitude: 37.5, height: 0 },
    properties: { type: "temperature", status: "active", value: 25.5 },
  });

  // 반환된 Entity에 스타일 적용 (앱에서 직접)
  if (entity) {
    entity.billboard = {
      image: "/icons/sensor.png",
      width: 32,
      height: 32,
    };
  }

  // ID로 Feature 조회
  const feature = getFeature("sensors", "sensor-001");

  // Property로 검색 (객체 매칭)
  const activeFeatures = findByProperty("sensors", { status: "active" });

  // Property로 검색 (함수 필터)
  const hotSensors = findByProperty("sensors", (props) => (props.value as number) > 30);

  // Feature 삭제
  removeFeature("sensors", "sensor-001");

  // 그룹 전체 삭제
  clearGroup("sensors");
}
```

#### Feature Store API

| 메서드                                      | 설명                       |
| ------------------------------------------- | -------------------------- |
| `addFeature(groupId, featureId, options)`   | Feature 추가 → Entity 반환 |
| `removeFeature(groupId, featureId)`         | Feature 삭제               |
| `getFeature(groupId, featureId)`            | ID로 조회                  |
| `hasFeature(groupId, featureId)`            | 존재 여부                  |
| `updatePosition(groupId, featureId, coord)` | 위치 업데이트              |
| `findByProperty(groupId, filter)`           | 그룹 내 속성 검색          |
| `findAllByProperty(filter)`                 | 전체 속성 검색             |
| `getGroup(groupId)`                         | 그룹 조회                  |
| `clearGroup(groupId)`                       | 그룹 내 Feature 제거       |
| `removeGroup(groupId)`                      | 그룹 삭제                  |
| `getGroupIds()`                             | 그룹 ID 목록               |
| `getFeatureCount(groupId?)`                 | Feature 개수               |
| `clearAll()`                                | 전체 삭제                  |

## Store 구조

```
useMapStore      - Viewer 관리
├── viewer       - Cesium Viewer 인스턴스
├── setViewer()  - Viewer 설정
└── getViewer()  - Viewer 조회

useCameraStore   - 카메라 제어
├── cameraPosition - 현재 카메라 위치
├── flyTo()        - 좌표로 이동
├── lookAt()       - 대상 바라보기 (좌표 or Feature)
├── setView()      - 즉시 설정
└── zoomTo()       - 영역/다중 대상 맞춤 보기

useFeatureStore  - Entity 관리
├── groups       - 그룹별 Entity 관리
└── CRUD + 검색 메서드
```

## 타입 정의

```typescript
// 좌표
interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

// Feature 참조 (lookAt, zoomTo에서 사용)
interface FeatureRef {
  groupId: string;
  featureId: string;
}

// Feature 옵션
interface FeatureOptions {
  position: Coordinate;
  properties?: Record<string, unknown>;
}

// Property 필터
type PropertyFilter = Record<string, unknown> | ((properties: Record<string, unknown>) => boolean);

// Camera - flyTo
interface FlyToOptions {
  longitude: number;
  latitude: number;
  height?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

// Camera - lookAt (좌표 기반)
interface LookAtCoordinateOptions {
  longitude: number;
  latitude: number;
  height?: number;
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

// Camera - lookAt (Feature 기반)
interface LookAtFeatureOptions {
  feature: FeatureRef;
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

type LookAtOptions = LookAtCoordinateOptions | LookAtFeatureOptions;

// Camera - zoomTo
type ZoomToOptions =
  | { coordinates: Coordinate[]; heading?: number; pitch?: number; duration?: number }
  | { features: FeatureRef[]; heading?: number; pitch?: number; duration?: number }
  | { groupId: string; heading?: number; pitch?: number; duration?: number }
  | { boundary: string; heading?: number; pitch?: number; duration?: number }; // WKT Polygon
```

## License

MIT
