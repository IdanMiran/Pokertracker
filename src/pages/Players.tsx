import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { useSessions } from '../hooks/useSessions';
import { AddPlayerModal } from '../components/players/AddPlayerModal';
import { EmptyState } from '../components/ui/EmptyState';
import { aggregatePlayerStats } from '../lib/calculations/playerStats';
import { deletePlayer } from '../lib/firestore/players';
import { subscribeToBuyIns } from '../lib/firestore/buyins';
import { subscribeToResults } from '../lib/firestore/results';
import type { BuyIn, Result } from '../types';
import { formatILS } from '../constants/config';

export function Players() {
  const navigate = useNavigate();
  const { players, loading } = usePlayers();
  const { sessions } = useSessions();
  const [showAdd, setShowAdd] = useState(false);
  const [allBuyIns, setAllBuyIns] = useState<Record<string, BuyIn[]>>({});
  const [allResults, setAllResults] = useState<Record<string, Result[]>>({});

  useEffect(() => {
    const unsubs = sessions.flatMap(s => [
      subscribeToBuyIns(s.id, data => setAllBuyIns(prev => ({ ...prev, [s.id]: data })), () => {}),
      subscribeToResults(s.id, data => setAllResults(prev => ({ ...prev, [s.id]: data })), () => {}),
    ]);
    return () => unsubs.forEach(u => u());
  }, [sessions.map(s => s.id).join(',')]);

  const stats = aggregatePlayerStats(players, sessions, allBuyIns, allResults)
    .sort((a, b) => b.totalNet - a.totalNet);

  function handleDelete(id: string, name: string) {
    if (confirm(`Remove ${name} permanently?`)) deletePlayer(id);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="p-4 pb-24">
      {players.length === 0
        ? <EmptyState icon="👥" title="No players yet" subtitle="Add your group members to start tracking" />
        : stats.map((s, i) => {
            const netColor = s.totalNet > 0 ? '#10b981' : s.totalNet < 0 ? '#f87171' : '#64748b';
            const sign = s.totalNet > 0 ? '+' : '';
            const rank = i + 1;
            const rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : '#444';

            return (
              <div key={s.playerId}
                className="card-hover flex items-center justify-between p-4 rounded-2xl mb-3 cursor-pointer"
                style={{
                  backgroundColor: '#151829',
                  border: '1px solid #232640',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  borderLeft: `3px solid ${netColor}`,
                }}
                onClick={() => navigate(`/player/${s.playerId}`)}>
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className="w-6 text-center">
                    <span className="text-sm font-bold" style={{ color: rankColor }}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                  </div>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1e1020', color: '#dc2626', border: '1px solid #2a1520' }}>
                    {s.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px]" style={{ color: '#e2e8f0' }}>{s.playerName}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{s.totalSessions} sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-base" style={{ color: netColor }}>{sign}{formatILS(Math.abs(s.totalNet))}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>net</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(s.playerId, s.playerName); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-opacity hover:opacity-100 opacity-40"
                    style={{ color: '#f87171', backgroundColor: '#1e0d0d' }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })
      }

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full text-2xl font-bold flex items-center justify-center transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(220,38,38,0.5)',
        }}>
        +
      </button>

      <AddPlayerModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
