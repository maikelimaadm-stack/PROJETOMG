import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { MigrationPlanningError } from './errors.js';

/**
 * Ordered readiness ladder. A module climbs it slice by slice; this planning
 * slice may never place a module above `read_only_candidate`.
 * @type {import('../../types/migration-planning.js').MigrationReadinessStatus[]}
 */
export const READINESS_STATUSES = [
  'not_ready',
  'shadow_ready',
  'preview_ready',
  'read_only_candidate',
  'migration_candidate',
  'blocked',
];

/** The highest status this planning slice is allowed to assign (never `migrated`). */
export const MAX_READINESS_THIS_SLICE = 'read_only_candidate';

const RANK = {
  not_ready: 0,
  shadow_ready: 1,
  preview_ready: 2,
  read_only_candidate: 3,
  // migration_candidate / blocked are out of what this slice may assign.
};

/** @param {string} code @param {string} message */
function planError(code, message) {
  return new MigrationPlanningError(/** @type {any} */ (code), message);
}

/**
 * The canonical readiness signals for the first real module (Empresas). These
 * mirror what the shadow/preview/route slices already deliver — the planning
 * layer never re-runs them, it records their known state as passive metadata.
 * A caller may override any signal via `options.signals` (e.g. a future CI
 * probe handing over live gate results).
 * @type {import('../../types/migration-planning.js').MigrationReadinessSignals}
 */
const EMPRESAS_DEFAULT_SIGNALS = {
  shadowReady: true,
  tableFormShadowReady: true,
  controlledPreviewReady: true,
  previewHubReady: true,
  controlledDatasetReady: true,
  devPreviewRouteReady: true,
  routeActivationReady: true,
  legacyStillSourceOfTruth: true,
  usesRealData: false,
  writesRealData: false,
};

/**
 * Builds the deterministic, plain MIGRATION READINESS MODEL for a real module.
 * It answers "is this module ready for a controlled migration, and how far?"
 * using only passive signals — it never migrates, never reads real data, never
 * touches the backend. Prototype pollution in options is blocked, sensitive
 * keys are masked, and the result is an independent deep copy.
 *
 * For this planning slice a module can be at most `read_only_candidate`; the
 * model NEVER reports `migrated`.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.moduleName]
 * @param {Partial<import('../../types/migration-planning.js').MigrationReadinessSignals>} [options.signals]
 * @param {string[]} [options.extraBlockers]
 * @param {string[]} [options.extraWarnings]
 * @returns {import('../../types/migration-planning.js').MigrationReadinessModel}
 */
export function createMigrationReadinessModel(options = {}) {
  validateProjectionInput(options, 0, 'Migration readiness options', planError);
  if (!isPlainObject(options)) {
    throw planError('MAK-L3-MIGRATION-PLAN-002', 'createMigrationReadinessModel() options must be a plain object');
  }

  const moduleId = typeof options.moduleId === 'string' && options.moduleId.trim() ? options.moduleId.trim() : 'empresas';
  const moduleName = typeof options.moduleName === 'string' && options.moduleName.trim() ? options.moduleName.trim() : 'Empresas';
  const signals = { ...EMPRESAS_DEFAULT_SIGNALS, ...(isPlainObject(options.signals) ? options.signals : {}) };

  /** @type {string[]} */
  const blockers = [];
  /** @type {string[]} */
  const warnings = [];

  // Blockers — hard gates that keep a module at `not_ready`/`blocked`.
  if (!signals.shadowReady) blockers.push('shadow pipeline not passing');
  if (!signals.tableFormShadowReady) blockers.push('table/form shadow projection not passing');
  if (!signals.legacyStillSourceOfTruth) blockers.push('legacy runtime is no longer the source of truth — unsafe to plan a controlled migration');
  if (signals.writesRealData) blockers.push('runtime v2 must not write real data at the planning stage');
  for (const b of Array.isArray(options.extraBlockers) ? options.extraBlockers : []) {
    if (typeof b === 'string' && b.trim()) blockers.push(b.trim());
  }

  // Warnings — soft signals that gate escalation but do not block.
  if (!signals.controlledPreviewReady) warnings.push('controlled preview not confirmed');
  if (!signals.previewHubReady) warnings.push('dev preview hub not confirmed');
  if (!signals.controlledDatasetReady) warnings.push('controlled dev dataset not confirmed');
  if (!signals.devPreviewRouteReady) warnings.push('dev preview route not confirmed');
  if (!signals.routeActivationReady) warnings.push('dev preview route activation not confirmed');
  if (signals.usesRealData) warnings.push('planning must proceed on controlled/mock data only');
  for (const w of Array.isArray(options.extraWarnings) ? options.extraWarnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const status = resolveReadinessStatus(signals, blockers);

  const requiredGates = [
    'gate:g423-shadow-empresas',
    'gate:g423-shadow-empresas-table-form',
    'gate:g423-preview-empresas',
    'gate:g423-preview-hub',
    'gate:g423-preview-dataset',
    'gate:g423-preview-route',
    'gate:g423-preview-route-mount',
    'gate:g423-preview-route-activation',
    'gate:g423-migration-first-module',
    'gate:g423',
  ];
  const requiredTests = [
    'test:runtime:shadow:empresas',
    'test:runtime:shadow:empresas-table-form',
    'test:runtime:preview:empresas',
    'test:runtime:preview:hub',
    'test:runtime:preview:dataset',
    'test:runtime:preview:route',
    'test:runtime:preview:route-activation',
    'test:runtime:migration:first-module',
    'test:runtime',
  ];

  const reversible = blockers.length === 0 && !signals.writesRealData;
  const rollbackAvailable = reversible;
  const nextAllowedStep = blockers.length === 0 && RANK[status] >= RANK.read_only_candidate
    ? 'Post-Foundation C — Empresas Read-Only Runtime v2 Candidate'
    : 'resolve blockers before any migration step';

  const model = {
    kind: 'migration-readiness-model',
    moduleId,
    moduleName,
    targetRuntime: 'runtime-v2',
    currentRuntime: 'legacy',
    readinessStatus: status,
    maxStatusThisSlice: MAX_READINESS_THIS_SLICE,
    signals: redactSensitive(signals),
    blockers,
    warnings,
    risks: [
      'divergence between legacy screen and runtime v2 output',
      'validation/permission drift',
      'unexpected action/workflow execution',
      'rollback inconsistency',
    ],
    requiredGates,
    requiredTests,
    reversible,
    rollbackAvailable,
    nextAllowedStep,
    notAllowedYet: [
      'migrate the real Empresas screen',
      'read real data',
      'write/edit/delete real data',
      'remove the legacy runtime',
      'change backend or Prisma',
      'touch Studio or Marketplace',
    ],
    evidenceLinks: [
      'docs/evidence/post-foundation-c-first-module-migration-planning/EMPRESAS-MIGRATION-PLAN.md',
      'docs/evidence/post-foundation-c-first-module-migration-planning/ROLLBACK-PLAN.md',
      'docs/evidence/post-foundation-c-first-module-migration-planning/READINESS-CHECKLIST.md',
    ],
  };
  return /** @type {import('../../types/migration-planning.js').MigrationReadinessModel} */ (safeClone(model));
}

/**
 * Deterministic status resolution, capped at `read_only_candidate` for this
 * slice. Any blocker forces `blocked`. Never returns `migration_candidate` or
 * `migrated` from this planning slice.
 * @param {import('../../types/migration-planning.js').MigrationReadinessSignals} signals
 * @param {string[]} blockers
 * @returns {import('../../types/migration-planning.js').MigrationReadinessStatus}
 */
export function resolveReadinessStatus(signals, blockers) {
  if (blockers.length > 0) return 'blocked';
  const previewChain = signals.controlledPreviewReady && signals.previewHubReady
    && signals.controlledDatasetReady && signals.devPreviewRouteReady && signals.routeActivationReady;
  if (signals.shadowReady && signals.tableFormShadowReady && previewChain && !signals.writesRealData) {
    return 'read_only_candidate';
  }
  if (signals.shadowReady && signals.tableFormShadowReady && (signals.controlledPreviewReady || signals.previewHubReady)) {
    return 'preview_ready';
  }
  if (signals.shadowReady && signals.tableFormShadowReady) return 'shadow_ready';
  return 'not_ready';
}
