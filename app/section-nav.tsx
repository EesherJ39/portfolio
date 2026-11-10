'use client';

import { useEffect, useState } from 'react';

const sections = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
];

// Highlights the section currently in view. Without JavaScript it is a plain
// list of anchor links.
export function SectionNav() {
  const [active, setActive] = useState('about');

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="toc" aria-label="Sections">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'true' : undefined}
            >
              <span className="toc-line" aria-hidden="true" />
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
