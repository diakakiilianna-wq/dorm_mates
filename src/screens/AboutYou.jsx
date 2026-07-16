import { useState } from 'react';
import ProgressBar from '../components/ProgressBar.jsx';

export default function AboutYou({ initialName, onNext, onBack }) {
  const [name, setName] = useState(initialName || '');
  const [gender, setGender] = useState('woman');
  const [bio, setBio] = useState('');

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
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!name.trim()} onClick={() => onNext({ name: name.trim(), gender, bio: bio.trim() })}>Continue</button>
      </div>
    </div>
  );
}
