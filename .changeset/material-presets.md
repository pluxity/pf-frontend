---
"@pf-dev/three": patch
---

Material 이름 패턴 기반 PBR 프리셋 시스템 추가

- `MaterialPreset`, `MaterialPresetRule`, `MaterialPresetsConfig` 타입 정의
- `applyMaterialPresets`, `findMatchingPreset` 유틸리티 함수 구현
- `GLTFModel`, `FBXModel`에 `materialPresets` prop 추가

MeshOutline 호버 표현 개선

- 일반 Mesh 호버 시 material 색상 변경 → EdgesGeometry 기반 아웃라인으로 변경
- 기본 outlineColor 더 진하게 조정 (`#00ff00` → `#00cc44`)
