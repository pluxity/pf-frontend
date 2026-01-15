import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { MQTT_CONFIG } from "./config";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type MessageHandler = (topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => void;

interface MqttClientState {
  client: MqttClient | null;
  status: ConnectionStatus;
  error: Error | null;
}

/**
 * MQTT 클라이언트 싱글톤 관리자
 */
class MqttClientManager {
  private state: MqttClientState = {
    client: null,
    status: "disconnected",
    error: null,
  };

  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private topicHandlers: Map<string, Set<MessageHandler>> = new Map();
  private subscribedTopics: Set<string> = new Set();

  /**
   * MQTT 브로커에 연결
   */
  connect(options?: Partial<IClientOptions>): MqttClient {
    // 이미 연결되었거나 연결 중이면 기존 클라이언트 반환
    if (
      this.state.client &&
      (this.state.status === "connected" || this.state.status === "connecting")
    ) {
      return this.state.client;
    }

    const config = { ...MQTT_CONFIG, ...options };
    this.updateStatus("connecting");

    const client = mqtt.connect(config);
    this.state.client = client;

    // 연결 이벤트 핸들러
    client.on("connect", () => {
      console.log("[MQTT] Connected to broker");
      this.updateStatus("connected");
      this.state.error = null;
      // 재연결 시 기존 구독 복원
      this.resubscribeAll();
    });

    client.on("disconnect", () => {
      this.updateStatus("disconnected");
    });

    client.on("offline", () => {
      this.updateStatus("disconnected");
    });

    client.on("error", (error) => {
      this.state.error = error;
      this.updateStatus("error");
    });

    client.on("reconnect", () => {
      this.updateStatus("connecting");
    });

    // 메시지 수신 핸들러
    client.on("message", (topic, payload, packet) => {
      this.handleMessage(topic, payload, packet);
    });

    return client;
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    if (this.state.client) {
      this.state.client.end(true);
      this.state.client = null;
      this.updateStatus("disconnected");
      this.subscribedTopics.clear();
    }
  }

  /**
   * 토픽 구독
   */
  subscribe(topic: string, handler: MessageHandler): () => void {
    if (!this.topicHandlers.has(topic)) {
      this.topicHandlers.set(topic, new Set());
    }
    this.topicHandlers.get(topic)!.add(handler);

    // 실제 MQTT 구독 (중복 구독 방지)
    if (!this.subscribedTopics.has(topic) && this.state.client?.connected) {
      console.log("[MQTT] Subscribing to:", topic);
      this.state.client.subscribe(topic, (err) => {
        if (!err) {
          console.log("[MQTT] Subscribed to:", topic);
          this.subscribedTopics.add(topic);
        }
      });
    } else if (!this.subscribedTopics.has(topic)) {
      // 연결 전이면 구독 예약
      this.subscribedTopics.add(topic);
    }

    // 구독 해제 함수 반환
    return () => {
      this.unsubscribeHandler(topic, handler);
    };
  }

  /**
   * 특정 핸들러 구독 해제
   */
  private unsubscribeHandler(topic: string, handler: MessageHandler): void {
    const handlers = this.topicHandlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
      // 해당 토픽의 모든 핸들러가 제거되면 실제 구독 해제
      if (handlers.size === 0) {
        this.topicHandlers.delete(topic);
        this.subscribedTopics.delete(topic);
        this.state.client?.unsubscribe(topic);
      }
    }
  }

  /**
   * 메시지 발행
   */
  publish(topic: string, message: string | Buffer): void {
    if (this.state.client?.connected) {
      this.state.client.publish(topic, message);
    }
  }

  /**
   * 연결 상태 리스너 등록
   */
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    // 현재 상태 즉시 전달
    listener(this.state.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * 현재 연결 상태 반환
   */
  getStatus(): ConnectionStatus {
    return this.state.status;
  }

  /**
   * 현재 에러 반환
   */
  getError(): Error | null {
    return this.state.error;
  }

  /**
   * 클라이언트 인스턴스 반환
   */
  getClient(): MqttClient | null {
    return this.state.client;
  }

  /**
   * 상태 업데이트 및 리스너 알림
   */
  private updateStatus(status: ConnectionStatus): void {
    this.state.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * 메시지 핸들링 (와일드카드 매칭 지원)
   */
  private handleMessage(topic: string, payload: Buffer, packet: mqtt.IPublishPacket): void {
    console.log("[MQTT] Message received:", topic, payload.toString());
    this.topicHandlers.forEach((handlers, pattern) => {
      if (this.matchTopic(pattern, topic)) {
        handlers.forEach((handler) => {
          try {
            handler(topic, payload, packet);
          } catch (error) {
            console.error(`Error in MQTT handler for topic ${topic}:`, error);
          }
        });
      }
    });
  }

  /**
   * 토픽 패턴 매칭 (MQTT 와일드카드 지원)
   * + : 단일 레벨 와일드카드
   * # : 다중 레벨 와일드카드
   */
  private matchTopic(pattern: string, topic: string): boolean {
    const regexPattern =
      "^" +
      pattern
        .split("/")
        .map((segment) => {
          if (segment === "+") return "[^/]+";
          if (segment === "#") return ".*";
          return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("/") +
      "$";
    return new RegExp(regexPattern).test(topic);
  }

  /**
   * 재연결 시 모든 토픽 재구독
   */
  private resubscribeAll(): void {
    if (this.state.client?.connected && this.subscribedTopics.size > 0) {
      const topics = Array.from(this.subscribedTopics);
      this.state.client.subscribe(topics);
    }
  }
}

// 싱글톤 인스턴스
export const mqttClient = new MqttClientManager();
