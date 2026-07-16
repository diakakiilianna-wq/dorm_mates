import ProgressBar from '../components/ProgressBar.jsx';
import { IconHeart } from '../components/icons.jsx';

export default function Motivation({ onNext }) {
  return (
    <div className="screen">
      <div className="screen-header">
        <ProgressBar steps={4} current={1} />
      </div>
      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 4, paddingTop: 20 }}>
        <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, color: 'var(--color-accent)' }}>
          <IconHeart size={36} />
        </div>
        <h1 style={{ fontSize: 24, maxWidth: 280 }}>Take this seriously</h1>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-800)', maxWidth: 280, lineHeight: 1.6 }}>
          The more honest and accurate your answers, the better your matches. Students who take the quiz seriously are far more likely to find not just a roommate — but a lifelong friend.
        </p>
      </div>
      <div className="screen-footer">
        <button className="btn btn-primary" onClick={onNext}>Got it, let's go</button>
      </div>
    </div>
  );
}
