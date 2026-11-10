import { projects, projectOrder, repoUrl } from '@/lib/projects';
import { RaftFigure, SyncFigure, TriageFigure } from './figures';
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon } from './icons';
import { SectionNav } from './section-nav';

const email = 'eeshersjanda@gmail.com';
const linkedin = 'https://www.linkedin.com/in/eesherjanda/';
const github = 'https://github.com/EesherJ39';

const figures = {
  triageci: <TriageFigure />,
  raftkv: <RaftFigure />,
  synclab: <SyncFigure />,
};

const roles = [
  {
    dates: 'May – Aug 2026',
    title: 'Software Engineering Intern',
    org: 'Codentrel',
    place: 'Mississauga, ON',
    points: [
      'Worked on a React reporting dashboard for Codentrel’s internal CRM. Automating the recurring reports saved the team about 10 hours a week.',
      'Removed duplicate PostgreSQL queries from the reporting path, which took it from 8 to 18 requests per second and cut response time from 12 seconds to 6.',
      'Replaced the dashboard’s 30-second polling with live updates over WebSockets and Redis. New data now shows up in under half a second.',
      'Fixed 50+ issues from beta testing, and added drill-down reports, date filters and CSV export.',
      'Set up a CI gate in GitHub Actions with 60+ Playwright suites and automated deploys to AWS ECS. It caught two bugs before they reached production.',
    ],
    tags: ['React', 'PostgreSQL', 'WebSockets', 'Redis', 'Playwright', 'AWS ECS'],
  },
  {
    dates: 'Sep 2024 – Now',
    title: 'Volunteer and Workshop Mentor',
    org: 'Google Developer Groups on Campus, University of Guelph',
    place: 'Guelph, ON',
    points: [
      'Helped run 10 hands-on web development workshops for about 100 students, covering frontend basics, APIs, GitHub and deployment.',
      'Worked one-on-one with five students to build and deploy their own portfolio sites.',
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'GitHub', 'Firebase'],
  },
];

const skills = [
  ['Languages', 'Python, C, C++, Java, C#, TypeScript, JavaScript, SQL'],
  ['Frameworks', 'React, ASP.NET Core, Node.js, REST APIs, WebSockets'],
  ['Testing and delivery', 'Jest, Playwright, Vitest, GitHub Actions, AWS ECS, Docker, Git'],
  ['Data and systems', 'PostgreSQL, SQLite, Redis, Prometheus, Linux, CMake'],
];

function Tags({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className="tags" aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <div className="shell">
        <header className="side">
          <div>
            <h1>
              <a href="/">Eesher Janda</a>
            </h1>
            <p className="side-role">Software engineer · backend and distributed systems</p>
            <p className="side-pitch">
              I build systems that have to stay correct when things fail, and then
              I try to break them.
            </p>
            <p className="status">
              <span className="status-dot" aria-hidden="true" />
              Open to internships and co-ops
            </p>
            <SectionNav />
          </div>
          <ul className="profiles" aria-label="Profiles and contact">
            <li>
              <a href={github} aria-label="GitHub">
                <GitHubIcon className="icon" />
              </a>
            </li>
            <li>
              <a href={linkedin} aria-label="LinkedIn">
                <LinkedInIcon className="icon" />
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} aria-label={`Email ${email}`}>
                <MailIcon className="icon" />
              </a>
            </li>
            <li>
              <a className="button" href="/Eesher_Janda_Resume.pdf">
                Résumé <span className="button-meta">PDF</span>
              </a>
            </li>
          </ul>
        </header>

        <main className="content" id="content">
          <section id="about" aria-label="About">
            <p>
              I’m a computer science student at the <strong>University of Guelph</strong>,
              graduating in April 2028. I mostly build backend and distributed
              systems, and I spend a lot of that time trying to break them, like
              killing a Raft leader halfway through a write and checking that no
              committed data goes missing.
            </p>
            <p>
              In summer 2026 I interned at <strong>Codentrel</strong> in Mississauga,
              on the reporting side of their internal CRM. I made the dashboard
              twice as fast and replaced its 30-second polling with live updates.
            </p>
            <p>
              Below are three systems I built in 2026. Each one has a full write-up
              with a demo you can run in the browser, and every number comes with
              the test that produced it.
            </p>
          </section>

          <section id="projects" aria-labelledby="projects-title">
            <h2 className="section-title" id="projects-title">
              Projects
            </h2>
            <ol className="cards">
              {projectOrder.map((slug) => {
                const project = projects[slug];
                return (
                  <li className="card" key={slug}>
                    <article aria-labelledby={`${slug}-title`}>
                      <div className="card-figure">{figures[slug]}</div>
                      <h3 id={`${slug}-title`}>
                        <a className="card-link" href={`/projects/${slug}`}>
                          {project.name}
                          <ArrowIcon className="arrow" />
                        </a>
                      </h3>
                      <p className="card-tagline">{project.tagline}</p>
                      <dl className="card-facts">
                        {project.facts.map((fact) => (
                          <div key={fact.label}>
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="card-foot">
                        <Tags items={project.stack} label={`${project.name} stack`} />
                        <a className="card-code" href={repoUrl(slug)}>
                          <GitHubIcon className="icon" />
                          Code
                        </a>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>

          <section id="experience" aria-labelledby="experience-title">
            <h2 className="section-title" id="experience-title">
              Experience
            </h2>
            <ol className="timeline">
              {roles.map((role) => (
                <li className="entry" key={role.org}>
                  <p className="entry-dates">{role.dates}</p>
                  <div>
                    <h3>
                      {role.title} <span className="at">·</span> {role.org}
                    </h3>
                    <p className="entry-place">{role.place}</p>
                    <ul className="entry-points">
                      {role.points.map((point) => (
                        <li key={point.slice(0, 24)}>{point}</li>
                      ))}
                    </ul>
                    <Tags items={role.tags} label={`${role.org} tools`} />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="education" aria-labelledby="education-title">
            <h2 className="section-title" id="education-title">
              Education
            </h2>
            <div className="entry">
              <p className="entry-dates">Class of 2028</p>
              <div>
                <h3>
                  Bachelor of Computing, Computer Science{' '}
                  <span className="at">·</span> University of Guelph
                </h3>
                <p className="entry-place">Minor in Business · Guelph, ON</p>
                <p>
                  Dean’s Honour List in Fall 2024 and Winter 2025. Coursework in
                  data structures and algorithms, operating systems, distributed
                  systems and software engineering.
                </p>
              </div>
            </div>
            <dl className="skills">
              {skills.map(([group, items]) => (
                <div key={group}>
                  <dt>{group}</dt>
                  <dd>{items}</dd>
                </div>
              ))}
            </dl>
          </section>

          <footer className="foot">
            <p>
              The quickest way to reach me is email:{' '}
              <a href={`mailto:${email}`}>{email}</a>. I’m based in Toronto.
            </p>
            <p className="foot-small">
              Built with React and vinext, set in Inter and JetBrains Mono, and
              served from a Docker container on my own Ubuntu server.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
