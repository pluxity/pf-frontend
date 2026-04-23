---
name: construction-materials
description: >
  Three.js/React Three Fiber 기반 건설현장 3D 시각화에서 구조재 재질(콘크리트, 철근, 철골, 거푸집, 시멘트 등)의
  PBR Material 프리셋과 시공 단계별 재질 상태 표현 가이드.
  건설현장 모델에 재질을 적용하거나, MeshStandardMaterial/MeshPhysicalMaterial 속성값을 설정하거나,
  콘크리트 타설/양생/풍화 등 시공 상태를 시각적으로 표현할 때 사용.
allowed-tools: Read, Write, Glob, Grep
---

# Construction Materials - 건설현장 구조재 재질 스킬

$ARGUMENTS 건설현장 3D 모델의 재질 적용 요청에 답변합니다.

---

## 트리거 조건

- 건설현장 3D 모델에 **재질(Material)을 적용**하는 작업
- **콘크리트, 철근, 철골, 거푸집** 등 구조재의 PBR 속성값 설정
- **시공 단계별** 재질 상태 변화 표현 (타설, 양생, 풍화 등)
- 건설 모델의 **텍스처 맵** 설정

---

## @pf-dev/three materialPresets API 활용

v0.4.1부터 `materialPresets` prop으로 선언적 재질 적용이 가능합니다:

```tsx
import { GLTFModel } from "@pf-dev/three";
import type { MaterialPresetsConfig } from "@pf-dev/three";

const presets: MaterialPresetsConfig = {
  rules: [
    { pattern: /concrete/i, preset: { roughness: 0.85, metalness: 0.0, envMapIntensity: 0.3 } },
    {
      pattern: /rebar|steel_bar/i,
      preset: { roughness: 0.35, metalness: 0.85, envMapIntensity: 0.6 },
    },
    { pattern: /steel|beam/i, preset: { roughness: 0.3, metalness: 0.9, envMapIntensity: 0.8 } },
  ],
  default: { roughness: 1.0, metalness: 0.0 },
};

<GLTFModel url="/model.glb" materialPresets={presets} />;
```

또는 유틸리티 직접 사용:

```tsx
import { applyMaterialPresets } from "@pf-dev/three";

applyMaterialPresets(scene, presets);
```

---

## Reference 파일 안내

- 재질 프리셋 값 → [`references/materials-catalog.md`](references/materials-catalog.md)
- 시공 상태별 표현 → [`references/construction-phases.md`](references/construction-phases.md)
- 텍스처 맵 설정 → [`references/texture-guide.md`](references/texture-guide.md)

---

## 빠른 참조 - 주요 재질 프리셋

| 재질                      | color     | metalness | roughness |
| ------------------------- | --------- | --------- | --------- |
| 일반 콘크리트             | `#b0b0b0` | 0.0       | 0.85      |
| 노출 콘크리트             | `#a0a0a0` | 0.0       | 0.9       |
| 폴리싱 콘크리트           | `#c0c0c0` | 0.0       | 0.25      |
| 신품 철근                 | `#4a4a4a` | 0.85      | 0.35      |
| 녹슨 철근                 | `#8b4513` | 0.4       | 0.85      |
| 무도장 철골               | `#708090` | 0.9       | 0.3       |
| 내화도장 철골             | `#e8e8e8` | 0.0       | 0.7       |
| 방청 도장 철골            | `#cc3333` | 0.1       | 0.55      |
| 합판 거푸집               | `#c4a06a` | 0.0       | 0.75      |
| 유로폼                    | `#2d5a27` | 0.05      | 0.5       |
| 시스템 거푸집             | `#c0c0c0` | 0.8       | 0.35      |
| 습윤 콘크리트 (타설 직후) | `#606060` | 0.0       | 0.3       |
