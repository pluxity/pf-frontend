# Changelog

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
