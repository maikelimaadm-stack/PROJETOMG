import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds PERSISTENCE "blocked" preview metadata. Pure. Every real persistence capability
 * is off: no schema, no migration, no backend, no Prisma, no mutation, no production, no
 * staging. Real persistence is blocked; Empresas as source is always referenceOnly.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} persistence blocked preview metadata
 */
export function createModulePreviewPersistenceBlockedMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const pp = isGenericModelPlainObject(plan.persistencePlan) ? plan.persistencePlan : {};
  const states = Array.isArray(pp.states) ? pp.states : [];

  const core = {
    kind: 'module-preview-persistence-blocked-metadata',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    persistencePlan: 'module-reference-plan.persistencePlan',
    currentBoundary: typeof pp.currentBoundary === 'string' ? pp.currentBoundary : 'noPersistence',
    previewBoundary: 'noPersistence',
    schemaAllowedNow: false,
    migrationAllowedNow: false,
    backendAllowedNow: false,
    prismaAllowedNow: false,
    mutationAllowedNow: false,
    productionAllowedNow: false,
    stagingAllowedNow: false,
    persistenceCreated: false,
    blockedNow: true,
    blockedReason: 'real persistence deferred to a dedicated persistence/backend slice',
    futureStates: states.filter((s) => s && s.allowedNow !== true).map((s) => s.state),
    futureSlice: 'STUDIO MODULE PERSISTENCE READINESS / BACKEND SLICE',
    sourceEmpresasReferenceOnly: true,
    realDataUsedAsFixture: false,
    previewOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, persistenceBlockedDigest: sandboxDigest(core) });
}

export default createModulePreviewPersistenceBlockedMetadata;
