# CI/CD 가이드

## 개요

main 브랜치에 PR이 머지되면 GitHub Actions가 자동으로 스테이징 서버에 배포합니다.
Turborepo를 활용하여 변경된 앱만 감지하고, 설정 파일 기반으로 동적 배포를 수행합니다.

## 배포 흐름

```
PR 머지 → detect-changes → deploy-config.json 매칭 → 동적 matrix 생성 → 변경된 앱만 빌드/배포
```

## 현재 배포 설정

| 앱 | 배포 경로 | 환경 |
|----|-----------|------|
| `yongin-platform-app` | `/home/pluxity/docker/yonginplatform/front/` | staging |
| `yongin-platform-admin` | `/home/pluxity/docker/yonginplatform/front/admin/` | staging |

## 새 앱 추가 방법

### 1. deploy-config.json 수정

`.github/deploy-config.json` 파일에 새 앱 정보를 추가합니다:

```json
{
  "yongin-platform-app": {
    "path": "/home/pluxity/docker/yonginplatform/front/",
    "env": "staging"
  },
  "yongin-platform-admin": {
    "path": "/home/pluxity/docker/yonginplatform/front/admin/",
    "env": "staging"
  },
  "새-앱-이름": {
    "path": "/home/pluxity/docker/새경로/",
    "env": "staging"
  }
}
```

**필드 설명:**
- `path`: 서버에서 빌드 파일이 배포될 절대 경로
- `env`: 빌드 환경 (`staging`, `production` 등)

### 2. 앱에 빌드 스크립트 확인

해당 앱의 `package.json`에 빌드 스크립트가 있어야 합니다:

```json
{
  "scripts": {
    "build:staging": "vite build --mode staging"
  }
}
```

### 3. 환경 변수 파일 확인

앱 디렉토리에 `.env.staging` 파일이 있어야 합니다:

```env
VITE_CONTEXT_PATH=/app-path
VITE_API_BASE_PATH=/api
```

### 4. 서버에 배포 경로 생성

스테이징 서버에서 배포 경로를 미리 생성합니다:

```bash
ssh user@dev.pluxity.com
mkdir -p /home/pluxity/docker/새경로/
```

### 5. Nginx 설정 (필요시)

새 앱에 대한 Nginx 설정이 필요한 경우 서버에서 설정합니다.

## 워크플로우 파일

`.github/workflows/deploy-staging.yml`

**주요 단계:**
1. **detect-changes**: Turborepo로 변경된 앱 감지
2. **deploy**: 변경된 앱만 병렬로 빌드 & 배포

## Secrets 설정

Organization Secrets (pluxity)에 등록되어 있습니다:

| Secret | 설명 |
|--------|------|
| `PLX_DEV_DOMAIN` | 서버 도메인 (예: `dev.pluxity.com`) |
| `PLX_DEV_USER` | SSH 사용자명 |
| `PLX_DEV_PASSWORD` | SSH 비밀번호 |
| `PLX_DEV_SSH_PORT` | SSH 포트 |

## 트러블슈팅

### 배포가 트리거되지 않음

1. PR이 main 브랜치로 머지되었는지 확인
2. 변경된 파일이 `apps/` 디렉토리 내에 있는지 확인
3. deploy-config.json에 해당 앱이 등록되어 있는지 확인

### 빌드 실패

1. 해당 앱에 `build:staging` 스크립트가 있는지 확인
2. `.env.staging` 파일이 있는지 확인
3. GitHub Actions 로그에서 에러 메시지 확인

### SSH 배포 실패

1. Organization Secrets가 올바르게 설정되어 있는지 확인
2. 서버에서 배포 경로에 쓰기 권한이 있는지 확인
3. 방화벽에서 SSH 포트가 열려 있는지 확인

### 특정 앱만 수동 배포하고 싶을 때

현재는 PR 머지 시 자동 배포만 지원합니다.
수동 배포가 필요한 경우 로컬에서 직접 빌드 후 scp로 배포:

```bash
# 빌드
pnpm turbo build:staging --filter=앱이름

# 배포
scp -r apps/앱이름/dist/* user@dev.pluxity.com:/배포/경로/
```

## 관련 파일

```
pf-frontend/
├── .github/
│   ├── deploy-config.json      # 앱별 배포 설정
│   └── workflows/
│       └── deploy-staging.yml  # 자동 배포 워크플로우
├── apps/
│   ├── yongin-platform-app/
│   │   ├── .env.staging
│   │   └── dist/               # 빌드 결과물
│   └── yongin-platform-admin/
│       ├── .env.staging
│       └── dist/
└── CI-CD.md                    # 이 문서
```
