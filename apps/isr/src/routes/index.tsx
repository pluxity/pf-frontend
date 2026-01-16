import { Routes, Route, useNavigate } from "react-router-dom";
import { ErrorPage } from "@pf-dev/ui/templates";

import { TrackingPage, DeckGLViewerPage, PotreeViewerPage } from "@/pages";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage variant="404" primaryAction={{ label: "홈으로", onClick: () => navigate("/") }} />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* 메인 트래킹 페이지 (Cesium) */}
      <Route index element={<TrackingPage />} />

      {/* deck.gl 뷰어 페이지 */}
      <Route path="deckgl" element={<DeckGLViewerPage />} />

      {/* Potree 뷰어 페이지 */}
      <Route path="potree" element={<PotreeViewerPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
