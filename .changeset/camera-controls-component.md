---
"@pf-dev/three": minor
---

CameraControls 컴포넌트 구현 및 Canvas API 개선

- CameraControls 컴포넌트 추가: OrbitControls를 래핑하여 합리적인 기본값 제공
- Canvas의 controls prop 개선: boolean뿐만 아니라 CameraControlsProps 객체도 지원
- 사용 편의성 향상: `<Canvas controls={{ minDistance: 5 }}>` 형태로 직접 커스터마이징 가능
- 기본값: enableDamping(true), dampingFactor(0.05), minDistance(1), maxDistance(100)
