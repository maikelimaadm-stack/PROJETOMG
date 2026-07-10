import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasGuardedReadUiOverlayModel } from '../empresas-guarded-read-ui/overlay/createEmpresasGuardedReadUiOverlayModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasMigrationPlan } from '../planning/createEmpresasMigrationPlan.js';
import { createEmpresasReadUiParityChecklist } from './createEmpresasReadUiParityChecklist.js';
import { createEmpresasReadUiParityScore } from './createEmpresasReadUiParityScore.js';
import { createEmpresasReadUiParityDiagnostics } from './empresasReadUiParityDiagnostics.js';
import { EmpresasReadUiParityError } from './errors.js';
import {
  isEmpresasReadUiParityEnabled,
  isEmpresasReadUiParityProductionBlocked,
  composeParityEnv,
  EMPRESAS_READ_UI_PARITY_FLAG,
} from './empresasReadUiParityConfig.js';
import { EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG } from '../empresas-guarded-read-ui/overlay/empresasGuardedReadUiOverlayConfig.js';
import { EMPRESAS_GUARDED_READ_UI_FLAG } from '../empresas-guarded-read-ui/empresasGuardedReadUiConfig.js';
import { EMPRESAS_DUAL_READ_FLAG } from '../empresas-dual-read/empresasDualReadConfig.js';
import { EMPRESAS_READONLY_FLAG } from '../empresas-readonly/empresasReadOnlyConfig.js';

const MODULE_ID = 'empresas';
const NEXT_OK = 'Post-Foundation C — Empresas Read UI Runtime Bridge Dry Run';
const NEXT_FIXES = 'Post-Foundation C — Empresas Read UI Parity Hardening Fixes';

/** @param {string} code @param {string} message */
function hardeningError(code, message) {
  return new EmpresasReadUiParityError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas READ UI PARITY HARDENING MODEL — a passive, deterministic
 * checklist + score + diagnostics over the guarded read UI overlay (which itself
 * composes the guarded read UI slice, dual-read compare, and read-only
 * candidate). It hardens confidence in the read UI's parity/safety BEFORE any
 * approach to the real screen. Off by default; a safe, side-effect-free skipped
 * result when the flag is off; fail-closed in production. It NEVER writes, never
 * touches real data or the backend, never replaces the real Empresas screen.
 * Prototype pollution is blocked; the plain result is a safe deep copy (the live
 * write guard is re-attached after cloning).
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../types/empresas-read-ui-parity-hardening.js').EmpresasReadUiParityHardeningModel>}
 */
export async function createEmpresasReadUiParityHardeningModel(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read UI parity hardening options', hardeningError);
  if (!isPlainObject(options)) {
    throw hardeningError('MAK-L3-EMP-PARITY-003', 'createEmpresasReadUiParityHardeningModel() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasReadUiParityEnabled(env);
  const productionBlocked = isEmpresasReadUiParityProductionBlocked(env);
  const rollback = createEmpresasMigrationPlan().rollback;

  // FLAG OFF (or production-blocked) → skipped, no analysis, no side effects.
  if (!enabled) {
    const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
    const checklist = createEmpresasReadUiParityChecklist({ overlayModel: null });
    const score = createEmpresasReadUiParityScore({ checklist });
    const diagnostics = createEmpresasReadUiParityDiagnostics({ env, score });
    const skipped = {
      kind: 'empresas-read-ui-parity-hardening-model',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'read_ui_parity_hardening',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      currentRuntime: 'legacy',
      targetRuntime: 'runtime-v2',
      overlay: null,
      guardedReadUi: null,
      readOnlyCandidate: null,
      dualReadCompare: null,
      parityChecklist: checklist,
      parityScore: score,
      readinessStatus: 'skipped',
      blockers: [],
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_READ_UI_PARITY_FLAG} off — hardening skipped`],
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

  // FLAG ON → build the overlay, then the checklist/score/diagnostics.
  const parityEnv = composeParityEnv(env);
  const overlay = await createEmpresasGuardedReadUiOverlayModel({ env: parityEnv, descriptor: options.descriptor });
  const writeGuard = overlay.writeGuard ?? createEmpresasReadOnlyWriteGuard({ env: parityEnv });
  const guardedReadUi = overlay.guardedReadUi ?? null;

  const parityChecklist = createEmpresasReadUiParityChecklist({ overlayModel: overlay });
  const parityScore = createEmpresasReadUiParityScore({ checklist: parityChecklist });

  const blockers = parityChecklist
    .filter((i) => i.status === 'fail' && (i.blocking || i.severity === 'critical'))
    .map((i) => `${i.category}/${i.id}: ${i.label}`);
  const warnings = parityChecklist.filter((i) => i.status === 'warn').map((i) => `${i.category}/${i.id}: ${i.label}`);

  const readinessStatus = parityScore.readinessStatus;
  const nextAllowedStep = readinessStatus === 'ready_for_next_slice' ? NEXT_OK : NEXT_FIXES;

  const diagnostics = createEmpresasReadUiParityDiagnostics({
    env,
    overlayModel: overlay,
    score: parityScore,
    blockers,
    warnings,
    writeGuardActive: true,
  });

  const model = {
    kind: 'empresas-read-ui-parity-hardening-model',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'read_ui_parity_hardening',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: guardedReadUi ? guardedReadUi.source : 'structural-only',
    currentRuntime: 'legacy',
    targetRuntime: 'runtime-v2',
    overlay: { mode: overlay.mode, enabled: overlay.enabled, parityStatus: overlay.parityStatus },
    guardedReadUi: guardedReadUi ? { mode: guardedReadUi.mode, enabled: guardedReadUi.enabled, parityStatus: guardedReadUi.parityStatus } : null,
    readOnlyCandidate: guardedReadUi && guardedReadUi.readOnlyCandidate ? guardedReadUi.readOnlyCandidate : null,
    dualReadCompare: guardedReadUi && guardedReadUi.dualReadCompare ? { mode: guardedReadUi.dualReadCompare.mode, parityStatus: guardedReadUi.dualReadCompare.parityStatus, summary: guardedReadUi.dualReadCompare.summary } : null,
    parityChecklist,
    parityScore,
    readinessStatus,
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
 * @param {boolean} hardeningOn
 */
function flagMatrix(env, hardeningOn) {
  const e = env ?? {};
  return {
    hardening: { flag: EMPRESAS_READ_UI_PARITY_FLAG, enabled: hardeningOn },
    overlay: { flag: EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG, requested: e[EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG] === 'true', composedWhenHardeningOn: hardeningOn },
    guardedReadUi: { flag: EMPRESAS_GUARDED_READ_UI_FLAG, requested: e[EMPRESAS_GUARDED_READ_UI_FLAG] === 'true' },
    dualRead: { flag: EMPRESAS_DUAL_READ_FLAG, requested: e[EMPRESAS_DUAL_READ_FLAG] === 'true' },
    readOnly: { flag: EMPRESAS_READONLY_FLAG, requested: e[EMPRESAS_READONLY_FLAG] === 'true' },
    devPreviewRoute: { flag: 'MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE', requested: e.MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE === 'true' },
    devPreviewHub: { flag: 'MAK_RUNTIME_V2_DEV_PREVIEW_HUB', requested: e.MAK_RUNTIME_V2_DEV_PREVIEW_HUB === 'true' },
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
    'dev-only hardening — a passive checklist/score inside the runtime v2 dev preview, never the real screen',
    'read-only — never saves/edits/deletes real data',
    'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
    'never replaces the real Empresas screen; never in the main menu',
    'never becomes the source of truth',
    'reversible by feature flag off',
  ];
}

function evidenceLinks() {
  return [
    'docs/evidence/post-foundation-c-empresas-read-ui-parity-hardening/PARITY-HARDENING-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-read-ui-parity-hardening/PARITY-CHECKLIST.md',
    'docs/evidence/post-foundation-c-empresas-read-ui-parity-hardening/ROLLBACK-VALIDATION.md',
  ];
}
