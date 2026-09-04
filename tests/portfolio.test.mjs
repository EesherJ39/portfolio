import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze, updateStats, emptyStats } from '../lib/demos/triage.ts';
import { SyncSession } from '../lib/demos/sync.ts';
import { projects, evidenceUrl } from '../lib/projects.ts';

test('TriageCI identifies stable, intermittent, and regression samples', () => {
  assert.equal(analyze(Array(8).fill('passed')).state, 'stable');
  assert.equal(
    analyze(['passed', 'passed', 'failed', 'passed', 'failed', 'passed']).state,
    'flaky',
  );
  assert.equal(
    analyze(['passed', 'passed', 'passed', 'failed', 'failed', 'failed']).state,
    'regression',
  );
});
test('TriageCI handles insufficient, skipped, and consistently failing data', () => {
  assert.equal(analyze([]).state, 'insufficient-data');
  assert.equal(analyze(['skipped', 'skipped']).state, 'insufficient-data');
  assert.equal(analyze(['passed', 'failed']).state, 'insufficient-data');
  assert.equal(analyze(Array(5).fill('failed')).state, 'consistently-failing');
});
test('TriageCI updates counters without mutating previous statistics', () => {
  const initial = emptyStats();
  const result = updateStats(initial, 'failed');
  assert.equal(initial.totalRuns, 0);
  assert.equal(result.failureStreak, 1);
  assert.equal(
    analyze(['passed', 'passed', 'failed', 'failed', 'failed', 'passed']).state,
    'flaky',
  );
});
test('SyncLab connected edits arrive at the peer', () => {
  const session = new SyncSession();
  session.append(0, ' Hello');
  session.append(1, ' World');
  assert.equal(session.snapshot().texts[0], session.snapshot().texts[1]);
});
test('SyncLab disconnected replicas diverge then converge through reversed duplicate replay', () => {
  const session = new SyncSession();
  session.disconnect();
  session.append(0, ' From A');
  session.append(1, ' From B');
  assert.notEqual(session.snapshot().texts[0], session.snapshot().texts[1]);
  assert.ok(session.snapshot().pending > 0);
  session.reconnect();
  const { texts, pending } = session.snapshot();
  assert.equal(texts[0], texts[1]);
  assert.equal(pending, 0);
  assert.ok(texts[0].includes('From A'));
  assert.ok(texts[0].includes('From B'));
  const prior = texts[0];
  session.reconnect();
  assert.equal(session.snapshot().texts[0], prior);
});
test('SyncLab queues deletes before dependencies and preserves Unicode', () => {
  const session = new SyncSession();
  session.disconnect();
  session.append(0, '🚀');
  session.backspace(0);
  session.append(1, ' Ω');
  session.reconnect();
  assert.equal(session.snapshot().texts[0], session.snapshot().texts[1]);
  assert.ok(!session.snapshot().texts[0].includes('🚀'));
});
test('SyncLab converges over 100 deterministic edit/disconnect sequences', () => {
  for (let seed = 0; seed < 100; seed++) {
    const session = new SyncSession();
    session.disconnect();
    for (let index = 0; index < 20; index++) {
      const replica = (seed + index) % 2;
      session.append(replica, String.fromCharCode(97 + ((seed + index) % 26)));
      if ((seed + index) % 3 === 0) session.backspace(replica);
      if (index % 7 === 0) {
        session.reconnect();
        session.disconnect();
      }
    }
    session.reconnect();
    assert.equal(session.snapshot().texts[0], session.snapshot().texts[1]);
  }
});
test('Demo edit operations are bounded', () => {
  const session = new SyncSession();
  session.append(0, 'x'.repeat(600));
  session.append(1, 'ignored');
  assert.equal(session.operations, 600);
});
test('Every case study pins evidence to immutable project revisions', () => {
  for (const [slug, project] of Object.entries(projects)) {
    assert.equal(project.numbers.length, 3);
    assert.equal(project.architecture.length, 5);
    for (const link of project.links)
      assert.match(
        evidenceUrl(slug, link.path),
        /^https:\/\/github.com\/EesherJ39\/[^/]+\/blob\/[a-f0-9]{40}\//,
      );
  }
});
test('Resume is a real PDF and portfolio preserves loopback-only hosting', () => {
  assert.equal(
    readFileSync(new URL('../public/Eesher_Janda_Resume.pdf', import.meta.url))
      .subarray(0, 5)
      .toString(),
    '%PDF-',
  );
  assert.match(
    readFileSync(new URL('../compose.yaml', import.meta.url), 'utf8'),
    /127\.0\.0\.1:23601:3000/,
  );
});
