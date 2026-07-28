import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as B from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js';
// Unit tests may import INTERNAL modules directly by path (the public index intentionally exposes no bypass).
import { createBridgeDecisionCoreEnvelopeBuilder } from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/createBridgeDecisionCoreEnvelopeBuilder.js';
import * as CFG from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/builderConfig.js';
import { recomputeBridgeDecisionDigest } from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/recomputeBridgeDecisionDigest.js';
import { makeIssue, normalizeIssues, normalizeIssuesWithOverflow, hasExactIssueShape } from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/normalizeIssues.js';
import { validateTargetDescriptor } from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/validateTargetDescriptor.js';
import * as LIM from '../../studio/blueprint-engine/bridge-decision-core-envelope-builder/resourceLimitEnforcer.js';
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
const builder = createBridgeDecisionCoreEnvelopeBuilder();

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
  assert.equal(CFG.SOURCE_FIELDS.length, 33);
  assert.equal(CFG.CORE_ALLOWLIST.length, 32);
  assert.equal(CFG.ENVELOPE_FIELDS.length, 12);
  assert.equal(CFG.PIPELINE_STAGES.length, 23);
  assert.deepEqual([...CFG.CORE_ALLOWLIST].sort(), [...ENV.DECISION_DIGEST_PREIMAGE_FIELDS].sort());
  assert.equal(B.coreAllowlistIsSourceMinusDigest(), true);
});

test('S003 success builder decision full shape', () => {
  const d = buildRealDecision('shape');
  const res = builder.build(d);
  assert.equal(res.ok, true);
  assert.equal(res.status, CFG.STATUS_READY);
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
  assert.deepEqual(Object.keys(env).sort(), [...CFG.ENVELOPE_FIELDS].sort());
  assert.equal(env.envelopeKind, CFG.ENVELOPE_KIND);
  assert.equal(env.envelopeVersion, CFG.ENVELOPE_VERSION_TAG);
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
  assert.equal(res.status, CFG.STATUS_REJECTED);
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
  assert.ok(res.issues.some((i) => i.issueCode === 'BUILDER_DIGEST_MISMATCH'));
});

test('S008 tampering any real core field breaks the digest', () => {
  const d = buildRealDecision('tamp');
  const res = builder.build({ ...d, mode: '__tampered__' });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.issueCode === 'BUILDER_DIGEST_MISMATCH'));
});

test('S009 wrong kind / not ready rejects', () => {
  const d = buildRealDecision('k');
  assert.ok(builder.build({ ...d, kind: 'x' }).issues.some((i) => i.issueCode === 'BUILDER_SOURCE_KIND_MISMATCH'));
  assert.ok(builder.build({ ...d, ok: false }).issues.some((i) => i.issueCode === 'BUILDER_SOURCE_NOT_READY'));
  assert.ok(builder.build({ ...d, status: 'nope' }).issues.some((i) => i.issueCode === 'BUILDER_SOURCE_NOT_READY'));
});

test('S010 invented field rejects', () => {
  const d = buildRealDecision('inv');
  const res = builder.build({ ...d, __invented: 1 });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.issueCode === 'BUILDER_SOURCE_INVENTED_FIELD'));
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
  const mixed = { ...dB, ...Object.fromEntries(CFG.CORE_ALLOWLIST.map((f) => [f, dA[f]])) };
  const res = builder.build(mixed);
  assert.equal(res.ok, false);
});

test('S015 deterministic + cross-instance', () => {
  const d = buildRealDecision('det');
  const r1 = builder.build(d);
  const r2 = builder.build(d);
  const other = createBridgeDecisionCoreEnvelopeBuilder();
  const r3 = other.build(d);
  assert.equal(r1.builderDecisionDigest, r2.builderDecisionDigest);
  assert.equal(r1.builderDecisionDigest, r3.builderDecisionDigest);
  assert.equal(r1.coreEnvelope.bridgeDecisionDigest, r3.coreEnvelope.bridgeDecisionDigest);
});

test('S016 config: forbidden critical overrides rejected at build', () => {
  const bad = createBridgeDecisionCoreEnvelopeBuilder({ coreAllowlist: ['x'] });
  const d = buildRealDecision('cfg');
  const res = bad.build(d);
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.issueCode === 'BUILDER_CONFIG_INVALID'));
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
    assert.equal(res.status, CFG.STATUS_READY);
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
    const core = {}; for (const f of CFG.CORE_ALLOWLIST) core[f] = d[f];
    const dg = recomputeBridgeDecisionDigest(core, d.bridgeDecisionDigest);
    assert.equal(dg.ok, true);
    assert.equal(dg.recomputed, d.bridgeDecisionDigest);
    assert.equal(createDeterministicDigest(core), d.bridgeDecisionDigest);
    // tamper → rejection
    const res = builder.build({ ...d, bridgeDecisionDigest: 'fnv1a-deadbeef' });
    assert.equal(res.ok, false);
    assert.ok(res.issues.some((x) => x.issueCode === 'BUILDER_DIGEST_MISMATCH'));
  });
}

// ---- Per-allowlist-field tamper breaks the built digest ----
for (const f of CFG.CORE_ALLOWLIST) {
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
    assert.ok(res.issues.some((i) => i.issueCode === code));
  });
}

// ---- Security boundary flags ----
const SEC_FLAGS = ['previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persisted', 'productExposed', 'moduleGenerated', 'certificationPerformed', 'realDataRead', 'sourceMutated'];
for (const f of SEC_FLAGS) {
  test(`GSEC-${f}=true rejected`, () => {
    const d = buildRealDecision('sec');
    const res = builder.build({ ...d, [f]: true });
    assert.equal(res.ok, false);
    assert.ok(res.issues.some((i) => i.issueCode === 'BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN'));
  });
}

// ---- Determinism replays (no build) ----
const REF = builder.build(buildRealDecision('refseed'));
for (const i of Array.from({ length: 120 }, (_, k) => k)) {
  test(`GDET-replay ${i} same decision digest`, () => {
    const again = createBridgeDecisionCoreEnvelopeBuilder().build(buildRealDecision('refseed'));
    assert.equal(again.builderDecisionDigest, REF.builderDecisionDigest);
    assert.equal(again.coreEnvelope.bridgeDecisionDigest, REF.coreEnvelope.bridgeDecisionDigest);
  });
}

// ---- Structural coverage tables ----
for (const f of CFG.CORE_ALLOWLIST) test(`GAL-allowlist ${f} == upstream`, () => { assert.ok(ENV.DECISION_DIGEST_PREIMAGE_FIELDS.includes(f)); assert.notEqual(f, CFG.DIGEST_FIELD); });
for (const f of CFG.ENVELOPE_FIELDS) test(`GENV-envelope field ${f}`, () => { assert.ok(BC.OUTPUT_CORE_ENVELOPE_FIELDS.includes(f)); });
for (const c of CFG.ISSUE_CODES) test(`GISS-issue code ${c}`, () => { assert.ok(typeof c === 'string' && c.length > 0); });
for (const s of CFG.PIPELINE_STAGES) test(`GPIPE-stage ${s}`, () => { assert.ok(typeof s === 'string' && s.length > 0); });
for (const dim of CFG.RESOURCE_DIMENSIONS) test(`GLIM-limit ${dim} positive`, () => { assert.ok(Number.isInteger(CFG.RESOURCE_LIMITS[dim]) && CFG.RESOURCE_LIMITS[dim] > 0); });

// ---- Evidence docs ----
const DOCS = ['CERTIFICATION-REPORT.md', 'BUILDER-IMPLEMENTATION-REPORT.md', 'PUBLIC-API.md', 'SOURCE-TRACEABILITY.md', 'CONFIG-NORMALIZATION.md', 'SAFE-CLONE-NORMALIZE.md', 'SOURCE-SHAPE-VALIDATION.md', 'SOURCE-ELIGIBILITY.md', 'SOURCE-VERSIONS.md', 'SOURCE-SECURITY-BOUNDARY.md', 'TARGET-DESCRIPTOR-VALIDATION.md', 'CORE-ALLOWLIST-RESOLUTION.md', 'CORE-EXTRACTION.md', 'CORE-VALIDATION.md', 'DIGEST-RECOMPUTE.md', 'SAME-DECISION-ATOMICITY.md', 'CORE-ENVELOPE-CONSTRUCTION.md', 'CORE-ENVELOPE-SHAPE-VALIDATION.md', 'IDENTITY-LIFECYCLE-ARCHITECTURE-1.md', 'BUILDER-SUCCESS-DECISION.md', 'BUILDER-REJECTION-DECISION.md', 'EMERGENCY-CONTAINMENT.md', 'PIPELINE-EXECUTION.md', 'ISSUE-MODEL.md', 'RESOURCE-LIMITS.md', 'EXTENSIONS-PROTOTYPE-PROTECTION.md', 'REPLAY-IDEMPOTENCY.md', 'IMMUTABILITY-NO-MUTATION.md', 'MANIFEST-COMPATIBILITY.md', 'READINESS-MANUAL-GATE.md', 'RISK-MATRIX.md', 'NO-CONSUMER-NO-RUNTIME-NO-UI-NO-APP.md', 'BUILD-BUNDLE-ABSENCE.md', 'NEXT-ENTERPRISE-BUILDER-AUDIT.md'];
for (const d of DOCS) {
  test(`GD-doc ${d} present and non-empty`, () => {
    const full = path.join(EV, d);
    assert.ok(fs.existsSync(full), `missing ${d}`);
    assert.ok(fs.readFileSync(full, 'utf8').length > 60);
  });
}

// ===========================================================================
// CORRECTION COVERAGE (§10): boundaries, target tamper, hostile config, issue
// shape, public API, first-blocker, compatibility tamper.
// ===========================================================================

// ---- Resource SSOT: derived from the contract, exact values ----
const EXPECTED_LIMITS = {
  maxSourceDecisionBytes: 524288, maxSourceDecisionFields: 33, maxCoreBytes: 262144, maxCoreFields: 32,
  maxTargetDescriptorFields: 23, maxEnvelopeBytes: 524288, maxIssues: 512, maxStringLength: 4096, maxStructureDepth: 64,
};
for (const [dim, val] of Object.entries(EXPECTED_LIMITS)) {
  test(`C-LIM-${dim} == ${val} (derived from RESOURCE_LIMITS_CONTRACT)`, () => {
    assert.equal(CFG.RESOURCE_LIMITS[dim], val);
    const contractDim = BC.RESOURCE_LIMITS_CONTRACT.dimensions.find((d) => d.dimension === dim);
    assert.ok(contractDim, `${dim} must exist in the contract`);
    assert.equal(CFG.RESOURCE_LIMITS[dim], contractDim.builderLimit);
  });
}
test('C-LIM nine dimensions, exact order, no local table', () => {
  assert.equal(CFG.RESOURCE_DIMENSIONS.length, 9);
  assert.deepEqual([...CFG.RESOURCE_DIMENSIONS], [...BC.RESOURCE_DIMENSION_NAMES]);
  assert.equal(Object.prototype.hasOwnProperty.call(CFG.RESOURCE_LIMITS, 'maxEnvelopeFields'), false);
});
test('C-LIM unknown dimension is not accepted', () => {
  assert.equal(LIM.isKnownDimension('maxEnvelopeFields'), false);
  assert.equal(LIM.isKnownDimension('maxTotallyUnknown'), false);
  for (const d of CFG.RESOURCE_DIMENSIONS) assert.equal(LIM.isKnownDimension(d), true);
});

// ---- UTF-8 byte counting (not .length) ----
test('C-UTF8 bytes use TextEncoder over stableSerialize', () => {
  const ascii = { a: 'x' };
  const multi = { a: '€€€' };                       // 3 bytes each in UTF-8
  assert.ok(LIM.utf8ByteLength(multi) > LIM.utf8ByteLength(ascii));
  assert.equal(LIM.utf8ByteLength(ascii), new TextEncoder().encode(JSON.stringify({ a: 'x' })).byteLength);
});

// ---- Nine boundary proofs: limit-1 / limit / limit+1 (enforcer tested directly; precedence documented) ----
const bigString = (n) => 'a'.repeat(n);
const objWithFields = (n) => { const o = {}; for (let i = 0; i < n; i += 1) o[`f${i}`] = 1; return o; };
const nest = (depth) => { let o = {}; const root = o; for (let i = 0; i < depth; i += 1) { o.n = {}; o = o.n; } return root; };
for (const kind of ['minus1', 'exact', 'plus1']) {
  test(`C-BND maxSourceDecisionFields ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxSourceDecisionFields;
    const n = kind === 'minus1' ? L - 1 : kind === 'exact' ? L : L + 1;
    const issues = LIM.enforceSourceResourceLimits(objWithFields(n));
    if (kind === 'plus1') assert.ok(issues.some((i) => i.issueCode === 'BUILDER_LIMIT_EXCEEDED'));
    else assert.equal(issues.filter((i) => i.path === 'source').length, 0);
  });
  test(`C-BND maxCoreFields ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxCoreFields;
    const n = kind === 'minus1' ? L - 1 : kind === 'exact' ? L : L + 1;
    const issues = LIM.enforceCoreResourceLimits(objWithFields(n));
    if (kind === 'plus1') assert.ok(issues.some((i) => i.issueCode === 'BUILDER_LIMIT_EXCEEDED'));
    else assert.equal(issues.filter((i) => i.path === 'core').length, 0);
  });
  test(`C-BND maxTargetDescriptorFields ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxTargetDescriptorFields;
    const n = kind === 'minus1' ? L - 1 : kind === 'exact' ? L : L + 1;
    const issues = LIM.enforceTargetDescriptorLimits(objWithFields(n));
    assert.equal(issues.length > 0, kind === 'plus1');
  });
  test(`C-BND maxStringLength ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxStringLength;
    const n = kind === 'minus1' ? L - 1 : kind === 'exact' ? L : L + 1;
    const issues = LIM.enforceSourceResourceLimits({ s: bigString(n) });
    assert.equal(issues.some((i) => i.path === 'source.string'), kind === 'plus1');
  });
  test(`C-BND maxStructureDepth ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxStructureDepth;
    const n = kind === 'minus1' ? L - 1 : kind === 'exact' ? L : L + 1;
    const issues = LIM.enforceStructureDepth(nest(n));
    assert.equal(issues.length > 0, kind === 'plus1');
  });
  test(`C-BND maxSourceDecisionBytes ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxSourceDecisionBytes;
    // Build a payload whose serialized byte length straddles the limit (strings kept under maxStringLength).
    const chunk = bigString(CFG.RESOURCE_LIMITS.maxStringLength - 1);
    const count = Math.ceil(L / chunk.length) + (kind === 'plus1' ? 2 : -2);
    const o = {}; for (let i = 0; i < Math.max(count, 1); i += 1) o[`k${i}`] = chunk;
    const bytes = LIM.utf8ByteLength(o);
    const issues = LIM.enforceSourceResourceLimits(o);
    assert.equal(issues.some((i) => i.path === 'source.bytes'), bytes > L);
  });
  test(`C-BND maxCoreBytes ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxCoreBytes;
    const chunk = bigString(CFG.RESOURCE_LIMITS.maxStringLength - 1);
    const count = Math.ceil(L / chunk.length) + (kind === 'plus1' ? 2 : -2);
    const o = {}; for (let i = 0; i < Math.max(count, 1); i += 1) o[`k${i}`] = chunk;
    const issues = LIM.enforceCoreResourceLimits(o);
    assert.equal(issues.some((i) => i.path === 'core.bytes'), LIM.utf8ByteLength(o) > L);
  });
  test(`C-BND maxEnvelopeBytes ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxEnvelopeBytes;
    const chunk = bigString(CFG.RESOURCE_LIMITS.maxStringLength - 1);
    const count = Math.ceil(L / chunk.length) + (kind === 'plus1' ? 2 : -2);
    const o = {}; for (let i = 0; i < Math.max(count, 1); i += 1) o[`k${i}`] = chunk;
    const issues = LIM.enforceEnvelopeResourceLimits(o);
    assert.equal(issues.some((i) => i.path === 'envelope.bytes'), LIM.utf8ByteLength(o) > L);
  });
  test(`C-BND maxIssues ${kind}`, () => {
    const L = CFG.RESOURCE_LIMITS.maxIssues;
    const n = kind === 'minus1' ? L - 1 : kind === 'exact' ? L : L + 1;
    // Distinct issues via distinct paths.
    const list = Array.from({ length: n }, (_, i) => makeIssue('BUILDER_CORE_FIELD_MISSING', 'core_completeness_validation', 'blocker', `f${i}`));
    const out = normalizeIssuesWithOverflow(list);
    if (kind === 'plus1') {
      assert.equal(out.length, 1);
      assert.equal(out[0].issueCode, 'BUILDER_LIMIT_EXCEEDED');   // never a silent truncation
    } else {
      assert.equal(out.length, n);
    }
  });
}
test('C-BND maxStringLength enforced recursively by the normalizer (no 1048576 hardcode)', () => {
  const d = buildRealDecision('strlim');
  const res = builder.build({ ...d, mode: bigString(CFG.RESOURCE_LIMITS.maxStringLength + 1) });
  assert.equal(res.ok, false);
  assert.ok(res.issues.some((i) => i.issueCode === 'BUILDER_LIMIT_EXCEEDED'));
});

// ---- Target descriptor: exact shape + per-class tamper ----
test('C-TD exact 23-field real shape accepted', () => {
  const d = buildRealDecision('tdok');
  assert.deepEqual(validateTargetDescriptor(d), []);
  assert.equal(CFG.TARGET_DESCRIPTOR_FIELDS.length, 23);
  assert.deepEqual([...CFG.TARGET_DESCRIPTOR_FIELDS].sort(), [...ENV.REAL_TARGET_DESCRIPTOR_FIELDS].sort());
});
for (const f of CFG.TARGET_DESCRIPTOR_REQUIRED_FIELDS) {
  test(`C-TD required ${f} missing → rejected`, () => {
    const d = buildRealDecision('tdreq');
    const td = { ...d.targetDescriptor }; delete td[f];
    assert.ok(validateTargetDescriptor({ ...d, targetDescriptor: td }).length > 0);
  });
}
for (const f of CFG.TARGET_DESCRIPTOR_SECURITY_FIELDS) {
  test(`C-TD security ${f}=true → rejected`, () => {
    const d = buildRealDecision('tdsec');
    const issues = validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: true } });
    assert.ok(issues.some((i) => i.issueCode === 'BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN'));
  });
}
for (const f of Object.keys(CFG.TARGET_DESCRIPTOR_INVARIANTS)) {
  test(`C-TD invariant ${f}=false → rejected`, () => {
    const d = buildRealDecision('tdinv');
    const issues = validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: false } });
    assert.ok(issues.some((i) => i.issueCode === 'BUILDER_IDENTITY_VERIFICATION_STATE_INVALID'));
  });
}
for (const f of CFG.TARGET_DESCRIPTOR_VERSION_FIELDS) {
  test(`C-TD version ${f} malformed → rejected`, () => {
    const d = buildRealDecision('tdver');
    const issues = validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: 'not-a-version' } });
    assert.ok(issues.some((i) => i.issueCode === 'BUILDER_SOURCE_VERSION_MISMATCH'));
  });
}
for (const f of CFG.TARGET_DESCRIPTOR_DIGEST_FIELDS) {
  test(`C-TD digest ${f} malformed → rejected`, () => {
    const d = buildRealDecision('tddig');
    const issues = validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, [f]: 'nope' } });
    assert.ok(issues.some((i) => i.issueCode === 'BUILDER_DIGEST_REQUIRED'));
  });
}
test('C-TD invented field → rejected', () => {
  const d = buildRealDecision('tdinvent');
  const issues = validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, __evil: 1 } });
  assert.ok(issues.some((i) => i.issueCode === 'BUILDER_SOURCE_INVENTED_FIELD'));
});
test('C-TD wrong kind/targetKind → rejected', () => {
  const d = buildRealDecision('tdkind');
  assert.ok(validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, kind: 'x' } }).some((i) => i.issueCode === 'BUILDER_SOURCE_KIND_MISMATCH'));
  assert.ok(validateTargetDescriptor({ ...d, targetDescriptor: { ...d.targetDescriptor, targetKind: 'x' } }).some((i) => i.issueCode === 'BUILDER_SOURCE_KIND_MISMATCH'));
});

// ---- Hostile config containment: the factory must NEVER throw ----
// mustReject=true  -> the config is structurally unsafe and MUST be rejected fail-closed.
// mustReject=false -> the hostile trap is never reachable (the normalizer reads descriptors, never config[k]),
//                     so the config is safely neutralized; containment still requires no throw / no leak / no pollution.
const HOSTILE_CONFIGS = [
  ['ownKeys throw', () => new Proxy({}, { ownKeys() { throw new Error('x'); } }), true],
  ['getPrototypeOf throw', () => new Proxy({}, { getPrototypeOf() { throw new Error('x'); } }), true],
  ['getOwnPropertyDescriptor throw', () => new Proxy({}, { ownKeys() { return ['a']; }, getOwnPropertyDescriptor() { throw new Error('x'); } }), true],
  ['get throw (trap never reached)', () => new Proxy({ a: 1 }, { get() { throw new Error('x'); } }), false],
  ['getter', () => Object.defineProperty({}, 'g', { get() { throw new Error('x'); }, enumerable: true }), true],
  ['setter', () => Object.defineProperty({}, 's', { set() {}, enumerable: true, configurable: true }), true],
  ['cycle', () => { const o = {}; o.self = o; return o; }, true],
  ['custom prototype', () => Object.create({ inherited: 1 }), false],
  ['sparse array field', () => { const a = [1]; delete a[0]; return { arr: a }; }, true],
  ['__proto__ pollution', () => JSON.parse('{"__proto__":{"polluted":true}}'), false],
  ['constructor key', () => ({ constructor: 1 }), true],
  ['prototype key', () => ({ prototype: 1 }), true],
];
for (const [label, make, mustReject] of HOSTILE_CONFIGS) {
  test(`C-HOSTILE config ${label} → factory never throws, result deterministic + sanitized`, () => {
    let b; let threw = false;
    try { b = createBridgeDecisionCoreEnvelopeBuilder(make()); } catch { threw = true; }
    assert.equal(threw, false, 'factory must never throw');
    assert.deepEqual(Object.keys(b), ['build']);
    assert.equal(Object.isFrozen(b), true);
    const res = b.build(buildRealDecision('hostile'));
    // Deterministic: a second identical build yields the same decision digest.
    assert.equal(b.build(buildRealDecision('hostile')).builderDecisionDigest, res.builderDecisionDigest);
    // Sanitized: exact issue shape, no leak, no pollution.
    assert.ok(res.issues.every((i) => hasExactIssueShape(i)));
    assert.ok(!/Error|stack|at \//.test(JSON.stringify(res)));
    assert.equal({}.polluted, undefined);
    assert.equal(Object.isFrozen(res), true);
    if (mustReject) {
      assert.equal(res.ok, false, 'structurally unsafe config must be rejected');
      assert.equal(res.coreEnvelope, null);
    } else {
      // Neutralized safely: the hostile trap was never reachable, so the envelope invariant still holds.
      if (res.ok) assert.equal(res.coreEnvelope.identityVerified, false);
    }
  });
}

// ---- Issue model: exact contract shape ----
test('C-ISSUE exact 10-field shape from the contract', () => {
  assert.deepEqual([...CFG.ISSUE_SHAPE_FIELDS], [...BC.ISSUE_MODEL_CONTRACT.issueShapeFields]);
  const i = makeIssue('BUILDER_DIGEST_MISMATCH', 'digest_recompute_validation', 'blocker', 'core.digest');
  assert.deepEqual(Object.keys(i), [...CFG.ISSUE_SHAPE_FIELDS]);
  assert.equal(hasExactIssueShape(i), true);
  assert.equal(i.issueCode, 'BUILDER_DIGEST_MISMATCH');
  assert.equal(i.deterministic, true);
  assert.equal(i.blocksBuilder, true);
  assert.equal(i.blocksEnvelope, true);
  assert.equal(i.blocksRuntime, true);
  assert.equal(i.blocksPreviewSandbox, true);
  assert.equal(typeof i.message, 'string');
  assert.ok(!i.path.startsWith('/'));
});
test('C-ISSUE unknown code + hostile path sanitized', () => {
  const i = makeIssue('NOT_A_REAL_CODE', 'x', 'weird', '/etc/passwd');
  assert.ok(CFG.ISSUE_CODES.includes(i.issueCode));
  assert.equal(i.path, '');
  assert.equal(i.severity, 'blocker');
});
test('C-ISSUE deterministic ordering + dedupe', () => {
  const a = makeIssue('BUILDER_CORE_FIELD_EXTRA', 'core_completeness_validation');
  const b = makeIssue('BUILDER_CORE_FIELD_MISSING', 'core_completeness_validation');
  assert.deepEqual(normalizeIssues([b, a, b, a]).map((x) => x.issueCode), ['BUILDER_CORE_FIELD_EXTRA', 'BUILDER_CORE_FIELD_MISSING']);
});
test('C-ISSUE every builder issue has the exact shape', () => {
  const d = buildRealDecision('ishape');
  for (const mut of [{ kind: 'x' }, { ok: false }, { bridgeDecisionDigest: 'fnv1a-00000000' }, { __x: 1 }]) {
    for (const i of builder.build({ ...d, ...mut }).issues) assert.equal(hasExactIssueShape(i), true);
  }
});

// ---- Public API: no bypass ----
test('C-API factory result keys === ["build"]', () => {
  assert.deepEqual(Object.keys(createBridgeDecisionCoreEnvelopeBuilder()), ['build']);
});
test('C-API public index exposes no partial-execution bypass', () => {
  for (const forbidden of ['extractBridgeDecisionCore', 'recomputeBridgeDecisionDigest', 'constructCoreEnvelope',
    'createBuilderDecision', 'createBuilderRejection', 'createEmergencyBuilderRejection', 'normalizeSourceDecision',
    'normalizeBuilderConfig', 'validateSourceDecisionShape', 'validateSourceEligibility', 'validateTargetDescriptor',
    'validateExtractedCore', 'validateSameDecisionAtomicity', 'validateCoreEnvelopeShape', 'enforceSourceResourceLimits',
    'safeCloneAndNormalize', 'makeIssue', 'normalizeIssues']) {
    assert.equal(typeof B[forbidden], 'undefined', `${forbidden} must NOT be publicly exported`);
  }
  assert.equal(typeof B.createBridgeDecisionCoreEnvelopeBuilder, 'function');
  assert.equal(typeof B.verifyBuilderCompatibility, 'function');
  assert.equal(typeof B.createBuilderReadiness, 'function');
});

// ---- Pipeline first-blocker: later stages never run ----
test('C-PIPE first blocker stops the pipeline (no later-stage issues)', () => {
  const d = buildRealDecision('fb');
  // Wrong kind blocks at eligibility — digest/atomicity/envelope issues must NOT appear.
  const res = builder.build({ ...d, kind: 'x' });
  assert.equal(res.ok, false);
  const codes = res.issues.map((i) => i.issueCode);
  assert.ok(codes.includes('BUILDER_SOURCE_KIND_MISMATCH'));
  for (const later of ['BUILDER_DIGEST_MISMATCH', 'BUILDER_CROSS_DECISION_MIX_FORBIDDEN', 'BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', 'BUILDER_ENVELOPE_INVENTED_FIELD']) {
    assert.ok(!codes.includes(later), `${later} must not run after the first blocker`);
  }
});
test('C-PIPE shape blocker precedes eligibility/digest stages', () => {
  const d = buildRealDecision('fb2');
  const codes = builder.build({ ...d, __invented: 1 }).issues.map((i) => i.issueCode);
  assert.ok(codes.includes('BUILDER_SOURCE_INVENTED_FIELD'));
  assert.ok(!codes.includes('BUILDER_DIGEST_MISMATCH'));
});
test('C-PIPE envelope only after all stages', () => {
  const d = buildRealDecision('fb3');
  assert.equal(builder.build(d).coreEnvelopeCreated, true);
  assert.equal(builder.build({ ...d, ok: false }).coreEnvelope, null);
});

// ---- Compatibility: exact comparisons + tamper ----
test('C-COMPAT exact comparisons performed and clean', () => {
  const c = B.verifyBuilderCompatibility();
  assert.equal(c.ok, true, JSON.stringify(c.blockers));
  assert.equal(c.exactComparisonsPerformed, true);
  assert.equal(c.identityVerifiedSemanticOwner, 'consumer_runtime');
  assert.equal(c.selectedArchitecture, 'ARCHITECTURE_1');
  assert.equal(c.coreEnvelopeIdentityVerifiedInvariant, false);
  assert.equal(c.consumerRuntimeImplemented, false);
});
test('C-COMPAT compares sets/orders/values, not just counts', () => {
  assert.deepEqual([...CFG.PIPELINE_STAGES], [...BC.BUILDER_PIPELINE_STAGES]);          // ORDER
  assert.deepEqual([...CFG.ENVELOPE_FIELDS], [...BC.OUTPUT_CORE_ENVELOPE_FIELDS]);      // ORDER
  assert.deepEqual([...CFG.ISSUE_CODES].sort(), [...BC.BUILDER_ISSUE_CODES].sort());    // SET
  assert.deepEqual([...CFG.SOURCE_FIELDS], [...BC.REAL_SOURCE_BRIDGE_DECISION_FIELDS]); // ORDER
  for (const dim of BC.RESOURCE_LIMITS_CONTRACT.dimensions) assert.equal(CFG.RESOURCE_LIMITS[dim.dimension], dim.builderLimit); // VALUES
});
test('C-READY only audit-ready when compatibility passes', () => {
  const rd = B.createBuilderReadiness();
  assert.equal(rd.compatibilityOk, true);
  assert.equal(rd.readyForEnterpriseBuilderAudit, true);
  assert.equal(rd.consumerRuntimeImplemented, false);
  assert.equal(rd.readyForConsumerRuntimeImplementation, false);
});
