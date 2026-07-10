import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveModeloBase1RuntimeReadModel } from '../../ModeloBase1/runtime-read-model/resolveModeloBase1RuntimeReadModel.js';
import {
  validateModeloBase1RuntimeReadModel,
  validateModeloBase1RuntimeReadPayload,
  REQUIRED_BLOCKED_WRITE_OPERATIONS,
} from '../../ModeloBase1/runtime-read-model/validateModeloBase1RuntimeReadModel.js';
import { applyModeloBase1RuntimeReadModel } from '../../ModeloBase1/runtime-read-model/applyModeloBase1RuntimeReadModel.js';
import { createModeloBase1RuntimeReadDiagnostics } from '../../ModeloBase1/runtime-read-model/createModeloBase1RuntimeReadDiagnostics.js';
import {
  createModeloBase1RuntimeReadFallbackState,
  isModeloBase1RuntimeReadFallback,
} from '../../ModeloBase1/runtime-read-model/modeloBase1RuntimeReadFallback.js';
import { ModeloBase1RuntimeReadError } from '../../ModeloBase1/runtime-read-model/errors.js';
import { findUnsafeContent, hasUnmaskedSensitive } from '../../ModeloBase1/runtime-read-model/safety.js';

import { createEmpresasModeloBase1BetaReadModel } from '../modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js';
import { createCadcpsModeloBase1BetaReadModel } from '../modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RW_DIR = path.join(HERE, '../../ModeloBase1/runtime-read-model');
const RW_FILES = [
  'errors.js',
  'safety.js',
  'types.js',
  'resolveModeloBase1RuntimeReadModel.js',
  'validateModeloBase1RuntimeReadModel.js',
  'applyModeloBase1RuntimeReadModel.js',
  'createModeloBase1RuntimeReadDiagnostics.js',
  'modeloBase1RuntimeReadFallback.js',
  'useModeloBase1RuntimeReadModel.js',
];
const rwSource = () => RW_FILES.map((f) => fs.readFileSync(path.join(RW_DIR, f), 'utf8')).join('\n');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const pageSource = () => fs.readFileSync(path.join(HERE, '../../ModeloBase1/render/ModeloBase1CadastroPage.jsx'), 'utf8');
const stableCopy = (o) => JSON.parse(JSON.stringify(o));

const EMP_ON = { MAK_MODELOBASE1_EMPRESAS_BETA: 'true' };
const CPS_ON = { MAK_MODELOBASE1_CADCPS_BETA: 'true' };
const empModel = (env) => createEmpresasModeloBase1BetaReadModel({ env });
const cpsModel = (env) => createCadcpsModeloBase1BetaReadModel({ env });
const WRITE_OPS = ['create', 'update', 'delete', 'save', 'submit', 'bulkCreate', 'bulkUpdate', 'bulkDelete', 'executeAction', 'startWorkflow', 'invokeConnector'];

describe('ModeloBase1 Runtime Wiring (post-Foundation C)', () => {
  // 1
  it('runtimeReadModel ausente → fallback (comportamento atual)', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: {} });
    assert.equal(s.betaApplied, false);
    assert.equal(s.fallbackApplied, true);
    assert.equal(s.writeBlocked, false);
    assert.equal(s.fallbackReason, 'runtime-read-model-absent');
  });

  // 2
  it('runtimeReadModel disabled → fallback', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel({}) } });
    assert.equal(s.betaApplied, false);
    assert.equal(s.fallbackReason, 'runtime-read-model-disabled');
    assert.equal(s.writeBlocked, false);
  });

  // 3
  it('runtimeReadModel inválido → fallback (não quebra)', async () => {
    const bad = { enabled: true, moduleId: 'x', moduleName: 'X', readOnly: false, injectedAt: 'y', source: 's', writeActionsBlocked: false, resolve: async () => ({}) };
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: bad } });
    assert.equal(s.betaApplied, false);
    assert.equal(s.fallbackApplied, true);
    assert.match(s.fallbackReason, /invalid-read-model/);
  });

  // 4
  it('runtimeReadModel enabled/válido → aplica beta', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.equal(s.betaApplied, true);
    assert.equal(s.fallbackApplied, false);
    assert.equal(s.source, 'runtime-v2-beta');
    assert.equal(s.writeBlocked, true);
  });

  // 5
  it('Empresas flag off → config sem runtimeReadModel (fallback)', () => {
    const model = empModel({});
    // A config de Empresas passa null quando off; simulamos o resultado do builder:
    const resolution = resolveModeloBase1RuntimeReadModel({ moduleId: 'empresas' });
    assert.equal(resolution.present, false);
    assert.equal(model.enabled, false);
  });

  // 6
  it('Empresas flag on → config consumível pelo ModeloBase1', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.equal(s.moduleId, 'empresas');
    assert.equal(s.tableApplied, true);
    assert.ok(s.table.columns.length > 0);
    assert.ok(s.table.rowCount > 0);
  });

  // 7
  it('cadcps flag off → não presente/disabled', () => {
    assert.equal(cpsModel({}).enabled, false);
  });

  // 8
  it('cadcps flag on → config consumível pelo ModeloBase1', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: cpsModel(CPS_ON) } });
    assert.equal(s.moduleId, 'cadcps');
    assert.equal(s.betaApplied, true);
    assert.ok(s.form.fields.length > 0);
  });

  // 9
  it('Empresas e cadcps compartilham o mesmo resolver/apply base', async () => {
    const e = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    const c = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: cpsModel(CPS_ON) } });
    assert.equal(e.kind, c.kind);
    assert.equal(e.source, c.source);
    assert.equal(e.writeBlocked, c.writeBlocked);
  });

  // 10
  it('table/columns aplicadas quando válidas', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.ok(Array.isArray(s.table.columns));
    assert.equal(s.tableApplied, true);
  });

  // 11
  it('rows aplicadas quando válidas', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.ok(Array.isArray(s.table.rows));
    assert.equal(s.table.rowCount, s.table.rows.length);
    assert.ok(s.table.rowCount > 0);
  });

  // 12
  it('form/fields aplicados quando válidos', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.equal(s.formApplied, true);
    assert.ok(Array.isArray(s.form.fields));
  });

  // 13
  it('diagnostics são gerados', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.equal(s.diagnostics.kind, 'modelobase1-runtime-read-diagnostics');
    assert.equal(s.diagnostics.betaApplied, true);
    assert.equal(s.diagnostics.writeBlocked, true);
    assert.equal(s.diagnostics.protectedScopes.write, 'blocked');
  });

  // 14
  it('fallbackReason é gerado nos caminhos de fallback', async () => {
    const absent = await applyModeloBase1RuntimeReadModel({ config: {} });
    assert.ok(absent.fallbackReason);
    const disabled = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel({}) } });
    assert.ok(disabled.fallbackReason);
  });

  // 15
  it('write real permanece bloqueado (writeBlocked + writeGuard do model)', async () => {
    const model = empModel(EMP_ON);
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: model } });
    assert.equal(s.writeBlocked, true);
    assert.equal(model.writeGuard.attempt('save', {}).blocked, true);
  });

  // 16
  it('save/submit/create/update/delete bloqueados no modo beta (via write guard)', () => {
    const guard = empModel(EMP_ON).writeGuard;
    for (const op of ['save', 'submit', 'create', 'update', 'delete']) {
      assert.equal(guard.attempt(op, {}).blocked, true);
    }
  });

  // 17
  it('action/workflow/connector bloqueados no modo beta', () => {
    const guard = cpsModel(CPS_ON).writeGuard;
    for (const op of ['executeAction', 'startWorkflow', 'invokeConnector']) {
      assert.equal(guard.attempt(op, {}).blocked, true);
    }
  });

  // 18
  it('payload com função/handler é rejeitado (fallback)', async () => {
    const m = { enabled: true, moduleId: 'x', moduleName: 'X', readOnly: true, injectedAt: 'a', source: 's', writeActionsBlocked: true, resolve: async () => ({ table: { columns: [], evil: () => {} } }) };
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: m } });
    assert.equal(s.betaApplied, false);
    assert.match(s.fallbackReason, /unsafe-payload/);
  });

  // 19
  it('payload com React element é rejeitado', () => {
    const v = validateModeloBase1RuntimeReadPayload({ table: { el: { $$typeof: Symbol.for('react.element') } } });
    assert.equal(v.valid, false);
  });

  // 20
  it('prototype pollution é bloqueado', () => {
    const poisoned = JSON.parse('{"table":{"__proto__":{"x":1}}}');
    assert.equal(validateModeloBase1RuntimeReadPayload(poisoned).valid, false);
    assert.ok(findUnsafeContent(poisoned));
  });

  // 21
  it('dados sensíveis não mascarados são rejeitados', () => {
    assert.equal(hasUnmaskedSensitive({ row: { password: 'secret123' } }), true);
    assert.equal(validateModeloBase1RuntimeReadPayload({ row: { password: 'secret123' } }).valid, false);
    assert.equal(hasUnmaskedSensitive({ row: { password: '[REDACTED]' } }), false);
  });

  // 22
  it('retornos são cópias seguras', async () => {
    const s = await applyModeloBase1RuntimeReadModel({ config: { runtimeReadModel: empModel(EMP_ON) } });
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(s)));
  });

  // 23
  it('mutar retorno não altera estado interno (determinismo entre chamadas)', async () => {
    const cfg = { runtimeReadModel: empModel(EMP_ON) };
    const a = await applyModeloBase1RuntimeReadModel({ config: cfg });
    a.table.columns.push({ id: 'INJECTED' });
    const b = await applyModeloBase1RuntimeReadModel({ config: cfg });
    assert.ok(!b.table.columns.some((c) => c.id === 'INJECTED'));
  });

  // 24 / 25 / 26 / 27 — source invariants (no backend/fetch/Prisma/MMM/runtimeBridge/storage)
  it('wiring não chama backend/fetch/Prisma/MMM/runtimeBridge/storage', () => {
    // safety.js is the sanctioned DETECTOR — it necessarily names these tokens in
    // its regexes; scan every other file for actual usage.
    const filesNoDetector = RW_FILES.filter((f) => f !== 'safety.js');
    const code = codeOnly(filesNoDetector.map((f) => fs.readFileSync(path.join(RW_DIR, f), 'utf8')).join('\n'));
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR/WebSocket');
    assert.ok(!/PrismaClient|from\s+['"].*prisma.*['"]/i.test(code), 'no Prisma');
    assert.ok(!/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(rwSource()), 'no backend/apis import');
    assert.ok(!/makBootstrap|\/runtimeBridge\//.test(code), 'no runtimeBridge/makBootstrap');
    assert.ok(!/localStorage|sessionStorage|indexedDB/.test(code), 'no web storage');
  });

  // 28 / 29 / 30 — page wiring is minimal & does not add App/menu/other-screen coupling
  it('page consome o runtime read model e não acopla App/menu/outras telas', () => {
    const page = pageSource();
    assert.ok(/useModeloBase1RuntimeReadModel/.test(page), 'page uses the wiring hook');
    assert.ok(/blockRuntimeReadWrite/.test(page), 'page blocks writes when beta applied');
    assert.ok(/guardedHandleSubmit/.test(page), 'page guards submit');
    const pageCode = codeOnly(page);
    assert.ok(!/addMenuItem|navItems|menu\.push/.test(pageCode), 'no menu mutation');
  });

  // 31 / 32 / 33 — no backend/Prisma/runtimeBridge modification (import-level)
  it('não importa backend/Prisma/runtimeBridge no módulo de wiring', () => {
    const imports = [...codeOnly(rwSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => !/\/apis\/|prisma|\/backend\/|makBootstrap|\/runtimeBridge\//i.test(p)));
    // must NOT import the runtime module (ModeloBase1 stays decoupled)
    assert.ok(imports.every((p) => !/^@\/runtime\/|^\.\.\/\.\.\/runtime\//.test(p)), 'ModeloBase1 wiring does not import src/runtime');
  });

  // 34 — no global CSS import
  it('não adiciona import de CSS global', () => {
    assert.ok(!/import\s+['"][^'"]+\.css['"]/i.test(rwSource()));
  });

  // 35 — required blocked ops cover the standard write surface
  it('REQUIRED_BLOCKED_WRITE_OPERATIONS cobre a superfície de escrita', () => {
    for (const op of WRITE_OPS) assert.ok(REQUIRED_BLOCKED_WRITE_OPERATIONS.includes(op));
  });

  // 36 — fallback helpers + resolver + validator surface
  it('fallback state helpers e resolver/validator comportam-se corretamente', () => {
    const fb = createModeloBase1RuntimeReadFallbackState({ moduleId: 'empresas' });
    assert.equal(fb.betaApplied, false);
    assert.equal(isModeloBase1RuntimeReadFallback(fb), true);
    assert.equal(isModeloBase1RuntimeReadFallback({ betaApplied: true, fallbackApplied: false }), false);
    assert.equal(resolveModeloBase1RuntimeReadModel(null).present, false);
    assert.equal(validateModeloBase1RuntimeReadModel(empModel(EMP_ON)).valid, true);
    assert.throws(() => { throw new ModeloBase1RuntimeReadError('MAK-MB1-RW-004', 'x'); }, ModeloBase1RuntimeReadError);
    const diag = createModeloBase1RuntimeReadDiagnostics({ moduleId: 'empresas', enabled: true, valid: true, betaApplied: true, writeBlocked: true });
    assert.equal(diag.writeBlocked, true);
    assert.deepEqual(stableCopy(diag), stableCopy(createModeloBase1RuntimeReadDiagnostics({ moduleId: 'empresas', enabled: true, valid: true, betaApplied: true, writeBlocked: true })));
  });
});
