---
"@pf-dev/three": minor
---

## Breaking Changes

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
