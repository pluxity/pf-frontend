# @pf-dev/three

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
