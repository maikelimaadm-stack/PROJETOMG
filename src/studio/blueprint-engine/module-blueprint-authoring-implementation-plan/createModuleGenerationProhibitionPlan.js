import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Module-generation prohibition PLAN — declares module generation permanently prohibited: no module
 * generated, no file written to a module, no module registered, no src/modules touch, no production
 * registry touch. Metadata only.
 * @returns {Object}
 */
export function createModuleGenerationProhibitionPlan() {
  const core = {
    kind: 'authoring-module-generation-prohibition-plan',
    moduleGenerationProhibitionActive: true,
    moduleGenerated: false,
    filesWrittenToModule: false,
    moduleRegistered: false,
    srcModulesTouchAllowed: false,
    productionRegistryTouchAllowed: false,
  };
  return safeCloneGenericModel({ ...core, moduleGenerationProhibitionPlanDigest: authoringPlanDigest(core) });
}

export default createModuleGenerationProhibitionPlan;
