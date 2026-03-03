import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCCTVAIEvents } from "@/hooks/useCCTVAIEvents";
import type { StompEventResponse } from "@/services";
import { VideoPanel } from "./components/VideoPanel";
import { EventLogPanel } from "./components/EventLogPanel";
import biLogo from "@/assets/images/BI.svg";

export function CCTVAIPage() {
  const navigate = useNavigate();
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<StompEventResponse | null>(null);
  const { events, connectionStatus, isLoading } = useCCTVAIEvents();

  // 이벤트 선택 시 — 좌측 패널을 이벤트 영상 모드로 전환
  function handleSelectEvent(event: StompEventResponse) {
    setSelectedEvent(event);
  }

  // 라이브 모드로 복귀
  function handleClearEvent() {
    setSelectedEvent(null);
  }

  // WS로 이벤트가 업데이트되면 (영상 제작 완료) 선택된 이벤트도 갱신
  const activeSelectedEvent = selectedEvent
    ? (events.find((e) => e.eventId === selectedEvent.eventId) ?? selectedEvent)
    : null;

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0F1117]">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#2A2D3A] px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center rounded-md p-1.5 text-white/60 transition-colors hover:bg-[#1A1D27] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <img src={biLogo} alt="Safers" className="h-6" />
            <span className="text-brand mb-[-0.25rem]">AI CCTV</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-400"
                : connectionStatus === "connecting"
                  ? "animate-pulse bg-yellow-400"
                  : "bg-red-400"
            }`}
          />
          <span className="text-xs text-white/40">
            {connectionStatus === "connected" ? "AI 엔진 연결됨" : "연결 대기"}
          </span>
        </div>
      </header>

      {/* 메인 콘텐츠: 좌 영상 / 우 이벤트 로그 */}
      <main className="flex min-h-0 flex-1">
        {/* 좌측: 영상 패널 */}
        <section className="flex flex-[3] flex-col border-r border-[#2A2D3A] p-4">
          <VideoPanel
            selectedStream={selectedStream}
            onStreamChange={setSelectedStream}
            selectedEvent={activeSelectedEvent}
            onClearEvent={handleClearEvent}
          />
        </section>

        {/* 우측: 이벤트 로그 패널 */}
        <section className="flex w-[25rem] shrink-0 flex-col">
          <EventLogPanel
            events={events}
            connectionStatus={connectionStatus}
            isLoading={isLoading}
            selectedEventId={activeSelectedEvent?.eventId ?? null}
            onSelectEvent={handleSelectEvent}
          />
        </section>
      </main>
    </div>
  );
}
