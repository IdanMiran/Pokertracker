interface BadgeProps { label: string; type: 'active' | 'completed'; }

export function Badge({ label, type }: BadgeProps) {
  const color = type === 'active' ? '#10b981' : '#64748b';
  const bg = type === 'active' ? '#f0fdf4' : '#ffffff';
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border" style={{ color, backgroundColor: bg, borderColor: color }}>
      {label}
    </span>
  );
}
