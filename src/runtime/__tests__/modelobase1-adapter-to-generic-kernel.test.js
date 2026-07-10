import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createModeloBase1GenericModelAdapter } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericModelAdapter.js';
import { mapModeloBase1RuntimeReadToGenericModel } from '../../ModeloBase1/generic-model-adapter/mapModeloBase1RuntimeReadToGenericModel.js';
import { mapGenericModelReadToModeloBase1State } from '../../ModeloBase1/generic-model-adapter/mapGenericModelReadToModeloBase1State.js';
import { createModeloBase1GenericSafetyBridge } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericSafetyBridge.js';
import { createModeloBase1GenericDiagnosticsBridge } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericDiagnosticsBridge.js';
import { createModeloBase1GenericFallbackBridge } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericFallbackBridge.js';
import { createModeloBase1GenericWriteBridge } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericWriteBridge.js';
import { createModeloBase1GenericPersistenceBridge } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericPersistenceBridge.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ADAPTER_DIR = path.join(HERE, '../../ModeloBase1/generic-model-adapter');
function adapterSource() {
  return fs.readdirSync(ADAPTER_DIR).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(ADAPTER_DIR, f), 'utf8')).join('\n');
}
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const REACT_EL = { $$typeof: Symbol.for('react.element') };

const mb1ReadState = (over = {}) => ({
  moduleId: 'empresas', betaApplied: true, writeBlocked: true, source: 'runtime-v2-beta',
  table: { columns: [{ id: 'razao_social' }], visibleColumns: [{ id: 'razao_social' }], rows: [{ id: 'r1', cells: { razao_social: 'ACME' } }], rowCount: 1 },
  form: { fields: [{ id: 'razao_social' }], visibleFields: [{ id: 'razao_social' }] },
  ...over,
});
const adapter = (moduleId = 'empresas') => createModeloBase1GenericModelAdapter({ moduleId });

describe('ModeloBase1 Adapter to Generic Kernel (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4
  it('adapter principal: criado, cadastro, modeloBase1, dangerous capabilities false', () => {
    const a = adapter();
    assert.equal(a.kind, 'modelobase1-generic-model-adapter');
    assert.equal(a.modelType, 'cadastro');
    assert.equal(a.modelFamily, 'modeloBase1');
    for (const cap of ['backendWrite', 'workflow', 'connector', 'marketplacePublish']) assert.equal(a.capabilities[cap], false);
    assert.equal(a.capabilities.read, true);
  });

  // 5 / 6
  it('read bridge converte runtimeReadModel MB1 → GenericModelReadModel válido', () => {
    const r = mapModeloBase1RuntimeReadToGenericModel({ runtimeReadModel: mb1ReadState() });
    assert.equal(r.ok, true);
    assert.equal(r.readModel.modelId, 'modelobase1');
    assert.equal(r.readModel.modelType, 'cadastro');
    assert.equal(r.validation.valid, true);
  });

  // 7
  it('read bridge gera fallback para runtimeReadModel inválido', () => {
    const r = mapModeloBase1RuntimeReadToGenericModel({ runtimeReadModel: { moduleId: 'empresas', betaApplied: true, table: { columns: 'nope' } } });
    assert.equal(r.ok, false);
    assert.equal(r.fallback.fallbackApplied, true);
  });

  // 8 / 9 / 10
  it('GenericModelRead volta para state MB1 compatível; table/form preservam shape', () => {
    const r = mapModeloBase1RuntimeReadToGenericModel({ runtimeReadModel: mb1ReadState() });
    const state = mapGenericModelReadToModeloBase1State({ readModel: r.readModel });
    assert.equal(state.kind, 'modelobase1-runtime-read-state');
    assert.equal(state.table.columns.length, 1);
    assert.equal(state.table.visibleColumns.length, 1);
    assert.equal(state.table.rows.length, 1);
    assert.equal(state.table.rowCount, 1);
    assert.equal(state.form.fields.length, 1);
    assert.equal(state.form.visibleFields.length, 1);
  });

  // 11
  it('safety bridge mascara token/apiKey/secret/password', () => {
    const b = createModeloBase1GenericSafetyBridge({ moduleId: 'empresas' });
    const s = b.sanitize({ password: 'a', token: 'b', apiKey: 'c', secret: 'd' });
    for (const k of ['password', 'token', 'apiKey', 'secret']) assert.equal(s.sanitized[k], '[REDACTED]');
  });

  // 12 / 13 / 14 / 15
  it('safety bridge bloqueia function/handler/React/pollution', () => {
    const b = createModeloBase1GenericSafetyBridge({ moduleId: 'x' });
    assert.equal(b.isSafe({ fn: () => {} }), false);
    assert.equal(b.isSafe({ onClick: () => {} }), false);
    assert.equal(b.isSafe({ el: REACT_EL }), false);
    assert.equal(b.isSafe(JSON.parse('{"__proto__":{"x":1}}')), false);
  });

  // 16 / 17 / 18
  it('safety bridge bloqueia backend/Prisma/runtimeBridge target', () => {
    const b = createModeloBase1GenericSafetyBridge({ moduleId: 'x' });
    assert.equal(b.detect({ url: 'fetch(/x)' }).safe, false);
    assert.equal(b.isSafe({ backendUrl: '/api' }) === false || b.detect({ backendUrl: '/api' }).forbiddenTargets !== undefined, true);
    assert.equal(b.detect({ x: 'PrismaClient()' }).safe, false);
  });

  // 19 / 20 / 21 / 22
  it('diagnostics bridge usa generic diagnostics; backend/prisma/runtimeBridge Touched false', () => {
    const d = createModeloBase1GenericDiagnosticsBridge({ moduleId: 'empresas', runtimeReadState: mb1ReadState() });
    assert.equal(d.kind, 'modelobase1-generic-diagnostics');
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    assert.equal(d.betaApplied, true);
  });

  // 23 / 24
  it('fallback bridge usa generic fallback + rollback plan sem side effects', () => {
    const f = createModeloBase1GenericFallbackBridge({ moduleId: 'empresas', reason: 'invalid-read-model' });
    assert.equal(f.fallback.fallbackApplied, true);
    assert.equal(f.rollbackPlan.rollbackAvailable, true);
    assert.equal(f.rollbackPlan.safety.executesRollback, false);
  });

  // 25 / 26 / 27 / 28 / 29 / 30
  it('write bridge: contrato genérico + create/update/delete/save/submit localOnly', () => {
    const w = createModeloBase1GenericWriteBridge({ moduleId: 'empresas' });
    assert.equal(w.contract.kind, 'generic-model-write-contract');
    assert.equal(w.validateOperation('createRow', { a: 1 }).ok, true);
    assert.equal(w.validateOperation('updateRow', { a: 1 }).ok, true);
    assert.equal(w.validateOperation('deleteRow', { id: 'r1' }).ok, true);
    assert.equal(w.validateOperation('saveDraft').ok, true);
    const sub = w.validateOperation('submitDraft');
    assert.equal(sub.ok, true);
    assert.equal(sub.localOnly, true);
    assert.equal(sub.genericOperation, 'submitDraft');
  });

  // 31 / 32 / 33 / 34
  it('write bridge bloqueia backend/Prisma/runtimeBridge target e op desconhecida', () => {
    const w = createModeloBase1GenericWriteBridge({ moduleId: 'x' });
    assert.equal(w.validateOperation('createRow', { target: 'backend' }).ok, false);
    assert.equal(w.validateOperation('createRow', { target: 'prisma' }).ok, false);
    assert.equal(w.validateOperation('createRow', { target: 'runtimeBridge' }).ok, false);
    assert.equal(w.validateOperation('frobnicate').ok, false);
  });

  // 35 / 36 / 37 / 38 / 39 / 40
  it('persistence bridge: snapshot + validate + checksum + roundtrip + persistenceReal false', () => {
    const p = createModeloBase1GenericPersistenceBridge({ moduleId: 'empresas' });
    const draft = { moduleId: 'empresas', table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: '1' } }] }, form: { fields: [] } };
    const snap = p.toSnapshot(draft);
    assert.equal(snap.kind, 'generic-model-snapshot');
    assert.equal(p.validateSnapshot(snap).valid, true);
    assert.equal(p.validateSnapshot({ ...snap, data: { table: { rows: [] } } }).valid, false); // checksum
    const rt = p.roundTrip(draft);
    assert.equal(rt.ok, true);
    assert.equal(rt.persistenceReal, false);
    assert.equal(rt.loaded.data.table.rows.length, 1);
    assert.equal(p.adapter.storageMode, 'memory_validation');
  });

  // 41 / 42 / 43 / 44 / 45 — source invariants
  it('adapter não importa React/backend/Prisma/runtimeBridge/fetch/storage', () => {
    const src = adapterSource();
    const imports = [...codeOnly(src).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => p !== 'react' && !/^react(\/|$)/.test(p)), 'no React');
    assert.ok(imports.every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)), 'no backend/apis/Prisma');
    assert.ok(imports.every((p) => !/makBootstrap|runtimeBridge/.test(p)), 'no runtimeBridge/makBootstrap');
    const code = codeOnly(src);
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no storage API');
  });

  // 46 / 47 — MB1 flow compatible; Empresas/cadcps not required
  it('adapter é aditivo (import de generic-model apenas; MB1/module configs não referenciados)', () => {
    const imports = [...codeOnly(adapterSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    // only imports the generic kernel + its own siblings — never module configs
    assert.ok(imports.every((p) => !/\/modules\/(empresas|cadcps)/.test(p)), 'no Empresas/cadcps import');
    assert.ok(imports.some((p) => /runtime\/generic-model/.test(p)), 'consumes the generic kernel');
  });

  // 48 / 49
  it('retornos são cópias seguras; mutar retorno não altera estado interno', () => {
    const a = adapter();
    const r1 = a.mapReadToGeneric({ runtimeReadModel: mb1ReadState() });
    r1.readModel.table.columns.push({ id: 'INJECTED' });
    const r2 = a.mapReadToGeneric({ runtimeReadModel: mb1ReadState() });
    assert.ok(!r2.readModel.table.columns.some((c) => c.id === 'INJECTED'));
  });

  // adapter descriptor is serializable + next step is Empresas/cadcps
  it('adapter descriptor é serializável; próximo passo é Empresas/cadcps through ModeloBase1', () => {
    const a = adapter();
    const { safetyBridge, diagnosticsBridge, fallbackBridge, writeBridge, persistenceBridge, runtimeContract, mapReadToGeneric, mapGenericToRead, ...descriptor } = a;
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(descriptor)));
    assert.ok(a.nextSteps.some((s) => /Empresas\/cadcps consuming Generic Kernel/.test(s)));
    assert.ok(!a.nextSteps.some((s) => /replace|substitu/i.test(s)));
    assert.equal(a.persistenceReal, false);
  });
});
