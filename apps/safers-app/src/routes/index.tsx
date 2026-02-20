import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";
import { ProtectedRouter } from "@pf-dev/services";
import { Spinner } from "@pf-dev/ui/atoms";

import { CCTVAIPage, DashboardPage, LoginPage, SitePage } from "@/pages";

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
        <Route path="site/:id" element={<SitePage />} />
        <Route path="cctv-ai" element={<CCTVAIPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
