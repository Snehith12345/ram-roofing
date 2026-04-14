import Button from "../common/Button.jsx";
import { formatCurrency } from "../../utils/dateUtils.js";

export default function InventoryList({ items, onEdit, onDelete }) {
  if (!items.length) {
    return <div className="py-8 text-center text-sm text-gray-500">No inventory items yet. Add your first item.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header text-left">Name</th>
            <th className="table-header text-right">Price</th>
            <th className="table-header text-right">Qty</th>
            <th className="table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((it) => (
            <tr key={it.id} className="hover:bg-gray-50">
              <td className="table-cell font-medium">{it.name}</td>
              <td className="table-cell text-right">{formatCurrency(it.price)}</td>
              <td className="table-cell text-right">{Number(it.quantity ?? 0)}</td>
              <td className="table-cell text-right">
                <Button type="button" variant="ghost" className="mr-1 inline-flex" onClick={() => onEdit(it)}>
                  Edit
                </Button>
                <Button type="button" variant="danger" className="inline-flex" onClick={() => onDelete(it)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
