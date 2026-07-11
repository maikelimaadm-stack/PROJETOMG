import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  resolveModeloBase1GenericKernelConsumption,
  isModeloBase1GenericKernelConsumptionRequested,
  isEmpresasGenericKernelConsumptionRequested,
  isCadcpsGenericKernelConsumptionRequested,
  MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG,
  EMPRESAS_GENERIC_KERNEL_FLAG,
  CADCPS_GENERIC_KERNEL_FLAG,
} from '../../ModeloBase1/generic-model-adapter/activation/modeloBase1GenericKernelConsumptionConfig.js';
import { applyModeloBase1GenericKernelConsumption } from '../../ModeloBase1/generic-model-adapter/activation/applyModeloBase1GenericKernelConsumption.js';
import { createModeloBase1GenericKernelConsumptionFallback } from '../../ModeloBase1/generic-model-adapter/activation/modeloBase1GenericKernelConsumptionFallback.js';
import { createModeloBase1GenericKernelConsumptionDiagnostics } from '../../ModeloBase1/generic-model-adapter/activation/modeloBase1GenericKernelConsumptionDiagnostics.js';
import { ModeloBase1GenericKernelConsumptionError } from '../../ModeloBase1/generic-model-adapter/activation/modeloBase1GenericKernelConsumptionErrors.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ACTIVATION_DIR = path.join(HERE, '../../ModeloBase1/generic-model-adapter/activation');
const HOOK_FILE = 'useModeloBase1GenericKernelConsumption.js';
function activationFiles() {
  return fs.readdirSync(ACTIVATION_DIR).filter((f) => f.endsWith('.js'));
}
function activationSource(excludeHook = false) {
  return activationFiles()
    .filter((f) => !(excludeHook && f === HOOK_FILE))
    .map((f) => fs.readFileSync(path.join(ACTIVATION_DIR, f), 'utf8'))
    .join('\n');
}
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const mb1ReadState = (over = {}) => ({
  moduleId: 'empresas', betaApplied: true, writeBlocked: true, source: 'runtime-v2-beta',
  table: { columns: [{ id: 'razao_social' }], visibleColumns: [{ id: 'razao_social' }], rows: [{ id: 'r1', cells: { razao_social: 'ACME' } }], rowCount: 1 },
  form: { fields: [{ id: 'razao_social' }], visibleFields: [{ id: 'razao_social' }] },
  diagnostics: { permissionsApplied: true },
  ...over,
});
const devEnv = (over = {}) => ({ DEV: 'true', ...over });

describe('Empresas/cadcps consuming Generic Kernel through ModeloBase1 (post-Foundation C)', () => {
  // ── Flags / resolution ──────────────────────────────────────────────
  // 1
  it('flag off: consumption desabilitado (legacyFallback), reason consumption-flag-off', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv() });
    assert.equal(r.consumptionEnabled, false);
    assert.equal(r.legacyFallback, true);
    assert.equal(r.reason, 'consumption-flag-off');
  });

  // 2
  it('umbrella flag on + beta: consumption habilitado', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG]: 'true' }) });
    assert.equal(r.consumptionEnabled, true);
    assert.equal(r.reason, null);
  });

  // 3
  it('per-module empresas flag on + beta: habilitado', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.consumptionEnabled, true);
  });

  // 4
  it('per-module cadcps flag on + beta: habilitado', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'cadcps', readState: mb1ReadState({ moduleId: 'cadcps' }), env: devEnv({ [CADCPS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.consumptionEnabled, true);
  });

  // 5 — só liga quando beta disponível
  it('flag on mas beta NÃO aplicado: desabilitado, reason beta-read-model-off', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState({ betaApplied: false }), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.consumptionEnabled, false);
    assert.equal(r.reason, 'beta-read-model-off');
  });

  // 6 — fail-closed em produção
  it('produção fail-closed: flag on, MODE=production, sem allow_prod → desabilitado', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: { MODE: 'production', [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' } });
    assert.equal(r.consumptionRequested, false);
    assert.equal(r.consumptionEnabled, false);
  });

  // 7 — allow_prod libera
  it('produção com allow_prod: habilitado', () => {
    const r = resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: { MODE: 'production', [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true', MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL_ALLOW_PROD: 'true' } });
    assert.equal(r.consumptionEnabled, true);
  });

  // 8 — per-module requested helpers
  it('helpers de requested por módulo respeitam flags', () => {
    assert.equal(isEmpresasGenericKernelConsumptionRequested(devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' })), true);
    assert.equal(isCadcpsGenericKernelConsumptionRequested(devEnv({ [CADCPS_GENERIC_KERNEL_FLAG]: 'true' })), true);
    assert.equal(isEmpresasGenericKernelConsumptionRequested(devEnv()), false);
  });

  // 9 — unknown module segue só o umbrella
  it('módulo desconhecido segue apenas o umbrella flag', () => {
    assert.equal(isModeloBase1GenericKernelConsumptionRequested('outro', devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' })), false);
    assert.equal(isModeloBase1GenericKernelConsumptionRequested('outro', devEnv({ [MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG]: 'true' })), true);
  });

  // ── Apply: flag OFF = comportamento atual ───────────────────────────
  // 10
  it('apply flag off: retorna read state atual verbatim, consumptionApplied false', () => {
    const original = mb1ReadState();
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv() });
    assert.equal(r.consumptionApplied, false);
    assert.equal(r.legacyFallback, true);
    assert.equal(r.readState.moduleId, 'empresas');
    assert.equal(r.readState.table.columns.length, 1);
    assert.equal(r.readState.genericKernelApplied, undefined);
  });

  // 11 — apply flag ON = passa pelo adapter genérico
  it('apply flag on + beta: consumptionApplied true, genericKernelApplied true', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.ok, true);
    assert.equal(r.consumptionApplied, true);
    assert.equal(r.readState.genericKernelApplied, true);
  });

  // 12 — table/form preservam shape após round-trip pelo kernel
  it('apply on: table/form preservam shape (columns/rows/fields)', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.readState.table.columns.length, 1);
    assert.equal(r.readState.table.visibleColumns.length, 1);
    assert.equal(r.readState.table.rows.length, 1);
    assert.equal(r.readState.table.rowCount, 1);
    assert.equal(r.readState.form.fields.length, 1);
    assert.equal(r.readState.form.visibleFields.length, 1);
  });

  // 13 — merge preserva campos originais (moduleId/writeBlocked/source/diagnostics)
  it('apply on: merge preserva campos originais do MB1', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.readState.moduleId, 'empresas');
    assert.equal(r.readState.writeBlocked, true);
    assert.equal(r.readState.source, 'runtime-v2-beta');
    assert.equal(r.readState.diagnostics.permissionsApplied, true);
  });

  // 14 — read state inválido → fallback verbatim
  it('apply on com read state inválido (form ausente): fallback, reason generic-validation-failed', () => {
    const bad = mb1ReadState({ form: null });
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: bad, env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.ok, false);
    assert.equal(r.consumptionApplied, false);
    assert.equal(r.legacyFallback, true);
    assert.equal(r.reason, 'generic-validation-failed');
    assert.equal(r.fallback.fallbackApplied, true);
  });

  // 15 — adapter lança → fallback adapter-failure, estado original preservado
  it('apply on: adapter que lança → fallback adapter-failure, read state original preservado', () => {
    const createAdapter = () => { throw new Error('boom'); };
    const original = mb1ReadState();
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }), createAdapter });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'adapter-failure');
    assert.equal(r.readState.moduleId, 'empresas');
    assert.equal(r.readState.table.columns.length, 1);
  });

  // 16 — adapter retorna generic.ok=false → fallback
  it('apply on: adapter mapReadToGeneric ok=false → fallback generic-validation-failed', () => {
    const createAdapter = () => ({
      mapReadToGeneric: () => ({ ok: false, readModel: null, validation: { valid: false }, errors: ['x'], warnings: [] }),
      mapGenericToRead: () => ({}),
    });
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }), createAdapter });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'generic-validation-failed');
  });

  // 17 — mapGenericToRead retorna não-objeto → fallback invalid-read-model
  it('apply on: mapGenericToRead retorna não-objeto → fallback invalid-read-model', () => {
    const createAdapter = () => ({
      mapReadToGeneric: () => ({ ok: true, readModel: { modelId: 'modelobase1', table: { columns: [], rows: [] } }, validation: { valid: true }, warnings: [] }),
      mapGenericToRead: () => null,
    });
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }), createAdapter });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'invalid-read-model');
  });

  // 18 — adapter sem métodos esperados → fallback adapter-failure
  it('apply on: adapter sem mapReadToGeneric/mapGenericToRead → fallback', () => {
    const createAdapter = () => ({});
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }), createAdapter });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'adapter-failure');
  });

  // 19 — invariantes seguros no merged state
  it('apply on: merged state mantém invariantes seguros (backend/prisma/runtimeBridge Touched false)', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.readState.localOnly, true);
    assert.equal(r.readState.persistenceReal, false);
    assert.equal(r.readState.backendTouched, false);
    assert.equal(r.readState.prismaTouched, false);
    assert.equal(r.readState.runtimeBridgeTouched, false);
  });

  // 20 — diagnostics applied
  it('apply on: diagnostics reporta genericKernelApplied true / readiness generic-kernel', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.diagnostics.genericKernelApplied, true);
    assert.equal(r.diagnostics.readiness, 'generic-kernel');
  });

  // 21 — diagnostics on fallback
  it('apply fallback: diagnostics reporta legacyFallback true / readiness legacy', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv() });
    assert.equal(r.diagnostics.legacyFallback, true);
    assert.equal(r.diagnostics.readiness, 'legacy');
    assert.equal(r.diagnostics.genericKernelApplied, false);
  });

  // 22 — retorno é cópia segura
  it('apply: mutar readState retornado não vaza para chamadas futuras', () => {
    const original = mb1ReadState();
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    r.readState.table.columns.push({ id: 'INJECTED' });
    assert.equal(original.table.columns.length, 1);
    const r2 = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.ok(!r2.readState.table.columns.some((c) => c.id === 'INJECTED'));
  });

  // 23 — moduleId resolvido do readState quando ausente
  it('apply: moduleId resolvido do readState quando não passado', () => {
    const r = applyModeloBase1GenericKernelConsumption({ readState: mb1ReadState({ moduleId: 'cadcps' }), env: devEnv({ [CADCPS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.moduleId, 'cadcps');
    assert.equal(r.consumptionApplied, true);
  });

  // 24 — umbrella habilita empresas e cadcps
  it('umbrella habilita ambos empresas e cadcps', () => {
    const env = devEnv({ [MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG]: 'true' });
    const e = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env });
    const c = applyModeloBase1GenericKernelConsumption({ moduleId: 'cadcps', readState: mb1ReadState({ moduleId: 'cadcps' }), env });
    assert.equal(e.consumptionApplied, true);
    assert.equal(c.consumptionApplied, true);
  });

  // 25 — options não-objeto lança GKC-001
  it('apply: options não-objeto lança ModeloBase1GenericKernelConsumptionError GKC-001', () => {
    assert.throws(() => applyModeloBase1GenericKernelConsumption(42), (err) => err instanceof ModeloBase1GenericKernelConsumptionError && err.code === 'MAK-MB1-GKC-001');
  });

  // 26 — readState null + flag off → legacy, readState null
  it('apply: readState null + flag off → legacy, readState null', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: null, env: devEnv() });
    assert.equal(r.consumptionApplied, false);
    assert.equal(r.readState, null);
  });

  // 27 — readState null + flag on → beta off → legacy
  it('apply: readState null + flag on → beta ausente → legacy (não quebra)', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: null, env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.consumptionApplied, false);
    assert.equal(r.reason, 'beta-read-model-off');
  });

  // 28 — writeBlocked preservado
  it('apply on: writeBlocked preservado no merged state', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState({ writeBlocked: true }), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.readState.writeBlocked, true);
  });

  // 29 — genericKernelSource anotado
  it('apply on: genericKernelSource é anotado', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(typeof r.readState.genericKernelSource, 'string');
  });

  // ── Fallback builder ────────────────────────────────────────────────
  // 30
  it('fallback builder: ok false, legacyFallback true, retorna read state original', () => {
    const original = mb1ReadState();
    const fb = createModeloBase1GenericKernelConsumptionFallback({ moduleId: 'empresas', readState: original, reason: 'adapter-failure' });
    assert.equal(fb.ok, false);
    assert.equal(fb.legacyFallback, true);
    assert.equal(fb.readState.moduleId, 'empresas');
  });

  // 31
  it('fallback builder: fallback + rollbackPlan sem executar rollback', () => {
    const fb = createModeloBase1GenericKernelConsumptionFallback({ moduleId: 'empresas', readState: mb1ReadState(), reason: 'invalid-read-model' });
    assert.equal(fb.fallback.fallbackApplied, true);
    assert.equal(fb.rollbackPlan.rollbackAvailable, true);
    assert.equal(fb.rollbackPlan.safety.executesRollback, false);
  });

  // 32 — readState ausente → null
  it('fallback builder: sem readState → readState null', () => {
    const fb = createModeloBase1GenericKernelConsumptionFallback({ moduleId: 'empresas', reason: 'runtime-read-model-absent' });
    assert.equal(fb.readState, null);
  });

  // ── Diagnostics builder ─────────────────────────────────────────────
  // 33
  it('diagnostics builder: invariantes locais/sem side effect', () => {
    const d = createModeloBase1GenericKernelConsumptionDiagnostics({ moduleId: 'empresas', consumptionEnabled: true, consumptionApplied: true });
    assert.equal(d.localOnly, true);
    assert.equal(d.persistenceReal, false);
    assert.equal(d.backendTouched, false);
    assert.equal(d.prismaTouched, false);
    assert.equal(d.runtimeBridgeTouched, false);
    assert.equal(d.noSideEffects, true);
    assert.equal(d.reversible, true);
  });

  // 34
  it('diagnostics builder: consumptionApplied false → readiness legacy', () => {
    const d = createModeloBase1GenericKernelConsumptionDiagnostics({ moduleId: 'empresas', consumptionApplied: false });
    assert.equal(d.readiness, 'legacy');
    assert.equal(d.legacyFallback, true);
  });

  // 35 — validation summary
  it('diagnostics builder: sumariza validation', () => {
    const d = createModeloBase1GenericKernelConsumptionDiagnostics({ moduleId: 'empresas', consumptionApplied: true, validation: { valid: true, errors: [] } });
    assert.equal(d.validation.valid, true);
    assert.equal(d.validation.errorCount, 0);
  });

  // 36 — diagnostics serializável
  it('diagnostics builder: serializável (sem funções)', () => {
    const d = createModeloBase1GenericKernelConsumptionDiagnostics({ moduleId: 'empresas', consumptionApplied: true });
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(d)));
  });

  // ── Reversibilidade: off === atual ──────────────────────────────────
  // 37
  it('reversibilidade: flag off produz o estado atual (sem anotações do kernel)', () => {
    const original = mb1ReadState();
    const off = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv() });
    assert.equal(off.readState.genericKernelApplied, undefined);
    assert.deepEqual(off.readState.table.columns, original.table.columns);
    assert.deepEqual(off.readState.form.fields, original.form.fields);
  });

  // 38 — on vs off diferem apenas por anotação + normalização
  it('reversibilidade: on vs off preservam os mesmos dados de table/form', () => {
    const original = mb1ReadState();
    const on = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    const off = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: original, env: devEnv() });
    assert.equal(on.readState.table.rows.length, off.readState.table.rows.length);
    assert.equal(on.readState.form.fields.length, off.readState.form.fields.length);
  });

  // ── Isolamento / invariantes de código ──────────────────────────────
  // 39 — nenhum arquivo (exceto hook) importa React; nenhum importa backend/Prisma/fetch/storage
  it('activation (exceto hook) não importa React/backend/Prisma; sem fetch/storage', () => {
    const src = activationSource(true);
    const imports = [...codeOnly(src).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => p !== 'react' && !/^react(\/|$)/.test(p)), 'no React outside the hook');
    assert.ok(imports.every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)), 'no backend/apis/Prisma');
    assert.ok(imports.every((p) => !/makBootstrap|runtimeBridge/.test(p)), 'no runtimeBridge/makBootstrap');
    const code = codeOnly(src);
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR');
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code), 'no storage API');
  });

  // 40 — o hook opcional é o único que importa React
  it('apenas o hook opcional importa React', () => {
    const hookSrc = fs.readFileSync(path.join(ACTIVATION_DIR, HOOK_FILE), 'utf8');
    const imports = [...codeOnly(hookSrc).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.includes('react'), 'hook imports react');
    assert.ok(imports.some((p) => /applyModeloBase1GenericKernelConsumption/.test(p)), 'hook delega ao apply');
  });

  // 41 — activation não importa configs de módulos empresas/cadcps
  it('activation não importa src/modules/empresas|cadcps (desacoplado)', () => {
    const imports = [...codeOnly(activationSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.every((p) => !/\/modules\/(empresas|cadcps)/.test(p)), 'no module config import');
  });

  // 42 — activation consome o adapter genérico (que consome o kernel)
  it('activation consome o adapter ModeloBase1 → generic kernel', () => {
    const imports = [...codeOnly(activationSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.some((p) => /createModeloBase1GenericModelAdapter/.test(p)), 'consumes the MB1 generic adapter');
  });

  // 43 — nomes de flags documentados
  it('flags têm os nomes documentados', () => {
    assert.equal(MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG, 'MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION');
    assert.equal(EMPRESAS_GENERIC_KERNEL_FLAG, 'MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL');
    assert.equal(CADCPS_GENERIC_KERNEL_FLAG, 'MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL');
  });

  // 44 — nunca liga capacidades perigosas / persistência real
  it('consumo nunca ativa persistência real nem capacidades perigosas', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.equal(r.readState.persistenceReal, false);
    assert.equal(r.diagnostics.persistenceReal, false);
  });

  // 45 — apply retorno serializável
  it('apply: retorno (readState + diagnostics) é serializável', () => {
    const r = applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
    assert.doesNotThrow(() => JSON.parse(JSON.stringify({ readState: r.readState, diagnostics: r.diagnostics })));
  });

  // 46 — o hook existe e é uma função (integração futura, não wired)
  it('hook opcional existe como função exportada (integração futura)', async () => {
    const mod = await import('../../ModeloBase1/generic-model-adapter/activation/useModeloBase1GenericKernelConsumption.js');
    assert.equal(typeof mod.useModeloBase1GenericKernelConsumption, 'function');
  });
});
