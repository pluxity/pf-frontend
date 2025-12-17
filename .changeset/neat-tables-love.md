---
"@pf-dev/ui": minor
---

TreeView label/render 분리로 유연성 개선

- TreeNode 인터페이스: label?: string, render?: ReactNode 추가
- render 우선순위 렌더링 로직으로 복잡한 UI 표현 가능
- aria-label 타입 체크로 접근성 강화
- Badge, 상태 표시, 검색 하이라이트 등 다양한 사용 예시 추가
