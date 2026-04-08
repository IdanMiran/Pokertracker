export function formatILS(amount: number): string {
  return `₪${Math.abs(amount).toFixed(0)}`;
}
