import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Player, BuyIn, Result } from '../../types';
import { setResult } from '../../lib/firestore/results';
import { formatILS } from '../../constants/config';

interface Props {
  visible: boolean; onClose: () => void; sessionId: string;
  players: Player[]; buyins: BuyIn[]; results: Result[]; chipToCashRatio?: number;
}

export function AddResultModal({ visible, onClose, sessionId, players, buyins, results, chipToCashRatio }: Props) {
  const playersWithBuyins = players.filter(p => buyins.some(b => b.playerId === p.id));
  const [playerId, setPlayerId] = useState('');
  const [cash, setCash] = useState('');
  const [chips, setChips] = useState('');
  const [useChips, setUseChips] = useState(!!chipToCashRatio);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const computedCash = useChips && chipToCashRatio && chips ? (parseFloat(chips) * chipToCashRatio).toFixed(0) : null;
  const existing = playerId ? results.find(r => r.playerId === playerId) : null;

  async function handleSave() {
    if (!playerId) { setError('Select a player.'); return; }
    let finalCash: number; let finalChips: number | undefined;
    if (useChips && chipToCashRatio) {
      const c = parseFloat(chips);
      if (isNaN(c) || c < 0) { setError('Enter valid chip count.'); return; }
      finalChips = c; finalCash = c * chipToCashRatio;
    } else {
      const c = parseFloat(cash);
      if (isNaN(c) || c < 0) { setError('Enter valid amount.'); return; }
      finalCash = c;
    }
    setLoading(true); setError('');
    try {
      await setResult(sessionId, playerId, finalCash, finalChips);
      setCash(''); setChips(''); setPlayerId(''); onClose();
    } catch { setError('Could not save result.'); }
    finally { setLoading(false); }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Enter Result">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Select Player</p>
          <div className="flex flex-wrap gap-2">
            {playersWithBuyins.map(p => {
              const hasResult = results.some(r => r.playerId === p.id);
              return (
                <button key={p.id} onClick={() => setPlayerId(p.id)}
                  className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
                  style={{
                    backgroundColor: playerId === p.id ? '#dc2626' : '#f1f5f9',
                    color: playerId === p.id ? '#ffffff' : '#0f172a',
                    borderColor: playerId === p.id ? '#dc2626' : hasResult ? '#10b981' : '#e2e8f0',
                  }}>
                  {p.name}{hasResult ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {existing && (
          <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#10b981' }}>
            Current result: {formatILS(existing.finalCash)} — will be overwritten.
          </p>
        )}

        {chipToCashRatio && (
          <div className="flex gap-2">
            {['chips', 'cash'].map(mode => (
              <button key={mode} onClick={() => setUseChips(mode === 'chips')}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  backgroundColor: (mode === 'chips') === useChips ? '#dc2626' : '#f1f5f9',
                  color: (mode === 'chips') === useChips ? '#ffffff' : '#0f172a',
                  borderColor: (mode === 'chips') === useChips ? '#dc2626' : '#e2e8f0',
                }}>
                {mode === 'chips' ? 'Enter Chips' : 'Enter Cash'}
              </button>
            ))}
          </div>
        )}

        {useChips && chipToCashRatio ? (
          <div>
            <Input label="Final chip count" placeholder="e.g. 5000" value={chips} type="number" onChange={e => setChips(e.target.value)} />
            {computedCash && <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>= ₪{computedCash} (₪{chipToCashRatio}/chip)</p>}
          </div>
        ) : (
          <Input label="Final cash (₪)" placeholder="e.g. 450" value={cash} type="number"
            onChange={e => setCash(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
        )}

        {error && <p className="text-sm text-[#f87171]">{error}</p>}
        <Button onClick={handleSave} loading={loading} fullWidth>Save Result</Button>
      </div>
    </Modal>
  );
}
