export const UNIT_OPTIONS = [
  { value: "units", label: "Units (qty)" },
  { value: "quintals", label: "Quintals" },
  { value: "tons", label: "Tons" },
  { value: "kg", label: "Kg" },
  { value: "RFT", label: "RFT" },

];

export function normalizeUnit(unit) {
  const value = String(unit || "").toLowerCase();
  if (value === "quintal" || value === "quintals") return "quintals";
  if (value === "ton" || value === "tons") return "tons";
  if (value === "kg" || value === "kgs") return "kg";
  if (value === "rft" || value === "rfts") return "rft";
  return "units";
}

export function unitLabel(unit) {
  const value = normalizeUnit(unit);
  return UNIT_OPTIONS.find((u) => u.value === value)?.label || "Units (qty)";
}
