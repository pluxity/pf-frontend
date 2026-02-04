---
"@pf-dev/ui": minor
---

## 주요 변경사항

### React 19 패턴 적용

- `forwardRef` 완전 제거 (ref를 일반 prop으로 변경)
- 불필요한 메모이제이션 최적화 제거 (`useMemo`, `useCallback`, `memo`)

### 접근성 개선

- 모든 인터랙티브 요소에 ARIA 라벨 추가
- 포커스 링 스타일 통일 및 개선
- 애니메이션에 `prefers-reduced-motion` 지원

### Dark 모드 지원

- 전체 컴포넌트 Dark 모드 색상 추가
- Hex 색상을 CSS 변수로 전환

### 기타 개선

- Storybook 8 → 10 업그레이드
- Chevron 아이콘 시각적 개선
- README에 트리쉐이킹 가이드 추가
