import { analyze } from '@/lib/demos/triage';
import { SyncSession } from '@/lib/demos/sync';
import { sampleHistories } from '@/lib/demos/samples';

// Small figures for the home page. Each one is computed from the same code the
// project demos use, at build time, so the labels and text are real output.

const stateLabel: Record<string, string> = {
  stable: 'stable',
  flaky: 'flaky',
  regression: 'regression',
  'consistently-failing': 'failing',
  'insufficient-data': 'unclear',
};

export function TriageFigure() {
  return (
    <figure className="fig">
      <table className="runs-table">
        <caption className="sr-only">
          Last twelve CI runs for three sample tests, with TriageCI’s label for
          each.
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Test</th>
            <th scope="col">Runs, oldest first</th>
            <th scope="col">Label</th>
          </tr>
        </thead>
        <tbody>
          {sampleHistories.map((test) => {
            const state = analyze(test.runs).state;
            return (
              <tr key={test.name}>
                <th scope="row">{test.name}</th>
                <td>
                  <span className="runs">
                    {test.runs.map((run, i) => (
                      <span
                        key={i}
                        className={run === 'passed' ? 'run pass' : 'run fail'}
                      >
                        <span className="sr-only">{run}, </span>
                      </span>
                    ))}
                  </span>
                </td>
                <td className={`verdict ${state}`}>{stateLabel[state]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <figcaption>
        Twelve runs of three tests, labelled by TriageCI’s analyzer. The middle
        one passed eight times and then broke; the top one is flaky.
      </figcaption>
    </figure>
  );
}

// Timeline from the recorded live failover test. Positions are percentages of a
// 1.2 second window; only the 186 ms gap is to scale.
const killed = 38;
const elected = killed + (186 / 1200) * 100;
const rejoined = 80;
const lanes: { node: string; spans: { from: number; to: number; role: string }[] }[] =
  [
    {
      node: 'A',
      spans: [
        { from: 0, to: killed, role: 'leader' },
        { from: rejoined, to: 100, role: 'follower' },
      ],
    },
    {
      node: 'B',
      spans: [
        { from: 0, to: elected, role: 'follower' },
        { from: elected, to: 100, role: 'leader' },
      ],
    },
    { node: 'C', spans: [{ from: 0, to: 100, role: 'follower' }] },
  ];

export function RaftFigure() {
  return (
    <figure className="fig">
      <p className="sr-only">
        Node A is leader until it is killed. 186 milliseconds later node B is
        elected leader. Node A later restarts as a follower. Node C stays a
        follower throughout.
      </p>
      <div className="raft-timeline" aria-hidden="true">
        {lanes.map((lane) => (
          <div className="lane" key={lane.node}>
            <span className="lane-name">{lane.node}</span>
            <span className="lane-track">
              {lane.spans.map((span) => (
                <span
                  key={span.from}
                  className={`span ${span.role}`}
                  style={{ left: `${span.from}%`, width: `${span.to - span.from}%` }}
                />
              ))}
              {lane.node === 'A' && (
                <span className="mark kill" style={{ left: `${killed}%` }}>
                  killed
                </span>
              )}
              {lane.node === 'A' && (
                <span className="mark rejoin" style={{ left: `${rejoined}%` }}>
                  restarts
                </span>
              )}
            </span>
          </div>
        ))}
        <div className="lane gap-row" aria-hidden="true">
          <span className="lane-name" />
          <span className="lane-track">
            <span
              className="gap"
              style={{ left: `${killed}%`, width: `${elected - killed}%` }}
            >
              <span>186 ms</span>
            </span>
          </span>
        </div>
      </div>
      <p className="legend" aria-hidden="true">
        <span className="key leader" /> leader <span className="key follower" />{' '}
        follower
      </p>
      <figcaption>
        The live failover test: three JVM processes, leader killed mid-run. Only
        the gap is to scale.
      </figcaption>
    </figure>
  );
}

export function SyncFigure() {
  const session = new SyncSession();
  session.disconnect();
  session.append(0, ' Typed on A.');
  session.append(1, ' Typed on B.');
  const offline = session.snapshot().texts;
  session.reconnect();
  const merged = session.snapshot().texts;
  const rows = [
    { when: 'Offline', texts: offline },
    { when: 'Reconnected', texts: merged },
  ];
  return (
    <figure className="fig">
      <table className="sync-table">
        <caption className="sr-only">
          The same document on two replicas, while disconnected and after
          reconnecting.
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Network state</span>
            </th>
            <th scope="col">Replica A</th>
            <th scope="col">Replica B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.when}>
              <th scope="row">{row.when}</th>
              {row.texts.map((text, i) => (
                <td key={i}>
                  <code>{text}</code>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Real output from SyncLab’s CRDT. On reconnect the queued edits were
        replayed backwards and twice; both copies still match.
      </figcaption>
    </figure>
  );
}
