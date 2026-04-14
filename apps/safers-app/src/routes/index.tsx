import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";
import { ProtectedRouter } from "@pf-dev/services";
import { Spinner } from "@pf-dev/ui/atoms";

import { DashboardPage, LoginPage } from "@/pages";

const SitePage = lazy(() => import("@/pages/site").then((m) => ({ default: m.SitePage })));
const CCTVAIPage = lazy(() => import("@/pages/cctv-ai").then((m) => ({ default: m.CCTVAIPage })));
const CCTVPlaybackPage = lazy(() =>
  import("@/pages/cctv-playback").then((m) => ({ default: m.CCTVPlaybackPage }))
);

function LazyFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

function AuthLayout() {
  return (
    <ProtectedRouter
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Outlet />
    </ProtectedRouter>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — 인증 필요 */}
      <Route element={<AuthLayout />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="site/:id"
          element={
            <Suspense fallback={<LazyFallback />}>
              <SitePage />
            </Suspense>
          }
        />
        <Route
          path="cctv-ai/:siteId"
          element={
            <Suspense fallback={<LazyFallback />}>
              <CCTVAIPage />
            </Suspense>
          }
        />
        <Route
          path="cctv-playback/:siteId"
          element={
            <Suspense fallback={<LazyFallback />}>
              <CCTVPlaybackPage />
            </Suspense>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
