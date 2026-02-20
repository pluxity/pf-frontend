import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

let client: Client | null = null;

function getWebSocketUrl(): string {
  // dev: Vite proxy 경유 (localhost → 실서버), prod/staging: 현재 origin 사용
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${window.location.host}/api/stomp/platform`;
}

export const stompService = {
  connect(onStatusChange?: (status: ConnectionStatus) => void) {
    if (client?.active) return;

    onStatusChange?.("connecting");

    client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      debug: import.meta.env.DEV ? (msg) => console.log("[STOMP]", msg) : () => {},
      onConnect: () => {
        console.log("[STOMP] Connected");
        onStatusChange?.("connected");
      },
      onDisconnect: () => {
        console.log("[STOMP] Disconnected");
        onStatusChange?.("disconnected");
      },
      onStompError: (frame) => {
        console.error("[STOMP] Error:", frame.headers["message"]);
        onStatusChange?.("error");
      },
      onWebSocketClose: () => {
        console.log("[STOMP] WebSocket closed");
        onStatusChange?.("disconnected");
      },
    });

    client.activate();
  },

  subscribe(destination: string, handler: (message: IMessage) => void): () => void {
    if (!client?.connected) {
      console.warn("[STOMP] Cannot subscribe: not connected");
      return () => {};
    }

    const subscription = client.subscribe(destination, handler);
    return () => subscription.unsubscribe();
  },

  disconnect() {
    if (client?.active) {
      client.deactivate();
      client = null;
    }
  },

  get connected() {
    return client?.connected ?? false;
  },
};
