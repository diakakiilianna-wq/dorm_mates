import { useEffect, useState } from 'react';
import { fetchConversations } from '../lib/messages.js';
import { IconChat } from '../components/icons.jsx';

const POLL_INTERVAL_MS = 5000;

export default function Messages({ currentUser, allUsers, onOpen }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await fetchConversations(currentUser.id);
        if (!cancelled) { setConversations(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [currentUser.id]);

  const threads = conversations
    .map(c => ({ ...c, user: allUsers.find(u => u.id === c.otherId) }))
    .filter(t => t.user);

  function handleOpen(otherId) {
    // Optimistic: hide the dot immediately rather than waiting on the next
    // poll — MessageThread itself calls markThreadRead on the server.
    setConversations(list => list.map(c => (
      c.otherId === otherId ? { ...c, lastMessage: { ...c.lastMessage, read: true } } : c
    )));
    onOpen(otherId);
  }

  return (
    <div className="screen">
      <div className="screen-header"><h1 style={{ fontSize: 28 }}>Messages</h1></div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Loading…</p>}
        {error && <p style={{ fontSize: 13, color: 'var(--color-danger-600, #c0392b)' }}>{error}</p>}
        {!loading && !error && threads.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 20px', textAlign: 'center' }}>
            <IconChat size={40} style={{ color: 'var(--color-neutral-400)' }} />
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>Start a conversation from a favorited profile — messages open here once you do.</p>
          </div>
        )}
        {threads.map(t => {
          const unread = t.lastMessage.recipient_id === currentUser.id && !t.lastMessage.read;
          return (
            <button
              key={t.otherId}
              className="card"
              style={{ padding: 12, textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
              onClick={() => handleOpen(t.otherId)}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: 'linear-gradient(160deg,#ffe1d0,#ffc6a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-accent-700)' }}>
                  {t.user.name[0]?.toUpperCase()}
                </div>
                {unread && <span className="tab-badge-dot" style={{ top: 0, right: 0 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: unread ? 700 : 400 }}>{t.user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.lastMessage.sender_id === currentUser.id ? 'You: ' : ''}{t.lastMessage.body}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
