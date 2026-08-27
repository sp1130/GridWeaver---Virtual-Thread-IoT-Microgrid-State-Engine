import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectAllNodes } from "../../store/nodesSlice";

/* ------------------------------------------------------------------ */
/*  ZoneSummary — per-zone generation vs consumption comparison        */
/*                                                                     */
/*  Week 3 deliverable: aggregation mirrors what the backend           */
/*  zoneAggregator does — used here for instant client-side display.   */
/* ------------------------------------------------------------------ */

interface ZoneAggregates {
  zone: string;
  nodes: number;
  generationKw: number; // SOLAR output + CHARGING intake (positive inflow)
  consumptionKw: number; // DISCHARGING output into load (negative outflow)
  netKw: number;
}

const ZONE_COLORS: Record<string, string> = {
  "ZONE-A": "#22d3ee",
  "ZONE-B": "#facc15",
  "ZONE-C": "#f472b6",
};

const ZoneSummary: React.FC = () => {
  const nodes = useSelector((state: RootState) => selectAllNodes(state));

  /* Aggregate generation / consumption per zone in a single pass */
  const zones = useMemo<ZoneAggregates[]>(() => {
    const agg: Record<string, ZoneAggregates> = {};

    const init = (zone: string): ZoneAggregates =>
      (agg[zone] = { zone, nodes: 0, generationKw: 0, consumptionKw: 0, netKw: 0 });

    for (const node of nodes) {
      const z = agg[node.zone] ?? init(node.zone);
      z.nodes += 1;
      if (node.state === "SOLAR" || node.state === "CHARGING") {
        z.generationKw += node.powerKw;
      } else if (node.state === "DISCHARGING") {
        z.consumptionKw += Math.abs(node.powerKw);
      }
      z.netKw = z.generationKw - z.consumptionKw;
    }

    return Object.values(agg).sort((a, b) => a.zone.localeCompare(b.zone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  const maxKw = Math.max(1, ...zones.flatMap((z) => [z.generationKw, z.consumptionKw]));

  return (
    <section data-testid="zone-summary">
      <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
        Zone Summary
      </h3>
      <div className="space-y-3">
        {zones.length === 0 && (
          <p className="text-xs text-slate-500">No zone data yet — waiting on telemetry…</p>
        )}
        {zones.map((z) => (
          <div
            key={z.zone}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5"
            style={{ borderColor: `${ZONE_COLORS[z.zone]}55` }}
          >
            {/* Zone header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold" style={{ color: ZONE_COLORS[z.zone] }}>
                {z.zone}
              </span>
              <span className="font-mono text-slate-400">{z.nodes.toLocaleString()} nodes</span>
            </div>

            {/* Generation vs Consumption bars */}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-16 text-[10px] uppercase text-slate-500">Gen</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(z.generationKw / maxKw) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-[11px] text-green-300">
                  {z.generationKw.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-[10px] uppercase text-slate-500">Con</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${(z.consumptionKw / maxKw) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-[11px] text-orange-300">
                  {z.consumptionKw.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Net balance */}
            <div className="mt-1.5 flex justify-between text-[11px]">
              <span className="text-slate-500">Net balance</span>
              <span
                className={`font-mono font-bold ${
                  z.netKw >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {z.netKw >= 0 ? "+" : ""}
                {z.netKw.toFixed(1)} kW
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ZoneSummary;
