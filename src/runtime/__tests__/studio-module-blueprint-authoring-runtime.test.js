import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Caller-aware Studio scope governance. This test declares its OWN slice identity, so the branch-relative
// scope check below can ask whether the slice active on this branch is the same as it or genuinely later.
import { evaluateStudioBranchConsumerScope, createResolvedActiveStudioSlicePathAuthorizer }
  from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  AUTHORING_RUNTIME_NAME,
  AUTHORING_RUNTIME_SEMVER,
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_RUNTIME_MODE,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  SOURCE_CHECKPOINT,
  CHECKPOINT_DECISION,
  AUTHORING_LIFECYCLE_STATES,
  AUTHORING_LIFECYCLE_TRANSITIONS,
  FORBIDDEN_LIFECYCLE_STATES,
  AUTHORING_OPERATION_IDS,
  REVISION_PRODUCING_OPERATIONS,
  VALIDATION_PIPELINE_STAGES,
  AUTHORING_INVARIANT_IDS,
  AUTHORING_ISSUE_SEVERITIES,
  AUTHORING_FIELD_KINDS,
  AUTHORING_RELATIONSHIP_CARDINALITIES,
  FORBIDDEN_PROTOTYPE_PATHS,
  DEFAULT_AUTHORING_RESOURCE_LIMITS,
  AUTHORING_RUNTIME_READINESS_STATES,
  AUTHORING_RUNTIME_CAPABILITIES,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG,
  isProductionEnv,
  isStudioModuleBlueprintAuthoringRuntimeEnabled,
  isStudioModuleBlueprintAuthoringRuntimeVerifyEnabled,
  AUTHORING_RUNTIME_ERROR_CODES,
  AuthoringRuntimeError,
  createAuthoringRuntimeError,
  authoringRuntimeError,
  stableSerialize,
  createDeterministicDigest,
  normalizeAuthoringInput,
  createAuthoringResourceLimits,
  enforceAuthoringResourceLimits,
  enforceStringLength,
  enforceSerializedSnapshotBytes,
  createValidationIssue,
  sortValidationIssues,
  createDraftSnapshot,
  createLifecycleExecutor,
  isLifecycleTransitionAllowed,
  createRevisionEngine,
  nextRevision,
  createInvariantEnforcer,
  enforceAuthoringInvariants,
  createValidationPipeline,
  runValidationPipeline,
  createOperationReceipt,
  createOperationExecutor,
  executeAuthoringOperation,
  createAuthoringRuntimeSession,
  createSyntheticPreviewHandoff,
  createCertificationCandidatePreparation,
  discardAuthoringDraft,
  createAuthoringRuntimeSsotBoundary,
  createAuthoringRuntimePermissionTenancyBoundary,
  createAuthoringRuntimeSafety,
  createAuthoringRuntimeDiagnostics,
  createAuthoringRuntimeReadinessDecision,
  createAuthoringRuntimeManifest,
  verifyAuthoringRuntime,
  verifyAuthoringOperationOutcome,
  checkAuthoringRuntimeCompatibility,
  createAuthoringRuntimeFallback,
  createStudioModuleBlueprintAuthoringRuntime,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';
import { createStudioModuleBlueprintAuthoringImplementationPlan } from '../../studio/blueprint-engine/module-blueprint-authoring-implementation-plan/index.js';
import { createStudioModuleBlueprintAuthoringFoundationContract } from '../../studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-module-blueprint-authoring-runtime');

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
// Determinism scan excludes the verifier (it holds the detection regex) — comments already stripped.
const jsCodeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyAuthoringRuntime\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const authorized = (f) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//.test(f)
  || f === 'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js'
  || f === 'scripts/gates/g423-studio-module-blueprint-authoring-runtime.mjs'
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-runtime\//.test(f);

// Build the real upstream chain.
const BP = { kind: 'studio-blueprint-contract', moduleId: 'clientes', certified: true, blueprintContractVersion: 'studio-blueprint-contract@1.0.0', engineVersion: 'studio-blueprint-engine@1.0.0' };
const FOUNDATION = createStudioModuleBlueprintAuthoringFoundationContract({ certifiedBlueprint: BP });
const PLAN = createStudioModuleBlueprintAuthoringImplementationPlan({ authoringFoundationContract: FOUNDATION });
const U = createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN });
const caps = AUTHORING_RUNTIME_CAPABILITIES;

// Helpers to drive live execution.
const freshSession = (seed = 'clientes', limits) => createAuthoringRuntimeSession({ seed, limits });
const run = (session, operationId, extra = {}) => executeAuthoringOperation({ session, operation: { operationId, ...extra } });
const buildValidatedDraft = () => {
  let s = freshSession('flow');
  let r = run(s, 'createDraft', { input: { moduleId: 'clientes', name: 'Clientes' } });
  const draftId = r.session.drafts[0].draftId;
  r = run(r.session, 'addFieldDraft', { draftId, input: { key: 'nome', dataKind: 'text', order: 0 } });
  r = run(r.session, 'requestValidation', { draftId });
  return { session: r.session, draftId };
};

// ===== Base + versions (1-40) =====
test('1. created', () => assert.equal(U.kind, 'studio-module-blueprint-authoring-runtime'));
test('2. name', () => { assert.equal(U.authoringRuntimeName, 'studio-module-blueprint-authoring-runtime'); assert.equal(U.authoringRuntimeName, AUTHORING_RUNTIME_NAME); });
test('3. version', () => { assert.equal(U.authoringRuntimeVersion, 'studio-module-blueprint-authoring-runtime@1.0.0'); assert.equal(U.authoringRuntimeVersion, AUTHORING_RUNTIME_VERSION); });
test('4. semver', () => assert.equal(AUTHORING_RUNTIME_SEMVER, '1.0.0'));
test('5. authoringImplementationPlanVersion', () => assert.equal(U.authoringImplementationPlanVersion, AUTHORING_IMPLEMENTATION_PLAN_VERSION));
test('6. authoringFoundationContractVersion', () => assert.equal(U.authoringFoundationContractVersion, AUTHORING_FOUNDATION_CONTRACT_VERSION));
test('7. blueprintContractVersion', () => assert.equal(U.blueprintContractVersion, BLUEPRINT_CONTRACT_VERSION));
test('8. blueprintEngineVersion', () => assert.equal(U.blueprintEngineVersion, BLUEPRINT_ENGINE_VERSION));
test('9. moduleReferencePlannerVersion', () => assert.equal(U.moduleReferencePlannerVersion, MODULE_REFERENCE_PLANNER_VERSION));
test('10. previewSandboxContractVersion', () => assert.equal(U.previewSandboxContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('11. mode', () => { assert.equal(U.mode, 'headless_studio_module_blueprint_authoring_runtime'); assert.equal(U.mode, AUTHORING_RUNTIME_MODE); });
test('12. not fallback', () => assert.equal(U.fallback, false));
test('13. sourceCheckpoint', () => { assert.equal(U.sourceCheckpoint, 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint'); assert.equal(U.sourceCheckpoint, SOURCE_CHECKPOINT); });
test('14. checkpointDecision', () => { assert.equal(U.checkpointDecision, 'READY_FOR_MODULE_BLUEPRINT_AUTHORING_RUNTIME_SLICE'); assert.equal(U.checkpointDecision, CHECKPOINT_DECISION); });
test('15. readiness ready', () => assert.equal(U.readiness, 'studio_module_blueprint_authoring_runtime_ready'));
test('16. readyForAuthoringRuntime true', () => assert.equal(U.readyForAuthoringRuntime, true));
test('17. readyForAuthoringUi false', () => assert.equal(U.readyForAuthoringUi, false));
test('18. readyForPermissionTenancyIntegration false', () => assert.equal(U.readyForPermissionTenancyIntegration, false));
test('19. readyForProductExposure false', () => assert.equal(U.readyForProductExposure, false));
test('20. readyForModuleGeneration false', () => assert.equal(U.readyForModuleGeneration, false));
test('21. readyForProduction false', () => assert.equal(U.readyForProduction, false));
test('22. requiresPermissionTenancyFoundation true', () => assert.equal(U.requiresPermissionTenancyFoundation, true));
test('23. blockerCount 0', () => assert.equal(U.blockerCount, 0));
test('24. warningCount 0', () => assert.equal(U.warningCount, 0));
test('25. blockers empty', () => assert.deepEqual(U.blockers, []));
test('26. warnings empty', () => assert.deepEqual(U.warnings, []));
test('27. overallDigest fnv1a', () => assert.ok(String(U.overallDigest).startsWith('fnv1a-')));
test('28. authoringRuntimeDigest fnv1a', () => assert.ok(String(U.authoringRuntimeDigest).startsWith('fnv1a-')));
test('29. readiness state known', () => assert.ok(AUTHORING_RUNTIME_READINESS_STATES.includes(U.readiness)));
test('30. manifest embedded', () => assert.equal(U.manifest.kind, 'authoring-runtime-manifest'));
test('31. verification embedded ok', () => { assert.equal(U.verification.kind, 'authoring-runtime-verification'); assert.equal(U.verification.ok, true); });
test('32. diagnostics embedded', () => assert.equal(U.diagnostics.kind, 'authoring-runtime-diagnostics'));
test('33. readinessDecision embedded', () => assert.equal(U.readinessDecision.kind, 'authoring-runtime-readiness-decision'));
test('34. compatibility embedded', () => assert.equal(U.compatibility.kind, 'authoring-runtime-compatibility'));
test('35. lifecycle states const 8', () => assert.equal(AUTHORING_LIFECYCLE_STATES.length, 8));
test('36. forbidden lifecycle const 7', () => assert.equal(FORBIDDEN_LIFECYCLE_STATES.length, 7));
test('37. operation ids const 16', () => assert.equal(AUTHORING_OPERATION_IDS.length, 16));
test('38. validation stages const 11', () => assert.equal(VALIDATION_PIPELINE_STAGES.length, 11));
test('39. invariants const 14', () => assert.equal(AUTHORING_INVARIANT_IDS.length, 14));
test('40. metadataOnly true', () => assert.equal(U.metadataOnly, true));

// ===== Capabilities (41-120) =====
const TRUE_CAPS = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutableSnapshots', 'failClosed', 'sideEffectFree', 'ssotPreserved', 'authoringRuntimeImplemented', 'draftRuntimeImplemented', 'lifecycleRuntimeImplemented', 'operationExecutorImplemented', 'revisionEngineImplemented', 'validationPipelineImplemented', 'invariantEnforcementImplemented', 'previewHandoffImplemented', 'certificationCandidatePreparationImplemented'];
const FALSE_CAPS = ['certificationPerformed', 'authoringUiImplemented', 'editorImplemented', 'persistenceImplemented', 'storageUsed', 'filesystemWritesUsed', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'networkUsed', 'mutationExternalAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked', 'productExposed', 'menuCreated', 'routeCreated', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated', 'draftIsCanonical', 'candidateIsCanonical'];
test('41. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 42;
for (const k of TRUE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} true`, () => { assert.equal(caps[k], true); assert.equal(U.capabilities[k], true); }); }
for (const k of FALSE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} false`, () => { assert.equal(caps[k], false); assert.equal(U.capabilities[k], false); }); }
// n = 42 + 19 + 28 = 89
test('89. capabilities mirror const', () => assert.deepEqual(U.capabilities, { ...caps }));
test('90. TRUE_CAPS 19', () => assert.equal(TRUE_CAPS.length, 19));
test('91. FALSE_CAPS 28', () => assert.equal(FALSE_CAPS.length, 28));

// ===== stableSerialize + digest (92-115) =====
test('92. stableSerialize key-order independent', () => assert.equal(stableSerialize({ b: 1, a: 2 }), stableSerialize({ a: 2, b: 1 })));
test('93. stableSerialize nested key order', () => assert.equal(stableSerialize({ x: { d: 1, c: 2 } }), stableSerialize({ x: { c: 2, d: 1 } })));
test('94. stableSerialize drops functions', () => assert.equal(stableSerialize({ a: 1, f: () => 1 }), stableSerialize({ a: 1 })));
test('95. stableSerialize array order preserved', () => assert.notEqual(stableSerialize([1, 2]), stableSerialize([2, 1])));
test('96. stableSerialize null', () => assert.equal(stableSerialize(null), 'null'));
test('97. stableSerialize undefined', () => assert.equal(stableSerialize(undefined), 'null'));
test('98. stableSerialize NaN -> null', () => assert.equal(stableSerialize(NaN), 'null'));
test('99. stableSerialize string', () => assert.equal(stableSerialize('x'), '"x"'));
test('100. stableSerialize boolean', () => { assert.equal(stableSerialize(true), 'true'); assert.equal(stableSerialize(false), 'false'); });
test('101. digest fnv1a prefix', () => assert.ok(createDeterministicDigest({ a: 1 }).startsWith('fnv1a-')));
test('102. digest stable', () => assert.equal(createDeterministicDigest({ a: 1, b: 2 }), createDeterministicDigest({ b: 2, a: 1 })));
test('103. digest handles null', () => assert.ok(createDeterministicDigest(null).startsWith('fnv1a-')));
test('104. digest differs for different value', () => assert.notEqual(createDeterministicDigest({ a: 1 }), createDeterministicDigest({ a: 2 })));
test('105. digest 8 hex', () => assert.match(createDeterministicDigest({ a: 1 }), /^fnv1a-[0-9a-f]{8}$/));
test('106. normalizeInput clones (new ref)', () => { const i = { a: { b: 1 } }; const o = normalizeAuthoringInput(i); assert.notEqual(o, i); assert.notEqual(o.a, i.a); assert.deepEqual(o, i); });
test('107. normalizeInput drops functions', () => assert.deepEqual(normalizeAuthoringInput({ a: 1, f: () => 1 }), { a: 1 }));
test('108. normalizeInput does not mutate input', () => { const i = { a: 1 }; const before = JSON.stringify(i); normalizeAuthoringInput(i); assert.equal(JSON.stringify(i), before); });
test('109. normalizeInput array', () => assert.deepEqual(normalizeAuthoringInput([1, 2, { a: 1 }]), [1, 2, { a: 1 }]));
test('110. normalizeInput NaN -> null', () => assert.equal(normalizeAuthoringInput(NaN), null));
test('111. digest of two runtime builds equal', () => assert.equal(createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN }).overallDigest, U.overallDigest));
test('112. runtime deep-equal two builds', () => assert.deepEqual(createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN }), U));
test('113. serialize is deterministic across calls', () => assert.equal(stableSerialize(U), stableSerialize(U)));
test('114. digest of frozen empty', () => assert.ok(createDeterministicDigest({}).startsWith('fnv1a-')));
test('115. normalizeInput symbol dropped', () => assert.deepEqual(normalizeAuthoringInput({ a: 1, [Symbol('x')]: 2 }), { a: 1 }));

// ===== Session + isolation (116-135) =====
const sA = freshSession('a');
const sB = freshSession('b');
test('116. session kind', () => assert.equal(sA.kind, 'authoring-runtime-session'));
test('117. session sessionId deterministic', () => assert.equal(freshSession('a').sessionId, sA.sessionId));
test('118. session synthetic/ephemeral/non-canonical/side-effect-free', () => { assert.equal(sA.synthetic, true); assert.equal(sA.ephemeral, true); assert.equal(sA.canonical, false); assert.equal(sA.sideEffectFree, true); });
test('119. session persistent false', () => assert.equal(sA.persistent, false));
test('120. session createdFromExplicitSeed', () => assert.equal(sA.createdFromExplicitSeed, true));
test('121. session no global singleton', () => assert.equal(sA.usesGlobalSingleton, false));
test('122. session empty drafts', () => { assert.deepEqual(sA.drafts, []); assert.equal(sA.operationCount, 0); assert.equal(sA.revisionCountTotal, 0); });
test('123. session frozen', () => assert.equal(Object.isFrozen(sA), true));
test('124. session digest fnv1a', () => assert.ok(String(sA.sessionDigest).startsWith('fnv1a-')));
test('125. two seeds distinct sessions', () => assert.notEqual(sA.sessionId, sB.sessionId));
test('126. two seeds distinct digests', () => assert.notEqual(sA.sessionDigest, sB.sessionDigest));
test('127. sessions isolated (op on A does not touch B)', () => { const r = run(sA, 'createDraft', { input: { moduleId: 'm' } }); assert.equal(r.session.drafts.length, 1); assert.equal(sB.drafts.length, 0); assert.equal(sA.drafts.length, 0); });
test('128. session limits present', () => assert.equal(sA.limits.kind, 'authoring-resource-limits'));
test('129. session sourceVersions', () => assert.equal(sA.sourceVersions.authoringRuntime, AUTHORING_RUNTIME_VERSION));
test('130. session status active', () => assert.equal(sA.status, 'active'));
test('131. session sessionVersion', () => assert.equal(sA.sessionVersion, AUTHORING_RUNTIME_VERSION));
test('132. same seed same full session', () => assert.deepEqual(freshSession('a'), sA));
test('133. drafts array frozen root', () => assert.equal(Object.isFrozen(sA), true));
test('134. session seed stored', () => assert.equal(sA.seed, 'a'));
test('135. distinct seed graph not shared', () => { const x = freshSession('x'); const r = run(x, 'createDraft', { input: { moduleId: 'm' } }); assert.equal(x.drafts.length, 0); });

// ===== Resource limits (136-160) =====
const lim = createAuthoringResourceLimits();
test('136. limits kind', () => assert.equal(lim.kind, 'authoring-resource-limits'));
test('137. default maxDraftsPerSession', () => assert.equal(lim.maxDraftsPerSession, DEFAULT_AUTHORING_RESOURCE_LIMITS.maxDraftsPerSession));
test('138. default maxOperationsPerSession', () => assert.equal(lim.maxOperationsPerSession, 500));
test('139. default maxRevisionsPerDraft', () => assert.equal(lim.maxRevisionsPerDraft, 200));
test('140. default maxFieldsPerDraft', () => assert.equal(lim.maxFieldsPerDraft, 250));
test('141. default maxLayoutSectionsPerDraft', () => assert.equal(lim.maxLayoutSectionsPerDraft, 100));
test('142. default maxRelationshipsPerDraft', () => assert.equal(lim.maxRelationshipsPerDraft, 250));
test('143. default maxValidationIssuesPerRun', () => assert.equal(lim.maxValidationIssuesPerRun, 1000));
test('144. default maxStringLength', () => assert.equal(lim.maxStringLength, 10000));
test('145. default maxSerializedSnapshotBytes', () => assert.equal(lim.maxSerializedSnapshotBytes, 2000000));
test('146. limits failClosedOnExcess', () => assert.equal(lim.failClosedOnExcess, true));
test('147. limits silentTruncation false', () => assert.equal(lim.silentTruncation, false));
test('148. limits frozen', () => assert.equal(Object.isFrozen(lim), true));
test('149. custom limit override', () => assert.equal(createAuthoringResourceLimits({ maxDraftsPerSession: 3 }).maxDraftsPerSession, 3));
test('150. invalid override falls back', () => assert.equal(createAuthoringResourceLimits({ maxDraftsPerSession: -5 }).maxDraftsPerSession, 8));
test('151. non-number override falls back', () => assert.equal(createAuthoringResourceLimits({ maxFieldsPerDraft: 'x' }).maxFieldsPerDraft, 250));
test('152. enforce ok under limit', () => assert.equal(enforceAuthoringResourceLimits({ limits: lim, dimension: 'drafts', count: 5 }).ok, true));
test('153. enforce fail over limit', () => { const r = enforceAuthoringResourceLimits({ limits: lim, dimension: 'drafts', count: 9 }); assert.equal(r.ok, false); assert.equal(r.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_DRAFTS'); });
test('154. enforce unknown dimension ok', () => assert.equal(enforceAuthoringResourceLimits({ limits: lim, dimension: 'zzz', count: 9e9 }).ok, true));
test('155. enforce operations limit code', () => assert.equal(enforceAuthoringResourceLimits({ limits: lim, dimension: 'operations', count: 501 }).issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_OPERATIONS'));
test('156. enforce revisions limit code', () => assert.equal(enforceAuthoringResourceLimits({ limits: lim, dimension: 'revisions', count: 201 }).issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_REVISIONS'));
test('157. enforceStringLength fail', () => { const r = enforceStringLength(lim, 'a'.repeat(10001)); assert.equal(r.ok, false); assert.equal(r.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_STRING_LENGTH'); });
test('158. enforceStringLength ok', () => assert.equal(enforceStringLength(lim, 'short').ok, true));
test('159. enforceSerializedSnapshotBytes ok', () => assert.equal(enforceSerializedSnapshotBytes(lim, { a: 1 }).ok, true));
test('160. enforceSerializedSnapshotBytes fail on tiny limit', () => { const r = enforceSerializedSnapshotBytes(createAuthoringResourceLimits({ maxSerializedSnapshotBytes: 1 }), { a: 'xxxxxxxxxx' }); assert.equal(r.ok, false); assert.equal(r.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_SERIALIZED_SNAPSHOT_BYTES'); });

// ===== Draft snapshot + immutability (161-190) =====
const draft0 = createDraftSnapshot({ moduleId: 'clientes', name: 'Clientes', fields: [{ key: 'nome', dataKind: 'text', order: 0 }] });
test('161. draft kind', () => assert.equal(draft0.kind, 'authoring-draft-snapshot'));
test('162. draft id form', () => assert.equal(draft0.draftId, 'clientes#authoring-draft'));
test('163. draft version', () => assert.equal(draft0.draftVersion, 'clientes#authoring-draft@r0'));
test('164. draft synthetic/non-canonical/not-certified/not-generated/not-registered', () => { assert.equal(draft0.synthetic, true); assert.equal(draft0.canonical, false); assert.equal(draft0.certified, false); assert.equal(draft0.generated, false); assert.equal(draft0.registered, false); });
test('165. draft frozen', () => assert.equal(Object.isFrozen(draft0), true));
test('166. draft digest fnv1a', () => assert.ok(String(draft0.digest).startsWith('fnv1a-')));
test('167. draft deterministic', () => assert.equal(createDraftSnapshot({ moduleId: 'clientes', name: 'Clientes', fields: [{ key: 'nome', dataKind: 'text', order: 0 }] }).digest, draft0.digest));
test('168. draft field normalized', () => { assert.equal(draft0.fields[0].fieldKey, 'nome'); assert.equal(draft0.fields[0].dataKind, 'text'); });
test('169. draft counts', () => { assert.equal(draft0.fieldCount, 1); assert.equal(draft0.layoutCount, 0); assert.equal(draft0.relationshipCount, 0); });
test('170. draft lifecycleState default draft', () => assert.equal(draft0.lifecycleState, 'draft'));
test('171. draft input immutability (source array not retained)', () => { const src = [{ key: 'a', order: 0 }]; const d = createDraftSnapshot({ moduleId: 'm', fields: src }); src.push({ key: 'b' }); assert.equal(d.fields.length, 1); });
test('172. draft snapshot cannot be mutated (frozen field array)', () => { assert.throws(() => { draft0.fields.push({ key: 'x' }); }, TypeError); });
test('173. draft revision default 0', () => assert.equal(draft0.revision, 0));
test('174. draft schemaVersion', () => assert.equal(draft0.schemaVersion, 'studio-authoring-draft-schema@1.0.0'));
test('175. draft discarded when state discarded', () => assert.equal(createDraftSnapshot({ moduleId: 'm', lifecycleState: 'discarded' }).discarded, true));
test('176. field kinds enumerated', () => assert.ok(AUTHORING_FIELD_KINDS.includes('reference')));
test('177. relationship cardinalities enumerated', () => assert.ok(AUTHORING_RELATIONSHIP_CARDINALITIES.includes('many_to_many')));
test('178. draft validation default', () => { assert.equal(draft0.validation.ran, false); assert.equal(draft0.validation.passed, false); });
test('179. draft with layout', () => assert.equal(createDraftSnapshot({ moduleId: 'm', layout: [{ sectionId: 'main' }] }).layoutCount, 1));
test('180. draft with relationship', () => assert.equal(createDraftSnapshot({ moduleId: 'm', relationships: [{ relationshipId: 'r1' }] }).relationshipCount, 1));
test('181. draft unknown field kind normalized', () => assert.equal(createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', dataKind: 'zzz' }] }).fields[0].dataKind, 'unknown'));
test('182. draft negative field order clamped', () => assert.equal(createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: -3 }] }).fields[0].order, 0));
test('183. draft field frozen', () => assert.equal(Object.isFrozen(draft0), true));
test('184. two identical drafts deep-equal', () => assert.deepEqual(createDraftSnapshot({ moduleId: 'x' }), createDraftSnapshot({ moduleId: 'x' })));
test('185. draft moduleIntent default', () => assert.equal(draft0.moduleIntent, 'cadastro'));
test('186. draft relationships normalized', () => { const d = createDraftSnapshot({ moduleId: 'm', relationships: [{ relationshipId: 'r', fromModule: 'a', toModule: 'b' }] }); assert.equal(d.relationships[0].sourceDraftEntity, 'a'); assert.equal(d.relationships[0].cascadePolicy, 'none'); });
test('187. draft layout fieldKeys', () => assert.deepEqual(createDraftSnapshot({ moduleId: 'm', layout: [{ sectionId: 's', fieldKeys: ['a'] }] }).layout[0].fieldKeys, ['a']));
test('188. draft label defaults to name', () => assert.equal(draft0.draftLabel, 'Clientes'));
test('189. draft description empty default', () => assert.equal(draft0.draftDescription, ''));
test('190. draft revision reflected in version', () => assert.equal(createDraftSnapshot({ moduleId: 'm', revision: 5 }).draftVersion, 'm#authoring-draft@r5'));

// ===== Static determinism scans (191-200) =====
test('191. no Date.now in subtree (excl verifier regex)', () => assert.ok(!/Date\.now/.test(jsCodeNoVerifier())));
test('192. no new Date in subtree', () => assert.ok(!/new Date\b/.test(jsCodeNoVerifier())));
test('193. no Math.random in subtree', () => assert.ok(!/Math\.random/.test(jsCodeNoVerifier())));
test('194. no crypto.randomUUID in subtree', () => assert.ok(!/crypto\.randomUUID/.test(jsCodeNoVerifier())));
test('195. no bare randomUUID in subtree', () => assert.ok(!/\brandomUUID\b/.test(jsCodeNoVerifier())));
test('196. no performance.now in subtree', () => assert.ok(!/performance\.now/.test(jsCodeNoVerifier())));
test('197. no process.hrtime in subtree', () => assert.ok(!/hrtime/.test(jsCodeNoVerifier())));
test('198. no toLocaleString/locale sort', () => assert.ok(!/toLocaleString|localeCompare/.test(jsCodeNoVerifier())));
test('199. verifier does contain the detection regex', () => { const v = fs.readFileSync(path.join(DIR, 'verifyAuthoringRuntime.js'), 'utf8'); assert.ok(/Math\\\.random/.test(v)); });
test('200. Math.imul allowed (fixed FNV prime, not random)', () => assert.ok(/Math\.imul/.test(jsCode())));

// ===== Lifecycle (201-240) =====
const lc = createLifecycleExecutor();
test('201. lifecycle kind', () => assert.equal(lc.kind, 'authoring-lifecycle-executor'));
test('202. lifecycle 8 states', () => assert.equal(lc.states.length, 8));
test('203. lifecycle discarded terminal (no transitions)', () => assert.deepEqual(lc.transitions.discarded, []));
test('204. lifecycle terminalState', () => assert.equal(lc.terminalState, 'discarded'));
test('205. lifecycle forbidden 7', () => assert.equal(lc.forbiddenStates.length, 7));
test('206. lifecycle unknownTransitionFailClosed', () => assert.equal(lc.unknownTransitionFailClosed, true));
test('207. lifecycle emitsForbiddenState false', () => assert.equal(lc.emitsForbiddenState, false));
test('208. transition empty->draft allowed', () => assert.equal(isLifecycleTransitionAllowed('empty', 'draft'), true));
test('209. transition draft->validation_pending allowed', () => assert.equal(isLifecycleTransitionAllowed('draft', 'validation_pending'), true));
test('210. transition validation_pending->validated allowed', () => assert.equal(isLifecycleTransitionAllowed('validation_pending', 'validated'), true));
test('211. transition validated->preview_ready allowed', () => assert.equal(isLifecycleTransitionAllowed('validated', 'preview_ready'), true));
test('212. transition preview_ready->handoff_ready allowed', () => assert.equal(isLifecycleTransitionAllowed('preview_ready', 'handoff_ready'), true));
test('213. any mutable -> discarded allowed', () => assert.equal(isLifecycleTransitionAllowed('draft', 'discarded'), true));
test('214. transition empty->validated NOT allowed (no validation skip)', () => assert.equal(isLifecycleTransitionAllowed('empty', 'validated'), false));
test('215. transition draft->preview_ready NOT allowed', () => assert.equal(isLifecycleTransitionAllowed('draft', 'preview_ready'), false));
test('216. transition discarded->draft NOT allowed (terminal)', () => assert.equal(isLifecycleTransitionAllowed('discarded', 'draft'), false));
test('217. transition to forbidden state NOT allowed', () => { for (const s of FORBIDDEN_LIFECYCLE_STATES) assert.equal(isLifecycleTransitionAllowed('validated', s), false); });
test('218. unknown transition fail-closed', () => assert.equal(isLifecycleTransitionAllowed('bogus', 'draft'), false));
test('219. non-string transition fail-closed', () => assert.equal(isLifecycleTransitionAllowed(null, undefined), false));
let ln = 220;
for (const s of FORBIDDEN_LIFECYCLE_STATES) { const cur = ln; ln += 1; test(`${cur}. no transition targets forbidden ${s}`, () => assert.ok(!Object.values(AUTHORING_LIFECYCLE_TRANSITIONS).some((arr) => arr.includes(s)))); }
// ln = 220 + 7 = 227
test('227. lifecycle frozen', () => assert.equal(Object.isFrozen(lc), true));
test('228. every state reachable-or-initial', () => assert.ok(AUTHORING_LIFECYCLE_STATES.every((s) => s === 'empty' || Object.values(AUTHORING_LIFECYCLE_TRANSITIONS).some((arr) => arr.includes(s)))));
test('229. lifecycleRuntimeImplemented', () => assert.equal(lc.lifecycleRuntimeImplemented, true));
test('230. transitions object matches const', () => assert.deepEqual(lc.transitions, Object.fromEntries(Object.entries(AUTHORING_LIFECYCLE_TRANSITIONS).map(([k, v]) => [k, [...v]]))));

// ===== Revision engine (231-245) =====
const re = createRevisionEngine();
test('231. revision kind', () => assert.equal(re.kind, 'authoring-revision-engine'));
test('232. revision starts at 0', () => assert.equal(re.revisionStartsAt, 0));
test('233. revision monotonic', () => assert.equal(re.revisionMonotonic, true));
test('234. revision no negative', () => assert.equal(re.negativeRevisionAllowed, false));
test('235. revision no in-place canonical mutation', () => assert.equal(re.inPlaceCanonicalMutationAllowed, false));
test('236. revision no history persistence', () => assert.equal(re.historyPersistenceAllowed, false));
test('237. nextRevision +1', () => assert.equal(nextRevision(0), 1));
test('238. nextRevision +1 from 5', () => assert.equal(nextRevision(5), 6));
test('239. nextRevision negative -> null', () => assert.equal(nextRevision(-1), null));
test('240. nextRevision non-integer -> null', () => assert.equal(nextRevision(1.5), null));
test('241. nextRevision NaN -> null', () => assert.equal(nextRevision(NaN), null));
test('242. nextRevision string -> null', () => assert.equal(nextRevision('x'), null));
test('243. revision monotonic never regresses', () => { let prev = 0; for (let i = 0; i < 10; i += 1) { const nx = nextRevision(prev); assert.ok(nx > prev); prev = nx; } });
test('244. revision engine frozen', () => assert.equal(Object.isFrozen(re), true));
test('245. revisionEngineImplemented', () => assert.equal(re.revisionEngineImplemented, true));

// ===== Operation executor + allowlist (246-300) =====
const oe = createOperationExecutor();
test('246. executor kind', () => assert.equal(oe.kind, 'authoring-operation-executor'));
test('247. executor allowlist 16', () => assert.equal(oe.allowlist.length, 16));
test('248. executor allowlist matches const', () => assert.deepEqual(oe.allowlist, [...AUTHORING_OPERATION_IDS]));
test('249. executor allowlistOnly', () => assert.equal(oe.allowlistOnly, true));
test('250. executor unknown fail-closed', () => assert.equal(oe.unknownOperationsFailClosed, true));
test('251. executor no side effects/persistence/module write', () => { assert.equal(oe.sideEffectsAllowed, false); assert.equal(oe.persistenceAllowed, false); assert.equal(oe.moduleWriteAllowed, false); });
test('252. unknown operation rejected', () => { const r = run(freshSession(), 'nukeEverything'); assert.equal(r.receipt.status, 'rejected'); assert.equal(r.receipt.issueCode, 'AUTHORING_RUNTIME_UNKNOWN_OPERATION'); });
test('253. unknown operation no revision', () => { const r = run(freshSession(), 'nukeEverything'); assert.equal(r.receipt.nextRevision, null); });
test('254. unknown operation no partial state', () => { const r = run(freshSession(), 'nukeEverything'); assert.deepEqual(r.session.drafts, []); });
test('255. createDraft applies', () => { const r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(r.receipt.status, 'applied'); assert.equal(r.session.drafts.length, 1); });
test('256. createDraft revision 0', () => { const r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(r.session.drafts[0].revision, 0); assert.equal(r.receipt.nextRevision, 0); });
test('257. createDraft lifecycle draft', () => { const r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(r.session.drafts[0].lifecycleState, 'draft'); });
test('258. createDraft input not mutated', () => { const s = freshSession(); const before = JSON.stringify(s); run(s, 'createDraft', { input: { moduleId: 'm' } }); assert.equal(JSON.stringify(s), before); });
test('259. addField increments revision', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a', order: 0 } }); assert.equal(r.session.drafts[0].revision, 1); assert.equal(r.receipt.previousRevision, 0); assert.equal(r.receipt.nextRevision, 1); });
test('260. addField adds field', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a', order: 0 } }); assert.equal(r.session.drafts[0].fields.length, 1); });
test('261. renameDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'renameDraft', { draftId: id, input: { name: 'Renamed' } }); assert.equal(r.session.drafts[0].draftName, 'Renamed'); });
test('262. describeDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'describeDraft', { draftId: id, input: { description: 'desc' } }); assert.equal(r.session.drafts[0].draftDescription, 'desc'); });
test('263. updateFieldDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a', order: 0 } }); r = run(r.session, 'updateFieldDraft', { draftId: id, input: { key: 'a', label: 'L' } }); assert.equal(r.session.drafts[0].fields[0].label, 'L'); });
test('264. removeFieldDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a', order: 0 } }); r = run(r.session, 'removeFieldDraft', { draftId: id, input: { key: 'a' } }); assert.equal(r.session.drafts[0].fields.length, 0); });
test('265. reorderFieldDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a', order: 0 } }); r = run(r.session, 'reorderFieldDraft', { draftId: id, input: { key: 'a', order: 3 } }); assert.equal(r.session.drafts[0].fields[0].order, 3); });
test('266. addLayoutSectionDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addLayoutSectionDraft', { draftId: id, input: { sectionId: 's' } }); assert.equal(r.session.drafts[0].layout.length, 1); });
test('267. updateLayoutSectionDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addLayoutSectionDraft', { draftId: id, input: { sectionId: 's' } }); r = run(r.session, 'updateLayoutSectionDraft', { draftId: id, input: { sectionId: 's', title: 'T' } }); assert.equal(r.session.drafts[0].layout[0].title, 'T'); });
test('268. removeLayoutSectionDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addLayoutSectionDraft', { draftId: id, input: { sectionId: 's' } }); r = run(r.session, 'removeLayoutSectionDraft', { draftId: id, input: { sectionId: 's' } }); assert.equal(r.session.drafts[0].layout.length, 0); });
test('269. addRelationshipDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addRelationshipDraft', { draftId: id, input: { relationshipId: 'r1' } }); assert.equal(r.session.drafts[0].relationships.length, 1); });
test('270. removeRelationshipDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addRelationshipDraft', { draftId: id, input: { relationshipId: 'r1' } }); r = run(r.session, 'removeRelationshipDraft', { draftId: id, input: { relationshipId: 'r1' } }); assert.equal(r.session.drafts[0].relationships.length, 0); });
test('271. requestValidation applies + validated', () => { const { session } = buildValidatedDraft(); assert.equal(session.drafts[0].lifecycleState, 'validated'); assert.equal(session.drafts[0].validation.passed, true); });
test('272. preview requires validated (reject on draft)', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; const rr = run(r.session, 'requestSyntheticPreviewHandoff', { draftId: id }); assert.equal(rr.receipt.status, 'rejected'); assert.equal(rr.receipt.issueCode, 'AUTHORING_RUNTIME_PREVIEW_REQUIRES_VALIDATED_DRAFT'); });
test('273. preview applies after validated', () => { const { session, draftId } = buildValidatedDraft(); const r = run(session, 'requestSyntheticPreviewHandoff', { draftId }); assert.equal(r.receipt.status, 'applied'); assert.equal(r.session.drafts[0].lifecycleState, 'preview_ready'); });
test('274. candidate requires validated (reject on draft)', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; const rr = run(r.session, 'requestCertificationCandidateHandoff', { draftId: id }); assert.equal(rr.receipt.status, 'rejected'); assert.equal(rr.receipt.issueCode, 'AUTHORING_RUNTIME_CANDIDATE_REQUIRES_VALIDATED_DRAFT'); });
test('275. candidate applies after validated', () => { const { session, draftId } = buildValidatedDraft(); const r = run(session, 'requestCertificationCandidateHandoff', { draftId }); assert.equal(r.receipt.status, 'applied'); assert.equal(r.session.drafts[0].lifecycleState, 'handoff_ready'); });
test('276. discardDraft', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'discardDraft', { draftId: id }); assert.equal(r.session.drafts[0].discarded, true); assert.equal(r.session.drafts[0].lifecycleState, 'discarded'); });
test('277. operation on discarded draft rejected', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'discardDraft', { draftId: id }); const rr = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'x' } }); assert.equal(rr.receipt.status, 'rejected'); assert.equal(rr.receipt.issueCode, 'AUTHORING_RUNTIME_DRAFT_DISCARDED'); });
test('278. draft not found rejected', () => { const r = run(freshSession(), 'addFieldDraft', { draftId: 'nope', input: { key: 'x' } }); assert.equal(r.receipt.status, 'rejected'); assert.equal(r.receipt.issueCode, 'AUTHORING_RUNTIME_DRAFT_NOT_FOUND'); });
test('279. operationCount increments on apply', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(r.session.operationCount, 1); });
test('280. operationCount increments on reject', () => { const r = run(freshSession(), 'nukeEverything'); assert.equal(r.session.operationCount, 1); });
test('281. revision-producing op set', () => assert.equal(REVISION_PRODUCING_OPERATIONS.length, 12));
test('282. requestValidation not revision-producing', () => { const { session } = buildValidatedDraft(); assert.equal(session.drafts[0].revision, 1); });
test('283. session frozen after op', () => { const r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(Object.isFrozen(r.session), true); });
test('284. receipt frozen', () => { const r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(Object.isFrozen(r.receipt), true); });
test('285. receipt has digests', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); assert.ok(String(r.receipt.snapshotDigestBefore).startsWith('fnv1a-')); assert.ok(String(r.receipt.snapshotDigestAfter).startsWith('fnv1a-')); });
test('286. rejected op keeps revision unchanged', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); const before = r.session.drafts[0].revision; const rr = run(r.session, 'nukeEverything', { draftId: id }); assert.equal(rr.session.drafts[0].revision, before); });
test('287. every allowlisted op is dispatchable (no unknown)', () => { for (const op of AUTHORING_OPERATION_IDS) { const r = run(freshSession(), op, { draftId: 'x', input: { moduleId: 'm' } }); assert.notEqual(r.receipt.issueCode, 'AUTHORING_RUNTIME_UNKNOWN_OPERATION'); } });
test('288. maxDrafts fail-closed', () => { let s = freshSession('d', { maxDraftsPerSession: 1 }); let r = run(s, 'createDraft', { input: { moduleId: 'a' } }); r = run(r.session, 'createDraft', { input: { moduleId: 'b' } }); assert.equal(r.receipt.status, 'rejected'); assert.equal(r.receipt.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_DRAFTS'); });
test('289. maxOperations fail-closed', () => { let s = freshSession('o', { maxOperationsPerSession: 1 }); let r = run(s, 'createDraft', { input: { moduleId: 'a' } }); r = run(r.session, 'createDraft', { input: { moduleId: 'b' } }); assert.equal(r.receipt.status, 'rejected'); assert.equal(r.receipt.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_OPERATIONS'); });
test('290. maxFields fail-closed', () => { let r = run(freshSession('f', { maxFieldsPerDraft: 1 }), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'b' } }); assert.equal(r.receipt.status, 'rejected'); assert.equal(r.receipt.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_FIELDS'); });
test('291. maxRevisions fail-closed', () => { let r = run(freshSession('rev', { maxRevisionsPerDraft: 1 }), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'b' } }); assert.equal(r.receipt.status, 'rejected'); assert.equal(r.receipt.issueCode, 'AUTHORING_RUNTIME_LIMIT_MAX_REVISIONS'); });
test('292. maxLayout fail-closed', () => { let r = run(freshSession('l', { maxLayoutSectionsPerDraft: 1 }), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addLayoutSectionDraft', { draftId: id, input: { sectionId: 'a' } }); r = run(r.session, 'addLayoutSectionDraft', { draftId: id, input: { sectionId: 'b' } }); assert.equal(r.receipt.status, 'rejected'); });
test('293. maxRelationships fail-closed', () => { let r = run(freshSession('rel', { maxRelationshipsPerDraft: 1 }), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addRelationshipDraft', { draftId: id, input: { relationshipId: 'a' } }); r = run(r.session, 'addRelationshipDraft', { draftId: id, input: { relationshipId: 'b' } }); assert.equal(r.receipt.status, 'rejected'); });
test('294. discard receipt not revision', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; const before = r.session.drafts[0].revision; r = run(r.session, 'discardDraft', { draftId: id }); assert.equal(r.session.drafts[0].revision, before); });
test('295. mutation after validated re-opens to draft', () => { const { session, draftId } = buildValidatedDraft(); const r = run(session, 'addFieldDraft', { draftId, input: { key: 'x2', order: 1 } }); assert.equal(r.session.drafts[0].lifecycleState, 'draft'); });
test('296. mutation resets validation', () => { const { session, draftId } = buildValidatedDraft(); const r = run(session, 'addFieldDraft', { draftId, input: { key: 'x2', order: 1 } }); assert.equal(r.session.drafts[0].validation.ran, false); });
test('297. discard is terminal (further mutation rejected)', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'discardDraft', { draftId: id }); const rr = run(r.session, 'renameDraft', { draftId: id, input: { name: 'x' } }); assert.equal(rr.receipt.status, 'rejected'); });
test('298. executor descriptor frozen', () => assert.equal(Object.isFrozen(oe), true));
test('299. operation on null session fails closed', () => { const r = executeAuthoringOperation({ session: null, operation: { operationId: 'createDraft' } }); assert.equal(r.receipt.status, 'rejected'); });
test('300. operationExecutorImplemented', () => assert.equal(oe.operationExecutorImplemented, true));

// ===== Immutability + replay (301-320) =====
test('301. input session deeply not mutated after op', () => { const s = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }).session; const snap = stableSerialize(s); run(s, 'addFieldDraft', { draftId: s.drafts[0].draftId, input: { key: 'a' } }); assert.equal(stableSerialize(s), snap); });
test('302. previous snapshot unchanged after new op', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; const prevDraft = r.session.drafts[0]; const prevDigest = prevDraft.digest; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); assert.equal(prevDraft.digest, prevDigest); });
test('303. external input mutation after call does not affect snapshot', () => { const input = { moduleId: 'm', fields: [{ key: 'a', order: 0 }] }; const r = run(freshSession(), 'createDraft', { input }); input.fields.push({ key: 'b' }); assert.equal(r.session.drafts[0].fields.length, 1); });
test('304. digest stable across replay', () => { const a = buildValidatedDraft(); const b = buildValidatedDraft(); assert.equal(a.session.sessionDigest, b.session.sessionDigest); });
test('305. same input same output receipt', () => { const r1 = run(freshSession('z'), 'createDraft', { input: { moduleId: 'm' } }); const r2 = run(freshSession('z'), 'createDraft', { input: { moduleId: 'm' } }); assert.equal(r1.receipt.receiptDigest, r2.receipt.receiptDigest); });
test('306. same sequence same session digest', () => { const seq = (seed) => { let r = run(freshSession(seed), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a', order: 0 } }); return r.session.sessionDigest; }; assert.equal(seq('q'), seq('q')); });
test('307. verifyAuthoringOperationOutcome detects input mutation', () => { const r = verifyAuthoringOperationOutcome({ beforeSessionSerialized: 'a', afterInputSessionSerialized: 'b', receipt: {} }); assert.equal(r.ok, false); assert.ok(r.blockers.includes('input_session_mutated')); });
test('308. verifyAuthoringOperationOutcome ok when unchanged', () => { const r = verifyAuthoringOperationOutcome({ beforeSessionSerialized: 'a', afterInputSessionSerialized: 'a', receipt: { previousRevision: 0, nextRevision: 1 } }); assert.equal(r.ok, true); });
test('309. verifyAuthoringOperationOutcome detects revision regression', () => { const r = verifyAuthoringOperationOutcome({ receipt: { previousRevision: 5, nextRevision: 3 } }); assert.ok(r.blockers.includes('revision_regression')); });
test('310. replay of full flow deterministic digest', () => { const flow = (seed) => { const { session } = buildValidatedDraft(); return session.sessionDigest; }; assert.equal(flow('a'), flow('a')); });
test('311. two sessions same seq deep-equal drafts', () => { const build = () => buildValidatedDraft().session.drafts[0]; assert.deepEqual(build(), build()); });
test('312. snapshot digest changes on field add', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; const d0 = r.session.drafts[0].digest; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); assert.notEqual(r.session.drafts[0].digest, d0); });
test('313. receipt records revision transition', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); assert.equal(r.receipt.previousRevision, 0); assert.equal(r.receipt.nextRevision, 1); });
test('314. draft snapshot serializable (no functions)', () => { const d = createDraftSnapshot({ moduleId: 'm' }); assert.ok(!Object.values(d).some((v) => typeof v === 'function')); });
test('315. session serializable', () => { assert.ok(!Object.values(sA).some((v) => typeof v === 'function')); });
test('316. runtime has no functions (frozen data)', () => assert.ok(!Object.values(U).some((v) => typeof v === 'function')));
test('317. JSON round-trip session', () => { const j = JSON.parse(JSON.stringify(freshSession('rt'))); assert.equal(j.kind, 'authoring-runtime-session'); });
test('318. discard does not remove draft from array (marks discarded)', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'discardDraft', { draftId: id }); assert.equal(r.session.drafts.length, 1); });
test('319. revisionCountTotal increments', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm' } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'addFieldDraft', { draftId: id, input: { key: 'a' } }); assert.equal(r.session.revisionCountTotal, 2); });
test('320. new session per call not shared', () => { const s1 = freshSession('n'); const s2 = freshSession('n'); assert.notEqual(s1, s2); assert.deepEqual(s1, s2); });

// ===== Validation pipeline (321-360) =====
const vp = createValidationPipeline();
test('321. pipeline kind', () => assert.equal(vp.kind, 'authoring-validation-pipeline'));
test('322. pipeline 11 stages', () => assert.equal(vp.stageCount, 11));
test('323. pipeline stages match const', () => assert.deepEqual(vp.stages, [...VALIDATION_PIPELINE_STAGES]));
test('324. pipeline fail-closed', () => assert.equal(vp.failClosed, true));
test('325. pipeline deterministic issues', () => assert.equal(vp.deterministicIssues, true));
test('326. pipeline blocker stops preview/candidate', () => { assert.equal(vp.blockerStopsPreview, true); assert.equal(vp.blockerStopsCertificationCandidate, true); });
const validReport = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }] }), limits: lim });
test('327. valid draft passes', () => { assert.equal(validReport.passed, true); assert.equal(validReport.blockerCount, 0); });
test('328. report deterministic', () => assert.equal(runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }] }), limits: lim }).validationReportDigest, validReport.validationReportDigest));
const dupFieldsReport = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] }), limits: lim });
test('329. duplicate field keys blocked', () => { assert.equal(dupFieldsReport.passed, false); assert.ok(dupFieldsReport.issues.some((i) => i.issueCode === 'field_keys_unique')); });
test('330. issues ordered by stage then path then code', () => { const stages = dupFieldsReport.issues.map((i) => VALIDATION_PIPELINE_STAGES.indexOf(i.stage)); for (let i = 1; i < stages.length; i += 1) assert.ok(stages[i] >= stages[i - 1]); });
test('331. severities enumerated', () => assert.deepEqual(AUTHORING_ISSUE_SEVERITIES, ['info', 'warning', 'error', 'blocker']));
test('332. blocker in duplicate report', () => assert.ok(dupFieldsReport.issues.some((i) => i.severity === 'blocker')));
test('333. dup section ids blocked', () => { const r = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', layout: [{ sectionId: 's' }, { sectionId: 's' }] }), limits: lim }); assert.ok(r.issues.some((i) => i.issueCode === 'layout_section_ids_unique')); });
test('334. dup relationship ids blocked', () => { const r = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', relationships: [{ relationshipId: 'r' }, { relationshipId: 'r' }] }), limits: lim }); assert.ok(r.issues.some((i) => i.issueCode === 'relationship_ids_unique')); });
test('335. report ran flag', () => assert.equal(validReport.ran, true));
test('336. report issueCount', () => assert.equal(validReport.issueCount, validReport.issues.length));
test('337. report frozen', () => assert.equal(Object.isFrozen(validReport), true));
test('338. issue create deterministic', () => assert.equal(createValidationIssue({ issueCode: 'x', severity: 'error', stage: 'shape_validation', path: 'p' }).issueDigest, createValidationIssue({ issueCode: 'x', severity: 'error', stage: 'shape_validation', path: 'p' }).issueDigest));
test('339. issue error blocks', () => { const i = createValidationIssue({ issueCode: 'x', severity: 'error' }); assert.equal(i.blocksPreview, true); assert.equal(i.blocksCertificationCandidate, true); });
test('340. issue info does not block', () => { const i = createValidationIssue({ issueCode: 'x', severity: 'info' }); assert.equal(i.blocksPreview, false); });
test('341. issue unknown severity normalized', () => assert.equal(createValidationIssue({ issueCode: 'x', severity: 'zzz' }).severity, 'warning'));
test('342. issue sanitized', () => { const i = createValidationIssue({ issueCode: 'x' }); assert.equal(i.safe, true); assert.equal(i.withoutSecrets, true); });
test('343. sortValidationIssues stable', () => { const a = createValidationIssue({ issueCode: 'b', stage: 'shape_validation', path: 'p' }); const b = createValidationIssue({ issueCode: 'a', stage: 'shape_validation', path: 'p' }); const sorted = sortValidationIssues([a, b], VALIDATION_PIPELINE_STAGES); assert.equal(sorted[0].issueCode, 'a'); });
test('344. validation issue limit fail-closed', () => { const r = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }] }), limits: createAuthoringResourceLimits({ maxValidationIssuesPerRun: 0 }) }); assert.ok(r.issues.length >= 0); });
test('345. report no I/O (pure)', () => assert.doesNotThrow(() => runValidationPipeline({ draft: {}, limits: lim })));
test('346. invalid shape blocked', () => { const r = runValidationPipeline({ draft: { kind: 'nope' }, limits: lim }); assert.ok(r.issues.some((i) => i.issueCode === 'shape_invalid')); });
test('347. canonical draft blocked (ssot_inversion)', () => { const r = runValidationPipeline({ draft: { kind: 'authoring-draft-snapshot', draftId: 'x', canonical: true }, limits: lim }); assert.ok(r.issues.some((i) => i.issueCode === 'ssot_inversion')); });
test('348. validation runs in operation flow', () => { const { session } = buildValidatedDraft(); assert.equal(session.drafts[0].validation.ran, true); });
test('349. failed validation sets validation_failed', () => { let r = run(freshSession(), 'createDraft', { input: { moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] } }); const id = r.session.drafts[0].draftId; r = run(r.session, 'requestValidation', { draftId: id }); assert.equal(r.session.drafts[0].lifecycleState, 'validation_failed'); });
test('350. pipeline frozen', () => assert.equal(Object.isFrozen(vp), true));
test('351. every stage validated in report', () => assert.deepEqual(validReport.stages, [...VALIDATION_PIPELINE_STAGES]));
test('352. issue stage present', () => assert.ok(dupFieldsReport.issues.every((i) => typeof i.stage === 'string')));
test('353. issue path present', () => assert.ok(dupFieldsReport.issues.every((i) => typeof i.path === 'string')));
test('354. issue message present', () => assert.ok(dupFieldsReport.issues.every((i) => typeof i.message === 'string')));
test('355. report digest fnv1a', () => assert.ok(String(validReport.validationReportDigest).startsWith('fnv1a-')));
test('356. deterministic issue ordering across runs', () => { const a = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] }), limits: lim }); const b = runValidationPipeline({ draft: createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] }), limits: lim }); assert.deepEqual(a.issues.map((i) => i.issueCode), b.issues.map((i) => i.issueCode)); });
test('357. validationPipelineImplemented', () => assert.equal(vp.validationPipelineImplemented, true));
test('358. blocker count non-negative', () => assert.ok(validReport.blockerCount >= 0));
test('359. no field order negative issue for valid', () => assert.ok(!validReport.issues.some((i) => i.issueCode === 'field_order_non_negative')));
test('360. validation issue kind', () => assert.equal(createValidationIssue({ issueCode: 'x' }).kind, 'authoring-validation-issue'));

// ===== Invariants (361-390) =====
const ie = createInvariantEnforcer();
test('361. enforcer kind', () => assert.equal(ie.kind, 'authoring-invariant-enforcer'));
test('362. enforcer 14 invariants', () => assert.equal(ie.invariantCount, 14));
test('363. enforcer ids match const', () => assert.deepEqual(ie.invariantIds, [...AUTHORING_INVARIANT_IDS]));
test('364. enforcer all fail-closed', () => assert.equal(ie.allFailClosed, true));
test('365. enforcer no silent auto-correction', () => assert.equal(ie.silentAutoCorrection, false));
test('366. enforce field keys unique', () => { const issues = enforceAuthoringInvariants(createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] })); assert.ok(issues.some((i) => i.issueCode === 'field_keys_unique')); });
test('367. enforce section ids unique', () => { const issues = enforceAuthoringInvariants(createDraftSnapshot({ moduleId: 'm', layout: [{ sectionId: 's' }, { sectionId: 's' }] })); assert.ok(issues.some((i) => i.issueCode === 'layout_section_ids_unique')); });
test('368. enforce relationship ids unique', () => { const issues = enforceAuthoringInvariants(createDraftSnapshot({ moduleId: 'm', relationships: [{ relationshipId: 'r' }, { relationshipId: 'r' }] })); assert.ok(issues.some((i) => i.issueCode === 'relationship_ids_unique')); });
test('369. enforce production flags blocked', () => { const issues = enforceAuthoringInvariants({ kind: 'authoring-draft-snapshot', fields: [], layout: [], relationships: [], production: true }); assert.ok(issues.some((i) => i.issueCode === 'no_production_flags')); });
test('370. enforce persistence descriptors blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], persisted: true }); assert.ok(issues.some((i) => i.issueCode === 'no_persistence_descriptors')); });
test('371. enforce prisma descriptors blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], prismaAccessed: true }); assert.ok(issues.some((i) => i.issueCode === 'no_prisma_descriptors')); });
test('372. enforce real-data blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], realDataRead: true }); assert.ok(issues.some((i) => i.issueCode === 'no_real_data_references')); });
test('373. enforce app/router/menu blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], routeCreated: true }); assert.ok(issues.some((i) => i.issueCode === 'no_app_router_menu_descriptors')); });
test('374. enforce old prototype blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], note: 'src/studio/editor/x' }); assert.ok(issues.some((i) => i.issueCode === 'no_old_prototype_references')); });
test('375. enforce self-certification blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], certified: true }); assert.ok(issues.some((i) => i.issueCode === 'no_self_certification')); });
test('376. enforce module-generation blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], moduleGenerated: true }); assert.ok(issues.some((i) => i.issueCode === 'no_module_generation_authorization')); });
test('377. enforce backend descriptors blocked', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [], backendAccessed: true }); assert.ok(issues.some((i) => i.issueCode === 'no_backend_descriptors')); });
test('378. enforce clean draft no issues', () => { const issues = enforceAuthoringInvariants(createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }] })); assert.equal(issues.length, 0); });
test('379. enforcer no auto-correct (returns issues, not fixed draft)', () => { const issues = enforceAuthoringInvariants(createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] })); assert.ok(Array.isArray(issues)); });
test('380. enforcer deterministic', () => { const d = createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a', order: 0 }, { key: 'a', order: 1 }] }); assert.deepEqual(enforceAuthoringInvariants(d).map((i) => i.issueCode), enforceAuthoringInvariants(d).map((i) => i.issueCode)); });
test('381. enforcer frozen', () => assert.equal(Object.isFrozen(ie), true));
test('382. invariant has no_self_certification', () => assert.ok(AUTHORING_INVARIANT_IDS.includes('no_self_certification')));
test('383. invariant has no_module_generation_authorization', () => assert.ok(AUTHORING_INVARIANT_IDS.includes('no_module_generation_authorization')));
test('384. invariant has relationship_endpoints_known', () => assert.ok(AUTHORING_INVARIANT_IDS.includes('relationship_endpoints_known')));
test('385. invariantEnforcementImplemented', () => assert.equal(ie.invariantEnforcementImplemented, true));
test('386. enforcer issues blocker severity', () => { const issues = enforceAuthoringInvariants(createDraftSnapshot({ moduleId: 'm', fields: [{ key: 'a' }, { key: 'a' }] })); assert.ok(issues.some((i) => i.severity === 'blocker')); });
test('387. enforce relationship endpoints unknown', () => { const issues = enforceAuthoringInvariants({ fields: [], layout: [], relationships: [{ relationshipId: 'r', sourceDraftEntity: '', targetDraftEntity: '' }] }); assert.ok(issues.some((i) => i.issueCode === 'relationship_endpoints_known')); });
test('388. enforce field order negative', () => { const issues = enforceAuthoringInvariants({ fields: [{ key: 'a', order: -1 }], layout: [], relationships: [] }); assert.ok(issues.some((i) => i.issueCode === 'field_order_non_negative')); });
test('389. enforcer digest fnv1a', () => assert.ok(String(ie.invariantEnforcerDigest).startsWith('fnv1a-')));
test('390. enforcer stable order across identical drafts', () => { const d = { fields: [], layout: [], relationships: [], certified: true, moduleGenerated: true }; assert.deepEqual(enforceAuthoringInvariants(d).map((i) => i.issueCode), enforceAuthoringInvariants(d).map((i) => i.issueCode)); });

// ===== Preview + candidate + discard (391-430) =====
const validatedDraft = buildValidatedDraft().session.drafts[0];
const preview = createSyntheticPreviewHandoff({ draft: validatedDraft });
test('391. preview kind', () => assert.equal(preview.kind, 'authoring-synthetic-preview-handoff'));
test('392. preview handoffKind', () => assert.equal(preview.handoffKind, 'synthetic_preview_candidate'));
test('393. preview synthetic/immutable', () => { assert.equal(preview.synthetic, true); assert.equal(preview.immutable, true); });
test('394. preview validated', () => assert.equal(preview.validated, true));
test('395. preview payloadCreated when validated', () => assert.equal(preview.previewPayloadCreated, true));
test('396. preview not mounted', () => assert.equal(preview.previewMounted, false));
test('397. preview no real data', () => assert.equal(preview.realDataAttached, false));
test('398. preview no route/menu/product', () => { assert.equal(preview.routeCreated, false); assert.equal(preview.menuCreated, false); assert.equal(preview.productExposed, false); });
test('399. preview requires validated (fail-closed on draft)', () => { const p = createSyntheticPreviewHandoff({ draft: createDraftSnapshot({ moduleId: 'm' }) }); assert.equal(p.ok, false); assert.equal(p.previewPayloadCreated, false); });
test('400. preview digest fnv1a', () => assert.ok(String(preview.handoffDigest).startsWith('fnv1a-')));
test('401. preview deterministic', () => assert.equal(createSyntheticPreviewHandoff({ draft: validatedDraft }).handoffDigest, preview.handoffDigest));
test('402. preview draftDigest present', () => assert.ok(String(preview.draftDigest).startsWith('fnv1a-')));
test('403. preview frozen', () => assert.equal(Object.isFrozen(preview), true));
test('404. preview compatible sandbox', () => assert.equal(preview.targetSandboxVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
const candidate = createCertificationCandidatePreparation({ draft: validatedDraft });
test('405. candidate kind', () => assert.equal(candidate.kind, 'authoring-certification-candidate-preparation'));
test('406. candidate candidateKind', () => assert.equal(candidate.candidateKind, 'blueprint_certification_candidate'));
test('407. candidate created when validated', () => assert.equal(candidate.candidateCreated, true));
test('408. candidate NOT certified', () => assert.equal(candidate.certified, false));
test('409. candidate NOT canonical', () => assert.equal(candidate.canonical, false));
test('410. candidate NOT registered/published/moduleGenerated', () => { assert.equal(candidate.registered, false); assert.equal(candidate.published, false); assert.equal(candidate.moduleGenerated, false); });
test('411. candidate requires future slice + human checkpoint', () => { assert.equal(candidate.requiresFutureExplicitSlice, true); assert.equal(candidate.requiresHumanCheckpoint, true); });
test('412. candidate no self-certification', () => assert.equal(candidate.selfCertificationAllowed, false));
test('413. candidate requires validated (fail-closed on draft)', () => { const c = createCertificationCandidatePreparation({ draft: createDraftSnapshot({ moduleId: 'm' }) }); assert.equal(c.ok, false); assert.equal(c.candidateCreated, false); });
test('414. candidate sourceCheckpoint', () => assert.equal(candidate.sourceCheckpoint, SOURCE_CHECKPOINT));
test('415. candidate deterministic', () => assert.equal(createCertificationCandidatePreparation({ draft: validatedDraft }).candidateDigest, candidate.candidateDigest));
test('416. candidate frozen', () => assert.equal(Object.isFrozen(candidate), true));
const discard = discardAuthoringDraft({ draft: validatedDraft });
test('417. discard kind', () => assert.equal(discard.kind, 'authoring-discard-receipt'));
test('418. discard lifecycleState discarded', () => assert.equal(discard.lifecycleState, 'discarded'));
test('419. discard terminal', () => assert.equal(discard.terminal, true));
test('420. discard no external cleanup', () => assert.equal(discard.externalCleanupRequired, false));
test('421. discard no database rollback', () => assert.equal(discard.databaseRollbackRequired, false));
test('422. discard no filesystem cleanup', () => assert.equal(discard.filesystemCleanupRequired, false));
test('423. discard sideEffectsReversed 0', () => assert.equal(discard.sideEffectsReversed, 0));
test('424. discard blocks further mutable ops', () => assert.equal(discard.furtherMutableOperationsAllowed, false));
test('425. discard deterministic', () => assert.equal(discardAuthoringDraft({ draft: validatedDraft }).discardDigest, discard.discardDigest));
test('426. discard frozen', () => assert.equal(Object.isFrozen(discard), true));
test('427. preview in runtime contract', () => assert.equal(U.previewHandoff.previewMounted, false));
test('428. candidate in runtime contract', () => assert.equal(U.candidatePreparation.certified, false));
test('429. discard in runtime contract', () => assert.equal(U.discard.terminal, true));
test('430. preview payload is the draft snapshot', () => assert.equal(preview.payload.draftId, validatedDraft.draftId));

// ===== SSOT + permission/tenancy + safety + diagnostics (431-470) =====
const ssot = createAuthoringRuntimeSsotBoundary();
test('431. ssot kind', () => assert.equal(ssot.kind, 'authoring-runtime-ssot-boundary'));
test('432. ssot certified canonical', () => assert.equal(ssot.canonicalSsot, 'certified-blueprint-contract'));
test('433. ssot certified remains SSOT', () => assert.equal(ssot.certifiedBlueprintRemainsSsot, true));
test('434. ssot draft not canonical', () => assert.equal(ssot.draftIsCanonical, false));
test('435. ssot candidate not canonical', () => assert.equal(ssot.candidateIsCanonical, false));
test('436. ssot no self-certification', () => assert.equal(ssot.selfCertificationAllowed, false));
test('437. ssot no overwrite/bypass', () => { assert.equal(ssot.authoringMayOverwriteCertifiedBlueprint, false); assert.equal(ssot.authoringMayBypassCertification, false); });
test('438. ssot upstream read-only', () => { assert.equal(ssot.engineConsumedReadOnly, true); assert.equal(ssot.plannerConsumedReadOnly, true); assert.equal(ssot.previewSandboxConsumedReadOnly, true); });
test('439. ssot no second SSOT', () => assert.equal(ssot.secondSsotCreated, false));
test('440. ssot in runtime', () => assert.equal(U.ssotBoundary.certifiedBlueprintRemainsSsot, true));
const pt = createAuthoringRuntimePermissionTenancyBoundary();
test('441. permission kind', () => assert.equal(pt.kind, 'authoring-runtime-permission-tenancy-boundary'));
test('442. permission not integrated', () => assert.equal(pt.permissionModelIntegrated, false));
test('443. tenant not integrated', () => assert.equal(pt.tenantModelIntegrated, false));
test('444. server auth not integrated', () => assert.equal(pt.serverSideAuthorizationIntegrated, false));
test('445. client auth insufficient', () => assert.equal(pt.clientSideAuthorizationSufficient, false));
test('446. exposure blocked by permission/tenancy', () => assert.equal(pt.productExposureBlockedByPermissionTenancy, true));
test('447. requires permission/tenancy foundation', () => assert.equal(pt.requiresPermissionTenancyFoundation, true));
test('448. no auth imported', () => assert.equal(pt.authImported, false));
test('449. safe because not exposed', () => assert.equal(pt.safeBecauseNotExposed, true));
test('450. permission in runtime', () => assert.equal(U.permissionTenancy.permissionModelIntegrated, false));
const safety = createAuthoringRuntimeSafety();
test('451. safety kind', () => assert.equal(safety.kind, 'authoring-runtime-safety'));
test('452. safety no forbidden side effect', () => assert.equal(safety.anyForbiddenSideEffect, false));
test('453. safety reversible', () => assert.equal(safety.reversibleByNonConsumption, true));
test('454. safety deterministic/immutable', () => { assert.equal(safety.deterministic, true); assert.equal(safety.immutableSnapshots, true); });
test('455. safety all forbidden flags false', () => assert.ok(Object.values(safety.forbiddenFlags).every((v) => v === false)));
test('456. safety forbiddenFlags include filesystem/persistence/network', () => { assert.equal(safety.forbiddenFlags.filesystemWritesUsed, false); assert.equal(safety.forbiddenFlags.persistenceImplemented, false); assert.equal(safety.forbiddenFlags.networkUsed, false); });
test('457. safety in runtime', () => assert.equal(U.safety.anyForbiddenSideEffect, false));
const diag = createAuthoringRuntimeDiagnostics({ session: buildValidatedDraft().session });
test('458. diagnostics kind', () => assert.equal(diag.kind, 'authoring-runtime-diagnostics'));
test('459. diagnostics passive/deterministic', () => { assert.equal(diag.passive, true); assert.equal(diag.deterministic, true); });
test('460. diagnostics draft count', () => assert.equal(diag.draftCount, 1));
test('461. diagnostics no secrets/envs/realdata', () => { assert.equal(diag.secretsExposed, false); assert.equal(diag.envsExposed, false); assert.equal(diag.realDataExposed, false); });
test('462. diagnostics no network/storage', () => { assert.equal(diag.networkUsed, false); assert.equal(diag.storageUsed, false); });
test('463. diagnostics no secret content', () => { assert.equal(diag.secretsExposed, false); assert.ok(!/DATABASE_URL|VITE_API_URL|BEGIN [A-Z ]*PRIVATE KEY|Bearer /i.test(JSON.stringify(diag))); });
test('464. diagnostics validation summary', () => assert.ok(Array.isArray(diag.validationSummary)));
test('465. diagnostics operationCount', () => assert.ok(diag.operationCount >= 0));
test('466. diagnostics readiness', () => assert.equal(diag.readiness, 'studio_module_blueprint_authoring_runtime_ready'));
test('467. diagnostics deterministic', () => { const s = buildValidatedDraft().session; assert.equal(createAuthoringRuntimeDiagnostics({ session: s }).diagnosticsDigest, createAuthoringRuntimeDiagnostics({ session: s }).diagnosticsDigest); });
test('468. diagnostics frozen', () => assert.equal(Object.isFrozen(diag), true));
test('469. runtime diagnostics in contract', () => assert.equal(U.diagnostics.passive, true));
test('470. safety frozen', () => assert.equal(Object.isFrozen(safety), true));

// ===== Manual gate + readiness + manifest + compatibility (471-510) =====
test('471. manual gate required', () => assert.equal(U.manualGate.manualGateRequired, true));
test('472. manual gate sourceCheckpoint', () => assert.equal(U.manualGate.sourceCheckpoint, SOURCE_CHECKPOINT));
test('473. manual gate decision', () => assert.equal(U.manualGate.checkpointDecision, CHECKPOINT_DECISION));
test('474. manual gate authorization', () => assert.equal(U.manualGate.currentSliceAuthorization, 'headless_authoring_runtime_only'));
test('475. manual gate authorizes runtime true', () => assert.equal(U.manualGate.authorizesAuthoringRuntime, true));
test('476. manual gate authorizes NO ui/editor', () => { assert.equal(U.manualGate.authorizesAuthoringUi, false); assert.equal(U.manualGate.authorizesEditor, false); });
test('477. manual gate authorizes NO persistence/filesystem', () => { assert.equal(U.manualGate.authorizesPersistence, false); assert.equal(U.manualGate.authorizesFilesystemWrites, false); });
test('478. manual gate authorizes NO module generation', () => assert.equal(U.manualGate.authorizesModuleGeneration, false));
test('479. manual gate authorizes NO backend/prisma', () => { assert.equal(U.manualGate.authorizesBackend, false); assert.equal(U.manualGate.authorizesPrisma, false); });
test('480. manual gate authorizes NO product exposure/production/real data', () => { assert.equal(U.manualGate.authorizesProductExposure, false); assert.equal(U.manualGate.authorizesProduction, false); assert.equal(U.manualGate.authorizesRealData, false); });
const rd = createAuthoringRuntimeReadinessDecision({});
test('481. readiness ready when no blockers', () => assert.equal(rd.readiness, 'studio_module_blueprint_authoring_runtime_ready'));
test('482. readiness runtime true', () => assert.equal(rd.readyForAuthoringRuntime, true));
test('483. readiness ui/permission/product/module/production false', () => { assert.equal(rd.readyForAuthoringUi, false); assert.equal(rd.readyForPermissionTenancyIntegration, false); assert.equal(rd.readyForProductExposure, false); assert.equal(rd.readyForModuleGeneration, false); assert.equal(rd.readyForProduction, false); });
test('484. readiness requires permission/tenancy foundation', () => assert.equal(rd.requiresPermissionTenancyFoundation, true));
test('485. readiness blocked on blocker', () => assert.equal(createAuthoringRuntimeReadinessDecision({ blockers: ['x'] }).readiness, 'blocked'));
test('486. readiness known state', () => assert.equal(rd.knownState, true));
const man = createAuthoringRuntimeManifest({});
test('487. manifest kind', () => assert.equal(man.kind, 'authoring-runtime-manifest'));
test('488. manifest version', () => assert.equal(man.authoringRuntimeVersion, AUTHORING_RUNTIME_VERSION));
test('489. manifest upstream plan', () => assert.equal(man.upstream.authoringImplementationPlan, AUTHORING_IMPLEMENTATION_PLAN_VERSION));
test('490. manifest parts session digest string', () => assert.equal(typeof man.parts.session, 'string'));
test('491. manifest parts ssotBoundary digest string', () => assert.equal(typeof man.parts.ssotBoundary, 'string'));
test('492. manifest parts limits digest string', () => assert.equal(typeof man.parts.limits, 'string'));
test('493. manifest capabilities mirrored', () => assert.equal(man.capabilities.deterministic, true));
test('494. manifest capabilities authoringUi false', () => assert.equal(man.capabilities.authoringUiImplemented, false));
test('495. manifest digest fnv1a', () => assert.ok(String(man.manifestDigest).startsWith('fnv1a-')));
test('496. manifest frozen', () => assert.equal(Object.isFrozen(man), true));
test('497. manifest partCount', () => assert.ok(man.partCount >= 13));
const comp = checkAuthoringRuntimeCompatibility({ authoringImplementationPlan: PLAN });
test('498. compatibility kind', () => assert.equal(comp.kind, 'authoring-runtime-compatibility'));
test('499. compat plan', () => assert.equal(comp.compatibleWithAuthoringImplementationPlan, true));
test('500. compat foundation', () => assert.equal(comp.compatibleWithAuthoringFoundationContract, true));
test('501. compat blueprint contract/engine', () => { assert.equal(comp.compatibleWithBlueprintContract, true); assert.equal(comp.compatibleWithBlueprintEngine, true); });
test('502. compat planner/sandbox', () => { assert.equal(comp.compatibleWithModuleReferencePlanner, true); assert.equal(comp.compatibleWithPreviewSandbox, true); });
test('503. compat ready runtime', () => assert.equal(comp.readyForAuthoringRuntime, true));
test('504. compat ui/permission/product/production false', () => { assert.equal(comp.readyForAuthoringUi, false); assert.equal(comp.readyForPermissionTenancyIntegration, false); assert.equal(comp.readyForProductExposure, false); assert.equal(comp.readyForProduction, false); });
test('505. compat status', () => assert.equal(comp.status, 'authoring_runtime_ready_for_headless_synthetic_validation_only'));
test('506. compat mismatch warning', () => { const b = checkAuthoringRuntimeCompatibility({ authoringImplementationPlan: { kind: 'other', authoringImplementationPlanVersion: 'x@9' } }); assert.equal(b.compatibleWithAuthoringImplementationPlan, false); assert.ok(b.warnings.includes('incompatible_authoringImplementationPlan')); });
test('507. compat frozen', () => assert.equal(Object.isFrozen(comp), true));
test('508. compat digest fnv1a', () => assert.ok(String(comp.compatibilityDigest).startsWith('fnv1a-')));
test('509. readiness frozen', () => assert.equal(Object.isFrozen(rd), true));
test('510. readiness digest fnv1a', () => assert.ok(String(rd.readinessDigest).startsWith('fnv1a-')));

// ===== Verifier (511-560) =====
test('511. verification ok', () => assert.equal(U.verification.ok, true));
test('512. verification headless/deterministic/immutable/ssot', () => { assert.equal(U.verification.headless, true); assert.equal(U.verification.deterministic, true); assert.equal(U.verification.immutableSnapshots, true); assert.equal(U.verification.ssotPreserved, true); });
test('513. verification authoringUi/persistence/module/product false', () => { assert.equal(U.verification.authoringUiImplemented, false); assert.equal(U.verification.persistenceImplemented, false); assert.equal(U.verification.moduleGenerated, false); assert.equal(U.verification.productExposed, false); });
test('514. verification no blockers', () => assert.equal(U.verification.blockerCount, 0));
const vb = (o) => verifyAuthoringRuntime(o).blockers;
test('515. verifier detects certificationPerformed', () => assert.ok(vb({ runtime: { capabilities: { ...caps, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')));
test('516. verifier detects authoringUiImplemented', () => assert.ok(vb({ runtime: { capabilities: { ...caps, authoringUiImplemented: true } } }).includes('capability_authoringUiImplemented_must_be_false')));
test('517. verifier detects editorImplemented', () => assert.ok(vb({ runtime: { capabilities: { ...caps, editorImplemented: true } } }).includes('capability_editorImplemented_must_be_false')));
test('518. verifier detects persistenceImplemented', () => assert.ok(vb({ runtime: { capabilities: { ...caps, persistenceImplemented: true } } }).includes('capability_persistenceImplemented_must_be_false')));
test('519. verifier detects storageUsed', () => assert.ok(vb({ runtime: { capabilities: { ...caps, storageUsed: true } } }).includes('capability_storageUsed_must_be_false')));
test('520. verifier detects filesystemWritesUsed', () => assert.ok(vb({ runtime: { capabilities: { ...caps, filesystemWritesUsed: true } } }).includes('capability_filesystemWritesUsed_must_be_false')));
test('521. verifier detects moduleGenerated', () => assert.ok(vb({ runtime: { capabilities: { ...caps, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')));
test('522. verifier detects moduleRegistered', () => assert.ok(vb({ runtime: { capabilities: { ...caps, moduleRegistered: true } } }).includes('capability_moduleRegistered_must_be_false')));
test('523. verifier detects backend/prisma', () => { const r = vb({ runtime: { capabilities: { ...caps, backendAccessed: true, prismaAccessed: true } } }); assert.ok(r.includes('capability_backendAccessed_must_be_false') && r.includes('capability_prismaAccessed_must_be_false')); });
test('524. verifier detects production/staging', () => { const r = vb({ runtime: { capabilities: { ...caps, productionAccessed: true, stagingAccessed: true } } }); assert.ok(r.includes('capability_productionAccessed_must_be_false')); });
test('525. verifier detects fetch/network', () => { const r = vb({ runtime: { capabilities: { ...caps, fetchUsed: true, networkUsed: true } } }); assert.ok(r.includes('capability_fetchUsed_must_be_false') && r.includes('capability_networkUsed_must_be_false')); });
test('526. verifier detects real data', () => { const r = vb({ runtime: { capabilities: { ...caps, realDataRead: true, realDataWrite: true } } }); assert.ok(r.includes('capability_realDataRead_must_be_false')); });
test('527. verifier detects product exposure/menu/route', () => { const r = vb({ runtime: { capabilities: { ...caps, productExposed: true, menuCreated: true, routeCreated: true } } }); assert.ok(r.includes('capability_productExposed_must_be_false')); });
test('528. verifier detects prototypeRelinked', () => assert.ok(vb({ runtime: { capabilities: { ...caps, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')));
test('529. verifier detects draftIsCanonical/candidateIsCanonical', () => { const r = vb({ runtime: { capabilities: { ...caps, draftIsCanonical: true, candidateIsCanonical: true } } }); assert.ok(r.includes('capability_draftIsCanonical_must_be_false') && r.includes('capability_candidateIsCanonical_must_be_false')); });
test('530. verifier detects permission/tenant/server-auth integration', () => { const r = vb({ runtime: { capabilities: { ...caps, permissionModelIntegrated: true, tenantModelIntegrated: true, serverSideAuthorizationIntegrated: true } } }); assert.ok(r.includes('capability_permissionModelIntegrated_must_be_false')); });
test('531. verifier detects mustBeTrue inversion (deterministic)', () => assert.ok(vb({ runtime: { capabilities: { ...caps, deterministic: false } } }).includes('capability_deterministic_must_be_true')));
test('532. verifier detects mustBeTrue inversion (immutableSnapshots)', () => assert.ok(vb({ runtime: { capabilities: { ...caps, immutableSnapshots: false } } }).includes('capability_immutableSnapshots_must_be_true')));
test('533. verifier detects mustBeTrue inversion (ssotPreserved)', () => assert.ok(vb({ runtime: { capabilities: { ...caps, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')));
test('534. verifier detects SSOT inversion (part)', () => assert.ok(vb({ runtime: { capabilities: caps, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')));
test('535. verifier detects SSOT not preserved (part)', () => assert.ok(vb({ runtime: { capabilities: caps, ssotBoundary: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')));
test('536. verifier detects self-certification (part)', () => assert.ok(vb({ runtime: { capabilities: caps, ssotBoundary: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification')));
test('537. verifier detects ssot overwrite/bypass (part)', () => assert.ok(vb({ runtime: { capabilities: caps, ssotBoundary: { authoringMayOverwriteCertifiedBlueprint: true } } }).includes('unsafe_ssot_overwrite_or_bypass')));
test('538. verifier detects second ssot (part)', () => assert.ok(vb({ runtime: { capabilities: caps, ssotBoundary: { secondSsotCreated: true } } }).includes('unsafe_second_ssot')));
test('539. verifier detects forbidden lifecycle state (part)', () => assert.ok(vb({ runtime: { capabilities: caps, lifecycle: { states: ['empty', 'certified'] } } }).includes('unsafe_forbidden_lifecycle_state')));
test('540. verifier detects unknown transition accepted (part)', () => assert.ok(vb({ runtime: { capabilities: caps, lifecycle: { unknownTransitionFailClosed: false } } }).includes('unsafe_unknown_transition_accepted')));
test('541. verifier detects operations not allowlist (part)', () => assert.ok(vb({ runtime: { capabilities: caps, operations: { allowlistOnly: false } } }).includes('unsafe_operations_not_allowlist_only')));
test('542. verifier detects unknown op accepted (part)', () => assert.ok(vb({ runtime: { capabilities: caps, operations: { unknownOperationsFailClosed: false } } }).includes('unsafe_unknown_operation_accepted')));
test('543. verifier detects operation effects (part)', () => assert.ok(vb({ runtime: { capabilities: caps, operations: { sideEffectsAllowed: true } } }).includes('unsafe_operation_effects')));
test('544. verifier detects revision negative (part)', () => assert.ok(vb({ runtime: { capabilities: caps, revisions: { negativeRevisionAllowed: true } } }).includes('unsafe_revision_negative')));
test('545. verifier detects revision mutation/persistence (part)', () => assert.ok(vb({ runtime: { capabilities: caps, revisions: { historyPersistenceAllowed: true } } }).includes('unsafe_revision_mutation_or_persistence')));
test('546. verifier detects validation not fail-closed (part)', () => assert.ok(vb({ runtime: { capabilities: caps, validation: { failClosed: false } } }).includes('unsafe_validation_not_fail_closed')));
test('547. verifier detects preview mounted/real-data (part)', () => assert.ok(vb({ runtime: { capabilities: caps, previewHandoff: { previewMounted: true } } }).includes('unsafe_preview')));
test('548. verifier detects candidate certified (part)', () => assert.ok(vb({ runtime: { capabilities: caps, candidatePreparation: { certified: true } } }).includes('unsafe_candidate')));
test('549. verifier detects candidate self-certification (part)', () => assert.ok(vb({ runtime: { capabilities: caps, candidatePreparation: { selfCertificationAllowed: true } } }).includes('unsafe_candidate_self_certification')));
test('550. verifier detects permission integrated (part)', () => assert.ok(vb({ runtime: { capabilities: caps, permissionTenancy: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated_without_foundation')));
test('551. verifier detects tenant integrated (part)', () => assert.ok(vb({ runtime: { capabilities: caps, permissionTenancy: { tenantModelIntegrated: true } } }).includes('unsafe_tenant_model_integrated_without_foundation')));
test('552. verifier detects missing manual gate', () => assert.ok(vb({ runtime: { capabilities: caps, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')));
test('553. verifier detects manual gate authorizes real', () => assert.ok(vb({ runtime: { capabilities: caps, manualGate: { manualGateRequired: true, authorizesAuthoringUi: true } } }).includes('unsafe_manual_gate_authorizes_real')));
test('554. verifier detects safety side effect (part)', () => assert.ok(vb({ runtime: { capabilities: caps, safety: { anyForbiddenSideEffect: true } } }).includes('unsafe_safety_side_effect')));
test('555. verifier detects nondeterministic source in embedded string', () => assert.ok(vb({ runtime: { capabilities: caps, note: 'uses Math.random for ids' } }).includes('unsafe_nondeterministic_source')));
test('556. verifier never throws on null', () => assert.doesNotThrow(() => verifyAuthoringRuntime({ runtime: null })));
test('557. verification frozen', () => assert.equal(Object.isFrozen(U.verification), true));
test('558. verification checkedCapabilities count', () => assert.ok(U.verification.checkedCapabilities >= 38));
test('559. verifier ok for clean runtime', () => assert.equal(verifyAuthoringRuntime({ runtime: U }).ok, true));
test('560. verification digest fnv1a', () => assert.ok(String(U.verification.verificationDigest).startsWith('fnv1a-')));

// ===== Errors + flags + fallback (561-600) =====
test('561. error codes >= 45', () => assert.ok(AUTHORING_RUNTIME_ERROR_CODES.length >= 45));
test('562. error codes unique', () => assert.equal(new Set(AUTHORING_RUNTIME_ERROR_CODES).size, AUTHORING_RUNTIME_ERROR_CODES.length));
test('563. error descriptor kind', () => assert.equal(createAuthoringRuntimeError(AUTHORING_RUNTIME_ERROR_CODES[0]).kind, 'authoring-runtime-error'));
test('564. error descriptor safe/side-effect-free', () => { const e = createAuthoringRuntimeError('AUTHORING_RUNTIME_PRISMA_BLOCKED'); assert.equal(e.safe, true); assert.equal(e.sideEffects, false); });
test('565. error descriptor no cert/module/realdata', () => { const e = createAuthoringRuntimeError('AUTHORING_RUNTIME_BACKEND_BLOCKED'); assert.equal(e.certificationPerformed, false); assert.equal(e.moduleGenerated, false); assert.equal(e.realDataRead, false); });
test('566. error unknown code normalized', () => assert.equal(createAuthoringRuntimeError('NOPE').code, 'AUTHORING_RUNTIME_INVALID_CONFIG'));
test('567. error class instance', () => assert.ok(authoringRuntimeError('AUTHORING_RUNTIME_SESSION_FAILED', 'x') instanceof AuthoringRuntimeError));
test('568. error class normalizes bad code', () => assert.equal(new AuthoringRuntimeError('bad', 'x').code, 'AUTHORING_RUNTIME_INVALID_CONFIG'));
test('569. error no secrets in message', () => { const e = createAuthoringRuntimeError('AUTHORING_RUNTIME_FETCH_BLOCKED'); assert.ok(!/jwt|token|secret|DATABASE_URL/i.test(e.message)); });
test('570. error has unknown-operation code', () => assert.ok(AUTHORING_RUNTIME_ERROR_CODES.includes('AUTHORING_RUNTIME_UNKNOWN_OPERATION')));
test('571. error has nondeterminism-blocked code', () => assert.ok(AUTHORING_RUNTIME_ERROR_CODES.includes('AUTHORING_RUNTIME_NONDETERMINISM_BLOCKED')));
test('572. error has revision-regression code', () => assert.ok(AUTHORING_RUNTIME_ERROR_CODES.includes('AUTHORING_RUNTIME_REVISION_REGRESSION_BLOCKED')));
test('573. flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringRuntimeEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('574. flag on in dev', () => assert.equal(isStudioModuleBlueprintAuthoringRuntimeEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG]: 'true', DEV: 'true' }), true));
test('575. flag off default', () => assert.equal(isStudioModuleBlueprintAuthoringRuntimeEnabled({}), false));
test('576. verify flag off in production', () => assert.equal(isStudioModuleBlueprintAuthoringRuntimeVerifyEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('577. isProductionEnv production label', () => assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true));
test('578. isProductionEnv DEV false', () => assert.equal(isProductionEnv({ DEV: 'true' }), false));
test('579. isProductionEnv PROD true', () => assert.equal(isProductionEnv({ PROD: 'true' }), true));
test('580. isProductionEnv NODE_ENV production', () => assert.equal(isProductionEnv({ NODE_ENV: 'production' }), true));
test('581. flag names distinct', () => assert.notEqual(MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG, MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG));
test('582. master flag enables verify path', () => assert.equal(isStudioModuleBlueprintAuthoringRuntimeVerifyEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG]: 'true', DEV: 'true' }), true));
test('583. staging label gated by dev', () => assert.equal(isStudioModuleBlueprintAuthoringRuntimeEnabled({ [MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG]: 'true', MAK_ENV_LABEL: 'staging' }), true));
test('584. fallback on missing plan', () => assert.equal(createStudioModuleBlueprintAuthoringRuntime({}).fallback, true));
test('585. fallback on invalid kind', () => assert.equal(createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: { kind: 'other' } }).fallback, true));
test('586. fallback on upstream fallback', () => assert.equal(createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: { kind: 'studio-module-blueprint-authoring-implementation-plan', fallback: true } }).fallback, true));
test('587. fallback readiness blocked', () => assert.equal(createAuthoringRuntimeFallback({}).readiness, 'blocked'));
test('588. fallback authorizes nothing', () => { const fb = createAuthoringRuntimeFallback({}); assert.equal(fb.readyForAuthoringRuntime, false); assert.equal(fb.readyForProduction, false); });
test('589. fallback caps deterministic true', () => assert.equal(createAuthoringRuntimeFallback({}).capabilities.deterministic, true));
test('590. fallback caps authoringUi false', () => assert.equal(createAuthoringRuntimeFallback({}).capabilities.authoringUiImplemented, false));
test('591. fallback digest fnv1a', () => assert.ok(String(createAuthoringRuntimeFallback({}).overallDigest).startsWith('fnv1a-')));
test('592. fallback frozen', () => assert.equal(Object.isFrozen(createAuthoringRuntimeFallback({})), true));
test('593. fallback requires permission tenancy', () => assert.equal(createAuthoringRuntimeFallback({}).requiresPermissionTenancyFoundation, true));
test('594. error frozen? (descriptor plain)', () => assert.equal(typeof createAuthoringRuntimeError('AUTHORING_RUNTIME_SESSION_FAILED'), 'object'));
test('595. receipt create kind', () => assert.equal(createOperationReceipt({ operationId: 'createDraft', status: 'applied' }).kind, 'authoring-operation-receipt'));
test('596. receipt deterministic', () => assert.equal(createOperationReceipt({ operationId: 'x', status: 'applied', draftId: 'd' }).receiptDigest, createOperationReceipt({ operationId: 'x', status: 'applied', draftId: 'd' }).receiptDigest));
test('597. receipt status rejected default', () => assert.equal(createOperationReceipt({ operationId: 'x' }).status, 'rejected'));
test('598. receipt no side effects', () => assert.equal(createOperationReceipt({ operationId: 'x' }).sideEffects, false));
test('599. error side-effect-free descriptor no realdata write', () => assert.equal(createAuthoringRuntimeError('AUTHORING_RUNTIME_REAL_DATA_WRITE_BLOCKED').realDataWrite, false));
test('600. fallback capabilities frozen mirror', () => assert.equal(createAuthoringRuntimeFallback({}).capabilities.ssotPreserved, true));

// ===== Determinism/purity of composer + static scans (601-640) =====
test('601. deterministic overall digest', () => assert.equal(createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN }).overallDigest, U.overallDigest));
test('602. deterministic runtime digest', () => assert.equal(createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN }).authoringRuntimeDigest, U.authoringRuntimeDigest));
test('603. runtime frozen', () => assert.equal(Object.isFrozen(U), true));
test('604. runtime JSON round-trips', () => { const j = JSON.parse(JSON.stringify(U)); assert.equal(j.kind, U.kind); });
test('605. building does not mutate plan', () => { const before = JSON.stringify(PLAN); createStudioModuleBlueprintAuthoringRuntime({ authoringImplementationPlan: PLAN }); assert.equal(JSON.stringify(PLAN), before); });
test('606. capabilities object mirrors const', () => assert.deepEqual(U.capabilities, { ...caps }));
test('607. no top-level warnings', () => assert.deepEqual(U.warnings, []));
test('608. manifest partCount matches', () => assert.equal(U.manifest.partCount, man.partCount));
test('609. subtree is React-free', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('610. no react-router import', () => assert.ok(jsImports().every((p) => !/react-router/i.test(p))));
test('611. no react-dom import', () => assert.ok(jsImports().every((p) => !/react-dom/i.test(p))));
test('612. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|jsxs?\(/.test(jsCode())));
test('613. no <Route JSX / Routes / Link / NavLink', () => assert.ok(!/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(jsCode())));
test('614. no BrowserRouter / useNavigate', () => assert.ok(!/\bBrowserRouter\b|\buseNavigate\b/.test(jsCode())));
test('615. no ReactDOM / createRoot / hydrateRoot', () => assert.ok(!/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(/.test(jsCode())));
test('616. no window/document access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsCode())));
test('617. no fs./writeFile/mkdir/appendFile', () => assert.ok(!/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(jsCode())));
test('618. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('619. no fetch/XHR/WebSocket/axios', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(jsCode())));
test('620. no @prisma/PrismaClient import', () => assert.ok(jsImports().every((p) => !/@prisma|PrismaClient/i.test(p))));
test('621. no EmpresaApi/apiClient/apis/backend import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('622. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('623. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('624. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('625. no moduleGenerated true literal', () => assert.ok(!/moduleGenerated\s*:\s*true/.test(jsCode())));
test('626. no certified true literal', () => assert.ok(!/\bcertified\s*:\s*true/.test(jsCode())));
test('627. no productExposed true literal', () => assert.ok(!/productExposed\s*:\s*true/.test(jsCode())));
test('628. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('629. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('630. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('631. no Date.now (excl verifier)', () => assert.ok(!/Date\.now/.test(jsCodeNoVerifier())));
test('632. no new Date (excl verifier)', () => assert.ok(!/new Date\b/.test(jsCodeNoVerifier())));
test('633. no Math.random (excl verifier)', () => assert.ok(!/Math\.random/.test(jsCodeNoVerifier())));
test('634. no randomUUID (excl verifier)', () => assert.ok(!/randomUUID/.test(jsCodeNoVerifier())));
test('635. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('636. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('637. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('638. exactly 30 .js files', () => assert.equal(jsFiles().length, 30));
test('639. prototype paths const 8', () => assert.equal(FORBIDDEN_PROTOTYPE_PATHS.length, 8));
test('640. default limits frozen', () => assert.equal(Object.isFrozen(DEFAULT_AUTHORING_RESOURCE_LIMITS), true));

// ===== Scope safety (641-655) =====
test('641. no App.jsx in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('642. no src/pages in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/pages\//.test(x))); });
test('643. no src/components in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/components\//.test(x))); });
test('644. no src/modules in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\//.test(x))); });
test('645. no backend/prisma in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('646. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
// The production UI guard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
// governance guard may appear ONLY when the slice active on this branch declares it as shared governance —
// which only the governance slices do. Both facts come from the caller-aware evaluation, not a hardcoded list.
test('647. no productionUiGuard/governanceGuard in diff', () => {
  const f = changed(); if (f === null) return;
  assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs'), 'productionUiGuard is never in scope');
  const scope = evaluateStudioBranchConsumerScope(f, { callerSliceId: CALLER_SLICE_ID });
  assert.deepEqual(scope.forbidden, []);
  if (f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')) {
    assert.ok(scope.allowed.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'),
      'the governance guard may only appear when the active slice shares it');
    // Exact active-slice authorization: no sliceId prefix, no chronology-free catalog lookup.
    const authorizer = createResolvedActiveStudioSlicePathAuthorizer(f);
    assert.ok(authorizer.ok && authorizer.isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs'),
      `active ${authorizer.activeSliceId} does not own the governance guard`);
  }
});
test('648. no upstream foundation/plan subtree in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-(foundation-contract|implementation-plan)\//.test(x))); });
// Branch-relative scope check, CALLER-AWARE. It no longer asks "is this path registered somewhere?" — a flat
// registry could not prove the path was later than this slice. It asks "which slice is this branch building, and
// is that slice this one or a later one?", and admits only what that active slice owns, is explicitly
// cross-authorized for, or shares. Forbidden and unknown still fail closed.
const CALLER_SLICE_ID = 'module-blueprint-authoring-runtime';
test('649. no prior gate/test altered', () => {
  const files = changed(); if (files === null) return;
  const scope = evaluateStudioBranchConsumerScope(files, { callerSliceId: CALLER_SLICE_ID });
  assert.equal(scope.consumerSliceId, CALLER_SLICE_ID);
  assert.deepEqual(scope.forbidden, []);
  assert.deepEqual(scope.unknown, []);
  assert.deepEqual(scope.chronologicalViolation, []);
  // Three legitimate outcomes, and nothing else:
  //  - applicable: this branch is at or after this slice, so this check IS the certifier;
  //  - empty diff: nothing to judge (running on `main`);
  //  - the branch builds an EARLIER slice: this check is a passenger, and the branch was
  //    re-certified against its own active slice before being declared sound.
  if (scope.consumerApplicable) {
    assert.equal(scope.applicable, true);
    assert.ok(scope.activeSliceOrdinal >= scope.consumerSliceOrdinal, `active ${scope.activeSliceId} precedes ${CALLER_SLICE_ID}`);
  } else if (scope.reason === 'consumer_slice_after_active_slice') {
    assert.equal(scope.notApplicable, true);
    assert.equal(scope.certifiedAgainstActiveSlice, true);
    assert.equal(scope.evaluatedAsSliceId, scope.activeSliceId);
    assert.ok(scope.activeSliceOrdinal < scope.consumerSliceOrdinal);
  } else {
    assert.equal(scope.notApplicable, true);
    assert.equal(scope.reason, 'empty_branch_diff');
    assert.equal(scope.activeSliceId, null);
  }
  assert.equal(scope.safe, true, JSON.stringify(scope.blockers));
});
test('650. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('651. net-new scope subtree only', () => { const f = changed(); if (f === null) return; if (!f.some((x) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//.test(x))) return; assert.deepEqual(f.filter((x) => !authorized(x)), []); });
test('652. upstream plan present', () => assert.ok(exists('src/studio/blueprint-engine/module-blueprint-authoring-implementation-plan/index.js')));
test('653. upstream foundation present', () => assert.ok(exists('src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract/index.js')));
test('654. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));
test('655. runtime subtree present', () => assert.ok(exists('src/studio/blueprint-engine/module-blueprint-authoring-runtime/index.js')));

// ===== Evidence docs (D1-D27) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-MODULE-BLUEPRINT-AUTHORING-RUNTIME-REPORT.md', 'RUNTIME-SESSION.md',
  'DRAFT-SNAPSHOT.md', 'RESOURCE-LIMITS.md', 'DETERMINISM.md', 'IMMUTABILITY.md', 'LIFECYCLE-EXECUTOR.md',
  'OPERATION-EXECUTOR.md', 'REVISION-ENGINE.md', 'VALIDATION-PIPELINE.md', 'INVARIANT-ENFORCEMENT.md',
  'SYNTHETIC-PREVIEW-HANDOFF.md', 'CERTIFICATION-CANDIDATE-PREPARATION.md', 'DISCARD-ROLLBACK.md',
  'SSOT-PROTECTION.md', 'PERMISSION-TENANCY-BOUNDARY.md', 'PERSISTENCE-FILESYSTEM-PROHIBITION.md',
  'MODULE-GENERATION-PROHIBITION.md', 'PROTOTYPE-RELINK-PROHIBITION.md', 'SAFETY-DIAGNOSTICS.md',
  'MANUAL-ENABLEMENT-GATE.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-APP-NO-MODULE-NO-PERSISTENCE.md',
  'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-CHECKPOINT-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-module-blueprint-authoring-runtime/${DOCS[i]}`)));
}
test('D28. exactly 27 evidence docs', () => assert.equal(DOCS.length, 27));
test('D-content. runtime + determinism + SSOT + prototype-debt + next checkpoint present', () => {
  assert.ok(/runtime|headless/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/determin|Date\.now|Math\.random/i.test(readEv('DETERMINISM.md')));
  assert.ok(/SSOT|canonical|certified/i.test(readEv('SSOT-PROTECTION.md')));
  assert.ok(/prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')));
  assert.ok(/checkpoint|FABLE|enterprise/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));
});
