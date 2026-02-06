import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@pf-dev/ui";
import { EVENT_LEVEL_STYLES, REGIONS, type Event } from "@/services";

interface RealtimeEventsProps {
  events: Event[];
  onEventClick?: (eventId: string) => void;
}

function EventRow({ event, onClick }: { event: Event; onClick?: () => void }) {
  const style = EVENT_LEVEL_STYLES[event.level];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 border-b border-neutral-100 px-1 py-3 text-left last:border-b-0 hover:bg-primary-500/5"
    >
      <Badge className={`shrink-0 rounded ${style.bg} ${style.text}`}>{style.label}</Badge>
      <span className="truncate text-sm text-neutral-700">
        <span className="text-neutral-400">[{event.code}]</span> {event.message}
      </span>
    </button>
  );
}

function EventList({
  events,
  onEventClick,
}: {
  events: Event[];
  onEventClick?: (eventId: string) => void;
}) {
  if (events.length === 0) {
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
    </div>
  );
}

export function RealtimeEvents({ events, onEventClick }: RealtimeEventsProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-primary-500/80 bg-white px-4 py-2 shadow-md shadow-primary-500/50">
      {/* 헤더 */}
      <div className="pt-2">
        <h3 className="text-lg font-bold text-primary-500">전국 실시간 이벤트</h3>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="서울" className="flex w-full flex-1 flex-col">
        <TabsList variant="filled" className="w-full border-none py-2">
          {REGIONS.map((region) => (
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

        {/* 이벤트 목록 */}
        {REGIONS.map((region) => (
          <TabsContent key={region} value={region} className="mt-0 min-h-0 flex-1 overflow-hidden">
            <EventList
              events={events.filter((e) => e.region === region)}
              onEventClick={onEventClick}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
