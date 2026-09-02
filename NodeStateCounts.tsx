import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectAllNodes, selectFaultCount } from "../../store/nodesSlice";
import type { NodeState } from "../../types/grid";

interface StateCountEntry {
  state: NodeState;
  label: string;
  icon: string;
  color: string;
  barColor: string;
}

const ENTRIES: StateCountEntry[] = [
  {
    state: "CHARGING",
    label: "Charging",
    icon: "🔋",
    color: "text-green-400",
    barColor: "bg-green-500",
  },
  {
    state: "DISCHARGING",
    label: "Discharging",
    icon: "⚡",
    color: "text-orange-400",
    barColor: "bg-orange-500",
  },
  {
    state: "IDLE",
    label: "Idle",
    icon: "⏸",
    color: "text-slate-400",
    barColor: "bg-slate-500",
  },
  {
    state: "SOLAR",
    label: "Solar",
    icon: "☀",
    color: "text-yellow-400",
    barColor: "bg-yellow-500",
  },
  {
    state: "FAULT",
    label: "Fault",
    icon: "⚠",
    color: "text-red-400",
    barColor: "bg-red-500",
  },
];

const NodeStateCounts: React.FC = () => {
  const nodes = useSelector((state: RootState) => selectAllNodes(state));
  const faultCount = useSelector((state: RootState) => selectFaultCount(state));

  const counts = useMemo(() => {
    const map: Record<NodeState, number> = {
      CHARGING: 0,
      DISCHARGING: 0,
      IDLE: 0,
      SOLAR: 0,
      FAULT: 0,
    };

    for (const node of nodes) {
      map[node.state] += 1;
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, faultCount]);

  const total = nodes.length;
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <section data-testid="node-state-counts">
      <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
        Node States
      </h3>

      <div className="space-y-2">
        {ENTRIES.map((entry) => {
          const count = counts[entry.state];
          const share =
            total > 0 ? Math.round((count / total) * 100) : 0;
          const isFault = entry.state === "FAULT";

          return (
            <div key={entry.state}>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`flex items-center gap-1.5 ${entry.color} font-medium`}
                >
                  <span>{entry.icon}</span>
                  <span>{entry.label}</span>
                </span>

                <span className="font-mono text-slate-200">
                  {count.toLocaleString()}
                  <span className="text-slate-500 ml-1">
                    ({share}%)
                  </span>
                </span>
              </div>

              {/* Mini bar chart */}
              <div
                className="mt-0.5 h-1.5 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-label={`${entry.label} nodes`}
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={maxCount}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${entry.barColor} ${
                    isFault ? "animate-pulse" : ""
                  }`}
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>Total nodes tracked</span>
        <span className="font-mono text-slate-200">
          {total.toLocaleString()}
        </span>
      </div>
    </section>
  );
};

export default NodeStateCounts;
