import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createExpressionEngine } from '../../core/expression/expressionEngine.js';
import { createFormulaEngine, FormulaEngine } from '../../core/formula/formulaEngine.js';
import { FormulaError } from '../../core/formula/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {{code: string, expr?: string, dependsOn?: string[]}[]} formulas */
function buildFormulaRegistry(formulas) {
  const registry = createRegistry();
  for (const formula of formulas) {
    registry.register('handler', formula.code, () => ({
      code: formula.code,
      objectType: 'formula',
      payload: { expr: formula.expr, dependsOn: formula.dependsOn ?? [] },
    }));
  }
  registry.freeze();
  return registry;
}

describe('M14 — Formula Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildFormulaRegistry([]);
    const engine = createFormulaEngine({ registry });
    assert.ok(engine instanceof FormulaEngine);
  });

  it('criar engine sem registry válido lança FormulaError MAK-L3-FORMULA-001', () => {
    assert.throws(
      () => createFormulaEngine({}),
      (err) => err instanceof FormulaError && err.code === 'MAK-L3-FORMULA-001',
    );
  });

  it('calcula fórmula simples usando o Expression Engine', () => {
    const registry = buildFormulaRegistry([{ code: 'total', expr: 'preco * quantidade' }]);
    const engine = createFormulaEngine({ registry });

    const result = engine.compute('total', { preco: 10, quantidade: 3 });
    assert.equal(result, 30);
  });

  it('fórmula usa o mesmo Expression Engine passado por injeção (não duplica lógica)', () => {
    const registry = buildFormulaRegistry([{ code: 'dobro', expr: 'valor * 2' }]);
    const expressionEngine = createExpressionEngine();
    const engine = createFormulaEngine({ registry, expressionEngine });

    assert.equal(engine.compute('dobro', { valor: 21 }), 42);
  });

  it('calcula fórmula com dependências de outras fórmulas', () => {
    const registry = buildFormulaRegistry([
      { code: 'subtotal', expr: 'preco * quantidade' },
      { code: 'total_com_taxa', expr: 'subtotal + taxa', dependsOn: ['subtotal'] },
    ]);
    const engine = createFormulaEngine({ registry });

    const result = engine.compute('total_com_taxa', { preco: 10, quantidade: 2, taxa: 5 });
    assert.equal(result, 25);
  });

  it('resolve dependências em ordem determinística (mesma entrada, mesmo resultado)', () => {
    const registry = buildFormulaRegistry([
      { code: 'a', expr: 'x + 1' },
      { code: 'b', expr: 'a * 2', dependsOn: ['a'] },
      { code: 'c', expr: 'b + a', dependsOn: ['a', 'b'] },
    ]);
    const engine = createFormulaEngine({ registry });

    const first = engine.compute('c', { x: 4 });
    const second = engine.compute('c', { x: 4 });
    assert.equal(first, second);
    assert.equal(first, 15); // a=5, b=10, c=15
  });

  it('fórmula inexistente falha com FormulaError MAK-L3-FORMULA-003', () => {
    const registry = buildFormulaRegistry([]);
    const engine = createFormulaEngine({ registry });

    assert.throws(
      () => engine.compute('missing_formula', {}),
      (err) => err instanceof FormulaError && err.code === 'MAK-L3-FORMULA-003',
    );
  });

  it('fórmula inválida (sem expr) falha com FormulaError MAK-L3-FORMULA-002', () => {
    const registry = buildFormulaRegistry([{ code: 'broken' }]);
    const engine = createFormulaEngine({ registry });

    assert.throws(
      () => engine.compute('broken', {}),
      (err) => err instanceof FormulaError && err.code === 'MAK-L3-FORMULA-002',
    );
  });

  it('dependência inexistente falha com FormulaError MAK-L3-FORMULA-003', () => {
    const registry = buildFormulaRegistry([{ code: 'x', expr: 'y + 1', dependsOn: ['ghost'] }]);
    const engine = createFormulaEngine({ registry });

    assert.throws(
      () => engine.compute('x', {}),
      (err) => err instanceof FormulaError && err.code === 'MAK-L3-FORMULA-003',
    );
  });

  it('ciclo entre fórmulas falha com FormulaError MAK-L3-FORMULA-004', () => {
    const registry = buildFormulaRegistry([
      { code: 'a', expr: 'b + 1', dependsOn: ['b'] },
      { code: 'b', expr: 'a + 1', dependsOn: ['a'] },
    ]);
    const engine = createFormulaEngine({ registry });

    assert.throws(
      () => engine.compute('a', {}),
      (err) => err instanceof FormulaError && err.code === 'MAK-L3-FORMULA-004',
    );
  });

  it('computeBatch() calcula uma bateria de fórmulas em lote', () => {
    const registry = buildFormulaRegistry([
      { code: 'a', expr: 'x + 1' },
      { code: 'b', expr: 'x * 2' },
    ]);
    const engine = createFormulaEngine({ registry });

    const results = engine.computeBatch(['a', 'b'], { x: 10 });
    assert.deepEqual(results, { a: 11, b: 20 });
  });

  it('getDependencies() retorna a lista de dependências declaradas', () => {
    const registry = buildFormulaRegistry([
      { code: 'subtotal', expr: 'preco * quantidade' },
      { code: 'total_com_taxa', expr: 'subtotal + taxa', dependsOn: ['subtotal'] },
    ]);
    const engine = createFormulaEngine({ registry });

    assert.deepEqual(engine.getDependencies('total_com_taxa'), ['subtotal']);
  });

  it('limite de dependências por fórmula funciona (MAK-L3-FORMULA-005)', () => {
    const manyDeps = Array.from({ length: 40 }, (_, i) => `dep${i}`);
    const depsEntries = manyDeps.map((code) => ({ code, expr: '1' }));
    const registry = buildFormulaRegistry([...depsEntries, { code: 'overloaded', expr: '1', dependsOn: manyDeps }]);
    const engine = createFormulaEngine({ registry });

    assert.throws(
      () => engine.compute('overloaded', {}),
      (err) => err instanceof FormulaError && err.code === 'MAK-L3-FORMULA-005',
    );
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildFormulaRegistry([{ code: 'a', expr: '1' }]);
    const engine = createFormulaEngine({ registry });
    const locator = createServiceLocator();
    locator.register('formulaEngine', () => engine);

    assert.strictEqual(locator.resolve('formulaEngine'), engine);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/formula/formulaEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não executa Action/Workflow/Render — não referencia esses módulos no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/formula/formulaEngine.js'), 'utf8');
    assert.equal(/actionEngine|ActionEngine|workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source), false);
  });

  it('não usa eval nem new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/formula/formulaEngine.js'), 'utf8');
    assert.equal(/\beval\s*\(/.test(source), false);
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });
});

describe('M14 — Formula Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve e computa a fórmula declarada na fixture CRB (full_name)', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.formulaEngine);
    assert.ok(result.expressionEngine);

    const value = result.formulaEngine.compute('full_name', { razao_social: 'Acme Ltda' });
    assert.equal(value, 'Acme Ltda');
  });
});
