import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Bridges the sandbox PERMISSION preview metadata into dev-preview permission hints. Pure,
 * metadata-only. Fails closed: default deny, tenant required. These are contract hints, not
 * an enforcement engine.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} permission bridge schema
 */
export function createDevPreviewPermissionBridgeSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const p = isGenericModelPlainObject(o.sandbox?.permissionPreviewMetadata) ? o.sandbox.permissionPreviewMetadata : {};
  const scopes = Array.isArray(p.requiredScopes) ? p.requiredScopes.filter((x) => typeof x === 'string') : [];

  const core = {
    kind: 'dev-preview-permission-bridge-schema',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    defaultDeny: p.defaultDeny !== false,
    failClosed: p.failClosed !== false,
    tenantRequired: p.tenantRequired !== false,
    requiredScopes: scopes.length > 0 ? scopes : ['module:read'],
    enforcementEngine: false,
    grantsAccess: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, permissionBridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewPermissionBridgeSchema;
