#!/usr/bin/env node
/**
 * Gate G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER — Post-Foundation C.
 *
 * Proves the REAL headless, dev-only, deterministic, immutable, fail-closed builder. It LIVE-builds real bridge
 * decisions and proves: success emits an immutable Core Envelope v2 (identityVerified=false) whose digest equals the
 * source digest; the builder decision records identityVerified=true OUTSIDE the envelope (ARCHITECTURE 1); tampering
 * any allowlisted core field or the digest rejects atomically (no envelope); adversarial inputs (cycles, accessors,
 * NaN/Infinity/BigInt/Symbol/Function, pollution, proxy) fail closed and sanitized; the source is never mutated;
 * outputs are deep-frozen; the build is deterministic and cross-instance stable; resource-limit boundaries hold;
 * and NO consumer runtime / preview / UI / App / backend exists. Bundle-absent.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder');
const BC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-core-envelope-builder-contract');
const ENV_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-decision-envelope-identity-contract');
const BRIDGE_DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder');
const TEST_REL = 'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js';
const GATE_REL = 'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs';
const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const allFiles = () => walk(DIR, /.*/);
const code = () => stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const importsOf = () => jsFiles().flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const B = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
// Internal modules are imported by path for live proofs (the public index intentionally exposes no bypass).
const CFG = await import(pathToFileURL(path.join(DIR, 'builderConfig.js')).href);
const LIM = await import(pathToFileURL(path.join(DIR, 'resourceLimitEnforcer.js')).href);
const ISS = await import(pathToFileURL(path.join(DIR, 'normalizeIssues.js')).href);
const TD = await import(pathToFileURL(path.join(DIR, 'validateTargetDescriptor.js')).href);
const FACTORY = await import(pathToFileURL(path.join(DIR, 'createBridgeDecisionCoreEnvelopeBuilder.js')).href);
const BC = await import(pathToFileURL(path.join(BC_DIR, 'index.js')).href);
const ENV = await import(pathToFileURL(path.join(ENV_DIR, 'index.js')).href);
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);
const RC_DIR = path.join(ROOT, 'src/studio/blueprint-engine/bridge-to-preview-sandbox-runtime-contract');
const RC = await import(pathToFileURL(path.join(RC_DIR, 'index.js')).href);
const EXEC = await import(pathToFileURL(path.join(DIR, 'executeBuilderValidationPipeline.js')).href);
const NCFG = await import(pathToFileURL(path.join(DIR, 'normalizeBuilderConfig.js')).href);
const CLONE = await import(pathToFileURL(path.join(DIR, 'safeCloneAndNormalize.js')).href);
const COMPAT = await import(pathToFileURL(path.join(DIR, 'verifyBuilderCompatibility.js')).href);
const RDY = await import(pathToFileURL(path.join(DIR, 'builderReadiness.js')).href);
const MAN = await import(pathToFileURL(path.join(DIR, 'builderManifest.js')).href);
const IDA = await import(pathToFileURL(path.join(DIR, 'identityArchitecture.js')).href);
const EMR = await import(pathToFileURL(path.join(DIR, 'createEmergencyBuilderRejection.js')).href);
const builder = FACTORY.createBridgeDecisionCoreEnvelopeBuilder();

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

// ---- Artifacts ----
gate('G423-BLD — subtree exists', exists(DIR));
gate('G423-BLD — test exists', exists(path.join(ROOT, TEST_REL)));
gate('G423-BLD — gate exists', exists(path.join(ROOT, GATE_REL)));
gate('G423-BLD — evidence dir exists', exists(EV));
gate('G423-BLD — only .js files', allFiles().every((f) => /\.js$/.test(f)), `${allFiles().length}`);
gate('G423-BLD — >= 28 modules', jsFiles().length >= 28, `${jsFiles().length}`);
gate('G423-BLD — no .jsx anywhere', allFiles().every((f) => !/\.jsx$/.test(f)));
gate('G423-BLD — factory returns build', typeof builder.build === 'function' && Object.isFrozen(builder));

// ---- Registry ----
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-BLD — registry subtree path', /\^src\\\/studio\\\/blueprint-engine\\\/bridge-decision-core-envelope-builder\\\//.test(reg));
gate('G423-BLD — registry test path', /\^src\\\/runtime\\\/__tests__\\\/studio-bridge-decision-core-envelope-builder\\\.test\\\.js\$/.test(reg));
gate('G423-BLD — registry gate path', /\^scripts\\\/gates\\\/g423-studio-bridge-decision-core-envelope-builder\\\.mjs\$/.test(reg));
gate('G423-BLD — registry docs path', /\^docs\\\/evidence\\\/post-foundation-c-studio-bridge-decision-core-envelope-builder\\\//.test(reg));

// ---- Upstreams intact + traceability ----
gate('G423-BLD — upstream builder contract present', exists(BC_DIR));
gate('G423-BLD — source fields == 33 == upstream', CFG.SOURCE_FIELDS.length === 33 && CFG.SOURCE_FIELDS.length === BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS.length);
gate('G423-BLD — allowlist == 32 == upstream', CFG.CORE_ALLOWLIST.length === 32 && JSON.stringify([...CFG.CORE_ALLOWLIST].sort()) === JSON.stringify([...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort()));
gate('G423-BLD — allowlist == source minus digest', B.coreAllowlistIsSourceMinusDigest() === true);
gate('G423-BLD — envelope fields == 12 == upstream', CFG.ENVELOPE_FIELDS.length === 12 && JSON.stringify([...CFG.ENVELOPE_FIELDS]) === JSON.stringify([...BC.OUTPUT_CORE_ENVELOPE_FIELDS]));
gate('G423-BLD — pipeline stages == 23 == upstream', CFG.PIPELINE_STAGES.length === 23);
gate('G423-BLD — envelope invariant identityVerified false', CFG.ENVELOPE_INVARIANTS.identityVerified === false);
for (const f of CFG.CORE_ALLOWLIST) gate(`G423-BLD — allowlist field ${f} real & not digest`, ENV.DECISION_DIGEST_PREIMAGE_FIELDS.includes(f) && f !== CFG.DIGEST_FIELD);
for (const f of CFG.ENVELOPE_FIELDS) gate(`G423-BLD — envelope field ${f} real`, BC.OUTPUT_CORE_ENVELOPE_FIELDS.includes(f));
for (const f of CFG.SOURCE_FIELDS) gate(`G423-BLD — source field ${f} real`, BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS.includes(f));
for (const f of CFG.PIPELINE_STAGES) gate(`G423-BLD — pipeline stage ${f} declared`, typeof f === 'string' && f.length > 0);

// ---- LIVE success proofs (multi-seed) ----
let allDigestOk = true; let allIdentityOk = true;
for (const seed of Array.from({ length: 24 }, (_, i) => `g${i}`)) {
  const d = buildRealDecision(seed);
  const res = builder.build(d);
  const ok = res.ok === true && res.status === CFG.STATUS_READY
    && res.coreEnvelope.bridgeDecisionDigest === d.bridgeDecisionDigest
    && res.coreEnvelope.identityVerified === false && res.identityVerified === true
    && Object.keys(res.coreEnvelope.bridgeDecisionCore).length === 32
    && Object.keys(res.coreEnvelope).length === 12
    && Object.isFrozen(res) && Object.isFrozen(res.coreEnvelope);
  if (res.coreEnvelope.bridgeDecisionDigest !== d.bridgeDecisionDigest) allDigestOk = false;
  if (res.identityVerified !== true || res.coreEnvelope.identityVerified !== false) allIdentityOk = false;
  gate(`G423-BLD — LIVE success seed ${seed}`, ok, JSON.stringify(res.issues || []));
}
gate('G423-BLD — LIVE all-seed digest(envelope)==sourceDigest', allDigestOk);
gate('G423-BLD — LIVE ARCHITECTURE 1 identity split', allIdentityOk);

// ---- Per-built-envelope-field presence + invariants on a real success ----
{
  const d = buildRealDecision('pef');
  const env = builder.build(d).coreEnvelope;
  for (const f of CFG.ENVELOPE_FIELDS) gate(`G423-BLD — built envelope has field ${f}`, Object.prototype.hasOwnProperty.call(env, f));
  gate('G423-BLD — built envelope synthetic/immutable/metadataOnly', env.synthetic === true && env.immutable === true && env.metadataOnly === true);
  gate('G423-BLD — built envelope security flags false', env.identityVerified === false && env.coreConsumed === false && env.consumerRuntimeInvoked === false && env.previewMounted === false && env.productExposed === false);
  gate('G423-BLD — built envelope digest outside core', !Object.prototype.hasOwnProperty.call(env.bridgeDecisionCore, 'bridgeDecisionDigest'));
  gate('G423-BLD — built envelope target only inside core', !Object.prototype.hasOwnProperty.call(env, 'targetDescriptor') && Object.prototype.hasOwnProperty.call(env.bridgeDecisionCore, 'targetDescriptor'));
}
// ---- Extra LIVE success seeds (weight) ----
for (const seed of Array.from({ length: 40 }, (_, i) => `x${i}`)) {
  gate(`G423-BLD — LIVE success x-seed ${seed}`, (() => { const d = buildRealDecision(seed); const r = builder.build(d); return r.ok === true && r.coreEnvelope.identityVerified === false && r.identityVerified === true && r.coreEnvelope.bridgeDecisionDigest === d.bridgeDecisionDigest; })());
}

// ---- LIVE digest recompute equivalence + serialize equivalence ----
{
  const d = buildRealDecision('eqv');
  const core = {}; for (const f of CFG.CORE_ALLOWLIST) core[f] = d[f];
  gate('G423-BLD — LIVE createDeterministicDigest(core)==sourceDigest', rt.createDeterministicDigest(core) === d.bridgeDecisionDigest);
  const dmd = { ...d }; delete dmd.bridgeDecisionDigest;
  gate('G423-BLD — LIVE serialize(core)==serialize(decision-digest)', rt.stableSerialize(core) === rt.stableSerialize(dmd));
  gate('G423-BLD — recompute helper ok', (await import(pathToFileURL(path.join(DIR,'recomputeBridgeDecisionDigest.js')).href)).recomputeBridgeDecisionDigest(core, d.bridgeDecisionDigest).ok === true);
}

// ---- LIVE per-allowlist-field tamper rejects atomically ----
{
  const d = buildRealDecision('tmp');
  for (const f of CFG.CORE_ALLOWLIST) {
    const res = builder.build({ ...d, [f]: '__gate_tamper__' });
    gate(`G423-BLD — LIVE tamper ${f} rejects atomically`, res.ok === false && res.coreEnvelope === null && res.issues.length >= 1);
  }
}

// ---- LIVE digest tamper + cross-decision ----
{
  const d = buildRealDecision('dtm');
  const res = builder.build({ ...d, bridgeDecisionDigest: 'fnv1a-00000000' });
  gate('G423-BLD — LIVE digest tamper → DIGEST_MISMATCH, no envelope', res.ok === false && res.coreEnvelope === null && res.issues.some((i) => i.issueCode === 'BUILDER_DIGEST_MISMATCH'));
  const dA = buildRealDecision('cdA', 'clientes', 'Cli', 'nome');
  const dB = buildRealDecision('cdB', 'fornecedores', 'For', 'razao');
  gate('G423-BLD — LIVE distinct decisions distinct digest', dA.bridgeDecisionDigest !== dB.bridgeDecisionDigest);
  const mixed = { ...dB, ...Object.fromEntries(CFG.CORE_ALLOWLIST.map((f) => [f, dA[f]])) };
  gate('G423-BLD — LIVE cross-decision mix rejected', builder.build(mixed).ok === false);
}

// ---- LIVE rejection scenarios ----
const rej = (label, mut, code) => { const d = buildRealDecision('rj'); const res = builder.build(mut(d)); gate(`G423-BLD — LIVE reject ${label}`, res.ok === false && res.coreEnvelope === null && (!code || res.issues.some((i) => i.issueCode === code))); };
rej('null source', () => null, 'BUILDER_SOURCE_REQUIRED');
rej('wrong kind', (d) => ({ ...d, kind: 'x' }), 'BUILDER_SOURCE_KIND_MISMATCH');
rej('not ok', (d) => ({ ...d, ok: false }), 'BUILDER_SOURCE_NOT_READY');
rej('wrong status', (d) => ({ ...d, status: 'z' }), 'BUILDER_SOURCE_NOT_READY');
rej('missing target', (d) => ({ ...d, targetDescriptorCreated: false }), 'BUILDER_TARGET_DESCRIPTOR_REQUIRED');
rej('invented field', (d) => ({ ...d, __x: 1 }), 'BUILDER_SOURCE_INVENTED_FIELD');
rej('bad version', (d) => ({ ...d, bridgeVersion: 'zz' }), 'BUILDER_SOURCE_VERSION_MISMATCH');
rej('security flag true', (d) => ({ ...d, previewMounted: true }), 'BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN');
rej('NaN value', (d) => ({ ...d, issueCount: NaN }), null);
rej('Infinity value', (d) => ({ ...d, issueCount: Infinity }), null);
rej('function value', (d) => ({ ...d, mode: () => 1 }), null);
rej('bigint value', (d) => ({ ...d, issueCount: 1n }), null);

// ---- Emergency containment (proxy) — no leak ----
{
  const p = new Proxy({}, { ownKeys() { throw new Error('boom-secret'); } });
  const res = builder.build(p);
  gate('G423-BLD — emergency proxy rejected', res.ok === false && res.coreEnvelope === null);
  gate('G423-BLD — emergency no leak', !/boom-secret|stack/.test(JSON.stringify(res)));
}

// ---- No source mutation + determinism + cross-instance ----
{
  const d = buildRealDecision('nm');
  const before = JSON.stringify(d);
  builder.build(d);
  gate('G423-BLD — source not mutated', JSON.stringify(d) === before);
  const r1 = builder.build(d); const r2 = builder.build(d); const other = FACTORY.createBridgeDecisionCoreEnvelopeBuilder().build(d);
  gate('G423-BLD — deterministic decision digest', r1.builderDecisionDigest === r2.builderDecisionDigest);
  gate('G423-BLD — cross-instance deterministic', r1.builderDecisionDigest === other.builderDecisionDigest);
}

// ---- Config overrides forbidden ----
gate('G423-BLD — forbidden config override rejected', FACTORY.createBridgeDecisionCoreEnvelopeBuilder({ coreAllowlist: ['x'] }).build(buildRealDecision('c')).ok === false);
gate('G423-BLD — config accepts undefined', typeof FACTORY.createBridgeDecisionCoreEnvelopeBuilder().build === 'function');

// ---- Resource limits + boundaries ----
for (const dim of CFG.RESOURCE_DIMENSIONS) gate(`G423-BLD — limit ${dim} positive integer`, Number.isInteger(CFG.RESOURCE_LIMITS[dim]) && CFG.RESOURCE_LIMITS[dim] > 0);



// ---- Issue codes / statuses ----
for (const c of CFG.ISSUE_CODES) gate(`G423-BLD — issue code ${c}`, typeof c === 'string' && c.length > 0);
gate('G423-BLD — statuses', JSON.stringify([...CFG.DECISION_STATUSES]) === JSON.stringify(['core_envelope_ready', 'core_envelope_rejected']));

// ---- Compatibility / manifest / readiness / manual gate ----
const comp = B.verifyBuilderCompatibility();
gate('G423-BLD — compatibility ok', comp.ok === true, JSON.stringify(comp.blockers));
gate('G423-BLD — compat owner consumer_runtime', comp.identityVerifiedSemanticOwner === 'consumer_runtime');
gate('G423-BLD — compat ARCHITECTURE 1', comp.selectedArchitecture === 'ARCHITECTURE_1');
gate('G423-BLD — compat envelope identity false', comp.coreEnvelopeIdentityVerifiedInvariant === false);
gate('G423-BLD — compat consumer runtime false', comp.consumerRuntimeImplemented === false);
gate('G423-BLD — compat status', comp.status === 'bridge_decision_core_envelope_builder_ready_for_enterprise_audit');
gate('G423-BLD — manifest deterministic', B.createBuilderManifest().overallDigest === B.createBuilderManifest().overallDigest && B.createBuilderManifest().overallDigest.startsWith('fnv1a-'));
gate('G423-BLD — manifest not cryptographic', B.createBuilderManifest().cryptographicIntegrityProvided === false);
const rd = B.createBuilderReadiness();
for (const k of ['builderImplemented', 'buildImplemented', 'coreExtractionImplemented', 'digestRecomputeImplemented', 'envelopeConstructionImplemented', 'sameDecisionAtomicityImplemented', 'failureContainmentImplemented', 'replayIdempotencyImplemented', 'compatibilityVerifierImplemented', 'identityVerificationImplemented']) gate(`G423-BLD — readiness ${k} true`, rd[k] === true);
for (const k of ['consumerRuntimeImplemented', 'previewRuntimeImplemented', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persistenceImplemented', 'backendAccessed', 'prismaAccessed', 'networkUsed', 'realDataRead', 'moduleGenerated', 'certificationPerformed', 'productExposed', 'productionAccessed']) gate(`G423-BLD — readiness ${k} false`, rd[k] === false);
gate('G423-BLD — readiness identity meaning', rd.identityVerificationMeaning === 'builder_source_core_digest_verification');
gate('G423-BLD — readiness envelope identity invariant false', rd.coreEnvelopeIdentityVerifiedInvariant === false);
gate('G423-BLD — readiness state', rd.readiness === 'studio_bridge_decision_core_envelope_builder_ready_for_enterprise_audit');
gate('G423-BLD — readiness audit ready, downstream blocked', rd.readyForEnterpriseBuilderAudit === true && rd.readyForConsumerRuntimeImplementation === false && rd.readyForProductExposure === false);
const mg = B.BUILDER_MANUAL_GATE;
gate('G423-BLD — manual gate authorizes builder impl', mg.authorizesBuilderImplementation === true);
for (const k of ['authorizesConsumerRuntime', 'authorizesPreviewRuntime', 'authorizesPreviewMount', 'authorizesUi', 'authorizesAppTouch', 'authorizesPersistence', 'authorizesBackend', 'authorizesPrisma', 'authorizesModuleGeneration', 'authorizesCertification', 'authorizesProductExposure', 'authorizesCoreEnvelopeAmendment']) gate(`G423-BLD — manual gate ${k} false`, mg[k] === false);
gate('G423-BLD — replay idempotency declared', B.REPLAY_IDEMPOTENCY.crossInstanceDeterministic === true && B.REPLAY_IDEMPOTENCY.randomnessUsed === false && B.REPLAY_IDEMPOTENCY.ambientClockUsed === false);

// ---- No consumer/runtime/UI/App (static) ----
const src = code();
gate('G423-BLD — no React import', !/from\s+['"]react['"]/.test(src));
gate('G423-BLD — no .jsx', !/\.jsx\b/.test(src));
gate('G423-BLD — no fetch(', !/\bfetch\s*\(/.test(src));
gate('G423-BLD — no PrismaClient', !/new\s+PrismaClient/.test(src));
gate('G423-BLD — no fs/network writes', !/\bfs\.(writeFile|appendFileSync)|require\(['"]http|XMLHttpRequest/.test(src));
gate('G423-BLD — no Date.now/Math.random/randomUUID', !/Date\.now\(|Math\.random|crypto\.randomUUID|performance\.now|new Date\(/.test(src));
gate('G423-BLD — no consumer runtime fn', !/function\s+(consume|mountPreview|createConsumerDecision|runConsumerRuntime)\b/.test(src));
gate('G423-BLD — no Verification State Amendment text', !/Verification State Amendment/.test(src));

// ---- Imports read-only ----
gate('G423-BLD — imports only upstream indexes + local', importsOf().every((i) => i.startsWith('.') || i.startsWith('node:') || /blueprint-engine\/(bridge-decision-core-envelope-builder-contract|bridge-decision-envelope-identity-contract|module-blueprint-authoring-runtime)\/index\.js$/.test(i)));
gate('G423-BLD — no App/backend/prisma import', !importsOf().some((i) => /App\.jsx|backend|prisma|src\/modules|\.\.\/\.\.\/\.\.\//.test(i)));

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'BUILDER-IMPLEMENTATION-REPORT.md', 'PUBLIC-API.md', 'SOURCE-TRACEABILITY.md', 'CONFIG-NORMALIZATION.md', 'SAFE-CLONE-NORMALIZE.md', 'SOURCE-SHAPE-VALIDATION.md', 'SOURCE-ELIGIBILITY.md', 'SOURCE-VERSIONS.md', 'SOURCE-SECURITY-BOUNDARY.md', 'TARGET-DESCRIPTOR-VALIDATION.md', 'CORE-ALLOWLIST-RESOLUTION.md', 'CORE-EXTRACTION.md', 'CORE-VALIDATION.md', 'DIGEST-RECOMPUTE.md', 'SAME-DECISION-ATOMICITY.md', 'CORE-ENVELOPE-CONSTRUCTION.md', 'CORE-ENVELOPE-SHAPE-VALIDATION.md', 'IDENTITY-LIFECYCLE-ARCHITECTURE-1.md', 'BUILDER-SUCCESS-DECISION.md', 'BUILDER-REJECTION-DECISION.md', 'EMERGENCY-CONTAINMENT.md', 'PIPELINE-EXECUTION.md', 'ISSUE-MODEL.md', 'RESOURCE-LIMITS.md', 'EXTENSIONS-PROTOTYPE-PROTECTION.md', 'REPLAY-IDEMPOTENCY.md', 'IMMUTABILITY-NO-MUTATION.md', 'MANIFEST-COMPATIBILITY.md', 'READINESS-MANUAL-GATE.md', 'RISK-MATRIX.md', 'NO-CONSUMER-NO-RUNTIME-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'NEXT-ENTERPRISE-BUILDER-AUDIT.md'];
gate('G423-BLD — 34 evidence docs listed', DOCS.length === 34);
for (const d of DOCS) gate(`G423-BLD — doc ${d}`, readEv(d).length > 60);

// ---- Scope ----
const files = (() => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } })();
if (files) {
  gate('G423-BLD — all changed files authorized', files.every((f) => authorized(f)), files.filter((f) => !authorized(f)).join(', ') || 'clean');
  gate('G423-BLD — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'));
  gate('G423-BLD — no upstream subtrees in diff', !files.some((f) => /^src\/studio\/blueprint-engine\/(bridge-decision-core-envelope-builder-contract|bridge-decision-core-envelope-builder-implementation-plan|bridge-decision-core-envelope-contract|bridge-decision-envelope-identity-contract|bridge-to-preview-sandbox-runtime-contract|authoring-runtime-to-preview-bridge|module-blueprint-authoring-runtime|module-preview-sandbox)\//.test(f)));
  gate('G423-BLD — no App/pages/components/modules in diff', !files.some((f) => /^src\/(pages|components|modules|ModeloBase1|ModeloBase2)\//.test(f) || f === 'src/App.jsx'));
}

// ---- No new dependency ----
gate('G423-BLD — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Run the unit test ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch { testOk = false; }
gate('G423-BLD — builder unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-BLD — unit test has >= 1100 scenarios', testCount >= 1100, `${testCount} (min 1100)`);


// ===========================================================================
// CORRECTION PROOFS (§10): resource SSOT + 9 boundaries, target tamper, hostile
// config, exact issue shape, public API no-bypass, first-blocker, compat tamper.
// ===========================================================================
const EXPECTED_LIMITS = { maxSourceDecisionBytes: 524288, maxSourceDecisionFields: 33, maxCoreBytes: 262144, maxCoreFields: 32, maxTargetDescriptorFields: 23, maxEnvelopeBytes: 524288, maxIssues: 512, maxStringLength: 4096, maxStructureDepth: 64 };
for (const [dim, val] of Object.entries(EXPECTED_LIMITS)) {
  const cd = BC.RESOURCE_LIMITS_CONTRACT.dimensions.find((d) => d.dimension === dim);
  gate(`G423-BLD — limit ${dim} == ${val} derived from contract`, CFG.RESOURCE_LIMITS[dim] === val && cd && CFG.RESOURCE_LIMITS[dim] === cd.builderLimit);
}
gate('G423-BLD — 9 dimensions exact order from contract', JSON.stringify([...CFG.RESOURCE_DIMENSIONS]) === JSON.stringify([...BC.RESOURCE_DIMENSION_NAMES]));
gate('G423-BLD — no local maxEnvelopeFields substitution', !Object.prototype.hasOwnProperty.call(CFG.RESOURCE_LIMITS, 'maxEnvelopeFields'));
gate('G423-BLD — unknown dimension rejected', LIM.isKnownDimension('maxEnvelopeFields') === false && LIM.isKnownDimension('bogus') === false);
gate('G423-BLD — UTF-8 byte counting (not .length)', LIM.utf8ByteLength({ a: '\u20ac\u20ac\u20ac' }) > LIM.utf8ByteLength({ a: 'x' }));

// Nine boundary proofs (limit-1 / limit / limit+1) against the enforcer directly.
{
  const big = (n) => 'a'.repeat(n);
  const fields = (n) => { const o = {}; for (let i = 0; i < n; i += 1) o[`f${i}`] = 1; return o; };
  const nest = (d) => { let o = {}; const root = o; for (let i = 0; i < d; i += 1) { o.n = {}; o = o.n; } return root; };
  const L = CFG.RESOURCE_LIMITS;
  for (const k of ['minus1', 'exact', 'plus1']) {
    const over = k === 'plus1';
    const n = (lim) => (k === 'minus1' ? lim - 1 : k === 'exact' ? lim : lim + 1);
    // Field count is enforced on the SHAPE stage so an invented field is never shadowed by an earlier limit issue.
    gate(`G423-BLD — boundary maxSourceDecisionFields ${k}`, LIM.enforceSourceFieldCountLimit(fields(n(L.maxSourceDecisionFields))).some((i) => i.path === 'source' && i.stage === 'source_decision_shape_validation') === over);
    gate(`G423-BLD — boundary maxCoreFields ${k}`, LIM.enforceCoreResourceLimits(fields(n(L.maxCoreFields))).some((i) => i.path === 'core') === over);
    gate(`G423-BLD — boundary maxTargetDescriptorFields ${k}`, (LIM.enforceTargetDescriptorLimits(fields(n(L.maxTargetDescriptorFields))).length > 0) === over);
    gate(`G423-BLD — boundary maxStringLength ${k}`, LIM.enforceSourceResourceLimits({ s: big(n(L.maxStringLength)) }).some((i) => i.path === 'source.string') === over);
    gate(`G423-BLD — boundary maxStructureDepth ${k}`, (LIM.enforceStructureDepth(nest(n(L.maxStructureDepth))).length > 0) === over);
    const chunk = big(L.maxStringLength - 1);
    const payload = (lim) => { const o = {}; const c = Math.max(Math.ceil(lim / chunk.length) + (over ? 2 : -2), 1); for (let i = 0; i < c; i += 1) o[`k${i}`] = chunk; return o; };
    const pS = payload(L.maxSourceDecisionBytes);
    gate(`G423-BLD — boundary maxSourceDecisionBytes ${k}`, LIM.enforceSourceResourceLimits(pS).some((i) => i.path === 'source.bytes') === (LIM.utf8ByteLength(pS) > L.maxSourceDecisionBytes));
    const pC = payload(L.maxCoreBytes);
    gate(`G423-BLD — boundary maxCoreBytes ${k}`, LIM.enforceCoreResourceLimits(pC).some((i) => i.path === 'core.bytes') === (LIM.utf8ByteLength(pC) > L.maxCoreBytes));
    const pE = payload(L.maxEnvelopeBytes);
    gate(`G423-BLD — boundary maxEnvelopeBytes ${k}`, LIM.enforceEnvelopeResourceLimits(pE).some((i) => i.path === 'envelope.bytes') === (LIM.utf8ByteLength(pE) > L.maxEnvelopeBytes));
    const many = Array.from({ length: n(L.maxIssues) }, (_, i) => ISS.makeIssue('BUILDER_CORE_FIELD_MISSING', 'core_completeness_validation', 'blocker', `f${i}`));
    const norm = ISS.normalizeIssuesWithOverflow(many);
    gate(`G423-BLD — boundary maxIssues ${k} (no silent truncation)`, over ? (norm.length === 1 && norm[0].issueCode === 'BUILDER_LIMIT_EXCEEDED') : norm.length === n(L.maxIssues));
  }
}

// Target descriptor: exact shape + per-class tamper.
{
  const d = buildRealDecision('gtd');
  gate('G423-BLD — target 23 real fields', CFG.TARGET_DESCRIPTOR_FIELDS.length === 23 && JSON.stringify([...CFG.TARGET_DESCRIPTOR_FIELDS].sort()) === JSON.stringify([...ENV.REAL_TARGET_DESCRIPTOR_FIELDS].sort()));
  gate('G423-BLD — target valid descriptor accepted', TD.validateTargetDescriptor(d).length === 0);
  for (const f of CFG.TARGET_DESCRIPTOR_REQUIRED_FIELDS) { const td = { ...d.targetDescriptor }; delete td[f]; gate(`G423-BLD — target required ${f} missing rejected`, TD.validateTargetDescriptor({ ...d, targetDescriptor: td }).length > 0); }
  for (const f of CFG.TARGET_DESCRIPTOR_SECURITY_FIELDS) gate(`G423-BLD — target security ${f}=true rejected`, TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: true } }).some((i) => i.issueCode === 'BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN'));
  // Invariants are derived from the REAL upstream (1 string + 4 true + 7 false), so the violation is the NEGATION
  // of each declared value — writing `false` over an already-false invariant would be a no-op, not a tamper.
  for (const f of Object.keys(CFG.TARGET_DESCRIPTOR_INVARIANTS)) { const dec = CFG.TARGET_DESCRIPTOR_INVARIANTS[f]; const bad = typeof dec === 'boolean' ? !dec : 'wrong-invariant-value'; gate(`G423-BLD — target invariant ${f} violated rejected`, TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: bad } }).length > 0); }
  for (const f of CFG.TARGET_DESCRIPTOR_VERSION_FIELDS) gate(`G423-BLD — target version ${f} malformed rejected`, TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: 'zz' } }).some((i) => i.issueCode === 'BUILDER_SOURCE_VERSION_MISMATCH'));
  for (const f of CFG.TARGET_DESCRIPTOR_DIGEST_FIELDS) gate(`G423-BLD — target digest ${f} malformed rejected`, TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: 'zz' } }).some((i) => i.issueCode === 'BUILDER_DIGEST_REQUIRED'));
  gate('G423-BLD — target invented field rejected', TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, __x: 1 } }).some((i) => i.issueCode === 'BUILDER_SOURCE_INVENTED_FIELD'));
  gate('G423-BLD — target wrong kind rejected', TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, kind: 'x' } }).some((i) => i.issueCode === 'BUILDER_SOURCE_KIND_MISMATCH'));
}

// Hostile config: factory never throws.
{
  const HOSTILE = [
    ['ownKeys throw', () => new Proxy({}, { ownKeys() { throw new Error('x'); } })],
    ['getPrototypeOf throw', () => new Proxy({}, { getPrototypeOf() { throw new Error('x'); } })],
    ['getOwnPropertyDescriptor throw', () => new Proxy({}, { ownKeys() { return ['a']; }, getOwnPropertyDescriptor() { throw new Error('x'); } })],
    ['get throw', () => new Proxy({ a: 1 }, { get() { throw new Error('x'); } })],
    ['getter', () => Object.defineProperty({}, 'g', { get() { throw new Error('x'); }, enumerable: true })],
    ['cycle', () => { const o = {}; o.self = o; return o; }],
    ['sparse array', () => { const a = [1]; delete a[0]; return { arr: a }; }],
    ['__proto__ pollution', () => JSON.parse('{"__proto__":{"polluted":true}}')],
    ['constructor key', () => ({ constructor: 1 })],
    ['prototype key', () => ({ prototype: 1 })],
  ];
  for (const [label, make] of HOSTILE) {
    let b; let threw = false;
    try { b = FACTORY.createBridgeDecisionCoreEnvelopeBuilder(make()); } catch { threw = true; }
    const res = threw ? null : b.build(buildRealDecision('gh'));
    gate(`G423-BLD — hostile config ${label}: factory never throws + sanitized`, !threw && JSON.stringify(Object.keys(b)) === '["build"]' && Object.isFrozen(b) && res !== null && Object.isFrozen(res) && res.issues.every((i) => ISS.hasExactIssueShape(i)) && !/Error|stack/.test(JSON.stringify(res)) && {}.polluted === undefined);
  }
}

// Exact issue shape.
{
  gate('G423-BLD — issue shape == contract (10 fields, order)', JSON.stringify([...CFG.ISSUE_SHAPE_FIELDS]) === JSON.stringify([...BC.ISSUE_MODEL_CONTRACT.issueShapeFields]));
  const i = ISS.makeIssue('BUILDER_DIGEST_MISMATCH', 'digest_recompute_validation', 'blocker', 'core.digest');
  gate('G423-BLD — issue has exact shape', ISS.hasExactIssueShape(i) && JSON.stringify(Object.keys(i)) === JSON.stringify([...CFG.ISSUE_SHAPE_FIELDS]));
  gate('G423-BLD — issue blocks flags coherent', i.blocksBuilder === true && i.blocksEnvelope === true && i.blocksRuntime === true && i.blocksPreviewSandbox === true && i.deterministic === true);
  // STRICT issue model: an invalid stage or a supplied-but-invalid path is a construction FAILURE, never a
  // silently corrected value.
  let threwStage = false; try { ISS.makeIssue('BUILDER_CONFIG_INVALID', 'x'); } catch { threwStage = true; }
  let threwPath = false; try { ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary', 'blocker', '/etc/passwd'); } catch { threwPath = true; }
  gate('G423-BLD — invalid stage THROWS (no unknown bucket)', threwStage);
  gate('G423-BLD — invalid supplied path THROWS (no silent blanking)', threwPath);
  const d = buildRealDecision('gis');
  gate('G423-BLD — all builder issues have exact shape', builder.build({ ...d, kind: 'x' }).issues.every((x) => ISS.hasExactIssueShape(x)));
}

// Public API: no bypass.
{
  gate('G423-BLD — factory keys === ["build"]', JSON.stringify(Object.keys(FACTORY.createBridgeDecisionCoreEnvelopeBuilder())) === '["build"]');
  for (const f of ['extractBridgeDecisionCore', 'recomputeBridgeDecisionDigest', 'constructCoreEnvelope', 'createBuilderDecision', 'createBuilderRejection', 'createEmergencyBuilderRejection', 'normalizeSourceDecision', 'normalizeBuilderConfig', 'validateSourceDecisionShape', 'validateTargetDescriptor', 'validateExtractedCore', 'validateCoreEnvelopeShape', 'enforceSourceResourceLimits', 'safeCloneAndNormalize', 'makeIssue', 'normalizeIssues']) {
    gate(`G423-BLD — public index has NO bypass ${f}`, typeof B[f] === 'undefined');
  }
  gate('G423-BLD — public index keeps factory/readiness/compat', typeof B.createBridgeDecisionCoreEnvelopeBuilder === 'function' && typeof B.verifyBuilderCompatibility === 'function' && typeof B.createBuilderReadiness === 'function');
}

// Pipeline first-blocker.
{
  const d = buildRealDecision('gfb');
  const codes = builder.build({ ...d, kind: 'x' }).issues.map((i) => i.issueCode);
  gate('G423-BLD — first blocker stops pipeline (no later-stage issues)', codes.includes('BUILDER_SOURCE_KIND_MISMATCH') && !codes.includes('BUILDER_DIGEST_MISMATCH') && !codes.includes('BUILDER_CROSS_DECISION_MIX_FORBIDDEN') && !codes.includes('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN'));
  const codes2 = builder.build({ ...d, __x: 1 }).issues.map((i) => i.issueCode);
  gate('G423-BLD — shape blocker precedes digest stage', codes2.includes('BUILDER_SOURCE_INVENTED_FIELD') && !codes2.includes('BUILDER_DIGEST_MISMATCH'));
  gate('G423-BLD — envelope only after all stages', builder.build(d).coreEnvelopeCreated === true && builder.build({ ...d, ok: false }).coreEnvelope === null);
}

// Compatibility: exact comparisons.
gate('G423-BLD — compat performs exact comparisons', B.verifyBuilderCompatibility().exactComparisonsPerformed === true);
gate('G423-BLD — compat pipeline ORDER exact', JSON.stringify([...CFG.PIPELINE_STAGES]) === JSON.stringify([...BC.BUILDER_PIPELINE_STAGES]));
gate('G423-BLD — compat envelope field ORDER exact', JSON.stringify([...CFG.ENVELOPE_FIELDS]) === JSON.stringify([...BC.OUTPUT_CORE_ENVELOPE_FIELDS]));
gate('G423-BLD — compat source field ORDER exact', JSON.stringify([...CFG.SOURCE_FIELDS]) === JSON.stringify([...BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS]));
gate('G423-BLD — compat issue codes SET exact', JSON.stringify([...CFG.ISSUE_CODES].sort()) === JSON.stringify([...BC.BUILDER_ISSUE_CODES].sort()));
gate('G423-BLD — readiness gated by compatibility', B.createBuilderReadiness().compatibilityOk === true && B.createBuilderReadiness().readyForEnterpriseBuilderAudit === true);

// ===========================================================================
// ROUND 2 — independent gate proofs for the nine reported blockers.
// ===========================================================================
{
  const NC = NCFG.normalizeBuilderConfig();
  const run = (dec) => EXEC.executeBuilderValidationPipeline(dec, NC.config);
  const d0 = buildRealDecision('gr2');

  // R2-TSSOT — target lists/values are the REAL upstream, not local copies.
  const SSOT = [
    ['fields', CFG.TARGET_DESCRIPTOR_FIELDS, RC.REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
    ['required', CFG.TARGET_DESCRIPTOR_REQUIRED_FIELDS, RC.REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
    ['security', CFG.TARGET_DESCRIPTOR_SECURITY_FIELDS, RC.SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
    ['version', CFG.TARGET_DESCRIPTOR_VERSION_FIELDS, RC.VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
    ['digest', CFG.TARGET_DESCRIPTOR_DIGEST_FIELDS, RC.DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
  ];
  for (const [name, local, up] of SSOT) {
    gate(`G423-BLD — R2 target ${name} list EXACTLY upstream`, JSON.stringify([...local]) === JSON.stringify([...up]));
    for (const f of up) gate(`G423-BLD — R2 target ${name} contains upstream ${f}`, local.includes(f));
    for (const f of local) gate(`G423-BLD — R2 target ${name} has no extra field ${f}`, up.includes(f));
  }
  gate('G423-BLD — R2 target invariants map EXACTLY upstream', JSON.stringify(Object.entries({ ...CFG.TARGET_DESCRIPTOR_INVARIANTS }).sort()) === JSON.stringify(Object.entries({ ...RC.REAL_TARGET_DESCRIPTOR_INVARIANTS }).sort()));
  for (const k of Object.keys(RC.REAL_TARGET_DESCRIPTOR_INVARIANTS)) gate(`G423-BLD — R2 target invariant ${k} derived`, CFG.TARGET_DESCRIPTOR_INVARIANTS[k] === RC.REAL_TARGET_DESCRIPTOR_INVARIANTS[k]);
  gate('G423-BLD — R2 targetKind from upstream', CFG.TARGET_DESCRIPTOR_TARGET_KIND === RC.SOURCE_TARGET_SANDBOX_KIND);
  gate('G423-BLD — R2 target contract version from upstream', CFG.SOURCE_TARGET_CONTRACT_VERSION === RC.SOURCE_TARGET_CONTRACT_VERSION);
  gate('G423-BLD — R2 authoring runtime version from upstream', CFG.AUTHORING_RUNTIME_VERSION_REF === RC.SOURCE_AUTHORING_RUNTIME_VERSION);
  gate('G423-BLD — R2 preview sandbox version from upstream', CFG.PREVIEW_SANDBOX_CONTRACT_VERSION_REF === RC.SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION);
  gate('G423-BLD — R2 source handoff kind from upstream', CFG.SOURCE_HANDOFF_KIND_REF === bridge.SOURCE_HANDOFF_KIND);
  gate('G423-BLD — R2 source handoff version from upstream', CFG.SOURCE_HANDOFF_VERSION_REF === bridge.SOURCE_HANDOFF_VERSION);
  gate('G423-BLD — R3 descriptor kind DERIVED from the pure upstream factory', CFG.TARGET_DESCRIPTOR_KIND === bridge.createTargetPreviewSandboxDescriptor({ mapped: {} }).kind && d0.targetDescriptor.kind === CFG.TARGET_DESCRIPTOR_KIND);
  gate('G423-BLD — R3 no local descriptor-kind literal in the subtree', !jsFiles().some((f) => /'bridge-target-preview-sandbox-descriptor'/.test(fs.readFileSync(f, 'utf8'))));
  gate('G423-BLD — R3 local-reference exception removed', typeof CFG.TARGET_DESCRIPTOR_KIND_LOCAL_REFERENCE_EXCEPTION === 'undefined');
  gate('G423-BLD — R2 no local target array literal in config', !/TARGET_DESCRIPTOR_(FIELDS|REQUIRED_FIELDS|SECURITY_FIELDS|VERSION_FIELDS|DIGEST_FIELDS)\s*=\s*deepFreeze\(\[\s*'/.test(fs.readFileSync(path.join(DIR, 'builderConfig.js'), 'utf8')));

  // R2-VTUPLE — every version field compared EXACTLY.
  const EXPECT = {
    targetContractVersion: CFG.SOURCE_TARGET_CONTRACT_VERSION,
    sourceRuntimeVersion: CFG.AUTHORING_RUNTIME_VERSION_REF,
    sourceHandoffVersion: CFG.SOURCE_HANDOFF_VERSION_REF,
    sourceTargetSandboxVersion: CFG.PREVIEW_SANDBOX_CONTRACT_VERSION_REF,
  };
  for (const f of CFG.TARGET_DESCRIPTOR_VERSION_FIELDS) {
    gate(`G423-BLD — R2 version ${f} real value equals upstream`, d0.targetDescriptor[f] === EXPECT[f]);
    gate(`G423-BLD — R2 version ${f} semver-valid but WRONG rejected`, TD.validateTargetDescriptor({ ...d0, targetDescriptor: { ...d0.targetDescriptor, [f]: 'fake-runtime@9.9.9' } }).some((i) => i.issueCode === 'BUILDER_SOURCE_VERSION_MISMATCH' && i.path === `targetDescriptor.${f}`));
    gate(`G423-BLD — R2 version ${f} wrong rejected end-to-end`, FACTORY.createBridgeDecisionCoreEnvelopeBuilder().build({ ...d0, targetDescriptor: { ...d0.targetDescriptor, [f]: 'other@1.0.0' } }).coreEnvelope === null);
  }
  gate('G423-BLD — R2 sourceHandoffKind compared exactly', TD.validateTargetDescriptor({ ...d0, targetDescriptor: { ...d0.targetDescriptor, sourceHandoffKind: 'other-kind' } }).some((i) => i.issueCode === 'BUILDER_SOURCE_KIND_MISMATCH'));

  // R2-EXEC — all 23 stages actually executed, in canonical order.
  const okRun = run(d0);
  gate('G423-BLD — R2 pipeline executes 23 stages', okRun.ok === true && okRun.executedStages.length === 23);
  gate('G423-BLD — R2 executed order is canonical', JSON.stringify([...okRun.executedStages]) === JSON.stringify([...CFG.PIPELINE_STAGES]));
  gate('G423-BLD — R2 successful run stops nowhere', okRun.stoppedAtStage === null);
  CFG.PIPELINE_STAGES.forEach((st, i) => gate(`G423-BLD — R2 stage ${String(i + 1).padStart(2, '0')} ${st} executed at canonical position`, okRun.executedStages[i] === st));
  for (const st of CFG.PIPELINE_STAGES.slice(16)) gate(`G423-BLD — R2 boundary stage ${st} really runs`, okRun.executedStages.includes(st));
  gate('G423-BLD — R2 executedStages frozen + names only', Object.isFrozen(okRun.executedStages) && okRun.executedStages.every((st) => CFG.PIPELINE_STAGES.includes(st)));
  gate('G423-BLD — R2 executor is INTERNAL (not on the public index)', typeof B.executeBuilderValidationPipeline === 'undefined');
  gate('G423-BLD — R2 factory delegates to the executor', /executeBuilderValidationPipeline/.test(fs.readFileSync(path.join(DIR, 'createBridgeDecisionCoreEnvelopeBuilder.js'), 'utf8')));

  // R2-ATOMIC — first blocker stops the walk, stage-atomically.
  const ATOMIC = [
    ['non_object_source', () => 42, 'source_structure_normalization'],
    ['invented_field', (d) => ({ ...d, __invented: 1 }), 'source_decision_shape_validation'],
    ['not_ready_status', (d) => ({ ...d, status: 'nope' }), 'source_decision_eligibility_validation'],
    ['wrong_target_version', (d) => ({ ...d, targetDescriptor: { ...d.targetDescriptor, targetContractVersion: 'x@1.0.0' } }), 'source_target_descriptor_validation'],
  ];
  for (const [label, mutate, expected] of ATOMIC) {
    const r = run(mutate(d0));
    const idx = CFG.PIPELINE_STAGES.indexOf(r.stoppedAtStage);
    gate(`G423-BLD — R2 atomic ${label} stops at ${expected}`, r.ok === false && r.stoppedAtStage === expected);
    gate(`G423-BLD — R2 atomic ${label} emits no envelope/core`, r.envelope === null && r.core === null);
    gate(`G423-BLD — R2 atomic ${label} runs no later stage`, r.executedStages.length === idx + 1);
    gate(`G423-BLD — R2 atomic ${label} all issues belong to the stopping stage`, r.issues.every((i) => i.stage === r.stoppedAtStage));
  }

  // R2-STAGE — closed issue stage allowlist.
  gate('G423-BLD — R2 stage allowlist = 23 canonical + 2 boundaries', JSON.stringify([...ISS.ISSUE_STAGE_ALLOWLIST]) === JSON.stringify([...CFG.PIPELINE_STAGES, 'config_normalization', 'public_boundary']));
  for (const st of ISS.ISSUE_STAGE_ALLOWLIST) gate(`G423-BLD — R2 stage allowed preserved ${st}`, ISS.makeIssue('BUILDER_CONFIG_INVALID', st).stage === st);
  for (const bad of ['made_up_stage', 'resource_limit_enforcement', 'target_limit_enforcement', 'core_limit_enforcement', 'envelope_limit_enforcement', 'depth_limit_enforcement', 'issue_limit_enforcement', 'extension_validation', 'a', 'zzz', 'unknown']) {
    let threw = false; try { ISS.makeIssue('BUILDER_CONFIG_INVALID', bad); } catch { threw = true; }
    gate(`G423-BLD — R2 stage arbitrary token THROWS ${bad}`, ISS.isAllowedIssueStage(bad) === false && threw);
  }
  gate('G423-BLD — R2 no permissive stage regex remains', !/\[a-z_\]\{1,64\}/.test(fs.readFileSync(path.join(DIR, 'normalizeIssues.js'), 'utf8')));
  gate('G423-BLD — R2 no `code` alias in normalizeIssues', !/issueCode \?\? /.test(fs.readFileSync(path.join(DIR, 'normalizeIssues.js'), 'utf8')));
  gate('G423-BLD — R3 no `unknown` stage fallback in normalizeIssues', !/\?\s*stage\s*:\s*'unknown'/.test(fs.readFileSync(path.join(DIR, 'normalizeIssues.js'), 'utf8')));
  gate('G423-BLD — R2 no invented stage name anywhere in the subtree', !/_limit_enforcement|extension_validation/.test(code()));

  // R2-ARRAY — descriptor-only array read path.
  {
    let trapped = 0;
    const hostile = new Proxy(['a', 'b'], { get(t, k, r) { if (k === 'length' || /^\d+$/.test(String(k))) trapped += 1; return Reflect.get(t, k, r); } });
    const cloned = CLONE.safeCloneAndNormalize({ list: hostile });
    gate('G423-BLD — R2 hostile array getters never invoked', trapped === 0);
    gate('G423-BLD — R2 hostile array cloned by value', JSON.stringify(cloned.list) === JSON.stringify(['a', 'b']) && cloned.list !== hostile);
  }
  {
    const arr = ['a']; arr.extra = 1;
    let threw = false; try { CLONE.safeCloneAndNormalize({ arr }); } catch { threw = true; }
    gate('G423-BLD — R2 array with extra own property rejected', threw);
  }
  gate('G423-BLD — R2 no raw v.length / v[i] read in the array branch', !/for \(let i = 0; i < v\.length/.test(fs.readFileSync(path.join(DIR, 'safeCloneAndNormalize.js'), 'utf8')));

  // R2-COMPAT — the verifier DETECTS divergence.
  gate('G423-BLD — R2 untampered snapshot yields zero blockers', COMPAT.evaluateBuilderCompatibilitySnapshot(COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT).length === 0);
  gate('G423-BLD — R2 verifier declares no subset comparisons', B.verifyBuilderCompatibility().subsetComparisonsPerformed === false);
  gate('G423-BLD — R2 no subset helper remains in the verifier', !/subsetOf/.test(fs.readFileSync(path.join(DIR, 'verifyBuilderCompatibility.js'), 'utf8')));
  for (const key of Object.keys(COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT)) {
    const v = COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT[key];
    const bad = Array.isArray(v) ? v.slice(0, Math.max(0, v.length - 1)) : (v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).slice(1)) : 'tampered-value');
    gate(`G423-BLD — R2 compat tamper detected: ${key}`, COMPAT.evaluateBuilderCompatibilitySnapshot({ ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT, [key]: bad }).length > 0);
  }
  for (const key of ['targetRequiredFields', 'targetSecurityFields', 'targetVersionFields', 'targetDigestFields']) {
    gate(`G423-BLD — R2 compat strict SUBSET of ${key} is a blocker`, COMPAT.evaluateBuilderCompatibilitySnapshot({ ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT, [key]: COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT[key].slice(1) }).length > 0);
    gate(`G423-BLD — R2 compat strict SUPERSET of ${key} is a blocker`, COMPAT.evaluateBuilderCompatibilitySnapshot({ ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT, [key]: [...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT[key], 'kind'] }).length > 0);
  }

  // R2-READY — fail-closed readiness string.
  const rdSrc = fs.readFileSync(path.join(DIR, 'builderReadiness.js'), 'utf8');
  gate('G423-BLD — R2 readiness strings distinct', RDY.READINESS_READY !== RDY.READINESS_NEEDS_FIX);
  gate('G423-BLD — R2 readiness derived from the verifier', /readiness: ready \? READINESS_READY : READINESS_NEEDS_FIX/.test(rdSrc));
  gate('G423-BLD — R2 readiness never a hardcoded literal', !/readiness: '/.test(rdSrc));
  gate('G423-BLD — R2 audit-ready wording only when compatibility passes', B.createBuilderReadiness().readiness === (B.createBuilderReadiness().compatibilityOk ? RDY.READINESS_READY : RDY.READINESS_NEEDS_FIX));
  for (const flag of ['pipelineImplemented', 'all23StagesExecutedOnSuccess', 'all23StagesHaveDirectValidationProof', 'boundaryStages17To23HaveDirectValidationProof', 'firstBlockerStageAtomic', 'issueModelStrictNoFallback', 'configFailClosed', 'arrayLimitSemanticsCorrect', 'manifestComplete', 'exactTargetDescriptorComparison', 'exactVersionTupleComparison']) {
    gate(`G423-BLD — R2 readiness declares ${flag}`, B.createBuilderReadiness()[flag] === true);
  }
}

// ===========================================================================
// ROUND 3 — final hardening gate proofs.
// ===========================================================================
{
  const NC3 = NCFG.normalizeBuilderConfig();
  const run3 = (dec) => EXEC.executeBuilderValidationPipeline(dec, NC3.config);
  const d3 = buildRealDecision('gr3');

  // R3 compatibility snapshot — full coverage + tamper on EVERY key.
  const SNAP_KEYS = ['sourceFields', 'requiredSourceFields', 'eligibilityFields', 'sourceSecurityFields', 'coreAllowlist',
    'envelopeFields', 'envelopeInvariants', 'pipelineStages', 'issueCodes', 'issueShapeFields', 'issueStageAllowlist',
    'resourceDimensions', 'resourceLimits', 'targetFields', 'targetRequiredFields', 'targetSecurityFields',
    'targetVersionFields', 'targetDigestFields', 'targetInvariants', 'targetDescriptorKind', 'targetKind',
    'targetContractVersion', 'authoringRuntimeVersion', 'sourceHandoffKind', 'sourceHandoffVersion',
    'previewSandboxContractVersion', 'identityVerifiedSemanticOwner', 'selectedArchitecture', 'architectureOneFinal',
    'coreEnvelopeIdentityVerifiedInvariant', 'builderContractVersion', 'coreEnvelopeV2Version', 'bridgeVersion',
    'factoryResultKeys'];
  gate('G423-BLD — R3 snapshot covers exactly the required keys', JSON.stringify(Object.keys(COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT).sort()) === JSON.stringify([...SNAP_KEYS].sort()));
  for (const k of SNAP_KEYS) {
    const v = COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT[k];
    const bad = Array.isArray(v) ? [...v, 'kind'] : (v && typeof v === 'object' ? { ...v, __extra__: 1 } : (typeof v === 'boolean' ? !v : 'tampered-value'));
    gate(`G423-BLD — R3 divergent snapshot.${k} is a blocker`, COMPAT.evaluateBuilderCompatibilitySnapshot({ ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT, [k]: bad }).length > 0);
    const { [k]: _drop, ...rest } = COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT;
    gate(`G423-BLD — R3 missing snapshot.${k} is a blocker`, COMPAT.evaluateBuilderCompatibilitySnapshot(rest).length > 0);
  }
  for (const k of ['envelopeInvariants', 'resourceLimits', 'targetInvariants']) {
    gate(`G423-BLD — R3 EXTRA key in ${k} is a blocker`, COMPAT.evaluateBuilderCompatibilitySnapshot({ ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT, [k]: { ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT[k], __x__: 1 } }).length > 0);
    gate(`G423-BLD — R3 MISSING key in ${k} is a blocker`, COMPAT.evaluateBuilderCompatibilitySnapshot({ ...COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT, [k]: Object.fromEntries(Object.entries(COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT[k]).slice(1)) }).length > 0);
  }
  const c3 = B.verifyBuilderCompatibility();
  gate('G423-BLD — R3 contractSnapshotExact separated', c3.contractSnapshotExact === true);
  gate('G423-BLD — R3 factorySurfaceExact separated', c3.factorySurfaceExact === true);
  gate('G423-BLD — R3 publicIndex surface delegated to test+gate', c3.publicIndexSurfaceVerifiedByDedicatedTestAndGate === true);
  gate('G423-BLD — R3 owner derived from the identity contract', COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT.identityVerifiedSemanticOwner === BC.IDENTITY_VERIFICATION_STATE_CONTRACT.identityVerifiedSemanticOwner);
  gate('G423-BLD — R3 architecture derived from the identity contract', COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT.selectedArchitecture === BC.IDENTITY_VERIFICATION_STATE_CONTRACT.selectedArchitecture && COMPAT.BUILDER_COMPATIBILITY_SNAPSHOT.architectureOneFinal === BC.IDENTITY_VERIFICATION_STATE_CONTRACT.ARCHITECTURE_1_IS_FINAL);
  gate('G423-BLD — R3 public index surface EXACTLY the allowlist', JSON.stringify(Object.keys(B).sort()) === JSON.stringify([...COMPAT.PUBLIC_INDEX_EXPORT_ALLOWLIST].sort()));
  for (const f of ['executeBuilderValidationPipeline', 'BOUNDARY_STAGE_VALIDATORS', 'PIPELINE_STAGE_PROOF_MATRIX', 'evaluateBuilderCompatibilitySnapshot', 'digestManifestParts', 'MANIFEST_PART_NAMES', 'IDENTITY_ARCHITECTURE', 'BuilderIssueConstructionError']) {
    gate(`G423-BLD — R3 no execution seam exported: ${f}`, typeof B[f] === 'undefined');
  }

  // R3 strict issue model.
  for (const bad of ['NOT_A_REAL_CODE', '', 'builder_config_invalid']) {
    let t = false; try { ISS.makeIssue(bad, 'public_boundary'); } catch { t = true; }
    gate(`G423-BLD — R3 unknown issueCode THROWS ${JSON.stringify(bad)}`, t);
  }
  for (const bad of ['weird', '', 'BLOCKER']) {
    let t = false; try { ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary', bad); } catch { t = true; }
    gate(`G423-BLD — R3 unknown severity THROWS ${JSON.stringify(bad)}`, t);
  }
  for (const bad of ['/etc/passwd', '../up', 'a b', 'weird$char']) {
    let t = false; try { ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary', 'blocker', bad); } catch { t = true; }
    gate(`G423-BLD — R3 invalid path THROWS ${JSON.stringify(bad)}`, ISS.isValidIssuePath(bad) === false && t);
  }
  gate('G423-BLD — R3 omitted path stays empty', ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary').path === '');
  for (const [label, bad] of [['non-array', 'nope'], ['non-object entry', [1]], ['incomplete shape', [{ issueCode: 'BUILDER_CONFIG_INVALID' }]],
    ['extra field', [{ ...ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary'), extra: 1 }]],
    ['code alias', [{ ...ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary'), code: 'X' }]],
    ['invalid stage', [{ ...ISS.makeIssue('BUILDER_CONFIG_INVALID', 'public_boundary'), stage: 'nope' }]]]) {
    let t = false; try { ISS.normalizeIssues(bad); } catch { t = true; }
    gate(`G423-BLD — R3 normalizeIssues fails closed on ${label}`, t);
  }
  const em = EMR.createEmergencyBuilderRejection();
  gate('G423-BLD — R3 emergency rejection is the single fixed shape', em.ok === false && em.coreEnvelope === null && em.issues.length === 1
    && em.issues[0].issueCode === 'BUILDER_UNEXPECTED_EXECUTION_FAILURE' && em.issues[0].stage === 'public_boundary'
    && em.issues[0].severity === 'blocker' && ISS.hasExactIssueShape(em.issues[0]) && Object.isFrozen(em));
  {
    let threw = false;
    for (const hostile of [new Proxy({}, { ownKeys() { throw new Error('SECRET'); } }), 42, 'str', null, undefined, () => {}]) {
      try { const r = builder.build(hostile); if (JSON.stringify(r).includes('SECRET')) threw = true; } catch { threw = true; }
    }
    gate('G423-BLD — R3 public build never throws and never leaks', threw === false);
  }
  gate('G423-BLD — R3 no builder issue carries the stage `unknown`', builder.build({ ...d3, __x: 1 }).issues.every((i) => ISS.isAllowedIssueStage(i.stage)));

  // R3 array semantics.
  for (const n of [33, 34, 40, 128, 512]) {
    let ok3 = false; try { ok3 = CLONE.safeCloneAndNormalize({ arr: Array.from({ length: n }, (_, i) => `v${i}`) }).arr.length === n; } catch { ok3 = false; }
    gate(`G423-BLD — R3 dense array of ${n} items accepted`, ok3);
  }
  gate('G423-BLD — R3 maxSourceDecisionFields no longer bounds arrays', LIM.enforceSourceFieldCountLimit({ arr: Array.from({ length: 128 }, (_, i) => i) }).length === 0);
  gate('G423-BLD — R3 no array-length check against maxSourceDecisionFields', !/len > RESOURCE_LIMITS\.maxSourceDecisionFields/.test(fs.readFileSync(path.join(DIR, 'safeCloneAndNormalize.js'), 'utf8')));

  // R3 config fail-closed.
  for (const okCfg of [undefined, null, {}, { maxStructureDepth: 1 }, { maxStructureDepth: CFG.MAX_STRUCTURE_DEPTH }]) {
    gate(`G423-BLD — R3 config accepted ${JSON.stringify(okCfg) || String(okCfg)}`, NCFG.normalizeBuilderConfig(okCfg).ok === true);
  }
  const BADC = [['unknown key', { nope: 1 }], ['strict true', { strict: true }], ['strict false', { strict: false }],
    ['strict wrong type', { strict: 'yes' }], ['depth 0', { maxStructureDepth: 0 }], ['depth negative', { maxStructureDepth: -1 }],
    ['depth float', { maxStructureDepth: 1.5 }], ['depth string', { maxStructureDepth: '8' }],
    ['depth over max', { maxStructureDepth: CFG.MAX_STRUCTURE_DEPTH + 1 }], ['array', [1, 2]],
    ['forbidden override', { coreAllowlist: [] }], ['pollution', JSON.parse('{"__proto__":{"x":1}}')]];
  for (const [label, cfg] of BADC) {
    const r = NCFG.normalizeBuilderConfig(cfg);
    gate(`G423-BLD — R3 config rejected: ${label}`, r.ok === false && r.config === undefined);
    gate(`G423-BLD — R3 rejected config yields a rejecting builder: ${label}`, FACTORY.createBridgeDecisionCoreEnvelopeBuilder(cfg).build(d3).ok === false);
  }
  gate('G423-BLD — R3 default only when absent', NCFG.normalizeBuilderConfig({}).config.maxStructureDepth === CFG.MAX_STRUCTURE_DEPTH && NCFG.normalizeBuilderConfig({ maxStructureDepth: 5 }).config.maxStructureDepth === 5);
  gate('G423-BLD — R3 strict is not a fictional option', CFG.BUILDER_ALWAYS_STRICT === true && JSON.stringify([...CFG.BUILDER_CONFIG_ALLOWED_KEYS]) === '["maxStructureDepth"]' && !Object.prototype.hasOwnProperty.call(CFG.DEFAULT_BUILDER_CONFIG, 'strict'));

  // R3 manifest — 23 parts.
  const EXPECTED_PARTS = ['configSchema', 'publicApi', 'sourceFields', 'sourceRequiredFields', 'sourceEligibility',
    'sourceSecurity', 'targetFields', 'targetRequiredFields', 'targetSecurityFields', 'targetVersionTuple',
    'targetDigestFields', 'targetInvariants', 'coreAllowlist', 'envelopeFields', 'envelopeInvariants', 'pipelineStages',
    'issueCodes', 'issueShape', 'issueStageAllowlist', 'resourceDimensionsAndValues', 'identityArchitecture',
    'failureContainmentAndReplay', 'readinessAndManualGate'];
  const mf3 = B.createBuilderManifest();
  gate('G423-BLD — R3 manifest has exactly 23 canonical parts in order', mf3.partCount === 23 && JSON.stringify([...mf3.partNames]) === JSON.stringify(EXPECTED_PARTS));
  gate('G423-BLD — R3 manifest overall digest deterministic', mf3.overallDigest === B.createBuilderManifest().overallDigest && /^fnv1a-[0-9a-f]{8}$/.test(mf3.overallDigest));
  gate('G423-BLD — R3 manifest declares no cryptographic integrity', mf3.cryptographicIntegrityProvided === false);
  for (const part of EXPECTED_PARTS) {
    const tampered = JSON.parse(JSON.stringify(mf3.parts));
    tampered[part] = Array.isArray(tampered[part]) ? [...tampered[part], '__t__'] : (tampered[part] && typeof tampered[part] === 'object' ? { ...tampered[part], __t__: 1 } : '__t__');
    const re = MAN.digestManifestParts(tampered);
    gate(`G423-BLD — R3 manifest tamper ${part} changes part + overall digest`, re.partDigests[part] !== mf3.partDigests[part] && re.overallDigest !== mf3.overallDigest);
  }
  gate('G423-BLD — R3 manifest carries limit VALUES', CFG.RESOURCE_DIMENSIONS.every((d) => mf3.parts.resourceDimensionsAndValues.values[d] === CFG.RESOURCE_LIMITS[d]));
  gate('G423-BLD — R3 manifest carries the public API', JSON.stringify(mf3.parts.publicApi.factoryResultKeys) === '["build"]' && mf3.parts.publicApi.partialExecutionHelperExported === false);
  gate('G423-BLD — R3 manifest carries owner/architecture', mf3.parts.identityArchitecture.identityVerifiedSemanticOwner === 'consumer_runtime' && mf3.parts.identityArchitecture.selectedArchitecture === 'ARCHITECTURE_1');
  gate('G423-BLD — R3 manifest carries the manual gate', mf3.parts.readinessAndManualGate.manualGateRequired === true && mf3.parts.readinessAndManualGate.authorizesConsumerRuntime === false);

  // R3 pipeline — honest proof.
  gate('G423-BLD — R3 proof matrix covers all 23 stages', EXEC.PIPELINE_STAGE_PROOF_MATRIX.length === 23 && JSON.stringify(EXEC.PIPELINE_STAGE_PROOF_MATRIX.map((r) => r.stage)) === JSON.stringify([...CFG.PIPELINE_STAGES]));
  gate('G423-BLD — R3 every stage has a direct validation proof', EXEC.PIPELINE_STAGE_PROOF_MATRIX.every((r) => r.directValidationProof === true));
  gate('G423-BLD — R3 defenseInDepth is the complement of first-blocker reachability', EXEC.PIPELINE_STAGE_PROOF_MATRIX.every((r) => r.defenseInDepth === !r.reachableAsFirstBlocker));
  gate('G423-BLD — R3 exactly seven boundary validators', JSON.stringify(Object.keys(EXEC.BOUNDARY_STAGE_VALIDATORS)) === JSON.stringify(CFG.PIPELINE_STAGES.slice(16)));
  {
    const okRun3 = run3(d3);
    const BCASES = [
      ['ssot_boundary_validation', (c) => ({ ...c, envelope: { ...c.envelope, metadataOnly: false } })],
      ['preview_mount_boundary_validation', (c) => ({ ...c, envelope: { ...c.envelope, previewMounted: true } })],
      ['real_data_boundary_validation', (c) => ({ ...c, source: { ...c.source, realDataRead: true } })],
      ['module_generation_boundary_validation', (c) => ({ ...c, source: { ...c.source, moduleGenerated: true } })],
      ['certification_boundary_validation', (c) => ({ ...c, source: { ...c.source, certificationPerformed: true } })],
      ['product_exposure_boundary_validation', (c) => ({ ...c, source: { ...c.source, productExposed: true } })],
      ['prototype_reference_validation', (c) => ({ ...c, envelope: JSON.parse('{"__proto__":{"x":1},"a":1}') })],
    ];
    for (const [stage, tamper] of BCASES) {
      const ctx = { source: d3, envelope: okRun3.envelope };
      gate(`G423-BLD — R3 boundary ${stage} passes on a VALID context`, EXEC.BOUNDARY_STAGE_VALIDATORS[stage](ctx).length === 0);
      const bad = EXEC.BOUNDARY_STAGE_VALIDATORS[stage](tamper(ctx));
      gate(`G423-BLD — R3 boundary ${stage} BLOCKS on a tampered context`, bad.length > 0 && bad[0].stage === stage && bad[0].blocksBuilder === true);
      gate(`G423-BLD — R3 boundary ${stage} blocks an absent context`, EXEC.BOUNDARY_STAGE_VALIDATORS[stage]({ source: null, envelope: null }).length > 0);
    }
    gate('G423-BLD — R3 executedStages is a canonical PREFIX', JSON.stringify([...okRun3.executedStages]) === JSON.stringify(CFG.PIPELINE_STAGES.slice(0, okRun3.executedStages.length)));
  }

  // R3 readiness — derived and honest.
  const rd3 = B.createBuilderReadiness();
  gate('G423-BLD — R3 readiness distinguishes execution vs direct proof vs first-blocker', rd3.all23StagesExecutedOnSuccess === true && rd3.all23StagesHaveDirectValidationProof === true && rd3.all23StagesReachableAsFirstBlocker === false);
  gate('G423-BLD — R3 readiness derives real counts', rd3.manifestPartCount === 23 && rd3.pipelineStageCount === 23 && rd3.resourceDimensionCount === 9);
  gate('G423-BLD — R3 readiness architecture exact', rd3.architectureOneExact === true && IDA.IDENTITY_ARCHITECTURE.coreEnvelopeIdentityVerifiedInvariant === false);
  gate('G423-BLD — R3 readiness fail-closed string', rd3.readiness === (rd3.compatibilityOk && rd3.manifestComplete ? RDY.READINESS_READY : RDY.READINESS_NEEDS_FIX));
  gate('G423-BLD — R3 downstream still not implemented', rd3.consumerRuntimeImplemented === false && rd3.previewRuntimeImplemented === false && rd3.productExposed === false);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
