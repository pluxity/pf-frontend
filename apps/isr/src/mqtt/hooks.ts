import { useEffect, useState, useCallback, useRef } from "react";
import { mqttClient, ConnectionStatus, MessageHandler } from "./client";
import type { MqttTopic } from "./config";
import type { IClientOptions } from "mqtt";

/**
 * MQTT 연결 상태 및 제어 Hook
 */
export function useMqtt(options?: Partial<IClientOptions>) {
  const [status, setStatus] = useState<ConnectionStatus>(mqttClient.getStatus());
  const [error, setError] = useState<Error | null>(mqttClient.getError());

  useEffect(() => {
    // 상태 변경 리스너 등록
    const unsubscribe = mqttClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setError(mqttClient.getError());
    });

    return unsubscribe;
  }, []);

  const connect = useCallback(() => {
    mqttClient.connect(options);
  }, [options]);

  const disconnect = useCallback(() => {
    mqttClient.disconnect();
  }, []);

  const publish = useCallback((topic: string, message: string | Buffer) => {
    mqttClient.publish(topic, message);
  }, []);

  return {
    status,
    error,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    connect,
    disconnect,
    publish,
  };
}

/**
 * MQTT 토픽 구독 Hook
 * @param topic - 구독할 토픽 (와일드카드 지원)
 * @param options - 구독 옵션
 */
export function useMqttSubscription<T = unknown>(
  topic: MqttTopic | null,
  options?: {
    /** 메시지를 JSON으로 파싱할지 여부 */
    parseJson?: boolean;
    /** 연결 시 자동 구독 여부 (기본: true) */
    autoSubscribe?: boolean;
    /** 메시지 수신 콜백 */
    onMessage?: (data: T, topic: string) => void;
  }
) {
  const { parseJson = true, autoSubscribe = true, onMessage } = options || {};
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const onMessageRef = useRef(onMessage);

  // onMessage 참조 업데이트
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topic || !autoSubscribe) return;

    const handler: MessageHandler = (receivedTopic, payload) => {
      try {
        let data: T;
        if (parseJson) {
          data = JSON.parse(payload.toString()) as T;
        } else {
          data = payload.toString() as unknown as T;
        }

        setLastMessage(data);
        setLastTopic(receivedTopic);
        onMessageRef.current?.(data, receivedTopic);
      } catch (error) {
        console.error(`Failed to parse MQTT message from ${receivedTopic}:`, error);
      }
    };

    const unsubscribe = mqttClient.subscribe(topic, handler);
    return unsubscribe;
  }, [topic, parseJson, autoSubscribe]);

  return {
    lastMessage,
    lastTopic,
  };
}

/**
 * MQTT 자동 연결 Hook
 * 컴포넌트 마운트 시 자동 연결, 언마운트 시 연결 유지 (선택적 해제)
 */
export function useMqttAutoConnect(
  options?: Partial<IClientOptions> & {
    /** 언마운트 시 연결 해제 여부 (기본: false) */
    disconnectOnUnmount?: boolean;
  }
) {
  const { disconnectOnUnmount = false, ...mqttOptions } = options || {};
  const mqtt = useMqtt(mqttOptions);

  useEffect(() => {
    if (mqtt.status === "disconnected") {
      mqtt.connect();
    }

    return () => {
      if (disconnectOnUnmount) {
        mqtt.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mqtt;
}
