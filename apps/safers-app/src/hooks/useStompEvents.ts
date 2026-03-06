import { useEffect, useRef } from "react";
import { useAuthStore, selectIsAuthenticated } from "@pf-dev/services";
import { stompService } from "../services/stomp.service";
import { useEventsStore } from "../stores/events.store";
import type { StompEventResponse } from "../services/types";

export function useStompEvents() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const addStompEvent = useEventsStore((s) => s.addStompEvent);
  const setConnectionStatus = useEventsStore((s) => s.setConnectionStatus);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    stompService.connect((status) => {
      setConnectionStatus(status);

      if (status === "connected") {
        unsubscribeRef.current = stompService.subscribe("/topic/events", (message) => {
          try {
            const event: StompEventResponse = JSON.parse(message.body);
            addStompEvent(event);
          } catch {
            // STOMP 메시지 파싱 실패 — 무시
          }
        });
      }
    });

    return () => {
      unsubscribeRef.current?.();
      stompService.disconnect();
    };
  }, [isAuthenticated, addStompEvent, setConnectionStatus]);
}
