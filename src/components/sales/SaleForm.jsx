import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import SaleItemList from "./SaleItemList.jsx";

export default function SaleForm({
  inventory,
  customerName,
  mobile,
  address,
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
        <div className="mt-3 sm:mt-4">
          <Input
            label="Address"
            name="address"
            value={address}
            onChange={(e) => onCustomerChange({ address: e.target.value })}
            required
            autoComplete="street-address"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Items</h2>
        <Button type="button" variant="secondary" onClick={onAddLine}>
          + Add line
        </Button>
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

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="flex min-h-[44px] items-center justify-center gap-2 px-6 py-3 sm:py-2">
          {submitting ? "Saving…" : "Complete sale & print"}
        </Button>
      </div>
    </form>
  );
}
