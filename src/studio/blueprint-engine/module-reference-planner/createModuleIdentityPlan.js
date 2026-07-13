import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

const ID_RE = /^[a-zA-Z][a-zA-Z0-9_]*$/;

/**
 * Plans the module IDENTITY from a normalized blueprint. Pure. Nothing is registered,
 * no directory in `src/modules` is created. Empresas as source is treated as
 * `referenceOnly` (existing lab); any new moduleId is `plannedOnly`.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @param {string} [options.sourceBlueprintId]
 * @param {string} [options.sourceBlueprintVersion]
 * @param {string} [options.sourceEngineManifest] engine overallDigest
 * @param {string} [options.sourceReadiness]
 * @returns {Object} identity plan
 */
export function createModuleIdentityPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};

  const rawId = String(b.moduleId ?? 'plannedModule').trim();
  const moduleId = ID_RE.test(rawId) ? rawId : 'plannedModule';
  const isEmpresas = moduleId === 'empresas';

  const core = {
    kind: 'module-identity-plan',
    moduleId,
    moduleIdSafe: ID_RE.test(rawId),
    displayName: String(b.moduleName ?? moduleId).trim(),
    modelType: String(b.modelType ?? 'cadastro').trim(),
    modelFamily: String(b.modelFamily ?? 'ModeloBase1').trim(),
    sourceBlueprintId: typeof o.sourceBlueprintId === 'string' ? o.sourceBlueprintId : `${moduleId}#normalized`,
    sourceBlueprintVersion: typeof o.sourceBlueprintVersion === 'string' ? o.sourceBlueprintVersion : 'studio-blueprint-engine@1.0.0',
    sourceEngineManifest: typeof o.sourceEngineManifest === 'string' ? o.sourceEngineManifest : null,
    sourceReadiness: typeof o.sourceReadiness === 'string' ? o.sourceReadiness : 'blueprint_engine_foundation_ready',
    namespacePlan: { plannedNamespace: `src/modules/${moduleId}`, createdNow: false, plannedOnly: true },
    ownershipPlan: { owner: 'studio', team: 'planned', createdNow: false },
    versionPlan: { initialVersion: `${moduleId}@0.1.0-plan`, policy: 'semver', bumpedNow: false },
    statusPlan: isEmpresas ? 'referenceOnly_lab' : 'plannedOnly',
    registeredNow: false,
    directoryCreatedNow: false,
    routeCreatedNow: false,
    menuCreatedNow: false,
  };

  return safeCloneGenericModel({ ...core, identityPlanDigest: plannerDigest(core) });
}

export default createModuleIdentityPlan;
