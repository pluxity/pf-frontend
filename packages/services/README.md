# @pf-dev/services

React 앱을 위한 공통 서비스 모듈 패키지.

## Auth

HttpOnly 쿠키 기반 인증 모듈.

### 구조

```text
auth/
├── api.ts       # API 함수 (login, logout, refresh, getMe)
├── store.ts     # Zustand store + selectors
├── context.ts   # AuthContext + useAuthContext
├── types.ts     # 타입 정의 (User, Role, LoginCredentials)
├── Provider.tsx # AuthProvider 컴포넌트
├── Router.tsx   # ProtectedRouter 컴포넌트
└── index.ts     # exports
```

### Exports

#### API 함수

- `login(credentials)` - 로그인
- `logout()` - 로그아웃
- `refresh()` - 토큰 갱신
- `getMe()` - 현재 사용자 정보 조회

#### Store

- `useAuthStore` - Zustand store hook
- `selectUser` - user selector
- `selectIsLoading` - isLoading selector
- `selectIsAuthenticated` - 인증 여부 selector

#### Components

- `AuthProvider` - 앱 시작 시 인증 상태 초기화
- `ProtectedRouter` - 인증 필요 라우트 보호

#### Hooks

- `useAuthContext` - AuthProvider의 context 접근

#### Types

- `User` - 사용자 정보
- `Role` - 역할 정보
- `LoginCredentials` - 로그인 요청 데이터
