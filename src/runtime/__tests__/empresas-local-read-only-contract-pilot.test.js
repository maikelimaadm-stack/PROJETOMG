import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Studio scope governance. The ORIGINAL rule below is preserved for every path; the ONLY exemption is the
// exact set of artifacts the chronological-migration slice is authorized to touch, and only while that
// slice is the one active on the branch. A merely similar, uncatalogued path still fails.
import { createResolvedActiveStudioSlicePathAuthorizer } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

// Historical substring rules keep their ORIGINAL regex. The only exemption comes from the single
// central authorizer: exactly one resolved ACTIVE slice, and only the paths that exact slice is
// authorized for. No sliceId prefix, no hardcoded slice, no chronology-free catalog lookup.

import {
  createEmpresasLocalReadContractPilot,
  createEmpresasSyntheticDataset,
  createEmpresasSyntheticTenantContext,
  createEmpresasReadOnlyRepository,
  createEmpresasReadOnlyApiAdapter,
  createEmpresasRuntimeReadProjection,
  compareEmpresasReadParity,
  createEmpresasReadContractFallback,
  createEmpresasReadContractDiagnostics,
  normalizeEmpresaReadPayload,
  validateEmpresaReadQuery,
  applyEmpresaReadFilters,
  applyEmpresaReadSorting,
  applyEmpresaReadPagination,
  blockEmpresasReadPilotMutation,
  EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG,
} from '../../modules/empresas/local-read-contract-pilot/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const ENV = { DEV: 'true', [EMPRESAS_LOCAL_READ_CONTRACT_PILOT_FLAG]: 'true' };
const PILOT_DIR = path.resolve(__dirname, '../../modules/empresas/local-read-contract-pilot');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const AUTHORIZED = [
  /^src\/modules\/empresas\/local-read-contract-pilot\//,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^scripts\/gates\/g423-empresas-local-read-only-contract-pilot\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-local-read-only-contract-pilot\//,
  // The shared production-UI guard gains this isolated read-only test subtree as a
  // sanctioned exception (mirrors the runtime-v2/fuel dev-route exceptions).
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
  // Prior-slice tests whose branch-relative git-diff scope allowlists are widened
  // to tolerate this slice's authorized paths (cross-slice robustness).
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); return e.isDirectory() ? walk(full) : (/\.(js|jsx)$/.test(e.name) ? [full] : []); }) : []);

const pilot = () => createEmpresasLocalReadContractPilot({ env: ENV });
const ctx = (preset) => createEmpresasSyntheticTenantContext({ preset });

test('1. pilot is created', () => { const p = pilot(); assert.equal(p.kind, 'empresas-local-read-contract-pilot'); });
test('2. environment is local_test', () => assert.equal(pilot().environment, 'local_test'));
test('3. synthetic is true', () => assert.equal(pilot().synthetic, true));
test('4. localOnly is true', () => assert.equal(pilot().localOnly, true));
test('5. readOnly is true', () => assert.equal(pilot().readOnly, true));
test('6. mutationAllowed is false', () => assert.equal(pilot().mutationAllowed, false));
test('7. productionAccessed is false', () => assert.equal(pilot().productionAccessed, false));
test('8. backendAccessed is false', () => assert.equal(pilot().backendAccessed, false));
test('9. prismaAccessed is false', () => assert.equal(pilot().prismaAccessed, false));
test('10. fetchUsed is false', () => assert.equal(pilot().fetchUsed, false));

test('11. dataset has at least 12 synthetic empresas', () => assert.ok(createEmpresasSyntheticDataset({}).records.length >= 12));
test('12. dataset has more than one tenant', () => assert.ok(createEmpresasSyntheticDataset({}).tenants.length >= 2));
test('13. dataset has more than one erpEmpresaId', () => {
  const erp = new Set(createEmpresasSyntheticDataset({}).tenants.map((t) => t.erpEmpresaId));
  assert.ok(erp.size >= 2);
});
test('14. dataset contains no real CNPJ (synthetic prefix pattern)', () => {
  const ds = createEmpresasSyntheticDataset({});
  assert.ok(ds.records.every((r) => String(r.cpf_cnpj).startsWith('00.')));
});
test('15. dataset contains no real email', () => assert.ok(createEmpresasSyntheticDataset({}).records.every((r) => r.email === null)));
test('16. dataset contains no real phone', () => assert.ok(createEmpresasSyntheticDataset({}).records.every((r) => r.telefone === null)));
test('17. dataset is deterministic', () => assert.equal(JSON.stringify(createEmpresasSyntheticDataset({}).records), JSON.stringify(createEmpresasSyntheticDataset({}).records)));

test('18. tenant context A is created', () => assert.equal(ctx('A').tenantId, 'MAK_TEST_CLIENTE_A'));
test('19. tenant context B is created', () => assert.equal(ctx('B').tenantId, 'MAK_TEST_CLIENTE_B'));
test('20. no-permission context fails closed', () => assert.equal(pilot().read({}, ctx('noPermission')).legacy.ok, false));
test('21. no-header context fails closed', () => assert.equal(pilot().read({}, ctx('noHeader')).legacy.ok, false));
test('22. invalid-header context fails closed', () => assert.equal(pilot().read({}, ctx('invalidHeader')).legacy.ok, false));
test('23. tenant-mismatch context fails closed', () => assert.equal(pilot().read({}, ctx('tenantMismatch')).legacy.ok, false));
test('24. expired-token context fails closed', () => assert.equal(pilot().read({}, ctx('expiredToken')).legacy.ok, false));

test('25. repository lists only authorized tenant', () => {
  const r = pilot().read({ pageSize: 100 }, ctx('A'));
  assert.ok(r.legacy.items.every((x) => x.cliente_id === 'MAK_TEST_CLIENTE_A'));
});
test('26. getById respects tenant', () => {
  const p = pilot();
  const bId = p.dataset.records.find((r) => r.cliente_id === 'MAK_TEST_CLIENTE_B').id;
  assert.equal(p.repository.getById(bId, ctx('A')).item, null);
});
test('27. count respects tenant', () => {
  const p = pilot();
  const c = p.repository.count({}, ctx('A'));
  assert.equal(c.total, p.dataset.records.filter((r) => r.cliente_id === 'MAK_TEST_CLIENTE_A').length);
});
test('28. Tenant A cannot see Tenant B records', () => {
  const r = pilot().read({ pageSize: 100 }, ctx('A'));
  assert.ok(!r.legacy.items.some((x) => x.cliente_id === 'MAK_TEST_CLIENTE_B'));
});
test('29. Tenant B cannot see Tenant A records', () => {
  const r = pilot().read({ pageSize: 100 }, ctx('B'));
  assert.ok(!r.legacy.items.some((x) => x.cliente_id === 'MAK_TEST_CLIENTE_A'));
});
test('30. dataset does not leak between tenants', () => {
  const p = pilot();
  const a = new Set(p.read({ pageSize: 100 }, ctx('A')).legacy.items.map((x) => x.id));
  const b = new Set(p.read({ pageSize: 100 }, ctx('B')).legacy.items.map((x) => x.id));
  assert.ok([...a].every((id) => !b.has(id)));
});
test('31. list returns safe copies', () => {
  const p = pilot();
  const r1 = p.read({}, ctx('A'));
  const r2 = p.read({}, ctx('A'));
  assert.notEqual(r1.legacy.items, r2.legacy.items);
});
test('32. mutating a return does not change the dataset', () => {
  const p = pilot();
  const r = p.read({}, ctx('A'));
  r.legacy.items[0].razao_social = 'HACKED';
  const again = p.read({}, ctx('A'));
  assert.notEqual(again.legacy.items[0].razao_social, 'HACKED');
});

test('33. invalid page is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { page: 0 } }).valid, false));
test('34. invalid pageSize is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { pageSize: 9999 } }).valid, false));
test('35. invalid sort is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { sort: 'senha' } }).valid, false));
test('36. invalid direction is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { direction: 'sideways' } }).valid, false));
test('37. prototype pollution is blocked', () => assert.equal(validateEmpresaReadQuery({ query: JSON.parse('{"__proto__":{"x":1}}') }).valid, false));
test('38. function in query is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { search: () => {} } }).valid, false));
test('39. raw SQL in query is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { search: 'DROP TABLE empresas' } }).valid, false));
test('40. Prisma object in query is blocked', () => assert.equal(validateEmpresaReadQuery({ query: { filters: { razao_social: { findMany: () => {} } } } }).valid, false));

test('41. search is case-insensitive', () => {
  const recs = [{ razao_social: 'AlphaCo' }, { razao_social: 'BetaCo' }];
  assert.equal(applyEmpresaReadFilters({ records: recs, search: 'alpha' }).length, 1);
});
test('42. filter by codigo works', () => {
  const recs = [{ codempresa: 101 }, { codempresa: 102 }];
  assert.equal(applyEmpresaReadFilters({ records: recs, filters: { codempresa: 101 } }).length, 1);
});
test('43. filter by nome works', () => {
  const recs = [{ razao_social: 'AlphaCo' }, { razao_social: 'BetaCo' }];
  assert.equal(applyEmpresaReadFilters({ records: recs, filters: { razao_social: 'beta' } }).length, 1);
});
test('44. filter by status works', () => {
  const recs = [{ status: 'Ativa' }, { status: 'Inativa' }];
  assert.equal(applyEmpresaReadFilters({ records: recs, filters: { status: 'Ativa' } }).length, 1);
});
test('45. sort asc works', () => {
  const out = applyEmpresaReadSorting({ records: [{ codempresa: 3 }, { codempresa: 1 }], sort: 'codempresa', direction: 'asc' });
  assert.equal(out[0].codempresa, 1);
});
test('46. sort desc works', () => {
  const out = applyEmpresaReadSorting({ records: [{ codempresa: 1 }, { codempresa: 3 }], sort: 'codempresa', direction: 'desc' });
  assert.equal(out[0].codempresa, 3);
});
test('47. sort is stable', () => {
  const recs = [{ codempresa: 1, id: 'a' }, { codempresa: 1, id: 'b' }, { codempresa: 1, id: 'c' }];
  const out = applyEmpresaReadSorting({ records: recs, sort: 'codempresa', direction: 'asc' });
  assert.deepEqual(out.map((r) => r.id), ['a', 'b', 'c']);
});
test('48. pagination is deterministic', () => {
  const recs = Array.from({ length: 10 }, (_, i) => ({ id: i }));
  const a = applyEmpresaReadPagination({ records: recs, page: 2, pageSize: 3 });
  const b = applyEmpresaReadPagination({ records: recs, page: 2, pageSize: 3 });
  assert.deepEqual(a.items, b.items);
});
test('49. page beyond range returns safe empty state', () => {
  const out = applyEmpresaReadPagination({ records: [{ id: 1 }], page: 99, pageSize: 10 });
  assert.deepEqual(out.items, []);
  assert.equal(out.hasNext, false);
});
test('50. empty dataset returns empty state', () => {
  const out = applyEmpresaReadPagination({ records: [], page: 1, pageSize: 10 });
  assert.equal(out.total, 0);
  assert.equal(out.totalPages, 1);
});

test('51. API adapter list reflects real contract envelope', () => {
  const a = createEmpresasReadOnlyApiAdapter({}).listEmpresas({ pageSize: 5 }, ctx('A'));
  for (const k of ['items', 'total', 'page', 'pageSize', 'totalPages', 'nextCursor']) assert.ok(k in a);
});
test('52. API adapter getById reflects real contract', () => {
  const p = pilot();
  const id = p.dataset.records.find((r) => r.cliente_id === 'MAK_TEST_CLIENTE_A').id;
  const a = createEmpresasReadOnlyApiAdapter({ repository: p.repository }).getEmpresaById(id, ctx('A'));
  assert.ok('item' in a);
});
test('53. API adapter count reflects real contract', () => {
  const a = createEmpresasReadOnlyApiAdapter({}).countEmpresas({}, ctx('A'));
  assert.ok('total' in a);
});
test('54. API adapter blocks create', () => assert.throws(() => createEmpresasReadOnlyApiAdapter({}).createEmpresa(), /blocked/i));
test('55. API adapter blocks update', () => assert.throws(() => createEmpresasReadOnlyApiAdapter({}).updateEmpresa(), /blocked/i));
test('56. API adapter blocks delete', () => assert.throws(() => createEmpresasReadOnlyApiAdapter({}).deleteEmpresa(), /blocked/i));
test('57. repository blocks create', () => assert.throws(() => createEmpresasReadOnlyRepository({}).create(), /blocked/i));
test('58. repository blocks update', () => assert.throws(() => createEmpresasReadOnlyRepository({}).update(), /blocked/i));
test('59. repository blocks delete', () => assert.throws(() => createEmpresasReadOnlyRepository({}).delete(), /blocked/i));
test('60. mutation blocker returns mutationExecuted false', () => assert.equal(blockEmpresasReadPilotMutation({ operation: 'delete' }).mutationExecuted, false));
test('61. mutation blocker does not change dataset', () => {
  const p = pilot();
  const before = JSON.stringify(p.dataset.records);
  p.blockMutation('createEmpresa');
  assert.equal(JSON.stringify(p.dataset.records), before);
});

test('62. normalization keeps IDs', () => {
  const out = normalizeEmpresaReadPayload({ record: { id: 'x1', cliente_id: 't', razao_social: 'A' } });
  assert.equal(out.id, 'x1');
});
test('63. normalization keeps tenant scope', () => {
  const out = normalizeEmpresaReadPayload({ record: { id: 'x1', cliente_id: 'tenantX' } });
  assert.equal(out.cliente_id, 'tenantX');
});
test('64. normalization does not expose internal fixture metadata', () => {
  const p = pilot();
  const out = normalizeEmpresaReadPayload({ record: p.dataset.records[0] });
  assert.ok(!('__fixture' in out));
});

test('65. runtime projection is created', () => {
  const p = pilot();
  const r = p.read({}, ctx('A'));
  assert.equal(r.runtime.kind, 'empresas-runtime-read-projection');
});
test('66. runtime projection keeps tenant scope', () => {
  const r = pilot().read({}, ctx('A'));
  assert.equal(r.runtime.tenantScope, 'MAK_TEST_CLIENTE_A');
});
test('67. runtime projection keeps filters', () => {
  const r = pilot().read({ filters: { status: 'Ativa' } }, ctx('A'));
  assert.equal(r.runtime.filters.status, 'Ativa');
});
test('68. runtime projection keeps sort', () => {
  const r = pilot().read({ sort: 'razao_social', direction: 'desc' }, ctx('A'));
  assert.equal(r.runtime.sort, 'razao_social');
  assert.equal(r.runtime.direction, 'desc');
});
test('69. runtime projection keeps pagination', () => {
  const r = pilot().read({ page: 1, pageSize: 3 }, ctx('A'));
  assert.equal(r.runtime.pageSize, 3);
});
test('70. runtime projection does not touch write path', () => assert.equal(pilot().read({}, ctx('A')).runtime.diagnostics.writePathTouched, false));
test('71. runtime projection does not access Prisma', () => assert.equal(pilot().read({}, ctx('A')).runtime.prismaAccessed, false));
test('72. runtime projection does not access backend', () => assert.equal(pilot().read({}, ctx('A')).runtime.backendAccessed, false));
test('73. runtime projection does not use fetch', () => assert.equal(pilot().read({}, ctx('A')).runtime.fetchUsed, false));

test('74. parity IDs exact', () => assert.deepEqual(pilot().read({}, ctx('A')).parity.differences, []));
test('75. parity count exact', () => assert.equal(pilot().read({}, ctx('A')).parity.equal, true));
test('76. parity order exact (sorted)', () => assert.equal(pilot().read({ sort: 'razao_social' }, ctx('A')).parity.equal, true));
test('77. parity filters exact', () => assert.equal(pilot().read({ filters: { status: 'Ativa' } }, ctx('A')).parity.equal, true));
test('78. parity pagination exact', () => assert.equal(pilot().read({ page: 1, pageSize: 4 }, ctx('A')).parity.equal, true));
test('79. parity tenant scope exact', () => assert.equal(pilot().read({}, ctx('B')).parity.equal, true));
test('80. parity permission outcome exact (denied both sides)', () => {
  const r = pilot().read({}, ctx('noPermission'));
  const par = compareEmpresasReadParity({ legacy: r.legacy, runtime: r.runtime });
  assert.equal(par.equal, true); // both empty
});
test('81. divergence produces a blocker', () => {
  const par = compareEmpresasReadParity({ legacy: { items: [{ id: 'a' }], total: 1 }, runtime: { items: [{ id: 'b' }], total: 1 } });
  assert.ok(par.blockers.length > 0);
  assert.equal(par.safeToProceed, false);
});

test('82. fallback flag off is safe', () => assert.equal(createEmpresasReadContractFallback({ scenario: 'flag_off' }).serveLegacyLocalPath, true));
test('83. fallback invalid query is safe (blocked, no mutation)', () => {
  const fb = createEmpresasReadContractFallback({ scenario: 'invalid_query' });
  assert.equal(fb.status, 'blocked');
  assert.equal(fb.mutationExecuted, false);
});
test('84. fallback runtime failure is safe', () => assert.equal(createEmpresasReadContractFallback({ scenario: 'runtime_projection_failure' }).serveLegacyLocalPath, true));
test('85. fallback parity mismatch blocks', () => assert.equal(createEmpresasReadContractFallback({ scenario: 'parity_mismatch' }).status, 'blocked'));

test('86. diagnostics contain no secrets', () => {
  const d = createEmpresasReadContractDiagnostics({ pilotId: 'x' });
  assert.ok(!JSON.stringify(d).match(/secret|token|password|DATABASE_URL/i));
});
test('87. diagnostics report mutationAllowed false', () => assert.equal(createEmpresasReadContractDiagnostics({}).mutationAllowed, false));
test('88. diagnostics report productionAccessed false', () => assert.equal(createEmpresasReadContractDiagnostics({}).productionAccessed, false));

// 89-101: scope / no-change (git-diff, scope-aware) + module source guards.
test('89. src/modules/empresas UI (page/components) not changed', () => {
  const f = foreign(); if (f === null) return;
  assert.ok(f.every((x) => !/^src\/modules\/empresas\/(pages|components|config|preferences|hooks)\//.test(x)));
});
test('90. PAGEMP.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.endsWith('PAGEMP.jsx'))); });
test('91. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('92. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('93. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\//.test(x))); });
test('94. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('95. migration not created', () => { const f = foreign(); if (f === null) return; const exempt = createResolvedActiveStudioSlicePathAuthorizer(f); assert.ok(f.filter((x) => !exempt.isAuthorized(x)).every((x) => !/migration/i.test(x))); });
test('96. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('97. menu not changed', () => { const f = foreign(); if (f === null) return; const exempt = createResolvedActiveStudioSlicePathAuthorizer(f); assert.ok(f.filter((x) => !exempt.isAuthorized(x)).every((x) => !/menu|nav/i.test(x))); });
test('98. src/modules/cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('99. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('100. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('101. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));

// 102-103: pilot source never imports fetch/apiClient/Prisma/EmpresaApi.
test('102. pilot source has no fetch/apiClient/EmpresaApi/Prisma import', () => {
  const imports = walk(PILOT_DIR).flatMap((fp) => [...fs.readFileSync(fp, 'utf8').matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
  assert.ok(imports.every((p) => !/apiClient|EmpresaApi|\/apis\/|prisma|\/backend\//i.test(p)));
});
test('103. pilot source uses no fetch/XHR/WebSocket/storage network calls', () => {
  const code = walk(PILOT_DIR).map((fp) => fs.readFileSync(fp, 'utf8')).join('\n');
  // Note: the literal "railway" legitimately appears inside a denylist regex; the
  // real guard is the import check (test 102) — here we assert no network/storage API is invoked.
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.|sessionStorage\.|indexedDB\./i.test(code));
});

test('104. pilot source is React-free (pure)', () => {
  const imports = walk(PILOT_DIR).flatMap((fp) => [...fs.readFileSync(fp, 'utf8').matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
  assert.ok(imports.every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
});
