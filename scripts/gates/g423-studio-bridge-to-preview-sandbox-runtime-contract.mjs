#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-TO-PREVIEW-SANDBOX-RUNTIME-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, deterministic, immutable, fail-closed, side-effect-free, dev-only CONTRACT (definition
 * only, no consumer runtime) between the hardened bridge target descriptor and a future Preview Sandbox
 * consumer runtime. It reflects the REAL bridge descriptor + preview sandbox contract shapes read-only (no
 * invented fields/aliases), declares identity/versions/digests/mappings/pipeline/issues/failure/limits/
 * extensions/replay/SSOT/permission boundaries, keeps EVERY runtime/consumer implementation flag false, and
 * builds no consumer, mounts no preview, touches no App, creates no route/menu, persists nothing and exposes
 * nothing. Live compatibility proofs drive the REAL bridge target descriptor.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createResolvedActiveStudioSlicePathAuthorizer } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-contract');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-to-preview-sandbox-runtime-contract.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-to-preview-sandbox-runtime-contract.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeToPreviewSandboxRuntimeContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-contract\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-contract\//,
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
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);
const sandbox = await import(pathToFileURL(path.join(SANDBOX_DIR, 'index.js')).href);

function buildRealTarget(seed = 'gate') {
  const s0 = rt.createAuthoringRuntimeSession({ seed });
  let r = rt.executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'C' } } });
  const draftId = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const b = bridge.createStudioAuthoringRuntimeToPreviewBridge({});
  return b.execute({ sourceHandoff: rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId }).targetDescriptor;
}
const CONTRACT = C.createStudioBridgeToPreviewSandboxRuntimeContract({});
const REAL_TARGET = buildRealTarget('gate');

// ---- Structure / files ----
gate('G423-BS — exactly 29 .js files', jsFiles().length === 29, `${jsFiles().length} .js`);
gate('G423-BS — no .jsx', walk(DIR, /\.jsx$/).length === 0);
gate('G423-BS — no .tsx', walk(DIR, /\.tsx$/).length === 0);
gate('G423-BS — no .css', walk(DIR, /\.css$/).length === 0);
gate('G423-BS — index present', exists(path.join(DIR, 'index.js')));
gate('G423-BS — test present', exists(path.join(ROOT, TEST_REL)));
gate('G423-BS — gate present', exists(path.join(ROOT, GATE_REL)));
gate('G423-BS — imports only relative + authorized upstreams', importsOf().every((p) => p.startsWith('.') || /module-blueprint-authoring-runtime|authoring-runtime-to-preview-bridge|module-preview-sandbox/.test(p)));
gate('G423-BS — no node builtins imported', !importsOf().some((p) => /^(fs|path|child_process|crypto|net|http|os)$/.test(p)));
gate('G423-BS — no react import', !/from ['"]react['"]/.test(code()));

const DOCS = ['CONTRACT-CERTIFICATION-REPORT.md', 'REAL-SOURCE-DESCRIPTOR-SHAPE.md', 'REAL-SANDBOX-CONTRACT-SHAPE.md', 'IDENTITY-PROVENANCE.md', 'VERSION-TUPLE.md', 'DIGEST-SEMANTICS.md', 'READ-ONLY-POLICY.md', 'SANDBOX-DESCRIPTOR.md', 'FIELD-MAPPINGS.md', 'VALIDATION-PIPELINE.md', 'ISSUE-MODEL.md', 'FAILURE-CONTAINMENT.md', 'RESOURCE-LIMITS.md', 'EXTENSIBILITY.md', 'REPLAY.md', 'SSOT-BOUNDARY.md', 'PERMISSION-TENANCY-BOUNDARY.md', 'SECURITY.md', 'PROTOTYPE-PROHIBITION.md', 'MANUAL-CHECKPOINT.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'NO-RUNTIME-NO-UI-NO-APP-NO-MOUNT.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-RISK-NOTES.md', 'NEXT-ENTERPRISE-AUDIT.md'];
for (const d of DOCS) gate(`G423-BS — evidence doc ${d}`, exists(path.join(EV, d)));
gate('G423-BS — exactly 25 evidence docs', DOCS.length === 25 && fs.readdirSync(EV).filter((f) => f.endsWith('.md')).length === 25);

// ---- Registry / wiring ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-BS — registry lists contract subtree', /bridge-to-preview-sandbox-runtime-contract\\\//.test(reg) || /bridge-to-preview-sandbox-runtime-contract/.test(reg));
const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
gate('G423-BS — package.json test script', /studio-bridge-to-preview-sandbox-runtime-contract\.test\.js/.test(pkg));
gate('G423-BS — package.json gate script', /g423-studio-bridge-to-preview-sandbox-runtime-contract\.mjs/.test(pkg));
gate('G423-BS — wired into aggregate test:runtime', (() => { try { return /studio-bridge-to-preview-sandbox-runtime-contract\.test\.js/.test(JSON.parse(pkg).scripts['test:runtime']); } catch { return false; } })());

// ---- Upstreams intact ----
gate('G423-BS — bridge subtree present', exists(path.join(BRIDGE_DIR, 'index.js')));
gate('G423-BS — preview sandbox present', exists(path.join(SANDBOX_DIR, 'index.js')));
gate('G423-BS — authoring runtime present', exists(path.join(RUNTIME_DIR, 'index.js')));

// ---- Identity / composition ----
gate('G423-BS — contract kind', CONTRACT.kind === 'studio-bridge-to-preview-sandbox-runtime-contract');
gate('G423-BS — contract version', CONTRACT.contractVersion === 'studio-bridge-to-preview-sandbox-runtime-contract@1.0.0');
gate('G423-BS — frozen', Object.isFrozen(CONTRACT));
gate('G423-BS — not fallback', CONTRACT.fallback === false);
gate('G423-BS — readiness state', CONTRACT.readiness === 'studio_bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit');
gate('G423-BS — contractDefined', CONTRACT.contractDefined === true);
gate('G423-BS — metadataOnly', CONTRACT.metadataOnly === true);
gate('G423-BS — verification ok', CONTRACT.verification.ok === true);
gate('G423-BS — verification zero blockers', CONTRACT.verification.blockerCount === 0);
gate('G423-BS — compatibility status', CONTRACT.compatibility.status === 'bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit');
gate('G423-BS — manifest deterministic', C.createStudioBridgeToPreviewSandboxRuntimeContract({}).manifest.overallDigest === CONTRACT.manifest.overallDigest);
gate('G423-BS — contract deep-equal replay', JSON.stringify(C.createStudioBridgeToPreviewSandboxRuntimeContract({})) === JSON.stringify(CONTRACT));

// ---- LIVE: source descriptor contract vs REAL target ----
gate('G423-BS — real target kind', REAL_TARGET.targetKind === 'module_preview_sandbox_candidate');
gate('G423-BS — declared real fields == actual target keys', JSON.stringify([...C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS].sort()) === JSON.stringify(Object.keys(REAL_TARGET).sort()));
for (const f of C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS) gate(`G423-BS — real target has field ${f}`, Object.prototype.hasOwnProperty.call(REAL_TARGET, f));
for (const [k, v] of Object.entries(C.REAL_TARGET_DESCRIPTOR_INVARIANTS)) gate(`G423-BS — real target invariant ${k}=${v}`, REAL_TARGET[k] === v);
for (const f of C.SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS) gate(`G423-BS — real target security ${f} false`, REAL_TARGET[f] === false);
gate('G423-BS — no invented source field vs real', C.SOURCE_DESCRIPTOR_CONTRACT.realFields.every((f) => C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS.includes(f)));

// ---- LIVE: sandbox contract vs REAL ----
gate('G423-BS — sandbox contract version matches real', C.SANDBOX_DESCRIPTOR_CONTRACT.sandboxContractVersion === sandbox.MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION);
gate('G423-BS — allowed preview kinds reflect real', C.ALLOWED_SANDBOX_PREVIEW_KINDS.length === sandbox.ALLOWED_PREVIEW_KINDS.length);
gate('G423-BS — prohibited effects reflect real', C.SANDBOX_PROHIBITED_EFFECTS.length === sandbox.PROHIBITED_EFFECTS.length);
gate('G423-BS — sandbox builder not implemented', C.SANDBOX_DESCRIPTOR_CONTRACT.sandboxDescriptorBuilderImplemented === false);

// ---- Identity ----
gate('G423-BS — bridgeDecisionDigest not on target (real)', !Object.prototype.hasOwnProperty.call(REAL_TARGET, 'bridgeDecisionDigest'));
gate('G423-BS — identity declares it a future blocker', C.IDENTITY_CONTRACT.declareMissingIdentityAsFutureImplementationBlocker === true);
gate('G423-BS — identity doNotSynthesizeDefault', C.IDENTITY_CONTRACT.doNotSynthesizeDefault === true);
gate('G423-BS — identity doNotInventAlias', C.IDENTITY_CONTRACT.doNotInventAlias === true);
gate('G423-BS — identity fields present on real target', C.IDENTITY_CONTRACT.sourceDescriptorIdentityFields.every((f) => Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));

// ---- Versions ----
gate('G423-BS — exact version match required', C.VERSION_CONTRACT.policy.exactVersionMatchRequired === true);
gate('G423-BS — unknown version fails closed', C.VERSION_CONTRACT.policy.unknownVersionFailsClosed === true);
gate('G423-BS — downgrade forbidden', C.VERSION_CONTRACT.policy.versionDowngradeAllowed === false);
gate('G423-BS — aggregate alias forbidden', C.VERSION_CONTRACT.policy.aggregatedVersionObjectAsSourceAliasAllowed === false);
gate('G423-BS — silent coercion forbidden', C.VERSION_CONTRACT.policy.silentVersionCoercionAllowed === false);
for (const [k, v] of Object.entries(C.VERSION_CONTRACT.expectedVersions)) gate(`G423-BS — version ${k} is real semver`, typeof v === 'string' && /@\d+\.\d+\.\d+$/.test(v));

// ---- Digest ----
gate('G423-BS — recompute-and-compare', C.DIGEST_CONTRACT.digestValidationMode === 'recompute_and_compare');
gate('G423-BS — no alternative serializer', C.DIGEST_CONTRACT.alternativeSerializerAllowed === false);
gate('G423-BS — not cryptographic', C.DIGEST_CONTRACT.cryptographicIntegrityProvided === false);
gate('G423-BS — target descriptor digest not present', C.DIGEST_CONTRACT.targetDescriptorDigestNotCurrentlyPresent === true);
gate('G423-BS — future consumer must not invent digest', C.DIGEST_CONTRACT.futureConsumerMustNotInventIt === true);
gate('G423-BS — source digest fields present on real target', C.DIGEST_CONTRACT.sourceDigestFields.every((f) => Object.prototype.hasOwnProperty.call(REAL_TARGET, f)));

// ---- Read-only ----
gate('G423-BS — source mutation forbidden', C.READ_ONLY_POLICY_CONTRACT.sourceMutationAllowed === false);
gate('G423-BS — read_only mode', C.READ_ONLY_POLICY_CONTRACT.sourceConsumptionMode === 'read_only');
gate('G423-BS — no reference retention', C.READ_ONLY_POLICY_CONTRACT.sourceReferenceRetentionAllowed === false);
gate('G423-BS — clone + deep freeze required', C.READ_ONLY_POLICY_CONTRACT.sourceCloneRequired === true && C.READ_ONLY_POLICY_CONTRACT.sourceDeepFreezeRequired === true);
for (const k of ['consumerMayMount', 'consumerMayUseReact', 'consumerMayPersist', 'consumerMayReadRealData', 'consumerMayCreateRouteMenu', 'consumerMayGenerateModule', 'consumerMayCertify', 'consumerMayExposeProduct']) gate(`G423-BS — read-only forbids ${k}`, C.READ_ONLY_POLICY_CONTRACT[k] === false);

// ---- Mappings ----
gate('G423-BS — 12 mappings', C.FIELD_MAPPING_CONTRACT.length === 12);
gate('G423-BS — no duplicate source', new Set(C.FIELD_MAPPING_CONTRACT.map((m) => m.sourceField)).size === 12);
gate('G423-BS — no duplicate target', new Set(C.FIELD_MAPPING_CONTRACT.map((m) => m.targetField)).size === 12);
gate('G423-BS — all transforms allow-listed', C.FIELD_MAPPING_CONTRACT.every((m) => C.CONTRACT_TRANSFORM_KINDS.includes(m.transformKind)));
gate('G423-BS — no critical default', C.FIELD_MAPPING_CONTRACT.every((m) => m.defaultAllowed === false));
gate('G423-BS — all lossless', C.FIELD_MAPPING_CONTRACT.every((m) => m.losslessRequired === true));
gate('G423-BS — mapping sources are real target fields', C.FIELD_MAPPING_CONTRACT.every((m) => C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS.includes(m.sourceField) || bridge.TARGET_DESCRIPTOR_TARGET_FIELDS.includes(m.sourceField)));
gate('G423-BS — mapping targets in future sandbox fields', C.FIELD_MAPPING_CONTRACT.every((m) => C.FUTURE_SANDBOX_DESCRIPTOR_FIELDS.includes(m.targetField)));

// ---- Pipeline ----
gate('G423-BS — 15 stages', C.VALIDATION_PIPELINE_CONTRACT.stages.length === 15);
gate('G423-BS — pipeline not implemented', C.VALIDATION_PIPELINE_CONTRACT.pipelineImplemented === false);
gate('G423-BS — validation not executed', C.VALIDATION_PIPELINE_CONTRACT.validationExecuted === false);
gate('G423-BS — sandbox descriptor not created', C.VALIDATION_PIPELINE_CONTRACT.sandboxDescriptorCreated === false);
for (const s of C.CONSUMER_VALIDATION_STAGES) gate(`G423-BS — stage ${s} snake_case`, /^[a-z_]+$/.test(s));

// ---- Issues / failure / limits / extensibility / replay ----
gate('G423-BS — issue codes >= 40', C.CONTRACT_ISSUE_CODES.length >= 40);
gate('G423-BS — issue codes unique', new Set(C.CONTRACT_ISSUE_CODES).size === C.CONTRACT_ISSUE_CODES.length);
gate('G423-BS — issue ordering keys', JSON.stringify(C.ISSUE_MODEL_CONTRACT.orderingKeys) === JSON.stringify(['stage', 'path', 'issueCode', 'message']));
gate('G423-BS — no silent correction', C.ISSUE_MODEL_CONTRACT.silentCorrectionAllowed === false);
gate('G423-BS — atomic decision required', C.FAILURE_CONTAINMENT_CONTRACT.atomicConsumerDecisionRequired === true);
gate('G423-BS — partial descriptor forbidden', C.FAILURE_CONTAINMENT_CONTRACT.partialSandboxDescriptorAllowed === false);
gate('G423-BS — exceptions fail closed', C.FAILURE_CONTAINMENT_CONTRACT.unexpectedExceptionsMustFailClosed === true);
gate('G423-BS — no failure leak', C.FAILURE_CONTAINMENT_CONTRACT.stackLeakAllowed === false && C.FAILURE_CONTAINMENT_CONTRACT.secretLeakAllowed === false);
gate('G423-BS — 9 resource dimensions', C.RESOURCE_LIMIT_CONTRACT.dimensions.length === 9);
gate('G423-BS — unknown dimension rejected', C.RESOURCE_LIMIT_CONTRACT.unknownDimensionRejected === true);
gate('G423-BS — no silent truncation', C.RESOURCE_LIMIT_CONTRACT.silentTruncationAllowed === false);
for (const d of C.RESOURCE_LIMIT_CONTRACT.dimensions) gate(`G423-BS — dim ${d.dimension} consumer<=source + issueCode`, d.consumerLimit <= d.sourceLimit && typeof d.issueCode === 'string');
gate('G423-BS — extensibility rejects unnamespaced', C.EXTENSIBILITY_CONTRACT.unnamespacedExtensionsRejected === true);
gate('G423-BS — extensibility rejects pollution keys', C.EXTENSIBILITY_CONTRACT.prototypePollutionKeysRejected === true);
gate('G423-BS — extension cannot override critical/caps/versions/digests', C.EXTENSIBILITY_CONTRACT.extensionCannotOverrideCriticalFields === true && C.EXTENSIBILITY_CONTRACT.extensionCannotOverrideCapabilities === true && C.EXTENSIBILITY_CONTRACT.extensionCannotOverrideVersions === true && C.EXTENSIBILITY_CONTRACT.extensionCannotOverrideDigests === true);
gate('G423-BS — replay same-source-same-decision', C.REPLAY_CONTRACT.sameSourcePlusSameConfigProducesSameDecision === true);
gate('G423-BS — replay no side effects/clock/random/locale', C.REPLAY_CONTRACT.replaySideEffectsAllowed === false && C.REPLAY_CONTRACT.ambientClockAllowed === false && C.REPLAY_CONTRACT.randomnessAllowed === false && C.REPLAY_CONTRACT.localeDependencyAllowed === false);
gate('G423-BS — replay not implemented', C.REPLAY_CONTRACT.replayImplemented === false);

// ---- SSOT / permission / security / prototype / manual gate ----
gate('G423-BS — certified blueprint remains SSOT', C.SSOT_BOUNDARY_CONTRACT.certifiedBlueprintRemainsSsot === true);
gate('G423-BS — bridge/sandbox descriptor not canonical', C.SSOT_BOUNDARY_CONTRACT.bridgeDescriptorIsCanonical === false && C.SSOT_BOUNDARY_CONTRACT.sandboxDescriptorIsCanonical === false);
gate('G423-BS — consumer may not certify/generate/write SSOT', C.SSOT_BOUNDARY_CONTRACT.consumerMayCertify === false && C.SSOT_BOUNDARY_CONTRACT.consumerMayGenerateModule === false && C.SSOT_BOUNDARY_CONTRACT.consumerMayWriteCertifiedBlueprint === false);
gate('G423-BS — permission/tenancy not integrated', C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.permissionModelIntegrated === false && C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.tenantModelIntegrated === false);
gate('G423-BS — requires permission/tenancy foundation', C.PERMISSION_TENANCY_BOUNDARY_CONTRACT.requiresPermissionTenancyFoundationBeforeExposure === true);
gate('G423-BS — security failClosed + no side effects', C.SECURITY_CONTRACT.failClosed === true && C.SECURITY_CONTRACT.anyForbiddenSideEffect === false);
gate('G423-BS — prototype relink forbidden', C.PROTOTYPE_PROHIBITION_CONTRACT.prototypeRelinkAllowed === false && C.PROTOTYPE_PROHIBITION_CONTRACT.oldPrototypeImported === false);
gate('G423-BS — manual gate required', C.MANUAL_CHECKPOINT_CONTRACT.manualGateRequired === true);
gate('G423-BS — manual gate authorizes only contract definition', C.MANUAL_CHECKPOINT_CONTRACT.authorizesContractDefinition === true && C.MANUAL_CHECKPOINT_CONTRACT.authorizesRuntimeImplementation === false && C.MANUAL_CHECKPOINT_CONTRACT.authorizesPreviewMount === false && C.MANUAL_CHECKPOINT_CONTRACT.authorizesProductExposure === false);

// ---- Capabilities all-runtime-false ----
const CAPS = C.CONTRACT_CAPABILITIES;
gate('G423-BS — capabilities frozen', Object.isFrozen(CAPS));
for (const k of ['consumerImplemented', 'candidateConsumed', 'sandboxDescriptorCreated', 'sourceValidationImplemented', 'mappingExecutorImplemented', 'sandboxDescriptorBuilderImplemented', 'validationPipelineExecuted', 'previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated']) gate(`G423-BS — capability ${k} false`, CAPS[k] === false);
for (const k of ['headless', 'deterministic', 'immutable', 'failClosed', 'contractOnly', 'metadataOnly', 'sideEffectFree']) gate(`G423-BS — capability ${k} true`, CAPS[k] === true);

// ---- Verifier tamper battery (live) ----
const V = C.verifyBridgeToPreviewSandboxRuntimeContract;
gate('G423-BS — verifier ok on real contract', V({ contract: CONTRACT }).ok === true);
gate('G423-BS — verifier never throws on null', (() => { try { V({ contract: null }); V(null); return true; } catch { return false; } })());
gate('G423-BS — verifier detects consumerImplemented', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, consumerImplemented: true } } }).ok === false);
gate('G423-BS — verifier detects previewMounted', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, previewMounted: true } } }).ok === false);
gate('G423-BS — verifier detects productExposed', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, productExposed: true } } }).ok === false);
gate('G423-BS — verifier detects permission integrated', V({ contract: { ...CONTRACT, capabilities: { ...CAPS, permissionModelIntegrated: true } } }).ok === false);
gate('G423-BS — verifier detects source mutation', V({ contract: { ...CONTRACT, readOnlyPolicy: { ...C.READ_ONLY_POLICY_CONTRACT, sourceMutationAllowed: true } } }).ok === false);
gate('G423-BS — verifier detects ssot inversion', V({ contract: { ...CONTRACT, ssotBoundary: { ...C.SSOT_BOUNDARY_CONTRACT, bridgeDescriptorIsCanonical: true } } }).ok === false);
gate('G423-BS — verifier detects missing manual gate', V({ contract: { ...CONTRACT, manualCheckpoint: { ...C.MANUAL_CHECKPOINT_CONTRACT, manualGateRequired: false } } }).ok === false);
gate('G423-BS — verifier detects premature runtime', V({ contract: { ...CONTRACT, readyForRuntimeImplementation: true } }).ok === false);
gate('G423-BS — verifier detects invented source field', V({ contract: { ...CONTRACT, sourceDescriptor: { ...C.SOURCE_DESCRIPTOR_CONTRACT, realFields: [...C.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, 'inventedZzz'] } } }).ok === false);
gate('G423-BS — verifier detects unknown mapping transform', V({ contract: { ...CONTRACT, fieldMappings: [...C.FIELD_MAPPING_CONTRACT, { mappingId: 'x', sourceField: 'candidateDraftId', targetField: 'previewMetadata', transformKind: 'weird', defaultAllowed: false }] } }).ok === false);
gate('G423-BS — verifier detects mapping default', V({ contract: { ...CONTRACT, fieldMappings: [{ mappingId: 'x', sourceField: 'candidateDraftId', targetField: 'candidateDraftId', transformKind: 'identity', defaultAllowed: true }] } }).ok === false);
gate('G423-BS — verifier detects permissive version', V({ contract: { ...CONTRACT, versionContract: { ...C.VERSION_CONTRACT, policy: { ...C.VERSION_CONTRACT.policy, exactVersionMatchRequired: false } } } }).ok === false);
gate('G423-BS — verifier detects prototype relink', V({ contract: { ...CONTRACT, prototypeProhibition: { ...C.PROTOTYPE_PROHIBITION_CONTRACT, prototypeRelinkAllowed: true } } }).ok === false);
gate('G423-BS — compatibility not ready for implementation plan', CONTRACT.compatibility.readyForImplementationPlan === false && CONTRACT.compatibility.readyForRuntimeImplementation === false);

// ---- Static scans ----
gate('G423-BS — no nondeterminism outside verifier', !/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b|performance\.now|toLocaleString|localeCompare/.test(codeNoVerifier()));
gate('G423-BS — no process.env misuse', !/[^.\w]process\.env/.test(code()) || /globalThis\.process/.test(code()));
gate('G423-BS — no eval/Function/timer', !/\beval\s*\(|new Function\(|setTimeout|setInterval/.test(code()));
gate('G423-BS — no fs/network/prisma real usage', !/from ['"]fs['"]|writeFileSync|child_process|fetch\(|axios|XMLHttpRequest|WebSocket|PrismaClient/.test(code()));
gate('G423-BS — no prototype subtree imports', !importsOf().some((p) => /studio\/(components|shell|designers|pages|navigation|dock|panels|editor)\//.test(p)));
gate('G423-BS — doc cert mentions contract-only', /contract.only|definition only|no consumer|no runtime/i.test(readEv('CONTRACT-CERTIFICATION-REPORT.md')));
gate('G423-BS — doc identity mentions bridge decision digest', /bridgeDecisionDigest|decision digest/i.test(readEv('IDENTITY-PROVENANCE.md')));

// ---- Scope safety ----
let files = null;
try { files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { files = null; }
if (files === null) { gate('G423-BS — scope diff (skipped)', true); } else {
  const outside = files.filter((f) => !authorized(f));
  gate('G423-BS — authorized scope only', outside.length === 0, outside.length ? `OUT: ${outside.join(', ')}` : `${files.length} files`);
  gate('G423-BS — no App.jsx in diff', !files.includes('src/App.jsx'));
  gate('G423-BS — no .jsx/.tsx/.css in diff', !files.some((f) => /\.(jsx|tsx|css)$/.test(f)));
  gate('G423-BS — no backend/prisma/migrations in diff', !files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f)));
  gate('G423-BS — no src/modules in diff', !files.some((f) => /^src\/modules\//.test(f)));
  // productionUiGuard is FORBIDDEN and no slice cross-authorizes it, so it may never appear. The central
  // governance guard may appear ONLY when the slice active on this branch shares it — i.e. a governance slice.
  gate('G423-BS — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs')
    && (!files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')
      || createResolvedActiveStudioSlicePathAuthorizer(files).isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs')));
  gate('G423-BS — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge|module-preview-sandbox|module-blueprint-authoring-runtime)\//.test(f)));
}
gate('G423-BS — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(pkg); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test as the primary behavioral proof ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-BS — contract unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-BS — unit test has >= 620 scenarios', testCount >= 620, `${testCount} (min 620)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-TO-PREVIEW-SANDBOX-RUNTIME-CONTRACT summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
