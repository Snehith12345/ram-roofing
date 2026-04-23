import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteSale, subscribeSales } from "../api/sales.js";
import { formatCurrency, formatDateTime, toJsDate } from "../utils/dateUtils.js";
import Button from "../components/common/Button.jsx";
import { openSalesReceiptWindow } from "../utils/salesReceipt.js";
import { useAuth } from "../context/AuthContext.jsx";

const PAYMENT_METHODS = ["cash", "card", "cheque", "upi"];

function SalesDashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card animate-pulse space-y-2">
            <div className="h-3 w-28 rounded bg-gray-200" />
            <div className="h-8 w-36 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="card animate-pulse">
        <div className="mb-4 h-5 w-48 rounded bg-gray-200" />
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-11 rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </>
  );
}

export default function SalesDashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return sales;
    const lower = searchQuery.toLowerCase();
    return sales.filter((s) => {
      const sId = String(s.id || "").toLowerCase();
      const cName = String(s.customerName || "").toLowerCase();
      const mobile = String(s.mobile || "").toLowerCase();
      const dateStr = formatDateTime(toJsDate(s.createdAt)).toLowerCase();
      return sId.includes(lower) || cName.includes(lower) || mobile.includes(lower) || dateStr.includes(lower);
    });
  }, [sales, searchQuery]);

  useEffect(() => {
    const unsub = subscribeSales(
      (rows) => {
        setError("");
        setSales(rows);
        setInitialLoad(false);
      },
      (e) => {
        setError(e?.message || "Could not load sales dashboard.");
        setInitialLoad(false);
      },
    );
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const base = {
      totalAmount: 0,
      taxTotal: 0,
      totalCount: sales.length,
      byMethod: {
        cash: 0,
        card: 0,
        cheque: 0,
        upi: 0,
      },
    };
    for (const sale of sales) {
      const total = Number(sale.total ?? 0);
      const taxAmount = Number(sale.taxAmount ?? 0);
      base.totalAmount += Number.isNaN(total) ? 0 : total;
      base.taxTotal += Number.isNaN(taxAmount) ? 0 : taxAmount;
      const method = String(sale.paymentMethod || "cash").toLowerCase();
      if (PAYMENT_METHODS.includes(method)) {
        base.byMethod[method] += Number.isNaN(total) ? 0 : total;
      } else {
        base.byMethod.cash += Number.isNaN(total) ? 0 : total;
      }
    }
    return base;
  }, [sales]);

  const handleReprint = (sale) => {
    const opened = openSalesReceiptWindow(sale, { soldBy: user?.email || user?.uid || "" });
    if (!opened) {
      setError("Could not open print window. Please allow pop-ups and try again.");
    }
  };

  const handleDelete = async (sale) => {
    if (!window.confirm(`Delete order ${sale.id}? This will remove sale, payment and tax totals.`)) return;
    setError("");
    setDeletingId(sale.id);
    try {
      await deleteSale(sale.id);
    } catch (e) {
      setError(e?.message || "Could not delete order.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link to="/" className="inline-block text-sm text-gray-600 hover:text-gray-900">
        ← Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sales dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">Full sales overview with payment-wise totals.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {initialLoad ? (
        <SalesDashboardSkeleton />
      ) : (
        <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="card">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Total sales amount</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
        </div>
        <div className="card">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Cash total</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats.byMethod.cash)}</div>
        </div>
        <div className="card">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Card total</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats.byMethod.card)}</div>
        </div>
        <div className="card">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Cheque total</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats.byMethod.cheque)}</div>
        </div>
        <div className="card">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">UPI total</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats.byMethod.upi)}</div>
        </div>
        <div className="card">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Tax collected</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(stats.taxTotal)}</div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">All sales ({stats.totalCount})</h3>
          <input
            type="search"
            placeholder="Search by ID, name, mobile, date..."
            className="w-full sm:max-w-md rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!filteredSales.length ? (
          <div className="py-6 text-center text-sm text-gray-500">No sales found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header text-left">Order ID</th>
                  <th className="table-header text-left">When</th>
                  <th className="table-header text-left">Customer</th>
                  <th className="table-header text-left">Mobile</th>
                  <th className="table-header text-left">Payment</th>
                  <th className="table-header text-right">Subtotal</th>
                  <th className="table-header text-right">Tax</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{s.id}</td>
                    <td className="table-cell">{formatDateTime(toJsDate(s.createdAt))}</td>
                    <td className="table-cell">{s.customerName}</td>
                    <td className="table-cell">{s.mobile || "—"}</td>
                    <td className="table-cell capitalize">{s.paymentMethod || "cash"}</td>
                    <td className="table-cell text-right">{formatCurrency(s.subtotal ?? s.total ?? 0)}</td>
                    <td className="table-cell text-right">{formatCurrency(s.taxAmount ?? 0)}</td>
                    <td className="table-cell text-right font-semibold">{formatCurrency(s.total)}</td>
                    <td className="table-cell text-right">
                      <Button type="button" variant="ghost" className="mr-1 inline-flex" onClick={() => handleReprint(s)}>
                        Reprint
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="inline-flex"
                        disabled={deletingId === s.id}
                        onClick={() => handleDelete(s)}
                      >
                        {deletingId === s.id ? "Deleting..." : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
