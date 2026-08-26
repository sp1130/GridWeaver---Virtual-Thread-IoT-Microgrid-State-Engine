import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectAllNodes } from "../../store/nodesSlice";
import GridLoadGauge from "./GridLoadGauge";
import NodeStateCounts from "./NodeStateCounts";
import ZoneSummary from "./ZoneSummary";

/* ------------------------------------------------------------------ */
/*  MetricsSidebar — parent sidebar with all metrics widgets           */
/*                                                                     */
/*  Week 4 deliverable: composes the grid-load gauge, node-state       */
/*  counters and per-zone summary into one scrollable sidebar.         */
/* ------------------------------------------------------------------ */
const MetricsSidebar: React.FC = () => {
  const nodes = useSelector((state: RootState) => selectAllNodes(state));

  /* Grid load % = total consumption / (total generation capacity + 1) */
  const loadPercent = useMemo(() => {
    let generationKw = 0;
    let consumptionKw = 0;
    for (const node of nodes) {
      if (node.state === "SOLAR" || node.state === "CHARGING") {
        generationKw += node.powerKw;
      } else if (node.state === "DISCHARGING") {
        consumptionKw += Math.abs(node.powerKw);
      }
    }
    // Avoid divide-by-zero before the first telemetry arrives
    const capacity = generationKw + 1;
    return Math.min((consumptionKw / capacity) * 100, 100);
  }, [nodes]);

  return (
    <aside
      className="flex flex-col h-full min-h-0 bg-slate-900 border-l border-slate-700 text-slate-100 overflow-y-auto"
      data-testid="metrics-sidebar"
    >
      <header className="px-3 py-2 border-b border-slate-700 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
          Grid Metrics
        </h2>
      </header>

      <div className="flex flex-col gap-4 p-3">
        {/* Week 4: grid load gauge with >80% alert */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <GridLoadGauge loadPercent={loadPercent} threshold={80} />
        </div>

        {/* Week 2/4: per-state node counters */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <NodeStateCounts />
        </div>

        {/* Week 3: per-zone generation vs consumption */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <ZoneSummary />
        </div>
      </div>
    </aside>
  );
};

export default MetricsSidebar;
