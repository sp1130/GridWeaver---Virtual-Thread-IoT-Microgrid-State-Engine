import React from "react";

/* ------------------------------------------------------------------ */
/*  GridLoadGauge — SVG donut gauge showing grid load %                */
/*                                                                     */
/*  Week 4 deliverable. Fires a red ">80% load" alert when the         */
/*  ratio of consumption to generation capacity crosses 80%.           */
/* ------------------------------------------------------------------ */
interface GridLoadGaugeProps {
  /** Current grid load as a percentage (0-100) */
  loadPercent: number;
  /** Optional threshold; defaults to 80 */
  threshold?: number;
}

const GAUGE_SIZE = 110;
const STROKE = 10;
const RADIUS = (GAUGE_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const GridLoadGauge: React.FC<GridLoadGaugeProps> = ({
  loadPercent,
  threshold = 80,
}) => {
  const clamped = Math.min(Math.max(loadPercent, 0), 100);
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const isOverThreshold = loadPercent > threshold;

  // Color ramps with load: green -> yellow -> red
  const color = isOverThreshold
    ? "#ef4444"
    : loadPercent > 60
      ? "#facc15"
      : "#4ade80";

  return (
    <div className="flex flex-col items-center gap-1" data-testid="grid-load-gauge">
      <svg
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
        aria-label={`Grid load ${Math.round(loadPercent)}%`}
      >
        {/* Background track */}
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE}
        />
        {/* Progress arc (starts at top, rotates clockwise) */}
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
          className="transition-all duration-500"
        />
        {/* Center label */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-100 text-base font-bold"
          style={{ fontSize: 22 }}
        >
          {Math.round(loadPercent)}%
        </text>
      </svg>

      <span className="text-[11px] uppercase tracking-wide text-slate-400">Grid Load</span>

      {/* >80% alert banner */}
      {isOverThreshold && (
        <span
          className="mt-1 flex items-center gap-1 rounded bg-red-600/20 border border-red-500/50 px-2 py-0.5 text-[11px] font-bold text-red-300 animate-pulse"
          data-testid="load-alert"
        >
          ⚠ High load — {Math.round(loadPercent - threshold)}% over threshold
        </span>
      )}
    </div>
  );
};

export default GridLoadGauge;
