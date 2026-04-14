import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { pollCollection } from "./pollFirestore.js";

const salesCol = collection(db, "sales");

function createdMs(data) {
  const c = data?.createdAt;
  if (c && typeof c.toMillis === "function") return c.toMillis();
  if (c && typeof c.seconds === "number") return c.seconds * 1000;
  return 0;
}

function sortByCreatedDesc(rows) {
  return [...rows].sort((a, b) => createdMs(b) - createdMs(a));
}

export const subscribeSales = (onData, onError) =>
  pollCollection(
    salesCol,
    (rows) => onData(sortByCreatedDesc(rows)),
    onError,
  );

/**
 * Creates a sale and decrements inventory in one batch after stock checks.
 * @param {object} saleData - customerName, mobile, address, items: [{id,name,qty,price}], total
 */
export const createSale = async (saleData) => {
  const { items, ...rest } = saleData;
  const batch = writeBatch(db);
  const saleRef = doc(salesCol);

  batch.set(saleRef, {
    ...rest,
    items,
    createdAt: serverTimestamp(),
  });

  for (const line of items) {
    const invRef = doc(db, "inventory", line.id);
    const invSnap = await getDoc(invRef);
    if (!invSnap.exists()) {
      throw new Error(`Inventory item not found: ${line.name || line.id}`);
    }
    const currentQty = Number(invSnap.data().quantity ?? 0);
    const sellQty = Number(line.qty);
    if (sellQty <= 0 || Number.isNaN(sellQty)) {
      throw new Error(`Invalid quantity for ${line.name}`);
    }
    if (currentQty < sellQty) {
      throw new Error(`Insufficient stock for ${line.name}`);
    }
    batch.update(invRef, { quantity: currentQty - sellQty });
  }

  await batch.commit();
  return saleRef.id;
};

export const deleteSale = async (id) => {
  await deleteDoc(doc(db, "sales", id));
};
