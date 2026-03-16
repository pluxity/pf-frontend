interface StreamErrorOverlayProps {
  compact?: boolean;
  onReconnect: () => void;
}

export function StreamErrorOverlay({ compact, onReconnect }: StreamErrorOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <svg
        className={`text-error-brand ${compact ? "mb-1 h-5 w-5" : "mb-2 h-8 w-8"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      {!compact && <p className="mb-2 text-sm text-white">연결 실패</p>}
      <button
        onClick={onReconnect}
        className={`rounded-md bg-brand text-white transition-colors hover:bg-brand/80 ${
          compact ? "px-2 py-1 text-[0.625rem]" : "px-4 py-2 text-xs"
        }`}
        style={{ minHeight: 44, minWidth: 44 }}
      >
        재연결
      </button>
    </div>
  );
}
