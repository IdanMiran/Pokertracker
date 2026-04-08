import type { Player, BuyIn, Result, PlayerNet } from '../../types';

export function computeNetPerPlayer(
  players: Player[],
  buyins: BuyIn[],
  results: Result[]
): PlayerNet[] {
  const playersWithBuyins = players.filter((p) =>
    buyins.some((b) => b.playerId === p.id)
  );

  return playersWithBuyins.map((player) => {
    const totalBuyIn = buyins
      .filter((b) => b.playerId === player.id)
      .reduce((sum, b) => sum + b.amount, 0);

    const result = results.find((r) => r.playerId === player.id);
    const finalCash = result?.finalCash ?? 0;

    return {
      playerId: player.id,
      playerName: player.name,
      totalBuyIn,
      finalCash,
      net: finalCash - totalBuyIn,
    };
  });
}
