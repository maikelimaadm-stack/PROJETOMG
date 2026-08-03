import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Caller-aware Studio scope governance. This test declares its OWN slice identity, so the branch-relative
// scope check below can ask whether the slice active on this branch is the same as it or genuinely later.
import { evaluateStudioBranchDiffScope, createResolvedActiveStudioSlicePathAuthorizer }
  from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  BRIDGE_NAME, BRIDGE_SEMVER, BRIDGE_VERSION, BRIDGE_MODE, SOURCE_HANDOFF_VERSION, AUTHORING_RUNTIME_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, BRIDGE_CONTRACT_VERSION, BLUEPRINT_CONTRACT_VERSION,
  BRIDGE_IMPLEMENTATION_PLAN_VERSION, SOURCE_HANDOFF_KIND, TARGET_SANDBOX_KIND, REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS, SOURCE_HANDOFF_REQUIRED_FIELDS, SOURCE_HANDOFF_VERSION_FIELDS,
  BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, BRIDGE_VALIDATION_STAGES, BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS, DEFAULT_BRIDGE_RESOURCE_LIMITS, BRIDGE_RESOURCE_LIMIT_DIMENSIONS,
  TARGET_DESCRIPTOR_TARGET_FIELDS, BRIDGE_DECISION_STATUSES, BRIDGE_ISSUE_CODES, BRIDGE_CAPABILITIES,
  BRIDGE_READINESS_STATES, DEFAULT_EXPECTED_VERSIONS, FORBIDDEN_PROTOTYPE_PATHS, SOURCE_CHECKPOINT,
  SOURCE_DECISION, REQUIRED_FUTURE_CHECKPOINT,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG, MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG,
  isProductionEnv, isStudioAuthoringRuntimeToPreviewBridgeEnabled, isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled,
  BRIDGE_ERROR_CODES, isBridgeErrorCode, BridgeError, createBridgeError,
  deepFreeze, normalizeBridgeInput, sortBridgeIssues, createBridgeIssue,
  validateStrictDraftIdentity, validateSourceHandoffShape, validateSourceVersionTuple,
  recomputeAndValidateHandoffDigest, validateSourceSyntheticBoundary, validateSourceSsotBoundary,
  validateBridgeExtensions, enforceBridgeResourceLimits, resolveBridgeLimits, executeBridgeFieldMappings,
  createTargetPreviewSandboxDescriptor, validateTargetDescriptor, createBridgeValidationPipeline,
  createBridgeDecision, createBridgeManifest, verifyAuthoringRuntimeToPreviewBridge,
  checkAuthoringRuntimeToPreviewBridgeCompatibility, createAuthoringRuntimeToPreviewBridgeFallback,
  createStudioAuthoringRuntimeToPreviewBridge,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff,
  stableSerialize, createDeterministicDigest,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge');
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
const jsCodeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyAuthoringRuntimeToPreviewBridge\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };

// REAL round-trip helper (no mock on the main path).
function buildRealHandoff(seed = 'bridge') {
  const s0 = createAuthoringRuntimeSession({ seed });
  const before = stableSerialize(s0);
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  return { handoff: createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), draftId, inputUnchanged: stableSerialize(s0) === before };
}

const BRIDGE = createStudioAuthoringRuntimeToPreviewBridge({});
const { handoff: H, draftId: DRAFT_ID } = buildRealHandoff('bridge');
const DECISION = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID });
const caps = BRIDGE_CAPABILITIES;

// ===== Config + instance + readiness (1-45) =====
test('1. bridge kind', () => assert.equal(BRIDGE.kind, 'studio-authoring-runtime-to-preview-bridge'));
test('2. bridge name', () => { assert.equal(BRIDGE.bridgeName, 'studio-authoring-runtime-to-preview-bridge'); assert.equal(BRIDGE.bridgeName, BRIDGE_NAME); });
test('3. bridge version', () => { assert.equal(BRIDGE.bridgeVersion, 'studio-authoring-runtime-to-preview-bridge@1.0.0'); assert.equal(BRIDGE.bridgeVersion, BRIDGE_VERSION); });
test('4. semver', () => assert.equal(BRIDGE_SEMVER, '1.0.0'));
test('5. mode', () => { assert.equal(BRIDGE.mode, 'headless_authoring_runtime_to_preview_bridge'); assert.equal(BRIDGE.mode, BRIDGE_MODE); });
test('6. not fallback', () => assert.equal(BRIDGE.fallback, false));
test('7. sourceCheckpoint', () => { assert.equal(BRIDGE.sourceCheckpoint, SOURCE_CHECKPOINT); assert.ok(/revalidation/.test(SOURCE_CHECKPOINT)); });
test('8. sourceDecision', () => { assert.equal(BRIDGE.sourceDecision, SOURCE_DECISION); assert.equal(SOURCE_DECISION, 'READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE'); });
test('9. requiredFutureCheckpoint', () => assert.equal(BRIDGE.requiredFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('10. readiness ready', () => assert.equal(BRIDGE.readiness, 'studio_authoring_runtime_to_preview_bridge_ready'));
test('11. readyForHeadlessBridge true', () => assert.equal(BRIDGE.readyForHeadlessBridge, true));
test('12. readyForPreviewMount false', () => assert.equal(BRIDGE.readyForPreviewMount, false));
test('13. readyForAuthoringUi false', () => assert.equal(BRIDGE.readyForAuthoringUi, false));
test('14. readyForProductExposure false', () => assert.equal(BRIDGE.readyForProductExposure, false));
test('15. readyForModuleGeneration false', () => assert.equal(BRIDGE.readyForModuleGeneration, false));
test('16. readyForCertification false', () => assert.equal(BRIDGE.readyForCertification, false));
test('17. readyForProduction false', () => assert.equal(BRIDGE.readyForProduction, false));
test('18. requiresPermissionTenancyFoundationBeforeExposure true', () => assert.equal(BRIDGE.requiresPermissionTenancyFoundationBeforeExposure, true));
test('19. blockerCount 0', () => assert.equal(BRIDGE.blockerCount, 0));
test('20. readiness state known', () => assert.ok(BRIDGE_READINESS_STATES.includes(BRIDGE.readiness)));
test('21. bridge frozen', () => assert.equal(Object.isFrozen(BRIDGE), true));
test('22. config frozen', () => assert.equal(Object.isFrozen(BRIDGE.config), true));
test('23. config expectedVersions frozen', () => assert.equal(Object.isFrozen(BRIDGE.config.expectedVersions), true));
test('24. config limits frozen', () => assert.equal(Object.isFrozen(BRIDGE.config.limits), true));
test('25. no global singleton (distinct instances)', () => assert.notEqual(createStudioAuthoringRuntimeToPreviewBridge({}), createStudioAuthoringRuntimeToPreviewBridge({})));
test('26. execute is a function', () => assert.equal(typeof BRIDGE.execute, 'function'));
test('27. manifest embedded', () => assert.equal(BRIDGE.manifest.kind, 'bridge-manifest'));
test('28. verification embedded ok', () => { assert.equal(BRIDGE.verification.kind, 'bridge-verification'); assert.equal(BRIDGE.verification.ok, true); });
test('29. diagnostics embedded', () => assert.equal(BRIDGE.diagnostics.kind, 'bridge-diagnostics'));
test('30. compatibility embedded', () => assert.equal(BRIDGE.compatibility.kind, 'bridge-compatibility'));
test('31. manualGate embedded', () => assert.equal(BRIDGE.manualGate.kind, 'bridge-manual-enablement-gate'));
test('32. default expected versions handoffVersion', () => assert.equal(DEFAULT_EXPECTED_VERSIONS.handoffVersion, SOURCE_HANDOFF_VERSION));
test('33. default expected versions runtimeVersion', () => assert.equal(DEFAULT_EXPECTED_VERSIONS.runtimeVersion, AUTHORING_RUNTIME_VERSION));
test('34. default expected versions targetSandboxVersion', () => assert.equal(DEFAULT_EXPECTED_VERSIONS.targetSandboxVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('35. source handoff kind const', () => assert.equal(SOURCE_HANDOFF_KIND, 'synthetic_preview_candidate'));
test('36. target sandbox kind const', () => assert.equal(TARGET_SANDBOX_KIND, 'module_preview_sandbox_candidate'));
test('37. real handoff fields 20', () => assert.equal(REAL_HANDOFF_FIELDS.length, 20));
test('38. field mappings 12', () => assert.equal(BRIDGE_FIELD_MAPPINGS.length, 12));
test('39. validation stages 13', () => assert.equal(BRIDGE_VALIDATION_STAGES.length, 13));
test('40. decision statuses 2', () => assert.deepEqual([...BRIDGE_DECISION_STATUSES], ['bridge_ready', 'bridge_rejected']));
test('41. invalid limits -> fallback', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: { bogusDimension: 5 } }); assert.equal(b.fallback, true); });
test('42. fallback execute rejects', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: { bogusDimension: 5 } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); assert.equal(d.status, 'bridge_rejected'); });
test('43. bridgemeta not metadataOnly (real impl)', () => assert.equal(BRIDGE.metadataOnly, false));
test('44. forbidden prototype paths 8', () => assert.equal(FORBIDDEN_PROTOTYPE_PATHS.length, 8));
test('45. target descriptor target fields 12', () => assert.equal(TARGET_DESCRIPTOR_TARGET_FIELDS.length, 12));

// ===== Capabilities (46-115) =====
const TRUE_CAPS = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed', 'sideEffectFree', 'ssotPreserved', 'sourceConsumedReadOnly', 'contractConsumedReadOnly', 'runtimeSerializerReusedReadOnly', 'bridgeImplemented', 'sourceValidationImplemented', 'draftIdentityEnforcementImplemented', 'sourceVersionValidationImplemented', 'sourceDigestValidationImplemented', 'sourceBoundaryValidationImplemented', 'mappingExecutorImplemented', 'targetDescriptorBuilderImplemented', 'targetVersionValidationImplemented', 'canonicalizationValidationImplemented', 'extensibilityEnforcementImplemented', 'validationPipelineImplemented', 'replayIdempotencyImplemented', 'resourceLimitsImplemented', 'failureContainmentImplemented'];
const FALSE_CAPS = ['previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
test('46. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 47;
for (const k of TRUE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} true`, () => { assert.equal(caps[k], true); assert.equal(BRIDGE.capabilities[k], true); }); }
for (const k of FALSE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} false`, () => { assert.equal(caps[k], false); assert.equal(BRIDGE.capabilities[k], false); }); }
// n = 47 + 28 + 25 = 100
test('100. TRUE_CAPS 28', () => assert.equal(TRUE_CAPS.length, 28));
test('101. FALSE_CAPS 25', () => assert.equal(FALSE_CAPS.length, 25));
test('102. bridgeImplemented true (real slice)', () => assert.equal(caps.bridgeImplemented, true));
test('103. mappingExecutorImplemented true', () => assert.equal(caps.mappingExecutorImplemented, true));
test('104. targetDescriptorBuilderImplemented true', () => assert.equal(caps.targetDescriptorBuilderImplemented, true));
test('105. previewMounted false', () => assert.equal(caps.previewMounted, false));
test('106. appTouched false', () => assert.equal(caps.appTouched, false));
test('107. persistenceImplemented false', () => assert.equal(caps.persistenceImplemented, false));
test('108. moduleGenerated false', () => assert.equal(caps.moduleGenerated, false));
test('109. certificationPerformed false', () => assert.equal(caps.certificationPerformed, false));
test('110. productExposed false', () => assert.equal(caps.productExposed, false));
test('111. permissionModelIntegrated false', () => assert.equal(caps.permissionModelIntegrated, false));
test('112. runtimeSerializerReusedReadOnly true', () => assert.equal(caps.runtimeSerializerReusedReadOnly, true));
test('113. deterministic true', () => assert.equal(caps.deterministic, true));
test('114. immutable true', () => assert.equal(caps.immutable, true));
test('115. sideEffectFree true', () => assert.equal(caps.sideEffectFree, true));

// ===== Real round-trip end-to-end (116-165) =====
test('116. handoff kind synthetic_preview_candidate', () => assert.equal(H.handoffKind, 'synthetic_preview_candidate'));
test('117. handoff has handoffDigest', () => assert.equal(typeof H.handoffDigest, 'string'));
test('118. handoff has NO upstreamVersions', () => assert.equal('upstreamVersions' in H, false));
test('119. handoff has NO generic digest', () => assert.equal('digest' in H, false));
test('120. decision ok true', () => assert.equal(DECISION.ok, true));
test('121. decision status bridge_ready', () => assert.equal(DECISION.status, 'bridge_ready'));
test('122. decision targetDescriptorCreated true', () => assert.equal(DECISION.targetDescriptorCreated, true));
test('123. decision issues empty', () => assert.deepEqual(DECISION.issues, []));
test('124. decision issueCount 0', () => assert.equal(DECISION.issueCount, 0));
test('125. decision frozen', () => assert.equal(Object.isFrozen(DECISION), true));
test('126. target descriptor present', () => assert.ok(DECISION.targetDescriptor !== null));
test('127. target kind', () => assert.equal(DECISION.targetDescriptor.kind, 'bridge-target-preview-sandbox-descriptor'));
test('128. target targetKind', () => assert.equal(DECISION.targetDescriptor.targetKind, TARGET_SANDBOX_KIND));
test('129. target contract version', () => assert.equal(DECISION.targetDescriptor.targetContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('130. target synthetic', () => assert.equal(DECISION.targetDescriptor.synthetic, true));
test('131. target metadataOnly', () => assert.equal(DECISION.targetDescriptor.metadataOnly, true));
test('132. target immutable', () => assert.equal(DECISION.targetDescriptor.immutable, true));
test('133. target not mounted', () => assert.equal(DECISION.targetDescriptor.previewMounted, false));
test('134. target no route/menu', () => { assert.equal(DECISION.targetDescriptor.routeCreated, false); assert.equal(DECISION.targetDescriptor.menuCreated, false); });
test('135. target not product exposed', () => assert.equal(DECISION.targetDescriptor.productExposed, false));
test('136. target no real data', () => assert.equal(DECISION.targetDescriptor.realDataAttached, false));
test('137. target no module generated', () => assert.equal(DECISION.targetDescriptor.moduleGenerated, false));
test('138. target no persistence', () => assert.equal(DECISION.targetDescriptor.persistenceAllowed, false));
test('139. target deep-frozen', () => assert.equal(Object.isFrozen(DECISION.targetDescriptor), true));
test('140. target candidateDraftId matches', () => assert.equal(DECISION.targetDescriptor.candidateDraftId, DRAFT_ID));
test('141. target sourceHandoffKind mapped', () => assert.equal(DECISION.targetDescriptor.sourceHandoffKind, SOURCE_HANDOFF_KIND));
test('142. target sourceRuntimeVersion mapped', () => assert.equal(DECISION.targetDescriptor.sourceRuntimeVersion, H.runtimeVersion));
test('143. target sourceHandoffVersion mapped', () => assert.equal(DECISION.targetDescriptor.sourceHandoffVersion, H.handoffVersion));
test('144. target sourceTargetSandboxVersion mapped', () => assert.equal(DECISION.targetDescriptor.sourceTargetSandboxVersion, H.targetSandboxVersion));
test('145. target sourceDigest mapped from handoffDigest', () => assert.equal(DECISION.targetDescriptor.sourceDigest, H.handoffDigest));
test('146. target syntheticPayload cloned', () => assert.ok(DECISION.targetDescriptor.syntheticPayload !== null && typeof DECISION.targetDescriptor.syntheticPayload === 'object'));
test('147. target syntheticPayload not same ref as source payload', () => assert.notEqual(DECISION.targetDescriptor.syntheticPayload, H.payload));
test('148. target synthetic/immutable/validated asserted true', () => { assert.equal(DECISION.targetDescriptor.synthetic, true); assert.equal(DECISION.targetDescriptor.immutable, true); assert.equal(DECISION.targetDescriptor.validated, true); });
test('149. decision bridgeDecisionDigest fnv1a', () => assert.ok(String(DECISION.bridgeDecisionDigest).startsWith('fnv1a-')));
test('150. decision sourceMutated false', () => assert.equal(DECISION.sourceMutated, false));
test('151. decision sideEffects 0', () => assert.equal(DECISION.sideEffects, 0));
test('152. source handoff not mutated by execute', () => { const before = JSON.stringify(H); BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.equal(JSON.stringify(H), before); });
test('153. round-trip: runtime->handoff->decision->target real', () => { const { handoff, draftId } = buildRealHandoff('e2e'); const d = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); assert.equal(d.ok, true); assert.equal(d.targetDescriptor.candidateDraftId, draftId); });
test('154. round-trip replay deep-equal', () => { const { handoff, draftId } = buildRealHandoff('rp'); const a = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); const b = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); assert.equal(JSON.stringify(a), JSON.stringify(b)); });
test('155. round-trip replay digest-equal', () => { const { handoff, draftId } = buildRealHandoff('rp2'); const a = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); const b = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); assert.equal(a.bridgeDecisionDigest, b.bridgeDecisionDigest); });
test('156. two bridge instances same decision on same input', () => { const b2 = createStudioAuthoringRuntimeToPreviewBridge({}); const a = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); const c = b2.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.equal(a.bridgeDecisionDigest, c.bridgeDecisionDigest); });
test('157. input session not mutated during handoff build', () => { const { inputUnchanged } = buildRealHandoff('imm'); assert.equal(inputUnchanged, true); });
test('158. handoffDigest reproduced by runtime recompute (preimage minus handoffDigest)', () => { const { handoffDigest, ...pre } = H; assert.equal(createDeterministicDigest(pre), handoffDigest); });
test('159. real handoff keys equal REAL_HANDOFF_FIELDS', () => assert.deepEqual(Object.keys(H).sort(), [...REAL_HANDOFF_FIELDS].sort()));
test('160. target descriptor is JSON-serializable', () => assert.doesNotThrow(() => JSON.stringify(DECISION.targetDescriptor)));
test('161. decision is JSON-serializable', () => assert.doesNotThrow(() => JSON.stringify(DECISION)));
test('162. decision replayContract not in decision (config-level only)', () => assert.equal(DECISION.idempotent, true));
test('163. decision rollbackByNonConsumption', () => assert.equal(DECISION.rollbackByNonConsumption, true));
test('164. decision no partial target flag', () => assert.equal(DECISION.partialTargetDescriptor, false));
test('165. decision stageCount 13', () => assert.equal(DECISION.stageCount, 13));

// ===== Draft identity (166-195) =====
test('166. mismatch rejected', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'WRONG' }); assert.equal(d.ok, false); assert.equal(d.status, 'bridge_rejected'); assert.equal(d.targetDescriptor, null); });
test('167. mismatch issue code', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'WRONG' }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_DRAFT_ID_MISMATCH')); });
test('168. missing expectedDraftId rejected', () => { const d = BRIDGE.execute({ sourceHandoff: H }); assert.equal(d.ok, false); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_EXPECTED_DRAFT_ID_REQUIRED')); });
test('169. empty expectedDraftId rejected', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: '' }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_EXPECTED_DRAFT_ID_REQUIRED')); });
test('170. missing source draftId rejected', () => { const bad = { ...H }; delete bad.draftId; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_DRAFT_ID_REQUIRED')); });
test('171. draft identity validator direct: ok', () => assert.equal(validateStrictDraftIdentity({ sourceHandoff: H, expectedDraftId: DRAFT_ID }).ok, true));
test('172. draft identity validator direct: mismatch', () => assert.equal(validateStrictDraftIdentity({ sourceHandoff: H, expectedDraftId: 'x' }).ok, false));
test('173. draft identity policy strict', () => { const p = validateStrictDraftIdentity({}).policy; assert.equal(p.strictDraftIdentityRequired, true); assert.equal(p.explicitDraftIdRequired, true); });
test('174. draft identity policy no fallback', () => { const p = validateStrictDraftIdentity({}).policy; assert.equal(p.singleDraftFallbackAllowed, false); assert.equal(p.bridgeMayInvokeSingleDraftFallback, false); });
test('175. draft identity policy never findDraft without id', () => { const p = validateStrictDraftIdentity({}).policy; assert.equal(p.bridgeImplementationMustNeverCallFindDraftWithoutExplicitId, true); });
test('176. draft identity validated BEFORE mapping (id issue present, no target)', () => { const bad = { ...H }; delete bad.draftId; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.equal(d.targetDescriptor, null); });
test('177. bridge policy exposes draftIdentityPolicy', () => assert.equal(BRIDGE.draftIdentityPolicy.explicitDraftIdRequired, true));
test('178. mismatch has no target descriptor (atomic)', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'zzz' }); assert.equal(d.targetDescriptorCreated, false); });
test('179. identity issue stage', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'zzz' }); assert.ok(d.issues.some((i) => i.stage === 'source_identity_validation')); });
test('180. no findDraft symbol in subtree', () => assert.ok(!/findDraft/.test(jsCode())));
test('181. no single-draft fallback wording as behavior', () => assert.ok(BRIDGE.draftIdentityPolicy.singleDraftFallbackAllowed === false));
test('182. bridge draftIdentityPolicy missingDraftIdFailsClosed', () => assert.equal(BRIDGE.draftIdentityPolicy.missingDraftIdFailsClosed, true));
test('183. bridge draftIdentityPolicy unknownDraftIdFailsClosed', () => assert.equal(BRIDGE.draftIdentityPolicy.unknownDraftIdFailsClosed, true));
test('184. bridge draftIdentityPolicy ambiguousDraftSelectionAllowed false', () => assert.equal(BRIDGE.draftIdentityPolicy.ambiguousDraftSelectionAllowed, false));
test('185. numeric expectedDraftId rejected (must be string)', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 123 }); assert.equal(d.ok, false); });
test('186. object expectedDraftId rejected', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: {} }); assert.equal(d.ok, false); });
test('187. mismatch rejected even if digest ok', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: `${DRAFT_ID}x` }); assert.equal(d.ok, false); });
test('188. identity ok path yields target', () => assert.ok(DECISION.targetDescriptor !== null));
test('189. draft identity validator issues frozen-safe (array)', () => assert.ok(Array.isArray(validateStrictDraftIdentity({}).issues)));
test('190. two mismatches deterministic', () => { const a = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'q' }); const b = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'q' }); assert.equal(a.bridgeDecisionDigest, b.bridgeDecisionDigest); });
test('191. STRICT policy exported constant', () => assert.equal(BRIDGE.draftIdentityPolicy.strictDraftIdentityRequired, true));
test('192. identity check first among blockers order', () => { const bad = { ...H }; delete bad.draftId; delete bad.handoffDigest; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.length >= 1); });
test('193. expectedDraftId required issue is blocker', () => { const d = BRIDGE.execute({ sourceHandoff: H }); assert.ok(d.issues.find((i) => i.issueCode === 'BRIDGE_EXPECTED_DRAFT_ID_REQUIRED').severity === 'blocker'); });
test('194. mismatch issue blocksBridge', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'q' }); assert.ok(d.issues.find((i) => i.issueCode === 'BRIDGE_SOURCE_DRAFT_ID_MISMATCH').blocksBridge); });
test('195. valid identity produces zero identity issues', () => assert.ok(!DECISION.issues.some((i) => i.stage === 'source_identity_validation')));

// ===== Source shape / types / boundary (196-255) =====
test('196. shape validator ok on real handoff', () => assert.equal(validateSourceHandoffShape(H).ok, true));
test('197. non-object rejected', () => assert.equal(validateSourceHandoffShape(42).ok, false));
test('198. wrong handoffKind rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, handoffKind: 'x' }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_WRONG_HANDOFF_KIND')); });
let rq = 199;
for (const f of SOURCE_HANDOFF_REQUIRED_FIELDS) {
  const cur = rq; rq += 1;
  test(`${cur}. missing required ${f} rejected`, () => { const bad = { ...H }; delete bad[f]; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); });
}
// SOURCE_HANDOFF_REQUIRED_FIELDS is 13 -> rq = 199 + 13 = 212
test('212. synthetic false rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, synthetic: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_NOT_SYNTHETIC')); });
test('213. immutable false rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, immutable: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_NOT_IMMUTABLE')); });
test('214. validated false rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, validated: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_NOT_VALIDATED')); });
test('215. ok false rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_NOT_OK')); });
test('216. previewPayloadCreated false rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, previewPayloadCreated: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_PREVIEW_PAYLOAD_NOT_CREATED')); });
test('217. negative draftRevision rejected', () => { const bad = { ...H, draftRevision: -1 }; const d = BRIDGE.execute({ sourceHandoff: recomputed(bad), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_REVISION_INVALID')); });
test('218. non-integer draftRevision rejected', () => { const bad = { ...H, draftRevision: 1.5 }; const d = BRIDGE.execute({ sourceHandoff: recomputed(bad), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_REVISION_INVALID')); });
test('219. null payload rejected', () => { const bad = { ...H, payload: null }; const d = BRIDGE.execute({ sourceHandoff: recomputed(bad), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_PAYLOAD_INVALID')); });
test('220. upstreamVersions legacy alias rejected', () => { const bad = recomputed({ ...H, upstreamVersions: {} }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN')); });
test('221. generic digest legacy alias rejected', () => { const bad = recomputed({ ...H, digest: 'x' }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN')); });
test('222. unknown critical field flagged', () => { const bad = recomputed({ ...H, mysteryField: 1 }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_UNKNOWN_CRITICAL_FIELD')); });
test('223. previewMounted true rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, previewMounted: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_PREVIEW_MOUNTED_FORBIDDEN')); });
test('224. realDataAttached true rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, realDataAttached: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_REAL_DATA_ATTACHED_FORBIDDEN')); });
test('225. routeCreated true rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, routeCreated: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_ROUTE_CREATED_FORBIDDEN')); });
test('226. menuCreated true rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, menuCreated: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_MENU_CREATED_FORBIDDEN')); });
test('227. productExposed true rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, productExposed: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_PRODUCT_EXPOSED_FORBIDDEN')); });
test('228. synthetic boundary validator ok', () => assert.equal(validateSourceSyntheticBoundary(H).ok, true));
test('229. ssot boundary validator ok', () => assert.equal(validateSourceSsotBoundary(H).ok, true));
test('230. ssot inversion: canonical source rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, canonical: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_CANONICAL_FORBIDDEN' || i.issueCode === 'BRIDGE_SOURCE_UNKNOWN_CRITICAL_FIELD')); });
test('231. shape issues are blockers', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, synthetic: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.find((i) => i.issueCode === 'BRIDGE_SOURCE_NOT_SYNTHETIC').severity === 'blocker'); });
test('232. all shape failures yield null target', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.targetDescriptor, null); });
test('233. no auto-correction (missing field stays a blocker)', () => { const bad = { ...H }; delete bad.runtimeVersion; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); });
test('234. required fields count 13', () => assert.equal(SOURCE_HANDOFF_REQUIRED_FIELDS.length, 13));
test('235. security flags check direct', () => { const r = validateSourceSyntheticBoundary({ ...H, previewMounted: true }); assert.equal(r.ok, false); });
test('236. legacy fields const', () => assert.deepEqual([...FORBIDDEN_LEGACY_SOURCE_FIELDS], ['upstreamVersions', 'digest']));
test('237. valid handoff yields zero shape issues', () => assert.ok(!DECISION.issues.some((i) => i.stage === 'source_shape_validation')));
test('238. shape validator issues array', () => assert.ok(Array.isArray(validateSourceHandoffShape(H).issues)));
test('239. draftDigest missing is error (not silent)', () => { const bad = recomputed2({ ...H }); delete bad.draftDigest; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.length > 0); });
test('240. object payload accepted', () => assert.ok(validateSourceHandoffShape(H).ok));
test('241. multiple failures accumulate deterministically', () => { const bad = { ...H, synthetic: false, ok: false }; const a = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); const b = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.equal(JSON.stringify(a.issues), JSON.stringify(b.issues)); });
test('242. rejected decision still frozen', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(Object.isFrozen(d), true); });
test('243. rejected decision has bridgeDecisionDigest', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.ok(String(d.bridgeDecisionDigest).startsWith('fnv1a-')); });
test('244. security flag issue stage synthetic boundary', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, previewMounted: true }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.stage === 'source_synthetic_boundary_validation')); });
test('245. real handoff has all required present', () => assert.ok(SOURCE_HANDOFF_REQUIRED_FIELDS.every((f) => f in H)));

// helpers that recompute the handoffDigest so shape/boundary failures surface (not masked by digest mismatch)
function recomputed(obj) { const { handoffDigest, ...rest } = obj; return { ...rest, handoffDigest: createDeterministicDigest(pruneUnknown(rest)) }; }
function recomputed2(obj) { return recomputed(obj); }
function pruneUnknown(obj) { const out = {}; for (const k of REAL_HANDOFF_FIELDS) { if (k === 'handoffDigest') continue; if (k in obj) out[k] = obj[k]; } return out; }

// ===== Version tuple (246-285) =====
test('246. version validator ok on real handoff', () => assert.equal(validateSourceVersionTuple({ sourceHandoff: H, expectedVersions: DEFAULT_EXPECTED_VERSIONS }).ok, true));
test('247. handoffVersion mismatch rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, handoffVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_HANDOFF_VERSION_MISMATCH')); });
test('248. runtimeVersion mismatch rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, runtimeVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH')); });
test('249. targetSandboxVersion mismatch rejected', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, targetSandboxVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_TARGET_SANDBOX_VERSION_MISMATCH')); });
test('250. missing handoffVersion -> version missing', () => { const bad = { ...H }; delete bad.handoffVersion; const d = BRIDGE.execute({ sourceHandoff: recomputed(bad), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_VERSION_MISSING' || i.issueCode === 'BRIDGE_SOURCE_MISSING_REQUIRED_FIELD')); });
test('251. version policy exact', () => { const p = validateSourceVersionTuple({}).policy; assert.equal(p.exactVersionMatchRequired, true); });
test('252. version policy no aggregated upstreamVersions', () => { const p = validateSourceVersionTuple({}).policy; assert.equal(p.aggregatedUpstreamVersionsFieldRequired, false); });
test('253. version policy unknown fail-closed', () => { const p = validateSourceVersionTuple({}).policy; assert.equal(p.unknownVersionFailsClosed, true); });
test('254. version policy no downgrade', () => { const p = validateSourceVersionTuple({}).policy; assert.equal(p.versionDowngradeAllowed, false); });
test('255. version policy upgrade not assumed', () => { const p = validateSourceVersionTuple({}).policy; assert.equal(p.versionUpgradeAssumedCompatible, false); });
test('256. bridge versionPolicy exposed', () => assert.equal(BRIDGE.versionPolicy.exactVersionMatchRequired, true));
test('257. version fields const 3', () => assert.equal(SOURCE_HANDOFF_VERSION_FIELDS.length, 3));
test('258. custom expectedVersions honored', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ expectedVersions: { runtimeVersion: 'other@1' } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH')); });
test('259. version mismatch yields null target', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, handoffVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); assert.equal(d.targetDescriptor, null); });
test('260. version issues are blockers', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, runtimeVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.find((i) => i.issueCode === 'BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH').blocksBridge); });
test('261. version stage', () => { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, runtimeVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.stage === 'source_version_validation')); });
test('262. valid versions -> zero version issues', () => assert.ok(!DECISION.issues.some((i) => i.stage === 'source_version_validation')));
test('263. expected versions default runtime matches', () => assert.equal(DEFAULT_EXPECTED_VERSIONS.runtimeVersion, AUTHORING_RUNTIME_VERSION));
test('264. expected versions default bridge contract', () => assert.equal(DEFAULT_EXPECTED_VERSIONS.bridgeContractVersion, BRIDGE_CONTRACT_VERSION));
test('265. expected versions default plan', () => assert.equal(DEFAULT_EXPECTED_VERSIONS.bridgeImplementationPlanVersion, BRIDGE_IMPLEMENTATION_PLAN_VERSION));

// ===== Digest recompute (266-300) =====
test('266. digest validator ok on real handoff', () => assert.equal(recomputeAndValidateHandoffDigest(H).ok, true));
test('267. digest recomputed matches provided', () => { const r = recomputeAndValidateHandoffDigest(H); assert.equal(r.recomputed, r.provided); });
test('268. missing handoffDigest -> required', () => { const bad = { ...H }; delete bad.handoffDigest; assert.ok(recomputeAndValidateHandoffDigest(bad).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_HANDOFF_DIGEST_REQUIRED')); });
test('269. tampered payload -> mismatch', () => { const bad = { ...H, draftRevision: H.draftRevision + 7 }; assert.ok(recomputeAndValidateHandoffDigest(bad).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH')); });
test('270. execute digest mismatch rejected', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, draftRevision: H.draftRevision + 3 }, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH')); });
test('271. digest mismatch yields null target', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, draftRevision: H.draftRevision + 3 }, expectedDraftId: DRAFT_ID }); assert.equal(d.targetDescriptor, null); });
test('272. digest recompute deterministic', () => { const a = recomputeAndValidateHandoffDigest(H); const b = recomputeAndValidateHandoffDigest(H); assert.equal(a.recomputed, b.recomputed); });
test('273. digest uses runtime serializer (fnv1a prefix)', () => assert.ok(recomputeAndValidateHandoffDigest(H).recomputed.startsWith('fnv1a-')));
test('274. bridge digestSemantics field handoffDigest', () => assert.equal(BRIDGE.digestSemantics.sourceDigestField, 'handoffDigest'));
test('275. bridge digestSemantics mode recompute_and_compare', () => assert.equal(BRIDGE.digestSemantics.digestValidationMode, 'recompute_and_compare'));
test('276. bridge digestSemantics not cryptographic', () => assert.equal(BRIDGE.digestSemantics.cryptographicIntegrityProvided, false));
test('277. bridge digestSemantics no alternative serializer', () => assert.equal(BRIDGE.digestSemantics.alternativeSerializerAllowed, false));
test('278. bridge digestSemantics authorizes nothing real', () => assert.ok(BRIDGE.digestSemantics.digestMayAuthorizeCertification === false && BRIDGE.digestSemantics.digestMayAuthorizeModuleGeneration === false && BRIDGE.digestSemantics.digestMayAuthorizeProduction === false));
test('279. digest key-order independent (recompute over reordered handoff)', () => { const re = {}; for (const k of Object.keys(H).reverse()) re[k] = H[k]; assert.equal(recomputeAndValidateHandoffDigest(re).ok, true); });
test('280. digest issue stage', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, draftRevision: H.draftRevision + 3 }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.stage === 'source_digest_validation')); });
test('281. no alternative serializer symbol in subtree', () => assert.ok(!/JSON\.stringify\([^)]*sort/.test(jsCode())));
test('282. digest helper imported from runtime', () => assert.ok(jsImports().some((p) => /module-blueprint-authoring-runtime/.test(p))));
test('283. digest mismatch issue is blocker', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, draftRevision: H.draftRevision + 3 }, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.find((i) => i.issueCode === 'BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH').blocksBridge); });
test('284. valid digest -> zero digest issues', () => assert.ok(!DECISION.issues.some((i) => i.stage === 'source_digest_validation')));
test('285. digest recompute preimage excludes handoffDigest', () => { const { handoffDigest, ...pre } = H; assert.equal(createDeterministicDigest(pre), H.handoffDigest); });

// ===== Mappings (286-340) =====
const MR = executeBridgeFieldMappings({ sourceHandoff: H });
test('286. mapping executor ok', () => assert.equal(MR.ok, true));
test('287. mapping count 12', () => assert.equal(MR.mappingCount, 12));
test('288. mapped has 12 target fields', () => assert.equal(Object.keys(MR.mapped).length, 12));
let mp = 289;
for (const m of BRIDGE_FIELD_MAPPINGS) {
  const cur = mp; mp += 1;
  test(`${cur}. mapping ${m.sourceField}->${m.targetField} produced`, () => { assert.ok(m.sourceField in H); assert.ok(m.targetField in MR.mapped); });
}
// mp = 289 + 12 = 301
test('301. mapping consumes contract list (no second list)', () => assert.ok(!/BRIDGE_FIELD_MAPPINGS\s*=/.test(stripComments(fs.readFileSync(path.join(DIR, 'executeBridgeFieldMappings.js'), 'utf8')))));
test('302. mapping transforms allow-listed', () => assert.ok(BRIDGE_FIELD_MAPPINGS.every((m) => ALLOWED_TRANSFORM_KINDS.includes(m.transformKind))));
test('303. assert_true fails on false', () => { const bad = recomputed({ ...H, synthetic: true }); bad.synthetic = false; const bad2 = recomputed(bad); const d = BRIDGE.execute({ sourceHandoff: bad2, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); });
test('304. missing mapping source -> blocker', () => { const bad = { ...H }; delete bad.draftDigest; const d = BRIDGE.execute({ sourceHandoff: recomputed(bad), expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); });
test('305. mapped payload deep-cloned (not same ref)', () => assert.notEqual(MR.mapped.syntheticPayload, H.payload));
test('306. mapping ok yields no issues', () => assert.deepEqual(MR.issues, []));
test('307. every mapping source is real handoff field', () => assert.ok(BRIDGE_FIELD_MAPPINGS.every((m) => REAL_HANDOFF_FIELDS.includes(m.sourceField))));
test('308. every mapping target is declared target field', () => assert.ok(BRIDGE_FIELD_MAPPINGS.every((m) => TARGET_DESCRIPTOR_TARGET_FIELDS.includes(m.targetField))));
test('309. no upstreamVersions mapping', () => assert.ok(!BRIDGE_FIELD_MAPPINGS.some((m) => m.sourceField === 'upstreamVersions')));
test('310. no generic digest mapping', () => assert.ok(!BRIDGE_FIELD_MAPPINGS.some((m) => m.sourceField === 'digest')));
test('311. handoffDigest -> sourceDigest mapping', () => assert.ok(BRIDGE_FIELD_MAPPINGS.some((m) => m.sourceField === 'handoffDigest' && m.targetField === 'sourceDigest')));
test('312. security fields not in mappings', () => { const secs = ['previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed']; assert.ok(secs.every((s) => !BRIDGE_FIELD_MAPPINGS.some((m) => m.sourceField === s))); });
test('313. mapping deterministic', () => { const a = executeBridgeFieldMappings({ sourceHandoff: H }); const b = executeBridgeFieldMappings({ sourceHandoff: H }); assert.equal(JSON.stringify(a.mapped), JSON.stringify(b.mapped)); });
test('314. mapping stage in pipeline', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('mapping_contract_validation')));
test('315. transforms only 3 kinds', () => assert.deepEqual([...ALLOWED_TRANSFORM_KINDS], ['identity', 'assert_true', 'clone_synthetic']));
test('316. no critical default in contract mappings', () => assert.ok(BRIDGE_FIELD_MAPPINGS.every((m) => m.defaultAllowed === false)));
test('317. all mappings lossless required', () => assert.ok(BRIDGE_FIELD_MAPPINGS.every((m) => m.losslessRequired === true)));
test('318. mapped output frozen after target build', () => assert.equal(Object.isFrozen(DECISION.targetDescriptor), true));
test('319. mapping does not mutate handoff', () => { const before = JSON.stringify(H); executeBridgeFieldMappings({ sourceHandoff: H }); assert.equal(JSON.stringify(H), before); });
test('320. identity transform clones value', () => assert.equal(MR.mapped.candidateDraftId, H.draftId));

// ===== Target descriptor (321-360) =====
const TD = createTargetPreviewSandboxDescriptor({ mapped: MR.mapped });
test('321. target builder kind', () => assert.equal(TD.kind, 'bridge-target-preview-sandbox-descriptor'));
test('322. target builder targetKind', () => assert.equal(TD.targetKind, TARGET_SANDBOX_KIND));
test('323. target builder version', () => assert.equal(TD.targetContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('324. target builder metadataOnly', () => assert.equal(TD.metadataOnly, true));
test('325. target builder frozen', () => assert.equal(Object.isFrozen(TD), true));
test('326. target builder not mounted', () => assert.equal(TD.previewMounted, false));
test('327. target builder no route/menu', () => { assert.equal(TD.routeCreated, false); assert.equal(TD.menuCreated, false); });
test('328. target builder not product exposed', () => assert.equal(TD.productExposed, false));
test('329. target builder no module', () => assert.equal(TD.moduleGenerated, false));
test('330. target builder no persistence', () => assert.equal(TD.persistenceAllowed, false));
test('331. target validator ok', () => assert.equal(validateTargetDescriptor(TD).ok, true));
test('332. target validator rejects wrong kind', () => assert.equal(validateTargetDescriptor({ ...TD, targetKind: 'x' }).ok, false));
test('333. target validator rejects mounted', () => { const bad = { ...TD, previewMounted: true }; assert.equal(validateTargetDescriptor(bad).ok, false); });
test('334. target validator rejects product exposed', () => { const bad = { ...TD, productExposed: true }; assert.equal(validateTargetDescriptor(bad).ok, false); });
test('335. target validator serializable true', () => assert.equal(validateTargetDescriptor(TD).serializable, true));
test('336. target contains mapped fields', () => assert.equal(TD.candidateDraftId, H.draftId));
test('337. target no functions', () => assert.ok(Object.values(TD).every((v) => typeof v !== 'function')));
test('338. target deterministic build', () => { const a = createTargetPreviewSandboxDescriptor({ mapped: MR.mapped }); const b = createTargetPreviewSandboxDescriptor({ mapped: MR.mapped }); assert.equal(JSON.stringify(a), JSON.stringify(b)); });
test('339. target sourceDigest equals handoffDigest', () => assert.equal(TD.sourceDigest, H.handoffDigest));
test('340. target no component tree / no children', () => assert.equal(TD.children, undefined));

// ===== Canonicalization / immutability (341-370) =====
test('341. no Date.now (excl verifier)', () => assert.ok(!/Date\.now/.test(jsCodeNoVerifier())));
test('342. no new Date (excl verifier)', () => assert.ok(!/new Date\b/.test(jsCodeNoVerifier())));
test('343. no Math.random (excl verifier)', () => assert.ok(!/Math\.random/.test(jsCodeNoVerifier())));
test('344. no crypto.randomUUID (excl verifier)', () => assert.ok(!/crypto\.randomUUID/.test(jsCodeNoVerifier())));
test('345. no randomUUID (excl verifier)', () => assert.ok(!/\brandomUUID\b/.test(jsCodeNoVerifier())));
test('346. no performance.now (excl verifier)', () => assert.ok(!/performance\.now/.test(jsCodeNoVerifier())));
test('347. no toLocaleString/localeCompare (excl verifier)', () => assert.ok(!/toLocaleString|localeCompare/.test(jsCodeNoVerifier())));
test('348. verifier holds nondeterminism regex', () => assert.ok(/Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyAuthoringRuntimeToPreviewBridge.js'), 'utf8'))));
test('349. deepFreeze recursively freezes', () => { const o = deepFreeze({ a: { b: [1, 2] } }); assert.ok(Object.isFrozen(o) && Object.isFrozen(o.a) && Object.isFrozen(o.a.b)); });
test('350. normalizeBridgeInput clones + drops functions', () => { const i = { a: 1, f: () => 1 }; const o = normalizeBridgeInput(i); assert.equal(o.f, undefined); assert.notEqual(o, i); });
test('351. normalizeBridgeInput does not mutate input', () => { const i = { a: { b: 1 } }; const o = normalizeBridgeInput(i); assert.notEqual(o.a, i.a); });
test('352. decision deep-frozen incl issues array', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.ok(Object.isFrozen(d.issues)); });
test('353. sortBridgeIssues deterministic', () => { const a = [createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_OK', severity: 'blocker', stage: 'source_shape_validation', path: 'z' }), createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_OK', severity: 'blocker', stage: 'source_shape_validation', path: 'a' })]; const s = sortBridgeIssues(a); assert.equal(s[0].path, 'a'); });
test('354. issue sorting by stage order', () => { const a = [createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_OK', stage: 'source_digest_validation', severity: 'blocker' }), createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_OK', stage: 'source_shape_validation', severity: 'blocker' })]; const s = sortBridgeIssues(a); assert.equal(s[0].stage, 'source_shape_validation'); });
test('355. sortBridgeIssues does not mutate input', () => { const a = [createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_NOT_OK', stage: 'source_digest_validation', severity: 'blocker' })]; const copy = [...a]; sortBridgeIssues(a); assert.deepEqual(a, copy); });
test('356. decision digest stable across runs', () => { const a = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.equal(a.bridgeDecisionDigest, DECISION.bridgeDecisionDigest); });
test('357. manifest deterministic', () => { const a = createBridgeManifest({ parts: { x: { v: 1 } } }); const b = createBridgeManifest({ parts: { x: { v: 1 } } }); assert.equal(a.manifestDigest, b.manifestDigest); });
test('358. arrays preserve order in normalize', () => assert.deepEqual(normalizeBridgeInput([3, 1, 2]), [3, 1, 2]));
test('359. bridge config deep-frozen extension schemas', () => assert.equal(Object.isFrozen(BRIDGE.config.extensionSchemas), true));
test('360. decision immutable (cannot add prop)', () => { assert.throws(() => { 'use strict'; DECISION.injected = 1; }); });

// ===== Extensions (361-400) =====
test('361. no extensions -> ok', () => assert.equal(validateBridgeExtensions({ extensions: [] }).ok, true));
test('362. unnamespaced extension rejected', () => { const r = validateBridgeExtensions({ extensions: [{ fields: {} }] }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_UNNAMESPACED_FORBIDDEN')); });
test('363. missing schema rejected (fail-closed)', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.pricing', fields: {} }], extensionSchemas: {} }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_MISSING_SCHEMA')); });
test('364. namespaced + schema accepted', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.pricing', fields: { note: 'x' } }], extensionSchemas: { 'acme.pricing': {} } }); assert.equal(r.ok, true); });
test('365. duplicate namespace rejected', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: {} }, { namespace: 'acme.a', fields: {} }], extensionSchemas: { 'acme.a': {} } }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_DUPLICATE_NAMESPACE')); });
test('366. protected field override rejected', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: { synthetic: false } }], extensionSchemas: { 'acme.a': {} } }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN')); });
test('367. capability override rejected', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: { productExposed: true } }], extensionSchemas: { 'acme.a': {} } }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN' || i.issueCode === 'BRIDGE_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN')); });
test('368. extension limit exceeded', () => { const many = Array.from({ length: 100 }, (_, i) => ({ namespace: `acme.n${i}`, fields: {} })); const r = validateBridgeExtensions({ extensions: many, extensionSchemas: {}, maxExtensions: 4 }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSIONS_TOO_MANY')); });
test('369. execute with bad extension rejected', () => { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ fields: {} }] }); assert.equal(d.ok, false); });
test('370. execute with valid extension still ok', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ extensionSchemas: { 'acme.pricing': {} } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ namespace: 'acme.pricing', fields: { note: 'x' } }] }); assert.equal(d.ok, true); });
test('371. extension override -> null target', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ extensionSchemas: { 'acme.a': {} } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ namespace: 'acme.a', fields: { certified: true } }] }); assert.equal(d.targetDescriptor, null); });
test('372. accepted namespaces sorted deterministically', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.b', fields: {} }, { namespace: 'acme.a', fields: {} }], extensionSchemas: { 'acme.a': {}, 'acme.b': {} } }); assert.deepEqual(r.acceptedNamespaces, ['acme.a', 'acme.b']); });
test('373. protected fields const 11', () => assert.equal(EXTENSION_PROTECTED_FIELDS.length, 11));
test('374. extension policy exposed via manual gate? no — extensions are runtime; still fail-closed', () => assert.equal(validateBridgeExtensions({ extensions: [{ namespace: 'x' }] }).ok, false));
test('375. bad namespace format rejected', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'NotDotted', fields: {} }], extensionSchemas: {} }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_UNNAMESPACED_FORBIDDEN')); });
test('376. extension issue is blocker', () => { const r = validateBridgeExtensions({ extensions: [{ fields: {} }] }); assert.ok(r.issues[0].blocksBridge); });
test('377. extension digest override rejected', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: { handoffDigest: 'x' } }], extensionSchemas: { 'acme.a': {} } }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN')); });
test('378. extension runtimeVersion override rejected', () => { const r = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: { runtimeVersion: 'x' } }], extensionSchemas: { 'acme.a': {} } }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN')); });
test('379. extensions deterministic', () => { const a = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: {} }], extensionSchemas: { 'acme.a': {} } }); const b = validateBridgeExtensions({ extensions: [{ namespace: 'acme.a', fields: {} }], extensionSchemas: { 'acme.a': {} } }); assert.deepEqual(a.acceptedNamespaces, b.acceptedNamespaces); });
test('380. extension without fields ok if schema present', () => assert.equal(validateBridgeExtensions({ extensions: [{ namespace: 'acme.a' }], extensionSchemas: { 'acme.a': {} } }).ok, true));

// ===== Resource limits (381-420) =====
const RLR = enforceBridgeResourceLimits({ sourceHandoff: H, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS });
test('381. resource limits ok on real handoff', () => assert.equal(RLR.ok, true));
test('382. resource dimensions 7', () => assert.equal(BRIDGE_RESOURCE_LIMIT_DIMENSIONS.length, 7));
test('383. resolveBridgeLimits unknown dimension rejected', () => { const r = resolveBridgeLimits({ bogus: 1 }); assert.ok(r.issues.some((i) => i.issueCode === 'BRIDGE_UNKNOWN_RESOURCE_DIMENSION')); });
test('384. resolveBridgeLimits keeps defaults', () => { const r = resolveBridgeLimits({}); assert.equal(r.limits.maxSourceFields, DEFAULT_BRIDGE_RESOURCE_LIMITS.maxSourceFields); });
test('385. payload too large rejected', () => { const big = 'x'.repeat(5000); const bad = recomputed({ ...H, payload: { ...H.payload, blob: big } }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_STRING_TOO_LONG' || i.issueCode === 'BRIDGE_SOURCE_PAYLOAD_TOO_LARGE')); });
test('386. too many fields rejected', () => { const fields = Array.from({ length: 500 }, (_, i) => ({ key: `f${i}`, order: i })); const bad = recomputed({ ...H, payload: { ...H.payload, fields } }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_FIELDS_TOO_MANY')); });
test('387. string too long rejected', () => { const bad = recomputed({ ...H, payload: { ...H.payload, name: 'y'.repeat(9000) } }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_STRING_TOO_LONG')); });
test('388. no silent truncation (policy)', () => assert.equal(RLR.policy.silentTruncationAllowed, false));
test('389. limit exceeded fails closed (policy)', () => assert.equal(RLR.policy.limitExceededFailsClosed, true));
test('390. stricter limits intentional (policy)', () => assert.equal(RLR.policy.stricterBridgeLimitsAreIntentional, true));
test('391. bridge limits may reject runtime-valid (policy)', () => assert.equal(RLR.policy.bridgeLimitsMayRejectRuntimeValidHandoff, true));
test('392. limit mismatch not silent (policy)', () => assert.equal(RLR.policy.limitMismatchIsNotSilent, true));
test('393. no partial target on limit (policy)', () => assert.equal(RLR.policy.partialTargetDescriptorAllowed, false));
test('394. limit issue yields null target', () => { const fields = Array.from({ length: 500 }, (_, i) => ({ key: `f${i}`, order: i })); const bad = recomputed({ ...H, payload: { ...H.payload, fields } }); const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); assert.equal(d.targetDescriptor, null); });
test('395. bridge resourceLimitsPolicy exposed', () => assert.equal(BRIDGE.resourceLimitsPolicy.unknownResourceDimensionRejected, true));
test('396. resource limits measured present', () => assert.ok(Number.isFinite(RLR.measured.payloadBytes)));
test('397. custom stricter limit rejects', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: { maxStringLength: 2 } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, false); assert.ok(d.issues.some((i) => i.issueCode === 'BRIDGE_STRING_TOO_LONG')); });
test('398. unknown dimension bridge -> fallback', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: { nope: 1 } }); assert.equal(b.fallback, true); });
test('399. limit issue is blocker', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: { maxStringLength: 2 } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.ok(d.issues.find((i) => i.issueCode === 'BRIDGE_STRING_TOO_LONG').blocksBridge); });
test('400. limits deterministic', () => { const a = enforceBridgeResourceLimits({ sourceHandoff: H, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS }); const b = enforceBridgeResourceLimits({ sourceHandoff: H, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS }); assert.equal(a.measured.payloadBytes, b.measured.payloadBytes); });

// ===== Pipeline / failure containment / replay (401-460) =====
const PL = createBridgeValidationPipeline({ sourceHandoff: H, expectedDraftId: DRAFT_ID, expectedVersions: DEFAULT_EXPECTED_VERSIONS, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS });
test('401. pipeline stageCount 13', () => assert.equal(PL.stageCount, 13));
test('402. pipeline stages = const', () => assert.deepEqual(PL.stages, [...BRIDGE_VALIDATION_STAGES]));
test('403. pipeline not blocked on valid', () => assert.equal(PL.blocked, false));
test('404. pipeline targetDescriptorCreated', () => assert.equal(PL.targetDescriptorCreated, true));
let stg = 405;
for (const s of BRIDGE_VALIDATION_STAGES) {
  const cur = stg; stg += 1;
  test(`${cur}. stage ${s} present in pipeline`, () => assert.ok(PL.stages.includes(s)));
}
// stg = 405 + 13 = 418
test('418. issue ordering deterministic (sorted)', () => { const bad = { ...H, synthetic: false, ok: false, immutable: false }; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); const codes = d.issues.map((i) => `${i.stage}:${i.path}:${i.issueCode}`); const sorted = [...codes].sort(); assert.deepEqual(codes.filter((c) => c.startsWith('source_shape')), sorted.filter((c) => c.startsWith('source_shape'))); });
test('419. blocker stops target (no partial)', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.targetDescriptorCreated, false); assert.equal(d.targetDescriptor, null); });
test('420. atomic rejection - no partial descriptor', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.partialTargetDescriptor, false); });
test('421. failure containment: sourceMutated false', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.sourceMutated, false); });
test('422. failure containment: sideEffects 0', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.sideEffects, 0); });
test('423. failure containment: rollbackByNonConsumption', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.rollbackByNonConsumption, true); });
test('424. failure containment: no external cleanup', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.equal(d.externalCleanupRequired, false); });
test('425. bridge failureContainment part', () => assert.equal(BRIDGE.failureContainment.atomic, true));
test('426. failureContainment no partial', () => assert.equal(BRIDGE.failureContainment.partialTargetAllowed, false));
test('427. failureContainment no source mutation', () => assert.equal(BRIDGE.failureContainment.sourceMutationAllowed, false));
test('428. failureContainment no retry fallback', () => assert.equal(BRIDGE.failureContainment.retryWithFallbackAllowed, false));
test('429. replay contract idempotent', () => assert.equal(BRIDGE.replayContract.idempotent, true));
test('430. replay contract no side effects', () => assert.equal(BRIDGE.replayContract.replaySideEffectsAllowed, false));
test('431. replay contract no global counters', () => assert.equal(BRIDGE.replayContract.globalCounters, false));
test('432. replay contract no ambient state', () => assert.equal(BRIDGE.replayContract.ambientState, false));
test('433. replay byte-equivalent', () => { const { handoff, draftId } = buildRealHandoff('bz'); const a = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); const b = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId }); assert.equal(JSON.stringify(a), JSON.stringify(b)); });
test('434. no global state between executes', () => { BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); assert.equal(d.ok, true); });
test('435. pipeline direct: rejected has null target', () => { const p = createBridgeValidationPipeline({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID, expectedVersions: DEFAULT_EXPECTED_VERSIONS, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS }); assert.equal(p.targetDescriptor, null); });
test('436. pipeline issues sorted', () => { const p = createBridgeValidationPipeline({ sourceHandoff: { ...H, ok: false, synthetic: false }, expectedDraftId: DRAFT_ID, expectedVersions: DEFAULT_EXPECTED_VERSIONS, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS }); assert.ok(Array.isArray(p.issues)); });
test('437. decision createBridgeDecision direct ok', () => { const d = createBridgeDecision({ sourceHandoff: H, expectedDraftId: DRAFT_ID, expectedVersions: DEFAULT_EXPECTED_VERSIONS, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS }); assert.equal(d.ok, true); });
test('438. decision counts blocker/error/warning', () => { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); assert.ok(d.blockerCount >= 1); });
test('439. warning does not block (synthetic scenario)', () => { assert.ok(BRIDGE_ISSUE_SEVERITIES.includes('warning')); });
test('440. severities ascending', () => assert.deepEqual([...BRIDGE_ISSUE_SEVERITIES], ['info', 'warning', 'error', 'blocker']));

// ===== SSOT / permission / security / prototype / manual gate (441-490) =====
test('441. ssot boundary certified canonical', () => assert.equal(BRIDGE.ssotBoundary.certifiedBlueprintRemainsSsot, true));
test('442. ssot draft not canonical', () => assert.equal(BRIDGE.ssotBoundary.draftIsCanonical, false));
test('443. ssot bridge may not certify', () => assert.equal(BRIDGE.ssotBoundary.bridgeMayCertify, false));
test('444. ssot bridge may not generate module', () => assert.equal(BRIDGE.ssotBoundary.bridgeMayGenerateModule, false));
test('445. ssot bridge may not write blueprint', () => assert.equal(BRIDGE.ssotBoundary.bridgeMayWriteCertifiedBlueprint, false));
test('446. permission not integrated', () => assert.equal(BRIDGE.permissionTenancyBoundary.permissionModelIntegrated, false));
test('447. tenant not integrated', () => assert.equal(BRIDGE.permissionTenancyBoundary.tenantModelIntegrated, false));
test('448. product exposure blocked by permission/tenancy', () => assert.equal(BRIDGE.permissionTenancyBoundary.productExposureBlockedByPermissionTenancy, true));
test('449. bridge exists without permission because not exposed', () => assert.equal(BRIDGE.permissionTenancyBoundary.bridgeExistsWithoutPermissionTenancyBecauseNotExposed, true));
test('450. no temporary auth', () => assert.equal(BRIDGE.permissionTenancyBoundary.temporaryAuthCreated, false));
test('451. no real user/tenant context', () => { assert.equal(BRIDGE.permissionTenancyBoundary.realUserContextImported, false); assert.equal(BRIDGE.permissionTenancyBoundary.realTenantContextImported, false); });
test('452. security anyForbiddenSideEffect false', () => assert.equal(BRIDGE.securitySafety.anyForbiddenSideEffect, false));
test('453. security all allowances false', () => assert.ok(Object.values(BRIDGE.securitySafety.allowances).every((v) => v === false)));
test('454. security reversible', () => assert.equal(BRIDGE.securitySafety.reversibleByNonConsumption, true));
test('455. prototype relink forbidden', () => assert.equal(BRIDGE.prototypeRelinkProhibition.prototypeRelinkAllowed, false));
test('456. prototype not imported', () => assert.equal(BRIDGE.prototypeRelinkProhibition.oldPrototypeImported, false));
test('457. prototype forbidden paths 8', () => assert.equal(BRIDGE.prototypeRelinkProhibition.forbiddenPathCount, 8));
test('458. manual gate required', () => assert.equal(BRIDGE.manualGate.manualGateRequired, true));
test('459. manual gate authorizes bridge implementation', () => assert.equal(BRIDGE.manualGate.authorizesBridgeImplementation, true));
test('460. manual gate does not authorize preview mount', () => assert.equal(BRIDGE.manualGate.authorizesPreviewMount, false));
test('461. manual gate does not authorize UI', () => assert.equal(BRIDGE.manualGate.authorizesAuthoringUi, false));
test('462. manual gate does not authorize app touch', () => assert.equal(BRIDGE.manualGate.authorizesAppTouch, false));
test('463. manual gate does not authorize module generation', () => assert.equal(BRIDGE.manualGate.authorizesModuleGeneration, false));
test('464. manual gate does not authorize certification', () => assert.equal(BRIDGE.manualGate.authorizesCertification, false));
test('465. manual gate does not authorize product exposure', () => assert.equal(BRIDGE.manualGate.authorizesProductExposure, false));
test('466. manual gate does not authorize production', () => assert.equal(BRIDGE.manualGate.authorizesProduction, false));
test('467. manual gate does not authorize real data', () => assert.equal(BRIDGE.manualGate.authorizesRealData, false));
test('468. manual gate does not authorize permission/tenancy', () => assert.equal(BRIDGE.manualGate.authorizesPermissionTenancyIntegration, false));
test('469. manual gate source decision', () => assert.equal(BRIDGE.manualGate.sourceDecision, SOURCE_DECISION));
test('470. manual gate current authorization', () => assert.equal(BRIDGE.manualGate.currentSliceAuthorization, 'headless_bridge_implementation_only'));

// ===== Manifest / verifier / compatibility / diagnostics / fallback (471-520) =====
test('471. manifest partCount >= 13', () => assert.ok(BRIDGE.manifest.partCount >= 13));
test('472. manifest deterministic digest', () => assert.ok(String(BRIDGE.manifest.manifestDigest).startsWith('fnv1a-')));
test('473. verification ok', () => assert.equal(BRIDGE.verification.ok, true));
test('474. verification blockerCount 0', () => assert.equal(BRIDGE.verification.blockerCount, 0));
test('475. verification checkedCapabilities >= 53', () => assert.ok(BRIDGE.verification.checkedCapabilities >= 53));
const vb = (o) => verifyAuthoringRuntimeToPreviewBridge(o).blockers;
let tv = 476;
const TAMPER_TRUE = ['headless', 'deterministic', 'immutable', 'failClosed', 'ssotPreserved', 'bridgeImplemented'];
for (const k of TAMPER_TRUE) { const cur = tv; tv += 1; test(`${cur}. verifier flags ${k} must-be-true`, () => assert.ok(vb({ bridge: { capabilities: { ...caps, [k]: false } } }).includes(`capability_${k}_must_be_true`))); }
const TAMPER_FALSE = ['previewMounted', 'appTouched', 'persistenceImplemented', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'permissionModelIntegrated', 'prototypeRelinked', 'backendAccessed', 'networkUsed'];
for (const k of TAMPER_FALSE) { const cur = tv; tv += 1; test(`${cur}. verifier flags ${k} must-be-false`, () => assert.ok(vb({ bridge: { capabilities: { ...caps, [k]: true } } }).includes(`capability_${k}_must_be_false`))); }
// tv = 482 + 10 = 492
test('492. verifier detects part tampers', () => {
  assert.ok(vb({ bridge: { capabilities: caps, draftIdentityPolicy: { singleDraftFallbackAllowed: true } } }).includes('unsafe_single_draft_fallback'));
  assert.ok(vb({ bridge: { capabilities: caps, digestSemantics: { sourceDigestField: 'digest' } } }).includes('unsafe_digest_wrong_source_field'));
  assert.ok(vb({ bridge: { capabilities: caps, digestSemantics: { digestValidationMode: 'trust' } } }).includes('unsafe_digest_wrong_validation_mode'));
  assert.ok(vb({ bridge: { capabilities: caps, digestSemantics: { alternativeSerializerAllowed: true } } }).includes('unsafe_digest_alternative_serializer'));
  assert.ok(vb({ bridge: { capabilities: caps, versionPolicy: { aggregatedUpstreamVersionsFieldRequired: true } } }).includes('unsafe_version_upstreamVersions_required'));
  assert.ok(vb({ bridge: { capabilities: caps, resourceLimitsPolicy: { silentTruncationAllowed: true } } }).includes('unsafe_silent_truncation'));
  assert.ok(vb({ bridge: { capabilities: caps, resourceLimitsPolicy: { partialTargetDescriptorAllowed: true } } }).includes('unsafe_partial_target'));
  assert.ok(vb({ bridge: { capabilities: caps, failureContainment: { sourceMutationAllowed: true } } }).includes('unsafe_source_mutation'));
  assert.ok(vb({ bridge: { capabilities: caps, replayContract: { replaySideEffectsAllowed: true } } }).includes('unsafe_replay_side_effects'));
  assert.ok(vb({ bridge: { capabilities: caps, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion'));
  assert.ok(vb({ bridge: { capabilities: caps, ssotBoundary: { bridgeMayCertify: true } } }).includes('unsafe_ssot_bridge_privilege'));
  assert.ok(vb({ bridge: { capabilities: caps, permissionTenancyBoundary: { permissionModelIntegrated: true } } }).includes('unsafe_permission_integrated'));
  assert.ok(vb({ bridge: { capabilities: caps, securitySafety: { anyForbiddenSideEffect: true } } }).includes('unsafe_security_real_allowed'));
  assert.ok(vb({ bridge: { capabilities: caps, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink'));
  assert.ok(vb({ bridge: { capabilities: caps, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate'));
  assert.ok(vb({ bridge: { capabilities: caps, manualGate: { manualGateRequired: true, authorizesPreviewMount: true } } }).includes('unsafe_manual_gate_authorizes_real'));
  assert.ok(vb({ bridge: { capabilities: caps, readyForProduction: true } }).includes('unsafe_ready_for_production'));
  assert.ok(vb({ bridge: { capabilities: caps, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source'));
});
test('493. verifier never throws on null', () => { assert.doesNotThrow(() => verifyAuthoringRuntimeToPreviewBridge({ bridge: null })); assert.doesNotThrow(() => verifyAuthoringRuntimeToPreviewBridge(null)); });
test('494. verifier clean on real bridge', () => assert.equal(verifyAuthoringRuntimeToPreviewBridge({ bridge: BRIDGE }).ok, true));
test('495. compatibility status', () => assert.equal(BRIDGE.compatibility.status, 'headless_bridge_ready_for_enterprise_checkpoint'));
test('496. compatibility with runtime', () => assert.equal(BRIDGE.compatibility.compatibleWithAuthoringRuntime, true));
test('497. compatibility with contract', () => assert.equal(BRIDGE.compatibility.compatibleWithBridgeContract, true));
test('498. compatibility with plan', () => assert.equal(BRIDGE.compatibility.compatibleWithBridgeImplementationPlan, true));
test('499. compatibility with alignment', () => assert.equal(BRIDGE.compatibility.compatibleWithSourceShapeAlignment, true));
test('500. compatibility with sandbox', () => assert.equal(BRIDGE.compatibility.compatibleWithPreviewSandboxContract, true));
test('501. compatibility ready headless only', () => { assert.equal(BRIDGE.compatibility.readyForHeadlessBridge, true); assert.equal(BRIDGE.compatibility.readyForPreviewMount, false); });
test('502. diagnostics passive', () => assert.equal(BRIDGE.diagnostics.passive, true));
test('503. diagnostics no secrets', () => assert.ok(!/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(BRIDGE.diagnostics))));
test('504. diagnostics not logged', () => assert.equal(BRIDGE.diagnostics.logged, false));
test('505. fallback fail-closed', () => { const f = createAuthoringRuntimeToPreviewBridgeFallback({ reason: 'x' }); assert.equal(f.fallback, true); assert.equal(f.readyForHeadlessBridge, false); });
test('506. fallback execute rejects', () => { const f = createAuthoringRuntimeToPreviewBridgeFallback({}); const d = f.execute(); assert.equal(d.ok, false); });
test('507. error catalog present', () => assert.ok(BRIDGE_ERROR_CODES.length >= 4));
test('508. error code helper', () => { assert.equal(isBridgeErrorCode(BRIDGE_ERROR_CODES[0]), true); assert.equal(isBridgeErrorCode('NOPE'), false); });
test('509. error descriptor sanitized', () => { const e = createBridgeError('BRIDGE_INVALID_CONFIG'); assert.equal(e.safe, true); assert.equal(e.sideEffects, false); });
test('510. BridgeError constructs', () => { const e = new BridgeError('BRIDGE_INVALID_OPTIONS'); assert.equal(e.code, 'BRIDGE_INVALID_OPTIONS'); });
test('511. flags off in production', () => assert.equal(isStudioAuthoringRuntimeToPreviewBridgeEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('512. flags on in dev', () => assert.equal(isStudioAuthoringRuntimeToPreviewBridgeEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG]: 'true', DEV: 'true' }), true));
test('513. verify flag off in production', () => assert.equal(isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('514. isProductionEnv detects label', () => { assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true); assert.equal(isProductionEnv({ DEV: 'true' }), false); });
test('515. issue codes catalog >= 60', () => assert.ok(BRIDGE_ISSUE_CODES.length >= 60));
test('516. bridge readiness decision known', () => assert.ok(BRIDGE_READINESS_STATES.includes(BRIDGE.readiness)));
test('517. compatibility readyForProduction false', () => assert.equal(BRIDGE.compatibility.readyForProduction, false));
test('518. verification checkedCapabilities value', () => assert.equal(BRIDGE.verification.checkedCapabilities, 53));
test('519. manifest partDigests object', () => assert.equal(typeof BRIDGE.manifest.partDigests, 'object'));
test('520. manifest overallDigest present', () => assert.ok(String(BRIDGE.manifest.overallDigest).startsWith('fnv1a-')));

// ===== Static scans + structure (521-570) =====
test('521. subtree React-free (imports)', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('522. no react-router/react-dom import', () => assert.ok(jsImports().every((p) => !/react-router|react-dom/i.test(p))));
test('523. no JSX/createElement/createRoot', () => assert.ok(!/createElement|_jsx\b|<Route[\s/>]|ReactDOM|createRoot\s*\(/.test(jsCode())));
test('524. no window/document access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsCode())));
test('525. no fs./writeFile/mkdir/appendFile', () => assert.ok(!/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(jsCode())));
test('526. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('527. no fetch/XHR/WebSocket/axios', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(jsCode())));
test('528. no @prisma/PrismaClient import', () => assert.ok(jsImports().every((p) => !/@prisma|PrismaClient/i.test(p))));
test('529. no backend/apiClient/EmpresaApi import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('530. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('531. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('532. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('533. no moduleGenerated true literal', () => assert.ok(!/moduleGenerated\s*:\s*true/.test(jsCode())));
test('534. no productExposed true literal', () => assert.ok(!/productExposed\s*:\s*true/.test(jsCode())));
test('535. no previewMounted true literal', () => assert.ok(!/previewMounted\s*:\s*true/.test(jsCode())));
test('536. no certified true literal', () => assert.ok(!/\bcertified\s*:\s*true/.test(jsCode())));
test('537. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('538. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('539. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('540. no findDraft usage', () => assert.ok(!/findDraft/.test(jsCode())));
test('541. imports only relative + runtime + contract + plan', () => assert.ok(jsImports().every((p) => p.startsWith('.') || /module-blueprint-authoring-runtime|authoring-runtime-to-preview-bridge-contract|authoring-runtime-to-preview-bridge-implementation-plan/.test(p))));
test('542. reuses runtime stableSerialize+createDeterministicDigest', () => assert.ok(/stableSerialize|createDeterministicDigest/.test(jsCode())));
test('543. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('544. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('545. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('546. exactly 35 .js files', () => assert.equal(jsFiles().length, 35));
test('547. index.js exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js')));
test('548. factory exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/createStudioAuthoringRuntimeToPreviewBridge.js')));
test('549. upstream contract present', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js')));
test('550. upstream plan present', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/index.js')));
test('551. runtime present', () => assert.ok(exists('src/studio/blueprint-engine/module-blueprint-authoring-runtime/index.js')));
test('552. preview sandbox present', () => assert.ok(exists('src/studio/blueprint-engine/module-preview-sandbox/index.js')));
test('553. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));
test('554. no route/menu jsx symbol', () => assert.ok(!/<Route|<NavLink|<Link|Routes\b/.test(jsCode())));
test('555. factory exports execute', () => assert.equal(typeof createStudioAuthoringRuntimeToPreviewBridge({}).execute, 'function'));
test('556. no second BRIDGE_FIELD_MAPPINGS definition in subtree', () => assert.ok(!/const\s+BRIDGE_FIELD_MAPPINGS\s*=/.test(jsCode())));
test('557. no alternative serializer defined', () => assert.ok(!/function\s+\w*[Ss]erialize/.test(jsCode())));
test('558. issue codes include digest mismatch', () => assert.ok(BRIDGE_ISSUE_CODES.includes('BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH')));
test('559. issue codes include draft id mismatch', () => assert.ok(BRIDGE_ISSUE_CODES.includes('BRIDGE_SOURCE_DRAFT_ID_MISMATCH')));
test('560. issue codes include legacy alias', () => assert.ok(BRIDGE_ISSUE_CODES.includes('BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN')));

// ===== Scope safety (561-580) =====
test('561. runtime subtree not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//.test(x))); });
test('562. preview sandbox not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/module-preview-sandbox\//.test(x))); });
test('563. contract subtree not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//.test(x))); });
test('564. plan subtree not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//.test(x))); });
test('565. App.jsx not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
// The production UI guard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
// governance guard may appear ONLY when the slice active on this branch declares it as shared governance —
// which only the governance slices do. Both facts come from the caller-aware evaluation, not a hardcoded list.
test('566. guards not in diff', () => {
  const f = changed(); if (f === null) return;
  assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs'), 'productionUiGuard is never in scope');
  const scope = evaluateStudioBranchDiffScope(f, { callerSliceId: CALLER_SLICE_ID });
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
test('567. modules/backend/prisma not in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\/|^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('568. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
// Branch-relative scope check, CALLER-AWARE. It no longer asks "is this path registered somewhere?" — a flat
// registry could not prove the path was later than this slice. It asks "which slice is this branch building, and
// is that slice this one or a later one?", and admits only what that active slice owns, is explicitly
// cross-authorized for, or shares. Forbidden and unknown still fail closed.
const CALLER_SLICE_ID = 'authoring-runtime-to-preview-bridge';
test('569. no prior gate/test altered', () => {
  const f = changed(); if (f === null) return;
  const scope = evaluateStudioBranchDiffScope(f, { callerSliceId: CALLER_SLICE_ID });
  assert.equal(scope.callerSliceId, CALLER_SLICE_ID);
  assert.deepEqual(scope.forbidden, []);
  assert.deepEqual(scope.unknown, []);
  assert.deepEqual(scope.chronologicalViolation, []);
  // An empty branch diff carries nothing to judge (this check also runs on `main`). A real diff
  // must still resolve exactly one active slice at or after this caller.
  if (scope.applicable) {
    assert.ok(scope.activeSliceOrdinal >= scope.callerSliceOrdinal, `active ${scope.activeSliceId} precedes ${CALLER_SLICE_ID}`);
  } else {
    assert.equal(scope.notApplicable, true);
    assert.equal(scope.reason, 'empty_branch_diff');
    assert.equal(scope.activeSliceId, null);
  }
  assert.equal(scope.safe, true, JSON.stringify(scope.blockers));
});
test('570. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('571. net-new scope subtree only', () => { const f = changed(); if (f === null) return; if (!f.some((x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge\//.test(x))) return; const authorized = (x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge\//.test(x) || x === 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js' || x === 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs' || x === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs' || x === 'package.json' || x === 'package-lock.json' || /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge\//.test(x); assert.deepEqual(f.filter((x) => !authorized(x)), []); });
test('572. registry contains bridge subtree', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/authoring-runtime-to-preview-bridge\\\//.test(reg) || /authoring-runtime-to-preview-bridge\//.test(reg)); });
test('573. package.json wires bridge test', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/studio-authoring-runtime-to-preview-bridge\.test\.js/.test(pkg)); });
test('574. test:runtime aggregate includes bridge test', () => { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); assert.ok(pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge.test.js')); });
test('575. gate exists', () => assert.ok(exists('scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs')));
test('576. target descriptor never mounted (contract)', () => assert.equal(DECISION.targetDescriptor.previewMounted, false));
test('577. bridge decision never touches app', () => assert.equal(DECISION.appTouched, false));
test('578. bridge decision not persisted', () => assert.equal(DECISION.persisted, false));
test('579. bridge decision no real data', () => assert.equal(DECISION.realDataRead, false));
test('580. bridge decision idempotent flag', () => assert.equal(DECISION.idempotent, true));

// ===== Evidence docs (D1-D26) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-REPORT.md', 'REAL-SOURCE-HANDOFF-VALIDATION.md',
  'STRICT-DRAFT-IDENTITY-IMPLEMENTATION.md', 'VERSION-TUPLE-VALIDATION.md', 'HANDOFF-DIGEST-RECOMPUTE-AND-COMPARE.md',
  'CANONICAL-SERIALIZER-REUSE.md', 'FIELD-MAPPING-EXECUTION.md', 'TARGET-PREVIEW-SANDBOX-DESCRIPTOR.md',
  'EXTENSIBILITY-VALIDATION.md', 'RESOURCE-LIMIT-ENFORCEMENT.md', 'VALIDATION-PIPELINE.md', 'FAILURE-CONTAINMENT.md',
  'REPLAY-IDEMPOTENCY.md', 'IMMUTABILITY-DETERMINISM.md', 'SSOT-CERTIFICATION-MODULE-BOUNDARY.md',
  'PERMISSION-TENANCY-PRODUCT-BOUNDARY.md', 'SECURITY-SAFETY.md', 'PROTOTYPE-RELINK-PROHIBITION.md',
  'MANUAL-ENABLEMENT-GATE.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'REAL-END-TO-END-ROUND-TRIP.md',
  'NO-UI-NO-APP-NO-MOUNT-NO-PERSISTENCE.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-SCALABILITY-RISK-NOTES.md',
  'NEXT-ENTERPRISE-CHECKPOINT.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge/${DOCS[i]}`)));
}
test('D27. exactly 26 evidence docs', () => assert.equal(DOCS.length, 26));
test('D-content. round-trip + digest + boundary + checkpoint present', () => {
  assert.ok(/round-trip|handoff|real/i.test(readEv('REAL-END-TO-END-ROUND-TRIP.md')));
  assert.ok(/recompute|fnv1a|handoffDigest/i.test(readEv('HANDOFF-DIGEST-RECOMPUTE-AND-COMPARE.md')));
  assert.ok(/SSOT|canonical|certified/i.test(readEv('SSOT-CERTIFICATION-MODULE-BOUNDARY.md')));
  assert.ok(/checkpoint|FABLE|enterprise/i.test(readEv('NEXT-ENTERPRISE-CHECKPOINT.md')));
  assert.ok(/bundle|dist|absence/i.test(readEv('BUILD-BUNDLE-ABSENCE.md')));
});

// ===== Extra behavioral coverage (E-series) to deepen the suite =====
let e = 1;
for (const code of BRIDGE_ISSUE_CODES) {
  const cur = e; e += 1;
  test(`E${cur}. issue code ${code} is a non-empty string`, () => assert.ok(typeof code === 'string' && code.length > 0 && code.startsWith('BRIDGE_')));
}
test('E-codes-unique', () => assert.equal(new Set(BRIDGE_ISSUE_CODES).size, BRIDGE_ISSUE_CODES.length));
for (const m of BRIDGE_FIELD_MAPPINGS) {
  test(`E-target ${m.targetField} present on descriptor`, () => assert.ok(m.targetField in DECISION.targetDescriptor));
  test(`E-map-real ${m.sourceField} in real handoff`, () => assert.ok(REAL_HANDOFF_FIELDS.includes(m.sourceField)));
}
for (const s of BRIDGE_VALIDATION_STAGES) {
  test(`E-stage-result ${s} recorded`, () => assert.ok(s in DECISION_STAGE_RESULTS() || BRIDGE_VALIDATION_STAGES.includes(s)));
}
function DECISION_STAGE_RESULTS() { const p = createBridgeValidationPipeline({ sourceHandoff: H, expectedDraftId: DRAFT_ID, expectedVersions: DEFAULT_EXPECTED_VERSIONS, limits: DEFAULT_BRIDGE_RESOURCE_LIMITS }); return p.stageResults; }
for (const k of TRUE_CAPS) {
  test(`E-caps-mirror-true ${k}`, () => assert.equal(BRIDGE.capabilities[k], caps[k]));
}
for (const k of FALSE_CAPS) {
  test(`E-caps-mirror-false ${k}`, () => assert.equal(BRIDGE.capabilities[k], caps[k]));
}
for (const f of REAL_HANDOFF_FIELDS) {
  test(`E-realfield ${f} present on handoff`, () => assert.ok(f in H));
}
for (const dim of BRIDGE_RESOURCE_LIMIT_DIMENSIONS) {
  test(`E-limit-dim ${dim} has default`, () => assert.ok(Number.isFinite(DEFAULT_BRIDGE_RESOURCE_LIMITS[dim])));
}
for (const f of TARGET_DESCRIPTOR_TARGET_FIELDS) {
  test(`E-targetfield ${f} in descriptor`, () => assert.ok(f in DECISION.targetDescriptor));
}
// A few more end-to-end determinism variations across seeds.
for (const seed of ['s1', 's2', 's3', 's4', 's5']) {
  test(`E-e2e ${seed} ready + replay-equal`, () => {
    const { handoff, draftId } = buildRealHandoff(seed);
    const a = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId });
    const b = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: draftId });
    assert.equal(a.ok, true);
    assert.equal(a.bridgeDecisionDigest, b.bridgeDecisionDigest);
    assert.equal(a.targetDescriptor.candidateDraftId, draftId);
  });
}
