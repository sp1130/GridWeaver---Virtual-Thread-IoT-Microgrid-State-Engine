import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  selectConnected,
  selectReconnectAttempts,
} from "../../store/connectionSlice";

/* ------------------------------------------------------------------ */
/*  ConnectionBanner — reconnect / rehydration notice                  */
/*                                                                     */
/*  Slides over the map when the WebSocket is disconnected or is       */
/*  rehydrating state after a reconnect.                               */
/* ------------------------------------------------------------------ */
const ConnectionBanner: React.FC = () => {
  const connected = useSelector((state: RootState) => selectConnected(state));
  const reconnectAttempts = useSelector((state: RootState) =>
    selectReconnectAttempts(state)
  );

  /* Nothing to show when everything is fine */
  if (connected) return null;

  const isRehydrating = reconnectAttempts >= 1;

  return (
    <div
      role="alert"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]
                 flex items-center gap-3 rounded-lg border border-red-500/50
                 bg-slate-900/95 backdrop-blur px-4 py-2.5 shadow-xl
                 text-sm animate-pulse"
      data-testid="connection-banner"
    >
      <span className="text-red-400 text-lg">⚠</span>

      <div className="text-slate-200">
        <p className="font-semibold">
          {isRehydrating
            ? "Reconnecting to the state engine…"
            : "Connection lost"}
        </p>
        <p className="text-xs text-slate-400">
          {isRehydrating
            ? `Retrying… map will refresh with the latest grid state once reconnected.`
            : "Waiting for the backend WebSocket gateway to come back online."}
        </p>
      </div>
    </div>
  );
};

export default ConnectionBanner;
