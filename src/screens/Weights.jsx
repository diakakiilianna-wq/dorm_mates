import { useState } from 'react';
import ProgressBar from '../components/ProgressBar.jsx';
import { AXES, DEFAULT_WEIGHTS } from '../lib/quizData.js';
import { normalizeWeights } from '../lib/scoring.js';

function defaultPcts() {
  return Object.fromEntries(AXES.map(a => [a.key, Math.round(DEFAULT_WEIGHTS[a.key] * 100)]));
}

export default function Weights({ onNext, onBack }) {
  const [pcts, setPcts] = useState(defaultPcts);

  // Sliders move independently while editing — no live rebalancing. Ratios are
  // normalized into weights (summing to 1) only when leaving the screen.
  function setPct(key, newPct) {
    setPcts(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, newPct)) }));
  }

  function handleContinue() {
    onNext(normalizeWeights(pcts));
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <ProgressBar steps={4} current={2} />
        <div className="kicker">Step 2 of 4</div>
        <h1 style={{ fontSize: 24 }}>What matters most?</h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Set how much each area matters to you — we balance them into priorities when you continue.</p>
      </div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {AXES.map(a => (
          <div key={a.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{a.label}</span>
              <span style={{ color: 'var(--color-accent-700)', fontWeight: 700 }}>{Math.round(pcts[a.key])}</span>
            </div>
            <input
              type="range" min="0" max="100" value={Math.round(pcts[a.key])}
              onChange={e => setPct(a.key, Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
              <span className="tag tag-neutral">{a.low}</span>
              <span className="tag tag-accent">{a.high}</span>
            </div>
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
