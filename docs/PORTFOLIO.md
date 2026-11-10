# How the site is put together

The home page (`app/page.tsx`) is one readable page: intro, projects,
experience, education, skills, contact. Each project has a write-up at
`/projects/triageci`, `/projects/raftkv` and `/projects/synclab`, rendered from
`lib/projects.ts` by `app/projects/[slug]/page.tsx`.

## Design rules

The November 2026 redesign replaced a template-looking layout (eyebrow labels,
stat strips, icon cards, numbered section labels, Geist on a cream background,
shadcn components) with a deliberately plain one. Keep to these rules when changing it:

- **Type:** IBM Plex Sans for text, IBM Plex Mono for numbers, code and data.
  Nothing else.
- **Colour:** white paper and near-black ink. The only colours are signals, and
  they mean the same thing everywhere: green means passed or committed, red means
  failed, amber means flaky or offline. Tokens live at the top of
  `app/globals.css`, with a dark-mode set under `prefers-color-scheme`.
- **Structure:** hairline rules between sections, no cards with shadows, no
  icons, no badges or pills, no scroll animations, and no coloured left
  borders. Radius is 4 to 6 px.
- **Figures, not decoration:** the three home-page figures (`app/figures.tsx`)
  are computed from real project code at build time. The TriageCI labels come
  from `analyze()`, and the SyncLab text is real CRDT output. The Raft timeline
  uses the one recorded 186 ms failover, and only that gap is to scale.
- **Copy:** first person, plain verbs, specific numbers with their context, and
  no em dashes. `tests/portfolio.test.mjs` fails if an em dash or a few stock
  phrases ("leverage", "seamless", "robust", "passionate", "not just") appear in
  the site source.
- **Facts match the résumé.** Every number on the site is on the résumé or in
  the linked project repo. Update `resume/Eesher_Janda_Resume.tex` first, then
  mirror the change here.

## Evidence and demos

`lib/projects.ts` pins evidence links to reviewed project commits. Benchmarks
were not rerun for this website, and each one is described with the workload and
machine it ran on.

- **TriageCI:** the demo uses the browser-safe copy of `emptyStats` and `updateStats`
  from EesherJ39/TriageCI at `244d51e`. It classifies sample histories only.
- **SyncLab:** the demo runs the TypeScript CRDT from EesherJ39/SyncLab at `0b657af`
  with simulated delivery that reverses and duplicates queued operations. It
  doesn't include the relay, encryption or storage, and it's capped at 600 operations.
- **RaftKV:** the demo is a hand-written step-through. It doesn't run the Java cluster or
  measure timing.

The demos make no network requests and don't store anything a visitor types.

## Internal links

Internal navigation uses plain `<a>` elements. The vinext `next/link` layer
threw on prefetch and navigation (September 2026), so `next/link` is avoided and
the `nextjs/no-html-link-for-pages` lint rule is turned off in `.oxlintrc.json`.
A test guards against reintroducing it.

## Validate

```sh
pnpm resume:build
pnpm exec tsc --noEmit
pnpm lint
node --experimental-strip-types --test tests/*.test.mjs
pnpm build
```

Deployment is described in `deploy/README.md`. The server builds and deploys
whatever reaches `main`.
