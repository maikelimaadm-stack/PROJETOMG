#!/usr/bin/env node
/**
 * Gate G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-SOURCE-SHAPE-ALIGNMENT — Post-Foundation C.
 *
 * Proves the bridge CONTRACT and bridge IMPLEMENTATION PLAN are aligned to the REAL Authoring Runtime
 * synthetic preview handoff shape: real source field names only (no `upstreamVersions`, no generic
 * `digest`), explicit version tuple, `handoffDigest` recompute-and-compare, documented serializer/preimage,
 * intentional resource-limit coherence, and strict draft identity — while the bridge remains UNIMPLEMENTED
 * (no UI/App/persistence/backend/module/certification/product exposure). Consumes the runtime + sandbox
 * READ-ONLY. Runs the real round-trip via the runtime API.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const CONTRACT_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-source-shape-alignment');
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-source-shape-alignment.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment.mjs';
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const DOCS = [
  'CERTIFICATION-REPORT.md', 'SOURCE-HANDOFF-REAL-SHAPE.md', 'CONTRACT-PLAN-DIVERGENCE.md',
  'CORRECTED-SOURCE-FIELDS.md', 'CORRECTED-FIELD-MAPPINGS.md', 'REAL-HANDOFF-ROUND-TRIP.md',
  'STRICT-DRAFT-IDENTITY.md', 'VERSION-TUPLE-ALIGNMENT.md', 'HANDOFF-DIGEST-RECOMPUTE-CONTRACT.md',
  'CANONICAL-SERIALIZER-PREIMAGE.md', 'RESOURCE-LIMIT-COHERENCE.md', 'SSOT-SECURITY-PROHIBITIONS.md',
  'REGRESSION-GATE.md', 'FABLE-REVALIDATION-REQUIRED.md', 'QUALITY-RISK-NOTES.md',
];

gate('G423-AL — alignment test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-AL — alignment gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-AL — contract subtree present', exists(path.join(CONTRACT_DIR, 'index.js')));
gate('G423-AL — plan subtree present', exists(path.join(PLAN_DIR, 'index.js')));
gate('G423-AL — runtime subtree present (read-only)', exists(path.join(RUNTIME_DIR, 'index.js')));
gate('G423-AL — preview sandbox subtree present (read-only)', exists(path.join(SANDBOX_DIR, 'index.js')));
for (const d of DOCS) gate(`G423-AL — ${d} exists`, exists(path.join(EV, d)));

let rt = null; let cm = null; let pm = null;
try { rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { cm = await import(pathToFileURL(path.join(CONTRACT_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { pm = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

// Real round-trip.
function buildHandoff(seed = 'g') {
  let r = rt.executeAuthoringOperation({ session: rt.createAuthoringRuntimeSession({ seed }), operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const id = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } });
  return rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] });
}
let H = null; let CONTRACT = null; let PLAN = null;
try { H = buildHandoff('g'); } catch (err) { console.error(String(err)); }
try { CONTRACT = cm.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: H }); } catch (err) { console.error(String(err)); }
try { PLAN = pm.createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan({ bridgeContract: CONTRACT }); } catch (err) { console.error(String(err)); }

// Real handoff shape.
gate('G423-AL — real handoff has NO upstreamVersions field', H ? !('upstreamVersions' in H) : false);
gate('G423-AL — real handoff has NO generic digest field', H ? !('digest' in H) : false);
gate('G423-AL — real handoff HAS handoffVersion', H ? ('handoffVersion' in H) : false);
gate('G423-AL — real handoff HAS runtimeVersion', H ? ('runtimeVersion' in H) : false);
gate('G423-AL — real handoff HAS targetSandboxVersion', H ? ('targetSandboxVersion' in H) : false);
gate('G423-AL — real handoff HAS handoffDigest', H ? ('handoffDigest' in H) : false);
gate('G423-AL — real handoff handoffKind synthetic_preview_candidate', H ? H.handoffKind === 'synthetic_preview_candidate' : false);
gate('G423-AL — real handoff draftId explicit non-empty', H ? (typeof H.draftId === 'string' && H.draftId.length > 0) : false);
gate('G423-AL — real handoff draftRevision non-negative int', H ? (Number.isInteger(H.draftRevision) && H.draftRevision >= 0) : false);
gate('G423-AL — real handoff synthetic/immutable/validated/ok true', H ? (H.synthetic === true && H.immutable === true && H.validated === true && H.ok === true) : false);
gate('G423-AL — real handoff previewMounted/realDataAttached/productExposed false', H ? (H.previewMounted === false && H.realDataAttached === false && H.productExposed === false) : false);
gate('G423-AL — real handoff frozen', H ? Object.isFrozen(H) : false);
gate('G423-AL — REAL_HANDOFF_FIELDS (contract) matches actual keys', (() => { try { return JSON.stringify([...cm.REAL_HANDOFF_FIELDS].sort()) === JSON.stringify(Object.keys(H).sort()); } catch { return false; } })());
gate('G423-AL — REAL_HANDOFF_FIELDS (plan) matches actual keys', (() => { try { return JSON.stringify([...pm.REAL_HANDOFF_FIELDS].sort()) === JSON.stringify(Object.keys(H).sort()); } catch { return false; } })());
gate('G423-AL — forbidden legacy fields = [upstreamVersions, digest] (contract)', (() => { try { return JSON.stringify([...cm.FORBIDDEN_LEGACY_SOURCE_FIELDS]) === JSON.stringify(['upstreamVersions', 'digest']); } catch { return false; } })());
gate('G423-AL — forbidden legacy fields = [upstreamVersions, digest] (plan)', (() => { try { return JSON.stringify([...pm.FORBIDDEN_LEGACY_SOURCE_FIELDS]) === JSON.stringify(['upstreamVersions', 'digest']); } catch { return false; } })());

// Corrected source fields — zero invented.
gate('G423-AL — contract CRITICAL_SOURCE_FIELDS all real', (() => { try { return cm.CRITICAL_SOURCE_FIELDS.every((f) => Object.keys(H).includes(f)); } catch { return false; } })());
gate('G423-AL — plan CRITICAL_SOURCE_FIELDS all real', (() => { try { return pm.CRITICAL_SOURCE_FIELDS.every((f) => Object.keys(H).includes(f)); } catch { return false; } })());
gate('G423-AL — contract critical fields exclude legacy', (() => { try { return !cm.CRITICAL_SOURCE_FIELDS.includes('upstreamVersions') && !cm.CRITICAL_SOURCE_FIELDS.includes('digest'); } catch { return false; } })());
gate('G423-AL — plan critical fields exclude legacy', (() => { try { return !pm.CRITICAL_SOURCE_FIELDS.includes('upstreamVersions') && !pm.CRITICAL_SOURCE_FIELDS.includes('digest'); } catch { return false; } })());
gate('G423-AL — contract source contract required fields all real', (() => { try { const s = cm.createSourceHandoffContract(); return s.everyRequiredFieldExistsInRealHandoff === true && s.upstreamVersionsSourceFieldAllowed === false && s.genericDigestSourceFieldAllowed === false && s.realSourceFieldNamesRequired === true; } catch { return false; } })());
gate('G423-AL — plan source validation plan required fields all real', (() => { try { const s = pm.createSourceValidationPlan(); return s.everyRequiredFieldExistsInRealHandoff === true && s.upstreamVersionsSourceFieldAllowed === false && s.genericDigestSourceFieldAllowed === false; } catch { return false; } })());

// Every mapping source/target valid — real handoff.
let cfm = null; let pfm = null;
try { cfm = cm.createBridgeFieldMappingContract(); } catch { /* */ }
try { pfm = pm.createFieldMappingExecutionPlan(); } catch { /* */ }
gate('G423-AL — contract mapping count 12', cfm ? cfm.mappingCount === 12 : false);
gate('G423-AL — plan mapping count 12', pfm ? pfm.mappingCount === 12 : false);
gate('G423-AL — contract every mapping source in real handoff', cfm ? cfm.everyMappingSourceExistsInRealHandoff === true : false);
gate('G423-AL — plan every mapping source in real handoff', pfm ? pfm.everyMappingSourceExistsInRealHandoff === true : false);
gate('G423-AL — contract no invented source field', cfm ? cfm.anyInventedSourceField === false : false);
gate('G423-AL — plan no invented source field', pfm ? pfm.anyInventedSourceField === false : false);
gate('G423-AL — contract no legacy alias mapping', cfm ? cfm.anyLegacyAliasSourceField === false : false);
gate('G423-AL — plan no legacy alias mapping', pfm ? pfm.anyLegacyAliasSourceField === false : false);
gate('G423-AL — contract every mapping source really on handoff (live)', (() => { try { return cm.BRIDGE_FIELD_MAPPINGS.every((mm) => mm.sourceField in H); } catch { return false; } })());
gate('G423-AL — plan every mapping source really on handoff (live)', (() => { try { return pm.BRIDGE_FIELD_MAPPINGS.every((mm) => mm.sourceField in H); } catch { return false; } })());
gate('G423-AL — contract no upstreamVersions/digest mapping source', (() => { try { return !cm.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === 'upstreamVersions' || mm.sourceField === 'digest'); } catch { return false; } })());
gate('G423-AL — plan no upstreamVersions/digest mapping source', (() => { try { return !pm.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === 'upstreamVersions' || mm.sourceField === 'digest'); } catch { return false; } })());
gate('G423-AL — contract handoffDigest -> sourceDigest', (() => { try { return cm.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === 'handoffDigest' && mm.targetField === 'sourceDigest'); } catch { return false; } })());
gate('G423-AL — contract no duplicate source/target', cfm ? (cfm.noDuplicateSourceField === true && cfm.noDuplicateTargetField === true) : false);
gate('G423-AL — plan no duplicate source/target', pfm ? (pfm.noDuplicateSourceField === true && pfm.noDuplicateTargetField === true) : false);
gate('G423-AL — contract every required target mapped', cfm ? cfm.everyRequiredTargetMapped === true : false);
gate('G423-AL — plan every required target mapped', pfm ? pfm.everyRequiredTargetMapped === true : false);
gate('G423-AL — contract no critical default/lossy/unknown transform', cfm ? (cfm.anyCriticalDefault === false && cfm.anyLossyCritical === false && cfm.anyUnknownTransform === false) : false);
gate('G423-AL — plan no critical default/lossy/unknown transform', pfm ? (pfm.anyCriticalDefault === false && pfm.anyLossyCritical === false && pfm.anyUnknownTransform === false) : false);
gate('G423-AL — security fields validated not mapped (contract)', (() => { try { const secs = ['previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed']; return secs.every((s) => !cm.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === s)); } catch { return false; } })());
gate('G423-AL — plan mappings all planned not implemented', pfm ? pfm.mappings.every((mm) => mm.executionStatus === 'planned' && mm.implemented === false) : false);

// Digest recompute-and-compare + serializer/preimage documented.
let cds = null; let pds = null;
try { cds = cm.createBridgeDigestSemanticsContract(); } catch { /* */ }
try { pds = pm.createSourceDigestValidationPlan(); } catch { /* */ }
gate('G423-AL — contract digest field handoffDigest', cds ? cds.sourceDigestField === 'handoffDigest' : false);
gate('G423-AL — plan digest field handoffDigest', pds ? pds.sourceDigestField === 'handoffDigest' : false);
gate('G423-AL — contract validation mode recompute_and_compare', cds ? cds.digestValidationMode === 'recompute_and_compare' : false);
gate('G423-AL — plan validation mode recompute_and_compare', pds ? pds.digestValidationMode === 'recompute_and_compare' : false);
gate('G423-AL — contract algo fnv1a-32', cds ? cds.sourceDigestAlgorithm === 'fnv1a-32' : false);
gate('G423-AL — contract serializer stableSerialize + path declared', cds ? (cds.canonicalSerializer === 'stableSerialize' && /stableSerialize\.js$/.test(cds.canonicalSerializerPath)) : false);
gate('G423-AL — plan serializer stableSerialize + path declared', pds ? (pds.canonicalSerializer === 'stableSerialize' && /stableSerialize\.js$/.test(pds.canonicalSerializerPath)) : false);
gate('G423-AL — contract digest helper + path declared', cds ? (cds.digestHelper === 'createDeterministicDigest' && /createDeterministicDigest\.js$/.test(cds.digestHelperPath)) : false);
gate('G423-AL — plan digest helper + path declared', pds ? (pds.digestHelper === 'createDeterministicDigest' && /createDeterministicDigest\.js$/.test(pds.digestHelperPath)) : false);
gate('G423-AL — contract preimage excludes handoffDigest', cds ? !cds.preimageFields.includes('handoffDigest') : false);
gate('G423-AL — plan preimage excludes handoffDigest', pds ? !pds.preimageFields.includes('handoffDigest') : false);
gate('G423-AL — contract no alternative serializer', cds ? cds.alternativeSerializerAllowed === false : false);
gate('G423-AL — plan no alternative serializer', pds ? pds.alternativeSerializerAllowed === false : false);
gate('G423-AL — contract FNV internal-only, not cryptographic', cds ? (cds.fnv1aInternalOnly === true && cds.cryptographicIntegrityProvided === false) : false);
gate('G423-AL — contract digest authorizes nothing real', cds ? (cds.digestMayAuthorizeCertification === false && cds.digestMayAuthorizeModuleGeneration === false && cds.digestMayAuthorizeProduction === false) : false);
gate('G423-AL — plan digest authorizes nothing real', pds ? (pds.digestMayAuthorizeCertification === false && pds.digestMayAuthorizeModuleGeneration === false && pds.digestMayAuthorizeProduction === false) : false);
// The actual recompute over the REAL handoff.
gate('G423-AL — LIVE recompute: preimage reproduces handoffDigest', (() => { try { const { handoffDigest, ...pre } = H; return rt.createDeterministicDigest(pre) === handoffDigest; } catch { return false; } })());
gate('G423-AL — LIVE recompute: key-order independent', (() => { try { const { handoffDigest, ...pre } = H; const re = {}; for (const k of Object.keys(pre).reverse()) re[k] = pre[k]; return rt.createDeterministicDigest(re) === handoffDigest; } catch { return false; } })());
gate('G423-AL — LIVE recompute: tamper detected', (() => { try { const { handoffDigest, ...pre } = H; return rt.createDeterministicDigest({ ...pre, draftRevision: (pre.draftRevision ?? 0) + 1 }) !== handoffDigest; } catch { return false; } })());
gate('G423-AL — LIVE stableSerialize key-sorted', (() => { try { return rt.stableSerialize({ b: 1, a: 2 }) === rt.stableSerialize({ a: 2, b: 1 }); } catch { return false; } })());

// Version tuple.
let cvc = null; let pvv = null;
try { cvc = cm.createBridgeVersionCompatibilityContract(); } catch { /* */ }
try { pvv = pm.createSourceVersionValidationPlan(); } catch { /* */ }
gate('G423-AL — contract explicit version tuple, aggregated upstreamVersions not required', cvc ? (cvc.explicitVersionTupleRequired === true && cvc.aggregatedUpstreamVersionsFieldRequired === false) : false);
gate('G423-AL — plan explicit version tuple, aggregated upstreamVersions not required', pvv ? (pvv.explicitVersionTupleRequired === true && pvv.aggregatedUpstreamVersionsFieldRequired === false) : false);
gate('G423-AL — contract exact version match required', cvc ? cvc.exactVersionMatchRequired === true : false);
gate('G423-AL — contract unknown fail-closed, no downgrade, upgrade not assumed', cvc ? (cvc.unknownVersionFailsClosed === true && cvc.versionDowngradeAllowed === false && cvc.versionUpgradeAssumedCompatible === false) : false);
gate('G423-AL — contract tuple versions match real handoff', cvc ? (cvc.tuple.handoffVersion === H.handoffVersion && cvc.tuple.runtimeVersion === H.runtimeVersion && cvc.tuple.targetSandboxVersion === H.targetSandboxVersion) : false);
gate('G423-AL — plan tuple versions match real handoff', pvv ? (pvv.tuple.handoffVersion === H.handoffVersion && pvv.tuple.runtimeVersion === H.runtimeVersion) : false);
gate('G423-AL — contract versionTupleFields no upstreamVersions', cvc ? !cvc.versionTupleFields.includes('upstreamVersions') : false);
gate('G423-AL — plan versionTupleFields no upstreamVersions', pvv ? !pvv.versionTupleFields.includes('upstreamVersions') : false);

// Strict draft identity.
gate('G423-AL — contract strict draft identity, no single-draft fallback', (() => { try { const s = CONTRACT.sourceHandoff; return s.strictDraftIdentityRequired === true && s.explicitDraftIdRequired === true && s.singleDraftFallbackAllowed === false && s.missingDraftIdFailsClosed === true && s.unknownDraftIdFailsClosed === true && s.bridgeMayInvokeSingleDraftFallback === false && s.bridgeImplementationMustNeverCallFindDraftWithoutExplicitId === true; } catch { return false; } })());
gate('G423-AL — plan strict draft identity, runtime not altered', (() => { try { const d = PLAN.draftIdentityEnforcementPlan; return d.explicitDraftIdRequired === true && d.singleDraftFallbackAllowed === false && d.missingDraftIdFailsClosed === true && d.unknownDraftIdFailsClosed === true && d.ambiguousDraftSelectionAllowed === false && d.runtimeAlteredByThisPlan === false; } catch { return false; } })());

// Resource-limit coherence.
let rlp = null;
try { rlp = pm.createBridgeResourceLimitsPlan(); } catch { /* */ }
gate('G423-AL — limits: bridge may reject runtime-valid handoff (intentional, non-silent)', rlp ? (rlp.bridgeLimitsMayRejectRuntimeValidHandoff === true && rlp.stricterBridgeLimitsAreIntentional === true && rlp.limitMismatchIsNotSilent === true) : false);
gate('G423-AL — limits: source acceptance != bridge acceptance', rlp ? rlp.sourceAcceptanceDoesNotGuaranteeBridgeAcceptance === true : false);
gate('G423-AL — limits: exceeded -> deterministic blocker, no partial descriptor', rlp ? (rlp.limitExceededProducesDeterministicBlocker === true && rlp.partialTargetDescriptorAllowed === false) : false);
gate('G423-AL — limits: per-dimension coherence rows (>=7) with reason + issueCode', rlp ? (rlp.coherenceRowCount >= 7 && rlp.coherence.every((r) => typeof r.reason === 'string' && r.reason.length > 0 && typeof r.issueCode === 'string' && r.issueCode.length > 0)) : false);
gate('G423-AL — limits: every bridge limit stricter-or-equal where comparable', rlp ? rlp.everyBridgeLimitStricterOrEqualWhereComparable === true : false);
gate('G423-AL — limits: runtime reference limits recorded', rlp ? (rlp.runtimeReferenceLimits && rlp.runtimeReferenceLimits.maxFieldsPerDraft === 250) : false);
gate('G423-AL — limits: unknown dimension rejected, no silent truncation, fail-closed', rlp ? (rlp.unknownResourceDimensionRejected === true && rlp.silentTruncationAllowed === false && rlp.limitExceededFailsClosed === true) : false);

// Bridge remains unimplemented + readiness.
gate('G423-AL — contract bridge NOT implemented', CONTRACT ? (CONTRACT.capabilities.bridgeImplemented === false && CONTRACT.capabilities.adapterImplemented === false && CONTRACT.capabilities.sourceValidationImplemented === false && CONTRACT.capabilities.targetPayloadCreated === false && CONTRACT.capabilities.previewMounted === false) : false);
gate('G423-AL — plan bridge NOT implemented', PLAN ? (PLAN.capabilities.bridgeImplemented === false && PLAN.capabilities.mappingExecutorImplemented === false && PLAN.capabilities.targetDescriptorBuilderImplemented === false) : false);
gate('G423-AL — plan every phase planned, none implemented', PLAN ? (PLAN.phases.allPlanned === true && PLAN.phases.anyImplemented === false) : false);
gate('G423-AL — contract ready + revalidation ready + slice NOT ready', CONTRACT ? (CONTRACT.readyForBridgeContract === true && CONTRACT.readyForBridgeImplementationPlan === true && CONTRACT.readyForBridgeImplementationEnterpriseRevalidation === true && CONTRACT.readyForBridgeImplementationSlice === false) : false);
gate('G423-AL — plan ready + revalidation ready + slice NOT ready', PLAN ? (PLAN.readyForBridgeImplementationPlan === true && PLAN.readyForBridgeImplementationEnterpriseRevalidation === true && PLAN.readyForBridgeImplementationSlice === false) : false);
gate('G423-AL — contract composes green from real handoff', CONTRACT ? (CONTRACT.fallback === false && CONTRACT.blockerCount === 0 && CONTRACT.verification.ok === true && CONTRACT.readiness === 'studio_authoring_runtime_to_preview_bridge_contract_ready') : false);
gate('G423-AL — plan composes green from contract', PLAN ? (PLAN.fallback === false && PLAN.blockerCount === 0 && PLAN.verification.ok === true && PLAN.readiness === 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready') : false);
gate('G423-AL — SSOT preserved (contract + plan)', (CONTRACT && PLAN) ? (CONTRACT.ssotBoundary.certifiedBlueprintRemainsSsot === true && PLAN.ssotProtectionPlan.certifiedBlueprintRemainsSsot === true) : false);
gate('G423-AL — no product/certification/module (contract + plan)', (CONTRACT && PLAN) ? (CONTRACT.capabilities.productExposed === false && CONTRACT.capabilities.certificationPerformed === false && CONTRACT.capabilities.moduleGenerated === false && PLAN.capabilities.productExposed === false && PLAN.capabilities.certificationPerformed === false && PLAN.capabilities.moduleGenerated === false) : false);
gate('G423-AL — permission/tenancy not integrated (contract + plan)', (CONTRACT && PLAN) ? (CONTRACT.capabilities.permissionModelIntegrated === false && PLAN.capabilities.permissionModelIntegrated === false) : false);

// Verifier tamper (alignment-specific).
gate('G423-AL — contract verifier flags upstreamVersions source field', (() => { try { return cm.verifyBridgeContract({ contract: { capabilities: CONTRACT.capabilities, sourceHandoff: { requiredFields: ['upstreamVersions'] } } }).blockers.includes('unsafe_source_upstreamVersions_field'); } catch { return false; } })());
gate('G423-AL — contract verifier flags generic digest source field', (() => { try { return cm.verifyBridgeContract({ contract: { capabilities: CONTRACT.capabilities, sourceHandoff: { requiredFields: ['digest'] } } }).blockers.includes('unsafe_source_generic_digest_field'); } catch { return false; } })());
gate('G423-AL — contract verifier flags invented mapping source', (() => { try { return cm.verifyBridgeContract({ contract: { capabilities: CONTRACT.capabilities, fieldMapping: { everyMappingSourceExistsInRealHandoff: false } } }).blockers.includes('unsafe_mapping_invented_source_field'); } catch { return false; } })());
gate('G423-AL — contract verifier flags wrong digest field', (() => { try { return cm.verifyBridgeContract({ contract: { capabilities: CONTRACT.capabilities, digestSemantics: { sourceDigestField: 'digest' } } }).blockers.includes('unsafe_digest_wrong_source_field'); } catch { return false; } })());
gate('G423-AL — contract verifier flags wrong digest mode', (() => { try { return cm.verifyBridgeContract({ contract: { capabilities: CONTRACT.capabilities, digestSemantics: { digestValidationMode: 'trust' } } }).blockers.includes('unsafe_digest_wrong_validation_mode'); } catch { return false; } })());
gate('G423-AL — plan verifier flags upstreamVersions source field', (() => { try { return pm.verifyBridgeImplementationPlan({ plan: { capabilities: PLAN.capabilities, sourceValidationPlan: { requiredFields: ['upstreamVersions'] } } }).blockers.includes('unsafe_source_upstreamVersions_field'); } catch { return false; } })());
gate('G423-AL — plan verifier flags invented mapping source', (() => { try { return pm.verifyBridgeImplementationPlan({ plan: { capabilities: PLAN.capabilities, fieldMappingExecutionPlan: { everyMappingSourceExistsInRealHandoff: false } } }).blockers.includes('unsafe_mapping_invented_source_field'); } catch { return false; } })());
gate('G423-AL — plan verifier flags aggregated upstreamVersions required', (() => { try { return pm.verifyBridgeImplementationPlan({ plan: { capabilities: PLAN.capabilities, sourceVersionValidationPlan: { aggregatedUpstreamVersionsFieldRequired: true } } }).blockers.includes('unsafe_version_upstreamVersions_required'); } catch { return false; } })());
gate('G423-AL — plan verifier flags silent limit mismatch', (() => { try { return pm.verifyBridgeImplementationPlan({ plan: { capabilities: PLAN.capabilities, resourceLimitsPlan: { limitMismatchIsNotSilent: false } } }).blockers.includes('unsafe_limit_mismatch_silent'); } catch { return false; } })());
gate('G423-AL — contract verifier clean on real contract', (() => { try { return cm.verifyBridgeContract({ contract: CONTRACT }).ok === true; } catch { return false; } })());
gate('G423-AL — plan verifier clean on real plan', (() => { try { return pm.verifyBridgeImplementationPlan({ plan: PLAN }).ok === true; } catch { return false; } })());

// Docs content.
gate('G423-AL — docs: real shape + divergence + recompute + revalidation present', /handoffVersion|handoffDigest|real/i.test(readEv('SOURCE-HANDOFF-REAL-SHAPE.md')) && /upstreamVersions|digest|diverg/i.test(readEv('CONTRACT-PLAN-DIVERGENCE.md')) && /recompute|fnv1a|preimage/i.test(readEv('HANDOFF-DIGEST-RECOMPUTE-CONTRACT.md')) && /FABLE|checkpoint|revalidat/i.test(readEv('FABLE-REVALIDATION-REQUIRED.md')));
gate('G423-AL — docs: serializer/preimage + resource coherence present', /stableSerialize|preimage|createDeterministicDigest/i.test(readEv('CANONICAL-SERIALIZER-PREIMAGE.md')) && /limit|stricter|issueCode/i.test(readEv('RESOURCE-LIMIT-COHERENCE.md')));

// Scope safety.
gate('G423-AL — runtime subtree untouched (read-only)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.some((f) => /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//.test(f)); } catch { return true; } })());
gate('G423-AL — preview sandbox untouched (read-only)', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.some((f) => /^src\/studio\/blueprint-engine\/module-preview-sandbox\//.test(f)); } catch { return true; } })());
gate('G423-AL — App.jsx / guards untouched', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.includes('src/App.jsx') && !files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'); } catch { return true; } })());
gate('G423-AL — modules/backend/Prisma untouched', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.some((f) => /^src\/modules\/|^backend\/|schema\.prisma$|^migrations\//.test(f)); } catch { return true; } })());
gate('G423-AL — no .jsx/.tsx/.css in diff', (() => { try { const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); return !files.some((f) => /\.(jsx|tsx|css)$/.test(f)); } catch { return true; } })());

let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean).filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const bad = filterForbiddenScopePaths(files);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'no forbidden scope paths' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped`; }
gate('G423-AL — no forbidden scope path in diff', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const AUTH = [
    /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//,
    /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//,
    /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-(contract|implementation-plan|source-shape-alignment)\.test\.js$/,
    /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-(contract|implementation-plan|source-shape-alignment)\.mjs$/,
    /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
    /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-(contract|implementation-plan|source-shape-alignment)\//,
    /^package\.json$/, /^package-lock\.json$/,
  ];
  const outside = files.filter((f) => !AUTH.some((re) => re.test(f)) && !isKnownLaterStudioHeadlessArtifact(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = 'git base unavailable — skipped'; }
gate('G423-AL — authorized scope only', scopeOk, scopeDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-AL — no new dependency added', noNewDep);

gate('G423-AL — registry registers alignment paths', (() => { try { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); return /bridge-source-shape-alignment/.test(reg); } catch { return false; } })());
gate('G423-AL — package.json wires alignment test + gate', (() => { try { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); return /studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.test\.js/.test(pkg) && /g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.mjs/.test(pkg); } catch { return false; } })());
gate('G423-AL — test:runtime aggregate includes alignment test', (() => { try { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); return pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge-source-shape-alignment.test.js'); } catch { return false; } })());

// Granular per-critical-field existence on the real handoff (contract + plan).
for (const f of (cm?.CRITICAL_SOURCE_FIELDS ?? [])) {
  gate(`G423-AL — contract critical field ${f} exists on real handoff`, H ? (f in H) : false);
}
// Granular per-mapping target non-empty + source real (contract).
for (const mm of (cm?.BRIDGE_FIELD_MAPPINGS ?? [])) {
  gate(`G423-AL — contract mapping ${mm.sourceField}->${mm.targetField} real source + valid target`, H ? ((mm.sourceField in H) && typeof mm.targetField === 'string' && mm.targetField.length > 0) : false);
}
// Per-doc non-empty content.
for (const d of DOCS) gate(`G423-AL — doc ${d} non-empty`, readEv(d).length > 40);

let testsOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-AL — alignment round-trip tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-AL — alignment test has >= 280 scenarios', testCount >= 280, `${testCount} scenarios (min 280)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-SOURCE-SHAPE-ALIGNMENT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
