import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createExpressionEngine } from '../../core/expression/expressionEngine.js';
import { createValidationEngine, ValidationEngine } from '../../core/validation/validationEngine.js';
import { ValidationError } from '../../core/validation/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {{code: string, rules: Object[]}[]} resources */
function buildValidationRegistry(resources) {
  const registry = createRegistry();
  for (const resource of resources) {
    registry.register('validation', resource.code, () => ({
      code: resource.code,
      objectType: 'validation',
      payload: { rules: resource.rules },
    }));
  }
  registry.freeze();
  return registry;
}

describe('M15 — Validation Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });
    assert.ok(engine instanceof ValidationEngine);
  });

  it('criar engine sem registry válido lança ValidationError MAK-L3-VALIDATION-001', () => {
    assert.throws(
      () => createValidationEngine({}),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-001',
    );
  });

  it('required: falha para null/undefined/string vazia, passa para valor presente', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });
    const rules = [{ rule: 'required' }];

    assert.equal(engine.validateSync(rules, null).valid, false);
    assert.equal(engine.validateSync(rules, undefined).valid, false);
    assert.equal(engine.validateSync(rules, '').valid, false);
    assert.equal(engine.validateSync(rules, 'ok').valid, true);
  });

  it('required: 0 e false NÃO são tratados como vazio', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });
    const rules = [{ rule: 'required' }];

    assert.equal(engine.validateSync(rules, 0).valid, true);
    assert.equal(engine.validateSync(rules, false).valid, true);
  });

  it('type: valida string/number/boolean/date/object/array corretamente', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.equal(engine.validateSync([{ rule: 'type', type: 'string' }], 'x').valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'string' }], 1).valid, false);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'number' }], 1).valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'boolean' }], true).valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'date' }], new Date()).valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'date' }], '2026-01-01').valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'object' }], { a: 1 }).valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'array' }], [1, 2]).valid, true);
    assert.equal(engine.validateSync([{ rule: 'type', type: 'array' }], { a: 1 }).valid, false);
  });

  it('min/max: compara valor numérico; valor não numérico falha como erro de negócio', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.equal(engine.validateSync([{ rule: 'min', value: 10 }], 15).valid, true);
    assert.equal(engine.validateSync([{ rule: 'min', value: 10 }], 5).valid, false);
    assert.equal(engine.validateSync([{ rule: 'max', value: 10 }], 5).valid, true);
    assert.equal(engine.validateSync([{ rule: 'max', value: 10 }], 15).valid, false);
    assert.equal(engine.validateSync([{ rule: 'min', value: 10 }], 'not-a-number').valid, false);
  });

  it('minLength/maxLength: compara tamanho de string/array', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.equal(engine.validateSync([{ rule: 'minLength', length: 3 }], 'abcd').valid, true);
    assert.equal(engine.validateSync([{ rule: 'minLength', length: 3 }], 'ab').valid, false);
    assert.equal(engine.validateSync([{ rule: 'maxLength', length: 3 }], [1, 2]).valid, true);
    assert.equal(engine.validateSync([{ rule: 'maxLength', length: 3 }], [1, 2, 3, 4]).valid, false);
  });

  it('pattern: valida regex e falha quando não corresponde', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.equal(engine.validateSync([{ rule: 'pattern', pattern: '^\\d+$' }], '12345').valid, true);
    assert.equal(engine.validateSync([{ rule: 'pattern', pattern: '^\\d+$' }], 'abc').valid, false);
  });

  it('regex inválida falha de forma previsível — lança ValidationError MAK-L3-VALIDATION-003', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.throws(
      () => engine.validateSync([{ rule: 'pattern', pattern: '(' }], 'x'),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-003',
    );
  });

  it('enum: valida valor presente na lista e falha quando ausente', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.equal(engine.validateSync([{ rule: 'enum', values: ['a', 'b'] }], 'a').valid, true);
    assert.equal(engine.validateSync([{ rule: 'enum', values: ['a', 'b'] }], 'c').valid, false);
  });

  it('custom expression válida passa/falha usando o Expression Engine', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    const passing = engine.validateSync([{ rule: 'custom', expr: 'value > 10' }], 15);
    assert.equal(passing.valid, true);

    const failing = engine.validateSync([{ rule: 'custom', expr: 'value > 10' }], 5);
    assert.equal(failing.valid, false);
  });

  it('custom expression com sintaxe inválida falha de forma previsível — lança ValidationError, sem eval/new Function', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.throws(
      () => engine.validateSync([{ rule: 'custom', expr: '1 +' }], 5),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-003',
    );
  });

  it('regra desconhecida falha de forma previsível — lança ValidationError MAK-L3-VALIDATION-003', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.throws(
      () => engine.validateSync([{ rule: 'teleport' }], 'x'),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-003',
    );
  });

  it('regra malformada falha de forma previsível — lança ValidationError MAK-L3-VALIDATION-003', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.throws(
      () => engine.validateSync([{ rule: 'min' }], 5),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-003',
    );
    assert.throws(
      () => engine.validateSync([{}], 5),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-003',
    );
  });

  it('validateRecord() agrega erros de múltiplos campos', () => {
    const registry = buildValidationRegistry([
      {
        code: 'empresas_validation',
        rules: [
          { rule: 'required', field: 'razao_social' },
          { rule: 'min', field: 'idade', value: 18 },
        ],
      },
    ]);
    const engine = createValidationEngine({ registry });

    const result = engine.validateRecord('empresas_validation', { razao_social: '', idade: 10 });
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 2);
    assert.deepEqual(
      result.errors.map((e) => e.field),
      ['razao_social', 'idade'],
    );
  });

  it('ordem dos erros é determinística', () => {
    const registry = buildValidationRegistry([
      {
        code: 'ordered_validation',
        rules: [
          { rule: 'required', field: 'a' },
          { rule: 'required', field: 'b' },
          { rule: 'required', field: 'c' },
        ],
      },
    ]);
    const engine = createValidationEngine({ registry });

    const first = engine.validateRecord('ordered_validation', {});
    const second = engine.validateRecord('ordered_validation', {});
    assert.deepEqual(
      first.errors.map((e) => e.field),
      second.errors.map((e) => e.field),
    );
    assert.deepEqual(
      first.errors.map((e) => e.field),
      ['a', 'b', 'c'],
    );
  });

  it('limite de regras por campo funciona (MAK-L3-VALIDATION-004)', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });
    const manyRules = Array.from({ length: 20 }, () => ({ rule: 'required' }));

    assert.throws(
      () => engine.validateSync(manyRules, 'x'),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-004',
    );
  });

  it('limite de campos por validação funciona (MAK-L3-VALIDATION-004)', () => {
    const manyFieldRules = Array.from({ length: 100 }, (_, i) => ({ rule: 'required', field: `f${i}` }));
    const registry = buildValidationRegistry([{ code: 'huge_validation', rules: manyFieldRules }]);
    const engine = createValidationEngine({ registry });

    assert.throws(
      () => engine.validateRecord('huge_validation', {}),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-004',
    );
  });

  it('usa o Expression Engine injetado — não duplica parser', () => {
    const registry = buildValidationRegistry([]);
    const expressionEngine = createExpressionEngine();
    const engine = createValidationEngine({ registry, expressionEngine });

    const result = engine.validateSync([{ rule: 'custom', expr: 'value == 42' }], 42);
    assert.equal(result.valid, true);
  });

  it('validateField() valida um único campo via registry', () => {
    const registry = buildValidationRegistry([
      { code: 'empresas_validation', rules: [{ rule: 'required', field: 'razao_social' }] },
    ]);
    const engine = createValidationEngine({ registry });

    const ok = engine.validateField('empresas_validation', 'razao_social', 'Acme', { razao_social: 'Acme' });
    assert.equal(ok.valid, true);
    const fail = engine.validateField('empresas_validation', 'razao_social', '', { razao_social: '' });
    assert.equal(fail.valid, false);
  });

  it('recurso de validação inexistente falha com ValidationError MAK-L3-VALIDATION-002', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });

    assert.throws(
      () => engine.validateRecord('missing_resource', {}),
      (err) => err instanceof ValidationError && err.code === 'MAK-L3-VALIDATION-002',
    );
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildValidationRegistry([]);
    const engine = createValidationEngine({ registry });
    const locator = createServiceLocator();
    locator.register('validationEngine', () => engine);

    assert.strictEqual(locator.resolve('validationEngine'), engine);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/validation/validationEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não executa Action/Workflow/Render — não referencia esses módulos no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/validation/validationEngine.js'), 'utf8');
    assert.equal(/actionEngine|ActionEngine|workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source), false);
  });

  it('não usa eval nem new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/validation/validationEngine.js'), 'utf8');
    assert.equal(/\beval\s*\(/.test(source), false);
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });
});

describe('M15 — Validation Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve e valida o recurso declarado na fixture CRB (empresas_validation)', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.validationEngine);

    const invalid = result.validationEngine.validateRecord('empresas_validation', { razao_social: '' });
    assert.equal(invalid.valid, false);

    const valid = result.validationEngine.validateRecord('empresas_validation', { razao_social: 'Acme' });
    assert.equal(valid.valid, true);
  });
});
