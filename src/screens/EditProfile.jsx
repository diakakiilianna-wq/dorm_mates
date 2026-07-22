import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile({ currentUser, onSave, onBack }) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [gender, setGender] = useState(currentUser.gender || 'woman');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [pronouns, setPronouns] = useState(currentUser.pronouns || '');
  const [yearMajor, setYearMajor] = useState(currentUser.yearMajor || '');
  const [hometown, setHometown] = useState(currentUser.hometown || '');
  const [instagram, setInstagram] = useState(currentUser.instagram || '');
  const [snapchat, setSnapchat] = useState(currentUser.snapchat || '');
  const emailValid = EMAIL_RE.test(email.trim());

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="kicker">Profile</div>
        <h1 style={{ fontSize: 26 }}>Edit your profile</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Update your info any time — this won't touch your quiz answers.</p>
      </div>
      <div className="screen-body">
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" />
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
          <label>Hometown (optional)</label>
          <input className="input" value={hometown} onChange={e => setHometown(e.target.value)} placeholder="Austin, TX" />
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
        <button className="btn btn-secondary" onClick={onBack}>Cancel</button>
        <button
          className="btn btn-primary"
          disabled={!name.trim() || !emailValid}
          onClick={() => onSave({
            name: name.trim(), email: email.trim(), gender, bio: bio.trim(),
            pronouns: pronouns.trim(), yearMajor: yearMajor.trim(), hometown: hometown.trim(),
            instagram: instagram.trim(), snapchat: snapchat.trim(),
          })}
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
