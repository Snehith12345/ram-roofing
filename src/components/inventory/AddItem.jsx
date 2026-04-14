import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";

export default function AddItem({ initial, onSubmit, submitting, onCancel }) {
  const isEdit = Boolean(initial?.id);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSubmit({
          name: fd.get("name"),
          price: fd.get("price"),
          quantity: fd.get("quantity"),
        });
      }}
    >
      <Input label="Item name" name="name" defaultValue={initial?.name ?? ""} required />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Input
          label="Unit price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={initial?.price ?? ""}
          required
        />
        <Input
          label="Quantity on hand"
          name="quantity"
          type="number"
          min="0"
          step="1"
          defaultValue={initial?.quantity ?? ""}
          required
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
