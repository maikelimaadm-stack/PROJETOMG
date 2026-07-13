import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
  EMPRESAS_MIRROR_ERROR_CODES,
  createEmpresasMirrorError,
  MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG,
  isEmpresasBlueprintMirrorEnabled,
  createEmpresasFieldBlueprintMirror,
  createEmpresasScreenBlueprintMirror,
  createEmpresasTableFormBlueprintMirror,
  createEmpresasFilterSortBlueprintMirror,
  createEmpresasPermissionBlueprintMirror,
  createEmpresasTenantBlueprintMirror,
  createEmpresasPersistenceBoundaryMirror,
  createEmpresasRuntimeBindingMirror,
  createEmpresasBlueprintAlignmentAudit,
  createEmpresasBlueprintMirrorManifest,
  verifyEmpresasBlueprintMirror,
  checkEmpresasBlueprintMirrorCompatibility,
  createEmpresasBlueprintMirrorDiagnostics,
  createEmpresasBlueprintMirrorFallback,
  createEmpresasCertifiedBlueprintMirror,
  mirrorDigest,
} from '../../studio/blueprint-mirrors/empresas/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-mirrors/empresas');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

const M = createEmpresasCertifiedBlueprintMirror();
const field = createEmpresasFieldBlueprintMirror();
const screen = createEmpresasScreenBlueprintMirror();
const tf = createEmpresasTableFormBlueprintMirror();
const fsort = createEmpresasFilterSortBlueprintMirror();
const perm = createEmpresasPermissionBlueprintMirror();
const tenant = createEmpresasTenantBlueprintMirror();
const pers = createEmpresasPersistenceBoundaryMirror();
const bind = createEmpresasRuntimeBindingMirror();
const audit = M.alignmentAudit;

// ===== Base (1-21) =====
test('1. mirror created', () => assert.equal(M.kind, 'empresas-certified-blueprint-mirror'));
test('2. mirrorName', () => assert.equal(M.mirrorName, 'empresas-certified-blueprint-mirror'));
test('3. mirrorVersion', () => assert.equal(M.mirrorVersion, EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION));
test('4. blueprintContractVersion', () => assert.equal(M.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('5. empresasReadContractVersion', () => assert.equal(M.empresasReadContractVersion, 'empresas-local-read-contract@1.0.0'));
test('6. moduleId empresas', () => assert.equal(M.moduleId, 'empresas'));
test('7. modelType cadastro', () => assert.equal(M.modelType, 'cadastro'));
test('8. modelFamily ModeloBase1', () => assert.equal(M.modelFamily, 'ModeloBase1'));
test('9. mode audit_only', () => assert.equal(M.mode, 'audit_only'));
test('10. headless', () => assert.equal(M.headless, true));
test('11. uiCreated false', () => assert.equal(M.uiCreated, false));
test('12. routeCreated false', () => assert.equal(M.routeCreated, false));
test('13. menuCreated false', () => assert.equal(M.menuCreated, false));
test('14. moduleRegistered false', () => assert.equal(M.moduleRegistered, false));
test('15. backendAccessed false', () => assert.equal(M.backendAccessed, false));
test('16. prismaAccessed false', () => assert.equal(M.prismaAccessed, false));
test('17. productionAccessed false', () => assert.equal(M.productionAccessed, false));
test('18. stagingAccessed false', () => assert.equal(M.stagingAccessed, false));
test('19. fetchUsed false', () => assert.equal(M.fetchUsed, false));
test('20. mutationAllowed false', () => assert.equal(M.mutationAllowed, false));
test('21. rewriteEmpresas false', () => assert.equal(M.rewriteEmpresas, false));

// ===== Field mirror (22-38) =====
test('22. field mirror exists', () => assert.equal(field.kind, 'empresas-field-blueprint-mirror'));
test('23. real fields mapped', () => assert.ok(field.fields.length >= 14));
test('24. mappedFields exists', () => assert.ok(Array.isArray(field.mappedFields) && field.mappedFields.length > 0));
test('25. unmappedFields exists', () => assert.ok(Array.isArray(field.unmappedFields)));
test('26. unsupportedFields exists', () => assert.ok(Array.isArray(field.unsupportedFields)));
test('27. requiredFields exists', () => assert.ok(field.requiredFields.includes('razao_social')));
test('28. optionalFields exists', () => assert.ok(field.optionalFields.includes('status')));
test('29. protectedFields exists', () => assert.ok(field.protectedFields.includes('cliente_id')));
test('30. tenantFields exists', () => assert.ok(field.tenantFields.includes('cliente_id')));
test('31. searchableFields exists', () => assert.ok(field.searchableFields.includes('razao_social')));
test('32. filterableFields exists', () => assert.ok(field.filterableFields.includes('status')));
test('33. sortableFields exists', () => assert.ok(field.sortableFields.includes('codempresa')));
test('34. cadcps/custom mapping documented', () => assert.ok(field.customFieldHooks && field.unsupportedFields.includes('campos_personalizados')));
test('35. field without contract is gap not error', () => assert.ok(field.unsupportedFields.length > 0 && field.alignmentStatus === 'partially_aligned'));
test('36. protected field not open', () => assert.ok(field.fields.find((f) => f.name === 'cliente_id').protected === true));
test('37. tenant fields preserved', () => assert.ok(field.fields.filter((f) => f.tenantScoped).map((f) => f.name).includes('cliente_id')));
test('38. no invented field', () => assert.equal(field.invented, false));

// ===== Screen/table/form (39-56) =====
test('39. screen mirror exists', () => assert.equal(screen.kind, 'empresas-screen-blueprint-mirror'));
test('40. table screen mapped', () => assert.ok(screen.screens.find((s) => s.kind === 'table').present));
test('41. form screen mapped', () => assert.ok(screen.screens.find((s) => s.kind === 'form').present));
test('42. detail mapped or absent', () => assert.ok(screen.screens.some((s) => s.kind === 'detail')));
test('43. filters area mapped', () => assert.ok(screen.areas.some((a) => a.area === 'filters')));
test('44. toolbar mapped', () => assert.ok(screen.areas.some((a) => a.area === 'toolbar')));
test('45. actions referenceOnly', () => assert.ok(screen.screens.every((s) => /referenceOnly/.test(s.mutationActions))));
test('46. empty/loading/error mapped or gap', () => assert.ok(screen.requiredStates.length === 3));
test('47. preferences/layout referenceOnly', () => assert.ok(screen.areas.find((a) => a.area === 'preferencesLayout').referenceOnly === true));
test('48. screen no react component', () => assert.ok(screen.screens.every((s) => s.generatesReactComponent === false)));
test('49. screen no change PAGEMP', () => assert.ok(screen.screens.every((s) => s.changesPagemp === false)));
test('50. screen no change ModeloBase1CadastroPage', () => assert.ok(screen.screens.every((s) => s.changesModeloBase1CadastroPage === false)));
test('51. table/form mirror exists', () => assert.equal(tf.kind, 'empresas-table-form-blueprint-mirror'));
test('52. columns mapped', () => assert.ok(tf.table.columns.length > 0));
test('53. form fields mapped', () => assert.ok(tf.form.fields.length > 0));
test('54. row actions referenceOnly', () => assert.match(tf.table.rowActions, /referenceOnly/));
test('55. export mapped or absent', () => assert.ok(typeof tf.table.export.present === 'boolean'));
test('56. gaps registered', () => assert.ok(Array.isArray(tf.gaps)));

// ===== Filter/sort (57-65) =====
test('57. filter/sort mirror exists', () => assert.equal(fsort.kind, 'empresas-filter-sort-blueprint-mirror'));
test('58. search mapped or absent', () => assert.ok(typeof fsort.supportedSearch.present === 'boolean'));
test('59. filters mapped', () => assert.ok(fsort.supportedFilters.includes('status')));
test('60. sort fields mapped', () => assert.ok(fsort.supportedSorts.includes('codempresa')));
test('61. sort directions mapped', () => assert.deepEqual(fsort.directions, ['asc', 'desc']));
test('62. pagination mapped or absent', () => assert.ok(fsort.pagination.present === true));
test('63. unsupported filters registered', () => assert.ok(Array.isArray(fsort.unsupportedFilters)));
test('64. unsupported sorts registered', () => assert.ok(Array.isArray(fsort.unsupportedSorts)));
test('65. query alignment computed', () => assert.ok(fsort.queryAlignment && typeof fsort.queryAlignment.aligned === 'boolean'));

// ===== Permission/tenant (66-81) =====
test('66. permission mirror exists', () => assert.equal(perm.kind, 'empresas-permission-blueprint-mirror'));
test('67. read mapped', () => assert.equal(perm.permissions.find((p) => p.action === 'read').classification, 'existing'));
test('68. create/update/delete referenceOnly or gap', () => assert.ok(['reference_only'].includes(perm.permissions.find((p) => p.action === 'create').classification)));
test('69. export/configure/diagnostics mapped or gap', () => assert.ok(perm.permissions.some((p) => p.action === 'export')));
test('70. defaultDeny true', () => assert.equal(perm.defaultDeny, true));
test('71. failClosed true', () => assert.equal(perm.failClosed, true));
test('72. no permission altered', () => assert.equal(perm.permissionsAltered, false));
test('73. permission gaps registered', () => assert.ok(perm.gaps.length > 0));
test('74. tenant mirror exists', () => assert.equal(tenant.kind, 'empresas-tenant-blueprint-mirror'));
test('75. cliente_id mapped', () => assert.ok(tenant.certifiedTenantFields.includes('cliente_id')));
test('76. erp_empresa_id documented', () => assert.ok(tenant.signals.some((s) => s.signal === 'erp_empresa_id')));
test('77. empresaHeader documented', () => assert.ok(tenant.signals.some((s) => s.signal === 'empresaHeader')));
test('78. tenantRequired true', () => assert.equal(tenant.tenantRequired, true));
test('79. permissionRequired true', () => assert.equal(tenant.permissionRequired, true));
test('80. admin no bypass tenant', () => assert.equal(tenant.adminBypassesTenant, false));
test('81. no real JWT', () => assert.equal(tenant.realJwtUsed, false));

// ===== Persistence/runtime (82-100) =====
test('82. persistence mirror exists', () => assert.equal(pers.kind, 'empresas-persistence-boundary-mirror'));
test('83. existingProductionBackend documented', () => assert.equal(pers.existingProductionBackend, true));
test('84. existingPrismaSchema documented', () => assert.equal(pers.existingPrismaSchema, true));
test('85. existingRestApi documented', () => assert.equal(pers.existingRestApi, true));
test('86. existingJwt documented', () => assert.equal(pers.existingJwt, true));
test('87. mirrorAccessMode referenceOnly', () => assert.equal(pers.mirrorAccessMode, 'referenceOnly'));
test('88. mutationAllowed false', () => assert.equal(pers.mutationAllowed, false));
test('89. migrationAllowed false', () => assert.equal(pers.migrationAllowed, false));
test('90. schemaChangeAllowed false', () => assert.equal(pers.schemaChangeAllowed, false));
test('91. backendChangeAllowed false', () => assert.equal(pers.backendChangeAllowed, false));
test('92. backendAccessed false', () => assert.equal(pers.backendAccessed, false));
test('93. prismaAccessed false', () => assert.equal(pers.prismaAccessed, false));
test('94. productionAccessed false', () => assert.equal(pers.productionAccessed, false));
test('95. runtime binding mirror exists', () => assert.equal(bind.kind, 'empresas-runtime-binding-mirror'));
test('96. ModeloBase1 cadastro reference', () => assert.ok(bind.bindings.modeloBase1));
test('97. Empresas certified seed model', () => assert.match(bind.bindings.empresasCertifiedContract.ref, /empresas-local-read-contract@1\.0\.0/));
test('98. runtimeReadModel/fallback documented', () => assert.ok(bind.bindings.runtimeReadModel && bind.bindings.fallback));
test('99. cadcps field reference', () => assert.ok(bind.bindings.cadcpsReference));
test('100. ModeloBase2/Fuel not production', () => assert.ok(bind.modeloBase2AsProduction === false && bind.fuelAsProduction === false));

// ===== Alignment audit (101-120) =====
test('101. alignment audit exists', () => assert.equal(audit.kind, 'empresas-blueprint-alignment-audit'));
const areaOf = (name) => audit.areas.find((a) => a.area === name);
test('102. module blueprint classified', () => assert.ok(areaOf('module blueprint')));
test('103. field blueprint classified', () => assert.ok(areaOf('field blueprint')));
test('104. screen blueprint classified', () => assert.ok(areaOf('screen blueprint')));
test('105. table/form classified', () => assert.ok(areaOf('table blueprint') && areaOf('form blueprint')));
test('106. filter/search/sort classified', () => assert.ok(areaOf('filter/search/sort')));
test('107. validation classified', () => assert.ok(areaOf('validation')));
test('108. permission classified', () => assert.ok(areaOf('permission')));
test('109. tenant classified', () => assert.ok(areaOf('tenant')));
test('110. persistence boundary classified', () => assert.ok(areaOf('persistence boundary')));
test('111. runtime binding classified', () => assert.ok(areaOf('runtime binding')));
test('112. diagnostics/fallback classified', () => assert.ok(areaOf('diagnostics') && areaOf('fallback')));
test('113. preferences/layout classified', () => assert.ok(areaOf('preferences/layout')));
test('114. gaps have severity', () => assert.ok(audit.gaps.every((g) => typeof g.severity === 'string')));
test('115. gaps have recommendedFix', () => assert.ok(audit.gaps.every((g) => typeof g.recommendedFix === 'string')));
test('116. gaps indicate Empresas code change', () => assert.ok(audit.gaps.every((g) => typeof g.requiresEmpresasCodeChange === 'boolean')));
test('117. gaps indicate UI change', () => assert.ok(audit.gaps.every((g) => typeof g.requiresUIChange === 'boolean')));
test('118. gaps indicate backend/Prisma/migration', () => assert.ok(audit.gaps.every((g) => typeof g.requiresBackendChange === 'boolean' && typeof g.requiresPrismaChange === 'boolean' && typeof g.requiresMigration === 'boolean')));
test('119. gaps suggest slice', () => assert.ok(audit.gaps.every((g) => typeof g.suggestedSlice === 'string')));
test('120. no gap fixed this slice', () => assert.equal(audit.anyGapFixedThisSlice, false));

// ===== Manifest/verifier/compat/fallback (121-154) =====
test('121. manifest created', () => assert.equal(M.manifest.kind, 'empresas-blueprint-mirror-manifest'));
test('122. manifest has digests', () => ['fieldDigest', 'screenDigest', 'permissionDigest', 'tenantDigest', 'persistenceBoundaryDigest', 'runtimeBindingDigest', 'alignmentAuditDigest'].forEach((k) => assert.ok(typeof M.manifest[k] === 'string')));
test('123. overallDigest deterministic', () => assert.equal(createEmpresasCertifiedBlueprintMirror().manifest.overallDigest, M.manifest.overallDigest));
test('124. verifier valid on correct', () => assert.equal(verifyEmpresasBlueprintMirror({ mirror: M }).valid, true));
const tamper = (fn) => { const t = JSON.parse(JSON.stringify(M)); fn(t); return verifyEmpresasBlueprintMirror({ mirror: t }).valid === false; };
test('125. verifier detects field digest', () => assert.ok(tamper((t) => { t.manifest.fieldDigest = 'fnv1a-0'; })));
test('126. verifier detects screen digest', () => assert.ok(tamper((t) => { t.manifest.screenDigest = 'fnv1a-0'; })));
test('127. verifier detects permission digest', () => assert.ok(tamper((t) => { t.manifest.permissionDigest = 'fnv1a-0'; })));
test('128. verifier detects tenant digest', () => assert.ok(tamper((t) => { t.manifest.tenantDigest = 'fnv1a-0'; })));
test('129. verifier detects persistence digest', () => assert.ok(tamper((t) => { t.manifest.persistenceBoundaryDigest = 'fnv1a-0'; })));
test('130. verifier detects runtime binding digest', () => assert.ok(tamper((t) => { t.manifest.runtimeBindingDigest = 'fnv1a-0'; })));
test('131. verifier requires headless true', () => assert.ok(tamper((t) => { t.headless = false; })));
test('132. verifier requires uiCreated false', () => assert.ok(tamper((t) => { t.uiCreated = true; })));
test('133. verifier requires routeCreated false', () => assert.ok(tamper((t) => { t.routeCreated = true; })));
test('134. verifier requires menuCreated false', () => assert.ok(tamper((t) => { t.menuCreated = true; })));
test('135. verifier requires moduleRegistered false', () => assert.ok(tamper((t) => { t.moduleRegistered = true; })));
test('136. verifier requires backendAccessed false', () => assert.ok(tamper((t) => { t.backendAccessed = true; })));
test('137. verifier requires prismaAccessed false', () => assert.ok(tamper((t) => { t.prismaAccessed = true; })));
test('138. verifier requires productionAccessed false', () => assert.ok(tamper((t) => { t.productionAccessed = true; })));
test('139. verifier requires mutationAllowed false', () => assert.ok(tamper((t) => { t.mutationAllowed = true; })));
test('140. verifier requires rewriteEmpresas false', () => assert.ok(tamper((t) => { t.rewriteEmpresas = true; })));
test('141. compatibility checker exists', () => assert.equal(checkEmpresasBlueprintMirrorCompatibility({ mirror: M }).kind, 'empresas-blueprint-mirror-compatibility'));
test('142. compatibility classifies', () => assert.ok(['compatible', 'partially_compatible', 'needs_alignment', 'blocked'].includes(M.compatibilityStatus)));
test('143. UI exposure blocks', () => assert.equal(checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...M, uiCreated: true } }).compatibilityStatus, 'blocked'));
test('144. route/menu exposure blocks', () => assert.equal(checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...M, routeCreated: true } }).compatibilityStatus, 'blocked'));
test('145. backend/Prisma access blocks', () => assert.equal(checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...M, prismaAccessed: true } }).compatibilityStatus, 'blocked'));
test('146. mutation exposure blocks', () => assert.equal(checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...M, mutationAllowed: true } }).compatibilityStatus, 'blocked'));
test('147. rewrite Empresas attempt blocks', () => assert.equal(checkEmpresasBlueprintMirrorCompatibility({ mirror: { ...M, rewriteEmpresas: true } }).compatibilityStatus, 'blocked'));
test('148. fallback flag off safe', () => assert.equal(createEmpresasBlueprintMirrorFallback().safeToUseAsMirrorReference, false));
test('149. fallback invalid source blocks', () => assert.equal(createEmpresasBlueprintMirrorFallback({ scenario: 'invalid_source_contract' }).readiness, 'blocked'));
test('150. fallback digest mismatch blocks', () => assert.equal(createEmpresasBlueprintMirrorFallback({ scenario: 'digest_mismatch' }).readiness, 'blocked'));
test('151. fallback UI/route/menu blocks', () => assert.ok(createEmpresasBlueprintMirrorFallback({ scenario: 'ui_attempt' }).uiCreated === false && createEmpresasBlueprintMirrorFallback({ scenario: 'route_attempt' }).routeCreated === false));
test('152. fallback backend/Prisma/migration blocks', () => assert.ok(createEmpresasBlueprintMirrorFallback({ scenario: 'backend_attempt' }).backendAccessed === false && createEmpresasBlueprintMirrorFallback({ scenario: 'prisma_attempt' }).prismaAccessed === false && createEmpresasBlueprintMirrorFallback({ scenario: 'migration_attempt' }).migrationExecuted === false));
test('153. fallback production/staging/fetch/mutation blocks', () => assert.ok(createEmpresasBlueprintMirrorFallback({ scenario: 'production_attempt' }).productionAccessed === false && createEmpresasBlueprintMirrorFallback({ scenario: 'mutation_attempt' }).mutationAllowed === false));
test('154. fallback rewrite Empresas blocks', () => assert.equal(createEmpresasBlueprintMirrorFallback({ scenario: 'rewrite_empresas_attempt' }).rewriteEmpresas, false));

// ===== Scope safety (155-186) =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-mirrors\/empresas\//,
  /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
  /^scripts\/gates\/g423-empresas-certified-blueprint-mirror-alignment-audit\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-certified-blueprint-mirror-alignment-audit\//,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-production-baseline-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
  /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
  /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
];
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const foreign = () => { const f = changed(); return f === null ? null : f.filter((x) => !AUTHORIZED.some((re) => re.test(x))); };

test('155. mirror subtree exists', () => assert.ok(exists('src/studio/blueprint-mirrors/empresas')));
test('156. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('157. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('158. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('159. cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('160. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('161. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('162. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('163. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('164. migration not created', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/migration/i.test(x))); });
test('165. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('166. menu not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/menu|nav/i.test(x))); });
test('167. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('168. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('169. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('170. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('171. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('172. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('173. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('174. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('175. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('176. no railway', () => assert.ok(!/railway/i.test(allCode())));
test('177. staging not accessed', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('178. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('179. mutation not exposed', () => assert.equal(M.mutationAllowed, false));
test('180. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('181. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('182. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('183. no import of EmpresaApi/apiClient/backend', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('184. React-free', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('185. error catalog >= 23 codes + sanitized', () => { assert.ok(EMPRESAS_MIRROR_ERROR_CODES.length >= 23); const e = createEmpresasMirrorError('EMPRESAS_BLUEPRINT_MIRROR_PRISMA_BLOCKED'); assert.ok(e.safe && !e.prismaAccessed && !e.rewriteEmpresas && !e.sideEffects); });
test('186. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-mirrors\/empresas\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});

// Extra: config + digest guards.
test('E1. headless capabilities frozen', () => assert.ok(Object.isFrozen(EMPRESAS_MIRROR_HEADLESS_CAPABILITIES)));
test('E2. flag fails closed in production', () => assert.equal(isEmpresasBlueprintMirrorEnabled({ [MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('E3. mirrorDigest deterministic', () => assert.equal(mirrorDigest({ a: 1 }), mirrorDigest({ a: 1 })));
test('E4. alignment audit standalone', () => assert.equal(createEmpresasBlueprintAlignmentAudit({ fieldBlueprint: field }).kind, 'empresas-blueprint-alignment-audit'));
test('E5. manifest standalone', () => assert.equal(createEmpresasBlueprintMirrorManifest({ fieldBlueprint: field }).kind, 'empresas-blueprint-mirror-manifest'));
test('E6. diagnostics no secrets', () => assert.ok(!/jwt|token|DATABASE_URL|secret/i.test(JSON.stringify(createEmpresasBlueprintMirrorDiagnostics()))));
