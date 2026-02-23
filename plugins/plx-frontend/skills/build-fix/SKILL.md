---
name: build-fix
description: Turborepo 빌드 에러 해결. "빌드 에러", "build 실패", "turbo 에러" 요청 시 사용.
allowed-tools: Read, Bash, Glob, Grep
---

# PF 빌드 에러 해결 전문가

$ARGUMENTS 빌드 에러를 분석하고 해결합니다.

---

## 진단 프로세스

### 1단계: 에러 유형 파악

```bash
# 전체 빌드 로그 확인
pnpm build 2>&1 | head -100

# 특정 패키지만 빌드
pnpm --filter @pf-dev/ui build
```

### 2단계: 일반적인 에러 패턴

---

## 🔴 TypeScript 에러

### 타입 불일치

```
error TS2322: Type 'string' is not assignable to type 'number'
```

**해결:**

1. 해당 파일의 타입 정의 확인
2. Props 인터페이스와 실제 사용 비교
3. tsconfig.json의 strict 설정 확인

### 모듈 찾을 수 없음

```
error TS2307: Cannot find module '@pf-dev/ui' or its corresponding type declarations
```

**해결:**

```bash
# 1. 의존성 재설치
pnpm install

# 2. 패키지 빌드 순서 확인
pnpm --filter @pf-dev/ui build

# 3. tsconfig의 paths 확인
cat tsconfig.json | grep -A 10 "paths"
```

### noUncheckedIndexedAccess 에러

```
error TS18048: 'items[0]' is possibly 'undefined'
```

**해결:**

```tsx
// ❌ 에러
const first = items[0];
first.name;

// ✅ 해결
const first = items[0];
if (first) {
  first.name;
}

// 또는
const first = items.at(0);
```

---

## 🔴 Turborepo 에러

### 캐시 문제

```
error: could not find output "dist" in cache
```

**해결:**

```bash
# 캐시 삭제
pnpm clean

# 또는
rm -rf node_modules/.cache/turbo
```

### 의존성 순서 문제

```
@pf-dev/ui:build: error: Cannot find module '@pf-dev/api'
```

**해결:**

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"] // 의존 패키지 먼저 빌드
    }
  }
}
```

### 순환 의존성

```
Circular dependency detected
```

**해결:**

1. `pnpm why 패키지명`으로 의존성 트리 확인
2. 공통 타입을 별도 패키지로 분리
3. 인터페이스와 구현 분리

---

## 🔴 Vite 에러

### 환경변수 누락

```
Uncaught ReferenceError: process is not defined
```

**해결:**

```ts
// vite.config.ts
export default defineConfig({
  define: {
    "process.env": {},
  },
});
```

### 외부 패키지 번들링 문제

```
[vite]: Rollup failed to resolve import "cesium"
```

**해결:**

```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ["cesium"],
  },
  build: {
    commonjsOptions: {
      include: [/cesium/, /node_modules/],
    },
  },
});
```

---

## 🔴 pnpm/workspace 에러

### catalog 버전 불일치

```
ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER  catalog: is not supported
```

**해결:**

```yaml
# pnpm-workspace.yaml에 catalog 정의 확인
catalog:
  react: ^19.2.0
```

### 피어 의존성 경고

```
WARN  Issues with peer dependencies found
```

**해결:**

```bash
# .npmrc에 추가
auto-install-peers=true
strict-peer-dependencies=false
```

---

## 🔴 ESLint 에러

### 빌드 시 린트 에러로 실패

```
error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

**해결 옵션:**

```bash
# 1. 린트 무시하고 빌드 (임시)
pnpm build --no-lint

# 2. 해당 파일 수정
# 3. eslint-disable 주석 (최후의 수단)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

---

## 빠른 해결 명령어

```bash
# 전체 초기화 (최후의 수단)
pnpm clean && rm -rf node_modules && pnpm install && pnpm build

# 특정 패키지만 재빌드
pnpm --filter @pf-dev/ui build --force

# 의존성 그래프 확인
pnpm turbo run build --graph

# 캐시 없이 빌드
pnpm turbo run build --force
```

---

## 에러 보고 시 포함할 정보

1. 전체 에러 메시지
2. 어떤 패키지/앱에서 발생했는지
3. 최근 변경사항
4. `pnpm -v`, `node -v` 버전
