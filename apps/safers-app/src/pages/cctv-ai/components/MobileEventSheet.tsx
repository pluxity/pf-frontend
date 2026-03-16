import { useState, useRef } from "react";
import { useIsLandscape } from "@/hooks/useIsMobile";
import type { StompEventResponse, ConnectionStatus } from "@/services";
import { EventLogPanel } from "./EventLogPanel";

interface MobileEventSheetProps {
  events: StompEventResponse[];
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  selectedEventId: string | null;
  onSelectEvent: (event: StompEventResponse) => void;
}

export function MobileEventSheet({
  events,
  connectionStatus,
  isLoading,
  selectedEventId,
  onSelectEvent,
}: MobileEventSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLandscape = useIsLandscape();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragCurrent = useRef<number>(0);

  const unreadCount = events.length;

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]!;
    dragStart.current = isLandscape ? touch.clientX : touch.clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dragStart.current === null) return;
    const touch = e.touches[0]!;
    const delta = isLandscape
      ? touch.clientX - dragStart.current
      : touch.clientY - dragStart.current;
    dragCurrent.current = delta;

    // 양방향: 세로-아래/가로-오른쪽 드래그 시 시트를 밀어냄
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = isLandscape
        ? `translateX(${delta}px)`
        : `translateY(${delta}px)`;
    }
  }

  function handleTouchEnd() {
    if (dragStart.current === null) return;

    // 100px 이상 드래그하면 닫기
    if (dragCurrent.current > 100) {
      setIsOpen(false);
    }

    // 위치 리셋
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
    dragStart.current = null;
    dragCurrent.current = 0;
  }

  function handleSelectEvent(event: StompEventResponse) {
    onSelectEvent(event);
    setIsOpen(false);
  }

  // 가로 모드: 우측 사이드 패널
  if (isLandscape) {
    return (
      <>
        {/* FAB 버튼 */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30 active:scale-95"
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CA0014] px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* 오버레이 */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)} />
        )}

        {/* 우측 사이드 패널 */}
        <div
          ref={sheetRef}
          className={`fixed inset-y-0 right-0 z-50 flex w-[50vw] flex-col bg-[#0F1117] transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 드래그 핸들 (세로 바) */}
          <div
            className="absolute inset-y-0 left-0 flex w-5 items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="h-10 w-1 rounded-full bg-white/20" />
          </div>

          {/* 이벤트 로그 패널 */}
          <div className="min-h-0 flex-1 overflow-hidden pl-4">
            <EventLogPanel
              events={events}
              connectionStatus={connectionStatus}
              isLoading={isLoading}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </div>
      </>
    );
  }

  // 세로 모드: 바텀 시트 (기존)
  return (
    <>
      {/* FAB 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30 active:scale-95 safe-area-inset-bottom"
      >
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CA0014] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* 바텀 시트 */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-[#0F1117] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "70dvh" }}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex shrink-0 items-center justify-center pb-1 pt-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* 이벤트 로그 패널 */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <EventLogPanel
            events={events}
            connectionStatus={connectionStatus}
            isLoading={isLoading}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>
    </>
  );
}
