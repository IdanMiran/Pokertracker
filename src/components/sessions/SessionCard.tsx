import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Session, BuyIn } from '../../types';
import { Badge } from '../ui/Badge';
import { formatILS } from '../../constants/config';

interface Props { session: Session; buyins: BuyIn[]; }

export function SessionCard({ session, buyins }: Props) {
  const navigate = useNavigate();
  const totalPot = buyins.reduce((s, b) => s + b.amount, 0);
  const uniquePlayers = new Set(buyins.map(b => b.playerId)).size;

  return (
    <div onClick={() => navigate(`/session/${session.id}`)}
      className="rounded-xl p-4 border border-[#333] mb-3 cursor-pointer active:opacity-75 transition-opacity"
      style={{ backgroundColor: '#1a1a1a' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-lg" style={{ color: '#f5f5f5' }}>{session.name}</p>
          <p className="text-sm" style={{ color: '#888' }}>{format(session.date, 'dd MMM yyyy')}</p>
        </div>
        <Badge label={session.status === 'active' ? 'Active' : 'Completed'} type={session.status} />
      </div>
      <div className="flex gap-6">
        <div>
          <p className="text-xs" style={{ color: '#888' }}>Players</p>
          <p className="font-semibold" style={{ color: '#f5f5f5' }}>{uniquePlayers}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: '#888' }}>Total pot</p>
          <p className="font-semibold" style={{ color: '#dc2626' }}>{formatILS(totalPot)}</p>
        </div>
      </div>
    </div>
  );
}
