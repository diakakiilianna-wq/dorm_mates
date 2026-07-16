import { useState } from 'react';
import { getConfig, setConfig, isGithubConfigured, REPO } from '../lib/dataStore.js';
import { IconAlertTriangle, IconEdit, IconLogOut } from '../components/icons.jsx';

export default function Settings({ currentUser, onSignOut, onRetake }) {
  const [config, setLocalConfig] = useState(getConfig());
  const [saved, setSaved] = useState(false);

  function save() {
    setConfig(config);
    setSaved(true);
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
          {isGithubConfigured(config)
            ? <>Connected — profiles sync to <strong>{REPO.owner}/{REPO.repo}</strong> so everyone in class sees the same roster.</>
            : <>Not connected yet — ask whoever set up the class for the access token below. Until then, your profile only saves to this browser.</>}
        </p>

        <div className="warning-banner" style={{ display: 'flex', gap: 10 }}>
          <IconAlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Heads up:</strong> the access token below is stored in this browser's localStorage and is visible to anyone with access to
            this device (e.g. via dev tools). There's no password/account security in this app — only use the token your class was given, and
            never a personal token with broader access than this one repo.
          </div>
        </div>
        <div className="field">
          <label>Access token</label>
          <input
            className="input" type="password" value={config.token}
            onChange={e => { setLocalConfig({ ...config, token: e.target.value }); setSaved(false); }}
            placeholder="github_pat_..."
          />
        </div>

        <button className="btn btn-primary" onClick={save}>Save</button>
        {saved && <p style={{ fontSize: 12, color: 'var(--color-accent-2-700)', marginTop: 8 }}>Saved.</p>}

        <h3 style={{ fontSize: 15, margin: '24px 0 10px' }}>Your profile</h3>
        <button className="btn btn-secondary" style={{ gap: 8 }} onClick={onRetake}>
          <IconEdit size={16} />
          Edit profile / retake quiz
        </button>
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" style={{ gap: 8 }} onClick={onSignOut}>
          <IconLogOut size={16} />
          Different person's turn
        </button>
      </div>
    </div>
  );
}
