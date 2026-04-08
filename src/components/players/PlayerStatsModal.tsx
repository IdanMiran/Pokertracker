import { Modal } from '../ui/Modal';
import type { PlayerStats } from '../../types';
import { formatILS } from '../../constants/config';

interface Props { visible: boolean; onClose: () => void; stats: PlayerStats | null; }

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[#333]">
      <span style={{ color: '#888' }}>{label}</span>
      <span className="font-semibold" style={{ color: color ?? '#f5f5f5' }}>{value}</span>
    </div>
  );
}

export function PlayerStatsModal({ visible, onClose, stats }: Props) {
  if (!stats) return null;
  const netColor = stats.totalNet > 0 ? '#4caf82' : stats.totalNet < 0 ? '#e05252' : '#888';
  const sign = stats.totalNet > 0 ? '+' : stats.totalNet < 0 ? '-' : '';
  const roi = stats.totalInvested > 0 ? ((stats.totalNet / stats.totalInvested) * 100).toFixed(0) : '0';

  return (
    <Modal visible={visible} onClose={onClose} title={stats.playerName}>
      <div className="rounded-xl p-5 text-center mb-5 border border-[#333]" style={{ backgroundColor: '#2a1515' }}>
        <p className="text-sm mb-1" style={{ color: '#888' }}>Total Net</p>
        <p className="text-4xl font-bold" style={{ color: netColor }}>{sign}{formatILS(Math.abs(stats.totalNet))}</p>
      </div>
      <Row label="Sessions Played" value={String(stats.totalSessions)} />
      <Row label="Total Invested" value={formatILS(stats.totalInvested)} />
      <Row label="Total Cashed Out" value={formatILS(stats.totalCashedOut)} />
      <Row label="ROI" value={`${sign}${roi}%`} color={netColor} />
      <Row label="Biggest Win" value={stats.biggestWin > 0 ? `+${formatILS(stats.biggestWin)}` : formatILS(0)} color="#4caf82" />
      <Row label="Biggest Loss" value={stats.biggestLoss < 0 ? `-${formatILS(Math.abs(stats.biggestLoss))}` : formatILS(0)} color="#e05252" />
    </Modal>
  );
}
