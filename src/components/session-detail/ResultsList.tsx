import type { Player, BuyIn, Result } from '../../types';
import { formatILS } from '../../constants/config';
import { deleteResult } from '../../lib/firestore/results';
import { EmptyState } from '../ui/EmptyState';

interface Props { sessionId: string; players: Player[]; buyins: BuyIn[]; results: Result[]; isActive: boolean; }

export function ResultsList({ sessionId, players, buyins, results, isActive }: Props) {
  const playersWithBuyins = players.filter(p => buyins.some(b => b.playerId === p.id));

  if (playersWithBuyins.length === 0) return <EmptyState icon="🏆" title="No buy-ins yet" subtitle="Add buy-ins first, then enter results" />;

  function handleDelete(pid: string) {
    if (confirm('Remove this result?')) deleteResult(sessionId, pid);
  }

  return (
    <div className="flex flex-col gap-2">
      {playersWithBuyins.map(player => {
        const result = results.find(r => r.playerId === player.id);
        const totalBuyIn = buyins.filter(b => b.playerId === player.id).reduce((s, b) => s + b.amount, 0);
        return (
          <div key={player.id}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: result ? '#4caf82' : '#333' }}>
            <div>
              <p className="font-semibold" style={{ color: '#f5f5f5' }}>{player.name}</p>
              <p className="text-sm" style={{ color: '#888' }}>Bought in: {formatILS(totalBuyIn)}</p>
            </div>
            <div className="flex items-center gap-3">
              {result ? (
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#4caf82' }}>{formatILS(result.finalCash)}</p>
                  <p className="text-xs" style={{ color: '#888' }}>cash out</p>
                </div>
              ) : (
                <span className="text-sm px-3 py-1 rounded-lg border border-[#333]" style={{ color: '#888' }}>Pending</span>
              )}
              {isActive && result && (
                <button onClick={() => handleDelete(player.id)} className="text-xs px-2 py-0.5 rounded" style={{ color: '#e05252', backgroundColor: '#2a1515' }}>✕</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
