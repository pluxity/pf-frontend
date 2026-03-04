import { useWHEPStream } from "@pf-dev/cctv";
import { useCCTVStreams } from "@/hooks/useCCTVStreams";
import { StreamLoadingOverlay, StreamErrorOverlay, StreamStatusBadge } from "@/components/cctv";

/** CCTVCard / CCTVPlaceholder 공통 컨테이너 — grid cell 크기에 영향 주지 않도록 통일 */
const CELL_CLASS =
  "relative bg-gray-900 rounded-lg overflow-hidden h-full min-h-0 border-2 border-gray-300";

function CCTVCard({ streamUrl, name }: { streamUrl: string; name: string }) {
  const { videoRef, status, connect } = useWHEPStream(streamUrl);

  return (
    <div className={CELL_CLASS}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-contain"
      />

      {status === "connecting" && <StreamLoadingOverlay />}

      {status === "failed" && <StreamErrorOverlay onReconnect={() => connect()} />}

      <StreamStatusBadge label="WHEP" name={name} />
    </div>
  );
}

function CCTVPlaceholder({ text }: { text: string }) {
  return (
    <div className={CELL_CLASS}>
      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
        {text}
      </div>
    </div>
  );
}

export function CCTVViewer({ siteId }: { siteId?: number | null }) {
  const { items, isLoading, isError, error } = useCCTVStreams(siteId ?? undefined);

  return (
    <>
      {[0, 1, 2].map((i) => {
        if (isLoading) return <CCTVPlaceholder key={i} text="로딩 중..." />;
        if (isError) return <CCTVPlaceholder key={i} text={error?.message || "오류 발생"} />;
        const item = items[i];
        if (!item) return <CCTVPlaceholder key={i} text="CCTV 없음" />;
        return <CCTVCard key={item.streamName} streamUrl={item.whepUrl} name={item.displayName} />;
      })}
    </>
  );
}
