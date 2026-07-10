import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createModeloBase1BetaUiHardeningModel,
  createModeloBase1BetaUiHardeningFromConfig,
} from '../../ModeloBase1/runtime-read-model/hardening/createModeloBase1BetaUiHardeningModel.js';
import { createModeloBase1BetaUiChecklist } from '../../ModeloBase1/runtime-read-model/hardening/createModeloBase1BetaUiChecklist.js';
import { createModeloBase1BetaUiDiagnostics } from '../../ModeloBase1/runtime-read-model/hardening/modeloBase1BetaUiDiagnostics.js';
import {
  isModeloBase1BetaUiDiagnosticsEnabled,
  MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG,
} from '../../ModeloBase1/runtime-read-model/hardening/modeloBase1BetaUiConfig.js';
import { ModeloBase1BetaUiHardeningError } from '../../ModeloBase1/runtime-read-model/hardening/errors.js';

import { createEmpresasModeloBase1BetaReadModel } from '../modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js';
import { createCadcpsModeloBase1BetaReadModel } from '../modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const H_DIR = path.join(HERE, '../../ModeloBase1/runtime-read-model/hardening');
const C_DIR = path.join(HERE, '../../ModeloBase1/runtime-read-model/components');
const H_FILES = [
  'errors.js',
  'modeloBase1BetaUiConfig.js',
  'createModeloBase1BetaUiChecklist.js',
  'modeloBase1BetaUiDiagnostics.js',
  'createModeloBase1BetaUiHardeningModel.js',
];
const C_FILES = [
  'ModeloBase1RuntimeReadDiagnosticsPanel.jsx',
  'ModeloBase1RuntimeReadFallbackBadge.jsx',
  'ModeloBase1RuntimeReadWriteBlockedBadge.jsx',
];
const hSource = () => H_FILES.map((f) => fs.readFileSync(path.join(H_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(C_DIR, f), 'utf8')).join('\n');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const pageSource = () => fs.readFileSync(path.join(HERE, '../../ModeloBase1/render/ModeloBase1CadastroPage.jsx'), 'utf8');
const stableCopy = (o) => JSON.parse(JSON.stringify(o));

const EMP_ON = { MAK_MODELOBASE1_EMPRESAS_BETA: 'true' };
const CPS_ON = { MAK_MODELOBASE1_CADCPS_BETA: 'true' };
const empBetaState = async (env) => (await createModeloBase1BetaUiHardeningFromConfig({ config: { runtimeReadModel: createEmpresasModeloBase1BetaReadModel({ env }) } }));
const cpsBetaState = async (env) => (await createModeloBase1BetaUiHardeningFromConfig({ config: { runtimeReadModel: createCadcpsModeloBase1BetaReadModel({ env }) } }));

const betaState = (over = {}) => ({
  kind: 'modelobase1-runtime-read-state', moduleId: 'empresas', betaApplied: true, fallbackApplied: false,
  fallbackReason: null, source: 'runtime-v2-beta', writeBlocked: true, noSideEffects: true,
  runtimeReadModelPresent: true, runtimeReadModelValid: true,
  table: { columns: [{ id: 'a', label: 'A' }], visibleColumns: [{ id: 'a', label: 'A' }], rows: [{ id: 'r1', cells: { a: 'x' } }], rowCount: 1 },
  form: { fields: [{ id: 'a', label: 'A' }], visibleFields: [{ id: 'a', label: 'A' }], permissionsApplied: true },
  diagnostics: { warnings: [], blockers: [] },
  ...over,
});

describe('ModeloBase1 Beta UI Hardening (post-Foundation C)', () => {
  // 1
  it('hardening model cria checklist para Empresas (beta on)', async () => {
    const m = await empBetaState(EMP_ON);
    assert.equal(m.kind, 'modelobase1-beta-ui-hardening-model');
    assert.equal(m.moduleId, 'empresas');
    assert.ok(m.checklist.length > 0);
    assert.equal(m.hardeningStatus, 'hardened');
    assert.ok(m.checklist.every((i) => i.moduleId === 'empresas'));
  });

  // 2
  it('hardening model cria checklist para cadcps (beta on)', async () => {
    const m = await cpsBetaState(CPS_ON);
    assert.equal(m.moduleId, 'cadcps');
    assert.ok(m.checklist.length > 0);
    assert.equal(m.hardeningStatus, 'hardened');
  });

  // 3
  it('Empresas beta off → fallback, sem alterar comportamento', async () => {
    const m = await createModeloBase1BetaUiHardeningFromConfig({ config: { moduleId: 'empresas' } });
    assert.equal(m.betaApplied, false);
    assert.equal(m.writeBlocked, false);
    assert.equal(m.hardeningStatus, 'fallback');
    assert.equal(m.diagnostics.blockingFailures.length, 0);
  });

  // 4
  it('cadcps beta off → fallback, sem alterar comportamento', async () => {
    const m = await createModeloBase1BetaUiHardeningFromConfig({ config: { moduleId: 'cadcps' } });
    assert.equal(m.betaApplied, false);
    assert.equal(m.hardeningStatus, 'fallback');
  });

  // 5
  it('Empresas beta on passa checklist de estrutura', async () => {
    const m = await empBetaState(EMP_ON);
    const structure = m.checklist.filter((i) => i.category === 'structure');
    assert.ok(structure.length >= 4);
    assert.ok(structure.filter((i) => i.status === 'fail').length === 0);
  });

  // 6
  it('cadcps beta on passa checklist de estrutura', async () => {
    const m = await cpsBetaState(CPS_ON);
    const structure = m.checklist.filter((i) => i.category === 'structure');
    assert.ok(structure.filter((i) => i.status === 'fail').length === 0);
  });

  // 7
  it('table com rows vazios não quebra (empty state seguro)', () => {
    const m = createModeloBase1BetaUiHardeningModel({ state: betaState({ table: { columns: [{ id: 'a' }], visibleColumns: [], rows: [], rowCount: 0 } }) });
    const empty = m.checklist.find((i) => i.id === 'table.emptyStateSafe');
    assert.equal(empty.status, 'pass');
    assert.notEqual(m.hardeningStatus, 'needs_fixes');
  });

  // 8
  it('columns parciais geram warning/fallback seguro', () => {
    const m = createModeloBase1BetaUiHardeningModel({ state: betaState({ table: { columns: [{ id: 'a' }, { label: 'no-id' }], visibleColumns: [], rows: [], rowCount: 0 } }) });
    const wf = m.checklist.find((i) => i.id === 'table.columnsWellFormed');
    assert.equal(wf.status, 'warn');
    assert.notEqual(m.hardeningStatus, 'needs_fixes'); // warn is non-blocking
  });

  // 9
  it('fields parciais geram warning/fallback seguro', () => {
    const m = createModeloBase1BetaUiHardeningModel({ state: betaState({ form: { fields: [{ noId: true }], visibleFields: [] } }) });
    const wf = m.checklist.find((i) => i.id === 'form.fieldsWellFormed');
    assert.equal(wf.status, 'warn');
    assert.notEqual(m.hardeningStatus, 'needs_fixes');
  });

  // 10
  it('diagnostics ausente não quebra', () => {
    const m = createModeloBase1BetaUiHardeningModel({ state: betaState({ diagnostics: null }) });
    const d = m.checklist.find((i) => i.id === 'diagnostics.present');
    assert.equal(d.status, 'warn');
    assert.notEqual(m.hardeningStatus, 'needs_fixes');
  });

  // 11
  it('fallbackReason aparece quando runtimeReadModel inválido', async () => {
    const bad = { enabled: true, moduleId: 'empresas', moduleName: 'E', readOnly: false, injectedAt: 'x', source: 's', writeActionsBlocked: false, resolve: async () => ({}) };
    const m = await createModeloBase1BetaUiHardeningFromConfig({ config: { runtimeReadModel: bad } });
    assert.equal(m.betaApplied, false);
    assert.match(m.fallbackReason, /invalid-read-model/);
  });

  // 12
  it('writeBlocked true no beta', async () => {
    const m = await empBetaState(EMP_ON);
    assert.equal(m.writeBlocked, true);
    assert.equal(m.checklist.find((i) => i.id === 'security.writeBlocked').status, 'pass');
  });

  // 13
  it('save/submit bloqueados no beta (checklist form.noSubmit/noSave)', async () => {
    const m = await empBetaState(EMP_ON);
    assert.equal(m.checklist.find((i) => i.id === 'form.noSubmit').status, 'pass');
    assert.equal(m.checklist.find((i) => i.id === 'form.noSave').status, 'pass');
  });

  // 14
  it('create/update/delete bloqueados no beta (via write guard do model)', () => {
    const guard = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON }).writeGuard;
    for (const op of ['create', 'update', 'delete']) assert.equal(guard.attempt(op, {}).blocked, true);
  });

  // 15
  it('action/workflow/connector bloqueados no beta', () => {
    const guard = createCadcpsModeloBase1BetaReadModel({ env: CPS_ON }).writeGuard;
    for (const op of ['executeAction', 'startWorkflow', 'invokeConnector']) assert.equal(guard.attempt(op, {}).blocked, true);
  });

  // 16
  it('dados sensíveis são detectados/mascarados (table.sensitiveMasked)', () => {
    const leaky = createModeloBase1BetaUiChecklist(betaState({ table: { columns: [{ id: 'token' }], visibleColumns: [], rows: [{ id: 'r1', cells: { token: 'abc123' } }], rowCount: 1 } }));
    assert.equal(leaky.find((i) => i.id === 'table.sensitiveMasked').status, 'fail');
    const masked = createModeloBase1BetaUiChecklist(betaState());
    assert.equal(masked.find((i) => i.id === 'table.sensitiveMasked').status, 'pass');
  });

  // 17
  it('prototype pollution é bloqueado nas opções do hardening model', () => {
    const poisoned = JSON.parse('{"state":{"moduleId":"x"},"__proto__":{"y":1}}');
    assert.throws(() => createModeloBase1BetaUiHardeningModel(poisoned), ModeloBase1BetaUiHardeningError);
  });

  // 18
  it('retornos são cópias seguras (serializáveis)', async () => {
    const m = await empBetaState(EMP_ON);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(m)));
  });

  // 19
  it('mutar retorno não altera estado interno', () => {
    const state = betaState();
    const a = createModeloBase1BetaUiHardeningModel({ state });
    a.checklist.push({ id: 'INJECTED' });
    const b = createModeloBase1BetaUiHardeningModel({ state });
    assert.ok(!b.checklist.some((i) => i.id === 'INJECTED'));
  });

  // 20
  it('Empresas e cadcps usam o mesmo hardening base (mesmo kind/categorias)', async () => {
    const e = await empBetaState(EMP_ON);
    const c = await cpsBetaState(CPS_ON);
    assert.equal(e.kind, c.kind);
    const cats = (m) => [...new Set(m.checklist.map((i) => i.category))].sort();
    assert.deepEqual(cats(e), cats(c));
  });

  // 21
  it('outros consumidores sem runtimeReadModel ficam no-op (fallback)', async () => {
    const m = await createModeloBase1BetaUiHardeningFromConfig({ config: { moduleId: 'outra-tela' } });
    assert.equal(m.betaApplied, false);
    assert.equal(m.hardeningStatus, 'fallback');
    assert.ok(m.checklist.filter((i) => i.category === 'table' && i.status !== 'skipped').length === 0);
  });

  // 22 / 23 / 24 / 25 — source invariants (no backend/fetch/Prisma/MMM/runtimeBridge/storage)
  it('hardening não chama backend/fetch/Prisma/MMM/runtimeBridge/storage', () => {
    const code = codeOnly(hSource() + '\n' + cSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR/WebSocket');
    assert.ok(!/PrismaClient|from\s+['"].*prisma.*['"]|\bMMM\b/i.test(code), 'no Prisma/MMM');
    assert.ok(!/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(hSource() + cSource()), 'no backend/apis import');
    assert.ok(!/makBootstrap|\/runtimeBridge\//.test(code), 'no runtimeBridge/makBootstrap');
    assert.ok(!/localStorage|sessionStorage|indexedDB/.test(code), 'no web storage');
  });

  // 26 / 27 / 28 — page wiring minimal; no App/menu/other-screen coupling in wiring/components
  it('página consome o hardening model; badges/painel sem side effect', () => {
    const page = pageSource();
    assert.ok(/createModeloBase1BetaUiHardeningModel/.test(page), 'page builds the hardening model');
    assert.ok(/ModeloBase1RuntimeReadDiagnosticsPanel/.test(page), 'page renders the dev-only panel');
    assert.ok(/isModeloBase1BetaUiDiagnosticsEnabled/.test(page), 'panel is flag-gated');
    const compCode = codeOnly(cSource());
    assert.ok(!/onClick|onSubmit|onChange|handleSave|handleCreate|handleDelete|<form\b/.test(compCode), 'components carry no write side effects');
    assert.ok(!/addMenuItem|navItems|menu\.push/.test(compCode), 'no menu mutation');
  });

  // 29 / 30 / 31 — decoupled from src/runtime; no CSS import
  it('módulo de hardening desacoplado de src/runtime e sem CSS global', () => {
    const imports = [...codeOnly(hSource() + '\n' + cSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p)), 'ModeloBase1 hardening does not import src/runtime');
    assert.ok(!/import\s+['"][^'"]+\.css['"]/i.test(hSource() + cSource()), 'no CSS import');
  });

  // 32 — diagnostics panel is dev-only (flag off by default, fail-closed in prod)
  it('painel de diagnostics é dev-only (flag off por padrão, fail-closed em produção)', () => {
    assert.equal(MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG, 'MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS');
    assert.equal(isModeloBase1BetaUiDiagnosticsEnabled({}), false);
    assert.equal(isModeloBase1BetaUiDiagnosticsEnabled({ [MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG]: 'true' }), true);
    assert.equal(isModeloBase1BetaUiDiagnosticsEnabled({ [MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG]: 'true', NODE_ENV: 'production' }), false);
  });

  // 33 — diagnostics summarizer counts + readiness
  it('diagnostics summarizer conta status e readiness', () => {
    const checklist = createModeloBase1BetaUiChecklist(betaState());
    const diag = createModeloBase1BetaUiDiagnostics({ moduleId: 'empresas', checklist, state: betaState() });
    assert.equal(diag.kind, 'modelobase1-beta-ui-diagnostics');
    assert.equal(diag.hardeningStatus, 'hardened');
    assert.equal(diag.counts.fail, 0);
    assert.deepEqual(stableCopy(diag), stableCopy(createModeloBase1BetaUiDiagnostics({ moduleId: 'empresas', checklist, state: betaState() })));
  });

  // 34 — hardening model requires a state
  it('hardening model exige um read state (erro tipado)', () => {
    assert.throws(() => createModeloBase1BetaUiHardeningModel({}), ModeloBase1BetaUiHardeningError);
    assert.throws(() => createModeloBase1BetaUiHardeningModel(null), ModeloBase1BetaUiHardeningError);
  });
});
