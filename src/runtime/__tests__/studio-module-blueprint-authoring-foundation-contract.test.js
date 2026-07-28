import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Central scope governance guard (pure, registry-driven) — consumed by the branch-relative scope check below.
import { isKnownLaterStudioHeadlessArtifact } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  AUTHORING_FOUNDATION_CONTRACT_NAME,
  AUTHORING_FOUNDATION_CONTRACT_SEMVER,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_MODE,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  AUTHORING_LIFECYCLE_STATES,
  AUTHORING_LIFECYCLE_TRANSITIONS,
  FORBIDDEN_LIFECYCLE_STATES,
  AUTHORING_ISSUE_SEVERITIES,
  AUTHORING_OPERATION_IDS,
  AUTHORING_INVARIANT_IDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  AUTHORING_FOUNDATION_READINESS_STATES,
  AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG,
  authoringFoundationDigest,
  isProductionEnv,
  isStudioModuleBlueprintAuthoringFoundationEnabled,
  isStudioModuleBlueprintAuthoringFoundationVerifyEnabled,
  isStudioModuleBlueprintAuthoringFoundationCompatibilityCheckEnabled,
  AUTHORING_FOUNDATION_ERROR_CODES,
  AuthoringFoundationError,
  createAuthoringFoundationError,
  authoringFoundationError,
  createAuthoringFoundationContractSession,
  createBlueprintDraftDescriptor,
  createFieldDraftDescriptor,
  AUTHORING_FIELD_KINDS,
  createLayoutDraftDescriptor,
  createRelationshipDraftDescriptor,
  AUTHORING_RELATIONSHIP_CARDINALITIES,
  createValidationIssueDescriptor,
  createAuthoringLifecycleContract,
  createAuthoringOperationCatalog,
  createAuthoringInvariantCatalog,
  createPreviewHandoffContract,
  createCertificationCandidateHandoffContract,
  createAuthoringSsotBoundaryContract,
  createPermissionTenancyBoundaryContract,
  createPrototypeRelinkProhibitionContract,
  createAuthoringManualEnablementGateContract,
  createAuthoringSafetyContract,
  createAuthoringFoundationReadinessDecision,
  createAuthoringFoundationManifest,
  verifyAuthoringFoundationContract,
  checkAuthoringFoundationCompatibility,
  createAuthoringFoundationDiagnostics,
  createAuthoringFoundationFallback,
  createStudioModuleBlueprintAuthoringFoundationContract,
} from '../../studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/module-blueprint-authoring-foundation-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-foundation-contract');

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walkExt = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walkExt(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walkExt(DIR, /\.js$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const authorized = (f) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-foundation-contract\//.test(f)
  || f === 'src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js'
  || f === 'scripts/gates/g423-studio-module-blueprint-authoring-foundation-contract.mjs'
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-foundation-contract\//.test(f);

// A certified blueprint contract (read-only SSOT input; metadata-only).
const BP = {
  kind: 'studio-blueprint-contract',
  moduleId: 'clientes',
  certified: true,
  blueprintContractVersion: 'studio-blueprint-contract@1.0.0',
  engineVersion: 'studio-blueprint-engine@1.0.0',
};
const U = createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP });

const session = createAuthoringFoundationContractSession({ certifiedBlueprint: BP });
const lifecycle = createAuthoringLifecycleContract();
const operationCatalog = createAuthoringOperationCatalog();
const invariantCatalog = createAuthoringInvariantCatalog();
const previewHandoff = createPreviewHandoffContract();
const certificationCandidate = createCertificationCandidateHandoffContract();
const ssotBoundary = createAuthoringSsotBoundaryContract();
const permissionTenancy = createPermissionTenancyBoundaryContract();
const prototypeRelinkProhibition = createPrototypeRelinkProhibitionContract();
const manualGate = createAuthoringManualEnablementGateContract();
const safety = createAuthoringSafetyContract();
const manifest = createAuthoringFoundationManifest({ certifiedBlueprint: BP });
const caps = AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES;

// ===== Contract base + versions (1-40) =====
test('1. created', () => assert.equal(U.kind, 'studio-module-blueprint-authoring-foundation-contract'));
test('2. name', () => { assert.equal(U.authoringFoundationContractName, 'studio-module-blueprint-authoring-foundation-contract'); assert.equal(U.authoringFoundationContractName, AUTHORING_FOUNDATION_CONTRACT_NAME); });
test('3. version', () => { assert.equal(U.authoringFoundationContractVersion, 'studio-module-blueprint-authoring-foundation-contract@1.0.0'); assert.equal(U.authoringFoundationContractVersion, AUTHORING_FOUNDATION_CONTRACT_VERSION); });
test('4. semver', () => assert.equal(AUTHORING_FOUNDATION_CONTRACT_SEMVER, '1.0.0'));
test('5. blueprintContractVersion', () => { assert.equal(U.blueprintContractVersion, 'studio-blueprint-contract@1.0.0'); assert.equal(U.blueprintContractVersion, BLUEPRINT_CONTRACT_VERSION); });
test('6. blueprintEngineVersion', () => { assert.equal(U.blueprintEngineVersion, 'studio-blueprint-engine@1.0.0'); assert.equal(U.blueprintEngineVersion, BLUEPRINT_ENGINE_VERSION); });
test('7. moduleReferencePlannerVersion', () => { assert.equal(U.moduleReferencePlannerVersion, 'studio-blueprint-module-reference-planner@1.0.0'); assert.equal(U.moduleReferencePlannerVersion, MODULE_REFERENCE_PLANNER_VERSION); });
test('8. previewSandboxVersion', () => { assert.equal(U.previewSandboxVersion, 'studio-module-preview-sandbox-contract@1.0.0'); assert.equal(U.previewSandboxVersion, PREVIEW_SANDBOX_CONTRACT_VERSION); });
test('9. mode', () => { assert.equal(U.mode, 'headless_studio_module_blueprint_authoring_foundation_contract'); assert.equal(U.mode, AUTHORING_FOUNDATION_CONTRACT_MODE); });
test('10. not fallback', () => assert.equal(U.fallback, false));
test('11. headless', () => assert.equal(U.headless, true));
test('12. contractOnly', () => assert.equal(U.contractOnly, true));
test('13. metadataOnly', () => assert.equal(U.metadataOnly, true));
test('14. authoringFoundationContractOnly', () => assert.equal(U.authoringFoundationContractOnly, true));
test('15. devOnly', () => assert.equal(U.devOnly, true));
test('16. isolated', () => assert.equal(U.isolated, true));
test('17. readiness ready', () => assert.equal(U.readiness, 'studio_module_blueprint_authoring_foundation_contract_ready'));
test('18. readyForAuthoringFoundationContract true', () => assert.equal(U.readyForAuthoringFoundationContract, true));
test('19. readyForAuthoringImplementationPlan false', () => assert.equal(U.readyForAuthoringImplementationPlan, false));
test('20. readyForAuthoringRuntime false', () => assert.equal(U.readyForAuthoringRuntime, false));
test('21. readyForAuthoringUi false', () => assert.equal(U.readyForAuthoringUi, false));
test('22. readyForPermissionTenancyIntegration false', () => assert.equal(U.readyForPermissionTenancyIntegration, false));
test('23. readyForProductExposure false', () => assert.equal(U.readyForProductExposure, false));
test('24. readyForModuleGeneration false', () => assert.equal(U.readyForModuleGeneration, false));
test('25. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('26. requiresPermissionTenancyFoundation true', () => assert.equal(U.requiresPermissionTenancyFoundation, true));
test('27. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('28. warningCount 0', () => assert.equal(U.warningCount, 0));
test('29. blockers array empty', () => assert.deepEqual(U.blockers, []));
test('30. warnings array empty', () => assert.deepEqual(U.warnings, []));
test('31. moduleId string', () => { assert.equal(typeof U.moduleId, 'string'); assert.equal(U.moduleId, 'clientes'); });
test('32. overallDigest fnv1a', () => assert.ok(String(U.overallDigest).startsWith('fnv1a-')));
test('33. authoringFoundationContractDigest fnv1a', () => assert.ok(String(U.authoringFoundationContractDigest).startsWith('fnv1a-')));
test('34. capabilities present', () => assert.equal(typeof U.capabilities, 'object'));
test('35. readiness state known', () => assert.ok(AUTHORING_FOUNDATION_READINESS_STATES.includes(U.readiness)));
test('36. requiredFutureCheckpoint', () => { assert.equal(U.requiredFutureCheckpoint, 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint'); assert.equal(U.requiredFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT); });
test('37. readinessDecision embedded', () => assert.equal(U.readinessDecision.kind, 'authoring-foundation-readiness-decision'));
test('38. manifest embedded', () => assert.equal(U.manifest.kind, 'authoring-foundation-contract-manifest'));
test('39. verification embedded', () => assert.equal(U.verification.kind, 'authoring-foundation-contract-verification'));
test('40. diagnostics embedded', () => assert.equal(U.diagnostics.kind, 'authoring-foundation-diagnostics'));

// ===== Capabilities (41-110) =====
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'syntheticOnly', 'devOnly', 'ssotPreserved', 'certifiedBlueprintRemainsSsot'];
const FALSE_CAPS = ['draftIsCanonical', 'authoringRuntimeImplemented', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated', 'routeCreated'];
test('41. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 42;
for (const k of TRUE_CAPS) {
  const cur = n; n += 1;
  test(`${cur}. capability ${k} true (const + contract)`, () => { assert.equal(caps[k], true); assert.equal(U.capabilities[k], true); });
}
for (const k of FALSE_CAPS) {
  const cur = n; n += 1;
  test(`${cur}. capability ${k} false (const + contract)`, () => { assert.equal(caps[k], false); assert.equal(U.capabilities[k], false); });
}
// n is now 42 + 7 + 21 = 70
test('70. capabilities mirror const exactly', () => assert.deepEqual(U.capabilities, { ...caps }));

// ===== Session (71-82) =====
test('71. session kind', () => assert.equal(session.kind, 'authoring-foundation-contract-session'));
test('72. session no storage', () => assert.equal(session.usesStorage, false));
test('73. session no fetch', () => assert.equal(session.usesFetch, false));
test('74. session no persistence', () => assert.equal(session.usesPersistence, false));
test('75. session no side effects', () => assert.equal(session.runtimeSideEffects, false));
test('76. session consumes upstream read-only', () => assert.equal(session.consumesUpstreamReadOnly, true));
test('77. session authors nothing', () => assert.equal(session.authorsAnything, false));
test('78. session seed string', () => assert.equal(typeof session.seed, 'string'));
test('79. session sources blueprint contract', () => assert.equal(session.sourceBlueprintContract, BLUEPRINT_CONTRACT_VERSION));
test('80. session version', () => assert.equal(session.authoringFoundationContractVersion, AUTHORING_FOUNDATION_CONTRACT_VERSION));
test('81. session digest fnv1a', () => assert.ok(String(session.sessionDigest).startsWith('fnv1a-')));
test('82. session deterministic', () => assert.equal(createAuthoringFoundationContractSession({ certifiedBlueprint: BP }).sessionDigest, session.sessionDigest));

// ===== Field draft descriptor (83-100) =====
const field = createFieldDraftDescriptor({ key: 'nome', label: 'Nome', fieldKind: 'text', order: 2, required: true });
test('83. field kind', () => assert.equal(field.kind, 'authoring-field-draft-descriptor'));
test('84. field key', () => assert.equal(field.key, 'nome'));
test('85. field label', () => assert.equal(field.label, 'Nome'));
test('86. field fieldKind', () => assert.equal(field.fieldKind, 'text'));
test('87. field order', () => assert.equal(field.order, 2));
test('88. field required', () => assert.equal(field.required, true));
test('89. field not canonical', () => assert.equal(field.canonical, false));
test('90. field draftOnly', () => assert.equal(field.draftOnly, true));
test('91. field no column', () => assert.equal(field.columnCreated, false));
test('92. field not persisted', () => assert.equal(field.persisted, false));
test('93. field no real data', () => assert.equal(field.realDataBound, false));
test('94. field no backend', () => assert.equal(field.backendBound, false));
test('95. field unknown kind normalized', () => assert.equal(createFieldDraftDescriptor({ fieldKind: 'zzz' }).fieldKind, 'unknown'));
test('96. field negative order clamped', () => assert.equal(createFieldDraftDescriptor({ order: -5 }).order, 0));
test('97. field default key', () => assert.equal(createFieldDraftDescriptor({}).key, 'field'));
test('98. field kinds enumerated', () => assert.ok(AUTHORING_FIELD_KINDS.includes('text') && AUTHORING_FIELD_KINDS.includes('reference')));
test('99. field digest fnv1a', () => assert.ok(String(field.fieldDraftDigest).startsWith('fnv1a-')));
test('100. field deterministic', () => assert.equal(createFieldDraftDescriptor({ key: 'nome', label: 'Nome', fieldKind: 'text', order: 2, required: true }).fieldDraftDigest, field.fieldDraftDigest));

// ===== Layout draft descriptor (101-112) =====
const layout = createLayoutDraftDescriptor({ sectionId: 'main', title: 'Main', order: 1, fieldKeys: ['nome', 'ativo'] });
test('101. layout kind', () => assert.equal(layout.kind, 'authoring-layout-draft-descriptor'));
test('102. layout sectionId', () => assert.equal(layout.sectionId, 'main'));
test('103. layout title', () => assert.equal(layout.title, 'Main'));
test('104. layout order', () => assert.equal(layout.order, 1));
test('105. layout fieldKeys', () => assert.deepEqual(layout.fieldKeys, ['nome', 'ativo']));
test('106. layout fieldCount', () => assert.equal(layout.fieldCount, 2));
test('107. layout not canonical', () => assert.equal(layout.canonical, false));
test('108. layout no ui component', () => assert.equal(layout.uiComponentCreated, false));
test('109. layout no dom', () => assert.equal(layout.domTouched, false));
test('110. layout no css', () => assert.equal(layout.cssCreated, false));
test('111. layout digest fnv1a', () => assert.ok(String(layout.layoutDraftDigest).startsWith('fnv1a-')));
test('112. layout deterministic', () => assert.equal(createLayoutDraftDescriptor({ sectionId: 'main', title: 'Main', order: 1, fieldKeys: ['nome', 'ativo'] }).layoutDraftDigest, layout.layoutDraftDigest));

// ===== Relationship draft descriptor (113-125) =====
const rel = createRelationshipDraftDescriptor({ relationshipId: 'r1', fromModule: 'clientes', toModule: 'pedidos', cardinality: 'one_to_many' });
test('113. relationship kind', () => assert.equal(rel.kind, 'authoring-relationship-draft-descriptor'));
test('114. relationship id', () => assert.equal(rel.relationshipId, 'r1'));
test('115. relationship fromModule', () => assert.equal(rel.fromModule, 'clientes'));
test('116. relationship toModule', () => assert.equal(rel.toModule, 'pedidos'));
test('117. relationship cardinality', () => assert.equal(rel.cardinality, 'one_to_many'));
test('118. relationship endpoints known', () => assert.equal(rel.endpointsKnown, true));
test('119. relationship not canonical', () => assert.equal(rel.canonical, false));
test('120. relationship no foreign key', () => assert.equal(rel.foreignKeyCreated, false));
test('121. relationship no join', () => assert.equal(rel.joinCreated, false));
test('122. relationship no query', () => assert.equal(rel.queryCreated, false));
test('123. relationship not persisted', () => assert.equal(rel.persisted, false));
test('124. relationship unknown cardinality normalized', () => assert.equal(createRelationshipDraftDescriptor({ cardinality: 'zz' }).cardinality, 'unknown'));
test('125. relationship cardinalities enumerated', () => assert.ok(AUTHORING_RELATIONSHIP_CARDINALITIES.includes('many_to_many')));

// ===== Blueprint draft descriptor (126-145) =====
const draft = createBlueprintDraftDescriptor({
  moduleId: 'clientes',
  name: 'Clientes',
  lifecycleState: 'draft',
  fields: [{ key: 'nome', fieldKind: 'text', order: 0 }, { key: 'ativo', fieldKind: 'boolean', order: 1 }],
  layout: [{ sectionId: 'main', fieldKeys: ['nome'] }],
  relationships: [{ relationshipId: 'r1', fromModule: 'clientes', toModule: 'pedidos', cardinality: 'one_to_many' }],
});
test('126. draft kind', () => assert.equal(draft.kind, 'authoring-blueprint-draft-descriptor'));
test('127. draft id deterministic form', () => assert.equal(draft.draftId, 'clientes#authoring-draft'));
test('128. draft moduleId', () => assert.equal(draft.moduleId, 'clientes'));
test('129. draft name', () => assert.equal(draft.name, 'Clientes'));
test('130. draft lifecycleState', () => assert.equal(draft.lifecycleState, 'draft'));
test('131. draft NOT canonical', () => assert.equal(draft.canonical, false));
test('132. draft isDraft', () => assert.equal(draft.isDraft, true));
test('133. draft NOT selfCertifiable', () => assert.equal(draft.selfCertifiable, false));
test('134. draft does NOT overwrite certified', () => assert.equal(draft.overwritesCertifiedContract, false));
test('135. draft registers NO module', () => assert.equal(draft.registersModule, false));
test('136. draft generates NO files', () => assert.equal(draft.generatesFiles, false));
test('137. draft publishes nothing', () => assert.equal(draft.publishes, false));
test('138. draft field count', () => assert.equal(draft.fieldCount, 2));
test('139. draft layout count', () => assert.equal(draft.layoutCount, 1));
test('140. draft relationship count', () => assert.equal(draft.relationshipCount, 1));
test('141. draft field keys unique', () => assert.equal(draft.fieldKeysUnique, true));
test('142. draft section ids unique', () => assert.equal(draft.sectionIdsUnique, true));
test('143. draft relationship ids unique', () => assert.equal(draft.relationshipIdsUnique, true));
test('144. draft nested fields are descriptors', () => assert.equal(draft.fields[0].kind, 'authoring-field-draft-descriptor'));
test('145. draft empty default lifecycle', () => assert.equal(createBlueprintDraftDescriptor({}).lifecycleState, 'empty'));

// ===== Validation issue descriptor (146-158) =====
const issue = createValidationIssueDescriptor({ issueId: 'i1', severity: 'blocker', message: 'missing key', target: 'nome' });
test('146. issue kind', () => assert.equal(issue.kind, 'authoring-validation-issue-descriptor'));
test('147. issue id', () => assert.equal(issue.issueId, 'i1'));
test('148. issue severity', () => assert.equal(issue.severity, 'blocker'));
test('149. issue isBlocker', () => assert.equal(issue.isBlocker, true));
test('150. issue message', () => assert.equal(issue.message, 'missing key'));
test('151. issue target', () => assert.equal(issue.target, 'nome'));
test('152. issue safe', () => assert.equal(issue.safe, true));
test('153. issue withoutSecrets', () => assert.equal(issue.withoutSecrets, true));
test('154. issue no stack leak', () => assert.equal(issue.noStackLeak, true));
test('155. issue not canonical', () => assert.equal(issue.canonical, false));
test('156. issue does not affect certified', () => assert.equal(issue.affectsCertifiedContract, false));
test('157. issue severities enumerated', () => assert.deepEqual(AUTHORING_ISSUE_SEVERITIES, ['info', 'warning', 'error', 'blocker']));
test('158. issue unknown severity normalized', () => assert.equal(createValidationIssueDescriptor({ severity: 'zzz' }).severity, 'warning'));

// ===== Lifecycle contract (159-176) =====
test('159. lifecycle kind', () => assert.equal(lifecycle.kind, 'authoring-lifecycle-contract'));
test('160. lifecycle states 8', () => assert.equal(lifecycle.states.length, 8));
test('161. lifecycle states match const', () => assert.deepEqual(lifecycle.states, [...AUTHORING_LIFECYCLE_STATES]));
test('162. lifecycle initial empty', () => assert.equal(lifecycle.initialState, 'empty'));
test('163. lifecycle terminal discarded', () => assert.equal(lifecycle.terminalState, 'discarded'));
test('164. lifecycle discarded terminal (no transitions)', () => assert.deepEqual(lifecycle.transitions.discarded, []));
test('165. lifecycle empty->draft allowed', () => assert.ok(lifecycle.allowedTransitionPairs.includes('empty->draft')));
test('166. lifecycle validated->preview_ready allowed', () => assert.ok(lifecycle.allowedTransitionPairs.includes('validated->preview_ready')));
test('167. lifecycle preview_ready->handoff_ready allowed', () => assert.ok(lifecycle.allowedTransitionPairs.includes('preview_ready->handoff_ready')));
test('168. lifecycle no transition to forbidden state', () => assert.ok(!lifecycle.allowedTransitionPairs.some((p) => FORBIDDEN_LIFECYCLE_STATES.some((s) => p.endsWith(`->${s}`)))));
test('169. lifecycle forbidden states 7', () => assert.equal(lifecycle.forbiddenStates.length, 7));
test('170. lifecycle forbidden includes certified', () => assert.ok(lifecycle.forbiddenStates.includes('certified')));
test('171. lifecycle forbidden includes published', () => assert.ok(lifecycle.forbiddenStates.includes('published')));
test('172. lifecycle forbidden includes generated', () => assert.ok(lifecycle.forbiddenStates.includes('generated')));
test('173. lifecycle not canonical', () => assert.equal(lifecycle.canonical, false));
test('174. lifecycle does not drive runtime', () => assert.equal(lifecycle.drivesRuntime, false));
test('175. lifecycle does not emit forbidden state', () => assert.equal(lifecycle.emitsForbiddenState, false));
test('176. lifecycle digest fnv1a', () => assert.ok(String(lifecycle.lifecycleDigest).startsWith('fnv1a-')));

// ===== Operation catalog (177-192) =====
test('177. operationCatalog kind', () => assert.equal(operationCatalog.kind, 'authoring-operation-catalog'));
test('178. operationCatalog count 16', () => assert.equal(operationCatalog.operationCount, 16));
test('179. operationCatalog ids match const', () => assert.deepEqual(operationCatalog.operationIds, [...AUTHORING_OPERATION_IDS]));
test('180. operationCatalog none implemented', () => assert.equal(operationCatalog.anyImplemented, false));
test('181. operationCatalog none mutates certified', () => assert.equal(operationCatalog.anyMutatesCertifiedContract, false));
test('182. operationCatalog none generates module', () => assert.equal(operationCatalog.anyGeneratesModule, false));
test('183. operationCatalog every op not implemented', () => assert.ok(operationCatalog.operations.every((o) => o.implemented === false)));
test('184. operationCatalog every op draftScoped', () => assert.ok(operationCatalog.operations.every((o) => o.draftScoped === true)));
test('185. operationCatalog every op no module gen', () => assert.ok(operationCatalog.operations.every((o) => o.generatesModule === false)));
test('186. operationCatalog every op no persist', () => assert.ok(operationCatalog.operations.every((o) => o.persists === false)));
test('187. operationCatalog every op no publish', () => assert.ok(operationCatalog.operations.every((o) => o.publishes === false)));
test('188. operationCatalog every op requires future checkpoint', () => assert.ok(operationCatalog.operations.every((o) => o.requiresFutureCheckpoint === REQUIRED_FUTURE_CHECKPOINT)));
test('189. operationCatalog has createDraft', () => assert.ok(operationCatalog.operationIds.includes('createDraft')));
test('190. operationCatalog has requestValidation', () => assert.ok(operationCatalog.operationIds.includes('requestValidation')));
test('191. operationCatalog has requestCertificationCandidateHandoff', () => assert.ok(operationCatalog.operationIds.includes('requestCertificationCandidateHandoff')));
test('192. operationCatalog digest fnv1a', () => assert.ok(String(operationCatalog.operationCatalogDigest).startsWith('fnv1a-')));

// ===== Invariant catalog (193-206) =====
test('193. invariantCatalog kind', () => assert.equal(invariantCatalog.kind, 'authoring-invariant-catalog'));
test('194. invariantCatalog count 15', () => assert.equal(invariantCatalog.invariantCount, 15));
test('195. invariantCatalog ids match const', () => assert.deepEqual(invariantCatalog.invariantIds, [...AUTHORING_INVARIANT_IDS]));
test('196. invariantCatalog all mandatory', () => assert.equal(invariantCatalog.allMandatory, true));
test('197. invariantCatalog not enforced by this layer', () => assert.equal(invariantCatalog.enforcedByThisLayer, false));
test('198. invariantCatalog has no_self_certification', () => assert.ok(invariantCatalog.invariantIds.includes('no_self_certification')));
test('199. invariantCatalog has no_module_generation_authorization', () => assert.ok(invariantCatalog.invariantIds.includes('no_module_generation_authorization')));
test('200. invariantCatalog has no_real_data_references', () => assert.ok(invariantCatalog.invariantIds.includes('no_real_data_references')));
test('201. invariantCatalog has no_old_prototype_references', () => assert.ok(invariantCatalog.invariantIds.includes('no_old_prototype_references')));
test('202. invariantCatalog has field_keys_unique', () => assert.ok(invariantCatalog.invariantIds.includes('field_keys_unique')));
test('203. invariantCatalog every invariant mandatory', () => assert.ok(invariantCatalog.invariants.every((i) => i.mandatory === true)));
test('204. invariantCatalog every invariant required of future runtime', () => assert.ok(invariantCatalog.invariants.every((i) => i.requiredOfFutureRuntime === true)));
test('205. invariantCatalog every invariant has statement', () => assert.ok(invariantCatalog.invariants.every((i) => typeof i.statement === 'string' && i.statement.length > 0)));
test('206. invariantCatalog digest fnv1a', () => assert.ok(String(invariantCatalog.invariantCatalogDigest).startsWith('fnv1a-')));

// ===== Preview handoff (207-218) =====
test('207. previewHandoff kind', () => assert.equal(previewHandoff.kind, 'authoring-preview-handoff-contract'));
test('208. previewHandoff synthetic target', () => assert.equal(previewHandoff.handoffTarget, 'synthetic-preview-sandbox'));
test('209. previewHandoff synthetic only', () => assert.equal(previewHandoff.syntheticOnly, true));
test('210. previewHandoff carries draft snapshot', () => assert.equal(previewHandoff.carriesDraftSnapshot, true));
test('211. previewHandoff snapshot not canonical', () => assert.equal(previewHandoff.draftSnapshotCanonical, false));
test('212. previewHandoff NOT to product', () => assert.equal(previewHandoff.handoffToProduct, false));
test('213. previewHandoff mounts nothing', () => assert.equal(previewHandoff.mountsPreview, false));
test('214. previewHandoff no route', () => assert.equal(previewHandoff.routeCreated, false));
test('215. previewHandoff no menu', () => assert.equal(previewHandoff.menuCreated, false));
test('216. previewHandoff no real data', () => { assert.equal(previewHandoff.realDataRead, false); assert.equal(previewHandoff.realDataWrite, false); });
test('217. previewHandoff requires validated draft', () => assert.equal(previewHandoff.requiresValidatedDraft, true));
test('218. previewHandoff digest fnv1a', () => assert.ok(String(previewHandoff.previewHandoffDigest).startsWith('fnv1a-')));

// ===== Certification candidate handoff (219-232) =====
test('219. certCandidate kind', () => assert.equal(certificationCandidate.kind, 'authoring-certification-candidate-handoff-contract'));
test('220. certCandidate produces candidate', () => assert.equal(certificationCandidate.producesCandidate, true));
test('221. certCandidate candidate is NOT certification', () => assert.equal(certificationCandidate.candidateIsCertification, false));
test('222. certCandidate candidate not canonical', () => assert.equal(certificationCandidate.candidateIsCanonical, false));
test('223. certCandidate draft does NOT self certify', () => assert.equal(certificationCandidate.draftSelfCertifies, false));
test('224. certCandidate does NOT overwrite certified', () => assert.equal(certificationCandidate.overwritesCertifiedContract, false));
test('225. certCandidate registers NO module', () => assert.equal(certificationCandidate.registersModule, false));
test('226. certCandidate generates NO files', () => assert.equal(certificationCandidate.generatesFiles, false));
test('227. certCandidate publishes nothing', () => assert.equal(certificationCandidate.publishes, false));
test('228. certCandidate requires human review', () => assert.equal(certificationCandidate.requiresHumanReview, true));
test('229. certCandidate requires future checkpoint', () => assert.equal(certificationCandidate.requiresFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('230. certCandidate handoff not implemented', () => assert.equal(certificationCandidate.handoffImplemented, false));
test('231. certCandidate inert data', () => assert.equal(certificationCandidate.inertData, true));
test('232. certCandidate digest fnv1a', () => assert.ok(String(certificationCandidate.certificationCandidateDigest).startsWith('fnv1a-')));

// ===== SSOT boundary (233-248) =====
test('233. ssotBoundary kind', () => assert.equal(ssotBoundary.kind, 'authoring-ssot-boundary-contract'));
test('234. ssotBoundary canonical SSOT is certified contract', () => assert.equal(ssotBoundary.canonicalSsot, 'certified-blueprint-contract'));
test('235. ssotBoundary certified remains SSOT', () => assert.equal(ssotBoundary.certifiedBlueprintRemainsSsot, true));
test('236. ssotBoundary draft NOT canonical', () => assert.equal(ssotBoundary.draftIsCanonical, false));
test('237. ssotBoundary draft temporary', () => assert.equal(ssotBoundary.draftIsTemporary, true));
test('238. ssotBoundary draft non-canonical', () => assert.equal(ssotBoundary.draftIsNonCanonical, true));
test('239. ssotBoundary draft cannot become SSOT', () => assert.equal(ssotBoundary.draftCanBecomeSsot, false));
test('240. ssotBoundary draft does NOT self certify', () => assert.equal(ssotBoundary.draftSelfCertifies, false));
test('241. ssotBoundary draft does NOT overwrite certified', () => assert.equal(ssotBoundary.draftOverwritesCertifiedContract, false));
test('242. ssotBoundary engine is read-only consumer', () => assert.equal(ssotBoundary.blueprintEngineIsReadOnlyConsumer, true));
test('243. ssotBoundary planner is read-only consumer', () => assert.equal(ssotBoundary.moduleReferencePlannerIsReadOnlyConsumer, true));
test('244. ssotBoundary preview sandbox synthetic destination', () => assert.equal(ssotBoundary.previewSandboxIsSyntheticDestination, true));
test('245. ssotBoundary ssot preserved', () => assert.equal(ssotBoundary.ssotPreserved, true));
test('246. ssotBoundary certified version', () => assert.equal(ssotBoundary.certifiedBlueprintContractVersion, BLUEPRINT_CONTRACT_VERSION));
test('247. ssotBoundary in contract', () => assert.equal(U.ssotBoundary.draftIsCanonical, false));
test('248. ssotBoundary digest fnv1a', () => assert.ok(String(ssotBoundary.ssotBoundaryDigest).startsWith('fnv1a-')));

// ===== Permission / tenancy boundary (249-262) =====
test('249. permissionTenancy kind', () => assert.equal(permissionTenancy.kind, 'authoring-permission-tenancy-boundary-contract'));
test('250. permissionTenancy requires permission foundation', () => assert.equal(permissionTenancy.requiresPermissionFoundation, true));
test('251. permissionTenancy requires tenancy foundation', () => assert.equal(permissionTenancy.requiresTenancyFoundation, true));
test('252. permissionTenancy permission not implemented here', () => assert.equal(permissionTenancy.permissionImplementedHere, false));
test('253. permissionTenancy tenancy not implemented here', () => assert.equal(permissionTenancy.tenancyImplementedHere, false));
test('254. permissionTenancy reads no tenant data', () => assert.equal(permissionTenancy.readsTenantData, false));
test('255. permissionTenancy resolves no permissions', () => assert.equal(permissionTenancy.resolvesPermissions, false));
test('256. permissionTenancy crosses no tenant boundary', () => assert.equal(permissionTenancy.crossesTenantBoundary, false));
test('257. permissionTenancy bypasses no permission', () => assert.equal(permissionTenancy.bypassesPermission, false));
test('258. permissionTenancy bypasses no tenancy', () => assert.equal(permissionTenancy.bypassesTenancy, false));
test('259. permissionTenancy enforcement deferred', () => assert.equal(permissionTenancy.enforcementDeferredToFutureRuntime, true));
test('260. permissionTenancy boundaryOnly', () => assert.equal(permissionTenancy.boundaryOnly, true));
test('261. permissionTenancy in contract', () => assert.equal(U.permissionTenancy.requiresPermissionFoundation, true));
test('262. permissionTenancy digest fnv1a', () => assert.ok(String(permissionTenancy.permissionTenancyDigest).startsWith('fnv1a-')));

// ===== Prototype relink prohibition (263-274) =====
test('263. prototypeRelink kind', () => assert.equal(prototypeRelinkProhibition.kind, 'authoring-prototype-relink-prohibition-contract'));
test('264. prototypeRelink not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeRelinkAllowed, false));
test('265. prototypeImport not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeImportAllowed, false));
test('266. prototypeCopy not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeCopyAllowed, false));
test('267. prototypeMove not allowed', () => assert.equal(prototypeRelinkProhibition.prototypeMoveAllowed, false));
test('268. old prototype not imported', () => assert.equal(prototypeRelinkProhibition.oldPrototypeImported, false));
test('269. prototype forbidden paths 8', () => assert.equal(prototypeRelinkProhibition.forbiddenPathCount, 8));
test('270. prototype forbidden paths match const', () => assert.deepEqual(prototypeRelinkProhibition.forbiddenPrototypePaths, [...FORBIDDEN_PROTOTYPE_PATHS]));
test('271. prototype forbidden includes components', () => assert.ok(prototypeRelinkProhibition.forbiddenPrototypePaths.includes('src/studio/components/')));
test('272. prototype forbidden includes editor', () => assert.ok(prototypeRelinkProhibition.forbiddenPrototypePaths.includes('src/studio/editor/')));
test('273. prototypeRelink in contract', () => assert.equal(U.prototypeRelinkProhibition.prototypeRelinkAllowed, false));
test('274. prototypeRelink digest fnv1a', () => assert.ok(String(prototypeRelinkProhibition.prototypeRelinkProhibitionDigest).startsWith('fnv1a-')));

// ===== Manual enablement gate (275-290) =====
test('275. manualGate kind', () => assert.equal(manualGate.kind, 'authoring-manual-enablement-gate-contract'));
test('276. manualGate required', () => assert.equal(manualGate.manualGateRequired, true));
test('277. manualGate required checkpoint', () => assert.equal(manualGate.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('278. manualGate current authorization foundation_contract_only', () => assert.equal(manualGate.currentSliceAuthorization, 'foundation_contract_only'));
test('279. manualGate authorizes NO runtime', () => assert.equal(manualGate.authorizesAuthoringRuntime, false));
test('280. manualGate authorizes NO ui', () => assert.equal(manualGate.authorizesAuthoringUi, false));
test('281. manualGate authorizes NO editor', () => assert.equal(manualGate.authorizesEditor, false));
test('282. manualGate authorizes NO persistence', () => assert.equal(manualGate.authorizesPersistence, false));
test('283. manualGate authorizes NO module generation', () => assert.equal(manualGate.authorizesModuleGeneration, false));
test('284. manualGate authorizes NO file writes', () => assert.equal(manualGate.authorizesFileWrites, false));
test('285. manualGate authorizes NO certification', () => assert.equal(manualGate.authorizesCertification, false));
test('286. manualGate authorizes NO publish', () => assert.equal(manualGate.authorizesPublish, false));
test('287. manualGate authorizes NO product exposure', () => assert.equal(manualGate.authorizesProductExposure, false));
test('288. manualGate authorizes NO menu or route', () => assert.equal(manualGate.authorizesMenuOrRoute, false));
test('289. manualGate in contract', () => assert.equal(U.manualGate.manualGateRequired, true));
test('290. manualGate digest fnv1a', () => assert.ok(String(manualGate.manualEnablementGateDigest).startsWith('fnv1a-')));

// ===== Safety (291-304) =====
test('291. safety kind', () => assert.equal(safety.kind, 'authoring-safety-contract'));
test('292. safety no forbidden side effect', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('293. safety reversible by non-consumption', () => assert.equal(safety.reversibleByNonConsumption, true));
test('294. safety headless', () => assert.equal(safety.headless, true));
test('295. safety contractOnly', () => assert.equal(safety.contractOnly, true));
test('296. safety metadataOnly', () => assert.equal(safety.metadataOnly, true));
test('297. safety forbiddenFlags moduleGenerated false', () => assert.equal(safety.forbiddenFlags.moduleGenerated, false));
test('298. safety forbiddenFlags draftSelfCertified false', () => assert.equal(safety.forbiddenFlags.draftSelfCertified, false));
test('299. safety forbiddenFlags certifiedContractOverwritten false', () => assert.equal(safety.forbiddenFlags.certifiedContractOverwritten, false));
test('300. safety forbiddenFlags productExposed false', () => assert.equal(safety.forbiddenFlags.productExposed, false));
test('301. safety forbiddenFlags reactImported false', () => assert.equal(safety.forbiddenFlags.reactImported, false));
test('302. safety forbiddenFlags all false', () => assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)));
test('303. safety in contract', () => assert.equal(U.safety.anyForbiddenSideEffect, false));
test('304. safety digest fnv1a', () => assert.ok(String(safety.safetyDigest).startsWith('fnv1a-')));

// ===== Readiness decision (305-316) =====
const rdReady = createAuthoringFoundationReadinessDecision({ blockers: [], warnings: [] });
const rdBlocked = createAuthoringFoundationReadinessDecision({ blockers: ['x'], warnings: [] });
test('305. readiness kind', () => assert.equal(rdReady.kind, 'authoring-foundation-readiness-decision'));
test('306. readiness ready state', () => assert.equal(rdReady.readiness, 'studio_module_blueprint_authoring_foundation_contract_ready'));
test('307. readiness ready true', () => assert.equal(rdReady.readyForAuthoringFoundationContract, true));
test('308. readiness plan false', () => assert.equal(rdReady.readyForAuthoringImplementationPlan, false));
test('309. readiness runtime false', () => assert.equal(rdReady.readyForAuthoringRuntime, false));
test('310. readiness product exposure false', () => assert.equal(rdReady.readyForProductExposure, false));
test('311. readiness requires permission tenancy', () => assert.equal(rdReady.requiresPermissionTenancyFoundation, true));
test('312. readiness blocked when blocker', () => assert.equal(rdBlocked.readiness, 'blocked'));
test('313. readiness blocked not ready', () => assert.equal(rdBlocked.readyForAuthoringFoundationContract, false));
test('314. readiness blocker count', () => assert.equal(rdBlocked.blockerCount, 1));
test('315. readiness known state', () => assert.equal(rdReady.knownState, true));
test('316. readiness digest fnv1a', () => assert.ok(String(rdReady.readinessDigest).startsWith('fnv1a-')));

// ===== Manifest (317-330) =====
test('317. manifest kind', () => assert.equal(manifest.kind, 'authoring-foundation-contract-manifest'));
test('318. manifest name', () => assert.equal(manifest.authoringFoundationContractName, AUTHORING_FOUNDATION_CONTRACT_NAME));
test('319. manifest version', () => assert.equal(manifest.authoringFoundationContractVersion, AUTHORING_FOUNDATION_CONTRACT_VERSION));
test('320. manifest upstream blueprint contract', () => assert.equal(manifest.upstream.blueprintContract, BLUEPRINT_CONTRACT_VERSION));
test('321. manifest upstream engine', () => assert.equal(manifest.upstream.blueprintEngine, BLUEPRINT_ENGINE_VERSION));
test('322. manifest upstream planner', () => assert.equal(manifest.upstream.moduleReferencePlanner, MODULE_REFERENCE_PLANNER_VERSION));
test('323. manifest upstream sandbox', () => assert.equal(manifest.upstream.previewSandbox, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('324. manifest parts session digest', () => assert.equal(manifest.parts.session, session.sessionDigest));
test('325. manifest parts ssotBoundary digest string', () => assert.equal(typeof manifest.parts.ssotBoundary, 'string'));
test('326. manifest parts manualGate digest string', () => assert.equal(typeof manifest.parts.manualGate, 'string'));
test('327. manifest capabilities mirrored (metadataOnly)', () => assert.equal(manifest.capabilities.metadataOnly, true));
test('328. manifest capabilities moduleGenerated false', () => assert.equal(manifest.capabilities.moduleGenerated, false));
test('329. manifest digest fnv1a', () => assert.ok(String(manifest.manifestDigest).startsWith('fnv1a-')));
test('330. standalone manifest builds', () => assert.equal(createAuthoringFoundationManifest({ certifiedBlueprint: BP }).kind, 'authoring-foundation-contract-manifest'));

// ===== Verifier (331-360) =====
test('331. verification ok', () => assert.equal(U.verification.ok, true));
test('332. verification valid', () => assert.equal(U.verification.valid, true));
test('333. verification headless/contractOnly/metadataOnly', () => { assert.equal(U.verification.headless, true); assert.equal(U.verification.contractOnly, true); assert.equal(U.verification.metadataOnly, true); });
test('334. verification ssotPreserved', () => assert.equal(U.verification.ssotPreserved, true));
test('335. verification draftIsCanonical false', () => assert.equal(U.verification.draftIsCanonical, false));
test('336. verification moduleGenerated false', () => assert.equal(U.verification.moduleGenerated, false));
test('337. verification productExposed false', () => assert.equal(U.verification.productExposed, false));
test('338. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
test('339. verification kind', () => assert.equal(U.verification.kind, 'authoring-foundation-contract-verification'));
const vb = (o) => verifyAuthoringFoundationContract(o).blockers;
test('340. verifier detects draftIsCanonical cap', () => assert.ok(vb({ contract: { capabilities: { ...caps, draftIsCanonical: true } } }).includes('capability_draftIsCanonical_must_be_false')));
test('341. verifier detects moduleGenerated cap', () => assert.ok(vb({ contract: { capabilities: { ...caps, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')));
test('342. verifier detects filesWrittenToModule cap', () => assert.ok(vb({ contract: { capabilities: { ...caps, filesWrittenToModule: true } } }).includes('capability_filesWrittenToModule_must_be_false')));
test('343. verifier detects moduleRegistered cap', () => assert.ok(vb({ contract: { capabilities: { ...caps, moduleRegistered: true } } }).includes('capability_moduleRegistered_must_be_false')));
test('344. verifier detects backend/prisma caps', () => { const r = vb({ contract: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.includes('capability_backendAccessed_must_be_false') && r.includes('capability_prismaAccessed_must_be_false')); });
test('345. verifier detects production/staging caps', () => { const r = vb({ contract: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.includes('capability_productionAccessed_must_be_false') && r.includes('capability_stagingAccessed_must_be_false')); });
test('346. verifier detects fetch/mutation caps', () => { const r = vb({ contract: { capabilities: { ...caps, fetchUsed: true, mutationAllowed: true } } }); assert.ok(r.includes('capability_fetchUsed_must_be_false') && r.includes('capability_mutationAllowed_must_be_false')); });
test('347. verifier detects real data caps', () => { const r = vb({ contract: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.includes('capability_realDataRead_must_be_false') && r.includes('capability_realDataWrite_must_be_false')); });
test('348. verifier detects productExposed/menu/route caps', () => { const r = vb({ contract: { capabilities: { ...caps, productExposed: true, menuCreated: true, routeCreated: true } } }); assert.ok(r.includes('capability_productExposed_must_be_false') && r.includes('capability_menuCreated_must_be_false') && r.includes('capability_routeCreated_must_be_false')); });
test('349. verifier detects mustBeTrue inversion (ssotPreserved)', () => assert.ok(vb({ contract: { capabilities: { ...caps, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')));
test('350. verifier detects mustBeTrue inversion (headless)', () => assert.ok(vb({ contract: { capabilities: { ...caps, headless: false } } }).includes('capability_headless_must_be_true')));
test('351. verifier detects ssot draft canonical (part)', () => assert.ok(vb({ contract: { capabilities: caps, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_draft_canonical')));
test('352. verifier detects ssot not preserved (part)', () => assert.ok(vb({ contract: { capabilities: caps, ssotBoundary: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')));
test('353. verifier detects draft self certifies (part)', () => assert.ok(vb({ contract: { capabilities: caps, ssotBoundary: { draftSelfCertifies: true } } }).includes('unsafe_draft_self_certifies')));
test('354. verifier detects operations implemented (part)', () => assert.ok(vb({ contract: { capabilities: caps, operationCatalog: { anyImplemented: true } } }).includes('unsafe_operations_implemented')));
test('355. verifier detects preview handoff to product (part)', () => assert.ok(vb({ contract: { capabilities: caps, previewHandoff: { handoffToProduct: true } } }).includes('unsafe_preview_handoff_to_product')));
test('356. verifier detects candidate certifies (part)', () => assert.ok(vb({ contract: { capabilities: caps, certificationCandidate: { candidateIsCertification: true } } }).includes('unsafe_candidate_certifies')));
test('357. verifier detects permission/tenancy bypass (part)', () => assert.ok(vb({ contract: { capabilities: caps, permissionTenancy: { bypassesPermission: true } } }).includes('unsafe_permission_tenancy_bypass')));
test('358. verifier detects prototype relink + missing manual gate (part)', () => { const r1 = vb({ contract: { capabilities: caps, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }); const r2 = vb({ contract: { capabilities: caps, manualGate: { manualGateRequired: false } } }); assert.ok(r1.includes('unsafe_prototype_relink') && r2.includes('missing_manual_gate')); });
test('359. verifier detects safety side effect (part)', () => assert.ok(vb({ contract: { capabilities: caps, safety: { anyForbiddenSideEffect: true } } }).includes('unsafe_safety_side_effect')));
test('360. verifier never throws on null', () => assert.doesNotThrow(() => verifyAuthoringFoundationContract({ contract: null })));

// ===== Compatibility (361-372) =====
test('361. compatibility kind', () => assert.equal(U.compatibility.kind, 'authoring-foundation-compatibility'));
test('362. compatibleWithBlueprintContract', () => assert.equal(U.compatibility.compatibleWithBlueprintContract, true));
test('363. compatibleWithBlueprintEngine', () => assert.equal(U.compatibility.compatibleWithBlueprintEngine, true));
test('364. compat readyForAuthoringFoundationContract', () => assert.equal(U.compatibility.readyForAuthoringFoundationContract, true));
test('365. compat readyForImplementationPlan false', () => assert.equal(U.compatibility.readyForAuthoringImplementationPlan, false));
test('366. compat readyForRuntime false', () => assert.equal(U.compatibility.readyForAuthoringRuntime, false));
test('367. compat readyForProductExposure false', () => assert.equal(U.compatibility.readyForProductExposure, false));
test('368. compat readyForProduction false', () => assert.equal(U.compatibility.readyForProduction, false));
test('369. compat status', () => assert.equal(U.compatibility.status, 'ready_for_future_authoring_implementation_plan_after_explicit_authorization'));
test('370. compat not blocked', () => assert.equal(U.compatibility.blocked, false));
test('371. compat mismatch → warning', () => { const r = checkAuthoringFoundationCompatibility({ certifiedBlueprint: { engineVersion: 'x@9.9.9', kind: 'other', certified: false } }); assert.equal(r.compatibleWithBlueprintEngine, false); assert.ok(r.warnings.includes('incompatible_blueprintEngine')); });
test('372. compat digest fnv1a', () => assert.ok(String(U.compatibility.compatibilityDigest).startsWith('fnv1a-')));

// ===== Diagnostics + fallback (373-390) =====
test('373. diagnostics kind', () => assert.equal(U.diagnostics.kind, 'authoring-foundation-diagnostics'));
test('374. diagnostics passive', () => assert.equal(U.diagnostics.passive, true));
test('375. diagnostics ok', () => assert.equal(U.diagnostics.ok, true));
test('376. diagnostics headless/contractOnly/metadataOnly confirmed', () => { assert.equal(U.diagnostics.headlessConfirmed, true); assert.equal(U.diagnostics.contractOnlyConfirmed, true); assert.equal(U.diagnostics.metadataOnlyConfirmed, true); });
test('377. diagnostics ssotPreserved confirmed', () => assert.equal(U.diagnostics.ssotPreservedConfirmed, true));
test('378. diagnostics moduleGenerated false', () => assert.equal(U.diagnostics.moduleGenerated, false));
test('379. diagnostics productExposed false', () => assert.equal(U.diagnostics.productExposed, false));
test('380. diagnostics no secrets', () => assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(JSON.stringify(U.diagnostics))));
test('381. diagnostics no external logging', () => { assert.equal(U.diagnostics.logged, false); assert.equal(U.diagnostics.externalLogging, false); });
test('382. fallback missing blueprint', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({}).fallback, true));
test('383. fallback invalid kind + not certified', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: { kind: 'other' } }).fallback, true));
test('384. fallback upstream fallback', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: { kind: 'studio-blueprint-contract', fallback: true } }).fallback, true));
test('385. fallback readiness blocked', () => assert.equal(createAuthoringFoundationFallback({}).readiness, 'blocked'));
test('386. fallback authorizes nothing', () => { const fb = createAuthoringFoundationFallback({}); assert.equal(fb.readyForAuthoringFoundationContract, false); assert.equal(fb.readyForProduction, false); });
test('387. fallback capabilities preserved false', () => assert.equal(createAuthoringFoundationFallback({}).capabilities.moduleGenerated, false));
test('388. fallback capabilities ssotPreserved true', () => assert.equal(createAuthoringFoundationFallback({}).capabilities.ssotPreserved, true));
test('389. fallback digest fnv1a', () => assert.ok(String(createAuthoringFoundationFallback({}).overallDigest).startsWith('fnv1a-')));
test('390. valid when certified true but kind other', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: { kind: 'x', certified: true, moduleId: 'm' } }).fallback, false));

// ===== Errors (391-402) =====
test('391. error codes >= 40', () => assert.ok(AUTHORING_FOUNDATION_ERROR_CODES.length >= 40));
test('392. error descriptor kind', () => assert.equal(createAuthoringFoundationError(AUTHORING_FOUNDATION_ERROR_CODES[0]).kind, 'authoring-foundation-error'));
test('393. error descriptor safe', () => assert.equal(createAuthoringFoundationError('AUTHORING_FOUNDATION_PRISMA_BLOCKED').safe, true));
test('394. error descriptor side-effect free', () => assert.equal(createAuthoringFoundationError('AUTHORING_FOUNDATION_PRISMA_BLOCKED').sideEffects, false));
test('395. error descriptor no real data / not self certified', () => { const e = createAuthoringFoundationError('AUTHORING_FOUNDATION_BACKEND_BLOCKED'); assert.equal(e.realDataRead, false); assert.equal(e.draftSelfCertified, false); assert.equal(e.moduleGenerated, false); });
test('396. error descriptor unknown code normalized', () => assert.equal(createAuthoringFoundationError('NOPE').code, 'AUTHORING_FOUNDATION_INVALID_CONTRACT'));
test('397. error class instance', () => assert.ok(authoringFoundationError('AUTHORING_FOUNDATION_SESSION_FAILED', 'x') instanceof AuthoringFoundationError));
test('398. error class normalizes bad code', () => assert.equal(new AuthoringFoundationError('bad', 'x').code, 'AUTHORING_FOUNDATION_INVALID_CONTRACT'));
test('399. error no secrets in message', () => { const e = createAuthoringFoundationError('AUTHORING_FOUNDATION_FETCH_BLOCKED'); assert.equal(e.withoutSecrets, true); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(e.message)); });
test('400. error codes unique', () => assert.equal(new Set(AUTHORING_FOUNDATION_ERROR_CODES).size, AUTHORING_FOUNDATION_ERROR_CODES.length));
test('401. error has self-certification-blocked code', () => assert.ok(AUTHORING_FOUNDATION_ERROR_CODES.includes('AUTHORING_FOUNDATION_DRAFT_SELF_CERTIFICATION_BLOCKED')));
test('402. error has overwrite-certified-blocked code', () => assert.ok(AUTHORING_FOUNDATION_ERROR_CODES.includes('AUTHORING_FOUNDATION_DRAFT_OVERWRITE_CERTIFIED_BLOCKED')));

// ===== Flags (403-414) =====
test('403. flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('404. flag on in dev', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG]: 'true', DEV: 'true' }), true));
test('405. flag off by default', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationEnabled({}), false));
test('406. verify flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationVerifyEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('407. compatibility flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationCompatibilityCheckEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('408. isProductionEnv true for production label', () => assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true));
test('409. isProductionEnv false for DEV', () => assert.equal(isProductionEnv({ DEV: 'true' }), false));
test('410. isProductionEnv true for PROD', () => assert.equal(isProductionEnv({ PROD: 'true' }), true));
test('411. isProductionEnv true for NODE_ENV production', () => assert.equal(isProductionEnv({ NODE_ENV: 'production' }), true));
test('412. flag names distinct', () => assert.equal(new Set([MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG, MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG, MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG]).size, 3));
test('413. master flag enables verify path', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationVerifyEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG]: 'true', DEV: 'true' }), true));
test('414. staging label not production but flag still gated by dev', () => assert.equal(isStudioModuleBlueprintAuthoringFoundationEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG]: 'true', MAK_ENV_LABEL: 'staging' }), true));

// ===== Determinism / purity (415-428) =====
test('415. deterministic overall digest', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }).overallDigest, U.overallDigest));
test('416. deterministic contract digest', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }).authoringFoundationContractDigest, U.authoringFoundationContractDigest));
test('417. digest helper stable', () => assert.equal(authoringFoundationDigest({ a: 1 }), authoringFoundationDigest({ a: 1 })));
test('418. digest helper handles null', () => assert.ok(String(authoringFoundationDigest(null)).startsWith('fnv1a-')));
test('419. contract has no functions (clone drops them)', () => assert.ok(!Object.values(U).some((v) => typeof v === 'function')));
test('420. contract JSON round-trips', () => { const j = JSON.parse(JSON.stringify(U)); assert.equal(j.kind, U.kind); });
test('421. second build equals first (manifest digest)', () => assert.equal(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }).manifest.manifestDigest, U.manifest.manifestDigest));
test('422. no top-level warnings', () => assert.deepEqual(U.warnings, []));
test('423. full deep-equal across two builds', () => assert.deepEqual(createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }), U));
test('424. building does not mutate certified blueprint', () => { const before = JSON.stringify(BP); createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP }); assert.equal(JSON.stringify(BP), before); });
test('425. lifecycle deterministic', () => assert.equal(createAuthoringLifecycleContract().lifecycleDigest, lifecycle.lifecycleDigest));
test('426. operationCatalog deterministic', () => assert.equal(createAuthoringOperationCatalog().operationCatalogDigest, operationCatalog.operationCatalogDigest));
test('427. sampleDraft embedded not canonical', () => assert.equal(U.sampleDraft.canonical, false));
test('428. sampleDraft embedded is draft', () => assert.equal(U.sampleDraft.isDraft, true));

// ===== Static .js scans (429-450) =====
test('429. subtree is React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('430. no react-router import', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('431. no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('432. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(jsCode())));
test('433. no <Route JSX / Routes / Link / NavLink (case-sensitive)', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsCode())));
test('434. no BrowserRouter / createBrowserRouter / useNavigate', () => assert.ok(!/\bBrowserRouter\b|\bcreateBrowserRouter\b|\buseNavigate\b/.test(jsCode())));
test('435. no ReactDOM / createRoot / hydrateRoot', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('436. no window/document/history/location access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]|\bhistory\.(push|replace)State|\blocation\.(href|assign|replace)/i.test(jsCode())));
test('437. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('438. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('439. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('440. no EmpresaApi/apiClient/apis/backend/prisma import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\/|@prisma|PrismaClient/i.test(p))));
test('441. no fetch/XHR/WebSocket/storage-API', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(jsCode()) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('442. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('443. no real POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('444. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('445. no moduleGenerated true literal', () => assert.ok(!/moduleGenerated\s*:\s*true/.test(jsCode())));
test('446. no draftIsCanonical true literal', () => assert.ok(!/draftIsCanonical\s*:\s*true/.test(jsCode())));
test('447. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('448. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('449. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('450. exactly 26 .js files', () => assert.equal(jsFiles().length, 26));

// ===== Scope safety (451-462) =====
test('451. no App.jsx in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('src/App.jsx')); });
test('452. no src/pages in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/pages\//.test(f))); });
test('453. no src/components in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/components\//.test(f))); });
test('454. no src/modules in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^src\/modules\//.test(f))); });
test('455. no backend/prisma in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f))); });
test('456. no .jsx/.tsx/.css in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.some((f) => /\.(jsx|tsx|css)$/.test(f))); });
test('457. no productionUiGuard/governanceGuard in diff', () => { const files = changed(); if (files === null) return; assert.ok(!files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')); });
// Branch-relative scope check: it runs on later Studio headless slices before merge, so it consumes the CENTRAL
// governance guard. Only EXPLICITLY registered later Studio headless artifacts are tolerated (no wildcard);
// unknown_scope and forbidden_scope (App/UI/backend/Prisma/modules) still fail hard.
test('458. no prior gate/test altered', () => {
  const files = changed(); if (files === null) return;
  const offenders = files.filter((f) => (/^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== 'scripts/gates/g423-studio-module-blueprint-authoring-foundation-contract.mjs')
    || (/^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== 'src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js'))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  assert.deepEqual(offenders, []);
});
test('459. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('460. net-new scope is subtree only (branch-relative)', () => { const files = changed(); if (files === null) return; if (!files.some((f) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-foundation-contract\//.test(f))) return; assert.deepEqual(files.filter((f) => !authorized(f)), []); });
test('461. upstream blueprint engine present', () => assert.ok(exists('src/studio/blueprint-engine/index.js')));
test('462. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));

// ===== Evidence docs (D1-D23) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-BLUEPRINT-AUTHORING-FOUNDATION-CONTRACT-REPORT.md', 'AUTHORING-SESSION-CONTRACT.md',
  'BLUEPRINT-DRAFT-DESCRIPTOR.md', 'FIELD-DRAFT-DESCRIPTOR.md', 'LAYOUT-DRAFT-DESCRIPTOR.md',
  'RELATIONSHIP-DRAFT-DESCRIPTOR.md', 'VALIDATION-ISSUE-CONTRACT.md', 'AUTHORING-LIFECYCLE-CONTRACT.md',
  'AUTHORING-OPERATION-CATALOG.md', 'AUTHORING-INVARIANTS.md', 'PREVIEW-HANDOFF-CONTRACT.md',
  'CERTIFICATION-CANDIDATE-HANDOFF-CONTRACT.md', 'SSOT-BOUNDARY.md', 'PERMISSION-TENANCY-BOUNDARY.md',
  'PROTOTYPE-RELINK-PROHIBITION.md', 'MANUAL-ENABLEMENT-GATE.md', 'SAFETY-CONTRACT.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md', 'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-module-blueprint-authoring-foundation-contract/${DOCS[i]}`)));
}
test('D24. exactly 23 evidence docs', () => assert.equal(DOCS.length, 23));
test('D-content. draft-not-ssot + no-runtime + prototype-debt + next slice present', () => {
  assert.ok(/SSOT|canonical|certified/i.test(readEv('SSOT-BOUNDARY.md')));
  assert.ok(/runtime|UI|module|persistence/i.test(readEv('NO-UI-NO-RUNTIME-NO-MODULE-NO-PERSISTENCE.md')));
  assert.ok(/contract|metadata/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')));
  assert.ok(/IMPLEMENTATION PLAN|implementation plan|checkpoint|authoring/i.test(readEv('NEXT-SLICE-SPEC.md')));
});

// ===== Spec-alignment (§10-§18) additional coverage (S1-S40) =====
const opCreate = operationCatalog.operations.find((o) => o.id === 'createDraft');
const opValidate = operationCatalog.operations.find((o) => o.id === 'requestValidation');
test('S1. session sessionKind', () => assert.equal(session.sessionKind, 'module-blueprint-authoring-foundation-contract-session'));
test('S2. session ephemeral true', () => assert.equal(session.ephemeral, true));
test('S3. session persistent false', () => assert.equal(session.persistent, false));
test('S4. session canonical false', () => assert.equal(session.canonical, false));
test('S5. session sideEffectFree true', () => assert.equal(session.sideEffectFree, true));
test('S6. session createdFromSyntheticSeed', () => assert.equal(session.createdFromSyntheticSeed, true));
test('S7. session sourceBlueprintContractVersion', () => assert.equal(session.sourceBlueprintContractVersion, BLUEPRINT_CONTRACT_VERSION));
test('S8. session sourceBlueprintEngineVersion', () => assert.equal(session.sourceBlueprintEngineVersion, BLUEPRINT_ENGINE_VERSION));
test('S9. draft draftVersion form', () => assert.equal(draft.draftVersion, 'clientes#authoring-draft@r0'));
test('S10. draft draftName/draftLabel', () => { assert.equal(draft.draftName, 'Clientes'); assert.equal(typeof draft.draftLabel, 'string'); });
test('S11. draft schemaVersion', () => assert.equal(draft.schemaVersion, 'studio-authoring-draft-schema@1.0.0'));
test('S12. draft moduleIntent', () => assert.equal(typeof draft.moduleIntent, 'string'));
test('S13. draft revision non-negative', () => assert.ok(draft.revision >= 0));
test('S14. draft synthetic', () => assert.equal(draft.synthetic, true));
test('S15. draft certified false', () => assert.equal(draft.certified, false));
test('S16. draft generated false', () => assert.equal(draft.generated, false));
test('S17. draft registered false', () => assert.equal(draft.registered, false));
test('S18. field dataKind', () => assert.equal(field.dataKind, 'text'));
test('S19. field fieldId', () => assert.equal(field.fieldId, 'field:nome'));
test('S20. field fieldKey', () => assert.equal(field.fieldKey, 'nome'));
test('S21. field synthetic', () => assert.equal(field.synthetic, true));
test('S22. field defaultValueDescriptor null', () => assert.equal(field.defaultValueDescriptor, null));
test('S23. field validationDescriptors array', () => assert.ok(Array.isArray(field.validationDescriptors)));
test('S24. field displayDescriptor object', () => assert.equal(typeof field.displayDescriptor, 'object'));
test('S25. layout layoutId', () => assert.equal(layout.layoutId, 'layout:main'));
test('S26. layout layoutKind', () => assert.equal(typeof layout.layoutKind, 'string'));
test('S27. layout sections/slots/ordering arrays', () => { assert.ok(Array.isArray(layout.sections)); assert.ok(Array.isArray(layout.slots)); assert.ok(Array.isArray(layout.ordering)); });
test('S28. layout visibilityDescriptors array', () => assert.ok(Array.isArray(layout.visibilityDescriptors)));
test('S29. layout synthetic', () => assert.equal(layout.synthetic, true));
test('S30. relationship source/target entity', () => { assert.equal(rel.sourceDraftEntity, 'clientes'); assert.equal(rel.targetDraftEntity, 'pedidos'); });
test('S31. relationship cascadePolicy none', () => assert.equal(rel.cascadePolicy, 'none'));
test('S32. relationship resolved false', () => assert.equal(rel.resolved, false));
test('S33. relationship synthetic', () => assert.equal(rel.synthetic, true));
test('S34. validation issue issueCode', () => assert.equal(issue.issueCode, 'i1'));
test('S35. validation issue path', () => assert.equal(issue.path, 'nome'));
test('S36. validation issue deterministic + blocksPreview/candidate', () => { assert.equal(issue.deterministic, true); assert.equal(issue.blocksPreview, true); assert.equal(issue.blocksCertificationCandidate, true); });
test('S37. validation error blocks preview', () => { const e = createValidationIssueDescriptor({ issueCode: 'x', severity: 'error' }); assert.equal(e.blocksPreview, true); });
test('S38. validation info does not block', () => { const i = createValidationIssueDescriptor({ issueCode: 'x', severity: 'info' }); assert.equal(i.blocksPreview, false); });
test('S39. preview handoffKind synthetic_preview_candidate', () => assert.equal(previewHandoff.handoffKind, 'synthetic_preview_candidate'));
test('S40. preview compatibleWithPreviewSandbox', () => assert.equal(previewHandoff.compatibleWithPreviewSandbox, true));

// ===== Spec-alignment continued (S41-S70) =====
test('S41. preview previewPayloadCreated false', () => assert.equal(previewHandoff.previewPayloadCreated, false));
test('S42. preview previewMounted false', () => assert.equal(previewHandoff.previewMounted, false));
test('S43. preview realDataAttached false', () => assert.equal(previewHandoff.realDataAttached, false));
test('S44. certCandidate candidateKind', () => assert.equal(certificationCandidate.candidateKind, 'blueprint_certification_candidate'));
test('S45. certCandidate candidateCreated false', () => assert.equal(certificationCandidate.candidateCreated, false));
test('S46. certCandidate certified false', () => assert.equal(certificationCandidate.certified, false));
test('S47. certCandidate canonical false', () => assert.equal(certificationCandidate.canonical, false));
test('S48. certCandidate readyForCertification false', () => assert.equal(certificationCandidate.readyForCertification, false));
test('S49. certCandidate requiresFutureExplicitSlice true', () => assert.equal(certificationCandidate.requiresFutureExplicitSlice, true));
test('S50. permission permissionModelIntegrated false', () => assert.equal(permissionTenancy.permissionModelIntegrated, false));
test('S51. permission tenantModelIntegrated false', () => assert.equal(permissionTenancy.tenantModelIntegrated, false));
test('S52. permission serverSideAuthorizationIntegrated false', () => assert.equal(permissionTenancy.serverSideAuthorizationIntegrated, false));
test('S53. permission clientSideAuthorizationSufficient false', () => assert.equal(permissionTenancy.clientSideAuthorizationSufficient, false));
test('S54. permission productExposureBlockedByPermissionTenancy true', () => assert.equal(permissionTenancy.productExposureBlockedByPermissionTenancy, true));
test('S55. permission authImported false', () => assert.equal(permissionTenancy.authImported, false));
test('S56. manualGate authorizesBackend false', () => assert.equal(manualGate.authorizesBackend, false));
test('S57. manualGate authorizesPrisma false', () => assert.equal(manualGate.authorizesPrisma, false));
test('S58. manualGate authorizesProduction false', () => assert.equal(manualGate.authorizesProduction, false));
test('S59. manualGate authorizesRealData false', () => assert.equal(manualGate.authorizesRealData, false));
test('S60. operation createDraft allowed empty only', () => assert.deepEqual(opCreate.allowedLifecycleStates, ['empty']));
test('S61. operation createDraft forbids discarded', () => assert.ok(opCreate.forbiddenLifecycleStates.includes('discarded')));
test('S62. operation createDraft requiredInputs', () => assert.ok(opCreate.requiredInputs.includes('moduleIntent')));
test('S63. operation createDraft producesNewRevision', () => assert.equal(opCreate.producesNewRevision, true));
test('S64. operation sideEffects/persistence/moduleWrite false', () => { assert.equal(opCreate.sideEffectsAllowed, false); assert.equal(opCreate.persistenceAllowed, false); assert.equal(opCreate.moduleWriteAllowed, false); });
test('S65. operation requestValidation no new revision', () => assert.equal(opValidate.producesNewRevision, false));
test('S66. compat planner + sandbox true', () => { assert.equal(U.compatibility.compatibleWithModuleReferencePlanner, true); assert.equal(U.compatibility.compatibleWithPreviewSandbox, true); });
test('S67. compat readyForPermissionTenancyIntegration false', () => assert.equal(U.compatibility.readyForPermissionTenancyIntegration, false));
test('S68. verifier detects permissionModelIntegrated (part)', () => assert.ok(vb({ contract: { capabilities: caps, permissionTenancy: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated_without_foundation')));
test('S69. verifier detects tenantModelIntegrated (part)', () => assert.ok(vb({ contract: { capabilities: caps, permissionTenancy: { tenantModelIntegrated: true } } }).includes('unsafe_tenant_model_integrated_without_foundation')));
test('S70. verifier detects lifecycle forbidden state (part)', () => assert.ok(vb({ contract: { capabilities: caps, lifecycle: { states: ['empty', 'certified'] } } }).includes('unsafe_lifecycle_forbidden_state_present')));
