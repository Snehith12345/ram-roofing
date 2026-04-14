import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { aggregateSalesTotals } from "../../utils/dateUtils.js";

const buckets = [
  { id: "day", label: "Daily" },
  { id: "month", label: "Monthly" },
  { id: "year", label: "Yearly" },
];

function formatInrTooltip(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return `₹${n.toFixed(2)}`;
}

export default function SalesChart({ sales }) {
  const [bucket, setBucket] = useState("month");

  const data = useMemo(() => {
    const rows = aggregateSalesTotals(sales, bucket).slice(-24);
    return rows.map((r) => ({
      label: r.period,
      total: r.total,
    }));
  }, [sales, bucket]);

  return (
    <div className="card">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Sales trend</h3>
        <div className="flex flex-wrap gap-1 rounded-full border border-gray-200 bg-gray-100 p-1">
          {buckets.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                bucket === b.id
                  ? "border border-primary-500/40 bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-white/60"
              }`}
              onClick={() => setBucket(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "#334155" }}
              formatter={(v) => [formatInrTooltip(v), "Total"]}
            />
            <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
