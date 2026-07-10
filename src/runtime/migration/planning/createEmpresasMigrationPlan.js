import { createFirstModuleMigrationPlan } from './createFirstModuleMigrationPlan.js';

/**
 * The first real module targeted for a controlled migration. Empresas is chosen
 * because it is the module with the most mature runtime v2 evidence already on
 * main: shadow pilot, table/form shadow projection, controlled preview, dev
 * preview hub, controlled dataset, and the dev-only preview route — all passing.
 * That evidence is exactly what a read-only candidate needs, so Empresas is the
 * lowest-risk first mover.
 *
 * This is a thin, named specialization of `createFirstModuleMigrationPlan` for
 * Empresas. It migrates nothing — it returns the deterministic plan/readiness/
 * risk/rollback model for Empresas.
 *
 * @param {Object} [options]
 * @param {Partial<import('../../types/migration-planning.js').MigrationReadinessSignals>} [options.signals]
 * @returns {import('../../types/migration-planning.js').FirstModuleMigrationPlan}
 */
export function createEmpresasMigrationPlan(options = {}) {
  const opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
  return createFirstModuleMigrationPlan({
    moduleId: 'empresas',
    moduleName: 'Empresas',
    signals: opts.signals,
  });
}
