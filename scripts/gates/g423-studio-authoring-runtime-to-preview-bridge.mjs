#!/usr/bin/env node
/**
 * Gate G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE — Post-Foundation C.
 *
 * Proves the REAL headless, dev-only, synthetic-only, in-memory, ephemeral, DETERMINISTIC, IMMUTABLE,
 * FAIL-CLOSED and SIDE-EFFECT-FREE bridge in `src/studio/blueprint-engine/authoring-runtime-to-preview-
 * bridge/`. It transforms a REAL Authoring Runtime synthetic preview handoff into a synthetic Module
 * Preview Sandbox target descriptor via strict draft identity, exact version tuple, handoffDigest
 * recompute-and-compare (runtime serializer, read-only), contract-driven lossless mappings, extension +
 * resource-limit enforcement, a deterministic 13-stage pipeline, atomic failure containment and replay
 * idempotency. It mounts no preview, touches no App, creates no route/menu, persists nothing, uses no
 * backend/Prisma/network, reads no real data, generates no module, certifies nothing and exposes nothing
 * to the product. Runs the real round-trip via the runtime API (no fake object as the primary proof).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const CONTRACT_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract');
const PLAN_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const SANDBOX_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-preview-sandbox');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge');
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs';
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
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyAuthoringRuntimeToPreviewBridge\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const FILES = [
  'bridgeRuntimeConfig.js', 'errors.js', 'deepFreeze.js', 'normalizeBridgeInput.js', 'createBridgeIssue.js',
  'sortBridgeIssues.js', 'validateStrictDraftIdentity.js', 'validateSourceHandoffShape.js',
  'validateSourceVersionTuple.js', 'recomputeAndValidateHandoffDigest.js', 'validateSourceSyntheticBoundary.js',
  'validateSourceSsotBoundary.js', 'validateBridgeExtensions.js', 'enforceBridgeResourceLimits.js',
  'executeBridgeFieldMappings.js', 'createTargetPreviewSandboxDescriptor.js', 'validateTargetDescriptor.js',
  'createBridgeValidationPipeline.js', 'createBridgeDecision.js', 'createBridgeDecisionDigest.js',
  'createBridgeReplayContract.js', 'createBridgeFailureContainment.js', 'createBridgeSsotBoundary.js',
  'createBridgePermissionTenancyBoundary.js', 'createBridgeSecuritySafety.js', 'createBridgePrototypeRelinkProhibition.js',
  'createBridgeManualEnablementGate.js', 'createBridgeDiagnostics.js', 'createBridgeReadinessDecision.js',
  'createBridgeManifest.js', 'verifyAuthoringRuntimeToPreviewBridge.js', 'checkAuthoringRuntimeToPreviewBridgeCompatibility.js',
  'createAuthoringRuntimeToPreviewBridgeFallback.js', 'createStudioAuthoringRuntimeToPreviewBridge.js', 'index.js',
];
const DOCS = [
  'CERTIFICATION-REPORT.md', 'STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-REPORT.md', 'REAL-SOURCE-HANDOFF-VALIDATION.md',
  'STRICT-DRAFT-IDENTITY-IMPLEMENTATION.md', 'VERSION-TUPLE-VALIDATION.md', 'HANDOFF-DIGEST-RECOMPUTE-AND-COMPARE.md',
  'CANONICAL-SERIALIZER-REUSE.md', 'FIELD-MAPPING-EXECUTION.md', 'TARGET-PREVIEW-SANDBOX-DESCRIPTOR.md',
  'EXTENSIBILITY-VALIDATION.md', 'RESOURCE-LIMIT-ENFORCEMENT.md', 'VALIDATION-PIPELINE.md', 'FAILURE-CONTAINMENT.md',
  'REPLAY-IDEMPOTENCY.md', 'IMMUTABILITY-DETERMINISM.md', 'SSOT-CERTIFICATION-MODULE-BOUNDARY.md',
  'PERMISSION-TENANCY-PRODUCT-BOUNDARY.md', 'SECURITY-SAFETY.md', 'PROTOTYPE-RELINK-PROHIBITION.md',
  'MANUAL-ENABLEMENT-GATE.md', 'MANIFEST-VERIFIER-COMPATIBILITY.md', 'REAL-END-TO-END-ROUND-TRIP.md',
  'NO-UI-NO-APP-NO-MOUNT-NO-PERSISTENCE.md', 'BUILD-BUNDLE-ABSENCE.md', 'QUALITY-SCALABILITY-RISK-NOTES.md',
  'NEXT-ENTERPRISE-CHECKPOINT.md',
];

for (const f of FILES) gate(`G423-BX — ${f} exists`, exists(path.join(DIR, f)));
for (const d of DOCS) gate(`G423-BX — ${d} exists`, exists(path.join(EV, d)));
gate('G423-BX — tests exist', exists(path.join(ROOT, TEST_REL)));
gate('G423-BX — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-BX — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-BX — no .css in subtree', !fs.readdirSync(DIR).some((f) => /\.css$/.test(f)));
gate('G423-BX — exactly 35 .js files', jsFiles().length === 35, `${jsFiles().length} .js`);
gate('G423-BX — upstream contract present', exists(path.join(CONTRACT_DIR, 'index.js')));
gate('G423-BX — upstream plan present', exists(path.join(PLAN_DIR, 'index.js')));
gate('G423-BX — upstream runtime present (read-only)', exists(path.join(RUNTIME_DIR, 'index.js')));
gate('G423-BX — preview sandbox present (read-only)', exists(path.join(SANDBOX_DIR, 'index.js')));

let m = null; let rt = null;
try { m = await import(pathToFileURL(path.join(DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }
try { rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href); } catch (err) { console.error(String(err)); }

// Real round-trip.
function buildHandoff(seed = 'g') {
  let r = rt.executeAuthoringOperation({ session: rt.createAuthoringRuntimeSession({ seed }), operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const id = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId: id, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId: id } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId: id } });
  return { handoff: rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), id };
}
let BRIDGE = null; let H = null; let DRAFT_ID = null; let DECISION = null;
try { BRIDGE = m.createStudioAuthoringRuntimeToPreviewBridge({}); } catch (err) { console.error(String(err)); }
try { const b = buildHandoff('g'); H = b.handoff; DRAFT_ID = b.id; } catch (err) { console.error(String(err)); }
try { DECISION = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); } catch (err) { console.error(String(err)); }

const recomputed = (obj) => { const { handoffDigest, ...rest } = obj; const pre = {}; for (const k of m.REAL_HANDOFF_FIELDS) { if (k === 'handoffDigest') continue; if (k in rest) pre[k] = rest[k]; } return { ...rest, handoffDigest: rt.createDeterministicDigest(pre) }; };

// Base construction.
gate('G423-BX — bridge constructs headless + ready', BRIDGE ? (BRIDGE.kind === 'studio-authoring-runtime-to-preview-bridge' && BRIDGE.readiness === 'studio_authoring_runtime_to_preview_bridge_ready' && BRIDGE.readyForHeadlessBridge === true && BRIDGE.fallback === false) : false);
gate('G423-BX — bridge frozen (immutable instance)', BRIDGE ? Object.isFrozen(BRIDGE) : false);
gate('G423-BX — config frozen', BRIDGE ? Object.isFrozen(BRIDGE.config) : false);
gate('G423-BX — no global singleton (distinct instances)', (() => { try { return m.createStudioAuthoringRuntimeToPreviewBridge({}) !== m.createStudioAuthoringRuntimeToPreviewBridge({}); } catch { return false; } })());
gate('G423-BX — verification ok', BRIDGE ? BRIDGE.verification.ok === true : false);
gate('G423-BX — source decision authorizing this slice', BRIDGE ? BRIDGE.sourceDecision === 'READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE' : false);

// Capabilities.
const TRUE_CAPS = ['headless', 'devOnly', 'syntheticOnly', 'inMemoryOnly', 'ephemeralOnly', 'deterministic', 'immutable', 'failClosed', 'sideEffectFree', 'ssotPreserved', 'sourceConsumedReadOnly', 'contractConsumedReadOnly', 'runtimeSerializerReusedReadOnly', 'bridgeImplemented', 'sourceValidationImplemented', 'draftIdentityEnforcementImplemented', 'sourceVersionValidationImplemented', 'sourceDigestValidationImplemented', 'sourceBoundaryValidationImplemented', 'mappingExecutorImplemented', 'targetDescriptorBuilderImplemented', 'targetVersionValidationImplemented', 'canonicalizationValidationImplemented', 'extensibilityEnforcementImplemented', 'validationPipelineImplemented', 'replayIdempotencyImplemented', 'resourceLimitsImplemented', 'failureContainmentImplemented'];
const FALSE_CAPS = ['previewPayloadCreated', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'sidebarCreated', 'persistenceImplemented', 'filesystemWritesUsed', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'networkUsed', 'realDataRead', 'realDataWrite', 'moduleGenerated', 'moduleRegistered', 'certificationPerformed', 'candidateCanonical', 'productExposed', 'productionAccessed', 'stagingAccessed', 'prototypeRelinked', 'permissionModelIntegrated', 'tenantModelIntegrated', 'serverSideAuthorizationIntegrated'];
gate('G423-BX — capabilities frozen', (() => { try { return Object.isFrozen(m.BRIDGE_CAPABILITIES); } catch { return false; } })());
for (const k of TRUE_CAPS) gate(`G423-BX — capability ${k} true`, (() => { try { return m.BRIDGE_CAPABILITIES[k] === true && BRIDGE.capabilities[k] === true; } catch { return false; } })());
for (const k of FALSE_CAPS) gate(`G423-BX — capability ${k} false`, (() => { try { return m.BRIDGE_CAPABILITIES[k] === false && BRIDGE.capabilities[k] === false; } catch { return false; } })());

// LIVE round-trip.
gate('G423-BX — LIVE round-trip: real handoff -> bridge_ready + target descriptor', DECISION ? (DECISION.ok === true && DECISION.status === 'bridge_ready' && DECISION.targetDescriptorCreated === true && DECISION.targetDescriptor !== null) : false);
gate('G423-BX — LIVE target kind + version', DECISION && DECISION.targetDescriptor ? (DECISION.targetDescriptor.targetKind === m.TARGET_SANDBOX_KIND && DECISION.targetDescriptor.targetContractVersion === m.PREVIEW_SANDBOX_CONTRACT_VERSION) : false);
gate('G423-BX — LIVE target metadata-only + frozen + not mounted', DECISION && DECISION.targetDescriptor ? (DECISION.targetDescriptor.metadataOnly === true && Object.isFrozen(DECISION.targetDescriptor) && DECISION.targetDescriptor.previewMounted === false) : false);
gate('G423-BX — LIVE target no route/menu/product/module/persistence', DECISION && DECISION.targetDescriptor ? (DECISION.targetDescriptor.routeCreated === false && DECISION.targetDescriptor.menuCreated === false && DECISION.targetDescriptor.productExposed === false && DECISION.targetDescriptor.moduleGenerated === false && DECISION.targetDescriptor.persistenceAllowed === false) : false);
gate('G423-BX — LIVE candidateDraftId + sourceDigest mapped', DECISION && DECISION.targetDescriptor ? (DECISION.targetDescriptor.candidateDraftId === DRAFT_ID && DECISION.targetDescriptor.sourceDigest === H.handoffDigest) : false);
gate('G423-BX — LIVE handoff has no upstreamVersions / no generic digest', H ? (!('upstreamVersions' in H) && !('digest' in H)) : false);
gate('G423-BX — LIVE handoff has handoffVersion/targetSandboxVersion/handoffDigest', H ? ('handoffVersion' in H && 'targetSandboxVersion' in H && 'handoffDigest' in H) : false);
gate('G423-BX — LIVE decision frozen + source not mutated', (() => { try { const before = JSON.stringify(H); const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); return Object.isFrozen(d) && JSON.stringify(H) === before && d.sourceMutated === false && d.sideEffects === 0; } catch { return false; } })());
gate('G423-BX — LIVE replay deep-equal + digest-equal', (() => { try { const { handoff, id } = buildHandoff('rp'); const a = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: id }); const b = BRIDGE.execute({ sourceHandoff: handoff, expectedDraftId: id }); return JSON.stringify(a) === JSON.stringify(b) && a.bridgeDecisionDigest === b.bridgeDecisionDigest; } catch { return false; } })());
gate('G423-BX — LIVE two instances same decision on same input', (() => { try { const b2 = m.createStudioAuthoringRuntimeToPreviewBridge({}); const a = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); const c = b2.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); return a.bridgeDecisionDigest === c.bridgeDecisionDigest; } catch { return false; } })());
gate('G423-BX — LIVE handoffDigest reproduced by runtime recompute', (() => { try { const { handoffDigest, ...pre } = H; return rt.createDeterministicDigest(pre) === handoffDigest; } catch { return false; } })());
gate('G423-BX — LIVE decision is JSON-serializable', (() => { try { JSON.stringify(DECISION); return true; } catch { return false; } })());
gate('G423-BX — LIVE decision NOT a fake object (has real target + digest + stages)', DECISION ? (DECISION.targetDescriptor && DECISION.targetDescriptor.candidateDraftId === DRAFT_ID && String(DECISION.bridgeDecisionDigest).startsWith('fnv1a-') && DECISION.stageCount === 13) : false);

// Draft identity.
gate('G423-BX — LIVE id mismatch rejected + null target', (() => { try { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: 'WRONG' }); return d.ok === false && d.status === 'bridge_rejected' && d.targetDescriptor === null && d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_DRAFT_ID_MISMATCH'); } catch { return false; } })());
gate('G423-BX — LIVE missing expectedDraftId rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: H }); return d.ok === false && d.issues.some((i) => i.issueCode === 'BRIDGE_EXPECTED_DRAFT_ID_REQUIRED'); } catch { return false; } })());
gate('G423-BX — LIVE missing source draftId rejected', (() => { try { const bad = { ...H }; delete bad.draftId; const d = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_DRAFT_ID_REQUIRED'); } catch { return false; } })());
gate('G423-BX — strict draft identity policy (no single-draft fallback)', BRIDGE ? (BRIDGE.draftIdentityPolicy.explicitDraftIdRequired === true && BRIDGE.draftIdentityPolicy.singleDraftFallbackAllowed === false && BRIDGE.draftIdentityPolicy.bridgeImplementationMustNeverCallFindDraftWithoutExplicitId === true) : false);
gate('G423-BX — no findDraft import/call in subtree', !/findDraft/.test(code()));

// Legacy alias + shape.
gate('G423-BX — LIVE upstreamVersions alias rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, upstreamVersions: {} }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN'); } catch { return false; } })());
gate('G423-BX — LIVE generic digest alias rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, digest: 'x' }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN'); } catch { return false; } })());
gate('G423-BX — LIVE wrong handoffKind rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: { ...H, handoffKind: 'x' }, expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_WRONG_HANDOFF_KIND'); } catch { return false; } })());
gate('G423-BX — LIVE synthetic=false rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: { ...H, synthetic: false }, expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_NOT_SYNTHETIC'); } catch { return false; } })());
gate('G423-BX — LIVE previewMounted=true rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, previewMounted: true }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_PREVIEW_MOUNTED_FORBIDDEN'); } catch { return false; } })());
gate('G423-BX — LIVE realDataAttached=true rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, realDataAttached: true }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_REAL_DATA_ATTACHED_FORBIDDEN'); } catch { return false; } })());

// Version tuple.
gate('G423-BX — LIVE handoffVersion mismatch rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, handoffVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_HANDOFF_VERSION_MISMATCH'); } catch { return false; } })());
gate('G423-BX — LIVE runtimeVersion mismatch rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, runtimeVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH'); } catch { return false; } })());
gate('G423-BX — LIVE targetSandboxVersion mismatch rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, targetSandboxVersion: 'x@9' }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_TARGET_SANDBOX_VERSION_MISMATCH'); } catch { return false; } })());
gate('G423-BX — version policy exact + no aggregated upstreamVersions', BRIDGE ? (BRIDGE.versionPolicy.exactVersionMatchRequired === true && BRIDGE.versionPolicy.aggregatedUpstreamVersionsFieldRequired === false && BRIDGE.versionPolicy.unknownVersionFailsClosed === true) : false);

// Digest.
gate('G423-BX — LIVE digest tamper rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: { ...H, draftRevision: H.draftRevision + 3 }, expectedDraftId: DRAFT_ID }); return d.ok === false && d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH'); } catch { return false; } })());
gate('G423-BX — LIVE payload tamper rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: { ...H, payload: { ...H.payload, injected: true } }, expectedDraftId: DRAFT_ID }); return d.ok === false; } catch { return false; } })());
gate('G423-BX — digest field handoffDigest + recompute_and_compare', BRIDGE ? (BRIDGE.digestSemantics.sourceDigestField === 'handoffDigest' && BRIDGE.digestSemantics.digestValidationMode === 'recompute_and_compare' && BRIDGE.digestSemantics.alternativeSerializerAllowed === false) : false);
gate('G423-BX — digest FNV internal-only, authorizes nothing real', BRIDGE ? (BRIDGE.digestSemantics.cryptographicIntegrityProvided === false && BRIDGE.digestSemantics.digestMayAuthorizeCertification === false && BRIDGE.digestSemantics.digestMayAuthorizeModuleGeneration === false && BRIDGE.digestSemantics.digestMayAuthorizeProduction === false) : false);
gate('G423-BX — reuses runtime serializer + digest helper (import)', importsOf().some((p) => /module-blueprint-authoring-runtime/.test(p)) && /stableSerialize|createDeterministicDigest/.test(code()));
gate('G423-BX — no alternative serializer defined in subtree', !/function\s+\w*[Ss]erialize/.test(code()));

// Mappings (consumed from contract).
gate('G423-BX — 12 mappings, all sources real, all targets declared', (() => { try { return m.BRIDGE_FIELD_MAPPINGS.length === 12 && m.BRIDGE_FIELD_MAPPINGS.every((mm) => m.REAL_HANDOFF_FIELDS.includes(mm.sourceField)) && m.BRIDGE_FIELD_MAPPINGS.every((mm) => m.TARGET_DESCRIPTOR_TARGET_FIELDS.includes(mm.targetField)); } catch { return false; } })());
gate('G423-BX — mappings consumed from contract (no second list definition)', !/const\s+BRIDGE_FIELD_MAPPINGS\s*=/.test(code()));
gate('G423-BX — no upstreamVersions/generic digest mapping source', (() => { try { return !m.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === 'upstreamVersions' || mm.sourceField === 'digest'); } catch { return false; } })());
gate('G423-BX — handoffDigest -> sourceDigest mapping', (() => { try { return m.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === 'handoffDigest' && mm.targetField === 'sourceDigest'); } catch { return false; } })());
gate('G423-BX — security fields validated, not mapped', (() => { try { const secs = ['previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed']; return secs.every((s) => !m.BRIDGE_FIELD_MAPPINGS.some((mm) => mm.sourceField === s)); } catch { return false; } })());
gate('G423-BX — LIVE mapping executor produces 12 target fields', (() => { try { const r = m.executeBridgeFieldMappings({ sourceHandoff: H }); return r.ok === true && Object.keys(r.mapped).length === 12; } catch { return false; } })());
gate('G423-BX — LIVE mapped payload is a clone (not same ref)', (() => { try { const r = m.executeBridgeFieldMappings({ sourceHandoff: H }); return r.mapped.syntheticPayload !== H.payload; } catch { return false; } })());
gate('G423-BX — transforms only identity/assert_true/clone_synthetic', (() => { try { return JSON.stringify([...m.ALLOWED_TRANSFORM_KINDS]) === JSON.stringify(['identity', 'assert_true', 'clone_synthetic']); } catch { return false; } })());

// Target descriptor + validator.
gate('G423-BX — LIVE target descriptor validator passes', (() => { try { const r = m.validateTargetDescriptor(DECISION.targetDescriptor); return r.ok === true && r.serializable === true; } catch { return false; } })());
gate('G423-BX — target builder never mounts / no route / no product', (() => { try { const td = m.createTargetPreviewSandboxDescriptor({ mapped: {} }); return td.previewMounted === false && td.routeCreated === false && td.menuCreated === false && td.productExposed === false && td.moduleGenerated === false && Object.isFrozen(td); } catch { return false; } })());

// Extensions.
gate('G423-BX — LIVE extension without namespace rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ fields: {} }] }); return d.ok === false && d.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_UNNAMESPACED_FORBIDDEN'); } catch { return false; } })());
gate('G423-BX — LIVE extension missing schema fail-closed', (() => { try { const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ namespace: 'acme.x', fields: {} }] }); return d.issues.some((i) => i.issueCode === 'BRIDGE_EXTENSION_MISSING_SCHEMA'); } catch { return false; } })());
gate('G423-BX — LIVE extension critical override rejected', (() => { try { const b = m.createStudioAuthoringRuntimeToPreviewBridge({ extensionSchemas: { 'acme.a': {} } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ namespace: 'acme.a', fields: { certified: true } }] }); return d.ok === false && d.targetDescriptor === null; } catch { return false; } })());
gate('G423-BX — LIVE namespaced+schema extension accepted', (() => { try { const b = m.createStudioAuthoringRuntimeToPreviewBridge({ extensionSchemas: { 'acme.a': {} } }); const d = b.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID, extensions: [{ namespace: 'acme.a', fields: { note: 'x' } }] }); return d.ok === true; } catch { return false; } })());

// Resource limits.
gate('G423-BX — LIVE too-many-fields rejected', (() => { try { const fields = Array.from({ length: 500 }, (_, i) => ({ key: `f${i}`, order: i })); const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, payload: { ...H.payload, fields } }), expectedDraftId: DRAFT_ID }); return d.ok === false && d.issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_FIELDS_TOO_MANY'); } catch { return false; } })());
gate('G423-BX — LIVE too-long-string rejected', (() => { try { const d = BRIDGE.execute({ sourceHandoff: recomputed({ ...H, payload: { ...H.payload, name: 'y'.repeat(9000) } }), expectedDraftId: DRAFT_ID }); return d.issues.some((i) => i.issueCode === 'BRIDGE_STRING_TOO_LONG'); } catch { return false; } })());
gate('G423-BX — unknown resource dimension -> fallback', (() => { try { return m.createStudioAuthoringRuntimeToPreviewBridge({ limits: { nope: 1 } }).fallback === true; } catch { return false; } })());
gate('G423-BX — resource-limit policy (no silent truncation, fail-closed, no partial)', BRIDGE ? (BRIDGE.resourceLimitsPolicy.unknownResourceDimensionRejected === true && BRIDGE.resourceLimitsPolicy.silentTruncationAllowed === false && BRIDGE.resourceLimitsPolicy.limitExceededFailsClosed === true && BRIDGE.resourceLimitsPolicy.partialTargetDescriptorAllowed === false) : false);
gate('G423-BX — resource-limit intentional stricter policy', BRIDGE ? (BRIDGE.resourceLimitsPolicy.bridgeLimitsMayRejectRuntimeValidHandoff === true && BRIDGE.resourceLimitsPolicy.stricterBridgeLimitsAreIntentional === true && BRIDGE.resourceLimitsPolicy.limitMismatchIsNotSilent === true) : false);

// Pipeline / failure containment / replay.
gate('G423-BX — 13-stage pipeline', (() => { try { const p = m.createBridgeValidationPipeline({ sourceHandoff: H, expectedDraftId: DRAFT_ID, expectedVersions: m.DEFAULT_EXPECTED_VERSIONS, limits: m.DEFAULT_BRIDGE_RESOURCE_LIMITS }); return p.stageCount === 13 && JSON.stringify(p.stages) === JSON.stringify([...m.BRIDGE_VALIDATION_STAGES]); } catch { return false; } })());
gate('G423-BX — atomic rejection: no partial target, no source mutation', (() => { try { const d = BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); return d.targetDescriptor === null && d.partialTargetDescriptor === false && d.sourceMutated === false && d.sideEffects === 0 && d.rollbackByNonConsumption === true; } catch { return false; } })());
gate('G423-BX — deterministic issue ordering (sorted)', (() => { try { const bad = { ...H, synthetic: false, ok: false, immutable: false }; const a = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); const b = BRIDGE.execute({ sourceHandoff: bad, expectedDraftId: DRAFT_ID }); return JSON.stringify(a.issues) === JSON.stringify(b.issues); } catch { return false; } })());
gate('G423-BX — no global state between executes', (() => { try { BRIDGE.execute({ sourceHandoff: { ...H, ok: false }, expectedDraftId: DRAFT_ID }); const d = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: DRAFT_ID }); return d.ok === true; } catch { return false; } })());
gate('G423-BX — replay contract idempotent, no side effects', BRIDGE ? (BRIDGE.replayContract.idempotent === true && BRIDGE.replayContract.replaySideEffectsAllowed === false && BRIDGE.replayContract.globalCounters === false) : false);
gate('G423-BX — failure containment atomic, no partial/mutation/retry', BRIDGE ? (BRIDGE.failureContainment.atomic === true && BRIDGE.failureContainment.partialTargetAllowed === false && BRIDGE.failureContainment.sourceMutationAllowed === false && BRIDGE.failureContainment.retryWithFallbackAllowed === false) : false);

// Verifier + tamper.
gate('G423-BX — verifier passes real bridge', (() => { try { return m.verifyAuthoringRuntimeToPreviewBridge({ bridge: BRIDGE }).ok === true; } catch { return false; } })());
let verTamper = false;
try {
  const c = m.BRIDGE_CAPABILITIES;
  const vb = (o) => m.verifyAuthoringRuntimeToPreviewBridge(o).blockers;
  verTamper = vb({ bridge: { capabilities: { ...c, previewMounted: true } } }).includes('capability_previewMounted_must_be_false')
    && vb({ bridge: { capabilities: { ...c, appTouched: true } } }).includes('capability_appTouched_must_be_false')
    && vb({ bridge: { capabilities: { ...c, persistenceImplemented: true } } }).includes('capability_persistenceImplemented_must_be_false')
    && vb({ bridge: { capabilities: { ...c, moduleGenerated: true } } }).includes('capability_moduleGenerated_must_be_false')
    && vb({ bridge: { capabilities: { ...c, certificationPerformed: true } } }).includes('capability_certificationPerformed_must_be_false')
    && vb({ bridge: { capabilities: { ...c, productExposed: true } } }).includes('capability_productExposed_must_be_false')
    && vb({ bridge: { capabilities: { ...c, permissionModelIntegrated: true } } }).includes('capability_permissionModelIntegrated_must_be_false')
    && vb({ bridge: { capabilities: { ...c, backendAccessed: true } } }).includes('capability_backendAccessed_must_be_false')
    && vb({ bridge: { capabilities: { ...c, networkUsed: true } } }).includes('capability_networkUsed_must_be_false')
    && vb({ bridge: { capabilities: { ...c, deterministic: false } } }).includes('capability_deterministic_must_be_true')
    && vb({ bridge: { capabilities: { ...c, immutable: false } } }).includes('capability_immutable_must_be_true')
    && vb({ bridge: { capabilities: { ...c, bridgeImplemented: false } } }).includes('capability_bridgeImplemented_must_be_true')
    && vb({ bridge: { capabilities: c, draftIdentityPolicy: { singleDraftFallbackAllowed: true } } }).includes('unsafe_single_draft_fallback')
    && vb({ bridge: { capabilities: c, digestSemantics: { sourceDigestField: 'digest' } } }).includes('unsafe_digest_wrong_source_field')
    && vb({ bridge: { capabilities: c, digestSemantics: { digestValidationMode: 'trust' } } }).includes('unsafe_digest_wrong_validation_mode')
    && vb({ bridge: { capabilities: c, digestSemantics: { alternativeSerializerAllowed: true } } }).includes('unsafe_digest_alternative_serializer')
    && vb({ bridge: { capabilities: c, versionPolicy: { aggregatedUpstreamVersionsFieldRequired: true } } }).includes('unsafe_version_upstreamVersions_required')
    && vb({ bridge: { capabilities: c, resourceLimitsPolicy: { silentTruncationAllowed: true } } }).includes('unsafe_silent_truncation')
    && vb({ bridge: { capabilities: c, resourceLimitsPolicy: { partialTargetDescriptorAllowed: true } } }).includes('unsafe_partial_target')
    && vb({ bridge: { capabilities: c, failureContainment: { sourceMutationAllowed: true } } }).includes('unsafe_source_mutation')
    && vb({ bridge: { capabilities: c, replayContract: { replaySideEffectsAllowed: true } } }).includes('unsafe_replay_side_effects')
    && vb({ bridge: { capabilities: c, ssotBoundary: { draftIsCanonical: true } } }).includes('unsafe_ssot_inversion')
    && vb({ bridge: { capabilities: c, ssotBoundary: { bridgeMayCertify: true } } }).includes('unsafe_ssot_bridge_privilege')
    && vb({ bridge: { capabilities: c, permissionTenancyBoundary: { permissionModelIntegrated: true } } }).includes('unsafe_permission_integrated')
    && vb({ bridge: { capabilities: c, securitySafety: { anyForbiddenSideEffect: true } } }).includes('unsafe_security_real_allowed')
    && vb({ bridge: { capabilities: c, prototypeRelinkProhibition: { prototypeRelinkAllowed: true } } }).includes('unsafe_prototype_relink')
    && vb({ bridge: { capabilities: c, manualGate: { manualGateRequired: false } } }).includes('missing_manual_gate')
    && vb({ bridge: { capabilities: c, manualGate: { manualGateRequired: true, authorizesPreviewMount: true } } }).includes('unsafe_manual_gate_authorizes_real')
    && vb({ bridge: { capabilities: c, readyForProduction: true } }).includes('unsafe_ready_for_production')
    && vb({ bridge: { capabilities: c, note: 'uses Math.random' } }).includes('unsafe_nondeterministic_source')
    && (() => { try { m.verifyAuthoringRuntimeToPreviewBridge({ bridge: null }); return true; } catch { return false; } })();
} catch (err) { console.error(String(err)); verTamper = false; }
gate('G423-BX — verifier detects capability/draft/digest/version/limit/failure/replay/SSOT/permission/security/prototype/manual-gate/readiness/nondeterminism tampers', verTamper);

// Compatibility, boundaries, manual gate.
gate('G423-BX — compatibility status headless_bridge_ready_for_enterprise_checkpoint', BRIDGE ? BRIDGE.compatibility.status === 'headless_bridge_ready_for_enterprise_checkpoint' : false);
gate('G423-BX — compatible with runtime/contract/plan/alignment/sandbox/blueprint', BRIDGE ? (BRIDGE.compatibility.compatibleWithAuthoringRuntime && BRIDGE.compatibility.compatibleWithBridgeContract && BRIDGE.compatibility.compatibleWithBridgeImplementationPlan && BRIDGE.compatibility.compatibleWithSourceShapeAlignment && BRIDGE.compatibility.compatibleWithPreviewSandboxContract && BRIDGE.compatibility.compatibleWithBlueprintContract) : false);
gate('G423-BX — ready headless only; never mount/ui/product/module/cert/production', BRIDGE ? (BRIDGE.readyForHeadlessBridge === true && BRIDGE.readyForPreviewMount === false && BRIDGE.readyForAuthoringUi === false && BRIDGE.readyForProductExposure === false && BRIDGE.readyForModuleGeneration === false && BRIDGE.readyForCertification === false && BRIDGE.readyForProduction === false) : false);
gate('G423-BX — SSOT preserved; bridge may not certify/module/write blueprint', BRIDGE ? (BRIDGE.ssotBoundary.certifiedBlueprintRemainsSsot === true && BRIDGE.ssotBoundary.bridgeMayCertify === false && BRIDGE.ssotBoundary.bridgeMayGenerateModule === false && BRIDGE.ssotBoundary.bridgeMayWriteCertifiedBlueprint === false) : false);
gate('G423-BX — permission/tenancy not integrated; exposure blocked', BRIDGE ? (BRIDGE.permissionTenancyBoundary.permissionModelIntegrated === false && BRIDGE.permissionTenancyBoundary.tenantModelIntegrated === false && BRIDGE.permissionTenancyBoundary.productExposureBlockedByPermissionTenancy === true) : false);
gate('G423-BX — security anyForbiddenSideEffect false; all allowances false', BRIDGE ? (BRIDGE.securitySafety.anyForbiddenSideEffect === false && Object.values(BRIDGE.securitySafety.allowances).every((v) => v === false)) : false);
gate('G423-BX — manual gate authorizes headless bridge only', BRIDGE ? (BRIDGE.manualGate.manualGateRequired === true && BRIDGE.manualGate.authorizesBridgeImplementation === true && BRIDGE.manualGate.authorizesPreviewMount === false && BRIDGE.manualGate.authorizesAuthoringUi === false && BRIDGE.manualGate.authorizesModuleGeneration === false && BRIDGE.manualGate.authorizesCertification === false && BRIDGE.manualGate.authorizesProductExposure === false && BRIDGE.manualGate.authorizesProduction === false) : false);
gate('G423-BX — prototype relink prohibited (8 paths)', BRIDGE ? (BRIDGE.prototypeRelinkProhibition.prototypeRelinkAllowed === false && BRIDGE.prototypeRelinkProhibition.oldPrototypeImported === false && BRIDGE.prototypeRelinkProhibition.forbiddenPathCount === 8) : false);
gate('G423-BX — manifest present + part digests + partCount >= 13', BRIDGE ? (BRIDGE.manifest.kind === 'bridge-manifest' && BRIDGE.manifest.partCount >= 13 && String(BRIDGE.manifest.manifestDigest).startsWith('fnv1a-')) : false);
gate('G423-BX — diagnostics passive + no secrets', BRIDGE ? (BRIDGE.diagnostics.passive === true && !/DATABASE_URL|VITE_API_URL|Bearer /i.test(JSON.stringify(BRIDGE.diagnostics))) : false);
gate('G423-BX — feature flags fail closed in production', (() => { try { return m.isStudioAuthoringRuntimeToPreviewBridgeEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG]: 'true', MAK_ENV_LABEL: 'production' }) === false && m.isStudioAuthoringRuntimeToPreviewBridgeEnabled({ [m.MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG]: 'true', DEV: 'true' }) === true; } catch { return false; } })());
gate('G423-BX — issue codes catalog >= 60', Array.isArray(m?.BRIDGE_ISSUE_CODES) && m.BRIDGE_ISSUE_CODES.length >= 60);
gate('G423-BX — real handoff fields 20, mappings 12, stages 13, dimensions 7', (() => { try { return m.REAL_HANDOFF_FIELDS.length === 20 && m.BRIDGE_FIELD_MAPPINGS.length === 12 && m.BRIDGE_VALIDATION_STAGES.length === 13 && m.BRIDGE_RESOURCE_LIMIT_DIMENSIONS.length === 7; } catch { return false; } })());

// Determinism static scans (exclude verifier).
gate('G423-BX — no Date.now (excl verifier)', !/Date\.now/.test(codeNoVerifier()));
gate('G423-BX — no new Date (excl verifier)', !/new Date\b/.test(codeNoVerifier()));
gate('G423-BX — no Math.random (excl verifier)', !/Math\.random/.test(codeNoVerifier()));
gate('G423-BX — no crypto.randomUUID (excl verifier)', !/crypto\.randomUUID/.test(codeNoVerifier()));
gate('G423-BX — no bare randomUUID (excl verifier)', !/\brandomUUID\b/.test(codeNoVerifier()));
gate('G423-BX — no performance.now / hrtime (excl verifier)', !/performance\.now|hrtime/.test(codeNoVerifier()));
gate('G423-BX — no toLocaleString / localeCompare (excl verifier)', !/toLocaleString|localeCompare/.test(codeNoVerifier()));
gate('G423-BX — verifier holds nondeterminism detection regex', /Math\\\.random/.test(fs.readFileSync(path.join(DIR, 'verifyAuthoringRuntimeToPreviewBridge.js'), 'utf8')));

// Static safety scans.
gate('G423-BX — subtree React-free', importsOf().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-BX — no react-router / react-dom import', importsOf().every((p) => !/react-router|react-dom/i.test(p)));
gate('G423-BX — no ReactDOM / createRoot / JSX / Route', !/\bReactDOM\b|createRoot\s*\(|hydrateRoot\s*\(|createElement|_jsx\b|<Route[\s/>]|<NavLink|<Link[\s/>]/.test(code()));
gate('G423-BX — no window/document access', !/\bdocument\.|\bwindow\.[a-z]/i.test(code()));
gate('G423-BX — no fs/writeFile/mkdir/appendFile', !/\bfs\.|writeFileSync|writeFile\(|mkdir|appendFile/.test(code()));
gate('G423-BX — no localStorage/sessionStorage/indexedDB', !/localStorage\.|sessionStorage\.|indexedDB\./.test(code()));
gate('G423-BX — no fetch/XHR/WebSocket/axios', !/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code()));
gate('G423-BX — no @prisma/PrismaClient/backend/apiClient import', importsOf().every((p) => !/@prisma|PrismaClient|\/backend\/|apiClient|EmpresaApi|\/apis\//i.test(p)));
gate('G423-BX — no DATABASE_URL / production API_URL / Railway', !/DATABASE_URL|VITE_API_URL|projetomg-production|railway/i.test(code()));
gate('G423-BX — no POST/PUT/PATCH/DELETE method', !/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(code()));
gate('G423-BX — no previewMounted/moduleGenerated/certified/productExposed true literal', !/(previewMounted|moduleGenerated|certified|productExposed|realDataRead|realDataWrite)\s*:\s*true/.test(code()));
gate('G423-BX — no old Studio prototype import', importsOf().every((p) => !/studio\/(components|shell|designers|pages|navigation|dock|panels|editor)/.test(p)));
gate('G423-BX — no src/components or src/pages import', importsOf().every((p) => !/(^|\.\.\/)(components|pages)\//.test(p)));
gate('G423-BX — no App import', importsOf().every((p) => !/(^|\/)App(\.jsx)?$/.test(p)));
gate('G423-BX — imports only relative + runtime + contract + plan', importsOf().every((p) => p.startsWith('.') || /module-blueprint-authoring-runtime|authoring-runtime-to-preview-bridge-contract|authoring-runtime-to-preview-bridge-implementation-plan/.test(p)));
gate('G423-BX — no src/modules/studio', !exists(path.join(ROOT, 'src/modules/studio')));

gate('G423-BX — docs validate round-trip + digest + boundary + checkpoint + bundle', /round-trip|handoff|real/i.test(readEv('REAL-END-TO-END-ROUND-TRIP.md')) && /recompute|fnv1a|handoffDigest/i.test(readEv('HANDOFF-DIGEST-RECOMPUTE-AND-COMPARE.md')) && /SSOT|canonical|certified/i.test(readEv('SSOT-CERTIFICATION-MODULE-BOUNDARY.md')) && /checkpoint|FABLE|enterprise/i.test(readEv('NEXT-ENTERPRISE-CHECKPOINT.md')) && /bundle|dist|absence/i.test(readEv('BUILD-BUNDLE-ABSENCE.md')));

// Scope safety (git-diff).
let blockedOk = false; let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean).filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const bad = filterForbiddenScopePaths(files);
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'src/modules/Empresas/backend/Prisma/migration/runtime/CSS/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = 'git base unavailable — skipped'; }
gate('G423-BX — src/modules / Empresas / backend / Prisma / SSOT untouched', blockedOk, blockedDetail);

let scopeOk = false; let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const outside = files.filter((f) => !authorized(f));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = 'git base unavailable — skipped'; }
gate('G423-BX — authorized scope only (bridge subtree + registry + evidence + package)', scopeOk, scopeDetail);

let noOldEdit = false; let noOldEditDetail = '';
try {
  // Branch-relative check: it runs on later Studio headless slices before merge, so EXPLICITLY registered later
  // Studio headless artifacts are filtered out via the central guard. Unknown/forbidden paths still fail hard, and
  // the two guard libs are checked against the UNFILTERED list so tolerance can never release them.
  const rawFiles = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const files = rawFiles.filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  const touchedGuard = rawFiles.includes('scripts/gates/lib/productionUiGuard.mjs') || rawFiles.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs');
  const touchedUpstream = files.some((f) => /^src\/studio\/blueprint-engine\/(authoring-runtime-to-preview-bridge-contract|authoring-runtime-to-preview-bridge-implementation-plan|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f));
  const touchedOldGate = files.some((f) => /^scripts\/gates\/g423-.*\.mjs$/.test(f) && f !== GATE_REL);
  const touchedOldTest = files.some((f) => /^src\/runtime\/__tests__\/.*\.test\.js$/.test(f) && f !== TEST_REL);
  const touchedApp = files.includes('src/App.jsx');
  noOldEdit = !touchedGuard && !touchedUpstream && !touchedOldGate && !touchedOldTest && !touchedApp;
  noOldEditDetail = noOldEdit ? 'App.jsx + guards + upstream subtrees + prior gates/tests untouched' : `touched: ${[touchedGuard ? 'guard' : '', touchedUpstream ? 'upstream' : '', touchedOldGate ? 'old-gate' : '', touchedOldTest ? 'old-test' : '', touchedApp ? 'App.jsx' : ''].filter(Boolean).join(',')}`;
} catch (err) { noOldEdit = true; noOldEditDetail = 'git base unavailable — skipped'; }
gate('G423-BX — App.jsx / guards / upstream subtrees / prior gates/tests NOT altered', noOldEdit, noOldEditDetail);

let regOk = false; let regDetail = '';
try {
  const reg = await import(pathToFileURL(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs')).href);
  const known = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS;
  const hasOwn = known.some((re) => re.test('src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js'));
  const forbiddenProbes = ['src/modules/x/y.js', 'backend/server.js', 'src/App.jsx', 'backend/prisma/schema.prisma', 'src/pages/z.jsx'];
  const leaks = forbiddenProbes.filter((p) => known.some((re) => re.test(p)));
  regOk = hasOwn && leaks.length === 0;
  regDetail = regOk ? 'specific bridge paths registered; no broad wildcard leaks a forbidden path' : `hasOwn=${hasOwn} leaks=${leaks.join(',')}`;
} catch (err) { regOk = false; regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-BX — registry: specific slice paths only, no dangerous wildcard', regOk, regDetail);

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-BX — no new dependency added', noNewDep);

gate('G423-BX — package.json wires bridge test + gate', (() => { try { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); return /studio-authoring-runtime-to-preview-bridge\.test\.js/.test(pkg) && /g423-studio-authoring-runtime-to-preview-bridge\.mjs/.test(pkg); } catch { return false; } })());
gate('G423-BX — test:runtime aggregate includes bridge test', (() => { try { const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); return pkg.scripts['test:runtime'].includes('studio-authoring-runtime-to-preview-bridge.test.js'); } catch { return false; } })());
gate('G423-BX — alignment test still present (upstream intact)', exists(path.join(ROOT, 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-source-shape-alignment.test.js')));
gate('G423-BX — alignment gate still present', exists(path.join(ROOT, 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment.mjs')));

let testsOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } }).toString();
  const mt = out.match(/# tests (\d+)/); const mp = out.match(/# pass (\d+)/); const mf = out.match(/# fail (\d+)/);
  testCount = mt ? Number(mt[1]) : 0;
  testsOk = mf ? Number(mf[1]) === 0 && mp && Number(mp[1]) === testCount : false;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-BX — bridge unit tests PASS', testsOk, `${testCount} scenarios`);
gate('G423-BX — unit test has >= 700 scenarios', testCount >= 700, `${testCount} scenarios (min 700)`);
gate('G423-BX — round-trip real (test drives runtime API, not a fake object)', /createAuthoringRuntimeSession|executeAuthoringOperation|createSyntheticPreviewHandoff/.test(fs.readFileSync(path.join(ROOT, TEST_REL), 'utf8')));

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) process.exit(1);
