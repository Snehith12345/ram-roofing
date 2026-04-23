/** @param {unknown} s */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a printable sales receipt (same layout sample as Enterprise app).
 * @param {object} sale
 * @param {string} sale.id
 * @param {string} sale.customerName
 * @param {string} [sale.mobile]
 * @param {string} [sale.address]
 * @param {Array<{ name: string, qty: number, price: number, unit?: string }>} sale.items
 * @param {number} sale.total
 * @param {number} [sale.subtotal]
 * @param {number} [sale.taxAmount]
 * @param {number} [sale.taxRate]
 * @param {string} [sale.paymentMethod]
 * @param {{ soldBy?: string }} [opts]
 * @returns {boolean} false if popup blocked
 */
export function openSalesReceiptWindow(sale, opts = {}) {
  const receiptWindow = window.open("", "_blank", "width=800,height=600");
  if (!receiptWindow) return false;

  const soldBy = opts.soldBy?.trim() || "—";
  const items = Array.isArray(sale.items) ? sale.items : [];
  const rows = items
    .map(
      (it) => `
      <tr>
        <td>${escapeHtml(it.name)}</td>
        <td>${escapeHtml(String(it.qty ?? ""))} ${escapeHtml(it.unit || "units")}</td>
        <td>₹${Number(it.price || 0).toFixed(2)}</td>
        <td>₹${(Number(it.qty || 0) * Number(it.price || 0)).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${escapeHtml(sale.id)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .document-type { font-size: 14px; letter-spacing: 0.08em; }
          .sale-info { margin-bottom: 16px; }
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
          <div class="company-name">RAM ROOFING INDUSTRIES</div>
          <div class="document-type">SALES RECEIPT</div>
        </div>

        <div class="sale-info">
          <strong>Sale ID:</strong> ${escapeHtml(sale.id)}<br>
          <strong>Date:</strong> ${escapeHtml(new Date().toLocaleDateString())}<br>
          <strong>Time:</strong> ${escapeHtml(new Date().toLocaleTimeString())}
        </div>

        <div class="customer-info">
          <strong>Bill To:</strong><br>
          <strong>Customer:</strong> ${escapeHtml(sale.customerName)}<br>
          ${sale.mobile ? `<strong>Phone:</strong> ${escapeHtml(sale.mobile)}<br>` : ""}
          ${sale.address ? `<strong>Address:</strong><br>${escapeHtml(sale.address)}<br>` : ""}
          <strong>Payment:</strong> ${escapeHtml(String(sale.paymentMethod || "cash").toUpperCase())}<br>
          <strong>Sold by:</strong> ${escapeHtml(soldBy)}
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
          ${
            Number(sale.subtotal) > 0
              ? `<div class="total-line">Subtotal: ₹${Number(sale.subtotal || 0).toFixed(2)}</div>`
              : ""
          }
          ${
            Number(sale.taxAmount) > 0
              ? `<div class="total-line">Tax (${Number(sale.taxRate || 0).toFixed(2)}%): ₹${Number(sale.taxAmount || 0).toFixed(2)}</div>`
              : ""
          }
          ${
            sale.needShipping && Number(sale.shippingCharge) >= 0
              ? `<div class="total-line">Shipping: ₹${Number(sale.shippingCharge || 0).toFixed(2)}</div>`
              : ""
          }
          <div class="total-line grand-total">Total: ₹${Number(sale.total || 0).toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p> ${escapeHtml(new Date().toLocaleString())}</p>
        </div>
      </body>
      </html>
    `;

  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
  setTimeout(() => {
    receiptWindow.print();
  }, 500);
  return true;
}
