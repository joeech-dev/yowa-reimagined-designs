export type Currency = "UGX" | "USD";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "UGX", label: "UGX (Ugandan Shilling)", symbol: "UGX" },
  { value: "USD", label: "USD (US Dollar)", symbol: "$" },
];

/** Format a number with the appropriate currency suffix/prefix */
export const formatCurrency = (amount: number, currency: Currency = "UGX"): string => {
  if (currency === "USD") {
    return `$${Number(amount).toLocaleString()}`;
  }
  return `${Number(amount).toLocaleString()}/=`;
};

/** Short label for table headers, e.g. "Total (UGX)" */
export const currencyLabel = (label: string, currency: Currency = "UGX"): string => {
  return `${label} (${currency})`;
};
