import assert from 'node:assert/strict';

export function validateResume({ pdf, info, text, log }) {
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', 'Output is not a PDF');
  assert.match(info, /^Pages:\s+1\s*$/m, 'Resume must fit on one page');
  assert.match(info, /^Page size:\s+612\s+x\s+792\s+pts/m, 'Expected US Letter');
  assert.doesNotMatch(log, /Overfull \\[hv]box/, 'Resume has overflowing text');
  for (const required of ['Eesher Janda', 'eesherj.com', 'Education', 'Experience', 'Projects']) {
    assert.ok(text.includes(required), `Missing searchable text: ${required}`);
  }
}
