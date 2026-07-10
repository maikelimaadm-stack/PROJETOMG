import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_FLAG,
  EMPRESAS_LOCAL_WRITE_PLAN_FLAG,
  CADCPS_LOCAL_WRITE_PLAN_FLAG,
  isEmpresasLocalWritePlanEnabled,
  isCadcpsLocalWritePlanEnabled,
  isModeloBase1LocalWritePlanEnabled,
} from '../../ModeloBase1/runtime-read-model/local-write/modeloBase1LocalWriteConfig.js';
import {
  createModeloBase1LocalWriteContract,
  LOCAL_WRITE_ALLOWED_OPERATIONS,
  LOCAL_WRITE_BLOCKED_OPERATIONS,
} from '../../ModeloBase1/runtime-read-model/local-write/createModeloBase1LocalWriteContract.js';
import { validateModeloBase1LocalWritePayload } from '../../ModeloBase1/runtime-read-model/local-write/validateModeloBase1LocalWritePayload.js';
import { applyModeloBase1LocalWriteMutation } from '../../ModeloBase1/runtime-read-model/local-write/applyModeloBase1LocalWriteMutation.js';
import { createModeloBase1LocalWriteController } from '../../ModeloBase1/runtime-read-model/local-write/createModeloBase1LocalWriteController.js';
import { createModeloBase1ControlledLocalWritePlan } from '../../ModeloBase1/runtime-read-model/local-write/createModeloBase1ControlledLocalWritePlan.js';
import { ModeloBase1LocalWriteError } from '../../ModeloBase1/runtime-read-model/local-write/errors.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LW_DIR = path.join(HERE, '../../ModeloBase1/runtime-read-model/local-write');
const LW_FILES = [
  'errors.js',
  'modeloBase1LocalWriteConfig.js',
  'createModeloBase1LocalWriteContract.js',
  'validateModeloBase1LocalWritePayload.js',
  'applyModeloBase1LocalWriteMutation.js',
  'createModeloBase1LocalWriteController.js',
  'createModeloBase1ControlledLocalWritePlan.js',
  'modeloBase1LocalWriteDiagnostics.js',
];
const C_FILES = ['components/ModeloBase1LocalWritePlanPanel.jsx', 'components/ModeloBase1LocalWriteStatusBadge.jsx'];
const lwSource = () => LW_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(LW_DIR, f), 'utf8')).join('\n');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const EMP_ON = { [EMPRESAS_LOCAL_WRITE_PLAN_FLAG]: 'true' };
const CPS_ON = { [CADCPS_LOCAL_WRITE_PLAN_FLAG]: 'true' };
const UMBRELLA = { [MODELOBASE1_CONTROLLED_LOCAL_WRITE_PLAN_FLAG]: 'true' };

const readState = (moduleId = 'empresas') => ({
  kind: 'modelobase1-runtime-read-state', moduleId, betaApplied: true, writeBlocked: true, source: 'runtime-v2-beta',
  table: { columns: [{ id: 'razao_social' }], rows: [{ id: 'r1', cells: { razao_social: 'ACME' } }], rowCount: 1 },
  form: { fields: [{ id: 'razao_social' }] },
});
const planOn = (moduleId = 'empresas', env = EMP_ON) => createModeloBase1ControlledLocalWritePlan({ readState: readState(moduleId), env });

describe('ModeloBase1 Controlled Local Write Plan (post-Foundation C)', () => {
  // 1
  it('flags desligadas por padrão', () => {
    assert.equal(isEmpresasLocalWritePlanEnabled({}), false);
    assert.equal(isCadcpsLocalWritePlanEnabled({}), false);
    assert.equal(isModeloBase1LocalWritePlanEnabled('empresas', {}), false);
  });

  // 2 / 34
  it('local write plan só liga com flag (rollback por flag off)', () => {
    assert.equal(createModeloBase1ControlledLocalWritePlan({ readState: readState(), env: {} }).enabled, false);
    assert.equal(createModeloBase1ControlledLocalWritePlan({ readState: readState(), env: {} }).controller, null);
    assert.equal(planOn().enabled, true);
  });

  // 3
  it('Empresas plan liga com flag específica ou umbrella', () => {
    assert.equal(isEmpresasLocalWritePlanEnabled(EMP_ON), true);
    assert.equal(isEmpresasLocalWritePlanEnabled(UMBRELLA), true);
    assert.equal(isCadcpsLocalWritePlanEnabled(EMP_ON), false);
  });

  // 4
  it('cadcps plan liga com flag específica ou umbrella', () => {
    assert.equal(isCadcpsLocalWritePlanEnabled(CPS_ON), true);
    assert.equal(isCadcpsLocalWritePlanEnabled(UMBRELLA), true);
    assert.equal(isEmpresasLocalWritePlanEnabled(CPS_ON), false);
  });

  // 5
  it('contract contém allowedOperations locais', () => {
    const c = createModeloBase1LocalWriteContract({ moduleId: 'empresas', enabled: true });
    for (const op of ['planCreate', 'planUpdate', 'planDelete', 'planSave', 'planSubmit', 'simulateLocalMutation', 'inspectLocalDraft', 'validatePayload', 'reportDiagnostics']) {
      assert.ok(c.allowedOperations.includes(op));
    }
    assert.equal(c.mode, 'controlled_local_write_plan');
  });

  // 6 / 7 / 8 / 9 / 10
  it('contract bloqueia backend/Prisma/fetch/storage/runtimeBridge/global', () => {
    const c = createModeloBase1LocalWriteContract({ moduleId: 'empresas', enabled: true });
    for (const op of ['backendCreate', 'backendUpdate', 'backendDelete', 'prismaCreate', 'prismaUpdate', 'prismaDelete', 'fetchWrite', 'persistStorage', 'mutateRuntimeBridge', 'mutateGlobalRuntime']) {
      assert.ok(c.blockedOperations.includes(op));
    }
  });

  // 11 / 12
  it('controller cria cópia segura e não muta o read state original', () => {
    const state = readState();
    const controller = createModeloBase1LocalWriteController({ readState: state, moduleId: 'empresas' });
    controller.createRow({ cells: { razao_social: 'NOVA' } });
    assert.equal(state.table.rows.length, 1); // original unchanged
    assert.equal(controller.inspectLocalDraft().table.rows.length, 2); // draft advanced
  });

  // 13
  it('createRow local funciona em cópia (id local determinístico)', () => {
    const c = planOn().controller;
    const r = c.createRow({ cells: { razao_social: 'X' } });
    assert.equal(r.ok, true);
    assert.equal(r.localId, 'local-empresas-1');
    assert.equal(r.localOnly, true);
  });

  // 14
  it('updateRow local funciona em cópia', () => {
    const c = planOn().controller;
    const r = c.updateRow('r1', { cells: { razao_social: 'EDITADA' } });
    assert.equal(r.ok, true);
    assert.equal(c.inspectLocalDraft().table.rows.find((x) => x.id === 'r1').cells.razao_social, 'EDITADA');
  });

  // 15
  it('deleteRow local funciona em cópia (soft, reversível)', () => {
    const c = planOn().controller;
    const r = c.deleteRow('r1');
    assert.equal(r.ok, true);
    assert.equal(c.inspectLocalDraft().table.rows.find((x) => x.id === 'r1')._localDeleted, true);
  });

  // 16
  it('saveDraft é localOnly', () => {
    const r = planOn().controller.saveDraft();
    assert.equal(r.localOnly, true);
    assert.equal(r.savedLocally, true);
    assert.equal(r.backendTouched, false);
  });

  // 17
  it('submitDraft é simulatedSubmit/localOnly (não envia)', () => {
    const r = planOn().controller.submitDraft();
    assert.equal(r.simulatedSubmit, true);
    assert.equal(r.sent, false);
    assert.equal(r.localOnly, true);
  });

  // 18
  it('payload válido passa', () => {
    const v = validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { cells: { razao_social: 'OK' } } });
    assert.equal(v.valid, true);
    assert.equal(v.safeToApply, true);
  });

  // 19 / 20
  it('payload com função/handler falha', () => {
    assert.equal(validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { fn: () => {} } }).valid, false);
    assert.equal(validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { onClick: () => {} } }).valid, false);
  });

  // 21
  it('payload com React element falha', () => {
    const v = validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { el: { $$typeof: Symbol.for('react.element') } } });
    assert.equal(v.valid, false);
  });

  // 22
  it('prototype pollution é bloqueado', () => {
    const v = validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: JSON.parse('{"__proto__":{"x":1}}') });
    assert.equal(v.valid, false);
  });

  // 23
  it('operação desconhecida falha fechado', () => {
    const v = validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'frobnicate', payload: {} });
    assert.equal(v.valid, false);
    assert.ok(v.blockers.some((b) => /not an allowed local mutation/.test(b)));
  });

  // 24 / 25 / 26
  it('backend/Prisma/runtimeBridge target no payload falha', () => {
    for (const target of ['backend', 'prisma', 'runtimeBridge']) {
      assert.equal(validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { target, cells: {} } }).valid, false);
    }
    assert.equal(validateModeloBase1LocalWritePayload({ moduleId: 'empresas', operation: 'createRow', payload: { backendUrl: '/api/x' } }).valid, false);
  });

  // 27 / 28 / 29
  it('diagnostics informam backendTouched/prismaTouched/runtimeBridgeTouched false', () => {
    const d = planOn().controller.createRow({ cells: {} });
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    const diag = planOn().diagnostics;
    assert.equal(diag.backendTouched, false);
    assert.equal(diag.prismaTouched, false);
    assert.equal(diag.runtimeBridgeTouched, false);
    assert.equal(diag.persistence, 'none');
  });

  // 30 / 31 / 32
  it('Empresas e cadcps usam o mesmo controller base (sem arquitetura separada)', () => {
    const emp = planOn('empresas', EMP_ON);
    const cps = planOn('cadcps', CPS_ON);
    assert.equal(emp.kind, cps.kind);
    assert.equal(emp.controller.kind, cps.controller.kind);
    assert.equal(emp.contract.mode, cps.contract.mode);
    assert.notEqual(emp.moduleId, cps.moduleId);
  });

  // 33
  it('fallback continua disponível (plan carrega fallback/rollback)', () => {
    const plan = planOn();
    assert.equal(plan.fallbackAvailable, true);
    assert.equal(plan.rollbackAvailable, true);
    assert.equal(plan.contract.fallback.available, true);
  });

  // apply mutation determinism + safe copy
  it('applyModeloBase1LocalWriteMutation é determinístico e não muta a entrada', () => {
    const draft = { moduleId: 'empresas', table: { columns: [], rows: [{ id: 'r1', cells: {} }], rowCount: 1 } };
    const a = applyModeloBase1LocalWriteMutation({ draft, operation: 'createRow', payload: { cells: { x: 1 } }, moduleId: 'empresas', sequence: 1 });
    const b = applyModeloBase1LocalWriteMutation({ draft, operation: 'createRow', payload: { cells: { x: 1 } }, moduleId: 'empresas', sequence: 1 });
    assert.equal(draft.table.rows.length, 1); // input untouched
    assert.deepEqual(a.nextDraft, b.nextDraft); // deterministic
    assert.equal(a.localOnly, true);
  });

  // updateRow/deleteRow on missing id → fail-closed (not found)
  it('updateRow/deleteRow em id inexistente falham (not found, sem mutação)', () => {
    const c = planOn().controller;
    assert.equal(c.updateRow('missing', { cells: {} }).ok, false);
    assert.equal(c.deleteRow('missing').ok, false);
  });

  // errors typed
  it('controller/plan exigem opções plain (erro tipado)', () => {
    assert.throws(() => createModeloBase1LocalWriteController(null), ModeloBase1LocalWriteError);
    assert.throws(() => createModeloBase1ControlledLocalWritePlan(null), ModeloBase1LocalWriteError);
  });

  // 35 / 36 / 37 / 38 — source invariants (detector aside — this module has no detector file)
  it('módulo local-write não chama backend/fetch/Prisma/MMM/runtimeBridge/storage', () => {
    const code = codeOnly(lwSource() + '\n' + cSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR/WebSocket');
    assert.ok(!/PrismaClient|from\s+['"].*prisma.*['"]|\bMMM\b/i.test(code), 'no Prisma/MMM');
    assert.ok(!/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(lwSource() + cSource()), 'no backend/apis import');
    assert.ok(!/makBootstrap|\/runtimeBridge\//.test(code), 'no runtimeBridge/makBootstrap');
    // storage tokens only appear as blocked-target strings, never as actual API calls:
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no web storage API calls');
  });

  // 39 — decoupled from src/runtime
  it('módulo local-write desacoplado de src/runtime', () => {
    const imports = [...codeOnly(lwSource() + '\n' + cSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p)), 'does not import src/runtime');
  });

  // 40 / 45 — components no side effects / no CSS
  it('componentes dev-only sem side effect e sem CSS global', () => {
    const compCode = codeOnly(cSource());
    assert.ok(!/onClick|onSubmit|onChange|handleSave|handleCreate|handleDelete|<form\b|type=["']submit["']/.test(compCode), 'no write side effects');
    assert.ok(!/addMenuItem|navItems|menu\.push/.test(compCode), 'no menu mutation');
    assert.ok(!/import\s+['"][^'"]+\.css['"]/i.test(lwSource() + cSource()), 'no CSS import');
  });

  // 46 — next step is Activation, not backend write
  it('próximo passo é Controlled Local Write Activation (não backend write)', () => {
    const plan = planOn();
    assert.equal(plan.nextAllowedStep, 'ModeloBase1 Controlled Local Write Activation');
    assert.ok(!/backend/i.test(plan.nextAllowedStep));
  });

  // safe copies
  it('plan e retornos são cópias seguras (serializáveis exceto o controller vivo)', () => {
    const plan = planOn();
    const { controller, ...rest } = plan;
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(rest)));
    assert.ok(controller && typeof controller.createRow === 'function');
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(controller.inspectLocalDraft())));
  });

  // allowed/blocked op count sanity
  it('contract expõe contagem de operações allowed/blocked', () => {
    assert.ok(LOCAL_WRITE_ALLOWED_OPERATIONS.length >= 9);
    assert.ok(LOCAL_WRITE_BLOCKED_OPERATIONS.length >= 13);
  });
});
