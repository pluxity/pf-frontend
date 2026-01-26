import type { IClientOptions } from "mqtt";

/**
 * MQTT 연결 설정
 * 환경변수 또는 기본값 사용
 *
 * 환경변수:
 * - VITE_MQTT_PROTOCOL: ws | wss (기본: ws)
 * - VITE_MQTT_HOST: 브로커 호스트 (기본: broker.hivemq.com)
 * - VITE_MQTT_PORT: 브로커 포트 (기본: 8000)
 * - VITE_MQTT_PATH: WebSocket 경로 (기본: /mqtt)
 * - VITE_MQTT_USERNAME: 인증 사용자명 (선택)
 * - VITE_MQTT_PASSWORD: 인증 비밀번호 (선택)
 */
export const MQTT_CONFIG: IClientOptions = {
  protocol: (import.meta.env.VITE_MQTT_PROTOCOL as "ws" | "wss") || "ws",
  hostname: import.meta.env.VITE_MQTT_HOST || "broker.hivemq.com",
  port: Number(import.meta.env.VITE_MQTT_PORT) || 8000,
  path: import.meta.env.VITE_MQTT_PATH || "/mqtt",

  // 클라이언트 설정
  clientId: `isr_client_${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  keepalive: 60,
  connectTimeout: 10000,
  reconnectPeriod: 5000,

  // 인증 (필요시)
  username: import.meta.env.VITE_MQTT_USERNAME || undefined,
  password: import.meta.env.VITE_MQTT_PASSWORD || undefined,
};

/**
 * MQTT 이벤트 토픽
 * 환경변수: VITE_MQTT_EVENT_TOPIC (기본: isr/test)
 */
export const MQTT_EVENT_TOPIC = import.meta.env.VITE_MQTT_EVENT_TOPIC || "isr/test";
