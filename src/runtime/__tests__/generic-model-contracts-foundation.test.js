import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createGenericModelError,
  GENERIC_MODEL_ERROR_CODES,
  sanitizeGenericModelPayload,
  detectGenericModelUnsafeMarkers,
  createGenericModelSafetyPolicy,
  isGenericModelCapabilityAllowed,
  createGenericModelFallback,
  createGenericModelRollbackPlan,
  createGenericModelDiagnostics,
  createGenericModelVersion,
  createGenericModelChecksum,
  createGenericModelSnapshot,
  validateGenericModelSnapshot,
  createGenericModelInMemoryAdapter,
  validateGenericModelWritePayload,
  createGenericModelWriteContract,
  validateGenericModelReadModel,
  createGenericModelReadContract,
  createGenericModelRuntimeContract,
  GENERIC_MODEL_DANGEROUS_CAPABILITIES,
} from '../generic-model/index.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GM_DIR = path.join(HERE, '../generic-model');
// The detector module necessarily NAMES the forbidden tokens in its regexes —
// it is the sanctioned detector. Exclude it from raw-token usage scans.
const DETECTOR_FILE = 'detectGenericModelUnsafeMarkers.js';
function allGmSources({ includeDetector = true } = {}) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.js') && (includeDetector || entry.name !== DETECTOR_FILE)) out.push(fs.readFileSync(p, 'utf8'));
    }
  };
  walk(GM_DIR);
  return out.join('\n');
}
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const REACT_EL = { $$typeof: Symbol.for('react.element') };

describe('Generic Model Runtime Contracts Foundation (post-Foundation C)', () => {
  // 1
  it('error factory gera erro plano', () => {
    const e = createGenericModelError({ code: 'GM-RUNTIME-003', message: 'blocked', moduleId: 'x' });
    assert.equal(e.kind, 'generic-model-error');
    assert.equal(e.code, 'GM-RUNTIME-003');
    assert.equal(e.blocking, true);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(e)));
  });

  // 2
  it('error factory mascara safeDetails sensíveis e dropa função', () => {
    const e = createGenericModelError({ code: 'GM-RUNTIME-001', details: { password: 'secret', token: 'abc', fn: () => {} } });
    assert.equal(e.safeDetails.password, '[REDACTED]');
    assert.equal(e.safeDetails.token, '[REDACTED]');
    assert.equal(e.safeDetails.fn, undefined); // dropped by clone
    assert.ok(GENERIC_MODEL_ERROR_CODES[e.code]);
  });

  // 3 / 4 / 5 / 6
  it('safety detecta função/handler/React element/prototype pollution', () => {
    assert.equal(detectGenericModelUnsafeMarkers({ fn: () => {} }).safe, false);
    assert.equal(detectGenericModelUnsafeMarkers({ onClick: () => {} }).safe, false);
    assert.equal(detectGenericModelUnsafeMarkers({ el: REACT_EL }).safe, false);
    assert.equal(detectGenericModelUnsafeMarkers(JSON.parse('{"__proto__":{"x":1}}')).safe, false);
  });

  // 7 / 8 / 9
  it('safety detecta backend/Prisma/runtimeBridge target (ref e chave)', () => {
    assert.equal(sanitizeGenericModelPayload({ payload: { url: 'fetch(/api)' } }).safe, false);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { backendUrl: '/api' } }).valid, false);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { prismaModel: 'User' } }).valid, false);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { runtimeBridgeRef: 'y' } }).valid, false);
  });

  // 10
  it('safety mascara token/apiKey/secret/password/authorization/bearer/credential/privateKey', () => {
    const s = sanitizeGenericModelPayload({ payload: { password: 'a', token: 'b', apiKey: 'c', secret: 'd', authorization: 'e', bearer: 'f', credential: 'g', privateKey: 'h' } });
    for (const k of ['password', 'token', 'apiKey', 'secret', 'authorization', 'bearer', 'credential', 'privateKey']) {
      assert.equal(s.sanitized[k], '[REDACTED]');
    }
  });

  // 11
  it('fallback retorna objeto plano', () => {
    const f = createGenericModelFallback({ reason: 'off', moduleId: 'x' });
    assert.equal(f.fallbackApplied, true);
    assert.equal(f.reversible, true);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(f)));
  });

  // 12
  it('rollback plan não executa side effects', () => {
    const r = createGenericModelRollbackPlan({ strategy: 'flag-off' });
    assert.equal(r.rollbackAvailable, true);
    assert.equal(r.safety.executesRollback, false);
    assert.ok(Array.isArray(r.steps) && r.steps.length > 0);
  });

  // 13 / 14 / 15
  it('diagnostics default marca backend/prisma/runtimeBridge Touched false', () => {
    const d = createGenericModelDiagnostics({ enabled: true, moduleId: 'x' });
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    assert.equal(d.persistenceReal, false);
  });

  // 16
  it('versioning é determinístico com clock/seed', () => {
    const a = createGenericModelVersion({ modelId: 'm', moduleId: 'x', draftVersion: 3 });
    const b = createGenericModelVersion({ modelId: 'm', moduleId: 'x', draftVersion: 3 });
    assert.deepEqual(a, b);
    assert.equal(a.versionId, 'gmv-m-x-1-3');
    assert.equal(a.createdAt, '1970-01-01T00:00:00.000Z');
    const c = createGenericModelVersion({ modelId: 'm', moduleId: 'x', draftVersion: 3, clock: () => '2020-01-01T00:00:00.000Z' });
    assert.equal(c.createdAt, '2020-01-01T00:00:00.000Z');
  });

  // 17 / 18
  it('checksum é determinístico e muda quando o valor muda', () => {
    assert.equal(createGenericModelChecksum({ value: { a: 1 } }), createGenericModelChecksum({ value: { a: 1 } }));
    assert.notEqual(createGenericModelChecksum({ value: { a: 1 } }), createGenericModelChecksum({ value: { a: 2 } }));
  });

  // 19 / 20 / 21 / 22 / 23 / 24
  it('in-memory adapter salva/carrega cópia segura, lista por moduleId/modelId, remove, limpa', () => {
    const ad = createGenericModelInMemoryAdapter();
    const snap = createGenericModelSnapshot({ modelId: 'm', moduleId: 'x', modelType: 'cadastro', data: { rows: [] } });
    assert.equal(ad.saveSnapshot(snap).ok, true);
    const loaded = ad.loadSnapshot(snap.snapshotId);
    assert.equal(loaded.ok, true);
    assert.notEqual(loaded.snapshot, snap); // safe copy
    assert.equal(ad.listSnapshots({ moduleId: 'x' }).snapshotCount, 1);
    assert.equal(ad.listSnapshots({ modelId: 'm' }).snapshotCount, 1);
    assert.equal(ad.listSnapshots({ modelId: 'other' }).snapshotCount, 0);
    assert.equal(ad.deleteSnapshot(snap.snapshotId).ok, true);
    ad.saveSnapshot(snap);
    assert.equal(ad.clearSnapshots({ moduleId: 'x' }).snapshotCount, 0);
  });

  // 25 / 26 / 27
  it('in-memory adapter não toca backend/Prisma/runtimeBridge', () => {
    const ad = createGenericModelInMemoryAdapter();
    const snap = createGenericModelSnapshot({ modelId: 'm', moduleId: 'x', data: {} });
    for (const r of [ad.saveSnapshot(snap), ad.getDiagnostics(), ad.listSnapshots({})]) {
      assert.equal(r.backendTouched, false);
      assert.equal(r.prismaTouched, false);
      assert.equal(r.runtimeBridgeTouched, false);
      assert.equal(r.persistenceReal, false);
    }
    assert.equal(ad.getDiagnostics().mandatoryStorage, false);
  });

  // 28 / 29
  it('snapshot criado é plain object e validation passa para snapshot seguro', () => {
    const snap = createGenericModelSnapshot({ modelId: 'm', moduleId: 'x', modelType: 'cadastro', data: { rows: [{ id: 'r1' }] } });
    assert.equal(snap.kind, 'generic-model-snapshot');
    assert.equal(snap.localOnly, true);
    assert.equal(snap.persistenceReal, false);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(snap)));
    assert.equal(validateGenericModelSnapshot({ snapshot: snap, moduleId: 'x' }).valid, true);
  });

  // 30 / 31 / 32 / 33
  it('snapshot validation falha para checksum/função/React/pollution', () => {
    const snap = createGenericModelSnapshot({ modelId: 'm', moduleId: 'x', data: { rows: [{ id: 'r1' }] } });
    assert.equal(validateGenericModelSnapshot({ snapshot: { ...snap, data: { rows: [] } } }).valid, false); // checksum
    assert.equal(validateGenericModelSnapshot({ snapshot: { ...snap, data: { fn: () => {} } } }).valid, false);
    assert.equal(validateGenericModelSnapshot({ snapshot: { ...snap, data: { el: REACT_EL } } }).valid, false);
    assert.equal(validateGenericModelSnapshot({ snapshot: JSON.parse('{"kind":"generic-model-snapshot","snapshotId":"s","modelId":"m","moduleId":"x","version":"v","schemaVersion":1,"source":"generic-model-local","localOnly":true,"persistenceReal":false,"data":{},"__proto__":{"y":1}}') }).valid, false);
  });

  // 34
  it('write contract bloqueia backend/prisma/fetch/storage/runtimeBridge por padrão', () => {
    const c = createGenericModelWriteContract({ modelId: 'm', moduleId: 'x' });
    for (const op of ['backendCreate', 'prismaCreate', 'fetchWrite', 'persistStorageAutomatically', 'mutateRuntimeBridge', 'mutateGlobalRuntime']) {
      assert.ok(c.blockedOperations.includes(op));
    }
    assert.equal(c.backendAllowed, false);
  });

  // 35 / 36 / 37 / 38 / 39
  it('write payload: válido localOnly passa; unknown op/backend/prisma/runtimeBridge falham', () => {
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { a: 1, writeMode: 'localOnly' } }).valid, true);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'frobnicate' }).valid, false);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { target: 'backend' } }).valid, false);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { target: 'prisma' } }).valid, false);
    assert.equal(validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { target: 'runtimeBridge' } }).valid, false);
  });

  // 40 / 41
  it('read contract aceita modelType cadastro e operacional', () => {
    assert.equal(createGenericModelReadContract({ modelType: 'cadastro' }).modelType, 'cadastro');
    assert.equal(createGenericModelReadContract({ modelType: 'operacional' }).modelType, 'operacional');
    assert.equal(createGenericModelReadContract({ modelType: 'nonsense' }).modelType, 'custom');
  });

  // 42 / 43
  it('read model validation passa com table/form coerentes; gera fallback quando inválido', () => {
    assert.equal(validateGenericModelReadModel({ readModel: { modelId: 'm', moduleId: 'x', modelType: 'cadastro', source: 'runtime-v2-beta', table: { columns: [], rows: [] }, form: { fields: [] } } }).valid, true);
    const bad = validateGenericModelReadModel({ readModel: { modelId: 'm', moduleId: 'x', table: { columns: 'nope' } } });
    assert.equal(bad.valid, false);
    assert.equal(bad.fallback.fallbackApplied, true);
  });

  // 44 / 45
  it('runtime contract cria capabilities perigosas false por padrão; permite seguras', () => {
    const rc = createGenericModelRuntimeContract({ modelId: 'modelobase1', moduleId: 'empresas', modelType: 'cadastro' });
    for (const cap of GENERIC_MODEL_DANGEROUS_CAPABILITIES) assert.equal(rc.capabilities[cap], false);
    assert.equal(rc.capabilities.read, true);
    assert.equal(rc.capabilities.localWrite, true);
    const gated = createGenericModelRuntimeContract({ modelId: 'm', moduleId: 'x', capabilityGates: { backendWrite: true } });
    assert.equal(gated.capabilities.backendWrite, true);
    assert.equal(isGenericModelCapabilityAllowed(rc.safetyPolicy, 'backendWrite').allowed, false);
  });

  // 46 / 47 / 48 / 49 / 50 / 51 / 52 — source invariants
  it('generic foundation não importa React/ModeloBase1/Empresas/cadcps/backend/Prisma/runtimeBridge/fetch/storage', () => {
    const src = allGmSources();
    const imports = [...codeOnly(src).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => p !== 'react' && !/\breact\b/.test(p)), 'no React import');
    assert.ok(imports.every((p) => !/ModeloBase1/i.test(p)), 'no ModeloBase1 import');
    assert.ok(imports.every((p) => !/\/modules\/(empresas|cadcps)/.test(p)), 'no Empresas/cadcps import');
    assert.ok(imports.every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)), 'no backend/apis/Prisma import');
    assert.ok(imports.every((p) => !/makBootstrap|runtimeBridge/.test(p)), 'no runtimeBridge/makBootstrap import');
    const code = codeOnly(allGmSources({ includeDetector: false }));
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no storage API');
  });

  // 54 / 55
  it('retornos são cópias seguras; mutar retorno não altera estado interno', () => {
    const ad = createGenericModelInMemoryAdapter();
    const snap = createGenericModelSnapshot({ modelId: 'm', moduleId: 'x', data: { rows: [{ id: 'r1' }] } });
    ad.saveSnapshot(snap);
    const loaded = ad.loadSnapshot(snap.snapshotId).snapshot;
    loaded.data.rows.push({ id: 'INJECTED' });
    assert.equal(ad.loadSnapshot(snap.snapshotId).snapshot.data.rows.length, 1); // internal state safe
  });

  // capability policy fail-closed
  it('safety policy é fail-closed para capability desconhecida', () => {
    const pol = createGenericModelSafetyPolicy({ modelId: 'm', moduleId: 'x' });
    assert.equal(isGenericModelCapabilityAllowed(pol, 'unknownCap').allowed, false);
    assert.equal(isGenericModelCapabilityAllowed(null, 'read').allowed, false);
  });

  // next step is the adapter, not replacement
  it('próximo passo é ModeloBase1 Adapter to Generic Kernel (não substituição total)', () => {
    const rc = createGenericModelRuntimeContract({ modelId: 'm', moduleId: 'x' });
    assert.equal(rc.nextAllowedStep, 'ModeloBase1 Adapter to Generic Kernel');
    assert.ok(!/replace|substitu/i.test(rc.nextAllowedStep));
  });
});
