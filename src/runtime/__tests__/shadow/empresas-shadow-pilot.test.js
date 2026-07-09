import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasShadowPilot, EmpresasShadowPilot } from '../../shadow/pilots/empresasShadowPilot.js';
import { EmpresasShadowPilotError } from '../../shadow/pilots/errors.js';
import { createObservabilityEngine } from '../../infra/observability/observabilityEngine.js';
import { createRuntimeCompletion } from '../../core/completion/runtimeCompletion.js';

const PILOT_SRC = '../../shadow/pilots/empresasShadowPilot.js';

describe('Empresas Runtime v2 Shadow Pilot (post-Foundation C)', () => {
  it('cria o piloto', () => {
    const pilot = createEmpresasShadowPilot();
    assert.ok(pilot instanceof EmpresasShadowPilot);
  });

  it('vem DESLIGADO por padrão (opt-in via flag)', () => {
    const pilot = createEmpresasShadowPilot();
    assert.equal(pilot.isEnabled(), false);
  });

  it('ligado executa o shadow pass', async () => {
    const pilot = createEmpresasShadowPilot({ enabled: true, completion: createRuntimeCompletion() });
    const report = await pilot.run();
    assert.equal(report.skipped, false);
    assert.equal(report.ok, true);
    assert.equal(report.moduleId, 'empresas');
    assert.equal(report.passSuccess, true);
  });

  it('desligado retorna skipped (efeito zero)', async () => {
    const pilot = createEmpresasShadowPilot({ enabled: false });
    const report = await pilot.run();
    assert.equal(report.skipped, true);
    assert.equal(report.reason, 'empresas shadow pilot disabled');
    assert.equal(pilot.getDiagnostics().runCount, 0);
    assert.equal(pilot.getDiagnostics().records.length, 0);
  });

  it('createLegacySnapshot é determinístico', () => {
    const pilot = createEmpresasShadowPilot({ enabled: true });
    const a = pilot.createLegacySnapshot();
    const b = pilot.createLegacySnapshot();
    assert.deepEqual(a, b);
    assert.equal(a.moduleId, 'empresas');
    // legacy keeps raw types
    assert.equal(a.fields.find((f) => f.id === 'telefone').type, 'tel');
    // deterministic sort by id
    assert.deepEqual([...a.fields].map((f) => f.id).sort(), a.fields.map((f) => f.id));
  });

  it('createRuntimeV2Input é determinístico e canonicaliza tipos', () => {
    const pilot = createEmpresasShadowPilot({ enabled: true });
    const a = pilot.createRuntimeV2Input();
    const b = pilot.createRuntimeV2Input();
    assert.deepEqual(a, b);
    // v2 canonicalizes tel -> phone, cpf_cnpj -> document
    assert.equal(a.fields.find((f) => f.id === 'telefone').type, 'phone');
    assert.equal(a.fields.find((f) => f.id === 'cpf_cnpj').type, 'document');
  });

  it('compare gera diferenças controladas (drift de normalização de tipos)', async () => {
    const pilot = createEmpresasShadowPilot({ enabled: true, completion: createRuntimeCompletion() });
    const report = await pilot.run();
    assert.equal(report.equivalent, false);
    assert.deepEqual(report.comparison.differences.map((d) => d.path), ['fields']);
    assert.deepEqual(report.comparison.onlyInLegacy, []);
    assert.deepEqual(report.comparison.onlyInV2, []);
  });

  it('snapshots idênticos comparam como equivalentes', async () => {
    // A descriptor with only select fields has no v2 type drift → equivalent.
    const pilot = createEmpresasShadowPilot({
      enabled: true,
      descriptor: {
        fields: [
          { id: 'tipo_pessoa', type: 'select', required: true },
          { id: 'status', type: 'select', required: false },
        ],
        requiredFields: ['tipo_pessoa'],
      },
    });
    const report = await pilot.run();
    assert.equal(report.equivalent, true);
    assert.equal(report.comparison.differences.length, 0);
  });

  it('getDiagnostics retorna cópia segura', async () => {
    const pilot = createEmpresasShadowPilot({ enabled: true });
    await pilot.run();
    const diag = pilot.getDiagnostics();
    assert.equal(diag.moduleId, 'empresas');
    assert.equal(diag.runCount, 1);
    assert.equal(diag.records.length, 1);
  });

  it('mutar diagnostics NÃO altera o estado interno', async () => {
    const pilot = createEmpresasShadowPilot({ enabled: true });
    await pilot.run();
    const diag = pilot.getDiagnostics();
    diag.records.push({ id: 'fake', ok: true, detail: {}, timestamp: 0 });
    diag.records[0].detail = { tampered: true };
    assert.equal(pilot.getDiagnostics().records.length, 1);
    assert.notDeepEqual(pilot.getDiagnostics().records[0].detail, { tampered: true });
  });

  it('dados sensíveis são mascarados nos snapshots e diagnostics', () => {
    const pilot = createEmpresasShadowPilot({ enabled: true, descriptor: { meta: { token: 'abc', region: 'br' } } });
    const legacy = pilot.createLegacySnapshot();
    assert.equal(legacy.meta.token, '[REDACTED]');
    assert.equal(legacy.meta.region, 'br');
    const v2 = pilot.createRuntimeV2Input();
    assert.equal(v2.meta.token, '[REDACTED]');
  });

  it('prototype pollution é bloqueado em input', async () => {
    const pilot = createEmpresasShadowPilot({ enabled: true });
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => pilot.run(polluted),
      (err) => err instanceof EmpresasShadowPilotError && err.code === 'MAK-L3-SHADOW-PILOT-001',
    );
  });

  it('falha do RuntimeShadowMode é capturada, não propagada', async () => {
    const brokenShadowMode = {
      compareWithLegacy: () => { throw new Error('shadow broke'); },
      runShadowPass: async () => ({ skipped: false, success: true }),
    };
    const pilot = createEmpresasShadowPilot({ enabled: true, shadowMode: brokenShadowMode });
    const report = await pilot.run();
    assert.equal(report.ok, false);
    assert.equal(report.error.message, 'shadow broke');
    assert.equal(pilot.getDiagnostics().failureCount, 1);
  });

  it('não renderiza UI real (sem React/DOM)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PILOT_SRC), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(/from\s+['"]react-dom['"]/i.test(source), false);
    assert.equal(/document\.|window\.|\brender\s*\(/i.test(source), false);
  });

  it('não executa action/workflow/connector com side effect', async () => {
    let sideEffects = 0;
    const pilot = createEmpresasShadowPilot({
      enabled: true,
      completion: createRuntimeCompletion(),
      loadRuntimeV2: () => ({
        moduleId: 'empresas',
        registry: {},
        actionEngine: { dispatch: () => { sideEffects += 1; } },
        workflowEngine: { start: () => { sideEffects += 1; } },
        connectorEngine: { execute: () => { sideEffects += 1; } },
      }),
    });
    const report = await pilot.run();
    assert.equal(report.ok, true);
    assert.equal(sideEffects, 0);
  });

  it('não chama backend direto (sem fetch/XHR/WebSocket/storage)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PILOT_SRC), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/from\s+['"].*backend.*['"]/i.test(codeOnly), false);
    assert.equal(/\bfetch\s*\(/.test(codeOnly), false);
    assert.equal(/XMLHttpRequest/.test(codeOnly), false);
    assert.equal(/WebSocket|BroadcastChannel/.test(codeOnly), false);
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PILOT_SRC), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
  });

  it('integra com RuntimeShadowMode (comparação + pass) e Observability', async () => {
    const observability = createObservabilityEngine();
    const pilot = createEmpresasShadowPilot({ enabled: true, observability, completion: createRuntimeCompletion() });
    const report = await pilot.run();
    assert.ok(report.comparison);
    assert.equal(typeof report.comparison.equivalent, 'boolean');
    const snap = observability.snapshot();
    assert.equal(snap.events.some((e) => e.type === 'shadow.pass'), true);
  });

  it('não importa a UI de produção do módulo Empresas (decoupling runtime→módulo)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PILOT_SRC), 'utf8');
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(source), false);
    assert.equal(/App\.jsx/i.test(source), false);
  });
});
