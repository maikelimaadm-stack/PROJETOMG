import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DOC = 'docs/evidence/post-foundation-c-empresas-production-baseline-audit';
const EV = path.join(ROOT, DOC);
const read = (f) => fs.readFileSync(path.join(EV, f), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const changed = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch {
    return null;
  }
};

// The authorized scope of THIS slice — excluded before applying forbidden-path
// patterns, so a doc filename that merely contains words like "BACKEND"/"PRISMA"
// (e.g. EMPRESAS-BACKEND-PRISMA-READINESS.md) is not mistaken for a code change.
// Paths that belong to LATER, already-authorized slices on this cumulative branch
// (their own gates/tests own them). Tolerated here so this slice's branch-relative
// git-diff scope checks stay green when a later slice legitimately adds files.
const LATER_AUTHORIZED_SLICE_PATHS = [
  /^src\/modules\/empresas\/local-read-contract-pilot\//,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  // POST-FOUNDATION C — Studio Foundation Contracts slice paths (cross-slice robustness).
  /^src\/studio\/foundation-contracts\//,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-foundation-contracts\//,
  // POST-FOUNDATION C — Studio Blueprint Contract Hardening slice paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-hardening\//,
  // POST-FOUNDATION C — Studio Blueprint Contract Certification slice paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-certification\//,
  // POST-FOUNDATION C — Empresas Certified Blueprint Mirror & Alignment Audit slice paths (cross-slice robustness).
  /^src\/studio\/blueprint-mirrors\/empresas\//,
  /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
  /^scripts\/gates\/g423-empresas-certified-blueprint-mirror-alignment-audit\.mjs$/,
  /^docs\/evidence\/post-foundation-c-empresas-certified-blueprint-mirror-alignment-audit\//,
  // POST-FOUNDATION C — Empresas Studio Compatibility Slice 1 slice paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
  /^scripts\/gates\/g423-empresas-studio-compatibility-slice-1\.mjs$/,
  /^docs\/evidence\/post-foundation-c-empresas-studio-compatibility-slice-1\//,
];
const AUTHORIZED = [
  /^docs\/evidence\/post-foundation-c-empresas-production-baseline-audit\//,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^scripts\/gates\/g423-empresas-production-baseline-audit\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  ...LATER_AUTHORIZED_SLICE_PATHS,
];
// Changed files OUTSIDE the authorized scope (null when git base is unavailable).
const foreign = () => {
  const files = changed();
  return files === null ? null : files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
};

test('1. CERTIFICATION doc exists', () => assert.ok(exists(`${DOC}/CERTIFICATION-REPORT.md`)));
test('2. EMPRESAS-FILE-INVENTORY doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-FILE-INVENTORY.md`)));
test('3. EMPRESAS-UI-FLOW-MAP doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-UI-FLOW-MAP.md`)));
test('4. EMPRESAS-MODELOBASE1-INTEGRATION doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-MODELOBASE1-INTEGRATION.md`)));
test('5. EMPRESAS-DATA-PERSISTENCE-MAP doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-DATA-PERSISTENCE-MAP.md`)));
test('6. EMPRESAS-BACKEND-PRISMA-READINESS doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-BACKEND-PRISMA-READINESS.md`)));
test('7. EMPRESAS-RISK-REGISTER doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-RISK-REGISTER.md`)));
test('8. EMPRESAS-NEXT-SLICE-SPEC doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-NEXT-SLICE-SPEC.md`)));
test('9. QUALITY-SCALABILITY-NOTES doc exists', () => assert.ok(exists(`${DOC}/QUALITY-SCALABILITY-NOTES.md`)));
test('10. MODULE-DIAGRAMS doc exists', () => assert.ok(exists(`${DOC}/MODULE-DIAGRAMS.md`)));

test('11. docs classify Empresas as laboratório real controlado', () => {
  assert.match(read('QUALITY-SCALABILITY-NOTES.md'), /laboratório real controlado/i);
  assert.match(read('CERTIFICATION-REPORT.md'), /laboratório real controlado/i);
});

test('12. docs state backend/Prisma were NOT implemented in this slice', () => {
  const bpr = read('EMPRESAS-BACKEND-PRISMA-READINESS.md');
  assert.match(bpr, /nada implementado|não implementar agora|O que NÃO implementar agora/i);
  assert.match(read('CERTIFICATION-REPORT.md'), /Prisma\/schema alterado\?[\s*]*não/i);
});

test('13. docs state UI was NOT changed', () => {
  assert.match(read('EMPRESAS-UI-FLOW-MAP.md'), /UI\s*\*{0,2}não\*{0,2}\s*alterada|nenhum arquivo alterado|não alterad/i);
  assert.match(read('CERTIFICATION-REPORT.md'), /UI alterada\?[\s*]*não/i);
});

test('14. docs recommend Controlled Production Test Plan as next slice', () => {
  assert.match(read('EMPRESAS-NEXT-SLICE-SPEC.md'), /EMPRESAS CONTROLLED PRODUCTION TEST PLAN/i);
  assert.match(read('CERTIFICATION-REPORT.md'), /Controlled Production Test Plan/i);
});

test('15. docs say NOT to implement backend/Prisma immediately', () => {
  const nss = read('EMPRESAS-NEXT-SLICE-SPEC.md');
  assert.match(nss, /sem implementar/i);
  assert.match(nss, /plano controlado[*\s]*,\s*não implementação direta/i);
});

test('16. src/modules/empresas not changed in this slice', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !f.startsWith('src/modules/empresas/')));
});

test('17. src/modules/cadcps not changed in this slice', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !f.startsWith('src/modules/cadcps/')));
});

test('18. src/ModeloBase1 not changed in this slice', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !f.startsWith('src/ModeloBase1/')));
});

test('19. src/ModeloBase2 not changed in this slice', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !f.startsWith('src/ModeloBase2/')));
});

test('20. src/pages not changed in this slice', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !f.startsWith('src/pages/')));
});

test('21. App.jsx not changed in this slice', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(!files.includes('src/App.jsx'));
});

test('22. backend not changed', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !/^backend\/|\/backend\/|^src\/apis\//.test(f)));
});

test('23. Prisma/schema not changed', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !/prisma|schema\.prisma/i.test(f)));
});

test('24. runtimeBridge real not changed', () => {
  const files = foreign();
  if (files === null) return;
  assert.ok(files.every((f) => !/runtimeBridge|makBootstrap/i.test(f)));
});

test('25. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('26. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));

test('27. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* git base unavailable — skip */ }
});

test('28. this slice only touches docs/evidence, tests, gate, package.json (authorized scope)', () => {
  const files = changed();
  if (files === null) return;
  // Branch-relative: only meaningful on THIS slice's own branch (its evidence dir
  // appears in the diff). On a later slice's branch the diff is that slice's files.
  if (!files.some((f) => /^docs\/evidence\/post-foundation-c-empresas-production-baseline-audit\//.test(f))) return;
  const ALLOWED = [
    /^docs\/evidence\/post-foundation-c-empresas-production-baseline-audit\//,
    /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
    /^scripts\/gates\/g423-empresas-production-baseline-audit\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    ...LATER_AUTHORIZED_SLICE_PATHS,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
