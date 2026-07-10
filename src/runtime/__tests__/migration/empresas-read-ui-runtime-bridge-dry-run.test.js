import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasReadUiRuntimeBridgeDryRunModel } from '../../migration/empresas-read-ui-bridge-dry-run/createEmpresasReadUiRuntimeBridgeDryRunModel.js';
import { createEmpresasRuntimeBridgeReadContract } from '../../migration/empresas-read-ui-bridge-dry-run/createEmpresasRuntimeBridgeReadContract.js';
import { simulateEmpresasRuntimeBridgeReadMount } from '../../migration/empresas-read-ui-bridge-dry-run/simulateEmpresasRuntimeBridgeReadMount.js';
import { createEmpresasRuntimeBridgeDryRunDiagnostics } from '../../migration/empresas-read-ui-bridge-dry-run/empresasRuntimeBridgeDryRunDiagnostics.js';
import { EmpresasBridgeDryRunError } from '../../migration/empresas-read-ui-bridge-dry-run/errors.js';
import { EMPRESAS_BRIDGE_DRY_RUN_FLAG, EMPRESAS_BRIDGE_DRY_RUN_ALLOW_PROD_FLAG } from '../../migration/empresas-read-ui-bridge-dry-run/empresasRuntimeBridgeDryRunConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '../../migration/empresas-read-ui-bridge-dry-run');
const COMPONENTS = path.join(DIR, 'components');
const PURE_FILES = [
  'createEmpresasReadUiRuntimeBridgeDryRunModel.js',
  'createEmpresasRuntimeBridgeReadContract.js',
  'simulateEmpresasRuntimeBridgeReadMount.js',
  'empresasRuntimeBridgeDryRunDiagnostics.js',
  'empresasRuntimeBridgeDryRunConfig.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasRuntimeBridgeDryRunPanel.jsx',
  'EmpresasRuntimeBridgeDryRunStatus.jsx',
  'EmpresasRuntimeBridgeDryRunContract.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const codeOnly = () => allSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const componentCodeOnly = () => componentSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const compFile = (name) => fs.readFileSync(path.join(COMPONENTS, name), 'utf8');
const clone = (o) => JSON.parse(JSON.stringify(o));

const ON = { [EMPRESAS_BRIDGE_DRY_RUN_FLAG]: 'true' };
const OFF = {};

/** A hardening-like model that satisfies all mount preconditions. */
const goodHardening = {
  enabled: true,
  readinessStatus: 'ready_for_next_slice',
  blockers: [],
  parityScore: { blockingCount: 0, criticalCount: 0 },
  writeBlocked: true,
  warnings: [],
  diagnostics: { rollbackStatus: 'available' },
};
const goodContract = createEmpresasRuntimeBridgeReadContract({});

describe('Empresas Read UI Runtime Bridge Dry Run (post-Foundation C)', () => {
  // 1
  it('dry run model default desligado', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: OFF });
    assert.equal(m.enabled, false);
    assert.equal(m.skipped, true);
    assert.equal(m.noSideEffects, true);
    assert.equal(m.bridgeContract, null);
    assert.equal(m.mountSimulation, null);
  });

  // 2
  it('dry run model habilita somente com flag', async () => {
    assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON })).enabled, true);
    assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: { [EMPRESAS_BRIDGE_DRY_RUN_FLAG]: 'false' } })).enabled, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const prod = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(prod.enabled, false);
    assert.equal(prod.productionBlocked, true);
    const ok = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_BRIDGE_DRY_RUN_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('dry run model é determinístico', async () => {
    const a = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    const b = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.deepEqual(clone(a), clone(b));
  });

  // 5-9
  it('moduleId é empresas', async () => { assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON })).moduleId, 'empresas'); });
  it('mode é read_ui_runtime_bridge_dry_run', async () => { assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON })).mode, 'read_ui_runtime_bridge_dry_run'); });
  it('bridgeMode é dry_run', async () => { assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON })).bridgeMode, 'dry_run'); });
  it('currentRuntime é legacy', async () => { assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON })).currentRuntime, 'legacy'); });
  it('targetRuntime é runtime-v2', async () => { assert.equal((await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON })).targetRuntime, 'runtime-v2'); });

  // 10-14 uses of underlying models
  it('dry run usa hardening model', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.hardening.mode, 'read_ui_parity_hardening');
    assert.equal(/createEmpresasReadUiParityHardeningModel/.test(pureSource()), true);
  });
  it('dry run usa overlay model', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.overlay.mode, 'guarded_read_ui_overlay');
  });
  it('dry run usa guarded read UI model', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.guardedReadUi.mode, 'guarded_read_ui_slice');
  });
  it('dry run usa dual-read compare', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.dualReadCompare.mode, 'dual_read_shadow_compare');
  });
  it('dry run usa read-only candidate', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.readOnlyCandidate.mode, 'read_only_candidate');
  });

  // 15
  it('bridge contract contém allowedOperations somente read-only', async () => {
    const c = createEmpresasRuntimeBridgeReadContract({});
    assert.deepEqual([...c.allowedOperations].sort(), ['compareSnapshots', 'inspectDiagnostics', 'readModel', 'renderReadOnly', 'reportReadiness'].sort());
    // Nenhuma operação de write no allowed.
    assert.equal(c.allowedOperations.some((op) => /create|update|delete|save|submit|write|mutate|execute|start|invoke/i.test(op)), false);
  });

  // 16-19 blocked operations
  it('bridge contract contém blockedOperations de write', () => {
    const c = createEmpresasRuntimeBridgeReadContract({});
    for (const op of ['create', 'update', 'delete', 'save', 'submit', 'bulkCreate', 'bulkUpdate', 'bulkDelete', 'executeAction', 'startWorkflow', 'invokeConnector']) {
      assert.equal(c.blockedOperations.includes(op), true, `missing blocked op: ${op}`);
    }
  });
  it('bridge contract bloqueia mutateLegacyRuntime', () => {
    assert.equal(createEmpresasRuntimeBridgeReadContract({}).blockedOperations.includes('mutateLegacyRuntime'), true);
  });
  it('bridge contract bloqueia writeBackend', () => {
    assert.equal(createEmpresasRuntimeBridgeReadContract({}).blockedOperations.includes('writeBackend'), true);
  });
  it('bridge contract bloqueia writeStorage', () => {
    assert.equal(createEmpresasRuntimeBridgeReadContract({}).blockedOperations.includes('writeStorage'), true);
  });

  // 20-23 mount simulation
  it('mount simulation não monta nada de verdade', () => {
    const s = simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: goodHardening, contract: goodContract });
    assert.equal(s.mountedAnythingReal, false);
    assert.equal(s.dryRun, true);
  });
  it('mount simulation não altera App.jsx', () => {
    assert.equal(simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: goodHardening, contract: goodContract }).touchedAppJsx, false);
  });
  it('mount simulation não altera tela real Empresas', () => {
    assert.equal(simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: goodHardening, contract: goodContract }).touchedRealScreen, false);
  });
  it('mount simulation não altera runtimeBridge', () => {
    assert.equal(simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: goodHardening, contract: goodContract }).touchedRuntimeBridge, false);
  });

  // 24
  it('safeToProceed false quando precondition falha', () => {
    const s = simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: { enabled: false }, contract: goodContract });
    assert.equal(s.safeToProceed, false);
    assert.equal(s.wouldMount, false);
    assert.equal(s.blockedReasons.length > 0, true);
  });

  // 25
  it('safeToProceed true quando preconditions passam', () => {
    const s = simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: goodHardening, contract: goodContract });
    assert.equal(s.safeToProceed, true);
    assert.equal(s.wouldMount, true);
  });

  // 26-29 diagnostics
  it('diagnostics incluem bridge contract status', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.diagnostics.bridgeContractStatus, 'built');
  });
  it('diagnostics incluem mount simulation status', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.diagnostics.mountSimulationStatus, 'safe-to-proceed');
  });
  it('diagnostics incluem rollback status', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });
  it('diagnostics incluem noSideEffects', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.diagnostics.noSideEffects, true);
    assert.equal(m.diagnostics.writeBlocked, true);
  });

  // 30-32 components (source-scan)
  it('component renderiza fallback seguro quando off', () => {
    const src = compFile('EmpresasRuntimeBridgeDryRunPanel.jsx');
    assert.equal(/empresas-bridge-dry-run-fallback/.test(src), true);
    assert.equal(/model\.enabled\s*!==\s*true|!model|model\.skipped\s*===\s*true/.test(src), true);
  });
  it('component renderiza contrato quando on', () => {
    assert.equal(/<EmpresasRuntimeBridgeDryRunContract\b/.test(compFile('EmpresasRuntimeBridgeDryRunPanel.jsx')), true);
    assert.equal(/empresas-bridge-dry-run-contract/.test(compFile('EmpresasRuntimeBridgeDryRunContract.jsx')), true);
  });
  it('component renderiza status quando on', () => {
    assert.equal(/<EmpresasRuntimeBridgeDryRunStatus\b/.test(compFile('EmpresasRuntimeBridgeDryRunPanel.jsx')), true);
    assert.equal(/readinessStatus|bridgeReady/.test(compFile('EmpresasRuntimeBridgeDryRunStatus.jsx')), true);
  });

  // 33-35 no side effects
  it('component não possui save/submit funcional', () => {
    assert.equal(/onSubmit|type=["']submit["']|<form\b|handleSave/.test(componentCodeOnly()), false);
  });
  it('component não possui create/update/delete funcional', () => {
    assert.equal(/onClick|onChange\s*=\s*\{[^}]*set|handleCreate|handleUpdate|handleDelete/.test(componentCodeOnly()), false);
  });
  it('component não possui action/workflow/connector funcional', () => {
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(codeOnly()), false);
  });

  // 36
  it('dados sensíveis são mascarados', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(m)), false);
  });

  // 37
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasReadUiRuntimeBridgeDryRunModel(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasBridgeDryRunError);
  });

  // 38
  it('retornos são cópias seguras', async () => {
    const a = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    const b = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.notEqual(a, b);
    assert.deepEqual(clone(a), clone(b));
  });

  // 39
  it('mutar retorno não altera estado interno', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    m.bridgeContract.allowedOperations.length = 0;
    m.blockers.push('injected');
    const fresh = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(fresh.bridgeContract.allowedOperations.length > 0, true);
    assert.equal(fresh.blockers.some((b) => b === 'injected'), false);
  });

  // 40
  it('rollback disponível por flag off', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(m.rollback.featureFlagDefault, 'off');
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });

  // 41
  it('next allowed step é Runtime Bridge Read Slot Candidate ou Dry Run Fixes', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(/Runtime Bridge Read Slot Candidate|Runtime Bridge Dry Run Fixes/i.test(m.nextAllowedStep), true);
    assert.equal(/write|full cutover|migrated/i.test(m.nextAllowedStep), false);
  });

  // 42
  it('integração com overlay/route é opt-in', async () => {
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.equal(isObj(m.flags) && isObj(m.flags.bridgeDryRun), true);
    assert.equal(m.flags.hardening.composedWhenDryRunOn, true);
  });

  // 43
  it('overlay/route continuam funcionando quando dry run flag off', async () => {
    const off = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: OFF });
    assert.equal(off.skipped, true);
    assert.equal(off.bridgeContract, null);
    assert.equal(off.mountSimulation, null);
    // O componente do panel, sem model, renderiza fallback.
    assert.equal(/if\s*\(!model/.test(compFile('EmpresasRuntimeBridgeDryRunPanel.jsx')), true);
  });

  // 44
  it('não altera src/App.jsx', () => {
    assert.equal(/from\s+['"][^'"]*\/App(\.jsx)?['"]/i.test(codeOnly()), false);
  });

  // 45
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(codeOnly()), false);
  });

  // 46
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(codeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(codeOnly()), false);
  });

  // 47/48 — the real legacy bridge lives under src/modules/makBootstrap/runtimeBridge/ (lowercase dir);
  // our own files are named *RuntimeBridge* (capital B) so we match the legacy path form only.
  it('não altera runtime legado nem runtimeBridge real (sem import de makBootstrap/runtimeBridge legado)', () => {
    const imports = [...codeOnly().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const touchesLegacy = imports.some((p) => /makBootstrap/.test(p) || /\/runtimeBridge\//.test(p));
    assert.equal(touchesLegacy, false);
  });

  // 49
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(codeOnly()), false);
  });

  // 50
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = allSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 51
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly()), false);
  });

  // 52
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of [...PURE_FILES.map((x) => path.join(DIR, x)), ...COMPONENT_FILES.map((x) => path.join(COMPONENTS, x))]) {
      const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${path.basename(f)}`);
    }
  });

  // 53
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(allSource()), false);
  });

  // 54 barrel + diagnostics
  it('barrel exporta helpers puros; nenhum .jsx exportado; não declara migração concluída', async () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasReadUiRuntimeBridgeDryRunModel/.test(indexSrc), true);
    assert.equal(/from\s+['"][^'"]*empresas-read-ui-bridge-dry-run\/components\/[^'"]*\.jsx['"]/.test(indexSrc), false);
    const m = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: ON });
    assert.notEqual(m.mode, 'migrated');
    assert.equal(createEmpresasRuntimeBridgeDryRunDiagnostics({ env: ON }).flagStatus, 'on');
    assert.equal(createEmpresasRuntimeBridgeDryRunDiagnostics({ env: OFF }).flagStatus, 'off');
  });
});

function isObj(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
