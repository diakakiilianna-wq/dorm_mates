import { useState } from 'react';
import { QUESTIONS, AXES } from '../lib/quizData.js';

const AXIS_LABEL = Object.fromEntries(AXES.map(a => [a.key, a.label]));

export default function Quiz({ onNext, onBack }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = QUESTIONS[index];
  const selected = answers[q.id];

  function selectOption(value) {
    setAnswers(a => ({ ...a, [q.id]: value }));
  }

  function goNext() {
    if (index === QUESTIONS.length - 1) {
      onNext(answers);
    } else {
      setIndex(i => i + 1);
    }
  }

  function goBack() {
    if (index === 0) onBack();
    else setIndex(i => i - 1);
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="progress-track" style={{ gap: 3 }}>
          {QUESTIONS.map((_, i) => (
            <span key={i} className={`progress-step${i < index ? ' done' : ''}`} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="kicker" style={{ marginBottom: 0 }}>Question {index + 1} of {QUESTIONS.length}</span>
          <span className="tag tag-accent-2">{AXIS_LABEL[q.axis]}</span>
        </div>
      </div>
      <div className="screen-body">
        <h2 style={{ fontSize: 21, lineHeight: 1.3, marginBottom: 20 }}>{q.prompt}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map(opt => (
            <button
              key={opt.label}
              onClick={() => selectOption(opt.value)}
              style={{
                textAlign: 'left', borderRadius: 18, padding: '14px 16px', fontSize: 14, cursor: 'pointer',
                background: selected === opt.value ? 'var(--color-accent-100)' : 'var(--color-surface)',
                border: selected === opt.value ? '2px solid var(--color-accent)' : '2px solid transparent',
                fontWeight: selected === opt.value ? 600 : 400, color: 'var(--color-text)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="screen-footer">
        <button className="btn btn-secondary" onClick={goBack}>Back</button>
        <button className="btn btn-primary" style={{ flex: 2 }} disabled={selected == null} onClick={goNext}>
          {index === QUESTIONS.length - 1 ? 'See results' : 'Next'}
        </button>
      </div>
    </div>
  );
}
