import { useState } from 'react';

export default function NameGate({ users, onRegister, onLogin }) {
  const [name, setName] = useState('');
  const [matches, setMatches] = useState(null); // null = not searched yet, [] handled inline

  function handleContinue() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const found = users.filter(u => u.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (found.length === 0) {
      onRegister(trimmed);
    } else if (found.length === 1) {
      onLogin(found[0]);
    } else {
      setMatches(found);
    }
  }

  if (matches) {
    return (
      <div className="screen">
        <div className="screen-header">
          <div className="kicker">Multiple profiles found</div>
          <h1 style={{ fontSize: 24 }}>Which one is you?</h1>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
            More than one profile uses the name "{name.trim()}" — pick yours below.
          </p>
        </div>
        <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {matches.map(u => (
            <button key={u.id} className="card" style={{ padding: 14, textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => onLogin(u)}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--color-accent-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', color: 'var(--color-accent-700)' }}>
                {u.name[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{u.gender === 'woman' ? 'Woman' : 'Man'}{u.bio ? ` · ${u.bio.slice(0, 40)}${u.bio.length > 40 ? '…' : ''}` : ''}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="screen-footer">
          <button className="btn btn-secondary" onClick={() => setMatches(null)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="kicker">RoomieFit</div>
        <h1 style={{ fontSize: 30 }}>Find your roommate</h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-600)' }}>Enter your name to start a new profile, or find your existing one.</p>
      </div>
      <div className="screen-body">
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maya Chen" onKeyDown={e => e.key === 'Enter' && handleContinue()} />
        </div>
      </div>
      <div className="screen-footer">
        <button className="btn btn-primary" disabled={!name.trim()} onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
}
