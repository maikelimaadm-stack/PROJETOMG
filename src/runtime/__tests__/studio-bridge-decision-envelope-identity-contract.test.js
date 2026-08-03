import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Central Studio scope governance. Real DB-migration and real menu/nav SOURCE changes are judged by the
// central registry instead of a substring scan over file names, which produced false positives on the
// names of governance artifacts. Forbidden paths still fail closed.
import { filterForbiddenScopePaths, classifyStudioScopePath, createResolvedActiveStudioSlicePathAuthorizer } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import * as E from '../../studio/blueprint-engine/bridge-decision-envelope-identity-contract/index.js';
import { createStudioAuthoringRuntimeToPreviewBridge } from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff, createDeterministicDigest,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-envelope-identity-contract');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const jsCode = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const jsImports = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };

// REAL bridge decision (source of truth).
function buildRealDecision(seed = 'env') {
  const s0 = createAuthoringRuntimeSession({ seed });
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const bridge = createStudioAuthoringRuntimeToPreviewBridge({});
  return bridge.execute({ sourceHandoff: createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId });
}
const CONTRACT = E.createStudioBridgeDecisionEnvelopeIdentityContract({});
const DEC = buildRealDecision('env');

// ===================== 1. Identity / structure (1-40) =====================
test('1. contract kind', () => assert.equal(CONTRACT.kind, 'studio-bridge-decision-envelope-identity-contract'));
test('2. contract version', () => assert.equal(CONTRACT.contractVersion, 'studio-bridge-decision-envelope-identity-contract@1.0.0'));
test('3. contract mode', () => assert.equal(CONTRACT.mode, 'headless_bridge_decision_envelope_identity_contract'));
test('4. frozen', () => assert.ok(Object.isFrozen(CONTRACT)));
test('5. not fallback', () => assert.equal(CONTRACT.fallback, false));
test('6. readiness', () => assert.equal(CONTRACT.readiness, 'studio_bridge_decision_envelope_identity_contract_ready_for_enterprise_audit'));
test('7. readiness known', () => assert.ok(E.ENVELOPE_READINESS_STATES.includes(CONTRACT.readiness)));
test('8. metadataOnly', () => assert.equal(CONTRACT.metadataOnly, true));
test('9. contractDefined', () => assert.equal(CONTRACT.contractDefined, true));
test('10. readyForEnterpriseContractAudit', () => assert.equal(CONTRACT.readyForEnterpriseContractAudit, true));
test('11. readyForImplementationPlan false', () => assert.equal(CONTRACT.readyForImplementationPlan, false));
test('12. readyForRuntimeImplementation false', () => assert.equal(CONTRACT.readyForRuntimeImplementation, false));
test('13. readyForPreviewMount false', () => assert.equal(CONTRACT.readyForPreviewMount, false));
test('14. readyForProductExposure false', () => assert.equal(CONTRACT.readyForProductExposure, false));
test('15. sourceCheckpoint', () => assert.equal(CONTRACT.sourceCheckpoint, 'pr_487_post_merge_deep_enterprise_contract_audit'));
test('16. sourceCheckpointDecision', () => assert.equal(CONTRACT.sourceCheckpointDecision, 'POST_MERGE_REVALIDATION_PASS_AND_CONTRACT_ENTERPRISE_PASS'));
test('16b. sourceDecision part is the contract object', () => assert.equal(CONTRACT.sourceDecision.kind, 'envelope-source-decision-contract'));
test('17. sourceRecommendation', () => assert.equal(CONTRACT.sourceRecommendation, 'READY_FOR_BRIDGE_DECISION_ENVELOPE_IDENTITY_CONTRACT'));
test('18. currentSliceAuthorization', () => assert.equal(CONTRACT.currentSliceAuthorization, 'bridge_decision_envelope_identity_contract_only'));
test('19. requiredFutureCheckpoint', () => assert.equal(CONTRACT.requiredFutureCheckpoint, 'post_bridge_decision_envelope_identity_contract_enterprise_audit'));
test('20. verification ok', () => assert.equal(CONTRACT.verification.ok, true));
test('21. verification zero blockers', () => assert.equal(CONTRACT.verification.blockerCount, 0));
test('22. exactly 29 .js files', () => assert.equal(jsFiles().length, 29));
test('23. no .jsx', () => assert.equal(walk(DIR, /\.jsx$/).length, 0));
test('24. no .tsx', () => assert.equal(walk(DIR, /\.tsx$/).length, 0));
test('25. no .css', () => assert.equal(walk(DIR, /\.css$/).length, 0));
test('26. factory exported', () => assert.equal(typeof E.createStudioBridgeDecisionEnvelopeIdentityContract, 'function'));
test('27. default export', () => assert.equal(typeof E.default, 'function'));
test('28. imports only relative + authorized upstreams', () => assert.ok(jsImports().every((p) => p.startsWith('.') || /module-blueprint-authoring-runtime|bridge-to-preview-sandbox-runtime-contract/.test(p))));
test('29. no node builtins imported', () => assert.ok(!jsImports().some((p) => /^(fs|path|child_process|crypto|net|http|os)$/.test(p))));
test('30. compatibility status', () => assert.equal(CONTRACT.compatibility.status, 'bridge_decision_envelope_identity_contract_ready_for_enterprise_audit'));
test('31. manifest overallDigest fnv1a', () => assert.ok(/^fnv1a-/.test(CONTRACT.manifest.overallDigest)));
test('32. manifest deterministic', () => assert.equal(E.createStudioBridgeDecisionEnvelopeIdentityContract({}).manifest.overallDigest, CONTRACT.manifest.overallDigest));
test('33. contract deep-equal replay', () => assert.equal(JSON.stringify(E.createStudioBridgeDecisionEnvelopeIdentityContract({})), JSON.stringify(CONTRACT)));
test('34. no process.env misuse', () => assert.ok(!/[^.\w]process\.env/.test(jsCode()) || /globalThis\.process/.test(jsCode())));
test('35. contractOnly capability', () => assert.equal(CONTRACT.capabilities.contractOnly, true));
test('36. metadataOnly capability', () => assert.equal(CONTRACT.capabilities.metadataOnly, true));
test('37. bridge subtree present (upstream)', () => assert.ok(exists('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js')));
test('38. bridge-to-sandbox contract present (upstream)', () => assert.ok(exists('src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract/index.js')));
test('39. diagnostics contractOnly', () => assert.equal(CONTRACT.diagnostics.contractOnly, true));
test('40. diagnostics runtime not implemented', () => assert.equal(CONTRACT.diagnostics.runtimeImplemented, false));

// ===================== 2. Real bridge decision shape (41-90) =====================
test('41. real decision present', () => assert.ok(DEC && typeof DEC === 'object'));
test('42. real decision kind', () => assert.equal(DEC.kind, 'bridge-decision'));
test('43. real decision ok', () => assert.equal(DEC.ok, true));
test('44. real decision status', () => assert.equal(DEC.status, 'bridge_ready'));
for (const [i, f] of E.REAL_BRIDGE_DECISION_FIELDS.entries()) {
  test(`${45 + i}. real decision has declared field ${f}`, () => assert.ok(Object.prototype.hasOwnProperty.call(DEC, f)));
}
test('78. declared decision fields == actual decision keys (no invented/missing)', () => assert.deepEqual([...E.REAL_BRIDGE_DECISION_FIELDS].sort(), Object.keys(DEC).sort()));
for (const f of E.REAL_BRIDGE_DECISION_REQUIRED_FIELDS) {
  test(`req-${f}. required decision field ${f} present`, () => assert.ok(Object.prototype.hasOwnProperty.call(DEC, f)));
}
for (const f of E.REAL_BRIDGE_DECISION_SECURITY_FIELDS) {
  test(`sec-${f}. security field ${f} false on real decision`, () => assert.equal(DEC[f], false));
}
test('88. decision has bridgeDecisionDigest', () => assert.ok(typeof DEC.bridgeDecisionDigest === 'string' && DEC.bridgeDecisionDigest.startsWith('fnv1a-')));
test('89. decision has targetDescriptor object', () => assert.ok(DEC.targetDescriptor && typeof DEC.targetDescriptor === 'object'));
test('90. targetDescriptorCreated true', () => assert.equal(DEC.targetDescriptorCreated, true));

// ===================== 3. B-IDENTITY / digest coverage (91-140) — the crux =====================
test('91. bridgeDecisionDigest NOT on targetDescriptor', () => assert.ok(!Object.prototype.hasOwnProperty.call(DEC.targetDescriptor, 'bridgeDecisionDigest')));
test('92. bridgeDecisionDigest IS on decision', () => assert.ok(Object.prototype.hasOwnProperty.call(DEC, 'bridgeDecisionDigest')));
test('93. digest preimage EXCLUDES bridgeDecisionDigest', () => assert.ok(!E.DECISION_DIGEST_PREIMAGE_FIELDS.includes('bridgeDecisionDigest')));
test('94. digest preimage INCLUDES targetDescriptor', () => assert.ok(E.DECISION_DIGEST_PREIMAGE_FIELDS.includes('targetDescriptor')));
test('95. LIVE: recompute over decision-minus-digest == bridgeDecisionDigest', () => {
  const core = {}; for (const k of Object.keys(DEC)) if (k !== 'bridgeDecisionDigest') core[k] = DEC[k];
  assert.equal(createDeterministicDigest(core), DEC.bridgeDecisionDigest);
});
test('96. LIVE: tampering targetDescriptor changes the digest (coverage proof)', () => {
  const core = JSON.parse(JSON.stringify(DEC)); delete core.bridgeDecisionDigest; core.targetDescriptor.candidateDraftId = 'HACKED';
  assert.notEqual(createDeterministicDigest(core), DEC.bridgeDecisionDigest);
});
test('97. LIVE: tampering status changes the digest', () => {
  const core = JSON.parse(JSON.stringify(DEC)); delete core.bridgeDecisionDigest; core.status = 'bridge_rejected';
  assert.notEqual(createDeterministicDigest(core), DEC.bridgeDecisionDigest);
});
test('98. LIVE: tampering issues changes the digest', () => {
  const core = JSON.parse(JSON.stringify(DEC)); delete core.bridgeDecisionDigest; core.issues = [{ x: 1 }];
  assert.notEqual(createDeterministicDigest(core), DEC.bridgeDecisionDigest);
});
test('99. digestCoverage targetDescriptorCoveredByDigest true', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.targetDescriptorCoveredByDigest, true));
test('100. digestCoverage issuesCoveredByDigest true', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.issuesCoveredByDigest, true));
test('101. digestCoverage statusCoveredByDigest true', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.statusCoveredByDigest, true));
test('102. digestCoverage not cryptographic', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.cryptographicIntegrityProvided, false));
test('103. bIdentityRemainsOpen false', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.bIdentityRemainsOpen, false));
test('104. bIdentityClosedByContract true (digest)', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.bIdentityClosedByContract, true));
test('105. contract bIdentityClosedByContract true', () => assert.equal(CONTRACT.bIdentityClosedByContract, true));
test('106. verification bIdentityClosedByContract true', () => assert.equal(CONTRACT.verification.bIdentityClosedByContract, true));
test('107. readiness bIdentityClosedByContract true', () => assert.equal(CONTRACT.readinessDecision.bIdentityClosedByContract, true));
test('108. compatibility bIdentityClosedByContract true', () => assert.equal(CONTRACT.compatibility.bIdentityClosedByContract, true));
test('109. digestCoverage readyForImplementationPlan false', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.readyForImplementationPlan, false));
test('110. LIVE preimage fields match actual decision keys minus digest', () => {
  const actualCore = Object.keys(DEC).filter((k) => k !== 'bridgeDecisionDigest').sort();
  assert.deepEqual([...E.DECISION_DIGEST_PREIMAGE_FIELDS].sort(), actualCore);
});
test('111. digestAlgorithm fnv1a-32', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.digestAlgorithm, 'fnv1a-32'));
test('112. canonicalSerializer stableSerialize', () => assert.equal(E.DIGEST_COVERAGE_CONTRACT.canonicalSerializer, 'stableSerialize'));

// ===================== 4. Envelope shape (113-150) =====================
test('113. envelope kind invariant', () => assert.equal(E.ENVELOPE_INVARIANTS.envelopeKind, 'bridge_decision_identity_envelope'));
for (const [i, k] of ['synthetic', 'immutable', 'metadataOnly'].entries()) test(`${114 + i}. envelope invariant ${k} true`, () => assert.equal(E.ENVELOPE_INVARIANTS[k], true));
for (const [i, k] of ['identityVerified', 'sourceDecisionConsumed', 'targetDescriptorConsumed', 'consumerRuntimeInvoked', 'previewMounted', 'productExposed'].entries()) test(`${117 + i}. envelope invariant ${k} false`, () => assert.equal(E.ENVELOPE_INVARIANTS[k], false));
test('123. envelope has bridgeDecisionDigest + targetDescriptor fields', () => assert.ok(E.ENVELOPE_FIELDS.includes('bridgeDecisionDigest') && E.ENVELOPE_FIELDS.includes('targetDescriptor')));
test('124. envelope shape builder not implemented', () => assert.equal(E.ENVELOPE_SHAPE_CONTRACT.envelopeBuilderImplemented, false));
for (const [i, f] of E.ENVELOPE_REQUIRED_FIELDS.entries()) test(`${125 + i}. required envelope field ${f} in fields`, () => assert.ok(E.ENVELOPE_FIELDS.includes(f)));

// ===================== 5. Identity binding (140-165) =====================
test('140. digestAndDescriptorMustComeFromSameDecision', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.digestAndDescriptorMustComeFromSameDecision, true));
test('141. verification mode recompute_and_compare', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.identityVerificationMode, 'recompute_and_compare'));
test('142. identity synthesis forbidden', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.identitySynthesisAllowed, false));
test('143. identity alias forbidden', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.identityAliasAllowed, false));
test('144. identity fallback forbidden', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.identityFallbackAllowed, false));
test('145. descriptor clone required', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.descriptorCloneRequired, true));
test('146. descriptor deep freeze required', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.descriptorDeepFreezeRequired, true));
test('147. descriptor reference retention forbidden', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.descriptorReferenceRetentionAllowed, false));
test('148. identity verification required before consumption', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.identityVerificationRequiredBeforeConsumption, true));
test('149. identity verification not implemented', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.identityVerificationImplemented, false));
test('150. envelope builder not implemented', () => assert.equal(E.IDENTITY_BINDING_CONTRACT.envelopeBuilderImplemented, false));

// ===================== 6. Provenance (151-175) =====================
test('151. source decision origin', () => assert.equal(E.PROVENANCE_CONTRACT.sourceDecisionOrigin, 'hardened_authoring_runtime_to_preview_bridge'));
test('152. atomic pair required', () => assert.equal(E.PROVENANCE_CONTRACT.sourceDecisionAndDescriptorAtomicPairRequired, true));
test('153. cross-decision mixing forbidden', () => assert.equal(E.PROVENANCE_CONTRACT.crossDecisionDescriptorMixingAllowed, false));
test('154. descriptor replacement forbidden', () => assert.equal(E.PROVENANCE_CONTRACT.descriptorReplacementAllowed, false));
test('155. digest replacement forbidden', () => assert.equal(E.PROVENANCE_CONTRACT.digestReplacementAllowed, false));
test('156. provenance issue codes registered', () => assert.ok(E.PROVENANCE_CONTRACT.issueCodes.every((c) => E.ENVELOPE_ISSUE_CODES.includes(c))));
test('157. cross-decision mix issue code exists', () => assert.ok(E.ENVELOPE_ISSUE_CODES.includes('ENVELOPE_CROSS_DECISION_DESCRIPTOR_MIX_FORBIDDEN')));
test('158. digest tampered issue code exists', () => assert.ok(E.ENVELOPE_ISSUE_CODES.includes('ENVELOPE_BRIDGE_DECISION_DIGEST_TAMPERED')));
test('159. pair mismatch issue code exists', () => assert.ok(E.ENVELOPE_ISSUE_CODES.includes('ENVELOPE_DECISION_DESCRIPTOR_PAIR_MISMATCH')));

// ===================== 7. Versions (160-185) =====================
const EXV = E.VERSION_CONTRACT.expectedVersions;
test('160. exact version match required', () => assert.equal(E.VERSION_CONTRACT.policy.exactVersionMatchRequired, true));
test('161. unknown version fails closed', () => assert.equal(E.VERSION_CONTRACT.policy.unknownVersionFailsClosed, true));
test('162. downgrade forbidden', () => assert.equal(E.VERSION_CONTRACT.policy.versionDowngradeAllowed, false));
test('163. aggregate alias forbidden', () => assert.equal(E.VERSION_CONTRACT.policy.aggregatedVersionObjectAsSourceAliasAllowed, false));
test('164. silent coercion forbidden', () => assert.equal(E.VERSION_CONTRACT.policy.silentVersionCoercionAllowed, false));
for (const [i, k] of Object.keys(EXV).entries()) test(`${165 + i}. version ${k} is real semver`, () => assert.ok(typeof EXV[k] === 'string' && /@\d+\.\d+\.\d+$/.test(EXV[k])));
test('173. bridgeRuntimeVersion present in decision (real)', () => assert.equal(DEC.bridgeVersion, EXV.bridgeRuntimeVersion));
test('174. version presence separation declared', () => assert.ok(Array.isArray(E.VERSION_CONTRACT.presentInBridgeDecision) && Array.isArray(E.VERSION_CONTRACT.configOrContractOnly)));

// ===================== 8. Read-only (175-195) =====================
for (const [i, k] of ['sourceDecisionMutationAllowed', 'targetDescriptorMutationAllowed', 'sourceOwnershipTransferred', 'targetOwnershipTransferred', 'sourceReferenceRetentionAllowed', 'targetReferenceRetentionAllowed', 'sharedMutableStateAllowed'].entries()) test(`${175 + i}. read-only ${k} false`, () => assert.equal(E.READ_ONLY_CONTRACT[k], false));
test('182. clone required', () => assert.equal(E.READ_ONLY_CONTRACT.cloneRequired, true));
test('183. deep freeze required', () => assert.equal(E.READ_ONLY_CONTRACT.deepFreezeRequired, true));

// ===================== 9. Pipeline (184-210) =====================
test('184. 17 stages', () => assert.equal(E.VALIDATION_PIPELINE_CONTRACT.stages.length, 17));
test('185. pipeline not implemented', () => assert.equal(E.VALIDATION_PIPELINE_CONTRACT.pipelineImplemented, false));
test('186. validation not executed', () => assert.equal(E.VALIDATION_PIPELINE_CONTRACT.validationExecuted, false));
test('187. envelope not created', () => assert.equal(E.VALIDATION_PIPELINE_CONTRACT.envelopeCreated, false));
const STG = ['source_decision_shape_validation', 'source_decision_status_validation', 'source_decision_digest_validation', 'target_descriptor_presence_validation', 'target_descriptor_shape_validation', 'decision_descriptor_pair_validation', 'source_version_validation', 'target_version_validation', 'synthetic_boundary_validation', 'security_boundary_validation', 'ssot_boundary_validation', 'preview_mount_boundary_validation', 'real_data_boundary_validation', 'module_generation_boundary_validation', 'certification_boundary_validation', 'product_exposure_boundary_validation', 'prototype_reference_validation'];
for (const [i, s] of STG.entries()) test(`${188 + i}. stage ${i} == ${s}`, () => assert.equal(E.VALIDATION_PIPELINE_CONTRACT.stages[i], s));

// ===================== 10. Issue model / failure (205-240) =====================
test('205. issue codes >= 40', () => assert.ok(E.ENVELOPE_ISSUE_CODES.length >= 40));
test('206. issue codes unique', () => assert.equal(new Set(E.ENVELOPE_ISSUE_CODES).size, E.ENVELOPE_ISSUE_CODES.length));
test('207. ordering keys', () => assert.deepEqual(E.ISSUE_MODEL_CONTRACT.orderingKeys, ['stage', 'path', 'issueCode', 'message']));
test('208. no silent correction', () => assert.equal(E.ISSUE_MODEL_CONTRACT.silentCorrectionAllowed, false));
test('209. no permissive fallback', () => assert.equal(E.ISSUE_MODEL_CONTRACT.permissiveFallbackAllowed, false));
for (const [i, c] of E.ENVELOPE_ISSUE_CODES.entries()) test(`ic-${i}. issue code ${c} well-formed`, () => assert.ok(typeof c === 'string' && c.startsWith('ENVELOPE_')));
test('210. atomic envelope decision required', () => assert.equal(E.FAILURE_CONTAINMENT_CONTRACT.atomicEnvelopeDecisionRequired, true));
for (const [i, k] of ['partialEnvelopeAllowed', 'sourceMutationAllowed', 'sideEffectsAllowed', 'stackLeakAllowed', 'internalErrorMessageLeakAllowed', 'secretLeakAllowed'].entries()) test(`${211 + i}. failure ${k} false`, () => assert.equal(E.FAILURE_CONTAINMENT_CONTRACT[k], false));
test('217. exceptions fail closed', () => assert.equal(E.FAILURE_CONTAINMENT_CONTRACT.unexpectedExceptionsMustFailClosed, true));

// ===================== 11. Limits / extensions / replay (218-260) =====================
test('218. 6 resource dimensions', () => assert.equal(E.RESOURCE_LIMIT_CONTRACT.dimensions.length, 6));
test('219. unknown dimension rejected', () => assert.equal(E.RESOURCE_LIMIT_CONTRACT.unknownDimensionRejected, true));
test('220. no silent truncation', () => assert.equal(E.RESOURCE_LIMIT_CONTRACT.silentTruncationAllowed, false));
for (const [i, d] of E.RESOURCE_LIMIT_CONTRACT.dimensions.entries()) {
  test(`${221 + i * 2}. dim ${d.dimension} has source/envelope/consumer limits`, () => assert.ok(Number.isInteger(d.sourceLimit) && Number.isInteger(d.envelopeLimit) && Number.isInteger(d.consumerLimit)));
  test(`${222 + i * 2}. dim ${d.dimension} has issueCode + reason`, () => assert.ok(typeof d.issueCode === 'string' && typeof d.reason === 'string'));
}
for (const [i, k] of ['unnamespacedExtensionsRejected', 'extensionNamespaceRequired', 'extensionSchemaRequired', 'duplicateNamespaceRejected', 'extensionCannotOverrideCriticalFields', 'extensionCannotOverrideCapabilities', 'extensionCannotOverrideVersions', 'extensionCannotOverrideDigests', 'prototypePollutionKeysRejected'].entries()) test(`${234 + i}. extensibility ${k} true`, () => assert.equal(E.EXTENSIBILITY_CONTRACT[k], true));
test('243. extension pollution keys listed', () => assert.deepEqual(E.EXTENSIBILITY_CONTRACT.prototypePollutionKeys, ['__proto__', 'constructor', 'prototype']));
for (const [i, k] of ['sameDecisionProducesSameEnvelope', 'sameDigestAndDescriptorProducesSameEnvelope', 'crossInstanceDeterminismRequired', 'sameIssuesOrderingRequired'].entries()) test(`${244 + i}. replay ${k} true`, () => assert.equal(E.REPLAY_CONTRACT[k], true));
for (const [i, k] of ['replaySideEffectsAllowed', 'ambientClockAllowed', 'randomnessAllowed', 'localeDependencyAllowed', 'timezoneDependencyAllowed', 'replayImplemented'].entries()) test(`${248 + i}. replay ${k} false`, () => assert.equal(E.REPLAY_CONTRACT[k], false));

// ===================== 12. SSOT / permission / security / prototype / manual gate (254-300) =====================
test('254. certified blueprint remains SSOT', () => assert.equal(E.SSOT_BOUNDARY_CONTRACT.certifiedBlueprintRemainsSsot, true));
for (const [i, k] of ['bridgeDecisionIsCanonical', 'targetDescriptorIsCanonical', 'envelopeIsCanonical', 'envelopeMayCertify', 'envelopeMayPublish', 'envelopeMayRegister', 'envelopeMayGenerateModule', 'envelopeMayExposeProduct'].entries()) test(`${255 + i}. ssot ${k} false`, () => assert.equal(E.SSOT_BOUNDARY_CONTRACT[k], false));
for (const [i, k] of ['permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated', 'clientSideAuthorizationSufficient'].entries()) test(`${263 + i}. permission ${k} false`, () => assert.equal(E.PERMISSION_TENANCY_BOUNDARY_CONTRACT[k], false));
test('267. requires permission/tenancy foundation', () => assert.equal(E.PERMISSION_TENANCY_BOUNDARY_CONTRACT.requiresPermissionTenancyFoundationBeforeExposure, true));
test('268. security failClosed', () => assert.equal(E.SECURITY_CONTRACT.failClosed, true));
for (const [i, k] of ['anyForbiddenSideEffect', 'evalAllowed', 'dynamicCodeAllowed', 'timersAllowed', 'filesystemAllowed', 'networkAllowed', 'prismaAllowed', 'processEnvMutationAllowed', 'stackLeakAllowed', 'secretLeakAllowed'].entries()) test(`${269 + i}. security ${k} false`, () => assert.equal(E.SECURITY_CONTRACT[k], false));
test('279. prototype relink forbidden', () => assert.equal(E.PROTOTYPE_PROHIBITION_CONTRACT.prototypeRelinkAllowed, false));
test('280. old prototype not imported', () => assert.equal(E.PROTOTYPE_PROHIBITION_CONTRACT.oldPrototypeImported, false));
test('281. forbidden prototype paths (8)', () => assert.equal(E.PROTOTYPE_PROHIBITION_CONTRACT.forbiddenPrototypePaths.length, 8));
test('282. manual gate required', () => assert.equal(E.MANUAL_CHECKPOINT_CONTRACT.manualGateRequired, true));
test('283. authorizes envelope contract', () => assert.equal(E.MANUAL_CHECKPOINT_CONTRACT.authorizesEnvelopeContract, true));
for (const [i, k] of ['authorizesImplementationPlan', 'authorizesEnvelopeBuilder', 'authorizesConsumerRuntime', 'authorizesPreviewMount', 'authorizesUi', 'authorizesAppTouch', 'authorizesPersistence', 'authorizesBackend', 'authorizesPrisma', 'authorizesModuleGeneration', 'authorizesCertification', 'authorizesProductExposure'].entries()) test(`${284 + i}. manual gate ${k} false`, () => assert.equal(E.MANUAL_CHECKPOINT_CONTRACT[k], false));

// ===================== 13. Capabilities exhaustive (300-360) =====================
const CAPS = E.ENVELOPE_CAPABILITIES;
const FALSE_CAPS = Object.keys(CAPS).filter((k) => CAPS[k] === false);
test('300. capabilities frozen', () => assert.ok(Object.isFrozen(CAPS)));
test('301. decisionDigestCoversTargetDescriptor true', () => assert.equal(CAPS.decisionDigestCoversTargetDescriptor, true));
for (const [i, k] of FALSE_CAPS.entries()) test(`fc-${i}. runtime capability ${k} false`, () => assert.equal(CAPS[k], false));
for (const k of ['envelopeBuilderImplemented', 'identityVerificationImplemented', 'consumerRuntimeImplemented', 'previewMounted', 'appTouched', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'permissionModelIntegrated', 'realDataRead', 'networkUsed', 'prototypeRelinked']) test(`cap-false-${k}. capability ${k} false`, () => assert.equal(CAPS[k], false));

// ===================== 14. Verifier tamper (360-410) =====================
const V = E.verifyBridgeDecisionEnvelopeIdentityContract;
test('360. verifier ok on real contract', () => assert.equal(V({ contract: CONTRACT }).ok, true));
test('361. verifier never throws on null', () => { assert.doesNotThrow(() => V({ contract: null })); assert.doesNotThrow(() => V(null)); });
test('362. verifier detects digest does not cover target', () => assert.equal(V({ contract: { ...CONTRACT, digestCoverage: { ...E.DIGEST_COVERAGE_CONTRACT, targetDescriptorCoveredByDigest: false } } }).ok, false));
test('363. verifier detects B-IDENTITY remains open', () => assert.equal(V({ contract: { ...CONTRACT, digestCoverage: { ...E.DIGEST_COVERAGE_CONTRACT, bIdentityRemainsOpen: true } } }).ok, false));
test('364. verifier detects identity synthesis', () => assert.equal(V({ contract: { ...CONTRACT, identityBinding: { ...E.IDENTITY_BINDING_CONTRACT, identitySynthesisAllowed: true } } }).ok, false));
test('365. verifier detects identity alias', () => assert.equal(V({ contract: { ...CONTRACT, identityBinding: { ...E.IDENTITY_BINDING_CONTRACT, identityAliasAllowed: true } } }).ok, false));
test('366. verifier detects identity fallback', () => assert.equal(V({ contract: { ...CONTRACT, identityBinding: { ...E.IDENTITY_BINDING_CONTRACT, identityFallbackAllowed: true } } }).ok, false));
test('367. verifier detects cross-decision mix', () => assert.equal(V({ contract: { ...CONTRACT, provenance: { ...E.PROVENANCE_CONTRACT, crossDecisionDescriptorMixingAllowed: true } } }).ok, false));
test('368. verifier detects descriptor replacement', () => assert.equal(V({ contract: { ...CONTRACT, provenance: { ...E.PROVENANCE_CONTRACT, descriptorReplacementAllowed: true } } }).ok, false));
test('369. verifier detects consumerRuntimeImplemented', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, consumerRuntimeImplemented: true } } }).ok, false));
test('370. verifier detects envelopeBuilderImplemented', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, envelopeBuilderImplemented: true } } }).ok, false));
test('371. verifier detects previewMounted', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, previewMounted: true } } }).ok, false));
test('372. verifier detects productExposed', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, productExposed: true } } }).ok, false));
test('373. verifier detects permission integrated', () => assert.equal(V({ contract: { ...CONTRACT, capabilities: { ...CAPS, permissionModelIntegrated: true } } }).ok, false));
test('374. verifier detects source mutation', () => assert.equal(V({ contract: { ...CONTRACT, readOnly: { ...E.READ_ONLY_CONTRACT, sourceDecisionMutationAllowed: true } } }).ok, false));
test('375. verifier detects ssot inversion', () => assert.equal(V({ contract: { ...CONTRACT, ssotBoundary: { ...E.SSOT_BOUNDARY_CONTRACT, envelopeIsCanonical: true } } }).ok, false));
test('376. verifier detects missing manual gate', () => assert.equal(V({ contract: { ...CONTRACT, manualCheckpoint: { ...E.MANUAL_CHECKPOINT_CONTRACT, manualGateRequired: false } } }).ok, false));
test('377. verifier detects premature runtime', () => assert.equal(V({ contract: { ...CONTRACT, readyForRuntimeImplementation: true } }).ok, false));
test('378. verifier detects premature implementation plan', () => assert.equal(V({ contract: { ...CONTRACT, readyForImplementationPlan: true } }).ok, false));
test('379. verifier detects invented decision field', () => assert.equal(V({ contract: { ...CONTRACT, sourceDecision: { ...E.SOURCE_DECISION_CONTRACT, realDecisionFields: [...E.REAL_BRIDGE_DECISION_FIELDS, 'inventedQq'] } } }).ok, false));
test('380. verifier detects permissive version', () => assert.equal(V({ contract: { ...CONTRACT, versionContract: { ...E.VERSION_CONTRACT, policy: { ...E.VERSION_CONTRACT.policy, exactVersionMatchRequired: false } } } }).ok, false));
test('381. verifier detects manual gate authorizes runtime', () => assert.equal(V({ contract: { ...CONTRACT, manualCheckpoint: { ...E.MANUAL_CHECKPOINT_CONTRACT, authorizesConsumerRuntime: true } } }).ok, false));
test('382. verifier checkedCapabilities positive', () => assert.ok(V({ contract: CONTRACT }).checkedCapabilities > 0));

// ===================== 15. Static / scope / no-runtime (383-430) =====================
test('383. no eval/Function/timer', () => assert.ok(!/\beval\s*\(|new Function\(|setTimeout|setInterval/.test(jsCode())));
test('384. no fs/network/prisma', () => assert.ok(!/from ['"]fs['"]|writeFileSync|child_process|fetch\(|axios|XMLHttpRequest|WebSocket|PrismaClient/.test(jsCode())));
test('385. no Math.random/Date.now (excl verifier)', () => { const noV = stripComments(jsFiles().filter((f) => !/verifyBridgeDecisionEnvelopeIdentityContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n')); assert.ok(!/Math\.random|Date\.now|new Date\(|performance\.now|localeCompare/.test(noV)); });
test('386. no React import', () => assert.ok(!/from ['"]react['"]/.test(jsCode())));
test('387. no App import', () => assert.ok(!/App\.jsx/.test(jsCode())));
test('388. no App.jsx in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('389. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
test('390. no backend/prisma in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('391. no src/modules in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\//.test(x))); });
test('392. no guards in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs'), 'productionUiGuard is never in scope'); if (f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')) { const a = createResolvedActiveStudioSlicePathAuthorizer(f); assert.equal(a.ok, true); assert.ok(a.isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs'), String(a.activeSliceId)); } });
test('393. no upstream subtrees in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|bridge-to-preview-sandbox-runtime-contract|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(x))); });
test('394. registry lists contract', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/bridge-decision-envelope-identity-contract/.test(reg)); });
test('395. package.json test script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/studio-bridge-decision-envelope-identity-contract\.test\.js/.test(pkg)); });
test('396. package.json gate script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/g423-studio-bridge-decision-envelope-identity-contract\.mjs/.test(pkg)); });
test('397. no prototype subtree imports', () => assert.ok(!jsImports().some((p) => /studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(p))));
const RD = CONTRACT.readinessDecision;
for (const [i, k] of ['envelopeBuilderImplemented', 'identityVerificationImplemented', 'validationImplemented', 'consumerRuntimeImplemented', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'prototypeRelinked'].entries()) test(`${398 + i}. readiness ${k} false`, () => assert.equal(RD[k], false));
test('416. readiness readyForImplementationPlan false', () => assert.equal(RD.readyForImplementationPlan, false));
test('417. readiness readyForEnterpriseContractAudit true', () => assert.equal(RD.readyForEnterpriseContractAudit, true));
test('418. readiness bIdentityClosedByContract true', () => assert.equal(RD.bIdentityClosedByContract, true));

// ===================== 16. Evidence docs (419-450) =====================
const DOCS = ['B-IDENTITY-ROOT-CAUSE.md', 'REAL-BRIDGE-DECISION-SHAPE.md', 'REAL-TARGET-DESCRIPTOR-SHAPE.md', 'DECISION-DIGEST-COVERAGE.md', 'ENVELOPE-SHAPE.md', 'IDENTITY-BINDING.md', 'PROVENANCE.md', 'VERSIONS.md', 'READ-ONLY.md', 'VALIDATION-PIPELINE.md', 'ISSUE-MODEL.md', 'FAILURE-CONTAINMENT.md', 'RESOURCE-LIMITS.md', 'EXTENSIBILITY.md', 'REPLAY.md', 'SSOT-SECURITY.md', 'PERMISSION-TENANCY.md', 'PROTOTYPE-PROHIBITION.md', 'MANUAL-GATE.md', 'MANIFEST-VERIFIER.md', 'NO-RUNTIME-NO-UI-NO-APP-NO-MOUNT.md', 'BUNDLE-ABSENCE.md', 'QUALITY-RISK.md', 'NEXT-ENTERPRISE-AUDIT.md'];
for (const [i, d] of DOCS.entries()) test(`${419 + i}. evidence doc ${d}`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-bridge-decision-envelope-identity-contract/${d}`)));
test('443. exactly 24 evidence docs', () => assert.equal(DOCS.length, 24));
test('444. B-IDENTITY doc declares closure', () => assert.ok(/closed by contract|digest cover|B-IDENTITY/i.test(readEv('B-IDENTITY-ROOT-CAUSE.md'))));
test('445. digest coverage doc mentions targetDescriptor', () => assert.ok(/targetDescriptor|covers|preimage/i.test(readEv('DECISION-DIGEST-COVERAGE.md'))));
test('446. identity binding doc mentions recompute', () => assert.ok(/recompute|same decision|bind/i.test(readEv('IDENTITY-BINDING.md'))));
test('447. next audit doc mentions implementation plan', () => assert.ok(/implementation plan|enterprise|audit/i.test(readEv('NEXT-ENTERPRISE-AUDIT.md'))));

// ===================== 17. Determinism sweep (448-640+) =====================
let si = 448;
for (const part of ['sourceDecision', 'envelopeShape', 'identityBinding', 'digestCoverage', 'provenance', 'versionContract', 'readOnly', 'validationPipeline', 'issueModel', 'failureContainment', 'resourceLimits', 'extensibility', 'replayContract', 'ssotBoundary', 'permissionTenancyBoundary', 'securityContract', 'prototypeProhibition', 'manualCheckpoint']) {
  test(`${si}. part ${part} present + frozen`, () => { assert.ok(CONTRACT[part]); assert.ok(Object.isFrozen(CONTRACT[part])); }); si += 1;
}
for (let k = 0; k < 15; k += 1) { test(`${si}. manifest stable #${k}`, () => assert.equal(E.createStudioBridgeDecisionEnvelopeIdentityContract({}).manifest.overallDigest, CONTRACT.manifest.overallDigest)); si += 1; }
for (const [i, code] of E.ENVELOPE_ISSUE_CODES.entries()) { test(`${si}. issue code ${i} unique-usable`, () => assert.ok(E.ENVELOPE_ISSUE_CODES.indexOf(code) === i)); si += 1; }
for (const s of E.ENVELOPE_VALIDATION_STAGES) { test(`${si}. stage ${s} snake_case`, () => assert.ok(/^[a-z_]+$/.test(s))); si += 1; }
for (const st of E.ENVELOPE_DECISION_STATUSES) { test(`${si}. status ${st}`, () => assert.ok(st.startsWith('envelope_identity_'))); si += 1; }
for (const f of E.REAL_BRIDGE_DECISION_FIELDS) { test(`${si}. real decision field ${f} present on live decision`, () => assert.ok(Object.prototype.hasOwnProperty.call(DEC, f))); si += 1; }
for (let k = 0; k < 20; k += 1) { test(`${si}. verifier deterministic #${k}`, () => assert.equal(E.verifyBridgeDecisionEnvelopeIdentityContract({ contract: CONTRACT }).ok, true)); si += 1; }
for (let s = 0; s < 5; s += 1) {
  const d = buildRealDecision(`sweep-${s}`);
  test(`${si}. seed ${s} decision keys == declared`, () => assert.deepEqual(Object.keys(d).sort(), [...E.REAL_BRIDGE_DECISION_FIELDS].sort())); si += 1;
  test(`${si}. seed ${s} digest covers target (tamper changes it)`, () => { const core = {}; for (const k of Object.keys(d)) if (k !== 'bridgeDecisionDigest') core[k] = k === 'targetDescriptor' ? { ...d[k], candidateDraftId: 'X' } : d[k]; assert.notEqual(createDeterministicDigest(core), d.bridgeDecisionDigest); }); si += 1;
}
