import { useMemo, useState } from "react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

/* ── helpers ───────────────────────────────────────────────────── */
const fmt = (v) => (v == null ? "—" : `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);

function buildChartData(technicalData) {
  if (!technicalData) return [];
  const { dates, ohlcv, indicators } = technicalData;
  return dates.map((date, i) => ({
    date: date.slice(5),          // "MM-DD"
    fullDate: date,
    close:   ohlcv.close[i],
    volume:  ohlcv.volume[i],
    sma20:   indicators.sma_20[i],
    sma50:   indicators.sma_50[i],
    ema9:    indicators.ema_9[i],
    ema21:   indicators.ema_21[i],
    bbUpper: indicators.bb_upper[i],
    bbLower: indicators.bb_lower[i],
  }));
}

/* ── Custom Tooltip ─────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-fin-card border border-fin-border rounded-xl p-3 shadow-2xl text-xs space-y-1 min-w-[160px]">
      <p className="text-fin-text-secondary font-medium mb-1.5">{d?.fullDate}</p>
      {payload.map((p) =>
        p.value != null ? (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-num font-semibold text-fin-text-primary">
              {p.dataKey === "volume"
                ? Number(p.value).toLocaleString("en-IN")
                : fmt(p.value)}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
};

/* ── Indicator toggle button ────────────────────────────────────── */
const IndBtn = ({ label, color, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded text-xs font-semibold transition-all border
      ${active
        ? "border-transparent text-white"
        : "border-fin-border text-fin-text-secondary hover:border-fin-text-secondary"}`}
    style={active ? { background: color } : {}}
  >
    {label}
  </button>
);

/* ── Main component ─────────────────────────────────────────────── */
export default function PriceChart({ technicalData, height = 320 }) {
  const [show, setShow] = useState({
    sma20: true, sma50: true, ema9: false, ema21: false, bb: false, vol: true,
  });

  const toggle = (k) => setShow((p) => ({ ...p, [k]: !p[k] }));

  const chartData = useMemo(() => buildChartData(technicalData), [technicalData]);

  if (!chartData.length) {
    return (
      <div
        className="flex items-center justify-center text-fin-text-secondary text-sm"
        style={{ height }}
      >
        No price data available
      </div>
    );
  }

  const prices = chartData.map((d) => d.close).filter(Boolean);
  const minP = Math.min(...prices) * 0.998;
  const maxP = Math.max(...prices) * 1.002;

  return (
    <div className="space-y-3">
      {/* Indicator toggles */}
      <div className="flex flex-wrap gap-1.5">
        <IndBtn label="SMA 20"  color="#3b82f6" active={show.sma20}  onClick={() => toggle("sma20")} />
        <IndBtn label="SMA 50"  color="#f59e0b" active={show.sma50}  onClick={() => toggle("sma50")} />
        <IndBtn label="EMA 9"   color="#a78bfa" active={show.ema9}   onClick={() => toggle("ema9")}  />
        <IndBtn label="EMA 21"  color="#06b6d4" active={show.ema21}  onClick={() => toggle("ema21")} />
        <IndBtn label="BB"      color="#6b7280" active={show.bb}     onClick={() => toggle("bb")}    />
        <IndBtn label="Volume"  color="#10b981" active={show.vol}    onClick={() => toggle("vol")}   />
      </div>

      {/* Price chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6b7280" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#1f2937" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minP, maxP]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
            width={58}
            yAxisId="price"
          />
          {show.vol && (
            <YAxis
              yAxisId="vol"
              orientation="right"
              tick={{ fill: "#4b5563", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
              width={42}
            />
          )}

          <Tooltip content={<CustomTooltip />} />

          {/* Volume bars behind price */}
          {show.vol && (
            <Bar
              yAxisId="vol"
              dataKey="volume"
              name="Volume"
              fill="#10b981"
              fillOpacity={0.18}
              radius={[2, 2, 0, 0]}
            />
          )}

          {/* Bollinger Bands */}
          {show.bb && (
            <>
              <Area
                yAxisId="price"
                dataKey="bbUpper"
                name="BB Upper"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="url(#bbGrad)"
                dot={false}
                activeDot={false}
              />
              <Area
                yAxisId="price"
                dataKey="bbLower"
                name="BB Lower"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
                activeDot={false}
              />
            </>
          )}

          {/* Main price area */}
          <Area
            yAxisId="price"
            dataKey="close"
            name="Price"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />

          {/* Overlays */}
          {show.sma20 && (
            <Line yAxisId="price" dataKey="sma20"  name="SMA 20"  stroke="#3b82f6" strokeWidth={1.5} dot={false} />
          )}
          {show.sma50 && (
            <Line yAxisId="price" dataKey="sma50"  name="SMA 50"  stroke="#f59e0b" strokeWidth={1.5} dot={false} />
          )}
          {show.ema9 && (
            <Line yAxisId="price" dataKey="ema9"   name="EMA 9"   stroke="#a78bfa" strokeWidth={1.5} dot={false} />
          )}
          {show.ema21 && (
            <Line yAxisId="price" dataKey="ema21"  name="EMA 21"  stroke="#06b6d4" strokeWidth={1.5} dot={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}