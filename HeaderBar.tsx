import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectConnected, selectReconnectAttempts } from "../../store/connectionSlice";
import { selectFaultCount } from "../../store/nodesSlice";
import ThemeToggle from "./ThemeToggle";

/* ------------------------------------------------------------------ */
/*  HeaderBar — app header                                             */
/*                                                                     */
/*  • Title with logo                                                  */
/*  • Live clock (updates every second)                                */
/*  • WebSocket connection badge (green online / red offline)          */
/*  • Fault counter                                                    */
/*  • Dark/light theme toggle                                          */
/* ------------------------------------------------------------------ */
const HeaderBar: React.FC = () => {
  const connected = useSelector((state: RootState) => selectConnected(state));
  const reconnectAttempts = useSelector((state: RootState) =>
    selectReconnectAttempts(state)
  );
  const faultCount = useSelector((state: RootState) => selectFaultCount(state));
  const [now, setNow] = useState(new Date());

  /* Live clock — 1s tick */
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header
      className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-slate-700 text-slate-100 shrink-0"
      data-testid="header-bar"
    >
      {/* Logo */}
      <img src="/logo.svg" alt="GridWeaver" className="w-9 h-9" />

      {/* Title + subtitle */}
      <div className="min-w-0">
        <h1 className="text-base font-bold tracking-tight leading-tight">
          GridWeaver
        </h1>
        <p className="text-[11px] text-slate-500 leading-tight">
          Microgrid State Dashboard
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Fault counter */}
      <span
        className={`hidden sm:flex items-center gap-1 rounded px-2 py-1 text-xs font-mono
                    ${faultCount > 0 ? "bg-red-600/20 text-red-300 animate-pulse" : "text-slate-500"}`}
        data-testid="fault-counter"
      >
        ⚠ {faultCount} fault{faultCount === 1 ? "" : "s"}
      </span>

      {/* Live clock */}
      <span
        className="hidden md:block font-mono text-sm text-cyan-400 tabular-nums"
        data-testid="live-clock"
      >
        {now.toLocaleTimeString()}
      </span>

      {/* Connection badge */}
      <span
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold
                    ${connected
                      ? "bg-green-600/20 text-green-300 border border-green-500/40"
                      : "bg-red-600/20 text-red-300 border border-red-500/40"
                    }`}
        data-testid="connection-badge"
        title={
          connected
            ? "Connected to state engine"
            : `Disconnected — attempt ${reconnectAttempts}`
        }
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            connected ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`}
        />
        {connected ? "LIVE" : `RECONNECTING (${reconnectAttempts})`}
      </span>

      {/* Theme toggle */}
      <ThemeToggle />
    </header>
  );
};

export default HeaderBar;
