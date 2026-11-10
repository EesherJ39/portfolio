import type { TestStatus } from './triage.ts';

const P: TestStatus = 'passed';
const F: TestStatus = 'failed';

// Sample CI histories for the home page figure. The labels shown next to them
// are computed by analyze(), not written by hand.
export const sampleHistories: { name: string; runs: TestStatus[] }[] = [
  { name: 'checkout.applies_discount', runs: [P, P, F, P, P, F, P, F, P, P, F, P] },
  { name: 'auth.refreshes_session', runs: [P, P, P, P, P, P, P, P, F, F, F, F] },
  { name: 'api.returns_account', runs: [P, P, P, P, P, P, P, P, P, P, P, P] },
];
