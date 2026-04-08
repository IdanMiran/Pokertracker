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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="pb-24">
      {/* Hero header */}
      <div className="px-4 pt-5 pb-6" style={{
        background: 'linear-gradient(160deg, #1a0a0a 0%, #0a0a0a 60%)',
        borderBottom: '1px solid #1f1f1f',
      }}>
        <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#dc2626' }}>POKER TRACKER</p>
        <p className="text-2xl font-bold mb-4" style={{ color: '#f5f5f5' }}>
          {activeSessions.length > 0 ? 'Game in progress 🃏' : 'Ready to play?'}
        </p>

        {/* Active session banner */}
        {activeSessions.length > 0 && (
          <div onClick={() => navigate(`/session/${activeSessions[0].id}`)}
            className="card-hover rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #3a1515, #2a0f0f)',
              border: '1px solid #dc2626',
              boxShadow: '0 0 20px rgba(220,38,38,0.15)',
            }}>
            <div>
              <p className="text-xs font-bold tracking-widest mb-0.5" style={{ color: '#dc2626' }}>● LIVE</p>
              <p className="text-base font-bold" style={{ color: '#f5f5f5' }}>{activeSessions[0].name}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
              <span className="text-white text-sm font-bold">→</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Players', value: players.length, icon: '👥' },
            { label: 'Sessions', value: sessions.length, icon: '🃏' },
            { label: 'Active', value: activeSessions.length, icon: '🔴' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{
              backgroundColor: '#161616',
              border: '1px solid #222',
            }}>
              <p className="text-lg mb-0.5">{icon}</p>
              <p className="text-xl font-bold" style={{ color: '#f5f5f5' }}>{value}</p>
              <p className="text-xs" style={{ color: '#666' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* New session button */}
        <button onClick={() => navigate('/session/new')}
          className="w-full py-3.5 rounded-2xl font-bold text-[15px] mb-6 transition-opacity active:opacity-80"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(220,38,38,0.35)',
          }}>
          + New Session
        </button>

        {/* Recent sessions */}
        <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: '#666' }}>RECENT SESSIONS</p>
        {recentSessions.length === 0
          ? <EmptyState icon="🃏" title="No sessions yet" subtitle="Start your first poker night!" />
          : recentSessions.map(s => <SessionCard key={s.id} session={s} buyins={buyinsBySession[s.id] ?? []} />)
        }
      </div>
    </div>
  );
}
