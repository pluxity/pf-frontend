import { Routes, Route, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";
import { ProtectedRouter } from "@pf-dev/services";

import { AdminLayout } from "@/layouts";
import {
  HomePage,
  LoginPage,
  DashboardPage,
  CrudCardPage,
  CrudListPage,
  CrudListCreatePage,
  CrudListDetailPage,
  UserAccountsPage,
  PermissionsPage,
  RolesPage,
} from "@/pages";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* 로그인 페이지 (인증 불필요) */}
      <Route path="/login" element={<LoginPage />} />

      {/* 인증 필요한 라우트 */}
      <Route
        element={
          <ProtectedRouter>
            <AdminLayout />
          </ProtectedRouter>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* 사용자 관리 */}
        <Route path="users/accounts" element={<UserAccountsPage />} />
        <Route path="users/permissions" element={<PermissionsPage />} />
        <Route path="users/roles" element={<RolesPage />} />

        {/* 예제 */}
        <Route path="examples/crud-card" element={<CrudCardPage />} />
        <Route path="examples/crud-list" element={<CrudListPage />} />
        <Route path="examples/crud-list/create" element={<CrudListCreatePage />} />
        <Route path="examples/crud-list/:id" element={<CrudListDetailPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
