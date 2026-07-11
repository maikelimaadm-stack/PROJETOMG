import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createModeloBase2OperationalRuntime } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalRuntime.js';
import { createModeloBase2OperationalSession } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalSession.js';
import { createModeloBase2OperationalStateMachine } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalStateMachine.js';
import { resolveModeloBase2OperationalCommand } from '../../ModeloBase2/operational-runtime/resolveModeloBase2OperationalCommand.js';
import { validateModeloBase2OperationalCommandPayload } from '../../ModeloBase2/operational-runtime/validateModeloBase2OperationalCommandPayload.js';
import { createModeloBase2OperationalEventLog } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalEventLog.js';
import { createModeloBase2OperationalReadState } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalReadState.js';
import { createModeloBase2OperationalSnapshotBridge } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalSnapshotBridge.js';
import { createModeloBase2OperationalRuntimeFallback } from '../../ModeloBase2/operational-runtime/createModeloBase2OperationalRuntimeFallback.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OR_DIR = path.join(HERE, '../../ModeloBase2/operational-runtime');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
});
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const orSource = () => walk(OR_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const orImports = () => [...codeOnly(orSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const REACT_EL = { $$typeof: Symbol.for('react.element') };

const runtime = (moduleId = 'combustivel') => createModeloBase2OperationalRuntime({ moduleId });
const freshSession = (moduleId = 'combustivel') => createModeloBase2OperationalSession({ moduleId });
// Drive a session up to a submitted cycle.
function drive(s) {
  s.dispatch({ commandType: 'createDraft', payload: { operationType: 'combustivel' } });
  s.dispatch({ commandType: 'appendEntry', payload: { values: { litros: 100 } } });
  s.dispatch({ commandType: 'validateDraft' });
  s.dispatch({ commandType: 'saveDraft' });
  return s.dispatch({ commandType: 'submitDraft' });
}

describe('ModeloBase2 Operational Runtime Foundation (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4 / 5 / 6
  it('runtime criado; modeloBase2/operacional; dangerous false; generic contract; conformance operacional', () => {
    const r = runtime();
    assert.equal(r.kind, 'modelobase2-operational-runtime');
    assert.equal(r.modelFamily, 'modeloBase2');
    assert.equal(r.modelType, 'operacional');
    for (const c of ['backendWrite', 'workflow', 'connector', 'marketplacePublish']) assert.equal(r.capabilities[c], false);
    assert.equal(r.genericRuntimeContract.kind, 'generic-model-runtime-contract');
    assert.equal(r.conformance.valid, true);
  });

  // 7 / 8 / 9
  it('session criada localOnly; sent:false; persistenceReal:false', () => {
    const s = freshSession();
    assert.equal(s.kind, 'modelobase2-operational-session');
    assert.equal(s.localOnly, true);
    assert.equal(s.sent, false);
    assert.equal(s.persistenceReal, false);
    assert.equal(s.status, 'idle');
  });

  // 10
  it('state machine cria estados mínimos', () => {
    const sm = createModeloBase2OperationalStateMachine();
    for (const st of ['idle', 'draft', 'dirty', 'valid', 'invalid', 'saved_local', 'submitted_simulated', 'reset', 'blocked', 'fallback']) assert.ok(sm.states.includes(st), st);
  });

  // 11 / 12 / 13 / 14 / 15 / 16 / 17
  it('transições: idle→draft→dirty→valid/invalid→saved_local→submitted_simulated; any→reset', () => {
    const sm = createModeloBase2OperationalStateMachine();
    assert.equal(sm.transition('idle', { commandType: 'createDraft' }).nextState, 'draft');
    assert.equal(sm.transition('draft', { commandType: 'appendEntry' }).nextState, 'dirty');
    assert.equal(sm.transition('dirty', { commandType: 'validateDraft' }, { validationValid: true }).nextState, 'valid');
    assert.equal(sm.transition('dirty', { commandType: 'validateDraft' }, { validationValid: false }).nextState, 'invalid');
    assert.equal(sm.transition('valid', { commandType: 'saveDraft' }).nextState, 'saved_local');
    assert.equal(sm.transition('saved_local', { commandType: 'submitDraft' }).nextState, 'submitted_simulated');
    assert.equal(sm.transition('submitted_simulated', { commandType: 'resetDraft' }).nextState, 'reset');
  });

  // 18
  it('comando inválido vira blocked sem side effect', () => {
    const sm = createModeloBase2OperationalStateMachine();
    const t = sm.transition('draft', { commandType: 'frobnicate' });
    assert.equal(t.allowed, false);
    assert.equal(t.nextState, 'blocked');
  });

  // 19–26 command resolver
  it('command resolver resolve comandos conhecidos; snapshot/restore; desconhecido fecha', () => {
    for (const ct of ['createDraft', 'appendEntry', 'updateEntry', 'removeEntry', 'validateDraft', 'saveDraft', 'submitDraft', 'createSnapshot', 'restoreSnapshot']) {
      assert.equal(resolveModeloBase2OperationalCommand({ commandType: ct, moduleId: 'x' }).ok, true, ct);
    }
    assert.equal(resolveModeloBase2OperationalCommand({ commandType: 'frobnicate' }).ok, false);
  });

  // 27
  it('comando desconhecido falha fechado no apply', () => {
    const s = freshSession();
    assert.equal(s.dispatch({ commandType: 'frobnicate' }).ok, false);
  });

  // 28 / 29 / 30 / 31 / 32 / 33 / 34 / 35
  it('payload com function/handler/React/pollution/backend/prisma/runtimeBridge/fetch é bloqueado', () => {
    const bad = (payload) => validateModeloBase2OperationalCommandPayload({ commandType: 'appendEntry', payload, moduleId: 'x' }).valid;
    assert.equal(bad({ fn: () => {} }), false);
    assert.equal(bad({ onClick: () => {} }), false);
    assert.equal(bad({ el: REACT_EL }), false);
    assert.equal(bad(JSON.parse('{"__proto__":{"z":1}}')), false);
    assert.equal(bad({ target: 'backend', values: {} }), false);
    assert.equal(bad({ target: 'prisma', values: {} }), false);
    assert.equal(bad({ target: 'runtimeBridge', values: {} }), false);
    assert.equal(bad({ target: 'fetch', values: {} }), false);
  });

  // 36 / 37 / 38 event log
  it('event log: sequence crescente; cópias seguras; checksum muda quando evento muda', () => {
    const log = createModeloBase2OperationalEventLog({ moduleId: 'x' });
    const e1 = log.append({ eventType: 'draft.created', payload: { a: 1 } });
    const e2 = log.append({ eventType: 'entry.added', payload: { b: 2 } });
    assert.equal(e1.sequence, 1);
    assert.equal(e2.sequence, 2);
    e1.payload = { hacked: true };
    assert.notDeepEqual(log.getById(e1.eventId).payload, { hacked: true });
    const other = createModeloBase2OperationalEventLog({ moduleId: 'x' });
    const e3 = other.append({ eventType: 'draft.created', payload: { a: 2 } });
    assert.notEqual(e3.checksum, e1.checksum);
  });

  // 39 / 40 / 41 / 42 / 43 / 44 apply command events
  it('apply command produz eventos corretos; submitDraft mantém sent:false', () => {
    const s = freshSession();
    s.dispatch({ commandType: 'createDraft', payload: {} });
    assert.equal(s.dispatch({ commandType: 'appendEntry', payload: { values: { x: 1 } } }).event.eventType, 'entry.added');
    const id = s.getState().draft.entries[0].entryId;
    assert.equal(s.dispatch({ commandType: 'updateEntry', payload: { entryId: id, values: { x: 2 } } }).event.eventType, 'entry.updated');
    assert.equal(s.dispatch({ commandType: 'removeEntry', payload: { entryId: id } }).event.eventType, 'entry.removed');
    s.dispatch({ commandType: 'appendEntry', payload: { values: { y: 1 } } });
    s.dispatch({ commandType: 'validateDraft' });
    assert.equal(s.dispatch({ commandType: 'saveDraft' }).event.eventType, 'draft.saved');
    const sub = s.dispatch({ commandType: 'submitDraft' });
    assert.equal(sub.event.eventType, 'draft.submitted.simulated');
    assert.equal(sub.sent, false);
  });

  // 45 / 46 / 47 / 48 read state
  it('read state deriva entries/summary/timeline + table/form compatíveis', () => {
    const s = freshSession();
    s.dispatch({ commandType: 'createDraft', payload: {} });
    s.dispatch({ commandType: 'appendEntry', payload: { values: { litros: 10 } } });
    const rs = s.getReadState();
    assert.equal(rs.entries.length, 1);
    assert.equal(rs.summary.totalEntries, 1);
    assert.ok(rs.timeline.sequence >= 1);
    assert.ok(rs.table && Array.isArray(rs.table.columns));
    assert.ok(rs.form && Array.isArray(rs.form.fields));
  });

  // read state does not mutate draft/eventLog
  it('read state não muta draft/eventLog', () => {
    const s = freshSession();
    s.dispatch({ commandType: 'createDraft', payload: {} });
    s.dispatch({ commandType: 'appendEntry', payload: { values: { a: 1 } } });
    const before = s.getEventLog().length;
    const rs = createModeloBase2OperationalReadState({ moduleId: 'combustivel', draft: s.getState().draft, eventLog: s.getEventLog() });
    rs.readState.entries.push({ entryId: 'INJECTED' });
    assert.equal(s.getEventLog().length, before);
    assert.equal(s.getReadState().entries.length, 1);
  });

  // 49 / 50 / 51 / 52 / 53 / 54 snapshot bridge
  it('snapshot bridge: cria/valida/checksum inválido/restaura/roundtrip; restore não muta snapshot', () => {
    const s = freshSession();
    drive(s);
    const bridge = createModeloBase2OperationalSnapshotBridge({ moduleId: 'combustivel' });
    const snap = bridge.createSnapshotFromSession({ draft: s.getState().draft, eventLog: s.getEventLog() });
    assert.equal(snap.kind, 'generic-model-snapshot');
    assert.equal(bridge.validateSnapshot(snap).valid, true);
    assert.equal(bridge.validateSnapshot({ ...snap, data: { x: 1 } }).valid, false);
    const restore = bridge.restoreSessionFromSnapshot(snap);
    assert.equal(restore.ok, true);
    const frozen = JSON.stringify(snap);
    restore.session.entries.push({ entryId: 'INJECTED' });
    assert.equal(JSON.stringify(snap), frozen);
    const rt = bridge.roundtripSnapshot({ draft: s.getState().draft, eventLog: s.getEventLog() });
    assert.equal(rt.ok, true);
    assert.equal(rt.persistenceReal, false);
    assert.equal(rt.storageMode, 'memory_validation');
  });

  // 55 session reset
  it('session reset restaura estado seguro', () => {
    const s = freshSession();
    drive(s);
    const r = s.reset();
    assert.equal(r.ok, true);
    assert.equal(r.nextState, 'reset');
    assert.equal(r.draft.entries.length, 0);
    assert.equal(s.status, 'reset');
  });

  // 56 / 57 no mutation of input / return
  it('dispatch não muta comando de entrada; mutar retorno não altera estado interno', () => {
    const s = freshSession();
    s.dispatch({ commandType: 'createDraft', payload: {} });
    const cmd = { commandType: 'appendEntry', payload: { values: { a: 1 } } };
    const frozen = JSON.stringify(cmd);
    const r = s.dispatch(cmd);
    assert.equal(JSON.stringify(cmd), frozen, 'input command not mutated');
    r.draft.entries.push({ entryId: 'INJECTED' });
    assert.ok(!s.getState().draft.entries.some((e) => e.entryId === 'INJECTED'));
  });

  // 58 / 59 / 60 / 61 diagnostics invariants
  it('diagnostics: backend/prisma/runtimeBridge Touched false; persistenceReal false', () => {
    const s = freshSession();
    drive(s);
    const d = s.getDiagnostics();
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    assert.equal(d.persistenceReal, false);
    assert.equal(d.sent, false);
    assert.equal(d.readiness, 'ready');
  });

  // 62 / 63 fallback
  it('fallback gerado para command inválido; rollback plan gerado, não executado', () => {
    const f = createModeloBase2OperationalRuntimeFallback({ moduleId: 'x', reason: 'invalid-command' });
    assert.equal(f.fallback.fallbackApplied, true);
    assert.equal(f.rollbackPlan.rollbackAvailable, true);
    assert.equal(f.rollbackPlan.safety.executesRollback, false);
  });

  // 32/33/34/35 reinforced end-to-end: dangerous targets blocked in the session
  it('session bloqueia backend/prisma/runtimeBridge/fetch target sem side effect', () => {
    const s = freshSession();
    s.dispatch({ commandType: 'createDraft', payload: {} });
    for (const target of ['backend', 'prisma', 'runtimeBridge', 'fetch']) {
      const r = s.dispatch({ commandType: 'appendEntry', payload: { target, values: {} } });
      assert.equal(r.ok, false, target);
    }
    // session remains usable after blocked commands
    assert.equal(s.dispatch({ commandType: 'appendEntry', payload: { values: { ok: 1 } } }).ok, true);
  });

  // 64 — no React
  it('operational runtime não importa React', () => {
    assert.ok(orImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
  });

  // 65 / 66 — no ModeloBase1 import
  it('operational runtime não importa ModeloBase1', () => {
    assert.ok(orImports().every((p) => !/ModeloBase1/.test(p)));
  });

  // 67 — no Empresas/cadcps
  it('operational runtime não importa Empresas/cadcps', () => {
    assert.ok(orImports().every((p) => !/\/modules\/(empresas|cadcps)/.test(p)));
  });

  // 68 / 69 — no backend/API/Prisma; no runtimeBridge/makBootstrap
  it('operational runtime não importa backend/API/Prisma nem runtimeBridge/makBootstrap', () => {
    assert.ok(orImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(orImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
  });

  // 70 / 71 — no fetch; no storage
  it('operational runtime não usa fetch/XHR nem storage obrigatório', () => {
    const code = codeOnly(orSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code));
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
  });

  // consumes prototype + generic kernel
  it('operational runtime consome o prototype adapter + generic kernel', () => {
    assert.ok(orImports().some((p) => /prototype-adapter/.test(p)));
    assert.ok(orImports().some((p) => /runtime\/generic-model/.test(p)));
  });

  // full cycle + next step
  it('ciclo operacional local completo; próximo passo = candidate audit / fuel-pesagem (não backend write)', () => {
    const s = freshSession();
    const sub = drive(s);
    assert.equal(sub.nextState, 'submitted_simulated');
    const snap = s.createSnapshot();
    assert.equal(snap.kind, 'generic-model-snapshot');
    assert.equal(s.restoreSnapshot(snap).ok, true);
    assert.equal(s.reset().nextState, 'reset');
    const r = runtime();
    assert.ok(r.nextSteps.some((x) => /Candidate Audit|Fuel\/Pesagem/i.test(x)));
    assert.ok(!r.nextSteps.some((x) => /backend\s*write/i.test(x)));
  });
});
