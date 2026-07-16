import { useState } from 'react';
import ProgressBar from '../components/ProgressBar.jsx';
import { AXES, DEFAULT_WEIGHTS } from '../lib/quizData.js';

function defaultPcts() {
  return Object.fromEntries(AXES.map(a => [a.key, Math.round(DEFAULT_WEIGHTS[a.key] * 100)]));
}

export default function Weights({ onNext, onBack }) {
  const [pcts, setPcts] = useState(defaultPcts);

  function setPct(key, newPct) {
    newPct = Math.max(0, Math.min(100, newPct));
    const others = AXES.filter(a => a.key !== key);
    const othersSum = others.reduce((s, a) => s + pcts[a.key], 0);
    const remaining = 100 - newPct;
    const next = { ...pcts, [key]: newPct };
    if (othersSum <= 0) {
      others.forEach(a => { next[a.key] = remaining / others.length; });
    } else {
      others.forEach(a => { next[a.key] = (pcts[a.key] / othersSum) * remaining; });
    }
    setPcts(next);
  }

  function handleContinue() {
    const total = AXES.reduce((s, a) => s + pcts[a.key], 0) || 1;
    const weights = Object.fromEntries(AXES.map(a => [a.key, pcts[a.key] / total]));
    onNext(weights);
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <ProgressBar steps={4} current={2} />
        <div className="kicker">Step 2 of 4</div>
        <h1 style={{ fontSize: 24 }}>What matters most?</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Drag to set your priorities — they auto-balance to 100%.</p>
      </div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {AXES.map(a => (
          <div key={a.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{a.label}</span>
              <span style={{ color: 'var(--color-accent-700)', fontWeight: 700 }}>{Math.round(pcts[a.key])}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={Math.round(pcts[a.key])}
              onChange={e => setPct(a.key, Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
          </div>
        ))}
        <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={() => setPcts(defaultPcts())}>Reset to defaults</button>
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={handleContinue}>Start quiz</button>
      </div>
    </div>
  );
}
