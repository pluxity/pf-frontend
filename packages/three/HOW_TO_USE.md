# @pf-dev/three 사용 가이드

**완전한 독립형 React Three Fiber 3D 시각화 패키지**

`@pf-dev/three`만 설치하면 `@react-three/fiber`와 `@react-three/drei`를 별도로 설치하지 않아도 3D 앱을 개발할 수 있습니다.

## ✨ v0.3.0 주요 기능

### 🚀 씬 초기화 (NEW)

- ✅ **initializeScene** - Promise 기반 씬 초기화 API
- ✅ **addAssets** - 여러 Asset 배치 등록 및 병렬 로드
- ✅ **addFeatures** - 여러 Feature 배치 등록 (Asset 로드 상태 검증)

### 🎨 렌더링 컴포넌트

- ✅ **Canvas** - WebGL 렌더러와 기본 씬 설정 제공 (OrbitControls 내장)
- ✅ **SceneLighting** - 조명 프리셋 시스템 (default/studio/outdoor)
- ✅ **SceneGrid** - 바닥 그리드 헬퍼
- ✅ **Stats** - FPS 및 메모리 모니터링

### 🏗️ 모델 로딩

- ✅ **GLTFModel** - GLTF/GLB 로더 컴포넌트
- ✅ **FBXModel** - FBX 로더 컴포넌트

### 🎯 고급 기능

- ✅ **Feature Domain** - GPU Instancing으로 수천 개 인스턴스 최적 렌더링
- ✅ **메시 인터랙션** - Hover 감지, 아웃라인, 메시 정보
- ✅ **상태 관리** - Zustand 기반 Facility/Asset/Feature Store
- ✅ **CSS2D 오버레이** - HTML 오버레이 지원
- ✅ **유틸리티** - Traverse, Raycast, Mesh 찾기, 메모리 관리

## 🚀 빠른 시작

### 기본 사용

```tsx
import { Canvas, GLTFModel } from "@pf-dev/three";

function App() {
  return (
    <Canvas lighting="default" grid>
      <GLTFModel url="/model.glb" castShadow receiveShadow />
    </Canvas>
  );
}
```

단 **4줄**로 3D 씬 완성! (Canvas에 OrbitControls 기본 포함)

### Before & After

**Before (v0.1.0)** - 많은 보일러플레이트:

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { GLTFModel } from "@pf-dev/three";

function App() {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 75 }}>
      <color attach="background" args={["#1a1a1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Grid args={[100, 100]} cellSize={1} />
      <GLTFModel url="/model.glb" />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
```

**After (v0.4.0)** - 간결한 코드:

```tsx
import { Canvas, GLTFModel } from "@pf-dev/three";

function App() {
  return (
    <Canvas lighting="default" grid>
      <GLTFModel url="/model.glb" />
    </Canvas>
  );
}
```

**개선점:**

- ✅ 외부 패키지 직접 설치 불필요
- ✅ 보일러플레이트 코드 80% 감소
- ✅ 합리적인 기본값 제공
- ✅ 일관된 API

## 📖 주요 컴포넌트

### Canvas

WebGL 렌더러와 기본 씬 설정을 제공하는 메인 컴포넌트입니다.

```tsx
<Canvas
  lighting="studio" // 조명 프리셋: default | studio | outdoor | false
  grid // 그리드 표시: boolean | SceneGridProps
  background="#000000" // 배경색
  camera={{ fov: 50 }} // 카메라 설정
  controls={{ maxDistance: 100 }} // 카메라 컨트롤 설정
>
  {/* children */}
</Canvas>
```

**Props:**

- `lighting?: "default" | "studio" | "outdoor" | false` - 조명 프리셋 (기본값: "default")
- `grid?: boolean | SceneGridProps` - 그리드 표시 (기본값: false)
- `background?: string | null` - 배경색 (기본값: "#1a1a1a")
- `camera?: { position?, fov? }` - 카메라 설정
- `controls?: boolean | OrbitControlsProps` - 카메라 컨트롤 (기본값: true, OrbitControls 사용)

### SceneLighting

씬 조명을 설정하는 컴포넌트입니다. 프리셋 또는 세밀한 커스터마이징이 가능합니다.

```tsx
// 프리셋 사용
<SceneLighting preset="studio" />

// 커스터마이징
<SceneLighting
  preset="default"
  ambient={0.3}
  directional={{ intensity: 2, castShadow: true }}
/>
```

**프리셋:**

- `default` - 일반적인 실내 조명
- `studio` - 스튜디오 조명 (다중 조명, 그림자)
- `outdoor` - 야외 조명 (강한 directional, 그림자)

### SceneGrid

바닥 그리드를 표시하는 헬퍼 컴포넌트입니다.

```tsx
<SceneGrid size={200} divisions={50} color="#ff0000" />
```

**Props:**

- `size?: number` - 그리드 크기 (기본값: 100)
- `divisions?: number` - 분할 수 (기본값: 100)
- `color?: string` - 그리드 색상 (기본값: "#6b7280")
- `sectionColor?: string` - 섹션 색상 (기본값: color와 동일)

### GLTFModel / FBXModel

3D 모델 로딩 컴포넌트입니다.

```tsx
<GLTFModel
  url="/model.glb"
  position={[0, 0, 0]}
  rotation={[0, Math.PI / 2, 0]}
  scale={1}
  castShadow
  receiveShadow
  onLoaded={(gltf) => console.log("Loaded", gltf)}
/>
```

**Props:**

- `url: string` - 모델 URL
- `position?: [number, number, number]` - 위치
- `rotation?: [number, number, number]` - 회전
- `scale?: number | [number, number, number]` - 스케일
- `castShadow?: boolean` - 그림자 투사 (기본값: false)
- `receiveShadow?: boolean` - 그림자 수신 (기본값: false)
- `onLoaded?: (gltf) => void` - 로드 완료 콜백

### Stats

FPS 및 메모리 사용량을 모니터링하는 개발 도구입니다.

```tsx
<Canvas>
  <Stats />
  {/* ... */}
</Canvas>
```

## 🚀 initializeScene (v0.3.0)

Promise 기반의 씬 초기화 API로 Asset, Feature, Facility 데이터 로드 순서를 보장합니다.

### 기본 사용

```tsx
import { Canvas, GLTFModel, FeatureRenderer, initializeScene } from "@pf-dev/three";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await initializeScene({
        assets: fetchAssets(), // Promise<Asset[]>
        features: fetchFeatures(), // Promise<Feature[]>
      });
      setIsLoading(false);
    }
    init();
  }, []);

  return (
    <Canvas>
      <GLTFModel url="/building.glb" />
      <FeatureRenderer />
    </Canvas>
  );
}
```

### 초기화 순서

1. **Assets 등록 + 병렬 로드** - `addAssets`로 여러 Asset을 한 번에 등록하고 로드 완료까지 대기
2. **Features 등록** - Asset 로드 완료 후 Feature 등록 (Asset 존재 여부 검증)
3. **Facility 등록** (선택) - 건물/시설 데이터 등록

### 특징

- ✅ Asset 로드 완료 후 Feature 등록 보장
- ✅ 중복 Asset/Feature 자동 필터링
- ✅ 잘못된 입력 타입 검증 및 경고
- ✅ 로드 실패 시 경고 후 계속 진행

## 🎯 Feature Domain (대량 인스턴스 렌더링)

동일한 3D 모델을 수천 개 인스턴스로 렌더링할 때 GPU Instancing을 사용하는 최적화된 아키텍처입니다.

### 개념

- **Asset**: 3D 모델 파일 자체 (CCTV, Fan, AC 등)
- **Feature**: Asset의 인스턴스 (위치, 회전, 스케일 포함)
- **1:N 관계**: 하나의 Asset → 여러 Feature
- **GPU Instancing**: 동일 Asset의 모든 Feature를 단일 Draw Call로 렌더링

### 사용 예시 (v0.3.0 권장)

```tsx
import { Canvas, GLTFModel, FeatureRenderer, initializeScene } from "@pf-dev/three";

// API에서 데이터 가져오기
async function fetchAssets(): Promise<Asset[]> {
  const response = await fetch("/api/assets");
  return response.json();
}

async function fetchFeatures(): Promise<Feature[]> {
  const response = await fetch("/api/features");
  return response.json();
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await initializeScene({
        assets: fetchAssets(),
        features: fetchFeatures(),
      });
      setIsLoading(false);
    }
    init();
  }, []);

  return (
    <Canvas lighting="studio" grid>
      {/* 건물 모델 */}
      <GLTFModel url="/building.glb" />

      {/* Feature 인스턴스 렌더링 (GPU Instancing) */}
      <FeatureRenderer />
    </Canvas>
  );
}
```

**성능:**

- 수천 개의 Feature를 60fps로 렌더링 가능
- Geometry와 Material은 Asset당 1회만 로드
- 단일 Draw Call로 렌더링

## 🎨 메시 인터랙션

Hover 감지, 아웃라인, 메시 정보 표시 기능을 제공합니다.

```tsx
import { Canvas, GLTFModel, MeshOutline, useMeshHover, useInteractionStore } from "@pf-dev/three";

function InteractiveScene() {
  const facility = useFacilityStore((s) => s.getFacility("building"));
  const meshInfo = useInteractionStore((s) => s.getHoveredMeshInfo());

  useMeshHover(facility?.object ? [facility.object] : null, {
    enabled: true,
    recursive: true,
  });

  return (
    <>
      <Canvas>
        {facility?.object && <primitive object={facility.object} />}
        <MeshOutline />
      </Canvas>

      {meshInfo && (
        <div>
          <div>Name: {meshInfo.name}</div>
          <div>Position: {meshInfo.position.join(", ")}</div>
          <div>Vertices: {meshInfo.vertices}</div>
        </div>
      )}
    </>
  );
}
```

## 📷 카메라 상태 관리 (v0.4.0)

실제 Three.js 카메라와 동기화된 상태 관리를 제공합니다.

### 설정 (필수)

Canvas 내부에서 `useCameraSync` 훅을 사용해야 합니다:

```tsx
import { useRef } from "react";
import { Canvas, useCameraSync } from "@pf-dev/three";
import { OrbitControls } from "@react-three/drei";

function Scene() {
  const controlsRef = useRef<OrbitControls>(null);
  useCameraSync(controlsRef); // 카메라 스토어와 실제 카메라 동기화
  return <OrbitControls ref={controlsRef} makeDefault />;
}
```

### CameraState 타입

```typescript
interface CameraState {
  position: [number, number, number]; // 카메라 위치
  rotation: [number, number, number]; // 카메라 회전 (Euler angles)
  target?: [number, number, number]; // OrbitControls 타겟 (optional)
}
```

### 카메라 제어

```tsx
import { useCameraStore } from "@pf-dev/three";

// 현재 카메라 상태 조회 (실제 카메라에서 읽어옴)
const state = useCameraStore.getState().getState();

// 카메라 즉시 이동
useCameraStore.getState().setState({ position: [10, 5, 10], target: [0, 0, 0] });

// 카메라 애니메이션 이동
useCameraStore.getState().setState({ position: [20, 10, 20] }, true);
```

### 상태 저장/복원 (앱 레벨 구현)

```tsx
// 저장
const state = useCameraStore.getState().getState();
localStorage.setItem("viewpoint-1", JSON.stringify(state));

// 복원
const saved = JSON.parse(localStorage.getItem("viewpoint-1") || "null");
if (saved) useCameraStore.getState().setState(saved);
```

## 🏷️ Mesh UserData 활용

Three.js의 모든 Mesh는 `userData` 속성을 제공합니다. 이를 통해 3D 모델에 사용자 정의 데이터를 저장하고 활용할 수 있습니다.

### 기본 사용

```tsx
import { useGLTFLoader } from "@pf-dev/three";

function MyScene() {
  const { scene } = useGLTFLoader("/building.glb", {
    onLoaded: (gltf) => {
      gltf.scene.traverse((child) => {
        // CCTV 메시에 센서 정보 저장
        if (child.name.includes("CCTV")) {
          child.userData = {
            type: "sensor",
            sensorId: child.name,
            status: "active",
          };
        }

        // 방 메시에 공간 정보 저장
        if (child.name.includes("Room")) {
          child.userData = {
            type: "room",
            roomNumber: child.name.match(/\d+/)?.[0],
            capacity: 20,
            occupied: false,
          };
        }
      });
    },
  });

  return scene ? <primitive object={scene} /> : null;
}
```

### 활용 시나리오

**건물 층 정보**:

```typescript
mesh.userData = {
  floor: 3,
  type: "office",
  area: 500,
  departments: ["IT", "HR"],
};
```

**센서/IoT 장비 정보**:

```typescript
mesh.userData = {
  type: "cctv",
  id: "CCTV-F3-001",
  status: "online",
  streamUrl: "rtsp://...",
};
```

**실내 공간 정보**:

```typescript
mesh.userData = {
  type: "room",
  roomId: "R-301",
  capacity: 20,
  occupied: true,
  equipment: ["projector", "whiteboard"],
};
```

## 📚 API 참조

### Functions (v0.3.0)

- `initializeScene(options)` - Promise 기반 씬 초기화 API
  - `options.assets: Promise<Asset[]>` - Asset 데이터
  - `options.features: Promise<Feature[]>` - Feature 데이터
  - `options.facility?: Promise<Facility>` - Facility 데이터 (선택)

### Components

- `<Canvas />` - WebGL 렌더러
- `<SceneLighting />` - 조명 프리셋
- `<SceneGrid />` - 바닥 그리드
- `<Stats />` - FPS 모니터
- `<GLTFModel />` - GLTF/GLB 로더
- `<FBXModel />` - FBX 로더
- `<FeatureRenderer />` - Feature 인스턴스 렌더링
- `<MeshOutline />` - 메시 하이라이트
- `<CSS2DOverlay />` - HTML 오버레이

### Stores

- `useFacilityStore` - 건물/시설 상태 관리
- `useAssetStore` - Asset 관리
  - `addAssets(assets[])` - 배치 등록 + 병렬 로드 (v0.3.0)
- `useFeatureStore` - Feature 관리
  - `addFeatures(features[])` - 배치 등록 (Asset 검증 포함, v0.3.0)
- `useCameraStore` - 카메라 상태 관리 (v0.4.0 개선)
  - `getState()` - 현재 카메라 상태 조회 (실제 카메라에서 읽어옴)
  - `setState(state, animate?)` - 카메라 상태 설정 (실제 카메라 이동)
  - `updateConfig(config)` - 카메라 설정 업데이트
- `useInteractionStore` - 인터랙션 상태 관리

### Hooks

- `useAssetLoader(assets)` - Asset 로딩
- `useCameraSync(controlsRef?)` - 카메라 스토어와 실제 카메라 동기화 (v0.4.0)
- `useMeshHover(targets, options)` - Mesh 호버 감지
- `useModelTraverse(object, callback)` - 모델 순회
- `useRaycast(pointer, options)` - 레이캐스팅
- `useMeshFinder(object, predicate)` - Mesh 찾기

### Utils

- `traverseModel(object, callback)` - 모델 순회
- `disposeScene(object)` - Scene 메모리 정리
- `findMeshByName(object, name)` - 이름으로 Mesh 찾기
- `getMeshInfo(mesh)` - Mesh 정보 추출
- `computeBoundingBox(object)` - BoundingBox 계산
- `cloneMaterial(material)` - Material 복제

## 📝 라이선스

MIT
