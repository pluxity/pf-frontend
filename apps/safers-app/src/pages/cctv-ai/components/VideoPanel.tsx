import { useEffect, useRef, useState } from "react";
import { useWHEPStream } from "@pf-dev/cctv";
import { GridLayout } from "@pf-dev/ui/organisms";
import { Widget } from "@pf-dev/ui/molecules";
import type { GridTemplate } from "@pf-dev/ui";
import { useCCTVStreams, type CCTVStreamItem } from "@/hooks/useCCTVStreams";
import { StreamLoadingOverlay, StreamErrorOverlay, StreamStatusBadge } from "@/components/cctv";
import { PTZControl } from "./PTZControl";
import type { StompEventResponse } from "@/services";

// ─── CCTV 선택 드롭다운 ───

function CCTVSelect({
  items,
  selected,
  onChange,
}: {
  items: CCTVStreamItem[];
  selected: string;
  onChange: (streamName: string) => void;
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-[#2A2D3A] bg-[#252833] px-3 py-1.5 text-sm text-white outline-none focus:border-brand"
    >
      {items.map((item) => (
        <option key={item.streamName} value={item.streamName}>
          {item.displayName}
        </option>
      ))}
    </select>
  );
}

// ─── 그리드 레이아웃 설정 ───

type GridMode = "1x1" | "2x2" | "4x4";

const GRID_MODE_LABELS: Record<GridMode, string> = {
  "1x1": "1×1",
  "2x2": "2×2",
  "4x4": "4×4",
};

const GRID_MODES: GridMode[] = ["1x1", "2x2", "4x4"];

// ─── GridLayout 템플릿 정의 ───

function createSquareTemplate(id: string, name: string, cols: number): GridTemplate {
  const total = cols * cols;
  return {
    id,
    name,
    columns: cols,
    rows: cols,
    cells: Array.from({ length: total }, (_, i) => ({
      id: `c${i + 1}`,
      colStart: (i % cols) + 1,
      colSpan: 1,
      rowStart: Math.floor(i / cols) + 1,
      rowSpan: 1,
    })),
  };
}

const GRID_TEMPLATES: Record<Exclude<GridMode, "1x1">, GridTemplate> = {
  "2x2": createSquareTemplate("2x2", "2×2", 2),
  "4x4": createSquareTemplate("4x4", "4×4", 4),
};

// ─── 그리드 모드 선택 버튼 ───

function GridModeSelector({
  mode,
  onChange,
}: {
  mode: GridMode;
  onChange: (mode: GridMode) => void;
}) {
  return (
    <div className="flex gap-1 rounded-md border border-[#2A2D3A] bg-[#1A1D27] p-0.5">
      {GRID_MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            mode === m ? "bg-brand text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          {GRID_MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

// ─── WHEP 라이브 스트림 플레이어 ───

function LiveStreamPlayer({
  streamUrl,
  name,
  compact,
}: {
  streamUrl: string;
  name: string;
  compact?: boolean;
}) {
  const { videoRef, status, connect } = useWHEPStream(streamUrl);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />

      {status === "connecting" && <StreamLoadingOverlay compact={compact} />}
      {status === "failed" && (
        <StreamErrorOverlay compact={compact} onReconnect={() => connect()} />
      )}

      <StreamStatusBadge label="LIVE" name={name} status={status} compact={compact} />
    </div>
  );
}

// ─── 이벤트 영상 재생 플레이어 ───

function EventVideoPlayer({ event, onClose }: { event: StompEventResponse; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = !!event.video?.url;

  useEffect(() => {
    if (hasVideo && videoRef.current) {
      videoRef.current.load();
    }
  }, [event.video?.url, hasVideo]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
      {hasVideo ? (
        <video
          ref={videoRef}
          src={event.video!.url}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="relative h-full w-full">
          {event.snapshot?.url && (
            <img
              src={event.snapshot.url}
              alt="snapshot"
              className="h-full w-full object-contain opacity-40"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm font-medium text-white">현장 영상 제작 중...</p>
            <p className="mt-1 text-xs text-white/40">완료되면 자동으로 재생됩니다</p>
          </div>
        </div>
      )}

      {/* 상단 이벤트 정보 + 닫기 */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-[#CA0014]/80 px-1.5 py-0.5 font-bold text-white">
            {event.type.replace("_", " ")}
          </span>
          <span className="text-white/60">{event.name}</span>
          <span className="text-white/40">{new Date(event.timestamp).toLocaleString("ko-KR")}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 하단 상태 */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-bold backdrop-blur-sm">
        <span className={hasVideo ? "text-green-400" : "text-yellow-400"}>
          {hasVideo ? "REC" : "PROCESSING"}
        </span>
        <span className="h-3 w-px bg-white/40" />
        <span className="text-white">{event.name}</span>
      </div>
    </div>
  );
}

// ─── 빈 슬롯 ───

function EmptySlot() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#2A2D3A] bg-[#1A1D27]">
      <span className="text-xs text-white/20">빈 채널</span>
    </div>
  );
}

// ─── 라이브 그리드 (GridLayout + Widget 기반) ───

function LiveGrid({
  items,
  gridMode,
  page,
}: {
  items: CCTVStreamItem[];
  gridMode: Exclude<GridMode, "1x1">;
  page: number;
}) {
  const template = GRID_TEMPLATES[gridMode];
  const perPage = template.cells.length;
  const pageItems = items.slice(page * perPage, (page + 1) * perPage);
  const emptyCount = Math.max(0, perPage - pageItems.length);
  const compact = gridMode === "4x4";

  return (
    <GridLayout template={template} gap={6} editable className="h-full">
      {pageItems.map((item, i) => (
        <Widget
          key={item.streamName}
          id={`cam-${i}`}
          border={false}
          className="h-full overflow-hidden rounded-lg bg-transparent shadow-none"
          contentClassName="h-full p-0"
        >
          <LiveStreamPlayer streamUrl={item.whepUrl} name={item.displayName} compact={compact} />
        </Widget>
      ))}
      {Array.from({ length: emptyCount }, (_, i) => (
        <Widget
          key={`empty-${i}`}
          id={`empty-${i}`}
          border={false}
          className="h-full overflow-hidden rounded-lg bg-transparent shadow-none"
          contentClassName="h-full p-0"
        >
          <EmptySlot />
        </Widget>
      ))}
    </GridLayout>
  );
}

// ─── VideoPanel ───

interface VideoPanelProps {
  selectedStream: string;
  onStreamChange: (streamName: string) => void;
  selectedEvent: StompEventResponse | null;
  onClearEvent: () => void;
}

export function VideoPanel({
  selectedStream,
  onStreamChange,
  selectedEvent,
  onClearEvent,
}: VideoPanelProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<number | undefined>(undefined);
  const { items: allItems, isLoading, isError, error } = useCCTVStreams();
  const [gridMode, setGridMode] = useState<GridMode>("1x1");
  const [page, setPage] = useState(0);

  // 현장 목록 추출 (unique sites)
  const sites = allItems.reduce<{ id: number; name: string }[]>((acc, item) => {
    if (!acc.some((s) => s.id === item.siteId)) {
      acc.push({ id: item.siteId, name: item.siteName });
    }
    return acc;
  }, []);

  // 현장 필터링
  const items =
    selectedSiteId != null ? allItems.filter((i) => i.siteId === selectedSiteId) : allItems;

  const perPage = gridMode === "1x1" ? 1 : gridMode === "2x2" ? 4 : 16;
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  // 이벤트 영상 모드
  if (selectedEvent) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/60">이벤트 영상</span>
          <button
            onClick={onClearEvent}
            className="rounded-md border border-[#2A2D3A] bg-[#252833] px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
          >
            라이브로 돌아가기
          </button>
        </div>
        <div className="flex-1">
          <EventVideoPlayer event={selectedEvent} onClose={onClearEvent} />
        </div>
      </div>
    );
  }

  // CCTV 라이브 모드
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#CA0014]">
        {error?.message || "CCTV 목록 로딩 실패"}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/40">
        등록된 CCTV가 없습니다
      </div>
    );
  }

  const activeStream = selectedStream || items[0]!.streamName;
  const activeItem = items.find((i) => i.streamName === activeStream) ?? items[0]!;
  const isSingle = gridMode === "1x1";

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 헤더: 모드 제목 + 페이지 네비게이션 + 그리드 선택 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/60">라이브 스트림</span>
          {/* 현장 셀렉터 */}
          <select
            value={selectedSiteId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSiteId(val ? Number(val) : undefined);
              setPage(0);
            }}
            className="rounded-md border border-[#2A2D3A] bg-[#252833] px-3 py-1.5 text-sm text-white outline-none focus:border-brand"
          >
            <option value="">전체 현장</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {isSingle && (
            <CCTVSelect items={items} selected={activeStream} onChange={onStreamChange} />
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* 페이지 네비게이션 */}
          {!isSingle && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded p-1 text-white/50 transition-colors hover:bg-[#252833] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="min-w-[3rem] text-center text-xs text-white/50">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded p-1 text-white/50 transition-colors hover:bg-[#252833] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
          <GridModeSelector
            mode={gridMode}
            onChange={(m) => {
              setGridMode(m);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* 영상 영역 */}
      <div className="flex-1 min-h-0">
        {isSingle ? (
          <div className="relative h-full w-full">
            <LiveStreamPlayer streamUrl={activeItem.whepUrl} name={activeItem.displayName} />
            <div className="absolute bottom-3 right-3 z-10">
              <PTZControl />
            </div>
          </div>
        ) : (
          <LiveGrid items={items} gridMode={gridMode} page={page} />
        )}
      </div>
    </div>
  );
}
