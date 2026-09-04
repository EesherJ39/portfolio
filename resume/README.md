# One master resume

Edit only **Eesher_Janda_Resume.tex** in this directory. It is the source of truth
for both the resume's content and layout and can be imported into Overleaf.

All portfolio buttons and the GitHub profile link to the same published PDF:
https://eesherj.com/Eesher_Janda_Resume.pdf

## Edit once, publish everywhere linked

1. Change the master `.tex` file.
2. Run `pnpm resume:build` and visually inspect the generated PDF in `public/`.
3. Run `node --experimental-strip-types --test tests/*.test.mjs` and `pnpm build`.
4. Commit the source changes and push to `main`.
5. On Ubuntu, run `git pull --ff-only origin main && docker compose up -d --build`
   from `~/portfolio`, or use the existing deployment timer **if installed**.

The Docker build installs TeX Live and Poppler in its build stage and compiles
the master before building the website. These system packages are not copied
into the final runtime image. No separate server-side resume editing is needed.
The generated PDF is not committed; an old manually copied PDF is excluded from
the Docker context. Compilation and one-page/text/overflow checks must pass before
the website build can proceed. They do not replace visual inspection.

The fixed PDF URL and `resume-version.json` use `Cache-Control: no-store`.
The JSON records SHA-256 hashes of the master and generated PDF to verify which
source the server is serving. Any custom proxy rule must respect these headers.

## Validation recorded September 4, 2026

- Desktop production build regenerated the PDF from this master and passed.
- All 14 tests passed, including manifest/source/PDF hash checks and rejection of
  multipage, corrupt, missing-text, wrong-size, and overflowing output.
- Rendered PDF inspected: one page, original content/layout retained.
- Local production HTTP responses returned the exact PDF recorded in the manifest
  and included the `no-store` directive (Vinext also appends its static-file defaults).
- Full Docker build and live-server deployment remain unverified: Docker Desktop
  was not running and noninteractive Ubuntu SSH access was unavailable.

## Local tools

Default: `pdflatex`, `pdfinfo`, and `pdftotext` on PATH. On Debian/Ubuntu these
are provided by the TeX Live and Poppler packages listed in the Dockerfile.
Alternatively set `RESUME_COMPILER` to a Tectonic executable; `pdfinfo` is still
required. A desktop runtime missing `pdftotext` can set `RESUME_PYTHON` to a Python
executable with `pypdf` installed. `pnpm dev` also generates the resume on startup;
after a `.tex` edit during development, run `pnpm resume:build` again.

## Boundaries

- Downloads, email attachments, job-portal uploads, and old local exports are
  snapshots. They cannot be updated remotely; use the stable URL where accepted.
- Overleaf is an editor, not a second synchronized master. Copy its changes back
  into this repository before publishing; no automatic Overleaf integration exists.
- This does not automatically rewrite project or experience prose elsewhere on
  the website. It centralizes the resume document and links to it.
- Pushing alone does not deploy unless the Ubuntu deployment timer is installed.
