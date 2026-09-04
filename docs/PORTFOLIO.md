# Portfolio case studies and demos

The homepage and `/projects/triageci`, `/projects/raftkv`, and `/projects/synclab`
are built from the existing portfolio design. No new deployment platform,
database, account, secret, or public backend is required.

## Evidence and authorship

`lib/projects.ts` pins public evidence to reviewed project revisions. Historical
benchmarks were not rerun for this website and are labelled with their actual
workload and environment. The resume PDF is an unchanged copy of the final
resume supplied in the workspace. No employer source or confidential screenshots
are included. Community involvement is limited to the user's stated volunteering,
coordination, coding challenges, and demonstrations; no invented event outcomes.

## Demonstration boundaries

- TriageCI uses a browser-safe extraction of `emptyStats` and `updateStats` from
  EesherJ39/TriageCI at `244d51eee8b5f6374278b32bd74e4f165594f47d`.
  It classifies sample sequences; it does not run ingestion, persistence,
  same-commit database analysis, or failure-signature clustering.
- SyncLab copies the actual TypeScript CRDT and types from EesherJ39/SyncLab at
  `0b657aff3f07bf3bca54bee4aa6d9c7fa62306d2`. Only the type import is adapted.
  The wrapper simulates delivery, reorders and duplicates queued operations,
  and limits operations to 600. It does not run the encrypted WebSocket stack.
- RaftKV is a fixed illustrative sequence. It is explicitly not a Java cluster,
  live protocol trace, or timing measurement. Actual executable evidence is linked.

These demos have no network writes and do not store visitors' entered text.
Text is rendered by React, not inserted as HTML. A real-user TriageCI pilot is
future work, not something this site pretends has already happened.

## Validate

The resume is now generated from `resume/Eesher_Janda_Resume.tex`. See
`resume/README.md` for the single-source workflow and required local tools.

```sh
pnpm resume:build
pnpm exec tsc --noEmit
pnpm lint
node --experimental-strip-types --test tests/*.test.mjs
pnpm build
```

The unit tests exercise the embedded models and content boundaries, not the full
upstream services. See each project's linked integration and stress tests for
those checks. Existing Ubuntu deployment instructions remain in `deploy/README.md`.

## Validation recorded September 4, 2026

- Production build and TypeScript checks passed.
- All 10 portfolio unit tests passed, including 100 deterministic CRDT edit sequences.
- Browser-extracted TriageCI logic matched the original across 12,288 state transitions.
- All 15 pinned evidence links returned HTTP 200.
- Homepage, three case-study routes, and the resume PDF returned HTTP 200 locally.
- Scoped lint of `app`, `lib/demos`, `lib/projects.ts`, and the new tests passed.
- Repository-wide lint still reports pre-existing issues in unused bundled UI
  components and `hooks/use-mobile.ts`; those unrelated files were not changed.
- This does not claim a browser interaction, mobile-device, or accessibility audit.

## Navigation repair and portfolio link

The live homepage reproduced a client-router failure on "Inside the analyzer":
the `next/link` compatibility layer logged a prefetch TypeError and a navigation
TypeError while keeping the visitor on the same page. The sample test selectors
worked independently. Internal project navigation now uses native anchors, which
load the server-rendered destination without relying on that client router.

Validation of the rebuilt production preview:

- Clicked "Inside the analyzer" from the homepage and reached TriageCI.
- Added a failing run: observations changed from 8 to 9, transitions from 6 to 7,
  and failure streak from 0 to 1. Reset restored the original values.
- Followed the RaftKV cross-link, returned to All projects, and opened SyncLab.
- Production build, TypeScript checks, and all 11 unit tests passed. The new
  source-level guard complements these browser checks; it is not an end-to-end test.
- Added the clickable portfolio URL to the resume header; verified one US Letter
  page, seven expected PDF links, searchable text, and at least 10pt body text.

These checks do not constitute a complete accessibility or mobile-device audit.
Ubuntu still needs to pull and rebuild the new commit before the fix is live.
