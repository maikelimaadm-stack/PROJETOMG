import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ALLOWED_COMPONENT_KINDS, BLOCKED_COMPONENT_KINDS, bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Declares the ALLOWED component contract for the dev preview. Pure, metadata-only. It only
 * enumerates which placeholder component kinds a downstream visual slice MAY reference, and
 * which kinds are permanently BLOCKED (react-component, jsx, tsx, router, route, menu, nav,
 * iframe, script, fetch-widget, mutation-button, real-input, live-datagrid). It creates NO
 * component of any kind.
 *
 * @param {Object} [options]
 * @returns {Object} allowed component contract
 */
export function createDevPreviewAllowedComponentContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'dev-preview-allowed-component-contract',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    allowedComponentKinds: [...ALLOWED_COMPONENT_KINDS],
    blockedComponentKinds: [...BLOCKED_COMPONENT_KINDS],
    allowedCount: ALLOWED_COMPONENT_KINDS.length,
    blockedCount: BLOCKED_COMPONENT_KINDS.length,
    placeholderOnly: true,
    realComponentCreated: false,
    reactComponentCreated: false,
    jsxCreated: false,
    tsxCreated: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, allowedComponentDigest: bridgeDigest(core) });
}

export default createDevPreviewAllowedComponentContract;
