interface StreamStatusBadgeProps {
  label: string;
  name: string;
  status?: string;
  compact?: boolean;
}

export function StreamStatusBadge({ label, name, status, compact }: StreamStatusBadgeProps) {
  const isLive = label === "LIVE";

  return (
    <div
      className={`absolute top-2 right-2 flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur-md ${
        compact ? "px-2 py-1 text-[0.625rem]" : "px-3 py-1.5 text-sm"
      } font-bold`}
    >
      <span className="flex items-center gap-1.5">
        {isLive && (
          <span
            className={`shrink-0 rounded-full bg-red-500 animate-pulse ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`}
          />
        )}
        <span className={isLive ? "text-red-400" : "text-brand"}>{label}</span>
      </span>
      <span className="h-3.5 w-px bg-white/30" />
      <span className="truncate text-white/90">{name}</span>
      {status && (
        <span
          className={`ml-0.5 shrink-0 rounded-full ${compact ? "h-1.5 w-1.5" : "h-2 w-2"} ${
            status === "connected"
              ? "bg-green-400"
              : status === "connecting"
                ? "bg-yellow-400 animate-pulse"
                : "bg-red-400"
          }`}
        />
      )}
    </div>
  );
}
