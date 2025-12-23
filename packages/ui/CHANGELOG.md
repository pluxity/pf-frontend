# Changelog

## 1.1.0

### Minor Changes

- 0af0872: ComboBox/Listbox Radix UI 전환 및 기능 개선

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

- 0af0872: Composition Pattern으로 organism 컴포넌트 전환 (v1.1.0)

  **Breaking Changes**
  - 7개 organism 컴포넌트를 Composition Pattern으로 완전 전환
  - 기존 config-based API 제거 (역호환성 없음)

  **주요 변경사항**
  1. **Composition Pattern 구현**
     - FloatingMenu: Item, Separator, Group, Custom
     - Sidebar: Header, Footer, Section, Item, CollapseButton, Separator, Custom
     - NavigationBar: Item, Logo, Actions
     - Footer: Brand, Column, Link, SocialLinks, SocialLink, Copyright, Custom
     - Timeline: Item, Custom
     - Stepper: Step, Custom
     - NotificationCenter: Header, UnreadBadge, MarkAllRead, Item, Empty, Custom
  2. **접근성(a11y) 개선**
     - aria-labels 추가 (모든 interactive 요소)
     - 키보드 네비게이션 지원
     - `...props`를 interactive 요소로 이동
  3. **국제화(i18n) 지원**
     - `ariaLabelCollapse`, `ariaLabelExpand` props 추가
     - 기본값: 한국어
  4. **TypeScript 개선**
     - 내부 함수명 명확화
     - 타입 안정성 강화
  5. **문서화**
     - README.md 추가 (설치, 사용법, 모든 organism 예제)
     - Storybook 스토리 전면 개편

  **마이그레이션 가이드**

  이전:

  ```tsx
  <FloatingMenu items={[{ label: "Menu 1" }]} />
  ```

  이후:

  ```tsx
  <FloatingMenu>
    <FloatingMenu.Item>Menu 1</FloatingMenu.Item>
  </FloatingMenu>
  ```

  자세한 내용은 `packages/ui/README.md` 참고

- 0af0872: TreeView label/render 분리로 유연성 개선
  - TreeNode 인터페이스: label?: string, render?: ReactNode 추가
  - render 우선순위 렌더링 로직으로 복잡한 UI 표현 가능
  - aria-label 타입 체크로 접근성 강화
  - Badge, 상태 표시, 검색 하이라이트 등 다양한 사용 예시 추가

## 1.0.1

### Patch Changes

- 249543f: prettier 및 eslint 적용으로 코드 스타일 통일
  - CRLF를 LF로 변환하여 줄 끝 문자 통일
  - prettier 포맷팅 적용
  - package.json에 lint:fix, format, format:check 스크립트 추가

`@pf-dev/ui` 패키지의 모든 주요 변경사항을 기록합니다.

## [1.0.0] - 2025-12-04

### 기능

**Atomic Design 구조**

- `atoms`: Button, Input, Checkbox, Switch, Label, Badge, Avatar, Chip, Slider, Toggle, Separator, Skeleton, Spinner, Progress, Textarea, Link
- `molecules`: Accordion, Alert, Breadcrumb, Card, DatePicker, DropdownMenu, FileUpload, FilterChip, Pagination, RadioGroup, SearchBar, Select, StatisticsCard, Tabs, TimePicker, Toast, Tooltip, CheckboxGroup
- `organisms`: DataTable, DateTimePicker, EmptyState, FloatingMenu, Footer, Form, LoginCard, MenuBar, Modal, NavigationBar, NotificationCenter, PasswordChangeCard, Popover, Sheet, Sidebar, Stepper, Table, Timeline, TreeView
- `templates`: ErrorPage

**아이콘 시스템**

- 커스텀 SVG 아이콘 시스템 (50개 이상)
- 카테고리: weather, navigation, action, status, file, social, custom
- 사이즈 옵션: xs (12px), sm (16px), md (20px), lg (24px), xl (32px)
- 커스텀 아이콘 생성을 위한 `createIcon` 유틸리티

**인프라**

- 접근성을 위한 Radix UI primitives 적용
- `class-variance-authority`를 활용한 Tailwind CSS 스타일링
- 완전한 타입 정의를 포함한 TypeScript 지원
- Storybook 문서화
- ESM 빌드 출력

### 참고사항

- 커스텀 아이콘 시스템 도입으로 `lucide-react` 의존성 제거
