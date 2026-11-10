'use client';

import { useRef, useState } from 'react';
import { analyze, type TestStatus } from '@/lib/demos/triage';
import { SyncSession } from '@/lib/demos/sync';

const histories: { name: string; runs: ('P' | 'F')[] }[] = [
  { name: 'checkout.applies_discount', runs: ['P', 'P', 'F', 'P', 'F', 'P', 'F', 'P'] },
  { name: 'auth.refreshes_session', runs: ['P', 'P', 'P', 'P', 'P', 'F', 'F', 'F'] },
  { name: 'api.returns_account', runs: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
];

const explanations: Record<string, string> = {
  flaky: 'It keeps flipping between pass and fail without a code change in between, so it looks flaky.',
  regression:
    'It passed reliably, then started failing and has stayed failing. Something probably broke.',
  stable: 'Every run passed.',
  'consistently-failing': 'Every run failed. This test has never worked in this history.',
  'insufficient-data': 'Not enough runs to say anything yet.',
};

function toRuns(runs: ('P' | 'F')[]): TestStatus[] {
  return runs.map((run) => (run === 'P' ? 'passed' : 'failed'));
}

export function TriageDemo() {
  const [selected, setSelected] = useState(0);
  const [custom, setCustom] = useState<TestStatus[] | null>(null);
  const history = custom ?? toRuns(histories[selected].runs);
  const stats = analyze(history);
  const add = (status: TestStatus) => setCustom([...history, status].slice(-64));
  return (
    <div className="demo">
      <div className="demo-bar">
        <span>TriageCI analyzer</span>
        <span>runs in your browser · sample data</span>
      </div>
      <div className="demo-body">
        <fieldset className="test-picker">
          <legend>Pick a test</legend>
          {histories.map((row, i) => {
            const label =
              i === selected ? stats.state : analyze(toRuns(row.runs)).state;
            return (
              <button
                type="button"
                key={row.name}
                className="test-option"
                aria-pressed={i === selected}
                onClick={() => {
                  setSelected(i);
                  setCustom(null);
                }}
              >
                <code>{row.name}</code>
                <span className={`verdict ${label}`}>{label.replace('-', ' ')}</span>
              </button>
            );
          })}
        </fieldset>
        <div className="runs runs-large" aria-hidden="true">
          {history.slice(-16).map((state, i) => (
            <span key={i} className={state === 'passed' ? 'run pass' : 'run fail'} />
          ))}
        </div>
        <p className="sr-only">
          Latest results, oldest first: {history.slice(-16).join(', ')}.
        </p>
        <p className="demo-result" aria-live="polite">
          <strong className={`verdict ${stats.state}`}>
            {stats.state.replace('-', ' ')}
          </strong>{' '}
          {explanations[stats.state]}
        </p>
        <dl className="demo-counts">
          <div>
            <dt>Runs</dt>
            <dd>{stats.totalRuns}</dd>
          </div>
          <div>
            <dt>Pass/fail flips</dt>
            <dd>{stats.transitions}</dd>
          </div>
          <div>
            <dt>Current failure streak</dt>
            <dd>{stats.failureStreak}</dd>
          </div>
        </dl>
        <div className="demo-actions">
          <button type="button" onClick={() => add('passed')}>
            Add a passing run
          </button>
          <button type="button" onClick={() => add('failed')}>
            Add a failing run
          </button>
          <button type="button" className="quiet" onClick={() => setCustom(null)}>
            Reset
          </button>
        </div>
        <p className="demo-note">
          This is the analyzer’s scoring code copied from the repo. The real
          service also looks at reruns on the same commit and groups failures by
          stack trace, which this demo leaves out. It keeps the last 64 runs and
          shows the last 16.
        </p>
      </div>
    </div>
  );
}

export function SyncDemo() {
  const session = useRef<SyncSession | null>(null);
  const [snapshot, setSnapshot] = useState(() => new SyncSession().snapshot());
  const [drafts, setDrafts] = useState([' Hello from A.', ' Hello from B.']);
  const [notice, setNotice] = useState(
    'Start by disconnecting, then add a different edit on each side.',
  );
  function act(action: 'append' | 'delete' | 'network' | 'reset', replica = 0) {
    const current = session.current ?? (session.current = new SyncSession());
    if (action === 'reset') {
      session.current = new SyncSession();
      setSnapshot(session.current.snapshot());
      setNotice('Back to the starting document.');
      return;
    }
    if (action === 'network') {
      if (current.connected) {
        current.disconnect();
        setNotice('Disconnected. Both sides can still edit.');
      } else {
        current.reconnect();
        setNotice('Reconnected. Queued edits were replayed backwards, each one twice.');
      }
    } else if (action === 'append') {
      current.append(replica, drafts[replica]);
      setNotice(`Added text on ${replica === 0 ? 'A' : 'B'}.`);
    } else {
      current.backspace(replica);
      setNotice(`Deleted the last character on ${replica === 0 ? 'A' : 'B'}.`);
    }
    setSnapshot(current.snapshot());
  }
  const match = snapshot.texts[0] === snapshot.texts[1];
  return (
    <div className="demo">
      <div className="demo-bar">
        <span>SyncLab, two replicas</span>
        <span>real CRDT · simulated network</span>
      </div>
      <div className="demo-body">
        <div className="demo-actions">
          <button type="button" onClick={() => act('network')}>
            {snapshot.connected ? 'Disconnect' : 'Reconnect'}
          </button>
          <button type="button" className="quiet" onClick={() => act('reset')}>
            Reset
          </button>
          <span className={`net-status ${snapshot.connected ? 'online' : 'offline'}`}>
            {snapshot.connected
              ? 'Connected'
              : `Offline · ${snapshot.pending} operation${snapshot.pending === 1 ? '' : 's'} queued`}
          </span>
        </div>
        <div className="replicas">
          {snapshot.texts.map((text, index) => {
            const name = index === 0 ? 'A' : 'B';
            return (
              <section className="replica" key={name} aria-label={`Replica ${name}`}>
                <h3>Replica {name}</h3>
                <output className="replica-text">{text || '(empty)'}</output>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    act('append', index);
                  }}
                >
                  <label htmlFor={`draft-${index}`}>Text to add</label>
                  <input
                    id={`draft-${index}`}
                    maxLength={60}
                    value={drafts[index]}
                    onChange={(event) =>
                      setDrafts((values) =>
                        values.map((value, i) => (i === index ? event.target.value : value)),
                      )
                    }
                  />
                  <div className="demo-actions">
                    <button
                      type="submit"
                      disabled={
                        !drafts[index] ||
                        snapshot.operations + Array.from(drafts[index]).length > 600
                      }
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="quiet"
                      disabled={!text || snapshot.operations >= 600}
                      onClick={() => act('delete', index)}
                    >
                      Backspace
                    </button>
                  </div>
                </form>
              </section>
            );
          })}
        </div>
        <p className="demo-result" aria-live="polite">
          {notice}{' '}
          <strong className={match ? 'ok' : 'warn'}>
            {match ? 'The documents match.' : 'The documents differ.'}
          </strong>
        </p>
        <p className="demo-note">
          The merge logic is the RGA-style CRDT from the SyncLab repo. The
          network, server, encryption and storage are left out so you can see
          the merge on its own. Capped at 600 edits; reset to start over.
        </p>
      </div>
    </div>
  );
}

const raftSteps = [
  {
    title: 'Everything is healthy',
    text: 'A is the leader in term 4. All three nodes have committed up to entry 7.',
    roles: ['leader', 'follower', 'follower'],
    committed: [7, 7, 7],
    terms: [4, 4, 4],
  },
  {
    title: 'The leader goes down',
    text: 'A stops responding. Nothing new can be committed until the others pick a new leader.',
    roles: ['down', 'follower', 'follower'],
    committed: [7, 7, 7],
    terms: [4, 4, 4],
  },
  {
    title: 'B and C elect B',
    text: 'B times out first and asks for votes. With C’s vote it has two of three, a majority, so it becomes leader in term 5.',
    roles: ['down', 'leader', 'follower'],
    committed: [7, 7, 7],
    terms: [4, 5, 5],
  },
  {
    title: 'Writes continue',
    text: 'B sends entry 8 to C. Two of three nodes now have it, so it is committed.',
    roles: ['down', 'leader', 'follower'],
    committed: [7, 8, 8],
    terms: [4, 5, 5],
  },
  {
    title: 'A comes back',
    text: 'A restarts, sees that term 5 is newer than its own, and steps down to follower. B sends it entry 8 and it catches up.',
    roles: ['follower', 'leader', 'follower'],
    committed: [8, 8, 8],
    terms: [5, 5, 5],
  },
];

export function RaftDemo() {
  const [step, setStep] = useState(0);
  const state = raftSteps[step];
  return (
    <div className="demo">
      <div className="demo-bar">
        <span>RaftKV, leader failure</span>
        <span>illustration · not a live cluster</span>
      </div>
      <div className="demo-body">
        <div className="raft-nodes">
          {state.roles.map((role, index) => (
            <div key={index} className={`raft-node ${role}`}>
              <span className="node-name">Node {['A', 'B', 'C'][index]}</span>
              <strong>{role}</strong>
              <dl>
                <div>
                  <dt>term</dt>
                  <dd>{state.terms[index]}</dd>
                </div>
                <div>
                  <dt>committed</dt>
                  <dd>{state.committed[index]}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <div className="raft-step" aria-live="polite">
          <p className="step-count">
            Step {step + 1} of {raftSteps.length}
          </p>
          <h3>{state.title}</h3>
          <p>{state.text}</p>
        </div>
        <div className="demo-actions">
          <button
            type="button"
            className="quiet"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </button>
          <button
            type="button"
            disabled={step === raftSteps.length - 1}
            onClick={() => setStep((value) => value + 1)}
          >
            Next step
          </button>
          {step === raftSteps.length - 1 && (
            <button type="button" className="quiet" onClick={() => setStep(0)}>
              Start over
            </button>
          )}
        </div>
        <p className="demo-note">
          A fixed sequence written by hand to explain the protocol. It doesn’t
          run the Java code and measures no timing. The live failover test and
          trace viewer are in the repo.
        </p>
      </div>
    </div>
  );
}
