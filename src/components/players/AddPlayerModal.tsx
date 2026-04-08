import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { addPlayer } from '../../lib/firestore/players';

interface Props { visible: boolean; onClose: () => void; }

export function AddPlayerModal({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd() {
    if (!name.trim()) { setError('Please enter a name.'); return; }
    setLoading(true); setError('');
    try {
      await addPlayer(name.trim());
      setName(''); onClose();
    } catch { setError('Could not add player. Check your connection.'); }
    finally { setLoading(false); }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Add Player">
      <div className="flex flex-col gap-4">
        <Input label="Player name" placeholder="e.g. Idan" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
        {error && <p className="text-sm text-[#e05252]">{error}</p>}
        <Button onClick={handleAdd} loading={loading} fullWidth>Add Player</Button>
      </div>
    </Modal>
  );
}
