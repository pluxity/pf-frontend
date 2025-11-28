# PF-Dev

PLUXITY 프론트엔드 모노레포 프로젝트

## 기술 스택

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| Framework | React | ^19.2.0 |
| Build Tool | Vite | ^6.4.1 |
| Styling | Tailwind CSS | ^4.1.17 |
| Language | TypeScript | ^5.9.3 |
| State Management | Zustand | ^5.0.8 |
| Form | react-hook-form | ^7.66.1 |
| Validation | Zod | ^3.25.76 |
| Linting | ESLint | ^9.39.1 |
| Documentation | Storybook | ^8.6.14 |
| Monorepo | Turborepo | ^2.6.1 |
| Package Manager | pnpm | ^10.15.1 |

## 프로젝트 구조

```
pf-dev/
├── apps/
│   └── test/                 # 테스트 애플리케이션
├── packages/
│   └── ui/                   # 공유 UI 컴포넌트 라이브러리
├── package.json
├── pnpm-workspace.yaml       # 의존성 버전 중앙 관리 (catalog)
├── turbo.json
├── tsconfig.base.json
└── eslint.config.js
```

## 시작하기

### 요구사항

- Node.js >= 20.0.0
- pnpm >= 10.x

### 설치

```bash
pnpm install
```

### 개발

```bash
# 전체 개발 서버 실행
pnpm dev

# 특정 앱만 실행
pnpm --filter @pf-dev/test dev

# Storybook 실행
pnpm storybook
```

### 빌드

```bash
# 전체 빌드
pnpm build

# 특정 패키지만 빌드
pnpm --filter @pf-dev/ui build
```

### 린트

```bash
pnpm lint
```

## 패키지

### apps/test

Vite + React 기반 테스트 애플리케이션

- Zustand를 활용한 상태 관리 예시
- react-hook-form + Zod를 활용한 폼 유효성 검사 예시
- @pf-dev/ui 컴포넌트 사용 예시

### packages/ui

공유 UI 컴포넌트 라이브러리

- Tailwind CSS v4 기반 스타일링
- Storybook을 통한 컴포넌트 문서화
- TypeScript 타입 정의 제공

## 디자인

- [Figma](https://www.figma.com/design/kbmp7HXgqTatLLoaevocUK/MCP?node-id=195-1446&p=f&m=draw)

## 의존성 관리

모든 의존성 버전은 `pnpm-workspace.yaml`의 `catalog`에서 중앙 관리됩니다.

```yaml
catalog:
  react: ^19.2.0
  vite: ^6.4.1
  # ...
```

각 패키지에서는 `catalog:` 프로토콜로 참조:

```json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```
