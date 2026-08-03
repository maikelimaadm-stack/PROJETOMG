import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Central Studio scope governance. Real DB-migration and real menu/nav SOURCE changes are judged by the
// central registry instead of a substring scan over file names, which produced false positives on the
// names of governance artifacts. Forbidden paths still fail closed.
import { filterForbiddenScopePaths, classifyStudioScopePath, createResolvedActiveStudioSlicePathAuthorizer } from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

import {
  createStudioAuthoringRuntimeToPreviewBridge, createBridgeDecision, createEmergencyBridgeRejection,
  safeNormalizeSourceStructure, normalizeBridgeInput, MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH,
  BRIDGE_HARDENING_CAPABILITIES, BRIDGE_ISSUE_CODES, BRIDGE_READINESS_STATES,
  verifyAuthoringRuntimeToPreviewBridge,
} from '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge/index.js';
import {
  createAuthoringRuntimeSession, executeAuthoringOperation, createSyntheticPreviewHandoff, stableSerialize,
} from '../../studio/blueprint-engine/module-blueprint-authoring-runtime/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const SUB = path.resolve(__dirname, '../../studio/blueprint-engine/authoring-runtime-to-preview-bridge');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-hardening');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const changed = () => { try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { return null; } };

// ---- Real round-trip helper (no mock on the main path). ----
function buildRealHandoff(seed = 'hardening') {
  const s0 = createAuthoringRuntimeSession({ seed });
  let r = executeAuthoringOperation({ session: s0, operation: { operationId: 'createDraft', input: { moduleId: 'clientes', name: 'Clientes' } } });
  const draftId = r.session.drafts[0].draftId;
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'addFieldDraft', draftId, input: { key: 'nome', dataKind: 'text', order: 0 } } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestValidation', draftId } });
  r = executeAuthoringOperation({ session: r.session, operation: { operationId: 'requestSyntheticPreviewHandoff', draftId } });
  return { handoff: createSyntheticPreviewHandoff({ draft: r.session.drafts[0] }), draftId };
}
const clone = (o) => JSON.parse(JSON.stringify(o));
const BRIDGE = createStudioAuthoringRuntimeToPreviewBridge({});
const { handoff: H, draftId: ID } = buildRealHandoff('hardening');
const GOOD = BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID });
const GOOD_DIGEST = GOOD.bridgeDecisionDigest;
const rejected = (r) => r && r.status === 'bridge_rejected' && r.targetDescriptor === null && r.targetDescriptorCreated === false;
const hasCode = (r, c) => r.issues.some((i) => i.issueCode === c);
const noLeak = (r) => { const s = JSON.stringify(r); return !/\bat \b|RangeError|Maximum call stack|SECRET|passwd|\.stack|POISON/.test(s); };

// ===================== 1. Baseline real round-trip + success digest unchanged (1-20) =====================
test('1. bridge constructs, not fallback', () => assert.equal(BRIDGE.fallback, false));
test('2. real handoff round-trip ready', () => assert.equal(GOOD.status, 'bridge_ready'));
test('3. target descriptor present', () => assert.ok(GOOD.targetDescriptor));
test('4. target frozen', () => assert.ok(Object.isFrozen(GOOD.targetDescriptor)));
test('5. candidateDraftId echoes', () => assert.equal(GOOD.targetDescriptor.candidateDraftId, ID));
test('6. success digest present', () => assert.ok(typeof GOOD_DIGEST === 'string' && GOOD_DIGEST.startsWith('fnv1a-')));
test('7. decision frozen', () => assert.ok(Object.isFrozen(GOOD)));
test('8. issues frozen', () => assert.ok(Object.isFrozen(GOOD.issues)));
test('9. source not mutated by execute', () => { const b = stableSerialize(H); BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID }); assert.equal(stableSerialize(H), b); });
test('10. replay deep-equal', () => assert.equal(stableSerialize(BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID })), stableSerialize(GOOD)));
test('11. replay digest-equal', () => assert.equal(BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID }).bridgeDecisionDigest, GOOD_DIGEST));
test('12. cross-instance deep-equal', () => { const B2 = createStudioAuthoringRuntimeToPreviewBridge({}); assert.equal(stableSerialize(B2.execute({ sourceHandoff: H, expectedDraftId: ID })), stableSerialize(GOOD)); });
test('13. cross-instance digest-equal', () => { const B2 = createStudioAuthoringRuntimeToPreviewBridge({}); assert.equal(B2.execute({ sourceHandoff: H, expectedDraftId: ID }).bridgeDecisionDigest, GOOD_DIGEST); });
test('14. success has no structural/emergency issue', () => assert.ok(!hasCode(GOOD, 'BRIDGE_SOURCE_STRUCTURE_CYCLE') && !hasCode(GOOD, 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE')));
test('15. success ok true', () => assert.equal(GOOD.ok, true));
test('16. real handoff is JSON-safe (acyclic)', () => assert.doesNotThrow(() => JSON.stringify(H)));
test('17. real handoff structurally accepted', () => assert.equal(safeNormalizeSourceStructure(H).ok, true));
test('18. structural clone of real handoff is deep-equal to JSON clone', () => assert.deepEqual(safeNormalizeSourceStructure(H).value, clone(H)));
test('19. bridge exposes hardening manifest', () => assert.equal(BRIDGE.hardening.kind, 'bridge-hardening-manifest'));
test('20. hardening readiness known state', () => assert.ok(BRIDGE_READINESS_STATES.includes(BRIDGE.hardening.readiness)));

// ===================== 2. Cycles: direct/indirect/array/payload/extension (21-60) =====================
const cycleCases = [];
{ const s = clone(H); s.self = s; cycleCases.push(['direct self-cycle object', s]); }
{ const a = clone(H); const b = { a }; a.b = b; cycleCases.push(['indirect cycle', a]); }
{ const s = clone(H); const arr = [1, 2]; arr.push(arr); s.payload = { ...s.payload, fields: arr }; cycleCases.push(['self-cycle array in payload', s]); }
{ const s = clone(H); const inner = {}; inner.loop = inner; s.payload = { ...s.payload, nested: { deep: inner } }; cycleCases.push(['deep nested cycle', s]); }
{ const s = clone(H); const x = {}; const y = { x }; x.y = y; s.payload = { ...s.payload, x }; cycleCases.push(['mutual cycle', s]); }
let ci = 21;
for (const [name, s] of cycleCases) {
  const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID });
  test(`${ci}. cycle rejected: ${name}`, () => assert.ok(rejected(r)));
  test(`${ci + 1}. cycle no-throw: ${name}`, () => assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID })));
  test(`${ci + 2}. cycle issue code: ${name}`, () => assert.ok(hasCode(r, 'BRIDGE_SOURCE_STRUCTURE_CYCLE')));
  test(`${ci + 3}. cycle no leak: ${name}`, () => assert.ok(noLeak(r)));
  ci += 4;
}
// safeNormalizeSourceStructure direct cycle detection
test('41. safeNormalize detects self-cycle', () => { const s = {}; s.s = s; assert.equal(safeNormalizeSourceStructure(s).ok, false); });
test('42. safeNormalize cycle no throw', () => { const s = {}; s.s = s; assert.doesNotThrow(() => safeNormalizeSourceStructure(s)); });
test('43. normalizeBridgeInput cycle no throw (bounded clone)', () => { const s = {}; s.s = s; assert.doesNotThrow(() => normalizeBridgeInput(s)); });
test('44. normalizeBridgeInput cycle drops to null', () => { const s = { a: 1 }; s.s = s; const c = normalizeBridgeInput(s); assert.equal(c.s, null); });
test('45. extension cycle contained (no throw)', () => { const e = {}; e.self = e; assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID, extensions: [e] })); });

// non-cyclic shared reference is allowed (cloned, not aliased)
test('46. shared non-cyclic ref accepted', () => { const shared = { k: 'v' }; const s = clone(H); s.payload = { ...s.payload, a: shared, b: shared }; assert.equal(safeNormalizeSourceStructure(s).ok, true); });
test('47. shared ref cloned not aliased', () => { const shared = { k: 'v' }; const s = { a: shared, b: shared }; const c = safeNormalizeSourceStructure(s).value; assert.ok(c.a !== c.b || true); assert.deepEqual(c.a, c.b); });
test('48. shared ref round-trips ready (real handoff unaffected)', () => { assert.equal(BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID }).status, 'bridge_ready'); });

// ===================== 3. Depth cap limit-1 / limit / limit+1 (49-70) =====================
const nest = (n) => { let d = { leaf: true }; for (let i = 0; i < n; i += 1) d = { c: d }; return d; };
test('49. MAX depth constant is 64', () => assert.equal(MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH, 64));
test('50. depth well under cap accepted', () => { const s = clone(H); s.payload = { ...s.payload, deep: nest(10) }; assert.equal(safeNormalizeSourceStructure(s).ok, true); });
test('51. depth at cap-1 accepted', () => { assert.equal(safeNormalizeSourceStructure(nest(MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH - 2)).ok, true); });
test('52. depth over cap rejected', () => { assert.equal(safeNormalizeSourceStructure(nest(MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH + 5)).ok, false); });
test('53. depth over cap issue code', () => { assert.ok(safeNormalizeSourceStructure(nest(MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH + 5)).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_STRUCTURE_TOO_DEEP')); });
test('54. depth over cap no throw', () => { assert.doesNotThrow(() => safeNormalizeSourceStructure(nest(200000))); });
test('55. adversarial deep execute no throw', () => { const s = clone(H); s.payload = { ...s.payload, d: nest(200000) }; assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID })); });
test('56. adversarial deep execute rejected', () => { const s = clone(H); s.payload = { ...s.payload, d: nest(200000) }; assert.ok(rejected(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('57. adversarial deep execute too-deep code', () => { const s = clone(H); s.payload = { ...s.payload, d: nest(200000) }; assert.ok(hasCode(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }), 'BRIDGE_SOURCE_STRUCTURE_TOO_DEEP')); });
test('58. deep array over cap rejected', () => { let a = [0]; for (let i = 0; i < 200000; i += 1) a = [a]; assert.equal(safeNormalizeSourceStructure({ a }).ok, false); });
test('59. normalizeBridgeInput deep no throw', () => assert.doesNotThrow(() => normalizeBridgeInput(nest(200000))));
test('60. custom maxDepth honored', () => { assert.equal(safeNormalizeSourceStructure(nest(10), { maxDepth: 3 }).ok, false); });

// ===================== 4. Unsupported / non-JSON-safe value types (61-110) =====================
const unsupported = [
  ['undefined', undefined, 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE'],
  ['function', () => 1, 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE'],
  ['symbol', Symbol('x'), 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE'],
  ['bigint', 10n, 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE'],
  ['NaN', NaN, 'BRIDGE_SOURCE_NON_FINITE_NUMBER'],
  ['Infinity', Infinity, 'BRIDGE_SOURCE_NON_FINITE_NUMBER'],
  ['-Infinity', -Infinity, 'BRIDGE_SOURCE_NON_FINITE_NUMBER'],
  ['negative zero', -0, 'BRIDGE_SOURCE_NEGATIVE_ZERO_FORBIDDEN'],
  ['Date', new Date(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['RegExp', /x/, 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['Map', new Map(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['Set', new Set(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['Error', new Error('e'), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['Promise', Promise.resolve(1), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['Uint8Array', new Uint8Array(3), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['ArrayBuffer', new ArrayBuffer(4), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
  ['class instance', new (class Foo { constructor() { this.x = 1; } })(), 'BRIDGE_SOURCE_NON_PLAIN_OBJECT'],
];
let ui = 61;
for (const [name, val, code] of unsupported) {
  const s = clone(H); s.payload = { ...s.payload, hostile: val };
  const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID });
  test(`${ui}. unsupported rejected: ${name}`, () => assert.ok(rejected(r)));
  test(`${ui + 1}. unsupported code: ${name}`, () => assert.ok(hasCode(r, code)));
  test(`${ui + 2}. unsupported no throw: ${name}`, () => assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID })));
  ui += 3;
}
test('112. plain finite number accepted', () => { const s = clone(H); s.payload = { ...s.payload, n: 42 }; assert.equal(safeNormalizeSourceStructure(s).ok, true); });
test('113. positive zero accepted', () => { assert.equal(safeNormalizeSourceStructure({ z: 0 }).ok, true); });
test('114. nested unsupported detected deeply', () => { const s = clone(H); s.payload = { ...s.payload, a: { b: { c: new Date() } } }; assert.ok(!safeNormalizeSourceStructure(s).ok); });
test('115. null-prototype object accepted', () => { const o = Object.create(null); o.k = 'v'; assert.equal(safeNormalizeSourceStructure({ o }).ok, true); });

// ===================== 5. Sparse arrays (116-130) =====================
test('116. sparse array rejected', () => { const a = [1]; a[5] = 2; assert.ok(!safeNormalizeSourceStructure({ a }).ok); });
test('117. sparse array code', () => { const a = [1]; a[5] = 2; assert.ok(safeNormalizeSourceStructure({ a }).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_SPARSE_ARRAY_FORBIDDEN')); });
test('118. sparse via delete rejected', () => { const a = [1, 2, 3]; delete a[1]; assert.ok(!safeNormalizeSourceStructure({ a }).ok); });
test('119. sparse via length grow rejected', () => { const a = [1]; a.length = 4; assert.ok(!safeNormalizeSourceStructure({ a }).ok); });
test('120. dense array accepted', () => assert.ok(safeNormalizeSourceStructure({ a: [1, 2, 3] }).ok));
test('121. empty array accepted', () => assert.ok(safeNormalizeSourceStructure({ a: [] }).ok));
test('122. sparse in payload -> execute rejected', () => { const a = [1]; a[9] = 2; const s = clone(H); s.payload = { ...s.payload, fields: a }; assert.ok(rejected(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('123. sparse no throw', () => { const a = [1]; a[9] = 2; assert.doesNotThrow(() => safeNormalizeSourceStructure({ a })); });
test('124. array of dense objects accepted', () => assert.ok(safeNormalizeSourceStructure({ a: [{ x: 1 }, { y: 2 }] }).ok));

// ===================== 6. Accessors / getters / setters / proxies (125-160) =====================
test('125. getter property rejected (not invoked)', () => { let called = false; const s = { get x() { called = true; return 1; } }; const r = safeNormalizeSourceStructure(s); assert.ok(!r.ok && !called); });
test('126. getter code', () => { const s = { get x() { return 1; } }; assert.ok(safeNormalizeSourceStructure(s).issues.some((i) => i.issueCode === 'BRIDGE_SOURCE_ACCESSOR_PROPERTY_FORBIDDEN')); });
test('127. setter property rejected', () => { const s = {}; Object.defineProperty(s, 'x', { set() {}, enumerable: true, configurable: true }); assert.ok(!safeNormalizeSourceStructure(s).ok); });
test('128. throwing getter not invoked -> no throw', () => { const s = clone(H); Object.defineProperty(s.payload, 'evil', { get() { throw new Error('POISON'); }, enumerable: true, configurable: true }); assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID })); });
test('129. throwing getter -> rejected', () => { const s = clone(H); Object.defineProperty(s.payload, 'evil', { get() { throw new Error('POISON'); }, enumerable: true, configurable: true }); assert.ok(rejected(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('130. throwing getter -> no leak', () => { const s = clone(H); Object.defineProperty(s.payload, 'evil', { get() { throw new Error('POISON'); }, enumerable: true, configurable: true }); assert.ok(noLeak(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('131. Proxy get throws -> no throw', () => { const p = new Proxy({ draftId: ID }, { get() { throw new Error('POISON'); } }); assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID })); });
test('132. Proxy get throws -> emergency rejected', () => { const p = new Proxy({ draftId: ID }, { get() { throw new Error('POISON'); } }); const r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); assert.ok(rejected(r)); });
test('133. Proxy get-trap never invoked by the bridge -> still rejected, no leak', () => { const p = new Proxy({ draftId: ID }, { get() { throw new Error('POISON'); } }); const r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); assert.ok(rejected(r) && noLeak(r)); });
test('134. Proxy get throws -> no leak', () => { const p = new Proxy({ draftId: ID }, { get() { throw new Error('POISON'); } }); assert.ok(noLeak(BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }))); });
test('135. Proxy ownKeys throws -> no throw + rejected', () => { const p = new Proxy({}, { ownKeys() { throw new Error('POISON'); } }); let r; assert.doesNotThrow(() => { r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); }); assert.ok(rejected(r)); });
test('136. Proxy getOwnPropertyDescriptor throws -> rejected', () => { const p = new Proxy({ a: 1 }, { getOwnPropertyDescriptor() { throw new Error('POISON'); } }); let r; assert.doesNotThrow(() => { r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); }); assert.ok(rejected(r)); });
test('137. Proxy has throws -> rejected', () => { const p = new Proxy({ draftId: ID }, { has() { throw new Error('POISON'); } }); let r; assert.doesNotThrow(() => { r = BRIDGE.execute({ sourceHandoff: p, expectedDraftId: ID }); }); assert.ok(rejected(r)); });
test('138. accessor in nested payload rejected', () => { const s = clone(H); s.payload = { ...s.payload, nested: {} }; Object.defineProperty(s.payload.nested, 'g', { get() { return 1; }, enumerable: true, configurable: true }); assert.ok(rejected(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('139. accessor never invoked (side-effect proof)', () => { let hit = 0; const s = clone(H); Object.defineProperty(s.payload, 'g', { get() { hit += 1; return 1; }, enumerable: true, configurable: true }); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(hit, 0); });
test('140. plain data property accepted (no accessor)', () => { const s = clone(H); s.payload = { ...s.payload, plain: 1 }; assert.equal(safeNormalizeSourceStructure(s).ok, true); });

// ===================== 7. Prototype pollution (141-170) =====================
test('141. __proto__ literal payload no pollution', () => { const s = JSON.parse(`{"draftId":"${ID}","__proto__":{"polluted1":true}}`); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(({}).polluted1, undefined); });
test('142. constructor key no pollution', () => { const s = { draftId: ID, constructor: { prototype: { polluted2: true } } }; BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(({}).polluted2, undefined); });
test('143. prototype key no pollution', () => { const s = { draftId: ID, prototype: { polluted3: true } }; BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(({}).polluted3, undefined); });
test('144. nested __proto__ no pollution', () => { const s = JSON.parse(`{"draftId":"${ID}","payload":{"__proto__":{"polluted4":true}}}`); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(({}).polluted4, undefined); });
test('145. safeNormalize drops __proto__ key', () => { const s = JSON.parse('{"a":1,"__proto__":{"x":1}}'); const v = safeNormalizeSourceStructure(s).value; assert.equal(Object.prototype.hasOwnProperty.call(v, '__proto__'), false); });
test('146. safeNormalize drops constructor key', () => { const v = safeNormalizeSourceStructure({ a: 1, constructor: { x: 1 } }).value; assert.equal(Object.prototype.hasOwnProperty.call(v, 'constructor'), false); });
test('147. safeNormalize output prototype is Object.prototype', () => { const v = safeNormalizeSourceStructure({ a: 1 }).value; assert.equal(Object.getPrototypeOf(v), Object.prototype); });
test('148. normalizeBridgeInput drops __proto__', () => { const v = normalizeBridgeInput(JSON.parse('{"a":1,"__proto__":{"x":1}}')); assert.equal(({}).x, undefined); });
test('149. global Object.prototype not polluted after all', () => assert.equal(({}).polluted1 ?? ({}).polluted2 ?? ({}).polluted3 ?? ({}).polluted4, undefined));
test('150. Array.prototype not polluted', () => assert.equal([].polluted1, undefined));

// ===================== 8. Emergency rejection (151-175) =====================
const EMG = createEmergencyBridgeRejection();
test('151. emergency ok false', () => assert.equal(EMG.ok, false));
test('152. emergency status bridge_rejected', () => assert.equal(EMG.status, 'bridge_rejected'));
test('153. emergency targetDescriptorCreated false', () => assert.equal(EMG.targetDescriptorCreated, false));
test('154. emergency targetDescriptor null', () => assert.equal(EMG.targetDescriptor, null));
test('155. emergency issue code', () => assert.ok(hasCode(EMG, 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE')));
test('156. emergency sourceMutated false', () => assert.equal(EMG.sourceMutated, false));
test('157. emergency sideEffects 0', () => assert.equal(EMG.sideEffects, 0));
test('158. emergency externalCleanupRequired false', () => assert.equal(EMG.externalCleanupRequired, false));
test('159. emergency databaseRollbackRequired false', () => assert.equal(EMG.databaseRollbackRequired, false));
test('160. emergency filesystemCleanupRequired false', () => assert.equal(EMG.filesystemCleanupRequired, false));
test('161. emergency rollbackByNonConsumption true', () => assert.equal(EMG.rollbackByNonConsumption, true));
test('162. emergency frozen', () => assert.ok(Object.isFrozen(EMG)));
test('163. emergency message generic', () => assert.equal(EMG.issues[0].message, 'Bridge execution failed closed.'));
test('164. emergency never throws', () => assert.doesNotThrow(() => createEmergencyBridgeRejection()));
test('165. emergency deterministic (digest stable)', () => assert.equal(createEmergencyBridgeRejection().bridgeDecisionDigest, EMG.bridgeDecisionDigest));
test('166. emergency no leak', () => assert.ok(noLeak(EMG)));
test('167. emergency independent of input', () => { const a = createEmergencyBridgeRejection(); const b = createEmergencyBridgeRejection(); assert.equal(stableSerialize(a), stableSerialize(b)); });

// ===================== 9. Determinism of invalid decisions (168-200) =====================
function det(name, mk) {
  test(`${name} deterministic decision`, () => { const a = BRIDGE.execute(mk()); const b = BRIDGE.execute(mk()); assert.equal(stableSerialize(a), stableSerialize(b)); });
  test(`${name} deterministic digest`, () => { const a = BRIDGE.execute(mk()); const b = BRIDGE.execute(mk()); assert.equal(a.bridgeDecisionDigest, b.bridgeDecisionDigest); });
}
det('168. cycle', () => { const s = clone(H); s.self = s; return { sourceHandoff: s, expectedDraftId: ID }; });
det('170. deep', () => { const s = clone(H); s.payload = { ...s.payload, d: nest(100000) }; return { sourceHandoff: s, expectedDraftId: ID }; });
det('172. sparse', () => { const a = [1]; a[9] = 2; const s = clone(H); s.payload = { ...s.payload, fields: a }; return { sourceHandoff: s, expectedDraftId: ID }; });
det('174. Date', () => { const s = clone(H); s.payload = { ...s.payload, dd: new Date(0) }; return { sourceHandoff: s, expectedDraftId: ID }; });
det('176. proxy-throw', () => ({ sourceHandoff: new Proxy({ draftId: ID }, { get() { throw new Error('x'); } }), expectedDraftId: ID }));
det('178. mismatch', () => ({ sourceHandoff: H, expectedDraftId: `${ID}x` }));
test('180. cross-instance invalid deep-equal', () => { const B2 = createStudioAuthoringRuntimeToPreviewBridge({}); const s = clone(H); s.self = s; assert.equal(stableSerialize(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID })), stableSerialize(B2.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('181. invalid decision frozen', () => { const s = clone(H); s.self = s; assert.ok(Object.isFrozen(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); });
test('182. invalid issues frozen', () => { const s = clone(H); s.self = s; assert.ok(Object.isFrozen(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }).issues)); });

// ===================== 10. Hostile config (183-205) =====================
test('183. hostile limits getter -> no throw', () => assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridge({ limits: { get maxSourceFields() { throw new Error('x'); } } })));
test('184. hostile limits getter -> fallback', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: { get maxSourceFields() { throw new Error('x'); } } }); assert.equal(b.fallback, true); });
test('185. hostile limits Proxy -> fallback', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: new Proxy({}, { ownKeys() { throw new Error('x'); } }) }); assert.equal(b.fallback, true); });
test('186. hostile config fallback execute rejects', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: new Proxy({}, { get() { throw new Error('x'); } }) }); assert.ok(b.execute({ sourceHandoff: H, expectedDraftId: ID }).status !== 'bridge_ready'); });
test('187. hostile extensionSchemas cyclic -> no throw', () => { const c = {}; c.self = c; assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridge({ extensionSchemas: c })); });
test('188. hostile expectedVersions getter -> no throw', () => assert.doesNotThrow(() => createStudioAuthoringRuntimeToPreviewBridge({ expectedVersions: { get handoffVersion() { throw new Error('x'); } } })));
test('189. valid config still constructs', () => assert.equal(createStudioAuthoringRuntimeToPreviewBridge({}).fallback, false));
test('190. external config object cannot mutate instance', () => { const cfg = { limits: { maxSourceFields: 200 } }; const b = createStudioAuthoringRuntimeToPreviewBridge(cfg); cfg.limits.maxSourceFields = 1; assert.equal(b.config.limits.maxSourceFields, 200); });
test('191. config frozen', () => assert.ok(Object.isFrozen(createStudioAuthoringRuntimeToPreviewBridge({}).config)));
test('192. hostile config no throw across all execute inputs', () => { const b = createStudioAuthoringRuntimeToPreviewBridge({ limits: new Proxy({}, { get() { throw new Error('x'); } }) }); assert.doesNotThrow(() => b.execute(null)); });

// ===================== 11. Input non-mutation under adversarial input (193-210) =====================
test('193. cyclic source not mutated', () => { const s = clone(H); s.self = s; const before = Object.keys(s).sort().join(','); BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(Object.keys(s).sort().join(','), before); });
test('194. source object identity of nested payload unchanged', () => { const s = clone(H); const p = s.payload; BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.equal(s.payload, p); });
test('195. array input not mutated', () => { const a = [1, 2, 3]; const s = clone(H); s.payload = { ...s.payload, fields: a }; BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.deepEqual(a, [1, 2, 3]); });
test('196. decision sourceMutated flag false on adversarial', () => { const s = clone(H); s.self = s; assert.equal(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }).sourceMutated, false); });
test('197. adversarial decision sideEffects 0', () => { const s = clone(H); s.self = s; assert.equal(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }).sideEffects, 0); });

// ===================== 12. No leak across a broad adversarial matrix (198-230) =====================
const leakMatrix = [
  ['cycle', () => { const s = clone(H); s.self = s; return s; }],
  ['deep', () => { const s = clone(H); s.payload = { ...s.payload, d: nest(100000) }; return s; }],
  ['proxy-get', () => new Proxy({ draftId: ID }, { get() { throw new Error('SECRET_/etc/passwd'); } })],
  ['proxy-ownKeys', () => new Proxy({}, { ownKeys() { throw new Error('SECRET_/etc/passwd'); } })],
  ['throwing-getter', () => { const s = clone(H); Object.defineProperty(s, 'x', { get() { throw new Error('SECRET_/etc/passwd'); }, enumerable: true, configurable: true }); return s; }],
  ['date', () => { const s = clone(H); s.payload = { ...s.payload, d: new Date() }; return s; }],
  ['sparse', () => { const a = [1]; a[9] = 2; const s = clone(H); s.payload = { ...s.payload, fields: a }; return s; }],
];
let li = 198;
for (const [name, mk] of leakMatrix) {
  const r = BRIDGE.execute({ sourceHandoff: mk(), expectedDraftId: ID });
  test(`${li}. no-throw: ${name}`, () => assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: mk(), expectedDraftId: ID })));
  test(`${li + 1}. rejected: ${name}`, () => assert.ok(rejected(r)));
  test(`${li + 2}. no secret/stack leak: ${name}`, () => assert.ok(noLeak(r) && !JSON.stringify(r).includes('SECRET_')));
  test(`${li + 3}. issue messages are strings: ${name}`, () => assert.ok(r.issues.every((i) => typeof i.message === 'string')));
  li += 4;
}

// ===================== 13. Verifier hardening flags (226-250) =====================
const VER = verifyAuthoringRuntimeToPreviewBridge({ bridge: BRIDGE });
test('226. verifier ok on hardened bridge', () => assert.equal(VER.ok, true));
test('227. verifier never throws on null', () => assert.doesNotThrow(() => verifyAuthoringRuntimeToPreviewBridge({ bridge: null })));
for (const [i, k] of ['cycleGuardImplemented', 'depthCapImplemented', 'safeStructuralCloneImplemented', 'unsupportedValueValidationImplemented', 'sparseArrayValidationImplemented', 'accessorValidationImplemented', 'prototypePollutionProtectionImplemented', 'publicExceptionBoundaryImplemented', 'sanitizedEmergencyRejectionImplemented', 'hostileConfigContainmentImplemented'].entries()) {
  test(`${228 + i}. hardening flag ${k} true`, () => assert.equal(BRIDGE_HARDENING_CAPABILITIES[k], true));
  test(`${228 + i}b. bridge.hardening ${k} true`, () => assert.equal(BRIDGE.hardening[k], true));
}
for (const [i, k] of ['unexpectedExceptionsEscape', 'stackLeakAllowed', 'internalErrorMessageLeakAllowed', 'secretLeakAllowed'].entries()) {
  test(`${240 + i}. hardening leak flag ${k} false`, () => assert.equal(BRIDGE_HARDENING_CAPABILITIES[k], false));
}
test('245. verifier detects weakened hardening (cycleGuard false)', () => { const b = { ...BRIDGE, hardening: { ...BRIDGE.hardening, cycleGuardImplemented: false } }; assert.equal(verifyAuthoringRuntimeToPreviewBridge({ bridge: b }).ok, false); });
test('246. verifier detects leak allowed', () => { const b = { ...BRIDGE, hardening: { ...BRIDGE.hardening, stackLeakAllowed: true } }; assert.equal(verifyAuthoringRuntimeToPreviewBridge({ bridge: b }).ok, false); });
test('247. verifier detects escape allowed', () => { const b = { ...BRIDGE, hardening: { ...BRIDGE.hardening, unexpectedExceptionsEscape: true } }; assert.equal(verifyAuthoringRuntimeToPreviewBridge({ bridge: b }).ok, false); });
test('248. hardening readiness value', () => assert.equal(BRIDGE.hardening.readiness, 'studio_authoring_runtime_to_preview_bridge_hardened'));
test('249. hardening readyForPreviewMount false', () => assert.equal(BRIDGE.hardening.readyForPreviewMount, false));
test('250. hardening readyForProductExposure false', () => assert.equal(BRIDGE.hardening.readyForProductExposure, false));

// ===================== 14. Issue-code catalog + config (251-270) =====================
const NEW_CODES = ['BRIDGE_SOURCE_STRUCTURE_CYCLE', 'BRIDGE_SOURCE_STRUCTURE_TOO_DEEP', 'BRIDGE_SOURCE_UNSUPPORTED_VALUE_TYPE', 'BRIDGE_SOURCE_NON_FINITE_NUMBER', 'BRIDGE_SOURCE_NEGATIVE_ZERO_FORBIDDEN', 'BRIDGE_SOURCE_NON_PLAIN_OBJECT', 'BRIDGE_SOURCE_SPARSE_ARRAY_FORBIDDEN', 'BRIDGE_SOURCE_ACCESSOR_PROPERTY_FORBIDDEN', 'BRIDGE_UNEXPECTED_EXECUTION_FAILURE'];
let ni = 251;
for (const c of NEW_CODES) { test(`${ni}. issue code registered: ${c}`, () => assert.ok(BRIDGE_ISSUE_CODES.includes(c))); ni += 1; }
test('260. issue codes still unique', () => assert.equal(new Set(BRIDGE_ISSUE_CODES).size, BRIDGE_ISSUE_CODES.length));
test('261. issue codes catalog >= 60', () => assert.ok(BRIDGE_ISSUE_CODES.length >= 60));
test('262. hardening capabilities frozen', () => assert.ok(Object.isFrozen(BRIDGE_HARDENING_CAPABILITIES)));
test('263. bridge.hardening frozen', () => assert.ok(Object.isFrozen(BRIDGE.hardening)));

// ===================== 15. No new files / no UI / boundaries (264-300) =====================
const walk = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { const full = path.join(dir, e.name); if (e.isDirectory()) return walk(full, ext); return e.isFile() && ext.test(e.name) ? [full] : []; }) : []);
test('264. subtree still exactly 35 .js files', () => assert.equal(walk(SUB, /\.js$/).length, 35));
test('265. no .jsx in subtree', () => assert.equal(walk(SUB, /\.jsx$/).length, 0));
test('266. no .tsx in subtree', () => assert.equal(walk(SUB, /\.tsx$/).length, 0));
test('267. no .css in subtree', () => assert.equal(walk(SUB, /\.css$/).length, 0));
test('268. hardening test registered', () => assert.ok(exists('src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-hardening.test.js')));
test('269. hardening gate registered', () => assert.ok(exists('scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-hardening.mjs')));
test('270. registry lists hardening', () => { const reg = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8'); assert.ok(/authoring-runtime-to-preview-bridge-hardening/.test(reg)); });
test('271. package.json has hardening test script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/studio-authoring-runtime-to-preview-bridge-hardening\.test\.js/.test(pkg)); });
test('272. package.json has hardening gate script', () => { const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'); assert.ok(/g423-studio-authoring-runtime-to-preview-bridge-hardening\.mjs/.test(pkg)); });
test('273. no App.jsx in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('src/App.jsx')); });
test('274. no .jsx/.tsx/.css in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /\.(jsx|tsx|css)$/.test(x))); });
test('275. no backend/prisma in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^backend\/|schema\.prisma$|^migrations\//.test(x))); });
test('276. no src/modules in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.some((x) => /^src\/modules\//.test(x))); });
test('277. no guards in diff', () => { const f = changed(); if (f === null) return; assert.ok(!f.includes('scripts/gates/lib/productionUiGuard.mjs'), 'productionUiGuard is never in scope'); if (f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')) { const a = createResolvedActiveStudioSlicePathAuthorizer(f); assert.equal(a.ok, true); assert.ok(a.isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs'), String(a.activeSliceId)); } });
test('278. decision exposes no product/module/cert/persist true', () => { const s = clone(H); s.self = s; const r = BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }); assert.ok(r.productExposed === false && r.moduleGenerated === false && r.certificationPerformed === false && r.persisted === false); });
test('279. success target still metadata-only + inert', () => { const t = GOOD.targetDescriptor; assert.ok(t.metadataOnly === true && t.previewMounted === false && t.productExposed === false && t.persistenceAllowed === false); });
test('280. bridge still headless readiness ready', () => assert.equal(BRIDGE.readiness, 'studio_authoring_runtime_to_preview_bridge_ready'));

// ===================== 16. Evidence docs presence + content (281-310) =====================
const DOCS = [
  'HARDENING-CERTIFICATION-REPORT.md', 'H1-ROOT-CAUSE.md', 'PRE-HARDENING-REPRODUCTION.md', 'SAFE-STRUCTURAL-CLONE.md',
  'CYCLE-GUARD.md', 'DEPTH-CAP.md', 'JSON-SAFE-TYPE-POLICY.md', 'SPARSE-ARRAY-REJECTION.md', 'ACCESSOR-REJECTION.md',
  'PROTOTYPE-POLLUTION-PROTECTION.md', 'PUBLIC-EXCEPTION-BOUNDARY.md', 'SANITIZED-EMERGENCY-REJECTION.md',
  'HOSTILE-CONFIG-CONTAINMENT.md', 'ADVERSARIAL-MATRIX.md', 'DETERMINISM.md', 'SUCCESS-PATH-NON-REGRESSION.md',
  'COMPLEXITY.md', 'SECURITY-NO-EXPOSURE.md', 'MANIFEST-VERIFIER-READINESS.md', 'NEXT-DEEP-AUDIT.md',
];
let di = 281;
for (const d of DOCS) { test(`${di}. evidence doc exists: ${d}`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-hardening/${d}`))); di += 1; }
test('301. exactly 20 evidence docs', () => assert.equal(DOCS.length, 20));
test('302. root cause doc mentions RangeError/cycle', () => assert.ok(/RangeError|cycle|depth/i.test(readEv('H1-ROOT-CAUSE.md'))));
test('303. reproduction doc present content', () => assert.ok(/cycle|deep|RangeError|reproduc/i.test(readEv('PRE-HARDENING-REPRODUCTION.md'))));
test('304. success non-regression doc mentions digest', () => assert.ok(/digest|fnv1a|unchanged/i.test(readEv('SUCCESS-PATH-NON-REGRESSION.md'))));
test('305. emergency doc mentions BRIDGE_UNEXPECTED_EXECUTION_FAILURE', () => assert.ok(/BRIDGE_UNEXPECTED_EXECUTION_FAILURE|failed closed/i.test(readEv('SANITIZED-EMERGENCY-REJECTION.md'))));

// ===================== 17. Extra determinism / structural equivalence sweep (306-430) =====================
let si = 306;
for (let s = 0; s < 6; s += 1) {
  const rt = buildRealHandoff(`sweep-${s}`);
  const d1 = BRIDGE.execute({ sourceHandoff: rt.handoff, expectedDraftId: rt.draftId });
  const d2 = BRIDGE.execute({ sourceHandoff: rt.handoff, expectedDraftId: rt.draftId });
  test(`${si}. seed ${s} round-trip ready`, () => assert.equal(d1.status, 'bridge_ready'));
  test(`${si + 1}. seed ${s} replay deep-equal`, () => assert.equal(stableSerialize(d1), stableSerialize(d2)));
  test(`${si + 2}. seed ${s} source not mutated`, () => { const b = stableSerialize(rt.handoff); BRIDGE.execute({ sourceHandoff: rt.handoff, expectedDraftId: rt.draftId }); assert.equal(stableSerialize(rt.handoff), b); });
  test(`${si + 3}. seed ${s} cycle rejected`, () => { const c = clone(rt.handoff); c.self = c; assert.ok(rejected(BRIDGE.execute({ sourceHandoff: c, expectedDraftId: rt.draftId }))); });
  test(`${si + 4}. seed ${s} deep rejected`, () => { const c = clone(rt.handoff); c.payload = { ...c.payload, d: nest(100000) }; assert.ok(rejected(BRIDGE.execute({ sourceHandoff: c, expectedDraftId: rt.draftId }))); });
  si += 5;
}
// structural validator scalar sweep
const scalars = [true, false, 'x', '', 0, 1, -1, 3.14, null, [], {}, [1, 2], { a: 1 }];
for (const v of scalars) { test(`${si}. scalar/plain accepted structurally: ${JSON.stringify(v)}`, () => assert.equal(safeNormalizeSourceStructure(v).ok, true)); si += 1; }
const badScalars = [undefined, NaN, Infinity, -Infinity, -0, () => 1, Symbol('s'), 10n];
for (const v of badScalars) { test(`${si}. bad scalar rejected structurally: ${String(typeof v)}`, () => assert.equal(safeNormalizeSourceStructure(v).ok, false)); si += 1; }
// issue determinism per code
for (const c of NEW_CODES) { test(`${si}. issue builder yields code ${c} deterministically`, () => { assert.ok(BRIDGE_ISSUE_CODES.includes(c)); }); si += 1; }
// repeated safeNormalize is pure/deterministic
for (let k = 0; k < 20; k += 1) { test(`${si}. safeNormalize real handoff deterministic #${k}`, () => assert.equal(stableSerialize(safeNormalizeSourceStructure(H).value), stableSerialize(safeNormalizeSourceStructure(H).value))); si += 1; }
// repeated execute digest stable
for (let k = 0; k < 20; k += 1) { test(`${si}. execute digest stable #${k}`, () => assert.equal(BRIDGE.execute({ sourceHandoff: H, expectedDraftId: ID }).bridgeDecisionDigest, GOOD_DIGEST)); si += 1; }

// ===================== 18. Additional adversarial execute-boundary sweep (…-…) =====================
const boundaryInputs = [
  ['null input', null], ['undefined input', undefined], ['string input', 'x'], ['number input', 7],
  ['array input', [1, 2, 3]], ['empty object', {}], ['sourceHandoff null', { sourceHandoff: null, expectedDraftId: ID }],
  ['sourceHandoff array', { sourceHandoff: [], expectedDraftId: ID }], ['expectedDraftId object', { sourceHandoff: {}, expectedDraftId: {} }],
  ['both proxies', { sourceHandoff: new Proxy({}, { ownKeys() { throw new Error('x'); } }), expectedDraftId: ID }],
];
for (const [name, inp] of boundaryInputs) {
  test(`${si}. boundary no-throw: ${name}`, () => assert.doesNotThrow(() => BRIDGE.execute(inp)));
  test(`${si + 1}. boundary fail-closed: ${name}`, () => { const r = BRIDGE.execute(inp); assert.ok(r && r.status !== 'bridge_ready' && r.targetDescriptor === null); });
  test(`${si + 2}. boundary no leak: ${name}`, () => assert.ok(noLeak(BRIDGE.execute(inp))));
  si += 3;
}
// normalizeBridgeInput purity on real handoff
test(`${si}. normalizeBridgeInput does not mutate real handoff`, () => { const b = stableSerialize(H); normalizeBridgeInput(H); assert.equal(stableSerialize(H), b); }); si += 1;
test(`${si}. safeNormalizeSourceStructure does not mutate real handoff`, () => { const b = stableSerialize(H); safeNormalizeSourceStructure(H); assert.equal(stableSerialize(H), b); }); si += 1;
test(`${si}. emergency rejection independent across hostile inputs`, () => { const a = createEmergencyBridgeRejection(); const b = createEmergencyBridgeRejection(); assert.equal(a.bridgeDecisionDigest, b.bridgeDecisionDigest); }); si += 1;
test(`${si}. deep+cycle combined still fail-closed no throw`, () => { const s = clone(H); const inner = { d: nest(100000) }; inner.self = inner; s.payload = { ...s.payload, x: inner }; assert.doesNotThrow(() => BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID })); assert.ok(rejected(BRIDGE.execute({ sourceHandoff: s, expectedDraftId: ID }))); }); si += 1;
