import { IconEdit, IconLogOut } from '../components/icons.jsx';

export default function Settings({ currentUser, onSignOut, onRetake }) {
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
