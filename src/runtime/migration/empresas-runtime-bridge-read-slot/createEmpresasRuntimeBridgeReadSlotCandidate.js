import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasReadUiRuntimeBridgeDryRunModel } from '../empresas-read-ui-bridge-dry-run/createEmpresasReadUiRuntimeBridgeDryRunModel.js';
import { createEmpresasReadOnlyViewModel } from '../empresas-readonly/createEmpresasReadOnlyViewModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasMigrationPlan } from '../planning/createEmpresasMigrationPlan.js';
import { createEmpresasRuntimeBridgeReadSlotContract } from './createEmpresasRuntimeBridgeReadSlotContract.js';
import { createEmpresasRuntimeBridgeReadSlotPayload } from './createEmpresasRuntimeBridgeReadSlotPayload.js';
import { validateEmpresasRuntimeBridgeReadSlotPayload } from './validateEmpresasRuntimeBridgeReadSlotPayload.js';
import { createEmpresasRuntimeBridgeReadSlotMountPlan } from './createEmpresasRuntimeBridgeReadSlotMountPlan.js';
import { createEmpresasRuntimeBridgeReadSlotDiagnostics } from './empresasRuntimeBridgeReadSlotDiagnostics.js';
import { EmpresasReadSlotError } from './errors.js';
import {
  isEmpresasReadSlotEnabled,
  isEmpresasReadSlotProductionBlocked,
  composeSlotEnv,
  EMPRESAS_READ_SLOT_FLAG,
} from './empresasRuntimeBridgeReadSlotConfig.js';
import { EMPRESAS_BRIDGE_DRY_RUN_FLAG } from '../empresas-read-ui-bridge-dry-run/empresasRuntimeBridgeDryRunConfig.js';

const MODULE_ID = 'empresas';
const NEXT_OK = 'Post-Foundation C — Empresas Runtime Bridge Read Slot Dev Activation';
const NEXT_FIXES = 'Post-Foundation C — Empresas Runtime Bridge Read Slot Candidate Fixes';

/** @param {string} code @param {string} message */
function slotError(code, message) {
  return new EmpresasReadSlotError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas RUNTIME BRIDGE READ SLOT CANDIDATE MODEL — a passive,
 * deterministic description of a FUTURE controlled read-only slot between the
 * runtime v2 read UI and the legacy bridge, WITHOUT mounting anything. It
 * composes the bridge dry run (which composes the whole read chain), builds a
 * read-only slot contract + a serializable read-only payload + a payload
 * validation + a mount plan (that mounts nothing), keeps the write guard active,
 * and recommends the next step. Off by default; a safe, side-effect-free skipped
 * result when the flag is off; fail-closed in production. It NEVER writes,
 * mounts, or touches the real runtime bridge, real data, or the backend.
 * Prototype pollution is blocked; the plain result is a safe deep copy (the live
 * write guard is re-attached after cloning).
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotCandidateModel>}
 */
export async function createEmpresasRuntimeBridgeReadSlotCandidate(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read slot candidate options', slotError);
  if (!isPlainObject(options)) {
    throw slotError('MAK-L3-EMP-READ-SLOT-003', 'createEmpresasRuntimeBridgeReadSlotCandidate() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasReadSlotEnabled(env);
  const productionBlocked = isEmpresasReadSlotProductionBlocked(env);
  const rollback = createEmpresasMigrationPlan().rollback;

  // FLAG OFF (or production-blocked) → skipped, no contract/payload/plan, no side effects.
  if (!enabled) {
    const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
    const diagnostics = createEmpresasRuntimeBridgeReadSlotDiagnostics({ env });
    const skipped = {
      kind: 'empresas-runtime-bridge-read-slot-candidate-model',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'runtime_bridge_read_slot_candidate',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      currentRuntime: 'legacy',
      targetRuntime: 'runtime-v2',
      slotMode: 'read_only_candidate',
      dryRun: null,
      readSlotContract: null,
      readSlotPayload: null,
      payloadValidation: null,
      mountPlan: null,
      bridgeDryRun: null,
      hardening: null,
      overlay: null,
      guardedReadUi: null,
      readOnlyCandidate: null,
      readinessStatus: 'skipped',
      slotReady: false,
      safeToProceed: false,
      blockers: [],
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_READ_SLOT_FLAG} off — read slot candidate skipped`],
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

  // FLAG ON → compose the dry run + build the slot contract/payload/validation/mount plan.
  const slotEnv = composeSlotEnv(env);
  const dryRun = await createEmpresasReadUiRuntimeBridgeDryRunModel({ env: slotEnv, descriptor: options.descriptor });
  const writeGuard = dryRun.writeGuard ?? createEmpresasReadOnlyWriteGuard({ env: slotEnv });
  const viewModel = await createEmpresasReadOnlyViewModel({ descriptor: options.descriptor });

  const readSlotContract = createEmpresasRuntimeBridgeReadSlotContract({ dryRunVerified: dryRun.bridgeReady === true });
  const parity = dryRun.guardedReadUi && dryRun.dualReadCompare
    ? { parityStatus: dryRun.dualReadCompare.parityStatus, totalDifferences: dryRun.dualReadCompare.summary?.totalDifferences, blockingCount: dryRun.dualReadCompare.summary?.blockingCount, criticalCount: dryRun.dualReadCompare.summary?.criticalCount }
    : { parityStatus: dryRun.readinessStatus };
  const readSlotPayload = createEmpresasRuntimeBridgeReadSlotPayload({ viewModel, diagnostics: viewModel.diagnostics, parity, slotId: readSlotContract.slotId, flags: flagMatrix(env, true) });
  const payloadValidation = validateEmpresasRuntimeBridgeReadSlotPayload({ payload: readSlotPayload });
  const mountPlan = createEmpresasRuntimeBridgeReadSlotMountPlan({ dryRun, contract: readSlotContract, payloadValidation });

  const blockers = [...mountPlan.blockedReasons, ...payloadValidation.blockers];
  const warnings = [...(Array.isArray(dryRun.warnings) ? dryRun.warnings : []), ...mountPlan.warnings];

  const slotReady = mountPlan.safeToProceed === true && payloadValidation.valid === true && dryRun.readinessStatus === 'ready_for_next_slice';
  const safeToProceed = slotReady && blockers.length === 0;
  const readinessStatus = slotReady ? 'ready_for_next_slice' : (blockers.length > 0 ? 'needs_fixes' : 'needs_hardening');
  const nextAllowedStep = slotReady ? NEXT_OK : NEXT_FIXES;

  const diagnostics = createEmpresasRuntimeBridgeReadSlotDiagnostics({
    env,
    dryRun,
    contract: readSlotContract,
    payloadValidation,
    mountPlan,
    blockers,
    warnings,
    writeGuardActive: true,
  });

  const model = {
    kind: 'empresas-runtime-bridge-read-slot-candidate-model',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'runtime_bridge_read_slot_candidate',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: 'controlled-dev-dataset',
    currentRuntime: 'legacy',
    targetRuntime: 'runtime-v2',
    slotMode: 'read_only_candidate',
    dryRun: { mode: dryRun.mode, bridgeMode: dryRun.bridgeMode, bridgeReady: dryRun.bridgeReady, readinessStatus: dryRun.readinessStatus },
    readSlotContract,
    readSlotPayload,
    payloadValidation,
    mountPlan,
    bridgeDryRun: { mode: dryRun.mode, bridgeReady: dryRun.bridgeReady },
    hardening: dryRun.hardening ?? null,
    overlay: dryRun.overlay ?? null,
    guardedReadUi: dryRun.guardedReadUi ?? null,
    readOnlyCandidate: dryRun.readOnlyCandidate ?? null,
    readinessStatus,
    slotReady,
    safeToProceed,
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
 * @param {boolean} slotOn
 */
function flagMatrix(env, slotOn) {
  const e = env ?? {};
  const req = (flag) => ({ flag, requested: e[flag] === 'true' });
  return {
    readSlot: { flag: EMPRESAS_READ_SLOT_FLAG, enabled: slotOn },
    bridgeDryRun: { flag: EMPRESAS_BRIDGE_DRY_RUN_FLAG, requested: e[EMPRESAS_BRIDGE_DRY_RUN_FLAG] === 'true', composedWhenSlotOn: slotOn },
    hardening: req('MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING'),
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
    'candidate only — a controlled future read slot, never mounted in the real screen',
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
    'docs/evidence/post-foundation-c-empresas-runtime-bridge-read-slot-candidate/READ-SLOT-CANDIDATE-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-runtime-bridge-read-slot-candidate/READ-SLOT-CONTRACT.md',
    'docs/evidence/post-foundation-c-empresas-runtime-bridge-read-slot-candidate/ROLLBACK-VALIDATION.md',
  ];
}
