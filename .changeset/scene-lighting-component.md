---
"@pf-dev/three": minor
---

SceneLighting 컴포넌트 독립 분리 및 프리셋 시스템 구현

- SceneLighting 독립 컴포넌트로 분리: Canvas에서 독립적으로 사용 가능
- 3가지 조명 프리셋 구현: default, studio, outdoor
- ambient 조명 강도 커스터마이징 지원
- directional 조명 설정 커스터마이징 지원 (position, intensity, castShadow)
- Canvas 컴포넌트에 shadows prop 추가: 그림자 렌더링 지원
- useMemo를 활용한 성능 최적화
- 프리셋 설정을 상수로 분리하여 유지보수성 향상
