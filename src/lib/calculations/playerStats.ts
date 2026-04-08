import type { Player, Session, BuyIn, Result, PlayerStats } from '../../types';

export function aggregatePlayerStats(
  players: Player[],
  sessions: Session[],
  allBuyIns: Record<string, BuyIn[]>,   // sessionId -> buyins
  allResults: Record<string, Result[]>  // sessionId -> results
): PlayerStats[] {
  return players.map((player) => {
    let totalSessions = 0;
    let totalInvested = 0;
    let totalCashedOut = 0;
    let biggestWin = 0;
    let biggestLoss = 0;

    for (const session of sessions) {
      const buyins = allBuyIns[session.id] ?? [];
      const results = allResults[session.id] ?? [];

      const playerBuyins = buyins.filter((b) => b.playerId === player.id);
      if (playerBuyins.length === 0) continue;

      totalSessions++;
      const invested = playerBuyins.reduce((sum, b) => sum + b.amount, 0);
      totalInvested += invested;

      const result = results.find((r) => r.playerId === player.id);
      const cashedOut = result?.finalCash ?? 0;
      totalCashedOut += cashedOut;

      const net = cashedOut - invested;
      if (net > biggestWin) biggestWin = net;
      if (net < biggestLoss) biggestLoss = net;
    }

    return {
      playerId: player.id,
      playerName: player.name,
      totalSessions,
      totalInvested,
      totalCashedOut,
      totalNet: totalCashedOut - totalInvested,
      biggestWin,
      biggestLoss,
    };
  });
}
