import { useEffect, useRef } from "react";
import type { MapboxViewerHandle } from "@/pages/site/components";

const WS_URL = import.meta.env.VITE_WS_MOCK_URL || "ws://localhost:8765";
const RECONNECT_DELAY = 3_000;

interface WorkerPositionMessage {
  type: "workerPosition";
  workerId: string;
  position: { lng: number; lat: number; altitude: number };
  location?: {
    locationType: "indoor" | "outdoor";
    floor: string;
    floorNumber: number;
  };
}

export function useWorkerLivePositions(mapViewerRef: React.RefObject<MapboxViewerHandle | null>) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    function connect() {
      if (unmounted.current) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data: WorkerPositionMessage = JSON.parse(event.data as string);
          if (data.type === "workerPosition") {
            mapViewerRef.current?.pushLivePosition(data.workerId, data.position);
            if (data.location) {
              mapViewerRef.current?.updateWorkerLocation(data.workerId, data.location);
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [mapViewerRef]);
}
