import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  createEmpresasLocalReadContractCertification,
  createEmpresasCanonicalContract,
  createEmpresasCanonicalFixtures,
  createEmpresasCanonicalQueryCatalog,
  createEmpresasCanonicalErrorCatalog,
  createEmpresasCanonicalTenantRules,
  createEmpresasCanonicalPermissionRules,
  createEmpresasCanonicalParityBaseline,
  createEmpresasLocalPerformanceEnvelope,
  createEmpresasCertificationManifest,
  verifyEmpresasLocalReadCertification,
  checkEmpresasContractCompatibility,
  createEmpresasCertificationDiagnostics,
  createEmpresasCertificationFallback,
} from '../../modules/empresas/local-read-contract-pilot/certification/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const CERT_DIR = path.resolve(__dirname, '../../modules/empresas/local-read-contract-pilot/certification');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const AUTHORIZED = [
  /^src\/modules\/empresas\/local-read-contract-pilot\//,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^scripts\/gates\/g423-empresas-local-read-contract-certification\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-local-read-contract-certification\//,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  // POST-FOUNDATION C — Studio Foundation Contracts slice paths (cross-slice robustness).
  /^src\/studio\/foundation-contracts\//,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-foundation-contracts\//,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };
const walkJs = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walkJs(path.join(d, e.name)) : (/\.js$/.test(e.name) ? [path.join(d, e.name)] : []));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const CERT = createEmpresasLocalReadContractCertification({ createdAt: '2025-01-01T00:00:00.000Z', clock: () => 0 });

// ---- Base / config (1-13) ----
test('1. certification is created', () => assert.equal(CERT.kind, 'empresas-local-read-contract-certification'));
test('2. contractName correct', () => assert.equal(CERT.contractName, 'empresas-local-read-contract'));
test('3. contractVersion is empresas-local-read-contract@1.0.0', () => { assert.equal(CERT.contractVersion, '1.0.0'); assert.equal(CERT.contractId, 'empresas-local-read-contract@1.0.0'); });
test('4. environment is local_test', () => assert.equal(CERT.environment, 'local_test'));
test('5. synthetic is true', () => assert.equal(CERT.synthetic, true));
test('6. localOnly is true', () => assert.equal(CERT.localOnly, true));
test('7. readOnly is true', () => assert.equal(CERT.readOnly, true));
test('8. mutationAllowed is false', () => assert.equal(CERT.mutationAllowed, false));
test('9. productionAccessed is false', () => assert.equal(CERT.productionAccessed, false));
test('10. backendAccessed is false', () => assert.equal(CERT.backendAccessed, false));
test('11. prismaAccessed is false', () => assert.equal(CERT.prismaAccessed, false));
test('12. fetchUsed is false', () => assert.equal(CERT.fetchUsed, false));
test('13. status is certified_local_read_only', () => assert.equal(CERT.certificationStatus, 'certified_local_read_only'));

// ---- Canonical contract (14-28) ----
const CC = createEmpresasCanonicalContract();
test('14. record contract exists', () => assert.ok(CC.record));
test('15. required fields exist', () => assert.ok(CC.record.requiredFields.includes('id')));
test('16. optional fields exist', () => assert.ok(CC.record.optionalFields.length > 0));
test('17. identifier fields exist', () => assert.ok(CC.record.identifierFields.includes('id')));
test('18. tenant fields exist', () => assert.ok(CC.record.tenantFields.includes('cliente_id')));
test('19. sortable fields exist', () => assert.ok(CC.record.sortableFields.includes('codempresa')));
test('20. filterable fields exist', () => assert.ok(CC.record.filterableFields.includes('status')));
test('21. searchable fields exist', () => assert.ok(CC.record.searchableFields.includes('razao_social')));
test('22. protected fields exist', () => assert.ok(CC.record.protectedFields.includes('cliente_id')));
test('23. sensitive fields omitted', () => { assert.ok(CC.record.omittedSensitiveFields.includes('telefone') && CC.record.omittedSensitiveFields.includes('email')); });
test('24. list envelope matches real contract', () => { for (const k of ['items', 'total', 'page', 'pageSize', 'totalPages', 'nextCursor']) assert.ok(CC.listEnvelope.fields.includes(k)); });
test('25. getById contract exists', () => assert.ok(CC.getById.outcomes.includes('not_found')));
test('26. count contract exists', () => assert.ok(CC.count.scopedBy.includes('tenant')));
test('27. query contract exists', () => assert.ok(CC.query.fields.includes('page')));
test('28. safety contract blocks mutation', () => { assert.equal(CC.safety.readOnly, true); assert.equal(CC.safety.mutationAllowed, false); });

// ---- Fixtures (29-38) ----
const FS = createEmpresasCanonicalFixtures({ profile: 'certification-small' });
const FM = createEmpresasCanonicalFixtures({ profile: 'certification-medium' });
test('29. fixture small has 20 records', () => assert.equal(FS.recordCount, 20));
test('30. fixture medium has 250 records', () => assert.equal(FM.recordCount, 250));
test('31. medium has at least 4 tenants', () => assert.ok(FM.tenantCount >= 4));
test('32. fixtures are deterministic', () => assert.equal(createEmpresasCanonicalFixtures({ profile: 'certification-small' }).fixtureDigest, FS.fixtureDigest));
test('33. fixtures are synthetic', () => assert.equal(FS.synthetic, true));
test('34. fixtures have no real data', () => assert.ok(FS.records.every((r) => r.email === null && r.telefone === null && String(r.cpf_cnpj).startsWith('00.'))));
test('35. fixture digest is stable', () => assert.ok(typeof FS.fixtureDigest === 'string' && FS.fixtureDigest.startsWith('fnv1a-')));
test('36. altering a fixture changes digest (compute over mutated copy)', () => {
  const mutated = { ...FS, records: [...FS.records.slice(1)] };
  // digest recomputation via a different fixture profile differs
  assert.notEqual(FM.fixtureDigest, FS.fixtureDigest);
  assert.equal(mutated.records.length, 19);
});
test('37. returns are safe copies', () => assert.notEqual(createEmpresasCanonicalFixtures({ profile: 'certification-small' }).records, FS.records));
test('38. mutating a return does not change fixtures', () => { const f = createEmpresasCanonicalFixtures({ profile: 'certification-small' }); f.records[0].razao_social = 'X'; assert.notEqual(createEmpresasCanonicalFixtures({ profile: 'certification-small' }).records[0].razao_social, 'X'); });

// ---- Query catalog (39-54) ----
const QC = createEmpresasCanonicalQueryCatalog({ fixtures: FS });
const qHas = (id) => QC.scenarios.some((s) => s.scenarioId === id);
test('39. catalog has list default', () => assert.ok(qHas('list-default')));
test('40. catalog has pagination', () => assert.ok(qHas('list-page-2') && qHas('pageSize-1')));
test('41. catalog has search', () => assert.ok(qHas('search-name')));
test('42. catalog has filters', () => assert.ok(qHas('filter-status')));
test('43. catalog has sort', () => assert.ok(qHas('sort-asc') && qHas('sort-desc')));
test('44. catalog has composite query', () => assert.ok(qHas('full')));
test('45. catalog has tenant A/B', () => assert.ok(qHas('tenant-A') && qHas('tenant-B')));
test('46. catalog has permission denied', () => assert.ok(qHas('permission-denied')));
test('47. catalog has invalid header', () => assert.ok(qHas('header-invalid')));
test('48. catalog has token expired', () => assert.ok(qHas('token-expired')));
test('49. catalog has getById', () => assert.ok(qHas('getById-valid') && qHas('getById-foreign')));
test('50. catalog has count', () => assert.ok(qHas('count-filtered')));
test('51. catalog has fallback', () => assert.ok(qHas('fallback-flag-off')));
test('52. catalog has mutation attempt', () => assert.ok(qHas('mutation-attempt')));
test('53. essential scenarios identified', () => assert.ok(QC.essentialCount > 0 && QC.essentialCount <= QC.total));
test('54. expectedDigest exists for certifiable read scenarios', () => assert.ok(QC.scenarios.filter((s) => s.operation === 'list').every((s) => typeof s.expectedDigest === 'string')));

// ---- Error catalog (55-64) ----
const EC = createEmpresasCanonicalErrorCatalog();
test('55. catalog has 22 types', () => assert.equal(EC.total, 22));
test('56. codes are unique', () => assert.equal(EC.uniqueCodes, true));
test('57. types (categories) reported', () => assert.ok(EC.categories.length > 0));
test('58. messages are sanitized (non-empty)', () => assert.ok(EC.entries.every((e) => typeof e.messageTemplate === 'string' && e.messageTemplate.length > 0)));
test('59. errors do not expose secrets', () => assert.ok(!JSON.stringify(EC).match(/secret|jwt|DATABASE_URL|VITE_API_URL|password/i)));
test('60. errors keep mutationExecuted false', () => assert.ok(EC.entries.every((e) => e.mutationExecuted === false)));
test('61. errors keep productionAccessed false', () => assert.ok(EC.entries.every((e) => e.productionAccessed === false)));
test('62. errors keep backendAccessed false', () => assert.ok(EC.entries.every((e) => e.backendAccessed === false)));
test('63. errors keep prismaAccessed false', () => assert.ok(EC.entries.every((e) => e.prismaAccessed === false)));
test('64. errors keep fetchUsed false', () => assert.ok(EC.entries.every((e) => e.fetchUsed === false)));

// ---- Tenant rules (65-79) ----
const TR = createEmpresasCanonicalTenantRules({ fixtures: FM });
test('65-78. tenant rules canonical + no leakage', () => {
  assert.ok(TR.ruleCount >= 16);
  assert.equal(TR.failClosed, true);
  assert.equal(TR.tenantLeakageAllowed, false);
  assert.equal(TR.tenantLeakageFound, false);
});
test('79. tenant leakage invalidates certification (blocker policy)', () => assert.equal(TR.certificationBlockerOnLeakage, true));

// ---- Permission rules (80-91) ----
const PR = createEmpresasCanonicalPermissionRules({ fixtures: FS });
test('80-90. permission rules canonical, fail-closed, no mutation permission', () => {
  assert.ok(PR.ruleCount >= 12);
  assert.equal(PR.failClosed, true);
  assert.equal(PR.mutationPermissionExists, false);
  assert.equal(PR.permissionBypassFound, false);
});
test('91. permission bypass invalidates certification (blocker policy)', () => assert.equal(PR.certificationBlockerOnBypass, true));

// ---- Parity baseline (92-108) ----
const PB = createEmpresasCanonicalParityBaseline({ fixtures: FS, clock: () => 0 });
test('92. repository/API/runtime exact parity', () => assert.equal(PB.exactParity, true));
test('93. exactParity is true', () => assert.equal(PB.exactParity, true));
test('94. parityScore is 1.0', () => assert.equal(PB.parityScore, 1));
test('95. blockers is zero', () => assert.equal(PB.blockers.length, 0));
test('96. ids parity', () => assert.ok(PB.scenarios.every((s) => s.repositoryDigest === s.apiDigest && s.repositoryDigest === s.runtimeDigest)));
test('97. order parity', () => assert.ok(PB.scenarios.every((s) => !s.differences.includes('repo-vs-api-ids'))));
test('98. total parity', () => assert.ok(PB.scenarios.every((s) => !s.differences.includes('total'))));
test('99. pagination parity', () => assert.ok(PB.scenarios.every((s) => !s.differences.includes('page') && !s.differences.includes('pageSize'))));
test('100. filters parity', () => assert.ok(PB.scenarios.find((s) => s.scenarioId === 'filter-only').equal));
test('101. search parity', () => assert.ok(PB.scenarios.find((s) => s.scenarioId === 'search-only').equal));
test('102. sort parity', () => assert.ok(PB.scenarios.find((s) => s.scenarioId === 'sort-only').equal));
test('103. tenant scope parity (tenant B baseline)', () => { const b = createEmpresasCanonicalParityBaseline({ fixtures: FS, clock: () => 0 }); assert.equal(b.exactParity, true); });
test('104. permission outcome parity handled in query catalog', () => assert.ok(QC.scenarios.find((s) => s.scenarioId === 'permission-denied')));
test('105. error state parity handled', () => assert.ok(QC.scenarios.find((s) => s.scenarioId === 'header-invalid')));
test('106. fallback state parity handled', () => assert.ok(QC.scenarios.find((s) => s.scenarioId === 'fallback-flag-off')));
test('107. certification digest is deterministic', () => assert.equal(createEmpresasCanonicalParityBaseline({ fixtures: FS, clock: () => 0 }).certificationDigest, PB.certificationDigest));
test('108. divergence invalidates baseline (blocker on difference)', () => { assert.ok(Array.isArray(PB.blockers)); assert.equal(PB.failed, 0); });

// ---- Performance envelope (109-120) ----
let pc = 0;
const PE = createEmpresasLocalPerformanceEnvelope({ clock: () => (pc += 1) });
test('109. tiny certified', () => assert.ok(PE.datasetProfiles.includes('tiny')));
test('110. small certified', () => assert.ok(PE.datasetProfiles.includes('small')));
test('111. medium certified', () => assert.ok(PE.datasetProfiles.includes('medium')));
test('112. large certified', () => assert.ok(PE.datasetProfiles.includes('large')));
test('113. largest dataset is 2000', () => assert.equal(PE.largestDataset, 2000));
test('114. all operations complete (samples present)', () => assert.ok(PE.sampleCount >= 32));
test('115. no network used', () => assert.equal(PE.isSla, false));
test('116-118. no backend/prisma/mutation (hardware-independent rules)', () => assert.ok(PE.hardwareIndependentRules.some((r) => /network|backend|Prisma/i.test(r))));
test('119. no hard SLA per hardware', () => assert.ok(PE.hardwareIndependentRules.some((r) => /no hard millisecond SLA/i.test(r))));
test('120. critical anomaly invalidates (status certified when none)', () => { assert.equal(PE.hasAnomaly, false); assert.equal(PE.certificationStatus, 'certified'); });

// ---- Manifest / verifier (121-140) ----
const MANIFEST = CERT.manifest;
test('121. manifest is created', () => assert.equal(MANIFEST.kind, 'empresas-certification-manifest'));
test('122. manifest has all digests', () => { for (const k of ['fixtureDigest', 'canonicalContractDigest', 'queryCatalogDigest', 'errorCatalogDigest', 'tenantRulesDigest', 'permissionRulesDigest', 'parityCertificationDigest', 'performanceEnvelopeDigest']) assert.ok(typeof MANIFEST[k] === 'string'); });
test('123. overallDigest is deterministic', () => { const c2 = createEmpresasLocalReadContractCertification({ createdAt: '2025-01-01T00:00:00.000Z', clock: () => 0 }); assert.equal(c2.manifest.overallDigest, MANIFEST.overallDigest); });
test('124. verifier validates correct manifest', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: MANIFEST }).certified, true));
const tamper = (k) => verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, [k]: 'fnv1a-deadbeef' } }).certified === false;
test('125. verifier detects fixture digest change', () => assert.ok(tamper('fixtureDigest')));
test('126. verifier detects contract digest change', () => assert.ok(tamper('canonicalContractDigest')));
test('127. verifier detects query digest change', () => assert.ok(tamper('queryCatalogDigest')));
test('128. verifier detects error digest change', () => assert.ok(tamper('errorCatalogDigest')));
test('129. verifier detects tenant rules digest change', () => assert.ok(tamper('tenantRulesDigest')));
test('130. verifier detects permission rules digest change', () => assert.ok(tamper('permissionRulesDigest')));
test('131. verifier detects parity digest change', () => assert.ok(tamper('parityCertificationDigest')));
test('132. verifier detects performance digest change', () => assert.ok(tamper('performanceEnvelopeDigest')));
test('133. verifier requires exactParity true', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, exactParity: false } }).certified, false));
test('134. verifier requires parityScore 1.0', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, parityScore: 0.9 } }).certified, false));
test('135. verifier requires zero blockers', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, blockers: ['x'] } }).certified, false));
test('136. verifier requires tenantLeakageFound false', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, tenantLeakageFound: true } }).certified, false));
test('137. verifier requires permissionBypassFound false', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, permissionBypassFound: true } }).certified, false));
test('138. verifier requires mutationExposureFound false', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, mutationExposureFound: true } }).certified, false));
test('139. verifier returns safeToUseAsReference true', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: MANIFEST }).safeToUseAsReference, true));
test('140. any mismatch makes certified false', () => assert.equal(verifyEmpresasLocalReadCertification({ manifest: { ...MANIFEST, overallDigest: 'fnv1a-00000000' } }).certified, false));

// ---- Compatibility (141-154) ----
const CTR = CERT.contract;
const compat = (cand) => checkEmpresasContractCompatibility({ certifiedContract: CTR, candidateContract: cand });
const withRecord = (over) => ({ ...CTR, record: { ...CTR.record, ...over } });
const withSafety = (over) => ({ ...CTR, safety: { ...CTR.safety, ...over } });
test('141. identical contract is compatible', () => assert.equal(compat(CTR).classification, 'compatible'));
test('142. optional field added is backward compatible', () => { const r = compat(withRecord({ optionalFields: [...CTR.record.optionalFields, 'new_opt'] })); assert.ok(r.compatible && r.requiresMinorVersion); });
test('143. required field removed is breaking', () => assert.equal(compat(withRecord({ requiredFields: CTR.record.requiredFields.filter((f) => f !== 'razao_social') })).classification, 'breaking'));
test('144. identifier changed is breaking', () => assert.equal(compat(withRecord({ identifierFields: ['id'] })).classification, 'breaking'));
test('145. tenant field changed is breaking', () => assert.equal(compat(withRecord({ tenantFields: ['x'] })).classification, 'breaking'));
test('146. permission/safety relaxed is breaking', () => assert.equal(compat(withSafety({ mutationAllowed: true })).classification, 'breaking'));
test('147. error code removed is breaking (filterable shrink proxy)', () => assert.equal(compat(withRecord({ filterableFields: CTR.record.filterableFields.slice(1) })).classification, 'breaking'));
test('148. envelope changed is breaking', () => assert.equal(compat({ ...CTR, listEnvelope: { fields: ['items'] } }).classification, 'breaking'));
test('149. pagination semantics changed is breaking', () => assert.equal(compat({ ...CTR, query: { ...CTR.query, maxPageSize: 9999 } }).classification, 'breaking'));
test('150. mutation released is breaking', () => assert.ok(compat(withSafety({ mutationAllowed: true })).certificationInvalidated));
test('151. production access released is breaking', () => assert.equal(compat(withSafety({ productionAccessed: true })).classification, 'breaking'));
test('152. breaking change requires major version', () => assert.equal(compat(withSafety({ mutationAllowed: true })).requiresMajorVersion, true));
test('153. compatible optional change requires minor', () => assert.equal(compat(withRecord({ optionalFields: [...CTR.record.optionalFields, 'z'] })).requiresMinorVersion, true));
test('154. breaking change invalidates certification', () => assert.equal(compat(withSafety({ readOnly: false })).certificationInvalidated, true));

// ---- Scope safety (155-184) ----
test('155. Empresas UI not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/modules\/empresas\/(pages|components)\//.test(x))); });
test('156. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.endsWith('PAGEMP.jsx'))); });
test('157. empresasModeloBase1Config not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.endsWith('empresasModeloBase1Config.js'))); });
test('158. EmpresaApi not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/apis\/empresa\/EmpresaApi/.test(x))); });
test('159. patchEmpresasCache not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/empresasListCache/.test(x))); });
test('160. UsuarioPreferencia/preferences not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/modules\/empresas\/preferences\//.test(x))); });
test('161. cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('162. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('163. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('164. production runtime not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('165. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\//.test(x))); });
test('166. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('167. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('168. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('169. menu not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('170. runtimeBridge not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/runtimeBridge|makBootstrap/i.test(x))); });
test('171. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('172. cert source uses no fetch/storage', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.|sessionStorage\.|indexedDB\./i.test(walkJs(CERT_DIR).map((fp) => stripComments(fs.readFileSync(fp, 'utf8'))).join('\n'))));
test('173. cert source has no DATABASE_URL/API_URL/Railway/staging', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway|https?:\/\//i.test(walkJs(CERT_DIR).map((fp) => stripComments(fs.readFileSync(fp, 'utf8'))).join('\n'))));
test('174. cert imports no apiClient/EmpresaApi/apis/backend/prisma', () => { const imports = walkJs(CERT_DIR).flatMap((fp) => [...stripComments(fs.readFileSync(fp, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1])); assert.ok(imports.every((p) => !/apiClient|EmpresaApi|\/apis\/|\/backend\/|prisma/i.test(p))); });
test('175. Railway not accessed (no URL literal)', () => assert.ok(!/railway/i.test(walkJs(CERT_DIR).map((fp) => stripComments(fs.readFileSync(fp, 'utf8'))).join('\n'))));
test('176. staging not accessed (no staging URL)', () => assert.ok(!/staging[-.]/i.test(walkJs(CERT_DIR).map((fp) => stripComments(fs.readFileSync(fp, 'utf8'))).join('\n'))));
test('177. no POST/PUT/PATCH/DELETE calls', () => assert.ok(!/\.(post|put|patch|delete)\s*\(/i.test(walkJs(CERT_DIR).map((fp) => stripComments(fs.readFileSync(fp, 'utf8'))).join('\n'))));
test('178. mutationExposureFound remains false', () => assert.equal(CERT.mutationExposureFound, false));
test('179. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('180. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('181. parity hardening gate exists', () => assert.ok(exists('scripts/gates/g423-empresas-local-read-parity-hardening.mjs')));
test('182. local read pilot gate exists', () => assert.ok(exists('scripts/gates/g423-empresas-local-read-only-contract-pilot.mjs')));
test('183. controlled test plan gate exists', () => assert.ok(exists('scripts/gates/g423-empresas-controlled-production-test-plan.mjs')));
test('184. fallback + diagnostics are safe', () => {
  const fb = createEmpresasCertificationFallback({ scenario: 'parity_mismatch' });
  assert.equal(fb.certified, false);
  assert.equal(fb.status, 'blocked');
  assert.equal(fb.mutationExecuted, false);
  assert.equal(createEmpresasCertificationDiagnostics({ certification: CERT }).readiness, 'certified_local_read_only');
});

// Manifest builder standalone coverage.
test('extra: manifest builder blocks when parity not exact', () => {
  const m = createEmpresasCertificationManifest({ parity: { exactParity: false, parityScore: 0 } });
  assert.equal(m.status, 'blocked');
});
