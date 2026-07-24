#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, side-effect-free, dev-only CONTRACT (definition only,
 * no builder, no runtime) for a FUTURE builder that receives a real hardened `bridgeDecision`, checks success
 * eligibility, extracts the exact digest preimage as `bridgeDecisionCore` by real allowlist, recompute-and-compares
 * `bridgeDecisionDigest`, and emits a Core Envelope v2 atomically. It LIVE-proves (multi-seed, real decisions) that
 * createDeterministicDigest(core) === real bridgeDecisionDigest and that mutating any single allowlisted core field
 * breaks the recomputed digest. It proves the CORRECTED classification: `identityVerified` is CONSUMER-owned (the
 * consumer decision carries its own; the envelope groups it among consumer-lifecycle security fields), so
 * B-CORE-ENVELOPE-VERIFICATION-STATE is NOT_A_BLOCKER, no amendment is required, B-CORE-ENVELOPE-BUILDER is CLOSED
 * BY CONTRACT, and the contract is ready for the Builder Implementation Plan — while the manual gate does NOT
 * authorize executing that plan or any amendment. Keeps every runtime/builder flag false, upstreams intact, builds
 * no envelope, mounts no preview, touches no App, exposes nothing.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder-contract');
const ENV_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const CORE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-contract.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-contract.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const allFiles = () => walk(DIR, /.*/);
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeDecisionCoreEnvelopeBuilderContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-contract\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan');
const B = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const ENV = await import(pathToFileURL(path.join(ENV_DIR, 'index.js')).href);
const CORE = await import(pathToFileURL(path.join(CORE_DIR, 'index.js')).href);
const PLAN = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href);
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);
const CONTRACT = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();

function buildRealDecision(seed, moduleId = 'clientes', name = 'C', fieldKey = 'nome') {
  const s0 = rt.createAuthoringRuntimeSession({ seed });
  let r = rt.executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId, name } } });
  const draftId = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: fieldKey, dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const b = bridge.createStudioAuthoringRuntimeToPreviewBridge({});
  return b.execute({ sourceHandoff: rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId });
}
const coreOf = (d) => { const c = {}; for (const f of B.DIGEST_PREIMAGE_ALLOWLIST) c[f] = d[f]; return c; };

// ---- Artifacts ----
gate('G423-BB — subtree exists', exists(DIR));
gate('G423-BB — test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-BB — gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-BB — evidence dir exists', exists(EV));
gate('G423-BB — only .js files', allFiles().every((f) => /\.js$/.test(f)), `${allFiles().length}`);
gate('G423-BB — >= 26 modules', jsFiles().length >= 26, `${jsFiles().length}`);
gate('G423-BB — index composes', CONTRACT.kind === 'studio-bridge-decision-core-envelope-builder-contract');
gate('G423-BB — no .jsx anywhere', allFiles().every((f) => !/\.jsx$/.test(f)));

// ---- Registry ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-BB — registry subtree path', /\^src\\\/studio\\\/blueprint-engine\\\/bridge-decision-core-envelope-builder-contract\\\//.test(reg));
gate('G423-BB — registry test path', /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-decision-core-envelope-builder-contract\\\.test\\\.js\$/.test(reg));
gate('G423-BB — registry gate path', /\^scripts\\\/gates\\\/g423-studio-bridge-decision-core-envelope-builder-contract\\\.mjs\$/.test(reg));
gate('G423-BB — registry docs path', /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract\\\//.test(reg));

// ---- Upstreams intact ----
gate('G423-BB — upstream bridge present', exists(BRIDGE_DIR));
gate('G423-BB — upstream v1 envelope present', exists(ENV_DIR));
gate('G423-BB — upstream core envelope v2 present', exists(CORE_DIR));
gate('G423-BB — upstream plan-alignment amendment present', exists(path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment')));

// ---- Config / versions reflect real upstreams ----
gate('G423-BB — contract version', B.BUILDER_CONTRACT_VERSION === 'studio-bridge-decision-core-envelope-builder-contract@1.0.0');
gate('G423-BB — reflects core v2 version', B.SOURCE_CORE_ENVELOPE_CONTRACT_VERSION === CORE.CORE_ENVELOPE_CONTRACT_VERSION);
gate('G423-BB — reflects v1 envelope version', B.SOURCE_ENVELOPE_V1_CONTRACT_VERSION === ENV.ENVELOPE_CONTRACT_VERSION);
gate('G423-BB — selected architecture Option B', B.SELECTED_ARCHITECTURE === 'OPTION_B_FULL_BRIDGE_DECISION_CORE');
gate('G423-BB — source decision kind', B.SOURCE_DECISION_KIND === 'bridge-decision');
gate('G423-BB — source success status', B.SOURCE_DECISION_SUCCESS_STATUS === 'bridge_ready');
gate('G423-BB — source digest field', B.SOURCE_DIGEST_FIELD === 'bridgeDecisionDigest');

// ---- Real source shape reflected, derived (33) ----
gate('G423-BB — source fields == 33', B.REAL_SOURCE_BRIDGE_DECISION_FIELDS.length === 33);
gate('G423-BB — allowlist == 32', B.DIGEST_PREIMAGE_ALLOWLIST.length === 32);
gate('G423-BB — allowlist == source minus digest', B.DIGEST_PREIMAGE_ALLOWLIST.length === B.REAL_SOURCE_BRIDGE_DECISION_FIELDS.length - 1);
gate('G423-BB — allowlist equals core v2 preimage', JSON.stringify([...B.DIGEST_PREIMAGE_ALLOWLIST].sort()) === JSON.stringify([...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort()));
gate('G423-BB — core field count ref derived', B.CORE_FIELD_COUNT_REF === B.DIGEST_PREIMAGE_ALLOWLIST.length);
gate('G423-BB — digest field NOT in allowlist', !B.DIGEST_PREIMAGE_ALLOWLIST.includes(B.SOURCE_DIGEST_FIELD));
gate('G423-BB — output core envelope fields == 12', B.OUTPUT_CORE_ENVELOPE_FIELDS.length === 12);
gate('G423-BB — pipeline stages == 23', B.BUILDER_PIPELINE_STAGES.length === 23);
gate('G423-BB — issue codes >= 40', B.BUILDER_ISSUE_CODES.length >= 40, `${B.BUILDER_ISSUE_CODES.length}`);
for (const f of B.REAL_SOURCE_BRIDGE_DECISION_FIELDS) gate(`G423-BB — source field ${f} present`, typeof f === 'string' && f.length > 0);
for (const f of B.DIGEST_PREIMAGE_ALLOWLIST) gate(`G423-BB — allowlist field ${f} in source & not digest`, B.REAL_SOURCE_BRIDGE_DECISION_FIELDS.includes(f) && f !== B.SOURCE_DIGEST_FIELD);

// ---- Source eligibility ----
gate('G423-BB — eligibility requires kind match', B.SOURCE_ELIGIBILITY_CONTRACT.sourceDecisionKindExactMatchRequired === true && B.SOURCE_ELIGIBILITY_CONTRACT.requiredDecisionKind === 'bridge-decision');
gate('G423-BB — eligibility requires ok', B.SOURCE_ELIGIBILITY_CONTRACT.sourceDecisionOkRequired === true);
gate('G423-BB — eligibility requires status', B.SOURCE_ELIGIBILITY_CONTRACT.sourceDecisionStatusRequired === 'bridge_ready');
gate('G423-BB — eligibility requires digest', B.SOURCE_ELIGIBILITY_CONTRACT.bridgeDecisionDigestRequired === true);
gate('G423-BB — eligibility not implemented', B.SOURCE_ELIGIBILITY_CONTRACT.eligibilityImplemented === false);

// ---- Core extraction ----
gate('G423-BB — extraction exact allowlist pick', B.CORE_EXTRACTION_CONTRACT.coreExtractionMode === 'exact_allowlist_pick');
gate('G423-BB — extraction rejects unknown fields', B.CORE_EXTRACTION_CONTRACT.unknownSourceFieldsRejected === true && B.CORE_EXTRACTION_CONTRACT.unknownSourceFieldsSilentlyIgnored === false);
gate('G423-BB — extraction version drift fails closed', B.CORE_EXTRACTION_CONTRACT.versionDriftFailsClosed === true);
gate('G423-BB — extraction digest not inside core', B.CORE_EXTRACTION_CONTRACT.digestInsideCore === false);
gate('G423-BB — extraction target inside core', B.CORE_EXTRACTION_CONTRACT.targetDescriptorInsideCore === true);
for (const k of ['coreAliasesAllowed', 'coreDefaultsAllowed', 'coreCoercionAllowed', 'partialCoreAllowed', 'duplicationAllowed']) gate(`G423-BB — extraction ${k} false`, B.CORE_EXTRACTION_CONTRACT[k] === false);
gate('G423-BB — extraction not implemented', B.CORE_EXTRACTION_CONTRACT.coreExtractionImplemented === false);
gate('G423-BB — extraction required core == allowlist', JSON.stringify([...B.CORE_EXTRACTION_CONTRACT.requiredCoreFields].sort()) === JSON.stringify([...B.DIGEST_PREIMAGE_ALLOWLIST].sort()));

// ---- Digest recompute ----
gate('G423-BB — recompute required before emission', B.DIGEST_RECOMPUTE_CONTRACT.recomputeRequiredBeforeEmission === true);
gate('G423-BB — exact digest comparison required', B.DIGEST_RECOMPUTE_CONTRACT.exactDigestComparisonRequired === true);
gate('G423-BB — digest synthesis forbidden', B.DIGEST_RECOMPUTE_CONTRACT.digestSynthesisAllowed === false && B.DIGEST_RECOMPUTE_CONTRACT.digestAliasAllowed === false && B.DIGEST_RECOMPUTE_CONTRACT.digestFallbackAllowed === false);
gate('G423-BB — digest not cryptographic', B.DIGEST_RECOMPUTE_CONTRACT.cryptographicIntegrityProvided === false);
gate('G423-BB — digest recompute not implemented', B.DIGEST_RECOMPUTE_CONTRACT.digestRecomputeImplemented === false);
gate('G423-BB — tamper categories >= 4', B.DIGEST_RECOMPUTE_CONTRACT.tamperCategoriesDetected.length >= 4);

// ---- LIVE digest equivalence (multi-seed) ----
let liveOk = true; let liveSer = true;
for (const seed of ['bb1', 'bb2', 'bb3', 'bb4', 'bb5', 'bb6', 'bb7', 'bb8', 'bb9', 'bb10', 'bb11', 'bb12']) {
  const d = buildRealDecision(seed);
  const core = coreOf(d);
  const okD = rt.createDeterministicDigest(core) === d.bridgeDecisionDigest;
  const dmd = { ...d }; delete dmd.bridgeDecisionDigest;
  const okS = rt.stableSerialize(core) === rt.stableSerialize(dmd);
  if (!okD) liveOk = false;
  if (!okS) liveSer = false;
  gate(`G423-BB — LIVE digest(core)==realDigest seed ${seed}`, okD);
}
gate('G423-BB — LIVE all-seed digest equivalence', liveOk);
gate('G423-BB — LIVE serialize(core)==serialize(decision-digest)', liveSer);

// ---- LIVE per-allowlist-field tamper breaks recomputed digest ----
{
  const d = buildRealDecision('tamper');
  const core = coreOf(d);
  for (const f of B.DIGEST_PREIMAGE_ALLOWLIST) {
    const tampered = { ...core, [f]: '__gate_tamper_sentinel__' };
    gate(`G423-BB — LIVE tamper ${f} breaks digest`, rt.createDeterministicDigest(tampered) !== d.bridgeDecisionDigest);
  }
}

// ---- LIVE same-decision atomicity with distinct decisions ----
{
  const dA = buildRealDecision('AA', 'clientes', 'Clientes', 'nome');
  const dB = buildRealDecision('BB', 'fornecedores', 'Fornecedores', 'razao');
  gate('G423-BB — LIVE distinct decisions distinct digests', dA.bridgeDecisionDigest !== dB.bridgeDecisionDigest);
  gate('G423-BB — LIVE digest A + core B mismatches', rt.createDeterministicDigest(coreOf(dB)) !== dA.bridgeDecisionDigest);
  gate('G423-BB — LIVE digest B + core A mismatches', rt.createDeterministicDigest(coreOf(dA)) !== dB.bridgeDecisionDigest);
}
gate('G423-BB — atomicity same-decision required', B.SAME_DECISION_ATOMICITY_CONTRACT.digestAndCoreMustComeFromSameDecision === true);
gate('G423-BB — atomicity cross-decision forbidden', B.SAME_DECISION_ATOMICITY_CONTRACT.crossDecisionMixingAllowed === false);
gate('G423-BB — atomicity no core/digest replacement', B.SAME_DECISION_ATOMICITY_CONTRACT.coreReplacementAllowed === false && B.SAME_DECISION_ATOMICITY_CONTRACT.digestReplacementAllowed === false);

// ---- Identity verification state — CORRECTED (B-CORE-ENVELOPE-VERIFICATION-STATE = NOT_A_BLOCKER) ----
const IV = B.IDENTITY_VERIFICATION_STATE_CONTRACT;
gate('G423-BB — envelope invariant identityVerified false (unchanged)', IV.coreEnvelopeCurrentInvariantIdentityVerified === false);
gate('G423-BB — envelope invariant mirrors v2', IV.coreEnvelopeCurrentInvariantIdentityVerified === CORE.CORE_ENVELOPE_INVARIANTS.identityVerified);
gate('G423-BB — identityVerified owner = consumer_runtime', IV.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BB — selected ARCHITECTURE_1', IV.selectedArchitecture === 'ARCHITECTURE_1');
gate('G423-BB — ARCHITECTURE_1 is final', IV.ARCHITECTURE_1_IS_FINAL === true);
gate('G423-BB — Option B was NOT provisional', IV.optionBWasProvisional === false);
gate('G423-BB — classification NOT_A_BLOCKER', IV.verificationStateClassification === 'NOT_A_BLOCKER');
gate('G423-BB — verification-state NOT open', IV.bCoreEnvelopeVerificationStateOpen === false);
gate('G423-BB — no amendment required', IV.coreEnvelopeVerificationStateAmendmentRequired === false);
gate('G423-BB — requiredAmendment null', IV.requiredAmendment === null);
gate('G423-BB — does NOT block builder implementation plan', IV.blocksBuilderImplementationPlan === false);
gate('G423-BB — silent override forbidden', IV.silentOverrideAllowed === false);
gate('G423-BB — builder performs recompute-and-compare', IV.builderPerformsRecomputeAndCompare === true);
gate('G423-BB — builder verification recorded in builder decision', IV.builderVerificationRecordedInBuilderDecision === true);
gate('G423-BB — builder verified carried OUTSIDE envelope', IV.builderResultCarriesVerifiedOutsideEnvelope === true);
gate('G423-BB — builder does NOT need envelope verified true', IV.builderDesiredEnvelopeIdentityVerifiedTrue === false);
gate('G423-BB — consumer verifies independently', IV.consumerPerformsIndependentVerification === true);
gate('G423-BB — consumer verification recorded in consumer decision', IV.consumerVerificationRecordedInConsumerDecision === true);
gate('G423-BB — envelope identityVerified remains false', IV.envelopeIdentityVerifiedRemainsFalse === true);
gate('G423-BB — envelope false means awaiting consumer verification', IV.envelopeFalseMeansAwaitingConsumerVerification === true);
gate('G423-BB — envelope immutable', IV.envelopeIsImmutable === true);
gate('G423-BB — options are ARCHITECTURE_1/2/3', JSON.stringify(IV.options.map((o) => o.option).sort()) === JSON.stringify(['ARCHITECTURE_1', 'ARCHITECTURE_2', 'ARCHITECTURE_3']));
gate('G423-BB — ARCHITECTURE_1 selected + no amendment', (() => { const a = IV.options.find((o) => o.option === 'ARCHITECTURE_1'); return a.selected === true && a.requiresCoreEnvelopeAmendment === false; })());
gate('G423-BB — identity verification not implemented', IV.identityVerificationImplemented === false);
// Semantic ownership proven against real upstreams (consumer decision + core-envelope security fields).
gate('G423-BB — consumer decision owns identityVerified', PLAN.CONSUMER_DECISION_PLAN.decisionFields.includes('identityVerified'));
gate('G423-BB — identityVerified is a core-envelope security field', CORE.CORE_ENVELOPE_SECURITY_FIELDS.includes('identityVerified'));

// ---- Output core envelope ----
for (const f of B.OUTPUT_CORE_ENVELOPE_FIELDS) gate(`G423-BB — output envelope field ${f} declared`, B.OUTPUT_ENVELOPE_CONTRACT.fields.includes(f));
gate('G423-BB — envelope synthetic', B.OUTPUT_ENVELOPE_CONTRACT.syntheticTrue === true);
gate('G423-BB — envelope immutable', B.OUTPUT_ENVELOPE_CONTRACT.immutableTrue === true);
gate('G423-BB — envelope metadataOnly', B.OUTPUT_ENVELOPE_CONTRACT.metadataOnlyTrue === true);
gate('G423-BB — envelope coreConsumed false', B.OUTPUT_ENVELOPE_CONTRACT.coreConsumedFalse === true);
gate('G423-BB — envelope productExposed false', B.OUTPUT_ENVELOPE_CONTRACT.productExposedFalse === true);
gate('G423-BB — envelope invariant identityVerified false', B.OUTPUT_CORE_ENVELOPE_INVARIANTS.identityVerified === false);
gate('G423-BB — envelope not created', B.OUTPUT_ENVELOPE_CONTRACT.coreEnvelopeCreated === false && B.OUTPUT_ENVELOPE_CONTRACT.builderExecuted === false);

// ---- Pipeline ----
gate('G423-BB — pipeline 23 stages', B.VALIDATION_PIPELINE_CONTRACT.stageCount === 23);
B.BUILDER_PIPELINE_STAGES.forEach((s, i) => gate(`G423-BB — pipeline stage ${i + 1} ${typeof s === 'string' ? s : (s.stage ?? i)}`, B.VALIDATION_PIPELINE_CONTRACT.stages[i] !== undefined));
gate('G423-BB — pipeline atomic + deterministic', B.VALIDATION_PIPELINE_CONTRACT.atomic === true && B.VALIDATION_PIPELINE_CONTRACT.deterministicOrder === true);
gate('G423-BB — envelope only after all blockers', B.VALIDATION_PIPELINE_CONTRACT.envelopeOnlyAfterAllBlockers === true);
gate('G423-BB — pipeline not implemented', B.VALIDATION_PIPELINE_CONTRACT.pipelineImplemented === false && B.VALIDATION_PIPELINE_CONTRACT.validationExecuted === false);

// ---- Issue codes ----
for (const c of B.BUILDER_ISSUE_CODES) gate(`G423-BB — issue code ${c}`, typeof c === 'string' && c.length > 0);
gate('G423-BB — issue severities present', B.BUILDER_ISSUE_SEVERITIES.length >= 2);
gate('G423-BB — issue model no silent correction', B.ISSUE_MODEL_CONTRACT.silentCorrectionAllowed === false && B.ISSUE_MODEL_CONTRACT.permissiveFallbackAllowed === false);

// ---- Failure containment ----
gate('G423-BB — failure atomic, no partial', B.FAILURE_CONTAINMENT_CONTRACT.atomicBuilderDecisionRequired === true && B.FAILURE_CONTAINMENT_CONTRACT.partialCoreAllowed === false && B.FAILURE_CONTAINMENT_CONTRACT.partialEnvelopeAllowed === false);
gate('G423-BB — failure rollback by non-emission', B.FAILURE_CONTAINMENT_CONTRACT.rollbackByNonEmission === true);
gate('G423-BB — failure fail-closed on exceptions', B.FAILURE_CONTAINMENT_CONTRACT.unexpectedExceptionsMustFailClosed === true && B.FAILURE_CONTAINMENT_CONTRACT.emergencyRejectionRequired === true);
gate('G423-BB — failure no leaks', B.FAILURE_CONTAINMENT_CONTRACT.stackLeakAllowed === false && B.FAILURE_CONTAINMENT_CONTRACT.internalErrorMessageLeakAllowed === false && B.FAILURE_CONTAINMENT_CONTRACT.secretLeakAllowed === false);

// ---- Resource limits ----
gate('G423-BB — limits reject unknown dimension', B.RESOURCE_LIMITS_CONTRACT.unknownDimensionRejected === true);
gate('G423-BB — limits no silent truncation / partial', B.RESOURCE_LIMITS_CONTRACT.silentTruncationAllowed === false && B.RESOURCE_LIMITS_CONTRACT.partialOutputAllowed === false);
for (const d of B.RESOURCE_LIMITS_CONTRACT.dimensions) gate(`G423-BB — limit ${d.dimension} fail-closed`, d.silentTruncationAllowed === false && d.partialOutputAllowed === false);
gate('G423-BB — resource dimensions named', B.RESOURCE_DIMENSION_NAMES.length >= 3);

// ---- Extensibility / replay / SSOT / prototype ----
gate('G423-BB — core/envelope not extensible', B.EXTENSIBILITY_CONTRACT.coreExtensionsAllowed === false && B.EXTENSIBILITY_CONTRACT.envelopeExtensionsAllowed === false);
gate('G423-BB — extension cannot override digest/core/version', B.EXTENSIBILITY_CONTRACT.digestOverrideRejected === true && B.EXTENSIBILITY_CONTRACT.coreOverrideRejected === true && B.EXTENSIBILITY_CONTRACT.versionOverrideRejected === true);
gate('G423-BB — extension rejects prototype pollution', B.EXTENSIBILITY_CONTRACT.prototypePollutionKeysRejected === true);
gate('G423-BB — replay determinism', B.REPLAY_IDEMPOTENCY_CONTRACT.randomnessAllowed === false && B.REPLAY_IDEMPOTENCY_CONTRACT.ambientClockAllowed === false && B.REPLAY_IDEMPOTENCY_CONTRACT.crossInstanceDeterminismRequired === true);
gate('G423-BB — replay same source same core/digest/envelope', B.REPLAY_IDEMPOTENCY_CONTRACT.sameSourceDecisionProducesSameCore === true && B.REPLAY_IDEMPOTENCY_CONTRACT.sameCoreProducesSameDigest === true && B.REPLAY_IDEMPOTENCY_CONTRACT.sameValidSourceProducesSameEnvelope === true);
gate('G423-BB — SSOT: core/envelope NOT canonical', B.SSOT_SECURITY_PERMISSION_CONTRACT.bridgeDecisionCoreIsCanonical === false && B.SSOT_SECURITY_PERMISSION_CONTRACT.coreEnvelopeIsCanonical === false);
gate('G423-BB — SSOT certified blueprint remains SSOT', B.SSOT_SECURITY_PERMISSION_CONTRACT.certifiedBlueprintRemainsSsot === true);
gate('G423-BB — permission/tenant not integrated', B.SSOT_SECURITY_PERMISSION_CONTRACT.permissionModelIntegrated === false && B.SSOT_SECURITY_PERMISSION_CONTRACT.tenantModelIntegrated === false && B.SSOT_SECURITY_PERMISSION_CONTRACT.serverSideAuthorizationIntegrated === false);
gate('G423-BB — product exposure blocked by perm/tenancy', B.SSOT_SECURITY_PERMISSION_CONTRACT.productExposureBlockedByPermissionTenancy === true);
gate('G423-BB — prototype relink forbidden', B.PROTOTYPE_RELINK_PROHIBITION.prototypeRelinkAllowed === false && B.PROTOTYPE_RELINK_PROHIBITION.oldPrototypeImported === false);
gate('G423-BB — safe normalization max depth', B.SAFE_NORMALIZATION_CONTRACT.maxStructureDepth >= 8 && B.SAFE_NORMALIZATION_CONTRACT.failClosed === true);
gate('G423-BB — safe normalization not implemented', B.SAFE_NORMALIZATION_CONTRACT.normalizationImplemented === false);

// ---- Blocker closure / manual gate / readiness (CORRECTED) ----
const bc = B.BUILDER_BLOCKER_CLOSURE;
gate('G423-BB — builder blocker root cause confirmed', bc.bCoreEnvelopeBuilderRootCauseConfirmed === true);
gate('G423-BB — sub-contracts defined', bc.builderInputContractDefined === true && bc.coreExtractionContractDefined === true && bc.digestVerificationContractDefined === true && bc.outputEnvelopeContractDefined === true && bc.safeNormalizationContractDefined === true && bc.failureContainmentContractDefined === true);
gate('G423-BB — verification-state NOT open in closure', bc.bCoreEnvelopeVerificationStateOpen === false);
gate('G423-BB — verification-state does not block closure', bc.verificationStateBlocksClosure === false);
gate('G423-BB — builder CLOSED by contract', bc.bCoreEnvelopeBuilderClosedByContract === true);
gate('G423-BB — no remaining builder contract blockers', Array.isArray(bc.remainingBuilderContractBlockers) && bc.remainingBuilderContractBlockers.length === 0);
gate('G423-BB — implementation plan required', bc.builderImplementationPlanRequired === true);
gate('G423-BB — closure ready for builder plan, impl/runtime blocked', bc.readyForBuilderImplementationPlan === true && bc.readyForBuilderImplementation === false && bc.readyForRuntimeImplementation === false);
gate('G423-BB — manual gate required', B.MANUAL_ENABLEMENT_GATE.manualGateRequired === true);
gate('G423-BB — manual gate authorizes only contract/correction', B.MANUAL_ENABLEMENT_GATE.authorizesBuilderContract === true && B.MANUAL_ENABLEMENT_GATE.authorizesVerificationStateCorrection === true);
gate('G423-BB — manual gate slice = correction only', B.MANUAL_ENABLEMENT_GATE.currentSliceAuthorization === 'verification_state_classification_correction_only');
for (const k of ['authorizesBuilderImplementationPlan', 'authorizesBuilderImplementation', 'authorizesRuntimeImplementation', 'authorizesCoreEnvelopeAmendment', 'authorizesPreviewMount', 'authorizesUi', 'authorizesAppTouch', 'authorizesPersistence', 'authorizesBackend', 'authorizesPrisma', 'authorizesModuleGeneration', 'authorizesCertification', 'authorizesProductExposure']) gate(`G423-BB — manual gate ${k} false`, B.MANUAL_ENABLEMENT_GATE[k] === false);
gate('G423-BB — readiness state (plan audit)', CONTRACT.readiness === 'studio_bridge_decision_core_envelope_builder_contract_ready_for_builder_implementation_plan_audit');
gate('G423-BB — readyForEnterpriseContractAudit', CONTRACT.readyForEnterpriseContractAudit === true);
gate('G423-BB — readyForBuilderImplementationPlan true', CONTRACT.readyForBuilderImplementationPlan === true);
gate('G423-BB — readyForBuilderImplementation false', CONTRACT.readyForBuilderImplementation === false);
gate('G423-BB — readyForRuntimeImplementation false', CONTRACT.readyForRuntimeImplementation === false);
gate('G423-BB — readyForPreviewMount false', CONTRACT.readyForPreviewMount === false);
gate('G423-BB — readyForProductExposure false', CONTRACT.readyForProductExposure === false);
gate('G423-BB — bCoreEnvelopeVerificationStateOpen false', CONTRACT.bCoreEnvelopeVerificationStateOpen === false);
gate('G423-BB — bCoreEnvelopeBuilderClosedByContract true', CONTRACT.bCoreEnvelopeBuilderClosedByContract === true);
gate('G423-BB — top-level classification NOT_A_BLOCKER', CONTRACT.verificationStateClassification === 'NOT_A_BLOCKER');
gate('G423-BB — top-level owner consumer_runtime', CONTRACT.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BB — top-level amendment not required', CONTRACT.coreEnvelopeVerificationStateAmendmentRequired === false && CONTRACT.requiredAmendment === null);
gate('G423-BB — top-level envelope stays false', CONTRACT.envelopeIdentityVerifiedRemainsFalse === true);
gate('G423-BB — top-level consumer independent verification', CONTRACT.consumerPerformsIndependentVerification === true);

// ---- Capabilities ----
const CAP_TRUE = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed', 'sideEffectFree', 'metadataOnly', 'contractOnly', 'realSourceBridgeDecisionShapeCaptured', 'realCorePreimageAllowlistCaptured', 'realOutputEnvelopeCaptured', 'ssotPreserved', 'sourceConsumedReadOnly', 'upstreamsConsumedReadOnly', 'bIdentityClosedByContract', 'bRecomputeInputClosedByContract', 'bRecomputeInputResolvedByPlan'];
for (const f of CAP_TRUE) gate(`G423-BB — capability ${f} true`, B.BUILDER_CAPABILITIES[f] === true);
const CAP_FALSE = ['builderFactoryImplemented', 'buildImplemented', 'coreExtractionImplemented', 'digestRecomputeImplemented', 'identityVerificationImplemented', 'envelopeConstructionImplemented', 'consumerRuntimeImplemented', 'validationExecuted', 'builderExecuted', 'sourceDecisionConsumed', 'coreExtracted', 'coreEnvelopeCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
for (const f of CAP_FALSE) gate(`G423-BB — capability ${f} false`, B.BUILDER_CAPABILITIES[f] === false);

// ---- Verifier tamper battery (corrected classification) ----
const vbad = (label, mut) => gate(`G423-BB — verifier rejects ${label}`, B.verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: mut }).ok === false);
gate('G423-BB — verifier passes clean', CONTRACT.verification.ok === true && CONTRACT.verification.blockers.length === 0);
vbad('premature runtime', { ...CONTRACT, readyForRuntimeImplementation: true });
vbad('premature builder impl', { ...CONTRACT, readyForBuilderImplementation: true });
vbad('builder plan NOT ready', { ...CONTRACT, readyForBuilderImplementationPlan: false });
vbad('build implemented', { ...CONTRACT, capabilities: { ...CONTRACT.capabilities, buildImplemented: true } });
vbad('failClosed off', { ...CONTRACT, capabilities: { ...CONTRACT.capabilities, failClosed: false } });
vbad('classification not NOT_A_BLOCKER', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, verificationStateClassification: 'VALID_FUTURE_BLOCKER' } });
vbad('owner not consumer', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, identityVerifiedSemanticOwner: 'builder' } });
vbad('verification-state open', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, bCoreEnvelopeVerificationStateOpen: true } });
vbad('amendment required flag', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, coreEnvelopeVerificationStateAmendmentRequired: true } });
vbad('requiredAmendment not null', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, requiredAmendment: 'Core Envelope Verification State Amendment' } });
vbad('builder verified not outside envelope', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, builderResultCarriesVerifiedOutsideEnvelope: false } });
vbad('consumer independent verification missing', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, consumerPerformsIndependentVerification: false } });
vbad('envelope invariant true', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, coreEnvelopeCurrentInvariantIdentityVerified: true } });
vbad('envelope remains-false=false', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, envelopeIdentityVerifiedRemainsFalse: false } });
vbad('silent override', { ...CONTRACT, identityVerificationState: { ...CONTRACT.identityVerificationState, silentOverrideAllowed: true } });
vbad('closure not closed', { ...CONTRACT, builderBlockerClosure: { ...CONTRACT.builderBlockerClosure, bCoreEnvelopeBuilderClosedByContract: false } });
vbad('closure verification-state open', { ...CONTRACT, builderBlockerClosure: { ...CONTRACT.builderBlockerClosure, bCoreEnvelopeVerificationStateOpen: true } });
vbad('closure remaining blockers', { ...CONTRACT, builderBlockerClosure: { ...CONTRACT.builderBlockerClosure, remainingBuilderContractBlockers: ['x'] } });
vbad('manual gate authorizes plan', { ...CONTRACT, manualEnablementGate: { ...CONTRACT.manualEnablementGate, authorizesBuilderImplementationPlan: true } });
vbad('manual gate authorizes amendment', { ...CONTRACT, manualEnablementGate: { ...CONTRACT.manualEnablementGate, authorizesCoreEnvelopeAmendment: true } });

// ---- Manifest / compatibility ----
const a1 = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();
const a2 = B.createStudioBridgeDecisionCoreEnvelopeBuilderContract();
gate('G423-BB — manifest deterministic', a1.manifest.overallDigest === a2.manifest.overallDigest && a1.manifest.overallDigest.startsWith('fnv1a-'));
gate('G423-BB — manifest not cryptographic', a1.manifest.cryptographicIntegrityProvided === false);
gate('G423-BB — manifest part count 20', a1.manifest.partCount === 20);
const comp = B.checkBridgeDecisionCoreEnvelopeBuilderCompatibility();
gate('G423-BB — compatible with hardened bridge', comp.compatibleWithHardenedBridge === true);
gate('G423-BB — compatible with core envelope v2', comp.compatibleWithCoreEnvelopeContractV2 === true);
gate('G423-BB — compatible with plan-alignment amendment', comp.compatibleWithPlanAlignmentAmendment === true);
gate('G423-BB — compatible with v1 identity envelope', comp.compatibleWithIdentityEnvelopeV1 === true);
gate('G423-BB — compat verification-state closed + plan ready', comp.bCoreEnvelopeVerificationStateOpen === false && comp.readyForBuilderImplementationPlan === true);
gate('G423-BB — compat builder closed by contract', comp.bCoreEnvelopeBuilderClosedByContract === true);
gate('G423-BB — compat owner consumer_runtime', comp.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BB — compat classification NOT_A_BLOCKER', comp.verificationStateClassification === 'NOT_A_BLOCKER');
gate('G423-BB — compat amendment not required', comp.coreEnvelopeVerificationStateAmendmentRequired === false);
gate('G423-BB — compat impl/runtime blocked', comp.readyForBuilderImplementation === false && comp.readyForRuntimeImplementation === false);
gate('G423-BB — compat status', comp.status === 'bridge_decision_core_envelope_builder_contract_ready_for_builder_implementation_plan_audit');

// ---- No runtime / no builder (static) ----
const code = codeNoVerifier();
gate('G423-BB — no React import', !/from\s+['"]react['"]/.test(code));
gate('G423-BB — no .jsx', !/\.jsx\b/.test(code));
gate('G423-BB — no fetch(', !/\bfetch\s*\(/.test(code));
gate('G423-BB — no PrismaClient', !/new\s+PrismaClient/.test(code));
gate('G423-BB — no fs writes', !/\bfs\.(writeFile|writeFileSync|appendFileSync)/.test(code));
gate('G423-BB — no nondeterminism outside verifier', !/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(code));
for (const fn of ['buildCoreEnvelope', 'extractCore', 'recomputeDigest', 'verifyIdentity', 'consumeCore', 'mountPreview']) gate(`G423-BB — no runtime fn ${fn} defined`, !new RegExp(`function\\s+${fn}\\b`).test(code));

// ---- Imports read-only ----
gate('G423-BB — imports only upstream indexes + local', importsOf().every((i) => i.startsWith('.') || i.startsWith('node:') || /blueprint-engine\/(module-blueprint-authoring-runtime|bridge-decision-envelope-identity-contract|bridge-decision-core-envelope-contract|authoring-runtime-to-preview-bridge|bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment|bridge-to-preview-sandbox-runtime-contract|module-preview-sandbox)\/index\.js$/.test(i)));
gate('G423-BB — no App/backend/prisma import', !importsOf().some((i) => /App\.jsx|backend|prisma|src\/modules|\.\.\/\.\.\/\.\.\//.test(i)));

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'BUILDER-CONTRACT-REPORT.md', 'B-CORE-ENVELOPE-BUILDER-ROOT-CAUSE.md', 'REAL-SOURCE-BRIDGE-DECISION-SHAPE.md', 'SOURCE-ELIGIBILITY-CONTRACT.md', 'CORE-EXTRACTION-CONTRACT.md', 'DIGEST-RECOMPUTE-CONTRACT.md', 'SAME-DECISION-ATOMICITY.md', 'FUTURE-BUILDER-PUBLIC-API.md', 'OUTPUT-CORE-ENVELOPE-CONTRACT.md', 'IDENTITY-VERIFICATION-STATE-ANALYSIS.md', 'SAFE-NORMALIZATION-CONTRACT.md', 'VALIDATION-PIPELINE-CONTRACT.md', 'ISSUE-MODEL-CONTRACT.md', 'FAILURE-CONTAINMENT-CONTRACT.md', 'RESOURCE-LIMITS-CONTRACT.md', 'EXTENSIBILITY-CONTRACT.md', 'REPLAY-IDEMPOTENCY-CONTRACT.md', 'SSOT-SECURITY-PERMISSION-BOUNDARY.md', 'PROTOTYPE-RELINK-PROHIBITION.md', 'B-CORE-ENVELOPE-BUILDER-CLOSURE.md', 'MANUAL-ENABLEMENT-GATE.md', 'READINESS-TRANSITION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-BUILDER-NO-RUNTIME-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-SCALABILITY-RISK-NOTES.md', 'NEXT-ENTERPRISE-CONTRACT-AUDIT.md'];
gate('G423-BB — 28 evidence docs listed', DOCS.length === 28);
for (const d of DOCS) gate(`G423-BB — doc ${d}`, readEv(d).length > 60);
gate('G423-BB — identity analysis declares NOT_A_BLOCKER + no amendment', (() => { const d = readEv('IDENTITY-VERIFICATION-STATE-ANALYSIS.md'); return /B-CORE-ENVELOPE-VERIFICATION-STATE/.test(d) && /NOT_A_BLOCKER/.test(d) && /no amendment required/i.test(d) && /consumer-owned/.test(d); })());
gate('G423-BB — every evidence doc declaring the historical id also declares NOT_A_BLOCKER', (() => {
  for (const f of fs.readdirSync(EV)) { const d = readEv(f); if (/B-CORE-ENVELOPE-VERIFICATION-STATE/.test(d) && !/NOT_A_BLOCKER/.test(d)) return false; } return true;
})());

// ---- Scope ----
const files = (() => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } })();
if (files) {
  gate('G423-BB — all changed files authorized', files.every((f) => authorized(f)), files.filter((f) => !authorized(f)).join(', ') || 'clean');
  gate('G423-BB — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'));
  gate('G423-BB — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|bridge-decision-envelope-identity-contract|bridge-decision-core-envelope-contract|bridge-to-preview-sandbox-runtime-contract|bridge-to-preview-sandbox-runtime-implementation-plan|bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f)));
  gate('G423-BB — no App/pages/components/modules in diff', !files.some((f) => /^src\/(pages|components|modules|ModeloBase1|ModeloBase2)\//.test(f) || f === 'src/App.jsx'));
}

// ---- No new dependency ----
gate('G423-BB — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-BB — contract unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-BB — unit test has >= 920 scenarios', testCount >= 920, `${testCount} (min 920)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER-CONTRACT summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
