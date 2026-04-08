import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Player } from '../../types';
import { addBuyIn } from '../../lib/firestore/buyins';

interface Props { visible: boolean; onClose: () => void; sessionId: string; players: Player[]; }

export function AddBuyInModal({ visible, onClose, sessionId, players }: Props) {
  const [playerId, setPlayerId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd() {
    if (!playerId) { setError('Select a player.'); return; }
    const n = parseFloat(amount);
    if (!amount || isNaN(n) || n <= 0) { setError('Enter a valid amount.'); return; }
    setLoading(true); setError('');
    try {
      await addBuyIn(sessionId, playerId, n);
      setAmount(''); setPlayerId(''); onClose();
    } catch { setError('Could not add buy-in.'); }
    finally { setLoading(false); }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Add Buy-In">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Select Player</p>
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <button key={p.id} onClick={() => setPlayerId(p.id)}
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
                style={{
                  backgroundColor: playerId === p.id ? '#dc2626' : '#f1f5f9',
                  color: playerId === p.id ? '#ffffff' : '#0f172a',
                  borderColor: playerId === p.id ? '#dc2626' : '#e2e8f0',
                }}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <Input label="Amount (₪)" placeholder="e.g. 100" value={amount} type="number"
          onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        {error && <p className="text-sm text-[#f87171]">{error}</p>}
        <Button onClick={handleAdd} loading={loading} fullWidth>Add Buy-In</Button>
      </div>
    </Modal>
  );
}
