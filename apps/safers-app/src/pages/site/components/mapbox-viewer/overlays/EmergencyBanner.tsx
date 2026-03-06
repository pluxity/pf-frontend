interface EmergencyBannerProps {
  bannerVisible: boolean;
  bannerWorkerId: string;
  bannerMessage: string;
  workerNames?: Record<string, string>;
  onReset: () => void;
}

export function EmergencyBanner({
  bannerVisible,
  bannerWorkerId,
  bannerMessage,
  workerNames,
  onReset,
}: EmergencyBannerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[3]">
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          boxShadow:
            "inset 0 0 5rem 1.25rem rgba(222,69,69,0.35), inset 0 0 12.5rem 3.75rem rgba(222,69,69,0.2)",
          animationDuration: "2s",
        }}
      />
      <div
        className="absolute inset-0 animate-pulse border-[0.125rem] border-[#DE4545]/80"
        style={{ animationDuration: "2s" }}
      />
      {bannerVisible && (
        <div
          role="alert"
          aria-live="assertive"
          className="pointer-events-auto absolute inset-x-0 top-[15vh] flex items-center justify-center"
        >
          <div className="flex items-center gap-3 rounded-lg bg-[#DE4545]/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
            <span className="animate-pulse text-lg">&#9888;</span>
            <span>
              비상 상황 발생 — {workerNames?.[bannerWorkerId] ?? bannerWorkerId} {bannerMessage}
            </span>
            <button
              onClick={onReset}
              aria-label="시나리오 종료"
              className="ml-2 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
