# plx-frontend

PLUXITY 프론트엔드 전용 Claude Code 플러그인. React 19, Tailwind CSS, CesiumJS, Three.js, 영상 스트리밍 등 FE 개발에 특화된 스킬 모음입니다.

## 스킬 목록 (22개)

### 코드 생성 (4)

| 스킬            | 설명                  | 트리거                          |
| --------------- | --------------------- | ------------------------------- |
| `component`     | React 컴포넌트 생성   | "컴포넌트 만들어줘"             |
| `storybook`     | Storybook 스토리 생성 | "스토리북", "스토리 만들어"     |
| `doc-component` | 컴포넌트 README 생성  | "문서화", "README 만들어"       |
| `new-package`   | 새 패키지 생성 가이드 | "패키지 만들어", "package 추가" |

### 테스트 (3)

| 스킬             | 설명                              | 트리거            |
| ---------------- | --------------------------------- | ----------------- |
| `test-component` | UI 컴포넌트 테스트 (Vitest + RTL) | "테스트 만들어줘" |
| `test-hook`      | 커스텀 훅 테스트                  | "훅 테스트"       |
| `test-store`     | Zustand 스토어 테스트             | "스토어 테스트"   |

### 코드 품질 (3)

| 스킬          | 설명                                      | 트리거                   |
| ------------- | ----------------------------------------- | ------------------------ |
| `code-review` | 프로젝트 컨벤션 + React 19 기반 코드 리뷰 | "코드 리뷰", "리뷰해줘"  |
| `a11y`        | 접근성 검사                               | "접근성", "a11y"         |
| `perf`        | 성능 최적화 제안                          | "성능", "최적화", "느림" |

### 개발 워크플로우 (3)

| 스킬          | 설명                  | 트리거                        |
| ------------- | --------------------- | ----------------------------- |
| `feature-dev` | 기능 개발 전체 플로우 | "기능 개발", "새 기능"        |
| `hotfix`      | 긴급 버그 수정 플로우 | "핫픽스", "긴급", "버그 수정" |
| `release`     | 버전 릴리즈 플로우    | "릴리즈", "버전", "태그"      |

### 빌드 & 의존성 (2)

| 스킬        | 설명                     | 트리거                           |
| ----------- | ------------------------ | -------------------------------- |
| `build-fix` | Turborepo 빌드 에러 해결 | "빌드 에러", "build 실패"        |
| `dep-check` | 의존성 검사 및 업데이트  | "의존성 체크", "패키지 업데이트" |

### 도메인 전문가 (4)

| 스킬                     | 설명                          | 트리거                   |
| ------------------------ | ----------------------------- | ------------------------ |
| `cesium-expert`          | CesiumJS 3D 지도 전문가       | "지도", "Cesium", "GIS"  |
| `three-expert`           | Three.js/R3F 전문가           | "3D", "Three.js", "모델" |
| `streaming-expert`       | HLS/WHEP 영상 스트리밍 전문가 | "CCTV", "HLS", "WHEP"    |
| `construction-materials` | 건설현장 3D 재질 전문가       | 건설 모델 재질 적용 시   |

### React & 웹 표준 (3)

| 스킬                    | 설명                                     | 트리거                                |
| ----------------------- | ---------------------------------------- | ------------------------------------- |
| `react19-patterns`      | React 19 최신 패턴 가이드                | "React 19 패턴", "use hook"           |
| `react-best-practices`  | Vercel Engineering 40+ React 최적화 규칙 | React 코드 작성/리뷰 시 자동          |
| `web-design-guidelines` | Web Interface Guidelines 준수 검사       | "review my UI", "check accessibility" |

## AGENTS.md

`AGENTS.md`에 FE 코딩 컨벤션이 포함되어 있습니다:

- React 19 필수 패턴 (no forwardRef, 메모이제이션 최소)
- TypeScript strict 규칙
- 파일/폴더 네이밍 컨벤션
- 컴포넌트 패턴 (CVA, Composition)
- Zustand 상태관리 규칙
- API 서비스 레이어 패턴

## Context7 MCP 연동

다음 스킬들이 Context7 MCP를 통해 **최신 라이브러리 문서를 실시간 참조**합니다:

| 스킬               | Context7으로 확인하는 문서                                  |
| ------------------ | ----------------------------------------------------------- |
| `react19-patterns` | React 19 신규 Hook API (use, useOptimistic, useActionState) |
| `cesium-expert`    | CesiumJS 최신 API, Entity/Primitive 문서                    |
| `three-expert`     | Three.js/R3F 최신 API, 드라이 패턴                          |
| `streaming-expert` | HLS.js, WebRTC 최신 스펙                                    |

### Context7 설치 (필수)

```bash
# Claude Code에 Context7 MCP 추가
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

설치 확인:

```bash
claude mcp list
```

## 설치

```bash
claude plugin install ./plugins/plx-frontend
```
