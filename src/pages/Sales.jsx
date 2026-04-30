import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createSale } from "../api/sales.js";
import { updateQuotationStatus } from "../api/quotations.js";
import { subscribeInventory } from "../api/inventory.js";
import SaleForm from "../components/sales/SaleForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { openSalesReceiptWindow } from "../utils/salesReceipt.js";

function newLineKey() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Sales() {
  const location = useLocation();
  const prefill = location.state?.quotation;

  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [customerName, setCustomerName] = useState(prefill?.customerName || "");
  const [mobile, setMobile] = useState(prefill?.mobile || "");
  const [address, setAddress] = useState(prefill?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [taxRate, setTaxRate] = useState("");
  const [needShipping, setNeedShipping] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(0);

  const initialLines = prefill?.items?.length
    ? prefill.items.map((item) => ({
        key: newLineKey(),
        id: item.id || "",
        name: item.name || "",
        price: item.price || 0,
        qty: item.qty || "",
        unit: item.unit || "units",
      }))
    : [{ key: newLineKey(), id: "", name: "", price: 0, qty: "", unit: "units" }];

  const [lines, setLines] = useState(initialLines);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [invError, setInvError] = useState("");

  useEffect(() => {
    const unsub = subscribeInventory(
      (rows) => {
        setInvError("");
        setInventory(rows);
      },
      (e) => setInvError(e?.message || "Could not load inventory."),
    );
    return () => unsub();
  }, []);

  const subtotal = useMemo(
    () =>
      lines.reduce((acc, l) => {
        if (!l.id) return acc;
        return acc + Number(l.qty || 0) * Number(l.price || 0);
      }, 0),
    [lines],
  );
  const taxAmount = useMemo(() => subtotal * (Math.max(0, Number(taxRate) || 0) / 100), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount + (needShipping ? Number(shippingCharge) || 0 : 0), [subtotal, taxAmount, needShipping, shippingCharge]);

  const soldByLabel = user?.email || user?.uid || "";

  const submit = async () => {
    setError("");
    setReceiptError("");
    setSuccessMessage("");
    const cleaned = lines
      .filter((l) => l.id)
      .map((l) => ({
        id: l.id,
        name: l.name,
        qty: Number(l.qty),
        price: Number(l.price),
        unit: l.unit || "units",
      }));
    if (!customerName.trim() || !mobile.trim() || !address.trim()) {
      setError("Please fill customer name, mobile, and address.");
      return;
    }
    if (!cleaned.length) {
      setError("Add at least one inventory line.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    try {
      setSubmitting(true);
      const salePayload = {
        customerName: customerName.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        paymentMethod,
        taxRate: Math.max(0, Number(taxRate) || 0),
        subtotal,
        taxAmount,
        needShipping,
        shippingCharge: needShipping ? Math.max(0, Number(shippingCharge) || 0) : 0,
        items: cleaned,
        total,
      };
      const id = await createSale(salePayload);
      if (prefill?.id) {
         try {
           await updateQuotationStatus(prefill.id, "converted");
         } catch (e) {
           console.error("Failed to update quotation status", e);
         }
      }
      const completedSale = { id, ...salePayload };
      const opened = openSalesReceiptWindow(completedSale, { soldBy: soldByLabel });
      if (!opened) {
        setReceiptError("Sale saved. Allow pop-ups to print the receipt, or use browser print from this page.");
      } else {
        setSuccessMessage("Sale completed and receipt opened for printing.");
      }
      setCustomerName("");
      setMobile("");
      setAddress("");
      setPaymentMethod("cash");
      setTaxRate("");
      setNeedShipping(false);
      setShippingCharge(0);
      setLines([{ key: newLineKey(), id: "", name: "", price: 0, qty: "", unit: "units" }]);
    } catch (e) {
      setError(e?.message || "Could not complete sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 sm:self-start">
          ← Back to dashboard
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">New sale</h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">Items pull from inventory; stock is reduced when you complete the sale.</p>
      </div>

      {invError ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{invError}</div> : null}
      {receiptError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{receiptError}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{successMessage}</div>
      ) : null}

      <div className="card">
        <SaleForm
          inventory={inventory}
          customerName={customerName}
          mobile={mobile}
          address={address}
          onCustomerChange={(patch) => {
            if ("customerName" in patch) setCustomerName(patch.customerName);
            if ("mobile" in patch) setMobile(patch.mobile);
            if ("address" in patch) setAddress(patch.address);
            if ("paymentMethod" in patch) setPaymentMethod(patch.paymentMethod);
            if ("taxRate" in patch) setTaxRate(patch.taxRate);
            if ("needShipping" in patch) setNeedShipping(patch.needShipping);
            if ("shippingCharge" in patch) setShippingCharge(patch.shippingCharge);
          }}
          paymentMethod={paymentMethod}
          taxRate={taxRate}
          needShipping={needShipping}
          shippingCharge={shippingCharge}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          lines={lines}
          onLinesChange={setLines}
          onAddLine={() => setLines((ls) => [...ls, { key: newLineKey(), id: "", name: "", price: 0, qty: "", unit: "units" }])}
          onRemoveLine={(idx) => setLines((ls) => ls.filter((_, i) => i !== idx))}
          onSubmit={submit}
          submitting={submitting}
          error={error}
        />
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-600">Final payable</span>
          <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
