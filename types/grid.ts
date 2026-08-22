// src/types/grid.ts
// Core domain types for the GridWeaver microgrid dashboard.
//
// These types model exactly what the Java state engine emits over the
// WebSocket and REST endpoints, so the front end can consume them
// without any ad-hoc parsing.

/* ------------------------------------------------------------------ */
/*  Node states                                                        */
/* ------------------------------------------------------------------ */

/**
 * The discrete states a grid node can hold, per the state engine:
 *   SOLAR        — rooftop solar panel (generation)
 *   CHARGING     — home battery storing surplus power
 *   DISCHARGING  — home battery feeding power back into the grid
 *   IDLE         — battery standing by
 *   FAULT        — node reporting an error (shown pulsing on the map)
 */
export type NodeState = "SOLAR" | "CHARGING" | "DISCHARGING" | "IDLE" | "FAULT";

/* ------------------------------------------------------------------ */
/*  Telemetry — the high-frequency WebSocket event                     */
/* ------------------------------------------------------------------ */

/**
 * One node telemetry record. Emitted thousands of times per second
 * during peak simulation (50,000+ concurrent nodes).
 *
 * Wire format from backend:
 *   { "type": "telemetry", "data": { ... } }
 */
export interface NodeTelemetry {
  nodeId: string; // e.g. "node-00042"
  lat: number; // e.g. 13.0034
  lng: number; // e.g. 77.5937
  zone: string; // "ZONE-A" | "ZONE-B" | "ZONE-C"
  state: NodeState;
  powerKw: number; // instantaneous power in kW (negative = feeding back)
  timestamp: string; // ISO-8601
}

/* ------------------------------------------------------------------ */
/*  Transition event — the Event Log feed                              */
/* ------------------------------------------------------------------ */

/**
 * One state-transition audit record. Appended to the Event Log ring
 * buffer (capped at 5,000) and optionally exported as CSV.
 *
 * Wire format from backend:
 *   { "type": "transition", "data": { ... } }
 */
export interface TransitionEvent {
  nodeId: string;
  zone: string;
  fromState: NodeState;
  toState: NodeState;
  timestamp: string; // ISO-8601
}

/* ------------------------------------------------------------------ */
/*  Heatmap + power flow                                               */
/* ------------------------------------------------------------------ */

/** A single heat point for leaflet.heat (lat, lng, intensity 0–1). */
export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

/**
 * One zone-to-zone power transfer, drawn by PowerFlowLayer as an
 * animated polyline from the surplus zone to the deficit zone.
 *
 * Wire format from backend:
 *   { "type": "heat", "data": { "flows": [ ... ] } }
 */
export interface PowerFlowEvent {
  from: string; // surplus zone id, e.g. "ZONE-A"
  to: string; // deficit zone id, e.g. "ZONE-B"
  kw: number; // transferred power in kW
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Zone geometry                                                      */
/* ------------------------------------------------------------------ */

/**
 * Zone boundary polygon used by the map overlay and the zone
 * aggregator. Matches what GET /api/zones returns.
 */
export interface ZoneDefinition {
  id: string; // "ZONE-A"
  label: string; // "Zone A — Residential North"
  color: string; // hex, e.g. "#22d3ee"
  bounds: [number, number][]; // [lat, lng] ring
  center: [number, number];
}

/* ------------------------------------------------------------------ */
/*  UI cross-component messages                                        */
/* ------------------------------------------------------------------ */

/**
 * Custom window event payload dispatched when an Event Log row is
 * clicked. NodeMarkerLayer listens for it to fly the map to the node
 * and open its popup.
 *
 * Usage:
 *   window.dispatchEvent(new CustomEvent("highlightNode", {
 *     detail: { nodeId: "node-00042" }
 *   }));
 */
export interface HighlightNodeDetail {
  nodeId: string;
}
