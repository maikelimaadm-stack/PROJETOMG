import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasReadOnlyRuntimeCandidate } from '../../migration/empresas-readonly/createEmpresasReadOnlyRuntimeCandidate.js';
import { createEmpresasReadOnlyViewModel } from '../../migration/empresas-readonly/createEmpresasReadOnlyViewModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../../migration/empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasReadOnlyDiagnostics } from '../../migration/empresas-readonly/empresasReadOnlyDiagnostics.js';
import { EmpresasReadOnlyError } from '../../migration/empresas-readonly/errors.js';
import { EMPRESAS_READONLY_FLAG, EMPRESAS_READONLY_ALLOW_PROD_FLAG } from '../../migration/empresas-readonly/empresasReadOnlyConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATE_DIR = path.join(HERE, '../../migration/empresas-readonly');
const CANDIDATE_FILES = [
  'createEmpresasReadOnlyRuntimeCandidate.js',
  'createEmpresasReadOnlyViewModel.js',
  'empresasReadOnlyConfig.js',
  'empresasReadOnlyDiagnostics.js',
  'empresasReadOnlyWriteGuard.js',
  'errors.js',
];
function candidateSource() {
  return CANDIDATE_FILES.map((f) => fs.readFileSync(path.join(CANDIDATE_DIR, f), 'utf8')).join('\n');
}
function candidateCodeOnly() {
  return candidateSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const ON = { [EMPRESAS_READONLY_FLAG]: 'true' };
const OFF = {};
const stableCopy = (o) => JSON.parse(JSON.stringify(o));

describe('Empresas Read-Only Runtime v2 Candidate (post-Foundation C)', () => {
  // 1
  it('candidate default desligado', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: OFF });
    assert.equal(c.enabled, false);
    assert.equal(c.skipped, true);
    assert.equal(c.noSideEffects, true);
    assert.equal(c.viewModel, null);
  });

  // 2
  it('candidate habilita somente com flag', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(c.enabled, true);
    assert.equal(c.skipped, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(c.enabled, false);
    assert.equal(c.productionBlocked, true);
    // override explícito de produção
    const ok = await createEmpresasReadOnlyRuntimeCandidate({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_READONLY_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('candidate é determinístico', async () => {
    const a = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    const b = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.deepEqual(stableCopy(a), stableCopy(b));
  });

  // 5
  it('candidate moduleId é empresas', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(c.moduleId, 'empresas');
  });

  // 6
  it('candidate não marca como migrated', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.notEqual(c.mode, 'migrated');
    assert.notEqual(c.readinessStatus, 'migrated');
  });

  // 7
  it('candidate mode é read_only_candidate', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(c.mode, 'read_only_candidate');
  });

  // 8
  it('candidate currentRuntime é legacy', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(c.currentRuntime, 'legacy');
  });

  // 9
  it('candidate targetRuntime é runtime-v2', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(c.targetRuntime, 'runtime-v2');
  });

  // 10
  it('viewModel possui table', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    assert.equal(isObj(vm.table), true);
  });

  // 11
  it('viewModel possui form', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    assert.equal(isObj(vm.form), true);
  });

  // 12
  it('viewModel possui columns', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    assert.equal(Array.isArray(vm.table.columns), true);
    assert.equal(vm.table.columns.length > 0, true);
  });

  // 13
  it('viewModel possui fields', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    assert.equal(Array.isArray(vm.form.fields), true);
    assert.equal(vm.form.fields.length > 0, true);
  });

  // 14
  it('viewModel usa dataset/fixture controlado', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    assert.equal(vm.source, 'controlled-dev-dataset');
    assert.equal(vm.table.rowCount > 0, true);
  });

  // 15
  it('viewModel não usa dados reais', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    assert.equal(vm.diagnostics.usesRealData, false);
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(candidateCodeOnly()), false);
  });

  // 16
  it('dados sensíveis são mascarados', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    const serialized = JSON.stringify(vm);
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(serialized), false);
  });

  // 17
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasReadOnlyRuntimeCandidate(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasReadOnlyError);
    await assert.rejects(() => createEmpresasReadOnlyViewModel({ descriptor: JSON.parse('{"constructor": {"y": 1}}') }), EmpresasReadOnlyError);
  });

  // 18
  it('retornos são cópias seguras', async () => {
    const vm1 = await createEmpresasReadOnlyViewModel();
    const vm2 = await createEmpresasReadOnlyViewModel();
    assert.notEqual(vm1, vm2);
    assert.deepEqual(vm1, vm2);
  });

  // 19
  it('mutar retorno não altera estado interno', async () => {
    const vm = await createEmpresasReadOnlyViewModel();
    vm.table.columns.length = 0;
    vm.form.fields.push({ id: 'injected' });
    const fresh = await createEmpresasReadOnlyViewModel();
    assert.equal(fresh.table.columns.length > 0, true);
    assert.equal(fresh.form.fields.some((f) => f.id === 'injected'), false);
  });

  // 20-25 write guard blocks
  it('write guard bloqueia create', () => {
    const g = createEmpresasReadOnlyWriteGuard({ env: ON });
    assert.equal(g.attempt('create', {}).blocked, true);
  });
  it('write guard bloqueia update', () => {
    assert.equal(createEmpresasReadOnlyWriteGuard({ env: ON }).attempt('update', {}).blocked, true);
  });
  it('write guard bloqueia delete', () => {
    assert.equal(createEmpresasReadOnlyWriteGuard({ env: ON }).attempt('delete', {}).blocked, true);
  });
  it('write guard bloqueia bulk operations', () => {
    const g = createEmpresasReadOnlyWriteGuard({ env: ON });
    for (const op of ['bulkCreate', 'bulkUpdate', 'bulkDelete']) assert.equal(g.attempt(op, {}).blocked, true);
  });
  it('write guard bloqueia save/submit', () => {
    const g = createEmpresasReadOnlyWriteGuard({ env: ON });
    assert.equal(g.attempt('save', {}).blocked, true);
    assert.equal(g.attempt('submit', {}).blocked, true);
  });
  it('write guard bloqueia action/workflow/connector', () => {
    const g = createEmpresasReadOnlyWriteGuard({ env: ON });
    for (const op of ['executeAction', 'startWorkflow', 'invokeConnector']) assert.equal(g.attempt(op, {}).blocked, true);
  });

  // 26
  it('cada bloqueio retorna código estruturado', () => {
    const g = createEmpresasReadOnlyWriteGuard({ env: ON });
    for (const op of BLOCKED_WRITE_OPERATIONS) {
      const r = g.attempt(op, {});
      assert.equal(r.code, 'MAK-L3-EMP-READONLY-003');
      assert.equal(typeof r.reason, 'string');
    }
    // flag off → 001; production → 002; unknown → 004; pollution → 007
    assert.equal(createEmpresasReadOnlyWriteGuard({ env: OFF }).attempt('create', {}).code, 'MAK-L3-EMP-READONLY-001');
    assert.equal(createEmpresasReadOnlyWriteGuard({ env: { ...ON, NODE_ENV: 'production' } }).attempt('create', {}).code, 'MAK-L3-EMP-READONLY-002');
    assert.equal(g.attempt('frobnicate', {}).code, 'MAK-L3-EMP-READONLY-004');
    assert.equal(g.attempt('create', JSON.parse('{"__proto__":{"x":1}}')).code, 'MAK-L3-EMP-READONLY-007');
  });

  // 27
  it('diagnostics incluem flag status', () => {
    assert.equal(createEmpresasReadOnlyDiagnostics({ env: ON }).flagStatus, 'on');
    assert.equal(createEmpresasReadOnlyDiagnostics({ env: OFF }).flagStatus, 'off');
    assert.equal(createEmpresasReadOnlyDiagnostics({ env: { ...ON, NODE_ENV: 'production' } }).flagStatus, 'blocked-in-production');
  });

  // 28
  it('diagnostics incluem blocked operations', () => {
    const d = createEmpresasReadOnlyDiagnostics({ env: ON });
    assert.equal(d.blockedOperationCount, BLOCKED_WRITE_OPERATIONS.length);
    assert.equal(d.blockedOperations.includes('create'), true);
  });

  // 29
  it('diagnostics incluem rollback status', () => {
    assert.equal(createEmpresasReadOnlyDiagnostics({ env: ON }).rollbackStatus, 'available');
  });

  // 30
  it('rollback disponível por flag off', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(c.rollback.featureFlagDefault, 'off');
    assert.equal(c.rollback.schemaChange, false);
    assert.equal(c.rollback.realWrite, false);
  });

  // 31
  it('next allowed step é Dual Read Shadow Compare', async () => {
    const c = await createEmpresasReadOnlyRuntimeCandidate({ env: ON });
    assert.equal(/Dual Read Shadow Compare/i.test(c.nextAllowedStep), true);
  });

  // 32
  it('não altera src/App.jsx (planning não referencia App.jsx)', () => {
    assert.equal(/from\s+['"][^'"]*App(\.jsx)?['"]/i.test(candidateCodeOnly()), false);
  });

  // 33
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(candidateCodeOnly()), false);
  });

  // 34
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(candidateCodeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(candidateCodeOnly()), false);
  });

  // 35
  it('não altera runtime legado (sem import de makBootstrap/runtimeBridge)', () => {
    assert.equal(/makBootstrap|runtimeBridge/i.test(candidateCodeOnly()), false);
  });

  // 36
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(candidateCodeOnly()), false);
  });

  // 37
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = candidateSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 38
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(candidateCodeOnly()), false);
  });

  // 39
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of CANDIDATE_FILES) {
      const src = fs.readFileSync(path.join(CANDIDATE_DIR, f), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${f}`);
    }
  });

  // 40
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(candidateSource()), false);
  });

  // 41
  it('barrel exporta os helpers do candidate; write guard sem side effect', () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasReadOnlyRuntimeCandidate/.test(indexSrc), true);
    assert.equal(/createEmpresasReadOnlyWriteGuard/.test(indexSrc), true);
    // Nenhuma execução real: o guard nunca executa; sempre retorna blocked.
    const g = createEmpresasReadOnlyWriteGuard({ env: ON });
    assert.equal(g.attempt('create', {}).ok, false);
    assert.equal(g.readOnly, true);
  });
});

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
