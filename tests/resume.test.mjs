import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateResume } from '../scripts/validate-resume.mjs';

const valid = {
  pdf: Buffer.from('%PDF-1.7'),
  info: 'Pages:           1\nPage size:       612 x 792 pts (letter)\n',
  text: 'Eesher Janda eesherj.com Education Experience Projects',
  log: 'Output written (1 page).',
};
test('Resume validator accepts a one-page searchable Letter PDF', () => {
  assert.doesNotThrow(() => validateResume(valid));
});
test('Resume validator rejects corrupt, multipage, wrong-size, missing-text and overflowing output', () => {
  for (const change of [
    { pdf: Buffer.from('not a PDF') },
    { info: valid.info.replace('1\n', '2\n') },
    { info: valid.info.replace('612 x 792', '595 x 842') },
    { text: '' },
    { log: 'Overfull \\hbox (12pt too wide)' },
    { log: 'Overfull \\vbox (12pt too high)' },
  ]) assert.throws(() => validateResume({ ...valid, ...change }));
});
test('Generated PDF manifest matches the current master and served PDF', () => {
  const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
  const hash = (data) => createHash('sha256').update(data).digest('hex');
  const manifest = JSON.parse(read('public/resume-version.json'));
  assert.equal(manifest.source, 'resume/Eesher_Janda_Resume.tex');
  assert.equal(manifest.sourceSha256, hash(read(manifest.source)));
  assert.equal(manifest.pdfSha256, hash(read('public/Eesher_Janda_Resume.pdf')));
  assert.equal(manifest.url, '/Eesher_Janda_Resume.pdf');
});
