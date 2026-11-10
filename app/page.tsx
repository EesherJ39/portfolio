import { projects, projectOrder, repoUrl } from '@/lib/projects';
import { RaftFigure, SyncFigure, TriageFigure } from './figures';

const email = 'eeshersjanda@gmail.com';
const linkedin = 'https://www.linkedin.com/in/eesherjanda/';
const github = 'https://github.com/EesherJ39';

const figures = {
  triageci: <TriageFigure />,
  raftkv: <RaftFigure />,
  synclab: <SyncFigure />,
};

const skills = [
  ['Languages', 'Python, C, C++, Java, C#, TypeScript and JavaScript, SQL'],
  ['Frameworks', 'React, ASP.NET Core, Node.js, REST APIs, WebSockets'],
  ['Testing and delivery', 'Jest, Playwright, Vitest, GitHub Actions, AWS ECS, Docker, Git'],
  ['Data and systems', 'PostgreSQL, SQLite, Redis, Prometheus, Linux, CMake'],
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#projects">
        Skip to projects
      </a>
      <main className="page">
        <header className="intro">
          <h1>Eesher Janda</h1>
          <p className="intro-lede">
            I’m a computer science student at the University of Guelph,
            graduating in April 2028. I mostly build backend and distributed
            systems, and I spend a lot of that time trying to break them, like
            killing a Raft leader halfway through a write and checking that no
            committed data goes missing.
          </p>
          <p>
            In summer 2026 I interned at Codentrel in Mississauga, working on the
            reporting side of their internal CRM. I’m looking for a software
            engineering internship or co-op.
          </p>
          <ul className="intro-links" aria-label="Contact and profiles">
            <li>
              <a href="/Eesher_Janda_Resume.pdf">Résumé (PDF)</a>
            </li>
            <li>
              <a href={github}>GitHub</a>
            </li>
            <li>
              <a href={linkedin}>LinkedIn</a>
            </li>
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>
        </header>

        <section id="projects" aria-labelledby="projects-title">
          <div className="section-head">
            <h2 id="projects-title">Projects</h2>
            <p>
              Three things I built in 2026. Each has a write-up with a demo you
              can use in the browser.
            </p>
          </div>
          {projectOrder.map((slug) => {
            const project = projects[slug];
            return (
              <article className="project" key={slug} aria-labelledby={`${slug}-title`}>
                <div className="project-text">
                  <h3 id={`${slug}-title`}>
                    <a href={`/projects/${slug}`}>{project.name}</a>
                  </h3>
                  <p className="project-tagline">{project.tagline}</p>
                  <p>{project.summary}</p>
                  <p className="stack">{project.stack.join(' · ')}</p>
                  <p className="project-links">
                    <a href={`/projects/${slug}`}>
                      Write-up and demo<span aria-hidden="true"> →</span>
                    </a>
                    <a href={repoUrl(slug)}>Code on GitHub</a>
                  </p>
                </div>
                {figures[slug]}
              </article>
            );
          })}
        </section>

        <section id="experience" aria-labelledby="experience-title">
          <div className="section-head">
            <h2 id="experience-title">Experience</h2>
          </div>
          <article className="role">
            <div className="role-head">
              <h3>Codentrel</h3>
              <p>Software Engineering Intern · Mississauga, ON</p>
              <p className="dates">May–Aug 2026</p>
            </div>
            <ul>
              <li>
                Worked on a React reporting dashboard for Codentrel’s internal
                CRM. Automating the recurring reports saved the team about 10
                hours a week.
              </li>
              <li>
                Removed duplicate PostgreSQL queries from the reporting path,
                which took it from 8 to 18 requests per second and cut response
                time from 12 seconds to 6.
              </li>
              <li>
                Replaced the dashboard’s 30-second polling with live updates over
                WebSockets and Redis. New data now shows up in under half a
                second.
              </li>
              <li>
                Fixed 50+ issues from beta testing, and added drill-down reports,
                date filters and CSV export.
              </li>
              <li>
                Set up a CI gate in GitHub Actions with 60+ Playwright suites and
                automated deploys to AWS ECS. It caught two bugs before they
                reached production.
              </li>
            </ul>
          </article>
          <article className="role">
            <div className="role-head">
              <h3>Google Developer Groups on Campus, University of Guelph</h3>
              <p>Volunteer workshop mentor · Guelph, ON</p>
              <p className="dates">Sep 2024–present</p>
            </div>
            <ul>
              <li>
                Helped run 10 hands-on web development workshops for about 100
                students, covering frontend basics, APIs, GitHub and deployment.
              </li>
              <li>
                Worked one-on-one with five students to build and deploy their
                own portfolio sites.
              </li>
            </ul>
          </article>
        </section>

        <section id="education" aria-labelledby="education-title">
          <div className="section-head">
            <h2 id="education-title">Education</h2>
          </div>
          <article className="role">
            <div className="role-head">
              <h3>University of Guelph</h3>
              <p>Bachelor of Computing, Computer Science · Minor in Business</p>
              <p className="dates">Graduating April 2028</p>
            </div>
            <p>
              Dean’s Honour List in Fall 2024 and Winter 2025. Courses include
              data structures and algorithms, operating systems, distributed
              systems and software engineering.
            </p>
          </article>
        </section>

        <section id="skills" aria-labelledby="skills-title">
          <div className="section-head">
            <h2 id="skills-title">Skills</h2>
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

        <footer className="contact" id="contact">
          <h2>Contact</h2>
          <p>
            Email is the best way to reach me:{' '}
            <a href={`mailto:${email}`}>{email}</a>. I’m based in Toronto.
          </p>
          <ul className="intro-links" aria-label="Profiles">
            <li>
              <a href="/Eesher_Janda_Resume.pdf">Résumé (PDF)</a>
            </li>
            <li>
              <a href={github}>GitHub</a>
            </li>
            <li>
              <a href={linkedin}>LinkedIn</a>
            </li>
          </ul>
        </footer>
      </main>
    </>
  );
}
