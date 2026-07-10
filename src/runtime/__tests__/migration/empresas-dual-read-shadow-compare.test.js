import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasDualReadShadowCompare } from '../../migration/empresas-dual-read/createEmpresasDualReadShadowCompare.js';
import { createEmpresasLegacyReadSnapshot } from '../../migration/empresas-dual-read/createEmpresasLegacyReadSnapshot.js';
import { createEmpresasRuntimeV2ReadSnapshot } from '../../migration/empresas-dual-read/createEmpresasRuntimeV2ReadSnapshot.js';
import { compareEmpresasReadSnapshots } from '../../migration/empresas-dual-read/compareEmpresasReadSnapshots.js';
import { createEmpresasDualReadDiagnostics } from '../../migration/empresas-dual-read/empresasDualReadDiagnostics.js';
import { EmpresasDualReadError } from '../../migration/empresas-dual-read/errors.js';
import { EMPRESAS_DUAL_READ_FLAG, EMPRESAS_DUAL_READ_ALLOW_PROD_FLAG } from '../../migration/empresas-dual-read/empresasDualReadConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '../../migration/empresas-dual-read');
const FILES = [
  'createEmpresasDualReadShadowCompare.js',
  'createEmpresasLegacyReadSnapshot.js',
  'createEmpresasRuntimeV2ReadSnapshot.js',
  'compareEmpresasReadSnapshots.js',
  'empresasDualReadConfig.js',
  'empresasDualReadDiagnostics.js',
  'empresasDualReadDifferenceModel.js',
  'errors.js',
];
const source = () => FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const codeOnly = () => source().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const clone = (o) => JSON.parse(JSON.stringify(o));

const ON = { [EMPRESAS_DUAL_READ_FLAG]: 'true' };
const OFF = {};

/** Build a matched legacy + v2 snapshot pair, then let the caller mutate the v2 copy. */
async function pair() {
  const legacy = await createEmpresasLegacyReadSnapshot();
  const v2 = await createEmpresasRuntimeV2ReadSnapshot({ env: ON });
  return { legacy, v2: clone(v2) };
}

describe('Empresas Dual Read Shadow Compare (post-Foundation C)', () => {
  // 1
  it('compare default desligado', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: OFF });
    assert.equal(c.enabled, false);
    assert.equal(c.skipped, true);
    assert.equal(c.noSideEffects, true);
    assert.equal(c.legacySnapshot, null);
    assert.equal(c.runtimeV2Snapshot, null);
  });

  // 2
  it('compare habilita somente com flag', async () => {
    assert.equal((await createEmpresasDualReadShadowCompare({ env: ON })).enabled, true);
    assert.equal((await createEmpresasDualReadShadowCompare({ env: { [EMPRESAS_DUAL_READ_FLAG]: 'false' } })).enabled, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const prod = await createEmpresasDualReadShadowCompare({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(prod.enabled, false);
    assert.equal(prod.productionBlocked, true);
    const ok = await createEmpresasDualReadShadowCompare({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_DUAL_READ_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('compare é determinístico', async () => {
    const a = await createEmpresasDualReadShadowCompare({ env: ON });
    const b = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.deepEqual(clone(a), clone(b));
  });

  // 5
  it('compare moduleId é empresas', async () => {
    assert.equal((await createEmpresasDualReadShadowCompare({ env: ON })).moduleId, 'empresas');
  });

  // 6
  it('compare mode é dual_read_shadow_compare', async () => {
    assert.equal((await createEmpresasDualReadShadowCompare({ env: ON })).mode, 'dual_read_shadow_compare');
  });

  // 7
  it('compare currentRuntime é legacy', async () => {
    assert.equal((await createEmpresasDualReadShadowCompare({ env: ON })).currentRuntime, 'legacy');
  });

  // 8
  it('compare targetRuntime é runtime-v2', async () => {
    assert.equal((await createEmpresasDualReadShadowCompare({ env: ON })).targetRuntime, 'runtime-v2');
  });

  // 9
  it('legacy snapshot é gerado', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(c.legacySnapshot.sourceRuntime, 'legacy');
    assert.equal(c.legacySnapshot.table.columns.length > 0, true);
  });

  // 10
  it('runtime v2 snapshot é gerado', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(c.runtimeV2Snapshot.sourceRuntime, 'runtime-v2');
    assert.equal(c.runtimeV2Snapshot.form.fields.length > 0, true);
  });

  // 11-14
  it('legacy snapshot não chama backend', () => {
    assert.equal(/\bfetch\s*\(|from\s+['"].*backend.*['"]/i.test(fileCode('createEmpresasLegacyReadSnapshot.js')), false);
  });
  it('runtime v2 snapshot não chama backend', () => {
    assert.equal(/\bfetch\s*\(|from\s+['"].*backend.*['"]/i.test(fileCode('createEmpresasRuntimeV2ReadSnapshot.js')), false);
  });
  it('legacy snapshot não consulta Prisma/MMM', () => {
    const s = fileCode('createEmpresasLegacyReadSnapshot.js');
    assert.equal(/prisma|PrismaClient/i.test(s), false);
  });
  it('runtime v2 snapshot não consulta Prisma/MMM', () => {
    const s = fileCode('createEmpresasRuntimeV2ReadSnapshot.js');
    assert.equal(/prisma|PrismaClient/i.test(s), false);
  });

  // 15
  it('legacy snapshot usa fonte controlada quando não há snapshot injetado', async () => {
    const snap = await createEmpresasLegacyReadSnapshot();
    assert.equal(snap.metadata.source, 'controlled-dev-dataset');
    assert.equal(snap.table.rowCount > 0, true);
  });

  // 16
  it('runtime v2 snapshot usa read-only candidate (view model)', () => {
    const s = fs.readFileSync(path.join(DIR, 'createEmpresasRuntimeV2ReadSnapshot.js'), 'utf8');
    assert.equal(/createEmpresasReadOnlyViewModel/.test(s), true);
  });

  // 17
  it('comparador detecta diferença de coluna', async () => {
    const { legacy, v2 } = await pair();
    v2.table.columns = v2.table.columns.filter((c) => c.id !== v2.table.columns[0].id);
    v2.table.visibleColumns = v2.table.columns.filter((c) => c.visible !== false).map((c) => c.id);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.some((d) => d.category === 'table' || d.path.startsWith('table.columns')), true);
  });

  // 18
  it('comparador detecta diferença de campo', async () => {
    const { legacy, v2 } = await pair();
    v2.form.fields = v2.form.fields.slice(1);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.some((d) => d.category === 'field'), true);
  });

  // 19
  it('comparador detecta diferença de validação', async () => {
    const { legacy, v2 } = await pair();
    if (v2.validations[0]) v2.validations[0].rules = [...(v2.validations[0].rules || []), 'injected-rule'];
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.some((d) => d.category === 'validation'), true);
  });

  // 20
  it('comparador detecta diferença de permissão', async () => {
    const { legacy, v2 } = await pair();
    if (v2.permissions[0]) v2.permissions[0].denied = !v2.permissions[0].denied;
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.some((d) => d.category === 'permission'), true);
  });

  // 21
  it('comparador detecta diferença de action metadata', async () => {
    const { legacy, v2 } = await pair();
    v2.actions = v2.actions.slice(1);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.some((d) => d.category === 'action'), true);
  });

  // 22
  it('comparador detecta diferença de row shape', async () => {
    const { legacy, v2 } = await pair();
    if (v2.table.rows[0]) v2.table.rows[0].cells = { ...v2.table.rows[0].cells, extra_cell: 'x' };
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.some((d) => d.category === 'data-shape'), true);
  });

  // 23
  it('difference model tem severidade', async () => {
    const { legacy, v2 } = await pair();
    v2.form.fields = v2.form.fields.slice(1);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.every((d) => ['info', 'low', 'medium', 'high', 'critical'].includes(d.severity)), true);
  });

  // 24
  it('difference model tem categoria', async () => {
    const { legacy, v2 } = await pair();
    v2.form.fields = v2.form.fields.slice(1);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.every((d) => typeof d.category === 'string' && d.category.length > 0), true);
  });

  // 25
  it('difference model tem recommendedAction', async () => {
    const { legacy, v2 } = await pair();
    v2.form.fields = v2.form.fields.slice(1);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.differences.every((d) => typeof d.recommendedAction === 'string' && d.recommendedAction.length > 0), true);
  });

  // 26
  it('summary conta severidades', async () => {
    const { legacy, v2 } = await pair();
    v2.form.fields = v2.form.fields.slice(1);
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    const s = cmp.summary;
    assert.equal(s.totalDifferences, cmp.differences.length);
    assert.equal(s.criticalCount + s.highCount + s.mediumCount + s.lowCount + s.infoCount, cmp.differences.length);
  });

  // 27
  it('critical difference bloqueia próximo passo', async () => {
    const { legacy, v2 } = await pair();
    delete v2.table; // structural → critical + blocking
    const cmp = await compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
    assert.equal(cmp.summary.parityStatus, 'blocked');
    assert.equal(cmp.summary.blockingCount > 0, true);
  });

  // 28
  it('sem blocking differences permite Guarded Read UI Slice', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(['parity', 'acceptable_drift'].includes(c.summary.parityStatus), true);
    assert.equal(/Guarded Read UI Slice/i.test(c.nextAllowedStep), true);
    assert.equal(c.readiness.canAdvance, true);
  });

  // 29
  it('diagnostics incluem parityStatus', () => {
    const d = createEmpresasDualReadDiagnostics({ env: ON, summary: { totalDifferences: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0, blockingCount: 0, parityStatus: 'parity' } });
    assert.equal(d.parityStatus, 'parity');
  });

  // 30
  it('diagnostics incluem write guard status', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(c.diagnostics.writeGuardStatus, 'active');
  });

  // 31
  it('rollback disponível por flag off', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(c.rollback.featureFlagDefault, 'off');
    assert.equal(c.rollback.schemaChange, false);
    assert.equal(c.diagnostics.rollbackStatus, 'available');
  });

  // 32
  it('write guard continua bloqueando create/update/delete/save/action/workflow/connector', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    for (const op of ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector']) {
      assert.equal(c.writeGuard.attempt(op, {}).blocked, true);
    }
  });

  // 33
  it('dados sensíveis são mascarados', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(c)), false);
  });

  // 34
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasDualReadShadowCompare(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasDualReadError);
    await assert.rejects(() => createEmpresasLegacyReadSnapshot(JSON.parse('{"constructor": {"y": 1}}')), EmpresasDualReadError);
  });

  // 35
  it('retornos são cópias seguras', async () => {
    const a = await createEmpresasDualReadShadowCompare({ env: ON });
    const b = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.notEqual(a, b);
    assert.deepEqual(clone(a), clone(b));
  });

  // 36
  it('mutar retorno não altera estado interno', async () => {
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    c.differences.push({ id: 'injected' });
    c.legacySnapshot.table.columns.length = 0;
    const fresh = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.equal(fresh.differences.some((d) => d.id === 'injected'), false);
    assert.equal(fresh.legacySnapshot.table.columns.length > 0, true);
  });

  // 37
  it('não altera src/App.jsx', () => {
    assert.equal(/from\s+['"][^'"]*App(\.jsx)?['"]/i.test(codeOnly()), false);
  });

  // 38
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(codeOnly()), false);
  });

  // 39
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(codeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(codeOnly()), false);
  });

  // 40
  it('não altera runtime legado (sem import de makBootstrap/runtimeBridge)', () => {
    assert.equal(/makBootstrap|runtimeBridge/i.test(codeOnly()), false);
  });

  // 41
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(codeOnly()), false);
  });

  // 42
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = source();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 43
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly()), false);
  });

  // 44
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of FILES) {
      const src = fs.readFileSync(path.join(DIR, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${f}`);
    }
  });

  // 45
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(source()), false);
  });

  // 46
  it('barrel exporta os helpers do compare; não declara migração concluída', async () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasDualReadShadowCompare/.test(indexSrc), true);
    assert.equal(/compareEmpresasReadSnapshots/.test(indexSrc), true);
    const c = await createEmpresasDualReadShadowCompare({ env: ON });
    assert.notEqual(c.mode, 'migrated');
    assert.equal(/Guarded Read UI Slice|Drift Resolution/i.test(c.nextAllowedStep), true);
  });
});

function fileCode(name) {
  return fs.readFileSync(path.join(DIR, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}
