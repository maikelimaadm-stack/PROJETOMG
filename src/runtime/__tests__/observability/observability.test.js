import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createObservabilityEngine, ObservabilityEngine } from '../../infra/observability/observabilityEngine.js';
import { ObservabilityError } from '../../infra/observability/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';

/** @param {number} start */
function buildClock(start) {
  let now = start;
  return { now: () => now, advance: (ms) => { now += ms; } };
}

describe('M24 — Observability Engine', () => {
  it('cria o engine com opções padrão', () => {
    const engine = createObservabilityEngine();
    assert.ok(engine instanceof ObservabilityEngine);
  });

  it('recordEvent() registra um evento', () => {
    const engine = createObservabilityEngine();
    const event = engine.recordEvent('empresa.created', { id: 1 });
    assert.equal(event.type, 'empresa.created');
    assert.deepEqual(event.payload, { id: 1 });
    assert.equal(engine.snapshot().events.length, 1);
  });

  it('recordMetric() registra uma métrica', () => {
    const engine = createObservabilityEngine();
    const metric = engine.recordMetric('bootstrap.duration_ms', 42, { phase: 'rt0' });
    assert.equal(metric.name, 'bootstrap.duration_ms');
    assert.equal(metric.value, 42);
    assert.deepEqual(metric.tags, { phase: 'rt0' });
  });

  it('startTrace()/endTrace() registram um trace com duração', () => {
    const clock = buildClock(1000);
    const engine = createObservabilityEngine({ clock: clock.now });
    const trace = engine.startTrace('runtime.bootstrap');
    clock.advance(50);
    const ended = engine.endTrace(trace.id, { ok: true });
    assert.equal(ended.durationMs, 50);
    assert.deepEqual(ended.result, { ok: true });
  });

  it('captureError() normaliza o erro sem vazar stack bruto', () => {
    const engine = createObservabilityEngine();
    const captured = engine.captureError(new Error('boom'), { userId: 'u1' });
    assert.equal(captured.name, 'Error');
    assert.equal(captured.message, 'boom');
    assert.equal(captured.context.userId, 'u1');
    assert.equal('stack' in captured, false);
  });

  it('health() reporta estado técnico determinístico', () => {
    const engine = createObservabilityEngine();
    engine.recordEvent('e', {});
    engine.recordMetric('m', 1);
    const trace = engine.startTrace('t');
    engine.endTrace(trace.id);
    engine.captureError(new Error('x'));

    const report = engine.health();
    assert.equal(report.status, 'ok');
    assert.equal(report.eventsCount, 1);
    assert.equal(report.metricsCount, 1);
    assert.equal(report.tracesCount, 1);
    assert.equal(report.errorsCount, 1);
  });

  it('readiness() avalia um runtime mínimo quando recebe serviceLocator/registry', () => {
    const engine = createObservabilityEngine();
    const locator = createServiceLocator();

    assert.equal(engine.readiness(undefined).ready, false);
    assert.equal(engine.readiness({ serviceLocator: locator, registry: {} }).ready, true);
    assert.equal(engine.readiness({ registry: {} }).ready, false);
  });

  it('snapshot() retorna cópia segura de todos os buffers', () => {
    const engine = createObservabilityEngine();
    engine.recordEvent('e', { list: [1, 2] });
    const snap = engine.snapshot();
    assert.equal(snap.events.length, 1);
    assert.deepEqual(snap.events[0].payload, { list: [1, 2] });
  });

  it('mutar o snapshot retornado NÃO altera o estado interno', () => {
    const engine = createObservabilityEngine();
    engine.recordEvent('e', { list: [1, 2] });

    const snap = engine.snapshot();
    snap.events[0].payload.list.push(3);
    snap.events.push({ id: 'fake', type: 'x', payload: {}, timestamp: 0 });

    assert.deepEqual(engine.snapshot().events[0].payload.list, [1, 2]);
    assert.equal(engine.snapshot().events.length, 1);
  });

  it('clear() limpa todos os buffers locais', () => {
    const engine = createObservabilityEngine();
    engine.recordEvent('e', {});
    engine.recordMetric('m', 1);
    engine.startTrace('t');
    engine.captureError(new Error('x'));

    engine.clear();
    const snap = engine.snapshot();
    assert.equal(snap.events.length, 0);
    assert.equal(snap.metrics.length, 0);
    assert.equal(snap.traces.length, 0);
    assert.equal(snap.errors.length, 0);
  });

  it('limite de eventos falha com ObservabilityError MAK-L3-OBSERVABILITY-004', () => {
    const engine = createObservabilityEngine();
    assert.throws(() => {
      for (let i = 0; i < 600; i += 1) {
        engine.recordEvent(`e${i}`, {});
      }
    }, (err) => err instanceof ObservabilityError && err.code === 'MAK-L3-OBSERVABILITY-004');
  });

  it('limite de métricas e traces falha com ObservabilityError MAK-L3-OBSERVABILITY-004', () => {
    const engineMetrics = createObservabilityEngine();
    assert.throws(() => {
      for (let i = 0; i < 1100; i += 1) {
        engineMetrics.recordMetric(`m${i}`, i);
      }
    }, (err) => err instanceof ObservabilityError && err.code === 'MAK-L3-OBSERVABILITY-004');

    const engineTraces = createObservabilityEngine();
    assert.throws(() => {
      for (let i = 0; i < 250; i += 1) {
        engineTraces.startTrace(`t${i}`);
      }
    }, (err) => err instanceof ObservabilityError && err.code === 'MAK-L3-OBSERVABILITY-004');
  });

  it('payload exagerado (profundidade) falha com ObservabilityError MAK-L3-OBSERVABILITY-001', () => {
    const engine = createObservabilityEngine();
    let deepPayload = { leaf: true };
    for (let i = 0; i < 12; i += 1) deepPayload = { nested: deepPayload };

    assert.throws(
      () => engine.recordEvent('e', deepPayload),
      (err) => err instanceof ObservabilityError && err.code === 'MAK-L3-OBSERVABILITY-001',
    );
  });

  it('prototype pollution é bloqueado (MAK-L3-OBSERVABILITY-001)', () => {
    const engine = createObservabilityEngine();
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    assert.throws(
      () => engine.recordEvent('e', polluted),
      (err) => err instanceof ObservabilityError && err.code === 'MAK-L3-OBSERVABILITY-001',
    );
  });

  it('dados sensíveis são mascarados em eventos, traces e erros', () => {
    const engine = createObservabilityEngine();

    const event = engine.recordEvent('login', { username: 'ana', password: 'p@ss', token: 'abc' });
    assert.equal(event.payload.password, '[REDACTED]');
    assert.equal(event.payload.token, '[REDACTED]');
    assert.equal(event.payload.username, 'ana');

    const captured = engine.captureError(new Error('x'), { apiKey: 'k-123', userId: 'u1' });
    assert.equal(captured.context.apiKey, '[REDACTED]');
    assert.equal(captured.context.userId, 'u1');
  });

  it('clock injetável gera resultado determinístico', () => {
    const clock = buildClock(5000);
    const engine = createObservabilityEngine({ clock: clock.now });
    const event = engine.recordEvent('e', {});
    assert.equal(event.timestamp, 5000);
    clock.advance(10);
    const metric = engine.recordMetric('m', 1);
    assert.equal(metric.timestamp, 5010);
  });

  it('criar engine com clock inválido lança ObservabilityError MAK-L3-OBSERVABILITY-005', () => {
    assert.throws(
      () => createObservabilityEngine({ clock: 'not-a-function' }),
      (err) => err instanceof ObservabilityError && err.code === 'MAK-L3-OBSERVABILITY-005',
    );
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const engine = createObservabilityEngine();
    const locator = createServiceLocator();
    locator.register('observabilityEngine', () => engine);

    assert.strictEqual(locator.resolve('observabilityEngine'), engine);
  });

  it('não importa Prisma/backend/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/observability/observabilityEngine.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/observability/observabilityEngine.js'), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/localStorage/.test(codeOnly), false);
    assert.equal(/sessionStorage/.test(codeOnly), false);
    assert.equal(/indexedDB/i.test(codeOnly), false);
  });

  it('não usa WebSocket/BroadcastChannel/worker nem telemetria externa no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/observability/observabilityEngine.js'), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/WebSocket/.test(codeOnly), false);
    assert.equal(/BroadcastChannel/.test(codeOnly), false);
    assert.equal(/new\s+Worker\s*\(/.test(codeOnly), false);
    assert.equal(/worker_threads/.test(codeOnly), false);
    assert.equal(/\bfetch\s*\(/.test(codeOnly), false);
    assert.equal(/sentry|datadog|segment\.io|newrelic/i.test(codeOnly), false);
  });
});
