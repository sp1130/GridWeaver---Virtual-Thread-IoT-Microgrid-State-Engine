```tsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectPowerFlows } from "../../store/heatSlice";
map

=======
 slidebar
 main
 main
const ZONE_ANCHORS: Record<string, L.LatLngExpression> = {
  "ZONE-A": [13.015, 77.575],
  "ZONE-B": [12.955, 77.575],
  "ZONE-C": [12.955, 77.625],
};

const dashAnimation = `
  @keyframes powerFlowDash {
    to {
      stroke-dashoffset: -32;
    }
  }

  .power-flow-line {
    animation: powerFlowDash 0.8s linear infinite;
  }
`;

interface PowerFlow {
  from: string;
  to: string;
  kw: number;
}

const PowerFlowLayer: React.FC = () => {
  const map = useMap();
  const linesRef = useRef<L.Polyline[]>([]);
  const flowStyleRef = useRef<HTMLStyleElement | null>(null);

  const flows = useSelector((state: RootState) =>
    selectPowerFlows(state)
  );
 map

  // Add animation styles once when the component mounts


 main
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

map
  useEffect(() => {
    // Remove previously rendered power-flow lines

 slidebar


main
  useEffect(() => {
 main
    linesRef.current.forEach((line) => {
      map.removeLayer(line);
    });

    linesRef.current = [];

    flows.forEach((flow: PowerFlow) => {
      const from = ZONE_ANCHORS[flow.from];
      const to = ZONE_ANCHORS[flow.to];

map
      // Skip flows when the zone anchor is unavailable
      if (!from || !to) return;

      const isForwardFlow = flow.kw >= 0;
      const powerValue = Math.abs(flow.kw);

      const line = L.polyline([from, to], {
        color: isForwardFlow ? "#22d3ee" : "#facc15",
        weight: Math.min(2 + powerValue / 200, 8),

      if (!from || !to) return;

    
      const lineWeight = Math.min(
        Math.max(2 + Math.abs(flow.kw) / 200, 2),
        8
      );

      const line = L.polyline([from, to], {
        color: flow.kw >= 0 ? "#22d3ee" : "#facc15",
        weight: lineWeight,
main
        opacity: 0.85,
        dashArray: "8 8",
        className: "power-flow-line",
      })
        .bindTooltip(
 map
          `
            <strong>${flow.from} → ${flow.to}</strong><br />
            Power Flow: ${powerValue.toFixed(1)} kW<br />
            Direction: ${isForwardFlow ? "Forward" : "Reverse"}
          `,

          `${flow.from} → ${flow.to}: ${Math.abs(flow.kw).toFixed(1)} kW`,
main
          {
            sticky: true,
          }
        )
        .addTo(map);

      linesRef.current.push(line);
    });
  }, [flows, map]);

 map
  return null;

 slidebar
  return null;

  return null; 
main
 main
};

export default PowerFlowLayer;
export type { PowerFlow };
```
