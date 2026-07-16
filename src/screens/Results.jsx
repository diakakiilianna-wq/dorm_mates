import { AXES } from '../lib/quizData.js';
import { rankMatches } from '../lib/scoring.js';
import TraitBar from '../components/TraitBar.jsx';
import VennScore from '../components/VennScore.jsx';

export default function Results({ draftUser, allUsers, onSave, onRetake }) {
  const ranked = rankMatches(draftUser, allUsers, { limit: 5 });

  return (
    <div className="screen">
      <div className="screen-body" style={{ paddingTop: 28 }}>
        <h1 style={{ fontSize: 26 }}>Your results, {draftUser.name}</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Here's how you scored, and who you're most compatible with.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, margin: '18px 0 22px' }}>
          {AXES.map(a => (
            <TraitBar
              key={a.key}
              label={a.label}
              pct={(draftUser.scores[a.key] / 5) * 100}
              accent={['clean', 'sleep', 'noise'].includes(a.key) ? 'accent' : 'accent-2'}
            />
          ))}
        </div>

        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Your matches</h3>
        {ranked.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>No other profiles yet — check back once more people have joined.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ranked.map((r, i) => (
            <div key={r.user.id} className="card" style={{ padding: 13, position: 'relative' }}>
              {i === 0 && (
                <span style={{ position: 'absolute', top: -9, left: 14, background: 'var(--color-accent)', color: 'var(--color-accent-100)', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>Best match</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: i === 0 ? 4 : 0 }}>
                <VennScore score={r.score} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>{r.user.name}</div>
                  {r.flags.length > 0 && <div style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{r.flags[0]}</div>}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--color-accent-700)' }}>{r.score}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" onClick={onRetake}>Retake quiz</button>
        <button className="btn btn-primary" onClick={onSave}>Save profile</button>
      </div>
    </div>
  );
}
