import { useEffect, useState } from 'react';
import { IconEdit, IconLogOut } from '../components/icons.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { updateOwnPhone } from '../lib/contactRequests.js';

export default function Settings({ currentUser, onSignOut, onRetake }) {
  const [phone, setPhone] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase.from('profiles').select('phone').eq('id', currentUser.id).single().then(({ data, error: fetchError }) => {
      if (cancelled || fetchError) return;
      setPhone(data?.phone || '');
      setSavedPhone(data?.phone || '');
    });
    return () => { cancelled = true; };
  }, [currentUser.id]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const trimmed = phone.trim();
      await updateOwnPhone(currentUser.id, trimmed || null);
      setSavedPhone(trimmed);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 style={{ fontSize: 26 }}>Profile & settings</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Signed in as <strong>{currentUser.name}</strong></p>
      </div>
      <div className="screen-body">
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Class sync</h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginBottom: 12 }}>
          Profiles sync automatically so everyone in class sees the same roster.
        </p>

        <h3 style={{ fontSize: 15, margin: '24px 0 10px' }}>Contact info</h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginBottom: 12 }}>
          Your email is shown to others in masked form (e.g. j***@***.edu). Your real email and phone number are only
          revealed to someone if you approve their request — from the Messages tab.
        </p>
        <div className="field">
          <label>Phone number (optional)</label>
          <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" />
        </div>
        {error && <p style={{ fontSize: 13, color: 'var(--color-danger-600, #c0392b)' }}>{error}</p>}
        <button className="btn btn-secondary" disabled={saving || phone.trim() === savedPhone} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save phone number'}
        </button>

        <h3 style={{ fontSize: 15, margin: '24px 0 10px' }}>Your profile</h3>
        <button className="btn btn-secondary" style={{ gap: 8 }} onClick={onRetake}>
          <IconEdit size={16} />
          Edit profile / retake quiz
        </button>
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" style={{ gap: 8 }} onClick={onSignOut}>
          <IconLogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
