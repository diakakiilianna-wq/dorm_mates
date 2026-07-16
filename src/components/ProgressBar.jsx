export default function ProgressBar({ steps, current }) {
  return (
    <div className="progress-track">
      {Array.from({ length: steps }).map((_, i) => (
        <span key={i} className={`progress-step${i < current ? ' done' : ''}`} />
      ))}
    </div>
  );
}
