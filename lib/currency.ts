/**
 * Currency utilities: INR as default display currency.
 * Conversion rates are approximate (configurable); used for display only.
 */

export const DEFAULT_DISPLAY_CURRENCY = 'INR';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  SGD: 'S$',
};

/** Approximate rates to INR (1 unit of currency = X INR). Update as needed. */
export const RATES_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 90,
  GBP: 105,
  JPY: 0.55,
  CAD: 61,
  AUD: 54,
  CHF: 94,
  SGD: 62,
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency + ' ';
}

/** Convert amount from given currency to INR. */
export function convertToINR(amount: number, fromCurrency: string): number {
  const rate = RATES_TO_INR[fromCurrency] ?? RATES_TO_INR.USD;
  return amount * rate;
}

/** Format amount in INR (e.g. ₹1,50,000.00). */
export function formatINR(amountInr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInr);
}

/** Format amount in INR without "INR" text, symbol only (₹1,50,000). */
export function formatINRShort(amountInr: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInr);
}

/** Format any amount: convert to INR and display in INR for dashboard/reports. */
export function formatAsINR(amount: number, fromCurrency: string): string {
  const inr = convertToINR(amount, fromCurrency);
  return formatINR(inr);
}
