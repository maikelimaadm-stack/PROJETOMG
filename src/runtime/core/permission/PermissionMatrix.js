import { PermissionError } from './errors.js';

/**
 * Evaluates the permission matrix from CRB registry `permission` entries.
 * Rule order: Deny > Allow (+ user grant) > Default deny.
 */
export class PermissionMatrix {
  /**
   * @param {Object} params
   * @param {string} params.action
   * @param {string} params.resource
   * @param {import('../registry/registryManager.js').RegistryManager} params.registry
   * @param {string[]} params.grantedPermissions AccessScope.permissions — codes granted to the user.
   * @returns {{ allowed: boolean, reason: 'deny'|'allow'|'not-granted'|'default-deny', code?: string }}
   */
  static evaluate({ action, resource, registry, grantedPermissions }) {
    const exactCode = `${resource}.${action}`;
    const wildcardCode = `${resource}.*`;

    const entries = [exactCode, wildcardCode]
      .filter((code) => registry.has('permission', code))
      .map((code) => registry.resolve('permission', code));

    const denyEntry = entries.find((entry) => PermissionMatrix._readEffect(entry) === 'deny');
    if (denyEntry) {
      return { allowed: false, reason: 'deny', code: denyEntry.code };
    }

    const allowEntry = entries.find((entry) => PermissionMatrix._readEffect(entry) === 'allow');
    if (allowEntry) {
      const granted = Array.isArray(grantedPermissions) && grantedPermissions.includes(allowEntry.code);
      return granted
        ? { allowed: true, reason: 'allow', code: allowEntry.code }
        : { allowed: false, reason: 'not-granted', code: allowEntry.code };
    }

    if (entries.length > 0) {
      throw new PermissionError(
        'MAK-L3-PERMISSION-003',
        `Invalid permission effect for code(s): ${entries.map((entry) => entry.code).join(', ')}`,
        { codes: entries.map((entry) => entry.code) },
      );
    }

    return { allowed: false, reason: 'default-deny' };
  }

  /**
   * @param {{ payload?: { effect?: string } }} entry
   */
  static _readEffect(entry) {
    return entry?.payload?.effect;
  }
}
