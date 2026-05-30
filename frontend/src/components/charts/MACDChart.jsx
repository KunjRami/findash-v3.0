import { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell, ResponsiveContainer,
} from "recharts";

function buildData(technicalData) {
  if (!technicalData) return [];
  const { dates, indicators } = technicalData;
  return dates.map((date, i) => ({
    date:      date.slice(5),
    macd:      indicators.macd[i],
    signal:    indicators.macd_signal[i],
    histogram: indicators.macd_histogram[i],
  }));
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-fin-card border border-fin-border rounded-lg p-2.5 text-xs shadow-xl space-y-1">
      {payload.map((p) =>
        p.value != null ? (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-num font-bold text-fin-text-primary">
              {Number(p.value).toFixed(3)}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
};

export default function MACDChart({ technicalData, height = 120 }) {
  const data = useMemo(() => buildData(technicalData), [technicalData]);
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 9 }}
          tickLine={false}
          axisLine={{ stroke: "#1f2937" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          width={42}
          tickFormatter={(v) => v.toFixed(1)}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />

        {/* Histogram bars */}
        <Bar dataKey="histogram" name="Histogram" radius={[1, 1, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={(d.histogram ?? 0) >= 0 ? "#10b981" : "#ef4444"}
              fillOpacity={0.7}
            />
          ))}
        </Bar>

        {/* MACD line */}
        <Line
          dataKey="macd"
          name="MACD"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />

        {/* Signal line */}
        <Line
          dataKey="signal"
          name="Signal"
          stroke="#f59e0b"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}