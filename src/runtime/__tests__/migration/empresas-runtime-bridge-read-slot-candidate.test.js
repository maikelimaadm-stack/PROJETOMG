import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasRuntimeBridgeReadSlotCandidate } from '../../migration/empresas-runtime-bridge-read-slot/createEmpresasRuntimeBridgeReadSlotCandidate.js';
import { createEmpresasRuntimeBridgeReadSlotContract } from '../../migration/empresas-runtime-bridge-read-slot/createEmpresasRuntimeBridgeReadSlotContract.js';
import { createEmpresasRuntimeBridgeReadSlotPayload } from '../../migration/empresas-runtime-bridge-read-slot/createEmpresasRuntimeBridgeReadSlotPayload.js';
import { validateEmpresasRuntimeBridgeReadSlotPayload } from '../../migration/empresas-runtime-bridge-read-slot/validateEmpresasRuntimeBridgeReadSlotPayload.js';
import { createEmpresasRuntimeBridgeReadSlotMountPlan } from '../../migration/empresas-runtime-bridge-read-slot/createEmpresasRuntimeBridgeReadSlotMountPlan.js';
import { EmpresasReadSlotError } from '../../migration/empresas-runtime-bridge-read-slot/errors.js';
import { EMPRESAS_READ_SLOT_FLAG, EMPRESAS_READ_SLOT_ALLOW_PROD_FLAG } from '../../migration/empresas-runtime-bridge-read-slot/empresasRuntimeBridgeReadSlotConfig.js';
import { createEmpresasReadOnlyViewModel } from '../../migration/empresas-readonly/createEmpresasReadOnlyViewModel.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '../../migration/empresas-runtime-bridge-read-slot');
const COMPONENTS = path.join(DIR, 'components');
const PURE_FILES = [
  'createEmpresasRuntimeBridgeReadSlotCandidate.js',
  'createEmpresasRuntimeBridgeReadSlotContract.js',
  'createEmpresasRuntimeBridgeReadSlotPayload.js',
  'validateEmpresasRuntimeBridgeReadSlotPayload.js',
  'createEmpresasRuntimeBridgeReadSlotMountPlan.js',
  'empresasRuntimeBridgeReadSlotDiagnostics.js',
  'empresasRuntimeBridgeReadSlotConfig.js',
  'errors.js',
];
const COMPONENT_FILES = [
  'EmpresasRuntimeBridgeReadSlotPanel.jsx',
  'EmpresasRuntimeBridgeReadSlotStatus.jsx',
  'EmpresasRuntimeBridgeReadSlotContract.jsx',
  'EmpresasRuntimeBridgeReadSlotPayload.jsx',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const componentSource = () => COMPONENT_FILES.map((f) => fs.readFileSync(path.join(COMPONENTS, f), 'utf8')).join('\n');
const allSource = () => pureSource() + '\n' + componentSource();
const codeOnly = () => allSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const componentCodeOnly = () => componentSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const compFile = (name) => fs.readFileSync(path.join(COMPONENTS, name), 'utf8');
const clone = (o) => JSON.parse(JSON.stringify(o));

const ON = { [EMPRESAS_READ_SLOT_FLAG]: 'true' };
const OFF = {};

const goodDryRun = {
  enabled: true, bridgeReady: true, readinessStatus: 'ready_for_next_slice',
  mountSimulation: { safeToProceed: true }, blockers: [], warnings: [],
};

async function goodPayload() {
  const vm = await createEmpresasReadOnlyViewModel({});
  return createEmpresasRuntimeBridgeReadSlotPayload({ viewModel: vm, parity: { parityStatus: 'parity' } });
}

describe('Empresas Runtime Bridge Read Slot Candidate (post-Foundation C)', () => {
  // 1
  it('read slot candidate default desligado', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: OFF });
    assert.equal(m.enabled, false);
    assert.equal(m.skipped, true);
    assert.equal(m.noSideEffects, true);
    assert.equal(m.readSlotContract, null);
    assert.equal(m.readSlotPayload, null);
    assert.equal(m.mountPlan, null);
  });

  // 2
  it('read slot candidate habilita somente com flag', async () => {
    assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON })).enabled, true);
    assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: { [EMPRESAS_READ_SLOT_FLAG]: 'false' } })).enabled, false);
  });

  // 3
  it('produção falha fechada', async () => {
    const prod = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: { ...ON, NODE_ENV: 'production' } });
    assert.equal(prod.enabled, false);
    assert.equal(prod.productionBlocked, true);
    const ok = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: { ...ON, NODE_ENV: 'production', [EMPRESAS_READ_SLOT_ALLOW_PROD_FLAG]: 'true' } });
    assert.equal(ok.enabled, true);
  });

  // 4
  it('model é determinístico', async () => {
    const a = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    const b = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.deepEqual(clone(a), clone(b));
  });

  // 5-9
  it('moduleId é empresas', async () => { assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON })).moduleId, 'empresas'); });
  it('mode é runtime_bridge_read_slot_candidate', async () => { assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON })).mode, 'runtime_bridge_read_slot_candidate'); });
  it('slotMode é read_only_candidate', async () => { assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON })).slotMode, 'read_only_candidate'); });
  it('currentRuntime é legacy', async () => { assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON })).currentRuntime, 'legacy'); });
  it('targetRuntime é runtime-v2', async () => { assert.equal((await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON })).targetRuntime, 'runtime-v2'); });

  // 10-14
  it('usa bridge dry run', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.dryRun.mode, 'read_ui_runtime_bridge_dry_run');
    assert.equal(/createEmpresasReadUiRuntimeBridgeDryRunModel/.test(pureSource()), true);
  });
  it('usa hardening model', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.hardening.mode, 'read_ui_parity_hardening');
  });
  it('usa overlay model', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.overlay.mode, 'guarded_read_ui_overlay');
  });
  it('usa guarded read UI model', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.guardedReadUi.mode, 'guarded_read_ui_slice');
  });
  it('usa read-only candidate', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.readOnlyCandidate.mode, 'read_only_candidate');
  });

  // 15
  it('contract contém allowedOperations somente read-only', () => {
    const c = createEmpresasRuntimeBridgeReadSlotContract({});
    assert.deepEqual([...c.allowedOperations].sort(), ['inspectDiagnostics', 'inspectParity', 'inspectWriteGuard', 'receiveReadModel', 'renderReadOnly', 'reportReadiness'].sort());
    // Every allowed op is a read-only verb (receive/render/inspect/report) — no mutating verb.
    assert.equal(c.allowedOperations.every((op) => /^(receive|render|inspect|report)/.test(op)), true);
    assert.equal(c.allowedOperations.some((op) => /^(create|update|delete|save|submit|bulk|execute|start|invoke|mutate|replace|writeBackend|writeStorage)/i.test(op)), false);
  });

  // 16-21 blocked ops
  it('contract contém blockedOperations de write', () => {
    const c = createEmpresasRuntimeBridgeReadSlotContract({});
    for (const op of ['create', 'update', 'delete', 'save', 'submit', 'bulkCreate', 'bulkUpdate', 'bulkDelete', 'executeAction', 'startWorkflow', 'invokeConnector']) {
      assert.equal(c.blockedOperations.includes(op), true, `missing blocked op: ${op}`);
    }
  });
  it('contract bloqueia mutateLegacyRuntime', () => { assert.equal(createEmpresasRuntimeBridgeReadSlotContract({}).blockedOperations.includes('mutateLegacyRuntime'), true); });
  it('contract bloqueia mutateRuntimeBridge', () => { assert.equal(createEmpresasRuntimeBridgeReadSlotContract({}).blockedOperations.includes('mutateRuntimeBridge'), true); });
  it('contract bloqueia writeBackend', () => { assert.equal(createEmpresasRuntimeBridgeReadSlotContract({}).blockedOperations.includes('writeBackend'), true); });
  it('contract bloqueia writeStorage', () => { assert.equal(createEmpresasRuntimeBridgeReadSlotContract({}).blockedOperations.includes('writeStorage'), true); });
  it('contract bloqueia replaceProductionUi', () => { assert.equal(createEmpresasRuntimeBridgeReadSlotContract({}).blockedOperations.includes('replaceProductionUi'), true); });

  // 22-25 payload
  it('payload contém table', async () => { assert.equal(Array.isArray((await goodPayload()).table.columns), true); });
  it('payload contém form', async () => { assert.equal(Array.isArray((await goodPayload()).form.fields), true); });
  it('payload contém diagnostics', async () => { const p = await goodPayload(); assert.equal(typeof p.diagnostics, 'object'); });
  it('payload contém writeGuard', async () => { const p = await goodPayload(); assert.equal(p.writeGuard.writeBlocked, true); });

  // 26-29 payload validation
  it('payload validation passa para payload seguro', async () => {
    assert.equal(validateEmpresasRuntimeBridgeReadSlotPayload({ payload: await goodPayload() }).valid, true);
  });
  it('payload validation falha para payload sem writeGuard', async () => {
    const p = clone(await goodPayload()); delete p.writeGuard;
    assert.equal(validateEmpresasRuntimeBridgeReadSlotPayload({ payload: p }).valid, false);
  });
  it('payload validation falha para função/handler', async () => {
    const p = { ...(await goodPayload()), onClick: () => {} };
    const r = validateEmpresasRuntimeBridgeReadSlotPayload({ payload: p });
    assert.equal(r.valid, false);
    assert.equal(r.errors.some((e) => /function/.test(e)), true);
  });
  it('payload validation falha para prototype pollution', async () => {
    const p = JSON.parse('{"moduleId":"empresas","mode":"read_only","__proto__":{"x":1}}');
    assert.equal(validateEmpresasRuntimeBridgeReadSlotPayload({ payload: p }).valid, false);
  });

  // 30-33 mount plan
  it('mount plan não monta nada de verdade', () => {
    const plan = createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun: goodDryRun, contract: createEmpresasRuntimeBridgeReadSlotContract({}), payloadValidation: { valid: true, safeToProceed: true } });
    assert.equal(plan.mountedAnythingReal, false);
  });
  it('mount plan não altera App.jsx', () => {
    assert.equal(createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun: goodDryRun }).touchedAppJsx, false);
  });
  it('mount plan não altera tela real Empresas', () => {
    assert.equal(createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun: goodDryRun }).touchedRealScreen, false);
  });
  it('mount plan não altera runtimeBridge', () => {
    assert.equal(createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun: goodDryRun }).touchedRuntimeBridge, false);
  });

  // 34
  it('safeToProceed false quando precondition falha', () => {
    const plan = createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun: { enabled: false }, contract: createEmpresasRuntimeBridgeReadSlotContract({}), payloadValidation: { valid: false } });
    assert.equal(plan.safeToProceed, false);
    assert.equal(plan.blockedReasons.length > 0, true);
  });

  // 35
  it('safeToProceed true quando preconditions passam', () => {
    const plan = createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun: goodDryRun, contract: createEmpresasRuntimeBridgeReadSlotContract({}), payloadValidation: { valid: true, safeToProceed: true } });
    assert.equal(plan.safeToProceed, true);
    assert.equal(plan.wouldMount, true);
  });

  // 36-40 diagnostics
  it('diagnostics incluem contract status', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.diagnostics.readSlotContractStatus, 'built');
  });
  it('diagnostics incluem payload validation status', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.diagnostics.payloadValidationStatus, 'valid');
  });
  it('diagnostics incluem mount plan status', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.diagnostics.mountPlanStatus, 'safe-to-proceed');
  });
  it('diagnostics incluem rollback status', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });
  it('diagnostics incluem noSideEffects', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.diagnostics.noSideEffects, true);
    assert.equal(m.diagnostics.writeBlocked, true);
  });

  // 41-44 components (source-scan)
  it('component renderiza fallback seguro quando off', () => {
    const src = compFile('EmpresasRuntimeBridgeReadSlotPanel.jsx');
    assert.equal(/empresas-read-slot-fallback/.test(src), true);
    assert.equal(/model\.enabled\s*!==\s*true|!model|model\.skipped\s*===\s*true/.test(src), true);
  });
  it('component renderiza contrato quando on', () => {
    assert.equal(/<EmpresasRuntimeBridgeReadSlotContract\b/.test(compFile('EmpresasRuntimeBridgeReadSlotPanel.jsx')), true);
    assert.equal(/empresas-read-slot-contract/.test(compFile('EmpresasRuntimeBridgeReadSlotContract.jsx')), true);
  });
  it('component renderiza payload summary quando on', () => {
    assert.equal(/<EmpresasRuntimeBridgeReadSlotPayload\b/.test(compFile('EmpresasRuntimeBridgeReadSlotPanel.jsx')), true);
    assert.equal(/empresas-read-slot-payload/.test(compFile('EmpresasRuntimeBridgeReadSlotPayload.jsx')), true);
  });
  it('component renderiza status quando on', () => {
    assert.equal(/<EmpresasRuntimeBridgeReadSlotStatus\b/.test(compFile('EmpresasRuntimeBridgeReadSlotPanel.jsx')), true);
    assert.equal(/readinessStatus|slotReady/.test(compFile('EmpresasRuntimeBridgeReadSlotStatus.jsx')), true);
  });

  // 45-47 no side effects
  it('component não possui save/submit funcional', () => {
    assert.equal(/onSubmit|type=["']submit["']|<form\b|handleSave/.test(componentCodeOnly()), false);
  });
  it('component não possui create/update/delete funcional', () => {
    assert.equal(/onClick|onChange\s*=\s*\{[^}]*set|handleCreate|handleUpdate|handleDelete/.test(componentCodeOnly()), false);
  });
  it('component não possui action/workflow/connector funcional', () => {
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(codeOnly()), false);
  });

  // 48
  it('dados sensíveis são mascarados', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(m)), false);
  });

  // 49
  it('prototype pollution é bloqueado', async () => {
    await assert.rejects(() => createEmpresasRuntimeBridgeReadSlotCandidate(JSON.parse('{"__proto__": {"x": 1}}')), EmpresasReadSlotError);
  });

  // 50
  it('retornos são cópias seguras', async () => {
    const a = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    const b = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.notEqual(a, b);
    assert.deepEqual(clone(a), clone(b));
  });

  // 51
  it('mutar retorno não altera estado interno', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    m.readSlotContract.allowedOperations.length = 0;
    m.blockers.push('injected');
    const fresh = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(fresh.readSlotContract.allowedOperations.length > 0, true);
    assert.equal(fresh.blockers.some((b) => b === 'injected'), false);
  });

  // 52
  it('rollback disponível por flag off', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(m.rollback.featureFlagDefault, 'off');
    assert.equal(m.diagnostics.rollbackStatus, 'available');
  });

  // 53
  it('next allowed step é Read Slot Dev Activation ou Candidate Fixes', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(/Read Slot Dev Activation|Read Slot Candidate Fixes/i.test(m.nextAllowedStep), true);
    assert.equal(/write|full cutover|migrated/i.test(m.nextAllowedStep), false);
  });

  // 54
  it('integração com overlay/route é opt-in', async () => {
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.equal(typeof m.flags === 'object' && typeof m.flags.readSlot === 'object', true);
    assert.equal(m.flags.bridgeDryRun.composedWhenSlotOn, true);
  });

  // 55
  it('overlay/route continuam funcionando quando read slot flag off', async () => {
    const off = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: OFF });
    assert.equal(off.skipped, true);
    assert.equal(off.readSlotContract, null);
    assert.equal(/if\s*\(!model/.test(compFile('EmpresasRuntimeBridgeReadSlotPanel.jsx')), true);
  });

  // 56
  it('não altera src/App.jsx', () => {
    assert.equal(/from\s+['"][^'"]*\/App(\.jsx)?['"]/i.test(codeOnly()), false);
  });

  // 57
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(codeOnly()), false);
  });

  // 58
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(codeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(codeOnly()), false);
  });

  // 59/60
  it('não altera runtime legado nem runtimeBridge real (sem import de makBootstrap/runtimeBridge legado)', () => {
    const imports = [...codeOnly().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    assert.equal(imports.some((p) => /makBootstrap/.test(p) || /\/runtimeBridge\//.test(p)), false);
  });

  // 61
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(codeOnly()), false);
  });

  // 62
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = allSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 63
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly()), false);
  });

  // 64
  it('não adiciona dependência nova (imports relativos)', () => {
    for (const f of [...PURE_FILES.map((x) => path.join(DIR, x)), ...COMPONENT_FILES.map((x) => path.join(COMPONENTS, x))]) {
      const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const imports = [...src.matchAll(/\bimport\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${path.basename(f)}`);
    }
  });

  // 65
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(allSource()), false);
  });

  // 66 barrel
  it('barrel exporta helpers puros; nenhum .jsx exportado; não declara migração concluída', async () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasRuntimeBridgeReadSlotCandidate/.test(indexSrc), true);
    assert.equal(/from\s+['"][^'"]*empresas-runtime-bridge-read-slot\/components\/[^'"]*\.jsx['"]/.test(indexSrc), false);
    const m = await createEmpresasRuntimeBridgeReadSlotCandidate({ env: ON });
    assert.notEqual(m.mode, 'migrated');
  });
});
