#!/usr/bin/env node
/**
 * Gate G423-STUDIO-...-IMPLEMENTATION-PLAN-ALIGNMENT-AMENDMENT — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, dev-only AMENDMENT that aligns the merged
 * Implementation Plan (#489) to the audited Core Envelope v2 contract (#490): Option A superseded, Option B
 * selected, B-RECOMPUTE-INPUT resolved at plan level (32/32/0 from the real contract, no reintroduced gap), the
 * new pre-runtime blocker B-CORE-ENVELOPE-BUILDER declared open, CHECKPOINT_02 blocked, runtime false, upstream
 * plan/contract files unchanged, and no UI/App/mount/storage/backend/module/product.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan');
const CORE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const allFiles = () => walk(DIR, /.*/);
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyImplementationPlanAlignmentAmendment\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const A = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const PLAN = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href);
const CORE = await import(pathToFileURL(path.join(CORE_DIR, 'index.js')).href);
const AM = A.createStudioImplementationPlanAlignmentAmendment();

// ---- Artifacts ----
gate('G423-PA — subtree exists', exists(DIR));
gate('G423-PA — test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-PA — gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-PA — evidence dir exists', exists(EV));
gate('G423-PA — only .js files', allFiles().every((f) => /\.js$/.test(f)), `${allFiles().length}`);
gate('G423-PA — >= 25 modules', jsFiles().length >= 25, `${jsFiles().length}`);
gate('G423-PA — index composes', AM.kind === 'studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment');

// ---- Registry ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-PA — registry subtree path', /\^src\\\/studio\\\/blueprint-engine\\\/bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\\\//.test(reg));
gate('G423-PA — registry test path', /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\\\.test\\\.js\$/.test(reg));
gate('G423-PA — registry gate path', /\^scripts\\\/gates\\\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\\\.mjs\$/.test(reg));
gate('G423-PA — registry docs path', /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\\\//.test(reg));

// ---- Upstreams intact ----
gate('G423-PA — upstream plan present', exists(PLAN_DIR));
gate('G423-PA — upstream core contract present', exists(CORE_DIR));
gate('G423-PA — upstream v1 envelope present', exists(path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract')));

// ---- Source plan traceability (real Option A) ----
const sp = A.SOURCE_PLAN_TRACEABILITY;
gate('G423-PA — source plan version real', sp.originalPlanVersion === PLAN.PLAN_VERSION);
gate('G423-PA — source Option A captured', sp.originalSelectedRecomputeOption === 'A');
gate('G423-PA — source resolved-by-plan false', sp.originalBRecomputeResolvedByPlan === false);
gate('G423-PA — source gap 32/3/29', sp.originalRequiredPreimageFieldCount === 32 && sp.originalAvailablePreimageFieldCount === 3 && sp.originalMissingPreimageFieldCount === 29);
gate('G423-PA — source envelope kind v1', sp.originalSourceEnvelopeKind === 'BridgeDecisionIdentityEnvelope');
gate('G423-PA — source phases 18', sp.originalPhaseCount === 18);
gate('G423-PA — source runtime false', sp.originalReadyForRuntimeImplementation === false);

// ---- Core envelope v2 traceability (real 32/0/0) ----
const ct = A.CORE_ENVELOPE_CONTRACT_TRACEABILITY;
gate('G423-PA — core contract version real', ct.coreEnvelopeContractVersion === CORE.CORE_ENVELOPE_CONTRACT_VERSION);
gate('G423-PA — core tag v2', ct.coreEnvelopeVersionTag === 'v2');
gate('G423-PA — core field count 32', ct.coreFieldCount === 32);
gate('G423-PA — core closure by contract', ct.bRecomputeClosureState === 'CLOSED_BY_CONTRACT');
gate('G423-PA — core missing/extra 0', ct.missingPreimageFieldCount === 0 && ct.extraPreimageFieldCount === 0);
gate('G423-PA — core required equals real', JSON.stringify([...ct.requiredCoreFields].sort()) === JSON.stringify([...CORE.REQUIRED_CORE_FIELDS].sort()));
for (const f of CORE.REAL_DECISION_DIGEST_PREIMAGE_FIELDS) gate(`G423-PA — preimage ${f} in aligned required core`, ct.requiredCoreFields.includes(f));

// ---- Supersession ----
const su = A.SUPERSESSION_CONTRACT;
gate('G423-PA — Option A superseded', su.supersedesSelectedArchitecture === 'OPTION_A_MINIMUM_PREIMAGE_FIELDS');
gate('G423-PA — Option B replacement', su.replacementArchitecture === 'OPTION_B_FULL_BRIDGE_DECISION_CORE');
gate('G423-PA — envelope kind superseded', su.supersedesSourceEnvelopeKind === 'bridge_decision_identity_envelope' && su.replacementSourceEnvelopeKind === 'bridge_decision_core_envelope');
gate('G423-PA — historical plan immutable', su.historicalPlanRemainsImmutable === true);
gate('G423-PA — source plan files not modified', su.sourcePlanFilesModified === false);
gate('G423-PA — core contract files not modified', su.coreEnvelopeContractFilesModified === false);
gate('G423-PA — additive', su.additive === true);
gate('G423-PA — amendment selects Option B', AM.selectedArchitecture === 'OPTION_B_FULL_BRIDGE_DECISION_CORE');

// ---- Source envelope alignment ----
const se = A.SOURCE_ENVELOPE_ALIGNMENT;
gate('G423-PA — future input BridgeDecisionCoreEnvelope', se.futureInputName === 'BridgeDecisionCoreEnvelope');
gate('G423-PA — envelope fields equal core contract', JSON.stringify([...se.envelopeFields].sort()) === JSON.stringify([...CORE.CORE_ENVELOPE_FIELDS].sort()));
gate('G423-PA — v1 runtime input rejected', se.requirements.v1RuntimeInputAllowed === false);
gate('G423-PA — implicit upgrade rejected', se.requirements.implicitV1ToV2UpgradeAllowed === false);
gate('G423-PA — core + full preimage required', se.requirements.bridgeDecisionCoreRequired === true && se.requirements.fullPreimageRequired === true);
gate('G423-PA — core synthesis forbidden', se.requirements.coreSynthesisAllowed === false);

// ---- Digest recomputation alignment ----
const dr = A.DIGEST_RECOMPUTATION_ALIGNMENT;
gate('G423-PA — recompute required 32', dr.requiredPreimageFieldCount === 32);
gate('G423-PA — recompute available 32', dr.availablePreimageFieldCount === 32);
gate('G423-PA — recompute missing 0', dr.missingPreimageFieldCount === 0);
gate('G423-PA — recompute extra 0', dr.extraPreimageFieldCount === 0);
gate('G423-PA — no local preimage list', dr.noLocalDuplicatedPreimageList === true);
gate('G423-PA — bRecomputeInputResolvedByPlan true', dr.bRecomputeInputResolvedByPlan === true);
gate('G423-PA — recompute not implemented', dr.digestRecomputeImplemented === false);
gate('G423-PA — recompute algorithm 8 steps', dr.algorithm.length === 8);

// ---- B-RECOMPUTE transition ----
const tr = A.B_RECOMPUTE_INPUT_TRANSITION;
gate('G423-PA — transition previous OPEN', tr.previousState === 'OPEN');
gate('G423-PA — transition contract closed', tr.contractClosureState === 'CLOSED_BY_CONTRACT');
gate('G423-PA — transition current RESOLVED_AT_PLAN_LEVEL', tr.currentState === 'RESOLVED_AT_PLAN_LEVEL');
gate('G423-PA — transition original gap real', tr.originalPlanGap.required === 32 && tr.originalPlanGap.available === 3 && tr.originalPlanGap.missing === 29);
gate('G423-PA — transition core gap real', tr.coreContractGap.missing === 0 && tr.coreContractGap.extra === 0);
gate('G423-PA — transition runtime still false', tr.runtimeImplementationStillFalse === true);

// ---- Phase / file / API / pipeline / mapping alignment ----
const pa = A.PHASE_ALIGNMENT;
gate('G423-PA — 18 phases', pa.originalPhaseCount === 18);
gate('G423-PA — phase04 consumes core+digest', pa.phase04ConsumesCore === true && pa.phase04ConsumesDigest === true);
gate('G423-PA — reconstruction removed', pa.reconstructionOf29MissingFieldsRemoved === true);
gate('G423-PA — all phases planned', pa.allPhasesRemainPlanned === true && pa.allPhasesSideEffectsFalse === true);
for (const p of pa.originalPhaseIds) gate(`G423-PA — phase ${p} from real plan`, PLAN.PHASE_IDS.includes(p));
const fm = A.FUTURE_FILE_MAP_ALIGNMENT;
gate('G423-PA — future files 27->28', fm.originalFutureFileCount === 27 && fm.alignedFutureFileCount === 28);
gate('G423-PA — added file not created', fm.addedFutureFile.createdInThisSlice === false);
gate('G423-PA — no runtime file created', fm.noRuntimeFileCreated === true);
const api = A.FUTURE_PUBLIC_API_ALIGNMENT;
gate('G423-PA — API v2-only', api.executeInputKind === 'bridge_decision_core_envelope' && api.v1InputRejected === true && api.v2InputRequired === true);
gate('G423-PA — API not implemented', api.publicApiImplemented === false && api.executeImplemented === false && api.runtimeFactoryImplemented === false);
const pl = A.PIPELINE_ALIGNMENT;
gate('G423-PA — pipeline preflight-then-17', pl.order === 'core_envelope_v2_preflight_then_17_stage_consumer_pipeline');
gate('G423-PA — preflight 5 stages', pl.preflightStageCount === 5);
gate('G423-PA — consumer 17 stages', pl.consumerPipelineStageCount === 17);
gate('G423-PA — no substitution, no ambiguity', pl.preflightSubstitutesConsumerStages === false && pl.noDuplicationNoAmbiguity === true);
for (const s of pl.preflightStages) gate(`G423-PA — preflight stage ${s}`, typeof s === 'string' && s.length > 0);
const ma = A.MAPPING_ALIGNMENT;
gate('G423-PA — mappings 12', ma.mappingCount === 12 && ma.mappingCount === PLAN.MAPPING_EXECUTION_PLAN.mappingCount);
gate('G423-PA — mapping source core.targetDescriptor', ma.mappingSource === 'bridgeDecisionCore.targetDescriptor');
gate('G423-PA — no digest mapping', ma.noDigestMapping === true && ma.noMappingFromEnvelopeMetadata === true);

// ---- Failure / limits ----
const fc = A.FAILURE_CONTAINMENT_ALIGNMENT;
for (const c of ['RUNTIME_CORE_ENVELOPE_REQUIRED', 'RUNTIME_CORE_DIGEST_MISMATCH', 'RUNTIME_V1_ENVELOPE_NOT_ACCEPTED', 'RUNTIME_CORE_ENVELOPE_VERSION_UNSUPPORTED']) gate(`G423-PA — failure issue ${c}`, fc.addedIssueCodes.includes(c));
gate('G423-PA — failure atomic no partial', fc.atomicDecision === true && fc.partialDescriptorAllowed === false);
const rl = A.RESOURCE_LIMITS_ALIGNMENT;
gate('G423-PA — limits consume real values', rl.consumesRealContractValues === true && rl.divergentLimitsKept === false);
gate('G423-PA — maxCoreFields derived 32', rl.dimensions.find((d) => d.dimension === 'maxCoreFields').value === CORE.CORE_FIELD_COUNT);
gate('G423-PA — maxTargetDescriptorFields derived', rl.dimensions.find((d) => d.dimension === 'maxTargetDescriptorFields').value === CORE.REAL_TARGET_DESCRIPTOR_FIELDS_REF.length);

// ---- Test/gate strategy ----
gate('G423-PA — future test >=900', A.TEST_STRATEGY_ALIGNMENT.futureRuntimeTestMinAsserts >= 900);
gate('G423-PA — future gate >=280', A.GATE_STRATEGY_ALIGNMENT.futureRuntimeGateMinChecks >= 280);
gate('G423-PA — runtime test not created', A.TEST_STRATEGY_ALIGNMENT.runtimeTestCreatedInThisSlice === false);

// ---- B-CORE-ENVELOPE-BUILDER ----
const bb = A.CORE_ENVELOPE_BUILDER_REQUIREMENT;
gate('G423-PA — builder blocker declared', bb.blockerId === 'B-CORE-ENVELOPE-BUILDER');
gate('G423-PA — builder required before runtime', bb.coreEnvelopeBuilderContractRequiredBeforeRuntime === true);
gate('G423-PA — builder contract not exists', bb.coreEnvelopeBuilderContractExists === false);
gate('G423-PA — builder blocker open', bb.bCoreEnvelopeBuilderOpen === true);
gate('G423-PA — builder blocks runtime', bb.blocksRuntime === true);
gate('G423-PA — builder next contract named', bb.nextRequiredContract === 'Bridge Decision Core Envelope Builder Contract');
gate('G423-PA — builder does not authorize runtime', bb.readyForRuntimeImplementation === false);

// ---- Manual checkpoints ----
const mc = A.MANUAL_CHECKPOINT_ALIGNMENT;
const byId = {}; for (const c of mc.checkpoints) byId[c.checkpointId] = c.state;
gate('G423-PA — CHECKPOINT_01 completed', byId.CHECKPOINT_01_PLAN_ENTERPRISE_AUDIT === 'completed');
gate('G423-PA — CHECKPOINT_01_ALIGNMENT pending', byId.CHECKPOINT_01_ALIGNMENT_ENTERPRISE_AUDIT === 'pending');
gate('G423-PA — CHECKPOINT_02 blocked', byId.CHECKPOINT_02_PRE_RUNTIME_IMPLEMENTATION_AUTHORIZATION === 'blocked');
gate('G423-PA — authorizes only alignment', mc.authorizesPlanAlignment === true && mc.authorizesBuilderContract === false && mc.authorizesRuntimeImplementation === false && mc.authorizesProductExposure === false);

// ---- Risk matrix ----
gate('G423-PA — B-RECOMPUTE resolved_at_plan_level', A.RISK_MATRIX_ALIGNMENT.bRecomputeInput.state === 'resolved_at_plan_level');
gate('G423-PA — B-RECOMPUTE blocks runtime not alignment', A.RISK_MATRIX_ALIGNMENT.bRecomputeInput.blockingForRuntime === true && A.RISK_MATRIX_ALIGNMENT.bRecomputeInput.blockingForPlanAlignment === false);
gate('G423-PA — risk B-CORE-ENVELOPE-BUILDER blocking', A.RISK_MATRIX_ALIGNMENT.risks.some((r) => r.riskId === 'B-CORE-ENVELOPE-BUILDER' && r.blocking === true));
for (const r of A.RISK_MATRIX_ALIGNMENT.risks) gate(`G423-PA — risk ${r.riskId} specified`, ['riskId', 'description', 'mitigation', 'verification', 'blocking', 'ownerPhase'].every((k) => k in r));

// ---- Capabilities / readiness ----
const IMPL_FALSE = ['runtimeImplemented', 'runtimeFactoryImplemented', 'executeImplemented', 'coreEnvelopeBuilderImplemented', 'coreExtractorImplemented', 'identityVerificationImplemented', 'digestRecomputeImplemented', 'mappingExecutorImplemented', 'sandboxDescriptorBuilderImplemented', 'consumerDecisionImplemented', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed'];
for (const f of IMPL_FALSE) gate(`G423-PA — flag ${f} false`, AM[f] === false);
gate('G423-PA — readiness state', AM.readiness === 'studio_bridge_to_preview_sandbox_runtime_plan_alignment_ready_for_enterprise_audit');
gate('G423-PA — ready for alignment audit', AM.readyForEnterpriseAlignmentAudit === true);
gate('G423-PA — not ready for builder contract', AM.readyForCoreEnvelopeBuilderContract === false);
gate('G423-PA — not ready for runtime', AM.readyForRuntimeImplementation === false);

// ---- Verifier tamper battery ----
gate('G423-PA — verifier passes clean', AM.verification.ok === true && AM.verification.blockerCount === 0);
gate('G423-PA — verifier rejects Option A selected', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, selectedArchitecture: 'OPTION_A_MINIMUM_PREIMAGE_FIELDS' } }).ok === false);
gate('G423-PA — verifier rejects premature runtime', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, readyForRuntimeImplementation: true } }).ok === false);
gate('G423-PA — verifier rejects builder ignored', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, coreEnvelopeBuilderRequirement: { ...AM.coreEnvelopeBuilderRequirement, bCoreEnvelopeBuilderOpen: false } } }).ok === false);
gate('G423-PA — verifier rejects source plan modified', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, capabilities: { ...AM.capabilities, sourcePlanFilesModified: true } } }).ok === false);
gate('G423-PA — verifier rejects v1 runtime input', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, sourceEnvelopeAlignment: { ...AM.sourceEnvelopeAlignment, requirements: { ...AM.sourceEnvelopeAlignment.requirements, v1RuntimeInputAllowed: true } } } }).ok === false);
gate('G423-PA — verifier rejects reintroduced gap', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, digestRecomputationAlignment: { ...AM.digestRecomputationAlignment, missingPreimageFieldCount: 29 } } }).ok === false);
gate('G423-PA — verifier rejects premature builder contract', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, readyForCoreEnvelopeBuilderContract: true } }).ok === false);
gate('G423-PA — verifier rejects wrong mapping source', A.verifyImplementationPlanAlignmentAmendment({ amendment: { ...AM, mappingAlignment: { ...AM.mappingAlignment, mappingSource: 'envelope.metadata' } } }).ok === false);

// ---- Manifest / compatibility ----
const a1 = A.createStudioImplementationPlanAlignmentAmendment();
const a2 = A.createStudioImplementationPlanAlignmentAmendment();
gate('G423-PA — manifest deterministic', a1.manifest.overallDigest === a2.manifest.overallDigest && a1.manifest.overallDigest.startsWith('fnv1a-'));
const comp = A.checkImplementationPlanAlignmentCompatibility();
gate('G423-PA — compatible with original plan', comp.compatibleWithOriginalImplementationPlan === true);
gate('G423-PA — compatible with core v2', comp.compatibleWithCoreEnvelopeContractV2 === true);
gate('G423-PA — compatible with v1', comp.compatibleWithIdentityEnvelopeV1 === true);
gate('G423-PA — compat resolved + builder open', comp.bRecomputeInputResolvedByPlan === true && comp.bCoreEnvelopeBuilderOpen === true);
gate('G423-PA — compat runtime blocked', comp.readyForRuntimeImplementation === false);
gate('G423-PA — compat status', comp.status === 'bridge_to_preview_sandbox_runtime_plan_alignment_ready_for_enterprise_audit');

// ---- No runtime (static) ----
const code = codeNoVerifier();
gate('G423-PA — no React import', !/from\s+['"]react['"]/.test(code));
gate('G423-PA — no .jsx', !/\.jsx\b/.test(code));
gate('G423-PA — no fetch(', !/\bfetch\s*\(/.test(code));
gate('G423-PA — no PrismaClient', !/new\s+PrismaClient/.test(code));
gate('G423-PA — no fs writes', !/\bfs\.(writeFile|writeFileSync|appendFileSync)/.test(code));
gate('G423-PA — no execute() body', !/\bexecute\s*\([^)]*\)\s*\{/.test(code));
gate('G423-PA — no nondeterminism outside verifier', !/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(code));
for (const fn of ['buildCoreEnvelope', 'extractCore', 'recomputeDigest', 'verifyIdentity', 'mountPreview']) gate(`G423-PA — no runtime fn ${fn} defined`, !new RegExp(`function\\s+${fn}\\b`).test(code));

// ---- Imports read-only ----
gate('G423-PA — imports only upstream indexes + local', importsOf().every((i) => i.startsWith('.') || i.startsWith('node:') || /blueprint-engine\/(module-blueprint-authoring-runtime|bridge-to-preview-sandbox-runtime-implementation-plan|bridge-decision-core-envelope-contract)\/index\.js$/.test(i)));

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'PLAN-ALIGNMENT-AMENDMENT-REPORT.md', 'SOURCE-PLAN-TRACEABILITY.md', 'CORE-ENVELOPE-V2-TRACEABILITY.md', 'OPTION-A-SUPERSESSION.md', 'OPTION-B-SELECTION.md', 'SOURCE-ENVELOPE-ALIGNMENT.md', 'DIGEST-RECOMPUTATION-ALIGNMENT.md', 'B-RECOMPUTE-INPUT-TRANSITION.md', 'PHASE-ALIGNMENT.md', 'FUTURE-FILE-MAP-ALIGNMENT.md', 'FUTURE-PUBLIC-API-ALIGNMENT.md', 'PIPELINE-ALIGNMENT.md', 'MAPPING-ALIGNMENT.md', 'FAILURE-CONTAINMENT-ALIGNMENT.md', 'RESOURCE-LIMITS-ALIGNMENT.md', 'TEST-STRATEGY-ALIGNMENT.md', 'GATE-STRATEGY-ALIGNMENT.md', 'RISK-MATRIX-ALIGNMENT.md', 'B-CORE-ENVELOPE-BUILDER.md', 'MANUAL-CHECKPOINT-ALIGNMENT.md', 'READINESS-TRANSITION.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-RUNTIME-NO-BUILDER-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-SCALABILITY-RISK-NOTES.md', 'NEXT-ENTERPRISE-ALIGNMENT-AUDIT.md'];
gate('G423-PA — 27 evidence docs listed', DOCS.length === 27);
for (const d of DOCS) gate(`G423-PA — doc ${d}`, readEv(d).length > 60);

// ---- Scope + upstream immutability in diff ----
const files = (() => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } })();
if (files) {
  gate('G423-PA — all changed files authorized', files.every((f) => authorized(f)), files.filter((f) => !authorized(f)).join(', ') || 'clean');
  gate('G423-PA — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'));
  gate('G423-PA — source plan subtree unchanged', !files.some((f) => f.startsWith('src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan/')));
  gate('G423-PA — core contract subtree unchanged', !files.some((f) => f.startsWith('src/studio/blueprint-engine/bridge-decision-core-envelope-contract/')));
  gate('G423-PA — no App/pages/components/modules in diff', !files.some((f) => /^src\/(pages|components|modules|ModeloBase1|ModeloBase2)\//.test(f) || f === 'src/App.jsx'));
}

// ---- No new dependency ----
gate('G423-PA — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-PA — amendment unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-PA — unit test has >= 720 scenarios', testCount >= 720, `${testCount} (min 720)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-IMPLEMENTATION-PLAN-ALIGNMENT-AMENDMENT summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
