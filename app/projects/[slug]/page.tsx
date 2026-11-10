import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  projects,
  projectOrder,
  revisions,
  evidenceUrl,
  repoUrl,
  type ProjectSlug,
} from '@/lib/projects';
import { TriageDemo, SyncDemo, RaftDemo } from '@/app/project-demos';

type Props = { params: Promise<{ slug: string }> };

function isProject(slug: string): slug is ProjectSlug {
  return Object.hasOwn(projects, slug);
}

export function generateStaticParams() {
  return projectOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isProject(slug)) return {};
  const project = projects[slug];
  return {
    title: `${project.name} | Eesher Janda`,
    description: project.tagline,
    alternates: { canonical: `https://eesherj.com/projects/${slug}` },
    openGraph: {
      title: `${project.name}, by Eesher Janda`,
      description: project.tagline,
    },
    twitter: {
      title: `${project.name}, by Eesher Janda`,
      description: project.tagline,
    },
  };
}

const demos = {
  triageci: <TriageDemo />,
  raftkv: <RaftDemo />,
  synclab: <SyncDemo />,
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!isProject(slug)) notFound();
  const project = projects[slug];
  const others = projectOrder.filter((other) => other !== slug);

  return (
    <>
      <a className="skip-link" href="#demo">
        Skip to the demo
      </a>
      <nav className="topbar" aria-label="Site">
        <a href="/">Eesher Janda</a>
        <span>
          <a href="/#projects">Projects</a>
          <a href="/Eesher_Janda_Resume.pdf">Résumé</a>
        </span>
      </nav>
      <main className="page writeup">
        <header className="writeup-head">
          <h1>{project.name}</h1>
          <p className="intro-lede">{project.tagline}</p>
          <p className="meta">
            Personal project, {project.year} · {project.stack.join(', ')} ·{' '}
            <a href={repoUrl(slug)}>Code on GitHub</a>
          </p>
        </header>

        <dl className="facts">
          {project.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd className="fact-value">{fact.value}</dd>
              <dd className="fact-context">{fact.context}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="why">
          <h2 id="why">What it’s for</h2>
          {project.problem.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </section>

        <section id="demo" className="wide" aria-labelledby="try">
          <h2 id="try">Try it</h2>
          <p>{project.demoIntro}</p>
          {demos[slug]}
        </section>

        <section aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol className="flow" aria-label={`How data moves through ${project.name}`}>
            {project.flow.map((step) => (
              <li key={step.label}>
                <span className="flow-boxes">
                  {Array.from({ length: step.parallel ?? 1 }, (_, i) => (
                    <span className="flow-box" key={i}>
                      {step.label}
                      {step.parallel ? ` ${String.fromCharCode(66 + i)}` : ''}
                    </span>
                  ))}
                </span>
                <span className="flow-detail">{step.detail}</span>
              </li>
            ))}
          </ol>
          {project.decisions.map((decision) => (
            <div className="decision" key={decision.title}>
              <h3>{decision.title}</h3>
              <p>{decision.text}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="testing">
          <h2 id="testing">How I tested it</h2>
          {project.testing.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </section>

        <section aria-labelledby="limits">
          <h2 id="limits">What it doesn’t do yet</h2>
          <p>{project.limitations}</p>
          <p>{project.next}</p>
        </section>

        <section aria-labelledby="source">
          <h2 id="source">Source</h2>
          <ul className="source-links">
            {project.links.map((link) => (
              <li key={link.path}>
                <a href={evidenceUrl(slug, link.path)}>{link.label}</a>{' '}
                <code>{link.path}</code>
              </li>
            ))}
          </ul>
          <p className="small">
            Links point to commit <code>{revisions[slug].slice(0, 7)}</code>, the
            version this write-up describes.
          </p>
        </section>

        <footer className="writeup-foot">
          <p>
            More projects:{' '}
            {others.map((other, i) => (
              <span key={other}>
                {i > 0 && ' and '}
                <a href={`/projects/${other}`}>{projects[other].name}</a>
              </span>
            ))}
            .
          </p>
          <p>
            Questions about this project? Email me at{' '}
            <a href="mailto:eeshersjanda@gmail.com">eeshersjanda@gmail.com</a>.
          </p>
        </footer>
      </main>
    </>
  );
}
