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
    if (sessions.length === 0) return;
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
      <p style={{ color: '#888' }}>Player not found.</p>
      <button onClick={() => navigate('/players')} style={{ color: '#dc2626' }}>← Back</button>
    </div>
  );

  const stats = aggregatePlayerStats([player], sessions, allBuyIns, allResults)[0];

  // Sessions this player participated in, most recent first
  const playerSessions = sessions
    .filter(s => (allBuyIns[s.id] ?? []).some(b => b.playerId === id))
    .map(s => {
      const buyins = (allBuyIns[s.id] ?? []).filter(b => b.playerId === id);
      const result = (allResults[s.id] ?? []).find(r => r.playerId === id);
      const totalBuyIn = buyins.reduce((sum, b) => sum + b.amount, 0);
      const net = result ? result.finalCash - totalBuyIn : null;
      return { session: s, totalBuyIn, finalCash: result?.finalCash ?? null, net };
    });

  const netColor = stats.totalNet > 0 ? '#4caf82' : stats.totalNet < 0 ? '#e05252' : '#888';
  const sign = stats.totalNet > 0 ? '+' : stats.totalNet < 0 ? '-' : '';
  const roi = stats.totalInvested > 0 ? ((stats.totalNet / stats.totalInvested) * 100).toFixed(0) : '0';

  return (
    <div className="pb-24">
      {/* Profile header */}
      <div className="p-5 text-center border-b border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3"
          style={{ backgroundColor: '#2a1515', color: '#dc2626' }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-xl font-bold mb-1" style={{ color: '#f5f5f5' }}>{player.name}</p>
        <p className="text-4xl font-bold mb-1" style={{ color: netColor }}>
          {sign}{formatILS(Math.abs(stats.totalNet))}
        </p>
        <p className="text-sm" style={{ color: '#888' }}>total net</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-[#333]">
        <div className="rounded-xl p-3 text-center border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-lg font-bold" style={{ color: '#f5f5f5' }}>{stats.totalSessions}</p>
          <p className="text-xs" style={{ color: '#888' }}>Sessions</p>
        </div>
        <div className="rounded-xl p-3 text-center border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-lg font-bold" style={{ color: netColor }}>{sign}{roi}%</p>
          <p className="text-xs" style={{ color: '#888' }}>ROI</p>
        </div>
        <div className="rounded-xl p-3 text-center border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-lg font-bold" style={{ color: '#f5f5f5' }}>{formatILS(stats.totalInvested)}</p>
          <p className="text-xs" style={{ color: '#888' }}>Invested</p>
        </div>
      </div>

      {/* Win/loss row */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-4 border-b border-[#333] pb-4">
        <div className="rounded-xl p-3 text-center border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-lg font-bold" style={{ color: '#4caf82' }}>
            {stats.biggestWin > 0 ? `+${formatILS(stats.biggestWin)}` : formatILS(0)}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>Best night</p>
        </div>
        <div className="rounded-xl p-3 text-center border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-lg font-bold" style={{ color: '#e05252' }}>
            {stats.biggestLoss < 0 ? `-${formatILS(Math.abs(stats.biggestLoss))}` : formatILS(0)}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>Worst night</p>
        </div>
      </div>

      {/* Session history */}
      <div className="p-4">
        <p className="text-sm font-semibold mb-3" style={{ color: '#888' }}>SESSION HISTORY</p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div style={{ color: '#dc2626' }}>♠️</div>
          </div>
        ) : playerSessions.length === 0 ? (
          <EmptyState icon="🃏" title="No sessions yet" subtitle="This player hasn't played any sessions" />
        ) : (
          playerSessions.map(({ session, totalBuyIn, finalCash, net }) => {
            const netColor = net === null ? '#888' : net > 0 ? '#4caf82' : net < 0 ? '#e05252' : '#888';
            const netSign = net !== null && net > 0 ? '+' : '';
            return (
              <div key={session.id}
                onClick={() => navigate(`/session/${session.id}`)}
                className="rounded-xl p-4 border border-[#333] mb-3 cursor-pointer active:opacity-75"
                style={{ backgroundColor: '#1a1a1a' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold" style={{ color: '#f5f5f5' }}>{session.name}</p>
                    <p className="text-sm" style={{ color: '#888' }}>{format(session.date, 'dd MMM yyyy')}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: netColor }}>
                    {net === null ? 'Pending' : `${netSign}${formatILS(Math.abs(net))}`}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs" style={{ color: '#888' }}>Bought in</p>
                    <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{formatILS(totalBuyIn)}</p>
                  </div>
                  {finalCash !== null && (
                    <div>
                      <p className="text-xs" style={{ color: '#888' }}>Cashed out</p>
                      <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{formatILS(finalCash)}</p>
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
