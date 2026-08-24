import React, { useMemo, useRef, useState } from "react";
import { FixedSizeList as VirtualList } from "react-window";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectAllEvents } from "../../store/eventsSlice";
import type { TransitionEvent } from "../../types/grid";
import EventLogFilters, {
  DEFAULT_FILTERS,
  type EventLogFilterState,
  type TimeWindow,
} from "./EventLogFilters";
import EventLogRow from "./EventLogRow";

/* ------------------------------------------------------------------ */
/*  Time-window cutoff computation                                     */
/* ------------------------------------------------------------------ */
const WINDOW_MS: Record<TimeWindow, number> = {
  "5m": 5 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  all: Infinity,
};

/* ------------------------------------------------------------------ */
/*  EventLogPanel — main audit panel (Week 4 deliverable)              */
/*                                                                     */
/*  • Virtualized scrolling table (react-window) so 5,000+ stored      */
/*    transitions stay smooth                                          */
/*  • Filters: zone, from-state, to-state, time window, node-id search */
/*  • Clicking a row dispatches "highlightNode" → map flies to that    */
/*    node and opens its popup                                         */
/* ------------------------------------------------------------------ */
const ROW_HEIGHT = 34; // px per row — keep in sync with EventLogRow

const EventLogPanel: React.FC = () => {
  const allEvents = useSelector((state: RootState) => selectAllEvents(state));
  const [filters, setFilters] = useState<EventLogFilterState>(DEFAULT_FILTERS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

  /* ---------- Auto-fit virtual list height to flex container -------- */
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // header + filters + column header + footer ≈ 132px, leave some margin
        setListHeight(Math.max(200, entry.contentRect.height - 140));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---------- Derive filtered events (memoised) --------------------- */
  const filtered = useMemo(() => {
    const cutoff = Date.now() - WINDOW_MS[filters.timeWindow];
    return allEvents.filter((e) => {
      if (filters.zone !== "ALL" && e.zone !== filters.zone) return false;
      if (filters.fromState !== "ALL" && e.fromState !== filters.fromState) return false;
      if (filters.toState !== "ALL" && e.toState !== filters.toState) return false;
      if (filters.timeWindow !== "all" && new Date(e.timestamp).getTime() < cutoff)
        return false;
      if (filters.query.trim() && !e.nodeId.toLowerCase().includes(filters.query.toLowerCase()))
        return false;
      return true;
    });
  }, [allEvents, filters]);

  /* ---------- Row renderer for react-window ------------------------- */
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <EventLogRow event={filtered[index]} style={style} />
  );

  return (
    <aside
      ref={containerRef}
      className="flex flex-col h-full min-h-0 bg-slate-900 border-l border-slate-700 text-slate-100"
      data-testid="event-log-panel"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-slate-700 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
          Event Log
        </h2>
        <span className="text-[11px] text-slate-500 font-mono">
          {allEvents.length.toLocaleString()} stored
        </span>
      </header>

      {/* Filter bar */}
      <div className="shrink-0">
        <EventLogFilters
          filters={filters}
          onChange={setFilters}
          totalCount={allEvents.length}
          filteredCount={filtered.length}
        />
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[92px_110px_64px_1fr_92px] gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-500 font-semibold border-b border-slate-700 bg-slate-850 shrink-0">
        <span>Time</span>
        <span>Node</span>
        <span>Zone</span>
        <span>Transition</span>
        <span></span>
      </div>

      {/* Virtualized body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            {allEvents.length === 0
              ? "No transitions yet — waiting on backend events…"
              : "No events match the current filters."}
          </div>
        ) : (
          <VirtualList
            height={listHeight}
            itemCount={filtered.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            data-testid="event-list"
          >
            {Row}
          </VirtualList>
        )}
      </div>

      {/* Footer hint */}
      <footer className="px-3 py-1.5 border-t border-slate-700 text-[10px] text-slate-500 shrink-0">
        Click a row to highlight the node on the map
      </footer>
    </aside>
  );
};

export default EventLogPanel;
