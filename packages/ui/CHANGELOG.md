# Changelog

## 1.2.4

### Patch Changes

- f34026e: packages/ui 타입 export 누락 수정
  - Toast: UseToastReturn, ToastFunction 타입 export 추가
  - DataTable: 타입 제약 완화 및 가상 컬럼 지원 (key: keyof T | string)

## 1.2.3

### Patch Changes

- 1138b15: loginCard 커스터마이징 옵션 추가

## 1.2.2

### Patch Changes

- d653809: table / datatable 컴포넌트 업데이트

## 1.2.1

### Patch Changes

- 7085458: Sidebar 레이아웃 및 디자인 개선

  ### 새로운 기능
  - `Sidebar.Content` 컴포넌트 추가: 메인 컨텐츠 영역의 패딩을 담당하는 새로운 compound component

  ### 개선사항
  - Active Indicator 위치를 사이드바 왼쪽 가장자리로 이동
  - Collapsed 상태에서 메뉴 아이템 가운데 정렬
  - Collapsed 상태에서 불필요한 horizontal divider 제거
  - SidebarFooter collapsed 상태에서 세로 정렬 적용
  - 불필요한 호버 툴팁 제거

  ### 기타
  - PasswordChangeCard: button 엘리먼트를 Button 컴포넌트로 교체

  ### 사용법 변경

  ```tsx
  <Sidebar>
    <Sidebar.Header title="Dashboard" />
    <Sidebar.Content>
      {" "}
      {/* 새로 추가된 컴포넌트 */}
      <Sidebar.Section label="General">
        <Sidebar.Item icon={<Home />}>Home</Sidebar.Item>
      </Sidebar.Section>
    </Sidebar.Content>
    <Sidebar.Footer>
      <Sidebar.CollapseButton />
    </Sidebar.Footer>
  </Sidebar>
  ```

## 1.2.0

### Minor Changes

- 689bad4: 레이아웃 및 데이터 표시 컴포넌트 추가 (v1.2.0)

  **새로운 컴포넌트**
  1. **Carousel** (#74)
     - 이미지 슬라이더, CCTV 화면 전환 등에 사용
     - 전환 효과: slide, fade, none
     - 자동 재생 (autoPlay, autoPlayInterval)
     - 무한 루프 지원 (loop)
     - Lazy 로딩 (lazy, preloadAdjacent)
     - 제어/비제어 모드 지원 (activeIndex, onChange)
     - 키보드 네비게이션 (ArrowLeft/Right)
     - 접근성: aria-roledescription="carousel"
  2. **Widget** (#75)
     - 대시보드 카드 형태의 위젯 컴포넌트
     - 헤더 영역 (title, description, actions)
     - Grid span 지원 (colSpan, rowSpan)
     - GridLayout 연동 (GridLayoutContext 활용)
     - 드래그앤드롭 스왑 지원 (DragDropContext 연동)
     - 테두리/배경 커스터마이징 (border)
  3. **GridLayout** (#76)
     - CSS Grid 기반 레이아웃 컴포넌트
     - 기본 모드: columns, rows, gap, padding 설정
     - 템플릿 모드: 사전 정의된 GridTemplate으로 복잡한 레이아웃
     - 페이지네이션 모드: Carousel 연동하여 페이지 단위 표시
     - 편집 모드: 위젯 드래그앤드롭으로 위치 스왑
     - onLayoutChange 이벤트로 레이아웃 변경 감지
  4. **CardList** (#77)
     - 데이터 배열을 카드 그리드로 렌더링
     - 반응형 컬럼 (columns: 2-6)
     - 커스텀 카드 렌더링 (renderCard)
     - 타입 안전한 keyExtractor
     - gap 설정 지원

  **개선 사항**
  - **Pagination variant 추가**
    - `default`: 테두리 없는 기본 스타일
    - `bordered`: 테두리와 배경이 있는 스타일
  - **인라인 SVG → Icon 컴포넌트 교체**
    - Link, Carousel, Pagination, Select 컴포넌트
    - 일관된 아이콘 스타일 및 유지보수성 향상

  **타입 정의**

  ```typescript
  // Carousel
  interface CarouselProps {
    children: ReactNode[];
    transition?: "slide" | "fade" | "none";
    autoPlay?: boolean;
    autoPlayInterval?: number;
    loop?: boolean;
    lazy?: boolean;
    preloadAdjacent?: boolean;
    activeIndex?: number;
    onChange?: (index: number) => void;
  }

  // Widget
  interface WidgetProps {
    id?: string;
    title?: string;
    description?: string;
    actions?: ReactNode;
    colSpan?: number;
    rowSpan?: number;
    border?: boolean;
  }

  // GridLayout
  interface GridLayoutProps {
    columns?: number;
    rows?: number;
    gap?: number;
    padding?: number;
    template?: GridTemplate;
    pagination?: GridPaginationOptions;
    editable?: boolean;
    onLayoutChange?: (event: LayoutChangeEvent) => void;
  }

  // CardList
  interface CardListProps<T> {
    data: T[];
    columns?: 2 | 3 | 4 | 5 | 6;
    gap?: number;
    keyExtractor: (item: T) => string | number;
    renderCard: (item: T, index: number) => ReactNode;
  }
  ```

  **사용 예시**

  ```tsx
  // Carousel
  <Carousel autoPlay loop transition="slide">
    {images.map((src) => <img src={src} />)}
  </Carousel>

  // GridLayout + Widget
  <GridLayout template={dashboardTemplate} editable>
    <Widget id="chart" title="매출 현황" colSpan={6} rowSpan={2}>
      <Chart />
    </Widget>
    <Widget id="stats" title="통계">
      <Stats />
    </Widget>
  </GridLayout>

  // CardList
  <CardList
    data={facilities}
    columns={4}
    keyExtractor={(item) => item.id}
    renderCard={(facility) => (
      <Card>
        <img src={facility.image} />
        <h3>{facility.name}</h3>
      </Card>
    )}
  />
  ```

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
