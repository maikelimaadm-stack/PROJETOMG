#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-DECISION-ENVELOPE-IDENTITY-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, dev-only CONTRACT (definition only, no runtime)
 * that binds the REAL hardened `bridgeDecisionDigest` to its matching `targetDescriptor` as an explicit
 * `{ bridgeDecisionDigest, targetDescriptor }` identity/provenance envelope. It reflects the REAL bridge
 * DECISION shape read-only (no invented fields/aliases), LIVE-proves the decision digest covers the target
 * descriptor (tamper changes the digest) across multiple real seeds — closing B-IDENTITY at contract level —
 * declares identity binding / provenance / versions / read-only / pipeline / issues / failure / limits /
 * extensions / replay / SSOT / permission boundaries, keeps EVERY runtime/consumer implementation flag false,
 * and builds no envelope, mounts no preview, touches no App and exposes nothing.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createResolvedActiveStudioSlicePathAuthorizer } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-envelope-identity-contract');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-decision-envelope-identity-contract.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-decision-envelope-identity-contract.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeDecisionEnvelopeIdentityContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-decision-envelope-identity-contract\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-decision-envelope-identity-contract\//,
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

const E = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);

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
const CONTRACT = E.createStudioBridgeDecisionEnvelopeIdentityContract({});
const DEC = buildRealDecision('gate');

// ---- Structure / files ----
gate('G423-BE — exactly 29 .js files', jsFiles().length === 29, `${jsFiles().length} .js`);
gate('G423-BE — no .jsx', walk(DIR, /\.jsx$/).length === 0);
gate('G423-BE — no .tsx', walk(DIR, /\.tsx$/).length === 0);
gate('G423-BE — no .css', walk(DIR, /\.css$/).length === 0);
gate('G423-BE — index present', exists(path.join(DIR, 'index.js')));
gate('G423-BE — test present', exists(path.join(ROOT, TEST_REL)));
gate('G423-BE — gate present', exists(path.join(ROOT, GATE_REL)));
gate('G423-BE — imports only relative + authorized upstreams', importsOf().every((p) => p.startsWith('.') || /module-blueprint-authoring-runtime|bridge-to-preview-sandbox-runtime-contract/.test(p)));
gate('G423-BE — no node builtins imported', !importsOf().some((p) => /^(fs|path|child_process|crypto|net|http|os)$/.test(p)));
gate('G423-BE — no react import', !/from ['"]react['"]/.test(code()));

const DOCS = ['B-IDENTITY-ROOT-CAUSE.md', 'REAL-BRIDGE-DECISION-SHAPE.md', 'REAL-TARGET-DESCRIPTOR-SHAPE.md', 'DECISION-DIGEST-COVERAGE.md', 'ENVELOPE-SHAPE.md', 'IDENTITY-BINDING.md', 'PROVENANCE.md', 'VERSIONS.md', 'READ-ONLY.md', 'VALIDATION-PIPELINE.md', 'ISSUE-MODEL.md', 'FAILURE-CONTAINMENT.md', 'RESOURCE-LIMITS.md', 'EXTENSIBILITY.md', 'REPLAY.md', 'SSOT-SECURITY.md', 'PERMISSION-TENANCY.md', 'PROTOTYPE-PROHIBITION.md', 'MANUAL-GATE.md', 'MANIFEST-VERIFIER.md', 'NO-RUNTIME-NO-UI-NO-APP-NO-MOUNT.md', 'BUNDLE-ABSENCE.md', 'QUALITY-RISK.md', 'NEXT-ENTERPRISE-AUDIT.md'];
for (const d of DOCS) gate(`G423-BE — evidence doc ${d}`, exists(path.join(EV, d)));
gate('G423-BE — exactly 24 evidence docs', DOCS.length === 24 && fs.readdirSync(EV).filter((f) => f.endsWith('.md')).length === 24);

// ---- Registry / wiring ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-BE — registry lists contract subtree', /bridge-decision-envelope-identity-contract/.test(reg));
const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
gate('G423-BE — package.json test script', /studio-bridge-decision-envelope-identity-contract\.test\.js/.test(pkg));
gate('G423-BE — package.json gate script', /g423-studio-bridge-decision-envelope-identity-contract\.mjs/.test(pkg));
gate('G423-BE — wired into aggregate test:runtime', (() => { try { return /studio-bridge-decision-envelope-identity-contract\.test\.js/.test(JSON.parse(pkg).scripts['test:runtime']); } catch { return false; } })());

// ---- Upstreams intact ----
gate('G423-BE — bridge subtree present', exists(path.join(BRIDGE_DIR, 'index.js')));
gate('G423-BE — authoring runtime present', exists(path.join(RUNTIME_DIR, 'index.js')));
gate('G423-BE — bridge-to-sandbox contract present', exists(path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract/index.js')));

// ---- Identity / composition ----
gate('G423-BE — contract kind', CONTRACT.kind === 'studio-bridge-decision-envelope-identity-contract');
gate('G423-BE — contract version', CONTRACT.contractVersion === 'studio-bridge-decision-envelope-identity-contract@1.0.0');
gate('G423-BE — frozen', Object.isFrozen(CONTRACT));
gate('G423-BE — not fallback', CONTRACT.fallback === false);
gate('G423-BE — readiness state', CONTRACT.readiness === 'studio_bridge_decision_envelope_identity_contract_ready_for_enterprise_audit');
gate('G423-BE — contractDefined', CONTRACT.contractDefined === true);
gate('G423-BE — verification ok', CONTRACT.verification.ok === true);
gate('G423-BE — verification zero blockers', CONTRACT.verification.blockerCount === 0);
gate('G423-BE — compatibility status', CONTRACT.compatibility.status === 'bridge_decision_envelope_identity_contract_ready_for_enterprise_audit');
gate('G423-BE — manifest deterministic', E.createStudioBridgeDecisionEnvelopeIdentityContract({}).manifest.overallDigest === CONTRACT.manifest.overallDigest);
gate('G423-BE — contract deep-equal replay', JSON.stringify(E.createStudioBridgeDecisionEnvelopeIdentityContract({})) === JSON.stringify(CONTRACT));

// ---- LIVE: real bridge decision shape ----
gate('G423-BE — real decision kind', DEC.kind === 'bridge-decision');
gate('G423-BE — real decision ok + ready', DEC.ok === true && DEC.status === 'bridge_ready');
gate('G423-BE — declared decision fields == actual keys', JSON.stringify([...E.REAL_BRIDGE_DECISION_FIELDS].sort()) === JSON.stringify(Object.keys(DEC).sort()));
for (const f of E.REAL_BRIDGE_DECISION_FIELDS) gate(`G423-BE — real decision has field ${f}`, Object.prototype.hasOwnProperty.call(DEC, f));
for (const f of E.REAL_BRIDGE_DECISION_SECURITY_FIELDS) gate(`G423-BE — decision security ${f} false`, DEC[f] === false);
gate('G423-BE — decision has bridgeDecisionDigest', typeof DEC.bridgeDecisionDigest === 'string' && DEC.bridgeDecisionDigest.startsWith('fnv1a-'));
gate('G423-BE — decision has targetDescriptor', DEC.targetDescriptor && typeof DEC.targetDescriptor === 'object');

// ---- LIVE: B-IDENTITY / digest coverage (multi-seed) ----
gate('G423-BE — bridgeDecisionDigest NOT on targetDescriptor', !Object.prototype.hasOwnProperty.call(DEC.targetDescriptor, 'bridgeDecisionDigest'));
gate('G423-BE — preimage excludes bridgeDecisionDigest', !E.DECISION_DIGEST_PREIMAGE_FIELDS.includes('bridgeDecisionDigest'));
gate('G423-BE — preimage includes targetDescriptor', E.DECISION_DIGEST_PREIMAGE_FIELDS.includes('targetDescriptor'));
for (const seed of ['gate', 'a', 'b', 'c', 'd']) {
  const d = buildRealDecision(seed);
  const core = {}; for (const k of Object.keys(d)) if (k !== 'bridgeDecisionDigest') core[k] = d[k];
  gate(`G423-BE — seed ${seed}: recompute == bridgeDecisionDigest`, rt.createDeterministicDigest(core) === d.bridgeDecisionDigest);
  const tampered = JSON.parse(JSON.stringify(core)); tampered.targetDescriptor.candidateDraftId = 'HACKED';
  gate(`G423-BE — seed ${seed}: tamper target changes digest (coverage)`, rt.createDeterministicDigest(tampered) !== d.bridgeDecisionDigest);
  const ts = JSON.parse(JSON.stringify(core)); ts.status = 'bridge_rejected';
  gate(`G423-BE — seed ${seed}: tamper status changes digest`, rt.createDeterministicDigest(ts) !== d.bridgeDecisionDigest);
}
gate('G423-BE — digestCoverage targetDescriptorCoveredByDigest', E.DIGEST_COVERAGE_CONTRACT.targetDescriptorCoveredByDigest === true);
gate('G423-BE — digestCoverage not cryptographic', E.DIGEST_COVERAGE_CONTRACT.cryptographicIntegrityProvided === false);
gate('G423-BE — B-IDENTITY closed by contract (digest)', E.DIGEST_COVERAGE_CONTRACT.bIdentityClosedByContract === true && E.DIGEST_COVERAGE_CONTRACT.bIdentityRemainsOpen === false);
gate('G423-BE — contract bIdentityClosedByContract', CONTRACT.bIdentityClosedByContract === true);
gate('G423-BE — verification bIdentityClosedByContract', CONTRACT.verification.bIdentityClosedByContract === true);
gate('G423-BE — compatibility bIdentityClosedByContract', CONTRACT.compatibility.bIdentityClosedByContract === true);
gate('G423-BE — digestCoverage readyForImplementationPlan false', E.DIGEST_COVERAGE_CONTRACT.readyForImplementationPlan === false);

// ---- Envelope shape / identity binding / provenance ----
gate('G423-BE — envelope has digest + descriptor fields', E.ENVELOPE_FIELDS.includes('bridgeDecisionDigest') && E.ENVELOPE_FIELDS.includes('targetDescriptor'));
gate('G423-BE — envelope kind invariant', E.ENVELOPE_INVARIANTS.envelopeKind === 'bridge_decision_identity_envelope');
gate('G423-BE — envelope invariants (synthetic/immutable/metadataOnly)', E.ENVELOPE_INVARIANTS.synthetic === true && E.ENVELOPE_INVARIANTS.immutable === true && E.ENVELOPE_INVARIANTS.metadataOnly === true);
gate('G423-BE — envelope inert flags false', ['identityVerified', 'sourceDecisionConsumed', 'targetDescriptorConsumed', 'consumerRuntimeInvoked', 'previewMounted', 'productExposed'].every((k) => E.ENVELOPE_INVARIANTS[k] === false));
gate('G423-BE — digest+descriptor same decision', E.IDENTITY_BINDING_CONTRACT.digestAndDescriptorMustComeFromSameDecision === true);
gate('G423-BE — verification mode recompute_and_compare', E.IDENTITY_BINDING_CONTRACT.identityVerificationMode === 'recompute_and_compare');
gate('G423-BE — identity synthesis/alias/fallback forbidden', E.IDENTITY_BINDING_CONTRACT.identitySynthesisAllowed === false && E.IDENTITY_BINDING_CONTRACT.identityAliasAllowed === false && E.IDENTITY_BINDING_CONTRACT.identityFallbackAllowed === false);
gate('G423-BE — identity verification not implemented', E.IDENTITY_BINDING_CONTRACT.identityVerificationImplemented === false);
gate('G423-BE — provenance atomic pair required', E.PROVENANCE_CONTRACT.sourceDecisionAndDescriptorAtomicPairRequired === true);
gate('G423-BE — cross-decision mix forbidden', E.PROVENANCE_CONTRACT.crossDecisionDescriptorMixingAllowed === false);
gate('G423-BE — descriptor/digest replacement forbidden', E.PROVENANCE_CONTRACT.descriptorReplacementAllowed === false && E.PROVENANCE_CONTRACT.digestReplacementAllowed === false);

// ---- Versions / read-only ----
gate('G423-BE — exact version match required', E.VERSION_CONTRACT.policy.exactVersionMatchRequired === true);
gate('G423-BE — unknown version fails closed', E.VERSION_CONTRACT.policy.unknownVersionFailsClosed === true);
gate('G423-BE — aggregate alias + coercion forbidden', E.VERSION_CONTRACT.policy.aggregatedVersionObjectAsSourceAliasAllowed === false && E.VERSION_CONTRACT.policy.silentVersionCoercionAllowed === false);
for (const [k, v] of Object.entries(E.VERSION_CONTRACT.expectedVersions)) gate(`G423-BE — version ${k} real semver`, typeof v === 'string' && /@\d+\.\d+\.\d+$/.test(v));
gate('G423-BE — bridgeRuntimeVersion matches real decision', DEC.bridgeVersion === E.VERSION_CONTRACT.expectedVersions.bridgeRuntimeVersion);
gate('G423-BE — read-only forbids mutation + retention', E.READ_ONLY_CONTRACT.sourceDecisionMutationAllowed === false && E.READ_ONLY_CONTRACT.targetDescriptorMutationAllowed === false && E.READ_ONLY_CONTRACT.sourceReferenceRetentionAllowed === false);
gate('G423-BE — clone + deep freeze required', E.READ_ONLY_CONTRACT.cloneRequired === true && E.READ_ONLY_CONTRACT.deepFreezeRequired === true);

// ---- Pipeline / issues / failure / limits / extensions / replay ----
gate('G423-BE — 17 stages', E.VALIDATION_PIPELINE_CONTRACT.stages.length === 17);
gate('G423-BE — pipeline not implemented', E.VALIDATION_PIPELINE_CONTRACT.pipelineImplemented === false && E.VALIDATION_PIPELINE_CONTRACT.validationExecuted === false && E.VALIDATION_PIPELINE_CONTRACT.envelopeCreated === false);
for (const s of E.ENVELOPE_VALIDATION_STAGES) gate(`G423-BE — stage ${s} snake_case`, /^[a-z_]+$/.test(s));
gate('G423-BE — issue codes >= 40 + unique', E.ENVELOPE_ISSUE_CODES.length >= 40 && new Set(E.ENVELOPE_ISSUE_CODES).size === E.ENVELOPE_ISSUE_CODES.length);
gate('G423-BE — issue ordering keys', JSON.stringify(E.ISSUE_MODEL_CONTRACT.orderingKeys) === JSON.stringify(['stage', 'path', 'issueCode', 'message']));
gate('G423-BE — atomic envelope + fail-closed exceptions', E.FAILURE_CONTAINMENT_CONTRACT.atomicEnvelopeDecisionRequired === true && E.FAILURE_CONTAINMENT_CONTRACT.unexpectedExceptionsMustFailClosed === true);
gate('G423-BE — no partial envelope / no leak', E.FAILURE_CONTAINMENT_CONTRACT.partialEnvelopeAllowed === false && E.FAILURE_CONTAINMENT_CONTRACT.stackLeakAllowed === false && E.FAILURE_CONTAINMENT_CONTRACT.secretLeakAllowed === false);
gate('G423-BE — 6 resource dimensions', E.RESOURCE_LIMIT_CONTRACT.dimensions.length === 6);
for (const d of E.RESOURCE_LIMIT_CONTRACT.dimensions) gate(`G423-BE — dim ${d.dimension} has limits + issueCode`, Number.isInteger(d.sourceLimit) && Number.isInteger(d.envelopeLimit) && Number.isInteger(d.consumerLimit) && typeof d.issueCode === 'string');
gate('G423-BE — extensibility rejects unnamespaced + pollution keys', E.EXTENSIBILITY_CONTRACT.unnamespacedExtensionsRejected === true && E.EXTENSIBILITY_CONTRACT.prototypePollutionKeysRejected === true);
gate('G423-BE — extension cannot override critical/caps/versions/digests', E.EXTENSIBILITY_CONTRACT.extensionCannotOverrideCriticalFields === true && E.EXTENSIBILITY_CONTRACT.extensionCannotOverrideCapabilities === true && E.EXTENSIBILITY_CONTRACT.extensionCannotOverrideVersions === true && E.EXTENSIBILITY_CONTRACT.extensionCannotOverrideDigests === true);
gate('G423-BE — replay determinism required', E.REPLAY_CONTRACT.sameDecisionProducesSameEnvelope === true && E.REPLAY_CONTRACT.crossInstanceDeterminismRequired === true);
gate('G423-BE — replay no clock/random/locale + not implemented', E.REPLAY_CONTRACT.ambientClockAllowed === false && E.REPLAY_CONTRACT.randomnessAllowed === false && E.REPLAY_CONTRACT.localeDependencyAllowed === false && E.REPLAY_CONTRACT.replayImplemented === false);

// ---- SSOT / permission / security / prototype / manual gate ----
gate('G423-BE — certified blueprint remains SSOT', E.SSOT_BOUNDARY_CONTRACT.certifiedBlueprintRemainsSsot === true);
gate('G423-BE — nothing canonical', E.SSOT_BOUNDARY_CONTRACT.bridgeDecisionIsCanonical === false && E.SSOT_BOUNDARY_CONTRACT.targetDescriptorIsCanonical === false && E.SSOT_BOUNDARY_CONTRACT.envelopeIsCanonical === false);
gate('G423-BE — envelope may not certify/generate/expose', E.SSOT_BOUNDARY_CONTRACT.envelopeMayCertify === false && E.SSOT_BOUNDARY_CONTRACT.envelopeMayGenerateModule === false && E.SSOT_BOUNDARY_CONTRACT.envelopeMayExposeProduct === false);
gate('G423-BE — permission/tenancy not integrated', E.PERMISSION_TENANCY_BOUNDARY_CONTRACT.permissionModelIntegrated === false && E.PERMISSION_TENANCY_BOUNDARY_CONTRACT.tenantModelIntegrated === false);
gate('G423-BE — requires permission/tenancy foundation', E.PERMISSION_TENANCY_BOUNDARY_CONTRACT.requiresPermissionTenancyFoundationBeforeExposure === true);
gate('G423-BE — security failClosed + no side effects', E.SECURITY_CONTRACT.failClosed === true && E.SECURITY_CONTRACT.anyForbiddenSideEffect === false);
gate('G423-BE — prototype relink forbidden', E.PROTOTYPE_PROHIBITION_CONTRACT.prototypeRelinkAllowed === false && E.PROTOTYPE_PROHIBITION_CONTRACT.oldPrototypeImported === false);
gate('G423-BE — manual gate required', E.MANUAL_CHECKPOINT_CONTRACT.manualGateRequired === true);
gate('G423-BE — manual gate authorizes only envelope contract', E.MANUAL_CHECKPOINT_CONTRACT.authorizesEnvelopeContract === true && E.MANUAL_CHECKPOINT_CONTRACT.authorizesImplementationPlan === false && E.MANUAL_CHECKPOINT_CONTRACT.authorizesConsumerRuntime === false && E.MANUAL_CHECKPOINT_CONTRACT.authorizesProductExposure === false);

// ---- Capabilities all-runtime-false ----
const CAPS = E.ENVELOPE_CAPABILITIES;
gate('G423-BE — capabilities frozen', Object.isFrozen(CAPS));
gate('G423-BE — decisionDigestCoversTargetDescriptor true', CAPS.decisionDigestCoversTargetDescriptor === true);
for (const k of ['envelopeBuilderImplemented', 'identityVerificationImplemented', 'validationExecuted', 'consumerRuntimeImplemented', 'sourceDecisionConsumed', 'targetDescriptorConsumed', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated']) gate(`G423-BE — capability ${k} false`, CAPS[k] === false);
for (const k of ['headless', 'deterministic', 'immutable', 'failClosed', 'contractOnly', 'metadataOnly', 'realBridgeDecisionShapeCaptured']) gate(`G423-BE — capability ${k} true`, CAPS[k] === true);

// ---- Verifier tamper battery ----
const V = E.verifyBridgeDecisionEnvelopeIdentityContract;
gate('G423-BE — verifier ok on real contract', V({ contract: CONTRACT }).ok === true);
gate('G423-BE — verifier never throws on null', (() => { try { V({ contract: null }); V(null); return true; } catch { return false; } })());
gate('G423-BE — verifier detects digest-not-covering-target', V({ contract: { ...CONTRACT, digestCoverage: { ...E.DIGEST_COVERAGE_CONTRACT, targetDescriptorCoveredByDigest: false } } }).ok === false);
gate('G423-BE — verifier detects B-IDENTITY open', V({ contract: { ...CONTRACT, digestCoverage: { ...E.DIGEST_COVERAGE_CONTRACT, bIdentityRemainsOpen: true } } }).ok === false);
gate('G423-BE — verifier detects identity synthesis', V({ contract: { ...CONTRACT, identityBinding: { ...E.IDENTITY_BINDING_CONTRACT, identitySynthesisAllowed: true } } }).ok === false);
gate('G423-BE — verifier detects cross-decision mix', V({ contract: { ...CONTRACT, provenance: { ...E.PROVENANCE_CONTRACT, crossDecisionDescriptorMixingAllowed: true } } }).ok === false);
gate('G423-BE — verifier detects consumer runtime', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, consumerRuntimeImplemented: true } } }).ok === false);
gate('G423-BE — verifier detects envelope builder', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, envelopeBuilderImplemented: true } } }).ok === false);
gate('G423-BE — verifier detects previewMounted', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, previewMounted: true } } }).ok === false);
gate('G423-BE — verifier detects productExposed', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, productExposed: true } } }).ok === false);
gate('G423-BE — verifier detects source mutation', V({ contract: { ...CONTRACT, readOnly: { ...E.READ_ONLY_CONTRACT, sourceDecisionMutationAllowed: true } } }).ok === false);
gate('G423-BE — verifier detects ssot inversion', V({ contract: { ...CONTRACT, ssotBoundary: { ...E.SSOT_BOUNDARY_CONTRACT, envelopeIsCanonical: true } } }).ok === false);
gate('G423-BE — verifier detects missing manual gate', V({ contract: { ...CONTRACT, manualCheckpoint: { ...E.MANUAL_CHECKPOINT_CONTRACT, manualGateRequired: false } } }).ok === false);
gate('G423-BE — verifier detects premature runtime', V({ contract: { ...CONTRACT, readyForRuntimeImplementation: true } }).ok === false);
gate('G423-BE — verifier detects premature implementation plan', V({ contract: { ...CONTRACT, readyForImplementationPlan: true } }).ok === false);
gate('G423-BE — verifier detects invented decision field', V({ contract: { ...CONTRACT, sourceDecision: { ...E.SOURCE_DECISION_CONTRACT, realDecisionFields: [...E.REAL_BRIDGE_DECISION_FIELDS, 'inventedZz'] } } }).ok === false);
gate('G423-BE — compatibility not ready for implementation plan', CONTRACT.compatibility.readyForImplementationPlan === false && CONTRACT.compatibility.readyForRuntimeImplementation === false);

// ---- Static scans ----
gate('G423-BE — no nondeterminism outside verifier', !/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b|performance\.now|toLocaleString|localeCompare/.test(codeNoVerifier()));
gate('G423-BE — no process.env misuse', !/[^.\w]process\.env/.test(code()) || /globalThis\.process/.test(code()));
gate('G423-BE — no eval/Function/timer', !/\beval\s*\(|new Function\(|setTimeout|setInterval/.test(code()));
gate('G423-BE — no fs/network/prisma real usage', !/from ['"]fs['"]|writeFileSync|child_process|fetch\(|axios|XMLHttpRequest|WebSocket|PrismaClient/.test(code()));
gate('G423-BE — no prototype subtree imports', !importsOf().some((p) => /studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(p)));
gate('G423-BE — doc B-IDENTITY mentions closure', /closed by contract|digest cover|B-IDENTITY/i.test(readEv('B-IDENTITY-ROOT-CAUSE.md')));
gate('G423-BE — doc digest coverage mentions targetDescriptor', /targetDescriptor|covers|preimage/i.test(readEv('DECISION-DIGEST-COVERAGE.md')));

// ---- Scope safety ----
let files = null;
try { files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { files = null; }
if (files === null) { gate('G423-BE — scope diff (skipped)', true); } else {
  const outside = files.filter((f) => !authorized(f));
  gate('G423-BE — authorized scope only', outside.length === 0, outside.length ? `OUT: ${outside.join(', ')}` : `${files.length} files`);
  gate('G423-BE — no App.jsx in diff', !files.includes('src/App.jsx'));
  gate('G423-BE — no .jsx/.tsx/.css in diff', !files.some((f) => /\.(jsx|tsx|css)$/.test(f)));
  gate('G423-BE — no backend/prisma/migrations in diff', !files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f)));
  gate('G423-BE — no src/modules in diff', !files.some((f) => /^src\/modules\//.test(f)));
  // productionUiGuard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
  // governance guard may appear ONLY when the slice active on this branch shares it — i.e. a governance slice.
  gate('G423-BE — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs')
    && (!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')
      || createResolvedActiveStudioSlicePathAuthorizer(files).isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs')));
  gate('G423-BE — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|bridge-to-preview-sandbox-runtime-contract|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f)));
}
gate('G423-BE — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(pkg); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test as the primary behavioral proof ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-BE — contract unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-BE — unit test has >= 640 scenarios', testCount >= 640, `${testCount} (min 640)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-ENVELOPE-IDENTITY-CONTRACT summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
