# PF-Dev

PLUXITY 프론트엔드 모노레포 프로젝트

## 기술 스택

| 카테고리         | 기술            | 버전     |
| ---------------- | --------------- | -------- |
| Framework        | React           | ^19.2.0  |
| Build Tool       | Vite            | ^6.4.1   |
| Styling          | Tailwind CSS    | ^4.1.17  |
| Language         | TypeScript      | ^5.9.3   |
| State Management | Zustand         | ^5.0.8   |
| Form             | react-hook-form | ^7.66.1  |
| Validation       | Zod             | ^3.25.76 |
| Linting          | ESLint          | ^9.39.1  |
| Documentation    | Storybook       | ^8.6.14  |
| Monorepo         | Turborepo       | ^2.6.1   |
| Package Manager  | pnpm            | ^10.15.1 |

## 프로젝트 구조

```
pf-dev/
├── apps/
│   ├── isr/                          # 내부 테스트 앱
│   ├── model-gps-tool/               # 모델 GPS 도구
│   ├── yongin-platform-app/          # 용인 플랫폼 앱
│   └── yongin-platform-admin/        # 용인 플랫폼 관리자
├── packages/
│   ├── api/                          # API 클라이언트 모듈
│   ├── cctv/                         # CCTV 스트리밍 패키지
│   ├── map/                          # CesiumJS 지도 패키지
│   ├── services/                     # 공통 서비스 모듈
│   ├── three/                        # Three.js 3D 뷰어 패키지
│   └── ui/                           # 공유 UI 컴포넌트 라이브러리
├── turbo/
│   └── generators/                   # Turbo 앱 생성기
├── .github/
│   ├── deploy-config.json            # 배포 설정
│   └── workflows/
│       └── deploy-staging.yml        # 스테이징 자동 배포
├── package.json
├── pnpm-workspace.yaml               # 의존성 버전 중앙 관리 (catalog)
├── turbo.json
├── tsconfig.base.json
└── eslint.config.js
```

---

## Packages

| 패키지                                            | 버전    | 설명                                                                   |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| [@pf-dev/ui](./packages/ui/README.md)             | `1.2.5` | TypeScript, Tailwind CSS, Radix UI 기반 모던 React 컴포넌트 라이브러리 |
| [@pf-dev/map](./packages/map/README.md)           | `0.1.1` | CesiumJS 기반 3D 지도 시각화 React 패키지                              |
| [@pf-dev/three](./packages/three/README.md)       | `0.4.0` | React Three Fiber 기반 독립형 3D 시각화 패키지                         |
| [@pf-dev/cctv](./packages/cctv/README.md)         | `0.1.0` | HLS/WHEP 프로토콜 지원 실시간 영상 스트리밍 패키지                     |
| [@pf-dev/services](./packages/services/README.md) | `0.2.0` | HttpOnly 쿠키 기반 인증 등 공통 서비스 모듈                            |
| [@pf-dev/api](./packages/api/README.md)           | `0.1.1` | API 클라이언트 및 타입 정의 (README 미작성)                            |

---

## Apps

현재 개발 중인 앱 목록입니다.

| 앱                    | 설명                   | 배포 상태 |
| --------------------- | ---------------------- | --------- |
| yongin-platform-app   | 용인 스마트시티 플랫폼 | 스테이징  |
| yongin-platform-admin | 용인 스마트시티 관리자 | 스테이징  |
| isr                   | 내부 테스트/개발용     | -         |
| model-gps-tool        | 3D 모델 GPS 매핑 도구  | -         |

---

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
pnpm --filter yongin-platform-app dev

# Storybook 실행
pnpm storybook
```

### 빌드

```bash
# 전체 빌드
pnpm build

# 특정 패키지만 빌드
pnpm --filter @pf-dev/ui build

# 스테이징 빌드
pnpm turbo build:staging --filter=yongin-platform-app
```

### 린트

```bash
pnpm lint
```

---

## 새 앱 생성 (Turbo Generator)

Turborepo Generator를 사용하여 새 앱을 쉽게 생성할 수 있습니다.

### 일반 앱 생성

```bash
pnpm turbo gen app
```

**프롬프트:**

- 앱 이름 (lowercase, hyphens)
- 설명
- 개발 서버 포트
- 패키지 포함 여부 (@pf-dev/cctv, @pf-dev/map, @pf-dev/three)
- 인증 사용 여부

### Admin 앱 생성

```bash
pnpm turbo gen admin
```

**프롬프트:**

- 앱 이름
- 설명
- 개발 서버 포트
- Dashboard 페이지 포함 여부
- CRUD 예제 포함 여부 (Card/List)
- 패키지 포함 여부

### 생성 후 작업

1. 의존성 설치: `pnpm install`
2. 개발 서버 실행: `pnpm --filter <app-name> dev`

---

## CI/CD 및 배포

### 자동 배포 (스테이징)

main 브랜치에 PR이 머지되면 GitHub Actions가 자동으로 스테이징 서버에 배포합니다.

자세한 내용은 **[CI-CD.md](./CI-CD.md)**를 참고하세요.

- 배포 설정 방법
- 새 프로젝트 추가 방법
- GitHub Secrets/Variables 설정
- 트러블슈팅

### 로컬 테스트 (Nginx)

로컬에서 Nginx를 통해 배포 환경을 테스트할 수 있습니다.

자세한 내용은 **[DEPLOY.md](./DEPLOY.md)**를 참고하세요.

---

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

---

## 디자인

- [Figma](https://www.figma.com/design/kbmp7HXgqTatLLoaevocUK/MCP?node-id=195-1446&p=f&m=draw)

---

## 버전 관리

패키지 버전은 `pnpm bump`와 `pnpm tag` 명령으로 관리합니다.

```bash
# 버전 업데이트
pnpm bump

# Git 태그 생성
pnpm tag
```

태그 형식: `@pf-dev/<package>@<version>` (예: `@pf-dev/ui@1.2.5`)
