import { useEffect, useRef, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge, Spinner } from "@pf-dev/ui";
import {
  EVENT_TYPE_SEVERITY,
  EVENT_SEVERITY_STYLES,
  EVENT_REGIONS,
  type Event,
  type EventRegionTab,
} from "@/services";

interface RealtimeEventsProps {
  events: Event[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onEventClick?: (eventId: number) => void;
  activeRegion: EventRegionTab;
  onRegionChange: (region: EventRegionTab) => void;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function EventRow({ event, onClick }: { event: Event; onClick?: () => void }) {
  const severity = EVENT_TYPE_SEVERITY[event.type];
  const style = EVENT_SEVERITY_STYLES[severity];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${event.name} - ${event.site.name}`}
      className="flex w-full items-center gap-2 border-b border-neutral-100 px-1 py-3 text-left last:border-b-0 hover:bg-primary-500/5"
    >
      <Badge variant={null} className={`shrink-0 rounded ${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
      <span className="truncate text-sm text-neutral-700">
        <span className="text-neutral-400">[{event.site.name}]</span> {event.name}
      </span>
      <span className="ml-auto shrink-0 text-xs text-neutral-400">
        {formatTimestamp(event.timestamp)}
      </span>
    </button>
  );
}

function EventList({
  events,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onEventClick,
}: {
  events: Event[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onEventClick?: (eventId: number) => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMore && !isLoadingMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "100px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (events.length === 0 && !isLoadingMore) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        이벤트가 없습니다
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {events.map((event) => (
        <EventRow key={event.id} event={event} onClick={() => onEventClick?.(event.id)} />
      ))}
      {/* 무한스크롤 감지 sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {isLoadingMore && (
        <div className="flex justify-center py-3">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}

export function RealtimeEvents({
  events,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onEventClick,
  activeRegion,
  onRegionChange,
}: RealtimeEventsProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-primary-500/80 bg-white px-4 py-2 shadow-[0_0_24px_rgba(30,74,184,0.5)]">
      <div className="pt-2">
        <h3 className="text-lg font-bold text-primary-600">전국 실시간 이벤트</h3>
      </div>

      <Tabs
        value={activeRegion}
        onValueChange={(v) => onRegionChange(v as EventRegionTab)}
        className="flex w-full min-h-0 flex-1 flex-col"
      >
        <TabsList variant="filled" className="w-full shrink-0 flex-wrap gap-y-1 border-none py-2">
          {EVENT_REGIONS.map((region) => (
            <TabsTrigger
              key={region}
              value={region}
              variant="filled"
              className="flex-1 border bg-white text-neutral-400 data-[state=active]:border-neutral-300 data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900"
            >
              {region}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeRegion} className="mt-0 min-h-0 flex-1 overflow-hidden">
          <EventList
            events={events}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            onEventClick={onEventClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
