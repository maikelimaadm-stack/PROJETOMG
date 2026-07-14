import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Bridges the sandbox ACTION preview metadata into dev-preview action contracts. Pure,
 * metadata-only. Every action is DISABLED at the contract level; mutation actions are
 * marked but never enabled; no button component; nothing executes.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} action bridge schema
 */
export function createDevPreviewActionBridgeSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ap = isGenericModelPlainObject(o.sandbox?.actionPreviewMetadata) ? o.sandbox.actionPreviewMetadata : {};
  const actions = Array.isArray(ap.actions) ? ap.actions.filter(isGenericModelPlainObject) : [];

  const mapped = actions.map((a) => ({
    action: a.action ?? a.name,
    kind: a.mutation === true ? 'mutation' : 'read',
    mutation: a.mutation === true,
    enabled: false,
    requiresPermission: a.requiresPermission !== false,
    componentKind: 'button-placeholder',
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-action-bridge-schema',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    actions: mapped.length > 0 ? mapped : [
      { action: 'read', kind: 'read', mutation: false, enabled: false, requiresPermission: true, componentKind: 'button-placeholder', metadataOnly: true },
    ],
    anyEnabled: false,
    mutationAllowed: false,
    componentCreated: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, actionBridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewActionBridgeSchema;
