# @pf-dev/ui

TypeScript, Tailwind CSS, Radix UI 프리미티브로 구축된 모던 React 컴포넌트 라이브러리입니다. 유연하고 접근성 높은 UI 컴포넌트를 위한 Composition Pattern을 지원합니다.

## 설치

```bash
pnpm add @pf-dev/ui
```

### Peer Dependencies

다음 의존성이 필요합니다:

```bash
pnpm add react react-dom tailwindcss class-variance-authority clsx tailwind-merge
```

### Tailwind CSS 설정

Tailwind 설정에 ui 패키지를 추가하세요:

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@pf-dev/ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#4D7EFF",
        "success-brand": "#00C48C",
        "warning-brand": "#FFA26B",
        "error-brand": "#DE4545",
      },
    },
  },
};
```

## 컴포넌트

### Atoms

UI의 기본 구성 요소:

- **Avatar** - 프로필 이미지 (폴백 지원)
- **Badge** - 상태 표시 및 라벨
- **Button** - 다양한 변형의 버튼
- **Icon** - SVG 아이콘 컴포넌트
- **Input** - 폼 입력 필드
- **Label** - 폼 라벨
- **Select** - 드롭다운 선택
- **Slider** - 범위 입력
- **Switch** - 토글 스위치
- **Tabs** - 탭 네비게이션
- **Textarea** - 멀티라인 텍스트 입력

### Molecules

복합 컴포넌트:

- **Carousel** - 다양한 전환 효과의 이미지 슬라이더
- **Widget** - 헤더와 콘텐츠가 있는 대시보드 카드

### Organisms

Composition Pattern으로 구축된 복잡한 컴포넌트:

- **CardList** - 데이터 기반 카드 그리드
- **FloatingMenu** - 확장 가능한 플로팅 메뉴
- **Footer** - 링크가 있는 페이지 푸터
- **GridLayout** - 템플릿/페이지네이션 모드의 CSS Grid 레이아웃
- **NavigationBar** - 상단 네비게이션 바
- **NotificationCenter** - 알림 패널
- **Sidebar** - 접을 수 있는 네비게이션 사이드바
- **Stepper** - 단계별 진행 표시기
- **Timeline** - 세로 타임라인

## 사용법

### Composition Pattern

모든 organism 컴포넌트는 Composition Pattern을 사용하여 서브 컴포넌트를 조합해 유연한 UI를 구축할 수 있습니다.

#### CardList

```tsx
import { CardList, Card } from "@pf-dev/ui";

interface Item {
  id: string;
  name: string;
  image: string;
}

const items: Item[] = [...];

<CardList
  data={items}
  columns={4}
  gap={16}
  keyExtractor={(item) => item.id}
  renderCard={(item) => (
    <Card className="overflow-hidden">
      <img src={item.image} alt={item.name} />
      <div className="p-4">{item.name}</div>
    </Card>
  )}
/>
```

**Props:**

- `data: T[]` - 렌더링할 데이터 배열
- `columns?: 2 | 3 | 4 | 5 | 6` - 컬럼 수 (기본값: 3)
- `gap?: number` - 카드 간격 (px, 기본값: 16)
- `keyExtractor?: (item: T, index: number) => string | number` - 키 추출 함수
- `renderCard: (item: T, index: number) => ReactNode` - 카드 렌더 함수

#### Carousel

```tsx
import { Carousel } from "@pf-dev/ui";

function App() {
  const images = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
  ];

  return (
    <Carousel
      autoPlay
      autoPlayInterval={3000}
      loop
      transition="slide"
      showArrows
      showIndicators
      className="h-[400px]"
    >
      {images.map((src, i) => (
        <img key={i} src={src} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
      ))}
    </Carousel>
  );
}
```

**Props:**

- `transition?: "slide" | "fade" | "none"` - 전환 효과 (기본값: "slide")
- `autoPlay?: boolean` - 자동 재생 (기본값: false)
- `autoPlayInterval?: number` - 자동 재생 간격 (ms, 기본값: 3000)
- `loop?: boolean` - 무한 루프 (기본값: true)
- `lazy?: boolean` - 슬라이드 지연 렌더링 (기본값: true)
- `preloadAdjacent?: boolean` - lazy 모드에서 인접 슬라이드 미리 로드 (기본값: false)
- `showArrows?: boolean` - 네비게이션 화살표 표시 (기본값: true)
- `showIndicators?: boolean` - 인디케이터 점 표시 (기본값: true)
- `activeIndex?: number` - 제어 모드 활성 인덱스
- `onChange?: (index: number) => void` - 인덱스 변경 콜백
- `transitionDuration?: number` - 전환 지속 시간 (ms, 기본값: 300)

#### FloatingMenu

```tsx
import { FloatingMenu } from "@pf-dev/ui";
import { Home, Settings } from "@pf-dev/ui/atoms/Icon";

function App() {
  return (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Group label="메인">
        <FloatingMenu.Item icon={<Home size="sm" />} active>
          대시보드
        </FloatingMenu.Item>
      </FloatingMenu.Group>

      <FloatingMenu.Separator />

      <FloatingMenu.Group label="설정">
        <FloatingMenu.Item icon={<Settings size="sm" />}>설정</FloatingMenu.Item>
      </FloatingMenu.Group>
    </FloatingMenu>
  );
}
```

**서브 컴포넌트:**

- `FloatingMenu.Item` - 메뉴 항목
- `FloatingMenu.Group` - 라벨이 있는 그룹
- `FloatingMenu.Separator` - 구분선
- `FloatingMenu.Custom` - 커스텀 콘텐츠

**Props:**

- `logo?: React.ReactNode` - 로고 요소
- `compact?: boolean` - 컴팩트 모드 (작은 너비)
- `defaultExpanded?: boolean` - 초기 펼침 상태
- `expanded?: boolean` - 제어 모드 펼침 상태
- `onExpandedChange?: (expanded: boolean) => void` - 상태 변경 콜백
- `ariaLabelCollapse?: string` - 접근성 라벨
- `ariaLabelExpand?: string` - 접근성 라벨

#### Footer

```tsx
import { Footer } from "@pf-dev/ui";

function App() {
  return (
    <Footer>
      <Footer.Brand logoText="PLUXITY" tagline="웹 개발의 미래를 만듭니다">
        <Footer.SocialLinks>
          <Footer.SocialLink platform="github" href="https://github.com/..." />
          <Footer.SocialLink platform="twitter" href="https://twitter.com/..." />
        </Footer.SocialLinks>
      </Footer.Brand>

      <Footer.Column title="제품">
        <Footer.Link href="/features">기능</Footer.Link>
        <Footer.Link href="/pricing">가격</Footer.Link>
      </Footer.Column>

      <Footer.Column title="회사">
        <Footer.Link href="/about">소개</Footer.Link>
        <Footer.Link href="/contact">연락처</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 PLUXITY. All rights reserved.</Footer.Copyright>
    </Footer>
  );
}
```

**서브 컴포넌트:**

- `Footer.Brand` - 로고와 태그라인이 있는 브랜드 영역
- `Footer.Column` - 제목이 있는 링크 컬럼
- `Footer.Link` - 개별 링크
- `Footer.SocialLinks` - 소셜 링크 래퍼
- `Footer.SocialLink` - 소셜 미디어 링크 (지원: github, twitter, linkedin, youtube, facebook, instagram)
- `Footer.Copyright` - 저작권 표시
- `Footer.Custom` - 커스텀 콘텐츠

#### GridLayout

```tsx
import { GridLayout, Widget } from "@pf-dev/ui";

// 기본 그리드
<GridLayout columns={4} gap={16}>
  {items.map((item) => (
    <Widget key={item.id}>{item.name}</Widget>
  ))}
</GridLayout>

// 고정 행 (CCTV 그리드)
<GridLayout columns={4} rows={4} gap={8} className="h-[500px]">
  {cameras.map((cam) => (
    <div key={cam.id}>{cam.name}</div>
  ))}
</GridLayout>

// 템플릿 모드
const template = {
  id: "dashboard",
  name: "대시보드",
  columns: 12,
  rows: 4,
  cells: [
    { id: "main", colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 2 },
    { id: "side", colStart: 9, colSpan: 4, rowStart: 1, rowSpan: 2 },
    { id: "bottom", colStart: 1, colSpan: 12, rowStart: 3, rowSpan: 2 },
  ],
};

<GridLayout template={template} editable onLayoutChange={handleChange}>
  <Widget id="widget-1">메인</Widget>
  <Widget id="widget-2">사이드</Widget>
  <Widget id="widget-3">하단</Widget>
</GridLayout>

// 캐러셀 페이지네이션
<GridLayout
  columns={4}
  rows={4}
  pagination={{ type: "carousel", perPage: 16, transition: "slide" }}
>
  {allItems.map((item) => <Card key={item.id}>{item.name}</Card>)}
</GridLayout>
```

**Props:**

- `columns?: number` - 컬럼 수 (기본값: 12)
- `rows?: number` - 행 수 (고정 높이 모드)
- `gap?: number` - 항목 간격 (px, 기본값: 16)
- `template?: GridTemplate` - 복잡한 레이아웃을 위한 템플릿
- `editable?: boolean` - 드래그앤드롭 스왑 활성화 (기본값: false)
- `onLayoutChange?: (event: LayoutChangeEvent) => void` - 레이아웃 변경 콜백
- `initialLayout?: GridLayoutState` - 초기 위젯 배치
- `pagination?: GridPaginationOptions` - 페이지네이션/캐러셀 모드

#### NavigationBar

```tsx
import { NavigationBar } from "@pf-dev/ui";
import { Button } from "@pf-dev/ui/atoms/Button";

function App() {
  return (
    <NavigationBar
      logo={<img src="/logo.svg" alt="Logo" />}
      actions={
        <>
          <Button variant="ghost">로그인</Button>
          <Button>회원가입</Button>
        </>
      }
    >
      <NavigationBar.Item href="/" active>
        홈
      </NavigationBar.Item>
      <NavigationBar.Item href="/about">소개</NavigationBar.Item>
      <NavigationBar.Item href="/contact">연락처</NavigationBar.Item>
    </NavigationBar>
  );
}
```

**서브 컴포넌트:**

- `NavigationBar.Item` - 네비게이션 링크
- `NavigationBar.Logo` - 커스텀 로고 래퍼
- `NavigationBar.Actions` - 액션 버튼 래퍼

**Props:**

- `logo?: React.ReactNode` - 커스텀 로고 요소
- `logoText?: string` - 기본 로고 텍스트 (logo 미제공 시)
- `actions?: React.ReactNode` - 액션 버튼

#### NotificationCenter

```tsx
import { NotificationCenter } from "@pf-dev/ui";
import { Bell } from "@pf-dev/ui/atoms/Icon";

function App() {
  const [unreadCount, setUnreadCount] = useState(3);

  return (
    <NotificationCenter onNotificationClick={(id) => console.log("클릭:", id)} maxHeight={400}>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={unreadCount} />
        <NotificationCenter.MarkAllRead onClick={() => setUnreadCount(0)} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<Bell size="sm" />}
        title="새 메시지"
        description="John에게서 새 메시지가 도착했습니다"
        timestamp="5분 전"
        read={false}
      />
      <NotificationCenter.Item
        id="2"
        title="업데이트 가능"
        description="새 버전이 출시되었습니다"
        timestamp="1시간 전"
        read={true}
      />

      <NotificationCenter.Empty>새 알림이 없습니다</NotificationCenter.Empty>
    </NotificationCenter>
  );
}
```

**서브 컴포넌트:**

- `NotificationCenter.Header` - 헤더 영역
- `NotificationCenter.UnreadBadge` - 읽지 않은 알림 수 뱃지
- `NotificationCenter.MarkAllRead` - 모두 읽음 버튼
- `NotificationCenter.Item` - 개별 알림
- `NotificationCenter.Empty` - 빈 상태 메시지
- `NotificationCenter.Custom` - 커스텀 콘텐츠

**Props:**

- `onNotificationClick?: (id: string) => void` - 클릭 핸들러
- `maxHeight?: number | string` - 최대 높이

#### Sidebar

```tsx
import { Sidebar } from "@pf-dev/ui";
import { Home, Users, Settings } from "@pf-dev/ui/atoms/Icon";

function App() {
  return (
    <Sidebar>
      <Sidebar.Header title="대시보드">
        <Sidebar.CollapseButton iconOnly />
      </Sidebar.Header>

      <Sidebar.Section label="일반">
        <Sidebar.Item icon={<Home size="sm" />} active>
          홈
        </Sidebar.Item>
        <Sidebar.Item icon={<Users size="sm" />}>사용자</Sidebar.Item>
      </Sidebar.Section>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  );
}
```

**서브 컴포넌트:**

- `Sidebar.Header` - 로고, 제목, 선택적 children이 있는 헤더
- `Sidebar.Footer` - 접기 버튼이나 사용자 프로필을 위한 푸터 영역
- `Sidebar.Section` - 라벨이 있는 그룹화된 네비게이션 항목
- `Sidebar.Item` - 아이콘 지원 개별 네비게이션 항목
- `Sidebar.CollapseButton` - 토글 버튼 (푸터: 텍스트, 헤더: 아이콘)
- `Sidebar.Separator` - 구분선
- `Sidebar.Custom` - 커스텀 콘텐츠

**Props:**

- `defaultCollapsed?: boolean` - 초기 접힘 상태
- `collapsed?: boolean` - 제어 모드 접힘 상태
- `onCollapsedChange?: (collapsed: boolean) => void` - 상태 변경 콜백
- `ariaLabelCollapse?: string` - 접기 액션 접근성 라벨
- `ariaLabelExpand?: string` - 펼치기 액션 접근성 라벨

#### Stepper

```tsx
import { Stepper } from "@pf-dev/ui";

function App() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Stepper currentStep={currentStep} orientation="horizontal">
      <Stepper.Step title="계정" description="계정을 생성하세요" />
      <Stepper.Step title="프로필" description="프로필을 완성하세요" />
      <Stepper.Step title="완료" description="모두 완료!" />
    </Stepper>
  );
}
```

**서브 컴포넌트:**

- `Stepper.Step` - 개별 단계
- `Stepper.Custom` - 커스텀 콘텐츠

**Props:**

- `currentStep: number` - 현재 단계 인덱스 (0부터 시작)
- `orientation?: "horizontal" | "vertical"` - 레이아웃 방향

#### Timeline

```tsx
import { Timeline } from "@pf-dev/ui";
import { Check } from "@pf-dev/ui/atoms/Icon";

function App() {
  return (
    <Timeline>
      <Timeline.Item
        title="프로젝트 생성"
        description="초기 프로젝트 설정 완료"
        time="2시간 전"
        variant="success"
      />
      <Timeline.Item
        title="첫 커밋"
        description="기본 컴포넌트 추가"
        time="1시간 전"
        icon={<Check size="sm" />}
      />
      <Timeline.Item title="진행 중" description="기능 작업 중" time="방금" />
    </Timeline>
  );
}
```

**서브 컴포넌트:**

- `Timeline.Item` - 아이콘, 제목, 설명, 시간이 있는 타임라인 항목
- `Timeline.Custom` - 커스텀 콘텐츠

**Props:**

- `variant?: "default" | "success" | "warning" | "error"` - 색상 변형
- `icon?: React.ReactNode` - 커스텀 아이콘

#### Widget

```tsx
import { Widget } from "@pf-dev/ui";

function App() {
  return (
    <Widget title="매출 현황" border>
      <div className="p-4">위젯 콘텐츠</div>
    </Widget>
  );
}

// GridLayout과 함께 사용
<GridLayout columns={12}>
  <Widget title="차트" colSpan={6} rowSpan={2}>
    <Chart />
  </Widget>
  <Widget title="통계" colSpan={3}>
    <Stats />
  </Widget>
</GridLayout>;
```

**Props:**

- `id?: string` - 위젯 ID (GridLayout 템플릿 모드용)
- `title?: string` - 헤더 제목
- `border?: boolean` - 테두리 표시 (기본값: true)
- `colSpan?: number` - 그리드 컬럼 스팬
- `rowSpan?: number` - 그리드 로우 스팬
- `contentClassName?: string` - 콘텐츠 영역 클래스

## 접근성

모든 컴포넌트는 WCAG 2.1 AA 표준을 준수합니다:

- 시맨틱 HTML 요소
- ARIA 라벨 및 역할
- 키보드 네비게이션 지원
- 포커스 관리
- 스크린 리더 지원

### 국제화

인터랙티브 요소가 있는 컴포넌트는 커스텀 aria-label을 지원합니다:

```tsx
<Sidebar
  ariaLabelCollapse="사이드바 접기"
  ariaLabelExpand="사이드바 펼치기"
>
  {/* ... */}
</Sidebar>

<FloatingMenu
  ariaLabelCollapse="메뉴 접기"
  ariaLabelExpand="메뉴 펼치기"
>
  {/* ... */}
</FloatingMenu>
```

## TypeScript

모든 컴포넌트는 TypeScript로 완전히 타입이 지정되어 있습니다. 필요에 따라 타입을 가져오세요:

```tsx
import type { SidebarProps, SidebarHeaderProps, SidebarItemProps } from "@pf-dev/ui";
```

## Storybook

Storybook에서 모든 컴포넌트를 확인하세요:

```bash
pnpm run storybook
```

## 기여

이 패키지는 모노레포의 일부입니다. 기여하려면:

1. 레포지토리 클론
2. 의존성 설치: `pnpm install`
3. Storybook 실행: `pnpm run storybook`
4. 변경 사항 적용
5. 타입 체크 실행: `pnpm run type-check`
6. 린트 실행: `pnpm run lint`

## 라이선스

MIT
