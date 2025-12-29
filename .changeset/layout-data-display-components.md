---
"@pf-dev/ui": minor
---

레이아웃 및 데이터 표시 컴포넌트 추가 (v1.2.0)

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
