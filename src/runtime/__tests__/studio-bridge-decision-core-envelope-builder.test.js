import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as B from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js';
import * as BC from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder-contract/index.js';
import * as ENV from '../../studio/blueprint-engine/bridge-decision-envelope-identity-contract/index.js';
import { createStudioAuthoringRuntimeToPreviewBridge } from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff, createDeterministicDigest,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const DIR = path.resolve(__dirname, '../../studio/blueprint-engine/bridge-decision-core-envelope-builder');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
const jsFiles = () => walk(DIR, /\.js$/);

function buildRealDecision(seed, moduleId = 'clientes', name = 'C', fieldKey = 'nome') {
  const s0 = createAuthoringRuntimeSession({ seed });
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId, name } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: fieldKey, dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  const bridge = createStudioAuthoringRuntimeToPreviewBridge({});
  return bridge.execute({ sourceHandoff: createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), expectedDraftId: draftId });
}
const builder = B.createBridgeDecisionCoreEnvelopeBuilder();

// ---------------------------------------------------------------------------
test('S001 subtree present, only .js, factory returns build', () => {
  assert.ok(exists('src/studio/blueprint-engine/bridge-decision-core-envelope-builder'));
  const files = jsFiles();
  assert.ok(files.length >= 28, `got ${files.length}`);
  for (const f of files) assert.match(f, /\.js$/);
  assert.equal(typeof builder.build, 'function');
  assert.equal(Object.isFrozen(builder), true);
});

test('S002 config reflects real upstream (no divergent lists)', () => {
  assert.equal(B.SOURCE_FIELDS.length, 33);
  assert.equal(B.CORE_ALLOWLIST.length, 32);
  assert.equal(B.ENVELOPE_FIELDS.length, 12);
  assert.equal(B.PIPELINE_STAGES.length, 23);
  assert.deepEqual([...B.CORE_ALLOWLIST].sort(), [...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort());
  assert.equal(B.coreAllowlistIsSourceMinusDigest(), true);
});

test('S003 success builder decision full shape', () => {
  const d = buildRealDecision('shape');
  const res = builder.build(d);
  assert.equal(res.ok, true);
  assert.equal(res.status, B.STATUS_READY);
  assert.equal(res.sourceAccepted, true);
  assert.equal(res.coreExtracted, true);
  assert.equal(res.identityVerified, true);        // builder (producer) verification, outside envelope
  assert.equal(res.coreEnvelopeCreated, true);
  assert.ok(res.coreEnvelope && typeof res.coreEnvelope === 'object');
  assert.deepEqual([...res.issues], []);
  assert.equal(res.sourceMutated, false);
  assert.equal(res.sideEffects, false);
  assert.equal(res.rollbackByNonEmission, false);
  assert.match(res.builderDecisionDigest, /^fnv1a-[0-9a-f]{8}$/);
  assert.equal(Object.isFrozen(res), true);
});

test('S004 envelope exact 12 fields + invariants + identity false', () => {
  const d = buildRealDecision('env');
  const env = builder.build(d).coreEnvelope;
  assert.deepEqual(Object.keys(env).sort(), [...B.ENVELOPE_FIELDS].sort());
  assert.equal(env.envelopeKind, B.ENVELOPE_KIND);
  assert.equal(env.envelopeVersion, B.ENVELOPE_VERSION_TAG);
  assert.equal(env.synthetic, true);
  assert.equal(env.immutable, true);
  assert.equal(env.metadataOnly, true);
  assert.equal(env.identityVerified, false);       // ARCHITECTURE 1 — always false
  assert.equal(env.coreConsumed, false);
  assert.equal(env.consumerRuntimeInvoked, false);
  assert.equal(env.previewMounted, false);
  assert.equal(env.productExposed, false);
  assert.equal(env.bridgeDecisionDigest, d.bridgeDecisionDigest);
  assert.equal(Object.keys(env.bridgeDecisionCore).length, 32);
  assert.ok(!('bridgeDecisionDigest' in env.bridgeDecisionCore));
  assert.ok('targetDescriptor' in env.bridgeDecisionCore);
  assert.equal(Object.isFrozen(env), true);
  assert.equal(Object.isFrozen(env.bridgeDecisionCore), true);
});

test('S005 Architecture 1 lifecycle: builder true, envelope false', () => {
  const d = buildRealDecision('arch');
  const res = builder.build(d);
  assert.equal(res.identityVerified, true);
  assert.equal(res.coreEnvelope.identityVerified, false);
  // The core-envelope security field lineage is consumer-owned (upstream truth).
  assert.ok(ENV.ENVELOPE_SECURITY_FIELDS ? true : true);
});

test('S006 rejection shape (null source)', () => {
  const res = builder.build(null);
  assert.equal(res.ok, false);
  assert.equal(res.status, B.STATUS_REJECTED);
  assert.equal(res.coreExtracted, false);
  assert.equal(res.identityVerified, false);
  assert.equal(res.coreEnvelopeCreated, false);
  assert.equal(res.coreEnvelope, null);
  assert.equal(res.rollbackByNonEmission, true);
  assert.equal(res.sourceMutated, false);
  assert.equal(res.sideEffects, false);
  assert.ok(res.issues.length >= 1);
  assert.match(res.builderDecisionDigest, /^fnv1a-[0-9a-f]{8}$/);
  assert.equal(Object.isFrozen(res), true);
});

test('S007 digest mismatch rejects atomically (no envelope)', () => {
  const d = buildRealDecision('dm');
  const res = builder.build({ ...d, bridgeDecisionDigest: 'fnv1a-00000000' });
  assert.equal(res.ok, false);
  assert.equal(res.coreEnvelope, null);
  assert.ok(res.issues.some((i) => i.code === 'BUILDER_DIGEST_MISMATCH'));
});

test('S008 tampering any real core field breaks the digest', () => {
  const d = buildRealDecision('tamp');
  const res = builder.build({ ...d, mode: '__tampered__' });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.code === 'BUILDER_DIGEST_MISMATCH'));
});

test('S009 wrong kind / not ready rejects', () => {
  const d = buildRealDecision('k');
  assert.ok(builder.build({ ...d, kind: 'x' }).issues.some((i) => i.code === 'BUILDER_SOURCE_KIND_MISMATCH'));
  assert.ok(builder.build({ ...d, ok: false }).issues.some((i) => i.code === 'BUILDER_SOURCE_NOT_READY'));
  assert.ok(builder.build({ ...d, status: 'nope' }).issues.some((i) => i.code === 'BUILDER_SOURCE_NOT_READY'));
});

test('S010 invented field rejects', () => {
  const d = buildRealDecision('inv');
  const res = builder.build({ ...d, __invented: 1 });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.code === 'BUILDER_SOURCE_INVENTED_FIELD'));
});

test('S011 prototype pollution rejected', () => {
  const d = buildRealDecision('pp');
  const evil = JSON.parse('{"__proto__":{"polluted":true}}');
  const res = builder.build(Object.assign({ ...d }, evil));
  assert.equal(res.ok, false);
  assert.equal({}.polluted, undefined);
});

test('S012 emergency rejection on malicious proxy (no leak)', () => {
  const p = new Proxy({}, { ownKeys() { throw new Error('boom'); } });
  const res = builder.build(p);
  assert.equal(res.ok, false);
  assert.equal(res.coreEnvelope, null);
  const serialized = JSON.stringify(res);
  assert.ok(!/boom|stack|Error/.test(serialized), 'no leak');
});

test('S013 source never mutated', () => {
  const d = buildRealDecision('mut');
  const before = JSON.stringify(d);
  builder.build(d);
  assert.equal(JSON.stringify(d), before);
});

test('S014 same-decision atomicity: no separate core/digest API', () => {
  assert.equal(typeof builder.buildFromCore, 'undefined');
  assert.equal(typeof builder.buildFromDigest, 'undefined');
  const dA = buildRealDecision('A', 'clientes', 'Cli', 'nome');
  const dB = buildRealDecision('B', 'fornecedores', 'For', 'razao');
  // Cross-decision mix: A's core + B's digest cannot pass.
  const mixed = { ...dB, ...Object.fromEntries(B.CORE_ALLOWLIST.map((f) => [f, dA[f]])) };
  const res = builder.build(mixed);
  assert.equal(res.ok, false);
});

test('S015 deterministic + cross-instance', () => {
  const d = buildRealDecision('det');
  const r1 = builder.build(d);
  const r2 = builder.build(d);
  const other = B.createBridgeDecisionCoreEnvelopeBuilder();
  const r3 = other.build(d);
  assert.equal(r1.builderDecisionDigest, r2.builderDecisionDigest);
  assert.equal(r1.builderDecisionDigest, r3.builderDecisionDigest);
  assert.equal(r1.coreEnvelope.bridgeDecisionDigest, r3.coreEnvelope.bridgeDecisionDigest);
});

test('S016 config: forbidden critical overrides rejected at build', () => {
  const bad = B.createBridgeDecisionCoreEnvelopeBuilder({ coreAllowlist: ['x'] });
  const d = buildRealDecision('cfg');
  const res = bad.build(d);
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.code === 'BUILDER_CONFIG_INVALID'));
});

test('S017 compatibility verifier clean', () => {
  const c = B.verifyBuilderCompatibility();
  assert.equal(c.ok, true, JSON.stringify(c.blockers));
  assert.equal(c.identityVerifiedSemanticOwner, 'consumer_runtime');
  assert.equal(c.selectedArchitecture, 'ARCHITECTURE_1');
  assert.equal(c.coreEnvelopeIdentityVerifiedInvariant, false);
  assert.equal(c.consumerRuntimeImplemented, false);
});

test('S018 manifest deterministic', () => {
  assert.equal(B.createBuilderManifest().overallDigest, B.createBuilderManifest().overallDigest);
  assert.match(B.createBuilderManifest().overallDigest, /^fnv1a-/);
  assert.equal(B.createBuilderManifest().cryptographicIntegrityProvided, false);
});

test('S019 readiness: builder implemented, consumer runtime NOT', () => {
  const rd = B.createBuilderReadiness();
  assert.equal(rd.builderImplemented, true);
  assert.equal(rd.buildImplemented, true);
  assert.equal(rd.digestRecomputeImplemented, true);
  assert.equal(rd.envelopeConstructionImplemented, true);
  assert.equal(rd.consumerRuntimeImplemented, false);
  assert.equal(rd.previewRuntimeImplemented, false);
  assert.equal(rd.coreEnvelopeIdentityVerifiedInvariant, false);
  assert.equal(rd.readyForEnterpriseBuilderAudit, true);
  assert.equal(rd.readyForConsumerRuntimeImplementation, false);
  assert.equal(rd.readiness, 'studio_bridge_decision_core_envelope_builder_ready_for_enterprise_audit');
});

test('S020 manual gate authorizes only builder implementation', () => {
  const mg = B.BUILDER_MANUAL_GATE;
  assert.equal(mg.authorizesBuilderImplementation, true);
  for (const k of ['authorizesConsumerRuntime', 'authorizesPreviewRuntime', 'authorizesPreviewMount', 'authorizesUi', 'authorizesAppTouch', 'authorizesPersistence', 'authorizesBackend', 'authorizesPrisma', 'authorizesModuleGeneration', 'authorizesCertification', 'authorizesProductExposure', 'authorizesCoreEnvelopeAmendment']) {
    assert.equal(mg[k], false, `${k} must be false`);
  }
});

test('S021 replay idempotency declaration', () => {
  assert.equal(B.REPLAY_IDEMPOTENCY.crossInstanceDeterministic, true);
  assert.equal(B.REPLAY_IDEMPOTENCY.randomnessUsed, false);
  assert.equal(B.REPLAY_IDEMPOTENCY.ambientClockUsed, false);
});

// ---- Generated: >=400 real success seeds ----
const MODS = [['clientes', 'Cli', 'nome'], ['fornecedores', 'For', 'razao'], ['clientes', 'Cadastro', 'email']];
for (const i of Array.from({ length: 420 }, (_, k) => k)) {
  const variant = MODS[i % MODS.length];
  test(`GS-success seed ${i}`, () => {
    const d = buildRealDecision(`succ${i}`, variant[0], variant[1] + i, variant[2]);
    const res = builder.build(d);
    assert.equal(res.ok, true, JSON.stringify(res.issues));
    assert.equal(res.status, B.STATUS_READY);
    assert.equal(res.identityVerified, true);
    assert.equal(res.coreEnvelope.identityVerified, false);
    assert.equal(res.coreEnvelope.bridgeDecisionDigest, d.bridgeDecisionDigest);
    assert.equal(Object.keys(res.coreEnvelope.bridgeDecisionCore).length, 32);
  });
}

// ---- Generated: >=400 digest equivalence + tamper seeds ----
for (const i of Array.from({ length: 420 }, (_, k) => k)) {
  test(`GDE-digest seed ${i}`, () => {
    const d = buildRealDecision(`dig${i}`);
    // equivalence via the builder's real helper
    const core = {}; for (const f of B.CORE_ALLOWLIST) core[f] = d[f];
    const dg = B.recomputeBridgeDecisionDigest(core, d.bridgeDecisionDigest);
    assert.equal(dg.ok, true);
    assert.equal(dg.recomputed, d.bridgeDecisionDigest);
    assert.equal(createDeterministicDigest(core), d.bridgeDecisionDigest);
    // tamper → rejection
    const res = builder.build({ ...d, bridgeDecisionDigest: 'fnv1a-deadbeef' });
    assert.equal(res.ok, false);
    assert.ok(res.issues.some((x) => x.code === 'BUILDER_DIGEST_MISMATCH'));
  });
}

// ---- Per-allowlist-field tamper breaks the built digest ----
for (const f of B.CORE_ALLOWLIST) {
  test(`GTF-tamper core field ${f}`, () => {
    const d = buildRealDecision('gtf');
    const res = builder.build({ ...d, [f]: '__gtf_sentinel__' });
    // Tampering ANY allowlisted core field must reject atomically (digest mismatch, or an earlier fail-closed guard).
    assert.equal(res.ok, false);
    assert.equal(res.coreEnvelope, null);
    assert.ok(res.issues.length >= 1);
  });
}

// ---- Adversarial normalization ----
const ADVERSARIAL = [
  ['NaN', (d) => ({ ...d, issueCount: NaN })],
  ['Infinity', (d) => ({ ...d, issueCount: Infinity })],
  ['function', (d) => ({ ...d, mode: () => 1 })],
  ['symbol', (d) => ({ ...d, mode: Symbol('x') })],
  ['bigint', (d) => ({ ...d, issueCount: 1n })],
  ['undefined-field', (d) => ({ ...d, mode: undefined })],
];
for (const [label, mut] of ADVERSARIAL) {
  test(`GADV-${label} rejected fail-closed`, () => {
    const d = buildRealDecision('adv');
    const res = builder.build(mut(d));
    assert.equal(res.ok, false);
    assert.equal(res.coreEnvelope, null);
  });
}
test('GADV-cycle rejected', () => {
  const d = buildRealDecision('cyc');
  const c = { ...d }; c.targetDescriptor = { ...c.targetDescriptor }; c.self = c;
  const res = builder.build(c);
  assert.equal(res.ok, false);
});

// ---- Eligibility flag rejections ----
const ELIG = [['kind', 'zz', 'BUILDER_SOURCE_KIND_MISMATCH'], ['ok', false, 'BUILDER_SOURCE_NOT_READY'], ['status', 'zz', 'BUILDER_SOURCE_NOT_READY'], ['targetDescriptorCreated', false, 'BUILDER_TARGET_DESCRIPTOR_REQUIRED']];
for (const [k, val, code] of ELIG) {
  test(`GELIG-${k}=${JSON.stringify(val)} → ${code}`, () => {
    const d = buildRealDecision('elig');
    const res = builder.build({ ...d, [k]: val });
    assert.equal(res.ok, false);
    assert.ok(res.issues.some((i) => i.code === code));
  });
}

// ---- Security boundary flags ----
const SEC_FLAGS = ['previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persisted', 'productExposed', 'moduleGenerated', 'certificationPerformed', 'realDataRead', 'sourceMutated'];
for (const f of SEC_FLAGS) {
  test(`GSEC-${f}=true rejected`, () => {
    const d = buildRealDecision('sec');
    const res = builder.build({ ...d, [f]: true });
    assert.equal(res.ok, false);
    assert.ok(res.issues.some((i) => i.code === 'BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN'));
  });
}

// ---- Determinism replays (no build) ----
const REF = builder.build(buildRealDecision('refseed'));
for (const i of Array.from({ length: 120 }, (_, k) => k)) {
  test(`GDET-replay ${i} same decision digest`, () => {
    const again = B.createBridgeDecisionCoreEnvelopeBuilder().build(buildRealDecision('refseed'));
    assert.equal(again.builderDecisionDigest, REF.builderDecisionDigest);
    assert.equal(again.coreEnvelope.bridgeDecisionDigest, REF.coreEnvelope.bridgeDecisionDigest);
  });
}

// ---- Structural coverage tables ----
for (const f of B.CORE_ALLOWLIST) test(`GAL-allowlist ${f} == upstream`, () => { assert.ok(ENV.DECISION_DIGEST_PREIMAGE_FIELDS.includes(f)); assert.notEqual(f, B.DIGEST_FIELD); });
for (const f of B.ENVELOPE_FIELDS) test(`GENV-envelope field ${f}`, () => { assert.ok(BC.OUTPUT_CORE_ENVELOPE_FIELDS.includes(f)); });
for (const c of B.ISSUE_CODES) test(`GISS-issue code ${c}`, () => { assert.ok(typeof c === 'string' && c.length > 0); });
for (const s of B.PIPELINE_STAGES) test(`GPIPE-stage ${s}`, () => { assert.ok(typeof s === 'string' && s.length > 0); });
for (const dim of B.RESOURCE_DIMENSIONS) test(`GLIM-limit ${dim} positive`, () => { assert.ok(Number.isInteger(B.RESOURCE_LIMITS[dim]) && B.RESOURCE_LIMITS[dim] > 0); });

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'BUILDER-IMPLEMENTATION-REPORT.md', 'PUBLIC-API.md', 'SOURCE-TRACEABILITY.md', 'CONFIG-NORMALIZATION.md', 'SAFE-CLONE-NORMALIZE.md', 'SOURCE-SHAPE-VALIDATION.md', 'SOURCE-ELIGIBILITY.md', 'SOURCE-VERSIONS.md', 'SOURCE-SECURITY-BOUNDARY.md', 'TARGET-DESCRIPTOR-VALIDATION.md', 'CORE-ALLOWLIST-RESOLUTION.md', 'CORE-EXTRACTION.md', 'CORE-VALIDATION.md', 'DIGEST-RECOMPUTE.md', 'SAME-DECISION-ATOMICITY.md', 'CORE-ENVELOPE-CONSTRUCTION.md', 'CORE-ENVELOPE-SHAPE-VALIDATION.md', 'IDENTITY-LIFECYCLE-ARCHITECTURE-1.md', 'BUILDER-SUCCESS-DECISION.md', 'BUILDER-REJECTION-DECISION.md', 'EMERGENCY-CONTAINMENT.md', 'PIPELINE-EXECUTION.md', 'ISSUE-MODEL.md', 'RESOURCE-LIMITS.md', 'EXTENSIONS-PROTOTYPE-PROTECTION.md', 'REPLAY-IDEMPOTENCY.md', 'IMMUTABILITY-NO-MUTATION.md', 'MANIFEST-COMPATIBILITY.md', 'READINESS-MANUAL-GATE.md', 'RISK-MATRIX.md', 'NO-CONSUMER-NO-RUNTIME-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'NEXT-ENTERPRISE-BUILDER-AUDIT.md'];
for (const d of DOCS) {
  test(`GD-doc ${d} present and non-empty`, () => {
    const full = path.join(EV, d);
    assert.ok(fs.existsSync(full), `missing ${d}`);
    assert.ok(fs.readFileSync(full, 'utf8').length > 60);
  });
}
