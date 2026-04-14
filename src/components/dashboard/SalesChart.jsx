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
import { toJsDate } from "../../utils/dateUtils.js";

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

function keyForDate(date, bucket) {
  if (bucket === "day") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  if (bucket === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}`;
}

function buildTimeBuckets(bucket) {
  const now = new Date();
  const rows = [];
  if (bucket === "day") {
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      rows.push({ key: keyForDate(d, "day"), label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, total: 0 });
    }
    return rows;
  }
  if (bucket === "month") {
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      rows.push({ key: keyForDate(d, "month"), label: `${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(-2)}`, total: 0 });
    }
    return rows;
  }
  for (let i = 4; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear() - i, 0, 1);
    rows.push({ key: keyForDate(d, "year"), label: String(d.getFullYear()), total: 0 });
  }
  return rows;
}

export default function SalesChart({ sales }) {
  const [bucket, setBucket] = useState("month");

  const data = useMemo(() => {
    const rows = buildTimeBuckets(bucket);
    const rowByKey = new Map(rows.map((r) => [r.key, r]));
    for (const sale of sales) {
      // Fallback to `sale.date` for older rows where `createdAt` may be missing.
      const d = toJsDate(sale.createdAt) || toJsDate(sale.date);
      if (!d) continue;
      const key = keyForDate(d, bucket);
      const row = rowByKey.get(key);
      if (!row) continue;
      const n = Number(sale.total ?? 0);
      if (!Number.isNaN(n)) row.total += n;
    }
    return rows.map(({ key, ...rest }) => rest);
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
