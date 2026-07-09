import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createExecutionEngine, ExecutionEngine } from '../../core/execution/executionEngine.js';
import { ExecutionError } from '../../core/execution/errors.js';
import { createActionEngine } from '../../core/action/actionEngine.js';
import { createWorkflowEngine } from '../../core/workflow/workflowEngine.js';
import { createValidationEngine } from '../../core/validation/validationEngine.js';
import { createPermissionEngine } from '../../core/permission/permissionEngine.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {string[]} permissions */
function buildCtx(permissions) {
  return { accessScope: { tenantId: 't1', userId: 'u1', companies: [], permissions, locale: 'pt-BR' } };
}

/**
 * @param {Object} [options]
 * @param {{code: string, payload?: Object}[]} [options.actions]
 * @param {{code: string, payload?: Object}[]} [options.workflows]
 * @param {{code: string, rules: Object[]}[]} [options.validations]
 * @param {{code: string, payload?: Object}[]} [options.permissions]
 */
function buildRegistry(options = {}) {
  const registry = createRegistry();
  for (const entry of options.actions ?? []) {
    registry.register('action', entry.code, () => ({ code: entry.code, objectType: 'action', payload: entry.payload ?? {} }));
  }
  for (const entry of options.workflows ?? []) {
    registry.register('workflow', entry.code, () => ({ code: entry.code, objectType: 'workflow', payload: entry.payload ?? {} }));
  }
  for (const entry of options.validations ?? []) {
    registry.register('validation', entry.code, () => ({
      code: entry.code,
      objectType: 'validation',
      payload: { rules: entry.rules },
    }));
  }
  for (const entry of options.permissions ?? []) {
    registry.register('permission', entry.code, () => ({ code: entry.code, objectType: 'permission', payload: entry.payload ?? {} }));
  }
  registry.freeze();
  return registry;
}

describe('M16 — Execution Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildRegistry();
    const engine = createExecutionEngine({ registry });
    assert.ok(engine instanceof ExecutionEngine);
  });

  it('criar engine sem registry válido lança ExecutionError MAK-L3-EXECUTION-001', () => {
    assert.throws(
      () => createExecutionEngine({}),
      (err) => err instanceof ExecutionError && err.code === 'MAK-L3-EXECUTION-001',
    );
  });

  it('execute() com comando tipo "action" delega ao Action Engine e retorna sucesso', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.save' }] });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async (payload) => ({ savedId: payload.id }));
    const engine = createExecutionEngine({ registry, actionEngine });

    const result = await engine.execute({ type: 'action.empresa.save', payload: { id: 42 } }, buildCtx([]));
    assert.equal(result.success, true);
    assert.deepEqual(result.data, { savedId: 42 });
  });

  it('execute() com comando tipo "workflow" delega ao Workflow Engine e retorna sucesso', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.save' }],
      workflows: [{ code: 'empresa_approval', payload: { steps: [{ id: 'step-1', type: 'action', action: 'empresa.save' }] } }],
    });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async () => ({ ok: true }));
    const workflowEngine = createWorkflowEngine({ registry, actionEngine });
    const engine = createExecutionEngine({ registry, workflowEngine });

    const result = await engine.execute({ type: 'workflow.empresa_approval', payload: {} }, buildCtx([]));
    assert.equal(result.success, true);
    assert.equal(result.data.instance.status, 'completed');
  });

  it('comando inexistente/inválido falha com MAK-L3-EXECUTION-002', async () => {
    const registry = buildRegistry();
    const engine = createExecutionEngine({ registry });

    const missingType = await engine.execute({ payload: {} }, buildCtx([]));
    assert.equal(missingType.success, false);
    assert.equal(missingType.error.code, 'MAK-L3-EXECUTION-002');

    const missingPayload = await engine.execute({ type: 'action.empresa.save' }, buildCtx([]));
    assert.equal(missingPayload.success, false);
    assert.equal(missingPayload.error.code, 'MAK-L3-EXECUTION-002');

    const invalidKind = await engine.execute({ type: 'action.empresa.save', kind: 'bogus', payload: {} }, buildCtx([]));
    assert.equal(invalidKind.success, false);
    assert.equal(invalidKind.error.code, 'MAK-L3-EXECUTION-002');
  });

  it('tipo de execução desconhecido falha com MAK-L3-EXECUTION-003', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.save' }] });
    const engine = createExecutionEngine({ registry, actionEngine: createActionEngine({ registry }) });

    const unroutable = await engine.execute({ type: 'render.something', payload: {} }, buildCtx([]));
    assert.equal(unroutable.success, false);
    assert.equal(unroutable.error.code, 'MAK-L3-EXECUTION-003');

    const unknownAction = await engine.execute({ type: 'action.does_not_exist', payload: {} }, buildCtx([]));
    assert.equal(unknownAction.success, false);
    assert.equal(unknownAction.error.code, 'MAK-L3-EXECUTION-003');
  });

  it('contexto inválido falha com MAK-L3-EXECUTION-002', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.save' }] });
    const engine = createExecutionEngine({ registry, actionEngine: createActionEngine({ registry }) });

    const nullCtx = await engine.execute({ type: 'action.empresa.save', payload: {} }, null);
    assert.equal(nullCtx.success, false);
    assert.equal(nullCtx.error.code, 'MAK-L3-EXECUTION-002');

    const primitiveCtx = await engine.execute({ type: 'action.empresa.save', payload: {} }, 'not-an-object');
    assert.equal(primitiveCtx.success, false);
    assert.equal(primitiveCtx.error.code, 'MAK-L3-EXECUTION-002');
  });

  it('payload inválido bloqueia via Validation Engine (MAK-L3-EXECUTION-006)', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.save', payload: { validation: 'empresa_save_rules' } }],
      validations: [{ code: 'empresa_save_rules', rules: [{ rule: 'required', field: 'razao_social' }] }],
    });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async () => ({ ok: true }));
    const validationEngine = createValidationEngine({ registry });
    const engine = createExecutionEngine({ registry, actionEngine, validationEngine });

    const result = await engine.execute({ type: 'action.empresa.save', payload: { razao_social: '' } }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-EXECUTION-006');
    assert.equal(result.data.validation.valid, false);
  });

  it('payload válido passa pela Validation Engine e executa normalmente', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.save', payload: { validation: 'empresa_save_rules' } }],
      validations: [{ code: 'empresa_save_rules', rules: [{ rule: 'required', field: 'razao_social' }] }],
    });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async (payload) => ({ savedId: payload.razao_social }));
    const validationEngine = createValidationEngine({ registry });
    const engine = createExecutionEngine({ registry, actionEngine, validationEngine });

    const result = await engine.execute({ type: 'action.empresa.save', payload: { razao_social: 'Acme' } }, buildCtx([]));
    assert.equal(result.success, true);
    assert.deepEqual(result.data, { savedId: 'Acme' });
  });

  it('permissão concedida permite a execução', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.delete', payload: { permission: 'empresa.delete' } }],
      permissions: [{ code: 'empresa.delete', payload: { effect: 'allow' } }],
    });
    const permissionEngine = createPermissionEngine({ registry });
    const actionEngine = createActionEngine({ registry, permissionEngine });
    actionEngine.bind('empresa.delete', async () => ({ deleted: true }));
    const engine = createExecutionEngine({ registry, actionEngine, permissionEngine });

    const result = await engine.execute({ type: 'action.empresa.delete', payload: {} }, buildCtx(['empresa.delete']));
    assert.equal(result.success, true);
    assert.deepEqual(result.data, { deleted: true });
  });

  it('permissão negada bloqueia a execução com MAK-L3-EXECUTION-005', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.delete', payload: { permission: 'empresa.delete' } }],
    });
    const actionEngine = createActionEngine({ registry });
    let executed = false;
    actionEngine.bind('empresa.delete', async () => {
      executed = true;
      return { deleted: true };
    });
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createExecutionEngine({ registry, actionEngine, permissionEngine });

    const result = await engine.execute({ type: 'action.empresa.delete', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-EXECUTION-005');
    assert.equal(executed, false);
  });

  it('falha do Action Engine retorna erro controlado (sem lançar)', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.save' }] });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async () => {
      throw new Error('boom');
    });
    const engine = createExecutionEngine({ registry, actionEngine });

    const result = await engine.execute({ type: 'action.empresa.save', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-006');
  });

  it('falha do Workflow Engine retorna erro controlado (sem lançar)', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.save' }],
      workflows: [{ code: 'empresa_approval', payload: { steps: [{ id: 'step-1', type: 'action', action: 'empresa.save' }] } }],
    });
    const actionEngine = createActionEngine({ registry }); // no handler bound — dispatch will fail
    const workflowEngine = createWorkflowEngine({ registry, actionEngine });
    const engine = createExecutionEngine({ registry, workflowEngine });

    const result = await engine.execute({ type: 'workflow.empresa_approval', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.data.instance.status, 'failed');
  });

  it('ausência de Action Engine falha de forma previsível (MAK-L3-EXECUTION-004)', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.save' }] });
    const engine = createExecutionEngine({ registry });

    const result = await engine.execute({ type: 'action.empresa.save', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-EXECUTION-004');
  });

  it('ausência de Workflow Engine falha de forma previsível (MAK-L3-EXECUTION-004)', async () => {
    const registry = buildRegistry({ workflows: [{ code: 'empresa_approval', payload: { steps: [{ id: 's1', type: 'action', action: 'x' }] } }] });
    const engine = createExecutionEngine({ registry });

    const result = await engine.execute({ type: 'workflow.empresa_approval', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-EXECUTION-004');
  });

  it('ausência de Validation Engine quando validação é exigida falha de forma previsível (MAK-L3-EXECUTION-004)', async () => {
    const registry = buildRegistry({
      actions: [{ code: 'empresa.save', payload: { validation: 'empresa_save_rules' } }],
      validations: [{ code: 'empresa_save_rules', rules: [{ rule: 'required', field: 'razao_social' }] }],
    });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async () => ({ ok: true }));
    const engine = createExecutionEngine({ registry, actionEngine }); // no validationEngine wired

    const result = await engine.execute({ type: 'action.empresa.save', payload: { razao_social: 'Acme' } }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-EXECUTION-004');
  });

  it('ausência de Permission Engine quando permissão é exigida falha de forma previsível (MAK-L3-EXECUTION-004)', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.delete', payload: { permission: 'empresa.delete' } }] });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.delete', async () => ({ deleted: true }));
    const engine = createExecutionEngine({ registry, actionEngine }); // no permissionEngine wired

    const result = await engine.execute({ type: 'action.empresa.delete', payload: {} }, buildCtx(['empresa.delete']));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-EXECUTION-004');
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildRegistry();
    const engine = createExecutionEngine({ registry });
    const locator = createServiceLocator();
    locator.register('executionEngine', () => engine);

    assert.strictEqual(locator.resolve('executionEngine'), engine);
  });

  it('resultado determinístico para a mesma entrada', async () => {
    const registry = buildRegistry({ actions: [{ code: 'empresa.save' }] });
    const actionEngine = createActionEngine({ registry });
    actionEngine.bind('empresa.save', async (payload) => ({ savedId: payload.id }));
    const engine = createExecutionEngine({ registry, actionEngine });

    const request = { type: 'action.empresa.save', payload: { id: 7 } };
    const first = await engine.execute(request, buildCtx([]));
    const second = await engine.execute(request, buildCtx([]));
    assert.deepEqual(first, second);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/execution/executionEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('executionEngine.js não referencia State/Transaction/Plugin Engine e não importa React (sem UI de produção)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/execution/executionEngine.js'), 'utf8');

    // M17 State Engine (C.12) and M18 Plugin Engine (C.13) both legitimately exist — this guard is
    // scoped to "executionEngine.js itself never references them", not "core/state|plugin/ must
    // not exist" (that was only valid during C.11's own authoring).
    assert.equal(/stateEngine|StateEngine|transactionEngine|TransactionEngine|pluginEngine|PluginEngine/.test(source), false);
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/transaction')), false);
  });

  it('não usa eval nem new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/execution/executionEngine.js'), 'utf8');
    assert.equal(/\beval\s*\(/.test(source), false);
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });
});

describe('M16 — Execution Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve action/workflow via registry e executa através do pipeline completo', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.executionEngine);

    result.actionEngine.bind('empresa.save', async (payload) => ({ savedId: payload.id }));

    const response = await result.executionEngine.execute(
      { type: 'action.empresa.save', payload: { id: 1 } },
      buildCtx([]),
    );
    assert.equal(response.success, true);
    assert.deepEqual(response.data, { savedId: 1 });
  });
});
