import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasReadOnlyRuntimeCandidate } from '../empresas-readonly/createEmpresasReadOnlyRuntimeCandidate.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { createEmpresasDualReadShadowCompare } from '../empresas-dual-read/createEmpresasDualReadShadowCompare.js';
import { createEmpresasMigrationPlan } from '../planning/createEmpresasMigrationPlan.js';
import { createEmpresasGuardedReadUiDiagnostics } from './empresasGuardedReadUiDiagnostics.js';
import { EmpresasGuardedReadUiError } from './errors.js';
import {
  isEmpresasGuardedReadUiEnabled,
  isEmpresasGuardedReadUiProductionBlocked,
  composeGuardedReadUiEnv,
  EMPRESAS_GUARDED_READ_UI_FLAG,
} from './empresasGuardedReadUiConfig.js';

const MODULE_ID = 'empresas';
const NEXT_OK = 'Post-Foundation C — Empresas Guarded Read UI Overlay';
const NEXT_DRIFT = 'Post-Foundation C — Empresas Guarded Read UI Drift Resolution';

/** @param {string} code @param {string} message */
function uiError(code, message) {
  return new EmpresasGuardedReadUiError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas GUARDED READ UI MODEL — the plain, deterministic model
 * that drives the dev-only, read-only Empresas UI slice. Off by default; a safe,
 * side-effect-free skipped result when the flag is off; fail-closed in
 * production. When enabled it composes the read-only candidate (view model) and
 * the dual-read compare (parity/differences), keeps the write guard active, and
 * recommends the next step. It NEVER writes, never touches real data or the
 * backend, never replaces the real Empresas screen. Prototype pollution is
 * blocked; the plain result is a safe deep copy (the live write guard is
 * re-attached after cloning).
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../types/empresas-guarded-read-ui-slice.js').EmpresasGuardedReadUiModel>}
 */
export async function createEmpresasGuardedReadUiModel(options = {}) {
  validateProjectionInput(options, 0, 'Empresas guarded read UI options', uiError);
  if (!isPlainObject(options)) {
    throw uiError('MAK-L3-EMP-GUARDED-UI-003', 'createEmpresasGuardedReadUiModel() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasGuardedReadUiEnabled(env);
  const productionBlocked = isEmpresasGuardedReadUiProductionBlocked(env);
  const rollback = createEmpresasMigrationPlan().rollback;

  // FLAG OFF (or production-blocked) → skipped, no view model, no side effects.
  if (!enabled) {
    const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
    const diagnostics = createEmpresasGuardedReadUiDiagnostics({ env });
    const skipped = {
      kind: 'empresas-guarded-read-ui-model',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'guarded_read_ui_slice',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      currentRuntime: 'legacy',
      targetRuntime: 'runtime-v2',
      readOnlyCandidate: null,
      dualReadCompare: null,
      parityStatus: 'skipped',
      viewModel: null,
      table: null,
      form: null,
      diagnostics,
      differences: [],
      writeBlocked: true,
      blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
      rollback,
      nextAllowedStep: NEXT_OK,
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_GUARDED_READ_UI_FLAG} off — guarded read UI skipped`],
      limitations: limitations(),
      evidence: evidenceLinks(),
    };
    return finalize(skipped, writeGuard);
  }

  // FLAG ON → compose the underlying read-only candidate + dual-read compare.
  const readEnv = composeGuardedReadUiEnv(env);
  const writeGuard = createEmpresasReadOnlyWriteGuard({ env: readEnv });
  const candidate = await createEmpresasReadOnlyRuntimeCandidate({ env: readEnv, descriptor: options.descriptor });
  const compare = await createEmpresasDualReadShadowCompare({ env: readEnv, descriptor: options.descriptor });
  const viewModel = candidate.viewModel;
  const parityStatus = compare.summary.parityStatus;
  const blocked = parityStatus === 'blocked';
  const nextAllowedStep = blocked ? NEXT_DRIFT : NEXT_OK;

  const diagnostics = createEmpresasGuardedReadUiDiagnostics({
    env,
    viewModel,
    summary: compare.summary,
    writeGuardActive: true,
  });

  const model = {
    kind: 'empresas-guarded-read-ui-model',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'guarded_read_ui_slice',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: viewModel ? viewModel.source : 'structural-only',
    currentRuntime: 'legacy',
    targetRuntime: 'runtime-v2',
    readOnlyCandidate: {
      enabled: candidate.enabled,
      mode: candidate.mode,
      source: candidate.source,
      readinessStatus: candidate.readinessStatus,
    },
    dualReadCompare: {
      mode: compare.mode,
      parityStatus,
      summary: compare.summary,
    },
    parityStatus,
    viewModel,
    table: viewModel ? viewModel.table : null,
    form: viewModel ? viewModel.form : null,
    diagnostics,
    differences: compare.differences,
    writeBlocked: true,
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    rollback,
    nextAllowedStep,
    warnings: blocked ? ['blocking/critical differences present — drift resolution required before overlay'] : [],
    limitations: limitations(),
    evidence: evidenceLinks(),
  };
  return finalize(model, writeGuard);
}

/**
 * Deep-copies the plain UI model and re-attaches the live write guard, whose
 * `attempt()` function would be dropped by JSON clone.
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
    'read-only UI — never saves/edits/deletes real data',
    'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
    'dev-only — never mounted in the real Empresas screen or the main menu',
    'never replaces the real Empresas screen',
    'never becomes the source of truth',
    'reversible by feature flag off',
  ];
}

function evidenceLinks() {
  return [
    'docs/evidence/post-foundation-c-empresas-guarded-read-ui-slice/GUARDED-READ-UI-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-guarded-read-ui-slice/WRITE-BLOCKED-UI-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-guarded-read-ui-slice/ROLLBACK-VALIDATION.md',
  ];
}
