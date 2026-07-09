/**
 * Permission Engine types (M09).
 * @see docs/runtime-implementation/03-INTERFACES.md#IPermissionEngine
 */

/**
 * @typedef {'allow'|'deny'} PermissionEffect
 */

/**
 * @typedef {Object} PermissionRegistryEntry
 * @property {string} code
 * @property {string} objectType
 * @property {{ effect?: PermissionEffect }} [payload]
 * @property {string} [moduleId]
 */

/**
 * @typedef {Object} PermissionDecision
 * @property {boolean} allowed
 * @property {'deny'|'allow'|'not-granted'|'default-deny'} reason
 * @property {string} [code]
 */

/**
 * @typedef {Object} ResourceRef
 * @property {string} type
 * @property {string} [id]
 */

/**
 * @typedef {Object} UiElement
 * @property {string} [permission] Full permission code, e.g. "empresa.delete".
 * @property {string} [requiredPermission] Alias for `permission`.
 * @property {string} [resource]
 * @property {string} [action]
 */

/**
 * @typedef {Object} IPermissionEngine
 * @property {(action: string, resource: string, context: unknown) => Promise<boolean>} can
 * @property {<T extends UiElement>(elements: T[], context: unknown) => Promise<T[]>} filterVisible
 */

export {};
