export type Currency = "UGX" | "USD" | "EUR" | "GBP";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "UGX", label: "UGX (Ugandan Shilling)", symbol: "UGX" },
  { value: "USD", label: "USD (US Dollar)", symbol: "$" },
  { value: "EUR", label: "EUR (Euro)", symbol: "€" },
  { value: "GBP", label: "GBP (British Pound)", symbol: "£" },
];

/** Format a number with the appropriate currency suffix/prefix */
export const formatCurrency = (amount: number, currency: Currency = "UGX"): string => {
  const n = Number(amount).toLocaleString();
  if (currency === "USD") return `$${n}`;
  if (currency === "EUR") return `€${n}`;
  if (currency === "GBP") return `£${n}`;
  return `${n}/=`;
};

/** Short label for table headers, e.g. "Total (UGX)" */
export const currencyLabel = (label: string, currency: Currency = "UGX"): string => {
  return `${label} (${currency})`;
};
