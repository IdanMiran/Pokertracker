import type { Player, BuyIn, Result } from '../../types';
import { computeNetPerPlayer } from '../../lib/calculations/profitLoss';
import { minimumTransfers } from '../../lib/calculations/settlement';
import { formatILS } from '../../constants/config';
import { EmptyState } from '../ui/EmptyState';

interface Props { players: Player[]; buyins: BuyIn[]; results: Result[]; sessionName: string; }

export function SettlementView({ players, buyins, results, sessionName }: Props) {
  if (results.length === 0) return <EmptyState icon="⚖️" title="No results yet" subtitle="Enter results to see settlement" />;

  const nets = computeNetPerPlayer(players, buyins, results);
  const transfers = minimumTransfers(nets);

  function handleShare() {
    const lines = [
      `🃏 ${sessionName} — Settlement`, '',
      '📊 Results:',
      ...nets.map(n => `  ${n.playerName}: ${n.net >= 0 ? '+' : ''}₪${n.net.toFixed(0)}`),
      '', '💸 Transfers:',
      ...transfers.map(t => `  ${t.from} → ${t.to}: ₪${t.amount}`),
    ];
    if (navigator.share) {
      navigator.share({ text: lines.join('\n') });
    } else {
      navigator.clipboard.writeText(lines.join('\n'));
      alert('Copied to clipboard!');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Net results */}
      <div className="rounded-xl p-4 border border-[#e2e8f0]" style={{ backgroundColor: '#f1f5f9' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#64748b' }}>NET RESULTS</p>
        {nets.map(n => {
          const color = n.net > 0 ? '#10b981' : n.net < 0 ? '#f87171' : '#64748b';
          const sign = n.net > 0 ? '+' : '';
          return (
            <div key={n.playerId} className="flex justify-between items-center py-3 border-b border-[#e2e8f0] last:border-0">
              <div>
                <p className="font-semibold" style={{ color: '#0f172a' }}>{n.playerName}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>In: {formatILS(n.totalBuyIn)} · Out: {formatILS(n.finalCash)}</p>
              </div>
              <span className="text-lg font-bold" style={{ color }}>{sign}{formatILS(Math.abs(n.net))}</span>
            </div>
          );
        })}
      </div>

      {/* Transfers */}
      {transfers.length > 0 ? (
        <div className="rounded-xl p-4 border border-[#dc2626]" style={{ backgroundColor: '#fff1f2' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#64748b' }}>TRANSFERS</p>
          {transfers.map((t, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-[#e2e8f0] last:border-0">
              <p style={{ color: '#0f172a' }}>
                <span className="font-bold">{t.from}</span>
                <span style={{ color: '#64748b' }}> pays </span>
                <span className="font-bold">{t.to}</span>
              </p>
              <span className="text-lg font-bold" style={{ color: '#dc2626' }}>{formatILS(t.amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-4 border border-[#10b981] text-center" style={{ backgroundColor: '#f0fdf4' }}>
          <p className="font-semibold" style={{ color: '#10b981' }}>All square — no transfers needed!</p>
        </div>
      )}

      {/* Share */}
      <button onClick={handleShare}
        className="w-full py-3 rounded-xl border border-[#e2e8f0] font-semibold transition-opacity active:opacity-75"
        style={{ backgroundColor: '#f1f5f9', color: '#dc2626' }}>
        Share Summary 📤
      </button>
    </div>
  );
}
