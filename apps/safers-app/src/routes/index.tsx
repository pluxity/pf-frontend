import { Routes, Route, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";
// import { ProtectedRouter } from "@pf-dev/services"; // 개발 중 임시 제거

import { RootLayout } from "@/layouts/RootLayout";
import { DashboardPage, LoginPage, SitePage } from "@/pages";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes - 인증 임시 제거 */}
      <Route element={<RootLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="site" element={<SitePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
