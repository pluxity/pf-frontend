interface StreamLoadingOverlayProps {
  compact?: boolean;
}

export function StreamLoadingOverlay({ compact }: StreamLoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
      <div
        className={`animate-spin rounded-full border-2 border-white border-t-transparent ${
          compact ? "h-5 w-5" : "h-8 w-8"
        }`}
      />
    </div>
  );
}
