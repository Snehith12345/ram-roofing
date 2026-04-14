import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ShoppingCart, Package, RefreshCw } from "lucide-react";
import { subscribeSales } from "../api/sales.js";
import SummaryCards from "../components/dashboard/SummaryCards.jsx";
import SalesChart from "../components/dashboard/SalesChart.jsx";
import { formatCurrency, formatDateTime, toJsDate } from "../utils/dateUtils.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsub = subscribeSales(
      (rows) => {
        setError("");
        setSales(rows);
      },
      (e) => setError(e?.message || "Could not load sales."),
    );
    return () => unsub();
  }, [refreshKey]);

  const recent = sales.slice(0, 8);

  const loadDashboardStats = async () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    await new Promise((r) => setTimeout(r, 400));
    setIsRefreshing(false);
  };

  const welcomeName = user?.email?.split("@")[0] || "there";

  const dashboardCards = [
    {
      title: "Quotations",
      description: "Create new quotations and view quotation history",
      icon: FileText,
      color: "bg-blue-500",
      href: "/quotations",
    },
    {
      title: "New sale",
      description: "Process new sales and print receipts",
      icon: ShoppingCart,
      color: "bg-green-500",
      href: "/sales",
    },
    {
      title: "Inventory",
      description: "Manage inventory and stock levels",
      icon: Package,
      color: "bg-orange-500",
      href: "/inventory",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Welcome back, {welcomeName}!</p>
        </div>
        <button
          type="button"
          onClick={loadDashboardStats}
          disabled={isRefreshing}
          className="btn-secondary flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => navigate(card.href)}
              className="card group cursor-pointer text-left transition-shadow duration-200 hover:shadow-lg active:scale-[0.99] touch-manipulation"
            >
              <div className="flex items-center">
                <div className={`${card.color} flex-shrink-0 rounded-lg p-3`}>
                  <IconComponent className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                  <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-primary-600 sm:text-lg">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 sm:mt-1 sm:text-sm">{card.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <SummaryCards sales={sales} />
      <SalesChart sales={sales} />

      <div className="card">
        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">Recent sales</h3>
        {!recent.length ? (
          <div className="py-6 text-center text-sm text-gray-500">No sales recorded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header text-left">When</th>
                  <th className="table-header text-left">Customer</th>
                  <th className="table-header text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recent.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-cell">{formatDateTime(toJsDate(s.createdAt))}</td>
                    <td className="table-cell">{s.customerName}</td>
                    <td className="table-cell text-right font-medium">{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
