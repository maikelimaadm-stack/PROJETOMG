import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../../shadow/pilots/tableFormProjection.js';
import { createEmpresasGuardedReadUiModel } from '../createEmpresasGuardedReadUiModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasMigrationPlan } from '../../planning/createEmpresasMigrationPlan.js';
import { createEmpresasGuardedReadUiOverlayDiagnostics } from './empresasGuardedReadUiOverlayDiagnostics.js';
import { EmpresasGuardedReadUiOverlayError } from './errors.js';
import {
  isEmpresasGuardedReadUiOverlayEnabled,
  isEmpresasGuardedReadUiOverlayProductionBlocked,
  composeOverlayEnv,
  EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG,
} from './empresasGuardedReadUiOverlayConfig.js';
import { EMPRESAS_GUARDED_READ_UI_FLAG } from '../empresasGuardedReadUiConfig.js';
import { EMPRESAS_DUAL_READ_FLAG } from '../../empresas-dual-read/empresasDualReadConfig.js';
import { EMPRESAS_READONLY_FLAG } from '../../empresas-readonly/empresasReadOnlyConfig.js';

const MODULE_ID = 'empresas';
const NEXT_OK = 'Post-Foundation C — Empresas Read UI Parity Hardening';
const NEXT_DRIFT = 'Post-Foundation C — Empresas Guarded Read UI Drift Resolution';

/** @param {string} code @param {string} message */
function overlayError(code, message) {
  return new EmpresasGuardedReadUiOverlayError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas GUARDED READ UI OVERLAY MODEL — the plain, deterministic
 * model for the dev-only preview panel that opens the guarded read UI inside the
 * runtime v2 dev preview. Off by default; a safe, side-effect-free skipped
 * result when the flag is off; fail-closed in production. When enabled it
 * composes the guarded read UI model (which itself composes the read-only
 * candidate + dual-read compare), keeps the write guard active, surfaces the
 * flag matrix, and recommends the next step. It NEVER writes, never touches real
 * data or the backend, never replaces the real Empresas screen. Prototype
 * pollution is blocked; the plain result is a safe deep copy (the live write
 * guard is re-attached after cloning).
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayModel>}
 */
export async function createEmpresasGuardedReadUiOverlayModel(options = {}) {
  validateProjectionInput(options, 0, 'Empresas guarded read UI overlay options', overlayError);
  if (!isPlainObject(options)) {
    throw overlayError('MAK-L3-EMP-OVERLAY-003', 'createEmpresasGuardedReadUiOverlayModel() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasGuardedReadUiOverlayEnabled(env);
  const productionBlocked = isEmpresasGuardedReadUiOverlayProductionBlocked(env);
  const rollback = createEmpresasMigrationPlan().rollback;

  // FLAG OFF (or production-blocked) → skipped, no guarded UI, no side effects.
  if (!enabled) {
    const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
    const diagnostics = createEmpresasGuardedReadUiOverlayDiagnostics({ env });
    const skipped = {
      kind: 'empresas-guarded-read-ui-overlay-model',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'guarded_read_ui_overlay',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      currentRuntime: 'legacy',
      targetRuntime: 'runtime-v2',
      guardedReadUi: null,
      parityStatus: 'skipped',
      totalDifferences: 0,
      blockingCount: 0,
      criticalCount: 0,
      writeBlocked: true,
      blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
      diagnostics,
      flags: flagMatrix(env, false),
      rollback,
      nextAllowedStep: NEXT_OK,
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG} off — overlay skipped`],
      limitations: limitations(),
      evidence: evidenceLinks(),
    };
    return finalize(skipped, writeGuard);
  }

  // FLAG ON → compose the guarded read UI model (which composes read-only + dual-read).
  const overlayEnv = composeOverlayEnv(env);
  const guardedReadUi = await createEmpresasGuardedReadUiModel({ env: overlayEnv, descriptor: options.descriptor });
  // Reuse the guarded read UI's live write guard (built with the full composed read env → reports
  // "write blocked" rather than "flag disabled"). Falls back to a fresh guard if absent.
  const writeGuard = guardedReadUi.writeGuard ?? createEmpresasReadOnlyWriteGuard({ env: overlayEnv });
  const summary = guardedReadUi.dualReadCompare ? guardedReadUi.dualReadCompare.summary : null;
  const parityStatus = guardedReadUi.parityStatus;
  const blocked = parityStatus === 'blocked';
  const nextAllowedStep = blocked ? NEXT_DRIFT : NEXT_OK;
  const diagnostics = createEmpresasGuardedReadUiOverlayDiagnostics({ env, guardedReadUi, writeGuardActive: true });

  const model = {
    kind: 'empresas-guarded-read-ui-overlay-model',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'guarded_read_ui_overlay',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: guardedReadUi.source,
    currentRuntime: 'legacy',
    targetRuntime: 'runtime-v2',
    guardedReadUi,
    parityStatus,
    totalDifferences: summary ? summary.totalDifferences : 0,
    blockingCount: summary ? summary.blockingCount : 0,
    criticalCount: summary ? summary.criticalCount : 0,
    writeBlocked: true,
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    diagnostics,
    flags: flagMatrix(env, true),
    rollback,
    nextAllowedStep,
    warnings: blocked ? ['blocking/critical differences present — drift resolution required before parity hardening'] : [],
    limitations: limitations(),
    evidence: evidenceLinks(),
  };
  return finalize(model, writeGuard);
}

/**
 * @param {Record<string, unknown>|undefined} env
 * @param {boolean} overlayOn
 */
function flagMatrix(env, overlayOn) {
  const e = env ?? {};
  return {
    overlay: { flag: EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG, enabled: overlayOn },
    guardedReadUi: { flag: EMPRESAS_GUARDED_READ_UI_FLAG, requested: e[EMPRESAS_GUARDED_READ_UI_FLAG] === 'true', composedWhenOverlayOn: overlayOn },
    dualRead: { flag: EMPRESAS_DUAL_READ_FLAG, requested: e[EMPRESAS_DUAL_READ_FLAG] === 'true' },
    readOnly: { flag: EMPRESAS_READONLY_FLAG, requested: e[EMPRESAS_READONLY_FLAG] === 'true' },
    devPreviewRoute: { flag: 'MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE', requested: e.MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE === 'true' },
    devPreviewHub: { flag: 'MAK_RUNTIME_V2_DEV_PREVIEW_HUB', requested: e.MAK_RUNTIME_V2_DEV_PREVIEW_HUB === 'true' },
  };
}

/**
 * Deep-copies the plain overlay model and re-attaches the live write guard,
 * whose `attempt()` function would be dropped by JSON clone.
 * @param {Record<string, unknown>} model
 * @param {import('../../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} writeGuard
 */
function finalize(model, writeGuard) {
  const cloned = /** @type {any} */ (safeClone(model));
  cloned.writeGuard = writeGuard;
  if (cloned.guardedReadUi && isPlainObject(cloned.guardedReadUi)) {
    cloned.guardedReadUi.writeGuard = writeGuard;
  }
  return cloned;
}

function limitations() {
  return [
    'dev-only overlay — a preview panel inside the runtime v2 dev preview, never the real screen',
    'read-only — never saves/edits/deletes real data',
    'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
    'never replaces the real Empresas screen; never in the main menu',
    'never becomes the source of truth',
    'reversible by feature flag off',
  ];
}

function evidenceLinks() {
  return [
    'docs/evidence/post-foundation-c-empresas-guarded-read-ui-overlay/GUARDED-READ-UI-OVERLAY-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-guarded-read-ui-overlay/WRITE-BLOCKED-OVERLAY-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-guarded-read-ui-overlay/ROLLBACK-VALIDATION.md',
  ];
}
