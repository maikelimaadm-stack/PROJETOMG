import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasReadUiParityHardeningModel } from '../empresas-read-ui-parity-hardening/createEmpresasReadUiParityHardeningModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasMigrationPlan } from '../planning/createEmpresasMigrationPlan.js';
import { createEmpresasRuntimeBridgeReadContract } from './createEmpresasRuntimeBridgeReadContract.js';
import { simulateEmpresasRuntimeBridgeReadMount } from './simulateEmpresasRuntimeBridgeReadMount.js';
import { createEmpresasRuntimeBridgeDryRunDiagnostics } from './empresasRuntimeBridgeDryRunDiagnostics.js';
import { EmpresasBridgeDryRunError } from './errors.js';
import {
  isEmpresasBridgeDryRunEnabled,
  isEmpresasBridgeDryRunProductionBlocked,
  composeDryRunEnv,
  EMPRESAS_BRIDGE_DRY_RUN_FLAG,
} from './empresasRuntimeBridgeDryRunConfig.js';
import { EMPRESAS_READ_UI_PARITY_FLAG } from '../empresas-read-ui-parity-hardening/empresasReadUiParityConfig.js';

const MODULE_ID = 'empresas';
const NEXT_OK = 'Post-Foundation C — Empresas Runtime Bridge Read Slot Candidate';
const NEXT_FIXES = 'Post-Foundation C — Empresas Runtime Bridge Dry Run Fixes';

/** @param {string} code @param {string} message */
function dryRunError(code, message) {
  return new EmpresasBridgeDryRunError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas READ UI RUNTIME BRIDGE DRY RUN MODEL — a passive,
 * deterministic simulation of how the runtime v2 read UI COULD connect to the
 * legacy bridge environment, WITHOUT executing anything. It composes the parity
 * hardening model (which composes the whole read chain), builds a read-only
 * bridge contract + a mount simulation (that mounts nothing), keeps the write
 * guard active, and recommends the next step. Off by default; a safe, side-
 * effect-free skipped result when the flag is off; fail-closed in production. It
 * NEVER writes, mounts, or touches the real runtime bridge, real data, or the
 * backend. Prototype pollution is blocked; the plain result is a safe deep copy
 * (the live write guard is re-attached after cloning).
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasReadUiRuntimeBridgeDryRunModel>}
 */
export async function createEmpresasReadUiRuntimeBridgeDryRunModel(options = {}) {
  validateProjectionInput(options, 0, 'Empresas bridge dry run options', dryRunError);
  if (!isPlainObject(options)) {
    throw dryRunError('MAK-L3-EMP-BRIDGE-DRY-003', 'createEmpresasReadUiRuntimeBridgeDryRunModel() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasBridgeDryRunEnabled(env);
  const productionBlocked = isEmpresasBridgeDryRunProductionBlocked(env);
  const rollback = createEmpresasMigrationPlan().rollback;

  // FLAG OFF (or production-blocked) → skipped, no contract/simulation, no side effects.
  if (!enabled) {
    const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
    const diagnostics = createEmpresasRuntimeBridgeDryRunDiagnostics({ env });
    const skipped = {
      kind: 'empresas-read-ui-runtime-bridge-dry-run-model',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'read_ui_runtime_bridge_dry_run',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      currentRuntime: 'legacy',
      targetRuntime: 'runtime-v2',
      bridgeMode: 'dry_run',
      hardening: null,
      overlay: null,
      guardedReadUi: null,
      readOnlyCandidate: null,
      dualReadCompare: null,
      bridgeContract: null,
      mountSimulation: null,
      readinessStatus: 'skipped',
      bridgeReady: false,
      blockers: [],
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_BRIDGE_DRY_RUN_FLAG} off — dry run skipped`],
      writeBlocked: true,
      blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
      diagnostics,
      flags: flagMatrix(env, false),
      rollback,
      nextAllowedStep: NEXT_OK,
      limitations: limitations(),
      evidence: evidenceLinks(),
    };
    return finalize(skipped, writeGuard);
  }

  // FLAG ON → compose hardening, then build the contract + mount simulation.
  const dryEnv = composeDryRunEnv(env);
  const hardening = await createEmpresasReadUiParityHardeningModel({ env: dryEnv, descriptor: options.descriptor });
  const writeGuard = hardening.writeGuard ?? createEmpresasReadOnlyWriteGuard({ env: dryEnv });

  const bridgeContract = createEmpresasRuntimeBridgeReadContract({});
  const mountSimulation = simulateEmpresasRuntimeBridgeReadMount({ hardeningModel: hardening, contract: bridgeContract });

  const blockers = [...mountSimulation.blockedReasons];
  const warnings = [...(Array.isArray(hardening.warnings) ? hardening.warnings : []), ...mountSimulation.warnings];

  const bridgeReady = mountSimulation.safeToProceed === true && hardening.readinessStatus === 'ready_for_next_slice';
  const readinessStatus = bridgeReady ? 'ready_for_next_slice' : (blockers.length > 0 ? 'needs_fixes' : 'needs_hardening');
  const nextAllowedStep = bridgeReady ? NEXT_OK : NEXT_FIXES;

  const diagnostics = createEmpresasRuntimeBridgeDryRunDiagnostics({
    env,
    hardeningModel: hardening,
    contract: bridgeContract,
    mountSimulation,
    blockers,
    warnings,
    writeGuardActive: true,
  });

  const model = {
    kind: 'empresas-read-ui-runtime-bridge-dry-run-model',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'read_ui_runtime_bridge_dry_run',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: 'controlled-dev-dataset',
    currentRuntime: 'legacy',
    targetRuntime: 'runtime-v2',
    bridgeMode: 'dry_run',
    hardening: { mode: hardening.mode, enabled: hardening.enabled, readinessStatus: hardening.readinessStatus, scorePercent: hardening.parityScore?.scorePercent },
    overlay: hardening.overlay ?? null,
    guardedReadUi: hardening.guardedReadUi ?? null,
    readOnlyCandidate: hardening.readOnlyCandidate ?? null,
    dualReadCompare: hardening.dualReadCompare ?? null,
    bridgeContract,
    mountSimulation,
    readinessStatus,
    bridgeReady,
    blockers,
    warnings,
    writeBlocked: true,
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    diagnostics,
    flags: flagMatrix(env, true),
    rollback,
    nextAllowedStep,
    limitations: limitations(),
    evidence: evidenceLinks(),
  };
  return finalize(model, writeGuard);
}

/**
 * @param {Record<string, unknown>|undefined} env
 * @param {boolean} dryRunOn
 */
function flagMatrix(env, dryRunOn) {
  const e = env ?? {};
  const req = (flag) => ({ flag, requested: e[flag] === 'true' });
  return {
    bridgeDryRun: { flag: EMPRESAS_BRIDGE_DRY_RUN_FLAG, enabled: dryRunOn },
    hardening: { flag: EMPRESAS_READ_UI_PARITY_FLAG, requested: e[EMPRESAS_READ_UI_PARITY_FLAG] === 'true', composedWhenDryRunOn: dryRunOn },
    overlay: req('MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY'),
    guardedReadUi: req('MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI'),
    dualRead: req('MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE'),
    readOnly: req('MAK_RUNTIME_V2_EMPRESAS_READONLY'),
    devPreviewRoute: req('MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE'),
    devPreviewHub: req('MAK_RUNTIME_V2_DEV_PREVIEW_HUB'),
  };
}

/**
 * @param {Record<string, unknown>} model
 * @param {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} writeGuard
 */
function finalize(model, writeGuard) {
  const cloned = /** @type {any} */ (safeClone(model));
  cloned.writeGuard = writeGuard;
  return cloned;
}

function limitations() {
  return [
    'dry run only — simulates a future read-only bridge, mounts nothing real',
    'read-only — never saves/edits/deletes real data',
    'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
    'never alters the real runtime bridge / makBootstrap',
    'never replaces the real Empresas screen; never in the main menu',
    'never becomes the source of truth',
    'reversible by feature flag off',
  ];
}

function evidenceLinks() {
  return [
    'docs/evidence/post-foundation-c-empresas-read-ui-runtime-bridge-dry-run/BRIDGE-DRY-RUN-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-read-ui-runtime-bridge-dry-run/BRIDGE-CONTRACT.md',
    'docs/evidence/post-foundation-c-empresas-read-ui-runtime-bridge-dry-run/ROLLBACK-VALIDATION.md',
  ];
}
