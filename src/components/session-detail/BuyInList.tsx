import type { Player, BuyIn } from '../../types';
import { formatILS } from '../../constants/config';
import { deleteBuyIn } from '../../lib/firestore/buyins';
import { EmptyState } from '../ui/EmptyState';

interface Props { sessionId: string; players: Player[]; buyins: BuyIn[]; isActive: boolean; }

export function BuyInList({ sessionId, players, buyins, isActive }: Props) {
  const playerMap = Object.fromEntries(players.map(p => [p.id, p.name]));
  const grouped: Record<string, BuyIn[]> = {};
  for (const b of buyins) {
    if (!grouped[b.playerId]) grouped[b.playerId] = [];
    grouped[b.playerId].push(b);
  }

  if (buyins.length === 0) return <EmptyState icon="💰" title="No buy-ins yet" subtitle="Add the first buy-in to start" />;

  function handleDelete(buyInId: string) {
    if (confirm('Delete this buy-in?')) deleteBuyIn(sessionId, buyInId);
  }

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(grouped).map(([pid, entries]) => {
        const total = entries.reduce((s, e) => s + e.amount, 0);
        return (
          <div key={pid} className="rounded-xl p-4 border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="flex justify-between mb-3">
              <span className="font-bold" style={{ color: '#f5f5f5' }}>{playerMap[pid] ?? '?'}</span>
              <span className="font-bold" style={{ color: '#dc2626' }}>{formatILS(total)}</span>
            </div>
            {entries.map((e, i) => (
              <div key={e.id} className="flex justify-between py-1.5 border-t border-[#333]">
                <span className="text-sm" style={{ color: '#888' }}>Entry #{i + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: '#f5f5f5' }}>{formatILS(e.amount)}</span>
                  {isActive && (
                    <button onClick={() => handleDelete(e.id)} className="text-xs px-2 py-0.5 rounded" style={{ color: '#e05252', backgroundColor: '#2a1515' }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
