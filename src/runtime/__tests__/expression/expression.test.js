import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createExpressionEngine, ExpressionEngine } from '../../core/expression/expressionEngine.js';
import { ExpressionError } from '../../core/expression/errors.js';

describe('M13 — Expression Engine', () => {
  it('cria o engine', () => {
    const engine = createExpressionEngine();
    assert.ok(engine instanceof ExpressionEngine);
  });

  it('avalia literais: string, number, boolean, null', () => {
    const engine = createExpressionEngine();
    assert.equal(engine.evaluate("'hello'"), 'hello');
    assert.equal(engine.evaluate('42'), 42);
    assert.equal(engine.evaluate('3.5'), 3.5);
    assert.equal(engine.evaluate('true'), true);
    assert.equal(engine.evaluate('false'), false);
    assert.equal(engine.evaluate('null'), null);
  });

  it('avalia operadores aritméticos com precedência correta', () => {
    const engine = createExpressionEngine();
    assert.equal(engine.evaluate('1 + 2 * 3'), 7);
    assert.equal(engine.evaluate('(1 + 2) * 3'), 9);
    assert.equal(engine.evaluate('10 / 2 - 1'), 4);
    assert.equal(engine.evaluate('-5 + 3'), -2);
  });

  it('avalia operadores booleanos (&&, ||, !) com curto-circuito', () => {
    const engine = createExpressionEngine();
    assert.equal(engine.evaluate('true && false'), false);
    assert.equal(engine.evaluate('true || false'), true);
    assert.equal(engine.evaluate('!true'), false);
    assert.equal(engine.evaluate('!false && true'), true);
  });

  it('avalia operadores de comparação', () => {
    const engine = createExpressionEngine();
    assert.equal(engine.evaluate('5 > 3'), true);
    assert.equal(engine.evaluate('5 >= 5'), true);
    assert.equal(engine.evaluate('3 < 5'), true);
    assert.equal(engine.evaluate('3 <= 2'), false);
    assert.equal(engine.evaluate("'a' == 'a'"), true);
    assert.equal(engine.evaluate("'a' != 'b'"), true);
  });

  it('acessa dados/contexto com segurança via path (data.valor)', () => {
    const engine = createExpressionEngine();
    const result = engine.evaluate('data.valor > 10 && data.ativo', { data: { valor: 20, ativo: true } });
    assert.equal(result, true);
    assert.equal(engine.evaluate('record.quantidade', { record: { quantidade: 7 } }), 7);
  });

  it('funções allowlist funcionam (min, max, round, abs, coalesce)', () => {
    const engine = createExpressionEngine();
    assert.equal(engine.evaluate('min(3, 1, 2)'), 1);
    assert.equal(engine.evaluate('max(3, 1, 2)'), 3);
    assert.equal(engine.evaluate('round(3.456, 2)'), 3.46);
    assert.equal(engine.evaluate('abs(-7)'), 7);
    assert.equal(engine.evaluate('coalesce(null, null, 5)'), 5);
  });

  it('função desconhecida falha com ExpressionError MAK-L3-EXPRESSION-004', () => {
    const engine = createExpressionEngine();
    assert.throws(
      () => engine.evaluate('teleport(1)'),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-004',
    );
  });

  it('identificador desconhecido falha com ExpressionError MAK-L3-EXPRESSION-003', () => {
    const engine = createExpressionEngine();
    assert.throws(
      () => engine.evaluate('data.missing', { data: {} }),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-003',
    );
  });

  it('expressão inválida (sintaxe) falha com ExpressionError MAK-L3-EXPRESSION-002', () => {
    const engine = createExpressionEngine();
    assert.throws(
      () => engine.evaluate('1 + '),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-002',
    );
    assert.throws(
      () => engine.evaluate('1 @ 2'),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-002',
    );
  });

  it('validate() nunca lança — retorna ValidationResult', () => {
    const engine = createExpressionEngine();
    assert.deepEqual(engine.validate('1 + 2'), { valid: true, errors: [] });
    const invalid = engine.validate('1 +');
    assert.equal(invalid.valid, false);
    assert.equal(invalid.errors.length > 0, true);
  });

  it('tentativa de acessar prototype/constructor/global falha com MAK-L3-EXPRESSION-003', () => {
    const engine = createExpressionEngine();
    assert.throws(
      () => engine.evaluate('constructor.name'),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-003',
    );
    assert.throws(
      () => engine.evaluate('__proto__.polluted'),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-003',
    );
    assert.throws(
      () => engine.evaluate('data.__proto__', { data: {} }),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-003',
    );
    assert.throws(
      () => engine.evaluate('globalThis.process'),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-003',
    );
  });

  it('não usa eval nem new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/expression/expressionEngine.js'), 'utf8');

    assert.equal(/\beval\s*\(/.test(source), false);
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });

  it('resultado é determinístico para a mesma entrada', () => {
    const engine = createExpressionEngine();
    const bindings = { data: { valor: 5 } };
    const a = engine.evaluate('data.valor * 2 + 1', bindings);
    const b = engine.evaluate('data.valor * 2 + 1', bindings);
    assert.equal(a, b);
  });

  it('limite de tamanho de expressão funciona (MAK-L3-EXPRESSION-005)', () => {
    const engine = createExpressionEngine({ maxExpressionLength: 20 });
    assert.throws(
      () => engine.evaluate('1 + 1 + 1 + 1 + 1 + 1 + 1 + 1'),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-005',
    );
  });

  it('limite de profundidade de expressão funciona (MAK-L3-EXPRESSION-005)', () => {
    const engine = createExpressionEngine({ maxDepth: 4, maxExpressionLength: 1000 });
    const deepExpr = '1 + '.repeat(30) + '1';
    assert.throws(
      () => engine.evaluate(deepExpr),
      (err) => err instanceof ExpressionError && err.code === 'MAK-L3-EXPRESSION-005',
    );
  });

  it('não executa Action/Workflow/Render — não referencia esses módulos no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/expression/expressionEngine.js'), 'utf8');
    assert.equal(/actionEngine|ActionEngine|workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source), false);
  });

  it('não importa Prisma/backend (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/expression/expressionEngine.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });
});
