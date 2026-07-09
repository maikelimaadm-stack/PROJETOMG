import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createActionEngine } from '../../core/action/actionEngine.js';
import { createPermissionEngine } from '../../core/permission/permissionEngine.js';
import { createWorkflowEngine, WorkflowEngine } from '../../core/workflow/workflowEngine.js';
import { WorkflowError } from '../../core/workflow/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {{code: string, payload?: Object}[]} entries */
function buildWorkflowRegistry(entries) {
  const registry = createRegistry();
  for (const entry of entries) {
    registry.register('workflow', entry.code, () => ({ ...entry }));
  }
  registry.freeze();
  return registry;
}

/** @param {{code: string, payload?: Object}[]} entries */
function buildActionRegistry(entries) {
  const registry = createRegistry();
  for (const entry of entries) {
    registry.register('action', entry.code, () => ({ ...entry }));
  }
  registry.freeze();
  return registry;
}

/** @param {{code: string, payload: {effect: string}}[]} entries */
function buildPermissionRegistry(entries) {
  const registry = createRegistry();
  for (const entry of entries) {
    registry.register('permission', entry.code, () => ({ ...entry }));
  }
  registry.freeze();
  return registry;
}

/** @param {string[]} permissions */
function buildCtx(permissions) {
  return {
    accessScope: { tenantId: 'tenant-a', userId: 'user-1', companies: [], permissions, locale: 'pt-BR' },
  };
}

describe('M11 — Workflow Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildWorkflowRegistry([]);
    const engine = createWorkflowEngine({ registry });
    assert.ok(engine instanceof WorkflowEngine);
  });

  it('criar engine sem registry válido lança WorkflowError MAK-L3-WORKFLOW-001', () => {
    assert.throws(
      () => createWorkflowEngine({}),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-001',
    );
  });

  it('start() resolve workflow declarado no registry e executa steps simples', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      {
        objectId: 'wf-1',
        objectType: 'workflow',
        code: 'empresa_approval',
        payload: { steps: [{ id: 'step-1', type: 'action', action: 'empresa.save' }] },
      },
    ]);
    const actionRegistry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const actionEngine = createActionEngine({ registry: actionRegistry });
    actionEngine.bind('empresa.save', async (payload) => ({ saved: payload }));

    const engine = createWorkflowEngine({ registry: workflowRegistry, actionEngine });
    const instance = await engine.start('empresa_approval', { razao_social: 'Acme' }, buildCtx([]));

    assert.equal(instance.status, 'completed');
    assert.equal(instance.stepIndex, 1);
    assert.ok(instance.instanceId);
  });

  it('step de ação delega ao Action Engine (handler é chamado)', async () => {
    let called = false;
    const workflowRegistry = buildWorkflowRegistry([
      { objectId: 'wf-1', objectType: 'workflow', code: 'wf', payload: { steps: [{ id: 's1', type: 'action', action: 'do.it' }] } },
    ]);
    const actionRegistry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'do.it', payload: {} }]);
    const actionEngine = createActionEngine({ registry: actionRegistry });
    actionEngine.bind('do.it', async () => {
      called = true;
      return 'ok';
    });

    const engine = createWorkflowEngine({ registry: workflowRegistry, actionEngine });
    const instance = await engine.start('wf', {}, buildCtx([]));

    assert.equal(called, true);
    assert.equal(instance.status, 'completed');
  });

  it('workflow com step humano fica em "waiting" e transition() avança e conclui', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      {
        objectId: 'wf-1',
        objectType: 'workflow',
        code: 'wf-human',
        payload: {
          steps: [
            { id: 's1', type: 'human', label: 'Aprovação gerencial' },
            { id: 's2', type: 'action', action: 'finish.it' },
          ],
        },
      },
    ]);
    const actionRegistry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'finish.it', payload: {} }]);
    const actionEngine = createActionEngine({ registry: actionRegistry });
    actionEngine.bind('finish.it', async () => 'done');

    const engine = createWorkflowEngine({ registry: workflowRegistry, actionEngine });
    const started = await engine.start('wf-human', {}, buildCtx([]));
    assert.equal(started.status, 'waiting');
    assert.equal(started.stepIndex, 0);

    const advanced = await engine.transition(started.instanceId, { type: 'complete-human-step' }, buildCtx([]));
    assert.equal(advanced.status, 'completed');
    assert.equal(advanced.stepIndex, 2);
  });

  it('start() com workflow inexistente falha com MAK-L3-WORKFLOW-003', async () => {
    const registry = buildWorkflowRegistry([]);
    const engine = createWorkflowEngine({ registry });

    await assert.rejects(
      () => engine.start('missing-workflow', {}, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-003',
    );
  });

  it('start() com definitionId inválido falha com MAK-L3-WORKFLOW-002', async () => {
    const registry = buildWorkflowRegistry([]);
    const engine = createWorkflowEngine({ registry });

    await assert.rejects(
      () => engine.start('', {}, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-002',
    );
  });

  it('workflow com shape inválido (sem steps) falha com MAK-L3-WORKFLOW-004', async () => {
    const registry = buildWorkflowRegistry([{ objectId: 'wf-1', objectType: 'workflow', code: 'wf-bad', payload: {} }]);
    const engine = createWorkflowEngine({ registry });

    await assert.rejects(
      () => engine.start('wf-bad', {}, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-004',
    );
  });

  it('step inválido (sem id) falha com MAK-L3-WORKFLOW-004', async () => {
    const registry = buildWorkflowRegistry([
      { objectId: 'wf-1', objectType: 'workflow', code: 'wf-bad-step', payload: { steps: [{ type: 'action', action: 'x' }] } },
    ]);
    const engine = createWorkflowEngine({ registry });

    await assert.rejects(
      () => engine.start('wf-bad-step', {}, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-004',
    );
  });

  it('tipo de step desconhecido falha com MAK-L3-WORKFLOW-004', async () => {
    const registry = buildWorkflowRegistry([
      { objectId: 'wf-1', objectType: 'workflow', code: 'wf-unknown-step', payload: { steps: [{ id: 's1', type: 'teleport' }] } },
    ]);
    const engine = createWorkflowEngine({ registry });

    await assert.rejects(
      () => engine.start('wf-unknown-step', {}, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-004',
    );
  });

  it('workflow com permissão concedida executa', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      {
        objectId: 'wf-1',
        objectType: 'workflow',
        code: 'wf-perm',
        payload: { permission: 'empresa.approve', steps: [{ id: 's1', type: 'action', action: 'do.it' }] },
      },
    ]);
    const actionRegistry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'do.it', payload: {} }]);
    const actionEngine = createActionEngine({ registry: actionRegistry });
    actionEngine.bind('do.it', async () => 'ok');
    const permissionEngine = createPermissionEngine({
      registry: buildPermissionRegistry([{ code: 'empresa.approve', payload: { effect: 'allow' } }]),
    });

    const engine = createWorkflowEngine({ registry: workflowRegistry, actionEngine, permissionEngine });
    const instance = await engine.start('wf-perm', {}, buildCtx(['empresa.approve']));

    assert.equal(instance.status, 'completed');
  });

  it('workflow com permissão negada não executa — lança MAK-L3-WORKFLOW-005 e nenhum handler roda', async () => {
    let called = false;
    const workflowRegistry = buildWorkflowRegistry([
      {
        objectId: 'wf-1',
        objectType: 'workflow',
        code: 'wf-perm-deny',
        payload: { permission: 'empresa.approve', steps: [{ id: 's1', type: 'action', action: 'do.it' }] },
      },
    ]);
    const actionRegistry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'do.it', payload: {} }]);
    const actionEngine = createActionEngine({ registry: actionRegistry });
    actionEngine.bind('do.it', async () => {
      called = true;
      return 'ok';
    });
    const permissionEngine = createPermissionEngine({
      registry: buildPermissionRegistry([{ code: 'empresa.approve', payload: { effect: 'deny' } }]),
    });

    const engine = createWorkflowEngine({ registry: workflowRegistry, actionEngine, permissionEngine });

    await assert.rejects(
      () => engine.start('wf-perm-deny', {}, buildCtx(['empresa.approve'])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-005',
    );
    assert.equal(called, false);
  });

  it('contexto inválido em workflow que exige permissão falha (fail-closed, MAK-L3-WORKFLOW-005)', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      {
        objectId: 'wf-1',
        objectType: 'workflow',
        code: 'wf-ctx',
        payload: { permission: 'empresa.approve', steps: [{ id: 's1', type: 'action', action: 'do.it' }] },
      },
    ]);
    const permissionEngine = createPermissionEngine({
      registry: buildPermissionRegistry([{ code: 'empresa.approve', payload: { effect: 'allow' } }]),
    });
    const engine = createWorkflowEngine({ registry: workflowRegistry, permissionEngine });

    await assert.rejects(
      () => engine.start('wf-ctx', {}, {}),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-005',
    );
  });

  it('transition() em instância inexistente falha com MAK-L3-WORKFLOW-003', async () => {
    const registry = buildWorkflowRegistry([]);
    const engine = createWorkflowEngine({ registry });

    await assert.rejects(
      () => engine.transition('missing-instance', { type: 'complete-human-step' }, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-003',
    );
  });

  it('transition() com operação desconhecida falha com MAK-L3-WORKFLOW-006', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      { objectId: 'wf-1', objectType: 'workflow', code: 'wf-human2', payload: { steps: [{ id: 's1', type: 'human' }] } },
    ]);
    const engine = createWorkflowEngine({ registry: workflowRegistry });
    const started = await engine.start('wf-human2', {}, buildCtx([]));

    await assert.rejects(
      () => engine.transition(started.instanceId, { type: 'unknown-op' }, buildCtx([])),
      (err) => err instanceof WorkflowError && err.code === 'MAK-L3-WORKFLOW-006',
    );
  });

  it('getInstance() retorna null para instância inexistente e o registro correto após start()', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      { objectId: 'wf-1', objectType: 'workflow', code: 'wf-simple', payload: { steps: [{ id: 's1', type: 'human' }] } },
    ]);
    const engine = createWorkflowEngine({ registry: workflowRegistry });

    assert.equal(await engine.getInstance('nope'), null);

    const started = await engine.start('wf-simple', {}, buildCtx([]));
    const fetched = await engine.getInstance(started.instanceId);
    assert.equal(fetched.instanceId, started.instanceId);
  });

  it('ação que falha durante a execução marca a instância como "failed" (sem lançar)', async () => {
    const workflowRegistry = buildWorkflowRegistry([
      { objectId: 'wf-1', objectType: 'workflow', code: 'wf-fail', payload: { steps: [{ id: 's1', type: 'action', action: 'missing.action' }] } },
    ]);
    const actionRegistry = buildActionRegistry([]);
    const actionEngine = createActionEngine({ registry: actionRegistry });

    const engine = createWorkflowEngine({ registry: workflowRegistry, actionEngine });
    const instance = await engine.start('wf-fail', {}, buildCtx([]));

    assert.equal(instance.status, 'failed');
    assert.equal(instance.lastError.code, 'MAK-L3-ACTION-004');
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildWorkflowRegistry([]);
    const engine = createWorkflowEngine({ registry });
    const locator = createServiceLocator();
    locator.register('workflowEngine', () => engine);

    assert.strictEqual(locator.resolve('workflowEngine'), engine);
  });

  it('não importa Prisma/backend/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/workflow/workflowEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/require\(.*prisma.*\)/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não aciona Render (M12) / Studio / Marketplace — fora de escopo do C.7', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/workflow/workflowEngine.js'), 'utf8');

    assert.equal(/renderEngine|RenderEngine|studio|Studio|marketplace|Marketplace/.test(source), false);
  });
});

describe('M11 — Workflow Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve e executa o workflow declarado na fixture CRB (empresa_approval)', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.workflowEngine);

    result.actionEngine.bind('empresa.save', async (payload) => ({ ok: true, payload }));

    const instance = await result.workflowEngine.start('empresa_approval', { razao_social: 'Acme' }, buildCtx([]));
    assert.equal(instance.status, 'completed');
  });
});
