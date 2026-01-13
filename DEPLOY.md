# 로컬 Nginx 테스트 가이드

## 환경 구성

### 1. 환경 변수 파일

각 앱의 `.env.staging.local` 파일이 생성되어 있습니다:

**apps/demo-app/.env.staging.local:**

```env
VITE_CONTEXT_PATH=
VITE_API_BASE_PATH=/plug
```

**apps/demo-admin/.env.staging.local:**

```env
VITE_CONTEXT_PATH=/admin
VITE_API_BASE_PATH=/plug
```

### 2. Nginx 설정

`nginx.conf` 파일이 루트에 있습니다:

- **Listen:** 8080 포트
- **App:** `http://localhost:8080/`
- **Admin:** `http://localhost:8080/admin`
- **API 프록시:** `http://localhost:8080/plug/api` → `http://dev.pluxity.com/plug/api`

## 빌드 및 배포

### 방법 1: 스크립트 사용 (추천)

```bash
# Windows
.\scripts\deploy-local.bat

# Unix/Mac/Git Bash
bash scripts/deploy-local.sh

# 또는 npm script 사용
pnpm deploy:local
```

### 방법 2: 수동 빌드

```bash
# 1. demo-app 빌드
cd apps/demo-app
pnpm build:staging
cd ../..

# 2. demo-admin 빌드
cd apps/demo-admin
pnpm build:staging
cd ../..

# 3. 배포 디렉토리 생성 및 복사
mkdir -p deploy/admin
cp -r apps/demo-app/dist/* deploy/
cp -r apps/demo-admin/dist/* deploy/admin/
```

## Nginx 실행

### Windows

```bash
# nginx 설치 디렉토리에서
nginx -c C:\PLUXITY\Dev\Projects\New\pf-dev\nginx.conf

# 중지
nginx -s stop

# 재시작
nginx -s reload
```

### Unix/Mac

```bash
# nginx 실행
nginx -c $(pwd)/nginx.conf

# 중지
nginx -s stop

# 재시작
nginx -s reload
```

## 접속 테스트

1. **App:** http://localhost:8080/
2. **Admin:** http://localhost:8080/admin
3. **API:** http://localhost:8080/plug/api (프록시 → dev.pluxity.com)

## 인증 공유 테스트

1. Admin(http://localhost:8080/admin)에서 로그인
2. App(http://localhost:8080/)에서 새로고침
3. 쿠키가 공유되어 자동으로 로그인 상태 유지됨 ✅

## 디렉토리 구조

```
pf-dev/
├── nginx.conf                 # nginx 설정
├── scripts/
│   ├── deploy-local.sh       # Unix 배포 스크립트
│   └── deploy-local.bat      # Windows 배포 스크립트
├── apps/
│   ├── demo-app/
│   │   ├── .env.staging.local
│   │   └── dist/             # 빌드 결과물
│   └── demo-admin/
│       ├── .env.staging.local
│       └── dist/             # 빌드 결과물
└── deploy/                   # nginx가 서비스할 디렉토리
    ├── index.html            # app
    ├── assets/
    └── admin/
        ├── index.html        # admin
        └── assets/
```

## 트러블슈팅

### 포트 충돌

nginx가 8080 포트를 사용합니다. 충돌 시 nginx.conf에서 포트 변경:

```nginx
server {
    listen 9090;  # 원하는 포트로 변경
    ...
}
```

### 쿠키가 공유되지 않음

1. 같은 도메인(localhost)에서 접속 확인
2. API 경로가 `/plug/api`로 동일한지 확인
3. 브라우저 개발자 도구 > Application > Cookies 확인

### API 호출 실패

1. `dev.pluxity.com` 접근 가능한지 확인
2. nginx 프록시 설정 확인
3. 브라우저 Network 탭에서 요청 확인
