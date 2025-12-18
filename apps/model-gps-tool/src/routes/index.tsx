import { Routes, Route, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";

import { RootLayout } from "@/layouts/RootLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { HomePage, LoginPage, CalibratePage } from "@/pages";

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
      secondaryAction={{ label: "로그인", onClick: () => navigate("/login") }}
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/calibrate" element={<CalibratePage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
