'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { analyze, type TestStatus } from '@/lib/demos/triage';
import { SyncSession } from '@/lib/demos/sync';

const histories = [
  {
    name: 'checkout / applies discount',
    states: ['P', 'P', 'F', 'P', 'F', 'P', 'F', 'P'],
    kind: 'flaky',
    detail: 'Repeated pass/fail transitions suggest an intermittent failure.',
  },
  {
    name: 'auth / refreshes session',
    states: ['P', 'P', 'P', 'P', 'P', 'F', 'F', 'F'],
    kind: 'regression',
    detail: 'A previously passing test now has three consecutive failures.',
  },
  {
    name: 'api / returns account',
    states: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    kind: 'stable',
    detail: 'All eight observations pass.',
  },
];

export function TriageDemo({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const [custom, setCustom] = useState<TestStatus[] | null>(null);
  const item = histories[selected];
  const history: TestStatus[] =
    custom ?? item.states.map((value) => (value === 'P' ? 'passed' : 'failed'));
  const stats = analyze(history);
  const explanation =
    stats.state === 'flaky'
      ? 'Repeated pass/fail transitions indicate an intermittent failure pattern.'
      : stats.state === 'regression'
        ? 'A previously passing test has a sustained failure streak with only one transition.'
        : stats.state === 'stable'
          ? 'Every decisive observation passes.'
          : stats.state === 'consistently-failing'
            ? 'Every decisive observation fails.'
            : 'Not enough decisive evidence to classify this pattern yet.';
  return (
    <div className={`demo-panel triage-demo ${compact ? 'compact-demo' : ''}`}>
      <div className="demo-top">
        <span className="demo-brand">TriageCI</span>
        <span className="demo-mode">Actual analyzer · sample data</span>
      </div>
      <div className="demo-body">
        <p className="demo-eyebrow">ONE RED BUILD. DIFFERENT CAUSES.</p>
        <h3>Find the signal in the failures.</h3>
        <div className="history-list">
          {histories.map((row, i) => (
            <Button
              key={row.name}
              className={`history-row ${i === selected ? 'selected' : ''}`}
              aria-pressed={i === selected}
              onClick={() => {
                setSelected(i);
                setCustom(null);
              }}
            >
              <span>{row.name}</span>
              <span
                className={`state-badge ${i === selected ? stats.state : row.kind}`}
              >
                {i === selected ? stats.state.replaceAll('-', ' ') : row.kind}
              </span>
            </Button>
          ))}
        </div>
        <div className="history-runs" aria-hidden="true">
          {history.slice(-16).map((state, i) => (
            <span key={i} className={state === 'passed' ? 'pass' : 'fail'}>
              {state === 'passed' ? '✓' : '×'}
            </span>
          ))}
        </div>
        <p className="sr-only">
          {item.name}, latest outcomes: {history.slice(-16).join(', ')}
        </p>
        <p className="demo-explanation" aria-live="polite">
          {explanation}
        </p>
        {!compact && (
          <>
            <dl className="demo-stats">
              <div>
                <dt>Observations</dt>
                <dd>{stats.totalRuns}</dd>
              </div>
              <div>
                <dt>Transitions</dt>
                <dd>{stats.transitions}</dd>
              </div>
              <div>
                <dt>Failure streak</dt>
                <dd>{stats.failureStreak}</dd>
              </div>
            </dl>
            <div className="demo-controls">
              <Button
                className="demo-button"
                onClick={() =>
                  setCustom([...history, 'passed'].slice(-64) as TestStatus[])
                }
              >
                Add passing run
              </Button>
              <Button
                className="demo-button"
                onClick={() =>
                  setCustom([...history, 'failed'].slice(-64) as TestStatus[])
                }
              >
                Add failing run
              </Button>
              <Button
                className="demo-button quiet"
                onClick={() => setCustom(null)}
              >
                Reset history
              </Button>
            </div>
          </>
        )}
        <p className="demo-footnote">
          {compact
            ? 'Select a test to inspect its history. Browser-only sample; no production traffic.'
            : 'Browser extraction of the classification logic. Uses the latest 64 sample observations; displays the last 16. Selecting a test resets its sample. The full-service same-commit evidence, ingestion, storage, and clustering are not running here.'}
        </p>
        {compact && (
          <a className="text-link" href="/projects/triageci">
            Inside the analyzer <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

export function SyncDemo() {
  const session = useRef<SyncSession | null>(null);
  const [snapshot, setSnapshot] = useState(() => new SyncSession().snapshot());
  const [drafts, setDrafts] = useState([' Hello from A.', ' Hello from B.']);
  const [notice, setNotice] = useState(
    'Disconnect delivery, append a different edit in each replica, then reconnect.',
  );
  function act(action: 'append' | 'delete' | 'network' | 'reset', replica = 0) {
    const current = session.current ?? (session.current = new SyncSession());
    if (action === 'reset') {
      session.current = new SyncSession();
      setSnapshot(session.current.snapshot());
      setNotice('Reset to the initial document.');
      return;
    }
    if (action === 'network') {
      if (current.connected) {
        current.disconnect();
        setNotice('Delivery paused. Each replica can still accept edits.');
      } else {
        current.reconnect();
        setNotice(
          'Queued operations replayed in reverse order, with duplicates.',
        );
      }
    } else if (action === 'append') {
      current.append(replica, drafts[replica]);
      setNotice(`Appended to replica ${replica === 0 ? 'A' : 'B'}.`);
    } else {
      current.backspace(replica);
      setNotice('Deleted the last character using a CRDT operation.');
    }
    setSnapshot(current.snapshot());
  }
  return (
    <div className="demo-panel sync-demo">
      <div className="demo-top">
        <span className="demo-brand">SyncLab / replica lab</span>
        <span className="demo-mode">Actual CRDT · simulated delivery</span>
      </div>
      <div className="demo-body">
        <div className="demo-controls">
          <Button className="demo-button" onClick={() => act('network')}>
            {snapshot.connected ? 'Disconnect delivery' : 'Reconnect & replay'}
          </Button>
          <Button className="demo-button quiet" onClick={() => act('reset')}>
            Reset document
          </Button>
          <span
            className={`connection-status ${snapshot.connected ? 'online' : 'offline'}`}
          >
            {snapshot.connected ? 'Connected' : 'Disconnected'} ·{' '}
            {snapshot.pending} queued operations
          </span>
        </div>
        <div className="replica-grid">
          {snapshot.texts.map((text, index) => (
            <section className="replica" key={index}>
              <h3>Replica {index === 0 ? 'A' : 'B'}</h3>
              <pre
                aria-label={`Document in replica ${index === 0 ? 'A' : 'B'}`}
              >
                {text || '(empty document)'}
              </pre>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  act('append', index);
                }}
              >
                <label htmlFor={`draft-${index}`}>Text to append</label>
                <input
                  id={`draft-${index}`}
                  maxLength={60}
                  value={drafts[index]}
                  onChange={(event) =>
                    setDrafts((values) =>
                      values.map((value, i) =>
                        i === index ? event.target.value : value,
                      ),
                    )
                  }
                />
                <div className="demo-controls">
                  <Button
                    type="submit"
                    className="demo-button"
                    disabled={
                      !drafts[index] ||
                      snapshot.operations + Array.from(drafts[index]).length >
                        600
                    }
                  >
                    Append edit
                  </Button>
                  <Button
                    type="button"
                    className="demo-button quiet"
                    disabled={!text || snapshot.operations >= 600}
                    onClick={() => act('delete', index)}
                  >
                    Delete last character
                  </Button>
                </div>
              </form>
            </section>
          ))}
        </div>
        <p className="demo-explanation" aria-live="polite">
          {notice}{' '}
          <strong>
            {snapshot.texts[0] === snapshot.texts[1]
              ? 'Documents match.'
              : 'Documents differ while delivery is paused.'}
          </strong>
        </p>
        <p className="demo-footnote">
          Runs the repository’s RGA-style CRDT. Reconnect delivers pending
          operations out of order and twice; it does not copy one pane over the
          other. No server, encryption, or persistence in this isolated demo.
          Limited to 600 edit operations; reset to start again.
        </p>
      </div>
    </div>
  );
}

const raftSteps = [
  {
    title: 'A healthy majority',
    text: 'Node A is leader in term 4. All nodes have applied committed index 7.',
    roles: ['Leader', 'Follower', 'Follower'],
    indexes: [7, 7, 7],
    terms: [4, 4, 4],
  },
  {
    title: 'The leader stops',
    text: 'Node A is unavailable. No successful new write is shown before the remaining nodes elect a leader.',
    roles: ['Offline', 'Follower', 'Follower'],
    indexes: [7, 7, 7],
    terms: [4, 4, 4],
  },
  {
    title: 'The majority elects B',
    text: 'B and C form a majority. B wins a new term; the diagram omits timing and protocol messages.',
    roles: ['Offline', 'Leader', 'Follower'],
    indexes: [7, 7, 7],
    terms: [4, 5, 5],
  },
  {
    title: 'A new entry commits',
    text: 'B replicates a term-5 entry to C. Two acknowledgements form a majority, so committed index 8 can be applied.',
    roles: ['Offline', 'Leader', 'Follower'],
    indexes: [7, 8, 8],
    terms: [4, 5, 5],
  },
  {
    title: 'The old leader catches up',
    text: 'A rejoins, observes the newer term, and becomes a follower. Replication brings it to committed index 8.',
    roles: ['Follower', 'Leader', 'Follower'],
    indexes: [8, 8, 8],
    terms: [5, 5, 5],
  },
];
export function RaftDemo() {
  const [step, setStep] = useState(0);
  const state = raftSteps[step];
  return (
    <div className="demo-panel raft-demo">
      <div className="demo-top">
        <span className="demo-brand">RaftKV / failure walkthrough</span>
        <span className="demo-mode">Illustration · not a live cluster</span>
      </div>
      <div className="demo-body">
        <div className="raft-nodes">
          {state.roles.map((role, index) => (
            <div key={index} className={`raft-node ${role.toLowerCase()}`}>
              <span>Node {['A', 'B', 'C'][index]}</span>
              <strong>{role}</strong>
              <dl>
                <div>
                  <dt>Term</dt>
                  <dd>{state.terms[index]}</dd>
                </div>
                <div>
                  <dt>Committed</dt>
                  <dd>{state.indexes[index]}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <div className="raft-caption" aria-live="polite">
          <p className="demo-eyebrow">
            STEP {step + 1} / {raftSteps.length}
          </p>
          <h3>{state.title}</h3>
          <p>{state.text}</p>
        </div>
        <div className="demo-controls">
          <Button
            className="demo-button quiet"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Previous
          </Button>
          <Button
            className="demo-button"
            disabled={step === raftSteps.length - 1}
            onClick={() => setStep((value) => value + 1)}
          >
            Next step →
          </Button>
          <Button className="demo-button quiet" onClick={() => setStep(0)}>
            Reset
          </Button>
        </div>
        <p className="demo-footnote">
          A fixed educational sequence, not the Java consensus engine or a
          benchmark. For actual execution, use the linked live-cluster test and
          protocol trace viewer in the repository. No failover time is measured
          here.
        </p>
      </div>
    </div>
  );
}
