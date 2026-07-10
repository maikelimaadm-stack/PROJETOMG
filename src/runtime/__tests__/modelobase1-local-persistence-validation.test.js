import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  resolveModeloBase1LocalPersistenceValidation,
  isModeloBase1LocalPersistenceValidationRequested,
  MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_FLAG,
  EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_FLAG,
  CADCPS_LOCAL_PERSISTENCE_VALIDATION_FLAG,
} from '../../ModeloBase1/runtime-read-model/local-write/persistence/modeloBase1LocalPersistenceConfig.js';
import {
  createModeloBase1LocalPersistenceContract,
  LOCAL_PERSISTENCE_ALLOWED_OPERATIONS,
  LOCAL_PERSISTENCE_BLOCKED_OPERATIONS,
  LOCAL_PERSISTENCE_STORAGE_MODES,
} from '../../ModeloBase1/runtime-read-model/local-write/persistence/createModeloBase1LocalPersistenceContract.js';
import { createModeloBase1LocalPersistenceAdapter } from '../../ModeloBase1/runtime-read-model/local-write/persistence/createModeloBase1LocalPersistenceAdapter.js';
import { serializeModeloBase1LocalDraft } from '../../ModeloBase1/runtime-read-model/local-write/persistence/serializeModeloBase1LocalDraft.js';
import { rehydrateModeloBase1LocalDraft } from '../../ModeloBase1/runtime-read-model/local-write/persistence/rehydrateModeloBase1LocalDraft.js';
import { validateModeloBase1LocalDraftSnapshot } from '../../ModeloBase1/runtime-read-model/local-write/persistence/validateModeloBase1LocalDraftSnapshot.js';
import { createModeloBase1LocalDraftVersion } from '../../ModeloBase1/runtime-read-model/local-write/persistence/createModeloBase1LocalDraftVersion.js';
import { createModeloBase1LocalPersistenceDiagnostics } from '../../ModeloBase1/runtime-read-model/local-write/persistence/modeloBase1LocalPersistenceDiagnostics.js';
import { ModeloBase1LocalPersistenceError } from '../../ModeloBase1/runtime-read-model/local-write/persistence/errors.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const P_DIR = path.join(HERE, '../../ModeloBase1/runtime-read-model/local-write/persistence');
const P_FILES = [
  'errors.js', 'modeloBase1LocalPersistenceConfig.js', 'createModeloBase1LocalPersistenceContract.js',
  'createModeloBase1LocalPersistenceAdapter.js', 'serializeModeloBase1LocalDraft.js', 'rehydrateModeloBase1LocalDraft.js',
  'validateModeloBase1LocalDraftSnapshot.js', 'createModeloBase1LocalDraftVersion.js', 'modeloBase1LocalPersistenceDiagnostics.js',
];
const C_FILES = ['components/ModeloBase1LocalPersistencePanel.jsx', 'components/ModeloBase1LocalPersistenceBadge.jsx'];
const pSource = () => P_FILES.map((f) => fs.readFileSync(path.join(P_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(P_DIR, f), 'utf8')).join('\n');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const pageSource = () => fs.readFileSync(path.join(HERE, '../../ModeloBase1/render/ModeloBase1CadastroPage.jsx'), 'utf8');

const beta = (moduleId = 'empresas') => ({ moduleId, betaApplied: true });
const FULL = (moduleId) => ({
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_BETA`]: 'true',
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_LOCAL_WRITE_PLAN`]: 'true',
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_LOCAL_WRITE_ACTIVATION`]: 'true',
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_LOCAL_PERSISTENCE_VALIDATION`]: 'true',
});
const draftFor = (moduleId = 'empresas') => ({ kind: 'modelobase1-local-draft', moduleId, table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: 'ACME' } }], rowCount: 1 }, form: { fields: [{ id: 'a' }] } });
const snapFor = (moduleId = 'empresas') => serializeModeloBase1LocalDraft({ moduleId, localDraft: draftFor(moduleId) });

describe('ModeloBase1 Local Persistence Validation (post-Foundation C)', () => {
  // 1
  it('flags desligadas por padrão', () => {
    assert.equal(isModeloBase1LocalPersistenceValidationRequested('empresas', {}), false);
    assert.equal(resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: beta(), env: {} }).enabled, false);
  });

  // 2
  it('validation só liga com beta + plan + activation + validation flag', () => {
    const onlyVal = { MAK_MODELOBASE1_EMPRESAS_LOCAL_PERSISTENCE_VALIDATION: 'true' };
    assert.equal(resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: beta(), env: onlyVal }).enabled, false);
    assert.equal(resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: beta(), env: FULL('empresas') }).enabled, true);
    assert.equal(resolveModeloBase1LocalPersistenceValidation({ moduleId: 'empresas', readState: { moduleId: 'empresas', betaApplied: false }, env: FULL('empresas') }).enabled, false);
  });

  // 3 / 4
  it('Empresas e cadcps ligam com flag específica ou umbrella', () => {
    assert.equal(isModeloBase1LocalPersistenceValidationRequested('empresas', { [EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1LocalPersistenceValidationRequested('empresas', { [MODELOBASE1_LOCAL_PERSISTENCE_VALIDATION_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1LocalPersistenceValidationRequested('cadcps', { [CADCPS_LOCAL_PERSISTENCE_VALIDATION_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1LocalPersistenceValidationRequested('cadcps', { [EMPRESAS_LOCAL_PERSISTENCE_VALIDATION_FLAG]: 'true' }), false);
  });

  // 5
  it('contract contém allowedOperations de validação local', () => {
    const c = createModeloBase1LocalPersistenceContract({ moduleId: 'empresas', enabled: true });
    for (const op of ['serializeDraft', 'validateSnapshot', 'rehydrateDraft', 'compareDraftVersion', 'clearDraftSnapshot', 'inspectPersistenceDiagnostics', 'reportReadiness']) {
      assert.ok(c.allowedOperations.includes(op));
    }
    assert.equal(c.mode, 'local_persistence_validation');
  });

  // 6 / 7 / 8 / 9 / 10
  it('contract bloqueia backend/Prisma/fetch/storage-automático/runtimeBridge/global', () => {
    const c = createModeloBase1LocalPersistenceContract({ moduleId: 'empresas', enabled: true });
    for (const op of ['backendPersist', 'backendCreate', 'backendUpdate', 'backendDelete', 'prismaPersist', 'prismaCreate', 'fetchWrite', 'persistStorageAutomatically', 'mutateRuntimeBridge', 'mutateGlobalRuntime']) {
      assert.ok(c.blockedOperations.includes(op));
    }
    assert.equal(c.safety.persistenceReal, false);
    assert.ok(LOCAL_PERSISTENCE_STORAGE_MODES.includes(c.storageMode));
  });

  // 11 / 12 / 13 / 14 / 15 / 16
  it('adapter in-memory: save/load/list/delete/clear localOnly', () => {
    const ad = createModeloBase1LocalPersistenceAdapter();
    assert.equal(ad.kind, 'modelobase1-local-persistence-adapter');
    const snap = snapFor('empresas');
    assert.equal(ad.saveSnapshot(snap).ok, true);
    assert.equal(ad.loadSnapshot(snap.snapshotId).ok, true);
    assert.equal(ad.listSnapshots('empresas').snapshotCount, 1);
    assert.equal(ad.deleteSnapshot(snap.snapshotId).ok, true);
    ad.saveSnapshot(snap);
    assert.equal(ad.clearModuleSnapshots('empresas').snapshotCount, 0);
  });

  // 17 / 18 / 19
  it('adapter não toca backend/Prisma/runtimeBridge; persistenceReal false', () => {
    const ad = createModeloBase1LocalPersistenceAdapter();
    for (const res of [ad.saveSnapshot(snapFor()), ad.getDiagnostics(), ad.listSnapshots('empresas')]) {
      assert.equal(res.backendTouched, false);
      assert.equal(res.prismaTouched, false);
      assert.equal(res.runtimeBridgeTouched, false);
      assert.equal(res.persistenceReal, false);
      assert.equal(res.localOnly, true);
    }
  });

  // 20 / 25 / 26 / 27
  it('serialization gera snapshot plano com version/schemaVersion/localOnly/persistenceReal', () => {
    const snap = snapFor('empresas');
    assert.equal(snap.kind, 'modelobase1-local-draft-snapshot');
    assert.equal(typeof snap.version, 'string');
    assert.equal(snap.schemaVersion, 1);
    assert.equal(snap.localOnly, true);
    assert.equal(snap.persistenceReal, false);
    assert.equal(snap.source, 'modeloBase1-local-write');
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(snap)));
  });

  // 21 / 22
  it('serialization remove função/handler e rejeita React element', () => {
    assert.throws(() => serializeModeloBase1LocalDraft({ moduleId: 'empresas', localRows: [{ id: 'r', cells: { fn: () => {} } }] }), ModeloBase1LocalPersistenceError);
    assert.throws(() => serializeModeloBase1LocalDraft({ moduleId: 'empresas', localRows: [{ id: 'r', cells: { el: { $$typeof: Symbol.for('react.element') } } }] }), ModeloBase1LocalPersistenceError);
  });

  // 23
  it('serialization mascara dados sensíveis', () => {
    const snap = serializeModeloBase1LocalDraft({ moduleId: 'empresas', localRows: [{ id: 'r', cells: { password: 'secret123' } }] });
    assert.equal(snap.rows[0].cells.password, '[REDACTED]');
    assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: snap }).valid, true);
  });

  // 24
  it('serialization bloqueia prototype pollution', () => {
    assert.throws(() => serializeModeloBase1LocalDraft({ moduleId: 'empresas', localRows: JSON.parse('[{"__proto__":{"x":1}}]') }), ModeloBase1LocalPersistenceError);
  });

  // 28
  it('snapshot validation passa para snapshot seguro', () => {
    assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: snapFor('empresas'), moduleId: 'empresas' }).valid, true);
  });

  // 29
  it('snapshot validation falha para moduleId errado', () => {
    assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: snapFor('empresas'), moduleId: 'cadcps' }).valid, false);
  });

  // 30 / 31 / 32
  it('snapshot validation falha para backend/prisma/runtimeBridge target', () => {
    const snap = snapFor('empresas');
    for (const key of ['backendUrl', 'prismaModel', 'runtimeBridgeRef']) {
      assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: { ...snap, [key]: 'x' } }).valid, false);
    }
  });

  // 33 / 34
  it('snapshot validation falha para função/handler e prototype pollution', () => {
    const snap = snapFor('empresas');
    assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: { ...snap, rows: [{ id: 'r', cells: { fn: () => {} } }] } }).valid, false);
    assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: JSON.parse('{"moduleId":"empresas","snapshotId":"x","version":"v","schemaVersion":1,"source":"modeloBase1-local-write","localOnly":true,"persistenceReal":false,"rows":[],"__proto__":{"y":1}}') }).valid, false);
  });

  // 35 / 36
  it('rehydrate retorna draft seguro e não muta o snapshot original', () => {
    const snap = snapFor('empresas');
    const before = JSON.stringify(snap);
    const re = rehydrateModeloBase1LocalDraft({ snapshot: snap, moduleId: 'empresas' });
    assert.equal(re.ok, true);
    assert.equal(re.rows.length, 1);
    assert.equal(JSON.stringify(snap), before); // snapshot untouched
    re.rows.push({ id: 'x' });
    assert.equal(rehydrateModeloBase1LocalDraft({ snapshot: snap }).rows.length, 1); // internal state safe
  });

  // 37 / 38
  it('rehydrate falha para snapshot inválido / checksum inválido', () => {
    assert.equal(rehydrateModeloBase1LocalDraft({ snapshot: null }).ok, false);
    const snap = snapFor('empresas');
    const tampered = { ...snap, rows: [...snap.rows, { id: 'injected', cells: {} }] };
    assert.equal(rehydrateModeloBase1LocalDraft({ snapshot: tampered }).ok, false);
  });

  // 39
  it('versionamento é determinístico', () => {
    const a = createModeloBase1LocalDraftVersion({ moduleId: 'empresas', draftVersion: 2 });
    const b = createModeloBase1LocalDraftVersion({ moduleId: 'empresas', draftVersion: 2 });
    assert.deepEqual(a, b);
    assert.equal(a.versionId, 'v-empresas-1-2');
    assert.equal(a.createdAt, '1970-01-01T00:00:00.000Z'); // no Date.now
  });

  // 40
  it('rollback/fallback continua disponível (contract)', () => {
    const c = createModeloBase1LocalPersistenceContract({ moduleId: 'empresas', enabled: true });
    assert.equal(c.fallback.available, true);
    assert.equal(c.rollback.available, true);
  });

  // 41 / 42 / 43
  it('Empresas e cadcps usam o contrato base (sem arquitetura separada)', () => {
    const emp = createModeloBase1LocalPersistenceContract({ moduleId: 'empresas', enabled: true });
    const cps = createModeloBase1LocalPersistenceContract({ moduleId: 'cadcps', enabled: true });
    assert.equal(emp.mode, cps.mode);
    assert.deepEqual(emp.allowedOperations, cps.allowedOperations);
    assert.notEqual(emp.moduleId, cps.moduleId);
    assert.equal(validateModeloBase1LocalDraftSnapshot({ snapshot: snapFor('cadcps'), moduleId: 'cadcps' }).valid, true);
  });

  // 44
  it('genericModelReady é documentado (contract + diagnostics)', () => {
    const c = createModeloBase1LocalPersistenceContract({ moduleId: 'empresas', enabled: true });
    assert.equal(c.genericModelReady.ready, true);
    assert.ok(Array.isArray(c.genericModelReady.generic) && c.genericModelReady.generic.length > 0);
    assert.ok(Array.isArray(c.genericModelReady.modeloBase1Bound));
    assert.equal(c.genericModelReady.recommendation, 'Generic Model Runtime Extraction Audit');
    const d = createModeloBase1LocalPersistenceDiagnostics({ moduleId: 'empresas', enabled: true, genericModelReady: true });
    assert.equal(d.genericModelReady, true);
  });

  // 45 / 46 / 47 / 48 — source invariants
  it('módulo não chama backend/fetch/Prisma/MMM/runtimeBridge/storage', () => {
    const code = codeOnly(pSource() + '\n' + cSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|axios/.test(code), 'no fetch/XHR/WebSocket');
    assert.ok(!/PrismaClient|from\s+['"].*prisma.*['"]|\bMMM\b/i.test(code), 'no Prisma/MMM');
    assert.ok(!/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(pSource() + cSource()), 'no backend/apis import');
    assert.ok(!/makBootstrap|\/runtimeBridge\//.test(code), 'no runtimeBridge/makBootstrap');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no web storage API calls');
    // call patterns only — the contract legitimately NAMES these as blocked ops
    assert.ok(!/\b(executeAction|startWorkflow|invokeConnector)\s*\(/.test(code), 'no action/workflow/connector calls');
  });

  // decoupled from src/runtime + no CSS
  it('módulo desacoplado de src/runtime e sem CSS global', () => {
    const imports = [...codeOnly(pSource() + '\n' + cSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p)), 'does not import src/runtime');
    assert.ok(!/import\s+['"][^'"]+\.css['"]/i.test(pSource() + cSource()), 'no CSS import');
  });

  // next step is Generic Model Runtime Extraction Audit
  it('próximo passo é Generic Model Runtime Extraction Audit (não backend write)', () => {
    const d = createModeloBase1LocalPersistenceDiagnostics({ moduleId: 'empresas', enabled: true });
    assert.equal(d.nextAllowedStep, 'Generic Model Runtime Extraction Audit');
    assert.ok(!/backend/i.test(d.nextAllowedStep));
  });

  // page wiring
  it('página consome o contract/diagnostics de persistência + painel (dev-only, sem auto-save)', () => {
    const page = pageSource();
    assert.ok(/resolveModeloBase1LocalPersistenceValidation/.test(page), 'page resolves validation');
    assert.ok(/ModeloBase1LocalPersistencePanel/.test(page), 'page renders the persistence panel');
    assert.ok(!/saveSnapshot\(|loadSnapshot\(/.test(page), 'page never auto-saves/restores');
  });

  // ALLOWED/BLOCKED sanity
  it('contract expõe contagem coerente de operações', () => {
    assert.ok(LOCAL_PERSISTENCE_ALLOWED_OPERATIONS.length >= 7);
    assert.ok(LOCAL_PERSISTENCE_BLOCKED_OPERATIONS.length >= 15);
  });
});
