import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRuntimeCompletion, RuntimeCompletion } from '../../core/completion/runtimeCompletion.js';
import { RuntimeCompletionError } from '../../core/completion/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { createObservabilityEngine } from '../../infra/observability/observabilityEngine.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

describe('Runtime Completion (Foundation C closure check)', () => {
  it('cria o Runtime Completion', () => {
    const completion = createRuntimeCompletion();
    assert.ok(completion instanceof RuntimeCompletion);
  });

  it('detecta módulos disponíveis a partir do resultado de loadRuntimeBundle()', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const runtime = await loadRuntimeBundle({
      context,
      pin,
      loader,
      observabilityEngine: createObservabilityEngine(),
    });

    const completion = createRuntimeCompletion();
    const modules = completion.checkRuntimeCompleteness(runtime);

    const byId = Object.fromEntries(modules.map((m) => [m.id, m.status]));
    assert.equal(byId.M04, 'available'); // Registry
    assert.equal(byId.M09, 'available'); // Permission Engine
    assert.equal(byId.M16, 'available'); // Execution Engine
    assert.equal(byId.M21, 'available'); // Cache Engine
    assert.equal(byId.M23, 'available'); // Transaction Engine
    assert.equal(byId.M24, 'available'); // Observability Engine
    assert.equal(modules.length, 24);
  });

  it('detecta módulos ausentes sem lançar erro genérico', () => {
    const completion = createRuntimeCompletion();
    const modules = completion.checkRuntimeCompleteness({});

    const byId = Object.fromEntries(modules.map((m) => [m.id, m.status]));
    assert.equal(byId.M04, 'missing');
    assert.equal(byId.M24, 'missing');
    assert.equal(modules.every((m) => m.status === 'available' || m.status === 'missing'), true);
  });

  it('checkRuntimeCompleteness() nunca lança para runtime undefined/null', () => {
    const completion = createRuntimeCompletion();
    assert.doesNotThrow(() => completion.checkRuntimeCompleteness(undefined));
    assert.doesNotThrow(() => completion.checkRuntimeCompleteness(null));
  });

  it('valida services no Service Locator (checkServiceAvailability)', () => {
    const completion = createRuntimeCompletion();
    const locator = createServiceLocator();
    locator.register('registry', () => ({}));
    locator.register('permissionEngine', () => ({}));

    const availability = completion.checkServiceAvailability(locator);
    const byName = Object.fromEntries(availability.map((s) => [s.name, s.available]));
    assert.equal(byName.registry, true);
    assert.equal(byName.permissionEngine, true);
    assert.equal(byName.actionEngine, false);
  });

  it('checkServiceAvailability() com ServiceLocator inválido lança RuntimeCompletionError', () => {
    const completion = createRuntimeCompletion();
    assert.throws(
      () => completion.checkServiceAvailability(null),
      (err) => err instanceof RuntimeCompletionError && err.code === 'MAK-L3-COMPLETION-002',
    );
  });

  it('checkGatesManifest() verifica existência de scripts de gate no disco', () => {
    const completion = createRuntimeCompletion();
    const manifest = [
      { id: 'G423-01', scriptPath: 'scripts/gates/g423-01-bootstrap-shell.mjs' },
      { id: 'G423-99', scriptPath: 'scripts/gates/does-not-exist.mjs' },
    ];
    const result = completion.checkGatesManifest(manifest);
    assert.equal(result.find((g) => g.id === 'G423-01').exists, true);
    assert.equal(result.find((g) => g.id === 'G423-99').exists, false);
  });

  it('gera relatório estruturado Foundation C (createFoundationCReport)', () => {
    const completion = createRuntimeCompletion();
    const report = completion.createFoundationCReport({ registry: {}, permissionEngine: {} });

    assert.equal(report.modules.length, 24);
    assert.equal(report.availableCount + report.missingCount, 24);
    assert.ok(report.generatedAt >= 0);
  });

  it('resultado é determinístico para a mesma entrada', () => {
    const completion = createRuntimeCompletion({ clock: () => 1000 });
    const runtime = { registry: {}, permissionEngine: {} };

    const reportA = completion.createFoundationCReport(runtime);
    const reportB = completion.createFoundationCReport(runtime);
    assert.deepEqual(reportA, reportB);
  });

  it('não executa Action/Workflow/Connector de verdade (apenas inspeciona presença)', () => {
    const completion = createRuntimeCompletion();
    let executed = false;
    const fakeActionEngine = { dispatch: () => { executed = true; } };
    const modules = completion.checkRuntimeCompleteness({ actionEngine: fakeActionEngine });

    const byId = Object.fromEntries(modules.map((m) => [m.id, m.status]));
    assert.equal(byId.M10, 'available');
    assert.equal(executed, false);
  });

  it('não importa Prisma/backend/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/completion/runtimeCompletion.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não importa React (sem execução de UI real)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/completion/runtimeCompletion.js'), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
  });
});
