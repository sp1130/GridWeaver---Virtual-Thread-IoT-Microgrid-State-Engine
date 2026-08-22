// src/utils/zoneAggregator.ts
// Reduces the high-frequency node telemetry stream into per-zone
// aggregates (consumption vs generation totals) on a fixed interval.
//
// Mirrors the backend zoneAggregator: every ~500ms it folds the pending
// node updates into per-zone totals and returns fresh HeatPoint[] /
// PowerFlowEvent[] data for the heatmap + power-flow layers.

import type { HeatPoint, NodeTelemetry, PowerFlowEvent } from "../types/grid";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface ZoneTotals {
  zone: string;
  nodes: number;
  generationKw: number; // SOLAR output + charging intake
  consumptionKw: number; // discharging output into load
  netKw: number;
  center: [number, number];
  faultCount: number;
}

/* ------------------------------------------------------------------ */
/*  Zone centre anchors (match GISMapContainer ZONES polygons)         */
/* ------------------------------------------------------------------ */
const ZONE_CENTERS: Record<string, [number, number]> = {
  "ZONE-A": [13.015, 77.575],
  "ZONE-B": [12.955, 77.575],
  "ZONE-C": [12.955, 77.625],
};

/* ------------------------------------------------------------------ */
/*  Aggregator class                                                   */
/* ------------------------------------------------------------------ */
export class ZoneAggregator {
  private latestNodes = new Map<string, NodeTelemetry>();

  /** Ingest one telemetry event (call from the WebSocket handler). */
  ingest(node: NodeTelemetry) {
    this.latestNodes.set(node.nodeId, node);
  }

  /** Ingest a batch of telemetry events at once. */
  ingestBatch(nodes: NodeTelemetry[]) {
    for (const node of nodes) {
      this.latestNodes.set(node.nodeId, node);
    }
  }

  /** Compute per-zone totals from the current node snapshot. */
  computeTotals(): ZoneTotals[] {
    const totals = new Map<string, ZoneTotals>();

    const init = (zone: string): ZoneTotals => {
      const center = ZONE_CENTERS[zone] ?? [12.9716, 77.5946];
      const t: ZoneTotals = {
        zone,
        nodes: 0,
        generationKw: 0,
        consumptionKw: 0,
        netKw: 0,
        center,
        faultCount: 0,
      };
      totals.set(zone, t);
      return t;
    };

    for (const node of this.latestNodes.values()) {
      const t = totals.get(node.zone) ?? init(node.zone);
      t.nodes += 1;
      if (node.state === "SOLAR" || node.state === "CHARGING") {
        t.generationKw += node.powerKw;
      } else if (node.state === "DISCHARGING") {
        t.consumptionKw += Math.abs(node.powerKw);
      } else if (node.state === "FAULT") {
        t.faultCount += 1;
      }
      t.netKw = t.generationKw - t.consumptionKw;
    }

    return Array.from(totals.values()).sort((a, b) => a.zone.localeCompare(b.zone));
  }

  /**
   * Heatmap points (consumption intensity) from current totals.
   * Intensity is normalised per zone: 0 (no load) → 1 (fully loaded).
   */
  computeHeatPoints(): HeatPoint[] {
    const totals = this.computeTotals();
    const maxConsumption = Math.max(1, ...totals.map((t) => t.consumptionKw));
    return totals.map((t) => ({
      lat: t.center[0] + (Math.random() - 0.5) * 0.004,
      lng: t.center[1] + (Math.random() - 0.5) * 0.004,
      intensity: t.consumptionKw / maxConsumption,
    }));
  }

  /**
   * Power-flow events: zones with a deficit pull power from the zone
   * with the largest surplus (regional balancing).
   */
  computePowerFlows(): PowerFlowEvent[] {
    const totals = this.computeTotals();
    const sorted = [...totals].sort((a, b) => b.netKw - a.netKw);
    const flows: PowerFlowEvent[] = [];
    const now = new Date().toISOString();

    // Richest zone supplies every deficit zone
    const surplus = sorted[0];
    for (const t of sorted.slice(1)) {
      if (t.netKw < 0 && surplus && surplus.netKw > 0) {
        flows.push({
          from: surplus.zone,
          to: t.zone,
          kw: Math.min(-t.netKw, surplus.netKw),
          timestamp: now,
        });
      }
    }
    return flows;
  }

  /** Drop the cache (e.g., after a reset). */
  clear() {
    this.latestNodes.clear();
  }
}

/* ------------------------------------------------------------------ */
/*  Interval driver — call this once from a component / hook.          */
/*  It emits aggregated data every ~500ms.                             */
/* ------------------------------------------------------------------ */
export function startAggregationLoop(
  aggregator: ZoneAggregator,
  onTick: (totals: ZoneTotals[], heat: HeatPoint[], flows: PowerFlowEvent[]) => void,
  intervalMs = 500
): () => void {
  const timer = window.setInterval(() => {
    onTick(
      aggregator.computeTotals(),
      aggregator.computeHeatPoints(),
      aggregator.computePowerFlows()
    );
  }, intervalMs);
  return () => window.clearInterval(timer);
}

export default ZoneAggregator;
