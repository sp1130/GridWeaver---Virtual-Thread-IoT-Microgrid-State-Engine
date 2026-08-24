
export type NodeState = "SOLAR" | "CHARGING" | "DISCHARGING" | "IDLE" | "FAULT";

export interface NodeTelemetry {
  nodeId: string; 
  lat: number; 
  lng: number; 
  zone: string; 
  state: NodeState;
  powerKw: number; 
  timestamp: string; 
}

export interface TransitionEvent {
  nodeId: string;
  zone: string;
  fromState: NodeState;
  toState: NodeState;
  timestamp: string; 
}
export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface PowerFlowEvent {
  from: string; 
  to: string; 
  kw: number; 
  timestamp: string;
}

export interface ZoneDefinition {
  id: string; 
  label: string;
  color: string;
  bounds: [number, number][]; 
  center: [number, number];
}

export interface HighlightNodeDetail {
  nodeId: string;
}
