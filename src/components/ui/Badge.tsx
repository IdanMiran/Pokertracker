interface BadgeProps { label: string; type: 'active' | 'completed'; }

export function Badge({ label, type }: BadgeProps) {
  const color = type === 'active' ? '#4caf82' : '#888';
  const bg = type === 'active' ? '#2a1515' : '#222';
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border" style={{ color, backgroundColor: bg, borderColor: color }}>
      {label}
    </span>
  );
}
