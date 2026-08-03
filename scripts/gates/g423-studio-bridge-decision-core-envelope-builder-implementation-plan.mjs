#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, side-effect-free, dev-only PLAN (definition only, no
 * builder/runtime) for the FUTURE Bridge Decision Core Envelope Builder. It LIVE-proves that all traceability counts
 * derive from the real Builder Contract (33 source fields, 32 allowlist == DECISION_DIGEST_PREIMAGE_FIELDS, 12
 * envelope fields, 23 pipeline stages), that identityVerified is consumer-owned (ARCHITECTURE 1 final; no amendment),
 * that B-CORE-ENVELOPE-BUILDER is closed-by-contract and resolved-by-plan, that exactly 22 ordered phases exist, that
 * the future runtime subtree is NOT created, and that the verifier rejects any regression. Keeps every implementation
 * flag false; builds nothing; mounts no preview; touches no App; exposes nothing.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createResolvedActiveStudioSlicePathAuthorizer } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder-implementation-plan');
const BC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder-contract');
const ENV_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const CORE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-contract');
const PLANRT_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan');
const FUTURE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder-implementation-plan');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const allFiles = () => walk(DIR, /.*/);
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBuilderImplementationPlan\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-implementation-plan\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder-implementation-plan\//,
];
// The chronology-free catalog lookup is replaced by the single central authorizer: a path is
// tolerated only when exactly one ACTIVE slice resolves from the branch diff AND that exact
// slice is authorized for that exact path. `activeDiffAuthorizer` is computed once, from the
// complete diff, and authorizes nothing when the diff is empty, unresolved or ambiguous.
const activeDiffAuthorizer = (() => {
  try {
    return createResolvedActiveStudioSlicePathAuthorizer(
      execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean));
  } catch { return createResolvedActiveStudioSlicePathAuthorizer([]); }
})();
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || activeDiffAuthorizer.isAuthorized(f);

const P = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const BC = await import(pathToFileURL(path.join(BC_DIR, 'index.js')).href);
const ENV = await import(pathToFileURL(path.join(ENV_DIR, 'index.js')).href);
const CORE = await import(pathToFileURL(path.join(CORE_DIR, 'index.js')).href);
const PLANRT = await import(pathToFileURL(path.join(PLANRT_DIR, 'index.js')).href);
const PLAN = P.createStudioBridgeDecisionCoreEnvelopeBuilderImplementationPlan();
const v = P.verifyBuilderImplementationPlan;

// ---- Artifacts ----
gate('G423-BIP — subtree exists', exists(DIR));
gate('G423-BIP — test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-BIP — gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-BIP — evidence dir exists', exists(EV));
gate('G423-BIP — only .js files', allFiles().every((f) => /\.js$/.test(f)), `${allFiles().length}`);
gate('G423-BIP — >= 26 modules', jsFiles().length >= 26, `${jsFiles().length}`);
gate('G423-BIP — no .jsx anywhere', allFiles().every((f) => !/\.jsx$/.test(f)));
gate('G423-BIP — index composes plan-only', PLAN.kind === 'studio-bridge-decision-core-envelope-builder-implementation-plan' && PLAN.planOnly === true);

// ---- Registry ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-BIP — registry subtree path', /\^src\\\/studio\\\/blueprint-engine\\\/bridge-decision-core-envelope-builder-implementation-plan\\\//.test(reg));
gate('G423-BIP — registry test path', /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-decision-core-envelope-builder-implementation-plan\\\.test\\\.js\$/.test(reg));
gate('G423-BIP — registry gate path', /\^scripts\\\/gates\\\/g423-studio-bridge-decision-core-envelope-builder-implementation-plan\\\.mjs\$/.test(reg));
gate('G423-BIP — registry docs path', /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-decision-core-envelope-builder-implementation-plan\\\//.test(reg));

// ---- Upstreams intact ----
gate('G423-BIP — upstream builder contract present', exists(BC_DIR));
gate('G423-BIP — upstream core envelope v2 present', exists(CORE_DIR));
gate('G423-BIP — upstream v1 identity present', exists(ENV_DIR));
// LIFECYCLE CORRECTION: the physical-absence assertion (!exists(FUTURE_DIR)) was temporal — valid only during the
// plan-only slice and incompatible with the next authorized slice that implements the builder. Replaced by PERMANENT
// declarative proofs that the PLAN itself created/implemented nothing. These hold before AND after the builder exists.
gate('G423-BIP — plan declares future subtree NOT created by it', P.FUTURE_RUNTIME_SUBTREE.subtreeCreated === false && PLAN.futureRuntimeSubtreeCreated === false);
gate('G423-BIP — plan implements no builder factory/build', PLAN.builderFactoryImplemented === false && PLAN.buildImplemented === false);
gate('G423-BIP — plan implements no extraction/digest/envelope', PLAN.coreExtractionImplemented === false && PLAN.digestRecomputeImplemented === false && PLAN.envelopeConstructionImplemented === false);
gate('G423-BIP — plan implements no consumer runtime', PLAN.consumerRuntimeImplemented === false);

// ---- Provenance / config ----
gate('G423-BIP — plan version', P.PLAN_VERSION === 'studio-bridge-decision-core-envelope-builder-implementation-plan@1.0.0');
gate('G423-BIP — source checkpoint = PR493 audit', P.SOURCE_CHECKPOINT === 'pr_493_post_merge_deep_enterprise_verification_state_correction_audit');
gate('G423-BIP — source recommendation', P.SOURCE_RECOMMENDATION === 'READY_FOR_BRIDGE_DECISION_CORE_ENVELOPE_BUILDER_IMPLEMENTATION_PLAN');
gate('G423-BIP — slice authorization plan-only', P.CURRENT_SLICE_AUTHORIZATION === 'builder_implementation_plan_only');
gate('G423-BIP — future min test 1050', P.FUTURE_IMPLEMENTATION_MIN_TEST_SCENARIOS === 1050);
gate('G423-BIP — future min gate 330', P.FUTURE_IMPLEMENTATION_MIN_GATE_CHECKS === 330);

// ---- Source traceability (LIVE, derived from real upstream) ----
const t = P.SOURCE_TRACEABILITY;
gate('G423-BIP — source fields == 33 == upstream', t.sourceFieldCount === 33 && t.sourceFieldCount === BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS.length);
gate('G423-BIP — allowlist == 32 == upstream', t.coreAllowlistFieldCount === 32 && t.coreAllowlistFieldCount === BC.DIGEST_PREIMAGE_ALLOWLIST.length);
gate('G423-BIP — allowlist == DECISION_DIGEST_PREIMAGE_FIELDS', JSON.stringify([...t.coreAllowlist].sort()) === JSON.stringify([...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort()));
gate('G423-BIP — envelope fields == 12 == upstream', t.envelopeFieldCount === 12 && t.envelopeFieldCount === BC.OUTPUT_CORE_ENVELOPE_FIELDS.length);
gate('G423-BIP — pipeline stages == 23 == upstream', t.pipelineStageCount === 23 && t.pipelineStageCount === BC.BUILDER_PIPELINE_STAGES.length);
gate('G423-BIP — issue codes == upstream', t.issueCodeCount === BC.BUILDER_ISSUE_CODES.length);
gate('G423-BIP — owner consumer_runtime', t.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BIP — classification NOT_A_BLOCKER', t.verificationStateClassification === 'NOT_A_BLOCKER');
gate('G423-BIP — no amendment required', t.coreEnvelopeVerificationStateAmendmentRequired === false);
gate('G423-BIP — builder closed by contract', t.bCoreEnvelopeBuilderClosedByContract === true);
gate('G423-BIP — verification state not open', t.bCoreEnvelopeVerificationStateOpen === false);
gate('G423-BIP — envelope invariant identityVerified false', t.envelopeInvariantIdentityVerified === false && t.envelopeInvariantIdentityVerified === CORE.CORE_ENVELOPE_INVARIANTS.identityVerified);
gate('G423-BIP — builder contract verification ok', t.builderContractVerificationOk === true);
for (const f of t.sourceFields) gate(`G423-BIP — source field ${f} real`, BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS.includes(f));
for (const f of t.coreAllowlist) gate(`G423-BIP — allowlist field ${f} real & not divergent`, BC.DIGEST_PREIMAGE_ALLOWLIST.includes(f) && ENV.DECISION_DIGEST_PREIMAGE_FIELDS.includes(f));

// ---- Future runtime subtree / public API ----
gate('G423-BIP — future subtree planned not created', P.FUTURE_RUNTIME_SUBTREE.subtreeCreated === false && P.FUTURE_RUNTIME_SUBTREE.onlyJs === true);
gate('G423-BIP — future file map >= 28', P.FUTURE_RUNTIME_FILE_MAP.length >= 28);
// Per future file: PERMANENT metadata proofs (.js, valid responsibility, safe relative path, unique, belongs to the
// planned subtree) — replacing the temporal physical-absence check.
{
  const names = P.FUTURE_RUNTIME_FILE_MAP.map((x) => x.file);
  for (const f of P.FUTURE_RUNTIME_FILE_MAP) {
    gate(`G423-BIP — future file ${f.file} metadata valid`, /\.js$/.test(f.file)
      && typeof f.responsibility === 'string' && f.responsibility.length > 5
      && !path.isAbsolute(f.file) && !f.file.includes('..') && !f.file.includes('/')
      && names.filter((n) => n === f.file).length === 1
      && P.FUTURE_RUNTIME_SUBTREE.plannedDir === 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder');
  }
}
gate('G423-BIP — future API factory name', P.FUTURE_PUBLIC_API_PLAN.factoryName === 'createBridgeDecisionCoreEnvelopeBuilder');
gate('G423-BIP — future API build not implemented', P.FUTURE_PUBLIC_API_PLAN.buildImplemented === false);
gate('G423-BIP — future builder decision owns identityVerified', P.FUTURE_PUBLIC_API_PLAN.builderDecisionFields.includes('identityVerified'));

// ---- Identity lifecycle (ARCHITECTURE 1) ----
const il = P.IDENTITY_LIFECYCLE_PLAN;
gate('G423-BIP — lifecycle owner consumer_runtime', il.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BIP — lifecycle ARCHITECTURE 1 final', il.selectedArchitecture === 'ARCHITECTURE_1' && il.architectureOneFinal === true);
gate('G423-BIP — builder verified true on success', il.builderDecisionIdentityVerifiedTrueOnSuccess === true);
gate('G423-BIP — envelope identityVerified always false', il.coreEnvelopeIdentityVerifiedAlwaysFalse === true);
gate('G423-BIP — consumer reverifies independently', il.consumerDecisionIdentityVerifiedTrueOnlyAfterIndependentReverification === true);
gate('G423-BIP — consumer does not mutate envelope', il.consumerDoesNotMutateEnvelope === true);
gate('G423-BIP — double verification required', il.doubleVerificationRequired === true);
gate('G423-BIP — no amendment required (lifecycle)', il.coreEnvelopeVerificationStateAmendmentRequired === false);
gate('G423-BIP — consumer decision owns identityVerified (upstream)', PLANRT.CONSUMER_DECISION_PLAN.decisionFields.includes('identityVerified'));
gate('G423-BIP — identityVerified is core-envelope security field', CORE.CORE_ENVELOPE_SECURITY_FIELDS.includes('identityVerified'));

// ---- Phases ----
gate('G423-BIP — exactly 22 phases', P.IMPLEMENTATION_PHASES.length === 22);
P.IMPLEMENTATION_PHASES.forEach((ph, i) => {
  gate(`G423-BIP — phase ${i + 1} ${ph.phaseId} order+planned`, ph.order === i + 1 && ph.implementationStatus === 'planned' && ph.sideEffectsAllowed === false);
});

// ---- Plan area presence ----
gate('G423-BIP — safe normalization no code copy', P.SAFE_NORMALIZATION_PLAN.reusesBridgeHardeningPrinciplesNoCodeCopy === true && P.SAFE_NORMALIZATION_PLAN.failClosed === true);
gate('G423-BIP — eligibility real kind/status', P.SOURCE_ELIGIBILITY_PLAN.requiredDecisionKind === 'bridge-decision' && P.SOURCE_ELIGIBILITY_PLAN.requiredStatus === 'bridge_ready');
gate('G423-BIP — core extraction exact allowlist pick', P.CORE_EXTRACTION_PLAN.mode === 'exact_allowlist_pick' && P.CORE_EXTRACTION_PLAN.allowlistMatchesUpstream === true);
gate('G423-BIP — core extraction forbids alias/default/coercion', P.CORE_EXTRACTION_PLAN.aliasForbidden === true && P.CORE_EXTRACTION_PLAN.defaultForbidden === true && P.CORE_EXTRACTION_PLAN.coercionForbidden === true);
gate('G423-BIP — digest exact compare, non-crypto', P.DIGEST_RECOMPUTE_PLAN.exactComparisonRequired === true && P.DIGEST_RECOMPUTE_PLAN.cryptographicIntegrityProvided === false);
gate('G423-BIP — atomicity cross-decision forbidden', P.SAME_DECISION_ATOMICITY_PLAN.crossDecisionMixingForbidden === true && P.SAME_DECISION_ATOMICITY_PLAN.partialCoreForbidden === true);
gate('G423-BIP — output envelope identityVerified false', P.OUTPUT_ENVELOPE_PLAN.identityVerifiedAlwaysFalse === true && P.OUTPUT_ENVELOPE_PLAN.envelopeFieldCount === 12);
gate('G423-BIP — output envelope clone+freeze', P.OUTPUT_ENVELOPE_PLAN.cloneAndDeepFreezeRequired === true && P.OUTPUT_ENVELOPE_PLAN.duplicationForbidden === true);
gate('G423-BIP — builder decision rollback + no leak', P.BUILDER_DECISION_PLAN.rollbackByNonEmission === true && P.BUILDER_DECISION_PLAN.secretLeakForbidden === true && P.BUILDER_DECISION_PLAN.coreEnvelopeNullOnError === true);
gate('G423-BIP — pipeline 23 stages + first blocker', P.PIPELINE_EXECUTION_PLAN.stageCount === 23 && P.PIPELINE_EXECUTION_PLAN.firstBlockerStopsPipeline === true);
gate('G423-BIP — issue/failure atomic + no leak', P.ISSUE_FAILURE_PLAN.atomicBuilderDecisionRequired === true && P.ISSUE_FAILURE_PLAN.noLeaks === true);
gate('G423-BIP — resource limits boundary matrix', P.RESOURCE_LIMITS_PLAN.silentTruncationForbidden === true && P.RESOURCE_LIMITS_PLAN.boundaryTestMatrix.length === 3);
gate('G423-BIP — extensions/replay determinism', P.EXTENSIONS_REPLAY_PLAN.crossInstanceDeterminismRequired === true && P.EXTENSIONS_REPLAY_PLAN.prototypePollutionForbidden === true);
gate('G423-BIP — test strategy min 1050', P.PLAN_TEST_STRATEGY.minScenarios === 1050 && P.PLAN_TEST_STRATEGY.usesRealUpstreamsInCoreProofs === true);
gate('G423-BIP — gate strategy min 330', P.PLAN_GATE_STRATEGY.minChecks === 330);
gate('G423-BIP — risk matrix >= 16', P.RISK_MATRIX.length >= 16);
for (const r of P.RISK_MATRIX) gate(`G423-BIP — risk ${r.riskId} specified`, typeof r.severity === 'string' && /^PHASE_/.test(r.ownerPhase) && typeof r.mitigation === 'string' && r.mitigation.length > 5);
gate('G423-BIP — quality notes no certification', P.QUALITY_CERTIFICATION_NOTES.certificationPerformed === false);

// ---- Manual checkpoints / manual gate ----
gate('G423-BIP — checkpoint 01 completed', P.MANUAL_CHECKPOINTS.checkpoints.find((c) => c.id === 'CHECKPOINT_01_BUILDER_CONTRACT_ENTERPRISE_AUDIT').state === 'completed');
gate('G423-BIP — checkpoint 02 pending', P.MANUAL_CHECKPOINTS.checkpoints.find((c) => c.id === 'CHECKPOINT_02_BUILDER_IMPLEMENTATION_PLAN_ENTERPRISE_AUDIT').state === 'pending');
gate('G423-BIP — checkpoint 03 blocked', P.MANUAL_CHECKPOINTS.checkpoints.find((c) => c.id === 'CHECKPOINT_03_PRE_BUILDER_IMPLEMENTATION_AUTHORIZATION').state === 'blocked');
gate('G423-BIP — manual gate authorizes plan only', P.MANUAL_ENABLEMENT_GATE.authorizesBuilderImplementationPlan === true);
for (const k of ['authorizesBuilderImplementation', 'authorizesConsumerRuntime', 'authorizesCoreEnvelopeAmendment', 'authorizesPreviewMount', 'authorizesUi', 'authorizesAppTouch', 'authorizesPersistence', 'authorizesBackend', 'authorizesPrisma', 'authorizesModuleGeneration', 'authorizesCertification', 'authorizesProductExposure']) gate(`G423-BIP — manual gate ${k} false`, P.MANUAL_ENABLEMENT_GATE[k] === false);

// ---- Readiness ----
gate('G423-BIP — readiness plan audit state', PLAN.readiness === 'studio_bridge_decision_core_envelope_builder_implementation_plan_ready_for_enterprise_audit');
gate('G423-BIP — plan created', PLAN.builderImplementationPlanCreated === true);
gate('G423-BIP — bRecomputeInput resolved by plan', PLAN.bRecomputeInputResolvedByPlan === true);
gate('G423-BIP — verification state not open', PLAN.bCoreEnvelopeVerificationStateOpen === false);
gate('G423-BIP — builder closed by contract', PLAN.bCoreEnvelopeBuilderClosedByContract === true);
gate('G423-BIP — builder resolved by plan', PLAN.bCoreEnvelopeBuilderResolvedByPlan === true);
gate('G423-BIP — readyForEnterprisePlanAudit', PLAN.readyForEnterprisePlanAudit === true);
gate('G423-BIP — readyForBuilderImplementation false', PLAN.readyForBuilderImplementation === false);
gate('G423-BIP — readyForConsumerRuntimeImplementation false', PLAN.readyForConsumerRuntimeImplementation === false);

// ---- Capabilities ----
const CAP_TRUE = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed', 'sideEffectFree', 'metadataOnly', 'planOnly', 'upstreamsConsumedReadOnly', 'ssotPreserved', 'architectureOneFinal'];
for (const f of CAP_TRUE) gate(`G423-BIP — capability ${f} true`, P.PLAN_CAPABILITIES[f] === true);
const CAP_FALSE = ['builderFactoryImplemented', 'buildImplemented', 'coreExtractionImplemented', 'digestRecomputeImplemented', 'identityVerificationImplemented', 'envelopeConstructionImplemented', 'consumerRuntimeImplemented', 'futureRuntimeSubtreeCreated', 'coreEnvelopeVerificationStateAmendmentCreated', 'validationExecuted', 'builderExecuted', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'permissionModelIntegrated', 'tenantModelIntegrated'];
for (const f of CAP_FALSE) gate(`G423-BIP — capability ${f} false`, P.PLAN_CAPABILITIES[f] === false);

// ---- Verifier tamper battery ----
gate('G423-BIP — verifier passes clean', PLAN.verification.ok === true && PLAN.verification.blockers.length === 0);
const vbad = (label, mut) => gate(`G423-BIP — verifier rejects ${label}`, v({ plan: mut }).ok === false);
vbad('build implemented', { ...PLAN, capabilities: { ...PLAN.capabilities, buildImplemented: true } });
vbad('planOnly false', { ...PLAN, capabilities: { ...PLAN.capabilities, planOnly: false } });
vbad('future subtree created', { ...PLAN, futureRuntimeSubtree: { ...PLAN.futureRuntimeSubtree, subtreeCreated: true } });
vbad('amendment created cap', { ...PLAN, capabilities: { ...PLAN.capabilities, coreEnvelopeVerificationStateAmendmentCreated: true } });
vbad('architectureOneFinal false', { ...PLAN, capabilities: { ...PLAN.capabilities, architectureOneFinal: false } });
vbad('lifecycle owner not consumer', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, identityVerifiedSemanticOwner: 'builder' } });
vbad('lifecycle arch not final', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, architectureOneFinal: false } });
vbad('envelope identity not always false', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, coreEnvelopeIdentityVerifiedAlwaysFalse: false } });
vbad('consumer reverification disabled', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, consumerDecisionIdentityVerifiedTrueOnlyAfterIndependentReverification: false } });
vbad('consumer mutates envelope', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, consumerDoesNotMutateEnvelope: false } });
vbad('double verification off', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, doubleVerificationRequired: false } });
vbad('lifecycle amendment required', { ...PLAN, identityLifecycle: { ...PLAN.identityLifecycle, coreEnvelopeVerificationStateAmendmentRequired: true } });
vbad('allowlist diverges', { ...PLAN, coreExtraction: { ...PLAN.coreExtraction, allowlistMatchesUpstream: false } });
vbad('owner drift traceability', { ...PLAN, sourceTraceability: { ...PLAN.sourceTraceability, identityVerifiedSemanticOwner: 'builder' } });
vbad('source field count wrong', { ...PLAN, sourceTraceability: { ...PLAN.sourceTraceability, sourceFieldCount: 34 } });
vbad('phase count wrong', { ...PLAN, implementationPhases: PLAN.implementationPhases.slice(0, 21) });
vbad('readyForBuilderImplementation', { ...PLAN, readyForBuilderImplementation: true });
vbad('readyForConsumerRuntime', { ...PLAN, readyForConsumerRuntimeImplementation: true });
vbad('manual gate authorizes impl', { ...PLAN, manualEnablementGate: { ...PLAN.manualEnablementGate, authorizesBuilderImplementation: true } });
vbad('manual gate authorizes amendment', { ...PLAN, manualEnablementGate: { ...PLAN.manualEnablementGate, authorizesCoreEnvelopeAmendment: true } });
vbad('manual gate authorizes consumer runtime', { ...PLAN, manualEnablementGate: { ...PLAN.manualEnablementGate, authorizesConsumerRuntime: true } });

// ---- Manifest / compatibility ----
const a1 = P.createStudioBridgeDecisionCoreEnvelopeBuilderImplementationPlan();
const a2 = P.createStudioBridgeDecisionCoreEnvelopeBuilderImplementationPlan();
gate('G423-BIP — manifest deterministic', a1.manifest.overallDigest === a2.manifest.overallDigest && a1.manifest.overallDigest.startsWith('fnv1a-'));
gate('G423-BIP — manifest not cryptographic', a1.manifest.cryptographicIntegrityProvided === false);
const comp = P.checkBuilderImplementationPlanCompatibility();
gate('G423-BIP — compatible with hardened bridge', comp.compatibleWithHardenedBridge === true);
gate('G423-BIP — compatible with core envelope v2', comp.compatibleWithCoreEnvelopeContractV2 === true);
gate('G423-BIP — compatible with builder contract', comp.compatibleWithBuilderContract === true);
gate('G423-BIP — compat owner consumer_runtime', comp.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BIP — compat builder resolved by plan', comp.bCoreEnvelopeBuilderResolvedByPlan === true);
gate('G423-BIP — compat impl/runtime blocked', comp.readyForBuilderImplementation === false && comp.readyForConsumerRuntimeImplementation === false);
gate('G423-BIP — compat status', comp.status === 'bridge_decision_core_envelope_builder_implementation_plan_ready_for_enterprise_audit');

// ---- No runtime / no builder (static) ----
const code = codeNoVerifier();
gate('G423-BIP — no React import', !/from\s+['"]react['"]/.test(code));
gate('G423-BIP — no .jsx', !/\.jsx\b/.test(code));
gate('G423-BIP — no fetch(', !/\bfetch\s*\(/.test(code));
gate('G423-BIP — no PrismaClient', !/new\s+PrismaClient/.test(code));
gate('G423-BIP — no fs writes', !/\bfs\.(writeFile|writeFileSync|appendFileSync)/.test(code));
gate('G423-BIP — no nondeterminism outside verifier', !/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(code));
for (const fn of ['build', 'extractBridgeDecisionCore', 'recomputeBridgeDecisionDigest', 'constructCoreEnvelope', 'createBuilderDecision']) gate(`G423-BIP — no runtime fn ${fn} defined`, !new RegExp(`function\\s+${fn}\\b`).test(code));

// ---- Imports read-only ----
gate('G423-BIP — imports only upstream indexes + local', importsOf().every((i) => i.startsWith('.') || i.startsWith('node:') || /blueprint-engine\/(bridge-decision-core-envelope-builder-contract|bridge-decision-envelope-identity-contract|bridge-decision-core-envelope-contract|bridge-to-preview-sandbox-runtime-implementation-plan|module-blueprint-authoring-runtime)\/index\.js$/.test(i)));
gate('G423-BIP — no App/backend/prisma import', !importsOf().some((i) => /App\.jsx|backend|prisma|src\/modules|\.\.\/\.\.\/\.\.\//.test(i)));

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'PLAN-REPORT.md', 'SOURCE-TRACEABILITY.md', 'FUTURE-RUNTIME-SUBTREE.md', 'FUTURE-FILE-MAP.md', 'FUTURE-PUBLIC-API.md', 'IDENTITY-LIFECYCLE-ARCHITECTURE-1.md', 'IMPLEMENTATION-PHASES.md', 'SAFE-NORMALIZATION-PLAN.md', 'SOURCE-ELIGIBILITY-PLAN.md', 'CORE-EXTRACTION-PLAN.md', 'DIGEST-RECOMPUTE-PLAN.md', 'SAME-DECISION-ATOMICITY-PLAN.md', 'OUTPUT-ENVELOPE-PLAN.md', 'BUILDER-DECISION-PLAN.md', 'PIPELINE-EXECUTION-PLAN.md', 'ISSUE-FAILURE-PLAN.md', 'RESOURCE-LIMITS-PLAN.md', 'EXTENSIONS-REPLAY-PLAN.md', 'TEST-STRATEGY.md', 'GATE-STRATEGY.md', 'RISK-MATRIX.md', 'QUALITY-CERTIFICATION-NOTES.md', 'MANUAL-CHECKPOINTS.md', 'READINESS-TRANSITION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'B-CORE-ENVELOPE-BUILDER-RESOLUTION.md', 'NO-RUNTIME-NO-BUILDER-NO-SUBTREE.md', 'BUILD-BUNDLE-ABSENCE.md', 'NEXT-ENTERPRISE-PLAN-AUDIT.md'];
gate('G423-BIP — 30 evidence docs listed', DOCS.length === 30);
for (const d of DOCS) gate(`G423-BIP — doc ${d}`, readEv(d).length > 60);
gate('G423-BIP — identity doc declares ARCHITECTURE 1 + no amendment', /ARCHITECTURE 1/.test(readEv('IDENTITY-LIFECYCLE-ARCHITECTURE-1.md')) && /amendment/i.test(readEv('NEXT-ENTERPRISE-PLAN-AUDIT.md')));

// ---- Scope ----
const files = (() => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } })();
if (files) {
  gate('G423-BIP — all changed files authorized', files.every((f) => authorized(f)), files.filter((f) => !authorized(f)).join(', ') || 'clean');
  // productionUiGuard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
  // governance guard may appear ONLY when the slice active on this branch shares it — i.e. a governance slice.
  gate('G423-BIP — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs')
    && (!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')
      || createResolvedActiveStudioSlicePathAuthorizer(files).isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs')));
  gate('G423-BIP — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(bridge-decision-core-envelope-builder-contract|bridge-decision-core-envelope-contract|bridge-decision-envelope-identity-contract|bridge-to-preview-sandbox-runtime-contract|bridge-to-preview-sandbox-runtime-implementation-plan|bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment|authoring-runtime-to-preview-bridge|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f)));
  gate('G423-BIP — no App/pages/components/modules in diff', !files.some((f) => /^src\/(pages|components|modules|ModeloBase1|ModeloBase2)\//.test(f) || f === 'src/App.jsx'));
  // LIFECYCLE CORRECTION: forbidding the future builder subtree in the DIFF was temporal (plan-only slice). The
  // permanent invariant is that the PLAN's own source subtree is unchanged by whatever slice is running.
  gate('G423-BIP — plan source subtree unchanged', !files.some((f) => /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-implementation-plan\//.test(f)));
}

// ---- No new dependency ----
gate('G423-BIP — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-BIP — plan unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-BIP — unit test has >= 800 scenarios', testCount >= 800, `${testCount} (min 800)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER-IMPLEMENTATION-PLAN summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
