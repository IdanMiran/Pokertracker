import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { createSession } from '../lib/firestore/sessions';
import { format } from 'date-fns';

export function NewSession() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [useChipRatio, setUseChipRatio] = useState(false);
  const [chipRatio, setChipRatio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) { setError('Enter a session name.'); return; }
    if (useChipRatio) {
      const r = parseFloat(chipRatio);
      if (isNaN(r) || r <= 0) { setError('Enter a valid chip ratio (e.g. 0.5).'); return; }
    }
    setLoading(true); setError('');
    try {
      const id = await createSession({
        name: name.trim(),
        date: new Date(),
        chipToCashRatio: useChipRatio ? parseFloat(chipRatio) : undefined,
      });
      navigate(`/session/${id}`, { replace: true });
    } catch { setError('Could not create session.'); setLoading(false); }
  }

  return (
    <div className="p-4 flex flex-col gap-5 max-w-lg mx-auto">
      <Input label="Session Name" placeholder={`Friday Night – ${format(new Date(), 'dd MMM')}`}
        value={name} onChange={e => setName(e.target.value)} autoFocus />

      <div className="rounded-xl p-4 border border-[#333]" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold" style={{ color: '#f5f5f5' }}>Use chip count</p>
            <p className="text-sm" style={{ color: '#888' }}>Enter chip-to-₪ conversion ratio</p>
          </div>
          <button onClick={() => setUseChipRatio(!useChipRatio)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{ backgroundColor: useChipRatio ? '#dc2626' : '#333' }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow"
              style={{ left: useChipRatio ? '26px' : '2px' }} />
          </button>
        </div>
        {useChipRatio && (
          <Input label="₪ per chip (e.g. 0.5)" placeholder="0.5" value={chipRatio} type="number"
            onChange={e => setChipRatio(e.target.value)} />
        )}
      </div>

      {error && <p className="text-sm text-[#e05252]">{error}</p>}
      <Button onClick={handleCreate} loading={loading} fullWidth>Create Session</Button>
    </div>
  );
}
