import { matchProfiles } from '../lib/scoring.js';
import { IconHeart, IconChat } from '../components/icons.jsx';

export default function Favorites({ currentUser, allUsers, favorites, onToggleFavorite, onMessage }) {
  const favoriteUsers = favorites
    .map(id => allUsers.find(u => u.id === id))
    .filter(Boolean)
    .map(u => ({ user: u, ...matchProfiles(currentUser, u) }));

  return (
    <div className="screen">
      <div className="screen-header" style={{ paddingBottom: 6 }}>
        <h1 style={{ fontSize: 28 }}>Favorites</h1>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{favoriteUsers.length} saved profile{favoriteUsers.length === 1 ? '' : 's'} · ranked by match</div>
      </div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {favoriteUsers.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 20px', textAlign: 'center' }}>
            <IconHeart size={40} style={{ color: 'var(--color-neutral-400)' }} />
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>No favorites yet — go to Browse and tap the heart on a profile you like.</p>
          </div>
        )}
        {favoriteUsers.sort((a, b) => b.score - a.score).map(r => (
          <div key={r.user.id} className="card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, flexShrink: 0, background: 'linear-gradient(160deg,#ffe1d0,#ffc6a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--color-accent-700)' }}>
              {r.user.name[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{r.user.name}</div>
                <span className="tag" style={{ background: 'var(--color-accent)', color: 'var(--color-accent-100)', fontWeight: 700 }}>{r.score}%</span>
              </div>
              <div style={{ display: 'flex', gap: 8, margin: '2px 0 8px' }}>
                <button onClick={() => onToggleFavorite(r.user.id)} style={{ fontSize: 11, color: 'var(--color-neutral-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>
              </div>
              <button
                onClick={() => onMessage(r.user.id)}
                className="btn btn-primary"
                style={{ width: 'auto', display: 'inline-flex', gap: 6, fontSize: 12, padding: '7px 14px' }}
              >
                <IconChat size={13} />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
