---
"@pf-dev/ui": patch
---

Carousel 네비게이션 화살표 버튼 개선

- `arrowVariant` prop 추가 (`"default"` | `"ghost"`) - ghost 모드에서 배경/그림자 없이 아이콘만 표시
- `arrowClassName` prop 추가 - 화살표 버튼에 커스텀 클래스 적용 (위치 조정 등)
- focus 스타일을 `focus-visible`로 변경 - 마우스 클릭 시 포커스 링 미표시, 키보드 네비게이션에서만 표시
