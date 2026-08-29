import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { upsertNode } from "../store/nodesSlice";
import { addTransition } from "../store/eventsSlice";
import { setHeatPoints } from "../store/heatSlice";
import {
  setConnected,
  incrementReconnectAttempts,
  setLastError,
} from "../store/connectionSlice";
import type { NodeTelemetry, TransitionEvent } from "../types/grid";

const WS_URL = "ws://localhost:8080/ws/grid";

const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

const HEARTBEAT_MS = 25000;

export function useWebSocket() {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef<number>(BACKOFF_BASE_MS);
  const heartbeatRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        dispatch(setConnected(true));
        backoffRef.current = BACKOFF_BASE_MS;

        heartbeatRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (msg) => {
        try {
          const payload = JSON.parse(msg.data);

          switch (payload.type) {
            case "telemetry": {
              const node: NodeTelemetry = payload.data as NodeTelemetry;
              dispatch(upsertNode(node));
              break;
            }

            case "transition": {
              const transition: TransitionEvent =
                payload.data as TransitionEvent;
              dispatch(addTransition(transition));
              break;
            }

            case "heat": {
              dispatch(setHeatPoints(payload.data));
              break;
            }

            case "pong":
            default:
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        dispatch(setConnected(false));

        if (heartbeatRef.current !== undefined) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = undefined;
        }

        if (!destroyed) {
          dispatch(incrementReconnectAttempts());

          window.setTimeout(connect, backoffRef.current);

          backoffRef.current = Math.min(
            backoffRef.current * 2,
            BACKOFF_MAX_MS
          );
        }
      };

      ws.onerror = () => {
        dispatch(setLastError("WebSocket error — reconnecting…"));
        ws.close();
      };
    }

    connect();

    return () => {
      destroyed = true;

      if (heartbeatRef.current !== undefined) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = undefined;
      }

      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [dispatch]);
}
