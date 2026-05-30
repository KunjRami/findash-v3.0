import { useMemo, useRef, useState, useEffect } from "react";

/* ── Build candle data from backend technicalData ─────────────── */
function buildCandles(technicalData) {
  if (!technicalData) return [];
  const { dates, ohlcv } = technicalData;
  return dates.map((date, i) => ({
    date,
    label: date.slice(5),
    open:   ohlcv.open[i],
    high:   ohlcv.high[i],
    low:    ohlcv.low[i],
    close:  ohlcv.close[i],
    volume: ohlcv.volume[i],
  })).filter((d) => d.open && d.high && d.low && d.close);
}

/* ── Tooltip ──────────────────────────────────────────────────── */
function Tooltip({ candle, x, y, chartWidth }) {
  if (!candle) return null;
  const isUp = candle.close >= candle.open;
  const flip = x > chartWidth * 0.65;
  return (
    <foreignObject
      x={flip ? x - 152 : x + 10}
      y={Math.max(y - 60, 4)}
      width={148}
      height={130}
    >
      <div className="bg-fin-card border border-fin-border rounded-xl p-2.5 shadow-2xl text-xs space-y-1">
        <p className="text-fin-text-secondary font-medium">{candle.date}</p>
        {[
          ["O", candle.open],
          ["H", candle.high],
          ["L", candle.low],
          ["C", candle.close],
        ].map(([lbl, val]) => (
          <div key={lbl} className="flex justify-between">
            <span className="text-fin-text-secondary">{lbl}</span>
            <span className={`font-num font-bold ${isUp ? "text-fin-green" : "text-fin-red"}`}>
              ₹{Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-fin-border pt-1">
          <span className="text-fin-text-secondary">Vol</span>
          <span className="font-num text-fin-text-primary">
            {candle.volume ? `${(candle.volume / 1e6).toFixed(2)}M` : "—"}
          </span>
        </div>
      </div>
    </foreignObject>
  );
}

export default function CandlestickChart({ technicalData, height = 340 }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);
  const [hovered, setHovered] = useState(null); // { candle, x, y }

  /* Responsive width */
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(containerRef.current);
    setWidth(containerRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const candles = useMemo(() => buildCandles(technicalData), [technicalData]);

  if (!candles.length) {
    return (
      <div ref={containerRef} className="flex items-center justify-center text-fin-text-secondary text-sm" style={{ height }}>
        No OHLC data available
      </div>
    );
  }

  /* Layout constants */
  const pad = { top: 16, right: 8, bottom: 32, left: 62 };
  const chartW = width  - pad.left - pad.right;
  const chartH = height - pad.top  - pad.bottom;

  /* Visible window — last 60 candles to avoid cramping */
  const visible = candles.slice(-Math.min(candles.length, Math.floor(chartW / 8)));
  const n = visible.length;

  /* Price scale */
  const allP = visible.flatMap((d) => [d.high, d.low]);
  const minP  = Math.min(...allP) * 0.9985;
  const maxP  = Math.max(...allP) * 1.0015;
  const yS    = (p) => chartH - ((p - minP) / (maxP - minP)) * chartH;

  /* X scale */
  const slotW   = chartW / n;
  const candleW = Math.max(slotW * 0.55, 2);
  const xS      = (i) => i * slotW + slotW / 2;

  /* Y-axis ticks */
  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) => minP + ((maxP - minP) * i) / (ticks - 1));

  /* X-axis labels — thin out */
  const step = Math.max(1, Math.floor(n / 8));
  const xLabels = visible.filter((_, i) => i % step === 0 || i === n - 1);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseLeave={() => setHovered(null)}
      >
        <g transform={`translate(${pad.left},${pad.top})`}>
          {/* Grid lines */}
          {yTicks.map((p, i) => (
            <g key={i}>
              <line x1={0} x2={chartW} y1={yS(p)} y2={yS(p)} stroke="#1f2937" strokeWidth={1} />
              <text
                x={-8}
                y={yS(p) + 4}
                fill="#6b7280"
                fontSize={9}
                textAnchor="end"
              >
                ₹{p >= 1000 ? `${(p / 1000).toFixed(1)}k` : p.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Candles */}
          {visible.map((d, i) => {
            const isUp  = d.close >= d.open;
            const color = isUp ? "#10b981" : "#ef4444";
            const cx    = xS(i);
            const yH    = yS(d.high);
            const yL    = yS(d.low);
            const bodyT = Math.min(yS(d.open), yS(d.close));
            const bodyH = Math.max(Math.abs(yS(d.open) - yS(d.close)), 1.5);

            return (
              <g
                key={d.date}
                onMouseEnter={(e) =>
                  setHovered({ candle: d, x: cx, y: (yH + yL) / 2 })
                }
                style={{ cursor: "crosshair" }}
              >
                {/* Wick */}
                <line x1={cx} x2={cx} y1={yH} y2={yL} stroke={color} strokeWidth={1} />
                {/* Body */}
                <rect
                  x={cx - candleW / 2}
                  y={bodyT}
                  width={candleW}
                  height={bodyH}
                  fill={isUp ? color : color}
                  fillOpacity={isUp ? 0.85 : 1}
                  rx={0.5}
                />
              </g>
            );
          })}

          {/* Hover crosshair */}
          {hovered && (
            <line
              x1={hovered.x} x2={hovered.x}
              y1={0}          y2={chartH}
              stroke="#4b5563" strokeWidth={1} strokeDasharray="4 3"
              pointerEvents="none"
            />
          )}

          {/* X-axis labels */}
          <line x1={0} x2={chartW} y1={chartH + 4} y2={chartH + 4} stroke="#1f2937" />
          {xLabels.map((d) => {
            const idx = visible.indexOf(d);
            return (
              <text
                key={d.date}
                x={xS(idx)}
                y={chartH + 18}
                fill="#6b7280"
                fontSize={9}
                textAnchor="middle"
              >
                {d.label}
              </text>
            );
          })}
        </g>

        {/* Tooltip */}
        {hovered && (
          <g transform={`translate(${pad.left},${pad.top})`}>
            <Tooltip
              candle={hovered.candle}
              x={hovered.x}
              y={hovered.y}
              chartWidth={chartW}
            />
          </g>
        )}
      </svg>
    </div>
  );
}