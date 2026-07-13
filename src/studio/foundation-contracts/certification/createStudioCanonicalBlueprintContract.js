import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioBlueprintContract, STUDIO_BLUEPRINT_STATES } from '../createStudioBlueprintContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical blueprint envelope + lifecycle states from the foundation.
 * Pure. No state registers a module or authorizes production by itself.
 *
 * @param {Object} [options]
 * @returns {Object} canonical blueprint contract
 */
export function createStudioCanonicalBlueprintContract(options = {}) {
  void options;
  const base = createStudioBlueprintContract();

  const envelope = [
    'blueprintId', 'blueprintVersion', 'blueprintType', 'status', 'owner', 'modelFamily', 'modelType',
    'module', 'fields', 'screens', 'validations', 'permissions', 'routeMenu', 'persistenceBoundary',
    'runtimeBinding', 'diagnostics', 'gates', 'compatibility', 'publicationPolicy', 'safetyPolicy',
  ];

  const stateRules = {
    draft: { registersModule: false, production: false, note: 'draft cannot register a module' },
    validated: { registersModule: false, production: false, note: 'validated cannot go to production alone' },
    previewable: { registersModule: false, production: false, note: 'previewable stays dev/beta/sandbox only' },
    certified_local: { registersModule: false, production: false, note: 'certified_local is NOT production' },
    ready_for_staging: { registersModule: false, production: false, note: 'ready_for_staging does not access staging automatically' },
    blocked: { registersModule: false, production: false, note: 'blocked fails closed' },
    deprecated: { registersModule: false, production: false, note: 'deprecated cannot generate a new module' },
  };

  const body = {
    kind: 'studio-canonical-blueprint-contract',
    envelope,
    states: [...STUDIO_BLUEPRINT_STATES],
    stateRules,
    anyStateRegistersModule: false,
    anyStateAllowsProduction: false,
    failClosed: true,
    baseFailClosed: base.failClosed === true,
  };
  return safeCloneGenericModel({ ...body, canonicalBlueprintContractDigest: certificationDigest({ envelope, states: body.states, stateRules }) });
}

export default createStudioCanonicalBlueprintContract;
