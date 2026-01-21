# CI/CD 가이드

## 개요

main 브랜치에 PR이 머지되면 GitHub Actions가 자동으로 스테이징 서버에 배포합니다.
Turborepo를 활용하여 변경된 앱만 감지하고, 설정 파일 기반으로 동적 배포를 수행합니다.

## 배포 흐름

```
PR 머지 → 변경된 앱 감지 → deploy-config.json 매칭 → 동적 matrix 생성
       → .env.staging 생성 (GitHub Secrets/Variables에서)
       → 변경된 앱만 빌드/배포
```

---

## 현재 배포 설정

| 앱                      | 배포 경로                                          | Secrets/Variables 그룹 |
| ----------------------- | -------------------------------------------------- | ---------------------- |
| `yongin-platform-app`   | `/home/pluxity/docker/yonginplatform/front/`       | YONGIN                 |
| `yongin-platform-admin` | `/home/pluxity/docker/yonginplatform/front/admin/` | YONGIN                 |

---

## 새 앱/프로젝트 추가 방법

### 1단계. deploy-config.json 수정

`.github/deploy-config.json` 파일에 새 앱 정보를 추가합니다:

```json
{
  "yongin-platform-app": {
    "path": "/home/pluxity/docker/yonginplatform/front/",
    "secretsKey": "YONGIN",
    "envVars": {
      "VITE_CONTEXT_PATH": ""
    }
  },
  "yongin-platform-admin": {
    "path": "/home/pluxity/docker/yonginplatform/front/admin/",
    "secretsKey": "YONGIN",
    "envVars": {
      "VITE_CONTEXT_PATH": "/admin"
    }
  },
  "새-프로젝트-app": {
    "path": "/home/pluxity/docker/새프로젝트/front/",
    "secretsKey": "새프로젝트",
    "envVars": {
      "VITE_CONTEXT_PATH": ""
    }
  },
  "새-프로젝트-admin": {
    "path": "/home/pluxity/docker/새프로젝트/front/admin/",
    "secretsKey": "새프로젝트",
    "envVars": {
      "VITE_CONTEXT_PATH": "/admin"
    }
  }
}
```

**필드 설명:**

| 필드         | 설명                                            | 예시                                         |
| ------------ | ----------------------------------------------- | -------------------------------------------- |
| `path`       | 서버에서 빌드 파일이 배포될 절대 경로           | `/home/pluxity/docker/yonginplatform/front/` |
| `secretsKey` | GitHub Secrets/Variables 그룹명 (프로젝트 단위) | `YONGIN`, `GAJA`                             |
| `envVars`    | 앱별 고유 환경변수                              | `{"VITE_CONTEXT_PATH": "/admin"}`            |

### 2단계. GitHub Secrets 등록 (새 프로젝트인 경우)

**위치:** GitHub → Repository → Settings → Secrets and variables → Actions → Secrets

새 프로젝트라면 `{프로젝트명}_SECRETS` 형태로 Secret을 등록합니다.

**예시: YONGIN_SECRETS**

```json
{
  "VITE_ION_CESIUM_ACCESS_TOKEN": "your-cesium-token",
  "VITE_OPENWEATHER_API_KEY": "your-openweather-key",
  "VITE_MEDIA_API_URL": "https://media.example.com/api",
  "VITE_MEDIA_WHEP_URL": "https://media.example.com/whep",
  "VITE_MEDIA_PTZ_URL": "https://media.example.com/ptz"
}
```

**다른 프로젝트 예시: GAJA_SECRETS**

```json
{
  "VITE_ION_CESIUM_ACCESS_TOKEN": "gaja-cesium-token",
  "VITE_SOME_OTHER_API_KEY": "gaja-api-key"
}
```

> **주의:** JSON 형태로 한 줄로 입력하거나, 줄바꿈 없이 입력해야 합니다.

### 3단계. GitHub Variables 등록 (프로젝트별 비민감 설정)

**위치:** GitHub → Repository → Settings → Secrets and variables → Actions → Variables

프로젝트별 비민감 설정은 `{프로젝트명}_VARS` 형태로 Variables에 등록합니다.

**예시: YONGIN_VARS**

```json
{
  "VITE_OPENWEATHER_CITY": "Yongin",
  "VITE_UPDATE_INTERVAL": "30000"
}
```

**예시: GAJA_VARS**

```json
{
  "VITE_OPENWEATHER_CITY": "Seoul",
  "VITE_UPDATE_INTERVAL": "60000"
}
```

### 4단계. 워크플로우 파일 수정 (새 프로젝트 Secrets/Variables 추가)

`.github/workflows/deploy-staging.yml` 파일의 `.env.staging 파일 생성` 단계에서 새 프로젝트의 Secrets와 Variables를 추가합니다:

```yaml
- name: .env.staging 파일 생성
  env:
    # 프로젝트별 Secrets (JSON 형태)
    YONGIN_SECRETS: ${{ secrets.YONGIN_SECRETS }}
    GAJA_SECRETS: ${{ secrets.GAJA_SECRETS }}
    새프로젝트_SECRETS: ${{ secrets.새프로젝트_SECRETS }} # ← 추가
    # 프로젝트별 Variables (JSON 형태)
    YONGIN_VARS: ${{ vars.YONGIN_VARS }}
    GAJA_VARS: ${{ vars.GAJA_VARS }}
    새프로젝트_VARS: ${{ vars.새프로젝트_VARS }} # ← 추가
```

### 5단계. 앱에 빌드 스크립트 확인

해당 앱의 `package.json`에 빌드 스크립트가 있어야 합니다:

```json
{
  "scripts": {
    "build:staging": "vite build --mode staging"
  }
}
```

### 6단계. 서버에 배포 경로 생성

스테이징 서버에서 배포 경로를 미리 생성합니다:

```bash
ssh user@dev.pluxity.com
mkdir -p /home/pluxity/docker/새프로젝트/front/
mkdir -p /home/pluxity/docker/새프로젝트/front/admin/
```

### 7단계. Nginx 설정 (필요시)

새 앱에 대한 Nginx 설정이 필요한 경우 서버에서 설정합니다.

---

## 환경변수 우선순위

`.env.staging` 파일은 다음 순서로 생성됩니다:

1. **프로젝트별 Secrets** (`YONGIN_SECRETS`, `GAJA_SECRETS` 등)
   - Cesium 토큰, API 키 등 민감한 값
2. **프로젝트별 Variables** (`YONGIN_VARS`, `GAJA_VARS` 등)
   - 도시명, 업데이트 간격 등 비민감 설정
3. **앱별 envVars** (`deploy-config.json`의 `envVars`)
   - `VITE_CONTEXT_PATH` 등 앱마다 다른 값

**생성되는 .env.staging 예시:**

```env
# YONGIN_SECRETS 에서
VITE_ION_CESIUM_ACCESS_TOKEN=xxx
VITE_OPENWEATHER_API_KEY=xxx
VITE_MEDIA_API_URL=https://...

# YONGIN_VARS 에서
VITE_OPENWEATHER_CITY=Yongin
VITE_UPDATE_INTERVAL=30000

# deploy-config.json envVars 에서
VITE_CONTEXT_PATH=/admin
```

---

## GitHub 설정 요약

### Secrets (민감한 값)

**위치:** Repository → Settings → Secrets and variables → Actions → Secrets

| Secret 이름        | 형태   | 설명                               |
| ------------------ | ------ | ---------------------------------- |
| `PLX_DEV_DOMAIN`   | String | 서버 도메인 (Organization Secret)  |
| `PLX_DEV_USER`     | String | SSH 사용자명 (Organization Secret) |
| `PLX_DEV_PASSWORD` | String | SSH 비밀번호 (Organization Secret) |
| `PLX_DEV_SSH_PORT` | String | SSH 포트 (Organization Secret)     |
| `YONGIN_SECRETS`   | JSON   | 용인 프로젝트 환경변수 (민감)      |
| `GAJA_SECRETS`     | JSON   | 가자 프로젝트 환경변수 (민감)      |

### Variables (비민감한 값)

**위치:** Repository → Settings → Secrets and variables → Actions → Variables

| Variable 이름 | 형태 | 설명                            |
| ------------- | ---- | ------------------------------- |
| `YONGIN_VARS` | JSON | 용인 프로젝트 환경변수 (비민감) |
| `GAJA_VARS`   | JSON | 가자 프로젝트 환경변수 (비민감) |

---

## 워크플로우 파일

`.github/workflows/deploy-staging.yml`

**주요 단계:**

1. **변경된 앱 감지**: Turborepo로 변경된 앱 감지, deploy-config.json과 매칭
2. **배포**:
   - GitHub Secrets/Variables에서 `.env.staging` 생성
   - 변경된 앱만 병렬로 빌드 & 배포

---

## 트러블슈팅

### 배포가 트리거되지 않음

1. PR이 main 브랜치로 머지되었는지 확인
2. 변경된 파일이 `apps/` 디렉토리 내에 있는지 확인
3. deploy-config.json에 해당 앱이 등록되어 있는지 확인

### 빌드 실패

1. 해당 앱에 `build:staging` 스크립트가 있는지 확인
2. GitHub Actions 로그에서 `.env.staging` 생성 내용 확인
3. 필요한 Secrets/Variables가 등록되어 있는지 확인

### 환경변수가 적용되지 않음

1. GitHub Secrets에 JSON 형태로 올바르게 등록했는지 확인
2. `secretsKey`가 deploy-config.json에 올바르게 설정되어 있는지 확인
3. 워크플로우 파일에 해당 Secrets/Variables가 env에 추가되어 있는지 확인

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

---

## 관련 파일

```
pf-dev/
├── .github/
│   ├── deploy-config.json          # 앱별 배포 설정
│   └── workflows/
│       └── deploy-staging.yml      # 자동 배포 워크플로우
├── apps/
│   ├── yongin-platform-app/
│   │   └── dist/                   # 빌드 결과물
│   └── yongin-platform-admin/
│       └── dist/
└── CI-CD.md                        # 이 문서
```

---

## 체크리스트: 새 프로젝트 추가

- [ ] `.github/deploy-config.json`에 앱 추가
- [ ] GitHub Secrets에 `{프로젝트명}_SECRETS` 등록 (JSON)
- [ ] GitHub Variables에 `{프로젝트명}_VARS` 등록 (JSON)
- [ ] `.github/workflows/deploy-staging.yml`의 env에 Secrets/Variables 추가
- [ ] 앱의 `package.json`에 `build:staging` 스크립트 확인
- [ ] 서버에 배포 경로 생성
- [ ] (필요시) Nginx 설정
