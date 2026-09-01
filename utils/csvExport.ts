// src/utils/csvExport.ts
// Client-side CSV export of the transition Event Log.
//
// Used when the backend CSV endpoint is unavailable (offline / demo
// mode) — builds the CSV entirely from Redux events and triggers a
// browser download.

import type { TransitionEvent } from "../types/grid";

/* ------------------------------------------------------------------ */
/*  CSV helpers                                                        */
/* ------------------------------------------------------------------ */

/** Escape one CSV field (wraps in quotes when it contains commas etc.) */
function escapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Build a CSV string from transition events.
 * Columns: time, node_id, zone, from_state, to_state
 */
export function buildEventLogCsv(events: TransitionEvent[]): string {
  const header = "time,node_id,zone,from_state,to_state";
  const rows = events.map(
    (e) =>
      [
        new Date(e.timestamp).toISOString(),
        escapeField(e.nodeId),
        escapeField(e.zone),
        escapeField(e.fromState),
        escapeField(e.toState),
      ].join(",")
  );
  return [header, ...rows].join("\n");
}

/**
 * Trigger a browser download of the Event Log as a CSV file.
 * Filename includes a timestamp so exports never overwrite each other.
 */
export function downloadEventLogCsv(events: TransitionEvent[]): void {
  const csv = buildEventLogCsv(events);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  anchor.download = `gridweaver-event-log-${stamp}.csv`;
  anchor.click();

  URL.revokeObjectURL(url);
}

export default { buildEventLogCsv, downloadEventLogCsv };
