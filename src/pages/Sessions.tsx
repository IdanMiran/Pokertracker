import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../hooks/useSessions';
import { SessionCard } from '../components/sessions/SessionCard';
import { EmptyState } from '../components/ui/EmptyState';
import type { BuyIn } from '../types';
import { subscribeToBuyIns } from '../lib/firestore/buyins';

type Tab = 'active' | 'completed';

export function Sessions() {
  const navigate = useNavigate();
  const { sessions, loading } = useSessions();
  const [tab, setTab] = useState<Tab>('active');
  const [buyinsBySession, setBuyinsBySession] = useState<Record<string, BuyIn[]>>({});

  useEffect(() => {
    const unsubs = sessions.map(s =>
      subscribeToBuyIns(s.id, data => setBuyinsBySession(prev => ({ ...prev, [s.id]: data })), () => {})
    );
    return () => unsubs.forEach(u => u());
  }, [sessions.map(s => s.id).join(',')]);

  const filtered = sessions.filter(s => s.status === tab);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-[#dc2626] text-2xl">♠️</div></div>;

  return (
    <div className="pb-24">
      {/* Tab switcher */}
      <div className="flex gap-2 p-4 sticky top-0 z-10" style={{ backgroundColor: '#0d0f1a' }}>
        {(['active', 'completed'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
            style={{
              backgroundColor: tab === t ? '#dc2626' : '#151829',
              color: tab === t ? '#0d0f1a' : '#64748b',
              borderColor: tab === t ? '#dc2626' : '#232640',
            }}>
            {t === 'active' ? 'Active' : 'Completed'} ({sessions.filter(s => s.status === t).length})
          </button>
        ))}
      </div>

      <div className="px-4">
        {filtered.length === 0
          ? <EmptyState icon={tab === 'active' ? '🎰' : '📋'}
              title={tab === 'active' ? 'No active sessions' : 'No completed sessions'}
              subtitle={tab === 'active' ? 'Tap + on the home screen to start' : 'Complete a session to see it here'} />
          : filtered.map(s => <SessionCard key={s.id} session={s} buyins={buyinsBySession[s.id] ?? []} />)
        }
      </div>

      {/* FAB */}
      <button onClick={() => navigate('/session/new')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full text-3xl font-bold flex items-center justify-center shadow-lg"
        style={{ backgroundColor: '#dc2626', color: '#ffffff', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}>
        +
      </button>
    </div>
  );
}
