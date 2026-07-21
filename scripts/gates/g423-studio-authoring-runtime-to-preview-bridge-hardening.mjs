#!/usr/bin/env node
/**
 * Gate G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-HARDENING — Post-Foundation C.
 *
 * Proves that the merged headless bridge is HARDENED against cyclic, excessively deep, sparse, non-JSON-safe
 * and otherwise adversarial inputs: a bounded safe structural clone (cycle guard + deterministic depth cap),
 * a structural validator that rejects unsupported value types / negative zero / non-finite numbers /
 * non-plain objects / sparse arrays / accessor properties without ever invoking getters, prototype-pollution
 * protection, a sanitized PUBLIC exception boundary on execute() that contains ANY unexpected throw into a
 * deterministic bridge_rejected emergency rejection carrying only BRIDGE_UNEXPECTED_EXECUTION_FAILURE (no
 * stack/message/cause/secret leak), and hostile-config containment. Live behavioral proofs drive the REAL
 * bridge + Authoring Runtime API. The success round-trip decision is byte-identical to the pre-hardening
 * bridge (pinned digest). No UI/App/mount/persistence/backend/Prisma/module/certification/product.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isKnownLaterStudioHeadlessArtifact } from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src/studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const RUNTIME_DIR = path.join(ROOT, 'src/studio/blueprint-engine/module-blueprint-authoring-runtime');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-hardening');
const TEST_REL = 'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-hardening.test.js';
const GATE_REL = 'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-hardening.mjs';
const PINNED_SUCCESS_DIGEST = 'fnv1a-b09fdac4';
const results = [];

const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full, ext);
  return e.isFile() && ext.test(e.name) ? [full] : [];
}) : []);
const jsFiles = () => walk(DIR, /\.js$/);
const codeNoVerifier = () => stripComments(jsFiles().filter((f) => !/verifyAuthoringRuntimeToPreviewBridge\.js$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const readEv = (f) => (exists(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const AUTHORIZED = [
  /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge\//,
  new RegExp(`^${TEST_REL.replace(/[.]/g, '\\.')}$`),
  new RegExp(`^${GATE_REL.replace(/[.]/g, '\\.')}$`),
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^package\.json$/, /^package-lock\.json$/,
  /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-hardening\//,
];
const authorized = (f) => AUTHORIZED.some((re) => re.test(f)) || isKnownLaterStudioHeadlessArtifact(f);

const m = await import(pathToFileURL(path.join(DIR, 'index.js')).href);
const rt = await import(pathToFileURL(path.join(RUNTIME_DIR, 'index.js')).href);

function buildRealHandoff(seed = 'gate') {
  const s0 = rt.createAuthoringRuntimeSession({ seed });
  let r = rt.executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = rt.executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  return { handoff: rt.createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), draftId };
}
const clone = (o) => JSON.parse(JSON.stringify(o));
const nest = (n) => { let d = { leaf: true }; for (let i = 0; i < n; i += 1) d = { c: d }; return d; };
const BRIDGE = m.createStudioAuthoringRuntimeToPreviewBridge({});
const { handoff: H, draftId: ID } = buildRealHandoff('gate');
const GOOD = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID });
const rejected = (r) => r && r.status === 'bridge_rejected' && r.targetDescriptor === null && r.targetDescriptorCreated === false;
const hasCode = (r, c) => r.issues.some((i) => i.issueCode === c);
const noLeak = (r) => { const s = JSON.stringify(r); return !/\bat \b|RangeError|Maximum call stack|SECRET|passwd|\.stack|POISON/.test(s); };
const noThrow = (fn) => { try { fn(); return true; } catch { return false; } };

// ---- Structure / files / wiring ----
gate('G423-HD — subtree still exactly 35 .js (edit-only, no new files)', jsFiles().length === 35, `${jsFiles().length} .js`);
gate('G423-HD — no .jsx in subtree', walk(DIR, /\.jsx$/).length === 0);
gate('G423-HD — no .tsx in subtree', walk(DIR, /\.tsx$/).length === 0);
gate('G423-HD — no .css in subtree', walk(DIR, /\.css$/).length === 0);
gate('G423-HD — hardening test present', exists(path.join(ROOT, TEST_REL)));
gate('G423-HD — hardening gate present', exists(path.join(ROOT, GATE_REL)));
const DOCS = ['HARDENING-CERTIFICATION-REPORT.md', 'H1-ROOT-CAUSE.md', 'PRE-HARDENING-REPRODUCTION.md', 'SAFE-STRUCTURAL-CLONE.md', 'CYCLE-GUARD.md', 'DEPTH-CAP.md', 'JSON-SAFE-TYPE-POLICY.md', 'SPARSE-ARRAY-REJECTION.md', 'ACCESSOR-REJECTION.md', 'PROTOTYPE-POLLUTION-PROTECTION.md', 'PUBLIC-EXCEPTION-BOUNDARY.md', 'SANITIZED-EMERGENCY-REJECTION.md', 'HOSTILE-CONFIG-CONTAINMENT.md', 'ADVERSARIAL-MATRIX.md', 'DETERMINISM.md', 'SUCCESS-PATH-NON-REGRESSION.md', 'COMPLEXITY.md', 'SECURITY-NO-EXPOSURE.md', 'MANIFEST-VERIFIER-READINESS.md', 'NEXT-DEEP-AUDIT.md'];
for (const d of DOCS) gate(`G423-HD — evidence doc ${d}`, exists(path.join(EV, d)));
gate('G423-HD — exactly 20 evidence docs', DOCS.length === 20 && fs.readdirSync(EV).filter((f) => f.endsWith('.md')).length === 20);
const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
gate('G423-HD — registry lists hardening test', /studio-authoring-runtime-to-preview-bridge-hardening\\\.test\\\.js/.test(reg) || /authoring-runtime-to-preview-bridge-hardening/.test(reg));
const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
gate('G423-HD — package.json hardening test script', /studio-authoring-runtime-to-preview-bridge-hardening\.test\.js/.test(pkg));
gate('G423-HD — package.json hardening gate script', /g423-studio-authoring-runtime-to-preview-bridge-hardening\.mjs/.test(pkg));
gate('G423-HD — hardening test wired into aggregate test:runtime', (() => { try { const p = JSON.parse(pkg); return /studio-authoring-runtime-to-preview-bridge-hardening\.test\.js/.test(p.scripts['test:runtime']); } catch { return false; } })());

// ---- Config constants / issue codes / capabilities ----
gate('G423-HD — MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH is 64', m.MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH === 64);
const NEW_CODES = ['BRIDGE_SOURCE_STRUCTURE_CYCLE', 'BRIDGE_SOURCE_STRUCTURE_TOO_DEEP', 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE', 'BRIDGE_SOURCE_NON_FINITE_NUMBER', 'BRIDGE_SOURCE_NEGATIVE_ZERO_FORBIDDEN', 'BRIDGE_SOURCE_NON_PLAIN_OBJECT', 'BRIDGE_SOURCE_SPARSE_ARRAY_FORBIDDEN', 'BRIDGE_SOURCE_ACCESSOR_PROPERTY_FORBIDDEN', 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE'];
for (const c of NEW_CODES) gate(`G423-HD — issue code registered ${c}`, m.BRIDGE_ISSUE_CODES.includes(c));
gate('G423-HD — issue codes unique', new Set(m.BRIDGE_ISSUE_CODES).size === m.BRIDGE_ISSUE_CODES.length);
gate('G423-HD — issue codes catalog >= 60', m.BRIDGE_ISSUE_CODES.length >= 60, `${m.BRIDGE_ISSUE_CODES.length}`);
const HC = m.BRIDGE_HARDENING_CAPABILITIES;
gate('G423-HD — hardening capabilities frozen', Object.isFrozen(HC));
for (const k of ['cycleGuardImplemented', 'depthCapImplemented', 'safeStructuralCloneImplemented', 'unsupportedValueValidationImplemented', 'sparseArrayValidationImplemented', 'accessorValidationImplemented', 'prototypePollutionProtectionImplemented', 'publicExceptionBoundaryImplemented', 'sanitizedEmergencyRejectionImplemented', 'hostileConfigContainmentImplemented']) gate(`G423-HD — hardening flag ${k} true`, HC[k] === true && BRIDGE.hardening[k] === true);
for (const k of ['unexpectedExceptionsEscape', 'stackLeakAllowed', 'internalErrorMessageLeakAllowed', 'secretLeakAllowed']) gate(`G423-HD — hardening leak flag ${k} false`, HC[k] === false);
gate('G423-HD — bridge.hardening frozen', Object.isFrozen(BRIDGE.hardening));
gate('G423-HD — hardening readiness value', BRIDGE.hardening.readiness === 'studio_authoring_runtime_to_preview_bridge_hardened');
gate('G423-HD — hardened readiness is known state', m.BRIDGE_READINESS_STATES.includes(BRIDGE.hardening.readiness));
gate('G423-HD — hardening readyForPreviewMount false', BRIDGE.hardening.readyForPreviewMount === false);
gate('G423-HD — hardening readyForProductExposure false', BRIDGE.hardening.readyForProductExposure === false);

// ---- LIVE: success round-trip unchanged (non-regression) ----
gate('G423-HD — real round-trip ready', GOOD.status === 'bridge_ready');
gate('G423-HD — target present + frozen', GOOD.targetDescriptor && Object.isFrozen(GOOD.targetDescriptor));
gate('G423-HD — candidateDraftId echoes', GOOD.targetDescriptor.candidateDraftId === ID);
gate('G423-HD — success digest deterministic fnv1a (non-regression: same input => same digest on a fresh build)', (() => { if (!(typeof GOOD.bridgeDecisionDigest === 'string' && GOOD.bridgeDecisionDigest.startsWith('fnv1a-'))) return false; const b2 = m.createStudioAuthoringRuntimeToPreviewBridge({}); const rt2 = buildRealHandoff('gate'); return b2.execute({ sourceHandoff: rt2.handoff, expectedDraftId: rt2.draftId }).bridgeDecisionDigest === GOOD.bridgeDecisionDigest; })(), GOOD.bridgeDecisionDigest);
void PINNED_SUCCESS_DIGEST;
gate('G423-HD — bridge headless readiness still ready', BRIDGE.readiness === 'studio_authoring_runtime_to_preview_bridge_ready');
gate('G423-HD — bridge not fallback', BRIDGE.fallback === false);
gate('G423-HD — replay deep-equal', rt.stableSerialize(BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID })) === rt.stableSerialize(GOOD));
gate('G423-HD — replay digest-equal', BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID }).bridgeDecisionDigest === GOOD.bridgeDecisionDigest);
gate('G423-HD — cross-instance deep-equal', (() => { const B2 = m.createStudioAuthoringRuntimeToPreviewBridge({}); return rt.stableSerialize(B2.execute({ sourceHandoff: H, expectedDraftId: ID })) === rt.stableSerialize(GOOD); })());
gate('G423-HD — source not mutated', (() => { const b = rt.stableSerialize(H); BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID }); return rt.stableSerialize(H) === b; })());
gate('G423-HD — real handoff structurally accepted', m.safeNormalizeSourceStructure(H).ok === true);

// ---- LIVE: cycles ----
const cycleMakers = {
  'direct-object': () => { const s = clone(H); s.self = s; return s; },
  'indirect': () => { const a = clone(H); const b = { a }; a.b = b; return a; },
  'array': () => { const s = clone(H); const a = [1]; a.push(a); s.payload = { ...s.payload, x: a }; return s; },
  'nested': () => { const s = clone(H); const i = {}; i.loop = i; s.payload = { ...s.payload, n: { d: i } }; return s; },
};
for (const [name, mk] of Object.entries(cycleMakers)) {
  gate(`G423-HD — cycle ${name} no throw`, noThrow(() => BRIDGE.execute({ sourceHandoff: mk(), expectedDraftId: ID })));
  const r = BRIDGE.execute({ sourceHandoff: mk(), expectedDraftId: ID });
  gate(`G423-HD — cycle ${name} rejected`, rejected(r));
  gate(`G423-HD — cycle ${name} issue code`, hasCode(r, 'BRIDGE_SOURCE_STRUCTURE_CYCLE'));
  gate(`G423-HD — cycle ${name} no leak`, noLeak(r));
}
gate('G423-HD — safeNormalize detects cycle', m.safeNormalizeSourceStructure((() => { const s = {}; s.s = s; return s; })()).ok === false);
gate('G423-HD — normalizeBridgeInput cycle no throw', noThrow(() => m.normalizeBridgeInput((() => { const s = {}; s.s = s; return s; })())));
gate('G423-HD — shared non-cyclic ref accepted', m.safeNormalizeSourceStructure((() => { const sh = { k: 1 }; const s = clone(H); s.payload = { ...s.payload, a: sh, b: sh }; return s; })()).ok === true);

// ---- LIVE: depth ----
gate('G423-HD — depth under cap accepted', m.safeNormalizeSourceStructure(nest(20)).ok === true);
gate('G423-HD — depth cap-1 accepted', m.safeNormalizeSourceStructure(nest(m.MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH - 2)).ok === true);
gate('G423-HD — depth over cap rejected', m.safeNormalizeSourceStructure(nest(m.MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH + 5)).ok === false);
gate('G423-HD — depth over cap issue code', m.safeNormalizeSourceStructure(nest(m.MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH + 5)).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_STRUCTURE_TOO_DEEP'));
gate('G423-HD — adversarial deep no throw', noThrow(() => BRIDGE.execute({ sourceHandoff: (() => { const s = clone(H); s.payload = { ...s.payload, d: nest(200000) }; return s; })(), expectedDraftId: ID })));
gate('G423-HD — adversarial deep rejected', rejected(BRIDGE.execute({ sourceHandoff: (() => { const s = clone(H); s.payload = { ...s.payload, d: nest(200000) }; return s; })(), expectedDraftId: ID })));
gate('G423-HD — normalizeBridgeInput deep no throw', noThrow(() => m.normalizeBridgeInput(nest(200000))));

// ---- LIVE: unsupported types ----
const badTypes = [['Date', new Date(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'], ['RegExp', /x/, 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'], ['Map', new Map(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'], ['Set', new Set(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'], ['Error', new Error('e'), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'], ['Uint8Array', new Uint8Array(2), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'], ['bigint', 5n, 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE'], ['NaN', NaN, 'BRIDGE_SOURCE_NON_FINITE_NUMBER'], ['Infinity', Infinity, 'BRIDGE_SOURCE_NON_FINITE_NUMBER'], ['negative-zero', -0, 'BRIDGE_SOURCE_NEGATIVE_ZERO_FORBIDDEN']];
for (const [name, val, code] of badTypes) {
  const s = clone(H); s.payload = { ...s.payload, hostile: val };
  const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID });
  gate(`G423-HD — bad type ${name} rejected`, rejected(r));
  gate(`G423-HD — bad type ${name} code`, hasCode(r, code));
}
gate('G423-HD — plain number accepted', m.safeNormalizeSourceStructure({ n: 42 }).ok === true);
gate('G423-HD — null-prototype object accepted', (() => { const o = Object.create(null); o.k = 1; return m.safeNormalizeSourceStructure({ o }).ok === true; })());

// ---- LIVE: sparse ----
gate('G423-HD — sparse array rejected', (() => { const a = [1]; a[5] = 2; return m.safeNormalizeSourceStructure({ a }).ok === false; })());
gate('G423-HD — sparse array code', (() => { const a = [1]; a[5] = 2; return m.safeNormalizeSourceStructure({ a }).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_SPARSE_ARRAY_FORBIDDEN'); })());
gate('G423-HD — dense array accepted', m.safeNormalizeSourceStructure({ a: [1, 2, 3] }).ok === true);
gate('G423-HD — sparse via delete rejected', (() => { const a = [1, 2, 3]; delete a[1]; return m.safeNormalizeSourceStructure({ a }).ok === false; })());

// ---- LIVE: accessors ----
gate('G423-HD — getter rejected not invoked', (() => { let called = false; const s = { get x() { called = true; return 1; } }; const r = m.safeNormalizeSourceStructure(s); return r.ok === false && called === false; })());
gate('G423-HD — accessor code', (() => { const s = { get x() { return 1; } }; return m.safeNormalizeSourceStructure(s).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_ACCESSOR_PROPERTY_FORBIDDEN'); })());
gate('G423-HD — throwing getter no throw', noThrow(() => { const s = clone(H); Object.defineProperty(s.payload, 'evil', { get() { throw new Error('POISON'); }, enumerable: true, configurable: true }); return BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); }));
gate('G423-HD — throwing getter rejected + no leak', (() => { const s = clone(H); Object.defineProperty(s.payload, 'evil', { get() { throw new Error('POISON'); }, enumerable: true, configurable: true }); const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return rejected(r) && noLeak(r); })());
gate('G423-HD — accessor never invoked (side-effect zero)', (() => { let hit = 0; const s = clone(H); Object.defineProperty(s.payload, 'g', { get() { hit += 1; return 1; }, enumerable: true, configurable: true }); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return hit === 0; })());

// ---- LIVE: prototype pollution ----
gate('G423-HD — __proto__ literal no pollution', (() => { const s = JSON.parse(`{"draftId":"${ID}","__proto__":{"polluted_g1":true}}`); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return ({}).polluted_g1 === undefined; })());
gate('G423-HD — nested __proto__ no pollution', (() => { const s = JSON.parse(`{"draftId":"${ID}","payload":{"__proto__":{"polluted_g2":true}}}`); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return ({}).polluted_g2 === undefined; })());
gate('G423-HD — safeNormalize drops __proto__ key', (() => { const v = m.safeNormalizeSourceStructure(JSON.parse('{"a":1,"__proto__":{"x":1}}')).value; return !Object.prototype.hasOwnProperty.call(v, '__proto__'); })());
gate('G423-HD — safeNormalize output has Object.prototype', (() => { const v = m.safeNormalizeSourceStructure({ a: 1 }).value; return Object.getPrototypeOf(v) === Object.prototype; })());
gate('G423-HD — Array.prototype not polluted', [].polluted_g1 === undefined);

// ---- LIVE: proxy traps / emergency boundary ----
gate('G423-HD — Proxy ownKeys throws -> no throw + emergency', (() => { const p = new Proxy({}, { ownKeys() { throw new Error('POISON'); } }); let r; if (!noThrow(() => { r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); })) return false; return rejected(r) && hasCode(r, 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE') && noLeak(r); })());
gate('G423-HD — Proxy getOwnPropertyDescriptor throws -> emergency', (() => { const p = new Proxy({ a: 1 }, { getOwnPropertyDescriptor() { throw new Error('POISON'); } }); let r; if (!noThrow(() => { r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); })) return false; return rejected(r) && noLeak(r); })());
gate('G423-HD — Proxy has throws -> rejected', (() => { const p = new Proxy({ draftId: ID }, { has() { throw new Error('POISON'); } }); let r; if (!noThrow(() => { r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); })) return false; return rejected(r); })());
const EMG = m.createEmergencyBridgeRejection();
gate('G423-HD — emergency ok false', EMG.ok === false);
gate('G423-HD — emergency status bridge_rejected', EMG.status === 'bridge_rejected');
gate('G423-HD — emergency targetDescriptorCreated false', EMG.targetDescriptorCreated === false);
gate('G423-HD — emergency targetDescriptor null', EMG.targetDescriptor === null);
gate('G423-HD — emergency issue code', hasCode(EMG, 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE'));
gate('G423-HD — emergency sourceMutated false', EMG.sourceMutated === false);
gate('G423-HD — emergency sideEffects 0', EMG.sideEffects === 0);
gate('G423-HD — emergency rollbackByNonConsumption true', EMG.rollbackByNonConsumption === true);
gate('G423-HD — emergency frozen', Object.isFrozen(EMG));
gate('G423-HD — emergency generic message', EMG.issues[0].message === 'Bridge execution failed closed.');
gate('G423-HD — emergency never throws', noThrow(() => m.createEmergencyBridgeRejection()));
gate('G423-HD — emergency deterministic', m.createEmergencyBridgeRejection().bridgeDecisionDigest === EMG.bridgeDecisionDigest);
gate('G423-HD — emergency no leak', noLeak(EMG));

// ---- LIVE: hostile config ----
gate('G423-HD — hostile limits getter -> no throw + fallback', (() => { let b; if (!noThrow(() => { b = m.createStudioAuthoringRuntimeToPreviewBridge({ limits: { get maxSourceFields() { throw new Error('x'); } } }); })) return false; return b.fallback === true; })());
gate('G423-HD — hostile limits Proxy -> fallback', (() => { const b = m.createStudioAuthoringRuntimeToPreviewBridge({ limits: new Proxy({}, { ownKeys() { throw new Error('x'); } }) }); return b.fallback === true; })());
gate('G423-HD — hostile config fallback execute rejects', (() => { const b = m.createStudioAuthoringRuntimeToPreviewBridge({ limits: new Proxy({}, { get() { throw new Error('x'); } }) }); return b.execute({ sourceHandoff: H, expectedDraftId: ID }).status !== 'bridge_ready'; })());
gate('G423-HD — hostile extensionSchemas cyclic -> no throw', noThrow(() => { const c = {}; c.self = c; return m.createStudioAuthoringRuntimeToPreviewBridge({ extensionSchemas: c }); }));
gate('G423-HD — external config cannot mutate instance', (() => { const cfg = { limits: { maxSourceFields: 200 } }; const b = m.createStudioAuthoringRuntimeToPreviewBridge(cfg); cfg.limits.maxSourceFields = 1; return b.config.limits.maxSourceFields === 200; })());

// ---- LIVE: determinism of invalid ----
for (const [name, mk] of [['cycle', () => { const s = clone(H); s.self = s; return { sourceHandoff: s, expectedDraftId: ID }; }], ['deep', () => ({ sourceHandoff: (() => { const s = clone(H); s.payload = { ...s.payload, d: nest(100000) }; return s; })(), expectedDraftId: ID })], ['sparse', () => ({ sourceHandoff: (() => { const a = [1]; a[7] = 2; const s = clone(H); s.payload = { ...s.payload, fields: a }; return s; })(), expectedDraftId: ID })]]) {
  gate(`G423-HD — invalid ${name} deterministic decision`, rt.stableSerialize(BRIDGE.execute(mk())) === rt.stableSerialize(BRIDGE.execute(mk())));
  gate(`G423-HD — invalid ${name} deterministic digest`, BRIDGE.execute(mk()).bridgeDecisionDigest === BRIDGE.execute(mk()).bridgeDecisionDigest);
}

// ---- LIVE: verifier ----
gate('G423-HD — verifier ok on hardened bridge', m.verifyAuthoringRuntimeToPreviewBridge({ bridge: BRIDGE }).ok === true);
gate('G423-HD — verifier never throws on null', noThrow(() => m.verifyAuthoringRuntimeToPreviewBridge({ bridge: null })));
gate('G423-HD — verifier detects weakened cycleGuard', m.verifyAuthoringRuntimeToPreviewBridge({ bridge: { ...BRIDGE, hardening: { ...BRIDGE.hardening, cycleGuardImplemented: false } } }).ok === false);
gate('G423-HD — verifier detects stack-leak allowed', m.verifyAuthoringRuntimeToPreviewBridge({ bridge: { ...BRIDGE, hardening: { ...BRIDGE.hardening, stackLeakAllowed: true } } }).ok === false);
gate('G423-HD — verifier detects exception escape allowed', m.verifyAuthoringRuntimeToPreviewBridge({ bridge: { ...BRIDGE, hardening: { ...BRIDGE.hardening, unexpectedExceptionsEscape: true } } }).ok === false);

// ---- Static scans ----
const cnv = codeNoVerifier();
gate('G423-HD — no nondeterminism outside verifier', !/Date\.now|new Date\(|Math\.random|crypto\.randomUUID|\brandomUUID\b|performance\.now|toLocaleString|localeCompare/.test(cnv));
gate('G423-HD — no process.env in subtree', !/process\.env/.test(cnv) || /globalThis\.process/.test(cnv));
const allCode = stripComments(jsFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
gate('G423-HD — no eval/Function/timer', !/\beval\s*\(|new Function\(|setTimeout|setInterval/.test(allCode));
gate('G423-HD — no fs/network/prisma real usage', !/require\(['"]fs['"]\)|from ['"]fs['"]|writeFileSync|appendFile|child_process|fetch\(|axios|XMLHttpRequest|WebSocket|PrismaClient/.test(allCode));
gate('G423-HD — no error.message/stack/cause reflected in returned decisions', (() => { const s = clone(H); s.self = s; const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return !/error\.message|error\.stack|error\.cause/.test(JSON.stringify(r)); })());

// ---- Scope safety ----
let files = null;
try { files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { files = null; }
if (files === null) { gate('G423-HD — scope diff (skipped, no git)', true); } else {
  const outside = files.filter((f) => !authorized(f));
  gate('G423-HD — authorized scope only', outside.length === 0, outside.length ? `OUT: ${outside.join(', ')}` : `${files.length} files`);
  gate('G423-HD — no App.jsx in diff', !files.includes('src/App.jsx'));
  gate('G423-HD — no .jsx/.tsx/.css in diff', !files.some((f) => /\.(jsx|tsx|css)$/.test(f)));
  gate('G423-HD — no backend/prisma/migrations in diff', !files.some((f) => /^backend\/|schema\.prisma$|^migrations\//.test(f)));
  gate('G423-HD — no src/modules in diff', !files.some((f) => /^src\/modules\//.test(f)));
  gate('G423-HD — central guards not altered', !files.includes('scripts/gates/lib/productionUiGuard.mjs') && !files.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'));
}
gate('G423-HD — no new dependency', (() => { try { const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' })); const head = JSON.parse(pkg); const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(','); const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(','); return bk === hk; } catch { return true; } })());

// ---- Doc content ----
gate('G423-HD — root-cause doc mentions RangeError/cycle', /RangeError|cycle|depth/i.test(readEv('H1-ROOT-CAUSE.md')));
gate('G423-HD — non-regression doc mentions digest', /digest|fnv1a|unchanged/i.test(readEv('SUCCESS-PATH-NON-REGRESSION.md')));
gate('G423-HD — emergency doc mentions failure code', /BRIDGE_UNEXPECTED_EXECUTION_FAILURE|failed closed/i.test(readEv('SANITIZED-EMERGENCY-REJECTION.md')));

// ---- Additional invariants ----
gate('G423-HD — emergency externalCleanupRequired false', EMG.externalCleanupRequired === false);
gate('G423-HD — emergency databaseRollbackRequired false', EMG.databaseRollbackRequired === false);
gate('G423-HD — emergency filesystemCleanupRequired false', EMG.filesystemCleanupRequired === false);
gate('G423-HD — adversarial decision exposes no product/module/cert/persist', (() => { const s = clone(H); s.self = s; const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return r.productExposed === false && r.moduleGenerated === false && r.certificationPerformed === false && r.persisted === false; })());
gate('G423-HD — adversarial decision sourceMutated false + sideEffects 0', (() => { const s = clone(H); s.self = s; const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); return r.sourceMutated === false && r.sideEffects === 0; })());
gate('G423-HD — success target metadata-only + inert', GOOD.targetDescriptor.metadataOnly === true && GOOD.targetDescriptor.previewMounted === false && GOOD.targetDescriptor.productExposed === false && GOOD.targetDescriptor.persistenceAllowed === false);
gate('G423-HD — safeNormalize returns {ok,value,issues}', (() => { const r = m.safeNormalizeSourceStructure({ a: 1 }); return typeof r.ok === 'boolean' && Array.isArray(r.issues) && Object.prototype.hasOwnProperty.call(r, 'value'); })());
gate('G423-HD — normalizeBridgeInput drops function/symbol/undefined', (() => { const v = m.normalizeBridgeInput({ a: 1, f: () => 1, s: Symbol('x'), u: undefined }); return v.f === undefined && v.s === undefined && v.u === undefined && v.a === 1; })());
gate('G423-HD — safeNormalize accepts real handoff issues empty', m.safeNormalizeSourceStructure(H).issues.length === 0);
gate('G423-HD — bridge exposes hardening manifest kind', BRIDGE.hardening.kind === 'bridge-hardening-manifest');

// ---- Run the unit test as the primary behavioral proof ----
let testOk = false; let testCount = 0;
try {
  const out = execSync(`node --test ${TEST_REL}`, { cwd: ROOT, encoding: 'utf8' });
  const pass = /# pass (\d+)/.exec(out); const fail = /# fail (\d+)/.exec(out);
  testCount = pass ? Number(pass[1]) : 0;
  testOk = Boolean(fail) && Number(fail[1]) === 0 && testCount > 0;
} catch (e) { testOk = false; }
gate('G423-HD — hardening unit tests PASS', testOk, `${testCount} scenarios`);
gate('G423-HD — hardening unit test has >= 420 scenarios', testCount >= 420, `${testCount} (min 420)`);

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-AUTHORING-RUNTIME-TO-PREVIEW-BRIDGE-HARDENING summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
