---
name: pf-code-review
description: pf-frontend 프로젝트 컨벤션과 React 19 Best Practices 기반 코드 리뷰. "코드 리뷰", "리뷰해줘", "이 코드 괜찮아?" 요청 시 사용.
allowed-tools: Read, Glob, Grep
---

# PF 코드 리뷰

$ARGUMENTS 파일 또는 변경사항을 리뷰합니다.

> 각 항목의 상세 규칙은 전문 스킬을 참조합니다.

---

## 리뷰 프로세스

```
1. 대상 파일 읽기
   ↓
2. 10개 카테고리 체크리스트 순회
   ↓
3. 결과 출력 (아래 형식)
```

---

## 리뷰 체크리스트

### 1. React 19 패턴 → `react19-patterns` 참조

- [ ] `forwardRef` 사용하고 있지 않은지
- [ ] 불필요한 `useMemo`/`useCallback`/`memo` 없는지
- [ ] 새 Hooks (`use`, `useOptimistic`, `useActionState`) 적용 가능한지
- [ ] `Suspense`로 처리할 수 있는 로딩 상태가 있는지

### 2. TypeScript

- [ ] `any` 타입 사용 금지 (`unknown` 또는 구체적 타입)
- [ ] Props 인터페이스 명시적 정의
- [ ] `noUncheckedIndexedAccess` 준수 (배열 접근 시 undefined 처리)
- [ ] 타입 추론 활용 (불필요한 타입 명시 피함)

### 3. 상태관리 (Zustand)

- [ ] Selector로 필요한 값만 구독
- [ ] State/Actions 인터페이스 분리
- [ ] persist 사용 시 partialize 설정

### 4. API 호출

- [ ] 서비스 레이어 사용 (apiClient 직접 호출 금지)
- [ ] 에러 처리 존재
- [ ] 응답 타입 명시

### 5. 컴포넌트 구조

- [ ] 단일 책임 원칙
- [ ] 500줄 이상이면 분리 검토
- [ ] 3단계 이상 prop drilling 없음

### 6. 스타일링

- [ ] `cn()` 사용하여 동적 클래스 병합
- [ ] variant 많으면 CVA 패턴 사용
- [ ] Tailwind 클래스 순서 일관성

### 7. 성능 → `pf-perf` 참조

- [ ] 불필요한 리렌더링 없음
- [ ] 큰 리스트 가상화 검토 (10,000+)
- [ ] 무거운 컴포넌트 lazy load

### 8. 접근성 → `pf-a11y` 참조

- [ ] 시맨틱 HTML 사용
- [ ] 키보드 접근성
- [ ] ARIA 속성 (아이콘 버튼 등)

### 9. 보안

- [ ] `dangerouslySetInnerHTML` 미사용
- [ ] 환경변수에 민감 정보 노출 없음
- [ ] 입력값 Zod 스키마 검증

### 10. 코드 스타일

- [ ] 명확한 네이밍
- [ ] named export 사용 (default export 금지)
- [ ] 프로젝트 파일 구조 컨벤션 준수

---

## 출력 형식

```markdown
## 코드 리뷰 결과

### ✅ 잘된 점

- ...

### ⚠️ 개선 필요

1. **[카테고리]** 설명
   - 현재: `코드`
   - 개선: `코드`
   - 이유: 설명

### 💡 제안

- ...

### 📊 요약

| 항목          | 상태     |
| ------------- | -------- |
| React 19 패턴 | ✅/⚠️/❌ |
| TypeScript    | ✅/⚠️/❌ |
| 성능          | ✅/⚠️/❌ |
| 접근성        | ✅/⚠️/❌ |
```
