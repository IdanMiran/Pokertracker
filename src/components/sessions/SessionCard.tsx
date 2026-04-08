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
      className="card-hover rounded-2xl p-4 mb-3 cursor-pointer"
      style={{
        backgroundColor: '#151829',
        border: '1px solid #232640',
        borderLeft: session.status === 'active' ? '3px solid #dc2626' : '3px solid #232640',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-[15px]" style={{ color: '#e2e8f0' }}>{session.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{format(session.date, 'dd MMM yyyy')}</p>
        </div>
        <Badge label={session.status === 'active' ? 'Active' : 'Completed'} type={session.status} />
      </div>
      <div className="flex gap-5">
        <div>
          <p className="text-xs" style={{ color: '#64748b' }}>Players</p>
          <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{uniquePlayers}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: '#64748b' }}>Total pot</p>
          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{formatILS(totalPot)}</p>
        </div>
      </div>
    </div>
  );
}
