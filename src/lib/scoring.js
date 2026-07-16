import { AXES, QUESTIONS } from './quizData.js';

const MISMATCH_LABELS = {
  clean: 'Cleanliness gap',
  sleep: 'Opposite sleep schedules',
  noise: 'Noise tolerance gap',
  social: 'Social style mismatch',
  conflict: 'Very different conflict styles',
  structure: 'Structure mismatch',
};

// Plain average (1-5) of every answer given for an axis, per BACKEND_SPEC §4 / movein_spec_sheet §4.
export function computeAxisScores(quizAnswers) {
  const sums = Object.fromEntries(AXES.map(a => [a.key, 0]));
  const counts = Object.fromEntries(AXES.map(a => [a.key, 0]));
  for (const q of QUESTIONS) {
    const v = quizAnswers[q.id];
    if (v == null) continue;
    sums[q.axis] += v;
    counts[q.axis] += 1;
  }
  const scores = {};
  for (const a of AXES) {
    scores[a.key] = counts[a.key] > 0 ? sums[a.key] / counts[a.key] : 0;
  }
  return scores;
}

// Movein's worked formula, confirmed for this build:
//   blended[axis] = (viewer.weights[axis] + other.weights[axis]) / 2
//   penalty = Σ blended[axis] × |viewer.scores[axis] − other.scores[axis]| × 20
//   score   = max(0, round(100 − penalty))
// Hard-mismatch flag on any axis with a gap >= 3.5, independent of weighting.
export function matchProfiles(viewer, other) {
  let penalty = 0;
  const flags = [];
  for (const a of AXES) {
    const blended = ((viewer.weights?.[a.key] ?? 0) + (other.weights?.[a.key] ?? 0)) / 2;
    const gap = Math.abs((viewer.scores?.[a.key] ?? 0) - (other.scores?.[a.key] ?? 0));
    penalty += blended * gap * 20;
    if (gap >= 3.5) flags.push(MISMATCH_LABELS[a.key]);
  }
  const score = Math.max(0, Math.round(100 - penalty));
  return { score, flags };
}

// Ranks candidate roommates for `viewer`: same gender, excluding self, each
// scored + flagged and sorted best-first. Shared by Browse and Results.
export function rankMatches(viewer, users, { minScore = 0, limit } = {}) {
  const ranked = users
    .filter(u => u.id !== viewer.id && u.gender === viewer.gender)
    .map(u => ({ user: u, ...matchProfiles(viewer, u) }))
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score);
  return limit == null ? ranked : ranked.slice(0, limit);
}

export function normalizeWeights(weights) {
  const total = AXES.reduce((s, a) => s + (weights[a.key] ?? 0), 0);
  if (total <= 0) return Object.fromEntries(AXES.map(a => [a.key, 1 / AXES.length]));
  return Object.fromEntries(AXES.map(a => [a.key, weights[a.key] / total]));
}
