# PLUXITY Frontend 코딩 컨벤션

이 문서는 plx-frontend 플러그인이 활성화된 프로젝트에서 서브에이전트(Task)가 따라야 할 FE 코딩 컨벤션입니다.

---

## React 19 필수 패턴

### forwardRef 사용 금지

```tsx
// ❌ 금지
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// ✅ React 19
function Input({ ref, ...props }: InputProps) {
  return <input ref={ref} {...props} />;
}
```

### 메모이제이션 최소 원칙

- 단순 값/함수: 그냥 사용 (useMemo/useCallback 금지)
- 복잡한 계산 (O(n²) 이상): `useMemo` 허용
- 외부 라이브러리 객체 (Cesium, Three.js): `useMemo` 허용
- 수천 행 렌더링: `memo` 허용
- **확실하지 않으면 사용하지 않는다**

### Suspense 우선

- 로딩 상태는 `Suspense` + fallback으로 처리
- ErrorBoundary와 함께 사용

---

## TypeScript 규칙

- **strict 모드 필수** (noUncheckedIndexedAccess 포함)
- **`any` 타입 절대 금지** → `unknown` 사용
- 미사용 변수: `_` 접두사 (`_unused`)
- Props 인터페이스: `컴포넌트명Props` (`ButtonProps`)
- 타입 추론 활용: 불필요한 타입 명시 피함

---

## 파일/폴더 네이밍

| 대상      | 규칙                         | 예시                            |
| --------- | ---------------------------- | ------------------------------- |
| 컴포넌트  | PascalCase                   | `Button.tsx`, `UserProfile.tsx` |
| hooks     | camelCase + use 접두사       | `useAuth.ts`, `useMapStore.ts`  |
| 유틸리티  | camelCase                    | `formatDate.ts`, `cn.ts`        |
| 타입 파일 | `types.ts` 또는 `*.types.ts` | `user.types.ts`                 |
| 스토어    | `*.store.ts`                 | `auth.store.ts`                 |
| 서비스    | `*.service.ts`               | `user.service.ts`               |

---

## 컴포넌트 패턴

### named export만 사용 (default export 금지)

```tsx
// ❌
export default function Button() {}

// ✅
export function Button() {}
```

### CVA (Class Variance Authority) 패턴

variant가 많은 컴포넌트는 CVA 사용:

```tsx
import { cva } from "class-variance-authority";
import { cn } from "../../utils";

const buttonVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: { default: "bg-brand text-white", secondary: "bg-neutral-50" },
    size: { sm: "h-8 px-4 text-xs", md: "h-10 px-5 text-sm" },
  },
  defaultVariants: { variant: "default", size: "md" },
});

function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

### Composition Pattern

복잡한 컴포넌트는 서브 컴포넌트 조합:

```tsx
<Sidebar>
  <Sidebar.Header title="Dashboard" />
  <Sidebar.Section label="메뉴">
    <Sidebar.Item icon={<Home />} active>
      홈
    </Sidebar.Item>
  </Sidebar.Section>
</Sidebar>
```

### 컴포넌트 크기 제한

- 500줄 이상이면 분리 검토
- 3단계 이상 prop drilling 금지 → Context 또는 Zustand 사용

---

## 상태관리 (Zustand)

### Selector 필수

```tsx
// ❌ 전체 스토어 구독 (불필요한 리렌더링)
const { user } = useAuthStore();

// ✅ Selector로 필요한 값만 구독
const user = useAuthStore(selectUser);
```

### State/Actions 인터페이스 분리

```tsx
interface AuthState {
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  clearUser: () => void;
}

type AuthStore = AuthState & AuthActions;
```

### persist 사용 시 partialize 필수

```tsx
persist(store, {
  name: "auth-storage",
  partialize: (state) => ({ user: state.user }), // 필요한 것만
});
```

---

## API 호출

### 서비스 레이어 패턴 필수

```tsx
// ❌ 컴포넌트에서 직접 호출 금지
const data = await apiClient.get("/users");

// ✅ 서비스 레이어 사용
const data = await userService.getUsers(params);
```

### 서비스 파일 구조

```tsx
// services/user.service.ts
export const userService = {
  getUsers: (params) => apiClient.get<User[]>("/users", { params }),
  createUser: (data) => apiClient.post<User>("/users", data),
};
```

---

## 스타일링

- `cn()` 유틸리티로 동적 클래스 병합
- Tailwind CSS 클래스 사용
- 인라인 스타일 지양

---

## Prettier 설정

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- **큰따옴표** 사용 (singleQuote: false)
- 세미콜론 필수

---

## 보안

- `dangerouslySetInnerHTML` 사용 금지
- 환경변수에 민감 정보 노출 금지
- 사용자 입력은 Zod 스키마로 검증
