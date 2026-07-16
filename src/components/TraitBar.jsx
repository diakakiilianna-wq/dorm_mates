export default function TraitBar({ label, pct, accent = 'accent' }) {
  const color = accent === 'accent-2' ? 'var(--color-accent-2)' : 'var(--color-accent)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 88, fontSize: 12, color: 'var(--color-neutral-600)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 9, borderRadius: 999, background: 'var(--color-surface)' }}>
        <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}
