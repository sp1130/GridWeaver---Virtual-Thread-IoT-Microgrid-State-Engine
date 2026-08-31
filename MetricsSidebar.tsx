import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectAllNodes } from "../../store/nodesSlice";
import GridLoadGauge from "./GridLoadGauge";
import NodeStateCounts from "./NodeStateCounts";
import ZoneSummary from "./ZoneSummary";

const MetricsSidebar: React.FC = () => {
  const nodes = useSelector((state: RootState) => selectAllNodes(state));

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

  const nodeCount = nodes.length;

  return (
    <aside
      className="flex flex-col h-full min-h-0 bg-slate-900 border-l border-slate-700 text-slate-100 overflow-y-auto"
      data-testid="metrics-sidebar"
    >
      <header className="px-3 py-2 border-b border-slate-700 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Grid Metrics
          </h2>

          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          {nodeCount} {nodeCount === 1 ? "node" : "nodes"} monitored
        </p>
      </header>

      <div className="flex flex-col gap-4 p-3">
        {/* Grid Load */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <GridLoadGauge
            loadPercent={loadPercent}
            threshold={80}
          />
        </div>

        {/* Node States */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <NodeStateCounts />
        </div>

        {/* Zone Summary */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <ZoneSummary />
        </div>
      </div>
    </aside>
  );
};

export default MetricsSidebar;
