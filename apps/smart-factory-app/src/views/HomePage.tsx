import { useNavigate } from "react-router-dom";

interface PageInfo {
  path: string;
  title: string;
  description: string;
  tags: string[];
}

const pages: PageInfo[] = [
  {
    path: "/factory",
    title: "Factory Simulator",
    description:
      "Babylon.js 기반 3D 스마트 팩토리 시뮬레이터. 장비 모니터링, 전력 시각화, 화재/대피 시나리오 등.",
    tags: ["Babylon.js", "3D", "시뮬레이션"],
  },
  {
    path: "/ifc",
    title: "IFC Building Monitor",
    description:
      "IFC 건물 모델 뷰어. MEP 시스템 시각화, 층별 필터링, 단면도, 센서 데이터 오버레이.",
    tags: ["IFC", "BIM", "MEP"],
  },
  {
    path: "/viewer",
    title: "Model Viewer",
    description:
      "GLB/IFC 모델 업로드 및 검사 도구. 메시 트리, 속성 패널, 시스템 필터링, 경로 탐색.",
    tags: ["GLB", "IFC", "모델 검사"],
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-bold mb-2">Smart Factory App</h1>
        <p className="text-neutral-400">테스트 및 개발용 페이지 목록</p>
      </header>

      <main className="max-w-4xl mx-auto grid gap-4">
        {pages.map((page) => (
          <button
            key={page.path}
            type="button"
            onClick={() => navigate(page.path)}
            className="w-full text-left p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/70 hover:border-neutral-600 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold mb-1">{page.title}</h2>
                <p className="text-sm text-neutral-400 mb-3">{page.description}</p>
                <div className="flex flex-wrap gap-2">
                  {page.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-neutral-500 shrink-0 text-sm font-mono">{page.path}</span>
            </div>
          </button>
        ))}
      </main>

      <footer className="max-w-4xl mx-auto mt-12 pt-6 border-t border-neutral-800 text-neutral-500 text-sm">
        {pages.length}개 페이지
      </footer>
    </div>
  );
}
