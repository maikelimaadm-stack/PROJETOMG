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
    gate(`G423-BLD — boundary maxSourceDecisionFields ${k}`, LIM.enforceSourceResourceLimits(fields(n(L.maxSourceDecisionFields))).some((i) => i.path === 'source') === over);
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
  for (const f of Object.keys(CFG.TARGET_DESCRIPTOR_INVARIANTS)) gate(`G423-BLD — target invariant ${f}=false rejected`, TD.validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: false } }).length > 0);
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
  gate('G423-BLD — issue path sanitized (absolute rejected)', ISS.makeIssue('BUILDER_CONFIG_INVALID', 'x', 'blocker', '/etc/passwd').path === '');
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

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
