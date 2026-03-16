import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, logout } from "@pf-dev/services";
import { sitesService, type Site, REGION_DISPLAY_NAMES } from "@/services";
import biLogo from "@/assets/images/BI.svg";

export function MobileHome() {
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        const result = await sitesService.getSites({ size: 1000 });
        setSites(result.data.content);
      } catch {
        setError("현장 목록을 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore
    }
    reset();
    navigate("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0F1117] safe-area-inset-top">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#2A2D3A] px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={biLogo} alt="Safers" className="h-5" />
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-[#1A1D27] hover:text-white"
        >
          로그아웃
        </button>
      </header>

      {/* 콘텐츠 */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-sm text-white/40">현장 목록 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <svg
              className="h-10 w-10 text-[#CA0014]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-white/60">{error}</p>
          </div>
        )}

        {!isLoading && !error && sites.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <svg
              className="h-10 w-10 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-sm text-white/40">등록된 현장이 없습니다</p>
          </div>
        )}

        {!isLoading && !error && sites.length > 0 && (
          <div className="flex flex-col gap-3">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} navigate={navigate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/** NVR 녹화영상이 활성화된 현장 ID 목록 */
const PLAYBACK_ENABLED_SITE_IDS = new Set([15, 17]);

function SiteCard({ site, navigate }: { site: Site; navigate: ReturnType<typeof useNavigate> }) {
  const playbackEnabled = PLAYBACK_ENABLED_SITE_IDS.has(site.id);

  return (
    <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
      {/* 현장 정보 */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white">{site.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-brand">{REGION_DISPLAY_NAMES[site.region]}</span>
          {site.address && (
            <>
              <span className="text-xs text-white/20">|</span>
              <span className="truncate text-xs text-white/40">{site.address}</span>
            </>
          )}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/cctv-ai/${site.id}`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2.5 text-sm font-medium text-brand transition-colors active:bg-brand/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          CCTV AI
        </button>
        <button
          onClick={playbackEnabled ? () => navigate(`/cctv-playback/${site.id}`) : undefined}
          disabled={!playbackEnabled}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            playbackEnabled
              ? "bg-white/5 text-white/70 active:bg-white/10"
              : "cursor-not-allowed bg-white/[0.02] text-white/20"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          녹화영상
        </button>
      </div>
    </div>
  );
}
