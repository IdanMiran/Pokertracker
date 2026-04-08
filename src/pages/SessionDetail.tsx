import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { BuyInList } from '../components/session-detail/BuyInList';
import { AddBuyInModal } from '../components/session-detail/AddBuyInModal';
import { ResultsList } from '../components/session-detail/ResultsList';
import { AddResultModal } from '../components/session-detail/AddResultModal';
import { SettlementView } from '../components/session-detail/SettlementView';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { completeSession } from '../lib/firestore/sessions';
import { format } from 'date-fns';

type Section = 'buyins' | 'results' | 'settlement';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const { players } = usePlayers();
  const { session, buyins, results, loading } = useSessionDetail(id!);
  const [section, setSection] = useState<Section>('buyins');
  const [showAddBuyIn, setShowAddBuyIn] = useState(false);
  const [showAddResult, setShowAddResult] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isActive = session?.status === 'active';

  async function handleComplete() {
    const withBuyins = players.filter(p => buyins.some(b => b.playerId === p.id));
    const missing = withBuyins.filter(p => !results.some(r => r.playerId === p.id));
    if (missing.length > 0) {
      alert(`Missing results for: ${missing.map(p => p.name).join(', ')}\n\nAdd their results before closing.`);
      return;
    }
    const totalIn = buyins.reduce((s, b) => s + b.amount, 0);
    const totalOut = results.reduce((s, r) => s + r.finalCash, 0);
    const diff = Math.abs(totalIn - totalOut);
    if (diff > 5 && !confirm(`Buy-ins (₪${totalIn}) vs cash-outs (₪${totalOut}) differ by ₪${diff.toFixed(0)}.\n\nClose anyway?`)) return;

    setCompleting(true);
    try { await completeSession(id!); setSection('settlement'); }
    catch { alert('Could not close session.'); }
    finally { setCompleting(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-[#dc2626] text-2xl">♠️</div></div>;
  if (!session) return <div className="p-4 text-center" style={{ color: '#64748b' }}>Session not found.</div>;

  const totalPot = buyins.reduce((s, b) => s + b.amount, 0);
  const uniquePlayers = new Set(buyins.map(b => b.playerId)).size;

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 56px)' }}>
      {/* Header */}
      <div className="p-4 border-b border-[#232640]" style={{ backgroundColor: '#151829' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm" style={{ color: '#64748b' }}>{format(session.date, 'EEEE, dd MMM yyyy')}</p>
          <Badge label={isActive ? 'Active' : 'Completed'} type={session.status} />
        </div>
        <div className="flex gap-6">
          <div><p className="text-xs" style={{ color: '#64748b' }}>Players</p><p className="font-bold" style={{ color: '#e2e8f0' }}>{uniquePlayers}</p></div>
          <div><p className="text-xs" style={{ color: '#64748b' }}>Total pot</p><p className="font-bold" style={{ color: '#dc2626' }}>₪{totalPot}</p></div>
          <div><p className="text-xs" style={{ color: '#64748b' }}>Results</p><p className="font-bold" style={{ color: '#e2e8f0' }}>{results.length}/{uniquePlayers}</p></div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-[#232640]" style={{ backgroundColor: '#151829' }}>
        {(['buyins', 'results', 'settlement'] as Section[]).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className="flex-1 py-3 text-sm font-semibold border-b-2 transition-colors"
            style={{
              color: section === s ? '#dc2626' : '#888',
              borderBottomColor: section === s ? '#dc2626' : 'transparent',
            }}>
            {s === 'buyins' ? 'Buy-Ins' : s === 'results' ? 'Results' : 'Settlement'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {section === 'buyins' && (
          <div className="flex flex-col gap-4">
            <BuyInList sessionId={id!} players={players} buyins={buyins} isActive={isActive} />
            {isActive && <Button onClick={() => setShowAddBuyIn(true)} fullWidth>+ Add Buy-In</Button>}
          </div>
        )}
        {section === 'results' && (
          <div className="flex flex-col gap-4">
            <ResultsList sessionId={id!} players={players} buyins={buyins} results={results} isActive={isActive} />
            {isActive && (
              <>
                <Button onClick={() => setShowAddResult(true)} fullWidth>+ Enter Result</Button>
                <Button onClick={handleComplete} variant="danger" loading={completing} fullWidth>Close Session</Button>
              </>
            )}
          </div>
        )}
        {section === 'settlement' && (
          <SettlementView players={players} buyins={buyins} results={results} sessionName={session.name} />
        )}
      </div>

      <AddBuyInModal visible={showAddBuyIn} onClose={() => setShowAddBuyIn(false)} sessionId={id!} players={players} />
      <AddResultModal visible={showAddResult} onClose={() => setShowAddResult(false)} sessionId={id!}
        players={players} buyins={buyins} results={results} chipToCashRatio={session.chipToCashRatio} />
    </div>
  );
}
