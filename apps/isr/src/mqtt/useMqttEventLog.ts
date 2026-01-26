import { useState, useCallback, useRef } from "react";
import { useMqttSubscription, useMqttAutoConnect } from "./hooks";
import type { EventLogItem } from "@/components/sidebar/EventLog";

/**
 * MQTT 이벤트 메시지 스키마 (테스트용, 추후 변경 예정)
 * 실제 스키마가 확정되면 이 타입만 수정하면 됨
 */
export interface MqttEventMessage {
  type?: "person" | "vehicle" | "wildlife" | "system";
  message?: string;
  timestamp?: number;
  isTrackingEnd?: boolean;
  // 추후 추가될 필드들...
  [key: string]: unknown;
}

interface UseMqttEventLogOptions {
  /** 구독할 토픽 (기본: "isr/events/#") */
  topic?: string;
  /** 최대 로그 개수 (기본: 100) */
  maxLogs?: number;
  /** 메시지 → EventLogItem 변환 함수 (커스텀 스키마용) */
  transformMessage?: (message: MqttEventMessage, topic: string) => EventLogItem | null;
}

/**
 * MQTT 메시지를 EventLog 형식으로 변환하는 Hook
 * 토픽과 스키마가 확정되면 options만 수정하면 됨
 */
export function useMqttEventLog(options: UseMqttEventLogOptions = {}) {
  const { topic = "isr/events/#", maxLogs = 100, transformMessage } = options;

  const [logs, setLogs] = useState<EventLogItem[]>([]);
  const logIdCounter = useRef(0);

  // MQTT 자동 연결
  const mqtt = useMqttAutoConnect();

  // 기본 변환 함수
  const defaultTransform = useCallback(
    (message: MqttEventMessage, _receivedTopic: string): EventLogItem | null => {
      // 메시지가 문자열인 경우 (JSON 파싱 실패 시)
      if (typeof message === "string") {
        return {
          id: `mqtt-${Date.now()}-${logIdCounter.current++}`,
          type: "system",
          message: message,
          timestamp: Date.now(),
        };
      }

      // 기본 스키마 처리
      return {
        id: `mqtt-${Date.now()}-${logIdCounter.current++}`,
        type: message.type || "system",
        message: message.message || JSON.stringify(message),
        timestamp: message.timestamp || Date.now(),
        isTrackingEnd: message.isTrackingEnd,
      };
    },
    []
  );

  // 메시지 수신 처리
  const handleMessage = useCallback(
    (data: MqttEventMessage, receivedTopic: string) => {
      const transform = transformMessage || defaultTransform;
      const logItem = transform(data, receivedTopic);

      if (logItem) {
        setLogs((prev) => {
          const newLogs = [logItem, ...prev];
          // 최대 개수 제한
          return newLogs.slice(0, maxLogs);
        });
      }
    },
    [transformMessage, defaultTransform, maxLogs]
  );

  // MQTT 구독
  useMqttSubscription<MqttEventMessage>(topic, {
    parseJson: true,
    onMessage: handleMessage,
  });

  // 로그 초기화
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // 테스트용 로그 추가 (개발 중 사용)
  const addTestLog = useCallback(
    (item: Partial<EventLogItem>) => {
      const logItem: EventLogItem = {
        id: `test-${Date.now()}-${logIdCounter.current++}`,
        type: item.type || "system",
        message: item.message || "테스트 메시지",
        timestamp: item.timestamp || Date.now(),
        isTrackingEnd: item.isTrackingEnd,
      };
      setLogs((prev) => [logItem, ...prev].slice(0, maxLogs));
    },
    [maxLogs]
  );

  return {
    logs,
    clearLogs,
    addTestLog,
    isConnected: mqtt.isConnected,
    connectionStatus: mqtt.status,
  };
}
