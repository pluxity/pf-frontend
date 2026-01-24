# PLUXITY 프론트엔드 모노레포 (pf-frontend)

## 프로젝트 개요

PLUXITY 프론트엔드 팀의 React 모노레포 프로젝트입니다.

- **모노레포**: Turborepo + pnpm (catalog 패턴)
- **Node**: >= 22.0.0
- **패키지 매니저**: pnpm 10.x

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| Framework | React | 19.x |
| Build | Vite | 7.x |
| Language | TypeScript | 5.9.x |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | 5.x |
| Form | react-hook-form + Zod | - |
| 3D Map | CesiumJS | - |
| 3D Viewer | React Three Fiber | - |
| Streaming | HLS.js, WHEP | - |

## 프로젝트 구조

```
pf-frontend/
├── apps/                    # 애플리케이션
│   ├── model-gps-tool/      # 3D 모델 GPS 매핑 도구
│   ├── yongin-platform-app/ # 용인 스마트시티 (개발중)
│   └── yongin-platform-admin/ # 용인 관리자 (개발중)
├── packages/                # 공유 패키지
│   ├── ui/                  # @pf-dev/ui - UI 컴포넌트 라이브러리
│   ├── api/                 # @pf-dev/api - API 클라이언트
│   ├── services/            # @pf-dev/services - 공통 서비스 (인증 등)
│   ├── map/                 # @pf-dev/map - CesiumJS 3D 지도
│   ├── three/               # @pf-dev/three - Three.js 3D 뷰어
│   └── cctv/                # @pf-dev/cctv - 영상 스트리밍
├── tooling/                 # 공유 설정
│   ├── eslint-config/       # ESLint 설정
│   └── typescript-config/   # TypeScript 설정
└── turbo/
    └── generators/          # 앱 생성기 (Plop)
```

## 자주 쓰는 명령어

```bash
# 개발
pnpm dev                              # 전체 개발 서버
pnpm --filter 앱이름 dev              # 특정 앱만 실행
pnpm storybook                        # Storybook 실행

# 빌드
pnpm build                            # 전체 빌드
pnpm turbo build:staging --filter=앱  # 스테이징 빌드

# 린트 & 포맷
pnpm lint                             # ESLint
pnpm format                           # Prettier

# 앱 생성
pnpm turbo gen app                    # 일반 앱 생성
pnpm turbo gen admin                  # Admin 앱 생성

# 버전 관리
pnpm bump                             # 버전 업데이트
pnpm tag                              # Git 태그 생성
```

---

## 코딩 컨벤션

### 파일/폴더 네이밍

- **컴포넌트**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **hooks**: camelCase with `use` prefix (`useAuth.ts`, `useMapStore.ts`)
- **유틸리티**: camelCase (`formatDate.ts`, `cn.ts`)
- **타입 파일**: `types.ts` 또는 `*.types.ts`
- **스토어**: `*.store.ts`
- **서비스**: `*.service.ts`

### 앱 폴더 구조

```
src/
├── layouts/          # 레이아웃 컴포넌트
├── pages/            # 페이지 컴포넌트
├── routes/           # 라우팅 설정
├── services/         # API 서비스 (앱 전용)
│   ├── client.ts     # API 클라이언트 인스턴스
│   └── *.service.ts  # 도메인별 서비스
├── stores/           # Zustand 스토어 (앱 전용)
└── styles/           # 전역 스타일
```

### TypeScript 규칙

- **strict 모드** 필수 (noUncheckedIndexedAccess 포함)
- **`any` 타입 금지** - `unknown` 사용
- **미사용 변수**: `_` 접두사 허용 (`_unused`)
- **Props 인터페이스**: 컴포넌트명 + `Props` (`ButtonProps`)

### Prettier 설정

```json
{
  "semi": true,
  "singleQuote": false,      // 큰따옴표 사용
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## React 19 패턴 (중요!)

이 프로젝트는 **React 19**를 사용합니다. 최신 패턴을 따라주세요.

### 1. forwardRef 불필요

```tsx
// ❌ 이전 방식
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// ✅ React 19 방식
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

### 2. 메모이제이션은 필요한 경우만

React Compiler가 자동 최적화를 지원합니다. **불필요한 메모이제이션은 오히려 오버헤드**가 됩니다.

```tsx
// ❌ 불필요 - 단순 값/함수는 그냥 사용
const memoizedValue = useMemo(() => data, [data]);
const memoizedFn = useCallback(() => onClick(), [onClick]);

// ✅ 필요한 경우만 사용
// 1. 복잡한 계산 (O(n²) 이상)
const sorted = useMemo(() => items.sort((a, b) => complexSort(a, b)), [items]);

// 2. 외부 라이브러리에 전달하는 객체 (Cesium, Three.js 등)
const mapOptions = useMemo(() => ({ center, zoom }), [center, zoom]);

// 3. 정말 무거운 컴포넌트 (수천 행 렌더링)
const HeavyTable = memo(function HeavyTable({ data }) { /* ... */ });
```

> 상세 가이드: @docs/react19-guide.md

### 3. 새로운 Hooks 활용

```tsx
// use() - Promise/Context 읽기
const data = use(dataPromise);
const theme = use(ThemeContext);

// useOptimistic - 낙관적 업데이트
const [optimisticTodos, addOptimistic] = useOptimistic(todos);

// useActionState - 폼 상태 관리 (Server Actions용)
const [state, formAction, isPending] = useActionState(action, initial);
```

### 4. Suspense 적극 활용

```tsx
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

---

## UI 컴포넌트 패턴 (@pf-dev/ui)

### Atomic Design 구조

```
atoms/       → 기본 컴포넌트 (Button, Input, Select)
molecules/   → 복합 컴포넌트 (Carousel, Widget)
organisms/   → 복잡한 컴포넌트 (Sidebar, DataTable)
templates/   → 페이지 템플릿
```

### CVA (Class Variance Authority) 패턴

```tsx
// variants.ts
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center", // base
  {
    variants: {
      variant: {
        default: "bg-brand text-white",
        secondary: "bg-neutral-50",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Button.tsx
import { cn } from "../../utils";
import { buttonVariants } from "./variants";

function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Composition Pattern

```tsx
// 서브 컴포넌트 조합
<Sidebar defaultCollapsed={false}>
  <Sidebar.Header title="Dashboard" />
  <Sidebar.Section label="메뉴">
    <Sidebar.Item icon={<Home />} active>홈</Sidebar.Item>
  </Sidebar.Section>
  <Sidebar.Footer />
</Sidebar>
```

---

## 상태관리 (Zustand)

### 기본 패턴

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  clearUser: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      clearUser: () => set({ user: null, isLoading: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Selector로 최적화
export const selectUser = (state: AuthStore) => state.user;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
```

### 사용

```tsx
// 전체 스토어
const { user, setUser } = useAuthStore();

// Selector (리렌더링 최적화)
const user = useAuthStore(selectUser);
```

---

## API 호출 패턴 (@pf-dev/api)

### 클라이언트 설정

```tsx
// services/client.ts
import { createApiClient } from "@pf-dev/api";

export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
  refreshTokenURL: "/auth/refresh-token",
  onUnauthorized: () => {
    useAuthStore.getState().clearUser();
    window.location.href = "/login";
  },
});
```

### 서비스 레이어

```tsx
// services/user.service.ts
import { apiClient } from "./client";

export const userService = {
  getMe: () => apiClient.get<User>("/users/me"),

  getUsers: (params: { page: number; size: number }) =>
    apiClient.get<PageResponse<User>>("/users", { params }),

  createUser: (data: CreateUserDto) =>
    apiClient.post<User>("/users", data),

  updateUser: (id: number, data: UpdateUserDto) =>
    apiClient.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) =>
    apiClient.delete<void>(`/users/${id}`),
};
```

---

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `VITE_API_URL` | API 서버 URL |
| `VITE_CONTEXT_PATH` | 앱 컨텍스트 경로 (예: `/admin`) |
| `VITE_ION_CESIUM_ACCESS_TOKEN` | Cesium Ion 토큰 |
| `VITE_MEDIA_API_URL` | 미디어 서버 URL |
| `VITE_MEDIA_WHEP_URL` | WHEP 스트리밍 URL |

---

## 배포

- **자동 배포**: main 브랜치 PR 머지 시 GitHub Actions 실행
- **설정**: `.github/deploy-config.json`에 앱 등록
- **상세**: `CI-CD.md` 참고

---

## 패키지 의존성 추가

```yaml
# pnpm-workspace.yaml의 catalog에 버전 추가
catalog:
  new-package: ^1.0.0

# 패키지에서 사용
{
  "dependencies": {
    "new-package": "catalog:"
  }
}
```

---

## 참고 문서

- @README.md - 프로젝트 전체 개요
- @CI-CD.md - CI/CD 및 배포 가이드
- @DEPLOY.md - 로컬 배포 테스트
- @docs/react19-guide.md - React 19 개발 가이드
- @docs/skills-guide.md - Claude Code Skills 활용 가이드
- @packages/ui/README.md - UI 컴포넌트 문서
- @packages/map/README.md - 3D 지도 패키지
- @packages/three/README.md - 3D 뷰어 패키지
- @packages/cctv/README.md - 영상 스트리밍 패키지
- @packages/services/README.md - 공통 서비스
