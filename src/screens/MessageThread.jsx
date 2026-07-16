import { useState } from 'react';
import { IconChevronLeft, IconSend } from '../components/icons.jsx';

const SEED_MESSAGES = [
  { from: 'them', text: 'Hi! Saw your profile — are you still looking for a place for next semester?' },
  { from: 'me', text: 'Yes! Still looking. Are you tidy? That’s my biggest thing haha' },
  { from: 'them', text: 'Extremely — my roommates call me the neat freak 😄' },
];

// Fully mocked for this build: messages are seeded in-memory only and never
// persisted (no messages.json write), per the confirmed v1 scope.
export default function MessageThread({ user, score, onBack }) {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState('');

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages(m => [...m, { from: 'me', text }]);
    setDraft('');
  }

  return (
    <div className="screen">
      <div style={{ flexShrink: 0, padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--color-divider)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 0 }}>
          <IconChevronLeft size={19} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(160deg,#ffe1d0,#ffc6a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-accent-700)' }}>
          {user.name[0]?.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{user.name}</div>
      </div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14 }}>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-700)' }}>{user.name}'s profile · {score}% match</span>
          </div>
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '75%',
              background: m.from === 'me' ? 'var(--color-accent)' : 'var(--color-surface)',
              color: m.from === 'me' ? 'var(--color-accent-100)' : 'var(--color-text)',
              padding: '10px 14px', fontSize: 14,
              borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            }}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px 24px', borderTop: '1px solid var(--color-divider)' }}>
        <input
          className="input" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`Message ${user.name.split(' ')[0]}...`}
        />
        <button onClick={send} style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--color-accent)', color: 'var(--color-accent-100)', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconSend size={17} />
        </button>
      </div>
    </div>
  );
}
