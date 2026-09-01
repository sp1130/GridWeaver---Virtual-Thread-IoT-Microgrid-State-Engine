import React from "react";
import type { TransitionEvent } from "../../types/grid";

/* ------------------------------------------------------------------ */
/*  State colour chips — consistent with the map icon set              */
/* ------------------------------------------------------------------ */
const STATE_STYLES: Record<string, string> = {
  CHARGING: "bg-green-600/20 text-green-300 border-green-500/40",
  DISCHARGING: "bg-orange-600/20 text-orange-300 border-orange-500/40",
  IDLE: "bg-slate-600/20 text-slate-300 border-slate-500/40",
  SOLAR: "bg-yellow-600/20 text-yellow-300 border-yellow-500/40",
  FAULT: "bg-red-600/30 text-red-300 border-red-500/50",
};

/* ------------------------------------------------------------------ */
/*  EventLogRow — a single transition row.                             */
/*  Clicking a row dispatches a window "highlightNode" event, which    */
/*  the map (NodeMarkerLayer) listens to and flies the map to that     */
/*  node's marker (Week 4 integration).                                */
/* ------------------------------------------------------------------ */
interface EventLogRowProps {
  event: TransitionEvent;
  style?: React.CSSProperties;
}

const chipClass =
  "inline-block border rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide";

const EventLogRow: React.FC<EventLogRowProps> = ({ event, style }) => {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("highlightNode", { detail: event.nodeId }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const when = new Date(event.timestamp).toLocaleTimeString();

  const isFault = event.toState === "FAULT";

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`grid grid-cols-[92px_110px_64px_1fr_92px] items-center gap-2 px-3 py-1.5 text-xs
                  cursor-pointer select-none border-b border-slate-800
                  hover:bg-slate-800 focus:bg-slate-800 focus:outline-none transition-colors
                  ${isFault ? "bg-red-950/40 hover:bg-red-950/60" : ""}`}
      style={style}
      data-testid="event-row"
    >
      {/* Timestamp */}
      <span className="text-slate-500 font-mono text-[11px]">{when}</span>

      {/* Node id */}
      <span className={`font-mono truncate ${isFault ? "text-red-300" : "text-slate-200"}`}>
        {event.nodeId}
      </span>

      {/* Zone */}
      <span className="text-slate-400">{event.zone}</span>

      {/* From → To transition */}
      <span className="flex items-center gap-1.5">
        <span className={`${chipClass} ${STATE_STYLES[event.fromState] ?? ""}`}>
          {event.fromState}
        </span>
        <span className="text-slate-500">→</span>
        <span className={`${chipClass} ${STATE_STYLES[event.toState] ?? ""}`}>
          {event.toState}
        </span>
      </span>

      {/* Fault indicator */}
      <span>
        {isFault && (
          <span className="text-red-400 font-bold uppercase text-[11px]" data-testid="fault-flag">
            ⚠ Fault
          </span>
        )}
      </span>
    </div>
  );
};

export default EventLogRow;
export { STATE_STYLES };
