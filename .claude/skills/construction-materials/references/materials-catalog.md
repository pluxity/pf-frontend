# 구조재 PBR 프리셋 카탈로그

`@pf-dev/three`의 `materialPresets` API와 함께 사용하는 구조재별 PBR 프리셋 값 모음.

---

## 1. 콘크리트 (Concrete)

### 1-1. 일반 콘크리트

```tsx
{ pattern: /concrete/i, preset: { color: 0xb0b0b0, metalness: 0.0, roughness: 0.85, envMapIntensity: 0.3 } }
```

### 1-2. 노출 콘크리트

```tsx
{ pattern: /exposed.*concrete/i, preset: { color: 0xa0a0a0, metalness: 0.0, roughness: 0.9, envMapIntensity: 0.2 } }
```

normalMap 함께 사용 시 거푸집 이음새와 기포 자국 표현 효과적.

### 1-3. 폴리싱 콘크리트 (MeshPhysicalMaterial 권장)

```typescript
new THREE.MeshPhysicalMaterial({
  color: 0xc0c0c0,
  metalness: 0.0,
  roughness: 0.25,
  envMapIntensity: 0.8,
  clearcoat: 0.3,
  clearcoatRoughness: 0.2,
});
```

---

## 2. 철근 (Rebar)

### 2-1. 신품 철근

```tsx
{ pattern: /rebar|steel_bar/i, preset: { color: 0x4a4a4a, metalness: 0.85, roughness: 0.35, envMapIntensity: 0.6 } }
```

### 2-2. 녹슨 철근

```tsx
{ pattern: /rusted.*rebar/i, preset: { color: 0x8b4513, metalness: 0.4, roughness: 0.85, envMapIntensity: 0.2 } }
```

녹 정도: `color`를 `#8b4513`(심한)~`#5a5a5a`(약간) 사이로 lerp, `roughness`도 `0.5~0.85` 범위 조절.

### 2-3. 에폭시 도장 철근

```tsx
{ pattern: /epoxy.*rebar/i, preset: { color: 0x2e8b57, metalness: 0.3, roughness: 0.4, envMapIntensity: 0.5 } }
```

---

## 3. 철골 (Structural Steel)

### 3-1. 무도장 철골

```tsx
{ pattern: /steel|beam|column/i, preset: { color: 0x708090, metalness: 0.9, roughness: 0.3, envMapIntensity: 0.8 } }
```

### 3-2. 내화도장 철골

```tsx
{ pattern: /fireproof/i, preset: { color: 0xe8e8e8, metalness: 0.0, roughness: 0.7, envMapIntensity: 0.3 } }
```

### 3-3. 녹방지 도장 (프라이머)

```tsx
{ pattern: /primer/i, preset: { color: 0xcc3333, metalness: 0.1, roughness: 0.55, envMapIntensity: 0.4 } }
```

### 3-4. 마감 도장

```tsx
{ pattern: /finish.*steel/i, preset: { color: 0x336699, metalness: 0.15, roughness: 0.4, envMapIntensity: 0.5 } }
```

---

## 4. 거푸집 (Formwork)

### 4-1. 합판 거푸집

```tsx
{ pattern: /plywood|formwork/i, preset: { color: 0xc4a06a, metalness: 0.0, roughness: 0.75, envMapIntensity: 0.2 } }
```

### 4-2. 유로폼

```tsx
{ pattern: /euroform/i, preset: { color: 0x2d5a27, metalness: 0.05, roughness: 0.5, envMapIntensity: 0.3 } }
```

### 4-3. 시스템 거푸집 (알루미늄)

```tsx
{ pattern: /system.*form|aluminum/i, preset: { color: 0xc0c0c0, metalness: 0.8, roughness: 0.35, envMapIntensity: 0.7 } }
```

---

## 5. 시멘트 / 모르타르

### 5-1. 건조

```tsx
{ pattern: /dry.*mortar|cement/i, preset: { color: 0xc8c0b8, metalness: 0.0, roughness: 0.9, envMapIntensity: 0.15 } }
```

### 5-2. 습윤

```tsx
{ pattern: /wet.*mortar/i, preset: { color: 0x807870, metalness: 0.0, roughness: 0.5, envMapIntensity: 0.4 } }
```

---

## 6. 흙 / 토공 (보조)

| 재질 | color     | roughness |
| ---- | --------- | --------- |
| 점토 | `#a0724a` | 0.95      |
| 모래 | `#d2b48c` | 0.92      |
| 자갈 | `#808080` | 0.88      |

---

## 통합 프리셋 예시

```tsx
import type { MaterialPresetsConfig } from "@pf-dev/three";

const constructionPresets: MaterialPresetsConfig = {
  rules: [
    {
      pattern: /concrete/i,
      preset: { color: 0xb0b0b0, metalness: 0.0, roughness: 0.85, envMapIntensity: 0.3 },
    },
    {
      pattern: /rebar|steel_bar/i,
      preset: { color: 0x4a4a4a, metalness: 0.85, roughness: 0.35, envMapIntensity: 0.6 },
    },
    {
      pattern: /steel|beam|column/i,
      preset: { color: 0x708090, metalness: 0.9, roughness: 0.3, envMapIntensity: 0.8 },
    },
    {
      pattern: /formwork|plywood/i,
      preset: { color: 0xc4a06a, metalness: 0.0, roughness: 0.75, envMapIntensity: 0.2 },
    },
    { pattern: /safetynet/i, preset: { roughness: 1.0, transparent: true, opacity: 0.45 } },
  ],
  default: { roughness: 1.0, metalness: 0.0 },
};
```
