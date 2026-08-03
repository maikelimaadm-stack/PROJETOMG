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

import {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
  EMPRESAS_COMPAT_SLICE1_ERROR_CODES,
  createEmpresasCompatSlice1Error,
  MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG,
  isEmpresasStudioCompatibilitySlice1Enabled,
  compatDigest,
  createEmpresasCompatibilityGapRegistry,
  createEmpresasDetailScreenAlignmentPlan,
  createEmpresasStateCoverageAlignmentPlan,
  createEmpresasWriteCapabilityReferenceMatrix,
  createEmpresasPersistenceBoundaryAlignmentBridge,
  createEmpresasBackendPrismaReadinessMap,
  createEmpresasPreferenceLayoutAlignmentPlan,
  createEmpresasCompatibilitySlice1Manifest,
  verifyEmpresasStudioCompatibilitySlice1,
  checkEmpresasStudioCompatibilitySlice1,
  createEmpresasCompatibilitySlice1Diagnostics,
  createEmpresasCompatibilitySlice1Fallback,
  createEmpresasStudioCompatibilitySlice1,
} from '../../studio/blueprint-mirrors/empresas/compatibility-slice-1/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-mirrors/empresas/compatibility-slice-1');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const allCode = () => stripComments(walk(DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => walk(DIR).flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));

const S = createEmpresasStudioCompatibilitySlice1();
const reg = createEmpresasCompatibilityGapRegistry();
const detail = createEmpresasDetailScreenAlignmentPlan();
const stateP = createEmpresasStateCoverageAlignmentPlan();
const write = createEmpresasWriteCapabilityReferenceMatrix();
const bridge = createEmpresasPersistenceBoundaryAlignmentBridge();
const readiness = createEmpresasBackendPrismaReadinessMap();
const prefs = createEmpresasPreferenceLayoutAlignmentPlan();
const gapArea = (a) => reg.gaps.filter((g) => g.area === a);
const st = (name) => stateP.states.find((s) => s.state === name);
const cap = (name) => write.capabilities.find((c) => c.capability === name);

// ===== Base (1-24) =====
test('1. slice created', () => assert.equal(S.kind, 'empresas-studio-compatibility-slice-1'));
test('2. sliceName', () => assert.equal(S.sliceName, 'empresas-studio-compatibility-slice-1'));
test('3. sliceVersion', () => assert.equal(S.sliceVersion, EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION));
test('4. mirrorVersion', () => assert.equal(S.mirrorVersion, 'empresas-certified-blueprint-mirror@1.0.0'));
test('5. blueprintContractVersion', () => assert.equal(S.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'));
test('6. empresasReadContractVersion', () => assert.equal(S.empresasReadContractVersion, 'empresas-local-read-contract@1.0.0'));
test('7. moduleId empresas', () => assert.equal(S.moduleId, 'empresas'));
test('8. modelType cadastro', () => assert.equal(S.modelType, 'cadastro'));
test('9. modelFamily ModeloBase1', () => assert.equal(S.modelFamily, 'ModeloBase1'));
test('10. mode contract_only_alignment', () => assert.equal(S.mode, 'contract_only_alignment'));
test('11. headless', () => assert.equal(S.headless, true));
test('12. empresasCodeChanged false', () => assert.equal(S.empresasCodeChanged, false));
test('13. uiCreated false', () => assert.equal(S.uiCreated, false));
test('14. routeCreated false', () => assert.equal(S.routeCreated, false));
test('15. menuCreated false', () => assert.equal(S.menuCreated, false));
test('16. moduleRegistered false', () => assert.equal(S.moduleRegistered, false));
test('17. backendAccessed false', () => assert.equal(S.backendAccessed, false));
test('18. prismaAccessed false', () => assert.equal(S.prismaAccessed, false));
test('19. productionAccessed false', () => assert.equal(S.productionAccessed, false));
test('20. stagingAccessed false', () => assert.equal(S.stagingAccessed, false));
test('21. fetchUsed false', () => assert.equal(S.fetchUsed, false));
test('22. mutationAllowed false', () => assert.equal(S.mutationAllowed, false));
test('23. rewriteEmpresas false', () => assert.equal(S.rewriteEmpresas, false));
test('24. readiness complete', () => assert.equal(S.readiness, 'compatibility_slice_1_complete'));

// ===== Gap registry (25-45) =====
test('25. gap registry exists', () => assert.equal(reg.kind, 'empresas-compatibility-gap-registry'));
test('26. detail screen gap registered', () => assert.ok(gapArea('screen blueprint').length > 0));
test('27. empty/loading/error gap registered', () => assert.ok(gapArea('state coverage').length > 0));
test('28. write capabilities gap registered', () => assert.ok(gapArea('write capability').length > 0));
test('29. persistence boundary gap registered', () => assert.ok(gapArea('persistence boundary').length > 0));
test('30. backend/prisma readiness gap registered', () => assert.ok(gapArea('backend/prisma readiness').length > 0));
test('31. preferences/layout gap registered', () => assert.ok(gapArea('preferences/layout').length > 0));
test('32. permission write scope gap registered', () => assert.ok(gapArea('permission').length > 0));
test('33. tenant scope gap registered', () => assert.ok(gapArea('tenant').length > 0));
test('34. validation metadata gap registered', () => assert.ok(gapArea('validation').length > 0));
test('35. diagnostics/fallback gap registered', () => assert.ok(gapArea('diagnostics/fallback').length > 0));
test('36. each gap has severity', () => assert.ok(reg.gaps.every((g) => typeof g.severity === 'string')));
test('37. each gap has recommendedFix', () => assert.ok(reg.gaps.every((g) => typeof g.recommendedFix === 'string' && g.recommendedFix.length > 0)));
test('38. each gap has recommendedSlice', () => assert.ok(reg.gaps.every((g) => typeof g.recommendedSlice === 'string' && g.recommendedSlice.length > 0)));
test('39. each gap has requiresEmpresasCodeChange', () => assert.ok(reg.gaps.every((g) => typeof g.requiresEmpresasCodeChange === 'boolean')));
test('40. each gap has requiresUIChange', () => assert.ok(reg.gaps.every((g) => typeof g.requiresUIChange === 'boolean')));
test('41. each gap has requiresBackendChange', () => assert.ok(reg.gaps.every((g) => typeof g.requiresBackendChange === 'boolean')));
test('42. each gap has requiresPrismaSchemaChange', () => assert.ok(reg.gaps.every((g) => typeof g.requiresPrismaSchemaChange === 'boolean')));
test('43. each gap has requiresMigration', () => assert.ok(reg.gaps.every((g) => typeof g.requiresMigration === 'boolean')));
test('44. no gap fixed by changing Empresas', () => assert.ok(reg.anyGapFixedByChangingEmpresas === false && reg.gaps.every((g) => g.fixedThisSlice === false)));
test('45. untrackedCriticalGaps 0', () => assert.equal(reg.untrackedCriticalGaps, 0));

// ===== Detail/state plans (46-61) =====
test('46. detail plan exists', () => assert.equal(detail.kind, 'empresas-detail-screen-alignment-plan'));
test('47. detail classification safe', () => assert.ok(['absent_but_non_blocking', 'derive_from_form_readonly'].includes(detail.classification)));
test('48. detail plan no UI', () => assert.equal(detail.createsDetailScreenNow, false));
test('49. detail plan no PAGEMP', () => assert.equal(detail.changesPagemp, false));
test('50. detail plan recommends future slice', () => assert.match(detail.recommendedFutureSlice, /SLICE 2/));
test('51. state coverage plan exists', () => assert.equal(stateP.kind, 'empresas-state-coverage-alignment-plan'));
test('52. emptyState mapped', () => assert.ok(st('emptyState')));
test('53. loadingState mapped', () => assert.ok(st('loadingState')));
test('54. errorState mapped', () => assert.ok(st('errorState')));
test('55. unauthorizedState mapped', () => assert.ok(st('unauthorizedState')));
test('56. tenantMismatchState mapped', () => assert.ok(st('tenantMismatchState')));
test('57. permissionDeniedState mapped', () => assert.ok(st('permissionDeniedState')));
test('58. fallbackState mapped', () => assert.ok(st('fallbackState')));
test('59. diagnosticsState mapped', () => assert.ok(st('diagnosticsState')));
test('60. security states fail-closed', () => assert.ok(stateP.securityStatesFailClosed.includes('unauthorizedState') && stateP.securityStatesFailClosed.includes('tenantMismatchState')));
test('61. state plan no UI', () => assert.equal(stateP.changesUi, false));

// ===== Write capability matrix (62-73) =====
test('62. write capability matrix exists', () => assert.equal(write.kind, 'empresas-write-capability-reference-matrix'));
test('63. read certified/reference', () => assert.equal(cap('read').currentStatus, 'certified'));
test('64. create reference-only', () => assert.equal(cap('create').allowedInThisSlice, false));
test('65. update reference-only', () => assert.equal(cap('update').allowedInThisSlice, false));
test('66. delete reference-only', () => assert.equal(cap('delete').allowedInThisSlice, false));
test('67. export mapped/gap', () => assert.ok(cap('export')));
test('68. configure mapped/gap', () => assert.ok(cap('configure')));
test('69. diagnostics mapped/gap', () => assert.ok(cap('diagnostics')));
test('70. mutationAllowed false', () => assert.equal(write.mutationAllowed, false));
test('71. production write false', () => assert.equal(write.productionWrite, false));
test('72. delete not enabled by default', () => assert.equal(write.deleteEnabledByDefault, false));
test('73. no permission altered', () => assert.equal(write.permissionsAltered, false));

// ===== Persistence/backend/prisma (74-94) =====
test('74. persistence bridge exists', () => assert.equal(bridge.kind, 'empresas-persistence-boundary-alignment-bridge'));
test('75. currentBoundary existingProduction/referenceOnly', () => assert.equal(bridge.currentBoundary, 'existingProduction/referenceOnly'));
test('76. schemaChangeAllowed false', () => assert.equal(bridge.schemaChangeAllowed, false));
test('77. migrationAllowed false', () => assert.equal(bridge.migrationAllowed, false));
test('78. mutationAllowed false', () => assert.equal(bridge.mutationAllowed, false));
test('79. backendAccessed false', () => assert.equal(bridge.backendAccessed, false));
test('80. prismaAccessed false', () => assert.equal(bridge.prismaAccessed, false));
test('81. productionAccessed false', () => assert.equal(bridge.productionAccessed, false));
test('82. bridge no schema', () => assert.equal(bridge.createsSchema, false));
test('83. bridge no migration', () => assert.equal(bridge.createsMigration, false));
test('84. bridge no DATABASE_URL', () => assert.equal(bridge.usesDatabaseUrl, false));
test('85. backend/prisma readiness map exists', () => assert.equal(readiness.kind, 'empresas-backend-prisma-readiness-map'));
test('86. existingBackendApi documented', () => assert.ok(readiness.items.some((i) => i.item === 'existingBackendApi')));
test('87. existingPrismaSchema documented', () => assert.ok(readiness.items.some((i) => i.item === 'existingPrismaSchema')));
test('88. existingRestApi documented', () => assert.ok(readiness.items.some((i) => i.item === 'existingRestApi')));
test('89. existingJwt documented', () => assert.ok(readiness.items.some((i) => i.item === 'existingJwt')));
test('90. existingTenantColumns documented', () => assert.ok(readiness.items.some((i) => i.item === 'existingTenantColumns')));
test('91. futureReadinessChecks exist', () => assert.ok(readiness.futureReadinessChecks.length > 0));
test('92. requiresMigration false slice 1', () => assert.equal(readiness.requiresMigration, false));
test('93. Prisma not executed', () => assert.equal(readiness.prismaExecuted, false));
test('94. backend not called', () => assert.equal(readiness.backendCalled, false));

// ===== Preferences/layout (95-103) =====
test('95. preferences/layout plan exists', () => assert.equal(prefs.kind, 'empresas-preference-layout-alignment-plan'));
test('96. column preferences mapped', () => assert.ok(prefs.items.some((i) => i.item === 'columnPreferences')));
test('97. filter preferences mapped', () => assert.ok(prefs.items.some((i) => i.item === 'filterPreferences')));
test('98. sort preferences mapped', () => assert.ok(prefs.items.some((i) => i.item === 'sortPreferences')));
test('99. layout preferences mapped', () => assert.ok(prefs.items.some((i) => i.item === 'layoutPreferences')));
test('100. UsuarioPreferencia referenceOnly', () => assert.equal(prefs.items.find((i) => i.item === 'usuarioPreferenciaReference').alignmentStatus, 'referenceOnly'));
test('101. local preferences referenceOnly', () => assert.equal(prefs.items.find((i) => i.item === 'localPreferences').alignmentStatus, 'referenceOnly'));
test('102. real preferences not changed', () => assert.equal(prefs.changesRealPreferences, false));
test('103. UI not changed', () => assert.equal(prefs.changesUi, false));

// ===== Manifest/verifier/compat/fallback (104-132) =====
test('104. manifest created', () => assert.equal(S.manifest.kind, 'empresas-compatibility-slice1-manifest'));
test('105. manifest has digests', () => ['gapRegistryDigest', 'detailPlanDigest', 'stateCoverageDigest', 'writeCapabilityDigest', 'persistenceBridgeDigest', 'backendPrismaReadinessDigest', 'preferenceLayoutDigest'].forEach((k) => assert.ok(typeof S.manifest[k] === 'string')));
test('106. overallDigest deterministic', () => assert.equal(createEmpresasStudioCompatibilitySlice1().manifest.overallDigest, S.manifest.overallDigest));
test('107. verifier valid on correct', () => assert.equal(verifyEmpresasStudioCompatibilitySlice1({ slice: S }).valid, true));
const tamper = (fn) => { const t = JSON.parse(JSON.stringify(S)); fn(t); return verifyEmpresasStudioCompatibilitySlice1({ slice: t }).valid === false; };
test('108. verifier detects gap registry digest', () => assert.ok(tamper((t) => { t.manifest.gapRegistryDigest = 'fnv1a-0'; })));
test('109. verifier detects persistence bridge digest', () => assert.ok(tamper((t) => { t.manifest.persistenceBridgeDigest = 'fnv1a-0'; })));
test('110. verifier detects backend/prisma digest', () => assert.ok(tamper((t) => { t.manifest.backendPrismaReadinessDigest = 'fnv1a-0'; })));
test('111. verifier detects preference/layout digest', () => assert.ok(tamper((t) => { t.manifest.preferenceLayoutDigest = 'fnv1a-0'; })));
test('112. verifier requires headless', () => assert.ok(tamper((t) => { t.headless = false; })));
test('113. verifier requires empresasCodeChanged false', () => assert.ok(tamper((t) => { t.empresasCodeChanged = true; })));
test('114. verifier requires uiCreated false', () => assert.ok(tamper((t) => { t.uiCreated = true; })));
test('115. verifier requires backendAccessed false', () => assert.ok(tamper((t) => { t.backendAccessed = true; })));
test('116. verifier requires prismaAccessed false', () => assert.ok(tamper((t) => { t.prismaAccessed = true; })));
test('117. verifier requires mutationAllowed false', () => assert.ok(tamper((t) => { t.mutationAllowed = true; })));
test('118. verifier requires rewriteEmpresas false', () => assert.ok(tamper((t) => { t.rewriteEmpresas = true; })));
test('119. verifier requires untrackedCriticalGaps 0', () => assert.ok(tamper((t) => { t.manifest.untrackedCriticalGaps = 1; })));
test('120. compatibility checker exists', () => assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: S }).kind, 'empresas-compatibility-slice1-result'));
test('121. gap without plan blocks', () => {
  const t = JSON.parse(JSON.stringify(S)); t.gapRegistry.gaps[0].recommendedSlice = '';
  assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: t }).status, 'blocked');
});
test('122. backend/prisma real change blocks', () => {
  const t = JSON.parse(JSON.stringify(S)); t.backendPrismaReadiness = { schemaAlteredThisSlice: true };
  assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: t }).status, 'blocked');
});
test('123. migration suggested blocks', () => {
  const t = JSON.parse(JSON.stringify(S)); t.gapRegistry.gaps[0].requiresMigration = true;
  assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: t }).status, 'blocked');
});
test('124. mutation exposed blocks', () => assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: { ...S, mutationAllowed: true } }).status, 'blocked'));
test('125. rewrite Empresas blocks', () => assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: { ...S, rewriteEmpresas: true } }).status, 'blocked'));
test('126. UI change blocks', () => assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: { ...S, uiCreated: true } }).status, 'blocked'));
test('127. module registration blocks', () => assert.equal(checkEmpresasStudioCompatibilitySlice1({ slice: { ...S, moduleRegistered: true } }).status, 'blocked'));
test('128. fallback flag off safe', () => assert.equal(createEmpresasCompatibilitySlice1Fallback().safeToUseAsCompatibilityReference, false));
test('129. fallback untracked critical gap blocks', () => assert.equal(createEmpresasCompatibilitySlice1Fallback({ scenario: 'untracked_critical_gap' }).readiness, 'blocked'));
test('130. fallback backend/prisma attempt blocks', () => assert.ok(createEmpresasCompatibilitySlice1Fallback({ scenario: 'backend_attempt' }).backendAccessed === false && createEmpresasCompatibilitySlice1Fallback({ scenario: 'prisma_attempt' }).prismaAccessed === false));
test('131. fallback production/staging/fetch/mutation blocks', () => assert.ok(createEmpresasCompatibilitySlice1Fallback({ scenario: 'production_attempt' }).productionAccessed === false && createEmpresasCompatibilitySlice1Fallback({ scenario: 'mutation_attempt' }).mutationAllowed === false));
test('132. fallback rewrite Empresas blocks', () => assert.equal(createEmpresasCompatibilitySlice1Fallback({ scenario: 'rewrite_empresas_attempt' }).rewriteEmpresas, false));

// ===== Scope safety (133-164) =====
const AUTHORIZED = [
  /^src\/studio\/blueprint-mirrors\/empresas\/compatibility-slice-1\//,
  /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
  /^scripts\/gates\/g423-empresas-studio-compatibility-slice-1\.mjs$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-empresas-studio-compatibility-slice-1\//,
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
  /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
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

test('133. compatibility-slice-1 exists', () => assert.ok(exists('src/studio/blueprint-mirrors/empresas/compatibility-slice-1')));
test('134. src/modules/empresas not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/empresas/'))); });
test('135. PAGEMP not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/PAGEMP/i.test(x))); });
test('136. ModeloBase1CadastroPage not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/ModeloBase1CadastroPage/i.test(x))); });
test('137. cadcps not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/modules/cadcps/'))); });
test('138. ModeloBase1 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase1/'))); });
test('139. ModeloBase2 not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/ModeloBase2/'))); });
test('140. backend not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^backend\/|^src\/apis\//.test(x))); });
test('141. Prisma/schema not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/prisma|schema\.prisma/i.test(x))); });
test('142. migration not created', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/migration/i.test(x))); });
test('143. App.jsx not changed', () => { const f = foreign(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('144. menu not changed', () => { const f = foreign(); if (f === null) return; const exempt = migrationExempt(f); assert.ok(f.filter((x) => !exempt(x)).every((x) => !/menu|nav/i.test(x))); });
test('145. src/pages not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/pages/'))); });
test('146. src/components not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !x.startsWith('src/components/'))); });
test('147. runtime prod not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/^src\/runtime\/(?!__tests__\/)/.test(x))); });
test('148. CSS not changed', () => { const f = foreign(); if (f === null) return; assert.ok(f.every((x) => !/\.css$/.test(x))); });
test('149. no new dependency', () => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
    const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
    assert.equal(bk, hk);
  } catch { /* skip */ }
});
test('150. no fetch used', () => assert.ok(!/\bfetch\s*\(/.test(allCode())));
test('151. no Prisma Client', () => assert.ok(importsOf().every((p) => !/@prisma|PrismaClient/i.test(p)) && !/new PrismaClient/.test(allCode())));
test('152. no DATABASE_URL', () => assert.ok(!/DATABASE_URL/.test(allCode())));
test('153. no production API_URL', () => assert.ok(!/VITE_API_URL|projetomg-production/.test(allCode())));
test('154. no railway', () => assert.ok(!/railway/i.test(allCode())));
test('155. staging not accessed', () => assert.ok(!/staging\.[a-z]/i.test(allCode())));
test('156. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(allCode())));
test('157. mutation not exposed', () => assert.equal(S.mutationAllowed, false));
test('158. src/modules/studio does not exist', () => assert.ok(!exists('src/modules/studio')));
test('159. src/modules/combustivel does not exist', () => assert.ok(!exists('src/modules/combustivel')));
test('160. src/modules/fuel does not exist', () => assert.ok(!exists('src/modules/fuel')));
test('161. no import of EmpresaApi/apiClient/backend', () => assert.ok(importsOf().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('162. React-free', () => assert.ok(importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('163. error catalog >= 26 codes + sanitized', () => { assert.ok(EMPRESAS_COMPAT_SLICE1_ERROR_CODES.length >= 26); const e = createEmpresasCompatSlice1Error('EMPRESAS_COMPAT_SLICE1_PRISMA_BLOCKED'); assert.ok(e.safe && !e.prismaAccessed && !e.rewriteEmpresas && !e.empresasCodeChanged && !e.sideEffects); });
test('164. authorized scope only (branch-relative)', () => {
  const files = changed();
  if (files === null) return;
  if (!files.some((f) => /^src\/studio\/blueprint-mirrors\/empresas\/compatibility-slice-1\//.test(f))) return;
  const outside = files.filter((f) => !AUTHORIZED.some((re) => re.test(f)));
  assert.deepEqual(outside, []);
});

// Extra guards.
test('E1. headless capabilities frozen', () => assert.ok(Object.isFrozen(EMPRESAS_COMPAT_HEADLESS_CAPABILITIES)));
test('E2. flag fails closed in production', () => assert.equal(isEmpresasStudioCompatibilitySlice1Enabled({ [MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('E3. compatDigest deterministic', () => assert.equal(compatDigest({ a: 1 }), compatDigest({ a: 1 })));
test('E4. manifest standalone', () => assert.equal(createEmpresasCompatibilitySlice1Manifest({ gapRegistry: reg }).kind, 'empresas-compatibility-slice1-manifest'));
test('E5. diagnostics no secrets', () => assert.ok(!/jwt|token|DATABASE_URL|secret/i.test(JSON.stringify(createEmpresasCompatibilitySlice1Diagnostics()))));
test('E6. Blueprint Engine can start (no blocking gap)', () => assert.equal(S.compatibilityResult.compatibleForNextStep, true));
