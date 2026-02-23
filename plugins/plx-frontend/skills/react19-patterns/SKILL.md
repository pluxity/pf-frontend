---
name: react19-patterns
description: React 19 최신 패턴과 Best Practices 가이드. 컴포넌트 작성, 상태관리, 메모이제이션 최적화 시 참고. "React 19 패턴", "최신 React", "use hook", "Server Actions" 관련 질문에 사용.
---

# React 19 패턴 가이드

이 프로젝트는 **React 19**를 사용합니다.

> 상세 예제와 코드는 [`docs/react19-guide.md`](../../../docs/react19-guide.md) 참조

---

## 판단 기준표

| 상황                                    | React 19 패턴                      | 이전 방식 (사용 금지)      |
| --------------------------------------- | ---------------------------------- | -------------------------- |
| ref 전달                                | prop으로 직접 전달                 | `forwardRef`               |
| 단순 값/함수                            | 그냥 사용                          | `useMemo`/`useCallback`    |
| 복잡한 계산 (O(n²)+)                    | `useMemo` ✅                       | -                          |
| 외부 라이브러리 객체 (Cesium, Three.js) | `useMemo` ✅                       | -                          |
| 수천 행 렌더링 컴포넌트                 | `memo` ✅                          | -                          |
| 확실하지 않을 때                        | **안 쓴다**                        | -                          |
| 폼 상태 관리                            | `useActionState` + `useFormStatus` | 수동 state 관리            |
| 낙관적 업데이트                         | `useOptimistic`                    | 수동 롤백 로직             |
| 비동기 데이터                           | `use()` + `Suspense`               | useEffect + useState       |
| 조건부 Context                          | `use(Context)`                     | `useContext` (조건부 불가) |
| 로딩 상태                               | `Suspense`                         | isPending 플래그           |
| Document metadata                       | 컴포넌트 내 `<title>`, `<meta>`    | react-helmet 등            |

---

## 메모이제이션 의사결정

```
값/함수가 필요 → 단순한가?
  ├─ YES → 그냥 쓴다 (메모이제이션 금지)
  └─ NO → 계산 복잡도 O(n²) 이상? 또는 외부 라이브러리 참조?
       ├─ YES → useMemo/memo 사용
       └─ NO → 그냥 쓴다 (성능 문제 생기면 그때 추가)
```

---

## 마이그레이션 체크리스트

- [ ] `forwardRef` → ref를 prop으로 변경
- [ ] 불필요한 `useMemo`/`useCallback`/`memo` 제거
- [ ] 폼 처리 → `useActionState` 검토
- [ ] 낙관적 UI → `useOptimistic` 검토
- [ ] 조건부 Context → `use()` 검토
- [ ] 로딩 UI → `Suspense` 검토
