---
"@pf-dev/ui": minor
---

ComboBox/Listbox Radix UI 전환 및 기능 개선

### 주요 변경사항

**ComboBox**

- HeadlessUI → Radix UI Popover 기반으로 전환
- `multiple` prop 추가로 다중 선택 지원
- 선택 시 토글 방식, 드롭다운 유지
- `useComboBox` 훅으로 검색어 접근 가능

**Listbox**

- HeadlessUI → Radix UI Select 기반으로 전환
- API 변경: `ListboxButton` → `ListboxTrigger`, `ListboxOptions` → `ListboxContent`

**의존성**

- `@headlessui/react` 제거

### 커서 UX 개선

- Button, Toggle, Checkbox, Radio, Chip: `cursor-pointer` 추가
- ComboBox, Listbox: Trigger/Item에 `cursor-pointer` 추가
- disabled 상태: `cursor-not-allowed` 일관 적용

### LoginCard

- `email` → `username`으로 변경
- `type="email"` → `type="text"`

### Breaking Changes

- Listbox API 변경 (ListboxButton → ListboxTrigger 등)
- LoginCard `onLoginSubmit` 콜백 타입 변경 (`email` → `username`)
