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
 * The minimum, deterministic risk register for migrating a real module to
 * runtime v2. Each risk carries a mitigation, the gate that protects against
 * it, and a rollback note. This is documentation-as-data: it executes nothing.
 * @type {import('../../types/migration-planning.js').MigrationRisk[]}
 */
const BASE_RISKS = [
  {
    id: 'RISK-01',
    severity: 'high',
    description: 'Divergence between the legacy Empresas screen and runtime v2 output.',
    mitigation: 'Shadow compare + preview hub differences; runtime v2 stays read-only until parity is proven.',
    gate: 'gate:g423-shadow-empresas-table-form',
    rollbackNote: 'Feature flag off — legacy screen is the only rendered UI.',
  },
  {
    id: 'RISK-02',
    severity: 'high',
    description: 'Validation rules differ between legacy and runtime v2.',
    mitigation: 'Validation projection compared in the table/form shadow; no writes while diverging.',
    gate: 'gate:g423-shadow-empresas',
    rollbackNote: 'No runtime v2 validation is authoritative; legacy validation remains in force.',
  },
  {
    id: 'RISK-03',
    severity: 'high',
    description: 'Permission resolution differs, exposing or hiding fields incorrectly.',
    mitigation: 'Permission metadata is projected passively and diffed; denied fields surfaced in previews.',
    gate: 'gate:g423-shadow-empresas-table-form',
    rollbackNote: 'Legacy permission gate remains authoritative under rollback.',
  },
  {
    id: 'RISK-04',
    severity: 'high',
    description: 'An action/workflow/connector executes out of turn during preview.',
    mitigation: 'Previews carry actions/workflows as text metadata only; no execution path exists.',
    gate: 'gate:g423-preview-route-activation',
    rollbackNote: 'Nothing is executed; flag off removes the route entirely.',
  },
  {
    id: 'RISK-05',
    severity: 'medium',
    description: 'Visual regression in the migrated slice.',
    mitigation: 'Guarded UI slice is dev-only and flag-gated; parity checked against legacy before any exposure.',
    gate: 'gate:g423-preview-route',
    rollbackNote: 'Flag off restores the legacy visual exactly.',
  },
  {
    id: 'RISK-06',
    severity: 'medium',
    description: 'Performance degradation once real data volume is involved.',
    mitigation: 'Read-only phase uses controlled datasets; real-data performance is a later, separate gate.',
    gate: 'gate:g423-preview-dataset',
    rollbackNote: 'No real-data path is enabled in the planned phases; flag off reverts.',
  },
  {
    id: 'RISK-07',
    severity: 'high',
    description: 'Rollback inconsistency — a half-migrated state cannot be reverted cleanly.',
    mitigation: 'Every phase is reversible by a single feature flag; no destructive/schema change is planned.',
    gate: 'gate:g423-migration-first-module',
    rollbackNote: 'Rollback = flag off; no data or schema mutation to undo.',
  },
  {
    id: 'RISK-08',
    severity: 'medium',
    description: 'Old user preferences break under runtime v2.',
    mitigation: 'Preferences bootstrap remains legacy-owned; runtime v2 does not write preferences in planned phases.',
    gate: 'gate:g423',
    rollbackNote: 'Legacy preferences path is untouched and remains active.',
  },
  {
    id: 'RISK-09',
    severity: 'high',
    description: 'Hidden dependency on the legacy runtime is missed during migration.',
    mitigation: 'Readiness model requires legacy-as-source-of-truth; dependencies surfaced before any cutover.',
    gate: 'gate:g423-migration-first-module',
    rollbackNote: 'Legacy runtime is never removed in these phases; fallback is always available.',
  },
  {
    id: 'RISK-10',
    severity: 'medium',
    description: 'Coupling to a specific screen makes the generic runtime path brittle.',
    mitigation: 'Generic module shadow pipeline (Empresas + cadcps) proves the path is module-agnostic.',
    gate: 'gate:g423-second-module-shadow',
    rollbackNote: 'Flag off per module; each module reverts independently to legacy.',
  },
];

/**
 * Builds the deterministic migration RISK MODEL. Callers may append extra risks
 * via `options.extraRisks` (validated, non-destructive). The output is a safe
 * deep copy — mutating it never reaches internal state.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {import('../../types/migration-planning.js').MigrationRisk[]} [options.extraRisks]
 * @returns {import('../../types/migration-planning.js').MigrationRiskModel}
 */
export function createMigrationRiskModel(options = {}) {
  validateProjectionInput(options, 0, 'Migration risk options', planError);
  if (!isPlainObject(options)) {
    throw planError('MAK-L3-MIGRATION-PLAN-002', 'createMigrationRiskModel() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' && options.moduleId.trim() ? options.moduleId.trim() : 'empresas';

  const risks = [...BASE_RISKS];
  for (const r of Array.isArray(options.extraRisks) ? options.extraRisks : []) {
    if (isPlainObject(r) && typeof r.id === 'string' && typeof r.description === 'string') {
      risks.push({
        id: r.id,
        severity: typeof r.severity === 'string' ? r.severity : 'medium',
        description: r.description,
        mitigation: typeof r.mitigation === 'string' ? r.mitigation : 'documented; no execution path',
        gate: typeof r.gate === 'string' ? r.gate : 'gate:g423-migration-first-module',
        rollbackNote: typeof r.rollbackNote === 'string' ? r.rollbackNote : 'reversible by feature flag',
      });
    }
  }

  const model = {
    kind: 'migration-risk-model',
    moduleId,
    risks,
    summary: {
      total: risks.length,
      high: risks.filter((r) => r.severity === 'high').length,
      medium: risks.filter((r) => r.severity === 'medium').length,
      low: risks.filter((r) => r.severity === 'low').length,
    },
  };
  return /** @type {import('../../types/migration-planning.js').MigrationRiskModel} */ (safeClone(model));
}

export { BASE_RISKS };
