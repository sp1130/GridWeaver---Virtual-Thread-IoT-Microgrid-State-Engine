import type { NodeTelemetry, TransitionEvent } from "../types/grid";

export type SocketEventType =
  | "telemetry"
  | "transition"
  | "heat"
  | "pong"
  | "unknown";

export interface SocketEvent {
  type: SocketEventType;
  data: unknown;
}

export type EventCallback = (event: SocketEvent) => void;

export class GridWebSocketClient {
  private ws: WebSocket | null = null;
  private backoffMs = 1000;
  private readonly maxBackoffMs = 30000;
  private heartbeatTimer: number | undefined = undefined;
  private reconnectTimer: number | undefined = undefined;
  private destroyed = false;
  private readonly listeners = new Set<EventCallback>();

  constructor(private readonly url: string) {}

  onEvent(cb: EventCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  connect() {
    if (this.ws || this.destroyed) return;

    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      this.backoffMs = 1000;
      this.startHeartbeat();
      this.emit({
        type: "pong",
        data: { connected: true },
      });
    };

    ws.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);

        const event: SocketEvent = {
          type: this.validateEventType(parsed?.type),
          data: parsed?.data,
        };

        this.emit(event);
      } catch {
        // Ignore malformed JSON messages.
      }
    };

    ws.onclose = () => {
      this.stopHeartbeat();
      this.ws = null;

      this.emit({
        type: "pong",
        data: { connected: false },
      });

      if (!this.destroyed) {
        this.scheduleReconnect();
      }
    };

    ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    this.destroyed = true;
    this.stopHeartbeat();

    if (this.reconnectTimer !== undefined) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.ws?.close();
    this.ws = null;
  }

  reconnect() {
    if (this.destroyed) return;

    if (this.reconnectTimer !== undefined) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.ws?.close();
  }

  send(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private emit(event: SocketEvent) {
    this.listeners.forEach((cb) => cb(event));
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: "ping" });
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer !== undefined) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer !== undefined) return;

    const delay = this.backoffMs;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, delay);

    this.backoffMs = Math.min(
      this.backoffMs * 2,
      this.maxBackoffMs
    );
  }

  private validateEventType(type: unknown): SocketEventType {
    if (
      type === "telemetry" ||
      type === "transition" ||
      type === "heat" ||
      type === "pong"
    ) {
      return type;
    }

    return "unknown";
  }
}

export const wsClient = new GridWebSocketClient(
  "ws://localhost:8080/ws/grid"
);

export function asNodeTelemetry(
  data: unknown
): NodeTelemetry | null {
  const d = data as Partial<NodeTelemetry> | null;

  if (
    !d ||
    typeof d.nodeId !== "string" ||
    typeof d.lat !== "number"
  ) {
    return null;
  }

  return d as NodeTelemetry;
}

export function asTransitionEvent(
  data: unknown
): TransitionEvent | null {
  const d = data as Partial<TransitionEvent> | null;

  if (
    !d ||
    typeof d.nodeId !== "string" ||
    typeof d.fromState !== "string"
  ) {
    return null;
  }

  return d as TransitionEvent;
}
