---
"@pf-dev/three": minor
---

@pf-dev/three v0.2.0: 완전한 독립형 3D 패키지

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
