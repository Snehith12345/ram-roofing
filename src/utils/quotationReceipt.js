import { toJsDate } from "./dateUtils.js";
import { normalizeUnit } from "../constants/units.js";

/** @param {unknown} s */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a printable quotation using the same layout as the sales receipt window.
 * @param {object} quotation
 * @param {string} quotation.id
 * @param {string} quotation.customerName
 * @param {string} [quotation.mobile]
 * @param {string} [quotation.address]
 * @param {Array<{ name: string, qty: number, price: number, unit?: string }>} quotation.items
 * @param {number} quotation.total
 * @param {string} [quotation.status]
 * @returns {boolean} false if popup blocked
 */
export function generateQuotationReceiptHTML(quotation) {
  const created = toJsDate(quotation.createdAt) ?? new Date();
  const dateStr = created.toLocaleDateString();
  const timeStr = created.toLocaleTimeString();
  const status = String(quotation.status || "pending");

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const rows = items
    .map(
      (it) => `
      <tr>
        <td>${escapeHtml(it.name)}</td>
        <td>${escapeHtml(String(it.qty ?? ""))} ${escapeHtml(normalizeUnit(it.unit))}</td>
        <td>₹${Number(it.price || 0).toFixed(2)}</td>
        <td>₹${(Number(it.qty || 0) * Number(it.price || 0)).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${escapeHtml(quotation.id)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .document-type { font-size: 14px; letter-spacing: 0.08em; }
          .quote-info { margin-bottom: 16px; }
          .customer-info { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
          .items-table th { background-color: #f0f0f0; }
          .totals { text-align: right; margin-top: 20px; }
          .total-line { margin: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/logo.jpg" alt="RAM ROOFING" style="max-height: 100px; margin-bottom: 10px;" onerror="this.style.display='none'" />
          <div class="company-name">RAM ROOFING INDUSTRIES</div>
          <div class="document-type">QUOTATION</div>
        </div>

        <div class="quote-info">
          <strong>Quotation ID:</strong> ${escapeHtml(quotation.id)}<br>
          <strong>Date:</strong> ${escapeHtml(dateStr)}<br>
          <strong>Time:</strong> ${escapeHtml(timeStr)}<br>
          <strong>Status:</strong> ${escapeHtml(status)}
        </div>

        <div class="customer-info">
          <strong>Bill To:</strong><br>
          <strong>Customer:</strong> ${escapeHtml(quotation.customerName)}<br>
          ${quotation.mobile ? `<strong>Phone:</strong> ${escapeHtml(quotation.mobile)}<br>` : ""}
          ${quotation.address ? `<strong>Address:</strong><br>${escapeHtml(quotation.address)}<br>` : ""}
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-line grand-total">Total: ₹${Number(quotation.total || 0).toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>This quotation is valid subject to stock availability and RAM Roofing terms.</p>
          <p>Thank you for your interest!</p>
          <p>${escapeHtml(new Date().toLocaleString())}</p>
        </div>
      </body>
      </html>
    `;

  return receiptHTML;
}

export function openQuotationReceiptWindow(quotation) {
  const receiptWindow = window.open("", "_blank", "width=800,height=600");
  if (!receiptWindow) return false;

  const receiptHTML = generateQuotationReceiptHTML(quotation);
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
  setTimeout(() => {
    receiptWindow.print();
  }, 500);
  return true;
}
