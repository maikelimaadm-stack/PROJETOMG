import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createPermissionEngine } from '../../core/permission/permissionEngine.js';
import { createRenderEngine, RenderEngine } from '../../core/render/renderEngine.js';
import { RenderError } from '../../core/render/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/**
 * @param {{layouts?: {code:string, payload?:Object}[], fields?: {code:string, payload?:Object}[], permissions?: {code:string, payload?:Object}[]}} params
 */
function buildRenderRegistry({ layouts = [], fields = [], permissions = [] }) {
  const registry = createRegistry();
  for (const entry of layouts) registry.register('layout', entry.code, () => ({ ...entry }));
  for (const entry of fields) registry.register('field', entry.code, () => ({ ...entry }));
  for (const entry of permissions) registry.register('permission', entry.code, () => ({ ...entry }));
  registry.freeze();
  return registry;
}

/** @param {string[]} permissions */
function buildCtx(permissions) {
  return {
    accessScope: { tenantId: 'tenant-a', userId: 'user-1', companies: [], permissions, locale: 'pt-BR' },
  };
}

describe('M12 — Render Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildRenderRegistry({});
    const engine = createRenderEngine({ registry });
    assert.ok(engine instanceof RenderEngine);
  });

  it('criar engine sem registry válido lança RenderError MAK-L3-RENDER-001', () => {
    assert.throws(
      () => createRenderEngine({}),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-001',
    );
  });

  it('render() de definição válida produz árvore intermediária (TableView + field cells)', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'empresas_layout', payload: { viewMode: 'table', fields: [{ field: 'razao_social', label: 'Razão Social' }] } }],
      fields: [{ code: 'razao_social', payload: { dataType: 'string' } }],
    });
    const engine = createRenderEngine({ registry });

    const tree = await engine.render('empresas_layout', buildCtx([]));

    assert.equal(tree.screenId, 'empresas_layout');
    assert.equal(tree.viewMode, 'table');
    assert.equal(tree.root.component, 'TableView');
    assert.equal(tree.root.children.length, 1);
    assert.equal(tree.root.children[0].fieldCode, 'razao_social');
    assert.equal(tree.root.children[0].component, 'TextCell');
    assert.equal(tree.root.children[0].label, 'Razão Social');
  });

  it('render() com tela/definição inexistente falha com MAK-L3-RENDER-003', async () => {
    const registry = buildRenderRegistry({});
    const engine = createRenderEngine({ registry });

    await assert.rejects(
      () => engine.render('missing-screen', buildCtx([])),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-003',
    );
  });

  it('render() com componente explícito desconhecido falha com MAK-L3-RENDER-005', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'bad_component_layout', payload: { fields: [{ field: 'f1', component: 'HolographicWidget' }] } }],
      fields: [{ code: 'f1', payload: { dataType: 'string' } }],
    });
    const engine = createRenderEngine({ registry });

    await assert.rejects(
      () => engine.render('bad_component_layout', buildCtx([])),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-005',
    );
  });

  it('árvore inválida (fields não é array) falha com MAK-L3-RENDER-004', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'bad_shape_layout', payload: { fields: 'not-an-array' } }],
    });
    const engine = createRenderEngine({ registry });

    await assert.rejects(
      () => engine.render('bad_shape_layout', buildCtx([])),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-004',
    );
  });

  it('referência a campo inexistente no field registry falha com MAK-L3-RENDER-004', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'dangling_field_layout', payload: { fields: [{ field: 'ghost_field' }] } }],
    });
    const engine = createRenderEngine({ registry });

    await assert.rejects(
      () => engine.render('dangling_field_layout', buildCtx([])),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-004',
    );
  });

  it('contexto inválido falha de forma previsível — campo com permissão fica oculto, sem lançar', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'ctx_layout', payload: { fields: [{ field: 'f1', permission: 'empresa.read' }] } }],
      fields: [{ code: 'f1', payload: { dataType: 'string' } }],
      permissions: [{ code: 'empresa.read', payload: { effect: 'allow' } }],
    });
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createRenderEngine({ registry, permissionEngine });

    const tree = await engine.render('ctx_layout', {});
    assert.equal(tree.root.children.length, 0);
  });

  it('elemento com permissão concedida aparece na árvore', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'perm_layout', payload: { fields: [{ field: 'f1', permission: 'empresa.read' }] } }],
      fields: [{ code: 'f1', payload: { dataType: 'string' } }],
      permissions: [{ code: 'empresa.read', payload: { effect: 'allow' } }],
    });
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createRenderEngine({ registry, permissionEngine });

    const tree = await engine.render('perm_layout', buildCtx(['empresa.read']));
    assert.equal(tree.root.children.length, 1);
    assert.equal(tree.root.children[0].fieldCode, 'f1');
  });

  it('elemento com permissão negada é ocultado da árvore', async () => {
    const registry = buildRenderRegistry({
      layouts: [
        {
          code: 'perm_deny_layout',
          payload: {
            fields: [
              { field: 'f1', permission: 'empresa.delete' },
              { field: 'f2' },
            ],
          },
        },
      ],
      fields: [
        { code: 'f1', payload: { dataType: 'string' } },
        { code: 'f2', payload: { dataType: 'string' } },
      ],
      permissions: [{ code: 'empresa.delete', payload: { effect: 'deny' } }],
    });
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createRenderEngine({ registry, permissionEngine });

    const tree = await engine.render('perm_deny_layout', buildCtx(['empresa.delete']));
    assert.equal(tree.root.children.length, 1);
    assert.equal(tree.root.children[0].fieldCode, 'f2');
  });

  it('não executa Action Engine automaticamente mesmo com actionRef declarado', async () => {
    let dispatched = false;
    const registry = buildRenderRegistry({
      layouts: [{ code: 'action_ref_layout', payload: { fields: [{ field: 'f1', actionRef: 'empresa.save' }] } }],
      fields: [{ code: 'f1', payload: { dataType: 'string' } }],
    });
    const fakeActionEngine = { dispatch: async () => { dispatched = true; return { success: true }; } };
    const engine = createRenderEngine({ registry });
    // Render Engine never receives/calls an ActionEngine — constructor only accepts registry/permissionEngine.
    void fakeActionEngine;

    const tree = await engine.render('action_ref_layout', buildCtx([]));
    assert.equal(tree.root.children[0].actionRef, 'empresa.save');
    assert.equal(dispatched, false);
  });

  it('não executa Workflow Engine automaticamente mesmo com workflowRef declarado', async () => {
    let started = false;
    const registry = buildRenderRegistry({
      layouts: [{ code: 'wf_ref_layout', payload: { fields: [{ field: 'f1', workflowRef: 'empresa_approval' }] } }],
      fields: [{ code: 'f1', payload: { dataType: 'string' } }],
    });
    const fakeWorkflowEngine = { start: async () => { started = true; } };
    const engine = createRenderEngine({ registry });
    void fakeWorkflowEngine;

    const tree = await engine.render('wf_ref_layout', buildCtx([]));
    assert.equal(tree.root.children[0].workflowRef, 'empresa_approval');
    assert.equal(started, false);
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildRenderRegistry({});
    const engine = createRenderEngine({ registry });
    const locator = createServiceLocator();
    locator.register('renderEngine', () => engine);

    assert.strictEqual(locator.resolve('renderEngine'), engine);
  });

  it('resultado é determinístico para a mesma entrada', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'det_layout', payload: { fields: [{ field: 'f1' }] } }],
      fields: [{ code: 'f1', payload: { dataType: 'string' } }],
    });
    const engine = createRenderEngine({ registry });

    const treeA = await engine.render('det_layout', buildCtx([]));
    const treeB = await engine.render('det_layout', buildCtx([]));
    assert.deepEqual(treeA, treeB);
  });

  it('layout com número de campos acima do limite falha com MAK-L3-RENDER-004', async () => {
    const manyFields = Array.from({ length: 300 }, (_, i) => ({ field: `f${i}` }));
    const registry = buildRenderRegistry({
      layouts: [{ code: 'huge_layout', payload: { fields: manyFields } }],
    });
    const engine = createRenderEngine({ registry });

    await assert.rejects(
      () => engine.render('huge_layout', buildCtx([])),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-004',
    );
  });

  it('registerAdapter() com viewMode/adapter inválido lança MAK-L3-RENDER-002; viewMode sem adapter lança MAK-L3-RENDER-006', async () => {
    const registry = buildRenderRegistry({
      layouts: [{ code: 'kanban_layout', payload: { viewMode: 'kanban', fields: [] } }],
    });
    const engine = createRenderEngine({ registry });

    assert.throws(
      () => engine.registerAdapter('', () => {}),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-002',
    );
    assert.throws(
      () => engine.registerAdapter('kanban', 'not-a-function'),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-002',
    );

    await assert.rejects(
      () => engine.render('kanban_layout', buildCtx([])),
      (err) => err instanceof RenderError && err.code === 'MAK-L3-RENDER-006',
    );
  });

  it('não importa Prisma/backend/React direto (D-RI-13 + sem UI de produção)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/render/renderEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/require\(.*prisma.*\)/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(/react-dom/i.test(source), false);
    assert.equal(/src\/App/.test(source), false);
  });

  it('não referencia Studio/Marketplace nem cria motores de C.9+ (Expression/Formula)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/render/renderEngine.js'), 'utf8');

    assert.equal(/studio|Studio|marketplace|Marketplace|ExpressionEngine|FormulaEngine/.test(source), false);
  });
});

describe('M12 — Render Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve e renderiza a tela declarada na fixture CRB (empresas_layout)', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.renderEngine);

    const tree = await result.renderEngine.render('empresas_layout', buildCtx([]));
    assert.equal(tree.viewMode, 'table');
    assert.equal(tree.root.children[0].fieldCode, 'razao_social');
  });
});
