import { useEffect, useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import { useSessions } from '../hooks/useSessions';
import { AddPlayerModal } from '../components/players/AddPlayerModal';
import { PlayerStatsModal } from '../components/players/PlayerStatsModal';
import { EmptyState } from '../components/ui/EmptyState';
import { aggregatePlayerStats } from '../lib/calculations/playerStats';
import { deletePlayer } from '../lib/firestore/players';
import { subscribeToBuyIns } from '../lib/firestore/buyins';
import { subscribeToResults } from '../lib/firestore/results';
import type { BuyIn, Result, PlayerStats } from '../types';
import { formatILS } from '../constants/config';

export function Players() {
  const { players, loading } = usePlayers();
  const { sessions } = useSessions();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<PlayerStats | null>(null);
  const [allBuyIns, setAllBuyIns] = useState<Record<string, BuyIn[]>>({});
  const [allResults, setAllResults] = useState<Record<string, Result[]>>({});

  useEffect(() => {
    const unsubs = sessions.flatMap(s => [
      subscribeToBuyIns(s.id, data => setAllBuyIns(prev => ({ ...prev, [s.id]: data })), () => {}),
      subscribeToResults(s.id, data => setAllResults(prev => ({ ...prev, [s.id]: data })), () => {}),
    ]);
    return () => unsubs.forEach(u => u());
  }, [sessions.map(s => s.id).join(',')]);

  const stats = aggregatePlayerStats(players, sessions, allBuyIns, allResults);

  function handleDelete(id: string, name: string) {
    if (confirm(`Remove ${name} permanently?`)) deletePlayer(id);
  }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-[#dc2626] text-2xl">♠️</div></div>;

  return (
    <div className="p-4 pb-24">
      {players.length === 0
        ? <EmptyState icon="👥" title="No players yet" subtitle="Add your group members to start tracking" />
        : stats.map(s => {
            const netColor = s.totalNet > 0 ? '#4caf82' : s.totalNet < 0 ? '#e05252' : '#888';
            const sign = s.totalNet > 0 ? '+' : '';
            return (
              <div key={s.playerId}
                className="flex items-center justify-between p-4 rounded-xl border border-[#333] mb-3 cursor-pointer active:opacity-75"
                style={{ backgroundColor: '#1a1a1a' }}
                onClick={() => setSelected(s)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: '#2a1515', color: '#dc2626' }}>
                    {s.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#f5f5f5' }}>{s.playerName}</p>
                    <p className="text-sm" style={{ color: '#888' }}>{s.totalSessions} sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: netColor }}>{sign}{formatILS(Math.abs(s.totalNet))}</p>
                    <p className="text-xs" style={{ color: '#888' }}>total net</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(s.playerId, s.playerName); }}
                    className="text-xs px-2 py-1 rounded-lg" style={{ color: '#e05252', backgroundColor: '#2a1515' }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })
      }

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full text-3xl font-bold flex items-center justify-center"
        style={{ backgroundColor: '#dc2626', color: '#ffffff', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}>
        +
      </button>

      <AddPlayerModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <PlayerStatsModal visible={!!selected} onClose={() => setSelected(null)} stats={selected} />
    </div>
  );
}
