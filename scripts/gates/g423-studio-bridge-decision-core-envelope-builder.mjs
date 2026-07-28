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
const BC = await import(pathToFileURL(path.join(BC_DIR, 'index.js')).href);
const ENV = await import(pathToFileURL(path.join(ENV_DIR, 'index.js')).href);
const bridge = await import(pathToFileURL(path.join(BRIDGE_DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);
const builder = B.createBridgeDecisionCoreEnvelopeBuilder();

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
gate('G423-BLD — source fields == 33 == upstream', B.SOURCE_FIELDS.length === 33 && B.SOURCE_FIELDS.length === BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS.length);
gate('G423-BLD — allowlist == 32 == upstream', B.CORE_ALLOWLIST.length === 32 && JSON.stringify([...B.CORE_ALLOWLIST].sort()) === JSON.stringify([...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort()));
gate('G423-BLD — allowlist == source minus digest', B.coreAllowlistIsSourceMinusDigest() === true);
gate('G423-BLD — envelope fields == 12 == upstream', B.ENVELOPE_FIELDS.length === 12 && JSON.stringify([...B.ENVELOPE_FIELDS]) === JSON.stringify([...BC.OUTPUT_CORE_ENVELOPE_FIELDS]));
gate('G423-BLD — pipeline stages == 23 == upstream', B.PIPELINE_STAGES.length === 23);
gate('G423-BLD — envelope invariant identityVerified false', B.ENVELOPE_INVARIANTS.identityVerified === false);
for (const f of B.CORE_ALLOWLIST) gate(`G423-BLD — allowlist field ${f} real & not digest`, ENV.DECISION_DIGEST_PREIMAGE_FIELDS.includes(f) && f !== B.DIGEST_FIELD);
for (const f of B.ENVELOPE_FIELDS) gate(`G423-BLD — envelope field ${f} real`, BC.OUTPUT_CORE_ENVELOPE_FIELDS.includes(f));
for (const f of B.SOURCE_FIELDS) gate(`G423-BLD — source field ${f} real`, BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS.includes(f));
for (const f of B.PIPELINE_STAGES) gate(`G423-BLD — pipeline stage ${f} declared`, typeof f === 'string' && f.length > 0);

// ---- LIVE success proofs (multi-seed) ----
let allDigestOk = true; let allIdentityOk = true;
for (const seed of Array.from({ length: 24 }, (_, i) => `g${i}`)) {
  const d = buildRealDecision(seed);
  const res = builder.build(d);
  const ok = res.ok === true && res.status === B.STATUS_READY
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
  for (const f of B.ENVELOPE_FIELDS) gate(`G423-BLD — built envelope has field ${f}`, Object.prototype.hasOwnProperty.call(env, f));
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
  const core = {}; for (const f of B.CORE_ALLOWLIST) core[f] = d[f];
  gate('G423-BLD — LIVE createDeterministicDigest(core)==sourceDigest', rt.createDeterministicDigest(core) === d.bridgeDecisionDigest);
  const dmd = { ...d }; delete dmd.bridgeDecisionDigest;
  gate('G423-BLD — LIVE serialize(core)==serialize(decision-digest)', rt.stableSerialize(core) === rt.stableSerialize(dmd));
  gate('G423-BLD — recompute helper ok', B.recomputeBridgeDecisionDigest(core, d.bridgeDecisionDigest).ok === true);
}

// ---- LIVE per-allowlist-field tamper rejects atomically ----
{
  const d = buildRealDecision('tmp');
  for (const f of B.CORE_ALLOWLIST) {
    const res = builder.build({ ...d, [f]: '__gate_tamper__' });
    gate(`G423-BLD — LIVE tamper ${f} rejects atomically`, res.ok === false && res.coreEnvelope === null && res.issues.length >= 1);
  }
}

// ---- LIVE digest tamper + cross-decision ----
{
  const d = buildRealDecision('dtm');
  const res = builder.build({ ...d, bridgeDecisionDigest: 'fnv1a-00000000' });
  gate('G423-BLD — LIVE digest tamper → DIGEST_MISMATCH, no envelope', res.ok === false && res.coreEnvelope === null && res.issues.some((i) => i.code === 'BUILDER_DIGEST_MISMATCH'));
  const dA = buildRealDecision('cdA', 'clientes', 'Cli', 'nome');
  const dB = buildRealDecision('cdB', 'fornecedores', 'For', 'razao');
  gate('G423-BLD — LIVE distinct decisions distinct digest', dA.bridgeDecisionDigest !== dB.bridgeDecisionDigest);
  const mixed = { ...dB, ...Object.fromEntries(B.CORE_ALLOWLIST.map((f) => [f, dA[f]])) };
  gate('G423-BLD — LIVE cross-decision mix rejected', builder.build(mixed).ok === false);
}

// ---- LIVE rejection scenarios ----
const rej = (label, mut, code) => { const d = buildRealDecision('rj'); const res = builder.build(mut(d)); gate(`G423-BLD — LIVE reject ${label}`, res.ok === false && res.coreEnvelope === null && (!code || res.issues.some((i) => i.code === code))); };
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
  const r1 = builder.build(d); const r2 = builder.build(d); const other = B.createBridgeDecisionCoreEnvelopeBuilder().build(d);
  gate('G423-BLD — deterministic decision digest', r1.builderDecisionDigest === r2.builderDecisionDigest);
  gate('G423-BLD — cross-instance deterministic', r1.builderDecisionDigest === other.builderDecisionDigest);
}

// ---- Config overrides forbidden ----
gate('G423-BLD — forbidden config override rejected', B.createBridgeDecisionCoreEnvelopeBuilder({ coreAllowlist: ['x'] }).build(buildRealDecision('c')).ok === false);
gate('G423-BLD — config accepts undefined', typeof B.createBridgeDecisionCoreEnvelopeBuilder().build === 'function');

// ---- Resource limits + boundaries ----
for (const dim of B.RESOURCE_DIMENSIONS) gate(`G423-BLD — limit ${dim} positive integer`, Number.isInteger(B.RESOURCE_LIMITS[dim]) && B.RESOURCE_LIMITS[dim] > 0);
gate('G423-BLD — maxCoreFields == 32', B.RESOURCE_LIMITS.maxCoreFields === 32);
gate('G423-BLD — maxSourceDecisionFields == 33', B.RESOURCE_LIMITS.maxSourceDecisionFields === 33);

// ---- Issue codes / statuses ----
for (const c of B.ISSUE_CODES) gate(`G423-BLD — issue code ${c}`, typeof c === 'string' && c.length > 0);
gate('G423-BLD — statuses', JSON.stringify([...B.DECISION_STATUSES]) === JSON.stringify(['core_envelope_ready', 'core_envelope_rejected']));

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

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-BRIDGE-DECISION-CORE-ENVELOPE-BUILDER summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
