import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { pollCollection } from "./pollFirestore.js";
import { normalizeUnit } from "../constants/units.js";

const inventoryCol = collection(db, "inventory");

function sortByName(rows) {
  return [...rows].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, { sensitivity: "base" }),
  );
}

export const subscribeInventory = (onData, onError) =>
  pollCollection(
    inventoryCol,
    (rows) => onData(sortByName(rows)),
    onError,
  );

export const addInventoryItem = async ({ name, price, quantity, unit }) => {
  await addDoc(inventoryCol, {
    name: String(name).trim(),
    price: Number(price),
    quantity: Number(quantity),
    unit: normalizeUnit(unit),
    createdAt: serverTimestamp(),
  });
};

export const updateInventoryItem = async (id, { name, price, quantity, unit }) => {
  const ref = doc(db, "inventory", id);
  await updateDoc(ref, {
    name: String(name).trim(),
    price: Number(price),
    quantity: Number(quantity),
    unit: normalizeUnit(unit),
  });
};

export const deleteInventoryItem = async (id) => {
  await deleteDoc(doc(db, "inventory", id));
};
