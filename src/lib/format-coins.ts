/**
 * Format a number with suffix for compact display
 * 1000 -> 1K, 1000000 -> 1M, 1000000000 -> 1B, etc.
 */
export function formatCoins(value: number): string {
  if (value < 1000) {
    return value.toString();
  }

  const suffixes = ["", "K", "M", "B", "T"];
  const magnitude = Math.floor(Math.log10(Math.abs(value)) / 3);
  const scaledValue = value / Math.pow(1000, magnitude);
  const suffix = suffixes[magnitude] || `E${magnitude * 3}`;

  // Remove unnecessary decimals
  const formatted = scaledValue % 1 === 0 ? scaledValue.toFixed(0) : scaledValue.toFixed(1);
  
  return `${formatted}${suffix}`;
}
