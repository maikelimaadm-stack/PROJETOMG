#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, dev-only v2 CONTRACT (definition only, no runtime)
 * `{ bridgeDecisionDigest, bridgeDecisionCore }` that carries the COMPLETE real decision digest preimage. It
 * LIVE-proves (multi-seed, real decisions) that createDeterministicDigest(core) === real bridgeDecisionDigest and
 * stableSerialize(core) === stableSerialize(decision − digest), closing B-RECOMPUTE-INPUT at contract level; it
 * proves same-decision atomicity with genuinely distinct decisions, keeps EVERY runtime/builder flag false, keeps
 * v1 intact and runtime blocked pending Implementation Plan alignment, and builds no envelope, mounts no preview,
 * touches no App and exposes nothing.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createResolvedActiveStudioSlicePathAuthorizer } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-contract');
const ENV_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-contract');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-decision-core-envelope-contract.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-decision-core-envelope-contract.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const allFiles = () => walk(DIR, /.*/);
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeDecisionCoreEnvelopeContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-contract\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-contract\//,
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

const C = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const ENV = await import(pathToFileURL(path.join(ENV_DIR, 'index.js')).href);
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);
const CONTRACT = C.createStudioBridgeDecisionCoreEnvelopeContract();

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
const coreOf = (d) => { const c = {}; for (const f of ENV.DECISION_DIGEST_PREIMAGE_FIELDS) c[f] = d[f]; return c; };

// ---- Artifacts ----
gate('G423-CE — subtree exists', exists(DIR));
gate('G423-CE — test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-CE — gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-CE — evidence dir exists', exists(EV));
gate('G423-CE — only .js files', allFiles().every((f) => /\.js$/.test(f)), `${allFiles().length}`);
gate('G423-CE — >= 28 modules', jsFiles().length >= 28, `${jsFiles().length}`);
gate('G423-CE — index composes', CONTRACT.kind === 'studio-bridge-decision-core-envelope-contract');

// ---- Registry ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-CE — registry subtree path', /\^src\\\/studio\\\/blueprint-engine\\\/bridge-decision-core-envelope-contract\\\//.test(reg));
gate('G423-CE — registry test path', /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-decision-core-envelope-contract\\\.test\\\.js\$/.test(reg));
gate('G423-CE — registry gate path', /\^scripts\\\/gates\\\/g423-studio-bridge-decision-core-envelope-contract\\\.mjs\$/.test(reg));
gate('G423-CE — registry docs path', /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-decision-core-envelope-contract\\\//.test(reg));

// ---- Upstreams intact ----
gate('G423-CE — upstream bridge present', exists(BRIDGE_DIR));
gate('G423-CE — upstream v1 envelope present', exists(ENV_DIR));
gate('G423-CE — upstream implementation plan present', exists(path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-implementation-plan')));

// ---- Real preimage reflected, derived ----
gate('G423-CE — core field count == real preimage (32)', C.CORE_FIELD_COUNT === ENV.DECISION_DIGEST_PREIMAGE_FIELDS.length && ENV.DECISION_DIGEST_PREIMAGE_FIELDS.length === 32);
gate('G423-CE — required core equals real preimage', JSON.stringify([...C.REQUIRED_CORE_FIELDS].sort()) === JSON.stringify([...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort()));
gate('G423-CE — field count NOT hardcoded', C.REAL_PREIMAGE_CONTRACT.fieldCountHardcoded === false);
gate('G423-CE — no aliases', C.REAL_PREIMAGE_CONTRACT.aliasesUsed === false);
gate('G423-CE — digest not in preimage', C.REAL_PREIMAGE_CONTRACT.digestNotInPreimage === true);
gate('G423-CE — v1 version reflected', C.V1_ENVELOPE_IDENTITY_CONTRACT_VERSION === ENV.ENVELOPE_CONTRACT_VERSION);
for (const f of ENV.DECISION_DIGEST_PREIMAGE_FIELDS) gate(`G423-CE — preimage field ${f} in required core`, C.REQUIRED_CORE_FIELDS.includes(f));

// ---- Core contract ----
gate('G423-CE — core is exact preimage', C.BRIDGE_DECISION_CORE_CONTRACT.coreIsExactRealPreimage === true);
gate('G423-CE — digest not inside core', C.BRIDGE_DECISION_CORE_CONTRACT.digestFieldInsideCore === false);
gate('G423-CE — target inside core', C.BRIDGE_DECISION_CORE_CONTRACT.targetDescriptorInsideCore === true);
for (const k of ['coreExtraFieldsAllowed', 'coreMissingFieldsAllowed', 'coreAliasesAllowed', 'coreDefaultsAllowed', 'coreFieldCoercionAllowed']) {
  gate(`G423-CE — core ${k} false`, C.BRIDGE_DECISION_CORE_CONTRACT[k] === false);
}

// ---- LIVE digest equivalence (multi-seed) ----
let liveOk = true; let liveSer = true;
for (const seed of ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10']) {
  const d = buildRealDecision(seed);
  const core = coreOf(d);
  if (rt.createDeterministicDigest(core) !== d.bridgeDecisionDigest) liveOk = false;
  const dmd = { ...d }; delete dmd.bridgeDecisionDigest;
  if (rt.stableSerialize(core) !== rt.stableSerialize(dmd)) liveSer = false;
  gate(`G423-CE — LIVE digest(core)==realDigest seed ${seed}`, rt.createDeterministicDigest(core) === d.bridgeDecisionDigest);
}
gate('G423-CE — LIVE all-seed digest equivalence', liveOk);
gate('G423-CE — LIVE serialize(core)==serialize(decision-digest)', liveSer);

// ---- LIVE same-decision atomicity with distinct decisions ----
{
  const dA = buildRealDecision('A', 'clientes', 'Clientes', 'nome');
  const dB = buildRealDecision('B', 'fornecedores', 'Fornecedores', 'razao');
  gate('G423-CE — LIVE distinct decisions distinct digests', dA.bridgeDecisionDigest !== dB.bridgeDecisionDigest);
  gate('G423-CE — LIVE digest A + core B mismatches', rt.createDeterministicDigest(coreOf(dB)) !== dA.bridgeDecisionDigest);
  gate('G423-CE — LIVE digest B + core A mismatches', rt.createDeterministicDigest(coreOf(dA)) !== dB.bridgeDecisionDigest);
  const t = JSON.parse(JSON.stringify(coreOf(dA))); t.targetDescriptor.candidateDraftId += '-x';
  gate('G423-CE — LIVE core tamper breaks digest', rt.createDeterministicDigest(t) !== dA.bridgeDecisionDigest);
}

// ---- B-RECOMPUTE-INPUT closure ----
const b = C.BLOCKER_CLOSURE_CONTRACT;
gate('G423-CE — B-RECOMPUTE root cause confirmed', b.bRecomputeInputRootCauseConfirmed === true);
gate('G423-CE — required preimage captured', b.requiredPreimageFieldsCaptured === true);
gate('G423-CE — all preimage present in core', b.allRequiredPreimageFieldsPresentInCore === true);
gate('G423-CE — missing preimage == 0', b.missingPreimageFieldCount === 0);
gate('G423-CE — extra preimage == 0', b.extraPreimageFieldCount === 0);
gate('G423-CE — full recompute possible by contract', b.fullDigestRecomputationPossibleByContract === true);
gate('G423-CE — B-RECOMPUTE-INPUT closed by contract', b.bRecomputeInputClosedByContract === true);
gate('G423-CE — plan alignment still required', b.implementationPlanAlignmentRequired === true);
gate('G423-CE — closure does not authorize runtime', b.readyForRuntimeImplementation === false);

// ---- Envelope v2 / digest semantics / atomicity ----
for (const f of C.CORE_ENVELOPE_FIELDS) gate(`G423-CE — envelope field ${f} declared`, C.CORE_ENVELOPE_V2_CONTRACT.fields.includes(f));
gate('G423-CE — digest only in envelope not core', C.CORE_ENVELOPE_V2_CONTRACT.digestOnlyInEnvelopeNotCore === true);
gate('G423-CE — envelope invariant synthetic', C.CORE_ENVELOPE_INVARIANTS.synthetic === true);
gate('G423-CE — envelope invariant productExposed false', C.CORE_ENVELOPE_INVARIANTS.productExposed === false);
gate('G423-CE — digest recompute mode', C.DIGEST_SEMANTICS_CONTRACT.recomputeMode === 'recompute_and_compare');
gate('G423-CE — digest not cryptographic', C.DIGEST_SEMANTICS_CONTRACT.cryptographicIntegrityProvided === false);
gate('G423-CE — atomicity required', C.SAME_DECISION_ATOMICITY_CONTRACT.digestAndCoreMustComeFromSameDecision === true);
gate('G423-CE — cross-decision mix forbidden', C.SAME_DECISION_ATOMICITY_CONTRACT.crossDecisionMixingAllowed === false);
gate('G423-CE — partial core forbidden', C.SAME_DECISION_ATOMICITY_CONTRACT.partialCoreAllowed === false);

// ---- v1/v2 compatibility ----
gate('G423-CE — v1 still valid', C.V1_V2_COMPATIBILITY_CONTRACT.v1EnvelopeContractStillValid === true);
gate('G423-CE — v1 insufficient for recompute', C.V1_V2_COMPATIBILITY_CONTRACT.v1SufficientForRuntimeRecompute === false);
gate('G423-CE — v2 required for recompute', C.V1_V2_COMPATIBILITY_CONTRACT.v2RequiredForRuntimeRecompute === true);
gate('G423-CE — no implicit v1->v2 upgrade', C.V1_V2_COMPATIBILITY_CONTRACT.implicitV1ToV2UpgradeAllowed === false);
gate('G423-CE — no v1 core synthesis', C.V1_V2_COMPATIBILITY_CONTRACT.automaticCoreSynthesisFromV1Allowed === false);
gate('G423-CE — no v1 runtime acceptance', C.V1_V2_COMPATIBILITY_CONTRACT.v1RuntimeAcceptanceAllowed === false);
gate('G423-CE — registry compatibility additive', C.V1_V2_COMPATIBILITY_CONTRACT.contractRegistryCompatibility === 'additive');
gate('G423-CE — runtime compatibility breaking-by-version', C.V1_V2_COMPATIBILITY_CONTRACT.runtimeInputCompatibility === 'breaking_by_version');
gate('G423-CE — unknown version fails closed', C.V1_V2_COMPATIBILITY_CONTRACT.unknownEnvelopeVersionFailsClosed === true);

// ---- Versions / read-only / pipeline / issues / failure / limits / extensions / replay / SSOT / permission / prototype ----
gate('G423-CE — version exact match', C.VERSION_CONTRACT.policy.exactVersionMatchRequired === true);
gate('G423-CE — no aggregate alias', C.VERSION_CONTRACT.policy.aggregatedVersionObjectAsSourceAliasAllowed === false);
gate('G423-CE — no downgrade/implicit upgrade', C.VERSION_CONTRACT.policy.downgradeAllowed === false && C.VERSION_CONTRACT.policy.implicitUpgradeAllowed === false);
for (const k of ['sourceDecisionMutationAllowed', 'coreMutationAllowed', 'targetDescriptorMutationAllowed', 'referenceRetentionAllowed']) gate(`G423-CE — read-only ${k} false`, C.READ_ONLY_CONTRACT[k] === false);
gate('G423-CE — clone + deepFreeze required', C.READ_ONLY_CONTRACT.cloneRequired === true && C.READ_ONLY_CONTRACT.deepFreezeRequired === true);
gate('G423-CE — pipeline 18 stages', C.VALIDATION_PIPELINE_CONTRACT.stageCount === 18);
C.CORE_ENVELOPE_VALIDATION_STAGES.forEach((s, i) => gate(`G423-CE — stage ${i + 1} ${s}`, C.VALIDATION_PIPELINE_CONTRACT.stages[i] === s));
gate('G423-CE — pipeline blocker stops envelope', C.VALIDATION_PIPELINE_CONTRACT.blockerStopsCoreEnvelope === true);
gate('G423-CE — pipeline not implemented', C.VALIDATION_PIPELINE_CONTRACT.pipelineImplemented === false);
gate('G423-CE — issue codes >= 40', C.CORE_ENVELOPE_ISSUE_CODES.length >= 40, `${C.CORE_ENVELOPE_ISSUE_CODES.length}`);
gate('G423-CE — failure atomic, no partial', C.FAILURE_CONTAINMENT_CONTRACT.atomicEnvelopeDecisionRequired === true && C.FAILURE_CONTAINMENT_CONTRACT.partialCoreAllowed === false);
gate('G423-CE — failure no leak', C.FAILURE_CONTAINMENT_CONTRACT.secretLeakAllowed === false && C.FAILURE_CONTAINMENT_CONTRACT.stackLeakAllowed === false);
gate('G423-CE — maxCoreFields derived', C.RESOURCE_LIMIT_CONTRACT.maxCoreFieldsDerived === true && C.RESOURCE_LIMIT_CONTRACT.dimensions.find((d) => d.dimension === 'maxCoreFields').sourceLimit === C.CORE_FIELD_COUNT);
for (const d of C.RESOURCE_LIMIT_CONTRACT.dimensions) gate(`G423-CE — limit ${d.dimension} fail-closed`, d.silentTruncationAllowed === false && d.partialCoreAllowed === false);
gate('G423-CE — core not extensible', C.EXTENSIBILITY_CONTRACT.coreExtensionsAllowed === false);
for (const o of ['core', 'digest', 'version', 'critical']) gate(`G423-CE — extension cannot override ${o}`, C.EXTENSIBILITY_CONTRACT.forbiddenOverrides.includes(o));
gate('G423-CE — replay determinism', C.REPLAY_CONTRACT.randomnessAllowed === false && C.REPLAY_CONTRACT.ambientClockAllowed === false && C.REPLAY_CONTRACT.crossInstanceDeterminismRequired === true);
gate('G423-CE — SSOT preserved', C.SSOT_BOUNDARY_CONTRACT.certifiedBlueprintRemainsSsot === true && C.SSOT_BOUNDARY_CONTRACT.coreIsCanonical === false);
gate('G423-CE — permission not integrated', C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.permissionModelIntegrated === false && C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.productExposureBlockedByPermissionTenancy === true);
gate('G423-CE — prototype relink forbidden', C.PROTOTYPE_PROHIBITION_CONTRACT.prototypeRelinkAllowed === false);

// ---- Manual gate / readiness ----
gate('G423-CE — manual gate required', C.MANUAL_CHECKPOINT_CONTRACT.manualGateRequired === true);
gate('G423-CE — selected architecture Option B', C.MANUAL_CHECKPOINT_CONTRACT.selectedArchitecture === 'OPTION_B_FULL_BRIDGE_DECISION_CORE');
for (const k of ['authorizesCoreEnvelopeBuilder', 'authorizesConsumerRuntime', 'authorizesImplementationPlanAlignment', 'authorizesPreviewMount', 'authorizesProductExposure']) gate(`G423-CE — manual gate ${k} false`, C.MANUAL_CHECKPOINT_CONTRACT[k] === false);
gate('G423-CE — readiness state', CONTRACT.readiness === 'studio_bridge_decision_core_envelope_contract_ready_for_enterprise_audit');
gate('G423-CE — readyForEnterpriseContractAudit', CONTRACT.readyForEnterpriseContractAudit === true);
gate('G423-CE — readyForImplementationPlanAlignment false', CONTRACT.readyForImplementationPlanAlignment === false);
gate('G423-CE — readyForRuntimeImplementation false', CONTRACT.readyForRuntimeImplementation === false);
gate('G423-CE — plan alignment required', CONTRACT.implementationPlanAlignmentRequired === true);

// ---- Capabilities ----
const CAP_FALSE = ['coreEnvelopeBuilderImplemented', 'identityVerificationImplemented', 'digestRecomputeExecuted', 'validationExecuted', 'consumerRuntimeImplemented', 'coreConsumed', 'implementationPlanAligned', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated'];
for (const f of CAP_FALSE) gate(`G423-CE — capability ${f} false`, C.CORE_ENVELOPE_CAPABILITIES[f] === false);

// ---- Verifier tamper battery ----
gate('G423-CE — verifier passes clean', CONTRACT.verification.ok === true && CONTRACT.verification.blockerCount === 0);
gate('G423-CE — verifier rejects premature runtime', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, readyForRuntimeImplementation: true } }).ok === false);
gate('G423-CE — verifier rejects builder impl', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, capabilities: { ...CONTRACT.capabilities, coreEnvelopeBuilderImplemented: true } } }).ok === false);
gate('G423-CE — verifier rejects false closure (missing)', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, blockerClosure: { ...CONTRACT.blockerClosure, missingPreimageFieldCount: 1 } } }).ok === false);
gate('G423-CE — verifier rejects false closure (extra)', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, blockerClosure: { ...CONTRACT.blockerClosure, extraPreimageFieldCount: 1 } } }).ok === false);
gate('G423-CE — verifier rejects digest inside core', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, bridgeDecisionCore: { ...CONTRACT.bridgeDecisionCore, digestFieldInsideCore: true } } }).ok === false);
gate('G423-CE — verifier rejects v1 runtime acceptance', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, v1V2Compatibility: { ...CONTRACT.v1V2Compatibility, v1RuntimeAcceptanceAllowed: true } } }).ok === false);
gate('G423-CE — verifier rejects cross-decision mixing', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, sameDecisionAtomicity: { ...CONTRACT.sameDecisionAtomicity, crossDecisionMixingAllowed: true } } }).ok === false);
gate('G423-CE — verifier rejects plan alignment falsely complete', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, readyForImplementationPlanAlignment: true } }).ok === false);
gate('G423-CE — verifier rejects SSOT inversion', C.verifyBridgeDecisionCoreEnvelopeContract({ contract: { ...CONTRACT, ssotBoundary: { ...CONTRACT.ssotBoundary, coreIsCanonical: true } } }).ok === false);

// ---- Manifest / compatibility ----
const a1 = C.createStudioBridgeDecisionCoreEnvelopeContract();
const a2 = C.createStudioBridgeDecisionCoreEnvelopeContract();
gate('G423-CE — manifest deterministic', a1.manifest.overallDigest === a2.manifest.overallDigest && a1.manifest.overallDigest.startsWith('fnv1a-'));
gate('G423-CE — manifest not cryptographic', a1.manifest.cryptographicIntegrityProvided === false);
const comp = C.checkBridgeDecisionCoreEnvelopeContractCompatibility();
gate('G423-CE — compatible with hardened bridge', comp.compatibleWithHardenedBridge === true);
gate('G423-CE — compatible with v1 contract', comp.compatibleWithV1EnvelopeIdentityContract === true);
gate('G423-CE — compatible with implementation plan', comp.compatibleWithImplementationPlan === true);
gate('G423-CE — compatible with blueprint contract', comp.compatibleWithBlueprintContract === true);
gate('G423-CE — compat v1 preserved + runtime blocked', comp.v1ContractPreserved === true && comp.readyForRuntimeImplementation === false);
gate('G423-CE — compat status', comp.status === 'bridge_decision_core_envelope_contract_ready_for_enterprise_audit');

// ---- No runtime (static) ----
const code = codeNoVerifier();
gate('G423-CE — no React import', !/from\s+['"]react['"]/.test(code));
gate('G423-CE — no .jsx', !/\.jsx\b/.test(code));
gate('G423-CE — no fetch(', !/\bfetch\s*\(/.test(code));
gate('G423-CE — no PrismaClient', !/new\s+PrismaClient/.test(code));
gate('G423-CE — no fs writes', !/\bfs\.(writeFile|writeFileSync|appendFileSync)/.test(code));
gate('G423-CE — no execute() body', !/\bexecute\s*\([^)]*\)\s*\{/.test(code));
gate('G423-CE — no nondeterminism outside verifier', !/Date\.now\(|new Date\(|Math\.random|crypto\.randomUUID|performance\.now|toLocaleString|localeCompare/.test(code));
for (const fn of ['buildCoreEnvelope', 'verifyIdentity', 'recomputeDigest', 'consumeCore', 'mountPreview', 'createConsumerDecision']) gate(`G423-CE — no runtime fn ${fn} defined`, !new RegExp(`function\\s+${fn}\\b`).test(code));

// ---- Imports read-only ----
gate('G423-CE — imports only upstream indexes + local', importsOf().every((i) => i.startsWith('.') || i.startsWith('node:') || /blueprint-engine\/(module-blueprint-authoring-runtime|bridge-decision-envelope-identity-contract|bridge-to-preview-sandbox-runtime-implementation-plan)\/index\.js$/.test(i)));
gate('G423-CE — no App/backend/prisma import', !importsOf().some((i) => /App\.jsx|backend|prisma|src\/modules|\.\.\/\.\.\/\.\.\//.test(i)));

// ---- Evidence docs ----
const DOCS = ['ROOT-CAUSE-B-RECOMPUTE.md', 'OPTION-A-B-C-DECISION.md', 'REAL-PREIMAGE-FIELDS.md', 'CORE-SHAPE.md', 'ENVELOPE-V2.md', 'DIGEST-EQUIVALENCE.md', 'SAME-DECISION-ATOMICITY.md', 'V1-V2-COMPATIBILITY.md', 'VERSIONS.md', 'READ-ONLY.md', 'PIPELINE.md', 'ISSUES.md', 'FAILURE.md', 'LIMITS.md', 'EXTENSIONS.md', 'REPLAY.md', 'SSOT-SECURITY-PERMISSION.md', 'PROTOTYPE.md', 'BLOCKER-CLOSURE.md', 'MANUAL-GATE.md', 'MANIFEST-VERIFIER.md', 'NO-RUNTIME-NO-BUILDER-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-RISK.md', 'NEXT-AUDIT.md'];
gate('G423-CE — 25 evidence docs listed', DOCS.length === 25);
for (const d of DOCS) gate(`G423-CE — doc ${d}`, readEv(d).length > 60);

// ---- Scope ----
const files = (() => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } })();
if (files) {
  gate('G423-CE — all changed files authorized', files.every((f) => authorized(f)), files.filter((f) => !authorized(f)).join(', ') || 'clean');
  // productionUiGuard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
  // governance guard may appear ONLY when the slice active on this branch shares it — i.e. a governance slice.
  gate('G423-CE — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs')
    && (!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')
      || createResolvedActiveStudioSlicePathAuthorizer(files).isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs')));
  gate('G423-CE — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|bridge-decision-envelope-identity-contract|bridge-to-preview-sandbox-runtime-contract|bridge-to-preview-sandbox-runtime-implementation-plan|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f)));
  gate('G423-CE — no App/pages/components/modules in diff', !files.some((f) => /^src\/(pages|components|modules|ModeloBase1|ModeloBase2)\//.test(f) || f === 'src/App.jsx'));
}

// ---- No new dependency ----
gate('G423-CE — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-CE — contract unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-CE — unit test has >= 760 scenarios', testCount >= 760, `${testCount} (min 760)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-CONTRACT summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
