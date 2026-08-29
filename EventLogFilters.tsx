import React from "react";
import type { NodeState } from "../../types/grid";


const ALL_STATES: NodeState[] = [
  "CHARGING",
  "DISCHARGING",
  "IDLE",
  "SOLAR",
  "FAULT",
];

const ZONE_OPTIONS = ["ALL", "ZONE-A", "ZONE-B", "ZONE-C"];

export type TimeWindow = "5m" | "30m" | "1h" | "all";

const TIME_WINDOWS: TimeWindow[] = ["5m", "30m", "1h", "all"];

export interface EventLogFilterState {
  fromState: NodeState | "ALL";
  toState: NodeState | "ALL";
  zone: string;
  timeWindow: TimeWindow;
  query: string; 
}

export const DEFAULT_FILTERS: EventLogFilterState = {
  fromState: "ALL",
  toState: "ALL",
  zone: "ALL",
  timeWindow: "30m",
  query: "",
};

interface EventLogFiltersProps {
  filters: EventLogFilterState;
  onChange: (next: EventLogFilterState) => void;
  totalCount: number;
  filteredCount: number;
}

const selectClass =
  "bg-slate-800 text-slate-200 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-400 focus:outline-none";

const EventLogFilters: React.FC<EventLogFiltersProps> = ({
  filters,
  onChange,
  totalCount,
  filteredCount,
}) => {
  const set = (patch: Partial<EventLogFilterState>) =>
    onChange({ ...filters, ...patch });

  const isFiltered =
    filters.fromState !== "ALL" ||
    filters.toState !== "ALL" ||
    filters.zone !== "ALL" ||
    filters.timeWindow !== "all" ||
    filters.query.trim() !== "";

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-850">
      {/* Zone filter */}
      <select
        className={selectClass}
        value={filters.zone}
        onChange={(e) => set({ zone: e.target.value })}
        aria-label="Filter by zone"
      >
        {ZONE_OPTIONS.map((z) => (
          <option key={z} value={z}>
            {z === "ALL" ? "All zones" : z}
          </option>
        ))}
      </select>

      {/* From-state filter */}
      <select
        className={selectClass}
        value={filters.fromState}
        onChange={(e) =>
          set({
            fromState: e.target.value as NodeState | "ALL",
          })
        }
        aria-label="Filter from-state"
      >
        <option value="ALL">From state…</option>

        {ALL_STATES.map((s) => (
          <option key={s} value={s}>
            From: {s}
          </option>
        ))}
      </select>

      {/* To-state filter */}
      <select
        className={selectClass}
        value={filters.toState}
        onChange={(e) =>
          set({
            toState: e.target.value as NodeState | "ALL",
          })
        }
        aria-label="Filter to-state"
      >
        <option value="ALL">To state…</option>

        {ALL_STATES.map((s) => (
          <option key={s} value={s}>
            To: {s}
          </option>
        ))}
      </select>

      {/* Time window */}
      <div className="flex rounded border border-slate-600 overflow-hidden text-sm">
        {TIME_WINDOWS.map((w) => (
          <button
            key={w}
            className={`px-2 py-1 transition-colors ${
              filters.timeWindow === w
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            onClick={() => set({ timeWindow: w })}
          >
            {/* Small UI improvement */}
            {w === "all" ? "All" : `Last ${w}`}
          </button>
        ))}
      </div>

      {/* Free-text node id search */}
      <input
        type="text"
        placeholder="Search node id…"
        value={filters.query}
        onChange={(e) => set({ query: e.target.value })}
        className="bg-slate-800 text-slate-200 border border-slate-600 rounded px-2 py-1 text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none w-36"
        aria-label="Search node id"
      />

      {/* Reset + counter */}
      <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
        {isFiltered && (
          <button
            className="text-cyan-400 hover:text-cyan-300 underline"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            Reset
          </button>
        )}

        <span data-testid="event-count">
          {filteredCount} / {totalCount} transitions
        </span>
      </div>
    </div>
  );
};

export default EventLogFilters;
  );
};

export default EventLogFilters;
