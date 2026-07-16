import VennScore from './VennScore.jsx';
import { IconHeart } from './icons.jsx';

const GRADIENTS = [
  'linear-gradient(160deg,#ffe1d0,#ffc6a5)',
  'linear-gradient(160deg,#e1eecc,#ccdbb2)',
];

function initials(name) {
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function MatchCard({ user, score, flags, onOpen, onToggleFavorite, isFavorite, best }) {
  const gradient = GRADIENTS[user.id.charCodeAt(0) % GRADIENTS.length];
  return (
    <div className="card" style={{ padding: 14, position: 'relative' }} onClick={onOpen}>
      {best && (
        <span style={{
          position: 'absolute', top: -9, left: 14, background: 'var(--color-accent)', color: 'var(--color-accent-100)',
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10,
        }}>Best match</span>
      )}
      <div style={{ position: 'relative', height: 168, borderRadius: 22, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 46, color: 'var(--color-accent-700)', opacity: 0.55 }}>{initials(user.name)}</span>
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--color-accent)', color: 'var(--color-accent-100)', fontFamily: 'var(--font-heading)', fontSize: 13, padding: '5px 12px', borderRadius: 999 }}>
          {score}% match
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite?.(); }}
          style={{
            position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 999,
            background: 'rgba(245,234,216,.85)', border: 'none', cursor: 'pointer',
            color: isFavorite ? 'var(--color-accent)' : 'var(--color-neutral-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          <IconHeart size={18} filled={isFavorite} />
        </button>
      </div>
      <div style={{ padding: '12px 4px 2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{user.name}</span>
          <VennScore score={score} />
        </div>
        {flags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {flags.map(f => <span key={f} className="tag" style={{ background: 'var(--color-neutral-800)', color: 'var(--color-neutral-100)' }}>{f}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
