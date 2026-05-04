import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import SaleItemList from "./SaleItemList.jsx";

export default function SaleForm({
  inventory,
  customerName,
  mobile,
  address,
  paymentMethod,
  taxRate,
  needShipping,
  shippingCharge,
  subtotal,
  taxAmount,
  total,
  onCustomerChange,
  lines,
  onLinesChange,
  onAddLine,
  onRemoveLine,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <form
      className="space-y-4 sm:space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">Customer information</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Input
            label="Customer name"
            name="customerName"
            value={customerName}
            onChange={(e) => onCustomerChange({ customerName: e.target.value })}
            required
            autoComplete="name"
          />
          <Input
            label="Mobile"
            name="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => onCustomerChange({ mobile: e.target.value })}
            required
            autoComplete="tel"
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 sm:mt-4">
          <div className="flex flex-col gap-2">
            <Input
              label="Address"
              name="address"
              value={address}
              onChange={(e) => onCustomerChange({ address: e.target.value })}
              required
              autoComplete="street-address"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={needShipping}
                onChange={(e) => onCustomerChange({ needShipping: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              Need shipping
            </label>
            {needShipping && (
              <Input
                label="Shipping charges"
                type="number"
                value={String(shippingCharge)}
                onChange={(e) => onCustomerChange({ shippingCharge: Number(e.target.value || 0) })}
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Payment method</label>
            <select
              className="select-field"
              value={paymentMethod}
              onChange={(e) => onCustomerChange({ paymentMethod: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Items</h2>
      </div>

      <SaleItemList
        inventory={inventory}
        lines={lines}
        onChange={(idx, next) => {
          const copy = [...lines];
          copy[idx] = { ...copy[idx], ...next };
          onLinesChange(copy);
        }}
        onRemove={onRemoveLine}
      />

      <div className="flex justify-start">
        <Button type="button" variant="secondary" onClick={onAddLine}>
          + Add line
        </Button>
      </div>

      <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${needShipping ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
        <Input
          label="Tax (%)"
          type="number"
          value={taxRate === "" ? "" : String(taxRate)}
          onChange={(e) => onCustomerChange({ taxRate: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)) })}
        />
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Subtotal</span>
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900">₹{subtotal.toFixed(2)}</div>
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Tax amount</span>
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900">₹{taxAmount.toFixed(2)}</div>
        </div>
        {needShipping && (
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Shipping</span>
            <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900">₹{Number(shippingCharge || 0).toFixed(2)}</div>
          </div>
        )}
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Grand total</span>
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900 font-semibold">₹{total.toFixed(2)}</div>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="flex min-h-[44px] items-center justify-center gap-2 px-6 py-3 sm:py-2">
          {submitting ? "Saving…" : "Complete sale & print"}
        </Button>
      </div>
    </form>
  );
}
