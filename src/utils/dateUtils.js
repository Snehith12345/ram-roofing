/** @param {import('firebase/firestore').Timestamp | Date | string | number | null | undefined} value */
export function toJsDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(d) {
  const date = d instanceof Date ? d : toJsDate(d);
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(x);
}

/**
 * @param {Array<{ total?: number, createdAt?: unknown }>} sales
 * @param {'day' | 'month' | 'year'} bucket
 */
export function aggregateSalesTotals(sales, bucket) {
  const map = new Map();
  for (const s of sales) {
    const d = toJsDate(s.createdAt);
    if (!d) continue;
    let key;
    if (bucket === "day") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else if (bucket === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else {
      key = `${d.getFullYear()}`;
    }
    const t = Number(s.total ?? 0);
    map.set(key, (map.get(key) ?? 0) + (Number.isNaN(t) ? 0 : t));
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([period, total]) => ({ period, total }));
}

export function sumSalesTotal(sales) {
  return sales.reduce((acc, s) => {
    const t = Number(s.total ?? 0);
    return acc + (Number.isNaN(t) ? 0 : t);
  }, 0);
}
