import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasReadUiParityHardeningModel } from '../../migration/empresas-read-ui-parity-hardening/createEmpresasReadUiParityHardeningModel.js';
import { createEmpresasReadUiParityChecklist } from '../../migration/empresas-read-ui-parity-hardening/createEmpresasReadUiParityChecklist.js';
import { createEmpresasReadUiParityScore } from '../../migration/empresas-read-ui-parity-hardening/createEmpresasReadUiParityScore.js';
import { createEmpresasReadUiParityDiagnostics } from '../../migration/empresas-read-ui-parity-hardening/empresasReadUiParityDiagnostics.js';
import { EmpresasReadUiParityError } from '../../migration/empresas-read-ui-parity-hardening/errors.js';
import { EMPRESAS_READ_UI_PARITY_FLAG, EMPRESAS_READ_UI_PARITY_ALLOW_PROD_FLAG } from '../../migration/empresas-read-ui-parity-hardening/empresasReadUiParityConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '../../migration/empresas-read-ui-parity-hardening');
const COMPONENTS = path.join(DIR, 'components');
const PURE_FILES = [
  'createEmpresasReadUiParityHardeningModel.js',
  'createEmpresasReadUiParityChecklist.js',
  'createEmpresasReadUiParityScore.js',
  'empresasReadUiParityDiagnostics.js',
  'empresasReadUiParityConfig.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasReadUiParityHardeningPanel.jsx',
  'EmpresasReadUiParityChecklist.jsx',
  'EmpresasReadUiParityStatus.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const codeOnly = () => allSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const componentCodeOnly = () => componentSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const compFile = (name) => fs.readFileSync(path.join(COMPONENTS, name), 'utf8');
const clone = (o) => JSON.parse(JSON.stringify(o));

const ON = { [EMPRESAS_READ_UI_PARITY_FLAG]: 'true' };
const OFF = {};
const CATEGORIES = ['estrutura', 'tabela', 'formulario', 'diagnostics', 'seguranca', 'integracao-dev'];

/** Build a synthetic checklist for score-unit tests. */
function synthChecklist(overrides = []) {
  const base = [
    { id: 'a', category: 'estrutura', label: 'a', status: 'pass', severity: 'high', evidence: '', remediation: 'none', blocking: false },
    { id: 'b', category: 'tabela', label: 'b', status: 'pass', severity: 'medium', evidence: '', remediation: 'none', blocking: false },
  ];
  return [...base, ...overrides];
}

describe('Empresas Read UI Parity Hardening (post-Foundation C)', () => {
  // 1
  it('hardening model default desligado', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: OFF });
    assert.equal(m.enabled, false);
    assert.equal(m.skipped, true);
    assert.equal(m.noSideEffects, true);
    assert.equal(m.readinessStatus, 'skipped');
  });

  // 2
  it('hardening model habilita somente com flag', async () => {
    assert.equal((await createEmpresasReadUiParityHardeningModel({ env: ON })).enabled, true);
    assert.equal((await createEmpresasReadUiParityHardeningModel({ env: { [EMPRESAS_READ_UI_PARITY_FLAG]: 'false' } })).enabled, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const prod = await createEmpresasReadUiParityHardeningModel({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(prod.enabled, false);
    assert.equal(prod.productionBlocked, true);
    const ok = await createEmpresasReadUiParityHardeningModel({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_READ_UI_PARITY_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('hardening model é determinístico', async () => {
    const a = await createEmpresasReadUiParityHardeningModel({ env: ON });
    const b = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.deepEqual(clone(a), clone(b));
  });

  // 5-8
  it('moduleId é empresas', async () => { assert.equal((await createEmpresasReadUiParityHardeningModel({ env: ON })).moduleId, 'empresas'); });
  it('mode é read_ui_parity_hardening', async () => { assert.equal((await createEmpresasReadUiParityHardeningModel({ env: ON })).mode, 'read_ui_parity_hardening'); });
  it('currentRuntime é legacy', async () => { assert.equal((await createEmpresasReadUiParityHardeningModel({ env: ON })).currentRuntime, 'legacy'); });
  it('targetRuntime é runtime-v2', async () => { assert.equal((await createEmpresasReadUiParityHardeningModel({ env: ON })).targetRuntime, 'runtime-v2'); });

  // 9-12 uses of underlying models
  it('hardening usa overlay model', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.overlay.mode, 'guarded_read_ui_overlay');
    assert.equal(/createEmpresasGuardedReadUiOverlayModel/.test(pureSource()), true);
  });
  it('hardening usa guarded read UI model', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.guardedReadUi.mode, 'guarded_read_ui_slice');
  });
  it('hardening usa dual-read compare', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.dualReadCompare.mode, 'dual_read_shadow_compare');
  });
  it('hardening usa read-only candidate', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.readOnlyCandidate.mode, 'read_only_candidate');
  });

  // 13-18 checklist categories
  for (const [i, cat] of CATEGORIES.entries()) {
    it(`checklist possui categoria ${cat} (item ${13 + i})`, async () => {
      const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
      assert.equal(m.parityChecklist.some((it) => it.category === cat), true);
    });
  }

  // 19
  it('checklist item tem status/severity/evidence/remediation', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.parityChecklist.every((it) =>
      ['pass', 'warn', 'fail', 'skipped'].includes(it.status)
      && ['info', 'low', 'medium', 'high', 'critical'].includes(it.severity)
      && typeof it.evidence === 'string'
      && typeof it.remediation === 'string'
      && typeof it.blocking === 'boolean'), true);
  });

  // 20
  it('critical fail bloqueia readiness', () => {
    const checklist = synthChecklist([{ id: 'c', category: 'seguranca', label: 'c', status: 'fail', severity: 'critical', evidence: '', remediation: 'x', blocking: true }]);
    assert.equal(createEmpresasReadUiParityScore({ checklist }).readinessStatus, 'blocked');
  });

  // 21
  it('blocking item bloqueia readiness', () => {
    const checklist = synthChecklist([{ id: 'c', category: 'tabela', label: 'c', status: 'fail', severity: 'high', evidence: '', remediation: 'x', blocking: true }]);
    assert.equal(createEmpresasReadUiParityScore({ checklist }).readinessStatus, 'blocked');
  });

  // 22
  it('warnings sem fail permitem next slice', () => {
    const checklist = synthChecklist([{ id: 'c', category: 'tabela', label: 'c', status: 'warn', severity: 'low', evidence: '', remediation: 'x', blocking: false }]);
    assert.equal(createEmpresasReadUiParityScore({ checklist }).readinessStatus, 'ready_for_next_slice');
  });

  // 23
  it('score calcula pass/warn/fail/skipped', () => {
    const checklist = [
      { id: 'a', status: 'pass', severity: 'low', blocking: false },
      { id: 'b', status: 'warn', severity: 'low', blocking: false },
      { id: 'c', status: 'fail', severity: 'low', blocking: false },
      { id: 'd', status: 'skipped', severity: 'low', blocking: false },
    ];
    const s = createEmpresasReadUiParityScore({ checklist });
    assert.equal(s.passCount, 1);
    assert.equal(s.warnCount, 1);
    assert.equal(s.failCount, 1);
    assert.equal(s.skippedCount, 1);
    assert.equal(s.totalItems, 4);
  });

  // 24
  it('score calcula scorePercent', () => {
    const checklist = [
      { id: 'a', status: 'pass', severity: 'low', blocking: false },
      { id: 'b', status: 'fail', severity: 'low', blocking: false },
    ];
    assert.equal(createEmpresasReadUiParityScore({ checklist }).scorePercent, 50);
  });

  // 25-27 diagnostics
  it('diagnostics incluem readinessStatus', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(typeof m.diagnostics.readinessStatus, 'string');
  });
  it('diagnostics incluem blockers/warnings', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(Array.isArray(m.diagnostics.blockers), true);
    assert.equal(Array.isArray(m.diagnostics.warnings), true);
  });
  it('diagnostics incluem writeBlocked', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.diagnostics.writeBlocked, true);
    assert.equal(m.diagnostics.writeGuardStatus, 'active');
  });

  // 28-30 components (source-scan)
  it('component renderiza fallback seguro quando off', () => {
    const src = compFile('EmpresasReadUiParityHardeningPanel.jsx');
    assert.equal(/empresas-read-ui-parity-fallback/.test(src), true);
    assert.equal(/model\.enabled\s*!==\s*true|!model|model\.skipped\s*===\s*true/.test(src), true);
  });
  it('component renderiza checklist quando on', () => {
    assert.equal(/<EmpresasReadUiParityChecklist\b/.test(compFile('EmpresasReadUiParityHardeningPanel.jsx')), true);
    assert.equal(/empresas-read-ui-parity-checklist/.test(compFile('EmpresasReadUiParityChecklist.jsx')), true);
  });
  it('component renderiza score/status quando on', () => {
    assert.equal(/<EmpresasReadUiParityStatus\b/.test(compFile('EmpresasReadUiParityHardeningPanel.jsx')), true);
    assert.equal(/scorePercent|readinessStatus/.test(compFile('EmpresasReadUiParityStatus.jsx')), true);
  });

  // 31-33 no side effects in components
  it('component não possui save/submit funcional', () => {
    assert.equal(/onSubmit|type=["']submit["']|<form\b|handleSave/.test(componentCodeOnly()), false);
  });
  it('component não possui create/update/delete funcional', () => {
    assert.equal(/onClick|onChange\s*=\s*\{[^}]*set|handleCreate|handleUpdate|handleDelete/.test(componentCodeOnly()), false);
  });
  it('component não possui action/workflow/connector funcional', () => {
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(codeOnly()), false);
  });

  // 34
  it('dados sensíveis são mascarados', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(m)), false);
  });

  // 35
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasReadUiParityHardeningModel(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasReadUiParityError);
  });

  // 36
  it('retornos são cópias seguras', async () => {
    const a = await createEmpresasReadUiParityHardeningModel({ env: ON });
    const b = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.notEqual(a, b);
    assert.deepEqual(clone(a), clone(b));
  });

  // 37
  it('mutar retorno não altera estado interno', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    m.parityChecklist.length = 0;
    m.blockers.push('injected');
    const fresh = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(fresh.parityChecklist.length > 0, true);
    assert.equal(fresh.blockers.some((b) => b === 'injected'), false);
  });

  // 38
  it('rollback disponível por flag off', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(m.rollback.featureFlagDefault, 'off');
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });

  // 39
  it('next allowed step é Runtime Bridge Dry Run ou Hardening Fixes', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(/Runtime Bridge Dry Run|Parity Hardening Fixes/i.test(m.nextAllowedStep), true);
    assert.equal(/write|full cutover|migrated/i.test(m.nextAllowedStep), false);
  });

  // 40
  it('integração com overlay/route é opt-in', async () => {
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    assert.equal(isObj(m.flags) && isObj(m.flags.overlay), true);
    assert.equal(m.flags.overlay.composedWhenHardeningOn, true);
  });

  // 41
  it('overlay/route continuam funcionando quando hardening flag off', async () => {
    const off = await createEmpresasReadUiParityHardeningModel({ env: OFF });
    assert.equal(off.skipped, true);
    assert.equal(off.overlay, null);
    // Checklist skipped não quebra: itens todos skipped.
    assert.equal(off.parityChecklist.every((i) => i.status === 'skipped'), true);
  });

  // 42
  it('não altera src/App.jsx', () => {
    assert.equal(/from\s+['"][^'"]*\/App(\.jsx)?['"]/i.test(codeOnly()), false);
  });

  // 43
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(codeOnly()), false);
  });

  // 44
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(codeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(codeOnly()), false);
  });

  // 45
  it('não altera runtime legado (sem import de makBootstrap/runtimeBridge)', () => {
    assert.equal(/makBootstrap|runtimeBridge/i.test(codeOnly()), false);
  });

  // 46
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(codeOnly()), false);
  });

  // 47
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = allSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 48
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly()), false);
  });

  // 49
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of [...PURE_FILES.map((x) => path.join(DIR, x)), ...COMPONENT_FILES.map((x) => path.join(COMPONENTS, x))]) {
      const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${path.basename(f)}`);
    }
  });

  // 50
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(allSource()), false);
  });

  // 51 barrel + checklist coverage
  it('barrel exporta helpers puros; nenhum .jsx exportado; checklist cobre as 6 categorias', async () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasReadUiParityHardeningModel/.test(indexSrc), true);
    assert.equal(/from\s+['"][^'"]*empresas-read-ui-parity-hardening\/components\/[^'"]*\.jsx['"]/.test(indexSrc), false);
    const m = await createEmpresasReadUiParityHardeningModel({ env: ON });
    const cats = new Set(m.parityChecklist.map((i) => i.category));
    for (const c of CATEGORIES) assert.equal(cats.has(c), true, `categoria ausente: ${c}`);
    assert.notEqual(m.mode, 'migrated');
  });

  // extra: checklist standalone + diagnostics flag status
  it('checklist standalone é skipped sem overlay model', () => {
    const list = createEmpresasReadUiParityChecklist({ overlayModel: null });
    assert.equal(list.every((i) => i.status === 'skipped'), true);
  });
  it('diagnostics refletem flag status', () => {
    assert.equal(createEmpresasReadUiParityDiagnostics({ env: ON }).flagStatus, 'on');
    assert.equal(createEmpresasReadUiParityDiagnostics({ env: OFF }).flagStatus, 'off');
    assert.equal(createEmpresasReadUiParityDiagnostics({ env: { ...ON, NODE_ENV: 'production' } }).flagStatus, 'blocked-in-production');
  });
});

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
