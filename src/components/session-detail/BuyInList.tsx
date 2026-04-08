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
          <div key={pid} className="rounded-xl p-4 border border-[#e2e8f0]" style={{ backgroundColor: '#f1f5f9' }}>
            <div className="flex justify-between mb-3">
              <span className="font-bold" style={{ color: '#0f172a' }}>{playerMap[pid] ?? '?'}</span>
              <span className="font-bold" style={{ color: '#dc2626' }}>{formatILS(total)}</span>
            </div>
            {entries.map((e, i) => (
              <div key={e.id} className="flex justify-between py-1.5 border-t border-[#e2e8f0]">
                <span className="text-sm" style={{ color: '#64748b' }}>Entry #{i + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: '#0f172a' }}>{formatILS(e.amount)}</span>
                  {isActive && (
                    <button onClick={() => handleDelete(e.id)} className="text-xs px-2 py-0.5 rounded" style={{ color: '#f87171', backgroundColor: '#fef2f2' }}>✕</button>
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
