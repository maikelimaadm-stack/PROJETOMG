import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EMPRESAS_MODELOBASE1_BETA_FLAG,
  EMPRESAS_MODELOBASE1_BETA_ALLOW_PROD_FLAG,
  CADCPS_MODELOBASE1_BETA_FLAG,
  CADCPS_MODELOBASE1_BETA_ALLOW_PROD_FLAG,
  MODELOBASE1_DIRECT_BETA_FLAG,
  MODELOBASE1_DIRECT_BETA_ALLOW_PROD_FLAG,
  isEmpresasModeloBase1BetaEnabled,
  isCadcpsModeloBase1BetaEnabled,
  isModeloBase1DirectBetaEnabled,
  isEmpresasModeloBase1BetaProductionBlocked,
  isCadcpsModeloBase1BetaProductionBlocked,
} from '../modelobase1-direct-beta/modeloBase1DirectBetaConfig.js';
import {
  createModeloBase1DirectBetaReadModel,
  attemptDirectBetaWrite,
  MODELOBASE1_INJECTION_POINT,
} from '../modelobase1-direct-beta/createModeloBase1DirectBetaReadModel.js';
import { createEmpresasModeloBase1BetaReadModel } from '../modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js';
import {
  createCadcpsModeloBase1BetaReadModel,
  createCadcpsBetaViewModel,
} from '../modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js';
import {
  createDirectBetaWriteGuard,
  BLOCKED_BETA_WRITE_OPERATIONS,
} from '../modelobase1-direct-beta/createDirectBetaWriteGuard.js';
import { createModeloBase1DirectBetaDiagnostics } from '../modelobase1-direct-beta/modeloBase1DirectBetaDiagnostics.js';
import {
  createModeloBase1DirectBetaFallback,
  isModeloBase1DirectBetaFallback,
} from '../modelobase1-direct-beta/modeloBase1DirectBetaFallback.js';
import { ModeloBase1DirectBetaError } from '../modelobase1-direct-beta/errors.js';
import {
  normalizeModeloBase1RuntimeReadModel,
  readModeloBase1RuntimeReadModel,
  hasModeloBase1RuntimeReadModel,
} from '../../ModeloBase1/config/modeloBase1RuntimeReadModel.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BETA_DIR = path.join(HERE, '../modelobase1-direct-beta');
const BETA_FILES = [
  'errors.js',
  'modeloBase1DirectBetaConfig.js',
  'modeloBase1DirectBetaFallback.js',
  'createModeloBase1DirectBetaReadModel.js',
  'createEmpresasModeloBase1BetaReadModel.js',
  'createCadcpsModeloBase1BetaReadModel.js',
  'createDirectBetaWriteGuard.js',
  'modeloBase1DirectBetaDiagnostics.js',
];
const betaSource = () => BETA_FILES.map((f) => fs.readFileSync(path.join(BETA_DIR, f), 'utf8')).join('\n');
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const stableCopy = (o) => JSON.parse(JSON.stringify(o));

const EMP_ON = { [EMPRESAS_MODELOBASE1_BETA_FLAG]: 'true' };
const CPS_ON = { [CADCPS_MODELOBASE1_BETA_FLAG]: 'true' };
const OFF = {};
const WRITE_OPS = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];

describe('ModeloBase1 Empresas/Campos Direct Beta (post-Foundation C)', () => {
  // 1
  it('flags off by default (Empresas, Campos, umbrella)', () => {
    assert.equal(isEmpresasModeloBase1BetaEnabled(OFF), false);
    assert.equal(isCadcpsModeloBase1BetaEnabled(OFF), false);
    assert.equal(isModeloBase1DirectBetaEnabled(OFF), false);
  });

  // 2
  it('Empresas flag on enables only Empresas in dev', () => {
    assert.equal(isEmpresasModeloBase1BetaEnabled(EMP_ON), true);
    assert.equal(isCadcpsModeloBase1BetaEnabled(EMP_ON), false);
  });

  // 3
  it('Campos flag on enables only Campos in dev', () => {
    assert.equal(isCadcpsModeloBase1BetaEnabled(CPS_ON), true);
    assert.equal(isEmpresasModeloBase1BetaEnabled(CPS_ON), false);
  });

  // 4
  it('umbrella flag enables BOTH screens', () => {
    const env = { [MODELOBASE1_DIRECT_BETA_FLAG]: 'true' };
    assert.equal(isEmpresasModeloBase1BetaEnabled(env), true);
    assert.equal(isCadcpsModeloBase1BetaEnabled(env), true);
    assert.equal(isModeloBase1DirectBetaEnabled(env), true);
  });

  // 5
  it('Empresas fails closed in production (flag on, no override)', () => {
    const env = { ...EMP_ON, NODE_ENV: 'production' };
    assert.equal(isEmpresasModeloBase1BetaEnabled(env), false);
    assert.equal(isEmpresasModeloBase1BetaProductionBlocked(env), true);
  });

  // 6
  it('Empresas explicit ALLOW_PROD override re-enables in production', () => {
    const env = { ...EMP_ON, NODE_ENV: 'production', [EMPRESAS_MODELOBASE1_BETA_ALLOW_PROD_FLAG]: 'true' };
    assert.equal(isEmpresasModeloBase1BetaEnabled(env), true);
    assert.equal(isEmpresasModeloBase1BetaProductionBlocked(env), false);
  });

  // 7
  it('Campos fails closed in production; own override re-enables', () => {
    const blocked = { ...CPS_ON, NODE_ENV: 'production' };
    assert.equal(isCadcpsModeloBase1BetaEnabled(blocked), false);
    assert.equal(isCadcpsModeloBase1BetaProductionBlocked(blocked), true);
    const allowed = { ...blocked, [CADCPS_MODELOBASE1_BETA_ALLOW_PROD_FLAG]: 'true' };
    assert.equal(isCadcpsModeloBase1BetaEnabled(allowed), true);
  });

  // 8
  it('umbrella ALLOW_PROD override re-enables both in production', () => {
    const env = { [MODELOBASE1_DIRECT_BETA_FLAG]: 'true', NODE_ENV: 'production', [MODELOBASE1_DIRECT_BETA_ALLOW_PROD_FLAG]: 'true' };
    assert.equal(isEmpresasModeloBase1BetaEnabled(env), true);
    assert.equal(isCadcpsModeloBase1BetaEnabled(env), true);
  });

  // 9
  it('flag names are the documented public contract', () => {
    assert.equal(EMPRESAS_MODELOBASE1_BETA_FLAG, 'MAK_MODELOBASE1_EMPRESAS_BETA');
    assert.equal(CADCPS_MODELOBASE1_BETA_FLAG, 'MAK_MODELOBASE1_CADCPS_BETA');
    assert.equal(MODELOBASE1_DIRECT_BETA_FLAG, 'MAK_MODELOBASE1_DIRECT_BETA');
  });

  // 10
  it('Empresas read model: off → not enabled/injected', () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: OFF });
    assert.equal(m.enabled, false);
    assert.equal(m.injected, false);
    assert.equal(m.readOnly, true);
  });

  // 11
  it('Empresas read model: on → enabled, injected, read-only, correct injection point', () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    assert.equal(m.kind, 'modelobase1-direct-beta-read-model');
    assert.equal(m.enabled, true);
    assert.equal(m.injected, true);
    assert.equal(m.moduleId, 'empresas');
    assert.equal(m.injectedAt, MODELOBASE1_INJECTION_POINT);
    assert.equal(m.injectedAt, 'ModeloBase1.runtimeReadModel');
    assert.equal(m.writeActionsBlocked, true);
    assert.equal(m.usesRealData, false);
    assert.equal(m.betaFlag, EMPRESAS_MODELOBASE1_BETA_FLAG);
  });

  // 12
  it('Empresas read model resolves the read-only view model (runtime v2 + controlled dataset)', async () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const r = await m.resolve();
    assert.equal(r.kind, 'modelobase1-direct-beta-resolved');
    assert.ok(r.table.columns.length > 0);
    assert.equal(r.table.rowCount, r.table.rows.length);
    assert.ok(r.table.rowCount > 0); // controlled dataset rows
    assert.ok(r.form.fields.length > 0);
    assert.equal(r.readOnly, true);
    assert.equal(r.usesRealData, false);
  });

  // 13
  it('Empresas resolve() is deterministic (deep-equal across calls, sans live guard)', async () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const a = await m.resolve();
    const b = await m.resolve();
    assert.deepEqual(stableCopy(a), stableCopy(b));
  });

  // 14
  it('Empresas structural-only mode omits rows', async () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON, includeRows: false });
    const r = await m.resolve();
    assert.equal(r.table.rowCount, 0);
  });

  // 15
  it('Empresas write guard blocks every write-shaped operation', () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    for (const op of WRITE_OPS) {
      const res = m.writeGuard.attempt(op, {});
      assert.equal(res.ok, false);
      assert.equal(res.blocked, true);
    }
  });

  // 16
  it('attemptDirectBetaWrite convenience blocks writes via the read model guard', () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const res = attemptDirectBetaWrite(m, 'create', { razao_social: 'X' });
    assert.equal(res.blocked, true);
    assert.equal(res.ok, false);
  });

  // 17
  it('Campos read model: off → not enabled; on → enabled read-only', () => {
    assert.equal(createCadcpsModeloBase1BetaReadModel({ env: OFF }).enabled, false);
    const on = createCadcpsModeloBase1BetaReadModel({ env: CPS_ON });
    assert.equal(on.enabled, true);
    assert.equal(on.moduleId, 'cadcps');
    assert.equal(on.readOnly, true);
    assert.equal(on.betaFlag, CADCPS_MODELOBASE1_BETA_FLAG);
    assert.equal(on.injectedAt, MODELOBASE1_INJECTION_POINT);
  });

  // 18
  it('Campos resolves a deterministic read-only view model from the controlled dataset', async () => {
    const m = createCadcpsModeloBase1BetaReadModel({ env: CPS_ON });
    const a = await m.resolve();
    const b = await m.resolve();
    assert.ok(a.table.columns.length > 0);
    assert.ok(a.table.rowCount > 0);
    assert.ok(a.form.fields.length > 0);
    assert.equal(a.usesRealData, false);
    assert.deepEqual(stableCopy(a), stableCopy(b));
  });

  // 19
  it('Campos view model surfaces denied-field permissions and required validations', () => {
    const vm = createCadcpsBetaViewModel({});
    assert.ok(vm.permissions.length >= 1); // cps-3 denies "ativo"
    assert.ok(vm.permissions.every((p) => p.denied === true));
    assert.ok(vm.validations.some((v) => v.rules.includes('required')));
  });

  // 20
  it('Campos write guard blocks every write-shaped operation (MB1-BETA-003)', () => {
    const m = createCadcpsModeloBase1BetaReadModel({ env: CPS_ON });
    for (const op of WRITE_OPS) {
      const res = m.writeGuard.attempt(op, {});
      assert.equal(res.blocked, true);
      assert.equal(res.code, 'MAK-L3-MB1-BETA-003');
    }
  });

  // 21
  it('generic write guard: disabled → 001, production-blocked → 002, invalid op → 004', () => {
    assert.equal(createDirectBetaWriteGuard({ moduleId: 'x', enabled: false }).attempt('create').code, 'MAK-L3-MB1-BETA-001');
    assert.equal(createDirectBetaWriteGuard({ moduleId: 'x', productionBlocked: true }).attempt('create').code, 'MAK-L3-MB1-BETA-002');
    assert.equal(createDirectBetaWriteGuard({ moduleId: 'x', enabled: true }).attempt('frobnicate').code, 'MAK-L3-MB1-BETA-004');
  });

  // 22
  it('generic write guard blocks prototype pollution in the payload (007)', () => {
    const guard = createDirectBetaWriteGuard({ moduleId: 'x', enabled: true });
    const poisoned = JSON.parse('{"__proto__":{"polluted":true}}');
    assert.equal(guard.attempt('create', poisoned).code, 'MAK-L3-MB1-BETA-007');
  });

  // 23
  it('BLOCKED_BETA_WRITE_OPERATIONS covers the standard write surface', () => {
    for (const op of WRITE_OPS) assert.ok(BLOCKED_BETA_WRITE_OPERATIONS.includes(op));
  });

  // 24
  it('generic factory rejects non-plain options and missing required fields', () => {
    assert.throws(() => createModeloBase1DirectBetaReadModel(null), ModeloBase1DirectBetaError);
    assert.throws(() => createModeloBase1DirectBetaReadModel({ moduleId: '' }), ModeloBase1DirectBetaError);
    assert.throws(() => createModeloBase1DirectBetaReadModel({ moduleId: 'x', resolveViewModel: () => ({}) }), ModeloBase1DirectBetaError); // no guard
  });

  // 25
  it('generic factory blocks prototype pollution in the options envelope', () => {
    const poisoned = JSON.parse('{"moduleId":"x","__proto__":{"y":1}}');
    assert.throws(() => createModeloBase1DirectBetaReadModel(poisoned), ModeloBase1DirectBetaError);
  });

  // 26
  it('resolved model is a safe copy with the LIVE write guard re-attached', async () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const r = await m.resolve();
    assert.equal(typeof r.writeGuard.attempt, 'function'); // survived the clone
    assert.equal(r.writeGuard.attempt('create', {}).blocked, true);
  });

  // 27
  it('injection point: normalize returns null for absent/disabled, the model when enabled', () => {
    assert.equal(normalizeModeloBase1RuntimeReadModel(null), null);
    assert.equal(normalizeModeloBase1RuntimeReadModel(undefined), null);
    assert.equal(normalizeModeloBase1RuntimeReadModel({ enabled: false }), null);
    const enabled = { enabled: true, kind: 'k' };
    assert.equal(normalizeModeloBase1RuntimeReadModel(enabled), enabled);
  });

  // 28
  it('injection point: read/has helpers reflect config state (no-op when absent)', () => {
    const model = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    assert.equal(readModeloBase1RuntimeReadModel({ runtimeReadModel: model }), model);
    assert.equal(readModeloBase1RuntimeReadModel({}), null);
    assert.equal(hasModeloBase1RuntimeReadModel({ runtimeReadModel: model }), true);
    assert.equal(hasModeloBase1RuntimeReadModel({}), false);
    assert.equal(hasModeloBase1RuntimeReadModel(null), false);
  });

  // 29
  it('fallback descriptor: flag off → not injected, legacy config, reversible', () => {
    const fb = createModeloBase1DirectBetaFallback({ moduleId: 'empresas' });
    assert.equal(fb.injected, false);
    assert.equal(fb.usesLegacyConfig, true);
    assert.equal(fb.reversible, true);
    assert.equal(fb.reason, 'flag-disabled');
  });

  // 30
  it('isModeloBase1DirectBetaFallback recognizes null/disabled as fallback', () => {
    assert.equal(isModeloBase1DirectBetaFallback(null), true);
    assert.equal(isModeloBase1DirectBetaFallback(undefined), true);
    assert.equal(isModeloBase1DirectBetaFallback({ enabled: false }), true);
    assert.equal(isModeloBase1DirectBetaFallback({ enabled: true }), false);
  });

  // 31
  it('diagnostics summarize both screens; ready when read-only and no real data', () => {
    const emp = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const cps = createCadcpsModeloBase1BetaReadModel({ env: CPS_ON });
    const diag = createModeloBase1DirectBetaDiagnostics({ empresas: emp, cadcps: cps });
    assert.equal(diag.kind, 'modelobase1-direct-beta-diagnostics');
    assert.equal(diag.injectedCount, 2);
    assert.equal(diag.allReadOnly, true);
    assert.equal(diag.usesRealData, false);
    assert.equal(diag.readinessStatus, 'ready_for_next_slice');
    assert.equal(diag.nextAllowedStep, 'Phase 2 — ModeloBase1 Runtime Wiring');
  });

  // 32
  it('diagnostics mark fallback for absent screens', () => {
    const diag = createModeloBase1DirectBetaDiagnostics({ empresas: null, cadcps: null });
    assert.equal(diag.injectedCount, 0);
    assert.equal(diag.anyEnabled, false);
    assert.ok(diag.screens.every((s) => s.fallback === true));
  });

  // 33 — determinism of the static descriptor
  it('static read model descriptor is deterministic (deep-equal across calls)', () => {
    const a = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const b = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    assert.deepEqual(stableCopy(a), stableCopy(b));
  });

  // 34 — no real data / no backend / no Prisma / no fetch / no storage / no CSS
  it('module source uses NO backend/Prisma/fetch/storage/CSS/real-data', () => {
    const src = betaSource();
    const code = codeOnly(src);
    assert.ok(!/from\s+['"].*prisma.*['"]/i.test(src), 'no Prisma import');
    assert.ok(!/PrismaClient/.test(code), 'no PrismaClient');
    assert.ok(!/from\s+['"].*\/backend\/.*['"]/i.test(src), 'no backend import');
    assert.ok(!/from\s+['"].*\/apis\/.*['"]/i.test(src), 'no apis import');
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code), 'no fetch/XHR/WebSocket');
    assert.ok(!/localStorage|sessionStorage|indexedDB/.test(code), 'no web storage');
    assert.ok(!/import\s+['"][^'"]+\.css['"]/i.test(src), 'no CSS import');
  });

  // 35 — module never imports the legacy runtime bridge / makBootstrap / other screens
  it('module never imports runtimeBridge/makBootstrap/framework/other modules', () => {
    const imports = [...codeOnly(betaSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(!imports.some((p) => /makBootstrap/.test(p) || /\/runtimeBridge\//.test(p)), 'no legacy bridge');
    assert.ok(!imports.some((p) => /\/framework\//.test(p)), 'no framework import');
    assert.ok(!imports.some((p) => /\/modules\//.test(p) || /\/studio\//.test(p) || /marketplace/i.test(p)), 'no module/studio/marketplace import');
  });

  // 36 — resolved model carries no functions besides the re-attached guard (serializable payload)
  it('resolved model minus the guard is JSON-serializable (no hidden functions)', async () => {
    const m = createEmpresasModeloBase1BetaReadModel({ env: EMP_ON });
    const r = await m.resolve();
    const { writeGuard, ...rest } = r;
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(rest)));
    assert.ok(writeGuard);
  });
});
