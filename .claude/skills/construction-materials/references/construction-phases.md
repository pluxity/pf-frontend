# 시공 단계별 재질 상태 변화 가이드

---

## 단계 개요

```
거푸집 설치 → 철근 배근 → 콘크리트 타설 → 양생 → 양생 완료 → 마감 → 풍화/노후
```

---

## 1. 거푸집 설치

```tsx
{ pattern: /formwork/i, preset: { color: 0x2d5a27, metalness: 0.05, roughness: 0.5, envMapIntensity: 0.3 } }
```

내부 철근 표시 시 거푸집 반투명 처리:

```tsx
{ pattern: /formwork/i, preset: { color: 0x2d5a27, roughness: 0.5, transparent: true, opacity: 0.3 } }
```

---

## 2. 콘크리트 타설 직후

```tsx
{ pattern: /fresh.*concrete/i, preset: { color: 0x606060, metalness: 0.0, roughness: 0.3, envMapIntensity: 0.6 } }
```

---

## 3. 양생 중 - 보간 함수

```typescript
import * as THREE from "three";

function getCuringMaterial(progress: number): MaterialPreset {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const freshColor = new THREE.Color(0x606060);
  const curedColor = new THREE.Color(0xb0b0b0);
  const color = freshColor.clone().lerp(curedColor, p);

  return {
    color: color.getHex(),
    metalness: 0.0,
    roughness: THREE.MathUtils.lerp(0.3, 0.85, p),
    envMapIntensity: THREE.MathUtils.lerp(0.6, 0.3, p),
  };
}
```

---

## 4. 양생 완료

```tsx
{ pattern: /concrete/i, preset: { color: 0xb0b0b0, metalness: 0.0, roughness: 0.85, envMapIntensity: 0.3 } }
```

---

## 5. 풍화 / 노후 - 보간 함수

```typescript
function getWeatheredMaterial(weathering: number): MaterialPreset {
  const w = THREE.MathUtils.clamp(weathering, 0, 1);
  const freshColor = new THREE.Color(0xb0b0b0);
  const weatheredColor = new THREE.Color(0x787068);
  const color = freshColor.clone().lerp(weatheredColor, w);

  return {
    color: color.getHex(),
    metalness: 0.0,
    roughness: THREE.MathUtils.lerp(0.85, 0.95, w),
    envMapIntensity: THREE.MathUtils.lerp(0.3, 0.1, w),
  };
}
```

---

## 6. 시공 진행률 시각화 (opacity)

```typescript
import type { MaterialPreset } from "@pf-dev/three";

function getStatusPreset(
  base: MaterialPreset,
  status: "planned" | "in_progress" | "completed"
): MaterialPreset {
  switch (status) {
    case "planned":
      return { ...base, transparent: true, opacity: 0.15, depthWrite: false };
    case "in_progress":
      return { ...base, transparent: true, opacity: 0.6, color: 0xffa500 };
    case "completed":
      return { ...base, transparent: false, opacity: 1.0 };
  }
}
```

---

## 단계별 속성 변화 요약

| 단계        | color     | roughness | envMapIntensity |
| ----------- | --------- | --------- | --------------- |
| 거푸집      | `#2d5a27` | 0.50      | 0.3             |
| 타설 직후   | `#606060` | 0.30      | 0.6             |
| 양생 3일    | `#747474` | 0.46      | 0.52            |
| 양생 7일    | `#838383` | 0.56      | 0.47            |
| 양생 14일   | `#969696` | 0.67      | 0.40            |
| 양생 완료   | `#b0b0b0` | 0.85      | 0.3             |
| 경미한 풍화 | `#989088` | 0.92      | 0.2             |
| 심한 풍화   | `#787068` | 0.95      | 0.1             |
