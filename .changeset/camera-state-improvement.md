---
"@pf-dev/three": minor
---

## Breaking Changes

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
