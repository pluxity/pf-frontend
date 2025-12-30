# @pf-dev/services

공통 서비스 로직 패키지입니다.

## 설치

```bash
pnpm add @pf-dev/services
```

## 모듈

### Auth

인증 관련 훅, 컴포넌트, API를 제공합니다.

```typescript
import { useAuth, useLogin, AuthProvider, ProtectedRouter } from "@pf-dev/services/auth";
```

#### 사용 예시

```tsx
import { AuthProvider, ProtectedRouter } from "@pf-dev/services/auth";

function App() {
  return (
    <AuthProvider loginPath="/login">
      <ProtectedRouter>
        <Routes />
      </ProtectedRouter>
    </AuthProvider>
  );
}
```

## 개발

```bash
# 타입 체크
pnpm type-check

# 린트
pnpm lint

# 포맷
pnpm format
```
