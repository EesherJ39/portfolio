import {
  ArrowDown,
  ArrowUpRight,
  CircleCheck,
  Code,
  ContactRound,
  Mail,
  Network,
} from 'lucide-react';
import { TriageDemo } from './project-demos';
import Link from 'next/link';

const projects = [
  {
    number: '01',
    name: 'TriageCI',
    eyebrow: 'Developer infrastructure',
    description:
      'A self-hosted CI failure-intelligence service that turns noisy test failures into explainable flaky-test and regression signals.',
    result: '12,261',
    unit: 'observations / second · local median',
    evidence:
      '375,000 observations processed across three local 64-client stress runs with zero processing failures. Detected every seeded flaky test and regression in all three runs.',
    details: [
      'HMAC-authenticated, idempotent ingestion',
      'Bounded worker queue with backpressure',
      'Transactional SQLite WAL storage',
      'Prometheus metrics and GitHub webhooks',
    ],
    stack: ['TypeScript', 'Node.js', 'SQLite', 'Docker'],
    slug: 'triageci',
    href: 'https://github.com/EesherJ39/TriageCI',
    accent: 'cobalt',
  },
  {
    number: '02',
    name: 'RaftKV',
    eyebrow: 'Distributed systems',
    description:
      'A three-node, crash-recoverable key-value store built from scratch to make Raft’s hardest failure modes observable and testable.',
    result: '1,000',
    unit: 'seeded fault scenarios',
    evidence:
      'Exercised partitions, crash/restart, duplicate delivery, and recovery. A separate local WSL2 live-cluster run observed 186 ms failover.',
    details: [
      'Majority commits and linearizable reads',
      'Conflict-hint log repair and snapshots',
      'C11/JNI write-ahead log with CRC32',
      'Torn-tail recovery and fault injection',
    ],
    stack: ['Java', 'C11', 'JNI', 'Python', 'Docker'],
    slug: 'raftkv',
    href: 'https://github.com/EesherJ39/raft-kv',
    accent: 'amber',
  },
  {
    number: '03',
    name: 'SyncLab',
    eyebrow: 'Local-first software',
    description:
      'An encrypted collaborative editor that keeps accepting edits offline, converges after reconnect, and keeps document contents opaque to the relay.',
    result: '250K',
    unit: 'replica-operation observations',
    evidence:
      '200 randomized trials × 250 operations × five replicas. Temporary message loss and duplicates are followed by an anti-entropy pass that checks replica convergence.',
    details: [
      'Operation-based CRDT and anti-entropy',
      'Persistent encrypted outbox replay',
      'Ordered ASP.NET Core WebSocket relay',
      'Out-of-order and duplicate delivery tests',
    ],
    stack: ['C#', 'ASP.NET Core', 'React', 'TypeScript'],
    slug: 'synclab',
    href: 'https://github.com/EesherJ39/SyncLab',
    accent: 'mint',
  },
];

const capabilities = [
  {
    title: 'Distributed systems',
    text: 'Raft consensus, CRDTs, replication, recovery, linearizability, and failure-oriented design.',
  },
  {
    title: 'Backend & data',
    text: 'Node.js, ASP.NET Core, REST, WebSockets, PostgreSQL, SQLite, Redis, indexing, and observability.',
  },
  {
    title: 'Delivery & quality',
    text: 'Docker, Linux, GitHub Actions, fault injection, load testing, Jest, Vitest, and clear engineering docs.',
  },
];

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Eesher Janda, home">
          EJ<span>.</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
        </nav>
        <a
          className="header-cta"
          href="/Eesher_Janda_Resume.pdf"
          target="_blank"
          rel="noreferrer"
        >
          View résumé <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">
            <span /> Software engineer · Toronto, Canada
          </p>
          <h1>
            Eesher Janda
            <span className="hero-specialty">
              Software engineering.
              <br />
              <em>Systems & developer tools.</em>
            </span>
          </h1>
          <p className="hero-lede">
            I build developer tools and distributed systems, with a focus on
            reliability and performance. My work spans CI failure analysis,
            crash-recoverable storage, and offline collaboration.
          </p>
          <p className="hero-education">
            University of Guelph · B.Sc. Computer Science · May 2028
          </p>
          <p className="availability">
            Seeking software engineering internships & co-ops
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#work">
              Selected work <ArrowDown size={16} aria-hidden="true" />
            </a>
            <a
              className="button secondary"
              href="/Eesher_Janda_Resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              View résumé <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="button secondary"
              href="https://github.com/EesherJ39"
              target="_blank"
              rel="noreferrer"
            >
              <Code size={17} aria-hidden="true" /> GitHub
            </a>
          </div>
        </div>
        <aside
          className="hero-product"
          aria-label="Interactive TriageCI analyzer"
        >
          <TriageDemo compact />
        </aside>
      </section>

      <section className="proof-strip" aria-label="Profile highlights">
        <div>
          <strong>3.8 / 4.0</strong>
          <span>GPA · University of Guelph</span>
        </div>
        <div>
          <strong>375K</strong>
          <span>CI observations · local stress tests</span>
        </div>
        <div>
          <strong>1,000</strong>
          <span>seeded Raft fault scenarios</span>
        </div>
        <div>
          <strong>12s → 6s</strong>
          <span>report P95 latency · Codentrel internship</span>
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="section-heading">
          <p className="section-index">01 / Selected work</p>
          <h2>
            Built. Tested.
            <br />
            Explained.
          </h2>
          <p>
            Three engineering projects, with interactive demonstrations, design
            decisions, and reproducible test results.
          </p>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <article
              className={`project-card ${project.accent}`}
              key={project.name}
            >
              <div className="project-topline">
                <span>{project.number}</span>
                <span>{project.eyebrow}</span>
                <Network size={18} aria-hidden="true" />
              </div>
              <div className="project-grid">
                <div className="project-copy">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <ul>
                    {project.details.map((detail) => (
                      <li key={detail}>
                        <CircleCheck size={15} aria-hidden="true" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="project-proof">
                  <p className="proof-label">Measured result</p>
                  <strong>{project.result}</strong>
                  <span>{project.unit}</span>
                  <p>{project.evidence}</p>
                </div>
              </div>
              <div className="project-footer">
                <div className="stack-list">
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="project-links">
                  <Link href={`/projects/${project.slug}`}>
                    Explore project{' '}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    Source code ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section experience-section" id="experience">
        <div className="section-heading compact">
          <p className="section-index">02 / Experience</p>
          <h2>Engineering with impact.</h2>
        </div>
        <article className="experience-card">
          <div className="experience-meta">
            <p>Codentrel</p>
            <span>Software Engineering Intern</span>
            <time>Jun — Sep 2025</time>
          </div>
          <div className="experience-content">
            <h3>Reporting in half the time.</h3>
            <p>
              Built a React analytics dashboard for <strong>50+ KPIs</strong>,
              replacing recurring Excel aggregation for internal analysts.
              Removed N+1 queries and added PostgreSQL composite indexes to cut
              report P95 latency from <strong>12 seconds to 6</strong>.
            </p>
            <p className="ownership">
              Owned drill-down views, date filters, and CSV export from scoping
              through release. Added WebSockets with Redis pub/sub and a
              Jest/React Testing Library suite reaching 85% coverage.
            </p>
            <div className="impact-grid">
              <div>
                <strong>2.25×</strong>
                <span>
                  report throughput
                  <br />8 → 18 req/s
                </span>
              </div>
              <div>
                <strong>50%</strong>
                <span>
                  lower P95 latency
                  <br />
                  12s → 6s
                </span>
              </div>
              <div>
                <strong>&lt;500ms</strong>
                <span>
                  live refresh
                  <br />
                  via WebSockets
                </span>
              </div>
              <div>
                <strong>8</strong>
                <span>
                  defects caught
                  <br />
                  before production
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="section about-section" id="about">
        <div className="about-intro">
          <p className="section-index">03 / About</p>
          <h2>Beyond the code.</h2>
          <p>
            I study Computer Science at the University of Guelph, where I’ve
            earned a 3.8 GPA and Dean’s Honour List recognition. I’m most drawn
            to software where correctness, performance, and clear reasoning all
            matter.
          </p>
          <p>
            As a volunteer with{' '}
            <strong>Google Developer Groups on Campus at Guelph</strong>, I help
            coordinate technical workshops and hackathons, then participate in
            team-based coding challenges and project demonstrations.
          </p>
          <p>
            I enjoy the full engineering process: understanding the problem,
            implementing a solution, and testing the assumptions behind it.
          </p>
        </div>
        <div className="capability-list">
          {capabilities.map((capability, index) => (
            <article key={capability.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <p className="section-index">04 / Contact</p>
        <h2>Let’s build something useful.</h2>
        <p>
          I’m looking for software engineering internships and co-ops,
          especially in backend systems, developer tools, and full-stack
          engineering. Based in Toronto, Canada.
        </p>
        <div className="contact-actions">
          <a className="button light" href="mailto:eeshersjanda@gmail.com">
            <Mail size={17} aria-hidden="true" /> Email me
          </a>
          <a
            href="https://www.linkedin.com/in/eesher-singh-janda-b8439434a"
            target="_blank"
            rel="noreferrer"
          >
            <ContactRound size={17} aria-hidden="true" /> LinkedIn
          </a>
          <a
            href="https://github.com/EesherJ39"
            target="_blank"
            rel="noreferrer"
          >
            <Code size={17} aria-hidden="true" /> GitHub
          </a>
        </div>
      </section>
      <footer>
        <p>Designed and built by Eesher Janda.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
