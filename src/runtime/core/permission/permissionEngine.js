import { PermissionMatrix } from './PermissionMatrix.js';
import { PermissionError } from './errors.js';

/**
 * Permission Engine (M09) — fail-closed matrix: deny > allow > default deny.
 * @implements {import('../../types/permission.js').IPermissionEngine}
 */
export class PermissionEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   */
  constructor(options = {}) {
    const { registry } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new PermissionError(
        'MAK-L3-PERMISSION-001',
        'PermissionEngine requires a valid registry (IRegistry) instance',
      );
    }
    this._registry = registry;
  }

  /**
   * @param {string} action
   * @param {string} resource
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} context
   * @returns {Promise<boolean>}
   */
  async can(action, resource, context) {
    if (!isNonEmptyString(action) || !isNonEmptyString(resource)) {
      return false;
    }
    if (!hasValidAccessScope(context)) {
      return false;
    }
    if (!this._registry || typeof this._registry.has !== 'function') {
      return false;
    }

    const result = PermissionMatrix.evaluate({
      action,
      resource,
      registry: this._registry,
      grantedPermissions: context.accessScope.permissions,
    });

    return result.allowed;
  }

  /**
   * @template {Object} T
   * @param {T[]} items
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} context
   * @returns {Promise<T[]>}
   */
  async filterVisible(items, context) {
    if (!Array.isArray(items)) {
      throw new PermissionError('MAK-L3-PERMISSION-002', 'filterVisible requires an array of items');
    }

    const decisions = await Promise.all(
      items.map(async (item) => {
        const code = extractPermissionCode(item);
        if (!code) {
          // No permission metadata on the item — treated as a public element (no filtering claim to make).
          return { item, visible: true };
        }
        const { resource, action } = splitPermissionCode(code);
        let visible;
        try {
          visible = await this.can(action, resource, context);
        } catch {
          visible = false; // fail-closed on any evaluation error
        }
        return { item, visible };
      }),
    );

    return decisions.filter((decision) => decision.visible).map((decision) => decision.item);
  }
}

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/** @param {unknown} context */
function hasValidAccessScope(context) {
  return Boolean(
    context &&
      typeof context === 'object' &&
      /** @type {{accessScope?: unknown}} */ (context).accessScope &&
      Array.isArray(/** @type {{accessScope?: {permissions?: unknown}}} */ (context).accessScope.permissions),
  );
}

/**
 * Extracts a permission code from a UI element / route entry.
 * Recognizes `permission`, `requiredPermission`, or `resource` + `action`.
 * @param {Object} item
 */
function extractPermissionCode(item) {
  if (!item || typeof item !== 'object') return undefined;
  if (typeof item.permission === 'string' && item.permission) return item.permission;
  if (typeof item.requiredPermission === 'string' && item.requiredPermission) return item.requiredPermission;
  if (typeof item.resource === 'string' && item.resource && typeof item.action === 'string' && item.action) {
    return `${item.resource}.${item.action}`;
  }
  return undefined;
}

/** @param {string} code */
function splitPermissionCode(code) {
  const idx = code.lastIndexOf('.');
  if (idx === -1) return { resource: code, action: '*' };
  return { resource: code.slice(0, idx), action: code.slice(idx + 1) };
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @returns {PermissionEngine}
 */
export function createPermissionEngine(options) {
  return new PermissionEngine(options);
}

export { PermissionError };
