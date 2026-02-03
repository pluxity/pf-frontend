---
name: pf-perf
description: 성능 최적화 제안. "성능", "최적화", "느림", "번들" 관련 요청 시 사용.
allowed-tools: Read, Bash, Glob, Grep
---

# PF 성능 최적화

$ARGUMENTS 성능 문제를 분석하고 최적화를 제안합니다.

> 일반적인 React 성능 규칙은 `react-best-practices` 스킬의 AGENTS.md (57개 규칙) 참조

---

## 진단 워크플로우

```
1. 증상 파악 (느린 로딩? 렌더링 버벅임? 번들 큼?)
   ↓
2. 측정 (Lighthouse, DevTools Profiler, 번들 분석)
   ↓
3. 원인 분류 (번들? 렌더링? API? 3D/영상?)
   ↓
4. pf-dev 특화 규칙 적용 (AGENTS.md 참조)
   ↓
5. 재측정으로 검증
```

---

## 1단계: 측정

```bash
# 번들 크기 분석
pnpm --filter 앱이름 build
# stats.html 확인 (rollup-plugin-visualizer 설정 필요)

# Lighthouse
npx lighthouse http://localhost:3000 --view
```

**목표:**

- LCP: < 2.5초
- FID: < 100ms
- CLS: < 0.1
- 번들: 초기 로드 500KB 이하

---

## 2단계: 원인 분류 → 해결

| 증상              | 원인              | 해결                                      |
| ----------------- | ----------------- | ----------------------------------------- |
| 초기 로딩 느림    | 번들 크기         | 코드 스플리팅, dynamic import             |
| 페이지 전환 느림  | 라우트 미분할     | `lazy()` + `Suspense`                     |
| 스크롤 버벅임     | 큰 리스트         | `@tanstack/react-virtual`                 |
| 상태 변경 시 느림 | 불필요한 리렌더링 | Zustand selector, `react19-patterns` 참조 |
| 3D 렌더링 느림    | GPU 부하          | AGENTS.md Cesium/Three 섹션 참조          |
| CCTV 끊김         | 스트리밍 설정     | AGENTS.md 스트리밍 섹션 참조              |
| API 응답 느림     | 순차 요청         | `Promise.all()` 병렬화                    |

---

## 3단계: 재측정

```bash
# 빌드 후 번들 크기 비교
pnpm build

# Lighthouse 재실행
npx lighthouse http://localhost:3000 --view
```

---

## 체크리스트

- [ ] 번들 크기 500KB 이하
- [ ] 라우트별 코드 스플리팅
- [ ] 불필요한 리렌더링 없음
- [ ] 이미지 lazy loading
- [ ] API 요청 병렬화
- [ ] Lighthouse 성능 90+
