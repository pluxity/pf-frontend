# @pf-dev/services 사용법

## Auth

### 1. 앱 설정

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@pf-dev/api";
import { AuthProvider } from "@pf-dev/services/auth";
import App from "./App";

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";

configureApi({
  baseURL: `${contextPath}/api`,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <AuthProvider loginPath="/login">
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

### 2. 라우트 보호

```tsx
// routes.tsx
import { ProtectedRouter } from "@pf-dev/services/auth";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRouter fallback={<div>로딩 중...</div>}>
        <RootLayout />
      </ProtectedRouter>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
```

### 3. 로그인 구현

```tsx
// LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMe, useAuthStore } from "@pf-dev/services/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      await login(credentials);
      const user = await getMe();
      setUser(user);
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return <div>{/* 로그인 폼 UI */}</div>;
}
```

### 4. 로그아웃 구현

```tsx
import { useNavigate } from "react-router-dom";
import { logout, useAuthStore } from "@pf-dev/services/auth";

function LogoutButton() {
  const navigate = useNavigate();
  const reset = useAuthStore((state) => state.reset);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      reset();
      navigate("/login");
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
}
```

### 5. 현재 사용자 정보 접근

```tsx
import { useAuthStore, selectUser, selectIsAuthenticated } from "@pf-dev/services/auth";

function UserInfo() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <div>
      <span>{user?.name}</span>
      <span>{user?.username}</span>
    </div>
  );
}
```

### 6. Role 기반 접근 제어 (Admin 앱)

```tsx
import { useAuthStore, selectUser, ProtectedRouter } from "@pf-dev/services/auth";
import { Navigate } from "react-router-dom";

function AdminProtectedRouter({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(selectUser);
  const isAdmin = user?.roles.some((role) => role.name === "ADMIN");

  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <ProtectedRouter>{children}</ProtectedRouter>;
}
```

### 환경 변수

```bash
# .env.development
VITE_CONTEXT_PATH=
VITE_DEV_SERVER=http://dev.pluxity.com
VITE_PROJECT_PATH=/aiot

# .env.production
VITE_CONTEXT_PATH=/aiot
```
