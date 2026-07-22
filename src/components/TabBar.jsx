import { IconCompass, IconHeart, IconChat, IconUser } from './icons.jsx';

const TABS = [
  { key: 'browse', label: 'Browse', Icon: IconCompass },
  { key: 'favorites', label: 'Favorites', Icon: IconHeart },
  { key: 'messages', label: 'Messages', Icon: IconChat },
  { key: 'profile', label: 'Profile', Icon: IconUser },
];

export default function TabBar({ active, onChange, unread }) {
  return (
    <nav className="tab-bar">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`tab-btn${active === t.key ? ' active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <t.Icon size={21} filled={t.key === 'favorites' && active === t.key} />
            {t.key === 'messages' && unread && <span className="tab-badge-dot" />}
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
