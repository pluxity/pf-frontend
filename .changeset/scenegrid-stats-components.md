---
"@pf-dev/three": minor
---

SceneGrid 및 Stats 컴포넌트 독립 분리

- SceneGrid 독립 컴포넌트로 분리: Canvas 내부에서 독립 파일로 추출
- SceneGrid 방어 코드 추가: divisions가 0 또는 음수일 때 안전하게 처리
- Stats 컴포넌트 재export: @react-three/drei의 Stats를 재export하여 편리하게 사용
- SceneGrid, Stats 컴포넌트를 Canvas와 독립적으로 사용 가능
