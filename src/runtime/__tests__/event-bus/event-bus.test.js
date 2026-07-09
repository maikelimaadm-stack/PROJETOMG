import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEventBus, EventBus } from '../../infra/event-bus/eventBus.js';
import { EventBusError } from '../../infra/event-bus/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';

describe('M22 — Event Bus', () => {
  it('cria o event bus', () => {
    const bus = createEventBus();
    assert.ok(bus instanceof EventBus);
  });

  it('on()/emit() chama o handler registrado', async () => {
    const bus = createEventBus();
    let received;
    bus.on('empresa.created', (payload) => {
      received = payload;
    });

    await bus.emit('empresa.created', { id: 1 });
    assert.deepEqual(received, { id: 1 });
  });

  it('once() executa uma única vez e remove o handler', async () => {
    const bus = createEventBus();
    let calls = 0;
    bus.once('empresa.created', () => {
      calls += 1;
    });

    await bus.emit('empresa.created', {});
    await bus.emit('empresa.created', {});
    assert.equal(calls, 1);
    assert.equal(bus.listenerCount('empresa.created'), 0);
  });

  it('off() remove o handler de forma previsível', async () => {
    const bus = createEventBus();
    let calls = 0;
    const handler = () => {
      calls += 1;
    };
    bus.on('empresa.created', handler);
    bus.off('empresa.created', handler);

    await bus.emit('empresa.created', {});
    assert.equal(calls, 0);
  });

  it('off() também aceita a função de unsubscribe retornada por on()', async () => {
    const bus = createEventBus();
    let calls = 0;
    const unsubscribe = bus.on('empresa.created', () => {
      calls += 1;
    });
    bus.off('empresa.created', unsubscribe);

    await bus.emit('empresa.created', {});
    assert.equal(calls, 0);
  });

  it('emit() chama handlers na ordem de registro (determinístico)', async () => {
    const bus = createEventBus();
    const order = [];
    bus.on('e', () => order.push(1));
    bus.on('e', () => order.push(2));
    bus.on('e', () => order.push(3));

    await bus.emit('e', {});
    assert.deepEqual(order, [1, 2, 3]);
  });

  it('resultado de emit() lista sucesso/falha por handler, sem interromper os seguintes', async () => {
    const bus = createEventBus();
    bus.on('e', () => 'ok-1');
    bus.on('e', () => {
      throw new Error('boom');
    });
    bus.on('e', () => 'ok-3');

    const result = await bus.emit('e', {});
    assert.equal(result.handlerCount, 3);
    assert.equal(result.results[0].success, true);
    assert.equal(result.results[0].value, 'ok-1');
    assert.equal(result.results[1].success, false);
    assert.equal(result.results[1].error.message, 'boom');
    assert.equal(result.results[2].success, true);
    assert.equal(result.results[2].value, 'ok-3');
  });

  it('tipo de evento inválido falha com EventBusError MAK-L3-EVENTBUS-002', async () => {
    const bus = createEventBus();
    assert.throws(() => bus.on('', () => {}), (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-002');
    await assert.rejects(
      () => bus.emit(123, {}),
      (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-002',
    );
  });

  it('handler inválido falha com EventBusError MAK-L3-EVENTBUS-003', () => {
    const bus = createEventBus();
    assert.throws(
      () => bus.on('e', 'not-a-function'),
      (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-003',
    );
  });

  it('payload exagerado (profundidade) falha com EventBusError MAK-L3-EVENTBUS-004', async () => {
    const bus = createEventBus();
    bus.on('e', () => {});
    let deepPayload = { leaf: true };
    for (let i = 0; i < 12; i += 1) deepPayload = { nested: deepPayload };

    await assert.rejects(
      () => bus.emit('e', deepPayload),
      (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-004',
    );
  });

  it('prototype pollution no payload é bloqueado (MAK-L3-EVENTBUS-004)', async () => {
    const bus = createEventBus();
    bus.on('e', () => {});
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');

    await assert.rejects(
      () => bus.emit('e', polluted),
      (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-004',
    );
  });

  it('limite de handlers por evento falha com EventBusError MAK-L3-EVENTBUS-005', () => {
    const bus = createEventBus();
    assert.throws(() => {
      for (let i = 0; i < 150; i += 1) {
        bus.on('e', () => {});
      }
    }, (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-005');
  });

  it('limite de tipos de evento registrados falha com EventBusError MAK-L3-EVENTBUS-005', () => {
    const bus = createEventBus();
    assert.throws(() => {
      for (let i = 0; i < 250; i += 1) {
        bus.on(`event-${i}`, () => {});
      }
    }, (err) => err instanceof EventBusError && err.code === 'MAK-L3-EVENTBUS-005');
  });

  it('proteção contra reentrância/loop excessivo (MAK-L3-EVENTBUS-006)', async () => {
    const bus = createEventBus();
    let depthReached = 0;
    bus.on('loop', async () => {
      depthReached += 1;
      return bus.emit('loop', {});
    });

    // A reentrancy failure at the deepest level is captured as that level's own handler
    // failure (never breaking sibling handlers, per rule #8) — so the outermost emit()
    // still resolves. What matters is that recursion is bounded, not unbounded/hanging.
    const result = await bus.emit('loop', {});
    assert.equal(depthReached, 5);

    let nested = result;
    for (let i = 0; i < 4; i += 1) {
      nested = nested.results[0].value;
    }
    assert.equal(nested.results[0].success, false);
    assert.match(nested.results[0].error.message, /Reentrant emit\(\) depth exceeded/);
  });

  it('clear()/listenerCount() operam globalmente ou por tipo de evento', () => {
    const bus = createEventBus();
    bus.on('a', () => {});
    bus.on('a', () => {});
    bus.on('b', () => {});

    assert.equal(bus.listenerCount('a'), 2);
    assert.equal(bus.listenerCount(), 3);

    bus.clear('a');
    assert.equal(bus.listenerCount('a'), 0);
    assert.equal(bus.listenerCount('b'), 1);

    bus.clear();
    assert.equal(bus.listenerCount(), 0);
  });

  it('publish()/subscribe() (SSOT-literal) funcionam como aliases', async () => {
    const bus = createEventBus();
    let received;
    const unsubscribe = bus.subscribe('empresa.created', (payload) => {
      received = payload;
    });

    await bus.publish({ type: 'empresa.created', payload: { id: 9 } });
    assert.deepEqual(received, { id: 9 });

    unsubscribe();
    await bus.publish({ type: 'empresa.created', payload: { id: 10 } });
    assert.deepEqual(received, { id: 9 });
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const bus = createEventBus();
    const locator = createServiceLocator();
    locator.register('eventBus', () => bus);

    assert.strictEqual(locator.resolve('eventBus'), bus);
  });

  it('não usa WebSocket/BroadcastChannel/worker no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/event-bus/eventBus.js'), 'utf8');
    // Strip comments — the module's own JSDoc documents *why* these APIs are forbidden, which
    // otherwise reads as a false-positive match.
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/WebSocket/.test(codeOnly), false);
    assert.equal(/BroadcastChannel/.test(codeOnly), false);
    assert.equal(/new\s+Worker\s*\(/.test(codeOnly), false);
    assert.equal(/worker_threads/.test(codeOnly), false);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/event-bus/eventBus.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não cria Transaction Engine', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/event-bus/eventBus.js'), 'utf8');
    assert.equal(/transactionEngine|TransactionEngine|TransactionManager/.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/transaction')), false);
  });
});
