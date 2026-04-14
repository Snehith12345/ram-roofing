import { formatCurrency, formatDateTime, toJsDate } from "../../utils/dateUtils.js";
import Button from "../common/Button.jsx";
import { printCurrentView } from "../../utils/printUtils.js";

export default function PrintQuotation({ quotation }) {
  if (!quotation) return null;
  const when = formatDateTime(toJsDate(quotation.createdAt) ?? new Date());
  const items = Array.isArray(quotation.items) ? quotation.items : [];

  return (
    <div className="print-root">
      <div className="print-doc">
        <div className="print-doc__header">
          <div>
            <div className="print-doc__brand">RAM Roofing</div>
            <div className="print-doc__muted">Quotation</div>
          </div>
          <div className="print-doc__meta">
            <div>
              <span className="print-doc__muted">Quote #</span> {quotation.id}
            </div>
            <div>
              <span className="print-doc__muted">Date</span> {when}
            </div>
            <div>
              <span className="print-doc__muted">Status</span> {quotation.status || "pending"}
            </div>
          </div>
        </div>

        <div className="print-doc__block">
          <div className="print-doc__h">Customer</div>
          <div>{quotation.customerName}</div>
          {quotation.mobile ? <div>{quotation.mobile}</div> : null}
          {quotation.address ? <div className="print-doc__addr">{quotation.address}</div> : null}
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="num">Qty</th>
              <th className="num">Price</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={`${it.id}-${i}`}>
                <td>{it.name}</td>
                <td className="num">{it.qty}</td>
                <td className="num">{formatCurrency(it.price)}</td>
                <td className="num">{formatCurrency(Number(it.qty) * Number(it.price))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-doc__total">
          <div className="print-doc__muted">Total</div>
          <div className="print-doc__total-amt">{formatCurrency(quotation.total)}</div>
        </div>

        <div className="print-doc__note">
          This quotation is valid subject to stock availability and RAM Roofing terms.
        </div>
      </div>

      <div className="mt-3 flex justify-end print:hidden">
        <Button type="button" onClick={printCurrentView}>
          Print quotation
        </Button>
      </div>
    </div>
  );
}
