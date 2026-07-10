import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasGuardedReadUiOverlayModel } from '../../migration/empresas-guarded-read-ui/overlay/createEmpresasGuardedReadUiOverlayModel.js';
import { createEmpresasGuardedReadUiOverlayDiagnostics } from '../../migration/empresas-guarded-read-ui/overlay/empresasGuardedReadUiOverlayDiagnostics.js';
import { EmpresasGuardedReadUiOverlayError } from '../../migration/empresas-guarded-read-ui/overlay/errors.js';
import { EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG, EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD_FLAG } from '../../migration/empresas-guarded-read-ui/overlay/empresasGuardedReadUiOverlayConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '../../migration/empresas-guarded-read-ui/overlay');
const COMPONENTS = path.join(DIR, 'components');
const PURE_FILES = [
  'createEmpresasGuardedReadUiOverlayModel.js',
  'empresasGuardedReadUiOverlayConfig.js',
  'empresasGuardedReadUiOverlayDiagnostics.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasGuardedReadUiOverlay.jsx',
  'EmpresasGuardedReadUiOverlayPanel.jsx',
  'EmpresasGuardedReadUiOverlayStatus.jsx',
];
const ROUTE_PAGE = path.join(HERE, '../../preview/dev/route/RuntimeV2DevPreviewRoutePage.jsx');
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const codeOnly = () => allSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const componentCodeOnly = () => componentSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const compFile = (name) => fs.readFileSync(path.join(COMPONENTS, name), 'utf8');
const clone = (o) => JSON.parse(JSON.stringify(o));

const ON = { [EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG]: 'true' };
const OFF = {};

describe('Empresas Guarded Read UI Overlay (post-Foundation C)', () => {
  // 1
  it('overlay model default desligado', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: OFF });
    assert.equal(m.enabled, false);
    assert.equal(m.skipped, true);
    assert.equal(m.noSideEffects, true);
    assert.equal(m.guardedReadUi, null);
  });

  // 2
  it('overlay model habilita somente com flag', async () => {
    assert.equal((await createEmpresasGuardedReadUiOverlayModel({ env: ON })).enabled, true);
    assert.equal((await createEmpresasGuardedReadUiOverlayModel({ env: { [EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG]: 'false' } })).enabled, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const prod = await createEmpresasGuardedReadUiOverlayModel({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(prod.enabled, false);
    assert.equal(prod.productionBlocked, true);
    const ok = await createEmpresasGuardedReadUiOverlayModel({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_GUARDED_READ_UI_OVERLAY_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('overlay model é determinístico', async () => {
    const a = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    const b = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.deepEqual(clone(a), clone(b));
  });

  // 5
  it('moduleId é empresas', async () => {
    assert.equal((await createEmpresasGuardedReadUiOverlayModel({ env: ON })).moduleId, 'empresas');
  });

  // 6
  it('mode é guarded_read_ui_overlay', async () => {
    assert.equal((await createEmpresasGuardedReadUiOverlayModel({ env: ON })).mode, 'guarded_read_ui_overlay');
  });

  // 7
  it('currentRuntime é legacy', async () => {
    assert.equal((await createEmpresasGuardedReadUiOverlayModel({ env: ON })).currentRuntime, 'legacy');
  });

  // 8
  it('targetRuntime é runtime-v2', async () => {
    assert.equal((await createEmpresasGuardedReadUiOverlayModel({ env: ON })).targetRuntime, 'runtime-v2');
  });

  // 9
  it('overlay usa guarded read UI model', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(m.guardedReadUi.mode, 'guarded_read_ui_slice');
    assert.equal(/createEmpresasGuardedReadUiModel/.test(pureSource()), true);
  });

  // 10
  it('overlay inclui parityStatus', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(['parity', 'acceptable_drift', 'blocked'].includes(m.parityStatus), true);
  });

  // 11
  it('overlay inclui totalDifferences', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(typeof m.totalDifferences, 'number');
  });

  // 12
  it('overlay inclui blockingCount', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(typeof m.blockingCount, 'number');
  });

  // 13
  it('overlay inclui criticalCount', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(typeof m.criticalCount, 'number');
  });

  // 14
  it('overlay inclui writeBlocked', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(m.writeBlocked, true);
  });

  // 15
  it('overlay inclui blockedOperations', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(Array.isArray(m.blockedOperations), true);
    assert.equal(m.blockedOperations.includes('create'), true);
  });

  // 16
  it('overlay inclui flags', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(isObj(m.flags), true);
    assert.equal(m.flags.overlay.enabled, true);
    assert.equal(m.flags.guardedReadUi.composedWhenOverlayOn, true);
    assert.equal(typeof m.flags.devPreviewRoute.flag, 'string');
    assert.equal(typeof m.flags.devPreviewHub.flag, 'string');
  });

  // 17
  it('overlay inclui diagnostics', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(m.diagnostics.kind, 'empresas-guarded-read-ui-overlay-diagnostics');
    assert.equal(m.diagnostics.writeGuardStatus, 'active');
  });

  // 18 — component fallback when off (source-scan)
  it('component renderiza fallback seguro quando off', () => {
    const src = compFile('EmpresasGuardedReadUiOverlay.jsx');
    assert.equal(/empresas-guarded-read-ui-overlay-fallback/.test(src), true);
    assert.equal(/model\.enabled\s*!==\s*true|!model|model\.skipped\s*===\s*true/.test(src), true);
  });

  // 19
  it('component renderiza status quando on', () => {
    const src = compFile('EmpresasGuardedReadUiOverlay.jsx');
    assert.equal(/<EmpresasGuardedReadUiOverlayStatus\b/.test(src), true);
    assert.equal(/empresas-guarded-read-ui-overlay-status/.test(compFile('EmpresasGuardedReadUiOverlayStatus.jsx')), true);
  });

  // 20
  it('component renderiza GuardedReadUiSlice quando permitido', () => {
    const panel = compFile('EmpresasGuardedReadUiOverlayPanel.jsx');
    assert.equal(/EmpresasGuardedReadUiSlice/.test(panel), true);
    assert.equal(/<EmpresasGuardedReadUiOverlayPanel\b/.test(compFile('EmpresasGuardedReadUiOverlay.jsx')), true);
  });

  // 21
  it('component renderiza write blocked status', () => {
    const status = compFile('EmpresasGuardedReadUiOverlayStatus.jsx');
    assert.equal(/ovl-write-blocked|writeBlocked/.test(status), true);
  });

  // 22
  it('component não possui save/submit funcional', () => {
    const src = componentCodeOnly();
    assert.equal(/onSubmit|type=["']submit["']|<form\b|handleSave/.test(src), false);
  });

  // 23
  it('component não possui create/update/delete funcional', () => {
    const src = componentCodeOnly();
    assert.equal(/onClick|onChange\s*=\s*\{[^}]*set|handleCreate|handleUpdate|handleDelete/.test(src), false);
  });

  // 24
  it('component não possui action/workflow/connector funcional', () => {
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(codeOnly()), false);
  });

  // 25
  it('dados sensíveis são mascarados', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(m)), false);
  });

  // 26
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasGuardedReadUiOverlayModel(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasGuardedReadUiOverlayError);
  });

  // 27
  it('retornos são cópias seguras', async () => {
    const a = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    const b = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.notEqual(a, b);
    assert.deepEqual(clone(a), clone(b));
  });

  // 28
  it('mutar retorno não altera estado interno', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    m.blockedOperations.length = 0;
    m.guardedReadUi.table.columns.length = 0;
    const fresh = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(fresh.blockedOperations.length > 0, true);
    assert.equal(fresh.guardedReadUi.table.columns.length > 0, true);
  });

  // 29
  it('rollback disponível por flag off', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(m.rollback.featureFlagDefault, 'off');
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });

  // 30
  it('next allowed step é Read UI Parity Hardening ou Drift Resolution', async () => {
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.equal(/Read UI Parity Hardening|Guarded Read UI Drift Resolution/i.test(m.nextAllowedStep), true);
    assert.equal(/write|full cutover|migrated/i.test(m.nextAllowedStep), false);
  });

  // 31 — integração com route/hub é opt-in
  it('integração com route é opt-in (route page renderiza overlay com fallback próprio)', () => {
    const routeSrc = fs.readFileSync(ROUTE_PAGE, 'utf8');
    assert.equal(/EmpresasGuardedReadUiOverlay/.test(routeSrc), true);
    // O overlay decide sozinho (env/model), então é opt-in e não força render.
    assert.equal(/isEmpresasGuardedReadUiOverlayEnabled/.test(compFile('EmpresasGuardedReadUiOverlay.jsx')), true);
  });

  // 32 — hub/route continuam funcionando quando overlay flag off
  it('hub/route continuam seguros quando overlay flag off (overlay renderiza fallback)', async () => {
    const off = await createEmpresasGuardedReadUiOverlayModel({ env: OFF });
    assert.equal(off.skipped, true);
    // O componente do overlay, sem model e flag off, renderiza fallback (não quebra a rota).
    const overlaySrc = compFile('EmpresasGuardedReadUiOverlay.jsx');
    assert.equal(/if\s*\(!model\)/.test(overlaySrc), true);
    assert.equal(/empresas-guarded-read-ui-overlay-fallback/.test(overlaySrc), true);
  });

  // 33
  it('não altera src/App.jsx', () => {
    assert.equal(/from\s+['"][^'"]*\/App(\.jsx)?['"]/i.test(codeOnly()), false);
  });

  // 34
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(codeOnly()), false);
  });

  // 35
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(codeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(codeOnly()), false);
  });

  // 36
  it('não altera runtime legado (sem import de makBootstrap/runtimeBridge)', () => {
    assert.equal(/makBootstrap|runtimeBridge/i.test(codeOnly()), false);
  });

  // 37
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(codeOnly()), false);
  });

  // 38
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = allSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 39
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly()), false);
  });

  // 40
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of [...PURE_FILES.map((x) => path.join(DIR, x)), ...COMPONENT_FILES.map((x) => path.join(COMPONENTS, x))]) {
      const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${path.basename(f)}`);
    }
  });

  // 41
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(allSource()), false);
  });

  // 42
  it('barrel exporta helpers puros; nenhum .jsx do overlay exportado; não declara migração concluída', async () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasGuardedReadUiOverlayModel/.test(indexSrc), true);
    assert.equal(/from\s+['"][^'"]*overlay\/components\/[^'"]*\.jsx['"]/.test(indexSrc), false);
    const m = await createEmpresasGuardedReadUiOverlayModel({ env: ON });
    assert.notEqual(m.mode, 'migrated');
  });

  // diagnostics unit
  it('diagnostics refletem flag status', () => {
    assert.equal(createEmpresasGuardedReadUiOverlayDiagnostics({ env: ON }).flagStatus, 'on');
    assert.equal(createEmpresasGuardedReadUiOverlayDiagnostics({ env: OFF }).flagStatus, 'off');
    assert.equal(createEmpresasGuardedReadUiOverlayDiagnostics({ env: { ...ON, NODE_ENV: 'production' } }).flagStatus, 'blocked-in-production');
  });
});

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
