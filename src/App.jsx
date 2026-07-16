import { useEffect, useState } from 'react';
import { newId } from './lib/id.js';
import { computeAxisScores, matchProfiles } from './lib/scoring.js';
import { loadUsers, upsertUser } from './lib/dataStore.js';

import NameGate from './screens/NameGate.jsx';
import AboutYou from './screens/AboutYou.jsx';
import Motivation from './screens/Motivation.jsx';
import Weights from './screens/Weights.jsx';
import Quiz from './screens/Quiz.jsx';
import Results from './screens/Results.jsx';
import Browse from './screens/Browse.jsx';
import ListingDetail from './screens/ListingDetail.jsx';
import Favorites from './screens/Favorites.jsx';
import MessageThread from './screens/MessageThread.jsx';
import Settings from './screens/Settings.jsx';
import TabBar from './components/TabBar.jsx';
import { IconChat } from './components/icons.jsx';

const emptyDraft = () => ({ id: null, name: '', gender: 'woman', bio: '', weights: null, quizAnswers: null });

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [phase, setPhase] = useState('nameGate'); // nameGate | onboarding | app
  const [onboardingStep, setOnboardingStep] = useState('aboutYou'); // aboutYou | motivation | weights | quiz | results
  const [draft, setDraft] = useState(emptyDraft());

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [overlay, setOverlay] = useState(null); // null | listingDetail | messageThread
  const [viewingUserId, setViewingUserId] = useState(null);

  useEffect(() => {
    loadUsers()
      .then(u => setUsers(u))
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function refreshCurrentUserInList(user) {
    setUsers(list => {
      const idx = list.findIndex(u => u.id === user.id);
      if (idx === -1) return [...list, user];
      const next = list.slice();
      next[idx] = user;
      return next;
    });
  }

  function persist(user) {
    refreshCurrentUserInList(user);
    upsertUser(user).catch(e => console.error('Failed to save profile:', e));
  }

  function startRegister(name) {
    setDraft({ ...emptyDraft(), id: newId(), name });
    setOnboardingStep('aboutYou');
    setPhase('onboarding');
  }

  function startEdit(user) {
    setDraft({ ...user });
    setOnboardingStep('aboutYou');
    setPhase('onboarding');
  }

  function handleLogin(user) {
    setCurrentUser(user);
    setActiveTab('browse');
    setPhase('app');
  }

  function toggleFavorite(userId) {
    if (!currentUser) return;
    const has = currentUser.favorites.includes(userId);
    const next = { ...currentUser, favorites: has ? currentUser.favorites.filter(id => id !== userId) : [...currentUser.favorites, userId] };
    setCurrentUser(next);
    persist(next);
  }

  if (loading) {
    return <div className="app-shell"><div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}><p>Loading…</p></div></div>;
  }

  if (loadError) {
    return (
      <div className="app-shell">
        <div className="screen" style={{ padding: 22 }}>
          <h2>Couldn't load profiles</h2>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{loadError}</p>
          <p style={{ fontSize: 13 }}>Try refreshing the page in a moment.</p>
        </div>
      </div>
    );
  }

  if (phase === 'nameGate') {
    return (
      <div className="app-shell">
        <NameGate users={users} onRegister={startRegister} onLogin={handleLogin} />
      </div>
    );
  }

  if (phase === 'onboarding') {
    return (
      <div className="app-shell">
        {onboardingStep === 'aboutYou' && (
          <AboutYou
            initialName={draft.name}
            onBack={() => setPhase(currentUser ? 'app' : 'nameGate')}
            onNext={data => { setDraft(d => ({ ...d, ...data })); setOnboardingStep('motivation'); }}
          />
        )}
        {onboardingStep === 'motivation' && (
          <Motivation onNext={() => setOnboardingStep('weights')} />
        )}
        {onboardingStep === 'weights' && (
          <Weights
            onBack={() => setOnboardingStep('motivation')}
            onNext={weights => { setDraft(d => ({ ...d, weights })); setOnboardingStep('quiz'); }}
          />
        )}
        {onboardingStep === 'quiz' && (
          <Quiz
            onBack={() => setOnboardingStep('weights')}
            onNext={answers => {
              const scores = computeAxisScores(answers);
              setDraft(d => ({ ...d, quizAnswers: answers, scores, favorites: d.favorites || [], takenAt: new Date().toISOString() }));
              setOnboardingStep('results');
            }}
          />
        )}
        {onboardingStep === 'results' && (
          <Results
            draftUser={draft}
            allUsers={users}
            onRetake={() => setOnboardingStep('weights')}
            onSave={() => {
              const saved = { ...draft, favorites: draft.favorites || [] };
              setCurrentUser(saved);
              persist(saved);
              setActiveTab('browse');
              setPhase('app');
            }}
          />
        )}
      </div>
    );
  }

  // phase === 'app'
  const viewingUser = viewingUserId ? users.find(u => u.id === viewingUserId) : null;
  const viewingMatch = viewingUser && currentUser ? matchProfiles(currentUser, viewingUser) : null;

  return (
    <div className="app-shell">
      {overlay === 'listingDetail' && viewingUser && (
        <ListingDetail
          user={viewingUser}
          score={viewingMatch.score}
          flags={viewingMatch.flags}
          isFavorite={currentUser.favorites.includes(viewingUser.id)}
          onToggleFavorite={() => toggleFavorite(viewingUser.id)}
          onBack={() => setOverlay(null)}
        />
      )}
      {overlay === 'messageThread' && viewingUser && (
        <MessageThread user={viewingUser} score={viewingMatch.score} onBack={() => setOverlay(null)} />
      )}
      {!overlay && activeTab === 'browse' && (
        <Browse
          currentUser={currentUser}
          allUsers={users}
          favorites={currentUser.favorites}
          onToggleFavorite={toggleFavorite}
          onOpen={id => { setViewingUserId(id); setOverlay('listingDetail'); }}
        />
      )}
      {!overlay && activeTab === 'favorites' && (
        <Favorites
          currentUser={currentUser}
          allUsers={users}
          favorites={currentUser.favorites}
          onToggleFavorite={toggleFavorite}
          onMessage={id => { setViewingUserId(id); setOverlay('messageThread'); }}
        />
      )}
      {!overlay && activeTab === 'messages' && (
        <div className="screen">
          <div className="screen-header"><h1 style={{ fontSize: 28 }}>Messages</h1></div>
          <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 20px', textAlign: 'center' }}>
            <IconChat size={40} style={{ color: 'var(--color-neutral-400)' }} />
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>Start a conversation from a favorited profile — messages open here once you do.</p>
          </div>
        </div>
      )}
      {!overlay && activeTab === 'profile' && (
        <Settings currentUser={currentUser} onSignOut={() => { setCurrentUser(null); setPhase('nameGate'); }} onRetake={() => startEdit(currentUser)} />
      )}
      {!overlay && <TabBar active={activeTab} onChange={setActiveTab} />}
    </div>
  );
}
