import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/** Blueprint lifecycle states + what each does NOT authorize. */
export const STUDIO_BLUEPRINT_STATES = ['draft', 'validated', 'previewable', 'certified_local', 'ready_for_staging', 'blocked', 'deprecated'];

const STATE_RULES = {
  draft: { registersModule: false, production: false, note: 'draft cannot register a module' },
  validated: { registersModule: false, production: false, note: 'validated cannot go to production alone' },
  previewable: { registersModule: false, production: false, note: 'previewable stays dev/beta only' },
  certified_local: { registersModule: false, production: false, note: 'certified_local is NOT production' },
  ready_for_staging: { registersModule: false, production: false, note: 'ready_for_staging does not access staging automatically' },
  blocked: { registersModule: false, production: false, note: 'blocked fails closed' },
  deprecated: { registersModule: false, production: false, note: 'deprecated cannot generate a new module' },
};

/**
 * The general blueprint envelope contract. Pure. Declares the shape + lifecycle
 * states without registering anything.
 *
 * @param {Object} [options]
 * @returns {Object} blueprint contract descriptor
 */
export function createStudioBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const body = {
    kind: 'studio-blueprint-contract',
    envelope: [
      'blueprintId', 'blueprintVersion', 'blueprintType', 'status', 'owner', 'modelFamily', 'modelType',
      'module', 'fields', 'screens', 'validations', 'permissions', 'routeMenu', 'persistenceBoundary',
      'runtimeBinding', 'diagnostics', 'gates', 'compatibility', 'publicationPolicy',
    ],
    states: [...STUDIO_BLUEPRINT_STATES],
    stateRules: STATE_RULES,
    // No blueprint state ever registers a module or authorizes production by itself.
    anyStateRegistersModule: false,
    anyStateAllowsProduction: false,
    failClosed: true,
  };
  return safeCloneGenericModel({ ...body, blueprintDigest: createStudioContractDigest({ value: { envelope: body.envelope, states: body.states } }) });
}

export default createStudioBlueprintContract;
