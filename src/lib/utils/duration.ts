export function formatMonths(total: number): string {
  const m = Math.max(0, Math.round(total));
  if (m < 12) return `${String(m)} ${m === 1 ? 'month' : 'months'}`;
  const years = Math.floor(m / 12);
  const months = m % 12;
  const y = `${String(years)} ${years === 1 ? 'year' : 'years'}`;
  if (months === 0) return y;
  return `${y} ${String(months)} ${months === 1 ? 'month' : 'months'}`;
}
