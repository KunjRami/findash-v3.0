/**
 * Format a number as Indian currency (₹)
 */
export const formatCurrency = (value, compact = false) => {
  if (value == null || isNaN(value)) return "—";
  if (compact) {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)}L`;
    if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a plain number with Indian locale
 */
export const formatNumber = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a percentage change with sign
 */
export const formatChange = (value) => {
  if (value == null || isNaN(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format volume: 1,234,567 → "1.23M"
 */
export const formatVolume = (value) => {
  if (value == null) return "—";
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return String(value);
};

/**
 * Format market cap compactly
 */
export const formatMarketCap = (value) => {
  if (!value) return "—";
  if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₹${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
  return formatCurrency(value);
};

/**
 * Returns CSS class for positive/negative values
 */
export const changeClass = (value) =>
  value >= 0 ? "text-gain" : "text-loss";

/**
 * Strips NSE/BSE suffix for display: "RELIANCE.NS" → "RELIANCE"
 */
export const cleanSymbol = (symbol) =>
  symbol?.replace(/\.(NS|BO)$/i, "") || symbol;