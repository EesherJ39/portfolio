const github = 'https://github.com/EesherJ39';
export const revisions = {
  triageci: '244d51eee8b5f6374278b32bd74e4f165594f47d',
  raftkv: '54dbc2d18d526ab4f34fca4e8a812130d2fc9eea',
  synclab: '0b657aff3f07bf3bca54bee4aa6d9c7fa62306d2',
};
export const projects = {
  triageci: {
    name: 'TriageCI',
    category: 'Developer infrastructure',
    accent: 'cobalt',
    repo: 'TriageCI',
    title: 'A red build is a symptom. Find the cause.',
    summary:
      'A self-hosted service that turns test history into explainable flaky-test and regression signals—so developers can investigate the right failure.',
    stack: ['TypeScript', 'Node.js', 'SQLite WAL', 'Docker', 'GitHub Actions'],
    numbers: [
      { value: '375,000', label: 'observations · three local stress runs' },
      { value: '12,261/s', label: 'median observation throughput' },
      { value: '0', label: 'processing failures in those runs' },
    ],
    problem:
      'A failed CI test can mean a broken product, an intermittent test, or infrastructure noise. Retrying until the build turns green hides that distinction. TriageCI retains the evidence across runs and groups recurring failure signatures.',
    ownership:
      'I built the ingestion API, report validation, duplicate-delivery protection, bounded worker queue, transactional analyzer, dashboard, and JUnit adapter. The result is an inspectable tool with a complete path from CI report to diagnosis.',
    architecture: [
      'GitHub / JUnit reports',
      'Authentication + idempotency',
      'Bounded worker queue',
      'SQLite WAL + analyzer',
      'Dashboard / API / metrics',
    ],
    decisions: [
      {
        title: 'SQLite WAL instead of a distributed data stack',
        text: 'A single-node tool should be easy to deploy and reason about. WAL lets readers coexist with the transactional writer, while materialized statistics keep the dashboard queries simple. Write serialization is an explicit scaling boundary.',
      },
      {
        title: 'Bounded admission instead of unlimited buffering',
        text: 'The API returns 202 after admitting a report and 429 when the queue is saturated. A separate delivery record exposes completion. Accepting a request is deliberately not described as completing its analysis.',
      },
      {
        title: 'An explainable classifier instead of a black box',
        text: 'Pass/fail diversity, transitions, failure streaks, sample size, and same-commit reruns contribute evidence. The service reports a classification; it does not automatically quarantine tests or claim to identify every root cause.',
      },
      {
        title: 'Content-bound replay protection',
        text: 'An idempotency key is bound to the report digest. A matching replay is deduplicated across restarts; different content under the same key is rejected with 409 rather than quietly overwriting history.',
      },
    ],
    evidence:
      'Three clean-database runs each sent 5,000 reports of 25 tests, using 64 clients and four workers. All five seeded flaky tests and three seeded regressions were surfaced in each run; all 300 replayed deliveries were deduplicated.',
    environment:
      'Recorded environment: Node.js 24.12.0, Windows 11, Intel Core i7-13700K, 32 GB RAM, local loopback, SQLite on local storage. Median throughput was 490.47 reports/s, or 12,261.64 observations/s. The headline truncates to 12,261.',
    boundary:
      'HTTP p95 measures admission, not completed processing. The end-to-end throughput waits for persisted completion. These are synthetic local workloads, not production capacity, customer adoption, or independently audited results.',
    limitations:
      'The queue is in process, so a crash can leave admitted work incomplete. The ledger makes this visible, but automatic leasing and retry need a durable broker. The current design is single-node; multi-node scale would require a different queue and persistence architecture.',
    next: 'The next useful validation is a small opt-in pilot with a real team: compare classifications with developer judgment, inspect false positives, and measure investigation effort. No external adoption or time-savings claim is made yet.',
    links: [
      {
        label: 'Workload, hardware & three-run results',
        path: 'docs/BENCHMARK.md',
      },
      { label: 'Design decisions', path: 'docs/DESIGN.md' },
      { label: 'Analyzer implementation', path: 'src/analyzer.ts' },
      { label: 'Stress harness', path: 'scripts/stress.mjs' },
      { label: 'Security boundaries', path: 'SECURITY.md' },
    ],
  },
  raftkv: {
    name: 'RaftKV',
    category: 'Distributed systems',
    accent: 'amber',
    repo: 'raft-kv',
    title: 'Keeping committed data consistent through failure.',
    summary:
      'A three-node key-value store implementing Raft consensus in Java, with snapshot recovery and a checksummed C11 write-ahead log connected through JNI.',
    stack: ['Java 17', 'C11', 'JNI', 'Python', 'Docker'],
    numbers: [
      { value: '1,000', label: 'seeded fault scenarios' },
      { value: '21,621', label: 'committed writes in the fault campaign' },
      { value: '186 ms', label: 'observed failover · one local live run' },
    ],
    problem:
      'An apparently healthy leader can be isolated from its peers. A restarted follower can carry a stale suffix. A successful response is only meaningful if the implementation respects the commit and durability boundaries through those failures.',
    ownership:
      'I implemented the consensus state machine rather than wrapping a Raft library: persisted elections, replication, majority commits, quorum-checked reads, log repair, and snapshots. I also built the C11/JNI storage boundary and the deterministic fault and history-checking tools.',
    architecture: [
      'HTTP client',
      'Leader + fresh quorum',
      'Replicated Raft log',
      'Majority commit',
      'Java state + C11/JNI WAL',
    ],
    decisions: [
      {
        title: 'Quorum-checked reads instead of trusting a cached leader',
        text: 'A leader serves a successful read only after committing an entry in its current term and reaching a fresh majority. An isolated old leader therefore cannot silently serve a successful stale read.',
      },
      {
        title: 'Matched-prefix acknowledgements',
        text: 'A follower acknowledges only the prefix matched by the current request, not an unrelated suffix it already holds. Conflict-term/index hints let the leader repair mismatches without walking backward one entry at a time.',
      },
      {
        title: 'Separate consensus and state-machine persistence',
        text: 'Checksummed Raft state preserves terms, votes, snapshots, and retained logs. Committed commands also cross JNI into a C WAL that fsyncs before updating its in-memory index. Consensus state remains authoritative for recovery.',
      },
      {
        title: 'Inspectability before throughput',
        text: 'One mutex serializes protocol state, with network calls outside it and response role/term rechecks. Synchronous peer replication and full state-image persistence keep the implementation explicit, but limit throughput.',
      },
    ],
    evidence:
      'The deterministic campaign exercises partitions, follower crashes and restarts, isolated old leaders, replacement elections, duplicates, healing, and final convergence. A separate Linux live-process test asserts native storage, checks a concurrent history, kills the leader, and verifies restart/catch-up.',
    environment:
      'The recorded 186 ms failover is from one WSL2 live-cluster run on September 3, 2026. Its 60/60 operations completed and passed the scoped register-history checker. It is not a median, p95, SLA, or result across all 1,000 scenarios.',
    boundary:
      'The fault harness simulates network faults; the live test terminates real JVM processes. Tests provide evidence for the safety invariants, not a formal proof of Raft correctness or production readiness.',
    limitations:
      'Static membership; sequential replication; no client-operation deduplication; no TLS or authorization; no multi-hour soak or disk-fault campaign. This is an educational systems implementation, not a production database.',
    next: 'The most valuable next steps are client retry deduplication, segmented/group-committed persistence, concurrent replication, and broader fault testing—not adding unrelated API features.',
    links: [
      { label: 'Recorded results & live-run context', path: 'README.md' },
      { label: 'Safety invariants & storage design', path: 'docs/DESIGN.md' },
      { label: 'Fault testing methodology', path: 'docs/TESTING.md' },
      { label: 'Native WAL implementation', path: 'c/kvstore.c' },
      { label: 'Limitations & roadmap', path: 'docs/LIMITATIONS.md' },
    ],
  },
  synclab: {
    name: 'SyncLab',
    category: 'Local-first software',
    accent: 'mint',
    repo: 'SyncLab',
    title: 'Keep editing. Reconnect. Converge.',
    summary:
      'An offline-capable collaborative editor with a TypeScript CRDT, an encrypted persistent outbox, and an ordered ASP.NET Core WebSocket relay.',
    stack: ['C#', 'ASP.NET Core', 'React', 'TypeScript', 'AES-GCM'],
    numbers: [
      { value: '200', label: 'randomized convergence trials' },
      { value: '250K', label: 'replica-operation observations' },
      { value: '5', label: 'replicas in each stress trial' },
    ],
    problem:
      'Real-time editors cannot assume an always-on, ordered connection. A child insert may arrive before its parent, a delete before its target, and a reconnect may replay an operation the peer already applied.',
    ownership:
      'I built the collaborative editor and its operation-based CRDT integration, offline replay path, and encrypted transport. I repaired out-of-order and duplicate handling, then added checks for convergence and relay ordering.',
    architecture: [
      'React editor',
      'RGA-style CRDT',
      'AES-GCM + persisted outbox',
      'Ordered WebSocket relay',
      'Peer decrypts + applies',
    ],
    decisions: [
      {
        title: 'Operation identity instead of arrival-order assumptions',
        text: 'Each operation carries a unique ID. Applied and pending IDs prevent duplicate delivery from duplicating edits. Missing dependencies are queued and replayed when their prerequisite arrives.',
      },
      {
        title: 'An offline outbox instead of disabling editing',
        text: 'Local operations apply optimistically while the encrypted outbox retains unconfirmed work for reconnect. The full app can replay events after refresh; the embedded demo isolates the CRDT mechanism.',
      },
      {
        title: 'Ciphertext relay instead of server-readable documents',
        text: 'The room key is carried in the URL fragment, which is not sent in HTTP or WebSocket requests. The relay handles ciphertext and ordering, while clients decrypt. Room IDs, timing, and sender metadata are still visible to the relay.',
      },
      {
        title: 'Explicit ordering on the relay',
        text: 'Bounded fragmented-message assembly, per-socket send serialization, per-room broadcast ordering, and monotonic sequence numbers address failures that a simple broadcast loop can miss.',
      },
    ],
    evidence:
      'The Python stress model uses 200 trials, 250 operations per trial, five replicas, 20% temporary loss, and 10% duplicate delivery. A shuffled anti-entropy pass then delivers the operations and checks identical materialized state. TypeScript regression tests separately exercise implementation edge cases.',
    environment:
      '250,000 means 200 × 250 × 5 replica-operation observations. It is not 250,000 independent trials or a benchmark of network latency. The stress model and the TypeScript implementation are complementary checks, not the same executable.',
    boundary:
      'The browser demonstration below uses the repository’s TypeScript CRDT with in-memory simulated delivery. It does not run the ASP.NET relay, encryption, or persistent outbox, and it is not a full-stack integration test.',
    limitations:
      'The relay keeps room history in memory, membership is unauthenticated, and the client retains only its latest 5,000 events. Production use would need durable room storage, authorization, key rotation, and compaction.',
    next: 'A useful next stage is authenticated membership and durable room history, followed by a small collaboration pilot. The priority is preserving the offline and convergence properties as those boundaries change.',
    links: [
      { label: 'Architecture, privacy & test scope', path: 'README.md' },
      { label: 'CRDT implementation', path: 'frontend/src/crdt/crdt.ts' },
      {
        label: 'TypeScript regression cases',
        path: 'frontend/src/crdt/crdt.test.ts',
      },
      { label: 'Deterministic stress model', path: 'tests/fuzz_crdt.py' },
      { label: 'WebSocket integration harness', path: 'tests/chaos_ws.py' },
    ],
  },
};
export type ProjectSlug = keyof typeof projects;
export function evidenceUrl(slug: ProjectSlug, path: string) {
  return `${github}/${projects[slug].repo}/blob/${revisions[slug]}/${path}`;
}
