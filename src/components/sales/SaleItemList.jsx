import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import { normalizeUnit } from "../../constants/units.js";

export default function SaleItemList({ inventory, lines, onChange, onRemove }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {lines.map((line, idx) => (
        <div key={line.key} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Item</span>
              <select
                className="select-field"
                value={line.id}
                onChange={(e) => {
                  const id = e.target.value;
                  const inv = inventory.find((x) => x.id === id);
                  onChange(idx, {
                    id,
                    name: inv?.name ?? "",
                    price: inv ? Number(inv.price) : 0,
                    qty: line.qty,
                    unit: normalizeUnit(inv?.unit),
                  });
                }}
              >
                <option value="">Select…</option>
                {inventory.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} (stock {Number(it.quantity ?? 0)} {normalizeUnit(it.unit)})
                  </option>
                ))}
              </select>
            </label>
            <Input
              label={`Qty (${normalizeUnit(line.unit)})`}
              type="number"
              min="1"
              value={String(line.qty)}
              onChange={(e) =>
                onChange(idx, {
                  ...line,
                  qty: Math.max(1, Number(e.target.value || 1)),
                })
              }
            />
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Unit price</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={String(line.price ?? 0)}
                onChange={(e) =>
                  onChange(idx, {
                    ...line,
                    price: Math.max(0, Number(e.target.value || 0)),
                  })
                }
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Line total</span>
              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-gray-900">
                ₹{(Number(line.qty) * Number(line.price || 0)).toFixed(2)}
              </div>
            </div>
            <div className="flex justify-end lg:pb-0.5">
              <Button type="button" variant="danger" onClick={() => onRemove(idx)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
