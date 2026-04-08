import type { PlayerNet, Transfer } from '../../types';

export function minimumTransfers(nets: PlayerNet[]): Transfer[] {
  const transfers: Transfer[] = [];

  // Work in cents to avoid floating-point drift
  const debtors = nets
    .filter((p) => p.net < -0.5)
    .map((p) => ({ name: p.playerName, amount: Math.round(Math.abs(p.net)) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = nets
    .filter((p) => p.net > 0.5)
    .map((p) => ({ name: p.playerName, amount: Math.round(p.net) }))
    .sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount: pay,
    });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return transfers;
}
