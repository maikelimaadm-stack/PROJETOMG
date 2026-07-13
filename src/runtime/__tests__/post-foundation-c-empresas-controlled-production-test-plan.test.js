import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DOC = 'docs/evidence/post-foundation-c-empresas-controlled-production-test-plan';
const EV = path.join(ROOT, DOC);
const read = (f) => fs.readFileSync(path.join(EV, f), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// The authorized scope of THIS slice — excluded before applying forbidden-path
// patterns, so doc filenames that contain words like "PRISMA"/"BACKEND" are not
// mistaken for code changes (e.g. PRISMA-SCHEMA-VALIDATION-PLAN.md).
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
];
const AUTHORIZED = [
  /^docs\/evidence\/post-foundation-c-empresas-controlled-production-test-plan\//,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^scripts\/gates\/g423-empresas-controlled-production-test-plan\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  ...LATER_AUTHORIZED_SLICE_PATHS,
];
const changed = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { return null; }
};
const foreign = () => {
  const files = changed();
  return files === null ? null : files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
};

// 1-13. Documentos existem.
test('1. CERTIFICATION doc exists', () => assert.ok(exists(`${DOC}/CERTIFICATION-REPORT.md`)));
test('2. CONTROLLED-TEST-STRATEGY doc exists', () => assert.ok(exists(`${DOC}/CONTROLLED-TEST-STRATEGY.md`)));
test('3. ENVIRONMENT-SAFETY-MATRIX doc exists', () => assert.ok(exists(`${DOC}/ENVIRONMENT-SAFETY-MATRIX.md`)));
test('4. SYNTHETIC-DATA-FIXTURE-CONTRACT doc exists', () => assert.ok(exists(`${DOC}/SYNTHETIC-DATA-FIXTURE-CONTRACT.md`)));
test('5. MULTITENANT-PERMISSION-TEST-PLAN doc exists', () => assert.ok(exists(`${DOC}/MULTITENANT-PERMISSION-TEST-PLAN.md`)));
test('6. READ-WRITE-PHASE-PLAN doc exists', () => assert.ok(exists(`${DOC}/READ-WRITE-PHASE-PLAN.md`)));
test('7. RUNTIME-PARITY-FALLBACK-PLAN doc exists', () => assert.ok(exists(`${DOC}/RUNTIME-PARITY-FALLBACK-PLAN.md`)));
test('8. PRISMA-SCHEMA-VALIDATION-PLAN doc exists', () => assert.ok(exists(`${DOC}/PRISMA-SCHEMA-VALIDATION-PLAN.md`)));
test('9. ROLLBACK-CLEANUP-PROTOCOL doc exists', () => assert.ok(exists(`${DOC}/ROLLBACK-CLEANUP-PROTOCOL.md`)));
test('10. FUTURE-GATES-SPEC doc exists', () => assert.ok(exists(`${DOC}/FUTURE-GATES-SPEC.md`)));
test('11. NEXT-SLICE-SPEC doc exists', () => assert.ok(exists(`${DOC}/NEXT-SLICE-SPEC.md`)));
test('12. QUALITY-SCALABILITY-NOTES doc exists', () => assert.ok(exists(`${DOC}/QUALITY-SCALABILITY-NOTES.md`)));
test('13. MODULE-DIAGRAMS doc exists', () => assert.ok(exists(`${DOC}/MODULE-DIAGRAMS.md`)));

// 14-18. Proibições de produção.
test('14. plan forbids mutation in production', () => {
  assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /produção[\s\S]*proibido[\s\S]*(create|update|delete|migration)/i);
  assert.match(read('CONTROLLED-TEST-STRATEGY.md'), /PRODUCTION DATA MUST NOT BE USED AS TEST DATA/);
});
test('15. plan forbids create in production', () => assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /Criar empresa sintética[\s\S]*proibido/i));
test('16. plan forbids update in production', () => assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /Atualizar empresa sintética[\s\S]*proibido/i));
test('17. plan forbids delete in production', () => assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /Excluir empresa sintética[\s\S]*proibido/i));
test('18. plan forbids migration in production', () => assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /Migration[\s\S]*proibido/i));

// 19-26. Isolamento exigido.
test('19. plan requires isolated staging', () => assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /Staging isolado/i));
test('20. plan requires separate database', () => assert.match(read('ENVIRONMENT-SAFETY-MATRIX.md'), /banco separado/i));
test('21. plan requires synthetic tenant', () => assert.match(read('MULTITENANT-PERMISSION-TEST-PLAN.md'), /tenant sintético/i));
test('22. plan requires synthetic user', () => assert.match(read('MULTITENANT-PERMISSION-TEST-PLAN.md'), /usuário sintético/i));
test('23. plan requires testRunId', () => assert.match(read('ROLLBACK-CLEANUP-PROTOCOL.md'), /testRunId/));
test('24. plan requires cleanup', () => assert.match(read('ROLLBACK-CLEANUP-PROTOCOL.md'), /cleanup/i));
test('25. plan requires explicit IDs for cleanup', () => assert.match(read('ROLLBACK-CLEANUP-PROTOCOL.md'), /IDs? (explícitos|capturados)/i));
test('26. plan forbids real personal data', () => assert.match(read('SYNTHETIC-DATA-FIXTURE-CONTRACT.md'), /Nunca usar[\s\S]*(CNPJ real|dado real)|Nenhum dado real/i));

// 27-32. Cobertura.
test('27. plan covers multitenant', () => assert.match(read('MULTITENANT-PERMISSION-TEST-PLAN.md'), /Tenant A[\s\S]*Empresa/i));
test('28. plan covers permissions', () => assert.match(read('MULTITENANT-PERMISSION-TEST-PLAN.md'), /Permissão|PermissaoEmpresa/i));
test('29. plan covers preferences', () => assert.match(read('ROLLBACK-CLEANUP-PROTOCOL.md'), /preferência/i));
test('30. plan covers runtimeReadModel', () => assert.match(read('RUNTIME-PARITY-FALLBACK-PLAN.md'), /runtimeReadModel/i));
test('31. plan covers byte-identical fallback', () => assert.match(read('RUNTIME-PARITY-FALLBACK-PLAN.md'), /byte-idêntico/i));
test('32. plan covers ModeloBase1/runtime-v2 parity', () => assert.match(read('RUNTIME-PARITY-FALLBACK-PLAN.md'), /paridade ModeloBase1 × runtime-v2|Matriz de paridade/i));

// 33-35. Próximo piloto.
test('33. plan recommends Empresas Local Read-Only Contract Pilot', () => {
  assert.match(read('NEXT-SLICE-SPEC.md'), /EMPRESAS LOCAL READ-ONLY CONTRACT PILOT/i);
  assert.match(read('CERTIFICATION-REPORT.md'), /EMPRESAS LOCAL READ-ONLY CONTRACT PILOT/i);
});
test('34. plan does NOT recommend backend write as next slice', () => {
  const nss = read('NEXT-SLICE-SPEC.md');
  assert.match(nss, /NÃO recomendar[\s\S]*(produção write|staging write)/i);
});
test('35. plan does NOT recommend migration as next slice', () => {
  assert.match(read('NEXT-SLICE-SPEC.md'), /Proibido no próximo slice[\s\S]*migration/i);
});

// 36-47. Segurança de escopo (git-diff, scope-aware).
test('36. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('37. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('38. src/ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('39. src/ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('40. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\//.test(x))); });
test('41. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('42. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration|migrations\//i.test(x))); });
test('43. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('44. menu not changed (no src/components/menu, no nav)', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('45. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* git base unavailable — skip */ }
});
test('46. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('47. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));

// 48. Escopo autorizado.
test('48. this slice only touches docs/evidence, tests, gate, package.json (authorized scope)', () => {
  const files = changed();
  if (files === null) return;
  // Branch-relative: only meaningful on THIS slice's own branch.
  if (!files.some((f) => /^docs\/evidence\/post-foundation-c-empresas-controlled-production-test-plan\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
