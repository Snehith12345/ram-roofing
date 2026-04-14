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
import PrintQuotation from "../components/quotation/PrintQuotation.jsx";
import Modal from "../components/common/Modal.jsx";
import Button from "../components/common/Button.jsx";
import { formatCurrency, formatDateTime, toJsDate } from "../utils/dateUtils.js";

export default function Quotations() {
  const [inventory, setInventory] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [printRow, setPrintRow] = useState(null);

  useEffect(() => {
    const unsubInv = subscribeInventory(setInventory, (e) =>
      setError((prev) => prev || e?.message || "Could not load inventory."),
    );
    const unsubQ = subscribeQuotations(
      (list) => {
        setError("");
        setRows(list);
      },
      (e) => setError(e?.message || "Could not load quotations."),
    );
    return () => {
      unsubInv();
      unsubQ();
    };
  }, []);

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

      <div className="card">
        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">New quotation</h3>
        <QuotationForm inventory={inventory} onSubmit={(payload) => createQuotation(payload)} />
      </div>

      <div className="card">
        <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">Saved quotations</h3>
        {!rows.length ? (
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
                        className="select-field max-w-[160px] py-2 text-sm"
                        value={q.status || "pending"}
                        onChange={(e) => updateQuotationStatus(q.id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="converted">converted</option>
                        <option value="declined">declined</option>
                      </select>
                    </td>
                    <td className="table-cell text-right">
                      <Button type="button" variant="ghost" className="mr-1 inline-flex" onClick={() => setPrintRow(q)}>
                        Print
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

      {printRow ? (
        <Modal title="Quotation" onClose={() => setPrintRow(null)} wide>
          <PrintQuotation quotation={printRow} />
        </Modal>
      ) : null}
    </div>
  );
}
