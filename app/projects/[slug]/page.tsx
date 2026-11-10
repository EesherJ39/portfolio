import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  projects,
  revisions,
  evidenceUrl,
  type ProjectSlug,
} from '@/lib/projects';
import { TriageDemo, SyncDemo, RaftDemo } from '@/app/project-demos';

type Props = { params: Promise<{ slug: string }> };
function isProject(slug: string): slug is ProjectSlug {
  return Object.hasOwn(projects, slug);
}
export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isProject(slug)) return {};
  const project = projects[slug];
  return {
    title: `${project.name} — Engineering case study | Eesher Janda`,
    description: project.summary,
    alternates: { canonical: `https://eesherj.com/projects/${slug}` },
    openGraph: {
      title: `${project.name} — Eesher Janda`,
      description: project.summary,
      images: [],
    },
    twitter: {
      card: 'summary',
      title: `${project.name} — Eesher Janda`,
      description: project.summary,
      images: [],
    },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!isProject(slug)) notFound();
  const project = projects[slug];
  return (
    <main className={`case-page ${project.accent}`}>
      <a className="skip-link" href="#demo">
        Skip to demonstration
      </a>
      <header className="site-header">
        <a className="wordmark" href="/">
          EJ<span>.</span>
        </a>
        <nav aria-label="Project navigation">
          <a href="/#work">All projects</a>
          <a href="#evidence">Evidence</a>
        </nav>
        <a
          className="header-cta"
          href="/Eesher_Janda_Resume.pdf"
          target="_blank"
          rel="noreferrer"
        >
          View résumé ↗
        </a>
      </header>
      <article>
        <div className="case-hero">
          <a className="back-link" href="/#work">
            ← Selected work
          </a>
          <p className="kicker">{project.category} / Personal project</p>
          <h1>
            {project.name}
            <span>{project.title}</span>
          </h1>
          <p className="case-summary">{project.summary}</p>
          <div className="stack-list">
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#demo">
              Try the demonstration ↓
            </a>
            <a
              className="button secondary"
              href={`https://github.com/EesherJ39/${project.repo}`}
              target="_blank"
              rel="noreferrer"
            >
              Source code ↗
            </a>
          </div>
        </div>
        <div className="case-stats">
          {project.numbers.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="case-content">
          <section className="case-section intro-grid">
            <div>
              <p className="section-index">01 / The problem</p>
              <h2>Why I built it</h2>
              <p>{project.problem}</p>
            </div>
            <div>
              <p className="section-index">02 / My contribution</p>
              <h2>What I engineered</h2>
              <p>{project.ownership}</p>
            </div>
          </section>
          <section className="case-section" id="demo">
            <p className="section-index">03 / Interactive demonstration</p>
            <h2>See the behavior, not just the claim.</h2>
            <p className="section-lede">
              {slug === 'triageci'
                ? 'Run sample histories through the actual classification logic, extracted for the browser. No GitHub account or credentials needed.'
                : slug === 'synclab'
                  ? 'Two independent CRDT replicas. Disconnect delivery, make edits, and replay the pending operations.'
                  : 'Step through an illustrative three-node failure sequence. This is an educational state visualization, not a running Java cluster.'}
            </p>
            {slug === 'triageci' ? (
              <TriageDemo />
            ) : slug === 'synclab' ? (
              <SyncDemo />
            ) : (
              <RaftDemo />
            )}
          </section>
          <section className="case-section">
            <p className="section-index">04 / Architecture</p>
            <h2>Follow the data.</h2>
            <ol
              className="architecture"
              aria-label={`${project.name} data flow`}
            >
              {project.architecture.map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  <strong>{step}</strong>
                  {index < project.architecture.length - 1 && (
                    <span className="flow-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <div className="decision-grid">
              {project.decisions.map((decision) => (
                <section key={decision.title}>
                  <h3>{decision.title}</h3>
                  <p>{decision.text}</p>
                </section>
              ))}
            </div>
          </section>
          <section className="case-section evidence-section" id="evidence">
            <p className="section-index">05 / Verification</p>
            <h2>Results you can inspect.</h2>
            <p>{project.evidence}</p>
            <div className="evidence-note">
              <h3>Measurement context</h3>
              <p>{project.environment}</p>
              <p>{project.boundary}</p>
            </div>
            <ul className="evidence-links">
              {project.links.map((link) => (
                <li key={link.path}>
                  <a
                    href={evidenceUrl(slug, link.path)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="revision">
              Evidence pinned to repository revision{' '}
              <code>{revisions[slug].slice(0, 12)}</code>. Recorded results are
              from the linked project evidence, not new benchmark runs for this
              website.
            </p>
          </section>
          <section className="case-section intro-grid">
            <div>
              <p className="section-index">06 / Engineering boundaries</p>
              <h2>What I would harden next</h2>
              <p>{project.limitations}</p>
            </div>
            <div>
              <p className="section-index">07 / Next iteration</p>
              <h2>Where it goes from here</h2>
              <p>{project.next}</p>
            </div>
          </section>
          <nav className="other-projects" aria-label="Other case studies">
            {Object.entries(projects)
              .filter(([key]) => key !== slug)
              .map(([key, item]) => (
                <a key={key} href={`/projects/${key}`}>
                  <span>{item.category}</span>
                  <strong>{item.name} ↗</strong>
                </a>
              ))}
          </nav>
        </div>
      </article>
      <section className="contact-section">
        <p className="section-index">Eesher Janda / Software engineering</p>
        <h2>Let’s build something useful.</h2>
        <p>Seeking software engineering internships and co-ops.</p>
        <div className="contact-actions">
          <a className="button light" href="mailto:eeshersjanda@gmail.com">
            Get in touch ↗
          </a>
          <a href="/Eesher_Janda_Resume.pdf" target="_blank" rel="noreferrer">
            View résumé ↗
          </a>
          <a href="/#work">All projects</a>
        </div>
      </section>
    </main>
  );
}
