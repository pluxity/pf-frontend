import type { IClientOptions } from "mqtt";

/**
 * MQTT 연결 설정
 * 환경변수 또는 기본값 사용
 */
export const MQTT_CONFIG: IClientOptions = {
  // 브로커 URL (ws:// 또는 wss://)
  // 환경변수에서 가져오거나 기본값 사용
  protocol: "ws",
  hostname: import.meta.env.VITE_MQTT_HOST || "localhost",
  port: Number(import.meta.env.VITE_MQTT_PORT) || 9001,
  path: import.meta.env.VITE_MQTT_PATH || "/mqtt",

  // 클라이언트 설정
  clientId: `isr_client_${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  connectTimeout: 5000,
  reconnectPeriod: 3000,

  // 인증 (필요시)
  username: import.meta.env.VITE_MQTT_USERNAME || undefined,
  password: import.meta.env.VITE_MQTT_PASSWORD || undefined,
};

/**
 * 토픽 설정
 * 토픽이 확정되면 여기에 추가
 */
export const MQTT_TOPICS = {
  // 예시 토픽들 (추후 확정 시 수정)
  LIDAR_DATA: "isr/lidar/+/data",
  OBJECT_DETECTION: "isr/detection/+/objects",
  SYSTEM_STATUS: "isr/system/status",
} as const;

export type MqttTopic = (typeof MQTT_TOPICS)[keyof typeof MQTT_TOPICS] | string;
