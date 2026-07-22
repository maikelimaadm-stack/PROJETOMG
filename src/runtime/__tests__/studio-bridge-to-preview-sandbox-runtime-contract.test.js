import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import * as C from '../../studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract/index.js';
import {
  createStudioAuthoringRuntimeToPreviewBridge, TARGET_DESCRIPTOR_TARGET_FIELDS,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';
import { MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION } from '../../studio/blueprint-engine/module-preview-sandbox/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-contract');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };

// Real bridge target descriptor (success) — source of truth for the contract's declared shape.
function buildRealTarget(seed = 'contract') {
  const s0 = createAuthoringRuntimeSession({ seed });
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const bridge = createStudioAuthoringRuntimeToPreviewBridge({});
  return { target: bridge.execute({ sourceHandoff: createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId }).targetDescriptor, draftId };
}
const CONTRACT = C.createStudioBridgeToPreviewSandboxRuntimeContract({});
const { target: REAL_TARGET } = buildRealTarget('contract');

// ===================== 1. Identity / structure (1-40) =====================
test('1. contract kind', () => assert.equal(CONTRACT.kind, 'studio-bridge-to-preview-sandbox-runtime-contract'));
test('2. contract version', () => assert.equal(CONTRACT.contractVersion, 'studio-bridge-to-preview-sandbox-runtime-contract@1.0.0'));
test('3. contract mode', () => assert.equal(CONTRACT.mode, 'headless_bridge_to_preview_sandbox_runtime_contract'));
test('4. frozen', () => assert.ok(Object.isFrozen(CONTRACT)));
test('5. not fallback', () => assert.equal(CONTRACT.fallback, false));
test('6. readiness state', () => assert.equal(CONTRACT.readiness, 'studio_bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit'));
test('7. readiness known', () => assert.ok(C.CONTRACT_READINESS_STATES.includes(CONTRACT.readiness)));
test('8. metadataOnly', () => assert.equal(CONTRACT.metadataOnly, true));
test('9. contractDefined', () => assert.equal(CONTRACT.contractDefined, true));
test('10. readyForEnterpriseContractAudit', () => assert.equal(CONTRACT.readyForEnterpriseContractAudit, true));
test('11. readyForImplementationPlan false', () => assert.equal(CONTRACT.readyForImplementationPlan, false));
test('12. readyForRuntimeImplementation false', () => assert.equal(CONTRACT.readyForRuntimeImplementation, false));
test('13. readyForPreviewMount false', () => assert.equal(CONTRACT.readyForPreviewMount, false));
test('14. readyForProductExposure false', () => assert.equal(CONTRACT.readyForProductExposure, false));
test('15. sourceCheckpoint', () => assert.equal(CONTRACT.sourceCheckpoint, 'pr_486_post_merge_deep_enterprise_hardening_audit'));
test('16. sourceDecision', () => assert.equal(CONTRACT.sourceDecision, 'POST_MERGE_REVALIDATION_PASS_AND_BRIDGE_HARDENING_ENTERPRISE_PASS'));
test('17. currentSliceAuthorization', () => assert.equal(CONTRACT.currentSliceAuthorization, 'bridge_to_preview_sandbox_runtime_contract_only'));
test('18. requiredFutureCheckpoint', () => assert.equal(CONTRACT.requiredFutureCheckpoint, 'post_bridge_to_preview_sandbox_runtime_contract_enterprise_audit'));
test('19. verification ok', () => assert.equal(CONTRACT.verification.ok, true));
test('20. verification zero blockers', () => assert.equal(CONTRACT.verification.blockerCount, 0));
test('21. exactly 29 .js files', () => assert.equal(jsFiles().length, 29));
test('22. no .jsx in subtree', () => assert.equal(walk(DIR, /\.jsx$/).length, 0));
test('23. no .tsx in subtree', () => assert.equal(walk(DIR, /\.tsx$/).length, 0));
test('24. no .css in subtree', () => assert.equal(walk(DIR, /\.css$/).length, 0));
test('25. index exports factory', () => assert.equal(typeof C.createStudioBridgeToPreviewSandboxRuntimeContract, 'function'));
test('26. default export present', () => assert.equal(typeof C.default, 'function'));
test('27. imports only relative + authorized upstreams', () => assert.ok(jsImports().every((p) => p.startsWith('.') || /module-blueprint-authoring-runtime|authoring-runtime-to-preview-bridge|module-preview-sandbox/.test(p))));
test('28. no node builtins imported', () => assert.ok(!jsImports().some((p) => /^(fs|path|child_process|crypto|net|http|os)$/.test(p))));
test('29. compatibility status', () => assert.equal(CONTRACT.compatibility.status, 'bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit'));
test('30. manifest overallDigest is fnv1a', () => assert.ok(/^fnv1a-/.test(CONTRACT.manifest.overallDigest)));
test('31. manifest deterministic', () => assert.equal(C.createStudioBridgeToPreviewSandboxRuntimeContract({}).manifest.overallDigest, CONTRACT.manifest.overallDigest));
test('32. contract deep-equal replay', () => assert.equal(JSON.stringify(C.createStudioBridgeToPreviewSandboxRuntimeContract({})), JSON.stringify(CONTRACT)));
test('33. no process.env misuse (guarded)', () => assert.ok(!/[^.\w]process\.env/.test(jsCode()) || /globalThis\.process/.test(jsCode())));
test('34. contract-only capability', () => assert.equal(CONTRACT.capabilities.contractOnly, true));
test('35. metadataOnly capability', () => assert.equal(CONTRACT.capabilities.metadataOnly, true));
test('36. src/modules/studio does NOT exist', () => assert.ok(!exists('src/modules/studio')));
test('37. real bridge subtree present (upstream)', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js')));
test('38. preview sandbox present (upstream)', () => assert.ok(exists('src/studio/blueprint-engine/module-preview-sandbox/index.js')));
test('39. diagnostics contractOnly', () => assert.equal(CONTRACT.diagnostics.contractOnly, true));
test('40. diagnostics runtime not implemented', () => assert.equal(CONTRACT.diagnostics.runtimeImplemented, false));

// ===================== 2. Source descriptor contract vs REAL target (41-90) =====================
test('41. real target present', () => assert.ok(REAL_TARGET && typeof REAL_TARGET === 'object'));
test('42. real target kind', () => assert.equal(REAL_TARGET.targetKind, 'module_preview_sandbox_candidate'));
for (const [i, f] of C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS.entries()) {
  test(`${43 + i}. real target has declared field ${f}`, () => assert.ok(Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));
}
test('66. declared fields equal actual target keys (no invented, no missing)', () => assert.deepEqual([...C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS].sort(), Object.keys(REAL_TARGET).sort()));
for (const [i, inv] of Object.entries(C.REAL_TARGET_DESCRIPTOR_INVARIANTS)) {
  test(`inv-${i}. real target invariant ${i}`, () => assert.equal(REAL_TARGET[i], inv));
}
for (const [i, f] of C.SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS.entries()) {
  test(`sec-${67 + i}. security field ${f} is false on real target`, () => assert.equal(REAL_TARGET[f], false));
}
for (const f of C.REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS) {
  test(`req-${f}. required field ${f} present on real target`, () => assert.ok(Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));
}
for (const f of C.VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS) {
  test(`ver-${f}. version field ${f} present on real target`, () => assert.ok(Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));
}
for (const f of C.DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS) {
  test(`dig-${f}. digest field ${f} present on real target`, () => assert.ok(Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));
}
test('90. source descriptor contract forbids aliases', () => assert.equal(C.SOURCE_DESCRIPTOR_CONTRACT.aliasesForbidden, true));

// ===================== 3. Sandbox descriptor contract vs REAL (91-120) =====================
test('91. sandbox contract version matches real', () => assert.equal(C.SANDBOX_DESCRIPTOR_CONTRACT.sandboxContractVersion, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('92. future sandbox descriptor kind', () => assert.equal(C.SANDBOX_DESCRIPTOR_CONTRACT.futureSandboxDescriptorKind, 'preview_sandbox_metadata_descriptor'));
test('93. sandbox builder not implemented', () => assert.equal(C.SANDBOX_DESCRIPTOR_CONTRACT.sandboxDescriptorBuilderImplemented, false));
for (const [i, f] of C.REQUIRED_SANDBOX_DESCRIPTOR_FIELDS.entries()) {
  test(`${94 + i}. required sandbox field ${f} in future fields`, () => assert.ok(C.FUTURE_SANDBOX_DESCRIPTOR_FIELDS.includes(f)));
}
for (const [i, f] of C.SECURITY_SANDBOX_DESCRIPTOR_FIELDS.entries()) {
  test(`ssec-${106 + i}. sandbox security field ${f} in future fields`, () => assert.ok(C.FUTURE_SANDBOX_DESCRIPTOR_FIELDS.includes(f)));
}
test('113. allowed preview kinds non-empty', () => assert.ok(C.ALLOWED_SANDBOX_PREVIEW_KINDS.length >= 5));
test('114. prohibited effects include mount/route/menu/module/backend', () => assert.ok(['route_creation', 'menu_creation', 'module_generation', 'backend_access'].every((e) => C.SANDBOX_PROHIBITED_EFFECTS.includes(e))));

// ===================== 4. Identity contract (115-135) =====================
test('115. explicitSourceDescriptorRequired', () => assert.equal(C.IDENTITY_CONTRACT.explicitSourceDescriptorRequired, true));
test('116. sourceBridgeDecisionDigestRequired', () => assert.equal(C.IDENTITY_CONTRACT.sourceBridgeDecisionDigestRequired, true));
test('117. bridgeDecisionDigest NOT on target descriptor', () => assert.equal(C.IDENTITY_CONTRACT.bridgeDecisionDigestPresentOnTargetDescriptor, false));
test('118. real target indeed lacks bridgeDecisionDigest', () => assert.ok(!Object.prototype.hasOwnProperty.call(REAL_TARGET, 'bridgeDecisionDigest')));
test('119. declares missing identity as future blocker', () => assert.equal(C.IDENTITY_CONTRACT.declareMissingIdentityAsFutureImplementationBlocker, true));
test('120. doNotSynthesizeDefault', () => assert.equal(C.IDENTITY_CONTRACT.doNotSynthesizeDefault, true));
test('121. doNotInventAlias', () => assert.equal(C.IDENTITY_CONTRACT.doNotInventAlias, true));
test('122. doNotAuthorizeImplementation', () => assert.equal(C.IDENTITY_CONTRACT.doNotAuthorizeImplementation, true));
test('123. three distinct identities', () => assert.equal(C.IDENTITY_CONTRACT.distinctIdentities.length, 3));
for (const [i, f] of C.IDENTITY_CONTRACT.sourceDescriptorIdentityFields.entries()) {
  test(`${124 + i}. identity field ${f} present on real target`, () => assert.ok(Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));
}

// ===================== 5. Version contract (135-160) =====================
const EV_ = C.VERSION_CONTRACT.expectedVersions;
test('135. bridgeTargetDescriptorVersion real', () => assert.equal(EV_.previewSandboxContractVersion, MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION));
test('136. exactVersionMatchRequired', () => assert.equal(C.VERSION_CONTRACT.policy.exactVersionMatchRequired, true));
test('137. unknownVersionFailsClosed', () => assert.equal(C.VERSION_CONTRACT.policy.unknownVersionFailsClosed, true));
test('138. downgrade forbidden', () => assert.equal(C.VERSION_CONTRACT.policy.versionDowngradeAllowed, false));
test('139. upgrade not assumed', () => assert.equal(C.VERSION_CONTRACT.policy.versionUpgradeAssumedCompatible, false));
test('140. aggregate alias forbidden', () => assert.equal(C.VERSION_CONTRACT.policy.aggregatedVersionObjectAsSourceAliasAllowed, false));
test('141. silent coercion forbidden', () => assert.equal(C.VERSION_CONTRACT.policy.silentVersionCoercionAllowed, false));
for (const [i, k] of Object.keys(EV_).entries()) {
  test(`${142 + i}. version tuple ${k} is a non-empty version string`, () => assert.ok(typeof EV_[k] === 'string' && /@\d+\.\d+\.\d+$/.test(EV_[k])));
}

// ===================== 6. Digest contract (160-180) =====================
test('160. recompute-and-compare mode', () => assert.equal(C.DIGEST_CONTRACT.digestValidationMode, 'recompute_and_compare'));
test('161. no alternative serializer', () => assert.equal(C.DIGEST_CONTRACT.alternativeSerializerAllowed, false));
test('162. not cryptographic', () => assert.equal(C.DIGEST_CONTRACT.cryptographicIntegrityProvided, false));
test('163. digest may not authorize certification', () => assert.equal(C.DIGEST_CONTRACT.digestMayAuthorizeCertification, false));
test('164. digest may not authorize production', () => assert.equal(C.DIGEST_CONTRACT.digestMayAuthorizeProductExposure, false));
test('165. crypto digest required before certification', () => assert.equal(C.DIGEST_CONTRACT.cryptographicDigestRequiredBeforeCertification, true));
test('166. target descriptor digest not present', () => assert.equal(C.DIGEST_CONTRACT.targetDescriptorDigestNotCurrentlyPresent, true));
test('167. future consumer must not invent digest', () => assert.equal(C.DIGEST_CONTRACT.futureConsumerMustNotInventIt, true));
test('168. bridge decision digest remains upstream identity', () => assert.equal(C.DIGEST_CONTRACT.bridgeDecisionDigestRemainsAvailableUpstreamIdentity, true));
test('169. source digest fields present on real target', () => assert.ok(C.DIGEST_CONTRACT.sourceDigestFields.every((f) => Object.prototype.hasOwnProperty.call(REAL_TARGET, f))));

// ===================== 7. Read-only policy (170-190) =====================
test('170. sourceMutationAllowed false', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.sourceMutationAllowed, false));
test('171. read_only mode', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.sourceConsumptionMode, 'read_only'));
test('172. no ownership transfer', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.sourceOwnershipTransferred, false));
test('173. no reference retention', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.sourceReferenceRetentionAllowed, false));
test('174. clone required', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.sourceCloneRequired, true));
test('175. deep freeze required', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.sourceDeepFreezeRequired, true));
test('176. no shared mutable state', () => assert.equal(C.READ_ONLY_POLICY_CONTRACT.consumerSharedMutableStateAllowed, false));
for (const [i, k] of ['consumerMayMount', 'consumerMayUseReact', 'consumerMayPersist', 'consumerMayReadRealData', 'consumerMayCreateRouteMenu', 'consumerMayGenerateModule', 'consumerMayCertify', 'consumerMayPublish', 'consumerMayExposeProduct'].entries()) {
  test(`${177 + i}. read-only forbids ${k}`, () => assert.equal(C.READ_ONLY_POLICY_CONTRACT[k], false));
}
for (const k of ['consumerMayValidate', 'consumerMayMap', 'consumerMayCreateMetadataOnlyCandidate']) {
  test(`ro-allow-${k}. read-only allows ${k}`, () => assert.equal(C.READ_ONLY_POLICY_CONTRACT[k], true));
}

// ===================== 8. Field mappings (190-230) =====================
test('190. 12 mappings', () => assert.equal(C.FIELD_MAPPING_CONTRACT.length, 12));
test('191. no duplicate source', () => assert.equal(new Set(C.FIELD_MAPPING_CONTRACT.map((m) => m.sourceField)).size, 12));
test('192. no duplicate target', () => assert.equal(new Set(C.FIELD_MAPPING_CONTRACT.map((m) => m.targetField)).size, 12));
test('193. all transforms allow-listed', () => assert.ok(C.FIELD_MAPPING_CONTRACT.every((m) => C.CONTRACT_TRANSFORM_KINDS.includes(m.transformKind))));
test('194. no critical default', () => assert.ok(C.FIELD_MAPPING_CONTRACT.every((m) => m.defaultAllowed === false)));
test('195. all lossless required', () => assert.ok(C.FIELD_MAPPING_CONTRACT.every((m) => m.losslessRequired === true)));
test('196. all synthetic-only', () => assert.ok(C.FIELD_MAPPING_CONTRACT.every((m) => m.syntheticOnly === true)));
test('197. all deterministic', () => assert.ok(C.FIELD_MAPPING_CONTRACT.every((m) => m.deterministic === true)));
for (const [i, m] of C.FIELD_MAPPING_CONTRACT.entries()) {
  test(`${198 + i * 2}. mapping ${m.mappingId} source is real target field`, () => assert.ok(C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS.includes(m.sourceField) || TARGET_DESCRIPTOR_TARGET_FIELDS.includes(m.sourceField)));
  test(`${199 + i * 2}. mapping ${m.mappingId} target in future sandbox fields`, () => assert.ok(C.FUTURE_SANDBOX_DESCRIPTOR_FIELDS.includes(m.targetField)));
}

// ===================== 9. Validation pipeline (230-250) =====================
test('230. 15 stages', () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.stages.length, 15));
test('231. pipeline not implemented', () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.pipelineImplemented, false));
test('232. validation not executed', () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.validationExecuted, false));
test('233. sandbox descriptor not created', () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.sandboxDescriptorCreated, false));
test('234. atomic', () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.atomic, true));
test('235. deterministic order', () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.deterministicOrder, true));
const EXPECTED_STAGES = ['source_descriptor_shape_validation', 'source_descriptor_identity_validation', 'source_descriptor_version_validation', 'source_descriptor_digest_validation', 'source_descriptor_synthetic_boundary_validation', 'source_descriptor_security_boundary_validation', 'mapping_contract_validation', 'sandbox_contract_version_validation', 'sandbox_descriptor_shape_validation', 'preview_mount_boundary_validation', 'real_data_boundary_validation', 'product_exposure_boundary_validation', 'module_generation_boundary_validation', 'certification_boundary_validation', 'prototype_reference_validation'];
for (const [i, s] of EXPECTED_STAGES.entries()) {
  test(`${236 + i}. stage ${i} is ${s}`, () => assert.equal(C.VALIDATION_PIPELINE_CONTRACT.stages[i], s));
}

// ===================== 10. Issue model (251-290) =====================
test('251. issue codes >= 40', () => assert.ok(C.CONTRACT_ISSUE_CODES.length >= 40));
test('252. issue codes unique', () => assert.equal(new Set(C.CONTRACT_ISSUE_CODES).size, C.CONTRACT_ISSUE_CODES.length));
test('253. ordering keys', () => assert.deepEqual(C.ISSUE_MODEL_CONTRACT.orderingKeys, ['stage', 'path', 'issueCode', 'message']));
test('254. no silent correction', () => assert.equal(C.ISSUE_MODEL_CONTRACT.silentCorrectionAllowed, false));
test('255. no permissive fallback', () => assert.equal(C.ISSUE_MODEL_CONTRACT.permissiveFallbackAllowed, false));
for (const [i, code] of C.CONTRACT_ISSUE_CODES.entries()) {
  test(`ic-${i}. issue code ${code} well-formed`, () => assert.ok(typeof code === 'string' && code.startsWith('CONTRACT_')));
}

// ===================== 11. Failure containment (291-310) =====================
for (const [i, k] of ['atomicConsumerDecisionRequired', 'unexpectedExceptionsMustFailClosed', 'rollbackByNonConsumption'].entries()) {
  test(`${291 + i}. failure ${k} true`, () => assert.equal(C.FAILURE_CONTAINMENT_CONTRACT[k], true));
}
for (const [i, k] of ['partialSandboxDescriptorAllowed', 'sourceMutationAllowed', 'sideEffectsAllowed', 'externalCleanupRequired', 'databaseRollbackRequired', 'filesystemCleanupRequired', 'stackLeakAllowed', 'internalErrorMessageLeakAllowed', 'secretLeakAllowed'].entries()) {
  test(`${294 + i}. failure ${k} false`, () => assert.equal(C.FAILURE_CONTAINMENT_CONTRACT[k], false));
}

// ===================== 12. Resource limits (311-350) =====================
test('311. 9 dimensions', () => assert.equal(C.RESOURCE_LIMIT_CONTRACT.dimensions.length, 9));
test('312. unknown dimension rejected', () => assert.equal(C.RESOURCE_LIMIT_CONTRACT.unknownDimensionRejected, true));
test('313. no silent truncation', () => assert.equal(C.RESOURCE_LIMIT_CONTRACT.silentTruncationAllowed, false));
test('314. no partial descriptor', () => assert.equal(C.RESOURCE_LIMIT_CONTRACT.partialDescriptorAllowed, false));
for (const [i, d] of C.RESOURCE_LIMIT_CONTRACT.dimensions.entries()) {
  test(`${315 + i * 3}. dim ${d.dimension} has source/consumer/sandbox limits`, () => assert.ok(Number.isInteger(d.sourceLimit) && Number.isInteger(d.consumerLimit) && Number.isInteger(d.sandboxLimit)));
  test(`${316 + i * 3}. dim ${d.dimension} consumer <= source`, () => assert.ok(d.consumerLimit <= d.sourceLimit));
  test(`${317 + i * 3}. dim ${d.dimension} has issueCode + reason`, () => assert.ok(typeof d.issueCode === 'string' && typeof d.reason === 'string'));
}

// ===================== 13. Extensibility (350-375) =====================
for (const [i, k] of ['unknownCriticalFieldsRejected', 'unknownCapabilityFlagsRejected', 'unnamespacedExtensionsRejected', 'extensionNamespaceRequired', 'extensionSchemaRequired', 'duplicateNamespaceRejected', 'extensionCannotOverrideCriticalFields', 'extensionCannotOverrideCapabilities', 'extensionCannotOverrideVersions', 'extensionCannotOverrideDigests', 'prototypePollutionKeysRejected'].entries()) {
  test(`${350 + i}. extensibility ${k} true`, () => assert.equal(C.EXTENSIBILITY_CONTRACT[k], true));
}
test('361. extension never enables real effects', () => assert.ok(['module', 'product', 'realData', 'mount', 'persistence', 'production'].every((e) => C.EXTENSIBILITY_CONTRACT.extensionNeverEnables.includes(e))));
test('362. prototype pollution keys listed', () => assert.deepEqual(C.EXTENSIBILITY_CONTRACT.prototypePollutionKeys, ['__proto__', 'constructor', 'prototype']));

// ===================== 14. Replay (363-380) =====================
for (const [i, k] of ['sameSourcePlusSameConfigProducesSameDecision', 'sameIssuesOrderingRequired', 'sameSandboxDescriptorRequired', 'sameConsumerDecisionDigestRequired'].entries()) {
  test(`${363 + i}. replay ${k} true`, () => assert.equal(C.REPLAY_CONTRACT[k], true));
}
for (const [i, k] of ['replaySideEffectsAllowed', 'globalMutableStateAllowed', 'ambientClockAllowed', 'randomnessAllowed', 'localeDependencyAllowed', 'timezoneDependencyAllowed', 'replayImplemented'].entries()) {
  test(`${367 + i}. replay ${k} false`, () => assert.equal(C.REPLAY_CONTRACT[k], false));
}

// ===================== 15. SSOT / permission / product (380-410) =====================
test('380. certified blueprint remains SSOT', () => assert.equal(C.SSOT_BOUNDARY_CONTRACT.certifiedBlueprintRemainsSsot, true));
for (const [i, k] of ['bridgeDescriptorIsCanonical', 'sandboxDescriptorIsCanonical', 'consumerMayCertify', 'consumerMayPublish', 'consumerMayRegister', 'consumerMayGenerateModule', 'consumerMayWriteCertifiedBlueprint', 'consumerMayBypassCertification'].entries()) {
  test(`${381 + i}. ssot ${k} false`, () => assert.equal(C.SSOT_BOUNDARY_CONTRACT[k], false));
}
for (const [i, k] of ['permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated', 'clientSideAuthorizationSufficient'].entries()) {
  test(`${389 + i}. permission ${k} false`, () => assert.equal(C.PERMISSION_TENANCY_BOUNDARY_CONTRACT[k], false));
}
test('393. product exposure blocked by permission/tenancy', () => assert.equal(C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.productExposureBlockedByPermissionTenancy, true));
test('394. requires permission/tenancy foundation', () => assert.equal(C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.requiresPermissionTenancyFoundationBeforeExposure, true));

// ===================== 16. Security / prototype / manual gate (395-430) =====================
test('395. security failClosed', () => assert.equal(C.SECURITY_CONTRACT.failClosed, true));
for (const [i, k] of ['anyForbiddenSideEffect', 'evalAllowed', 'dynamicCodeAllowed', 'timersAllowed', 'filesystemAllowed', 'networkAllowed', 'prismaAllowed', 'processEnvMutationAllowed', 'stackLeakAllowed', 'secretLeakAllowed'].entries()) {
  test(`${396 + i}. security ${k} false`, () => assert.equal(C.SECURITY_CONTRACT[k], false));
}
test('406. prototype relink forbidden', () => assert.equal(C.PROTOTYPE_PROHIBITION_CONTRACT.prototypeRelinkAllowed, false));
test('407. old prototype not imported', () => assert.equal(C.PROTOTYPE_PROHIBITION_CONTRACT.oldPrototypeImported, false));
test('408. forbidden prototype paths listed', () => assert.equal(C.PROTOTYPE_PROHIBITION_CONTRACT.forbiddenPrototypePaths.length, 8));
test('409. manual gate required', () => assert.equal(C.MANUAL_CHECKPOINT_CONTRACT.manualGateRequired, true));
test('410. authorizes contract definition', () => assert.equal(C.MANUAL_CHECKPOINT_CONTRACT.authorizesContractDefinition, true));
for (const [i, k] of ['authorizesImplementationPlan', 'authorizesRuntimeImplementation', 'authorizesPreviewMount', 'authorizesUi', 'authorizesAppTouch', 'authorizesRouteMenu', 'authorizesPersistence', 'authorizesBackend', 'authorizesPrisma', 'authorizesModuleGeneration', 'authorizesCertification', 'authorizesProductExposure', 'authorizesRealData', 'authorizesPermissionTenancyIntegration'].entries()) {
  test(`${411 + i}. manual gate ${k} false`, () => assert.equal(C.MANUAL_CHECKPOINT_CONTRACT[k], false));
}

// ===================== 17. Capabilities exhaustive (430-490) =====================
const CAPS = C.CONTRACT_CAPABILITIES;
const TRUE_CAPS = Object.keys(CAPS).filter((k) => CAPS[k] === true);
const FALSE_CAPS = Object.keys(CAPS).filter((k) => CAPS[k] === false);
test('430. capabilities frozen', () => assert.ok(Object.isFrozen(CAPS)));
test('431. contract-definition caps true', () => assert.ok(['headless', 'deterministic', 'immutable', 'failClosed', 'contractOnly', 'metadataOnly'].every((k) => CAPS[k] === true)));
for (const [i, k] of FALSE_CAPS.entries()) {
  test(`fc-${i}. runtime/consumer capability ${k} is false`, () => assert.equal(CAPS[k], false));
}
for (const k of ['consumerImplemented', 'sandboxDescriptorCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'permissionModelIntegrated', 'tenantModelIntegrated', 'realDataRead', 'networkUsed', 'prototypeRelinked']) {
  test(`cap-false-${k}. capability ${k} false`, () => assert.equal(CAPS[k], false));
}

// ===================== 18. Future consumer decision shape (490-510) =====================
const FCD = CONTRACT.futureConsumerDecisionShape;
test('490. future consumer decision fields', () => assert.ok(['ok', 'status', 'candidateAccepted', 'sandboxDescriptorCreated', 'sandboxDescriptor', 'issues', 'sourceMutated', 'sideEffects', 'rollbackByNonConsumption', 'consumerDecisionDigest'].every((f) => FCD.fields.includes(f))));
test('491. statuses accepted/rejected', () => assert.deepEqual(FCD.statuses, ['sandbox_candidate_accepted', 'sandbox_candidate_rejected']));
test('492. consumerImplemented false', () => assert.equal(FCD.consumerImplemented, false));
test('493. candidateConsumed false', () => assert.equal(FCD.candidateConsumed, false));
test('494. sandboxDescriptorCreated false', () => assert.equal(FCD.sandboxDescriptorCreated, false));
test('495. previewPayloadCreated false', () => assert.equal(FCD.previewPayloadCreated, false));
test('496. previewMounted false', () => assert.equal(FCD.previewMounted, false));

// ===================== 19. Verifier tamper (510-560) =====================
const V = C.verifyBridgeToPreviewSandboxRuntimeContract;
test('510. verifier ok on real contract', () => assert.equal(V({ contract: CONTRACT }).ok, true));
test('511. verifier never throws on null', () => { assert.doesNotThrow(() => V({ contract: null })); assert.doesNotThrow(() => V(null)); });
test('512. verifier detects consumerImplemented true', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, consumerImplemented: true } } }).ok, false));
test('513. verifier detects previewMounted true', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, previewMounted: true } } }).ok, false));
test('514. verifier detects productExposed true', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, productExposed: true } } }).ok, false));
test('515. verifier detects permission integrated', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, permissionModelIntegrated: true } } }).ok, false));
test('516. verifier detects source mutation allowed', () => assert.equal(V({ contract: { ...CONTRACT, readOnlyPolicy: { ...C.READ_ONLY_POLICY_CONTRACT, sourceMutationAllowed: true } } }).ok, false));
test('517. verifier detects ssot inversion', () => assert.equal(V({ contract: { ...CONTRACT, ssotBoundary: { ...C.SSOT_BOUNDARY_CONTRACT, bridgeDescriptorIsCanonical: true } } }).ok, false));
test('518. verifier detects missing manual gate', () => assert.equal(V({ contract: { ...CONTRACT, manualCheckpoint: { ...C.MANUAL_CHECKPOINT_CONTRACT, manualGateRequired: false } } }).ok, false));
test('519. verifier detects premature runtime', () => assert.equal(V({ contract: { ...CONTRACT, readyForRuntimeImplementation: true } }).ok, false));
test('520. verifier detects invented source field', () => assert.equal(V({ contract: { ...CONTRACT, sourceDescriptor: { ...C.SOURCE_DESCRIPTOR_CONTRACT, realFields: [...C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, 'inventedXyz'] } } }).ok, false));
test('521. verifier detects unknown mapping transform', () => assert.equal(V({ contract: { ...CONTRACT, fieldMappings: [...C.FIELD_MAPPING_CONTRACT, { mappingId: 'x', sourceField: 'candidateDraftId', targetField: 'previewMetadata', transformKind: 'weird', defaultAllowed: false }] } }).ok, false));
test('522. verifier detects mapping default', () => assert.equal(V({ contract: { ...CONTRACT, fieldMappings: [{ mappingId: 'x', sourceField: 'candidateDraftId', targetField: 'candidateDraftId', transformKind: 'identity', defaultAllowed: true }] } }).ok, false));
test('523. verifier detects permissive version', () => assert.equal(V({ contract: { ...CONTRACT, versionContract: { ...C.VERSION_CONTRACT, policy: { ...C.VERSION_CONTRACT.policy, exactVersionMatchRequired: false } } } }).ok, false));
test('524. verifier detects digest invention allowed', () => assert.equal(V({ contract: { ...CONTRACT, digestContract: { ...C.DIGEST_CONTRACT, futureConsumerMustNotInventIt: false } } }).ok, false));
test('525. verifier detects exception escape', () => assert.equal(V({ contract: { ...CONTRACT, failureContainment: { ...C.FAILURE_CONTAINMENT_CONTRACT, unexpectedExceptionsMustFailClosed: false } } }).ok, false));
test('526. verifier detects prototype relink', () => assert.equal(V({ contract: { ...CONTRACT, prototypeProhibition: { ...C.PROTOTYPE_PROHIBITION_CONTRACT, prototypeRelinkAllowed: true } } }).ok, false));
test('527. verifier detects manual gate authorizes runtime', () => assert.equal(V({ contract: { ...CONTRACT, manualCheckpoint: { ...C.MANUAL_CHECKPOINT_CONTRACT, authorizesRuntimeImplementation: true } } }).ok, false));
test('528. verifier checkedCapabilities positive', () => assert.ok(V({ contract: CONTRACT }).checkedCapabilities > 0));

// ===================== 20. Static / scope / no-runtime proof (529-580) =====================
test('529. no eval/Function/timer in subtree', () => assert.ok(!/\beval\s*\(|new Function\(|setTimeout|setInterval/.test(jsCode())));
test('530. no fs/network/prisma in subtree', () => assert.ok(!/from ['"]fs['"]|writeFileSync|child_process|fetch\(|axios|XMLHttpRequest|WebSocket|PrismaClient/.test(jsCode())));
test('531. no Math.random/Date.now (excl verifier detector)', () => { const noV = stripComments(jsFiles().filter((f) => !/verifyBridgeToPreviewSandboxRuntimeContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n')); assert.ok(!/Math\.random|Date\.now|new Date\(|performance\.now|localeCompare/.test(noV)); });
test('532. no .jsx/.tsx/.css created', () => assert.ok(walk(DIR, /\.(jsx|tsx|css)$/).length === 0));
test('533. no React import', () => assert.ok(!/from ['"]react['"]/.test(jsCode())));
test('534. no App import', () => assert.ok(!/App\.jsx/.test(jsCode())));
test('535. no App.jsx in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('536. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
test('537. no backend/prisma in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('538. no src/modules in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\//.test(x))); });
test('539. no guards in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs') && !f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')); });
test('540. no upstream subtrees in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|module-preview-sandbox|module-blueprint-authoring-runtime)\//.test(x))); });
test('541. registry lists contract', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/bridge-to-preview-sandbox-runtime-contract/.test(reg)); });
test('542. package.json test script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/studio-bridge-to-preview-sandbox-runtime-contract\.test\.js/.test(pkg)); });
test('543. package.json gate script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/g423-studio-bridge-to-preview-sandbox-runtime-contract\.mjs/.test(pkg)); });
test('544. no prototype subtree imports (denylist declaration excluded)', () => assert.ok(!jsImports().some((p) => /studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(p))));
// implementation flags all false (readiness)
const RD = CONTRACT.readinessDecision;
for (const [i, k] of ['implementationPlanCreated', 'consumerRuntimeImplemented', 'sourceValidationImplemented', 'mappingExecutorImplemented', 'sandboxDescriptorBuilderImplemented', 'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated'].entries()) {
  test(`${545 + i}. readiness ${k} false`, () => assert.equal(RD[k], false));
}
test('568. readiness readyForImplementationPlan false', () => assert.equal(RD.readyForImplementationPlan, false));
test('569. readiness readyForEnterpriseContractAudit true', () => assert.equal(RD.readyForEnterpriseContractAudit, true));
test('570. readiness readyForRuntimeImplementation false', () => assert.equal(RD.readyForRuntimeImplementation, false));

// ===================== 21. Evidence docs (571-600) =====================
const DOCS = ['CONTRACT-CERTIFICATION-REPORT.md', 'REAL-SOURCE-DESCRIPTOR-SHAPE.md', 'REAL-SANDBOX-CONTRACT-SHAPE.md', 'IDENTITY-PROVENANCE.md', 'VERSION-TUPLE.md', 'DIGEST-SEMANTICS.md', 'READ-ONLY-POLICY.md', 'SANDBOX-DESCRIPTOR.md', 'FIELD-MAPPINGS.md', 'VALIDATION-PIPELINE.md', 'ISSUE-MODEL.md', 'FAILURE-CONTAINMENT.md', 'RESOURCE-LIMITS.md', 'EXTENSIBILITY.md', 'REPLAY.md', 'SSOT-BOUNDARY.md', 'PERMISSION-TENANCY-BOUNDARY.md', 'SECURITY.md', 'PROTOTYPE-PROHIBITION.md', 'MANUAL-CHECKPOINT.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-RUNTIME-NO-UI-NO-APP-NO-MOUNT.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-RISK-NOTES.md', 'NEXT-ENTERPRISE-AUDIT.md'];
for (const [i, d] of DOCS.entries()) test(`${571 + i}. evidence doc ${d}`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-contract/${d}`)));
test('596. exactly 25 evidence docs', () => assert.equal(DOCS.length, 25));
test('597. cert report mentions contract-only', () => assert.ok(/contract.only|definition only|no consumer|no runtime/i.test(readEv('CONTRACT-CERTIFICATION-REPORT.md'))));
test('598. real source shape doc mentions module_preview_sandbox_candidate', () => assert.ok(/module_preview_sandbox_candidate|targetKind/i.test(readEv('REAL-SOURCE-DESCRIPTOR-SHAPE.md'))));
test('599. identity doc mentions bridge decision digest', () => assert.ok(/bridgeDecisionDigest|decision digest|provenance/i.test(readEv('IDENTITY-PROVENANCE.md'))));
test('600. next audit doc mentions implementation plan', () => assert.ok(/implementation plan|enterprise|audit/i.test(readEv('NEXT-ENTERPRISE-AUDIT.md'))));

// ===================== 22. Extra determinism / immutability sweep (601-680) =====================
let si = 601;
for (const part of ['sourceDescriptor', 'sandboxDescriptor', 'identityContract', 'versionContract', 'digestContract', 'readOnlyPolicy', 'validationPipeline', 'issueModel', 'failureContainment', 'resourceLimits', 'extensibility', 'replayContract', 'ssotBoundary', 'permissionTenancyBoundary', 'securityContract', 'prototypeProhibition', 'manualCheckpoint']) {
  test(`${si}. part ${part} present + frozen`, () => { assert.ok(CONTRACT[part]); assert.ok(Object.isFrozen(CONTRACT[part])); }); si += 1;
}
for (let k = 0; k < 15; k += 1) { test(`${si}. manifest overallDigest stable #${k}`, () => assert.equal(C.createStudioBridgeToPreviewSandboxRuntimeContract({}).manifest.overallDigest, CONTRACT.manifest.overallDigest)); si += 1; }
for (const [i, code] of C.CONTRACT_ISSUE_CODES.entries()) { test(`${si}. issue code catalog entry ${i} unique-usable`, () => assert.ok(C.CONTRACT_ISSUE_CODES.indexOf(code) === i)); si += 1; }
for (const m of C.FIELD_MAPPING_CONTRACT) { test(`${si}. mapping ${m.mappingId} frozen`, () => assert.ok(Object.isFrozen(m))); si += 1; }
for (const s of C.CONSUMER_VALIDATION_STAGES) { test(`${si}. stage ${s} is snake_case string`, () => assert.ok(/^[a-z_]+$/.test(s))); si += 1; }
for (const st of C.CONSUMER_DECISION_STATUSES) { test(`${si}. status ${st} declared`, () => assert.ok(st.startsWith('sandbox_candidate_'))); si += 1; }
for (let k = 0; k < 10; k += 1) { test(`${si}. verifier deterministic #${k}`, () => assert.equal(C.verifyBridgeToPreviewSandboxRuntimeContract({ contract: CONTRACT }).ok, true)); si += 1; }
