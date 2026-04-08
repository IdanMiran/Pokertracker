interface EmptyStateProps { icon?: string; title: string; subtitle?: string; }

export function EmptyState({ icon = '🃏', title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 gap-3 text-center px-6">
      <span className="text-5xl">{icon}</span>
      <p className="text-lg font-semibold" style={{ color: '#0f172a' }}>{title}</p>
      {subtitle && <p className="text-sm" style={{ color: '#64748b' }}>{subtitle}</p>}
    </div>
  );
}
