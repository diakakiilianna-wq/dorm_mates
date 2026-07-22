import { useEffect, useRef, useState } from 'react';
import { computeAxisScores, matchProfiles } from './lib/scoring.js';
import { loadUsers, upsertUser } from './lib/dataStore.js';
import { fetchConversations } from './lib/messages.js';
import { fetchContactRequests } from './lib/contactRequests.js';
import { blockUser, fetchBlockedUserIds } from './lib/blocks.js';
import { reportUser } from './lib/reports.js';
import { supabase } from './lib/supabaseClient.js';

import Auth from './screens/Auth.jsx';
import ResetPassword from './screens/ResetPassword.jsx';
import AboutYou from './screens/AboutYou.jsx';
import Motivation from './screens/Motivation.jsx';
import Weights from './screens/Weights.jsx';
import Quiz from './screens/Quiz.jsx';
import Results from './screens/Results.jsx';
import Browse from './screens/Browse.jsx';
import ListingDetail from './screens/ListingDetail.jsx';
import Favorites from './screens/Favorites.jsx';
import MessageThread from './screens/MessageThread.jsx';
import Messages from './screens/Messages.jsx';
import EditProfile from './screens/EditProfile.jsx';
import Settings from './screens/Settings.jsx';
import TabBar from './components/TabBar.jsx';

const emptyDraft = () => ({
  id: null, name: '', email: '', gender: 'woman', bio: '',
  pronouns: '', yearMajor: '', hometown: '', instagram: '', snapchat: '',
  weights: null, quizAnswers: null,
});

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const [blockedUserIds, setBlockedUserIds] = useState(new Set());

  const [phase, setPhase] = useState('loading'); // loading | onboarding | app
  const [onboardingStep, setOnboardingStep] = useState('aboutYou'); // aboutYou | motivation | weights | quiz | results
  const [draft, setDraft] = useState(emptyDraft());

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [overlay, setOverlay] = useState(null); // null | listingDetail | messageThread
  const [viewingUserId, setViewingUserId] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const seenMessageIds = useRef(new Set());
  const seenRequestStatus = useRef(new Map());
  const isFirstConversationsPoll = useRef(true);
  const toastTimer = useRef(null);

  useEffect(() => {
    loadUsers()
      .then(u => setUsers(u))
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (!nextSession) {
        setCurrentUser(null);
        setPhase('loading');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchBlockedUserIds(currentUser.id).then(setBlockedUserIds).catch(e => console.error('Failed to load blocked users:', e));
  }, [currentUser]);

  // Once we have a session and the roster is loaded, route to an existing
  // profile or straight into onboarding for a brand-new account.
  useEffect(() => {
    if (!authChecked || loading || !session || currentUser) return;
    const existing = users.find(u => u.id === session.user.id);
    if (existing) {
      setCurrentUser(existing);
      setActiveTab('browse');
      setPhase('app');
    } else {
      setDraft({ ...emptyDraft(), id: session.user.id, email: session.user.email || '' });
      setOnboardingStep('aboutYou');
      setPhase('onboarding');
    }
  }, [authChecked, loading, session, currentUser, users]);

  // Polls conversations for the unread badge and new-message toasts,
  // independent of whichever tab is active.
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    function showToast(t) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(t);
      toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    async function poll() {
      const isFirst = isFirstConversationsPoll.current;
      isFirstConversationsPoll.current = false;

      try {
        const convos = await fetchConversations(currentUser.id);
        if (cancelled) return;
        setConversations(convos);

        for (const c of convos) {
          const msg = c.lastMessage;
          if (seenMessageIds.current.has(msg.id)) continue;
          seenMessageIds.current.add(msg.id);
          if (isFirst) continue; // don't toast messages that predate this session
          if (msg.sender_id === currentUser.id) continue;
          if (overlay === 'messageThread' && viewingUserId === msg.sender_id) continue; // already viewing it

          const sender = users.find(u => u.id === msg.sender_id);
          showToast({ kind: 'message', senderId: msg.sender_id, name: sender?.name || 'Someone', body: msg.body });
        }
      } catch (e) {
        console.error('Failed to poll conversations:', e);
      }

      try {
        const reqs = await fetchContactRequests(currentUser.id);
        if (cancelled) return;
        setContactRequests(reqs);

        for (const r of reqs) {
          const prevStatus = seenRequestStatus.current.get(r.id);
          seenRequestStatus.current.set(r.id, r.status);
          if (isFirst) continue; // don't toast requests that predate this session

          if (r.owner_id === currentUser.id && prevStatus === undefined && r.status === 'pending') {
            const requester = users.find(u => u.id === r.requester_id);
            showToast({ kind: 'request', senderId: r.requester_id, name: requester?.name || 'Someone', body: `wants your ${r.field === 'email' ? 'email' : 'phone number'}` });
          } else if (r.requester_id === currentUser.id && prevStatus === 'pending' && r.status !== 'pending') {
            const owner = users.find(u => u.id === r.owner_id);
            showToast({ kind: 'request', senderId: r.owner_id, name: owner?.name || 'Someone', body: `${r.status} your ${r.field === 'email' ? 'email' : 'phone number'} request` });
          }
        }
      } catch (e) {
        console.error('Failed to poll contact requests:', e);
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [currentUser, overlay, viewingUserId, users]);

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

  function startEdit(user) {
    setDraft({ ...user });
    setOnboardingStep('aboutYou');
    setPhase('onboarding');
  }

  function toggleFavorite(userId) {
    if (!currentUser) return;
    const has = currentUser.favorites.includes(userId);
    const next = { ...currentUser, favorites: has ? currentUser.favorites.filter(id => id !== userId) : [...currentUser.favorites, userId] };
    setCurrentUser(next);
    persist(next);
  }

  async function handleBlock(blockedId) {
    await blockUser(currentUser.id, blockedId);
    setBlockedUserIds(prev => new Set(prev).add(blockedId));
  }

  async function handleReport(reportedId, reason) {
    await reportUser(currentUser.id, reportedId, reason);
  }

  if (loading || !authChecked) {
    return <div className="app-shell"><div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}><p>Loading…</p></div></div>;
  }

  if (passwordRecovery) {
    return (
      <div className="app-shell">
        <ResetPassword onDone={() => setPasswordRecovery(false)} />
      </div>
    );
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

  if (!session) {
    return (
      <div className="app-shell">
        <Auth />
      </div>
    );
  }

  if (phase === 'onboarding') {
    return (
      <div className="app-shell">
        {onboardingStep === 'aboutYou' && (
          <AboutYou
            initialName={draft.name}
            initialEmail={draft.email}
            initialFields={{ pronouns: draft.pronouns, yearMajor: draft.yearMajor, hometown: draft.hometown, instagram: draft.instagram, snapchat: draft.snapchat }}
            onBack={() => currentUser ? setPhase('app') : supabase.auth.signOut()}
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
            onSave={bio => {
              const saved = { ...draft, bio, favorites: draft.favorites || [] };
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

  if (phase !== 'app' || !currentUser) {
    return <div className="app-shell"><div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}><p>Loading…</p></div></div>;
  }

  const viewingUser = viewingUserId ? users.find(u => u.id === viewingUserId) : null;
  const viewingMatch = viewingUser && currentUser ? matchProfiles(currentUser, viewingUser) : null;
  const hasUnreadMessages = conversations.some(c => c.lastMessage.recipient_id === currentUser.id && !c.lastMessage.read);
  const hasPendingRequests = contactRequests.some(r => r.owner_id === currentUser.id && r.status === 'pending');
  // Blocked users (either direction) disappear from Browse/Favorites/Messages.
  const visibleUsers = users.filter(u => !blockedUserIds.has(u.id));

  return (
    <div className="app-shell">
      {toast && (
        <div
          className="msg-toast"
          onClick={() => {
            setActiveTab('messages');
            if (toast.kind === 'message') { setViewingUserId(toast.senderId); setOverlay('messageThread'); }
            setToast(null);
          }}
        >
          <div className="msg-toast-avatar">{toast.name[0]?.toUpperCase()}</div>
          <div className="msg-toast-body">
            <div className="msg-toast-name">{toast.name}</div>
            <div className="msg-toast-text">{toast.body}</div>
          </div>
        </div>
      )}
      {overlay === 'listingDetail' && viewingUser && (
        <ListingDetail
          currentUserId={currentUser.id}
          user={viewingUser}
          score={viewingMatch.score}
          flags={viewingMatch.flags}
          isFavorite={currentUser.favorites.includes(viewingUser.id)}
          onToggleFavorite={() => toggleFavorite(viewingUser.id)}
          onBack={() => setOverlay(null)}
          onBlock={handleBlock}
          onReport={handleReport}
        />
      )}
      {overlay === 'messageThread' && viewingUser && (
        <MessageThread currentUserId={currentUser.id} user={viewingUser} score={viewingMatch.score} onBack={() => setOverlay(null)} />
      )}
      {overlay === 'editProfile' && (
        <EditProfile
          currentUser={currentUser}
          onBack={() => setOverlay(null)}
          onSave={updated => {
            const saved = { ...currentUser, ...updated };
            setCurrentUser(saved);
            persist(saved);
            setOverlay(null);
          }}
        />
      )}
      {!overlay && activeTab === 'browse' && (
        <Browse
          currentUser={currentUser}
          allUsers={visibleUsers}
          favorites={currentUser.favorites}
          onToggleFavorite={toggleFavorite}
          onOpen={id => { setViewingUserId(id); setOverlay('listingDetail'); }}
        />
      )}
      {!overlay && activeTab === 'favorites' && (
        <Favorites
          currentUser={currentUser}
          allUsers={visibleUsers}
          favorites={currentUser.favorites}
          onToggleFavorite={toggleFavorite}
          onMessage={id => { setViewingUserId(id); setOverlay('messageThread'); }}
        />
      )}
      {!overlay && activeTab === 'messages' && (
        <Messages
          currentUser={currentUser}
          allUsers={visibleUsers}
          onOpen={id => { setViewingUserId(id); setOverlay('messageThread'); }}
        />
      )}
      {!overlay && activeTab === 'profile' && (
        <Settings
          currentUser={currentUser}
          onSignOut={() => supabase.auth.signOut()}
          onEditProfile={() => setOverlay('editProfile')}
          onRetakeQuiz={() => startEdit(currentUser)}
        />
      )}
      {!overlay && <TabBar active={activeTab} onChange={setActiveTab} unread={hasUnreadMessages || hasPendingRequests} />}
    </div>
  );
}
