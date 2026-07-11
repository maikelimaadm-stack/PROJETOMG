import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createModeloBase2FuelHeadlessCandidate } from '../../ModeloBase2/fuel-headless/createModeloBase2FuelHeadlessCandidate.js';
import { createModeloBase2FuelOperationalAdapter } from '../../ModeloBase2/fuel-headless/createModeloBase2FuelOperationalAdapter.js';
import { createModeloBase2FuelDomainSchema } from '../../ModeloBase2/fuel-headless/createModeloBase2FuelDomainSchema.js';
import { createModeloBase2FuelCommandMapper } from '../../ModeloBase2/fuel-headless/createModeloBase2FuelCommandMapper.js';
import { validateModeloBase2FuelPayload } from '../../ModeloBase2/fuel-headless/validateModeloBase2FuelPayload.js';
import {
  createModeloBase2FuelSnapshot,
  validateModeloBase2FuelSnapshot,
  restoreModeloBase2FuelSnapshot,
  roundtripModeloBase2FuelSnapshot,
} from '../../ModeloBase2/fuel-headless/createModeloBase2FuelSnapshot.js';
import { createModeloBase2FuelFallback } from '../../ModeloBase2/fuel-headless/createModeloBase2FuelFallback.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FUEL_DIR = path.join(HERE, '../../ModeloBase2/fuel-headless');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
});
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const fuelSource = () => walk(FUEL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const fuelImports = () => [...codeOnly(fuelSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const REACT_EL = { $$typeof: Symbol.for('react.element') };

const candidate = (moduleId = 'combustivel') => createModeloBase2FuelHeadlessCandidate({ moduleId });
const entry = (over = {}) => ({ date: '2025-01-01', machineName: 'Trator A', quantityLiters: 100, hourmeter: 1200, operatorName: 'João', ...over });
function drive(c) {
  c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
  c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: entry() } });
  c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: entry({ date: '2025-01-02', machineName: 'Trator B', quantityLiters: 50 }) } });
  c.dispatch({ fuelCommandType: 'validateFuelDraft' });
  c.dispatch({ fuelCommandType: 'saveFuelDraft' });
  return c.dispatch({ fuelCommandType: 'submitFuelDraft' });
}

describe('ModeloBase2 Fuel Headless Candidate (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4 / 5
  it('candidate criado; domain fuel; modeloBase2/operacional; dangerous false', () => {
    const c = candidate();
    assert.equal(c.kind, 'modelobase2-fuel-headless-candidate');
    assert.equal(c.domain, 'fuel');
    assert.equal(c.modelFamily, 'modeloBase2');
    assert.equal(c.modelType, 'operacional');
    for (const x of ['backendWrite', 'workflow', 'connector', 'marketplacePublish']) assert.equal(c.capabilities[x], false);
  });

  // 6 / 7 / 8 / 9 / 10 schema
  it('schema fuel: campos mínimos; exige date/machine/liters>0; rejeita hourmeter negativo', () => {
    const s = createModeloBase2FuelDomainSchema();
    assert.ok(s.fields.some((f) => f.id === 'quantityLiters'));
    assert.equal(s.validateEntry(entry()).valid, true);
    assert.equal(s.validateEntry(entry({ date: undefined })).valid, false);
    assert.equal(s.validateEntry({ date: '2025-01-01', quantityLiters: 10 }).valid, false); // sem machine
    assert.equal(s.validateEntry(entry({ quantityLiters: 0 })).valid, false);
    assert.equal(s.validateEntry(entry({ hourmeter: -5 })).valid, false);
  });

  // 11 / 12 adapter
  it('adapter fuel usa operational runtime; cria session headless', () => {
    const a = createModeloBase2FuelOperationalAdapter({ moduleId: 'combustivel' });
    assert.equal(a.runtime.kind, 'modelobase2-operational-runtime');
    assert.equal(a.session.kind, 'modelobase2-operational-session');
    assert.equal(a.domain, 'fuel');
  });

  // 13 / 14 / 15 draft
  it('draft fuel: localOnly; sent:false; persistenceReal:false', () => {
    const c = candidate();
    const r = c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
    assert.equal(r.draft.localOnly, true);
    assert.equal(r.draft.sent, false);
    assert.equal(r.draft.persistenceReal, false);
  });

  // 16–23 command mapper
  it('command mapper mapeia comandos fuel → operacionais; snapshot/restore/reset; desconhecido fecha', () => {
    const m = createModeloBase2FuelCommandMapper({ moduleId: 'x' });
    assert.equal(m.map('createFuelDraft'), 'createDraft');
    assert.equal(m.map('appendFuelEntry'), 'appendEntry');
    assert.equal(m.map('updateFuelEntry'), 'updateEntry');
    assert.equal(m.map('removeFuelEntry'), 'removeEntry');
    assert.equal(m.map('validateFuelDraft'), 'validateDraft');
    assert.equal(m.map('saveFuelDraft'), 'saveDraft');
    assert.equal(m.map('submitFuelDraft'), 'submitDraft');
    assert.equal(m.map('createFuelSnapshot'), 'createSnapshot');
    assert.equal(m.map('restoreFuelSnapshot'), 'restoreSnapshot');
    assert.equal(m.map('resetFuelDraft'), 'resetDraft');
    assert.equal(m.mapCommand({ fuelCommandType: 'frobnicate' }).ok, false);
  });

  // 24 unknown fail-closed
  it('comando fuel desconhecido falha fechado no dispatch', () => {
    const c = candidate();
    assert.equal(c.dispatch({ fuelCommandType: 'frobnicate' }).ok, false);
  });

  // 25 / 26 / 27 / 28 / 29 / 30 / 31 / 32 payload validation
  it('payload com fn/handler/React/pollution/backend/prisma/runtimeBridge/fetch bloqueado', () => {
    const bad = (payload) => validateModeloBase2FuelPayload({ commandType: 'appendFuelEntry', payload, moduleId: 'x' }).valid;
    assert.equal(bad({ fn: () => {} }), false);
    assert.equal(bad({ onClick: () => {} }), false);
    assert.equal(bad({ el: REACT_EL }), false);
    assert.equal(bad(JSON.parse('{"__proto__":{"z":1}}')), false);
    assert.equal(bad({ target: 'backend', entry: entry() }), false);
    assert.equal(bad({ target: 'prisma', entry: entry() }), false);
    assert.equal(bad({ target: 'runtimeBridge', entry: entry() }), false);
    assert.equal(bad({ target: 'fetch', entry: entry() }), false);
  });

  // 33 / 34 / 35 / 36 / 37 / 38 / 39 fuel events + submit sent:false
  it('apply fuel command gera eventos fuel; submitFuelDraft mantém sent:false', () => {
    const c = candidate();
    c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
    assert.equal(c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: entry() } }).event.eventType, 'fuel.entry.added');
    const id = c.getState().draft.entries[0].entryId;
    assert.equal(c.dispatch({ fuelCommandType: 'updateFuelEntry', payload: { entryId: id, entry: entry({ quantityLiters: 120 }) } }).event.eventType, 'fuel.entry.updated');
    assert.equal(c.dispatch({ fuelCommandType: 'removeFuelEntry', payload: { entryId: id } }).event.eventType, 'fuel.entry.removed');
    c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: entry({ date: '2025-01-03' }) } });
    assert.equal(c.dispatch({ fuelCommandType: 'validateFuelDraft' }).event.eventType, 'fuel.draft.validated');
    assert.equal(c.dispatch({ fuelCommandType: 'saveFuelDraft' }).event.eventType, 'fuel.draft.saved');
    const sub = c.dispatch({ fuelCommandType: 'submitFuelDraft' });
    assert.equal(sub.event.eventType, 'fuel.draft.submitted.simulated');
    assert.equal(sub.sent, false);
  });

  // 40 / 41 / 42 / 43 read state
  it('read state fuel deriva totalLiters/machinesCount + table/form compatíveis', () => {
    const c = candidate();
    drive(c);
    const rs = c.getReadState();
    assert.equal(rs.summary.totalLiters, 150);
    assert.equal(rs.summary.machinesCount, 2);
    assert.ok(rs.table && rs.table.columns.some((col) => col.id === 'quantityLiters'));
    assert.ok(rs.form && rs.form.fields.some((f) => f.id === 'hourmeter'));
  });

  // 44 / 45 / 46 / 47 / 48 snapshot
  it('snapshot fuel: cria/valida/checksum inválido/restore/roundtrip', () => {
    const c = candidate();
    drive(c);
    const state = c.getState();
    const snap = createModeloBase2FuelSnapshot({ moduleId: 'combustivel', draft: state.draft, eventLog: state.eventLog });
    assert.equal(snap.kind, 'modelobase2-fuel-snapshot');
    assert.equal(snap.persistenceReal, false);
    assert.equal(validateModeloBase2FuelSnapshot({ fuelSnapshot: snap }).valid, true);
    assert.equal(validateModeloBase2FuelSnapshot({ fuelSnapshot: { ...snap, snapshot: { ...snap.snapshot, data: { x: 1 } } } }).valid, false);
    assert.equal(restoreModeloBase2FuelSnapshot({ fuelSnapshot: snap }).ok, true);
    const rt = roundtripModeloBase2FuelSnapshot({ moduleId: 'combustivel', draft: state.draft, eventLog: state.eventLog });
    assert.equal(rt.ok, true);
    assert.equal(rt.persistenceReal, false);
  });

  // 49 / 50 fallback
  it('fallback gerado para payload inválido; rollback plan passivo', () => {
    const f = createModeloBase2FuelFallback({ moduleId: 'x', reason: 'invalid-payload' });
    assert.equal(f.fallback.fallbackApplied, true);
    assert.equal(f.rollbackPlan.rollbackAvailable, true);
    assert.equal(f.rollbackPlan.safety.executesRollback, false);
  });

  // 51 / 52 / 53 no mutation / safe copies
  it('mutação não altera entrada; retornos são cópias seguras', () => {
    const c = candidate();
    c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
    const payload = { entry: entry() };
    const frozen = JSON.stringify(payload);
    const r = c.dispatch({ fuelCommandType: 'appendFuelEntry', payload });
    assert.equal(JSON.stringify(payload), frozen, 'input payload not mutated');
    r.draft.entries.push({ entryId: 'INJECTED' });
    assert.ok(!c.getState().draft.entries.some((e) => e.entryId === 'INJECTED'));
  });

  // 54 / 55 / 56 / 57 invariants
  it('invariantes: backend/prisma/runtimeBridge Touched false; persistenceReal false', () => {
    const c = candidate();
    const r = drive(c);
    assert.equal(r.backendTouched, false);
    assert.equal(r.prismaTouched, false);
    assert.equal(r.runtimeBridgeTouched, false);
    assert.equal(r.persistenceReal, false);
    assert.equal(c.getDiagnostics().persistenceReal, false);
  });

  // backend/prisma/runtimeBridge/fetch target blocked end-to-end in the candidate
  it('candidate bloqueia backend/prisma/runtimeBridge/fetch target sem side effect', () => {
    const c = candidate();
    c.dispatch({ fuelCommandType: 'createFuelDraft', payload: {} });
    for (const target of ['backend', 'prisma', 'runtimeBridge', 'fetch']) {
      assert.equal(c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { target, entry: entry() } }).ok, false, target);
    }
    assert.equal(c.dispatch({ fuelCommandType: 'appendFuelEntry', payload: { entry: entry() } }).ok, true);
  });

  // 58 / 59 / 60 — no React/DOM/ModeloBase1
  it('fuel headless não importa React/DOM/ModeloBase1', () => {
    assert.ok(fuelImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
    assert.ok(fuelImports().every((p) => !/ModeloBase1/.test(p)));
    const code = codeOnly(fuelSource());
    assert.ok(!/\bdocument\.|\bwindow\.|getElementById|querySelector/.test(code), 'no DOM');
  });

  // 61 / 62 — no Empresas/cadcps / src/modules
  it('fuel headless não importa Empresas/cadcps nem src/modules', () => {
    assert.ok(fuelImports().every((p) => !/\/modules\//.test(p)));
  });

  // 63 / 64 — no backend/API/Prisma; no runtimeBridge/makBootstrap
  it('fuel headless não importa backend/API/Prisma nem runtimeBridge/makBootstrap', () => {
    assert.ok(fuelImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(fuelImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
  });

  // 65 / 66 — no fetch; no storage
  it('fuel headless não usa fetch/XHR nem storage obrigatório', () => {
    const code = codeOnly(fuelSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code));
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
  });

  // consumes operational runtime + generic kernel
  it('fuel headless consome operational runtime + generic kernel', () => {
    assert.ok(fuelImports().some((p) => /operational-runtime/.test(p)));
    assert.ok(fuelImports().some((p) => /runtime\/generic-model/.test(p)));
  });

  // full cycle + next step
  it('ciclo fuel local completo; próximo passo = Fuel UI Readiness / Beta UI Sandbox (não backend write)', () => {
    const c = candidate();
    const sub = drive(c);
    assert.equal(sub.ok, true);
    const snap = c.createSnapshot();
    assert.equal(snap.kind, 'modelobase2-fuel-snapshot');
    assert.equal(c.restoreSnapshot(snap).ok, true);
    assert.equal(c.reset().draft.summary.totalEntries, 0);
    assert.ok(c.nextSteps.some((x) => /Fuel UI Readiness|Fuel Beta UI Sandbox/i.test(x)));
    assert.ok(!c.nextSteps.some((x) => /backend\s*write/i.test(x)));
  });
});
