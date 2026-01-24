# Claude Code Skills 활용 가이드

이 프로젝트에는 다양한 Claude Code Skills가 설정되어 있습니다. 상황에 맞는 스킬을 사용하면 개발 효율을 높일 수 있습니다.

---

## 목차

1. [스킬 사용법](#스킬-사용법)
2. [상황별 스킬 추천](#상황별-스킬-추천)
3. [스킬 목록](#스킬-목록)

---

## 스킬 사용법

### 직접 호출

```
/스킬이름 [인자]
```

예시:
```
/pf-test-component Button
/cesium-expert 마커 클릭 이벤트 어떻게 해?
/pf-build-fix
```

### 자연어로 호출

스킬의 description에 맞는 질문을 하면 Claude가 자동으로 적절한 스킬을 사용합니다.

```
"Button 컴포넌트 테스트 만들어줘" → /pf-test-component 자동 사용
"빌드 에러 났어" → /pf-build-fix 자동 사용
"Cesium에서 마커 추가하는 법" → /cesium-expert 자동 사용
```

---

## 상황별 스킬 추천

### 🆕 새로 만들 때

| 상황 | 추천 스킬 |
|------|----------|
| 새 기능 개발 시작 | `/pf-feature` |
| 새 컴포넌트 만들기 | `/pf-component` |
| 새 패키지 추가 | `/pf-new-package` |
| Storybook 스토리 추가 | `/pf-storybook` |

### 🧪 테스트할 때

| 상황 | 추천 스킬 |
|------|----------|
| 컴포넌트 테스트 | `/pf-test-component` |
| 훅 테스트 | `/pf-test-hook` |
| 스토어 테스트 | `/pf-test-store` |

### 🔧 문제 해결할 때

| 상황 | 추천 스킬 |
|------|----------|
| 빌드 에러 | `/pf-build-fix` |
| 긴급 버그 수정 | `/pf-hotfix` |
| 성능 문제 | `/pf-perf` |
| 의존성 문제 | `/pf-dep-check` |

### 📝 문서화할 때

| 상황 | 추천 스킬 |
|------|----------|
| 컴포넌트 README | `/pf-doc-component` |
| 릴리즈 노트 | `/pf-release` |

### 🔍 코드 품질

| 상황 | 추천 스킬 |
|------|----------|
| 코드 리뷰 | `/pf-code-review` |
| 접근성 검사 | `/pf-a11y` |
| React 19 패턴 확인 | `/react19-patterns` |

### 🗺️ 도메인 전문 지식

| 상황 | 추천 스킬 |
|------|----------|
| 3D 지도 (Cesium) | `/cesium-expert` |
| 3D 뷰어 (Three.js) | `/three-expert` |
| 영상 스트리밍 | `/streaming-expert` |

---

## 스킬 목록

### 테스트 관련

#### `/pf-test-component`
UI 컴포넌트 테스트 파일 생성 (Vitest + RTL)

```
/pf-test-component Button
/pf-test-component Sidebar
```

#### `/pf-test-hook`
커스텀 훅 테스트 파일 생성

```
/pf-test-hook useAuth
/pf-test-hook useMapStore
```

#### `/pf-test-store`
Zustand 스토어 테스트 파일 생성

```
/pf-test-store authStore
/pf-test-store userStore
```

---

### 개발 워크플로우

#### `/pf-feature`
새 기능 개발 전체 플로우 가이드

```
/pf-feature 사용자 프로필 페이지
```

#### `/pf-hotfix`
긴급 버그 수정 플로우

```
/pf-hotfix 로그인 크래시
```

#### `/pf-release`
버전 릴리즈 플로우 (changeset, tag, 배포)

```
/pf-release @pf-dev/ui
```

---

### 코드 품질

#### `/pf-code-review`
React 19 + 프로젝트 컨벤션 기반 코드 리뷰

```
/pf-code-review src/pages/profile
/pf-code-review packages/ui/src/atoms/Button
```

#### `/pf-a11y`
접근성 검사 (시맨틱 HTML, 키보드, ARIA 등)

```
/pf-a11y src/components/Modal
```

#### `/pf-perf`
성능 최적화 제안 (번들, 렌더링, API 등)

```
/pf-perf 이 페이지가 느려요
```

---

### 모노레포 관리

#### `/pf-build-fix`
Turborepo 빌드 에러 해결

```
/pf-build-fix
/pf-build-fix TypeScript 에러
```

#### `/pf-dep-check`
의존성 검사 및 업데이트 가이드

```
/pf-dep-check
/pf-dep-check react 업데이트
```

#### `/pf-new-package`
새 공유 패키지 생성 가이드

```
/pf-new-package utils
```

---

### 문서화

#### `/pf-doc-component`
컴포넌트 README 생성

```
/pf-doc-component Button
/pf-doc-component Sidebar
```

#### `/pf-storybook`
Storybook 스토리 생성

```
/pf-storybook Button
/pf-storybook Dialog
```

---

### 도메인 전문가

#### `/cesium-expert`
CesiumJS 3D 지도 관련 질문/구현

```
/cesium-expert 마커 클릭 이벤트
/cesium-expert 카메라 애니메이션
/cesium-expert 3D 타일셋 로딩
```

#### `/three-expert`
Three.js/React Three Fiber 관련 질문/구현

```
/three-expert GLTF 모델 로딩
/three-expert 성능 최적화
/three-expert 그림자 설정
```

#### `/streaming-expert`
HLS/WHEP 영상 스트리밍 관련 질문/구현

```
/streaming-expert HLS 재생 안됨
/streaming-expert WHEP 설정
/streaming-expert 여러 CCTV 동시 재생
```

---

### React 19 & 베스트 프랙티스

#### `/react19-patterns`
React 19 최신 패턴 가이드 (forwardRef 제거, 새 Hooks 등)

```
/react19-patterns useOptimistic 사용법
/react19-patterns forwardRef 제거 방법
```

#### `react-best-practices` (Vercel)
React/Next.js 성능 최적화 규칙 40+개 (자동 적용)

#### `web-design-guidelines` (Vercel)
UI 베스트 프랙티스 100+개 (자동 적용)

---

## 팁

### 1. 여러 스킬 조합

```
# 새 컴포넌트 개발 시
/pf-component Button        # 컴포넌트 생성
/pf-test-component Button   # 테스트 생성
/pf-storybook Button        # 스토리 생성
/pf-doc-component Button    # README 생성
```

### 2. 모르겠으면 자연어로

```
"CCTV 영상이 안 나와요"
→ Claude가 /streaming-expert 사용하여 답변

"빌드가 안 돼요"
→ Claude가 /pf-build-fix 사용하여 진단
```

### 3. Context7 활용

도메인 전문가 스킬들은 Context7로 최신 문서를 조회할 수 있습니다.

```
/cesium-expert 최신 API로 Entity 추가하는 법
→ Context7에서 Cesium 최신 문서 참조하여 답변
```

---

## 스킬 추가/수정

스킬 파일 위치: `.claude/skills/스킬이름/SKILL.md`

새 스킬 추가 시:
1. `.claude/skills/새스킬/SKILL.md` 생성
2. YAML 프론트매터 작성 (name, description, allowed-tools)
3. 마크다운으로 가이드 작성
