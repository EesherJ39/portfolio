const github = 'https://github.com/EesherJ39';

// Evidence links are pinned to the commit each write-up was checked against.
export const revisions = {
  triageci: '244d51eee8b5f6374278b32bd74e4f165594f47d',
  raftkv: '54dbc2d18d526ab4f34fca4e8a812130d2fc9eea',
  synclab: '0b657aff3f07bf3bca54bee4aa6d9c7fa62306d2',
};

type Fact = { value: string; label: string; context: string };
type FlowStep = { label: string; detail: string; parallel?: number };
type Section = { title: string; text: string };

export type Project = {
  name: string;
  repo: string;
  year: string;
  stack: string[];
  tagline: string;
  summary: string;
  facts: Fact[];
  problem: string[];
  demoIntro: string;
  flow: FlowStep[];
  decisions: Section[];
  testing: string[];
  limitations: string;
  next: string;
  links: { label: string; path: string }[];
};

export type ProjectSlug = 'triageci' | 'raftkv' | 'synclab';

export const projects: Record<ProjectSlug, Project> = {
  triageci: {
    name: 'TriageCI',
    repo: 'TriageCI',
    year: '2026',
    stack: ['TypeScript', 'Node.js', 'SQLite', 'Docker', 'GitHub Actions'],
    tagline:
      'A service that reads your CI test history and tells you whether a failing test is flaky or actually broken.',
    summary:
      'It takes test reports from GitHub Actions or JUnit XML, queues them, and classifies every test from its pass/fail history. In stress tests with 64 concurrent clients it handled about 12,000 test results a second and caught every flaky test and regression I had planted.',
    facts: [
      {
        value: '375,000',
        label: 'test results processed with zero failures',
        context: 'three local stress runs',
      },
      {
        value: '12,261/s',
        label: 'median throughput',
        context: 'test results per second on my desktop',
      },
      {
        value: '8 of 8',
        label: 'planted flaky tests and regressions found',
        context: 'in every run',
      },
    ],
    problem: [
      'When a CI test fails, the code might be broken, the test might be flaky, or the CI machine might have had a bad day. Most teams press re-run until the build goes green, which throws away exactly the information you need to tell those cases apart.',
      'TriageCI keeps every result. For each test it tracks the pass/fail mix, how often the result flips, the length of the current failure streak, and whether the test both passed and failed on the same commit. From that it labels the test stable, flaky, regressed or consistently failing, and it shows you the numbers behind the label.',
      'I built the ingestion API, report validation, duplicate protection, the worker queue, the analyzer, the dashboard and the JUnit converter.',
    ],
    demoIntro:
      'This is the classification code from the repo, running in your browser on sample data. Pick a test, then add passing or failing runs and watch the label change.',
    flow: [
      {
        label: 'GitHub Actions or any CI',
        detail: 'sends a JSON report, or JUnit XML through the converter',
      },
      {
        label: 'API',
        detail: 'checks the token or webhook signature and drops replayed reports',
      },
      { label: 'Bounded queue', detail: 'answers 429 when it is full' },
      { label: 'Analyzer', detail: 'one SQLite transaction per report' },
      {
        label: 'Dashboard, REST API, Prometheus',
        detail: 'every label comes with its counts',
      },
    ],
    decisions: [
      {
        title: 'SQLite in WAL mode',
        text: 'This is a single-machine tool and I wanted it to be trivial to run. WAL mode lets the dashboard read while the analyzer writes, and per-test statistics live in their own table so dashboard queries stay cheap. The cost is that every write goes through one writer, which puts a ceiling on how far it scales.',
      },
      {
        title: 'Pushing back when overloaded',
        text: 'The API puts each report on a bounded queue and answers 202 Accepted. When the queue is full it answers 429 and the CI job retries later, so the server never holds more work than it can process. A separate delivery record shows when a report has actually been analyzed.',
      },
      {
        title: 'A classifier you can read',
        text: 'The labels come from a handful of counts, and that is deliberate. You can look at any label and see exactly why it was given. TriageCI never quarantines a test on its own; what to do about a flaky test is left to the team.',
      },
      {
        title: 'Safe retries from CI',
        text: 'CI systems retry uploads. Each report carries an idempotency key tied to a hash of its contents, so the same report sent twice is stored once, even across a restart. A different report reusing the same key gets a 409 and cannot overwrite history.',
      },
    ],
    testing: [
      'I ran three stress tests against a fresh database. Each sent 5,000 reports of 25 tests from 64 concurrent clients, with four workers processing them. I planted five flaky tests and three regressions in the data. Every run found all eight, and all 300 replayed deliveries were deduplicated.',
      'Median throughput was 490 reports a second, or 12,261 individual test results a second. That was on my desktop (Intel i7-13700K, 32 GB RAM, Windows 11, Node 24) over localhost, so it measures the code and not a production deployment.',
    ],
    limitations:
      'The queue lives in memory. If the process crashes, reports that were accepted but not yet processed stay incomplete. The delivery ledger shows which ones, but nothing retries them automatically; that would need a durable message broker. It also only runs on one machine.',
    next: 'I would most like to run it with a real team for a few weeks and compare its labels with what the developers think, especially the false positives.',
    links: [
      { label: 'Benchmark setup and results', path: 'docs/BENCHMARK.md' },
      { label: 'Design notes', path: 'docs/DESIGN.md' },
      { label: 'Analyzer source', path: 'src/analyzer.ts' },
      { label: 'Stress test script', path: 'scripts/stress.mjs' },
      { label: 'Security notes', path: 'SECURITY.md' },
    ],
  },
  raftkv: {
    name: 'RaftKV',
    repo: 'raft-kv',
    year: '2026',
    stack: ['Java 17', 'C11', 'JNI', 'Python', 'Docker'],
    tagline:
      'A three-node key-value store that stays consistent when servers crash or get cut off from each other.',
    summary:
      'I implemented the Raft consensus algorithm in Java without a library, and wrote the storage layer in C. I tested it against 1,000 seeded failure scenarios. In a live run where I killed the leader, the other two nodes elected a new one in 186 ms.',
    facts: [
      {
        value: '1,000',
        label: 'seeded failure scenarios',
        context: 'partitions, crashes, restarts, duplicate messages',
      },
      {
        value: '21,621',
        label: 'writes committed across those scenarios',
        context: 'every node converged',
      },
      {
        value: '186 ms',
        label: 'to elect a new leader after killing the old one',
        context: 'one recorded live run',
      },
    ],
    problem: [
      'Raft is the consensus algorithm behind etcd and Consul. The paper is readable, but the hard parts only show up when things go wrong: a leader that has been cut off from the others and does not know it yet, or a follower that restarts holding log entries nobody else has. I wanted to build it from scratch and then go after exactly those cases.',
      'I wrote the consensus logic in Java: leader election, log replication, majority commits, quorum-checked reads, log repair and snapshots. Committed writes also go to a small write-ahead log written in C and called through JNI. To test it I built a deterministic fault simulator and a checker that verifies the history of reads and writes is linearizable.',
    ],
    demoIntro:
      'A step-by-step look at what happens when the leader fails. This one is a hand-built illustration, not the Java code running. The repo has a live trace viewer for that.',
    flow: [
      { label: 'Client', detail: 'GET and PUT over HTTP' },
      {
        label: 'Leader',
        detail: 'refuses requests if it cannot reach a majority',
      },
      { label: 'Follower', detail: 'AppendEntries', parallel: 2 },
      { label: 'Commit', detail: 'once a majority has the entry' },
      {
        label: 'Java state + C write-ahead log',
        detail: 'CRC32 checksums, fsync before apply',
      },
    ],
    decisions: [
      {
        title: 'Reads check for a quorum',
        text: 'A leader can be cut off from the others and still believe it is in charge. If it answered reads from memory it could hand out stale data. In RaftKV a leader only answers a read after it has committed an entry in its current term and heard back from a majority.',
      },
      {
        title: 'Followers acknowledge only what matched',
        text: 'A follower acknowledges the part of the log that matched the leader’s request, and nothing it happened to have beyond that. When logs disagree, the follower sends back the conflicting term and index so the leader can jump to the right spot instead of backing up one entry at a time.',
      },
      {
        title: 'Two kinds of storage',
        text: 'Raft’s own state (term, vote, log and snapshots) is written to checksummed files. Committed commands also go through JNI into the C write-ahead log, which calls fsync before updating its in-memory index. On recovery, the Raft state is the source of truth.',
      },
      {
        title: 'Easy to follow over fast',
        text: 'One mutex protects all of the protocol state, and network calls happen outside it. Replication is synchronous and the full state is persisted each time. That keeps the code easy to reason about, and it is the main reason throughput is low.',
      },
    ],
    testing: [
      'The fault simulator runs 1,000 seeded scenarios. Each one mixes network partitions, crashed and restarted followers, isolated old leaders, new elections and duplicated messages, then heals the network and checks that every node ends up with the same data. Across all of them, 21,621 writes were committed.',
      'A separate live test starts three real JVM processes on Linux, sends concurrent reads and writes, kills the leader and restarts it. In the run I recorded (WSL2, September 3, 2026) a new leader took over in 186 ms and all 60 operations passed the linearizability check. That is a single run, so I do not treat 186 ms as a typical number.',
    ],
    limitations:
      'Membership is fixed at three nodes. Replication is sequential, clients cannot safely retry a write because there is no request deduplication, and there is no TLS or authentication. I have not run long soak tests or simulated disk failures either. It is a learning project, not a database to deploy.',
    next: 'Next I would add client request deduplication, batch writes to disk instead of persisting the whole state each time, and replicate to followers in parallel.',
    links: [
      { label: 'Recorded results', path: 'README.md' },
      { label: 'Safety rules and storage design', path: 'docs/DESIGN.md' },
      { label: 'How the fault tests work', path: 'docs/TESTING.md' },
      { label: 'C write-ahead log', path: 'c/kvstore.c' },
      { label: 'Known limitations', path: 'docs/LIMITATIONS.md' },
    ],
  },
  synclab: {
    name: 'SyncLab',
    repo: 'SyncLab',
    year: '2026',
    stack: ['TypeScript', 'React', 'C#', 'ASP.NET Core', 'WebSockets'],
    tagline:
      'A collaborative editor that keeps working offline, merges everyone’s changes on reconnect, and encrypts text before it leaves the browser.',
    summary:
      'Edits are merged with a CRDT, so two people can type at once, lose their connection and still end up with the same document. The relay server only ever sees ciphertext. In a benchmark it delivered 20,000 messages to five clients with none lost, duplicated or out of order.',
    facts: [
      {
        value: '200',
        label: 'randomized convergence trials, all converged',
        context: '250 operations across 5 replicas each',
      },
      {
        value: '100,000',
        label: 'WebSocket deliveries, none lost or reordered',
        context: '20,000 messages to 5 clients',
      },
      {
        value: '30,000',
        label: 'encrypt and decrypt round trips',
        context: 'zero mismatches',
      },
    ],
    problem: [
      'Real-time editors usually assume a steady connection. Real networks are messier: an insert can arrive before the text it depends on, a delete can arrive before the thing it deletes, and a reconnect can resend something the other side already has.',
      'SyncLab handles that with a CRDT, a data structure where every edit has a unique ID and edits can be applied in any order and still produce the same document. I built the editor, wired in the CRDT, wrote the offline outbox that replays edits after a disconnect, and added AES-GCM encryption so the server never sees the text. I also fixed the out-of-order and duplicate-delivery handling and wrote tests for convergence and relay ordering.',
    ],
    demoIntro:
      'Two copies of a document running the CRDT code from the repo. Disconnect them, type something different in each, then reconnect. Reconnecting replays the queued edits in reverse order and sends each one twice, and the two copies still end up identical.',
    flow: [
      { label: 'React editor', detail: 'edits apply locally right away' },
      { label: 'CRDT', detail: 'RGA-style; every edit has an ID' },
      {
        label: 'AES-256-GCM + outbox',
        detail: 'kept in browser storage until confirmed',
      },
      {
        label: 'ASP.NET Core relay',
        detail: 'orders messages per room and sees only ciphertext',
      },
      { label: 'Other clients', detail: 'decrypt and apply' },
    ],
    decisions: [
      {
        title: 'Every edit has an ID',
        text: 'Replicas remember which operation IDs they have applied, so a duplicate does nothing. If an operation arrives before the one it depends on, it waits in a queue until the dependency shows up.',
      },
      {
        title: 'Editing keeps working offline',
        text: 'Local edits apply immediately. Anything the server has not confirmed sits in an encrypted outbox in browser storage and is sent again on reconnect, even after a page refresh.',
      },
      {
        title: 'The server cannot read the document',
        text: 'The room key lives in the URL fragment (the part after #), which browsers never send to the server. The relay stores and forwards ciphertext. It can still see room IDs, timing and who sent each message, so the encryption protects the text but not that metadata.',
      },
      {
        title: 'Ordering is enforced on the server',
        text: 'The relay reassembles fragmented WebSocket messages up to a size limit, serializes sends on each socket, and stamps every message in a room with an increasing sequence number. A simple broadcast loop gets each of those wrong under load.',
      },
    ],
    testing: [
      'A Python stress model runs 200 trials. Each trial applies 250 operations across five replicas while temporarily dropping 20% of messages and duplicating 10%. It then delivers everything in shuffled order and checks that all five replicas hold the same document.',
      'For the relay, a benchmark sent 20,000 messages to five connected clients, 100,000 deliveries in total, with none missing, duplicated or out of order. A separate check encrypted and decrypted 30,000 operations and compared each result with the original, with zero mismatches.',
    ],
    limitations:
      'Room history lives in the relay’s memory, anyone with the room link can join, and each client keeps only its latest 5,000 events. Real use would need logins, durable storage, key rotation and history compaction.',
    next: 'The next step is authenticated membership and durable room history, then checking that the offline and convergence guarantees still hold once those are in place.',
    links: [
      { label: 'Architecture and privacy notes', path: 'README.md' },
      { label: 'CRDT source', path: 'frontend/src/crdt/crdt.ts' },
      { label: 'CRDT test cases', path: 'frontend/src/crdt/crdt.test.ts' },
      { label: 'Convergence stress model', path: 'tests/fuzz_crdt.py' },
      { label: 'WebSocket integration test', path: 'tests/chaos_ws.py' },
    ],
  },
};

export const projectOrder: ProjectSlug[] = ['triageci', 'raftkv', 'synclab'];

export function repoUrl(slug: ProjectSlug) {
  return `${github}/${projects[slug].repo}`;
}
export function evidenceUrl(slug: ProjectSlug, path: string) {
  return `${repoUrl(slug)}/blob/${revisions[slug]}/${path}`;
}
