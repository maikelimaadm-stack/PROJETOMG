import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createModeloBase2PrototypeAdapter } from '../../ModeloBase2/prototype-adapter/createModeloBase2PrototypeAdapter.js';
import { createModeloBase2OperationalReadModel } from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalReadModel.js';
import { createModeloBase2OperationalWriteContract } from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalWriteContract.js';
import { createModeloBase2OperationalEventContract } from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalEventContract.js';
import { createModeloBase2OperationalDraft } from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalDraft.js';
import { applyModeloBase2OperationalMutation } from '../../ModeloBase2/prototype-adapter/applyModeloBase2OperationalMutation.js';
import {
  createModeloBase2OperationalSnapshot,
  validateModeloBase2OperationalSnapshot,
  roundTripModeloBase2OperationalSnapshot,
} from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalSnapshot.js';
import { createModeloBase2OperationalDiagnostics } from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalDiagnostics.js';
import { createModeloBase2OperationalFallback } from '../../ModeloBase2/prototype-adapter/createModeloBase2OperationalFallback.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MB2_DIR = path.join(HERE, '../../ModeloBase2/prototype-adapter');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
});
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const mb2Source = () => walk(MB2_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const mb2Imports = () => [...codeOnly(mb2Source()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const REACT_EL = { $$typeof: Symbol.for('react.element') };

const adapter = (moduleId = 'combustivel-lancamento') => createModeloBase2PrototypeAdapter({ moduleId });

describe('ModeloBase2 Prototype Adapter (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4
  it('adapter é criado; modelFamily modeloBase2; modelType operacional; dangerous false', () => {
    const a = adapter();
    assert.equal(a.kind, 'modelobase2-prototype-adapter');
    assert.equal(a.modelFamily, 'modeloBase2');
    assert.equal(a.modelType, 'operacional');
    for (const c of ['backendWrite', 'workflow', 'connector', 'marketplacePublish']) assert.equal(a.capabilities[c], false);
    assert.equal(a.capabilities.read, true);
  });

  // 5 / 6 / 7
  it('usa runtime/read/write contracts genéricos', () => {
    const a = adapter();
    assert.equal(a.runtimeContract.kind, 'generic-model-runtime-contract');
    assert.equal(a.readContract.kind, 'generic-model-read-contract');
    assert.equal(a.writeContract.genericContract.kind, 'generic-model-write-contract');
  });

  // 8 / 9 / 10 / 11
  it('read model operacional: entries + summary + timeline; validável pelo GenericModelReadModel', () => {
    const r = createModeloBase2OperationalReadModel({ moduleId: 'x', entries: [{ entryId: 'e1', status: 'pending', timestamp: '2025-01-01T00:00:00.000Z' }], events: [{ eventId: 'ev1', sequence: 1 }] });
    assert.equal(r.readModel.summary.totalEntries, 1);
    assert.equal(r.readModel.summary.pendingEntries, 1);
    assert.equal(r.readModel.timeline.sequence, 1);
    assert.equal(r.readModel.timeline.lastEventId, 'ev1');
    assert.equal(r.ok, true);
    assert.equal(r.validation.valid, true);
  });

  // 12 / 13
  it('draft operacional é localOnly e começa sent:false', () => {
    const d = createModeloBase2OperationalDraft({ moduleId: 'x' });
    assert.equal(d.kind, 'modelobase2-operational-draft');
    assert.equal(d.localOnly, true);
    assert.equal(d.sent, false);
    assert.equal(d.persistenceReal, false);
    assert.equal(d.status, 'draft');
  });

  // 14 / 15 / 16
  it('event contract cria evento localOnly, sequence determinística e checksum', () => {
    const ec = createModeloBase2OperationalEventContract({ moduleId: 'x' });
    const e1 = ec.createEvent({ eventType: 'draft.created', payload: { a: 1 } });
    const e2 = ec.createEvent({ eventType: 'entry.added', payload: { b: 2 } });
    assert.equal(e1.localOnly, true);
    assert.equal(e1.sent, false);
    assert.equal(e1.sequence, 1);
    assert.equal(e2.sequence, 2);
    assert.match(e1.checksum, /^fnv1a-/);
    // deterministic: same seed + same input → same checksum
    const ec2 = createModeloBase2OperationalEventContract({ moduleId: 'x' });
    assert.equal(ec2.createEvent({ eventType: 'draft.created', payload: { a: 1 } }).checksum, e1.checksum);
  });

  // 17 / 18 / 19 / 20 / 21 / 22
  it('mutations produzem os eventos corretos; submitDraft mantém sent:false', () => {
    const a = adapter();
    let r = a.applyMutation({ operation: 'createDraft', payload: { operationType: 'combustivel' } });
    assert.equal(r.event.eventType, 'draft.created');
    r = a.applyMutation({ operation: 'appendEntry', draft: r.draft, payload: { values: { litros: 100 } } });
    assert.equal(r.event.eventType, 'entry.added');
    assert.equal(r.draft.entries.length, 1);
    const entryId = r.draft.entries[0].entryId;
    r = a.applyMutation({ operation: 'updateEntry', draft: r.draft, payload: { entryId, values: { litros: 120 } } });
    assert.equal(r.event.eventType, 'entry.updated');
    r = a.applyMutation({ operation: 'removeEntry', draft: r.draft, payload: { entryId } });
    assert.equal(r.event.eventType, 'entry.removed');
    assert.equal(r.draft.entries.length, 0);
    r = a.applyMutation({ operation: 'saveDraft', draft: r.draft });
    assert.equal(r.event.eventType, 'draft.saved');
    r = a.applyMutation({ operation: 'submitDraft', draft: r.draft });
    assert.equal(r.event.eventType, 'draft.submitted.simulated');
    assert.equal(r.draft.status, 'submitted_simulated');
    assert.equal(r.sent, false);
  });

  // 23
  it('resetDraft restaura o draft local (entries vazias, status reset)', () => {
    const a = adapter();
    let r = a.applyMutation({ operation: 'createDraft', payload: {} });
    r = a.applyMutation({ operation: 'appendEntry', draft: r.draft, payload: { values: { x: 1 } } });
    r = a.applyMutation({ operation: 'resetDraft', draft: r.draft });
    assert.equal(r.event.eventType, 'draft.reset');
    assert.equal(r.draft.entries.length, 0);
    assert.equal(r.draft.status, 'reset');
  });

  // 24 / 25
  it('mutation não muta entrada; mutar retorno não altera estado interno', () => {
    const a = adapter();
    const base = a.applyMutation({ operation: 'createDraft', payload: {} }).draft;
    const before = JSON.stringify(base);
    const r = a.applyMutation({ operation: 'appendEntry', draft: base, payload: { values: { x: 1 } } });
    assert.equal(JSON.stringify(base), before, 'input draft not mutated');
    r.draft.entries.push({ entryId: 'INJECTED' });
    const r2 = a.applyMutation({ operation: 'appendEntry', draft: base, payload: { values: { x: 2 } } });
    assert.ok(!r2.draft.entries.some((e) => e.entryId === 'INJECTED'));
  });

  // 26 / 27 / 28 / 29
  it('payload com function/handler/React/pollution é bloqueado (fail-closed)', () => {
    const a = adapter();
    const d = a.applyMutation({ operation: 'createDraft', payload: {} }).draft;
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: { fn: () => {} } }).ok, false);
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: { onClick: () => {} } }).ok, false);
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: { el: REACT_EL } }).ok, false);
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: JSON.parse('{"__proto__":{"z":1}}') }).ok, false);
  });

  // 30 / 31 / 32 / 33
  it('backend/Prisma/runtimeBridge target bloqueado; operação desconhecida fail-closed', () => {
    const a = adapter();
    const d = a.applyMutation({ operation: 'createDraft', payload: {} }).draft;
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: { target: 'backend', values: {} } }).ok, false);
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: { target: 'prisma', values: {} } }).ok, false);
    assert.equal(a.applyMutation({ operation: 'appendEntry', draft: d, payload: { target: 'runtimeBridge', values: {} } }).ok, false);
    assert.equal(a.applyMutation({ operation: 'frobnicate', draft: d }).ok, false);
  });

  // write contract blocks the operational blocked operations
  it('write contract bloqueia operações blocked (backendCommit etc.) e mapeia allowed', () => {
    const w = createModeloBase2OperationalWriteContract({ moduleId: 'x' });
    assert.equal(w.validateOperation('appendLocalEvent', { a: 1 }).ok, true);
    assert.equal(w.validateOperation('appendLocalEvent', { a: 1 }).genericOperation, 'create');
    assert.equal(w.validateOperation('backendCommit', { a: 1 }).ok, false);
    assert.equal(w.validateOperation('startWorkflow', { a: 1 }).ok, false);
  });

  // 34 / 35 / 36 / 37 / 38 / 39 / 40 / 41
  it('snapshot operacional: cria, valida, checksum inválido falha, roundtrip; invariantes seguros', () => {
    const a = adapter();
    let r = a.applyMutation({ operation: 'createDraft', payload: {} });
    r = a.applyMutation({ operation: 'appendEntry', draft: r.draft, payload: { values: { litros: 50 } } });
    const snap = createModeloBase2OperationalSnapshot({ draft: r.draft });
    assert.equal(snap.kind, 'generic-model-snapshot');
    assert.equal(snap.modelType, 'operacional');
    assert.equal(snap.persistenceReal, false);
    assert.equal(validateModeloBase2OperationalSnapshot({ snapshot: snap }).valid, true);
    assert.equal(validateModeloBase2OperationalSnapshot({ snapshot: { ...snap, data: { tampered: true } } }).valid, false);
    const rt = roundTripModeloBase2OperationalSnapshot({ draft: r.draft });
    assert.equal(rt.ok, true);
    assert.equal(rt.persistenceReal, false);
    assert.equal(rt.backendTouched, false);
    assert.equal(rt.storageMode, 'memory_validation');
    assert.equal(rt.loaded.data.entries.length, 1);
  });

  // 42 / 43
  it('fallback gerado para payload inválido; rollback plan gerado, não executado', () => {
    const f = createModeloBase2OperationalFallback({ moduleId: 'x', reason: 'invalid-payload' });
    assert.equal(f.fallback.fallbackApplied, true);
    assert.equal(f.rollbackPlan.rollbackAvailable, true);
    assert.equal(f.rollbackPlan.safety.executesRollback, false);
  });

  // diagnostics
  it('diagnostics: modelFamily/operacional; localOnly/sent/persistenceReal/touched seguros', () => {
    const a = adapter();
    const r = a.applyMutation({ operation: 'createDraft', payload: {} });
    const d = createModeloBase2OperationalDiagnostics({ moduleId: 'x', draft: r.draft });
    assert.equal(d.kind, 'modelobase2-operational-diagnostics');
    assert.equal(d.modelFamily, 'modeloBase2');
    assert.equal(d.localOnly, true);
    assert.equal(d.sent, false);
    assert.equal(d.persistenceReal, false);
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    for (const c of ['backendWrite', 'workflow', 'connector', 'marketplacePublish']) assert.equal(d.dangerousCapabilities[c], false);
  });

  // 38/39/40/41 reinforced on the mutation envelope
  it('mutation envelope: persistenceReal/backendTouched/prismaTouched/runtimeBridgeTouched false', () => {
    const a = adapter();
    const r = a.applyMutation({ operation: 'createDraft', payload: {} });
    assert.equal(r.persistenceReal, false);
    assert.equal(r.backendTouched, false);
    assert.equal(r.prismaTouched, false);
    assert.equal(r.runtimeBridgeTouched, false);
    assert.equal(r.localOnly, true);
    assert.equal(r.sent, false);
  });

  // 44 — no React
  it('ModeloBase2 não importa React', () => {
    assert.ok(mb2Imports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
  });

  // 45 / 46 — no ModeloBase1 import; ModeloBase1 untouched (import-scan)
  it('ModeloBase2 não importa ModeloBase1 (não altera/consome MB1)', () => {
    assert.ok(mb2Imports().every((p) => !/ModeloBase1/.test(p)));
  });

  // 47 — no Empresas/cadcps import
  it('ModeloBase2 não importa Empresas/cadcps', () => {
    assert.ok(mb2Imports().every((p) => !/\/modules\/(empresas|cadcps)/.test(p)));
  });

  // 48 / 49 — no backend/API/Prisma; no runtimeBridge/makBootstrap
  it('ModeloBase2 não importa backend/API/Prisma nem runtimeBridge/makBootstrap', () => {
    assert.ok(mb2Imports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)), 'no backend/apis/Prisma');
    assert.ok(mb2Imports().every((p) => !/makBootstrap|runtimeBridge/.test(p)), 'no runtimeBridge/makBootstrap');
  });

  // 50 / 51 — no fetch/XHR/WebSocket; no storage API
  it('ModeloBase2 não usa fetch/XHR/WebSocket nem storage obrigatório', () => {
    const code = codeOnly(mb2Source());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no storage API');
  });

  // 52 — consumes the generic kernel (proves reuse, not a new stack)
  it('ModeloBase2 consome o generic model kernel', () => {
    assert.ok(mb2Imports().some((p) => /runtime\/generic-model/.test(p)));
  });

  // adapter descriptor serializable + next step = hardening / multi-type
  it('adapter descriptor serializável; próximo passo é hardening/multi-type, não backend write', () => {
    const a = adapter();
    const { runtimeContract, readContract, writeContract, eventContract, safetyPolicy, createReadModel, createDraft, applyMutation, createSnapshot, validateSnapshot, roundTrip, createDiagnostics, createFallback, ...descriptor } = a;
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(descriptor)));
    assert.ok(a.nextSteps.some((s) => /hardening|multi-type|operational runtime/i.test(s)));
    assert.ok(!a.nextSteps.some((s) => /backend\s*write/i.test(s)));
    assert.equal(a.persistenceReal, false);
    assert.equal(a.sent, false);
  });
});
