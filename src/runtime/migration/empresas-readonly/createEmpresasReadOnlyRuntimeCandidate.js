import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasMigrationPlan } from '../planning/createEmpresasMigrationPlan.js';
import { createEmpresasReadOnlyViewModel } from './createEmpresasReadOnlyViewModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from './empresasReadOnlyWriteGuard.js';
import { createEmpresasReadOnlyDiagnostics } from './empresasReadOnlyDiagnostics.js';
import { EmpresasReadOnlyError } from './errors.js';
import {
  isEmpresasReadOnlyEnabled,
  isEmpresasReadOnlyProductionBlocked,
  EMPRESAS_READONLY_FLAG,
} from './empresasReadOnlyConfig.js';

const MODULE_ID = 'empresas';

/** @param {string} code @param {string} message */
function candidateError(code, message) {
  return new EmpresasReadOnlyError(/** @type {any} */ (code), message);
}

/**
 * Builds the Empresas READ-ONLY RUNTIME V2 CANDIDATE — the first real read
 * candidate of runtime v2 for Empresas. Off by default; a safe, side-effect-free
 * skipped result when the flag is off; fail-closed in production. When enabled
 * (dev + flag), it produces a deterministic read-only view model (reusing the
 * existing table/form projection + controlled dataset), a write guard that
 * blocks every write-shaped operation, structured diagnostics, and a rollback
 * reference. It NEVER saves/edits/deletes, never touches real data or the
 * backend, never replaces the real screen, never becomes the source of truth.
 *
 * Prototype pollution in options is blocked; the result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env] Explicit env (dev harness/tests); defaults to import.meta.env/process.env.
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @param {boolean} [options.includeRows]
 * @returns {Promise<import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyRuntimeCandidate>}
 */
export async function createEmpresasReadOnlyRuntimeCandidate(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read-only candidate options', candidateError);
  if (!isPlainObject(options)) {
    throw candidateError('MAK-L3-EMP-READONLY-004', 'createEmpresasReadOnlyRuntimeCandidate() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasReadOnlyEnabled(env);
  const productionBlocked = isEmpresasReadOnlyProductionBlocked(env);

  const writeGuard = createEmpresasReadOnlyWriteGuard({ env });
  const plan = createEmpresasMigrationPlan();
  const rollback = plan.rollback;
  const nextAllowedStep = 'Post-Foundation C — Empresas Dual Read Shadow Compare';

  // FLAG OFF (or production-blocked) → skipped, no view model, no side effects.
  if (!enabled) {
    const diagnostics = createEmpresasReadOnlyDiagnostics({ env, viewModel: null });
    const skipped = {
      kind: 'empresas-readonly-runtime-candidate',
      moduleId: MODULE_ID,
      moduleName: 'Empresas',
      mode: 'read_only_candidate',
      enabled: false,
      skipped: true,
      noSideEffects: true,
      productionBlocked,
      source: 'skipped',
      targetRuntime: 'runtime-v2',
      currentRuntime: 'legacy',
      readinessStatus: 'read_only_candidate',
      viewModel: null,
      diagnostics,
      differences: [],
      writeGuard,
      blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
      rollback,
      nextAllowedStep,
      warnings: [productionBlocked ? 'production blocked — fails closed' : `flag ${EMPRESAS_READONLY_FLAG} off — candidate skipped`],
      limitations: readOnlyLimitations(),
      evidence: evidenceLinks(),
    };
    return finalize(skipped, writeGuard);
  }

  // FLAG ON → build the deterministic read-only view model.
  const viewModel = await createEmpresasReadOnlyViewModel({ descriptor: options.descriptor, includeRows: options.includeRows });
  const diagnostics = createEmpresasReadOnlyDiagnostics({ env, viewModel });

  const model = {
    kind: 'empresas-readonly-runtime-candidate',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    mode: 'read_only_candidate',
    enabled: true,
    skipped: false,
    noSideEffects: true,
    productionBlocked: false,
    source: viewModel.source,
    targetRuntime: 'runtime-v2',
    currentRuntime: 'legacy',
    readinessStatus: 'read_only_candidate',
    viewModel,
    diagnostics,
    differences: [],
    writeGuard,
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    rollback,
    nextAllowedStep,
    warnings: [],
    limitations: readOnlyLimitations(),
    evidence: evidenceLinks(),
  };
  return finalize(model, writeGuard);
}

/**
 * Deep-copies the plain candidate data (safe, mutation-proof) and re-attaches
 * the live write guard — whose `attempt()` function would otherwise be dropped
 * by JSON clone. The guard is freshly created per call and holds no mutable
 * state, so sharing its reference is safe and keeps the candidate deterministic.
 * @param {Record<string, unknown>} model
 * @param {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} writeGuard
 */
function finalize(model, writeGuard) {
  const cloned = /** @type {any} */ (safeClone(model));
  cloned.writeGuard = writeGuard;
  return cloned;
}

function readOnlyLimitations() {
  return [
    'read-only — never saves/edits/deletes real data',
    'mock/controlled data only — no real data, no backend, no Prisma/MMM',
    'never replaces the real Empresas screen',
    'never becomes the source of truth',
    'does not remove or alter the legacy runtime',
    'reversible by feature flag off',
  ];
}

function evidenceLinks() {
  return [
    'docs/evidence/post-foundation-c-empresas-readonly-runtime-v2-candidate/READONLY-CANDIDATE-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-readonly-runtime-v2-candidate/WRITE-GUARD-REPORT.md',
    'docs/evidence/post-foundation-c-empresas-readonly-runtime-v2-candidate/ROLLBACK-VALIDATION.md',
  ];
}
