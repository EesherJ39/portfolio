import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateResume } from './validate-resume.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'resume', 'Eesher_Janda_Resume.tex');
const work = join(root, 'work');
mkdirSync(work, { recursive: true });
const output = mkdtempSync(join(work, 'resume-'));
const compiler = process.env.RESUME_COMPILER || 'pdflatex';
const run = (command, args) => execFileSync(command, args, {
  cwd: root, encoding: 'utf8', timeout: 120000, maxBuffer: 10 * 1024 * 1024,
});

try {
  if (basename(compiler).toLowerCase().startsWith('tectonic')) {
    run(compiler, ['--untrusted', '--keep-logs', '--outdir', output, source]);
  } else {
    const args = ['-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error',
      `-output-directory=${output}`, source];
    run(compiler, args);
    run(compiler, args);
  }
  const pdfPath = join(output, 'Eesher_Janda_Resume.pdf');
  const pdf = readFileSync(pdfPath);
  const info = run('pdfinfo', [pdfPath]);
  // The desktop PDF runtime includes pypdf but may omit Poppler's pdftotext.
  const text = process.env.RESUME_PYTHON
    ? run(process.env.RESUME_PYTHON, ['-X', 'utf8', '-c',
        'import sys; from pypdf import PdfReader; print("\\n".join(p.extract_text() or "" for p in PdfReader(sys.argv[1]).pages))', pdfPath])
    : run('pdftotext', ['-layout', pdfPath, '-']);
  const log = readFileSync(join(output, 'Eesher_Janda_Resume.log'), 'utf8');
  validateResume({ pdf, info, text, log });

  // Never replace the served PDF until compilation and validation both succeed.
  const publicDir = join(root, 'public');
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(pdfPath, join(publicDir, 'Eesher_Janda_Resume.pdf'));
  const sha256 = (data) => createHash('sha256').update(data).digest('hex');
  writeFileSync(join(publicDir, 'resume-version.json'), JSON.stringify({
    source: 'resume/Eesher_Janda_Resume.tex',
    sourceSha256: sha256(readFileSync(source)),
    pdfSha256: sha256(pdf),
    url: '/Eesher_Janda_Resume.pdf',
  }, null, 2) + '\n');
  console.log('Resume compiled and validated: one page, searchable text, no overflowing boxes.');
} catch (error) {
  console.error(`Resume build failed. The website build is stopped; inspect ${output}.`);
  console.error(error.message);
  if (error.stdout) console.error(String(error.stdout).slice(-5000));
  console.error('Install TeX Live and Poppler, or set RESUME_COMPILER to a Tectonic executable.');
  process.exitCode = 1;
}
