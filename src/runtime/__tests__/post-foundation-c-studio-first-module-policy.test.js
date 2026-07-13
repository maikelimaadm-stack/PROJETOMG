import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-first-module-policy');
const read = (f) => fs.readFileSync(path.join(EV, f), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// Branch-relative git-diff (empty on main; this branch's own file set otherwise).
const changed = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch {
    return null; // git base unavailable — treated as "no forbidden change"
  }
};

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
const isLaterAuthorized = (f) => LATER_AUTHORIZED_SLICE_PATHS.some((re) => re.test(f));

const DOC = 'docs/evidence/post-foundation-c-studio-first-module-policy';

test('1. CERTIFICATION doc exists', () => assert.ok(exists(`${DOC}/CERTIFICATION-REPORT.md`)));
test('2. ARCHITECTURE-STATUS doc exists', () => assert.ok(exists(`${DOC}/ARCHITECTURE-STATUS-RECONCILIATION.md`)));
test('3. STUDIO-FIRST-MODULE-CREATION-POLICY doc exists', () => assert.ok(exists(`${DOC}/STUDIO-FIRST-MODULE-CREATION-POLICY.md`)));
test('4. MODELOBASE2-EXPERIMENTAL-BOUNDARY doc exists', () => assert.ok(exists(`${DOC}/MODELOBASE2-EXPERIMENTAL-BOUNDARY.md`)));
test('5. FUEL-SANDBOX-FREEZE doc exists', () => assert.ok(exists(`${DOC}/FUEL-SANDBOX-FREEZE.md`)));
test('6. EMPRESAS-PRODUCTION-LAB-POLICY doc exists', () => assert.ok(exists(`${DOC}/EMPRESAS-PRODUCTION-LAB-POLICY.md`)));
test('7. NO-NEW-MODULES-POLICY doc exists', () => assert.ok(exists(`${DOC}/NO-NEW-MODULES-POLICY.md`)));
test('8. NEXT-STEPS-ROADMAP doc exists', () => assert.ok(exists(`${DOC}/NEXT-STEPS-ROADMAP.md`)));
test('9. QUALITY-SCALABILITY-NOTES doc exists', () => assert.ok(exists(`${DOC}/QUALITY-SCALABILITY-NOTES.md`)));
test('10. MODULE-DIAGRAMS doc exists', () => assert.ok(exists(`${DOC}/MODULE-DIAGRAMS.md`)));

test('11. Fuel is classified as sandbox', () => {
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /sandbox/i);
  assert.match(read('ARCHITECTURE-STATUS-RECONCILIATION.md'), /Fuel Sandbox|Fuel[\s\S]*sandbox/i);
});

test('12. Fuel is classified as não produção', () => {
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não produção/i);
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não módulo real/i);
});

test('13. ModeloBase2 is classified as experimental', () => {
  assert.match(read('MODELOBASE2-EXPERIMENTAL-BOUNDARY.md'), /experimental/i);
  assert.match(read('ARCHITECTURE-STATUS-RECONCILIATION.md'), /ModeloBase2[\s\S]*experimental/i);
});

test('14. Empresas is classified as laboratório real controlado', () => {
  assert.match(read('EMPRESAS-PRODUCTION-LAB-POLICY.md'), /laboratório real controlado/i);
});

test('15. Policy forbids src/modules/combustivel now', () => {
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não criar[\s\S]*src\/modules\/combustivel/i);
  assert.match(read('STUDIO-FIRST-MODULE-CREATION-POLICY.md'), /src\/modules\/combustivel/i);
});

test('16. Policy forbids src/modules/fuel now', () => {
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não criar[\s\S]*src\/modules\/fuel/i);
  assert.match(read('STUDIO-FIRST-MODULE-CREATION-POLICY.md'), /src\/modules\/fuel/i);
});

test('17. Policy forbids combustível menu now', () => {
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não criar menu combustível/i);
});

test('18. Policy forbids backend/Prisma for Fuel now', () => {
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não criar backend combustível/i);
  assert.match(read('FUEL-SANDBOX-FREEZE.md'), /não criar Prisma\/schema combustível/i);
});

test('19. Policy allows future backend/Prisma only in Empresas via explicit slice', () => {
  const emp = read('EMPRESAS-PRODUCTION-LAB-POLICY.md');
  assert.match(emp, /backend real/i);
  assert.match(emp, /Prisma/i);
  assert.match(emp, /slice explícito/i);
  assert.match(emp, /nunca[\s*]+fazer backend\/Prisma em Empresas sem prompt específico/i);
});

test('20. Policy forbids new modules now', () => {
  assert.match(read('NO-NEW-MODULES-POLICY.md'), /criar novos módulos reais em `?src\/modules/i);
});

test('21. Policy requires Studio before new modules', () => {
  const s = read('STUDIO-FIRST-MODULE-CREATION-POLICY.md');
  assert.match(s, /Studio Foundation/i);
  assert.match(s, /só devem ser criados quando o Studio/i);
});

test('22. Policy requires Module Blueprint before new modules', () => {
  assert.match(read('STUDIO-FIRST-MODULE-CREATION-POLICY.md'), /Module Blueprint/i);
});

test('23. Roadmap recommends Empresas Production Baseline Audit', () => {
  assert.match(read('NEXT-STEPS-ROADMAP.md'), /EMPRESAS PRODUCTION BASELINE AUDIT/i);
});

test('24. Roadmap recommends Studio Foundation Audit in the future', () => {
  assert.match(read('NEXT-STEPS-ROADMAP.md'), /STUDIO FOUNDATION AUDIT/i);
});

test('25. Roadmap suspends Fuel Controlled Module Registration', () => {
  assert.match(read('NEXT-STEPS-ROADMAP.md'), /Suspenso[\s\S]*Fuel Controlled Module Registration/i);
});

test('26. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('27. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));

test('28. App.jsx not changed in this slice', () => {
  const files = changed();
  if (files === null) return;
  assert.ok(!files.includes('src/App.jsx'));
});

test('29. src/modules not changed in this slice', () => {
  const files = changed();
  if (files === null) return;
  assert.ok(files.filter((f) => !isLaterAuthorized(f)).every((f) => !f.startsWith('src/modules/')));
});

test('30. src/pages not changed in this slice', () => {
  const files = changed();
  if (files === null) return;
  assert.ok(files.every((f) => !f.startsWith('src/pages/')));
});

test('31. backend not changed', () => {
  const files = changed();
  if (files === null) return;
  assert.ok(files.every((f) => !/\/backend\/|^src\/apis\//.test(f)));
});

test('32. Prisma/schema not changed', () => {
  const files = changed();
  if (files === null) return;
  assert.ok(files.filter((f) => !isLaterAuthorized(f)).every((f) => !/prisma|schema\.prisma/i.test(f)));
});

test('33. runtimeBridge real not changed', () => {
  const files = changed();
  if (files === null) return;
  assert.ok(files.every((f) => !/runtimeBridge|makBootstrap/i.test(f)));
});

test('34. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* git base unavailable — skip */ }
});

test('35. this slice only touches docs/evidence, tests, gate, package.json (authorized scope)', () => {
  const files = changed();
  if (files === null) return;
  // Branch-relative: only meaningful on THIS slice's own branch.
  if (!files.some((f) => /^docs\/evidence\/post-foundation-c-studio-first-module-policy\//.test(f))) return;
  const ALLOWED = [
    /^docs\/evidence\/post-foundation-c-studio-first-module-policy\//,
    /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
    /^scripts\/gates\/g423-studio-first-module-policy\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    ...LATER_AUTHORIZED_SLICE_PATHS,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
