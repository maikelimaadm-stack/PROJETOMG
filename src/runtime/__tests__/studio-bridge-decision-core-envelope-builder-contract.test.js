import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as B from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder-contract/index.js';
import * as ENV from '../../studio/blueprint-engine/bridge-decision-envelope-identity-contract/index.js';
import * as CORE from '../../studio/blueprint-engine/bridge-decision-core-envelope-contract/index.js';
import { createStudioAuthoringRuntimeToPreviewBridge } from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff,
  createDeterministicDigest, stableSerialize,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/bridge-decision-core-envelope-builder-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract');
const REG = path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const jsCodeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeDecisionCoreEnvelopeBuilderContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));

function buildRealDecision(seed, moduleId = 'clientes', name = 'C', fieldKey = 'nome') {
  const s0 = createAuthoringRuntimeSession({ seed });
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId, name } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: fieldKey, dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const bridge = createStudioAuthoringRuntimeToPreviewBridge({});
  return bridge.execute({ sourceHandoff: createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId });
}
// The contract's declared extraction = pick the allowlist from the decision.
const extractCore = (d) => { const c = {}; for (const f of B.DIGEST_PREIMAGE_ALLOWLIST) c[f] = d[f]; return c; };

const CONTRACT = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();

// ---------------------------------------------------------------------------
test('S001 subtree present, only .js, composes', () => {
  assert.ok(exists('src/studio/blueprint-engine/bridge-decision-core-envelope-builder-contract'));
  const files = jsFiles();
  assert.ok(files.length >= 26, `got ${files.length}`);
  for (const f of files) assert.match(f, /\.js$/);
  assert.equal(CONTRACT.kind, 'studio-bridge-decision-core-envelope-builder-contract');
});

test('S002 config reflects real upstream versions', () => {
  assert.equal(B.BUILDER_CONTRACT_VERSION, 'studio-bridge-decision-core-envelope-builder-contract@1.0.0');
  assert.equal(B.SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, CORE.CORE_ENVELOPE_CONTRACT_VERSION);
  assert.equal(B.SELECTED_ARCHITECTURE, 'OPTION_B_FULL_BRIDGE_DECISION_CORE');
  assert.equal(B.SOURCE_DECISION_KIND, 'bridge-decision');
  assert.equal(B.SOURCE_DECISION_SUCCESS_STATUS, 'bridge_ready');
});

test('S003 composed contract verifies clean', () => {
  assert.equal(CONTRACT.verification.ok, true, JSON.stringify(CONTRACT.verification.blockers));
  assert.equal(CONTRACT.verification.blockerCount, 0);
  assert.equal(CONTRACT.readiness, 'studio_bridge_decision_core_envelope_builder_contract_ready_for_enterprise_audit');
  assert.equal(CONTRACT.readyForEnterpriseContractAudit, true);
  assert.equal(CONTRACT.readyForBuilderImplementationPlan, false);
  assert.equal(CONTRACT.readyForRuntimeImplementation, false);
  assert.equal(CONTRACT.metadataOnly, true);
});

// ---- Real source bridge decision shape ----
test('S010 real source decision shape (33 fields, complete input)', () => {
  const s = B.REAL_SOURCE_BRIDGE_DECISION_SHAPE;
  assert.equal(s.fieldCount, ENV.REAL_BRIDGE_DECISION_FIELDS.length);
  assert.equal(s.fieldCount, 33);
  assert.deepEqual([...s.fields].sort(), [...ENV.REAL_BRIDGE_DECISION_FIELDS].sort());
  assert.equal(s.inputIsCompleteDecision, true);
  assert.equal(s.inputIsIsolatedDescriptorOrDigest, false);
  assert.equal(s.decisionKind, 'bridge-decision');
  assert.equal(s.successStatus, 'bridge_ready');
});

test('S011 LIVE real decision matches declared shape', () => {
  const d = buildRealDecision('shape');
  assert.equal(d.kind, B.SOURCE_DECISION_KIND);
  assert.equal(d.status, B.SOURCE_DECISION_SUCCESS_STATUS);
  assert.equal(d.ok, true);
  assert.equal(Object.keys(d).length, 33);
  for (const f of B.REAL_SOURCE_BRIDGE_DECISION_FIELDS) assert.ok(f in d, `decision missing ${f}`);
});

// ---- Eligibility ----
test('S020 source eligibility strict', () => {
  const e = B.SOURCE_ELIGIBILITY_CONTRACT;
  assert.equal(e.sourceDecisionRequired, true);
  assert.equal(e.sourceDecisionKindExactMatchRequired, true);
  assert.equal(e.requiredDecisionKind, 'bridge-decision');
  assert.equal(e.sourceDecisionOkRequired, true);
  assert.equal(e.sourceDecisionStatusRequired, 'bridge_ready');
  assert.equal(e.targetDescriptorRequired, true);
  assert.equal(e.bridgeDecisionDigestRequired, true);
  for (const k of ['sourceMutated', 'previewMounted', 'productExposed', 'realDataRead']) assert.equal(e.mustBeFalse[k], true);
});

// ---- Core extraction (LIVE) ----
test('S030 core extraction: exact allowlist == real preimage', () => {
  const ce = B.CORE_EXTRACTION_CONTRACT;
  assert.equal(ce.coreExtractionMode, 'exact_allowlist_pick');
  assert.deepEqual([...ce.coreFieldAllowlist].sort(), [...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort());
  assert.equal(ce.requiredCoreFieldCount, 32);
  assert.equal(ce.onlyExtraSourceFieldIgnored, 'bridgeDecisionDigest');
  assert.equal(ce.unknownSourceFieldsRejected, true);
  assert.equal(ce.unknownSourceFieldsSilentlyIgnored, false);
  assert.equal(ce.digestInsideCore, false);
  assert.equal(ce.targetDescriptorInsideCore, true);
  assert.equal(ce.partialCoreAllowed, false);
});

test('S031 LIVE extraction (per contract) yields exact core = decision minus digest', () => {
  for (const seed of ['e1', 'e2', 'e3']) {
    const d = buildRealDecision(seed);
    const core = extractCore(d);
    const dmd = { ...d }; delete dmd.bridgeDecisionDigest;
    assert.deepEqual(Object.keys(core).sort(), Object.keys(dmd).sort());
    assert.equal(stableSerialize(core), stableSerialize(dmd), `seed ${seed}`);
    assert.ok(!('bridgeDecisionDigest' in core));
  }
});

// ---- Digest recompute (LIVE) ----
test('S040 digest recompute contract', () => {
  const dg = B.DIGEST_RECOMPUTE_CONTRACT;
  assert.equal(dg.recomputeRequiredBeforeEmission, true);
  assert.equal(dg.exactDigestComparisonRequired, true);
  assert.equal(dg.digestSynthesisAllowed, false);
  assert.equal(dg.cryptographicIntegrityProvided, false);
  assert.equal(dg.digestPreimage, 'bridgeDecisionCore');
  assert.ok(dg.tamperCategoriesDetected.length >= 8);
});

test('S041 LIVE createDeterministicDigest(extractedCore) === source digest (multi-seed)', () => {
  for (const seed of ['d1', 'd2', 'd3', 'd4', 'd5']) {
    const d = buildRealDecision(seed);
    assert.equal(createDeterministicDigest(extractCore(d)), d.bridgeDecisionDigest, `seed ${seed}`);
  }
});

test('S042 LIVE tamper matrix breaks the recomputed digest', () => {
  const d = buildRealDecision('tam');
  const base = extractCore(d); const bd = d.bridgeDecisionDigest;
  for (const mut of [
    (o) => { o.targetDescriptor.candidateDraftId += '-x'; },
    (o) => { o.status = 'x'; },
    (o) => { o.issueCount = (o.issueCount || 0) + 1; },
    (o) => { o.bridgeVersion += '-x'; },
    (o) => { o.previewMounted = !o.previewMounted; },
  ]) {
    const t = JSON.parse(JSON.stringify(base)); mut(t);
    assert.notEqual(createDeterministicDigest(t), bd);
  }
});

// ---- Atomicity (LIVE distinct) ----
test('S050 LIVE same-decision atomicity with distinct decisions', () => {
  const dA = buildRealDecision('A', 'clientes', 'Clientes', 'nome');
  const dB = buildRealDecision('B', 'fornecedores', 'Fornecedores', 'razao');
  assert.notEqual(dA.bridgeDecisionDigest, dB.bridgeDecisionDigest);
  assert.equal(createDeterministicDigest(extractCore(dA)), dA.bridgeDecisionDigest);
  assert.notEqual(createDeterministicDigest(extractCore(dB)), dA.bridgeDecisionDigest);
  assert.notEqual(createDeterministicDigest(extractCore(dA)), dB.bridgeDecisionDigest);
  const at = B.SAME_DECISION_ATOMICITY_CONTRACT;
  assert.equal(at.sourceDecisionIsAtomicInput, true);
  assert.equal(at.crossDecisionMixingAllowed, false);
});

// ---- Future API / output envelope ----
test('S060 future builder API metadata-only', () => {
  const api = B.FUTURE_BUILDER_PUBLIC_API_CONTRACT;
  assert.match(api.factorySignature, /createBridgeDecisionCoreEnvelopeBuilder\(config\)/);
  assert.deepEqual(api.statuses, ['core_envelope_ready', 'core_envelope_rejected']);
  assert.equal(api.buildImplemented, false);
  assert.equal(api.builderFactoryImplemented, false);
  for (const f of ['ok', 'status', 'sourceAccepted', 'coreExtracted', 'identityVerified', 'coreEnvelopeCreated', 'coreEnvelope', 'issues', 'builderDecisionDigest']) {
    assert.ok(api.buildResultFields.includes(f), `result field ${f}`);
  }
});

test('S070 output envelope == real Core Envelope v2', () => {
  const oe = B.OUTPUT_ENVELOPE_CONTRACT;
  assert.deepEqual([...oe.fields].sort(), [...CORE.CORE_ENVELOPE_FIELDS].sort());
  assert.equal(oe.envelopeVersionTag, 'v2');
  assert.equal(oe.bridgeDecisionDigestAppearsOnce, true);
  assert.equal(oe.bridgeDecisionCoreAppearsOnce, true);
  assert.equal(oe.targetDescriptorOnlyInsideCore, true);
  assert.equal(oe.coreEnvelopeCreated, false);
});

// ---- CRITICAL: identity verification state ----
test('S080 identityVerified conflict → B-CORE-ENVELOPE-VERIFICATION-STATE open', () => {
  const iv = B.IDENTITY_VERIFICATION_STATE_CONTRACT;
  assert.equal(iv.coreEnvelopeCurrentInvariantIdentityVerified, false);
  assert.equal(iv.coreEnvelopeCurrentInvariantIdentityVerified, CORE.CORE_ENVELOPE_INVARIANTS.identityVerified);
  assert.equal(iv.builderPerformsRecomputeAndCompare, true);
  assert.equal(iv.builderDesiredEnvelopeIdentityVerifiedTrue, true);
  assert.equal(iv.compatibleWithMergedV2Invariant, false);
  assert.equal(iv.silentOverrideAllowed, false);
  assert.equal(iv.selectedOption, 'B');
  assert.equal(iv.envelopeIdentityVerifiedRemainsFalse, true);
  assert.equal(iv.bCoreEnvelopeVerificationStateOpen, true);
  assert.equal(iv.requiredAmendment, 'Core Envelope Verification State Amendment');
  assert.equal(iv.blocksBuilderImplementationPlan, true);
  const opts = iv.options.map((o) => o.option).sort();
  assert.deepEqual(opts, ['A', 'B', 'C']);
});

// ---- Safe normalization / pipeline ----
test('S090 safe normalization contract', () => {
  const sn = B.SAFE_NORMALIZATION_CONTRACT;
  assert.equal(sn.maxStructureDepth, 64);
  assert.equal(sn.failClosed, true);
  assert.equal(sn.normalizationImplemented, false);
  for (const k of ['__proto__', 'constructor', 'prototype']) assert.ok(sn.forbiddenPrototypeKeys.includes(k));
  assert.ok(sn.requirements.length >= 12);
});

test('S100 23-stage pipeline, envelope only after all blockers', () => {
  const pp = B.VALIDATION_PIPELINE_CONTRACT;
  assert.equal(pp.stageCount, 23);
  assert.equal(pp.stages[0], 'source_structure_normalization');
  assert.equal(pp.stages[11], 'digest_recompute_validation');
  assert.equal(pp.stages[22], 'prototype_reference_validation');
  assert.equal(pp.envelopeOnlyAfterAllBlockers, true);
  assert.equal(pp.pipelineImplemented, false);
  for (const s of pp.detailedStages) { assert.equal(s.blocking, true); assert.equal(s.mayCreateEnvelope, false); }
});

// ---- Issue model / failure / limits / extensions / replay / ssot ----
test('S110 issue model, failure, replay', () => {
  assert.ok(B.ISSUE_MODEL_CONTRACT.issueCodes.length >= 38);
  assert.equal(B.ISSUE_MODEL_CONTRACT.silentCorrectionAllowed, false);
  assert.equal(B.FAILURE_CONTAINMENT_CONTRACT.rollbackByNonEmission, true);
  assert.equal(B.FAILURE_CONTAINMENT_CONTRACT.partialEnvelopeAllowed, false);
  assert.equal(B.REPLAY_IDEMPOTENCY_CONTRACT.randomnessAllowed, false);
  assert.equal(B.REPLAY_IDEMPOTENCY_CONTRACT.sameCoreProducesSameDigest, true);
});

test('S120 resource limits derived from real shapes', () => {
  const rl = B.RESOURCE_LIMITS_CONTRACT;
  assert.equal(rl.dimensions.find((d) => d.dimension === 'maxCoreFields').sourceLimit, 32);
  assert.equal(rl.dimensions.find((d) => d.dimension === 'maxSourceDecisionFields').sourceLimit, 33);
  assert.equal(rl.dimensions.find((d) => d.dimension === 'maxTargetDescriptorFields').sourceLimit, CORE.REAL_TARGET_DESCRIPTOR_FIELDS_REF.length);
  for (const d of rl.dimensions) { assert.equal(d.silentTruncationAllowed, false); assert.equal(d.partialOutputAllowed, false); }
});

test('S130 SSOT / security / prototype', () => {
  assert.equal(B.SSOT_SECURITY_PERMISSION_CONTRACT.certifiedBlueprintRemainsSsot, true);
  assert.equal(B.SSOT_SECURITY_PERMISSION_CONTRACT.coreEnvelopeIsCanonical, false);
  assert.equal(B.SSOT_SECURITY_PERMISSION_CONTRACT.builderMayExposeProduct, false);
  assert.equal(B.EXTENSIBILITY_CONTRACT.coreExtensionsAllowed, false);
  assert.equal(B.PROTOTYPE_RELINK_PROHIBITION.prototypeRelinkAllowed, false);
});

// ---- Builder blocker closure ----
test('S140 B-CORE-ENVELOPE-BUILDER not fully closed (verification state open)', () => {
  const bc = B.BUILDER_BLOCKER_CLOSURE;
  assert.equal(bc.blockerId, 'B-CORE-ENVELOPE-BUILDER');
  assert.equal(bc.builderInputContractDefined, true);
  assert.equal(bc.coreExtractionContractDefined, true);
  assert.equal(bc.digestVerificationContractDefined, true);
  assert.equal(bc.outputEnvelopeContractDefined, true);
  assert.equal(bc.bCoreEnvelopeVerificationStateOpen, true);
  assert.equal(bc.bCoreEnvelopeBuilderClosedByContract, false);
  assert.equal(bc.builderImplementationPlanRequired, true);
  assert.equal(bc.readyForBuilderImplementationPlan, false);
  assert.equal(bc.readyForRuntimeImplementation, false);
});

// ---- Manual gate / readiness ----
test('S150 manual gate authorizes only builder contract', () => {
  const mg = B.MANUAL_ENABLEMENT_GATE;
  assert.equal(mg.manualGateRequired, true);
  assert.equal(mg.authorizesBuilderContract, true);
  for (const k of ['authorizesBuilderImplementationPlan', 'authorizesBuilderImplementation', 'authorizesRuntimeImplementation', 'authorizesPreviewMount', 'authorizesProductExposure']) {
    assert.equal(mg[k], false, `${k} must be false`);
  }
});

// ---- Manifest / compatibility ----
test('S160 deterministic manifest', () => {
  const a = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();
  const b = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();
  assert.equal(a.manifest.overallDigest, b.manifest.overallDigest);
  assert.ok(a.manifest.overallDigest.startsWith('fnv1a-'));
  assert.ok(a.manifest.partCount >= 18);
});

test('S161 compatibility, builder plan + runtime blocked', () => {
  const c = B.checkBridgeDecisionCoreEnvelopeBuilderCompatibility();
  assert.equal(c.compatibleWithHardenedBridge, true);
  assert.equal(c.compatibleWithCoreEnvelopeContractV2, true);
  assert.equal(c.compatibleWithPlanAlignmentAmendment, true);
  assert.equal(c.bCoreEnvelopeVerificationStateOpen, true);
  assert.equal(c.bCoreEnvelopeBuilderClosedByContract, false);
  assert.equal(c.readyForBuilderImplementationPlan, false);
  assert.equal(c.readyForRuntimeImplementation, false);
  assert.equal(c.status, 'bridge_decision_core_envelope_builder_contract_ready_for_enterprise_audit');
});

// ---- Verifier tamper battery ----
test('S170 verifier detects false closure + false compat + premature', () => {
  assert.equal(B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: { ...CONTRACT, builderBlockerClosure: { ...CONTRACT.builderBlockerClosure, bCoreEnvelopeBuilderClosedByContract: true } } }).ok, false);
  assert.equal(B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, compatibleWithMergedV2Invariant: true } } }).ok, false);
  assert.equal(B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: { ...CONTRACT, readyForBuilderImplementationPlan: true } }).ok, false);
  assert.equal(B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: { ...CONTRACT, readyForRuntimeImplementation: true } }).ok, false);
});

// ---- No builder/runtime (static) ----
test('S180 subtree defines no builder/extractor/runtime', () => {
  const code = jsCodeNoVerifier();
  assert.equal(/from\s+['"]react['"]/.test(code), false);
  assert.equal(/\.jsx\b/.test(code), false);
  assert.equal(/\bfetch\s*\(/.test(code), false);
  assert.equal(/new\s+PrismaClient/.test(code), false);
  assert.equal(/\bbuild\s*\([^)]*\)\s*\{/.test(code), false);
  for (const fn of ['extractCore', 'recomputeDigest', 'verifyIdentity', 'buildCoreEnvelope', 'mountPreview']) {
    assert.equal(new RegExp(`function\\s+${fn}\\b`).test(code), false, `must not define ${fn}`);
  }
});

// ---- Registry / package.json ----
test('S190 registry declares the 4 anchored paths', () => {
  const reg = fs.readFileSync(REG, 'utf8');
  assert.match(reg, /\^src\\\/studio\\\/blueprint-engine\\\/bridge-decision-core-envelope-builder-contract\\\//);
  assert.match(reg, /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-decision-core-envelope-builder-contract\\\.test\\\.js\$/);
  assert.match(reg, /\^scripts\\\/gates\\\/g423-studio-bridge-decision-core-envelope-builder-contract\\\.mjs\$/);
  assert.match(reg, /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract\\\//);
});

test('S191 package.json wires scripts, no new dependency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['test:runtime:studio-bridge-decision-core-envelope-builder-contract']);
  assert.ok(pkg.scripts['gate:g423-studio-bridge-decision-core-envelope-builder-contract']);
  assert.ok(pkg.scripts['test:runtime'].includes('studio-bridge-decision-core-envelope-builder-contract.test.js'));
});

// ---------------------------------------------------------------------------
// Fine-grained generated scenarios.
// ---------------------------------------------------------------------------
const D0 = buildRealDecision('shared0');
const CORE0 = extractCore(D0);
const DIGEST0 = D0.bridgeDecisionDigest;

for (const f of ENV.REAL_BRIDGE_DECISION_FIELDS) {
  test(`GS-source field ${f} declared`, () => { assert.ok(B.REAL_SOURCE_BRIDGE_DECISION_FIELDS.includes(f)); });
  test(`GS-source field ${f} present on live decision`, () => { assert.ok(f in D0); });
}
for (const f of ENV.DECISION_DIGEST_PREIMAGE_FIELDS) {
  test(`GC-allowlist ${f} in extraction allowlist`, () => { assert.ok(B.DIGEST_PREIMAGE_ALLOWLIST.includes(f)); });
  test(`GC-allowlist ${f} present in live extracted core`, () => { assert.ok(f in CORE0); });
  test(`GC-allowlist ${f} not the digest`, () => { assert.notEqual(f, 'bridgeDecisionDigest'); });
  test(`GC-allowlist ${f} live tamper breaks digest`, () => {
    const t = JSON.parse(JSON.stringify(CORE0));
    t[f] = (t[f] && typeof t[f] === 'object') ? { __t: 1 } : `${JSON.stringify(t[f])}__x`;
    assert.notEqual(createDeterministicDigest(t), DIGEST0);
  });
  test(`GC-allowlist ${f} live removal breaks digest`, () => {
    const t = JSON.parse(JSON.stringify(CORE0)); delete t[f];
    assert.notEqual(createDeterministicDigest(t), DIGEST0);
  });
}
for (const f of CORE.CORE_ENVELOPE_FIELDS) {
  test(`GO-output envelope field ${f} reflected`, () => { assert.ok(B.OUTPUT_ENVELOPE_CONTRACT.fields.includes(f)); });
}
for (const s of B.BUILDER_PIPELINE_STAGES) {
  test(`GPP-pipeline stage ${s} declared blocking`, () => {
    const st = B.VALIDATION_PIPELINE_CONTRACT.detailedStages.find((x) => x.stageId === s);
    assert.ok(st && st.blocking === true && st.mayCreateEnvelope === false);
  });
}
for (const code of B.BUILDER_ISSUE_CODES) {
  test(`GIC-issue ${code} BUILDER_-namespaced uppercase`, () => { assert.ok(code.startsWith('BUILDER_')); assert.equal(code, code.toUpperCase()); });
}
for (const d of B.RESOURCE_DIMENSION_NAMES) {
  test(`GRL-limit ${d} fail-closed`, () => {
    const dim = B.RESOURCE_LIMITS_CONTRACT.dimensions.find((x) => x.dimension === d);
    assert.equal(dim.silentTruncationAllowed, false);
    assert.equal(dim.partialOutputAllowed, false);
  });
}
const CAP_TRUE = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed', 'sideEffectFree', 'metadataOnly', 'contractOnly', 'realSourceBridgeDecisionShapeCaptured', 'realCorePreimageAllowlistCaptured', 'realOutputEnvelopeCaptured', 'ssotPreserved', 'sourceConsumedReadOnly', 'upstreamsConsumedReadOnly', 'bIdentityClosedByContract', 'bRecomputeInputClosedByContract', 'bRecomputeInputResolvedByPlan'];
for (const f of CAP_TRUE) {
  test(`GCT-cap ${f} true + verifier requires`, () => {
    assert.equal(B.BUILDER_CAPABILITIES[f], true);
    const v = B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: { ...CONTRACT, capabilities: { ...CONTRACT.capabilities, [f]: false } } });
    assert.equal(v.ok, false);
    assert.ok(v.blockers.includes(`capability_${f}_must_be_true`));
  });
}
const CAP_FALSE = ['builderFactoryImplemented', 'buildImplemented', 'coreExtractionImplemented', 'digestRecomputeImplemented', 'identityVerificationImplemented', 'envelopeConstructionImplemented', 'consumerRuntimeImplemented', 'validationExecuted', 'builderExecuted', 'sourceDecisionConsumed', 'coreExtracted', 'coreEnvelopeCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated'];
for (const f of CAP_FALSE) {
  test(`GCF-cap ${f} false + verifier rejects true`, () => {
    assert.equal(B.BUILDER_CAPABILITIES[f], false);
    const v = B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: { ...CONTRACT, capabilities: { ...CONTRACT.capabilities, [f]: true } } });
    assert.equal(v.ok, false);
    assert.ok(v.blockers.includes(`capability_${f}_must_be_false`));
  });
}
for (const seed of Array.from({ length: 30 }, (_, i) => `ms${i}`)) {
  test(`GML-multi-seed digest equivalence ${seed}`, () => {
    const d = buildRealDecision(seed);
    assert.equal(createDeterministicDigest(extractCore(d)), d.bridgeDecisionDigest);
  });
}
for (const t of B.DIGEST_RECOMPUTE_CONTRACT.tamperCategoriesDetected) {
  test(`GTC-tamper category "${t}"`, () => { assert.ok(typeof t === 'string' && t.length > 0); });
}

// ---- Large deterministic digest-equivalence battery over many synthetic decisions. ----
for (const i of Array.from({ length: 300 }, (_, k) => k)) {
  const seed = `beq${i}`;
  test(`GBEQ-${seed} recompute(core)==digest && serialize(core)==serialize(decision-digest)`, () => {
    const d = buildRealDecision(seed);
    const core = extractCore(d);
    assert.equal(createDeterministicDigest(core), d.bridgeDecisionDigest);
    const withoutDigest = { ...d };
    delete withoutDigest[B.SOURCE_DIGEST_FIELD];
    assert.equal(stableSerialize(core), stableSerialize(withoutDigest));
  });
}

// ---- Per-allowlist-field core membership: every allowlisted field is in core and none is the digest field. ----
for (const f of B.DIGEST_PREIMAGE_ALLOWLIST) {
  test(`GCM-core-member ${f}`, () => {
    const d = buildRealDecision('cm');
    const core = extractCore(d);
    assert.ok(Object.prototype.hasOwnProperty.call(core, f), `core missing ${f}`);
    assert.notEqual(f, B.SOURCE_DIGEST_FIELD);
  });
}

// ---- Per-allowlist-field tamper: mutating any single core field breaks the recomputed digest (fail-closed). ----
for (const f of B.DIGEST_PREIMAGE_ALLOWLIST) {
  test(`GTF-tamper ${f} breaks recomputed digest`, () => {
    const d = buildRealDecision('tf');
    const core = extractCore(d);
    const tampered = { ...core, [f]: '__tampered_sentinel_value__' };
    assert.notEqual(createDeterministicDigest(tampered), d.bridgeDecisionDigest);
  });
}

// ---- Replay determinism: recomposing the contract yields the identical manifest overall digest. ----
for (const i of Array.from({ length: 40 }, (_, k) => k)) {
  test(`GRP-replay ${i} overall digest stable`, () => {
    const again = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();
    assert.equal(again.manifest.overallDigest, CONTRACT.manifest.overallDigest);
    assert.equal(again.verification.ok, true);
  });
}

// ---- Per-manifest-part determinism: each declared part digest is stable across recomposition. ----
for (const part of Object.keys(CONTRACT.manifest.partDigests)) {
  test(`GPD-part-digest ${part} stable`, () => {
    const again = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();
    assert.equal(again.manifest.partDigests[part], CONTRACT.manifest.partDigests[part]);
    assert.match(CONTRACT.manifest.partDigests[part], /^fnv1a-[0-9a-f]{8}$/);
  });
}

const DOCS = ['CERTIFICATION-REPORT.md', 'BUILDER-CONTRACT-REPORT.md', 'B-CORE-ENVELOPE-BUILDER-ROOT-CAUSE.md', 'REAL-SOURCE-BRIDGE-DECISION-SHAPE.md', 'SOURCE-ELIGIBILITY-CONTRACT.md', 'CORE-EXTRACTION-CONTRACT.md', 'DIGEST-RECOMPUTE-CONTRACT.md', 'SAME-DECISION-ATOMICITY.md', 'FUTURE-BUILDER-PUBLIC-API.md', 'OUTPUT-CORE-ENVELOPE-CONTRACT.md', 'IDENTITY-VERIFICATION-STATE-ANALYSIS.md', 'SAFE-NORMALIZATION-CONTRACT.md', 'VALIDATION-PIPELINE-CONTRACT.md', 'ISSUE-MODEL-CONTRACT.md', 'FAILURE-CONTAINMENT-CONTRACT.md', 'RESOURCE-LIMITS-CONTRACT.md', 'EXTENSIBILITY-CONTRACT.md', 'REPLAY-IDEMPOTENCY-CONTRACT.md', 'SSOT-SECURITY-PERMISSION-BOUNDARY.md', 'PROTOTYPE-RELINK-PROHIBITION.md', 'B-CORE-ENVELOPE-BUILDER-CLOSURE.md', 'MANUAL-ENABLEMENT-GATE.md', 'READINESS-TRANSITION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-BUILDER-NO-RUNTIME-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-SCALABILITY-RISK-NOTES.md', 'NEXT-ENTERPRISE-CONTRACT-AUDIT.md'];
for (const d of DOCS) {
  test(`GD-doc ${d} present and non-empty`, () => {
    const full = path.join(EV, d);
    assert.ok(fs.existsSync(full), `missing ${d}`);
    assert.ok(fs.readFileSync(full, 'utf8').length > 60);
  });
}
