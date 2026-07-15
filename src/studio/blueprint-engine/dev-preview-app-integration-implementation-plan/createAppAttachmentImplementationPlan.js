import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * App attachment implementation PLAN — metadata describing how a future slice would attach the
 * isolated host. It performs NO attachment and touches NO App. Pure and deterministic.
 * @param {Object} [options]
 * @param {Object} [options.appIntegrationContract]
 * @returns {Object}
 */
export function createAppAttachmentImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.appIntegrationContract) ? o.appIntegrationContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'app-integration-app-attachment-implementation-plan',
    attachmentPointId: `${moduleId}#dev-preview-isolated-host`,
    futureAppLocation: 'dev_only_isolated_host_outside_main_app',
    futureAttachmentKind: 'explicit_dependency_injected_dev_preview_host',
    attachmentImplemented: false,
    appTouched: false,
    integrationPerformed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, appAttachmentImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppAttachmentImplementationPlan;
