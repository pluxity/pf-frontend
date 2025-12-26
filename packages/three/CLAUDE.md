# @pf-dev/three 패키지 컨텍스트

## 패키지 개요

Three.js 기반 3D 뷰어 패키지. React Three Fiber와 함께 사용.

## 현재 작업: v0.4.0 EPIC (PR #72)

### 브랜치

- EPIC 브랜치: `epic/pf-devthree-v040`
- 머지 대상: `main`

### 주요 변경사항

#### #64 - CameraControls 삭제

- `CameraControls` 컴포넌트 삭제됨
- `@react-three/drei`의 `OrbitControls` 직접 사용

#### #65 - CameraState 타입 개선

- `CameraPosition` → `CameraState` 타입명 변경
- `rotation: [number, number, number]` 추가
- `target`은 optional

#### #66 - useCameraStore 개선

- `useCameraSync` 훅 추가 - Canvas 내부에서 카메라/컨트롤 동기화
- `setState(state, animate?)` - 실제 카메라 이동 (애니메이션 지원)
- `getState()` - 실제 카메라 상태 반환

#### #67 - lookAtFeature 기능

- `lookAtFeature(featureId, options?)` - 특정 Feature 바라보기
- options: `{ distance, animate, duration }`

## 테스트 앱 구성

### 필요한 의존성

```json
{
  "dependencies": {
    "@pf-dev/three": "workspace:*",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.160.x",
    "react": "^18.x"
  }
}
```

### 기본 테스트 구조

```tsx
import {
  Canvas,
  useCameraSync,
  useCameraStore,
  useAssetStore,
  useFeatureStore,
} from "@pf-dev/three";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function Scene() {
  const controlsRef = useRef<OrbitControls>(null);
  useCameraSync(controlsRef);

  return (
    <>
      <OrbitControls ref={controlsRef} makeDefault />
      {/* 테스트할 3D 오브젝트 */}
    </>
  );
}

function App() {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  );
}
```

## 테스트 항목 체크리스트

### #64 - CameraControls 삭제

- [ ] Canvas 컴포넌트의 controls prop 정상 작동
- [ ] OrbitControls 기본값 (enableDamping, dampingFactor) 정상 적용

### #65 - CameraState 타입 개선

- [ ] CameraState 타입 사용 가능
- [ ] rotation 필드 정상 동작
- [ ] target optional 동작 확인

### #66 - useCameraStore 개선

- [ ] useCameraSync 훅 정상 동작
- [ ] getState()가 실제 카메라 상태 반환
- [ ] setState()로 실제 카메라 이동
- [ ] setState(state, true)로 애니메이션 이동 (position, rotation, target)
- [ ] OrbitControls target 동기화

### #67 - lookAtFeature 기능

- [ ] lookAtFeature()로 Feature 바라보기
- [ ] distance 옵션 정상 동작
- [ ] animate 옵션 정상 동작

## 핵심 파일 위치

### 스토어

- `src/store/cameraStore.ts` - 카메라 상태 관리
- `src/store/assetStore.ts` - Asset(3D 모델) 관리
- `src/store/featureStore.ts` - Feature(배치된 인스턴스) 관리
- `src/store/facilityStore.ts` - Facility(시설) 관리

### 훅

- `src/hooks/useCameraSync.ts` - 카메라 동기화

### 타입

- `src/types/camera.ts` - CameraState, LookAtFeatureOptions 등
- `src/types/feature.ts` - Asset, Feature 타입

### 초기화

- `src/initialize.ts` - initializeScene() 함수

## 테스트 시나리오 예시

### 1. 카메라 상태 확인

```tsx
const cameraState = useCameraStore.getState().getState();
console.log(cameraState); // { position: [...], rotation: [...], target: [...] }
```

### 2. 카메라 이동 (즉시)

```tsx
useCameraStore.getState().setState({
  position: [10, 10, 10],
  target: [0, 0, 0],
});
```

### 3. 카메라 이동 (애니메이션)

```tsx
useCameraStore.getState().setState(
  {
    position: [10, 10, 10],
    target: [0, 0, 0],
  },
  true
); // animate = true
```

### 4. Feature 바라보기

```tsx
// Feature 등록 필요
useFeatureStore.getState().addFeature({
  id: "feature-1",
  assetId: "asset-1",
  position: [5, 0, 5],
  rotation: [0, 0, 0],
  scale: 1,
});

// Feature 바라보기
useCameraStore.getState().lookAtFeature("feature-1", {
  distance: 15,
  animate: true,
  duration: 1000,
});
```

## 문서

- `HOW_TO_USE.md` - 상세 사용법
- `README.md` - 패키지 소개
