import { useEffect, useState } from 'react';
import {
  fetchRequestStatus, getContactValue, getMaskedContact, hasContactValue, requestContact,
} from '../lib/contactRequests.js';

const POLL_INTERVAL_MS = 5000;

// One row for requesting (and, once approved, seeing) another user's email
// or phone number. Masking and the approve/deny gate are both enforced by
// Postgres functions — this component never has the real value unless the
// server hands it over.
export default function ContactRequestField({ currentUserId, ownerId, field, label }) {
  const [applicable, setApplicable] = useState(field === 'email'); // phone: unknown until checked
  const [status, setStatus] = useState('none'); // none | pending | approved | declined
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        if (field === 'phone') {
          const has = await hasContactValue(ownerId, field);
          if (cancelled) return;
          setApplicable(has);
          if (!has) { setLoading(false); return; }
        }

        const request = await fetchRequestStatus(currentUserId, ownerId, field);
        if (cancelled) return;
        const nextStatus = request?.status || 'none';
        setStatus(nextStatus);

        if (nextStatus === 'approved') {
          const real = await getContactValue(ownerId, field);
          if (!cancelled) setValue(real);
        } else {
          const masked = await getMaskedContact(ownerId, field);
          if (!cancelled) setValue(masked);
        }
        if (!cancelled) setError(null);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [currentUserId, ownerId, field]);

  async function handleRequest() {
    setRequesting(true);
    setError(null);
    try {
      await requestContact(currentUserId, ownerId, field);
      setStatus('pending');
    } catch (e) {
      setError(e.message.includes('duplicate') ? 'You already requested this.' : e.message);
    } finally {
      setRequesting(false);
    }
  }

  if (!applicable || loading) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--color-neutral-600)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{value ?? '—'}</div>
        {error && <div style={{ fontSize: 11, color: 'var(--color-danger-600, #c0392b)', marginTop: 2 }}>{error}</div>}
      </div>
      {status !== 'approved' && (
        <button
          className="btn btn-secondary"
          style={{ width: 'auto', flexShrink: 0, fontSize: 12, padding: '7px 14px' }}
          disabled={status === 'pending' || requesting}
          onClick={handleRequest}
        >
          {status === 'pending' ? 'Requested' : `Request ${label.toLowerCase()}`}
        </button>
      )}
    </div>
  );
}
