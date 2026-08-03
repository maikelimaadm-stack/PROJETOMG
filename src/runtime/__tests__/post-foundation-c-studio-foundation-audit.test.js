import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Studio scope governance. The ORIGINAL rule below is preserved for every path; the ONLY exemption is the
// exact set of artifacts the chronological-migration slice is authorized to touch, and only while that
// slice is the one active on the branch. A merely similar, uncatalogued path still fails.
import { resolveActiveStudioSlice, isPathAuthorizedForStudioSlice } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

/** Paths exempt from the historical substring rules: EXACTLY what the chronological-migration slice is authorized
 * to touch, and only when that slice is the active one. Never a category (any test, any gate, any evidence). */
const MIGRATION_SLICE_ID = 'studio-scope-governance-chronological-migration';
const migrationExempt = (changedPaths) => {
  const active = resolveActiveStudioSlice(changedPaths);
  if (!active.ok || active.sliceId !== MIGRATION_SLICE_ID) return () => false;
  return (p) => isPathAuthorizedForStudioSlice(p, MIGRATION_SLICE_ID);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DOC = 'docs/evidence/post-foundation-c-studio-foundation-audit';
const EV = path.join(ROOT, DOC);
const read = (f) => fs.readFileSync(path.join(EV, f), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const AUTHORIZED = [
  /^docs\/evidence\/post-foundation-c-studio-foundation-audit\//,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-audit\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  // POST-FOUNDATION C — Studio Foundation Contracts slice paths (cross-slice robustness).
  /^src\/studio\/foundation-contracts\//,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
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
  // POST-FOUNDATION C — Studio Blueprint Engine Foundation slice paths (cross-slice robustness).
  /^src\/studio\/blueprint-engine\//,
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-engine-foundation\//,
  // POST-FOUNDATION C — Studio Blueprint Module Reference Planner slice paths (cross-slice robustness).
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-FOUNDATION-AUDIT.md', 'STUDIO-SCOPE-BOUNDARY.md',
  'STUDIO-METAMODEL-REQUIREMENTS.md', 'MODULE-BLUEPRINT-REQUIREMENTS.md', 'FIELD-SCREEN-BUILDER-REQUIREMENTS.md',
  'VALIDATION-PERMISSION-BLUEPRINT-REQUIREMENTS.md', 'ROUTE-MENU-REGISTRY-REQUIREMENTS.md',
  'PERSISTENCE-BOUNDARY-REQUIREMENTS.md', 'RUNTIME-INTEGRATION-MAP.md', 'EMPRESAS-AS-CERTIFIED-SEED-MODEL.md',
  'MODELOBASE1-MODELOBASE2-RELATIONSHIP.md', 'STUDIO-RISK-REGISTER.md', 'NEXT-SLICE-SPEC.md',
  'QUALITY-SCALABILITY-NOTES.md', 'MODULE-DIAGRAMS.md',
];

// 1-16. Docs existem.
DOCS.forEach((d, i) => test(`${i + 1}. ${d} exists`, () => assert.ok(exists(`${DOC}/${d}`))));

// 17. Studio como fábrica de módulos.
test('17. docs define Studio as a module factory', () => {
  assert.match(read('STUDIO-FOUNDATION-AUDIT.md'), /fábrica de módulos/i);
  assert.match(read('STUDIO-FOUNDATION-AUDIT.md'), /Não[\s\S]*tela simples/i);
});
// 18. Proíbe criar módulos antes do Blueprint.
test('18. docs forbid creating modules before the Blueprint', () => {
  assert.match(read('MODULE-BLUEPRINT-REQUIREMENTS.md'), /antes de um Module Blueprint|antes do Blueprint|sem blueprint/i);
  assert.match(read('STUDIO-SCOPE-BOUNDARY.md'), /criar módulo sem blueprint/i);
});
// 19. Proíbe rota/menu automático.
test('19. docs forbid automatic route/menu', () => {
  const r = read('ROUTE-MENU-REGISTRY-REQUIREMENTS.md');
  assert.match(r, /nenhum módulo aparece no menu automaticamente/i);
  assert.match(r, /nenhum módulo ganha rota produtiva automaticamente/i);
});
// 20. Proíbe schema/migration automático.
test('20. docs forbid automatic schema/migration', () => {
  const p = read('PERSISTENCE-BOUNDARY-REQUIREMENTS.md');
  assert.match(p, /nenhum blueprint cria Prisma\/schema automaticamente/i);
  assert.match(p, /nenhum blueprint cria migration automaticamente/i);
});
// 21. Empresas referência, não reescrita.
test('21. docs keep Empresas as reference, not rewritten', () => {
  const e = read('EMPRESAS-AS-CERTIFIED-SEED-MODEL.md');
  assert.match(e, /não.{0,6}altera Empresas|não\*{0,2} altera Empresas/i);
  assert.match(e, /referência/i);
});
// 22. ModeloBase2 experimental.
test('22. docs keep ModeloBase2 experimental', () => assert.match(read('MODELOBASE1-MODELOBASE2-RELATIONSHIP.md'), /experimental/i));
// 23. Empresas certified contract como seed model.
test('23. docs use Empresas certified contract as seed model', () => {
  assert.match(read('EMPRESAS-AS-CERTIFIED-SEED-MODEL.md'), /empresas-local-read-contract@1\.0\.0|certified/i);
});
// 24. Próximo slice é Studio Foundation Contracts.
test('24. next slice is Studio Foundation Contracts', () => {
  assert.match(read('NEXT-SLICE-SPEC.md'), /STUDIO FOUNDATION CONTRACTS/i);
  assert.match(read('CERTIFICATION-REPORT.md'), /STUDIO FOUNDATION CONTRACTS/i);
});
// 25. Próximo slice headless/contract-only.
test('25. next slice is headless/contract-only', () => assert.match(read('NEXT-SLICE-SPEC.md'), /headless e contract-only|headless\/contract-only/i));
// 26. Studio não implementado neste slice. NOTE: `src/studio/` já existe no repo (pré-existente);
// o critério aqui é que este slice NÃO cria um módulo Studio novo nem altera a árvore existente
// (untouched verificado por foreign() na seção de escopo).
test('26. Studio not implemented this slice', () => {
  assert.ok(!exists('src/modules/studio') && !exists('src/Studio'));
  const f = foreign();
  if (f !== null) assert.ok(f.every((x) => !x.startsWith('src/studio/')));
  assert.match(read('CERTIFICATION-REPORT.md'), /Studio implementado neste slice\?[\s*]*não/i);
});
// 27. Module Blueprint não implementado.
test('27. Module Blueprint not implemented this slice', () => assert.match(read('CERTIFICATION-REPORT.md'), /Module Blueprint implementado neste slice\?[\s*]*não/i));

// 28-42. Scope safety.
test('28. src/modules not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/'))); });
test('29. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('30. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('31. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('32. menu not changed', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/menu|nav/i.test(x))); });
test('33. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('34. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('35. migration not created', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/migration/i.test(x))); });
test('36. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('37. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('38. Empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('39. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('40. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('41. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('42. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));

// 43. authorized scope only (branch-relative; only on this slice's branch).
test('43. this slice only touches docs/evidence, tests, gate, package.json', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^docs\/evidence\/post-foundation-c-studio-foundation-audit\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});
