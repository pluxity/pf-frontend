import { useMemo, Suspense } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";
import { ProtectedRouter, useAuthStore, selectUser } from "@pf-dev/services";

import { AdminLayout } from "@/layouts";

import { publicRoutes, protectedRoutes } from "./config";
import { flattenRoutes } from "./utils";
import type { RouteConfig } from "./types";

// 페이지 로딩 중 표시할 컴포넌트
function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      variant="403"
      primaryAction={{ label: "홈으로", onClick: () => navigate("/") }}
      secondaryAction={{ label: "이전 페이지", onClick: () => navigate(-1) }}
    />
  );
}

function RoleGuard({ route, children }: { route: RouteConfig; children: React.ReactNode }) {
  const user = useAuthStore(selectUser);
  const userRoles = useMemo(() => user?.roles.map((r) => r.name) ?? [], [user]);

  if (route.roles && route.roles.length > 0) {
    const hasRequiredRole = route.roles.some((role) => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const allProtectedRoutes = flattenRoutes(protectedRoutes);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.element />} />
        ))}

        <Route
          path="/403"
          element={
            <ProtectedRouter>
              <ForbiddenPage />
            </ProtectedRouter>
          }
        />

        <Route
          element={
            <ProtectedRouter>
              <AdminLayout />
            </ProtectedRouter>
          }
        >
          {allProtectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path === "/" ? undefined : route.path.slice(1)}
              index={route.path === "/"}
              element={
                <RoleGuard route={route}>
                  <route.element />
                </RoleGuard>
              }
            />
          ))}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
