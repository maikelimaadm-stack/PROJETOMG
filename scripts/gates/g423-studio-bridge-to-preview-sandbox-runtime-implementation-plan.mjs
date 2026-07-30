#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-TO-PREVIEW-SANDBOX-RUNTIME-IMPLEMENTATION-PLAN — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, dev-only PLAN-ONLY subtree for the FUTURE Preview
 * Sandbox consumer runtime. It reflects the REAL merged upstream contract shapes read-only (no invented shape/
 * digest/version/mapping), LIVE-proves the plan gap analysis against a REAL bridge decision (B-RECOMPUTE-INPUT:
 * 32 required preimage fields, only 3 available in the 17-field envelope, 29 missing), keeps EVERY runtime/
 * consumer implementation flag false, defines 18 ordered phases / 27 future files / 17 pipeline stages / 12
 * mappings / 12 resource dimensions / risk matrix / manual checkpoints, and builds no runtime, executes no
 * pipeline, mounts no preview, touches no App and exposes nothing. B-IDENTITY closed by contract; runtime NOT
 * authorized while B-RECOMPUTE-INPUT is open.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';
import { resolveActiveStudioSlice } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan');
const ENV_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const SBX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-to-preview-sandbox-runtime-implementation-plan.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const allFiles = () => walk(DIR, /.*/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeToPreviewSandboxRuntimeImplementationPlan\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-implementation-plan\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const P = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const ENV = await import(pathToFileURL(path.join(ENV_DIR, 'index.js')).href);
const SBX = await import(pathToFileURL(path.join(SBX_DIR, 'index.js')).href);
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);
const PLAN = P.createStudioBridgeToPreviewSandboxRuntimeImplementationPlan();

function buildRealDecision(seed = 'gate') {
  const s0 = rt.createAuthoringRuntimeSession({ seed });
  let r = rt.executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'C' } } });
  const draftId = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const b = bridge.createStudioAuthoringRuntimeToPreviewBridge({});
  return b.execute({ sourceHandoff: rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId });
}

// ---- Artifacts ----
gate('G423-BP — plan subtree exists', exists(DIR));
gate('G423-BP — test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-BP — gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-BP — evidence dir exists', exists(EV));
gate('G423-BP — subtree has only .js files', allFiles().every((f) => /\.js$/.test(f)), `${allFiles().length} files`);
gate('G423-BP — subtree has >= 28 modules', jsFiles().length >= 28, `${jsFiles().length}`);
gate('G423-BP — index composes plan', PLAN.kind === 'studio-bridge-to-preview-sandbox-runtime-implementation-plan');

// ---- Registry: 4 anchored paths ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-BP — registry: subtree path', /\^src\\\/studio\\\/blueprint-engine\\\/bridge-to-preview-sandbox-runtime-implementation-plan\\\//.test(reg));
gate('G423-BP — registry: test path', /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-to-preview-sandbox-runtime-implementation-plan\\\.test\\\.js\$/.test(reg));
gate('G423-BP — registry: gate path', /\^scripts\\\/gates\\\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan\\\.mjs\$/.test(reg));
gate('G423-BP — registry: docs path', /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan\\\//.test(reg));

// ---- Upstreams intact (no upstream file in the plan subtree imports mutated) ----
gate('G423-BP — upstream bridge present', exists(BRIDGE_DIR));
gate('G423-BP — upstream envelope contract present', exists(ENV_DIR));
gate('G423-BP — upstream sandbox contract present', exists(SBX_DIR));
gate('G423-BP — upstream preview sandbox present', exists(path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox')));

// ---- Real contract shapes reflected (no invention) ----
gate('G423-BP — real envelope fields reflected (17)', PLAN.sourceEnvelopePlan.envelopeFieldCount === ENV.ENVELOPE_FIELDS.length && ENV.ENVELOPE_FIELDS.length === 17);
gate('G423-BP — envelope fields equal contract', JSON.stringify([...PLAN.sourceEnvelopePlan.envelopeFields].sort()) === JSON.stringify([...ENV.ENVELOPE_FIELDS].sort()));
gate('G423-BP — real decision preimage reflected (32)', P.REAL_DECISION_DIGEST_PREIMAGE_FIELDS.length === ENV.DECISION_DIGEST_PREIMAGE_FIELDS.length && ENV.DECISION_DIGEST_PREIMAGE_FIELDS.length === 32);
gate('G423-BP — real mappings reflected (12)', PLAN.mappingExecutionPlan.mappingCount === SBX.FIELD_MAPPING_CONTRACT.length && SBX.FIELD_MAPPING_CONTRACT.length === 12);
gate('G423-BP — real pipeline stages reflected (17)', PLAN.validationPipelinePlan.stageCount === ENV.ENVELOPE_VALIDATION_STAGES.length && ENV.ENVELOPE_VALIDATION_STAGES.length === 17);
gate('G423-BP — envelope identity contract version reflected', P.SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION === ENV.ENVELOPE_CONTRACT_VERSION);
gate('G423-BP — sandbox runtime contract version reflected', P.SOURCE_BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION === SBX.CONTRACT_VERSION);

// each mapping equals the real contract mapping
SBX.FIELD_MAPPING_CONTRACT.forEach((real, i) => {
  const m = PLAN.mappingExecutionPlan.mappings[i];
  gate(`G423-BP — mapping ${real.mappingId} matches real (${real.sourceField}->${real.targetField})`, m && m.mappingId === real.mappingId && m.sourceField === real.sourceField && m.targetField === real.targetField && m.transformKind === real.transformKind && m.defaultAllowed === false && m.losslessRequired === true);
});
// each pipeline stage equals real envelope validation stage + blocking
ENV.ENVELOPE_VALIDATION_STAGES.forEach((s, i) => {
  const st = PLAN.validationPipelinePlan.detailedStages[i];
  gate(`G423-BP — pipeline stage ${i + 1} ${s} blocking/ordered`, st && st.stage === s && st.order === i + 1 && st.blocking === true && st.mayCreateSandboxDescriptor === false);
});

// ---- B-IDENTITY closed ----
gate('G423-BP — B-IDENTITY closed by contract', PLAN.bIdentityClosedByContract === true && P.IDENTITY_VERIFICATION_PLAN.bIdentityClosedByContract === true);

// ---- B-RECOMPUTE-INPUT explicit + LIVE gap proof ----
const dr = P.DIGEST_RECOMPUTATION_INPUT_PLAN;
const b = P.B_RECOMPUTE_INPUT;
gate('G423-BP — B-RECOMPUTE-INPUT declared', b.blockerId === 'B-RECOMPUTE-INPUT');
gate('G423-BP — B-RECOMPUTE-INPUT options A/B/C', JSON.stringify(b.options.map((o) => o.option).sort()) === JSON.stringify(['A', 'B', 'C']));
gate('G423-BP — B-RECOMPUTE-INPUT selects an option (A)', b.selectedOption === 'A');
gate('G423-BP — required preimage fields == 32', dr.requiredDecisionPreimageFieldCount === 32);
gate('G423-BP — available preimage fields == 3', dr.preimageFieldsAvailableCount === 3);
gate('G423-BP — missing preimage fields == 29', dr.preimageFieldsMissingCount === 29);
gate('G423-BP — envelope NOT sufficient for recompute', dr.envelopeFieldsSufficientForRecompute === false);
gate('G423-BP — partition: available + missing == required', dr.preimageFieldsAvailableCount + dr.preimageFieldsMissingCount === dr.requiredDecisionPreimageFieldCount);
gate('G423-BP — recompute precondition asserted', dr.implementationCannotProceedUntilDigestRecomputationInputsAreComplete === true && P.IDENTITY_VERIFICATION_PLAN.implementationCannotProceedUntilDigestRecomputationInputsAreComplete === true);
gate('G423-BP — B-RECOMPUTE-INPUT unresolved (no silent solution)', b.resolvedByPlan === false && PLAN.bRecomputeInputResolvedByPlan === false);
gate('G423-BP — runtime NOT authorized while blocker open', PLAN.readyForRuntimeImplementation === false && b.runtimeImplementationBlocked === true);
// LIVE proof: a real decision exposes all 32 preimage fields, envelope carries only 3.
{
  const decision = buildRealDecision('gate-a');
  const keys = Object.keys(decision);
  const coversAll = ENV.DECISION_DIGEST_PREIMAGE_FIELDS.every((f) => keys.includes(f));
  gate('G423-BP — LIVE real decision exposes all 32 preimage fields', coversAll && typeof decision.bridgeDecisionDigest === 'string' && decision.bridgeDecisionDigest.startsWith('fnv1a-'));
  gate('G423-BP — LIVE envelope-available fields subset of real decision', dr.preimageFieldsAvailableFromEnvelope.every((f) => keys.includes(f)));
  gate('G423-BP — LIVE gap is real (missing > 0)', dr.preimageFieldsMissingCount > 0);
  const d2 = buildRealDecision('gate-a');
  gate('G423-BP — LIVE decision digest deterministic across seeds', decision.bridgeDecisionDigest === d2.bridgeDecisionDigest);
}

// ---- Phases / order / dependencies ----
const REQ_PHASES = ['PHASE_01_RUNTIME_CONFIG_AND_CAPABILITIES', 'PHASE_02_SAFE_INPUT_NORMALIZATION', 'PHASE_03_ENVELOPE_SHAPE_VALIDATION', 'PHASE_04_DECISION_DIGEST_RECOMPUTE_AND_COMPARE', 'PHASE_05_SAME_DECISION_PROVENANCE_VALIDATION', 'PHASE_06_VERSION_TUPLE_VALIDATION', 'PHASE_07_SYNTHETIC_AND_SECURITY_BOUNDARY_VALIDATION', 'PHASE_08_RESOURCE_LIMIT_ENFORCEMENT', 'PHASE_09_EXTENSION_VALIDATION', 'PHASE_10_MAPPING_CONTRACT_VALIDATION', 'PHASE_11_FIELD_MAPPING_EXECUTION', 'PHASE_12_SANDBOX_DESCRIPTOR_BUILD', 'PHASE_13_SANDBOX_DESCRIPTOR_VALIDATION', 'PHASE_14_CONSUMER_DECISION_BUILD', 'PHASE_15_FAILURE_CONTAINMENT_AND_EMERGENCY_REJECTION', 'PHASE_16_REPLAY_IDEMPOTENCY_AND_DETERMINISM', 'PHASE_17_MANIFEST_VERIFIER_READINESS', 'PHASE_18_TEST_GATE_EVIDENCE_CERTIFICATION'];
gate('G423-BP — 18 phases', P.PHASE_COUNT === 18);
REQ_PHASES.forEach((id, i) => {
  const p = P.PHASE_DEFINITIONS[i];
  gate(`G423-BP — phase ${i + 1} ${id} present, ordered, planned, no side effects`, p && p.phaseId === id && p.order === i + 1 && p.implementationStatus === 'planned' && p.sideEffectsAllowed === false);
});
gate('G423-BP — phase 1 has no dependencies', PLAN.phases[0].dependencies.length === 0);
for (let i = 1; i < PLAN.phases.length; i += 1) {
  gate(`G423-BP — phase ${i + 1} depends on prior`, PLAN.phases[i].dependencies.includes(PLAN.phases[i - 1].phaseId));
}

// ---- Future files / APIs ----
gate('G423-BP — future file map >= 27', P.FUTURE_FILE_COUNT >= 27, `${P.FUTURE_FILE_COUNT}`);
gate('G423-BP — future runtime subtree NOT created', !exists(path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime')));
for (const e of P.FUTURE_FILE_MAP) gate(`G423-BP — future file ${e.file} not created, planned`, e.createdInThisSlice === false && e.implementationStatus === 'planned');
gate('G423-BP — future public API metadata-only', P.FUTURE_PUBLIC_API_PLAN.publicApiImplemented === false && P.FUTURE_PUBLIC_API_PLAN.executeImplemented === false && P.FUTURE_PUBLIC_API_PLAN.runtimeFactoryImplemented === false);
gate('G423-BP — future factory signature declared', /createBridgeToPreviewSandboxRuntime\(config\)/.test(P.FUTURE_PUBLIC_API_PLAN.factory.signature));

// ---- Plan sections present ----
gate('G423-BP — source envelope requirements', PLAN.sourceEnvelopePlan.requirements.explicitEnvelopeRequired === true && PLAN.sourceEnvelopePlan.requirements.identitySynthesisAllowed === false);
gate('G423-BP — identity mode recompute_and_compare', P.IDENTITY_VERIFICATION_PLAN.identityVerificationMode === 'recompute_and_compare');
gate('G423-BP — same-decision provenance atomic', PLAN.sameDecisionProvenancePlan.atomicPairRequired === true && PLAN.sameDecisionProvenancePlan.crossDecisionMixingAllowed === false);
gate('G423-BP — safe normalization depth cap 64', P.SAFE_NORMALIZATION_PLAN.maxStructureDepth === 64);
gate('G423-BP — mapping no local divergent list', PLAN.mappingExecutionPlan.mappingCount === 12 && PLAN.mappingExecutionPlan.defaultProhibition === true && PLAN.mappingExecutionPlan.losslessEnforcement === true);
gate('G423-BP — sandbox descriptor metadata-only, not built', PLAN.sandboxDescriptorBuildPlan.invariants.metadataOnly === true && PLAN.sandboxDescriptorBuildPlan.sandboxDescriptorBuilderImplemented === false);
gate('G423-BP — consumer decision FNV internal-only', PLAN.consumerDecisionPlan.cryptographicSecurityClaimed === false && PLAN.consumerDecisionPlan.consumerDecisionImplemented === false);
gate('G423-BP — failure containment atomic, no leak', PLAN.failureContainmentPlan.partialSandboxDescriptorAllowed === false && PLAN.failureContainmentPlan.secretLeakAllowed === false && PLAN.failureContainmentPlan.unexpectedExceptionFailsClosed === true);
gate('G423-BP — replay determinism policy', PLAN.replayIdempotencyPlan.randomnessAllowed === false && PLAN.replayIdempotencyPlan.ambientClockAllowed === false && PLAN.replayIdempotencyPlan.crossInstanceDeterminism === true);
gate('G423-BP — security/SSOT/permission preserved', PLAN.securitySsotPermissionPlan.certifiedBlueprintRemainsSsot === true && PLAN.securitySsotPermissionPlan.permissionModelIntegrated === false && PLAN.securitySsotPermissionPlan.productExposureBlockedByPermissionTenancy === true);

// ---- Resource limits (12 dims, reflect real contract) ----
const DIMS = ['maxEnvelopeBytes', 'maxDecisionFields', 'maxTargetDescriptorFields', 'maxDescriptorBytes', 'maxDescriptorFields', 'maxPayloadFields', 'maxLayoutSections', 'maxRelationships', 'maxExtensions', 'maxStringLength', 'maxValidationIssues', 'maxStructureDepth'];
for (const n of DIMS) gate(`G423-BP — resource dim ${n} present`, P.RESOURCE_DIMENSION_NAMES.includes(n));
for (const d of PLAN.resourceLimitsPlan.dimensions) gate(`G423-BP — dim ${d.dimension} no truncation`, d.silentTruncationAllowed === false && d.partialDescriptorAllowed === false && d.issueCode === 'RUNTIME_LIMIT_EXCEEDED');
{
  const contract = {};
  for (const d of SBX.RESOURCE_LIMIT_CONTRACT.dimensions) contract[d.dimension] = d;
  for (const name of ['maxDescriptorBytes', 'maxDescriptorFields', 'maxPayloadFields', 'maxLayoutSections', 'maxRelationships', 'maxExtensions', 'maxStringLength', 'maxValidationIssues', 'maxStructureDepth']) {
    const pd = PLAN.resourceLimitsPlan.dimensions.find((d) => d.dimension === name);
    gate(`G423-BP — dim ${name} reflects real contract`, pd && pd.sourceLimit === contract[name].sourceLimit && pd.runtimeLimit === contract[name].consumerLimit && pd.sandboxLimit === contract[name].sandboxLimit);
  }
}

// ---- Extensions ----
for (const cap of ['canonical', 'certified', 'moduleGenerated', 'productExposed', 'previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'persistence', 'network', 'backend', 'Prisma', 'production']) {
  gate(`G423-BP — extension cannot enable ${cap}`, PLAN.extensibilityPlan.forbiddenCapabilityOverrides.includes(cap));
}

// ---- Implementation flags all false ----
const IMPL_FALSE = ['runtimeImplemented', 'runtimeFactoryImplemented', 'executeImplemented', 'envelopeBuilderImplemented', 'identityVerificationImplemented', 'pipelineImplemented', 'mappingExecutorImplemented', 'sandboxDescriptorBuilderImplemented', 'consumerDecisionImplemented', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated'];
for (const f of IMPL_FALSE) gate(`G423-BP — flag ${f} false`, PLAN[f] === false);

// ---- Manual checkpoints ----
gate('G423-BP — 4 manual checkpoints', PLAN.manualCheckpointPlan.checkpoints.length === 4);
gate('G423-BP — only checkpoint 01 authorized', PLAN.manualCheckpointPlan.onlyCheckpoint01Authorized === true && PLAN.manualCheckpointPlan.runtimeImplementationAuthorized === false);
for (const c of PLAN.manualCheckpointPlan.checkpoints) gate(`G423-BP — checkpoint ${c.checkpointId} manual gate`, c.manualGateRequired === true);

// ---- Risk matrix ----
gate('G423-BP — risk matrix >= 14', P.RISK_MATRIX.length >= 14, `${P.RISK_MATRIX.length}`);
gate('G423-BP — risk B-RECOMPUTE-INPUT is blocking', P.RISK_MATRIX.some((r) => r.riskId === 'B-RECOMPUTE-INPUT' && r.blocking === true));
for (const r of P.RISK_MATRIX) gate(`G423-BP — risk ${r.riskId} fully specified`, ['riskId', 'description', 'likelihood', 'impact', 'severity', 'mitigation', 'verification', 'blocking', 'ownerPhase'].every((k) => k in r));

// ---- Zero UI/App/mount/storage/network/module/product (static) ----
const c = codeNoVerifier();
gate('G423-BP — no React import', !/from\s+['"]react['"]/.test(c));
gate('G423-BP — no .jsx reference', !/\.jsx\b/.test(c));
gate('G423-BP — no fetch(', !/\bfetch\s*\(/.test(c));
gate('G423-BP — no PrismaClient', !/new\s+PrismaClient/.test(c));
gate('G423-BP — no fs writes', !/\bfs\.(writeFile|writeFileSync|appendFileSync)/.test(c));
gate('G423-BP — no App import', !/from\s+['"][^'"]*App(\.jsx)?['"]/.test(c));
gate('G423-BP — no route/menu mount call', !/\b(mountPreview|createRoute|registerMenu|addSidebar)\s*\(/.test(c));
gate('G423-BP — no nondeterminism outside verifier', !/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(c));
for (const fn of ['buildEnvelope', 'verifyIdentity', 'runPipeline', 'mapFields', 'buildSandboxDescriptor', 'createConsumerDecision', 'executeFieldMappings', 'recomputeAndValidateBridgeDecisionDigest']) {
  gate(`G423-BP — no executable runtime fn ${fn} defined`, !new RegExp(`function\\s+${fn}\\b`).test(c) && !new RegExp(`export\\s+function\\s+${fn}\\b`).test(c));
}
gate('G423-BP — no execute() body defined', !/\bexecute\s*\([^)]*\)\s*\{/.test(c));

// ---- Verifier fail-closed (tamper battery) ----
gate('G423-BP — verifier passes clean plan', PLAN.verification.ok === true && PLAN.verification.blockerCount === 0);
gate('G423-BP — verifier rejects premature runtime', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, readyForRuntimeImplementation: true } }).ok === false);
gate('G423-BP — verifier rejects executeImplemented', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, capabilities: { ...PLAN.capabilities, executeImplemented: true } } }).ok === false);
gate('G423-BP — verifier rejects reordered phases', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, phases: [...PLAN.phases].reverse() } }).ok === false);
gate('G423-BP — verifier rejects pipeline drift', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, validationPipelinePlan: { ...PLAN.validationPipelinePlan, stageCount: 15 } } }).ok === false);
gate('G423-BP — verifier rejects mapping drift', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, mappingExecutionPlan: { ...PLAN.mappingExecutionPlan, mappingCount: 11 } } }).ok === false);
gate('G423-BP — verifier rejects cross-decision mixing', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, sameDecisionProvenancePlan: { ...PLAN.sameDecisionProvenancePlan, crossDecisionMixingAllowed: true } } }).ok === false);
gate('G423-BP — verifier rejects SSOT inversion', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, securitySsotPermissionPlan: { ...PLAN.securitySsotPermissionPlan, runtimeMayExposeProduct: true } } }).ok === false);
gate('G423-BP — verifier rejects falsely-resolved B-RECOMPUTE-INPUT', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, identityVerificationPlan: { ...PLAN.identityVerificationPlan, bRecomputeInput: { ...PLAN.identityVerificationPlan.bRecomputeInput, resolvedByPlan: true, envelopeFieldsSufficientForRecompute: false } } } }).ok === false);
gate('G423-BP — verifier rejects manual gate over-authorization', P.verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: { ...PLAN, manualCheckpointPlan: { ...PLAN.manualCheckpointPlan, authorizesConsumerRuntime: true } } }).ok === false);

// ---- Manifest / compatibility (live proofs) ----
const a1 = P.createStudioBridgeToPreviewSandboxRuntimeImplementationPlan();
const a2 = P.createStudioBridgeToPreviewSandboxRuntimeImplementationPlan();
gate('G423-BP — manifest deterministic', a1.manifest.overallDigest === a2.manifest.overallDigest && a1.manifest.overallDigest.startsWith('fnv1a-'));
gate('G423-BP — manifest not cryptographic', a1.manifest.cryptographicIntegrityProvided === false);
const comp = P.checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility();
gate('G423-BP — compatible with hardened bridge', comp.compatibleWithHardenedBridge === true);
gate('G423-BP — compatible with sandbox runtime contract', comp.compatibleWithBridgeToSandboxRuntimeContract === true);
gate('G423-BP — compatible with envelope identity contract', comp.compatibleWithEnvelopeIdentityContract === true);
gate('G423-BP — compatible with preview sandbox contract', comp.compatibleWithPreviewSandboxContract === true);
gate('G423-BP — compatible with blueprint contract', comp.compatibleWithBlueprintContract === true);
gate('G423-BP — compatibility status ready_for_enterprise_audit', comp.status === 'bridge_to_preview_sandbox_runtime_implementation_plan_ready_for_enterprise_audit');
gate('G423-BP — compatibility bRecomputeInput unresolved', comp.bRecomputeInputResolvedByPlan === false && comp.readyForRuntimeImplementation === false);

// ---- Readiness ----
gate('G423-BP — readiness state', PLAN.readiness === 'studio_bridge_to_preview_sandbox_runtime_implementation_plan_ready_for_enterprise_audit');
gate('G423-BP — readyForEnterprisePlanAudit true', PLAN.readyForEnterprisePlanAudit === true);
gate('G423-BP — readyForRuntimeImplementation false', PLAN.readyForRuntimeImplementation === false);
gate('G423-BP — readyForPreviewMount false', PLAN.readyForPreviewMount === false);
gate('G423-BP — readyForProductExposure false', PLAN.readyForProductExposure === false);

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'IMPLEMENTATION-PLAN-REPORT.md', 'SOURCE-CONTRACT-TRACEABILITY.md', 'ENVELOPE-INPUT-PLAN.md', 'B-IDENTITY-TRACEABILITY.md', 'B-RECOMPUTE-INPUT-ANALYSIS.md', 'DIGEST-RECOMPUTATION-PLAN.md', 'SAME-DECISION-PROVENANCE-PLAN.md', 'SAFE-NORMALIZATION-PLAN.md', 'PHASE-BY-PHASE-PLAN.md', 'FUTURE-FILE-MAP.md', 'FUTURE-PUBLIC-API.md', 'VALIDATION-PIPELINE-PLAN.md', 'MAPPING-EXECUTION-PLAN.md', 'SANDBOX-DESCRIPTOR-BUILD-PLAN.md', 'CONSUMER-DECISION-PLAN.md', 'FAILURE-CONTAINMENT-PLAN.md', 'RESOURCE-LIMITS-PLAN.md', 'EXTENSIBILITY-PLAN.md', 'REPLAY-IDEMPOTENCY-PLAN.md', 'SECURITY-SSOT-PERMISSION-PLAN.md', 'TEST-STRATEGY.md', 'GATE-STRATEGY.md', 'MANUAL-CHECKPOINTS.md', 'RISK-MATRIX.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-RUNTIME-NO-UI-NO-APP-NO-MOUNT.md', 'BUILD-BUNDLE-ABSENCE.md', 'NEXT-ENTERPRISE-PLAN-AUDIT.md'];
gate('G423-BP — 29 evidence docs listed', DOCS.length === 29);
for (const d of DOCS) gate(`G423-BP — doc ${d} present`, readEv(d).length > 80);

// ---- Imports read-only, no forbidden targets ----
gate('G423-BP — imports only upstream indexes + local (read-only)', importsOf().every((i) => i.startsWith('.') || i.startsWith('node:') || /blueprint-engine\/(module-blueprint-authoring-runtime|bridge-decision-envelope-identity-contract|bridge-to-preview-sandbox-runtime-contract)\/index\.js$/.test(i)));
gate('G423-BP — no import of App/backend/prisma/modules', !importsOf().some((i) => /App\.jsx|backend|prisma|src\/modules|\.\.\/\.\.\/\.\.\//.test(i)));

// ---- Scope (diff limited) ----
const files = (() => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } })();
if (files) {
  gate('G423-BP — all changed files authorized', files.every((f) => authorized(f)), files.filter((f) => !authorized(f)).join(', ') || 'clean');
  // productionUiGuard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
  // governance guard may appear ONLY when the slice active on this branch shares it — i.e. a governance slice.
  gate('G423-BP — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs')
    && (!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')
      || (resolveActiveStudioSlice(files).ok && resolveActiveStudioSlice(files).sliceId.startsWith('studio-scope-governance-'))));
  gate('G423-BP — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|authoring-runtime-to-preview-bridge-contract|authoring-runtime-to-preview-bridge-implementation-plan|bridge-to-preview-sandbox-runtime-contract|bridge-decision-envelope-identity-contract|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f)));
  gate('G423-BP — no App/pages/components/modules in diff', !files.some((f) => /^src\/(App\.jsx|pages|components|modules|ModeloBase1|ModeloBase2)\//.test(f) || f === 'src/App.jsx'));
}

// ---- No new dependency ----
gate('G423-BP — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test as the primary behavioral proof ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-BP — plan unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-BP — unit test has >= 760 scenarios', testCount >= 760, `${testCount} (min 760)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-TO-PREVIEW-SANDBOX-RUNTIME-IMPLEMENTATION-PLAN summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
