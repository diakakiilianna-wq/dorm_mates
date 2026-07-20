import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && password.length >= 6 && !busy;

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (signUpError) return setError(signUpError.message);
      if (!data.session) {
        setNotice('Check your email to confirm your account, then log in.');
        setMode('login');
      }
      // If email confirmation is off, data.session is set and the
      // onAuthStateChange listener in App.jsx picks it up automatically.
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (signInError) return setError(signInError.message);
    }
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="kicker">RoomieFit</div>
        <h1 style={{ fontSize: 30 }}>{mode === 'login' ? 'Log in' : 'Create your account'}</h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-600)' }}>
          {mode === 'login' ? 'Welcome back — enter your email and password.' : 'Sign up with an email and password to get started.'}
        </p>
      </div>
      <div className="screen-body">
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@school.edu"
            autoComplete="email"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        {error && <p style={{ fontSize: 13, color: 'var(--color-danger-600, #c0392b)' }}>{error}</p>}
        {notice && <p style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{notice}</p>}
      </div>
      <div className="screen-footer" style={{ flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setNotice(null); }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
