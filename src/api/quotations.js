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

const quotationsCol = collection(db, "quotations");

function createdMs(data) {
  const c = data?.createdAt;
  if (c && typeof c.toMillis === "function") return c.toMillis();
  if (c && typeof c.seconds === "number") return c.seconds * 1000;
  return 0;
}

function sortByCreatedDesc(rows) {
  return [...rows].sort((a, b) => createdMs(b) - createdMs(a));
}

export const subscribeQuotations = (onData, onError) =>
  pollCollection(
    quotationsCol,
    (rows) => onData(sortByCreatedDesc(rows)),
    onError,
  );

export const createQuotation = async ({
  customerName,
  mobile,
  address,
  items,
  total,
  status = "pending",
}) => {
  const ref = await addDoc(quotationsCol, {
    customerName: String(customerName).trim(),
    mobile: String(mobile ?? "").trim(),
    address: String(address ?? "").trim(),
    items,
    total: Number(total),
    status,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateQuotationStatus = async (id, status) => {
  await updateDoc(doc(db, "quotations", id), { status });
};

export const deleteQuotation = async (id) => {
  await deleteDoc(doc(db, "quotations", id));
};
