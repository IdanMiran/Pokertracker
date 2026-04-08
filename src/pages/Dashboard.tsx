import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../hooks/useSessions';
import { usePlayers } from '../hooks/usePlayers';
import { SessionCard } from '../components/sessions/SessionCard';
import { EmptyState } from '../components/ui/EmptyState';
import type { BuyIn } from '../types';
import { subscribeToBuyIns } from '../lib/firestore/buyins';

export function Dashboard() {
  const navigate = useNavigate();
  const { sessions, loading } = useSessions();
  const { players } = usePlayers();
  const [buyinsBySession, setBuyinsBySession] = useState<Record<string, BuyIn[]>>({});

  const activeSessions = sessions.filter(s => s.status === 'active');
  const recentSessions = sessions.slice(0, 5);

  useEffect(() => {
    const unsubs = recentSessions.map(s =>
      subscribeToBuyIns(s.id, data => setBuyinsBySession(prev => ({ ...prev, [s.id]: data })), () => {})
    );
    return () => unsubs.forEach(u => u());
  }, [sessions.map(s => s.id).join(',')]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-[#dc2626] text-2xl">♠️</div></div>;

  return (
    <div className="p-4 pb-24">
      {/* Active session banner */}
      {activeSessions.length > 0 && (
        <div onClick={() => navigate(`/session/${activeSessions[0].id}`)}
          className="rounded-xl p-4 mb-4 border border-[#4caf82] cursor-pointer flex items-center justify-between active:opacity-75"
          style={{ backgroundColor: '#2a1515' }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: '#4caf82' }}>ACTIVE SESSION</p>
            <p className="text-lg font-bold" style={{ color: '#f5f5f5' }}>{activeSessions[0].name}</p>
          </div>
          <span style={{ color: '#dc2626' }} className="text-xl">→</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Players', value: players.length },
          { label: 'Sessions', value: sessions.length },
          { label: 'Active', value: activeSessions.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-3 border border-[#333] text-center" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{value}</p>
            <p className="text-xs" style={{ color: '#888' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* New session button */}
      <button onClick={() => navigate('/session/new')}
        className="w-full py-3 rounded-xl font-semibold text-[15px] mb-6 active:opacity-75 transition-opacity"
        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
        + New Session
      </button>

      {/* Recent sessions */}
      <p className="text-lg font-bold mb-3" style={{ color: '#f5f5f5' }}>Recent Sessions</p>
      {recentSessions.length === 0
        ? <EmptyState icon="🃏" title="No sessions yet" subtitle="Start your first poker night!" />
        : recentSessions.map(s => <SessionCard key={s.id} session={s} buyins={buyinsBySession[s.id] ?? []} />)
      }
    </div>
  );
}
