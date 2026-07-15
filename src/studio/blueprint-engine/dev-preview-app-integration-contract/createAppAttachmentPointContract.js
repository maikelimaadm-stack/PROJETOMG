import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * App attachment point contract — metadata describing WHERE and HOW a future controlled integration
 * would attach the isolated dev-preview host to the real App. It creates NO attachment and touches
 * NO App. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @returns {Object}
 */
export function createAppAttachmentPointContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const r = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : {};
  const moduleId = String(r.moduleId ?? 'plannedModule');

  const core = {
    kind: 'app-integration-attachment-point-contract',
    attachmentPointId: `${moduleId}#dev-preview-isolated-host`,
    futureAppLocation: 'dev_only_isolated_host_outside_main_app',
    futureIntegrationKind: 'explicit_dependency_injected_dev_preview_host',
    futureOwner: 'studio_dev_preview',
    appTouched: false,
    attachmentCreated: false,
    integrationPerformed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, attachmentPointDigest: appIntegrationDigest(core) });
}

export default createAppAttachmentPointContract;
