import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePlayers } from '../hooks/usePlayers';
import { useSessions } from '../hooks/useSessions';
import { subscribeToBuyIns } from '../lib/firestore/buyins';
import { subscribeToResults } from '../lib/firestore/results';
import { aggregatePlayerStats } from '../lib/calculations/playerStats';
import { EmptyState } from '../components/ui/EmptyState';
import { formatILS } from '../constants/config';
import type { BuyIn, Result } from '../types';

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { sessions } = useSessions();
  const [allBuyIns, setAllBuyIns] = useState<Record<string, BuyIn[]>>({});
  const [allResults, setAllResults] = useState<Record<string, Result[]>>({});
  const [loading, setLoading] = useState(true);

  const player = players.find(p => p.id === id);

  useEffect(() => {
    if (sessions.length === 0) { setLoading(false); return; }
    let loaded = 0;
    const total = sessions.length * 2;
    const check = () => { if (++loaded >= total) setLoading(false); };

    const unsubs = sessions.flatMap(s => [
      subscribeToBuyIns(s.id, data => { setAllBuyIns(prev => ({ ...prev, [s.id]: data })); check(); }, () => check()),
      subscribeToResults(s.id, data => { setAllResults(prev => ({ ...prev, [s.id]: data })); check(); }, () => check()),
    ]);
    return () => unsubs.forEach(u => u());
  }, [sessions.map(s => s.id).join(',')]);

  if (!player) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p style={{ color: '#64748b' }}>Player not found.</p>
      <button onClick={() => navigate('/players')} className="text-sm font-semibold" style={{ color: '#dc2626' }}>← Back to Players</button>
    </div>
  );

  const stats = aggregatePlayerStats([player], sessions, allBuyIns, allResults)[0];
  const netColor = stats.totalNet > 0 ? '#10b981' : stats.totalNet < 0 ? '#f87171' : '#64748b';
  const sign = stats.totalNet > 0 ? '+' : stats.totalNet < 0 ? '-' : '';
  const roi = stats.totalInvested > 0 ? ((stats.totalNet / stats.totalInvested) * 100).toFixed(0) : '0';

  const playerSessions = sessions
    .filter(s => (allBuyIns[s.id] ?? []).some(b => b.playerId === id))
    .map(s => {
      const buyins = (allBuyIns[s.id] ?? []).filter(b => b.playerId === id);
      const result = (allResults[s.id] ?? []).find(r => r.playerId === id);
      const totalBuyIn = buyins.reduce((sum, b) => sum + b.amount, 0);
      const net = result ? result.finalCash - totalBuyIn : null;
      return { session: s, totalBuyIn, finalCash: result?.finalCash ?? null, net };
    });

  return (
    <div className="pb-24">
      {/* Profile hero */}
      <div className="relative overflow-hidden px-4 pt-6 pb-8 text-center"
        style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #f8fafc 70%)', borderBottom: '1px solid #e2e8f0' }}>
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3"
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: '2px solid #fecaca',
            boxShadow: '0 0 20px rgba(220,38,38,0.2)',
          }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-xl font-bold mb-3" style={{ color: '#0f172a' }}>{player.name}</p>

        {/* Big net */}
        <p className="text-5xl font-bold mb-1" style={{ color: netColor, letterSpacing: '-1px' }}>
          {sign}{formatILS(Math.abs(stats.totalNet))}
        </p>
        <p className="text-xs font-semibold tracking-widest" style={{ color: '#64748b' }}>TOTAL NET</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-[#e2e8f0]">
        {[
          { label: 'Sessions', value: String(stats.totalSessions), color: '#0f172a' },
          { label: 'ROI', value: `${sign}${roi}%`, color: netColor },
          { label: 'Invested', value: formatILS(stats.totalInvested), color: '#0f172a' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Best / worst */}
      <div className="grid grid-cols-2 gap-2 px-4 py-4 border-b border-[#e2e8f0]">
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#10b981' }}>BEST NIGHT</p>
          <p className="text-xl font-bold" style={{ color: '#10b981' }}>
            {stats.biggestWin > 0 ? `+${formatILS(stats.biggestWin)}` : '—'}
          </p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#f87171' }}>WORST NIGHT</p>
          <p className="text-xl font-bold" style={{ color: '#f87171' }}>
            {stats.biggestLoss < 0 ? `-${formatILS(Math.abs(stats.biggestLoss))}` : '—'}
          </p>
        </div>
      </div>

      {/* Session history */}
      <div className="p-4">
        <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: '#64748b' }}>SESSION HISTORY</p>

        {loading ? (
          <div className="flex justify-center py-10"><div className="spinner" /></div>
        ) : playerSessions.length === 0 ? (
          <EmptyState icon="🃏" title="No sessions yet" subtitle="This player hasn't played any sessions" />
        ) : (
          playerSessions.map(({ session, totalBuyIn, finalCash, net }) => {
            const nc = net === null ? '#64748b' : net > 0 ? '#10b981' : net < 0 ? '#f87171' : '#64748b';
            const ns = net !== null && net > 0 ? '+' : '';
            return (
              <div key={session.id}
                onClick={() => navigate(`/session/${session.id}`)}
                className="card-hover rounded-2xl p-4 mb-3 cursor-pointer"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: `3px solid ${nc}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-[15px]" style={{ color: '#0f172a' }}>{session.name}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{format(session.date, 'dd MMM yyyy')}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: nc }}>
                    {net === null ? <span className="text-sm px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>Pending</span>
                      : `${ns}${formatILS(Math.abs(net))}`}
                  </p>
                </div>
                <div className="flex gap-5 mt-1">
                  <div>
                    <p className="text-xs" style={{ color: '#64748b' }}>Bought in</p>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{formatILS(totalBuyIn)}</p>
                  </div>
                  {finalCash !== null && (
                    <div>
                      <p className="text-xs" style={{ color: '#64748b' }}>Cashed out</p>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{formatILS(finalCash)}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
