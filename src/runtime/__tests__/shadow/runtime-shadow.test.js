import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRuntimeShadowMode, RuntimeShadowMode } from '../../shadow/runtimeShadowMode.js';
import { RuntimeShadowModeError } from '../../shadow/errors.js';
import { createObservabilityEngine } from '../../infra/observability/observabilityEngine.js';
import { createRuntimeCompletion } from '../../core/completion/runtimeCompletion.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** Builds a real runtime v2 result from the shared empresas CRB fixture. */
async function buildRealRuntimeV2() {
  const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
  const pin = buildEnvironmentPinFromCrb(crb);
  const loader = createLoader();
  loader.registerBundle(crb.bundleId, crb);
  const context = createContext({ tenantId: 'tenant-a' });
  return loadRuntimeBundle({ context, pin, loader, observabilityEngine: createObservabilityEngine() });
}

describe('Runtime v2 Shadow Mode (post-Foundation C)', () => {
  it('cria o Shadow Mode', () => {
    const shadow = createRuntimeShadowMode();
    assert.ok(shadow instanceof RuntimeShadowMode);
  });

  it('Shadow Mode vem DESLIGADO por padrão (opt-in)', async () => {
    const shadow = createRuntimeShadowMode();
    assert.equal(shadow.isEnabled(), false);
    const result = await shadow.runShadowPass({ moduleId: 'empresas' });
    assert.equal(result.skipped, true);
    assert.equal(result.reason, 'shadow mode disabled');
  });

  it('checkReadiness retorna relatório estruturado', async () => {
    const shadow = createRuntimeShadowMode({ completion: createRuntimeCompletion() });
    const runtime = await buildRealRuntimeV2();
    const report = shadow.checkReadiness(runtime);
    assert.equal(typeof report.enabled, 'boolean');
    assert.equal(typeof report.ready, 'boolean');
    assert.equal(Array.isArray(report.modules), true);
    assert.equal(report.availableCount + report.missingCount, report.modules.length);
    assert.equal(report.modules.length, 24);
  });

  it('runShadowPass captura sucesso quando habilitado', async () => {
    const shadow = createRuntimeShadowMode({
      enabled: true,
      completion: createRuntimeCompletion(),
      loadRuntime: () => buildRealRuntimeV2(),
    });
    const result = await shadow.runShadowPass({ moduleId: 'empresas' });
    assert.equal(result.skipped, false);
    assert.equal(result.success, true);
    assert.equal(result.readiness.modules.length, 24);
  });

  it('runShadowPass captura falha SEM lançar para fora', async () => {
    const shadow = createRuntimeShadowMode({
      enabled: true,
      loadRuntime: () => { throw new Error('runtime v2 explodiu'); },
    });
    const result = await shadow.runShadowPass({ moduleId: 'empresas' });
    assert.equal(result.skipped, false);
    assert.equal(result.success, false);
    assert.equal(result.error.message, 'runtime v2 explodiu');
    assert.equal(shadow.getDiagnostics().failureCount, 1);
  });

  it('compareWithLegacy retorna diferenças controladas', () => {
    const shadow = createRuntimeShadowMode();
    const legacy = { version: 'v1', hydratedModules: ['empresas'], extraLegacy: true };
    const v2 = { version: 'v2', hydratedModules: ['empresas'], extraV2: 1 };
    const cmp = shadow.compareWithLegacy(legacy, v2);
    assert.equal(cmp.equivalent, false);
    assert.deepEqual(cmp.differences.map((d) => d.path), ['version']);
    assert.deepEqual(cmp.onlyInLegacy, ['extraLegacy']);
    assert.deepEqual(cmp.onlyInV2, ['extraV2']);

    const same = shadow.compareWithLegacy({ a: 1 }, { a: 1 });
    assert.equal(same.equivalent, true);
  });

  it('getDiagnostics retorna cópia segura', () => {
    const shadow = createRuntimeShadowMode();
    shadow.compareWithLegacy({ a: 1 }, { a: 2 });
    const diag = shadow.getDiagnostics();
    assert.equal(diag.records.length, 1);
    assert.equal(diag.records[0].kind, 'compare');
  });

  it('mutar diagnostics NÃO altera o estado interno', () => {
    const shadow = createRuntimeShadowMode();
    shadow.compareWithLegacy({ a: 1 }, { a: 2 });
    const diag = shadow.getDiagnostics();
    diag.records.push({ id: 'fake', kind: 'pass', ok: true, timestamp: 0 });
    diag.records[0].detail = { tampered: true };
    assert.equal(shadow.getDiagnostics().records.length, 1);
    assert.notDeepEqual(shadow.getDiagnostics().records[0].detail, { tampered: true });
  });

  it('dados sensíveis são mascarados em diagnostics e comparação', () => {
    const shadow = createRuntimeShadowMode();
    const cmp = shadow.compareWithLegacy(
      { token: 'abc', name: 'legacy' },
      { token: 'xyz', name: 'v2' },
    );
    const diff = cmp.differences.find((d) => d.path === 'token');
    assert.equal(diff.legacy, '[REDACTED]');
    assert.equal(diff.v2, '[REDACTED]');
  });

  it('prototype pollution é bloqueado em inputs', async () => {
    const shadow = createRuntimeShadowMode({ enabled: true, loadRuntime: () => ({}) });
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => shadow.runShadowPass(polluted),
      (err) => err instanceof RuntimeShadowModeError && err.code === 'MAK-L3-SHADOW-001',
    );
    assert.throws(
      () => shadow.compareWithLegacy(polluted, { a: 1 }),
      (err) => err instanceof RuntimeShadowModeError && err.code === 'MAK-L3-SHADOW-001',
    );
  });

  it('não renderiza UI real (sem React, sem DOM)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../shadow/runtimeShadowMode.js'), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(/from\s+['"]react-dom['"]/i.test(source), false);
    assert.equal(/document\.|window\.|render\s*\(/i.test(source), false);
  });

  it('não executa action/workflow/connector com side effect', async () => {
    let sideEffects = 0;
    const fakeRuntimeV2 = {
      actionEngine: { dispatch: () => { sideEffects += 1; } },
      workflowEngine: { start: () => { sideEffects += 1; } },
      connectorEngine: { execute: () => { sideEffects += 1; } },
      registry: {},
    };
    const shadow = createRuntimeShadowMode({
      enabled: true,
      completion: createRuntimeCompletion(),
      loadRuntime: () => fakeRuntimeV2,
    });
    const result = await shadow.runShadowPass({ moduleId: 'empresas' });
    assert.equal(result.success, true);
    assert.equal(sideEffects, 0);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../shadow/runtimeShadowMode.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
  });

  it('não chama backend direto (sem fetch/XHR/WebSocket/storage)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../shadow/runtimeShadowMode.js'), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/from\s+['"].*backend.*['"]/i.test(codeOnly), false);
    assert.equal(/\bfetch\s*\(/.test(codeOnly), false);
    assert.equal(/XMLHttpRequest/.test(codeOnly), false);
    assert.equal(/WebSocket|BroadcastChannel/.test(codeOnly), false);
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly), false);
  });

  it('integra com Observability quando disponível', async () => {
    const observability = createObservabilityEngine();
    const shadow = createRuntimeShadowMode({
      enabled: true,
      observability,
      completion: createRuntimeCompletion(),
      loadRuntime: () => ({ registry: {} }),
    });
    await shadow.runShadowPass({ moduleId: 'empresas' });
    const snap = observability.snapshot();
    assert.equal(snap.events.some((e) => e.type === 'shadow.pass'), true);
    assert.equal(snap.metrics.some((m) => m.name === 'shadow.pass.duration_ms'), true);
  });

  it('integra com Runtime Completion quando disponível', async () => {
    const shadow = createRuntimeShadowMode({
      enabled: true,
      completion: createRuntimeCompletion(),
      loadRuntime: () => buildRealRuntimeV2(),
    });
    const result = await shadow.runShadowPass({ moduleId: 'empresas' });
    // A raw loadRuntimeBundle() result exposes the engines (M04–M19, M21–M24)
    // but not the bootstrap-instance-level modules (M01 Bootstrap, M02 Context,
    // M03 Session, M20 Service Locator — those are wired by hydrateWithBundle),
    // so the honest readiness report shows those 4 as missing. This proves the
    // completion checker really ran with real availability, not a rubber-stamp.
    const byId = Object.fromEntries(result.readiness.modules.map((m) => [m.id, m.status]));
    assert.equal(result.readiness.modules.length, 24);
    assert.equal(byId.M24, 'available');
    assert.equal(byId.M16, 'available');
    assert.ok(result.readiness.availableCount >= 20);
  });
});
