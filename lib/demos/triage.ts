// Browser-safe extraction of emptyStats/updateStats from EesherJ39/TriageCI
// at 244d51eee8b5f6374278b32bd74e4f165594f47d. No server or hashing code is bundled.
export type TestStatus = 'passed' | 'failed' | 'skipped';
export type TestState =
  | 'stable'
  | 'flaky'
  | 'regression'
  | 'consistently-failing'
  | 'insufficient-data';
export interface TestStats {
  totalRuns: number;
  passes: number;
  failures: number;
  skips: number;
  transitions: number;
  failureStreak: number;
  lastStatus: TestStatus | null;
  flakeScore: number;
  state: TestState;
}
export function emptyStats(): TestStats {
  return {
    totalRuns: 0,
    passes: 0,
    failures: 0,
    skips: 0,
    transitions: 0,
    failureStreak: 0,
    lastStatus: null,
    flakeScore: 0,
    state: 'insufficient-data',
  };
}
export function updateStats(
  current: TestStats,
  status: TestStatus,
  mixedOnCommit = false,
): TestStats {
  const next = { ...current };
  next.totalRuns += 1;
  if (status === 'passed') next.passes += 1;
  if (status === 'failed') next.failures += 1;
  if (status === 'skipped') next.skips += 1;
  if (
    next.lastStatus &&
    next.lastStatus !== 'skipped' &&
    status !== 'skipped' &&
    next.lastStatus !== status
  )
    next.transitions += 1;
  next.lastStatus = status;
  if (status === 'failed') next.failureStreak += 1;
  else if (status === 'passed') next.failureStreak = 0;
  const decisive = next.passes + next.failures;
  if (decisive === 0) {
    next.flakeScore = 0;
    next.state = 'insufficient-data';
    return next;
  }
  const failureRate = next.failures / decisive;
  const diversity = 4 * failureRate * (1 - failureRate);
  const confidence = 1 - Math.exp(-decisive / 6);
  const transitionEvidence = Math.min(1, next.transitions / 3);
  next.flakeScore = Number(
    (100 * diversity * confidence * (0.7 + 0.3 * transitionEvidence)).toFixed(
      2,
    ),
  );
  if (decisive < 4) next.state = 'insufficient-data';
  else if (next.failures === 0) next.state = 'stable';
  else if (next.passes === 0) next.state = 'consistently-failing';
  else if (next.failureStreak >= 3 && next.transitions === 1)
    next.state = 'regression';
  else if (mixedOnCommit || next.transitions >= 2) next.state = 'flaky';
  else next.state = 'insufficient-data';
  return next;
}
export function analyze(history: TestStatus[]) {
  return history.reduce(
    (stats, status) => updateStats(stats, status),
    emptyStats(),
  );
}
