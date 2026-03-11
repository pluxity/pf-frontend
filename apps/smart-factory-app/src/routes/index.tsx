import { Routes, Route, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";

import { RootLayout } from "@/layouts/RootLayout";
import { HomePage, FactoryView, IFCViewerView, ModelViewerView } from "@/views";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="factory" element={<FactoryView />} />
        <Route path="ifc" element={<IFCViewerView />} />
        <Route path="viewer" element={<ModelViewerView />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
