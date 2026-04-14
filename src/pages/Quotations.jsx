import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createQuotation,
  deleteQuotation,
  subscribeQuotations,
  updateQuotationStatus,
} from "../api/quotations.js";
import { subscribeInventory } from "../api/inventory.js";
import QuotationForm from "../components/quotation/QuotationForm.jsx";
import Modal from "../components/common/Modal.jsx";
import { openQuotationReceiptWindow } from "../utils/quotationReceipt.js";
import Button from "../components/common/Button.jsx";
import InitialLoadPlaceholder from "../components/common/InitialLoadPlaceholder.jsx";
import { formatCurrency, formatDateTime, toJsDate } from "../utils/dateUtils.js";

export default function Quotations() {
  const [inventory, setInventory] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [printLoadingId, setPrintLoadingId] = useState("");
  const [showNewQuotation, setShowNewQuotation] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState("");
  const [quotationsReady, setQuotationsReady] = useState(false);

  useEffect(() => {
    const unsubInv = subscribeInventory(setInventory, (e) =>
      setError((prev) => prev || e?.message || "Could not load inventory."),
    );
    const unsubQ = subscribeQuotations(
      (list) => {
        setError("");
        setRows(list);
        setQuotationsReady(true);
      },
      (e) => {
        setError(e?.message || "Could not load quotations.");
        setQuotationsReady(true);
      },
    );
    return () => {
      unsubInv();
      unsubQ();
    };
  }, []);

  const normalizeStatus = (status) => {
    if (status === "declined") return "cancelled";
    return status || "pending";
  };

  const statusSelectClass = (status) => {
    if (status === "converted") {
      return "border-green-200 bg-green-50 text-green-700";
    }
    if (status === "cancelled" || status === "declined") {
      return "border-red-200 bg-red-50 text-red-700";
    }
    return "border-amber-300 bg-amber-50 text-amber-800";
  };

  const handleStatusChange = async (quotationId, nextStatus) => {
    const prevRows = rows;
    setRows((curr) => curr.map((q) => (q.id === quotationId ? { ...q, status: nextStatus } : q)));
    setSavingStatusId(quotationId);
    setError("");
    try {
      await updateQuotationStatus(quotationId, nextStatus);
    } catch (e) {
      setRows(prevRows);
      setError(e?.message || "Could not update status.");
    } finally {
      setSavingStatusId("");
    }
  };

  const handlePrintQuotation = (q) => {
    setPrintLoadingId(q.id);
    window.setTimeout(() => {
      const ok = openQuotationReceiptWindow(q);
      if (!ok) {
        setError((prev) => prev || "Print blocked: allow pop-ups for this site, then try again.");
      }
      setPrintLoadingId("");
    }, 450);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link to="/" className="inline-block text-sm text-gray-600 hover:text-gray-900">
        ← Back to dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Quotations</h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">Create customer quotes; print or track status.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex items-center justify-end">
        <Button type="button" onClick={() => setShowNewQuotation(true)}>
          + New quotation
        </Button>
      </div>

      <div className="card">
        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">Saved quotations</h3>
        {!quotationsReady ? (
          <InitialLoadPlaceholder label="Loading quotations…" />
        ) : !rows.length ? (
          <div className="py-6 text-center text-sm text-gray-500">No quotations yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header text-left">When</th>
                  <th className="table-header text-left">Customer</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="table-cell">{formatDateTime(toJsDate(q.createdAt))}</td>
                    <td className="table-cell">{q.customerName}</td>
                    <td className="table-cell text-right font-medium">{formatCurrency(q.total)}</td>
                    <td className="table-cell">
                      <select
                        className={`w-[130px] rounded-full border px-3 py-1.5 text-sm font-semibold outline-none transition ${statusSelectClass(
                          q.status,
                        )}`}
                        value={normalizeStatus(q.status)}
                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                        disabled={savingStatusId === q.id}
                      >
                        <option value="pending">pending</option>
                        <option value="converted">converted</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="table-cell text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        className="mr-1 inline-flex"
                        disabled={!!printLoadingId}
                        onClick={() => handlePrintQuotation(q)}
                      >
                        {printLoadingId === q.id ? "Opening…" : "Print"}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="inline-flex"
                        onClick={async () => {
                          if (!window.confirm("Delete this quotation?")) return;
                          try {
                            await deleteQuotation(q.id);
                          } catch (e) {
                            setError(e?.message || "Delete failed.");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {printLoadingId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl bg-white px-8 py-6 shadow-lg">
            <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            <p className="text-center text-sm font-medium text-gray-800">Preparing quotation…</p>
          </div>
        </div>
      ) : null}

      {showNewQuotation ? (
        <Modal title="New quotation" onClose={() => setShowNewQuotation(false)} wide>
          <QuotationForm
            inventory={inventory}
            onSubmit={async (payload) => {
              await createQuotation(payload);
              setShowNewQuotation(false);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
