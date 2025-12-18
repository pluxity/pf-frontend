---
"@pf-dev/three": minor
---

Canvas 컴포넌트 구현

- @react-three/fiber Canvas를 래핑하는 Canvas 컴포넌트 추가
- background, lighting, grid props 제공으로 간소화된 API 제공
- SceneLighting 내부 컴포넌트: default/studio/outdoor 프리셋 지원
- SceneGrid 내부 컴포넌트: drei의 Grid 래핑
- camera prop 병합: 기본값과 사용자 설정 병합으로 사용 편의성 향상
- SceneGridProps에 sectionColor 추가: 그리드 섹션 색상 커스터마이징 지원
