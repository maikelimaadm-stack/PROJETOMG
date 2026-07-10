import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createMigrationReadinessModel } from './createMigrationReadinessModel.js';
import { createMigrationRiskModel } from './migrationRiskModel.js';
import { createMigrationRollbackPlan } from './migrationRollbackPlan.js';
import { MigrationPlanningError } from './errors.js';

/** @param {string} code @param {string} message */
function planError(code, message) {
  return new MigrationPlanningError(/** @type {any} */ (code), message);
}

/**
 * The fixed, deterministic phase ladder for migrating the FIRST real module.
 * This slice executes NONE of these phases — it only describes them. Phases 0–3
 * are reversible read/preview stages; phases 4–5 (real write, full cutover) are
 * explicitly out of scope here.
 * @returns {import('../../types/migration-planning.js').MigrationPhase[]}
 */
function buildPhases() {
  return [
    {
      id: 'phase-0',
      name: 'Current State',
      inScope: true,
      executedThisSlice: false,
      goals: [
        'legacy runtime controls the real screen',
        'runtime v2 observes via shadow',
        'dev-only preview available',
        'controlled dataset available',
        'dev-only route available',
        'no real data used',
      ],
      writes: false,
      reversible: true,
    },
    {
      id: 'phase-1',
      name: 'Read-only Runtime v2 Candidate',
      inScope: false,
      executedThisSlice: false,
      likelyNextSlice: true,
      goals: [
        'runtime v2 can produce a read-only structure',
        'no save/edit/delete',
        'no replacement of the real UI',
        'comparison against legacy',
        'feature flag off by default',
      ],
      writes: false,
      reversible: true,
    },
    {
      id: 'phase-2',
      name: 'Dual Read / Shadow Compare',
      inScope: false,
      executedThisSlice: false,
      goals: [
        'legacy remains the source of truth',
        'runtime v2 reads controlled/adapted structure/data',
        'compare outputs',
        'no write',
      ],
      writes: false,
      reversible: true,
    },
    {
      id: 'phase-3',
      name: 'Guarded UI Slice',
      inScope: false,
      executedThisSlice: false,
      goals: [
        'a small controlled visual part is driven by runtime v2',
        'still reversible',
        'per-module flag',
      ],
      writes: false,
      reversible: true,
    },
    {
      id: 'phase-4',
      name: 'Controlled Write Candidate',
      inScope: false,
      executedThisSlice: false,
      outOfScope: true,
      goals: [
        'only after gates and rollback are proven',
        'out of current scope',
      ],
      writes: true,
      reversible: true,
    },
    {
      id: 'phase-5',
      name: 'Full Cutover Candidate',
      inScope: false,
      executedThisSlice: false,
      outOfScope: true,
      goals: [
        'out of current scope',
      ],
      writes: true,
      reversible: false,
    },
  ];
}

/**
 * Builds the deterministic, plain FIRST-MODULE MIGRATION PLAN: readiness model,
 * phase ladder (0–5), risk model, rollback plan, next-slice recommendation, and
 * an explicit out-of-scope declaration. It migrates nothing, reads no real
 * data, and touches no backend. Prototype pollution is blocked; the result is a
 * safe deep copy.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.moduleName]
 * @param {Partial<import('../../types/migration-planning.js').MigrationReadinessSignals>} [options.signals]
 * @returns {import('../../types/migration-planning.js').FirstModuleMigrationPlan}
 */
export function createFirstModuleMigrationPlan(options = {}) {
  validateProjectionInput(options, 0, 'First module migration plan options', planError);
  if (!isPlainObject(options)) {
    throw planError('MAK-L3-MIGRATION-PLAN-002', 'createFirstModuleMigrationPlan() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' && options.moduleId.trim() ? options.moduleId.trim() : 'empresas';
  const moduleName = typeof options.moduleName === 'string' && options.moduleName.trim() ? options.moduleName.trim() : 'Empresas';

  const readiness = createMigrationReadinessModel({ moduleId, moduleName, signals: options.signals });
  const risks = createMigrationRiskModel({ moduleId });
  const rollback = createMigrationRollbackPlan({ moduleId });
  const phases = buildPhases();

  const canAdvance = readiness.blockers.length === 0
    && readiness.rollbackAvailable === true
    && readiness.readinessStatus === 'read_only_candidate';

  const nextSlice = {
    recommended: 'Post-Foundation C — Empresas Read-Only Runtime v2 Candidate',
    allowed: canAdvance,
    onlyIf: [
      'route activation PASS',
      'preview hub PASS',
      'controlled dataset PASS',
      'Empresas shadow PASS',
      'Empresas table/form shadow PASS',
      'readiness status >= read_only_candidate',
      'rollback available',
      'no critical blockers',
    ],
    stillNotAllowed: [
      'save real data',
      'edit real data',
      'delete real data',
      'replace the whole real screen',
      'remove the legacy runtime',
      'change the backend',
      'change Prisma',
    ],
  };

  const model = {
    kind: 'first-module-migration-plan',
    moduleId,
    moduleName,
    generatedBy: 'runtime-v2 migration planning (post-Foundation C)',
    migratesThisSlice: false,
    legacyRemainsSourceOfTruth: true,
    realWriteInScope: false,
    currentState: phases[0],
    phases,
    readiness,
    risks,
    rollback,
    nextSlice,
    outOfScope: [
      'migrating the real Empresas screen',
      'using real data',
      'real writes/edits/deletes',
      'removing the legacy runtime',
      'backend/Prisma changes',
      'Studio/Marketplace changes',
      'starting Foundation D/E',
    ],
  };
  return /** @type {import('../../types/migration-planning.js').FirstModuleMigrationPlan} */ (safeClone(model));
}

export { buildPhases };
