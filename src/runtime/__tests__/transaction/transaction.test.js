import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTransactionEngine, TransactionEngine } from '../../infra/transaction/transactionEngine.js';
import { TransactionError } from '../../infra/transaction/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { createCacheEngine } from '../../infra/cache/cacheEngine.js';

describe('M23 — Transaction Engine', () => {
  it('cria o engine com opções padrão', () => {
    const engine = createTransactionEngine();
    assert.ok(engine instanceof TransactionEngine);
  });

  it('criar engine com clock inválido lança TransactionError MAK-L3-TRANSACTION-001', () => {
    assert.throws(
      () => createTransactionEngine({ clock: 'not-a-function' }),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-001',
    );
  });

  it('begin() cria transação com status active', () => {
    const engine = createTransactionEngine();
    const tx = engine.begin();
    assert.equal(tx.status, 'active');
    assert.ok(tx.id);
  });

  it('commit() finaliza a transação como committed', async () => {
    const engine = createTransactionEngine();
    const tx = engine.begin();
    const result = await engine.commit(tx.id);
    assert.equal(result.success, true);
    assert.equal(engine.get(tx.id).status, 'committed');
  });

  it('rollback() finaliza a transação como rolledback', async () => {
    const engine = createTransactionEngine();
    const tx = engine.begin();
    const result = await engine.rollback(tx.id);
    assert.equal(result.success, true);
    assert.equal(engine.get(tx.id).status, 'rolledback');
  });

  it('commit() de transação inexistente falha com TransactionError MAK-L3-TRANSACTION-004', async () => {
    const engine = createTransactionEngine();
    await assert.rejects(
      () => engine.commit('missing-tx'),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-004',
    );
  });

  it('rollback() de transação inexistente falha com TransactionError MAK-L3-TRANSACTION-004', async () => {
    const engine = createTransactionEngine();
    await assert.rejects(
      () => engine.rollback('missing-tx'),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-004',
    );
  });

  it('commit duplicado falha com TransactionError MAK-L3-TRANSACTION-005', async () => {
    const engine = createTransactionEngine();
    const tx = engine.begin();
    await engine.commit(tx.id);
    await assert.rejects(
      () => engine.commit(tx.id),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-005',
    );
  });

  it('rollback duplicado é idempotente (documentado); rollback após commit falha', async () => {
    const engine = createTransactionEngine();

    const txA = engine.begin();
    await engine.rollback(txA.id);
    const secondRollback = await engine.rollback(txA.id);
    assert.equal(secondRollback.success, true);
    assert.equal(secondRollback.idempotent, true);

    const txB = engine.begin();
    await engine.commit(txB.id);
    await assert.rejects(
      () => engine.rollback(txB.id),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-005',
    );
  });

  it('run() commita automaticamente em caso de sucesso', async () => {
    const engine = createTransactionEngine();
    const result = await engine.run(async () => 'ok');
    assert.equal(result.success, true);
    assert.equal(result.data, 'ok');
    assert.equal(engine.get(result.transactionId).status, 'committed');
  });

  it('run() rollbacka automaticamente em caso de erro', async () => {
    const engine = createTransactionEngine();
    const result = await engine.run(async () => {
      throw new Error('business failure');
    });
    assert.equal(result.success, false);
    assert.equal(result.error.message, 'business failure');
    assert.equal(engine.get(result.transactionId).status, 'rolledback');
  });

  it('erro em run() não deixa transação ativa vazando', async () => {
    const engine = createTransactionEngine();
    await engine.run(async () => {
      throw new Error('boom');
    });
    for (const tx of engine.list()) {
      assert.notEqual(tx.status, 'active');
    }
  });

  it('participantes são chamados em ordem determinística de registro', async () => {
    const engine = createTransactionEngine();
    const order = [];
    engine.registerParticipant('p1', { commit: async () => order.push('p1') });
    engine.registerParticipant('p2', { commit: async () => order.push('p2') });
    engine.registerParticipant('p3', { commit: async () => order.push('p3') });

    const tx = engine.begin();
    await engine.commit(tx.id);
    assert.deepEqual(order, ['p1', 'p2', 'p3']);
  });

  it('prepare roda antes de commit para cada participante', async () => {
    const engine = createTransactionEngine();
    const order = [];
    engine.registerParticipant('p1', {
      prepare: async () => order.push('p1-prepare'),
      commit: async () => order.push('p1-commit'),
    });

    const tx = engine.begin();
    await engine.commit(tx.id);
    assert.deepEqual(order, ['p1-prepare', 'p1-commit']);
  });

  it('falha em prepare aciona rollback dos participantes já preparados', async () => {
    const engine = createTransactionEngine();
    const rolledBack = [];
    engine.registerParticipant('p1', {
      prepare: async () => {},
      rollback: async () => rolledBack.push('p1'),
    });
    engine.registerParticipant('p2', {
      prepare: async () => {
        throw new Error('prepare failed');
      },
    });

    const tx = engine.begin();
    const result = await engine.commit(tx.id);
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-TRANSACTION-PREPARE-FAILED');
    assert.deepEqual(rolledBack, ['p1']);
    assert.equal(engine.get(tx.id).status, 'rolledback');
  });

  it('falha em commit retorna erro controlado e tenta compensação', async () => {
    const engine = createTransactionEngine();
    const compensated = [];
    engine.registerParticipant('p1', {
      commit: async () => {},
      rollback: async () => compensated.push('p1'),
    });
    engine.registerParticipant('p2', {
      commit: async () => {
        throw new Error('commit failed');
      },
    });

    const tx = engine.begin();
    const result = await engine.commit(tx.id);
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-TRANSACTION-COMMIT-FAILED');
    assert.deepEqual(compensated, ['p1']);
  });

  it('falha em rollback é capturada no resultado, sem mascarar a falha original', async () => {
    const engine = createTransactionEngine();
    engine.registerParticipant('p1', {
      rollback: async () => {
        throw new Error('rollback boom');
      },
    });

    const tx = engine.begin();
    const result = await engine.rollback(tx.id);
    assert.equal(result.success, true); // rollback() itself always finalizes the transaction
    assert.equal(result.participantResults[0].success, false);
    assert.equal(result.participantResults[0].error.message, 'rollback boom');
    assert.equal(engine.get(tx.id).status, 'rolledback');
  });

  it('participante inválido falha com TransactionError MAK-L3-TRANSACTION-002/003', () => {
    const engine = createTransactionEngine();
    assert.throws(
      () => engine.registerParticipant('', {}),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-002',
    );
    assert.throws(
      () => engine.registerParticipant('p1', { commit: 'not-a-function' }),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-003',
    );
    assert.throws(
      () => engine.registerParticipant('p1', null),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-003',
    );
  });

  it('limite de participantes falha com TransactionError MAK-L3-TRANSACTION-002', () => {
    const engine = createTransactionEngine();
    assert.throws(() => {
      for (let i = 0; i < 60; i += 1) {
        engine.registerParticipant(`p${i}`, {});
      }
    }, (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-002');
  });

  it('limite de transações ativas falha com TransactionError MAK-L3-TRANSACTION-007', () => {
    const engine = createTransactionEngine();
    assert.throws(() => {
      for (let i = 0; i < 60; i += 1) {
        engine.begin();
      }
    }, (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-007');
  });

  it('metadados exagerados falham com TransactionError MAK-L3-TRANSACTION-006', () => {
    const engine = createTransactionEngine();
    const bigMetadata = {};
    for (let i = 0; i < 200; i += 1) bigMetadata[`key${i}`] = i;

    assert.throws(
      () => engine.begin({ metadata: bigMetadata }),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-006',
    );
  });

  it('prototype pollution em metadados é bloqueado (MAK-L3-TRANSACTION-006)', () => {
    const engine = createTransactionEngine();
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    assert.throws(
      () => engine.begin({ metadata: polluted }),
      (err) => err instanceof TransactionError && err.code === 'MAK-L3-TRANSACTION-006',
    );
  });

  it('snapshot() retorna cópia segura de todas as transações', () => {
    const engine = createTransactionEngine();
    engine.begin({ transactionId: 'tx-a', metadata: { a: 1 } });
    const snap = engine.snapshot();
    assert.equal(snap.length, 1);
    assert.equal(snap[0].id, 'tx-a');
  });

  it('mutar o snapshot retornado NÃO altera o estado interno', () => {
    const engine = createTransactionEngine();
    const tx = engine.begin({ metadata: { list: [1, 2] } });

    const snap = engine.snapshot();
    snap[0].metadata.list.push(3);
    snap[0].status = 'committed';

    assert.deepEqual(engine.get(tx.id).metadata.list, [1, 2]);
    assert.equal(engine.get(tx.id).status, 'active');
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const engine = createTransactionEngine();
    const locator = createServiceLocator();
    locator.register('transactionEngine', () => engine);

    assert.strictEqual(locator.resolve('transactionEngine'), engine);
  });

  it('participante pode encapsular localmente um Cache Engine (M21), sem acoplamento obrigatório', async () => {
    const engine = createTransactionEngine();
    const cache = createCacheEngine();
    engine.registerParticipant('cache', {
      commit: async (tx) => {
        await cache.set(`session:${tx.id}`, { done: true });
      },
    });

    const tx = engine.begin();
    await engine.commit(tx.id);
    assert.deepEqual(await cache.get(`session:${tx.id}`), { done: true });
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/transaction/transactionEngine.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/transaction/transactionEngine.js'), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/localStorage/.test(codeOnly), false);
    assert.equal(/sessionStorage/.test(codeOnly), false);
    assert.equal(/indexedDB/i.test(codeOnly), false);
  });

  it('não usa WebSocket/BroadcastChannel/worker no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/transaction/transactionEngine.js'), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/WebSocket/.test(codeOnly), false);
    assert.equal(/BroadcastChannel/.test(codeOnly), false);
    assert.equal(/new\s+Worker\s*\(/.test(codeOnly), false);
    assert.equal(/worker_threads/.test(codeOnly), false);
  });

  it('não cria Observability Engine', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/transaction/transactionEngine.js'), 'utf8');
    assert.equal(/observabilityEngine|ObservabilityEngine/.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../infra/observability/observabilityEngine.js')), false);
  });

  it('não importa React (sem UI de produção)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/transaction/transactionEngine.js'), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
  });
});
