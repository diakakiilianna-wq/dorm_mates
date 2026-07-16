import { useState } from 'react';
import { rankMatches } from '../lib/scoring.js';
import MatchCard from '../components/MatchCard.jsx';
import { IconFilter } from '../components/icons.jsx';

export default function Browse({ currentUser, allUsers, favorites, onToggleFavorite, onOpen }) {
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(0);

  const ranked = rankMatches(currentUser, allUsers, { minScore });

  return (
    <div className="screen">
      <div className="screen-header" style={{ paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Browse</h1>
          <button
            onClick={() => setShowFilters(s => !s)}
            aria-label="Toggle filters"
            style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--color-surface)', color: 'var(--color-accent-700)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconFilter size={17} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Sorted by match to your quiz</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <span style={{ background: 'var(--color-accent)', color: 'var(--color-accent-100)', fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 999 }}>Best match</span>
          <button
            onClick={() => setShowFilters(s => !s)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-surface)', color: 'var(--color-neutral-700)', fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 999, border: 'none', cursor: 'pointer' }}
          >
            <IconFilter size={12} />
            Filters{minScore > 0 ? ` · ≥${minScore}%` : ''}
          </button>
        </div>
        {showFilters && (
          <div className="card" style={{ padding: 14, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Minimum match</span>
              <strong>{minScore}%</strong>
            </div>
            <input type="range" min="0" max="100" step="5" value={minScore} onChange={e => setMinScore(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
          </div>
        )}
      </div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ranked.length === 0 && <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>No matches yet — check back once more people have joined.</p>}
        {ranked.map((r, i) => (
          <div key={r.user.id} style={{ display: 'contents' }}>
            <MatchCard
              user={r.user}
              score={r.score}
              flags={r.flags}
              best={i === 0}
              isFavorite={favorites.includes(r.user.id)}
              onOpen={() => onOpen(r.user.id)}
              onToggleFavorite={() => onToggleFavorite(r.user.id)}
            />
            {i === 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, border: '1px dashed var(--color-divider)', color: 'var(--color-neutral-500)', fontSize: 11, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                Ad · Campus Bookstore
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
