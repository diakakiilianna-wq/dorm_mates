import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = password.length >= 6 && password === confirm && !busy;

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    onDone();
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="kicker">RoomieFit</div>
        <h1 style={{ fontSize: 28 }}>Set a new password</h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-600)' }}>Choose a new password for your account.</p>
      </div>
      <div className="screen-body">
        <div className="field">
          <label>New password</label>
          <input
            className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters" autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label>Confirm password</label>
          <input
            className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Retype your new password" autoComplete="new-password"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        {confirm && password !== confirm && (
          <p style={{ fontSize: 13, color: 'var(--color-danger-600, #c0392b)' }}>Passwords don't match.</p>
        )}
        {error && <p style={{ fontSize: 13, color: 'var(--color-danger-600, #c0392b)' }}>{error}</p>}
      </div>
      <div className="screen-footer">
        <button className="btn btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
          {busy ? 'Saving…' : 'Save new password'}
        </button>
      </div>
    </div>
  );
}
