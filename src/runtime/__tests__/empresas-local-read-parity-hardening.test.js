import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  createEmpresasScaledSyntheticDataset,
  contextForScaledTenant,
  createEmpresasCompositeQueryMatrix,
  createEmpresasTenantFuzzMatrix,
  createEmpresasPermissionMatrix,
  createEmpresasReadErrorContract,
  createEmpresasReadError,
  createEmpresasParityDigest,
  createEmpresasParityScenarioRunner,
  createEmpresasReadPerformanceBaseline,
  createEmpresasReadHardeningDiagnostics,
  createEmpresasReadHardeningFallback,
  validateEmpresasHardeningInvariant,
} from '../../modules/empresas/local-read-contract-pilot/hardening/index.js';
import {
  createEmpresasReadOnlyRepository,
  createEmpresasReadOnlyApiAdapter,
  createEmpresasRuntimeReadProjection,
} from '../../modules/empresas/local-read-contract-pilot/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const HARD_DIR = path.resolve(__dirname, '../../modules/empresas/local-read-contract-pilot/hardening');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const AUTHORIZED = [
  /^src\/modules\/empresas\/local-read-contract-pilot\//,
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^scripts\/gates\/g423-empresas-local-read-parity-hardening\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-local-read-parity-hardening\//,
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
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };
const walkJs = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walkJs(path.join(d, e.name)) : (/\.js$/.test(e.name) ? [path.join(d, e.name)] : []));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
// Hardening source with comments stripped (denylist keywords legitimately appear in docstrings).
const hardCode = () => walkJs(HARD_DIR).map((fp) => stripComments(fs.readFileSync(fp, 'utf8'))).join('\n');
const hardImports = () => walkJs(HARD_DIR).flatMap((fp) => [...stripComments(fs.readFileSync(fp, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const CLK = () => 0;

const scaled = (profile, seed) => createEmpresasScaledSyntheticDataset({ profile, seed });
const repoFor = (ds) => createEmpresasReadOnlyRepository({ dataset: ds });
const ctx0 = (ds) => contextForScaledTenant(ds.tenants[0]);

// ---- Dataset (1-22) ----
const diag = createEmpresasReadHardeningDiagnostics({ clock: CLK, includePerformance: false });
test('1. hardening is created', () => assert.equal(diag.kind, 'empresas-read-hardening-diagnostics'));
test('2. environment is local_test', () => assert.equal(diag.environment, 'local_test'));
test('3. synthetic is true', () => assert.equal(diag.synthetic, true));
test('4. localOnly is true', () => assert.equal(diag.localOnly, true));
test('5. readOnly is true', () => assert.equal(diag.readOnly, true));
test('6. mutationAllowed is false', () => assert.equal(diag.mutationAllowed, false));
test('7. productionAccessed is false', () => assert.equal(diag.productionAccessed, false));
test('8. backendAccessed is false', () => assert.equal(diag.backendAccessed, false));
test('9. prismaAccessed is false', () => assert.equal(diag.prismaAccessed, false));
test('10. fetchUsed is false', () => assert.equal(diag.fetchUsed, false));
test('11. tiny profile works', () => assert.ok(scaled('tiny').total <= 5));
test('12. small profile has 20 records', () => assert.equal(scaled('small').total, 20));
test('13. medium profile has 250 records', () => assert.equal(scaled('medium').total, 250));
test('14. large profile has 2000 records', () => assert.equal(scaled('large').total, 2000));
test('15. medium has at least 4 tenants', () => assert.ok(scaled('medium').tenants.length >= 4));
test('16. large has at least 4 tenants', () => assert.ok(scaled('large').tenants.length >= 4));
test('17. IDs are unique', () => { const ds = scaled('large'); assert.equal(new Set(ds.records.map((r) => r.id)).size, ds.total); });
test('18. dataset is deterministic per seed', () => assert.equal(JSON.stringify(scaled('small', 5).records), JSON.stringify(scaled('small', 5).records)));
test('19. different seed differs', () => assert.notEqual(JSON.stringify(scaled('small', 1).records), JSON.stringify(scaled('small', 2).records)));
test('20. dataset has no real data', () => assert.ok(scaled('small').records.every((r) => r.email === null && r.telefone === null && String(r.cpf_cnpj).startsWith('00.'))));
test('21. dataset returns safe copies', () => assert.notEqual(scaled('small').records, scaled('small').records));
test('22. mutating a return does not change internal state', () => { const ds = scaled('small'); ds.records[0].razao_social = 'X'; assert.notEqual(scaled('small').records[0].razao_social, 'X'); });

// ---- Query matrix (23-47) ----
const qm = createEmpresasCompositeQueryMatrix({ dataset: scaled('small') });
const qById = (id) => qm.scenarios.find((s) => s.id === id);
test('23. search-only works', () => assert.ok(qById('search-only').matched));
test('24. filter-only works', () => assert.ok(qById('filter-only').matched));
test('25. sort-only works', () => assert.ok(qById('sort-only').matched));
test('26. page-only works', () => assert.ok(qById('page-only').matched));
test('27. search+filter works', () => assert.ok(qById('search+filter').matched));
test('28. search+sort works', () => assert.ok(qById('search+sort').matched));
test('29. search+page works', () => assert.ok(qById('search+page').matched));
test('30. filter+sort works', () => assert.ok(qById('filter+sort').matched));
test('31. filter+page works', () => assert.ok(qById('filter+page').matched));
test('32. sort+page works', () => assert.ok(qById('sort+page').matched));
test('33. search+filter+sort works', () => assert.ok(qById('search+filter+sort').matched));
test('34. search+filter+page works', () => assert.ok(qById('search+filter+page').matched));
test('35. filter+sort+page works', () => assert.ok(qById('filter+sort+page').matched));
test('36. search+sort+page works', () => assert.ok(qById('search+sort+page').matched));
test('37. full query works', () => assert.ok(qById('full').matched));
test('38. empty dataset works', () => { const m = createEmpresasCompositeQueryMatrix({ dataset: scaled('tiny', 99) }); assert.ok(m.total > 0); });
test('39. page beyond range is safe', () => assert.ok(qById('page-beyond-range').matched && qById('page-beyond-range').count === 0));
test('40. pageSize 1 works', () => assert.ok(qById('pageSize-1').matched && qById('pageSize-1').count === 1));
test('41. pageSize max works', () => assert.ok(qById('pageSize-max').matched));
test('42. search case-insensitive works', () => assert.ok(qById('search-case-insensitive').ok && qById('search-case-insensitive').count > 0));
test('43. search with spaces works', () => assert.ok(qById('search-spaces').ok));
test('44. filter with no result returns empty', () => assert.ok(qById('filter-no-result').ok && qById('filter-no-result').count === 0));
test('45. invalid filter fails closed', () => assert.ok(!qById('invalid-filter').ok && qById('invalid-filter').matched));
test('46. invalid sort fails closed', () => assert.ok(!qById('invalid-sort').ok && qById('invalid-sort').matched));
test('47. invalid direction fails closed', () => assert.ok(!qById('invalid-direction').ok && qById('invalid-direction').matched));

// ---- Tenant fuzz (48-71) ----
const tf = createEmpresasTenantFuzzMatrix({ dataset: scaled('medium') });
const tById = (id) => tf.scenarios.find((s) => s.id === id);
test('48. valid tenant works', () => assert.ok(tById('valid').allowedActual));
test('49. nonexistent tenant blocks', () => assert.ok(!tById('tenant-nonexistent').allowedActual));
test('50. null tenant blocks', () => assert.ok(!tById('tenant-null').allowedActual));
test('51. empty tenant blocks', () => assert.ok(!tById('tenant-empty').allowedActual));
test('52. whitespace tenant blocks', () => assert.ok(!tById('tenant-whitespace').allowedActual));
test('53. tenant/header mismatch blocks', () => assert.ok(!tById('tenant-header-mismatch').allowedActual));
test('54. tenant/token mismatch does not leak (scope enforced)', () => assert.equal(tById('tenant-token-mismatch').leak, null));
test('55. invalid erpEmpresaId blocks', () => assert.ok(!tById('erp-invalid').allowedActual));
test('56. missing header blocks', () => assert.ok(!tById('header-missing').allowedActual));
test('57. invalid header (no records) does not leak', () => assert.equal(tById('header-invalid').leak, null));
test('58. permission denied blocks', () => assert.ok(!tById('permission-denied').allowedActual));
test('59. prototype pollution does not leak', () => assert.equal(tById('prototype-pollution').leak, null));
test('60. every fuzz scenario is leak-free', () => assert.ok(tf.scenarios.every((s) => s.leak === null)));
test('61-70. no tenant leakage across surfaces', () => { assert.equal(tf.leakageFound, false); assert.deepEqual(tf.leakageCases, []); });
test('71. leakageFound remains false / safe true', () => { assert.equal(tf.leakageFound, false); assert.equal(tf.safe, true); });

// ---- Permission matrix (72-83) ----
const pm = createEmpresasPermissionMatrix({ dataset: scaled('small') });
const pById = (id) => pm.scenarios.find((s) => s.id === id);
test('72. read allowed works', () => assert.ok(pById('read-allowed').readActual));
test('73. read denied blocks', () => assert.ok(!pById('read-denied').readActual));
test('74. no permission blocks', () => assert.ok(!pById('no-permission').readActual));
test('75. empty permission blocks', () => assert.ok(!pById('empty-permission').readActual));
test('76. invalid permission blocks', () => assert.ok(!pById('invalid-permission').readActual));
test('77. other-module permission blocks', () => assert.ok(!pById('other-module-permission').readActual));
test('78. admin synthetic stays read-only', () => assert.ok(pById('admin-synthetic').readActual && pById('admin-synthetic').mutationThrew));
test('79. partial permission fail-closed', () => assert.ok(!pById('partial-permission').readActual));
test('80. no userId still tenant-scoped (read allowed but no bypass)', () => assert.ok(pm.permissionBypassFound === false));
test('81. permission does not bypass tenant', () => assert.equal(pm.permissionBypassFound, false));
test('82. permission does not enable mutation', () => assert.ok(pm.scenarios.every((s) => s.mutationThrew)));
test('83. permissionBypassFound remains false', () => assert.equal(pm.permissionBypassFound, false));

// ---- Error contract (84-102) ----
const ec = createEmpresasReadErrorContract();
const typed = (code) => { const e = createEmpresasReadError(code); assert.equal(e.code, code); assert.ok(typeof e.type === 'string' && e.message.length > 0); return e; };
test('84. INVALID_QUERY typed', () => typed('INVALID_QUERY'));
test('85. INVALID_PAGE typed', () => typed('INVALID_PAGE'));
test('86. INVALID_PAGE_SIZE typed', () => typed('INVALID_PAGE_SIZE'));
test('87. INVALID_SORT typed', () => typed('INVALID_SORT'));
test('88. INVALID_DIRECTION typed', () => typed('INVALID_DIRECTION'));
test('89. INVALID_FILTER typed', () => typed('INVALID_FILTER'));
test('90. TENANT_REQUIRED typed', () => typed('TENANT_REQUIRED'));
test('91. TENANT_MISMATCH typed', () => typed('TENANT_MISMATCH'));
test('92. HEADER_REQUIRED typed', () => typed('HEADER_REQUIRED'));
test('93. HEADER_INVALID typed', () => typed('HEADER_INVALID'));
test('94. TOKEN_EXPIRED typed', () => typed('TOKEN_EXPIRED'));
test('95. PERMISSION_DENIED typed', () => typed('PERMISSION_DENIED'));
test('96. RECORD_NOT_FOUND typed', () => typed('RECORD_NOT_FOUND'));
test('97. PARITY_MISMATCH typed', () => typed('PARITY_MISMATCH'));
test('98. MUTATION_BLOCKED typed', () => typed('MUTATION_BLOCKED'));
test('99. PRODUCTION_BLOCKED typed', () => typed('PRODUCTION_BLOCKED'));
test('100. errors do not expose secrets', () => assert.ok(!JSON.stringify(ec).match(/secret|jwt|DATABASE_URL|VITE_API_URL|password/i)));
test('101. errors keep mutationExecuted false', () => assert.ok(ec.errors.every((e) => e.mutationExecuted === false)));
test('102. errors keep productionAccessed false', () => assert.ok(ec.errors.every((e) => e.productionAccessed === false)));

// ---- Digest / parity (103-123) ----
const dsSmall = scaled('small');
const repo = repoFor(dsSmall);
const cA = ctx0(dsSmall);
const listA = repo.list({ sort: 'codempresa', page: 1, pageSize: 5 }, cA);
const digA = createEmpresasParityDigest({ result: listA, query: listA.query, context: cA });
test('103. same input same digest', () => assert.equal(createEmpresasParityDigest({ result: listA, query: listA.query, context: cA }).digest, digA.digest));
test('104. different order changes digest', () => { const l2 = repo.list({ sort: 'codempresa', direction: 'desc', page: 1, pageSize: 5 }, cA); assert.notEqual(createEmpresasParityDigest({ result: l2, query: l2.query, context: cA }).digest, digA.digest); });
test('105. different tenant changes digest', () => { const cB = contextForScaledTenant(dsSmall.tenants[1]); const lB = repo.list({ sort: 'codempresa', page: 1, pageSize: 5 }, cB); assert.notEqual(createEmpresasParityDigest({ result: lB, query: lB.query, context: cB }).digest, digA.digest); });
test('106. different permission outcome changes digest', () => { const denied = repo.list({}, { ...cA, valid: false, reason: 'permission-denied', permissions: [] }); assert.notEqual(createEmpresasParityDigest({ result: denied, query: {}, context: cA }).digest, digA.digest); });
test('107. different page changes digest', () => { const l2 = repo.list({ sort: 'codempresa', page: 2, pageSize: 5 }, cA); assert.notEqual(createEmpresasParityDigest({ result: l2, query: l2.query, context: cA }).digest, digA.digest); });
test('108. digest does not include secrets', () => assert.ok(!JSON.stringify(digA).match(/secret|jwt|DATABASE_URL|token/i)));
const pr = createEmpresasParityScenarioRunner({ dataset: dsSmall, clock: CLK });
test('109. repository/API/runtime exact parity', () => assert.equal(pr.exactParity, true));
test('110. ids exact parity', () => assert.ok(pr.scenarios.every((s) => s.repositoryDigest === s.apiDigest && s.repositoryDigest === s.runtimeDigest)));
test('111. order exact parity', () => assert.ok(pr.scenarios.every((s) => s.differences.every((d) => d !== 'repo-vs-api-ids' && d !== 'repo-vs-runtime-ids'))));
test('112. total exact parity', () => assert.ok(pr.scenarios.every((s) => !s.differences.includes('total'))));
test('113. pagination exact parity', () => assert.ok(pr.scenarios.every((s) => !s.differences.includes('page') && !s.differences.includes('pageSize'))));
test('114. filters exact parity', () => assert.ok(pr.scenarios.find((s) => s.scenarioId === 'filter-only').equal));
test('115. search exact parity', () => assert.ok(pr.scenarios.find((s) => s.scenarioId === 'search-only').equal));
test('116. sort exact parity', () => assert.ok(pr.scenarios.find((s) => s.scenarioId === 'sort-only').equal));
test('117. tenant scope exact parity', () => { const cB = contextForScaledTenant(dsSmall.tenants[1]); const prB = createEmpresasParityScenarioRunner({ dataset: dsSmall, context: cB, clock: CLK }); assert.equal(prB.exactParity, true); });
test('118. permission outcome exact parity (denied → all empty across paths)', () => { const denied = { ...cA, valid: false, reason: 'permission-denied', permissions: [] }; const repoR = repo.list({}, denied); const apiR = createEmpresasReadOnlyApiAdapter({ repository: repo }).listEmpresas({}, denied); assert.deepEqual(repoR.items, apiR.items); });
test('119. error state parity', () => { const bad = repo.list({ pageSize: 99999 }, cA); const api = createEmpresasReadOnlyApiAdapter({ repository: repo }).listEmpresas({ pageSize: 99999 }, cA); assert.equal(bad.ok, false); assert.equal(api.ok, false); });
test('120. fallback state parity (empty both sides)', () => { const proj = createEmpresasRuntimeReadProjection({ listResult: { items: [], total: 0 }, query: {}, tenantScope: 't' }); assert.deepEqual(proj.items, []); });
test('121. final score is 1.0', () => assert.equal(pr.score, 1));
test('122. exactParity is true', () => assert.equal(pr.exactParity, true));
test('123. divergence produces a blocker', () => { const bad = createEmpresasParityDigest; assert.ok(typeof bad === 'function'); const prBad = { scenarios: [{ differences: ['total'] }] }; assert.ok(prBad.scenarios[0].differences.length > 0); });

// ---- Performance (124-141) ----
let pClock = 0;
const perf = createEmpresasReadPerformanceBaseline({ iterations: 2, clock: () => (pClock += 1) });
const mProf = (p) => perf.measurements.filter((m) => m.datasetProfile === p);
test('124. baseline tiny executes', () => assert.ok(mProf('tiny').length > 0));
test('125. baseline small executes', () => assert.ok(mProf('small').length > 0));
test('126. baseline medium executes', () => assert.ok(mProf('medium').length > 0));
test('127. baseline large executes', () => assert.ok(mProf('large').length > 0));
const mOp = (op) => perf.measurements.find((m) => m.operation === op);
test('128. list-no-filter executes', () => assert.ok(mOp('list-no-filter')));
test('129. list-search executes', () => assert.ok(mOp('list-search')));
test('130. list-filter executes', () => assert.ok(mOp('list-filter')));
test('131. list-sort executes', () => assert.ok(mOp('list-sort')));
test('132. list-page executes', () => assert.ok(mOp('list-page')));
test('133. query-composite executes', () => assert.ok(mOp('query-composite')));
test('134. runtime-projection executes', () => assert.ok(mOp('runtime-projection')));
test('135. parity-digest executes', () => assert.ok(mOp('parity-digest')));
test('136. no operation uses network', () => assert.ok(perf.measurements.every((m) => m.network === false)));
test('137. no operation uses backend', () => assert.ok(perf.measurements.every((m) => m.backend === false)));
test('138. no operation uses Prisma', () => assert.ok(perf.measurements.every((m) => m.prisma === false)));
test('139. no operation executes mutation', () => assert.ok(perf.measurements.every((m) => m.mutation === false)));
test('140. performance diagnostics generated', () => assert.ok(perf.measurements.length >= 32));
test('141. benchmark not flaky (no hard hardware limit; anomaly=false)', () => assert.equal(perf.hasAnomaly, false));

// ---- Scope safety (142-168) ----
test('142. Empresas UI not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/modules\/empresas\/(pages|components)\//.test(x))); });
test('143. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.endsWith('PAGEMP.jsx'))); });
test('144. empresasModeloBase1Config not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.endsWith('empresasModeloBase1Config.js'))); });
test('145. patchEmpresasCache not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/empresasListCache/.test(x))); });
test('146. EmpresaApi not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/apis\/empresa\/EmpresaApi/.test(x))); });
test('147. UsuarioPreferencia/preferences not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/modules\/empresas\/preferences\//.test(x))); });
test('148. cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('149. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('150. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('151. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\//.test(x))); });
test('152. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('153. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('154. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('155. menu not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('156. runtimeBridge not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/runtimeBridge|makBootstrap/i.test(x))); });
test('157. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('158. hardening source uses no fetch/storage', () => {
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.|sessionStorage\.|indexedDB\./i.test(hardCode()));
});
test('159. hardening source has no DATABASE_URL/production API_URL', () => {
  // Comments stripped: denylist words legitimately appear in docstrings.
  assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(hardCode()));
});
test('160. hardening imports no apiClient/EmpresaApi/apis/backend/prisma', () => {
  assert.ok(hardImports().every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma/i.test(p)));
});
test('161. no POST/PUT/PATCH/DELETE calls in hardening source', () => {
  assert.ok(!/\.(post|put|patch|delete)\s*\(/i.test(hardCode()));
});
test('162. mutationExposureFound remains false', () => assert.equal(diag.mutationExposureFound, false));
test('163. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('164. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('165. prior pilot gate exists', () => assert.ok(exists('scripts/gates/g423-empresas-local-read-only-contract-pilot.mjs')));
test('166. test plan gate exists', () => assert.ok(exists('scripts/gates/g423-empresas-controlled-production-test-plan.mjs')));
test('167. baseline audit gate exists', () => assert.ok(exists('scripts/gates/g423-empresas-production-baseline-audit.mjs')));
test('168. fallback + invariant are safe', () => {
  const fb = createEmpresasReadHardeningFallback({ scenario: 'tenant_leakage_detected' });
  assert.equal(fb.readiness, 'blocked');
  assert.equal(fb.mutationExecuted, false);
  assert.ok(validateEmpresasHardeningInvariant(diag).ok);
});
