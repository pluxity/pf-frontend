---
"@pf-dev/three": minor
---

## New Features

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
