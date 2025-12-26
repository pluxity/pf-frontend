---
"@pf-dev/three": minor
---

## Breaking Changes

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
