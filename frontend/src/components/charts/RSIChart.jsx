import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from "recharts";

function buildData(technicalData) {
  if (!technicalData) return [];
  const { dates, indicators } = technicalData;
  return dates.map((date, i) => ({
    date: date.slice(5),
    rsi: indicators.rsi[i],
  }));
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]?.value) return null;
  const v = payload[0].value;
  const color = v >= 70 ? "#ef4444" : v <= 30 ? "#10b981" : "#3b82f6";
  return (
    <div className="bg-fin-card border border-fin-border rounded-lg p-2.5 text-xs shadow-xl">
      <span className="text-fin-text-secondary">RSI </span>
      <span className="font-num font-bold" style={{ color }}>
        {v?.toFixed(2)}
      </span>
    </div>
  );
};

export default function RSIChart({ technicalData, height = 120 }) {
  const data = useMemo(() => buildData(technicalData), [technicalData]);
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />

        {/* Overbought / oversold zones */}
        <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.06} />
        <ReferenceArea y1={0}  y2={30}  fill="#10b981" fillOpacity={0.06} />

        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 9 }}
          tickLine={false}
          axisLine={{ stroke: "#1f2937" }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 30, 50, 70, 100]}
          tick={{ fill: "#6b7280", fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Level lines */}
        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1} />
        <ReferenceLine y={50} stroke="#4b5563" strokeDasharray="4 3" strokeWidth={1} />
        <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 3" strokeWidth={1} />

        <Line
          dataKey="rsi"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: "#3b82f6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}