import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addInventoryItem,
  deleteInventoryItem,
  subscribeInventory,
  updateInventoryItem,
} from "../api/inventory.js";
import InventoryList from "../components/inventory/InventoryList.jsx";
import AddItem from "../components/inventory/AddItem.jsx";
import Modal from "../components/common/Modal.jsx";
import Button from "../components/common/Button.jsx";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeInventory(
      (rows) => {
        setError("");
        setItems(rows);
      },
      (e) => setError(e?.message || "Could not load inventory."),
    );
    return () => unsub();
  }, []);

  const saveItem = async (data) => {
    setSaving(true);
    try {
      if (modal?.mode === "edit" && modal.item?.id) {
        await updateInventoryItem(modal.item.id, data);
      } else {
        await addInventoryItem(data);
      }
      setModal(null);
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (it) => {
    if (!window.confirm(`Delete ${it.name}?`)) return;
    try {
      await deleteInventoryItem(it.id);
    } catch (e) {
      setError(e?.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link to="/" className="inline-block text-sm text-gray-600 hover:text-gray-900">
        ← Back to dashboard
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">Manage item prices and quantities.</p>
        </div>
        <Button type="button" onClick={() => setModal({ mode: "add" })}>
          + Add item
        </Button>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="card">
        <InventoryList items={items} onEdit={(it) => setModal({ mode: "edit", item: it })} onDelete={removeItem} />
      </div>

      {modal?.mode === "add" ? (
        <Modal title="Add inventory item" onClose={() => setModal(null)}>
          <AddItem onSubmit={saveItem} submitting={saving} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}

      {modal?.mode === "edit" ? (
        <Modal title="Edit item" onClose={() => setModal(null)}>
          <AddItem initial={modal.item} onSubmit={saveItem} submitting={saving} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}
    </div>
  );
}
