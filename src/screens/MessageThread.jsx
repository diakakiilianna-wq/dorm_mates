import { useEffect, useState } from 'react';
import { IconChevronLeft, IconSend } from '../components/icons.jsx';
import { fetchThread, sendMessage } from '../lib/messages.js';

const POLL_INTERVAL_MS = 3000;

export default function MessageThread({ currentUserId, user, score, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await fetchThread(currentUserId, user.id);
        if (!cancelled) {
          setMessages(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [currentUserId, user.id]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      const saved = await sendMessage(currentUserId, user.id, text);
      setMessages(m => [...m, saved]);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
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
        {loading && <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Loading messages…</p>}
        {error && <p style={{ fontSize: 13, color: 'var(--color-danger-600, #c0392b)' }}>{error}</p>}
        {!loading && !error && messages.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>No messages yet — say hi!</p>
        )}
        {messages.map(m => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender_id === currentUserId ? 'flex-end' : 'flex-start', maxWidth: '75%',
              background: m.sender_id === currentUserId ? 'var(--color-accent)' : 'var(--color-surface)',
              color: m.sender_id === currentUserId ? 'var(--color-accent-100)' : 'var(--color-text)',
              padding: '10px 14px', fontSize: 14,
              borderRadius: m.sender_id === currentUserId ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            }}
          >
            {m.body}
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px 24px', borderTop: '1px solid var(--color-divider)' }}>
        <input
          className="input" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`Message ${user.name.split(' ')[0]}...`}
        />
        <button onClick={send} disabled={sending} style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--color-accent)', color: 'var(--color-accent-100)', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconSend size={17} />
        </button>
      </div>
    </div>
  );
}
