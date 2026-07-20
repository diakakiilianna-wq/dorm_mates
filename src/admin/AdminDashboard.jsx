import { useEffect, useMemo, useState } from 'react';
import './admin.css';
import { AXES } from '../lib/quizData.js';
import { rankMatches, matchProfiles } from '../lib/scoring.js';
import { loadUsers, upsertUser } from '../lib/dataStore.js';
import { loadRoster, addRosterEntries } from '../lib/roster.js';
import { sendReminders } from '../lib/remind.js';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'gender', label: 'Gender' },
  { key: 'bio', label: 'Bio' },
  ...AXES.map(a => ({ key: `score:${a.key}`, label: a.label })),
  { key: 'matches', label: 'Top matches', sortable: false },
  { key: 'takenAt', label: 'Completed' },
];

// Suggested top 3, respecting any admin override/exclusions on this user.
function topMatchesForAdmin(user, allUsers) {
  const excluded = new Set(user.excludedMatchIds || []);
  const ranked = rankMatches(user, allUsers, {}).filter(r => !excluded.has(r.user.id));

  if (user.matchOverride?.userId) {
    const overrideUser = allUsers.find(u => u.id === user.matchOverride.userId);
    if (overrideUser) {
      const { score, flags } = matchProfiles(user, overrideUser);
      const rest = ranked.filter(r => r.user.id !== overrideUser.id);
      return [{ user: overrideUser, score, flags, isOverride: true }, ...rest].slice(0, 3);
    }
  }
  return ranked.slice(0, 3);
}

function toCsvValue(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows, users) {
  const header = ['Name', 'Email', 'Gender', 'Bio', ...AXES.map(a => a.label), 'Top matches', 'Completed at'];
  const lines = [header.map(toCsvValue).join(',')];
  for (const u of rows) {
    const matches = topMatchesForAdmin(u, users).map(m => `${m.user.name} (${m.score}%)`).join('; ');
    lines.push([
      u.name, u.email || '', u.gender, u.bio || '',
      ...AXES.map(a => (u.scores?.[a.key] ?? '').toString()),
      matches, u.takenAt || '',
    ].map(toCsvValue).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roomiefit-students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });

  const [overrideFor, setOverrideFor] = useState(null); // user object or null
  const [rosterPaste, setRosterPaste] = useState('');
  const [rosterBusy, setRosterBusy] = useState(false);
  const [reminderStatus, setReminderStatus] = useState(null);

  function refresh() {
    setLoading(true);
    Promise.all([loadUsers(), loadRoster()])
      .then(([u, r]) => { setUsers(u); setRoster(r.entries); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const incomplete = useMemo(() => {
    const doneEmails = new Set(users.map(u => (u.email || '').toLowerCase()).filter(Boolean));
    return roster.filter(r => !doneEmails.has((r.email || '').toLowerCase()));
  }, [users, roster]);

  const filteredSorted = useMemo(() => {
    let rows = users.filter(u => {
      for (const [key, val] of Object.entries(filters)) {
        if (!val) continue;
        const needle = val.toLowerCase();
        if (key.startsWith('score:')) {
          const axis = key.slice(6);
          if (!String(u.scores?.[axis] ?? '').toLowerCase().includes(needle)) return false;
        } else if (key === 'matches') {
          const names = topMatchesForAdmin(u, users).map(m => m.user.name.toLowerCase()).join(' ');
          if (!names.includes(needle)) return false;
        } else {
          if (!String(u[key] ?? '').toLowerCase().includes(needle)) return false;
        }
      }
      return true;
    });

    rows = rows.slice().sort((a, b) => {
      let av, bv;
      if (sort.key.startsWith('score:')) {
        const axis = sort.key.slice(6);
        av = a.scores?.[axis] ?? 0; bv = b.scores?.[axis] ?? 0;
      } else if (sort.key === 'matches') {
        av = topMatchesForAdmin(a, users)[0]?.score ?? 0;
        bv = topMatchesForAdmin(b, users)[0]?.score ?? 0;
      } else {
        av = a[sort.key] ?? ''; bv = b[sort.key] ?? '';
      }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [users, filters, sort]);

  function toggleSort(key) {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }

  function setFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  async function saveOverride(user, newMatchId) {
    const currentTop = topMatchesForAdmin(user, users)[0];
    const excludedMatchIds = new Set(user.excludedMatchIds || []);
    if (currentTop && currentTop.user.id !== newMatchId) excludedMatchIds.add(currentTop.user.id);
    const next = { ...user, matchOverride: { userId: newMatchId }, excludedMatchIds: [...excludedMatchIds] };
    setUsers(list => list.map(u => u.id === user.id ? next : u));
    setOverrideFor(null);
    await upsertUser(next).catch(e => setError(e.message));
  }

  async function clearOverride(user) {
    const next = { ...user, matchOverride: null };
    setUsers(list => list.map(u => u.id === user.id ? next : u));
    await upsertUser(next).catch(e => setError(e.message));
  }

  async function addRoster() {
    const entries = rosterPaste.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const [name, email] = line.split(',').map(s => s.trim());
      return { name: name || '', email: email || name || '' };
    }).filter(e => e.email);
    if (entries.length === 0) return;
    setRosterBusy(true);
    try {
      await addRosterEntries(entries);
      const { entries: fresh } = await loadRoster();
      setRoster(fresh);
      setRosterPaste('');
    } catch (e) {
      setError(e.message);
    } finally {
      setRosterBusy(false);
    }
  }

  async function remindIncomplete() {
    if (incomplete.length === 0) return;
    setReminderStatus('sending');
    try {
      const results = await sendReminders(incomplete);
      const failed = results.filter(r => !r.ok);
      setReminderStatus(failed.length === 0
        ? `Sent ${results.length} reminder${results.length === 1 ? '' : 's'}.`
        : `Sent ${results.length - failed.length}/${results.length}. Failed: ${failed.map(f => f.email).join(', ')}`);
    } catch (e) {
      setReminderStatus(`Error: ${e.message}`);
    }
  }

  if (loading) return <div className="admin-shell"><p>Loading…</p></div>;
  if (error) return <div className="admin-shell"><p style={{ color: 'var(--color-accent-700)' }}>{error}</p></div>;

  const total = roster.length > 0 ? roster.length : users.length;

  return (
    <div className="admin-shell">
      <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 24 }}>RoomieFit — Admin dashboard</h1>

      <div className="admin-summary">
        <div className="admin-summary-count">
          <strong>{users.length}</strong> of <strong>{total}</strong> students have completed the survey
          {roster.length === 0 && <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginLeft: 8 }}>(add a roster below to track expected total)</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={incomplete.length === 0 || reminderStatus === 'sending'} onClick={remindIncomplete}>
            {reminderStatus === 'sending' ? 'Sending…' : `Remind ${incomplete.length} who haven't finished`}
          </button>
          <button className="btn btn-primary" onClick={() => downloadCsv(filteredSorted, users)}>Export CSV</button>
        </div>
      </div>
      {reminderStatus && reminderStatus !== 'sending' && (
        <p style={{ marginTop: -16, marginBottom: 16, fontSize: 13 }}>{reminderStatus}</p>
      )}

      <div className="admin-section">
        <h3 style={{ marginBottom: 8 }}>Roster</h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
          Paste one student per line as <code>Name, Email</code> to track who's expected to take the survey.
        </p>
        <textarea
          className="input"
          rows={3}
          placeholder={'Jane Doe, jane@school.edu\nJohn Smith, john@school.edu'}
          value={rosterPaste}
          onChange={e => setRosterPaste(e.target.value)}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-primary" style={{ width: 'auto' }} disabled={rosterBusy || !rosterPaste.trim()} onClick={addRoster}>
            {rosterBusy ? 'Saving…' : 'Add to roster'}
          </button>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{roster.length} on roster</span>
        </div>
        {incomplete.length > 0 && (
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Not yet completed: {incomplete.map(r => r.name || r.email).join(', ')}
          </p>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-toolbar">
          {COLUMNS.filter(c => c.sortable !== false).map(c => (
            <input
              key={c.key}
              className="input"
              placeholder={`Filter ${c.label}…`}
              value={filters[c.key] || ''}
              onChange={e => setFilter(c.key, e.target.value)}
            />
          ))}
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {COLUMNS.map(c => (
                  <th key={c.key} onClick={() => c.sortable !== false && toggleSort(c.key)}>
                    {c.label}{sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map(u => {
                const top3 = topMatchesForAdmin(u, users);
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email || '—'}</td>
                    <td>{u.gender}</td>
                    <td className="wrap">{u.bio || '—'}</td>
                    {AXES.map(a => <td key={a.key}>{u.scores?.[a.key] != null ? u.scores[a.key].toFixed(1) : '—'}</td>)}
                    <td className="wrap">
                      {top3.length === 0 && '—'}
                      {top3.map(m => (
                        <span key={m.user.id} className={`admin-match-chip${m.isOverride ? ' override' : ''}`}>
                          {m.user.name} {m.score}%{m.isOverride ? ' (override)' : ''}
                        </span>
                      ))}
                    </td>
                    <td>{u.takenAt ? new Date(u.takenAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={() => setOverrideFor(u)}>Edit</button>
                      {u.matchOverride?.userId && (
                        <button className="btn btn-ghost" onClick={() => clearOverride(u)}>Clear</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {overrideFor && (
        <OverrideModal
          user={overrideFor}
          allUsers={users}
          onCancel={() => setOverrideFor(null)}
          onSave={newMatchId => saveOverride(overrideFor, newMatchId)}
        />
      )}
    </div>
  );
}

function OverrideModal({ user, allUsers, onCancel, onSave }) {
  const candidates = allUsers.filter(u => u.id !== user.id && u.gender === user.gender);
  const current = topMatchesForAdmin(user, allUsers);
  const [selected, setSelected] = useState(user.matchOverride?.userId || current[0]?.user.id || '');

  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h3>Override match for {user.name}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
          Current suggested top match: {current[0] ? `${current[0].user.name} (${current[0].score}%)` : 'none'}.
          Picking a different match here removes that pairing from future suggestions.
        </p>
        <div className="field">
          <label>New top match</label>
          <select className="input" value={selected} onChange={e => setSelected(e.target.value)}>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({matchProfiles(user, c).score}%)</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ width: 'auto' }} disabled={!selected} onClick={() => onSave(selected)}>Save override</button>
        </div>
      </div>
    </div>
  );
}
