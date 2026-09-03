import { ArrowDown, ArrowUpRight, CircleCheck, Code, ContactRound, Mail, Network } from 'lucide-react';

const projects = [
  {
    number: '01', name: 'TriageCI', eyebrow: 'Developer infrastructure',
    description: 'A self-hosted CI failure-intelligence service that turns noisy test failures into explainable flaky-test and regression signals.',
    result: '12,261', unit: 'observations / second',
    evidence: '375,000 observations processed across three 64-client stress runs with zero processing failures.',
    details: ['HMAC-authenticated, idempotent ingestion', 'Bounded worker queue with backpressure', 'Transactional SQLite WAL storage', 'Prometheus metrics and GitHub webhooks'],
    stack: ['TypeScript', 'Node.js', 'SQLite', 'Docker'], href: 'https://github.com/EesherJ39/TriageCI', accent: 'cobalt',
  },
  {
    number: '02', name: 'RaftKV', eyebrow: 'Distributed systems',
    description: 'A three-node, crash-recoverable key-value store built from scratch to make Raft’s hardest failure modes observable and testable.',
    result: '1,000', unit: 'seeded fault scenarios',
    evidence: '21,621 committed writes, 36,992 blocked RPCs, 17,000+ duplicate deliveries, and a verified 186 ms failover.',
    details: ['Majority commits and linearizable reads', 'Conflict-hint log repair and snapshots', 'C11/JNI write-ahead log with CRC32', 'Torn-tail recovery and fault injection'],
    stack: ['Java', 'C11', 'JNI', 'Python', 'Docker'], href: 'https://github.com/EesherJ39/raft-kv', accent: 'amber',
  },
  {
    number: '03', name: 'SyncLab', eyebrow: 'Local-first software',
    description: 'An encrypted collaborative editor that keeps accepting edits offline, converges after reconnect, and keeps document contents opaque to the relay.',
    result: '250K', unit: 'replica-operation checks',
    evidence: 'Validated convergence over 200 randomized trials with five replicas, 20% temporary loss, and 10% duplicates.',
    details: ['Operation-based CRDT and anti-entropy', 'Persistent encrypted outbox replay', 'Ordered ASP.NET Core WebSocket relay', 'Out-of-order and duplicate delivery tests'],
    stack: ['C#', 'ASP.NET Core', 'React', 'TypeScript'], href: 'https://github.com/EesherJ39/SyncLab', accent: 'mint',
  },
];

const capabilities = [
  { title: 'Distributed systems', text: 'Raft consensus, CRDTs, replication, recovery, linearizability, and failure-oriented design.' },
  { title: 'Backend & data', text: 'Node.js, ASP.NET Core, REST, WebSockets, PostgreSQL, SQLite, Redis, indexing, and observability.' },
  { title: 'Delivery & quality', text: 'Docker, Linux, GitHub Actions, fault injection, load testing, Jest, Vitest, and clear engineering docs.' },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Eesher Janda, home">EJ<span>.</span></a>
        <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#experience">Experience</a><a href="#about">About</a></nav>
        <a className="header-cta" href="mailto:eeshersjanda@gmail.com">Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> Software engineer · Toronto, Canada</p>
          <h1>Distributed systems. Developer infrastructure. <em>Measurable results.</em></h1>
          <p className="hero-lede">I’m Eesher Janda, a Computer Science student who builds and validates reliable software—from Raft consensus and CRDTs to CI intelligence and real-time products.</p>
          <div className="hero-actions">
            <a className="button primary" href="#work">Explore selected work <ArrowDown size={16} aria-hidden="true" /></a>
            <a className="button secondary" href="https://github.com/EesherJ39" target="_blank" rel="noreferrer"><Code size={17} aria-hidden="true" /> GitHub</a>
          </div>
        </div>
        <aside className="hero-console" aria-label="Engineering focus snapshot">
          <div className="console-bar"><span /><span /><span /><p>systems.profile</p></div>
          <div className="console-body">
            <p><span className="prompt">$</span> inspect --engineer eesher</p><div className="console-rule" />
            <dl>
              <div><dt>focus</dt><dd>reliability / systems</dd></div>
              <div><dt>builds</dt><dd>from first principles</dd></div>
              <div><dt>verifies</dt><dd>with evidence</dd></div>
              <div><dt>status</dt><dd className="status"><span /> open to meaningful work</dd></div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Profile highlights">
        <div><strong>3.8 / 4.0</strong><span>GPA · University of Guelph</span></div>
        <div><strong>375K</strong><span>CI observations processed</span></div>
        <div><strong>1,000</strong><span>seeded Raft fault scenarios</span></div>
        <div><strong>85%</strong><span>internship test coverage</span></div>
      </section>

      <section className="section work-section" id="work">
        <div className="section-heading"><p className="section-index">01 / Selected work</p><h2>Proof over promises.</h2><p>Each project starts with a difficult failure mode and ends with reproducible evidence—not just a feature list.</p></div>
        <div className="project-list">
          {projects.map((project) => (
            <article className={`project-card ${project.accent}`} key={project.name}>
              <div className="project-topline"><span>{project.number}</span><span>{project.eyebrow}</span><Network size={18} aria-hidden="true" /></div>
              <div className="project-grid">
                <div className="project-copy">
                  <h3>{project.name}</h3><p>{project.description}</p>
                  <ul>{project.details.map((detail) => <li key={detail}><CircleCheck size={15} aria-hidden="true" />{detail}</li>)}</ul>
                </div>
                <div className="project-proof"><p className="proof-label">Measured result</p><strong>{project.result}</strong><span>{project.unit}</span><p>{project.evidence}</p></div>
              </div>
              <div className="project-footer">
                <div className="stack-list">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
                <a href={project.href} target="_blank" rel="noreferrer">Read the engineering breakdown <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section experience-section" id="experience">
        <div className="section-heading compact"><p className="section-index">02 / Experience</p><h2>Shipped in the real world.</h2></div>
        <article className="experience-card">
          <div className="experience-meta"><p>Codentrel</p><span>Software Engineering Intern</span><time>Jun — Sep 2025</time></div>
          <div className="experience-content">
            <h3>Faster decisions, fewer manual reports.</h3><p>Built and shipped a React analytics dashboard for 50+ KPIs, replacing recurring Excel aggregation for internal analysts.</p>
            <div className="impact-grid">
              <div><strong>2×</strong><span>report throughput<br />8 → 18 req/s</span></div><div><strong>50%</strong><span>lower P95 latency<br />12s → 6s</span></div>
              <div><strong>&lt;500ms</strong><span>live refresh<br />via WebSockets</span></div><div><strong>8</strong><span>defects caught<br />before production</span></div>
            </div>
          </div>
        </article>
      </section>

      <section className="section about-section" id="about">
        <div className="about-intro">
          <p className="section-index">03 / About</p><h2>Curious about the edge cases.</h2>
          <p>I study Computer Science at the University of Guelph, where I’ve earned a 3.8 GPA and Dean’s Honour List recognition. I’m most drawn to software where correctness, performance, and clear reasoning all matter.</p>
          <p>Outside class, I help with Google Developer Groups workshops and hackathons, then put the same build–test–explain loop into my own systems projects.</p>
        </div>
        <div className="capability-list">{capabilities.map((capability, index) => <article key={capability.title}><span>0{index + 1}</span><div><h3>{capability.title}</h3><p>{capability.text}</p></div></article>)}</div>
      </section>

      <section className="contact-section" id="contact">
        <p className="section-index">04 / Contact</p><h2>Have a hard problem worth solving?</h2><p>I’d love to hear about the system, the constraints, and what success looks like.</p>
        <div className="contact-actions">
          <a className="button light" href="mailto:eeshersjanda@gmail.com"><Mail size={17} aria-hidden="true" /> Email me</a>
          <a href="https://www.linkedin.com/in/eesher-singh-janda-b8439434a" target="_blank" rel="noreferrer"><ContactRound size={17} aria-hidden="true" /> LinkedIn</a>
          <a href="https://github.com/EesherJ39" target="_blank" rel="noreferrer"><Code size={17} aria-hidden="true" /> GitHub</a>
        </div>
      </section>
      <footer><p>Designed and built by Eesher Janda.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
