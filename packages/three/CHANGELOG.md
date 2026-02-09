# @pf-dev/three

## 0.4.1

### Patch Changes

- 291ebb5: Material 이름 패턴 기반 PBR 프리셋 시스템 추가
  - `MaterialPreset`, `MaterialPresetRule`, `MaterialPresetsConfig` 타입 정의
  - `applyMaterialPresets`, `findMatchingPreset` 유틸리티 함수 구현
  - `GLTFModel`, `FBXModel`에 `materialPresets` prop 추가

  MeshOutline 호버 표현 개선
  - 일반 Mesh 호버 시 material 색상 변경 → EdgesGeometry 기반 아웃라인으로 변경
  - 기본 outlineColor 더 진하게 조정 (`#00ff00` → `#00cc44`)

## 0.4.0

### Minor Changes

- c449dd1: ## Breaking Changes

  ### CameraState 타입 개선

  `CameraPosition` 타입이 `CameraState`로 변경되고, 구조가 개선되었습니다.

  **변경사항:**
  - `rotation` 필드 추가 (Euler angles)
  - `target` 필드 optional로 변경
  - 기존 스토어 상태 타입이 `CameraStoreState`로 변경

  **마이그레이션 가이드:**

  ```tsx
  // Before
  import type { CameraPosition } from "@pf-dev/three";
  const camera: CameraPosition = {
    position: [0, 0, 10],
    target: [0, 0, 0],
  };

  // After
  import type { CameraState } from "@pf-dev/three";
  const camera: CameraState = {
    position: [0, 0, 10],
    rotation: [0, 0, 0],
    target: [0, 0, 0], // optional
  };
  ```

  **스토어 API 변경:**

  ```tsx
  // Before
  useCameraStore.getState().setPosition({ position, target });
  useCameraStore.getState().getPosition();

  // After (권장)
  useCameraStore.getState().setState({ position, rotation, target });
  useCameraStore.getState().getState();

  // 이전 API는 deprecated로 유지됨 (호환성)
  ```

- c449dd1: ## Breaking Changes

  ### useCameraStore 개선 - 실제 카메라와 동기화

  `useCameraStore`가 실제 Three.js 카메라와 동기화되도록 개선되었습니다.

  **삭제된 기능:**
  - `saveState(name)` - 앱 레벨에서 구현
  - `restoreState(name)` - 앱 레벨에서 구현
  - `clearState(name)` - 삭제
  - `getAllSavedStates()` - 삭제
  - `savedStates: Map` - 삭제

  **새로운 API:**

  ```tsx
  // Canvas 내부에서 useCameraSync 훅 사용 필수
  function Scene() {
    const controlsRef = useRef<OrbitControls>(null);
    useCameraSync(controlsRef);

    return <OrbitControls ref={controlsRef} />;
  }

  // 카메라 상태 조회 (실제 카메라에서 읽어옴)
  const state = useCameraStore.getState().getState();
  // { position: [x, y, z], rotation: [x, y, z], target: [x, y, z] }

  // 카메라 이동 (실제 카메라 이동)
  useCameraStore.getState().setState({ position: [10, 5, 10] });

  // 애니메이션 카메라 이동
  useCameraStore.getState().setState({ position: [10, 5, 10] }, true);
  ```

  **마이그레이션 가이드:**

  ```tsx
  // Before - 저장/복원은 스토어에서 처리
  useCameraStore.getState().saveState("viewpoint-1");
  useCameraStore.getState().restoreState("viewpoint-1");

  // After - 저장/복원은 앱 레벨에서 구현
  const state = useCameraStore.getState().getState();
  localStorage.setItem("viewpoint-1", JSON.stringify(state));

  try {
    const saved = JSON.parse(localStorage.getItem("viewpoint-1") || "null");
    if (saved) useCameraStore.getState().setState(saved);
  } catch (e) {
    console.error("카메라 상태 복원 중 오류 발생:", e);
  }
  ```

- c449dd1: ## New Features

  ### lookAtFeature 함수 추가

  특정 Feature를 바라보도록 카메라를 이동하는 `lookAtFeature()` 함수가 추가되었습니다.

  **API:**

  ```tsx
  useCameraStore.getState().lookAtFeature(featureId, options?);
  ```

  **Options:**
  - `distance?: number` - Feature로부터의 거리 (기본값: 10)
  - `animate?: boolean` - 애니메이션 여부 (기본값: true)
  - `duration?: number` - 애니메이션 시간 ms (기본값: 500)

  **사용 예시:**

  ```tsx
  // 기본 사용
  useCameraStore.getState().lookAtFeature("cctv-001");

  // 옵션 지정
  useCameraStore.getState().lookAtFeature("sensor-001", {
    distance: 15,
    animate: true,
    duration: 800,
  });

  // 즉시 이동 (애니메이션 없이)
  useCameraStore.getState().lookAtFeature("light-001", { animate: false });
  ```

  **사용 사례:**
  - 씬 실행 시 특정 CCTV/센서로 카메라 이동
  - 시설물 선택 시 해당 위치로 포커스
  - 가상순찰 시나리오에서 순차적 카메라 이동

- c449dd1: ## Breaking Changes

  ### CameraControls 컴포넌트 삭제

  `CameraControls` 컴포넌트가 삭제되었습니다. `@react-three/drei`의 `OrbitControls`를 직접 사용하세요.

  **마이그레이션 가이드:**

  ```tsx
  // Before
  import { CameraControls } from "@pf-dev/three";
  <CameraControls minDistance={5} maxDistance={50} />;

  // After
  import { OrbitControls } from "@react-three/drei";
  <OrbitControls makeDefault minDistance={5} maxDistance={50} enableDamping />;
  ```

  **Canvas 컴포넌트 변경사항:**
  - `controls` prop은 그대로 사용 가능 (내부적으로 OrbitControls 사용)
  - `CameraControlsProps` 타입 대신 `OrbitControls`의 props 사용

## 0.3.0

### Minor Changes

- 9587d8a: feat: initializeScene 함수 추가
  - Promise 기반 씬 초기화 API
  - Asset/Feature/Facility 순서 보장 로직 캡슐화
  - 앱 코드 단순화

- 9587d8a: feat(assetStore): addAssets 배치 API 추가
  - 여러 Asset을 한 번에 등록하고 로드 완료까지 대기
  - Promise.all로 병렬 로드
  - 로드 실패 시 console.warn + 계속 진행

### Patch Changes

- 9587d8a: feat(featureStore): Feature 등록 시 Asset 로드 상태 검증
  - addFeature/addFeatures에 Asset 존재 및 로드 완료 검증 추가
  - 검증 실패 시 console.warn + skip 처리

- 9587d8a: refactor(components): 역할별 하위 폴더 구조화
  - scene/: Canvas, SceneLighting, CameraControls
  - model/: GLTFModel, FBXModel, FeatureRenderer
  - debug/: MeshOutline, MeshInfo, SceneGrid, Stats
  - overlay/: CSS2DOverlay

## 0.2.0

### Minor Changes

- 71bb47f: CameraControls 컴포넌트 구현 및 Canvas API 개선
  - CameraControls 컴포넌트 추가: OrbitControls를 래핑하여 합리적인 기본값 제공
  - Canvas의 controls prop 개선: boolean뿐만 아니라 CameraControlsProps 객체도 지원
  - 사용 편의성 향상: `<Canvas controls={{ minDistance: 5 }}>` 형태로 직접 커스터마이징 가능
  - 기본값: enableDamping(true), dampingFactor(0.05), minDistance(1), maxDistance(100)

- 71bb47f: Canvas 컴포넌트 구현
  - @react-three/fiber Canvas를 래핑하는 Canvas 컴포넌트 추가
  - background, lighting, grid props 제공으로 간소화된 API 제공
  - SceneLighting 내부 컴포넌트: default/studio/outdoor 프리셋 지원
  - SceneGrid 내부 컴포넌트: drei의 Grid 래핑
  - camera prop 병합: 기본값과 사용자 설정 병합으로 사용 편의성 향상
  - SceneGridProps에 sectionColor 추가: 그리드 섹션 색상 커스터마이징 지원

- 71bb47f: SceneLighting 컴포넌트 독립 분리 및 프리셋 시스템 구현
  - SceneLighting 독립 컴포넌트로 분리: Canvas에서 독립적으로 사용 가능
  - 3가지 조명 프리셋 구현: default, studio, outdoor
  - ambient 조명 강도 커스터마이징 지원
  - directional 조명 설정 커스터마이징 지원 (position, intensity, castShadow)
  - Canvas 컴포넌트에 shadows prop 추가: 그림자 렌더링 지원
  - useMemo를 활용한 성능 최적화
  - 프리셋 설정을 상수로 분리하여 유지보수성 향상

- 71bb47f: SceneGrid 및 Stats 컴포넌트 독립 분리
  - SceneGrid 독립 컴포넌트로 분리: Canvas 내부에서 독립 파일로 추출
  - SceneGrid 방어 코드 추가: divisions가 0 또는 음수일 때 안전하게 처리
  - Stats 컴포넌트 재export: @react-three/drei의 Stats를 재export하여 편리하게 사용
  - SceneGrid, Stats 컴포넌트를 Canvas와 독립적으로 사용 가능

- 71bb47f: @pf-dev/three v0.2.0: 완전한 독립형 3D 패키지

  ## 새로운 기능

  ### 렌더링 컴포넌트
  - **Canvas**: WebGL 렌더러와 기본 씬 설정 제공 (lighting, grid, background, camera, controls props)
  - **SceneLighting**: 조명 프리셋 시스템 (default/studio/outdoor)
  - **CameraControls**: 카메라 컨트롤 (OrbitControls 래핑, maxDistance 기본값 500)
  - **SceneGrid**: 바닥 그리드 헬퍼
  - **Stats**: FPS 및 메모리 모니터링

  ### 모델 컴포넌트 개선
  - **GLTFModel/FBXModel**: castShadow, receiveShadow props 추가

  ### 문서화
  - README.md 간소화 및 HOW_TO_USE.md 분리
  - Before/After 비교 추가 (보일러플레이트 80% 감소)
  - 전체 API 문서화 완료

  ## 개선점
  - ✅ 외부 패키지 직접 설치 불필요 (@react-three/fiber, @react-three/drei)
  - ✅ 보일러플레이트 코드 80% 감소
  - ✅ 합리적인 기본값 제공
  - ✅ 일관된 API
  - ✅ Shadow 렌더링 최적화 (mapSize: 1024x1024)

## 0.1.0

### Release Notes

- 5d6b926: 마이너 버전 최초 배포
