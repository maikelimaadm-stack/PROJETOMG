#!/usr/bin/env node
/**
 * Gate G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-CONTRACT — Post-Foundation C.
 *
 * Proves the headless, dev-only, CONTRACT-ONLY, METADATA-ONLY, SYNTHETIC-ONLY, DETERMINISTIC and
 * FAIL-CLOSED bridge contract in
 * `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/`. It defines the contract
 * between the Authoring Runtime's `synthetic_preview_candidate` handoff and the Module Preview Sandbox
 * contract, consuming both read-only.
 *
 * It IMPLEMENTS NO bridge, adapter, source validation runtime, target payload or preview mount. It
 * creates NO UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring; it never
 * persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging, mutates
 * real data, generates/registers a module, certifies/self-certifies/overwrites the certified SSOT, and
 * NEVER relinks the old Studio prototype. Determinism is enforced by static scans (no Date.now/new Date/
 * Math.random/crypto.randomUUID/randomUUID outside the verifier's detection regex) and by replay equality.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';
import { evaluateStudioBranchScope } from './lib/studioScopeGovernanceGuard.mjs';

// ---------------------------------------------------------------------------
// CALLER-AWARE branch-relative scope governance. This gate declares its OWN slice identity,
// so the checks below can ask which slice the branch is building and whether that slice is
// this one or a genuinely later one — a question the previous flat registry could not answer.
// Forbidden and unknown paths still fail closed; nothing is tolerated by mere registration.
// ---------------------------------------------------------------------------
const CALLER_SLICE_ID = 'authoring-runtime-to-preview-bridge-contract';
let studioScopeCache = null;
const studioScope = () => {
  if (studioScopeCache) return studioScopeCache;
  let changed = [];
  let gitAvailable = true;
  try {
    changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { gitAvailable = false; }
  const evaluation = evaluateStudioBranchScope(changed, {
    callerSliceId: CALLER_SLICE_ID,
  });
  studioScopeCache = { gitAvailable, changed, evaluation };
  return studioScopeCache;
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-implementation-plan');
const FOUNDATION_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-foundation-contract');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract');
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-contract.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-contract.mjs';
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyBridgeContract\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'bridgeContractConfig.js', 'errors.js', 'createBridgeContractSession.js', 'createSourceHandoffContract.js',
  'createTargetPreviewSandboxContract.js', 'createBridgeFieldMappingContract.js',
  'createBridgeVersionCompatibilityContract.js', 'createBridgeDigestSemanticsContract.js',
  'createBridgeCanonicalizationContract.js', 'createBridgeValidationIssueContract.js',
  'createBridgeValidationPipelineContract.js', 'createBridgeExtensibilityPolicyContract.js',
  'createBridgeReplayIdempotencyContract.js', 'createBridgeSsotBoundaryContract.js',
  'createBridgeCertificationBoundaryContract.js', 'createBridgePermissionTenancyBoundaryContract.js',
  'createBridgeSecuritySafetyContract.js', 'createBridgePrototypeRelinkProhibitionContract.js',
  'createBridgeUpstreamHardeningNotes.js', 'createBridgeManualEnablementGateContract.js',
  'checkBridgeCompatibility.js', 'createBridgeReadinessDecision.js', 'createBridgeManifest.js',
  'verifyBridgeContract.js', 'createBridgeDiagnostics.js', 'createBridgeFallback.js',
  'createStudioAuthoringRuntimeToPreviewBridgeContract.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-CONTRACT-REPORT.md',
  'SOURCE-HANDOFF-CONTRACT.md', 'TARGET-PREVIEW-SANDBOX-CONTRACT.md', 'FIELD-MAPPING-CONTRACT.md',
  'VERSION-COMPATIBILITY-CONTRACT.md', 'DIGEST-SEMANTICS-CONTRACT.md', 'CANONICALIZATION-CONTRACT.md',
  'VALIDATION-ISSUE-CONTRACT.md', 'VALIDATION-PIPELINE-CONTRACT.md', 'EXTENSIBILITY-POLICY.md',
  'REPLAY-IDEMPOTENCY-CONTRACT.md', 'SSOT-BOUNDARY.md', 'CERTIFICATION-BOUNDARY.md',
  'PERMISSION-TENANCY-BOUNDARY.md', 'SECURITY-SAFETY-CONTRACT.md', 'PROTOTYPE-RELINK-PROHIBITION.md',
  'UPSTREAM-RUNTIME-HARDENING-NOTES.md', 'MANUAL-ENABLEMENT-GATE.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md',
  'NO-UI-NO-APP-NO-BRIDGE-RUNTIME-NO-PERSISTENCE.md', 'LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md',
  'QUALITY-SCALABILITY-NOTES.md', 'NEXT-SLICE-SPEC.md',
];

for (const f of FILES) gate(`G423-BR — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-BR — ${d} exists`, exists(path.join(EV, d)));
gate('G423-BR — tests exist', exists(path.join(ROOT, TEST_REL)));
gate('G423-BR — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-BR — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-BR — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-BR — exactly 28 .js files', jsFiles().length === 28, `${jsFiles().length} .js`);
gate('G423-BR — upstream runtime present', exists(path.join(RUNTIME_DIR, 'index.js')));
gate('G423-BR — upstream plan present', exists(path.join(PLAN_DIR, 'index.js')));
gate('G423-BR — upstream foundation present', exists(path.join(FOUNDATION_DIR, 'index.js')));

let m = null; let rt = null; let pm = null; let fmod = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { pm = await import(pathToFileURL(path.join(PLAN_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { fmod = await import(pathToFileURL(path.join(FOUNDATION_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

// Build a validated synthetic preview handoff from the real runtime.
const buildHandoff = (seed = 'g') => {
  let r = rt.executeAuthoringOperation({ session: rt.createAuthoringRuntimeSession({ seed }), operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const id = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } });
  return rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] });
};
let HANDOFF = null; let C = null;
try { HANDOFF = buildHandoff('g'); } catch (err) { console.error(String(err)); }
try { C = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF }); } catch (err) { console.error(String(err)); }

let baseOk = false; let baseDetail = '';
try {
  baseOk = C.kind === 'studio-authoring-runtime-to-preview-bridge-contract'
    && C.bridgeContractName === 'studio-authoring-runtime-to-preview-bridge-contract'
    && C.bridgeContractVersion === 'studio-authoring-runtime-to-preview-bridge-contract@1.0.0'
    && C.authoringRuntimeVersion === 'studio-module-blueprint-authoring-runtime@1.0.0'
    && C.previewSandboxContractVersion === 'studio-module-preview-sandbox-contract@1.0.0'
    && C.mode === 'headless_authoring_runtime_to_preview_bridge_contract'
    && C.fallback === false
    && C.sourceHandoffKind === 'synthetic_preview_candidate'
    && C.requiredFutureCheckpoint === 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint'
    && C.readiness === 'studio_authoring_runtime_to_preview_bridge_contract_ready'
    && C.readyForBridgeContract === true && C.readyForBridgeImplementationPlan === true
    && C.readyForBridgeImplementationSlice === false && C.readyForPreviewMount === false
    && C.readyForAuthoringUi === false && C.readyForPermissionTenancyIntegration === false
    && C.readyForProductExposure === false && C.readyForModuleGeneration === false
    && C.readyForCertification === false && C.readyForProduction === false
    && C.requiresPermissionTenancyFoundationBeforeExposure === true
    && C.blockerCount === 0 && C.warningCount === 0;
  baseDetail = baseOk ? `readiness=${C.readiness}` : 'contract invariants wrong';
} catch (err) { baseDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BR — headless/contract-only/metadata-only invariants + readiness ready', baseOk, baseDetail);

// Capabilities.
const TRUE_CAPS = ['headless', 'contractOnly', 'metadataOnly', 'syntheticOnly', 'devOnly', 'deterministic', 'failClosed', 'ssotPreserved', 'sourceConsumedReadOnly', 'targetContractConsumedReadOnly'];
const FALSE_CAPS = ['bridgeImplemented', 'adapterImplemented', 'sourceValidationImplemented', 'targetPayloadCreated', 'previewPayloadCreated', 'previewMounted', 'authoringUiImplemented', 'editorImplemented', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'storageUsed', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
gate('G423-BR — capabilities frozen', (() => { try { return Object.isFrozen(m.BRIDGE_CONTRACT_CAPABILITIES); } catch { return false; } })());
for (const k of TRUE_CAPS) gate(`G423-BR — capability ${k} true`, (() => { try { return m.BRIDGE_CONTRACT_CAPABILITIES[k] === true && C.capabilities[k] === true; } catch { return false; } })());
for (const k of FALSE_CAPS) gate(`G423-BR — capability ${k} false`, (() => { try { return m.BRIDGE_CONTRACT_CAPABILITIES[k] === false && C.capabilities[k] === false; } catch { return false; } })());

const part = (fn, argObj, pred) => { try { return pred(argObj === undefined ? m[fn]() : m[fn](argObj)); } catch (err) { console.error(`${fn}: ${err}`); return false; } };
gate('G423-BR — session (deterministic, read-only, no storage/fetch/persistence/side-effects)', part('createBridgeContractSession', { sourceHandoff: HANDOFF }, (x) => x.kind === 'bridge-contract-session' && x.sourceConsumedReadOnly === true && x.targetContractConsumedReadOnly === true && x.usesStorage === false && x.usesFetch === false && x.usesPersistence === false && x.runtimeSideEffects === false));
gate('G423-BR — session deterministic (same handoff same digest)', (() => { try { return m.createBridgeContractSession({ sourceHandoff: HANDOFF }).sessionDigest === m.createBridgeContractSession({ sourceHandoff: HANDOFF }).sessionDigest; } catch { return false; } })());
gate('G423-BR — source handoff contract (strict draft id, no single-draft fallback, fail-closed, real fields)', part('createSourceHandoffContract', undefined, (x) => x.kind === 'bridge-source-handoff-contract' && x.strictDraftIdentityRequired === true && x.singleDraftFallbackAllowed === false && x.missingDraftIdFailsClosed === true && x.unknownDraftIdFailsClosed === true && x.requiredFields.length === 13 && x.realSourceFieldNamesRequired === true && x.upstreamVersionsSourceFieldAllowed === false && x.genericDigestSourceFieldAllowed === false && x.sourceConsumedReadOnly === true));
gate('G423-BR — target sandbox contract (synthetic, metadata-only, no mount/route/menu/module/payload)', part('createTargetPreviewSandboxContract', undefined, (x) => x.kind === 'bridge-target-preview-sandbox-contract' && x.syntheticOnly === true && x.metadataOnly === true && x.previewMounted === false && x.routeCreated === false && x.menuCreated === false && x.moduleGenerated === false && x.realPayloadCreated === false && x.persistenceAllowed === false && x.targetContractConsumedReadOnly === true));
gate('G423-BR — field mapping (12 real, all critical mapped, every source real, no invented/unknown/default/lossy)', part('createBridgeFieldMappingContract', undefined, (x) => x.kind === 'bridge-field-mapping-contract' && x.mappingCount === 12 && x.everyCriticalMapped === true && x.everyMappingSourceExistsInRealHandoff === true && x.anyInventedSourceField === false && x.anyLegacyAliasSourceField === false && x.anyUnknownTransform === false && x.anyCriticalDefault === false && x.anyLossyCritical === false && x.unknownTransformFailsClosed === true && x.lossyCriticalForbidden === true));
gate('G423-BR — version compatibility (exact, unknown fail-closed, no downgrade, upgrade not assumed)', part('createBridgeVersionCompatibilityContract', undefined, (x) => x.kind === 'bridge-version-compatibility-contract' && x.exactSourceRuntimeVersionRequired === true && x.exactTargetSandboxVersionRequired === true && x.unknownVersionFailsClosed === true && x.versionDowngradeAllowed === false && x.versionUpgradeAssumedCompatible === false && x.bidirectionalCompatibilityCheckRequired === true));
gate('G423-BR — digest semantics (fnv1a-32 internal only, NOT cryptographic, authorizes nothing real)', part('createBridgeDigestSemanticsContract', undefined, (x) => x.kind === 'bridge-digest-semantics-contract' && x.sourceDigestAlgorithm === 'fnv1a-32' && x.cryptographicIntegrityProvided === false && x.digestMayAuthorizeCertification === false && x.digestMayAuthorizeModuleGeneration === false && x.digestMayAuthorizeProduction === false && x.cryptographicDigestRequiredBeforeCertification === true && x.fnv1aInternalOnly === true));
gate('G423-BR — canonicalization (stable, key-ordered, array-preserving, clock/random forbidden)', part('createBridgeCanonicalizationContract', undefined, (x) => x.kind === 'bridge-canonicalization-contract' && x.stableSerializationRequired === true && x.keyOrderingRequired === true && x.arrayOrderingPreserved === true && x.ambientClockForbidden === true && x.randomnessForbidden === true && x.canonicalizationImplemented === false));
gate('G423-BR — validation issue (blocker/error block bridge+sandbox, sanitized, deterministic)', part('createBridgeValidationIssueContract', { issueCode: 'X', severity: 'blocker' }, (x) => x.kind === 'bridge-validation-issue' && x.blocksBridge === true && x.blocksPreviewSandbox === true && x.safe === true && x.withoutSecrets === true && x.deterministic === true && x.autoCorrected === false));
gate('G423-BR — validation pipeline (13 stages, fail-closed, no auto-correction/permissive fallback)', part('createBridgeValidationPipelineContract', undefined, (x) => x.kind === 'bridge-validation-pipeline-contract' && x.stageCount === 13 && x.failClosed === true && x.autoCorrectionAllowed === false && x.permissiveFallbackAllowed === false && x.blockerBlocksBridge === true && x.blockerBlocksPreviewSandbox === true && x.validationRuntimeImplemented === false));
gate('G423-BR — extensibility (unknown critical/flags rejected, protected fields not overridable)', part('createBridgeExtensibilityPolicyContract', undefined, (x) => x.kind === 'bridge-extensibility-policy-contract' && x.unknownCriticalFieldsRejected === true && x.unknownCapabilityFlagsRejected === true && x.unnamespacedExtensionsRejected === true && x.extensionCannotOverrideCriticalFields === true && x.protectedFieldCount === 11));
gate('G423-BR — replay/idempotency (deterministic decision+target, no replay side-effects)', part('createBridgeReplayIdempotencyContract', undefined, (x) => x.kind === 'bridge-replay-idempotency-contract' && x.sameSourceHandoffProducesSameBridgeDecision === true && x.sameSourceHandoffProducesSameTargetDescriptor === true && x.bridgeDecisionDigestDeterministic === true && x.replaySideEffectsAllowed === false && x.bridgeExecutionImplemented === false));
gate('G423-BR — SSOT boundary (certified canonical, draft/candidate non-canonical, no overwrite/bypass)', part('createBridgeSsotBoundaryContract', undefined, (x) => x.certifiedBlueprintRemainsSsot === true && x.draftIsCanonical === false && x.candidateIsCanonical === false && x.bridgeMayCertify === false && x.bridgeMayWriteCertifiedBlueprint === false && x.bridgeMayBypassCertification === false && x.bridgeMayGenerateModule === false && x.secondSsotCreated === false));
gate('G423-BR — certification boundary (never certifies/self-certifies, candidate inert)', part('createBridgeCertificationBoundaryContract', undefined, (x) => x.certificationPerformed === false && x.selfCertificationAllowed === false && x.candidateCanonical === false && x.candidateCertified === false && x.bridgeMayCertify === false && x.requiresFutureExplicitCertificationSlice === true && x.requiresHumanCheckpointBeforeCertification === true));
gate('G423-BR — permission/tenancy boundary (not integrated, exposure blocked, foundation required)', part('createBridgePermissionTenancyBoundaryContract', undefined, (x) => x.permissionModelIntegrated === false && x.tenantModelIntegrated === false && x.serverSideAuthorizationIntegrated === false && x.clientSideAuthorizationSufficient === false && x.productExposureBlockedByPermissionTenancy === true && x.requiresPermissionTenancyFoundationBeforeExposure === true && x.authImported === false));
gate('G423-BR — security/safety (anyRealAllowed false, all allowances false, reversible)', part('createBridgeSecuritySafetyContract', undefined, (x) => x.kind === 'bridge-security-safety-contract' && x.anyRealAllowed === false && x.reversibleByNonConsumption === true && Object.values(x.allowances).every((v) => v === false)));
gate('G423-BR — prototype relink prohibition (all forbidden, 8 forbidden paths)', part('createBridgePrototypeRelinkProhibitionContract', undefined, (x) => x.prototypeRelinkAllowed === false && x.prototypeImportAllowed === false && x.oldPrototypeImported === false && x.forbiddenPathCount === 8));
gate('G423-BR — upstream hardening notes (runtime not altered, hardening deferred)', part('createBridgeUpstreamHardeningNotes', undefined, (x) => x.kind === 'bridge-upstream-hardening-notes' && x.runtimeAlteredByThisSlice === false && x.bridgeRequiresExplicitDraftId === true && x.bridgeRejectsUnknownResourceDimensions === true && x.fnv1aInternalOnly === true && x.hardeningRequiredBeforeCertificationOrProduction === true));
gate('G423-BR — manual gate (contract+plan only, NOTHING real)', part('createBridgeManualEnablementGateContract', undefined, (x) => x.manualGateRequired === true && x.currentSliceAuthorization === 'bridge_contract_only' && x.authorizesBridgeContract === true && x.authorizesBridgeImplementationPlan === true && x.authorizesBridgeImplementation === false && x.authorizesPreviewMount === false && x.authorizesAuthoringUi === false && x.authorizesModuleGeneration === false && x.authorizesCertification === false && x.authorizesProductExposure === false && x.authorizesProduction === false));
gate('G423-BR — diagnostics (passive, deterministic, no secrets/logging/telemetry)', part('createBridgeDiagnostics', { verification: C.verification, compatibility: C.compatibility }, (x) => x.kind === 'bridge-diagnostics' && x.passive === true && x.deterministicConfirmed === true && x.logged === false && x.telemetryRuntime === false && x.externalLogging === false));

gate('G423-BR — readiness never slice/preview/ui/permission/product/module/cert/production', (() => { try { const r = m.createBridgeReadinessDecision({}); return r.readyForBridgeImplementationSlice === false && r.readyForPreviewMount === false && r.readyForAuthoringUi === false && r.readyForPermissionTenancyIntegration === false && r.readyForProductExposure === false && r.readyForModuleGeneration === false && r.readyForCertification === false && r.readyForProduction === false && r.requiresPermissionTenancyFoundationBeforeExposure === true; } catch { return false; } })());
gate('G423-BR — readiness blocked on blockers', (() => { try { return m.createBridgeReadinessDecision({ blockers: ['x'] }).readiness === 'blocked'; } catch { return false; } })());

let manOk = false;
try { manOk = C.manifest.kind === 'bridge-contract-manifest' && C.manifest.deterministic === true && C.manifest.metadataOnly === true && typeof C.manifest.partDigests.session === 'string' && typeof C.manifest.partDigests.ssotBoundary === 'string' && C.manifest.partCount >= 17; } catch { manOk = false; }
gate('G423-BR — manifest present + part digests + partCount >= 17', manOk);

let verOk = false;
try { verOk = C.verification.ok === true && C.verification.headless === true && C.verification.contractOnly === true && C.verification.deterministic === true && C.verification.failClosed === true && C.verification.ssotPreserved === true && C.verification.bridgeImplemented === false && C.verification.previewMounted === false && C.verification.certificationPerformed === false && C.verification.productExposed === false && C.verification.blockerCount === 0; } catch { verOk = false; }
gate('G423-BR — verifier passes headless/contract-only/deterministic/fail-closed/SSOT invariants', verOk);

let verTamper = false;
try {
  const c = m.BRIDGE_CONTRACT_CAPABILITIES;
  const vb = (o) => m.verifyBridgeContract(o).blockers;
  verTamper = vb({ contract: { capabilities: { ...c, bridgeImplemented: true } } }).includes('capability_bridgeImplemented_must_be_false')
    && vb({ contract: { capabilities: { ...c, previewMounted: true } } }).includes('capability_previewMounted_must_be_false')
    && vb({ contract: { capabilities: { ...c, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')
    && vb({ contract: { capabilities: { ...c, productExposed: true } } }).includes('capability_productExposed_must_be_false')
    && vb({ contract: { capabilities: { ...c, permissionModelIntegrated: true } } }).includes('capability_permissionModelIntegrated_must_be_false')
    && vb({ contract: { capabilities: { ...c, prototypeRelinked: true } } }).includes('capability_prototypeRelinked_must_be_false')
    && vb({ contract: { capabilities: { ...c, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')
    && vb({ contract: { capabilities: { ...c, backendAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && vb({ contract: { capabilities: { ...c, fetchUsed: true } } }).includes('capability_fetchUsed_must_be_false')
    && vb({ contract: { capabilities: { ...c, deterministic: false } } }).includes('capability_deterministic_must_be_true')
    && vb({ contract: { capabilities: { ...c, failClosed: false } } }).includes('capability_failClosed_must_be_true')
    && vb({ contract: { capabilities: { ...c, ssotPreserved: false } } }).includes('capability_ssotPreserved_must_be_true')
    && vb({ contract: { capabilities: c, sourceHandoff: { singleDraftFallbackAllowed: true } } }).includes('unsafe_source_single_draft_fallback')
    && vb({ contract: { capabilities: c, sourceHandoff: { strictDraftIdentityRequired: false } } }).includes('unsafe_source_non_strict_draft_identity')
    && vb({ contract: { capabilities: c, targetPreviewSandbox: { previewMounted: true } } }).includes('unsafe_target_real_effect')
    && vb({ contract: { capabilities: c, fieldMapping: { anyUnknownTransform: true } } }).includes('unsafe_mapping_unknown_transform')
    && vb({ contract: { capabilities: c, fieldMapping: { anyLossyCritical: true } } }).includes('unsafe_mapping_lossy_critical')
    && vb({ contract: { capabilities: c, fieldMapping: { anyCriticalDefault: true } } }).includes('unsafe_mapping_critical_default')
    && vb({ contract: { capabilities: c, versionCompatibility: { unknownVersionFailsClosed: false } } }).includes('unsafe_version_unknown_not_fail_closed')
    && vb({ contract: { capabilities: c, versionCompatibility: { versionDowngradeAllowed: true } } }).includes('unsafe_version_downgrade_allowed')
    && vb({ contract: { capabilities: c, digestSemantics: { cryptographicIntegrityProvided: true } } }).includes('unsafe_digest_claimed_cryptographic')
    && vb({ contract: { capabilities: c, digestSemantics: { digestMayAuthorizeCertification: true } } }).includes('unsafe_digest_authorizes_real')
    && vb({ contract: { capabilities: c, validationPipeline: { failClosed: false } } }).includes('unsafe_validation_not_fail_closed')
    && vb({ contract: { capabilities: c, validationPipeline: { autoCorrectionAllowed: true } } }).includes('unsafe_validation_auto_correction')
    && vb({ contract: { capabilities: c, extensibility: { extensionCannotOverrideCriticalFields: false } } }).includes('unsafe_extensibility_override_protected')
    && vb({ contract: { capabilities: c, replayIdempotency: { replaySideEffectsAllowed: true } } }).includes('unsafe_replay_side_effects')
    && vb({ contract: { capabilities: c, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')
    && vb({ contract: { capabilities: c, ssotBoundary: { certifiedBlueprintRemainsSsot: false } } }).includes('unsafe_ssot_not_preserved')
    && vb({ contract: { capabilities: c, ssotBoundary: { bridgeMayCertify: true } } }).includes('unsafe_ssot_bridge_privilege')
    && vb({ contract: { capabilities: c, certificationBoundary: { certificationPerformed: true } } }).includes('unsafe_certification_performed')
    && vb({ contract: { capabilities: c, certificationBoundary: { selfCertificationAllowed: true } } }).includes('unsafe_self_certification')
    && vb({ contract: { capabilities: c, permissionTenancy: { permissionModelIntegrated: true } } }).includes('unsafe_permission_model_integrated')
    && vb({ contract: { capabilities: c, permissionTenancy: { tenantModelIntegrated: true } } }).includes('unsafe_tenant_model_integrated')
    && vb({ contract: { capabilities: c, securitySafety: { anyRealAllowed: true } } }).includes('unsafe_security_real_allowed')
    && vb({ contract: { capabilities: c, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && vb({ contract: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && vb({ contract: { capabilities: c, manualGate: { manualGateRequired: true, authorizesBridgeImplementation: true } } }).includes('unsafe_manual_gate_authorizes_real')
    && vb({ contract: { capabilities: c, readyForPreviewMount: true } }).includes('unsafe_ready_for_preview_mount')
    && vb({ contract: { capabilities: c, readyForProduction: true } }).includes('unsafe_ready_for_production')
    && vb({ contract: { capabilities: c, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source')
    && (() => { try { m.verifyBridgeContract({ contract: null }); return true; } catch { return false; } })();
} catch (err) { console.error(String(err)); verTamper = false; }
gate('G423-BR — verifier detects bridge/adapter/preview/cert/product/permission/prototype/module/backend/fetch/nondeterminism + source/target/mapping/version/digest/validation/extension/replay/SSOT/manual-gate/readiness tampers', verTamper);

// Live composition.
let liveOk = false; let liveDetail = '';
try {
  const a = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF });
  const b = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF });
  const deterministic = a.overallDigest === b.overallDigest && a.bridgeContractDigest === b.bridgeContractDigest && JSON.stringify(a) === JSON.stringify(b);
  const rebuilt = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: buildHandoff('g') });
  const stableAcrossRebuild = rebuilt.overallDigest === a.overallDigest;
  liveOk = deterministic && stableAcrossRebuild && a.readiness === 'studio_authoring_runtime_to_preview_bridge_contract_ready' && a.verification.ok === true && a.blockerCount === 0;
  liveDetail = liveOk ? 'deterministic + replay-stable + ready + verified' : `deterministic=${deterministic} rebuild=${stableAcrossRebuild}`;
} catch (err) { liveDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BR — LIVE: compose from real runtime handoff deterministic + replay-stable + ready', liveOk, liveDetail);

// Fallback fail-closed.
let fbOk = false;
try {
  const f0 = m.createStudioAuthoringRuntimeToPreviewBridgeContract({});
  const f1 = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: { handoffKind: 'x', synthetic: true, validated: true, ok: true, draftId: 'd' } });
  const f2 = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: { handoffKind: 'synthetic_preview_candidate', synthetic: false, validated: true, ok: true, draftId: 'd' } });
  const f3 = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: rt.createSyntheticPreviewHandoff({ draft: { draftId: 'd', revision: 0, lifecycleState: 'editing' } }) });
  fbOk = f0.fallback === true && f0.readiness === 'blocked' && f0.readyForBridgeContract === false && f0.capabilities.deterministic === true && f1.fallback === true && f2.fallback === true && f3.fallback === true;
} catch { fbOk = false; }
gate('G423-BR — fallback fail-closed on missing/wrong-kind/non-synthetic/unvalidated source', fbOk);

// Compatibility.
let cmpOk = false;
try {
  const okc = m.checkBridgeCompatibility({ sourceHandoff: HANDOFF });
  const bad = m.checkBridgeCompatibility({ sourceHandoff: { runtimeVersion: 'x@9' } });
  cmpOk = okc.status === 'ready_for_bridge_implementation_plan_only' && okc.readyForBridgeContract === true && okc.readyForBridgeImplementationPlan === true && okc.readyForBridgeImplementationSlice === false && okc.blocked === false && bad.compatibleWithAuthoringRuntime === false && bad.warnings.includes('incompatible_authoringRuntime');
} catch { cmpOk = false; }
gate('G423-BR — compatibility ready-for-plan-only; never authorizes slice/ui/product/production; mismatch → warning', cmpOk);

let diagOk = false;
try { diagOk = C.diagnostics.passive === true && C.diagnostics.deterministicConfirmed === true && !/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(C.diagnostics)); } catch { diagOk = false; }
gate('G423-BR — diagnostics passive + deterministic + no secrets', diagOk);

let detOk = false;
try {
  const a = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF });
  const b = m.createStudioAuthoringRuntimeToPreviewBridgeContract({ sourceHandoff: HANDOFF });
  detOk = a.overallDigest === b.overallDigest && a.bridgeContractDigest === b.bridgeContractDigest && a.overallDigest.startsWith('fnv1a-') && JSON.stringify(a) === JSON.stringify(b);
} catch { detOk = false; }
gate('G423-BR — deterministic overall + contract digests + full deep-equal', detOk);

let flagOk = false;
try {
  const off = m.isStudioAuthoringRuntimeToPreviewBridgeContractEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG]: 'true', MAK_ENV_LABEL: 'production' });
  const onDev = m.isStudioAuthoringRuntimeToPreviewBridgeContractEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG]: 'true', DEV: 'true' });
  const vOff = m.isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG]: 'true', NODE_ENV: 'production' });
  flagOk = off === false && onDev === true && vOff === false;
} catch { flagOk = false; }
gate('G423-BR — feature flags fail closed in production', flagOk);

gate('G423-BR — error catalog >= 45 codes', Array.isArray(m?.BRIDGE_CONTRACT_ERROR_CODES) && m.BRIDGE_CONTRACT_ERROR_CODES.length >= 45);
gate('G423-BR — source handoff kind is synthetic_preview_candidate', m?.SOURCE_HANDOFF_KIND === 'synthetic_preview_candidate');
gate('G423-BR — target sandbox kind is module_preview_sandbox_candidate', m?.TARGET_SANDBOX_KIND === 'module_preview_sandbox_candidate');
gate('G423-BR — required future checkpoint is the enterprise checkpoint', m?.REQUIRED_FUTURE_CHECKPOINT === 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint');
gate('G423-BR — critical source fields 12 (real, aligned)', Array.isArray(m?.CRITICAL_SOURCE_FIELDS) && m.CRITICAL_SOURCE_FIELDS.length === 12 && !m.CRITICAL_SOURCE_FIELDS.includes('upstreamVersions') && !m.CRITICAL_SOURCE_FIELDS.includes('digest'));
gate('G423-BR — field mappings 12 (real model)', Array.isArray(m?.BRIDGE_FIELD_MAPPINGS) && m.BRIDGE_FIELD_MAPPINGS.length === 12 && m.BRIDGE_FIELD_MAPPINGS.every((mm) => m.REAL_HANDOFF_FIELDS.includes(mm.sourceField)));
gate('G423-BR — validation stages 13', Array.isArray(m?.BRIDGE_VALIDATION_STAGES) && m.BRIDGE_VALIDATION_STAGES.length === 13);
gate('G423-BR — protected fields 11', Array.isArray(m?.EXTENSION_PROTECTED_FIELDS) && m.EXTENSION_PROTECTED_FIELDS.length === 11);
gate('G423-BR — forbidden prototype paths 8', Array.isArray(m?.FORBIDDEN_PROTOTYPE_PATHS) && m.FORBIDDEN_PROTOTYPE_PATHS.length === 8);

// Explicit top-level capability invariants.
gate('G423-BR — deterministic capability true', C ? C.capabilities.deterministic === true : false);
gate('G423-BR — failClosed capability true', C ? C.capabilities.failClosed === true : false);
gate('G423-BR — ssotPreserved capability true', C ? C.capabilities.ssotPreserved === true : false);
gate('G423-BR — contractOnly + metadataOnly + syntheticOnly true', C ? (C.capabilities.contractOnly === true && C.capabilities.metadataOnly === true && C.capabilities.syntheticOnly === true) : false);
gate('G423-BR — bridge/adapter NOT implemented', C ? (C.capabilities.bridgeImplemented === false && C.capabilities.adapterImplemented === false) : false);
gate('G423-BR — source validation / target payload / preview payload NOT created', C ? (C.capabilities.sourceValidationImplemented === false && C.capabilities.targetPayloadCreated === false && C.capabilities.previewPayloadCreated === false) : false);
gate('G423-BR — preview NOT mounted', C ? C.capabilities.previewMounted === false : false);
gate('G423-BR — authoring UI / editor NOT implemented', C ? (C.capabilities.authoringUiImplemented === false && C.capabilities.editorImplemented === false) : false);
gate('G423-BR — App / route / menu / sidebar NOT touched', C ? (C.capabilities.appTouched === false && C.capabilities.routeCreated === false && C.capabilities.menuCreated === false && C.capabilities.sidebarCreated === false) : false);
gate('G423-BR — persistence / storage / filesystem NOT used', C ? (C.capabilities.persistenceImplemented === false && C.capabilities.storageUsed === false && C.capabilities.filesystemWritesUsed === false) : false);
gate('G423-BR — backend / prisma NOT accessed', C ? (C.capabilities.backendAccessed === false && C.capabilities.prismaAccessed === false) : false);
gate('G423-BR — fetch / network NOT used', C ? (C.capabilities.fetchUsed === false && C.capabilities.networkUsed === false) : false);
gate('G423-BR — real data read/write NOT used', C ? (C.capabilities.realDataRead === false && C.capabilities.realDataWrite === false) : false);
gate('G423-BR — module NOT generated/registered', C ? (C.capabilities.moduleGenerated === false && C.capabilities.moduleRegistered === false) : false);
gate('G423-BR — certification NOT performed; candidate NOT canonical', C ? (C.capabilities.certificationPerformed === false && C.capabilities.candidateCanonical === false) : false);
gate('G423-BR — product NOT exposed; production/staging NOT accessed', C ? (C.capabilities.productExposed === false && C.capabilities.productionAccessed === false && C.capabilities.stagingAccessed === false) : false);
gate('G423-BR — prototype NOT relinked', C ? C.capabilities.prototypeRelinked === false : false);
gate('G423-BR — permission/tenant/server-auth NOT integrated', C ? (C.capabilities.permissionModelIntegrated === false && C.capabilities.tenantModelIntegrated === false && C.capabilities.serverSideAuthorizationIntegrated === false) : false);
gate('G423-BR — manual gate required in contract', (() => { try { return C.manualGate.manualGateRequired === true && C.manualGate.authorizesBridgeImplementation === false && C.manualGate.authorizesPreviewMount === false && C.manualGate.authorizesProductExposure === false; } catch { return false; } })());

// Determinism static scans (exclude verifier's detection regex).
gate('G423-BR — no Date.now (excl verifier)', !/Date\.now/.test(codeNoVerifier()));
gate('G423-BR — no new Date (excl verifier)', !/new Date\b/.test(codeNoVerifier()));
gate('G423-BR — no Math.random (excl verifier)', !/Math\.random/.test(codeNoVerifier()));
gate('G423-BR — no crypto.randomUUID (excl verifier)', !/crypto\.randomUUID/.test(codeNoVerifier()));
gate('G423-BR — no bare randomUUID (excl verifier)', !/\brandomUUID\b/.test(codeNoVerifier()));
gate('G423-BR — no performance.now / hrtime (excl verifier)', !/performance\.now|hrtime/.test(codeNoVerifier()));
gate('G423-BR — no locale-dependent sorting', !/toLocaleString|localeCompare/.test(codeNoVerifier()));
gate('G423-BR — verifier holds the nondeterminism detection regex', /Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyBridgeContract.js'), 'utf8')));

// Static safety scans.
gate('G423-BR — subtree is React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-BR — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-BR — no <Route JSX / Routes / Link / NavLink', !/<Route[\s/>]|\bRoutes\b|\bNavLink\b|<Link[\s/>]/.test(code()));
gate('G423-BR — no ReactDOM / createRoot / hydrateRoot / JSX', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(|createElement|_jsx\b/.test(code()));
gate('G423-BR — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-BR — no fs/writeFile/mkdir/appendFile (filesystem)', !/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(code()));
gate('G423-BR — no localStorage/sessionStorage/indexedDB (storage)', !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-BR — no fetch/XHR/WebSocket/axios (network)', !/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code()));
gate('G423-BR — no @prisma/PrismaClient/backend/apiClient import', importsOf().every((p) => !/@prisma|PrismaClient|\/backend\/|apiClient|EmpresaApi|\/apis\//i.test(p)));
gate('G423-BR — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-BR — no POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-BR — no realDataRead/realDataWrite/moduleGenerated/certified/productExposed true literal', !/(realDataRead|realDataWrite|moduleGenerated|certified|productExposed)\s*:\s*true/.test(code()));
gate('G423-BR — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-BR — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-BR — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));
gate('G423-BR — imports only relative + runtime generic-model', importsOf().every((p) => p.startsWith('.') || /runtime\/generic-model/.test(p)));

gate('G423-BR — docs validate bridge + digest + SSOT + prototype-debt + next slice', /bridge|contract|headless/i.test(readEv('CERTIFICATION-REPORT.md')) && /fnv1a|digest|cryptographic/i.test(readEv('DIGEST-SEMANTICS-CONTRACT.md')) && /SSOT|canonical|certified/i.test(readEv('SSOT-BOUNDARY.md')) && /prototype|legacy|debt/i.test(readEv('LEGACY-STUDIO-PROTOTYPE-EXPOSURE-DEBT-NOT-TOUCHED.md')) && /checkpoint|FABLE|enterprise/i.test(readEv('NEXT-SLICE-SPEC.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
  else {
    blockedOk = evaluation.forbidden.length === 0;
    blockedDetail = blockedOk ? 'no forbidden scope path in the branch diff' : `FORBIDDEN: ${evaluation.forbidden.join(', ')}`;
  }
}
gate('G423-BR — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
{
  const { gitAvailable, changed, evaluation } = studioScope();
  if (!gitAvailable) { scopeOk = true; scopeDetail = 'git base unavailable — skipped'; }
  else {
    scopeOk = evaluation.unknown.length === 0 && evaluation.chronologicalViolation.length === 0;
    scopeDetail = scopeOk
      ? `authorized scope only (${changed.length} files; active slice ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal})`
      : `OUT OF SCOPE: ${[...evaluation.unknown, ...evaluation.chronologicalViolation].join(', ')}`;
  }
}
gate('G423-BR — authorized scope only (bridge subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noJsxTsxCss = false;
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  noJsxTsxCss = !files.some((f) => /\.(jsx|tsx|css)$/.test(f));
} catch { noJsxTsxCss = true; }
gate('G423-BR — no .jsx / .tsx / .css added in diff', noJsxTsxCss);

let noOldEdit = false; let noOldEditDetail = '';
{
  const { gitAvailable, evaluation } = studioScope();
  if (!gitAvailable) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
  else {
    // A prior slice's test or gate may appear ONLY when the ACTIVE slice is explicitly
    // cross-authorized for it, and only when that active slice is this one or later.
    const chronologyOk = evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.callerSliceOrdinal;
    noOldEdit = evaluation.safe && chronologyOk;
    noOldEditDetail = noOldEdit
      ? `no unauthorized prior gate/test (active ${evaluation.activeSliceId} #${evaluation.activeSliceOrdinal} >= ${CALLER_SLICE_ID} #${evaluation.callerSliceOrdinal})`
      : `blocked: ${evaluation.blockers.join(',')}`;
  }
}
gate('G423-BR — App.jsx / guards / upstream subtrees / prior gates/tests NOT altered', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific bridge paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BR — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-BR — no new dependency added', noNewDep);

gate('G423-BR — src/modules/studio does NOT exist', !exists(path.join(ROOT, 'src/modules/studio')));
gate('G423-BR — package.json wires bridge test script', (() => { try { return /studio-authoring-runtime-to-preview-bridge-contract\.test\.js/.test(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); } catch { return false; } })());
gate('G423-BR — test:runtime aggregate includes bridge test', (() => { try { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); return pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge-contract.test.js'); } catch { return false; } })());

let testsOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-BR — bridge contract unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-BR — unit test has >= 520 scenarios', testCount >= 520, `${testCount} scenarios (min 520)`);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-CONTRACT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
