import { IconChevronLeft, IconHeart } from '../components/icons.jsx';
import ContactRequestField from '../components/ContactRequestField.jsx';

const CLEAN_LABELS = ['Very messy', 'Relaxed', 'Middle ground', 'Fairly tidy', 'Very tidy'];
const SLEEP_LABELS = ['Night owl', 'Leans late', 'Flexible', 'Leans early', 'Early bird'];
const NOISE_LABELS = ['Needs quiet', 'Prefers quiet', 'Moderate', 'Tolerant', 'Very tolerant'];

function bandLabel(labels, score) {
  const idx = Math.min(labels.length - 1, Math.max(0, Math.round(score) - 1));
  return labels[idx];
}

export default function ListingDetail({ currentUserId, user, score, flags, isFavorite, onToggleFavorite, onBack }) {
  return (
    <div className="screen">
      <div style={{ position: 'relative', height: 260, background: 'linear-gradient(160deg,#ffe1d0,#ffc6a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 72, color: 'var(--color-accent-700)', opacity: 0.5 }}>{user.name[0]?.toUpperCase()}</span>
        <button onClick={onBack} style={{ position: 'absolute', top: 20, left: 16, width: 40, height: 40, borderRadius: 999, background: 'rgba(245,234,216,.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconChevronLeft size={19} />
        </button>
        <button
          onClick={onToggleFavorite}
          style={{ position: 'absolute', top: 20, right: 16, width: 40, height: 40, borderRadius: 999, background: 'var(--color-accent)', color: 'var(--color-accent-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <IconHeart size={19} filled={isFavorite} />
        </button>
      </div>
      <div className="screen-body" style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>{user.name}</h1>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: '4px 0 12px' }}>
          {user.gender === 'woman' ? 'Woman' : 'Man'}
          {user.pronouns ? ` · ${user.pronouns}` : ''}
          {user.yearMajor ? ` · ${user.yearMajor}` : ''}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="tag" style={{ background: 'var(--color-accent)', color: 'var(--color-accent-100)', fontWeight: 700 }}>{score}% match</span>
          {flags.map(f => <span key={f} className="tag tag-neutral">{f}</span>)}
        </div>

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '20px 0' }} />

        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Logistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', marginBottom: 20 }}>
          <div><div style={{ fontSize: 11, color: 'var(--color-neutral-600)', marginBottom: 3 }}>Cleanliness</div><div style={{ fontSize: 14, fontWeight: 600 }}>{bandLabel(CLEAN_LABELS, user.scores.clean)}</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--color-neutral-600)', marginBottom: 3 }}>Sleep schedule</div><div style={{ fontSize: 14, fontWeight: 600 }}>{bandLabel(SLEEP_LABELS, user.scores.sleep)}</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--color-neutral-600)', marginBottom: 3 }}>Noise tolerance</div><div style={{ fontSize: 14, fontWeight: 600 }}>{bandLabel(NOISE_LABELS, user.scores.noise)}</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--color-neutral-600)', marginBottom: 3 }}>Guest frequency</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>Not specified</div></div>
        </div>

        <h3 style={{ fontSize: 16, marginBottom: 10 }}>About</h3>
        <p style={{ fontSize: 14, lineHeight: 1.55 }}>{user.bio || <span style={{ color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>Not specified</span>}</p>

        {(user.instagram || user.snapchat) && (
          <>
            <div style={{ height: 1, background: 'var(--color-divider)', margin: '20px 0' }} />
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Social</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {user.instagram && <div style={{ fontSize: 14 }}>Instagram · <strong>{user.instagram}</strong></div>}
              {user.snapchat && <div style={{ fontSize: 14 }}>Snapchat · <strong>{user.snapchat}</strong></div>}
            </div>
          </>
        )}

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '20px 0' }} />
        <h3 style={{ fontSize: 16, marginBottom: 4 }}>Contact</h3>
        <div className="card" style={{ padding: '4px 14px' }}>
          <ContactRequestField currentUserId={currentUserId} ownerId={user.id} field="email" label="Email" />
          <ContactRequestField currentUserId={currentUserId} ownerId={user.id} field="phone" label="Phone number" />
        </div>
      </div>
    </div>
  );
}
