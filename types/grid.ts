
export type NodeState = "SOLAR" | "CHARGING" | "DISCHARGING" | "IDLE" | "FAULT";

export interface NodeTelemetry {
  nodeId: string; // e.g. "node-00042"
  lat: number; // e.g. 13.0034
  lng: number; // e.g. 77.5937
  zone: string; // "ZONE-A" | "ZONE-B" | "ZONE-C"
  state: NodeState;
  powerKw: number; // instantaneous power in kW (negative = feeding back)
  timestamp: string; // ISO-8601
}


export interface TransitionEvent {
  nodeId: string;
  zone: string;
  fromState: NodeState;
  toState: NodeState;
  timestamp: string; // ISO-8601
}
export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface PowerFlowEvent {
  from: string; // surplus zone id, e.g. "ZONE-A"
  to: string; // deficit zone id, e.g. "ZONE-B"
  kw: number; // transferred power in kW
  timestamp: string;
}
export interface ZoneDefinition {
  id: string; // "ZONE-A"
  label: string; // "Zone A — Residential North"
  color: string; // hex, e.g. "#22d3ee"
  bounds: [number, number][]; // [lat, lng] ring
  center: [number, number];
}

export interface HighlightNodeDetail {
  nodeId: string;
}
