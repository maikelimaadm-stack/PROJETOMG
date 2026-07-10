import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  resolveModeloBase1LocalWriteActivation,
  isModeloBase1LocalWriteActivationRequested,
  MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_FLAG,
  EMPRESAS_LOCAL_WRITE_ACTIVATION_FLAG,
  CADCPS_LOCAL_WRITE_ACTIVATION_FLAG,
} from '../../ModeloBase1/runtime-read-model/local-write/resolveModeloBase1LocalWriteActivation.js';
import {
  createModeloBase1LocalWriteSession,
  createModeloBase1LocalWriteUiState,
} from '../../ModeloBase1/runtime-read-model/local-write/createModeloBase1LocalWriteUiState.js';
import { createModeloBase1LocalWriteActivationDiagnostics } from '../../ModeloBase1/runtime-read-model/local-write/modeloBase1LocalWriteActivationDiagnostics.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LW_DIR = path.join(HERE, '../../ModeloBase1/runtime-read-model/local-write');
const ACT_FILES = [
  'resolveModeloBase1LocalWriteActivation.js',
  'createModeloBase1LocalWriteUiState.js',
  'modeloBase1LocalWriteActivationDiagnostics.js',
  'useModeloBase1ControlledLocalWrite.js',
];
const C_FILES = [
  'components/ModeloBase1LocalWriteToolbar.jsx',
  'components/ModeloBase1LocalWriteDiagnosticsPanel.jsx',
  'components/ModeloBase1LocalDraftBadge.jsx',
];
const actSource = () => ACT_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const pageSource = () => fs.readFileSync(path.join(HERE, '../../ModeloBase1/render/ModeloBase1CadastroPage.jsx'), 'utf8');

const betaState = (moduleId = 'empresas') => ({
  kind: 'modelobase1-runtime-read-state', moduleId, betaApplied: true, writeBlocked: true, source: 'runtime-v2-beta',
  table: { columns: [{ id: 'razao_social' }], rows: [{ id: 'r1', cells: { razao_social: 'ACME' } }], rowCount: 1 },
  form: { fields: [{ id: 'razao_social' }] },
});
const ACT = (moduleId) => ({
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_BETA`]: 'true',
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_LOCAL_WRITE_PLAN`]: 'true',
  [`MAK_MODELOBASE1_${moduleId.toUpperCase()}_LOCAL_WRITE_ACTIVATION`]: 'true',
});
const session = (moduleId = 'empresas', env = ACT(moduleId)) => createModeloBase1LocalWriteSession({ readState: betaState(moduleId), moduleId, env });

describe('ModeloBase1 Controlled Local Write Activation (post-Foundation C)', () => {
  // 1
  it('flags de activation desligadas por padrão', () => {
    assert.equal(isModeloBase1LocalWriteActivationRequested('empresas', {}), false);
    assert.equal(resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: betaState(), env: {} }).activationApplied, false);
  });

  // 2
  it('activation só liga com beta + plan + activation flag', () => {
    const onlyAct = { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true' };
    assert.equal(resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: betaState(), env: onlyAct }).activationApplied, false, 'no plan/beta');
    const noBeta = { MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_PLAN: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true' };
    assert.equal(resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: { moduleId: 'empresas', betaApplied: false }, env: noBeta }).activationApplied, false, 'no beta');
    assert.equal(resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: betaState(), env: ACT('empresas') }).activationApplied, true);
  });

  // 3
  it('Empresas activation liga com flag específica ou umbrella', () => {
    assert.equal(isModeloBase1LocalWriteActivationRequested('empresas', { [EMPRESAS_LOCAL_WRITE_ACTIVATION_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1LocalWriteActivationRequested('empresas', { [MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1LocalWriteActivationRequested('cadcps', { [EMPRESAS_LOCAL_WRITE_ACTIVATION_FLAG]: 'true' }), false);
  });

  // 4
  it('cadcps activation liga com flag específica ou umbrella', () => {
    assert.equal(isModeloBase1LocalWriteActivationRequested('cadcps', { [CADCPS_LOCAL_WRITE_ACTIVATION_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1LocalWriteActivationRequested('cadcps', { [MODELOBASE1_CONTROLLED_LOCAL_WRITE_ACTIVATION_FLAG]: 'true' }), true);
  });

  // 5 / 33
  it('flag off mantém read-only/fallback', () => {
    const s = createModeloBase1LocalWriteSession({ readState: betaState(), moduleId: 'empresas', env: { MAK_MODELOBASE1_EMPRESAS_BETA: 'true' } });
    assert.equal(s.activationApplied, false);
    const ui = s.getUiState();
    assert.equal(ui.activationApplied, false);
    assert.equal(ui.readOnlyFallback, true);
    assert.equal(ui.rows.length, 1); // falls back to read state rows
  });

  // 6 / 7
  it('session cria controller quando habilitado, não cria quando desabilitado', () => {
    assert.ok(session().getController() != null);
    const off = createModeloBase1LocalWriteSession({ readState: betaState(), moduleId: 'empresas', env: {} });
    assert.equal(off.getController(), null);
  });

  // 8
  it('createRow atualiza apenas rows locais', () => {
    const s = session();
    const before = s.getUiState().localRowCount;
    const r = s.createRow({ cells: { razao_social: 'NOVA' } });
    assert.equal(r.ok, true);
    assert.equal(s.getUiState().localRowCount, before + 1);
  });

  // 9
  it('updateRow atualiza apenas rows locais', () => {
    const s = session();
    const r = s.updateRow('r1', { cells: { razao_social: 'EDIT' } });
    assert.equal(r.ok, true);
    assert.equal(s.getUiState().rows.find((x) => x.id === 'r1').cells.razao_social, 'EDIT');
  });

  // 10
  it('deleteRow marca/remove apenas localmente (some da lista visível)', () => {
    const s = session();
    const r = s.deleteRow('r1');
    assert.equal(r.ok, true);
    assert.equal(s.getUiState().rows.find((x) => x.id === 'r1'), undefined);
  });

  // 11
  it('saveDraft retorna localOnly', () => {
    const r = session().saveDraft();
    assert.equal(r.localOnly, true);
    assert.equal(r.savedLocally, true);
    assert.equal(r.backendTouched, false);
  });

  // 12
  it('submitDraft retorna simulatedSubmit e sent:false', () => {
    const r = session().submitDraft();
    assert.equal(r.simulatedSubmit, true);
    assert.equal(r.sent, false);
    assert.equal(r.localOnly, true);
  });

  // 13
  it('resetDraft restaura o read model original', () => {
    const s = session();
    s.createRow({ cells: {} });
    s.createRow({ cells: {} });
    assert.equal(s.getUiState().localRowCount, 3);
    const rst = s.resetDraft();
    assert.equal(rst.ok, true);
    assert.equal(s.getUiState().localRowCount, 1);
  });

  // 14
  it('entrada original não é mutada', () => {
    const state = betaState();
    const s = createModeloBase1LocalWriteSession({ readState: state, moduleId: 'empresas', env: ACT('empresas') });
    s.createRow({ cells: { razao_social: 'X' } });
    s.deleteRow('r1');
    assert.equal(state.table.rows.length, 1);
    assert.equal(state.table.rows[0]._localDeleted, undefined);
  });

  // 15
  it('mutar retorno (uiState) não altera estado interno', () => {
    const s = session();
    const ui = s.getUiState();
    ui.rows.push({ id: 'INJECTED' });
    assert.ok(!s.getUiState().rows.some((r) => r.id === 'INJECTED'));
  });

  // 16 / 17
  it('operação/payload inválido falha fechado e não altera draft', () => {
    const s = session();
    const before = s.getUiState().localRowCount;
    const bad = s.createRow({ evil: () => {} });
    assert.equal(bad.ok, false);
    assert.equal(s.getUiState().localRowCount, before);
    const backend = s.createRow({ target: 'backend' });
    assert.equal(backend.ok, false);
    assert.equal(s.getUiState().localRowCount, before);
  });

  // 18 / 19 / 20 / 21 / 35 / 36 / 37 / 38
  it('diagnostics: localOnly, backend/prisma/runtimeBridge Touched false, persistence none', () => {
    const s = session();
    s.createRow({ cells: {} });
    const d = s.getUiState().diagnostics;
    assert.equal(d.localOnly, true);
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    assert.equal(d.persistence, 'none');
    assert.equal(d.activationApplied, true);
    assert.ok(d.operationCount >= 1);
  });

  // 22 / 23 / 24
  it('Empresas e cadcps usam o mesmo session/controller base (sem arquitetura separada)', () => {
    const emp = session('empresas');
    const cps = session('cadcps', ACT('cadcps'));
    assert.equal(emp.kind, cps.kind);
    assert.equal(emp.getController().kind, cps.getController().kind);
    assert.equal(emp.getUiState().kind, cps.getUiState().kind);
    assert.notEqual(emp.moduleId, cps.moduleId);
  });

  // 25 / 26 / 27 / 28 — source invariants
  it('módulo activation não chama backend/fetch/Prisma/MMM/runtimeBridge/storage', () => {
    const code = codeOnly(actSource() + '\n' + cSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR/WebSocket');
    assert.ok(!/PrismaClient|from\s+['"].*prisma.*['"]|\bMMM\b/i.test(code), 'no Prisma/MMM');
    assert.ok(!/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(actSource() + cSource()), 'no backend/apis import');
    assert.ok(!/makBootstrap|\/runtimeBridge\//.test(code), 'no runtimeBridge/makBootstrap');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no web storage API calls');
  });

  // 29 / 30 — no real save/submit / no action-workflow-connector side effect
  it('não executa save/submit reais nem action/workflow/connector (só local)', () => {
    const s = session();
    const sub = s.submitDraft();
    assert.equal(sub.sent, false); // simulated only
    const code = codeOnly(actSource());
    assert.ok(!/executeAction|startWorkflow|invokeConnector/.test(code), 'no action/workflow/connector execution');
  });

  // 31 / 32 / 34 — fallback scenarios
  it('fallback quando beta off / plan off / controller indisponível', () => {
    const betaOff = createModeloBase1LocalWriteSession({ readState: { moduleId: 'empresas', betaApplied: false }, moduleId: 'empresas', env: ACT('empresas') });
    assert.equal(betaOff.activationApplied, false);
    assert.equal(betaOff.activation.reason, 'beta-read-model-off');
    const planOff = createModeloBase1LocalWriteSession({ readState: betaState(), moduleId: 'empresas', env: { MAK_MODELOBASE1_EMPRESAS_BETA: 'true', MAK_MODELOBASE1_EMPRESAS_LOCAL_WRITE_ACTIVATION: 'true' } });
    assert.equal(planOff.activation.reason, 'local-write-plan-off');
    // controller unavailable → operations are no-ops that don't count
    const r = planOff.createRow({ cells: {} });
    assert.equal(r.ok, false);
    assert.equal(planOff.getUiState().operationCount, 0);
  });

  // page wiring
  it('página consome o hook de activation + toolbar + painel', () => {
    const page = pageSource();
    assert.ok(/useModeloBase1ControlledLocalWrite/.test(page), 'page uses the activation hook');
    assert.ok(/ModeloBase1LocalWriteToolbar/.test(page), 'page renders the toolbar');
    assert.ok(/ModeloBase1LocalWriteDiagnosticsPanel/.test(page), 'page renders the diagnostics panel');
  });

  // 45 — no CSS import; decoupled from src/runtime
  it('módulo desacoplado de src/runtime e sem CSS global', () => {
    const imports = [...codeOnly(actSource() + '\n' + cSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p)), 'does not import src/runtime');
    assert.ok(!/import\s+['"][^'"]+\.css['"]/i.test(actSource() + cSource()), 'no CSS import');
  });

  // 46 — next step is Local Persistence Validation
  it('próximo passo é Local Persistence Validation (não backend write)', () => {
    const d = session().getUiState().diagnostics;
    assert.equal(d.nextAllowedStep, 'ModeloBase1 Local Persistence Validation');
    assert.ok(!/backend/i.test(d.nextAllowedStep));
  });

  // uiState pure snapshot + diagnostics determinism
  it('createModeloBase1LocalWriteUiState/diagnostics são puros e deterministas', () => {
    const activation = resolveModeloBase1LocalWriteActivation({ moduleId: 'empresas', readState: betaState(), env: ACT('empresas') });
    const a = createModeloBase1LocalWriteActivationDiagnostics({ moduleId: 'empresas', activation, operationCount: 2, localRowCount: 3 });
    const b = createModeloBase1LocalWriteActivationDiagnostics({ moduleId: 'empresas', activation, operationCount: 2, localRowCount: 3 });
    assert.deepEqual(a, b);
    const ui = createModeloBase1LocalWriteUiState({ activation, controller: null, readState: betaState() });
    assert.equal(ui.readOnlyFallback, false); // activation applied but no controller → still reports snapshot
    assert.equal(ui.localOnly, true);
  });

  // toolbar buttons only drive local ops (no backend/fetch handlers)
  it('componentes: botões só chamam operações locais (sem backend/fetch/menu)', () => {
    const compCode = codeOnly(cSource());
    assert.ok(!/\bfetch\s*\(|axios|XMLHttpRequest/.test(compCode), 'no fetch in components');
    assert.ok(!/addMenuItem|navItems|menu\.push/.test(compCode), 'no menu mutation');
    assert.ok(/ops\.(createRow|saveDraft|submitDraft|resetDraft)/.test(compCode), 'buttons call local ops');
  });
});
