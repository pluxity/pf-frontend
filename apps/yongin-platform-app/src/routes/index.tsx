import { Routes, Route, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";

import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/views";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Routes without authentication */}
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
