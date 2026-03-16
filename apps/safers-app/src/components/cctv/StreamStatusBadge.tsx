interface StreamStatusBadgeProps {
  label: string;
  name: string;
  status?: string;
  compact?: boolean;
}

export function StreamStatusBadge({ label, name, status, compact }: StreamStatusBadgeProps) {
  return (
    <div
      className={`absolute bottom-1 left-1 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm ${
        compact ? "px-1.5 py-1 text-[0.5625rem]" : "px-2.5 py-1.5 text-xs"
      } font-bold`}
    >
      <span className="text-brand">{label}</span>
      <span className="h-3 w-px bg-white/40" />
      <span className="truncate text-white">{name}</span>
      {status && (
        <span
          className={`ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
            status === "connected"
              ? "bg-green-400"
              : status === "connecting"
                ? "bg-yellow-400"
                : "bg-red-400"
          }`}
        />
      )}
    </div>
  );
}
