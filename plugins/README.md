# PLUXITY Claude Code Plugins

PLUXITY 프로젝트를 위한 Claude Code 플러그인 모음입니다.

## 플러그인 목록

| 플러그인                        | 스킬 수 | 대상       | 설명                                |
| ------------------------------- | ------- | ---------- | ----------------------------------- |
| [plx-common](./plx-common/)     | 2       | FE/BE 공통 | Git 워크플로우 (커밋, PR)           |
| [plx-frontend](./plx-frontend/) | 22      | FE 전용    | React 19, 3D 지도, 영상 스트리밍 등 |
| plx-backend                     | -       | BE 전용    | 예정                                |

## 설치

```bash
# 공통 플러그인 (모든 프로젝트)
claude plugin install ./plugins/plx-common

# FE 프로젝트
claude plugin install ./plugins/plx-frontend
```

## 디렉토리 구조

```
plugins/
├── README.md                              ← 이 파일
│
├── plx-common/                            (2 skills)
│   ├── .claude-plugin/plugin.json
│   ├── skills/
│   │   ├── commit-workflow/SKILL.md       Git 커밋 워크플로우
│   │   └── pr-workflow/SKILL.md           GitHub PR 워크플로우
│   └── README.md
│
├── plx-frontend/                          (22 skills)
│   ├── .claude-plugin/plugin.json
│   ├── AGENTS.md                          FE 코딩 컨벤션
│   ├── skills/
│   │   ├── component/                     컴포넌트 생성
│   │   ├── storybook/                     Storybook 스토리
│   │   ├── doc-component/                 컴포넌트 문서화
│   │   ├── new-package/                   패키지 생성
│   │   ├── test-component/                컴포넌트 테스트
│   │   ├── test-hook/                     훅 테스트
│   │   ├── test-store/                    스토어 테스트
│   │   ├── code-review/                   코드 리뷰
│   │   ├── a11y/                          접근성 검사
│   │   ├── perf/                          성능 최적화
│   │   ├── feature-dev/                   기능 개발 플로우
│   │   ├── hotfix/                        긴급 버그 수정
│   │   ├── release/                       버전 릴리즈
│   │   ├── build-fix/                     빌드 에러 해결
│   │   ├── dep-check/                     의존성 검사
│   │   ├── cesium-expert/                 CesiumJS 전문가
│   │   ├── three-expert/                  Three.js 전문가
│   │   ├── streaming-expert/              영상 스트리밍 전문가
│   │   ├── construction-materials/        건설현장 재질
│   │   ├── react19-patterns/              React 19 패턴
│   │   ├── react-best-practices/          React 최적화 규칙
│   │   └── web-design-guidelines/         웹 UI 가이드라인
│   └── README.md
│
└── plx-backend/                           (예정)
```

## 스킬 매핑표

### plx-common (FE/BE 공통)

| 스킬              | 이전 이름 | 설명                            |
| ----------------- | --------- | ------------------------------- |
| `commit-workflow` | (신규)    | Git 커밋 컨벤션 + 워크플로우    |
| `pr-workflow`     | `pf-pr`   | GitHub PR 생성 (커밋 내용 분리) |

### plx-frontend (FE 전용)

| 스킬                     | 이전 이름                | 카테고리        |
| ------------------------ | ------------------------ | --------------- |
| `component`              | `pf-component`           | 코드 생성       |
| `storybook`              | `pf-storybook`           | 코드 생성       |
| `doc-component`          | `pf-doc-component`       | 코드 생성       |
| `new-package`            | `pf-new-package`         | 코드 생성       |
| `test-component`         | `pf-test-component`      | 테스트          |
| `test-hook`              | `pf-test-hook`           | 테스트          |
| `test-store`             | `pf-test-store`          | 테스트          |
| `code-review`            | `pf-code-review`         | 코드 품질       |
| `a11y`                   | `pf-a11y`                | 코드 품질       |
| `perf`                   | `pf-perf`                | 코드 품질       |
| `feature-dev`            | `pf-feature`             | 개발 워크플로우 |
| `hotfix`                 | `pf-hotfix`              | 개발 워크플로우 |
| `release`                | `pf-release`             | 개발 워크플로우 |
| `build-fix`              | `pf-build-fix`           | 빌드 & 의존성   |
| `dep-check`              | `pf-dep-check`           | 빌드 & 의존성   |
| `cesium-expert`          | `cesium-expert`          | 도메인 전문가   |
| `three-expert`           | `three-expert`           | 도메인 전문가   |
| `streaming-expert`       | `streaming-expert`       | 도메인 전문가   |
| `construction-materials` | `construction-materials` | 도메인 전문가   |
| `react19-patterns`       | `react19-patterns`       | React & 웹 표준 |
| `react-best-practices`   | `react-best-practices`   | React & 웹 표준 |
| `web-design-guidelines`  | `web-design-guidelines`  | React & 웹 표준 |
