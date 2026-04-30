import { useMemo, useState } from "react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import { UNIT_OPTIONS, normalizeUnit } from "../../constants/units.js";

function newLineKey() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function QuotationForm({ inventory, onSubmit }) {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [lines, setLines] = useState([
    { key: newLineKey(), id: "", name: "", price: 0, qty: "", isCustom: false, unit: "units" },
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => lines.reduce((acc, l) => acc + Number(l.qty || 0) * Number(l.price || 0), 0),
    [lines],
  );

  const submit = async () => {
    setError("");
    const cleaned = lines
      .filter((l) => l.name?.trim())
      .map((l) => ({
        id: l.id || null,
        name: l.name.trim(),
        qty: Number(l.qty),
        price: Number(l.price),
        unit: normalizeUnit(l.unit),
      }));
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!cleaned.length) {
      setError("Add at least one line item.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        customerName: customerName.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        items: cleaned,
        total,
        status: "pending",
      });
      setCustomerName("");
      setMobile("");
      setAddress("");
      setLines([{ key: newLineKey(), id: "", name: "", price: 0, qty: "", isCustom: false, unit: "units" }]);
    } catch (e) {
      setError(e?.message || "Could not save quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Input label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <Input label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
      </div>
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Items</h3>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setLines((ls) => [...ls, { key: newLineKey(), id: "", name: "", price: 0, qty: "", isCustom: false, unit: "units" }])
          }
        >
          + Add line
        </Button>
      </div>

      {lines.map((line, idx) => (
        <div key={line.key} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_0.9fr_1fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">From inventory</span>
              <select
                className="select-field"
                value={line.isCustom ? "__custom__" : line.id}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__custom__") {
                    const copy = [...lines];
                    copy[idx] = { ...copy[idx], isCustom: true, id: "", name: "", price: 0, unit: "units" };
                    setLines(copy);
                    return;
                  }
                  const inv = inventory.find((x) => x.id === v);
                  const copy = [...lines];
                  copy[idx] = {
                    ...copy[idx],
                    isCustom: false,
                    id: v,
                    name: inv?.name ?? "",
                    price: inv ? Number(inv.price) : 0,
                    unit: normalizeUnit(inv?.unit),
                  };
                  setLines(copy);
                }}
              >
                <option value="">Select…</option>
                {inventory.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
                <option value="__custom__">Custom item…</option>
              </select>
            </label>

            {line.isCustom ? (
              <Input
                label="Custom item name"
                value={line.name}
                onChange={(e) => {
                  const copy = [...lines];
                  copy[idx] = { ...copy[idx], name: e.target.value };
                  setLines(copy);
                }}
              />
            ) : (
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-700">Item</span>
                <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900">
                  {line.name || "—"}
                </div>
              </div>
            )}

            <Input
              label={`Qty (${normalizeUnit(line.unit)})`}
              type="number"
              value={line.qty === "" ? "" : String(line.qty)}
              onChange={(e) => {
                const copy = [...lines];
                copy[idx] = { ...copy[idx], qty: e.target.value === "" ? "" : Number(e.target.value) };
                setLines(copy);
              }}
            />
            <Input
              label="Unit price"
              type="number"
              min="0"
              step="0.01"
              value={String(line.price)}
              onChange={(e) => {
                const copy = [...lines];
                copy[idx] = { ...copy[idx], price: Number(e.target.value || 0) };
                setLines(copy);
              }}
            />
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Line total</span>
              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900">
                ₹{(Number(line.qty) * Number(line.price || 0)).toFixed(2)}
              </div>
            </div>
            <div className="flex justify-end lg:pb-0.5">
              <Button
                type="button"
                variant="danger"
                onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                disabled={lines.length === 1}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-sm text-gray-600">Quotation total</div>
        <div className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={submitting}>
          {submitting ? "Saving…" : "Save quotation"}
        </Button>
      </div>
    </div>
  );
}
