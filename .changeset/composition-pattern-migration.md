---
"@pf-dev/ui": minor
---

Composition Pattern으로 organism 컴포넌트 전환 (v1.1.0)

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
