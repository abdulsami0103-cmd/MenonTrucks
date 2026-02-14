// Multi-Currency Support

export type Currency = 'EUR' | 'USD' | 'GBP';

export const SUPPORTED_CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

// Approximate exchange rates (in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  'EUR_USD': 1.09,
  'EUR_GBP': 0.86,
  'USD_EUR': 0.92,
  'USD_GBP': 0.79,
  'GBP_EUR': 1.16,
  'GBP_USD': 1.27,
};

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const rate = EXCHANGE_RATES[`${from}_${to}`] || 1;
  return Math.round(amount * rate);
}

export function formatCurrency(amount: number, currency: Currency = 'EUR'): string {
  const localeMap: Record<Currency, string> = {
    EUR: 'de-DE',
    USD: 'en-US',
    GBP: 'en-GB',
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR';
  return (localStorage.getItem('currency') as Currency) || 'EUR';
}

export function setCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currency', currency);
}
