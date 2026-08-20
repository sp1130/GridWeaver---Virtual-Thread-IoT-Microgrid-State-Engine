import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectPowerFlows } from "../../store/heatSlice";

/* ------------------------------------------------------------------ */
/*  Zone anchor points — approximate centers of Zone A/B/C             */
/*  (adjust to match your real ZONES polygon centres in                */
/*   GISMapContainer / LeafletMap)                                     */
/* ------------------------------------------------------------------ */
const ZONE_ANCHORS: Record<string, L.LatLngExpression> = {
  "ZONE-A": [13.015, 77.575],
  "ZONE-B": [12.955, 77.575],
  "ZONE-C": [12.955, 77.625],
};

/* ------------------------------------------------------------------ */
/*  Animated dash — gives the polyline a flowing-power appearance      */
/* ------------------------------------------------------------------ */
const dashAnimation = `
  @keyframes powerFlowDash {
    to { stroke-dashoffset: -32; }
  }
  .power-flow-line {
    animation: powerFlowDash 0.8s linear infinite;
  }
`;

/* ------------------------------------------------------------------ */
/*  PowerFlowLayer — animated polylines between zones (Week 4)         */
/*                                                                     */
/*  • Draws curved polylines from a source zone to target zones        */
/*  • Color encodes the direction of power transfer                    */
/*  • Updates when the backend regional-balancing logic emits new      */
/*    flow events                                                        */
/* ------------------------------------------------------------------ */
interface PowerFlow {
  from: string; // zone id, e.g. "ZONE-A"
  to: string;   // zone id, e.g. "ZONE-B"
  kw: number;   // power being transferred
}

const PowerFlowLayer: React.FC = () => {
  const map = useMap();
  const linesRef = useRef<L.Polyline[]>([]);
  const flowStyleRef = useRef<HTMLStyleElement | null>(null);

  const flows = useSelector((state: RootState) => selectPowerFlows(state));

  /* ---------- Inject the dash animation stylesheet once ------------- */
  useEffect(() => {
    if (!flowStyleRef.current) {
      const style = document.createElement("style");
      style.textContent = dashAnimation;
      document.head.appendChild(style);
      flowStyleRef.current = style;
    }
    return () => {
      flowStyleRef.current?.remove();
      flowStyleRef.current = null;
    };
  }, []);

  /* ---------- Rebuild flow lines whenever the flows array changes --- */
  useEffect(() => {
    // Remove old lines
    linesRef.current.forEach((line) => map.removeLayer(line));
    linesRef.current = [];

    flows.forEach((flow: PowerFlow) => {
      const from = ZONE_ANCHORS[flow.from];
      const to = ZONE_ANCHORS[flow.to];
      if (!from || !to) return;

      const line = L.polyline([from, to], {
        color: flow.kw >= 0 ? "#22d3ee" : "#facc15",
        weight: Math.min(2 + Math.abs(flow.kw) / 200, 8),
        opacity: 0.85,
        dashArray: "8 8",
        className: "power-flow-line",
      })
        .bindTooltip(
          `${flow.from} → ${flow.to}: ${Math.abs(flow.kw).toFixed(1)} kW`,
          { sticky: true }
        )
        .addTo(map);

      linesRef.current.push(line);
    });
  }, [flows, map]);

  return null; // renders nothing itself — it manages polyline layers
};

export default PowerFlowLayer;
export type { PowerFlow };
