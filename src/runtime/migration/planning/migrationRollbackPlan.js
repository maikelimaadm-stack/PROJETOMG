import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { MigrationPlanningError } from './errors.js';

/** @param {string} code @param {string} message */
function planError(code, message) {
  return new MigrationPlanningError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic migration ROLLBACK PLAN. The rollback strategy is
 * intentionally trivial-by-design: every planned phase is reversible by a
 * single feature flag, with the legacy runtime always remaining the source of
 * truth and no destructive or schema change to undo. This function executes
 * nothing — it only describes the reversal contract as plain data.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.featureFlag]
 * @returns {import('../../types/migration-planning.js').MigrationRollbackPlan}
 */
export function createMigrationRollbackPlan(options = {}) {
  validateProjectionInput(options, 0, 'Migration rollback options', planError);
  if (!isPlainObject(options)) {
    throw planError('MAK-L3-MIGRATION-PLAN-002', 'createMigrationRollbackPlan() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' && options.moduleId.trim() ? options.moduleId.trim() : 'empresas';
  const featureFlag = typeof options.featureFlag === 'string' && options.featureFlag.trim()
    ? options.featureFlag.trim()
    : 'MAK_RUNTIME_V2_EMPRESAS_READONLY';

  const model = {
    kind: 'migration-rollback-plan',
    moduleId,
    strategy: 'flag-off reversal — legacy runtime remains the primary source of truth; no destructive change to undo',
    featureFlag,
    featureFlagDefault: 'off',
    guarantees: [
      'feature flag off by default',
      'legacy runtime remains the primary source of truth',
      'no destructive migration',
      'no schema change',
      'no real write performed by runtime v2',
      'reversal is a single PR (flag/branch revert)',
      'fallback to the legacy screen is always available',
      'diagnostics/logs retained for post-mortem analysis',
    ],
    fallback: {
      target: 'legacy Empresas screen',
      mechanism: 'feature flag off restores legacy rendering with no residual runtime v2 state',
      dataSource: 'legacy runtime (unchanged)',
    },
    criteria: [
      'critical data divergence between legacy and runtime v2',
      'permission error',
      'validation error',
      'critical visual error',
      'performance failure',
      'build/lint/test failure',
      'any protecting gate fails',
    ],
    validation: {
      commands: [
        'npm run test:runtime:migration:first-module',
        'npm run gate:g423-migration-first-module',
        'npm run gate:g423',
        'npm run test:runtime',
        'npm run lint',
        'npm run build',
      ],
      note: 'Reversal is validated by re-running the module gates with the flag off; a green suite with legacy rendering confirms a clean rollback.',
    },
    residualRisks: [
      'a preview left enabled in a non-prod environment (mitigated: dev-only + fail-closed in production)',
      'stale diagnostics accumulating in dev logs (mitigated: bounded, non-sensitive, dev-only)',
    ],
    destructive: false,
    schemaChange: false,
    realWrite: false,
  };
  return /** @type {import('../../types/migration-planning.js').MigrationRollbackPlan} */ (safeClone(model));
}
