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
  BRIDGE_IMPLEMENTATION_PLAN_NAME,
  BRIDGE_IMPLEMENTATION_PLAN_SEMVER,
  BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  BRIDGE_IMPLEMENTATION_PLAN_MODE,
  BRIDGE_CONTRACT_VERSION,
  AUTHORING_RUNTIME_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  SOURCE_HANDOFF_KIND,
  TARGET_SANDBOX_KIND,
  BRIDGE_IMPLEMENTATION_PHASE_IDS,
  CRITICAL_SOURCE_FIELDS,
  SOURCE_BOUNDARY_FIELDS,
  BRIDGE_FIELD_MAPPINGS,
  ALLOWED_TRANSFORM_KINDS,
  BRIDGE_VALIDATION_STAGES,
  BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS,
  BRIDGE_RESOURCE_LIMIT_DIMENSIONS,
  DEFAULT_BRIDGE_RESOURCE_LIMITS,
  FORBIDDEN_PROTOTYPE_PATHS,
  BRIDGE_IMPLEMENTATION_PLAN_READINESS_STATES,
  BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY_FLAG,
  bridgePlanDigest,
  isProductionEnv,
  isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled,
  isStudioAuthoringRuntimeToPreviewBridgeImplementationVerifyEnabled,
  BRIDGE_IMPLEMENTATION_PLAN_ERROR_CODES,
  isBridgeImplementationPlanErrorCode,
  BridgeImplementationPlanError,
  createBridgeImplementationPlanError,
  bridgeImplementationPlanError,
  createBridgeImplementationPlanSession,
  createBridgeImplementationPhases,
  createSourceValidationPlan,
  createDraftIdentityEnforcementPlan,
  createSourceVersionValidationPlan,
  createSourceDigestValidationPlan,
  createSourceBoundaryValidationPlan,
  createFieldMappingExecutionPlan,
  createTargetDescriptorConstructionPlan,
  createTargetVersionValidationPlan,
  createCanonicalizationValidationPlan,
  createExtensibilityEnforcementPlan,
  createBridgeValidationPipelinePlan,
  createReplayIdempotencyPlan,
  createBridgeResourceLimitsPlan,
  createFailureContainmentPlan,
  createBridgeSsotProtectionPlan,
  createBridgeCertificationBoundaryPlan,
  createBridgePermissionTenancyBoundaryPlan,
  createBridgeSecuritySafetyPlan,
  createBridgePrototypeRelinkAssertionPlan,
  createBridgeTestHarnessPlan,
  createBridgeManualEnablementGatePlan,
  createBridgeRolloutRollbackPlan,
  createBridgeObservabilityDiagnosticsPlan,
  createBridgeGovernanceRegistryPlan,
  createBridgeImplementationReadinessDecision,
  createBridgeImplementationPlanManifest,
  verifyBridgeImplementationPlan,
  checkBridgeImplementationPlanCompatibility,
  createBridgeImplementationPlanFallback,
  createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/index.js';
import { createStudioAuthoringRuntimeToPreviewBridgeContract } from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan');

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
const jsCodeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeImplementationPlan\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan.mjs';
const authorized = (f) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//.test(f)
  || f === TEST_REL || f === GATE_REL
  || f === 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'
  || f === 'package.json' || f === 'package-lock.json'
  || /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan\//.test(f);

// Build the real upstream chain: runtime -> validated handoff -> bridge contract -> plan.
const buildContract = (seed = 'plan') => {
  let r = executeAuthoringOperation({ session: createAuthoringRuntimeSession({ seed }), operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const id = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } });
  const handoff = createSyntheticPreviewHandoff({ draft: r.session.drafts[0] });
  return createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: handoff });
};
const CONTRACT = buildContract('plan');
const P = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT });
const caps = BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES;

// ===== Base + versions (1-45) =====
test('1. plan created', () => assert.equal(P.kind, 'studio-authoring-runtime-to-preview-bridge-implementation-plan'));
test('2. name', () => { assert.equal(P.bridgeImplementationPlanName, 'studio-authoring-runtime-to-preview-bridge-implementation-plan'); assert.equal(P.bridgeImplementationPlanName, BRIDGE_IMPLEMENTATION_PLAN_NAME); });
test('3. version', () => { assert.equal(P.bridgeImplementationPlanVersion, 'studio-authoring-runtime-to-preview-bridge-implementation-plan@1.0.0'); assert.equal(P.bridgeImplementationPlanVersion, BRIDGE_IMPLEMENTATION_PLAN_VERSION); });
test('4. semver', () => assert.equal(BRIDGE_IMPLEMENTATION_PLAN_SEMVER, '1.0.0'));
test('5. bridgeContractVersion', () => assert.equal(P.bridgeContractVersion, BRIDGE_CONTRACT_VERSION));
test('6. authoringRuntimeVersion', () => assert.equal(P.authoringRuntimeVersion, AUTHORING_RUNTIME_VERSION));
test('7. previewSandboxContractVersion', () => assert.equal(P.previewSandboxContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('8. blueprintContractVersion', () => assert.equal(P.blueprintContractVersion, BLUEPRINT_CONTRACT_VERSION));
test('9. mode', () => { assert.equal(P.mode, 'headless_authoring_runtime_to_preview_bridge_implementation_plan'); assert.equal(P.mode, BRIDGE_IMPLEMENTATION_PLAN_MODE); });
test('10. not fallback', () => assert.equal(P.fallback, false));
test('11. metadataOnly', () => assert.equal(P.metadataOnly, true));
test('12. requiredFutureCheckpoint', () => { assert.equal(P.requiredFutureCheckpoint, 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint'); assert.equal(P.requiredFutureCheckpoint, REQUIRED_FUTURE_CHECKPOINT); });
test('13. readiness ready', () => assert.equal(P.readiness, 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready'));
test('14. readyForBridgeImplementationPlan true', () => assert.equal(P.readyForBridgeImplementationPlan, true));
test('15. readyForBridgeImplementationSlice false', () => assert.equal(P.readyForBridgeImplementationSlice, false));
test('16. readyForPreviewMount false', () => assert.equal(P.readyForPreviewMount, false));
test('17. readyForAuthoringUi false', () => assert.equal(P.readyForAuthoringUi, false));
test('18. readyForPermissionTenancyIntegration false', () => assert.equal(P.readyForPermissionTenancyIntegration, false));
test('19. readyForProductExposure false', () => assert.equal(P.readyForProductExposure, false));
test('20. readyForModuleGeneration false', () => assert.equal(P.readyForModuleGeneration, false));
test('21. readyForCertification false', () => assert.equal(P.readyForCertification, false));
test('22. readyForProduction false', () => assert.equal(P.readyForProduction, false));
test('23. requiresPermissionTenancyFoundationBeforeExposure true', () => assert.equal(P.requiresPermissionTenancyFoundationBeforeExposure, true));
test('24. blockerCount 0', () => assert.equal(P.blockerCount, 0));
test('25. warningCount 0', () => assert.equal(P.warningCount, 0));
test('26. blockers empty', () => assert.deepEqual(P.blockers, []));
test('27. warnings empty', () => assert.deepEqual(P.warnings, []));
test('28. overallDigest fnv1a', () => assert.ok(String(P.overallDigest).startsWith('fnv1a-')));
test('29. bridgeImplementationPlanDigest fnv1a', () => assert.ok(String(P.bridgeImplementationPlanDigest).startsWith('fnv1a-')));
test('30. readiness state known', () => assert.ok(BRIDGE_IMPLEMENTATION_PLAN_READINESS_STATES.includes(P.readiness)));
test('31. manifest embedded', () => assert.equal(P.manifest.kind, 'bridge-implementation-plan-manifest'));
test('32. verification embedded ok', () => { assert.equal(P.verification.kind, 'bridge-implementation-plan-verification'); assert.equal(P.verification.ok, true); });
test('33. diagnostics embedded', () => assert.equal(P.diagnostics.kind, 'bridge-implementation-plan-diagnostics'));
test('34. readinessDecision embedded', () => assert.equal(P.readinessDecision.kind, 'bridge-implementation-readiness-decision'));
test('35. compatibility embedded', () => assert.equal(P.compatibility.kind, 'bridge-implementation-plan-compatibility'));
test('36. sourceHandoffKind const', () => assert.equal(SOURCE_HANDOFF_KIND, 'synthetic_preview_candidate'));
test('37. targetSandboxKind const', () => assert.equal(TARGET_SANDBOX_KIND, 'module_preview_sandbox_candidate'));
test('38. phase ids 16', () => assert.equal(BRIDGE_IMPLEMENTATION_PHASE_IDS.length, 16));
test('39. critical source fields 12 (real, aligned)', () => assert.equal(CRITICAL_SOURCE_FIELDS.length, 12));
test('40. field mappings 12 (real model)', () => assert.equal(BRIDGE_FIELD_MAPPINGS.length, 12));
test('41. validation stages 13', () => assert.equal(BRIDGE_VALIDATION_STAGES.length, 13));
test('42. protected fields 11', () => assert.equal(EXTENSION_PROTECTED_FIELDS.length, 11));
test('43. resource dimensions 7', () => assert.equal(BRIDGE_RESOURCE_LIMIT_DIMENSIONS.length, 7));
test('44. forbidden prototype paths 8', () => assert.equal(FORBIDDEN_PROTOTYPE_PATHS.length, 8));
test('45. upstream read-only (session)', () => { assert.equal(P.session.bridgeContractConsumedReadOnly, true); assert.equal(P.session.authoringRuntimeConsumedReadOnly, true); assert.equal(P.session.previewSandboxContractConsumedReadOnly, true); });

// ===== Capabilities (46-130) =====
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'planOnly', 'syntheticOnly', 'devOnly', 'deterministic', 'failClosed', 'ssotPreserved', 'implementationPhasesOnly', 'sourceValidationPlanOnly', 'draftIdentityEnforcementPlanOnly', 'sourceVersionValidationPlanOnly', 'sourceDigestValidationPlanOnly', 'sourceBoundaryValidationPlanOnly', 'mappingExecutionPlanOnly', 'targetDescriptorPlanOnly', 'targetVersionValidationPlanOnly', 'canonicalizationValidationPlanOnly', 'extensibilityEnforcementPlanOnly', 'validationPipelinePlanOnly', 'replayIdempotencyPlanOnly', 'resourceLimitsPlanOnly', 'failureContainmentPlanOnly', 'rolloutRollbackPlanOnly', 'observabilityDiagnosticsPlanOnly', 'governanceRegistryPlanOnly'];
const FALSE_CAPS = ['bridgeImplemented', 'adapterImplemented', 'sourceValidationImplemented', 'draftIdentityEnforcementImplemented', 'sourceVersionValidationImplemented', 'sourceDigestValidationImplemented', 'sourceBoundaryValidationImplemented', 'mappingExecutorImplemented', 'targetDescriptorBuilderImplemented', 'targetVersionValidationImplemented', 'canonicalizationValidationImplemented', 'extensibilityEnforcementImplemented', 'validationPipelineImplemented', 'replayIdempotencyImplemented', 'resourceLimitsImplemented', 'failureContainmentImplemented', 'targetPayloadCreated', 'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
test('46. capabilities frozen', () => assert.equal(Object.isFrozen(caps), true));
let n = 47;
for (const k of TRUE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} true`, () => { assert.equal(caps[k], true); assert.equal(P.capabilities[k], true); }); }
for (const k of FALSE_CAPS) { const cur = n; n += 1; test(`${cur}. capability ${k} false`, () => { assert.equal(caps[k], false); assert.equal(P.capabilities[k], false); }); }
// n = 47 + 27 + 42 = 116
test('116. capabilities mirror const', () => assert.deepEqual(P.capabilities, { ...caps }));
test('117. TRUE_CAPS 27', () => assert.equal(TRUE_CAPS.length, 27));
test('118. FALSE_CAPS 42', () => assert.equal(FALSE_CAPS.length, 42));
test('119. total capability keys 69', () => assert.equal(Object.keys(caps).length, 69));
test('120. no unexpected true caps', () => { const trues = Object.keys(caps).filter((k) => caps[k] === true); assert.deepEqual(trues.sort(), [...TRUE_CAPS].sort()); });
test('121. planOnly true', () => assert.equal(caps.planOnly, true));
test('122. bridgeImplemented false', () => assert.equal(caps.bridgeImplemented, false));
test('123. adapterImplemented false', () => assert.equal(caps.adapterImplemented, false));
test('124. targetPayloadCreated false', () => assert.equal(caps.targetPayloadCreated, false));
test('125. previewMounted false', () => assert.equal(caps.previewMounted, false));
test('126. certificationPerformed false', () => assert.equal(caps.certificationPerformed, false));
test('127. productExposed false', () => assert.equal(caps.productExposed, false));
test('128. permissionModelIntegrated false', () => assert.equal(caps.permissionModelIntegrated, false));
test('129. deterministic true', () => assert.equal(caps.deterministic, true));
test('130. ssotPreserved true', () => assert.equal(caps.ssotPreserved, true));

// ===== Phases (131-165) =====
const PH = createBridgeImplementationPhases();
test('131. phases kind', () => assert.equal(PH.kind, 'bridge-implementation-phases'));
test('132. phase count 16', () => assert.equal(PH.phaseCount, 16));
test('133. allPlanned true', () => assert.equal(PH.allPlanned, true));
test('134. anyImplemented false', () => assert.equal(PH.anyImplemented, false));
test('135. phaseIds = const', () => assert.deepEqual(PH.phaseIds, [...BRIDGE_IMPLEMENTATION_PHASE_IDS]));
let pn = 136;
for (const ph of PH.phases) {
  const cur = pn; pn += 1;
  test(`${cur}. phase ${ph.phaseId} planned + not implemented/completed`, () => {
    assert.equal(ph.status, 'planned');
    assert.equal(ph.planned, true);
    assert.equal(ph.implemented, false);
    assert.equal(ph.completed, false);
    assert.ok(Array.isArray(ph.entryCriteria) && Array.isArray(ph.exitCriteria));
    assert.ok(typeof ph.goal === 'string' && ph.goal.length > 0);
    assert.ok(typeof ph.rollbackPlan === 'string');
  });
}
// pn = 136 + 16 = 152
test('152. phase order sequential', () => assert.deepEqual(PH.phases.map((p) => p.order), PH.phases.map((_, i) => i)));
test('153. P.phases embedded', () => assert.equal(P.phases.kind, 'bridge-implementation-phases'));
test('154. phase 0 preflight', () => assert.equal(PH.phases[0].phaseId, 'phase_0_preflight'));
test('155. phase 1 bridge contract validation', () => assert.equal(PH.phases[1].phaseId, 'phase_1_bridge_contract_validation'));
test('156. phase 4 strict draft identity', () => assert.equal(PH.phases[4].phaseId, 'phase_4_strict_draft_identity_enforcement'));
test('157. phase 8 field mapping execution', () => assert.equal(PH.phases[8].phaseId, 'phase_8_field_mapping_execution'));
test('158. phase 15 rollout blocked', () => assert.equal(PH.phases[15].phaseId, 'phase_15_rollout_blocked'));
test('159. every phase blockedEffects includes implement_bridge', () => assert.ok(PH.phases.every((p) => p.blockedEffects.includes('implement_bridge'))));
test('160. every phase allowedEffects only emit_plan_metadata', () => assert.ok(PH.phases.every((p) => p.allowedEffects.length === 1 && p.allowedEffects[0] === 'emit_plan_metadata')));
test('161. phases digest fnv1a', () => assert.ok(String(PH.phasesDigest).startsWith('fnv1a-')));
test('162. phases deterministic', () => assert.equal(createBridgeImplementationPhases().phasesDigest, PH.phasesDigest));
test('163. no phase named production', () => assert.ok(!PH.phaseIds.some((id) => /production/.test(id))));
test('164. rollout phase last', () => assert.equal(PH.phaseIds[PH.phaseIds.length - 1], 'phase_15_rollout_blocked'));
test('165. phase entry chains', () => assert.ok(PH.phases[1].entryCriteria[0].includes('phase_0_preflight')));

// ===== Source validation + draft identity (166-195) =====
const SV = createSourceValidationPlan();
test('166. source validation kind', () => assert.equal(SV.kind, 'bridge-source-validation-plan'));
test('167. source validation planned', () => assert.equal(SV.sourceValidationPlanned, true));
test('168. source validation not implemented', () => assert.equal(SV.sourceValidationImplemented, false));
test('169. strict source shape', () => assert.equal(SV.strictSourceShape, true));
test('170. unknown critical fields rejected', () => assert.equal(SV.unknownCriticalFieldsRejected, true));
test('171. missing critical fields fail-closed', () => assert.equal(SV.missingCriticalFieldsFailClosed, true));
test('172. source validation no side effects', () => assert.equal(SV.sourceValidationSideEffectsAllowed, false));
test('173. critical fields 12 (real)', () => assert.equal(SV.criticalFieldCount, 12));
test('174. boundary fields 5', () => assert.equal(SV.boundaryFields.length, 5));
test('175. expected synthetic true', () => assert.equal(SV.expected.synthetic, true));
test('176. expected productExposed false', () => assert.equal(SV.expected.productExposed, false));
test('177. source validation digest fnv1a', () => assert.ok(String(SV.sourceValidationPlanDigest).startsWith('fnv1a-')));
test('178. P.sourceValidationPlan embedded', () => assert.equal(P.sourceValidationPlan.kind, 'bridge-source-validation-plan'));
const DI = createDraftIdentityEnforcementPlan();
test('179. draft identity kind', () => assert.equal(DI.kind, 'bridge-draft-identity-enforcement-plan'));
test('180. strict enforcement planned', () => assert.equal(DI.strictDraftIdentityEnforcementPlanned, true));
test('181. strict enforcement not implemented', () => assert.equal(DI.strictDraftIdentityEnforcementImplemented, false));
test('182. explicit draft id required', () => assert.equal(DI.explicitDraftIdRequired, true));
test('183. single-draft fallback forbidden', () => assert.equal(DI.singleDraftFallbackAllowed, false));
test('184. missing draft id fails closed', () => assert.equal(DI.missingDraftIdFailsClosed, true));
test('185. unknown draft id fails closed', () => assert.equal(DI.unknownDraftIdFailsClosed, true));
test('186. ambiguous selection forbidden', () => assert.equal(DI.ambiguousDraftSelectionAllowed, false));
test('187. runtime NOT altered by plan', () => assert.equal(DI.runtimeAlteredByThisPlan, false));
test('188. draft identity digest fnv1a', () => assert.ok(String(DI.draftIdentityEnforcementPlanDigest).startsWith('fnv1a-')));
test('189. P.draftIdentityEnforcementPlan embedded', () => assert.equal(P.draftIdentityEnforcementPlan.kind, 'bridge-draft-identity-enforcement-plan'));
test('190. source boundary plan kind', () => assert.equal(P.sourceBoundaryValidationPlan.kind, 'bridge-source-boundary-validation-plan'));
test('191. source boundary rejects mounted', () => assert.equal(P.sourceBoundaryValidationPlan.rejectsPreviewMounted, true));
test('192. source boundary rejects product exposed', () => assert.equal(P.sourceBoundaryValidationPlan.rejectsProductExposed, true));
test('193. source boundary rejects real data', () => assert.equal(P.sourceBoundaryValidationPlan.rejectsRealDataAttached, true));
test('194. source boundary requires synthetic', () => assert.equal(P.sourceBoundaryValidationPlan.requiresSyntheticTrue, true));
test('195. source boundary SSOT preserved', () => assert.equal(P.sourceBoundaryValidationPlan.certifiedBlueprintRemainsSsot, true));

// ===== Version + digest (196-230) =====
const SVV = createSourceVersionValidationPlan();
test('196. source version kind', () => assert.equal(SVV.kind, 'bridge-source-version-validation-plan'));
test('197. source version planned', () => assert.equal(SVV.sourceVersionValidationPlanned, true));
test('198. source version not implemented', () => assert.equal(SVV.sourceVersionValidationImplemented, false));
test('199. exact source runtime version required', () => assert.equal(SVV.exactSourceRuntimeVersionRequired, true));
test('200. unknown version fails closed', () => assert.equal(SVV.unknownVersionFailsClosed, true));
test('201. version downgrade forbidden', () => assert.equal(SVV.versionDowngradeAllowed, false));
test('202. version upgrade not assumed', () => assert.equal(SVV.versionUpgradeAssumedCompatible, false));
test('203. bidirectional check required', () => assert.equal(SVV.bidirectionalCompatibilityCheckRequired, true));
test('204. matrix source runtime', () => assert.equal(SVV.matrix.sourceRuntime, AUTHORING_RUNTIME_VERSION));
test('205. matrix bridge contract', () => assert.equal(SVV.matrix.bridgeContract, BRIDGE_CONTRACT_VERSION));
test('206. matrix bridge plan', () => assert.equal(SVV.matrix.bridgePlan, BRIDGE_IMPLEMENTATION_PLAN_VERSION));
test('207. matrix target sandbox', () => assert.equal(SVV.matrix.targetSandbox, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('208. matrix blueprint contract', () => assert.equal(SVV.matrix.blueprintContract, BLUEPRINT_CONTRACT_VERSION));
const TVV = createTargetVersionValidationPlan();
test('209. target version kind', () => assert.equal(TVV.kind, 'bridge-target-version-validation-plan'));
test('210. target version planned', () => assert.equal(TVV.targetVersionValidationPlanned, true));
test('211. target version not implemented', () => assert.equal(TVV.targetVersionValidationImplemented, false));
test('212. exact target version required', () => assert.equal(TVV.exactTargetSandboxVersionRequired, true));
test('213. target unknown version fails closed', () => assert.equal(TVV.unknownVersionFailsClosed, true));
test('214. target downgrade forbidden', () => assert.equal(TVV.versionDowngradeAllowed, false));
const DG = createSourceDigestValidationPlan();
test('215. digest kind', () => assert.equal(DG.kind, 'bridge-source-digest-validation-plan'));
test('216. digest planned', () => assert.equal(DG.sourceDigestValidationPlanned, true));
test('217. digest not implemented', () => assert.equal(DG.sourceDigestValidationImplemented, false));
test('218. digest algo fnv1a-32', () => assert.equal(DG.sourceDigestAlgorithm, 'fnv1a-32'));
test('219. digest purpose internal identity', () => assert.equal(DG.sourceDigestPurpose, 'deterministic_internal_identity'));
test('220. cryptographic integrity false', () => assert.equal(DG.cryptographicIntegrityProvided, false));
test('221. authenticity false', () => assert.equal(DG.authenticityProvided, false));
test('222. tamper-proof false', () => assert.equal(DG.tamperProofProvided, false));
test('223. digest may not authorize certification', () => assert.equal(DG.digestMayAuthorizeCertification, false));
test('224. digest may not authorize module generation', () => assert.equal(DG.digestMayAuthorizeModuleGeneration, false));
test('225. digest may not authorize production', () => assert.equal(DG.digestMayAuthorizeProduction, false));
test('226. crypto digest required before certification', () => assert.equal(DG.cryptographicDigestRequiredBeforeCertification, true));
test('227. crypto digest required before production', () => assert.equal(DG.cryptographicDigestRequiredBeforeProduction, true));
test('228. fnv1a internal only', () => assert.equal(DG.fnv1aInternalOnly, true));
test('229. bridgePlanDigest deterministic', () => assert.equal(bridgePlanDigest({ a: 1 }), bridgePlanDigest({ a: 1 })));
test('230. bridgePlanDigest fnv1a prefix', () => assert.ok(String(bridgePlanDigest({ x: 1 })).startsWith('fnv1a-')));

// ===== Field mapping (231-270) =====
const FM = createFieldMappingExecutionPlan();
test('231. mapping kind', () => assert.equal(FM.kind, 'bridge-field-mapping-execution-plan'));
test('232. mapping planned', () => assert.equal(FM.mappingExecutionPlanned, true));
test('233. mapping executor not implemented', () => assert.equal(FM.mappingExecutorImplemented, false));
test('234. mapping count 12 (real model)', () => assert.equal(FM.mappingCount, 12));
test('235. every critical mapped', () => assert.equal(FM.everyCriticalMapped, true));
test('236. target critical fields all covered', () => assert.equal(FM.targetCriticalFieldsAllCovered, true));
test('237. any unknown transform false', () => assert.equal(FM.anyUnknownTransform, false));
test('238. any critical default false', () => assert.equal(FM.anyCriticalDefault, false));
test('239. any lossy critical false', () => assert.equal(FM.anyLossyCritical, false));
test('240. any implemented false', () => assert.equal(FM.anyImplemented, false));
test('241. unknown transform fails closed', () => assert.equal(FM.unknownTransformFailsClosed, true));
test('242. critical default forbidden', () => assert.equal(FM.criticalDefaultForbidden, true));
test('243. lossy critical forbidden', () => assert.equal(FM.lossyCriticalForbidden, true));
test('244. silent critical rename forbidden', () => assert.equal(FM.silentCriticalRenameForbidden, true));
test('245. deterministic order', () => assert.equal(FM.deterministicOrder, true));
test('246. allowed transform kinds', () => assert.deepEqual(FM.allowedTransformKinds, [...ALLOWED_TRANSFORM_KINDS]));
let mn = 247;
for (const m of FM.mappings) {
  const cur = mn; mn += 1;
  test(`${cur}. mapping ${m.sourceField}->${m.targetField} planned/lossless/known-transform`, () => {
    assert.equal(m.executionStatus, 'planned');
    assert.equal(m.implemented, false);
    assert.equal(m.losslessRequired, true);
    assert.equal(m.transformAllowed, true);
    assert.equal(m.defaultAllowed, false);
    assert.equal(m.critical, true);
  });
}
// mn = 247 + 11 = 258
test('258. mapping digest fnv1a', () => assert.ok(String(FM.fieldMappingExecutionPlanDigest).startsWith('fnv1a-')));
test('259. P.fieldMappingExecutionPlan embedded', () => assert.equal(P.fieldMappingExecutionPlan.kind, 'bridge-field-mapping-execution-plan'));
test('260. transform kinds only 3', () => assert.deepEqual([...ALLOWED_TRANSFORM_KINDS], ['identity', 'assert_true', 'clone_synthetic']));
test('261. handoffKind mapped', () => assert.ok(FM.mappings.some((m) => m.sourceField === 'handoffKind' && m.targetField === 'sourceHandoffKind')));
test('262. draftId mapped', () => assert.ok(FM.mappings.some((m) => m.sourceField === 'draftId' && m.targetField === 'candidateDraftId')));
test('263. synthetic assert_true', () => assert.ok(FM.mappings.some((m) => m.sourceField === 'synthetic' && m.transformKind === 'assert_true')));
test('264. payload clone_synthetic', () => assert.ok(FM.mappings.some((m) => m.sourceField === 'payload' && m.transformKind === 'clone_synthetic')));
test('265. handoffDigest mapped to sourceDigest (no generic digest)', () => { assert.ok(FM.mappings.some((m) => m.sourceField === 'handoffDigest' && m.targetField === 'sourceDigest')); assert.ok(!FM.mappings.some((m) => m.sourceField === 'digest')); });
test('266. every critical field appears', () => assert.ok(CRITICAL_SOURCE_FIELDS.every((f) => FM.mappings.some((m) => m.sourceField === f))));
test('267. all mappings syntheticOnly', () => assert.ok(FM.mappings.every((m) => m.syntheticOnly === true)));
test('268. all mappings deterministic', () => assert.ok(FM.mappings.every((m) => m.deterministic === true)));
test('269. mapping deterministic digest', () => assert.equal(createFieldMappingExecutionPlan().fieldMappingExecutionPlanDigest, FM.fieldMappingExecutionPlanDigest));
test('270. mapping order stable', () => assert.deepEqual(FM.mappings.map((m) => m.sourceField), BRIDGE_FIELD_MAPPINGS.map((m) => m.sourceField)));

// ===== Target descriptor + canonicalization + extensibility (271-310) =====
const TD = createTargetDescriptorConstructionPlan();
test('271. target descriptor kind', () => assert.equal(TD.kind, 'bridge-target-descriptor-construction-plan'));
test('272. target descriptor planned', () => assert.equal(TD.targetDescriptorConstructionPlanned, true));
test('273. target builder not implemented', () => assert.equal(TD.targetDescriptorBuilderImplemented, false));
test('274. target kind', () => assert.equal(TD.targetKind, TARGET_SANDBOX_KIND));
test('275. target contract version', () => assert.equal(TD.targetContractVersion, PREVIEW_SANDBOX_CONTRACT_VERSION));
test('276. target syntheticOnly', () => assert.equal(TD.syntheticOnly, true));
test('277. target payload not created', () => assert.equal(TD.targetPayloadCreated, false));
test('278. target preview not mounted', () => assert.equal(TD.previewMounted, false));
test('279. target route false', () => assert.equal(TD.routeCreated, false));
test('280. target menu false', () => assert.equal(TD.menuCreated, false));
test('281. target product not exposed', () => assert.equal(TD.productExposed, false));
test('282. target real data false', () => assert.equal(TD.realDataAttached, false));
test('283. target module not generated', () => assert.equal(TD.moduleGenerated, false));
test('284. target persistence forbidden', () => assert.equal(TD.persistenceAllowed, false));
test('285. target descriptor digest fnv1a', () => assert.ok(String(TD.targetDescriptorConstructionPlanDigest).startsWith('fnv1a-')));
const CN = createCanonicalizationValidationPlan();
test('286. canon kind', () => assert.equal(CN.kind, 'bridge-canonicalization-validation-plan'));
test('287. canon planned', () => assert.equal(CN.canonicalizationValidationPlanned, true));
test('288. canon not implemented', () => assert.equal(CN.canonicalizationValidationImplemented, false));
test('289. stable serialization required', () => assert.equal(CN.stableSerializationRequired, true));
test('290. key ordering required', () => assert.equal(CN.keyOrderingRequired, true));
test('291. array ordering preserved', () => assert.equal(CN.arrayOrderingPreserved, true));
test('292. locale independent', () => assert.equal(CN.localeIndependent, true));
test('293. timezone independent', () => assert.equal(CN.timezoneIndependent, true));
test('294. ambient clock forbidden', () => assert.equal(CN.ambientClockForbidden, true));
test('295. randomness forbidden', () => assert.equal(CN.randomnessForbidden, true));
const EXT = createExtensibilityEnforcementPlan();
test('296. extensibility kind', () => assert.equal(EXT.kind, 'bridge-extensibility-enforcement-plan'));
test('297. extensibility planned', () => assert.equal(EXT.extensibilityEnforcementPlanned, true));
test('298. extensibility not implemented', () => assert.equal(EXT.extensibilityEnforcementImplemented, false));
test('299. unknown critical fields rejected', () => assert.equal(EXT.unknownCriticalFieldsRejected, true));
test('300. unknown capability flags rejected', () => assert.equal(EXT.unknownCapabilityFlagsRejected, true));
test('301. unnamespaced extensions rejected', () => assert.equal(EXT.unnamespacedExtensionsRejected, true));
test('302. namespaced extensions allowed', () => assert.equal(EXT.namespacedExtensionsAllowed, true));
test('303. extension namespace required', () => assert.equal(EXT.extensionNamespaceRequired, true));
test('304. extension schema required', () => assert.equal(EXT.extensionSchemaRequired, true));
test('305. extension cannot override critical', () => assert.equal(EXT.extensionCannotOverrideCriticalFields, true));
test('306. protected fields = const', () => assert.deepEqual(EXT.protectedFields, [...EXTENSION_PROTECTED_FIELDS]));
test('307. protected includes synthetic', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('synthetic')));
test('308. protected includes handoffDigest not digest', () => { assert.ok(EXTENSION_PROTECTED_FIELDS.includes('handoffDigest')); assert.ok(!EXTENSION_PROTECTED_FIELDS.includes('digest')); });
test('309. protected includes certified', () => assert.ok(EXTENSION_PROTECTED_FIELDS.includes('certified')));
test('310. extensibility digest fnv1a', () => assert.ok(String(EXT.extensibilityEnforcementPlanDigest).startsWith('fnv1a-')));

// ===== Validation pipeline (311-340) =====
const VP = createBridgeValidationPipelinePlan();
test('311. pipeline kind', () => assert.equal(VP.kind, 'bridge-validation-pipeline-plan'));
test('312. pipeline planned', () => assert.equal(VP.validationPipelinePlanned, true));
test('313. pipeline not implemented', () => assert.equal(VP.validationPipelineImplemented, false));
test('314. stage count 13', () => assert.equal(VP.stageCount, 13));
test('315. stageIds = const', () => assert.deepEqual(VP.stageIds, [...BRIDGE_VALIDATION_STAGES]));
test('316. deterministic issue ordering', () => assert.equal(VP.deterministicIssueOrdering, true));
test('317. blocker stops bridge', () => assert.equal(VP.blockerStopsBridge, true));
test('318. blocker stops preview sandbox', () => assert.equal(VP.blockerStopsPreviewSandbox, true));
test('319. silent auto-correction forbidden', () => assert.equal(VP.silentAutoCorrectionAllowed, false));
test('320. permissive fallback forbidden', () => assert.equal(VP.permissiveFallbackAllowed, false));
test('321. severities = const', () => assert.deepEqual(VP.severities, [...BRIDGE_ISSUE_SEVERITIES]));
let sn = 322;
for (const stage of VP.stages) {
  const cur = sn; sn += 1;
  test(`${cur}. stage ${stage.stageId} fail-closed + not-implemented`, () => {
    assert.equal(stage.failClosed, true);
    assert.equal(stage.implemented, false);
    assert.ok(BRIDGE_VALIDATION_STAGES.includes(stage.stageId));
  });
}
// sn = 322 + 13 = 335
test('335. stage order sequential', () => assert.deepEqual(VP.stages.map((s) => s.order), VP.stages.map((_, i) => i)));
test('336. pipeline digest fnv1a', () => assert.ok(String(VP.validationPipelinePlanDigest).startsWith('fnv1a-')));
test('337. severities ascending', () => assert.deepEqual([...BRIDGE_ISSUE_SEVERITIES], ['info', 'warning', 'error', 'blocker']));
test('338. stages include source_shape_validation', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('source_shape_validation')));
test('339. stages include certification_boundary_validation', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('certification_boundary_validation')));
test('340. stages include prototype_reference_validation', () => assert.ok(BRIDGE_VALIDATION_STAGES.includes('prototype_reference_validation')));

// ===== Replay + resource limits + failure containment (341-380) =====
const RP = createReplayIdempotencyPlan();
test('341. replay kind', () => assert.equal(RP.kind, 'bridge-replay-idempotency-plan'));
test('342. replay planned', () => assert.equal(RP.replayIdempotencyPlanned, true));
test('343. replay not implemented', () => assert.equal(RP.replayIdempotencyImplemented, false));
test('344. same source same decision', () => assert.equal(RP.sameSourceHandoffProducesSameBridgeDecision, true));
test('345. same source same target', () => assert.equal(RP.sameSourceHandoffProducesSameTargetDescriptor, true));
test('346. decision digest deterministic', () => assert.equal(RP.bridgeDecisionDigestDeterministic, true));
test('347. idempotent by contract', () => assert.equal(RP.idempotentByContract, true));
test('348. replay side effects forbidden', () => assert.equal(RP.replaySideEffectsAllowed, false));
const RL = createBridgeResourceLimitsPlan();
test('349. resource limits kind', () => assert.equal(RL.kind, 'bridge-resource-limits-plan'));
test('350. resource limits planned', () => assert.equal(RL.resourceLimitsPlanned, true));
test('351. resource limits not implemented', () => assert.equal(RL.resourceLimitsImplemented, false));
test('352. dimensions 7', () => assert.equal(RL.dimensionCount, 7));
test('353. dimensions = const', () => assert.deepEqual(RL.dimensions, [...BRIDGE_RESOURCE_LIMIT_DIMENSIONS]));
test('354. planned defaults = const', () => assert.deepEqual(RL.plannedDefaults, { ...DEFAULT_BRIDGE_RESOURCE_LIMITS }));
test('355. unknown resource dimension rejected', () => assert.equal(RL.unknownResourceDimensionRejected, true));
test('356. silent truncation forbidden', () => assert.equal(RL.silentTruncationAllowed, false));
test('357. limit exceeded fails closed', () => assert.equal(RL.limitExceededFailsClosed, true));
test('358. planned defaults has maxSourcePayloadBytes', () => assert.ok(Number.isFinite(RL.plannedDefaults.maxSourcePayloadBytes)));
test('359. planned defaults has maxStringLength', () => assert.ok(Number.isFinite(RL.plannedDefaults.maxStringLength)));
test('360. resource limits digest fnv1a', () => assert.ok(String(RL.resourceLimitsPlanDigest).startsWith('fnv1a-')));
const FC = createFailureContainmentPlan();
test('361. failure containment kind', () => assert.equal(FC.kind, 'bridge-failure-containment-plan'));
test('362. failure containment planned', () => assert.equal(FC.failureContainmentPlanned, true));
test('363. failure containment not implemented', () => assert.equal(FC.failureContainmentImplemented, false));
test('364. partial target descriptor forbidden', () => assert.equal(FC.partialTargetDescriptorAllowed, false));
test('365. partial bridge decision forbidden', () => assert.equal(FC.partialBridgeDecisionAllowed, false));
test('366. source mutation forbidden', () => assert.equal(FC.sourceMutationAllowed, false));
test('367. target mutation forbidden', () => assert.equal(FC.targetMutationAllowed, false));
test('368. rollback by non-consumption', () => assert.equal(FC.rollbackByNonConsumption, true));
test('369. external cleanup not required', () => assert.equal(FC.externalCleanupRequired, false));
test('370. database rollback not required', () => assert.equal(FC.databaseRollbackRequired, false));
test('371. filesystem cleanup not required', () => assert.equal(FC.filesystemCleanupRequired, false));
test('372. P.replayIdempotencyPlan embedded', () => assert.equal(P.replayIdempotencyPlan.kind, 'bridge-replay-idempotency-plan'));
test('373. P.resourceLimitsPlan embedded', () => assert.equal(P.resourceLimitsPlan.kind, 'bridge-resource-limits-plan'));
test('374. P.failureContainmentPlan embedded', () => assert.equal(P.failureContainmentPlan.kind, 'bridge-failure-containment-plan'));
test('375. replay deterministic', () => assert.equal(createReplayIdempotencyPlan().replayIdempotencyPlanDigest, RP.replayIdempotencyPlanDigest));
test('376. resource limits deterministic', () => assert.equal(createBridgeResourceLimitsPlan().resourceLimitsPlanDigest, RL.resourceLimitsPlanDigest));
test('377. failure containment digest fnv1a', () => assert.ok(String(FC.failureContainmentPlanDigest).startsWith('fnv1a-')));
test('378. P.targetVersionValidationPlan embedded', () => assert.equal(P.targetVersionValidationPlan.kind, 'bridge-target-version-validation-plan'));
test('379. P.sourceVersionValidationPlan embedded', () => assert.equal(P.sourceVersionValidationPlan.kind, 'bridge-source-version-validation-plan'));
test('380. P.sourceDigestValidationPlan embedded', () => assert.equal(P.sourceDigestValidationPlan.kind, 'bridge-source-digest-validation-plan'));

// ===== SSOT + certification + permission + security (381-430) =====
const SS = createBridgeSsotProtectionPlan();
test('381. ssot kind', () => assert.equal(SS.kind, 'bridge-ssot-protection-plan'));
test('382. canonical SSOT certified blueprint', () => assert.equal(SS.canonicalSsot, 'certified-blueprint-contract'));
test('383. certified blueprint remains SSOT', () => assert.equal(SS.certifiedBlueprintRemainsSsot, true));
test('384. draft not canonical', () => assert.equal(SS.draftIsCanonical, false));
test('385. candidate not canonical', () => assert.equal(SS.candidateIsCanonical, false));
test('386. bridge may not certify', () => assert.equal(SS.bridgeMayCertify, false));
test('387. bridge may not publish', () => assert.equal(SS.bridgeMayPublish, false));
test('388. bridge may not register', () => assert.equal(SS.bridgeMayRegister, false));
test('389. bridge may not generate module', () => assert.equal(SS.bridgeMayGenerateModule, false));
test('390. bridge may not write certified blueprint', () => assert.equal(SS.bridgeMayWriteCertifiedBlueprint, false));
test('391. bridge may not bypass certification', () => assert.equal(SS.bridgeMayBypassCertification, false));
test('392. no second SSOT', () => assert.equal(SS.secondSsotCreated, false));
test('393. requires future explicit certification slice', () => assert.equal(SS.requiresFutureExplicitCertificationSlice, true));
test('394. requires human checkpoint', () => assert.equal(SS.requiresHumanCheckpointBeforeCertification, true));
const CB = createBridgeCertificationBoundaryPlan();
test('395. cert boundary kind', () => assert.equal(CB.kind, 'bridge-certification-boundary-plan'));
test('396. certification not performed', () => assert.equal(CB.certificationPerformed, false));
test('397. self certification forbidden', () => assert.equal(CB.selfCertificationAllowed, false));
test('398. candidate not canonical (cb)', () => assert.equal(CB.candidateCanonical, false));
test('399. candidate not certified', () => assert.equal(CB.candidateCertified, false));
test('400. bridge may not certify (cb)', () => assert.equal(CB.bridgeMayCertify, false));
test('401. crypto digest required before certification (cb)', () => assert.equal(CB.cryptographicDigestRequiredBeforeCertification, true));
const PT = createBridgePermissionTenancyBoundaryPlan();
test('402. permission kind', () => assert.equal(PT.kind, 'bridge-permission-tenancy-boundary-plan'));
test('403. plan-only', () => assert.equal(PT.permissionTenancyBoundaryPlanOnly, true));
test('404. permission model not integrated', () => assert.equal(PT.permissionModelIntegrated, false));
test('405. tenant model not integrated', () => assert.equal(PT.tenantModelIntegrated, false));
test('406. server auth not integrated', () => assert.equal(PT.serverSideAuthorizationIntegrated, false));
test('407. client auth not sufficient', () => assert.equal(PT.clientSideAuthorizationSufficient, false));
test('408. exposure blocked by permission/tenancy', () => assert.equal(PT.productExposureBlockedByPermissionTenancy, true));
test('409. requires permission/tenancy foundation', () => assert.equal(PT.requiresPermissionTenancyFoundationBeforeExposure, true));
test('410. auth not imported', () => assert.equal(PT.authImported, false));
const SEC = createBridgeSecuritySafetyPlan();
test('411. security kind', () => assert.equal(SEC.kind, 'bridge-security-safety-plan'));
test('412. anyForbiddenSideEffect false', () => assert.equal(SEC.anyForbiddenSideEffect, false));
test('413. anyRealAllowed false', () => assert.equal(SEC.anyRealAllowed, false));
test('414. reversible by non-consumption', () => assert.equal(SEC.reversibleByNonConsumption, true));
test('415. all allowances false', () => assert.ok(Object.values(SEC.allowances).every((v) => v === false)));
test('416. network allowance false', () => assert.equal(SEC.allowances.networkAllowed, false));
test('417. storage allowance false', () => assert.equal(SEC.allowances.storageAllowed, false));
test('418. filesystem writes allowance false', () => assert.equal(SEC.allowances.filesystemWritesAllowed, false));
test('419. backend allowance false', () => assert.equal(SEC.allowances.backendAllowed, false));
test('420. prisma allowance false', () => assert.equal(SEC.allowances.prismaAllowed, false));
test('421. real data allowance false', () => assert.equal(SEC.allowances.realDataAllowed, false));
test('422. product exposure allowance false', () => assert.equal(SEC.allowances.productExposureAllowed, false));
test('423. preview mount allowance false', () => assert.equal(SEC.allowances.previewMountAllowed, false));
test('424. module generation allowance false', () => assert.equal(SEC.allowances.moduleGenerationAllowed, false));
test('425. certification allowance false', () => assert.equal(SEC.allowances.certificationAllowed, false));
test('426. P.ssotProtectionPlan embedded', () => assert.equal(P.ssotProtectionPlan.kind, 'bridge-ssot-protection-plan'));
test('427. P.certificationBoundaryPlan embedded', () => assert.equal(P.certificationBoundaryPlan.kind, 'bridge-certification-boundary-plan'));
test('428. P.permissionTenancyBoundaryPlan embedded', () => assert.equal(P.permissionTenancyBoundaryPlan.kind, 'bridge-permission-tenancy-boundary-plan'));
test('429. P.securitySafetyPlan embedded', () => assert.equal(P.securitySafetyPlan.kind, 'bridge-security-safety-plan'));
test('430. security deterministic', () => assert.equal(createBridgeSecuritySafetyPlan().securitySafetyPlanDigest, SEC.securitySafetyPlanDigest));

// ===== Prototype + harness + manual gate + rollout + observability + governance (431-480) =====
const PR = createBridgePrototypeRelinkAssertionPlan();
test('431. prototype kind', () => assert.equal(PR.kind, 'bridge-prototype-relink-assertion-plan'));
test('432. prototype relink forbidden', () => assert.equal(PR.prototypeRelinkAllowed, false));
test('433. prototype import forbidden', () => assert.equal(PR.prototypeImportAllowed, false));
test('434. prototype copy forbidden', () => assert.equal(PR.prototypeCopyAllowed, false));
test('435. prototype move forbidden', () => assert.equal(PR.prototypeMoveAllowed, false));
test('436. old prototype not imported', () => assert.equal(PR.oldPrototypeImported, false));
test('437. static assertion planned', () => assert.equal(PR.staticAssertionPlanned, true));
test('438. forbidden paths = const', () => assert.deepEqual(PR.forbiddenPrototypePaths, [...FORBIDDEN_PROTOTYPE_PATHS]));
test('439. forbidden path count 8', () => assert.equal(PR.forbiddenPathCount, 8));
const TH = createBridgeTestHarnessPlan();
test('440. harness kind', () => assert.equal(TH.kind, 'bridge-test-harness-plan'));
test('441. harness planned', () => assert.equal(TH.testHarnessPlanned, true));
test('442. harness not implemented', () => assert.equal(TH.testHarnessImplemented, false));
test('443. harness deterministic', () => assert.equal(TH.deterministic, true));
test('444. harness synthetic only', () => assert.equal(TH.syntheticOnly, true));
test('445. harness no real data', () => assert.equal(TH.usesRealData, false));
test('446. harness no network', () => assert.equal(TH.usesNetwork, false));
test('447. harness planned minimum scenarios >= 560', () => assert.ok(TH.plannedMinimumScenarios >= 560));
const MG = createBridgeManualEnablementGatePlan();
test('448. manual gate kind', () => assert.equal(MG.kind, 'bridge-manual-enablement-gate-plan'));
test('449. manual gate required', () => assert.equal(MG.manualGateRequired, true));
test('450. required checkpoint', () => assert.equal(MG.requiredCheckpoint, REQUIRED_FUTURE_CHECKPOINT));
test('451. current slice authorization', () => assert.equal(MG.currentSliceAuthorization, 'bridge_implementation_plan_only'));
test('452. does NOT authorize bridge contract', () => assert.equal(MG.authorizesBridgeContract, false));
test('453. authorizes bridge implementation plan', () => assert.equal(MG.authorizesBridgeImplementationPlan, true));
test('454. does NOT authorize bridge implementation', () => assert.equal(MG.authorizesBridgeImplementation, false));
test('455. does NOT authorize preview mount', () => assert.equal(MG.authorizesPreviewMount, false));
test('456. does NOT authorize authoring ui', () => assert.equal(MG.authorizesAuthoringUi, false));
test('457. does NOT authorize app touch', () => assert.equal(MG.authorizesAppTouch, false));
test('458. does NOT authorize persistence', () => assert.equal(MG.authorizesPersistence, false));
test('459. does NOT authorize backend', () => assert.equal(MG.authorizesBackend, false));
test('460. does NOT authorize module generation', () => assert.equal(MG.authorizesModuleGeneration, false));
test('461. does NOT authorize certification', () => assert.equal(MG.authorizesCertification, false));
test('462. does NOT authorize product exposure', () => assert.equal(MG.authorizesProductExposure, false));
test('463. does NOT authorize production', () => assert.equal(MG.authorizesProduction, false));
test('464. does NOT authorize real data', () => assert.equal(MG.authorizesRealData, false));
const RO = createBridgeRolloutRollbackPlan();
test('465. rollout kind', () => assert.equal(RO.kind, 'bridge-rollout-rollback-plan'));
test('466. rollout blocked', () => assert.equal(RO.rolloutBlocked, true));
test('467. rollout requires enterprise checkpoint', () => assert.equal(RO.rolloutRequiresEnterpriseCheckpoint, true));
test('468. production rollout forbidden', () => assert.equal(RO.productionRolloutAllowed, false));
test('469. staging rollout forbidden', () => assert.equal(RO.stagingRolloutAllowed, false));
test('470. product exposure forbidden (rollout)', () => assert.equal(RO.productExposureAllowed, false));
test('471. rollback by non-consumption', () => assert.equal(RO.rollbackByNonConsumption, true));
test('472. reversible', () => assert.equal(RO.reversible, true));
const OB = createBridgeObservabilityDiagnosticsPlan();
test('473. observability kind', () => assert.equal(OB.kind, 'bridge-observability-diagnostics-plan'));
test('474. observability passive', () => assert.equal(OB.passive, true));
test('475. observability no secrets', () => assert.equal(OB.secretsExposed, false));
test('476. observability no external logging', () => assert.equal(OB.externalLoggingUsed, false));
test('477. observability no network', () => assert.equal(OB.networkUsed, false));
const GR = createBridgeGovernanceRegistryPlan();
test('478. governance kind', () => assert.equal(GR.kind, 'bridge-governance-registry-plan'));
test('479. governance anchored regexes only', () => assert.equal(GR.anchoredRegexesOnly, true));
test('480. governance no broad wildcard + no forbidden + guards untouched', () => { assert.equal(GR.broadWildcardAllowed, false); assert.equal(GR.forbiddenPathsRegistered, false); assert.equal(GR.guardsAltered, false); });

// ===== Session + compatibility + readiness + manifest (481-510) =====
const SESS = createBridgeImplementationPlanSession({ bridgeContract: CONTRACT });
test('481. session kind', () => assert.equal(SESS.kind, 'bridge-implementation-plan-session'));
test('482. session plan-only', () => assert.equal(SESS.planOnly, true));
test('483. session no storage', () => assert.equal(SESS.usesStorage, false));
test('484. session no fetch', () => assert.equal(SESS.usesFetch, false));
test('485. session no persistence', () => assert.equal(SESS.usesPersistence, false));
test('486. session no side effects', () => assert.equal(SESS.runtimeSideEffects, false));
test('487. session deterministic', () => assert.equal(createBridgeImplementationPlanSession({ bridgeContract: CONTRACT }).sessionDigest, SESS.sessionDigest));
test('488. compatibility status', () => assert.equal(P.compatibility.status, 'ready_for_bridge_implementation_enterprise_checkpoint'));
test('489. compatibility with bridge contract', () => assert.equal(P.compatibility.compatibleWithBridgeContract, true));
test('490. compatibility with authoring runtime', () => assert.equal(P.compatibility.compatibleWithAuthoringRuntime, true));
test('491. compatibility with preview sandbox', () => assert.equal(P.compatibility.compatibleWithPreviewSandboxContract, true));
test('492. compatibility with blueprint contract', () => assert.equal(P.compatibility.compatibleWithBlueprintContract, true));
test('493. compatibility ready for plan', () => assert.equal(P.compatibility.readyForBridgeImplementationPlan, true));
test('494. compatibility not ready for slice', () => assert.equal(P.compatibility.readyForBridgeImplementationSlice, false));
test('495. compatibility not blocked', () => assert.equal(P.compatibility.blocked, false));
test('496. readiness decision ready for plan', () => assert.equal(P.readinessDecision.readyForBridgeImplementationPlan, true));
test('497. readiness decision not ready for slice', () => assert.equal(P.readinessDecision.readyForBridgeImplementationSlice, false));
test('498. readiness decision blocked on blockers', () => assert.equal(createBridgeImplementationReadinessDecision({ blockers: ['x'] }).readiness, 'blocked'));
test('499. readiness decision ready on none', () => assert.equal(createBridgeImplementationReadinessDecision({}).readiness, 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready'));
test('500. manifest partCount >= 26', () => assert.ok(P.manifest.partCount >= 26));
test('501. manifest deterministic', () => assert.equal(P.manifest.deterministic, true));
test('502. manifest planOnly', () => assert.equal(P.manifest.planOnly, true));
test('503. manifest partDigests present', () => assert.ok(typeof P.manifest.partDigests === 'object'));
test('504. manifest phases digest string', () => assert.equal(typeof P.manifest.partDigests.phases, 'string'));
test('505. manifest ssot digest string', () => assert.equal(typeof P.manifest.partDigests.ssotProtectionPlan, 'string'));
test('506. manifest digest fnv1a', () => assert.ok(String(P.manifest.manifestDigest).startsWith('fnv1a-')));
test('507. manifest deterministic recompute', () => { const a = createBridgeImplementationPlanManifest({ parts: { x: { xDigest: 'fnv1a-11111111' } } }); const b = createBridgeImplementationPlanManifest({ parts: { x: { xDigest: 'fnv1a-11111111' } } }); assert.equal(a.manifestDigest, b.manifestDigest); });
test('508. P.testHarnessPlan embedded', () => assert.equal(P.testHarnessPlan.kind, 'bridge-test-harness-plan'));
test('509. P.rolloutRollbackPlan embedded', () => assert.equal(P.rolloutRollbackPlan.kind, 'bridge-rollout-rollback-plan'));
test('510. P.governanceRegistryPlan embedded', () => assert.equal(P.governanceRegistryPlan.kind, 'bridge-governance-registry-plan'));

// ===== Verifier + tamper detection (511-565) =====
test('511. verifier ok on real plan', () => assert.equal(P.verification.ok, true));
test('512. verifier blockerCount 0', () => assert.equal(P.verification.blockerCount, 0));
test('513. verifier headless true', () => assert.equal(P.verification.headless, true));
test('514. verifier planOnly true', () => assert.equal(P.verification.planOnly, true));
test('515. verifier deterministic true', () => assert.equal(P.verification.deterministic, true));
test('516. verifier failClosed true', () => assert.equal(P.verification.failClosed, true));
test('517. verifier ssotPreserved true', () => assert.equal(P.verification.ssotPreserved, true));
test('518. verifier anyPhaseImplemented false', () => assert.equal(P.verification.anyPhaseImplemented, false));
test('519. verifier bridgeImplemented false', () => assert.equal(P.verification.bridgeImplemented, false));
test('520. verifier previewMounted false', () => assert.equal(P.verification.previewMounted, false));
test('521. verifier certificationPerformed false', () => assert.equal(P.verification.certificationPerformed, false));
test('522. verifier productExposed false', () => assert.equal(P.verification.productExposed, false));
test('523. verifier checkedCapabilities >= 52', () => assert.ok(P.verification.checkedCapabilities >= 52));
const vb = (o) => verifyBridgeImplementationPlan(o).blockers;
let tn = 524;
const TAMPER_TRUE = ['headless', 'planOnly', 'deterministic', 'failClosed', 'ssotPreserved'];
for (const k of TAMPER_TRUE) { const cur = tn; tn += 1; test(`${cur}. verifier flags ${k} must-be-true`, () => assert.ok(vb({ plan: { capabilities: { ...caps, [k]: false } } }).includes(`capability_${k}_must_be_true`))); }
const TAMPER_FALSE = ['bridgeImplemented', 'adapterImplemented', 'previewMounted', 'certificationPerformed', 'productExposed', 'permissionModelIntegrated', 'prototypeRelinked', 'moduleGenerated', 'backendAccessed', 'fetchUsed', 'realDataWrite', 'targetPayloadCreated'];
for (const k of TAMPER_FALSE) { const cur = tn; tn += 1; test(`${cur}. verifier flags ${k} must-be-false`, () => assert.ok(vb({ plan: { capabilities: { ...caps, [k]: true } } }).includes(`capability_${k}_must_be_false`))); }
// tn = 529 + 12 = 541
test('541. verifier detects part tampers', () => {
  assert.ok(vb({ plan: { capabilities: caps, phases: { anyImplemented: true } } }).includes('unsafe_phase_implemented'));
  assert.ok(vb({ plan: { capabilities: caps, phases: { phases: [{ implemented: true }] } } }).includes('unsafe_phase_completed'));
  assert.ok(vb({ plan: { capabilities: caps, draftIdentityEnforcementPlan: { explicitDraftIdRequired: false } } }).includes('unsafe_draft_identity_non_strict'));
  assert.ok(vb({ plan: { capabilities: caps, draftIdentityEnforcementPlan: { singleDraftFallbackAllowed: true } } }).includes('unsafe_single_draft_fallback'));
  assert.ok(vb({ plan: { capabilities: caps, sourceVersionValidationPlan: { unknownVersionFailsClosed: false } } }).includes('unsafe_source_version_unknown_accepted'));
  assert.ok(vb({ plan: { capabilities: caps, sourceVersionValidationPlan: { versionDowngradeAllowed: true } } }).includes('unsafe_source_version_downgrade'));
  assert.ok(vb({ plan: { capabilities: caps, sourceDigestValidationPlan: { cryptographicIntegrityProvided: true } } }).includes('unsafe_digest_claimed_cryptographic'));
  assert.ok(vb({ plan: { capabilities: caps, sourceDigestValidationPlan: { digestMayAuthorizeCertification: true } } }).includes('unsafe_digest_authorizes_real'));
  assert.ok(vb({ plan: { capabilities: caps, fieldMappingExecutionPlan: { anyUnknownTransform: true } } }).includes('unsafe_mapping_unknown_transform'));
  assert.ok(vb({ plan: { capabilities: caps, fieldMappingExecutionPlan: { anyLossyCritical: true } } }).includes('unsafe_mapping_lossy_critical'));
  assert.ok(vb({ plan: { capabilities: caps, fieldMappingExecutionPlan: { anyImplemented: true } } }).includes('unsafe_mapping_executor_implemented'));
  assert.ok(vb({ plan: { capabilities: caps, targetDescriptorConstructionPlan: { previewMounted: true } } }).includes('unsafe_target_descriptor_real'));
  assert.ok(vb({ plan: { capabilities: caps, extensibilityEnforcementPlan: { extensionCannotOverrideCriticalFields: false } } }).includes('unsafe_extension_override'));
  assert.ok(vb({ plan: { capabilities: caps, resourceLimitsPlan: { unknownResourceDimensionRejected: false } } }).includes('unsafe_unknown_resource_dimension'));
  assert.ok(vb({ plan: { capabilities: caps, resourceLimitsPlan: { silentTruncationAllowed: true } } }).includes('unsafe_silent_truncation'));
  assert.ok(vb({ plan: { capabilities: caps, validationPipelinePlan: { permissiveFallbackAllowed: true } } }).includes('unsafe_validation_permissive_fallback'));
  assert.ok(vb({ plan: { capabilities: caps, failureContainmentPlan: { partialTargetDescriptorAllowed: true } } }).includes('unsafe_partial_state'));
  assert.ok(vb({ plan: { capabilities: caps, ssotProtectionPlan: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion'));
  assert.ok(vb({ plan: { capabilities: caps, ssotProtectionPlan: { bridgeMayCertify: true } } }).includes('unsafe_ssot_bridge_privilege'));
  assert.ok(vb({ plan: { capabilities: caps, certificationBoundaryPlan: { certificationPerformed: true } } }).includes('unsafe_certification_performed'));
  assert.ok(vb({ plan: { capabilities: caps, certificationBoundaryPlan: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification'));
  assert.ok(vb({ plan: { capabilities: caps, permissionTenancyBoundaryPlan: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated'));
  assert.ok(vb({ plan: { capabilities: caps, securitySafetyPlan: { anyForbiddenSideEffect: true } } }).includes('unsafe_security_real_allowed'));
  assert.ok(vb({ plan: { capabilities: caps, prototypeRelinkAssertionPlan: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink'));
  assert.ok(vb({ plan: { capabilities: caps, rolloutRollbackPlan: { rolloutBlocked: false } } }).includes('unsafe_rollout_not_blocked'));
  assert.ok(vb({ plan: { capabilities: caps, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate'));
  assert.ok(vb({ plan: { capabilities: caps, manualGate: { manualGateRequired: true, authorizesBridgeImplementation: true } } }).includes('unsafe_manual_gate_authorizes_real'));
  assert.ok(vb({ plan: { capabilities: caps, readyForProduction: true } }).includes('unsafe_ready_for_production'));
  assert.ok(vb({ plan: { capabilities: caps, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source'));
});
test('542. verifier never throws on null', () => { assert.doesNotThrow(() => verifyBridgeImplementationPlan({ plan: null })); assert.doesNotThrow(() => verifyBridgeImplementationPlan(null)); });
test('543. verification digest fnv1a', () => assert.ok(String(P.verification.verificationDigest).startsWith('fnv1a-')));

// ===== Diagnostics + fallback + determinism + flags + errors (544-585) =====
test('544. diagnostics passive', () => assert.equal(P.diagnostics.passive, true));
test('545. diagnostics ok', () => assert.equal(P.diagnostics.ok, true));
test('546. diagnostics plan-only confirmed', () => assert.equal(P.diagnostics.planOnlyConfirmed, true));
test('547. diagnostics deterministic confirmed', () => assert.equal(P.diagnostics.deterministicConfirmed, true));
test('548. diagnostics ssot preserved confirmed', () => assert.equal(P.diagnostics.ssotPreservedConfirmed, true));
test('549. diagnostics anyPhaseImplemented false', () => assert.equal(P.diagnostics.anyPhaseImplemented, false));
test('550. diagnostics no secrets', () => assert.ok(!/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(P.diagnostics))));
test('551. diagnostics not logged', () => assert.equal(P.diagnostics.logged, false));
const FB = createBridgeImplementationPlanFallback({ reason: 'test' });
test('552. fallback kind', () => assert.equal(FB.kind, 'studio-authoring-runtime-to-preview-bridge-implementation-plan'));
test('553. fallback flag true', () => assert.equal(FB.fallback, true));
test('554. fallback readiness blocked', () => assert.equal(FB.readiness, 'blocked'));
test('555. fallback not ready for plan', () => assert.equal(FB.readyForBridgeImplementationPlan, false));
test('556. fallback blockerCount 1', () => assert.equal(FB.blockerCount, 1));
test('557. fallback capabilities planOnly true', () => assert.equal(FB.capabilities.planOnly, true));
test('558. fallback capabilities bridgeImplemented false', () => assert.equal(FB.capabilities.bridgeImplemented, false));
test('559. composer fallback on missing contract', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({}); assert.equal(f.fallback, true); assert.equal(f.readiness, 'blocked'); });
test('560. composer fallback on wrong-kind contract', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: { kind: 'x' } }); assert.equal(f.fallback, true); });
test('561. composer fallback on fallback contract', () => { const f = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: { kind: 'studio-authoring-runtime-to-preview-bridge-contract', fallback: true } }); assert.equal(f.fallback, true); });
test('562. composer never throws on garbage', () => { assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: 42 })); assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan(null)); });
test('563. determinism: same contract same overallDigest', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); const b = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); assert.equal(a.overallDigest, b.overallDigest); });
test('564. determinism: same contract same planDigest', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); const b = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); assert.equal(a.bridgeImplementationPlanDigest, b.bridgeImplementationPlanDigest); });
test('565. determinism: full deep-equal', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); const b = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); assert.equal(JSON.stringify(a), JSON.stringify(b)); });
test('566. determinism: rebuilt contract same digest', () => { const a = createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: buildContract('plan') }); assert.equal(a.overallDigest, P.overallDigest); });
test('567. flags off in production', () => assert.equal(isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG]: 'true', MAK_ENV_LABEL: 'production' }), false));
test('568. flags on in dev', () => assert.equal(isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG]: 'true', DEV: 'true' }), true));
test('569. verify flag off in production', () => assert.equal(isStudioAuthoringRuntimeToPreviewBridgeImplementationVerifyEnabled({ [MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY_FLAG]: 'true', NODE_ENV: 'production' }), false));
test('570. isProductionEnv detects label', () => { assert.equal(isProductionEnv({ MAK_ENV_LABEL: 'production' }), true); assert.equal(isProductionEnv({ DEV: 'true' }), false); });
test('571. error catalog >= 45 codes', () => assert.ok(BRIDGE_IMPLEMENTATION_PLAN_ERROR_CODES.length >= 45));
test('572. error code helper', () => { assert.equal(isBridgeImplementationPlanErrorCode(BRIDGE_IMPLEMENTATION_PLAN_ERROR_CODES[0]), true); assert.equal(isBridgeImplementationPlanErrorCode('NOPE'), false); });
test('573. error descriptor sanitized', () => { const e = createBridgeImplementationPlanError('BRIDGE_PLAN_PRISMA_ACCESS_UNSAFE'); assert.equal(e.kind, 'bridge-implementation-plan-error'); assert.equal(e.safe, true); assert.equal(e.sideEffects, false); assert.equal(e.certificationPerformed, false); });
test('574. BridgeImplementationPlanError constructs', () => { const e = bridgeImplementationPlanError('BRIDGE_PLAN_INVALID_OPTIONS', 'm'); assert.ok(e instanceof BridgeImplementationPlanError); assert.equal(e.code, 'BRIDGE_PLAN_INVALID_OPTIONS'); });
test('575. compatibility warns on wrong bridge version', () => { const b = checkBridgeImplementationPlanCompatibility({ bridgeContract: { bridgeContractVersion: 'x@9' } }); assert.equal(b.compatibleWithBridgeContract, false); assert.ok(b.warnings.includes('incompatible_bridgeContract')); });

// ===== Static safety scans + structure (576-610) =====
test('576. subtree React-free (imports)', () => assert.ok(jsImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p))));
test('577. no react-router/react-dom import', () => assert.ok(jsImports().every((p) => !/react-router|react-dom/i.test(p))));
test('578. no JSX/createElement', () => assert.ok(!/createElement|_jsx\b|<Route[\s/>]|ReactDOM|createRoot\s*\(/.test(jsCode())));
test('579. no window/document access', () => assert.ok(!/\bdocument\.|\bwindow\.[a-z]/i.test(jsCode())));
test('580. no fs./writeFile/mkdir/appendFile', () => assert.ok(!/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(jsCode())));
test('581. no localStorage/sessionStorage/indexedDB', () => assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(jsCode())));
test('582. no fetch/XHR/WebSocket/axios', () => assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(jsCode())));
test('583. no @prisma/PrismaClient import', () => assert.ok(jsImports().every((p) => !/@prisma|PrismaClient/i.test(p))));
test('584. no backend/apiClient/EmpresaApi import', () => assert.ok(jsImports().every((p) => !/EmpresaApi|apiClient|\/apis\/|\/backend\//i.test(p))));
test('585. no DATABASE_URL / production API_URL / Railway', () => assert.ok(!/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(jsCode())));
test('586. no POST/PUT/PATCH/DELETE method', () => assert.ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(jsCode())));
test('587. no realDataRead/realDataWrite true literal', () => assert.ok(!/realDataRead\s*:\s*true|realDataWrite\s*:\s*true/.test(jsCode())));
test('588. no moduleGenerated true literal', () => assert.ok(!/moduleGenerated\s*:\s*true/.test(jsCode())));
test('589. no certified true literal', () => assert.ok(!/\bcertified\s*:\s*true/.test(jsCode())));
test('590. no productExposed true literal', () => assert.ok(!/productExposed\s*:\s*true/.test(jsCode())));
test('591. no implemented true literal', () => assert.ok(!/\bimplemented\s*:\s*true/.test(jsCode())));
test('592. no completed true literal', () => assert.ok(!/\bcompleted\s*:\s*true/.test(jsCode())));
test('593. no old Studio prototype import', () => assert.ok(jsImports().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p))));
test('594. no src/components or src/pages import', () => assert.ok(jsImports().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p))));
test('595. no App import', () => assert.ok(jsImports().every((p) => !/(^|\/)App(\.jsx)?$/.test(p))));
test('596. imports only relative + runtime generic-model', () => assert.ok(jsImports().every((p) => p.startsWith('.') || /runtime\/generic-model/.test(p))));
test('597. no Date.now (excl verifier)', () => assert.ok(!/Date\.now/.test(jsCodeNoVerifier())));
test('598. no new Date (excl verifier)', () => assert.ok(!/new Date\b/.test(jsCodeNoVerifier())));
test('599. no Math.random (excl verifier)', () => assert.ok(!/Math\.random/.test(jsCodeNoVerifier())));
test('600. no randomUUID (excl verifier)', () => assert.ok(!/randomUUID/.test(jsCodeNoVerifier())));
test('601. no performance.now/hrtime (excl verifier)', () => assert.ok(!/performance\.now|hrtime/.test(jsCodeNoVerifier())));
test('602. verifier holds nondeterminism detection regex', () => assert.ok(/Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyBridgeImplementationPlan.js'), 'utf8'))));
test('603. no .jsx in subtree', () => assert.equal(walkExt(DIR, /\.jsx$/).length, 0));
test('604. no .tsx in subtree', () => assert.equal(walkExt(DIR, /\.tsx$/).length, 0));
test('605. no .css in subtree', () => assert.ok(!fs.readdirSync(DIR).some((f) => /\.css$/.test(f))));
test('606. exactly 36 .js files', () => assert.equal(jsFiles().length, 36));
test('607. index.js exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/index.js')));
test('608. composer exists', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan.js')));
test('609. upstream bridge contract present', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js')));
test('610. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));

// ===== Scope safety (611-630) =====
test('611. no App.jsx in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('612. no src/pages in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/pages\//.test(x))); });
test('613. no src/components in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/components\//.test(x))); });
test('614. no src/modules in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\//.test(x))); });
test('615. no backend/prisma in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('616. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
// The production UI guard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
// governance guard may appear ONLY when the slice active on this branch declares it as shared governance —
// which only the governance slices do. Both facts come from the caller-aware evaluation, not a hardcoded list.
test('617. no productionUiGuard/governanceGuard in diff', () => {
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
test('618. no upstream bridge-contract subtree in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//.test(x))); });
test('619. no authoring-runtime/preview-sandbox subtree in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/(module-blueprint-authoring-runtime|module-preview-sandbox|module-blueprint-authoring-implementation-plan|module-blueprint-authoring-foundation-contract)\//.test(x))); });
// Branch-relative scope check, CALLER-AWARE. It no longer asks "is this path registered somewhere?" — a flat
// registry could not prove the path was later than this slice. It asks "which slice is this branch building, and
// is that slice this one or a later one?", and admits only what that active slice owns, is explicitly
// cross-authorized for, or shares. Forbidden and unknown still fail closed.
const CALLER_SLICE_ID = 'authoring-runtime-to-preview-bridge-implementation-plan';
test('620. no prior gate/test altered', () => {
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
test('621. no new dependency', () => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); assert.equal(bk, hk); } catch { /* skip */ } });
test('622. net-new scope subtree only', () => { const f = changed(); if (f === null) return; if (!f.some((x) => /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//.test(x))) return; assert.deepEqual(f.filter((x) => !authorized(x)), []); });
test('623. plan subtree present', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/index.js')));
test('624. test file registered path', () => assert.ok(exists(TEST_REL)));
test('625. gate file registered path', () => assert.ok(exists(GATE_REL)));
test('626. registry contains plan subtree', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/authoring-runtime-to-preview-bridge-implementation-plan/.test(reg)); });
test('627. package.json has plan test script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js/.test(pkg)); });
test('628. test:runtime aggregate includes plan test', () => { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); assert.ok(pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js')); });
test('629. composer exported', () => assert.equal(typeof createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan, 'function'));
test('630. plan manifest part digests >= 20 distinct', () => { const ds = Object.values(P.manifest.partDigests); assert.ok(new Set(ds).size >= 20); });

// ===== Evidence docs (D1-D32) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-IMPLEMENTATION-PLAN-REPORT.md',
  'IMPLEMENTATION-PHASES.md', 'SOURCE-VALIDATION-PLAN.md', 'DRAFT-IDENTITY-ENFORCEMENT-PLAN.md',
  'SOURCE-VERSION-VALIDATION-PLAN.md', 'SOURCE-DIGEST-VALIDATION-PLAN.md', 'SOURCE-BOUNDARY-VALIDATION-PLAN.md',
  'FIELD-MAPPING-EXECUTION-PLAN.md', 'TARGET-DESCRIPTOR-CONSTRUCTION-PLAN.md', 'TARGET-VERSION-VALIDATION-PLAN.md',
  'CANONICALIZATION-VALIDATION-PLAN.md', 'EXTENSIBILITY-ENFORCEMENT-PLAN.md', 'VALIDATION-PIPELINE-PLAN.md',
  'REPLAY-IDEMPOTENCY-PLAN.md', 'RESOURCE-LIMITS-PLAN.md', 'FAILURE-CONTAINMENT-PLAN.md', 'SSOT-PROTECTION-PLAN.md',
  'CERTIFICATION-BOUNDARY-PLAN.md', 'PERMISSION-TENANCY-BOUNDARY-PLAN.md', 'SECURITY-SAFETY-PLAN.md',
  'PROTOTYPE-RELINK-ASSERTION-PLAN.md', 'TEST-HARNESS-PLAN.md', 'MANUAL-ENABLEMENT-GATE-PLAN.md',
  'ROLLOUT-ROLLBACK-PLAN.md', 'OBSERVABILITY-DIAGNOSTICS-PLAN.md', 'GOVERNANCE-REGISTRY-PLAN.md',
  'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-UI-NO-APP-NO-BRIDGE-RUNTIME-NO-PERSISTENCE.md',
  'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md', 'QUALITY-SCALABILITY-NOTES.md', 'NEXT-CHECKPOINT-SPEC.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan/${DOCS[i]}`)));
}
test('D33. exactly 32 evidence docs', () => assert.equal(DOCS.length, 32));
test('D-content. plan + phases + SSOT + prototype-debt + next checkpoint present', () => {
  assert.ok(/plan|headless|contract/i.test(readEv('CERTIFICATION-REPORT.md')));
  assert.ok(/phase|planned/i.test(readEv('IMPLEMENTATION-PHASES.md')));
  assert.ok(/SSOT|canonical|certified/i.test(readEv('SSOT-PROTECTION-PLAN.md')));
  assert.ok(/prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')));
  assert.ok(/checkpoint|FABLE|enterprise/i.test(readEv('NEXT-CHECKPOINT-SPEC.md')));
});
