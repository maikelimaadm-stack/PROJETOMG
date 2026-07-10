import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasGuardedReadUiModel } from '../../migration/empresas-guarded-read-ui/createEmpresasGuardedReadUiModel.js';
import { createEmpresasGuardedReadUiDiagnostics } from '../../migration/empresas-guarded-read-ui/empresasGuardedReadUiDiagnostics.js';
import { EmpresasGuardedReadUiError } from '../../migration/empresas-guarded-read-ui/errors.js';
import { EMPRESAS_GUARDED_READ_UI_FLAG, EMPRESAS_GUARDED_READ_UI_ALLOW_PROD_FLAG } from '../../migration/empresas-guarded-read-ui/empresasGuardedReadUiConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '../../migration/empresas-guarded-read-ui');
const COMPONENTS = path.join(DIR, 'components');
// Pure (non-.jsx) files — node --test can parse these; the .jsx components are source-scanned only.
const PURE_FILES = [
  'createEmpresasGuardedReadUiModel.js',
  'empresasGuardedReadUiConfig.js',
  'empresasGuardedReadUiDiagnostics.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasGuardedReadUiSlice.jsx',
  'EmpresasGuardedReadTable.jsx',
  'EmpresasGuardedReadForm.jsx',
  'EmpresasGuardedReadDiagnostics.jsx',
  'EmpresasGuardedReadWriteBlockedPanel.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const componentCodeOnly = () => componentSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const allSource = () => pureSource() + '\n' + componentSource();
const codeOnly = () => allSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const compFile = (name) => fs.readFileSync(path.join(COMPONENTS, name), 'utf8');
const clone = (o) => JSON.parse(JSON.stringify(o));

const ON = { [EMPRESAS_GUARDED_READ_UI_FLAG]: 'true' };
const OFF = {};

describe('Empresas Guarded Read UI Slice (post-Foundation C)', () => {
  // 1
  it('UI model default desligado', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: OFF });
    assert.equal(m.enabled, false);
    assert.equal(m.skipped, true);
    assert.equal(m.noSideEffects, true);
    assert.equal(m.viewModel, null);
  });

  // 2
  it('UI model habilita somente com flag', async () => {
    assert.equal((await createEmpresasGuardedReadUiModel({ env: ON })).enabled, true);
    assert.equal((await createEmpresasGuardedReadUiModel({ env: { [EMPRESAS_GUARDED_READ_UI_FLAG]: 'false' } })).enabled, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const prod = await createEmpresasGuardedReadUiModel({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(prod.enabled, false);
    assert.equal(prod.productionBlocked, true);
    const ok = await createEmpresasGuardedReadUiModel({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_GUARDED_READ_UI_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('UI model é determinístico', async () => {
    const a = await createEmpresasGuardedReadUiModel({ env: ON });
    const b = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.deepEqual(clone(a), clone(b));
  });

  // 5
  it('moduleId é empresas', async () => {
    assert.equal((await createEmpresasGuardedReadUiModel({ env: ON })).moduleId, 'empresas');
  });

  // 6
  it('mode é guarded_read_ui_slice', async () => {
    assert.equal((await createEmpresasGuardedReadUiModel({ env: ON })).mode, 'guarded_read_ui_slice');
  });

  // 7
  it('currentRuntime é legacy', async () => {
    assert.equal((await createEmpresasGuardedReadUiModel({ env: ON })).currentRuntime, 'legacy');
  });

  // 8
  it('targetRuntime é runtime-v2', async () => {
    assert.equal((await createEmpresasGuardedReadUiModel({ env: ON })).targetRuntime, 'runtime-v2');
  });

  // 9
  it('UI model usa read-only candidate', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(m.readOnlyCandidate.enabled, true);
    assert.equal(m.readOnlyCandidate.mode, 'read_only_candidate');
    assert.equal(/createEmpresasReadOnlyRuntimeCandidate/.test(pureSource()), true);
  });

  // 10
  it('UI model usa dual-read compare', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(m.dualReadCompare.mode, 'dual_read_shadow_compare');
    assert.equal(/createEmpresasDualReadShadowCompare/.test(pureSource()), true);
  });

  // 11
  it('UI model inclui parityStatus', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(['parity', 'acceptable_drift', 'blocked'].includes(m.parityStatus), true);
  });

  // 12
  it('UI model inclui differences summary', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(Array.isArray(m.differences), true);
    assert.equal(isObj(m.dualReadCompare.summary), true);
    assert.equal(typeof m.dualReadCompare.summary.totalDifferences, 'number');
  });

  // 13
  it('UI model inclui table', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(isObj(m.table), true);
    assert.equal(Array.isArray(m.table.columns), true);
    assert.equal(m.table.columns.length > 0, true);
  });

  // 14
  it('UI model inclui form', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(isObj(m.form), true);
    assert.equal(Array.isArray(m.form.fields), true);
    assert.equal(m.form.fields.length > 0, true);
  });

  // 15
  it('UI model inclui diagnostics', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(m.diagnostics.kind, 'empresas-guarded-read-ui-diagnostics');
    assert.equal(m.diagnostics.writeGuardStatus, 'active');
  });

  // 16
  it('UI model inclui blockedOperations', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(Array.isArray(m.blockedOperations), true);
    assert.equal(m.blockedOperations.includes('create'), true);
    assert.equal(m.writeBlocked, true);
  });

  // 17 — component renders safe fallback when off (source-scan; node cannot parse JSX)
  it('component renderiza fallback seguro quando off', () => {
    const src = compFile('EmpresasGuardedReadUiSlice.jsx');
    assert.equal(/empresas-guarded-read-fallback/.test(src), true);
    assert.equal(/model\.enabled\s*!==\s*true|!model|model\.skipped\s*===\s*true/.test(src), true);
  });

  // 18
  it('component renderiza read-only table quando on', () => {
    const src = compFile('EmpresasGuardedReadUiSlice.jsx');
    assert.equal(/<EmpresasGuardedReadTable\b/.test(src), true);
    assert.equal(/empresas-guarded-read-table/.test(compFile('EmpresasGuardedReadTable.jsx')), true);
  });

  // 19
  it('component renderiza read-only form quando on', () => {
    const src = compFile('EmpresasGuardedReadUiSlice.jsx');
    assert.equal(/<EmpresasGuardedReadForm\b/.test(src), true);
    const form = compFile('EmpresasGuardedReadForm.jsx');
    assert.equal(/readOnly/.test(form) && /disabled/.test(form), true);
  });

  // 20
  it('component renderiza diagnostics quando on', () => {
    assert.equal(/<EmpresasGuardedReadDiagnostics\b/.test(compFile('EmpresasGuardedReadUiSlice.jsx')), true);
    assert.equal(/parityStatus/.test(compFile('EmpresasGuardedReadDiagnostics.jsx')), true);
  });

  // 21
  it('component renderiza write blocked panel', () => {
    assert.equal(/<EmpresasGuardedReadWriteBlockedPanel\b/.test(compFile('EmpresasGuardedReadUiSlice.jsx')), true);
    assert.equal(/empresas-guarded-read-write-blocked/.test(compFile('EmpresasGuardedReadWriteBlockedPanel.jsx')), true);
  });

  // 22 — no functional save/submit
  it('não há save/submit funcional', () => {
    const src = componentCodeOnly();
    assert.equal(/onSubmit|type=["']submit["']|<form\b/.test(src), false);
    assert.equal(/onSave|handleSave/.test(src), false);
  });

  // 23 — no create/update/delete functional
  it('não há create/update/delete funcional', () => {
    const src = componentCodeOnly();
    assert.equal(/onClick|onChange\s*=\s*\{[^}]*set|handleCreate|handleUpdate|handleDelete/.test(src), false);
  });

  // 24 — no action/workflow/connector functional
  it('não há action/workflow/connector funcional', () => {
    const src = codeOnly();
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(src), false);
  });

  // 25
  it('dados sensíveis são mascarados', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(m)), false);
  });

  // 26
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasGuardedReadUiModel(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasGuardedReadUiError);
  });

  // 27
  it('retornos são cópias seguras', async () => {
    const a = await createEmpresasGuardedReadUiModel({ env: ON });
    const b = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.notEqual(a, b);
    assert.deepEqual(clone(a), clone(b));
  });

  // 28
  it('mutar retorno não altera estado interno', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    m.table.columns.length = 0;
    m.differences.push({ id: 'injected' });
    const fresh = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(fresh.table.columns.length > 0, true);
    assert.equal(fresh.differences.some((d) => d.id === 'injected'), false);
  });

  // 29
  it('rollback disponível por flag off', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(m.rollback.featureFlagDefault, 'off');
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });

  // 30
  it('next allowed step é Guarded Read UI Overlay ou Drift Resolution', async () => {
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.equal(/Guarded Read UI Overlay|Guarded Read UI Drift Resolution/i.test(m.nextAllowedStep), true);
    assert.equal(/write|full cutover|migrated/i.test(m.nextAllowedStep), false);
  });

  // 31
  it('não altera src/App.jsx', () => {
    assert.equal(/from\s+['"][^'"]*\/App(\.jsx)?['"]/i.test(codeOnly()), false);
  });

  // 32
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(codeOnly()), false);
  });

  // 33
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(codeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(codeOnly()), false);
  });

  // 34
  it('não altera runtime legado (sem import de makBootstrap/runtimeBridge)', () => {
    assert.equal(/makBootstrap|runtimeBridge/i.test(codeOnly()), false);
  });

  // 35
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(codeOnly()), false);
  });

  // 36
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = allSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 37
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly()), false);
  });

  // 38
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of [...PURE_FILES.map((x) => path.join(DIR, x)), ...COMPONENT_FILES.map((x) => path.join(COMPONENTS, x))]) {
      const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${path.basename(f)}`);
    }
  });

  // 39
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(allSource()), false);
  });

  // 40
  it('barrel exporta helpers puros; nenhum .jsx exportado pelo barrel; não declara migração concluída', async () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasGuardedReadUiModel/.test(indexSrc), true);
    assert.equal(/from\s+['"][^'"]*empresas-guarded-read-ui\/components\/[^'"]*\.jsx['"]/.test(indexSrc), false);
    const m = await createEmpresasGuardedReadUiModel({ env: ON });
    assert.notEqual(m.mode, 'migrated');
  });

  // diagnostics unit
  it('diagnostics refletem flag status e parity', () => {
    assert.equal(createEmpresasGuardedReadUiDiagnostics({ env: ON }).flagStatus, 'on');
    assert.equal(createEmpresasGuardedReadUiDiagnostics({ env: OFF }).flagStatus, 'off');
    assert.equal(createEmpresasGuardedReadUiDiagnostics({ env: { ...ON, NODE_ENV: 'production' } }).flagStatus, 'blocked-in-production');
  });
});

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
