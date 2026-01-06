---
"@pf-dev/ui": patch
---

Sidebar 레이아웃 및 디자인 개선

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
