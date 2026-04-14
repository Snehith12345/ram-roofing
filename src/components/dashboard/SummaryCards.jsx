import { useMemo } from "react";
import { ShoppingCart, Calendar, CalendarDays } from "lucide-react";
import { formatCurrency } from "../../utils/dateUtils.js";

function inRange(date, start, end) {
  return date >= start && date <= end;
}

export default function SummaryCards({ sales }) {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let day = 0;
    let month = 0;
    let year = 0;

    for (const s of sales) {
      const raw = s.createdAt;
      const d =
        raw && typeof raw.toDate === "function"
          ? raw.toDate()
          : raw instanceof Date
            ? raw
            : new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      const t = Number(s.total ?? 0);
      if (Number.isNaN(t)) continue;
      if (inRange(d, startOfToday, now)) day += t;
      if (inRange(d, startOfMonth, now)) month += t;
      if (inRange(d, startOfYear, now)) year += t;
    }

    return { day, month, year };
  }, [sales]);

  const cards = [
    {
      title: "Today",
      value: stats.day,
      icon: ShoppingCart,
      iconWrap: "bg-green-100",
      iconClass: "text-green-600",
    },
    {
      title: "This month",
      value: stats.month,
      icon: Calendar,
      iconWrap: "bg-blue-100",
      iconClass: "text-blue-600",
    },
    {
      title: "This year",
      value: stats.year,
      icon: CalendarDays,
      iconWrap: "bg-purple-100",
      iconClass: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.title} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-lg p-2 ${c.iconWrap}`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${c.iconClass}`} />
              </div>
              <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                <p className="text-xs font-medium text-gray-600 sm:text-sm">{c.title}</p>
                <p className="truncate text-lg font-bold text-gray-900 sm:text-2xl">{formatCurrency(c.value)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
