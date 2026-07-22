import { useState } from 'react';
import ProgressBar from '../components/ProgressBar.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AboutYou({ initialName, initialEmail, initialFields, onNext, onBack }) {
  const [name, setName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [gender, setGender] = useState('woman');
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState(initialFields?.pronouns || '');
  const [yearMajor, setYearMajor] = useState(initialFields?.yearMajor || '');
  const [instagram, setInstagram] = useState(initialFields?.instagram || '');
  const [snapchat, setSnapchat] = useState(initialFields?.snapchat || '');
  const emailValid = EMAIL_RE.test(email.trim());

  return (
    <div className="screen">
      <div className="screen-header">
        <ProgressBar steps={4} current={1} />
        <div className="kicker">Step 1 of 4</div>
        <h1 style={{ fontSize: 26 }}>Let's get to know you</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>A few quick questions before your compatibility quiz.</p>
      </div>
      <div className="screen-body">
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '4px 0 0' }}>
            Only used by the housing office to send a reminder if you haven't finished the quiz — never shown to other students.
          </p>
        </div>
        <div className="field">
          <label>Gender</label>
          <div className="seg">
            <button className={`seg-opt${gender === 'woman' ? ' active' : ''}`} onClick={() => setGender('woman')}>Woman</button>
            <button className={`seg-opt${gender === 'man' ? ' active' : ''}`} onClick={() => setGender('man')}>Man</button>
          </div>
        </div>
        <div className="field">
          <label>About you (optional)</label>
          <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio major, early riser, love a tidy kitchen..." />
        </div>
        <div className="field">
          <label>Pronouns (optional)</label>
          <input className="input" value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="she/her, he/him, they/them..." />
        </div>
        <div className="field">
          <label>Year & major (optional)</label>
          <input className="input" value={yearMajor} onChange={e => setYearMajor(e.target.value)} placeholder="Sophomore, Computer Science" />
        </div>
        <div className="field">
          <label>Instagram (optional)</label>
          <input className="input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@yourhandle" />
        </div>
        <div className="field">
          <label>Snapchat (optional)</label>
          <input className="input" value={snapchat} onChange={e => setSnapchat(e.target.value)} placeholder="yourhandle" />
        </div>
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button
          className="btn btn-primary"
          disabled={!name.trim() || !emailValid}
          onClick={() => onNext({
            name: name.trim(), email: email.trim(), gender, bio: bio.trim(),
            pronouns: pronouns.trim(), yearMajor: yearMajor.trim(), instagram: instagram.trim(), snapchat: snapchat.trim(),
          })}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
