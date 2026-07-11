import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createModeloBase2FuelUiSandboxModel } from '../../ModeloBase2/fuel-ui-sandbox/createModeloBase2FuelUiSandboxModel.js';
import { createModeloBase2FuelSandboxSession } from '../../ModeloBase2/fuel-ui-sandbox/createModeloBase2FuelSandboxSession.js';
import { createModeloBase2FuelUiViewModel } from '../../ModeloBase2/fuel-ui-sandbox/createModeloBase2FuelUiViewModel.js';
import { createModeloBase2FuelSandboxActions } from '../../ModeloBase2/fuel-ui-sandbox/createModeloBase2FuelSandboxActions.js';
import { createModeloBase2FuelSandboxDiagnostics } from '../../ModeloBase2/fuel-ui-sandbox/createModeloBase2FuelSandboxDiagnostics.js';
import {
  isModeloBase2FuelBetaUiSandboxEnabled,
  FUEL_BETA_UI_SANDBOX_FLAG,
} from '../../ModeloBase2/fuel-ui-sandbox/modeloBase2FuelUiSandboxConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SANDBOX_DIR = path.join(HERE, '../../ModeloBase2/fuel-ui-sandbox');
const COMPONENTS_DIR = path.join(SANDBOX_DIR, 'components');
const HEADLESS_DIR = path.join(HERE, '../../ModeloBase2/fuel-headless');
const OPRUNTIME_DIR = path.join(HERE, '../../ModeloBase2/operational-runtime');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
// Pure sandbox logic = plain `.js` files. React lives in any `.jsx` (components/ or
// the dev-preview route added by a later slice). This keeps the rule cross-slice
// robust: React is allowed in `.jsx`, never in a pure `.js`.
const pureFiles = () => walk(SANDBOX_DIR).filter((f) => f.endsWith('.js'));
const pureSource = () => pureFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const pureImports = () => [...codeOnly(pureSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const componentFiles = () => walk(COMPONENTS_DIR);
const componentSource = () => componentFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const componentImports = () => [...codeOnly(componentSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const headlessImports = () => walk(HEADLESS_DIR).flatMap((f) => [...codeOnly(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const opRuntimeImports = () => walk(OPRUNTIME_DIR).flatMap((f) => [...codeOnly(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const REACT_EL = { $$typeof: Symbol.for('react.element') };

const model = (moduleId = 'combustivel') => createModeloBase2FuelUiSandboxModel({ moduleId });
const entry = (over = {}) => ({ date: '2025-01-01', machineName: 'Trator A', quantityLiters: 100, hourmeter: 1200, operatorName: 'João', ...over });
function drive(m) {
  m.dispatch('newDraft', {});
  m.dispatch('addFuelEntry', { entry: entry() });
  m.dispatch('addFuelEntry', { entry: entry({ date: '2025-01-02', machineName: 'Trator B', quantityLiters: 50 }) });
  m.dispatch('validate');
  m.dispatch('saveLocal');
  return m.dispatch('submitSimulated');
}

describe('ModeloBase2 Fuel Beta UI Sandbox (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4 / 5
  it('sandbox model criado; domain fuel; modeloBase2/operacional; dangerous false', () => {
    const m = model();
    assert.equal(m.kind, 'modelobase2-fuel-ui-sandbox-model');
    assert.equal(m.domain, 'fuel');
    assert.equal(m.modelFamily, 'modeloBase2');
    assert.equal(m.modelType, 'operacional');
    for (const x of ['backendWrite', 'workflow', 'connector', 'marketplacePublish']) assert.equal(m.capabilities[x], false);
  });

  // 6 flags default off
  it('flags desligadas por padrão', () => {
    assert.equal(isModeloBase2FuelBetaUiSandboxEnabled({ DEV: 'true' }), false);
    assert.equal(isModeloBase2FuelBetaUiSandboxEnabled({ DEV: 'true', [FUEL_BETA_UI_SANDBOX_FLAG]: 'true' }), true);
  });

  // 7 / 8 / 9 / 10 / 11 view model
  it('view model: título + fields + columns + summary cards + badges', () => {
    const vm = createModeloBase2FuelUiViewModel({ readState: { summary: { totalLiters: 10, totalEntries: 1 }, entries: [], timeline: { events: [] } } });
    assert.equal(vm.title, 'Lançamento de Combustível');
    assert.ok(vm.form.fields.some((f) => f.id === 'quantityLiters'));
    assert.ok(vm.table.columns.some((c) => c.id === 'quantityLiters'));
    assert.ok(vm.summaryCards.some((c) => c.id === 'totalLiters'));
    for (const id of ['localOnly', 'sentFalse', 'persistenceRealFalse', 'offlineFirst']) assert.ok(vm.badges.some((b) => b.id === id), id);
  });

  // 12–21 sandbox session cycle
  it('sandbox session: draft/append/edit/remove/validate/save/submit(sent:false)/snapshot/restore/reset', () => {
    const s = createModeloBase2FuelSandboxSession({ moduleId: 'combustivel' });
    assert.equal(s.createDraft({}).ok, true);
    assert.equal(s.appendEntry(entry()).ok, true);
    const id = s.candidate.getState().draft.entries[0].entryId;
    assert.equal(s.updateEntry(id, entry({ quantityLiters: 120 })).ok, true);
    assert.equal(s.removeEntry(id).ok, true);
    s.appendEntry(entry({ date: '2025-01-03' }));
    assert.equal(s.validateDraft().ok, true);
    assert.equal(s.saveDraft().ok, true);
    const sub = s.submitDraft();
    assert.equal(sub.ok, true);
    assert.equal(sub.sent, false);
    const snap = s.createSnapshot();
    assert.equal(snap.kind, 'modelobase2-fuel-snapshot');
    assert.equal(s.restoreSnapshot(snap).ok, true);
    assert.equal(s.resetDraft().ok, true);
  });

  // 22 / 23 actions
  it('actions mapeiam para comandos headless; action inválida falha fechado', () => {
    const a = createModeloBase2FuelSandboxActions({ moduleId: 'x' });
    assert.equal(a.resolveAction('addFuelEntry', {}).fuelCommandType, 'appendFuelEntry');
    assert.equal(a.resolveAction('submitSimulated').fuelCommandType, 'submitFuelDraft');
    assert.equal(a.resolveAction('frobnicate').ok, false);
  });

  // 24 / 25 fallback/diagnostics on invalid payload/snapshot
  it('payload inválido e snapshot inválido geram fallback/diagnostics sem quebrar', () => {
    const m = model();
    m.dispatch('newDraft', {});
    const bad = m.dispatch('addFuelEntry', { entry: { date: 'x', machineName: 'y', quantityLiters: 0 } });
    assert.equal(bad.ok, false);
    assert.ok(bad.diagnostics);
    const badRestore = m.dispatch('restore', { snapshot: { kind: 'not-a-snapshot' } });
    assert.equal(badRestore.ok, false);
    assert.ok(badRestore.diagnostics);
  });

  // 26 / 27 / 28 / 29 derived view
  it('totalLiters derivado; timeline reflete eventos; table reflete read state; form no view model', () => {
    const m = model();
    const r = drive(m);
    assert.equal(r.viewModel.summaryCards.find((c) => c.id === 'totalLiters').value, 150);
    assert.ok(r.viewModel.timeline.events.length >= 5);
    assert.equal(r.viewModel.table.rows.length, 2);
    assert.ok(r.viewModel.form.fields.length > 0);
  });

  // 30 / 31 / 32 no-mount diagnostics
  it('diagnostics: uiMountedInApp/routeRegistered/menuRegistered false', () => {
    const d = createModeloBase2FuelSandboxDiagnostics({ sandboxId: 's', moduleId: 'x', enabled: true, readState: {}, status: 'draft' });
    assert.equal(d.uiMountedInApp, false);
    assert.equal(d.routeRegistered, false);
    assert.equal(d.menuRegistered, false);
  });

  // 33 / 34 / 35 / 36 / 37 invariants
  it('invariantes: backend/prisma/runtimeBridge Touched false; persistenceReal false; sent false', () => {
    const m = model();
    const r = drive(m);
    assert.equal(r.backendTouched, false);
    assert.equal(r.prismaTouched, false);
    assert.equal(r.runtimeBridgeTouched, false);
    assert.equal(r.persistenceReal, false);
    assert.equal(r.sent, false);
    assert.equal(m.getDiagnostics().persistenceReal, false);
  });

  // forbidden targets blocked end-to-end
  it('sandbox bloqueia backend/prisma/runtimeBridge/fetch target', () => {
    const m = model();
    m.dispatch('newDraft', {});
    for (const target of ['backend', 'prisma', 'runtimeBridge', 'fetch']) {
      assert.equal(m.dispatch('addFuelEntry', { target, entry: entry() }).ok, false, target);
    }
  });

  // unsafe payload blocked
  it('payload com fn/React/pollution bloqueado', () => {
    const m = model();
    m.dispatch('newDraft', {});
    assert.equal(m.dispatch('addFuelEntry', { fn: () => {} }).ok, false);
    assert.equal(m.dispatch('addFuelEntry', { el: REACT_EL }).ok, false);
    assert.equal(m.dispatch('addFuelEntry', JSON.parse('{"__proto__":{"z":1}}')).ok, false);
  });

  // 38 / 39 safe copies
  it('retornos são cópias seguras; mutar retorno não altera estado interno', () => {
    const m = model();
    m.dispatch('newDraft', {});
    const r = m.dispatch('addFuelEntry', { entry: entry() });
    r.viewModel.table.rows.push({ id: 'INJECTED' });
    assert.ok(!m.getViewModel().table.rows.some((row) => row.id === 'INJECTED'));
  });

  // 40 components exist + default export
  it('componentes existem e exportam função (source scan)', () => {
    const expected = ['ModeloBase2FuelSandboxShell', 'ModeloBase2FuelEntryForm', 'ModeloBase2FuelEntriesTable', 'ModeloBase2FuelEventTimeline', 'ModeloBase2FuelDiagnosticsPanel', 'ModeloBase2FuelStatusBadges'];
    for (const name of expected) {
      const file = path.join(COMPONENTS_DIR, `${name}.jsx`);
      assert.ok(fs.existsSync(file), `${name}.jsx exists`);
      const src = fs.readFileSync(file, 'utf8');
      assert.ok(new RegExp(`export function ${name}`).test(src), `${name} exported`);
    }
  });

  // 41 / 42 / 43 / 44 components isolation
  it('componentes não importam backend/API/Prisma/runtimeBridge/makBootstrap; sem fetch/storage', () => {
    assert.ok(componentImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(componentImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
    const code = codeOnly(componentSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no storage');
  });

  // 50 React only in components; pure sandbox + headless + operational-runtime React-free
  it('React só nos componentes; pure sandbox/headless/operational-runtime sem React', () => {
    assert.ok(pureImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)), 'pure sandbox no react');
    assert.ok(headlessImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)), 'headless no react');
    assert.ok(opRuntimeImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)), 'operational-runtime no react');
    // components MAY import react
    assert.ok(componentImports().some((p) => p === 'react'), 'components use react');
  });

  // pure sandbox does not import backend/Prisma/modules
  it('pure sandbox não importa backend/API/Prisma/runtimeBridge nem src/modules', () => {
    assert.ok(pureImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(pureImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
    assert.ok(pureImports().every((p) => !/\/modules\//.test(p)));
  });

  // next step
  it('próximo passo = Fuel Dev Preview Route / Fuel Module Shell Readiness (não backend write)', () => {
    const m = model();
    assert.ok(m.nextSteps.some((s) => /Fuel Dev Preview Route|Fuel Module Shell Readiness/i.test(s)));
    assert.ok(!m.nextSteps.some((s) => /backend\s*write/i.test(s)));
  });
});
