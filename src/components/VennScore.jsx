// Two overlapping circles whose distance shrinks as the match score rises —
// purely illustrative (the percentage next to it is the real value), concept
// ported from the Movein reference's vennSVG().
export default function VennScore({ score, size = 38 }) {
  const r = size * 0.32;
  const maxOffset = r * 1.15;
  const offset = maxOffset * (1 - score / 100);
  const cx1 = size / 2 - offset / 2;
  const cx2 = size / 2 + offset / 2;
  const cy = size * 0.34;
  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
      <circle cx={cx1} cy={cy} r={r} fill="var(--color-accent)" opacity="0.85" />
      <circle cx={cx2} cy={cy} r={r} fill="var(--color-accent-2)" opacity="0.85" />
    </svg>
  );
}
