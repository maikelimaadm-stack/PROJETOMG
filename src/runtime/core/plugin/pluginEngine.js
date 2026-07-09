import { PluginError } from './errors.js';

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * @param {unknown} manifest
 * @returns {manifest is import('../../types/plugin.js').PluginManifest}
 */
function isValidManifestShape(manifest) {
  if (!manifest || typeof manifest !== 'object') return false;
  const m = /** @type {Record<string, unknown>} */ (manifest);
  if (!isNonEmptyString(m.pluginId)) return false;
  if (m.capabilities !== undefined && (!Array.isArray(m.capabilities) || !m.capabilities.every((c) => isNonEmptyString(c)))) {
    return false;
  }
  if (m.enabled !== undefined && typeof m.enabled !== 'boolean') return false;
  if (m.permission !== undefined && !isNonEmptyString(m.permission)) return false;
  if (m.version !== undefined && !isNonEmptyString(m.version)) return false;
  return true;
}

/** @param {string} pluginId @param {string} capability */
function handlerKey(pluginId, capability) {
  return `${pluginId}::${capability}`;
}

/**
 * Plugin Engine (M18) — registry-driven, deterministic extension layer.
 * Manifests are declarative data resolved from the CRB `plugin` registry
 * (RT-C-17); actual capability behavior is always a host-registered
 * function (`registerHandler`) — this engine never executes code loaded
 * from a manifest string, never `eval`s, never uses `new Function`, never
 * performs a dynamic `import()` of plugin-supplied code, never installs a
 * dependency, never fetches an external package. Delegates permission
 * checks to M09; never queries Prisma/MMM; never wraps Action/Execution.
 * @implements {import('../../types/plugin.js').IPluginEngine}
 */
export class PluginEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   * @param {string[]} [options.extensionPoints] Extension points known at construction time.
   */
  constructor(options = {}) {
    const { registry, permissionEngine, extensionPoints = [] } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new PluginError('MAK-L3-PLUGIN-001', 'PluginEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._permissionEngine = permissionEngine ?? null;
    /** @type {Map<string, import('../../types/plugin.js').ExtensionPoint>} */
    this._extensionPoints = new Map();
    for (const name of extensionPoints) {
      this.registerExtensionPoint(name);
    }
    /** @type {Map<string, import('../../types/plugin.js').IPlugin>} */
    this._loaded = new Map();
    /** @type {Map<string, Function>} */
    this._handlers = new Map();
  }

  /**
   * SSOT-literal entry point (`IPluginEngine.load`) — validates a manifest
   * object structurally and caches the normalized, frozen plugin. Never
   * touches the registry; the caller supplies the manifest directly.
   * @param {import('../../types/plugin.js').PluginManifest} manifest
   * @returns {Promise<import('../../types/plugin.js').IPlugin>}
   */
  async load(manifest) {
    if (!isValidManifestShape(manifest)) {
      throw new PluginError('MAK-L3-PLUGIN-003', `Invalid plugin manifest shape: ${JSON.stringify(manifest)}`);
    }
    /** @type {import('../../types/plugin.js').IPlugin} */
    const plugin = Object.freeze({
      pluginId: manifest.pluginId,
      version: manifest.version,
      enabled: manifest.enabled !== false,
      capabilities: Object.freeze([...(manifest.capabilities ?? [])]),
      permission: manifest.permission,
    });
    this._loaded.set(plugin.pluginId, plugin);
    return plugin;
  }

  /** @param {string} pluginId */
  async unload(pluginId) {
    this._loaded.delete(pluginId);
    for (const key of [...this._handlers.keys()]) {
      if (key.startsWith(`${pluginId}::`)) this._handlers.delete(key);
    }
  }

  /**
   * Registry-driven resolution — loads the manifest from the CRB `plugin`
   * registry bucket (hydrated by M06, keyed by `objectId`) and delegates to
   * `load()`. Never queries Prisma/MMM — registry only.
   * @param {string} pluginId
   * @returns {Promise<import('../../types/plugin.js').IPlugin>}
   */
  async resolve(pluginId) {
    if (!isNonEmptyString(pluginId) || !this._registry.has('plugin', pluginId)) {
      throw new PluginError('MAK-L3-PLUGIN-002', `Unknown plugin: ${pluginId}`);
    }
    const record = this._registry.resolve('plugin', pluginId);
    const manifest = { pluginId, ...(record?.payload ?? {}) };
    return this.load(manifest);
  }

  /**
   * @param {string} name
   * @param {Object} [metadata]
   */
  registerExtensionPoint(name, metadata = {}) {
    if (!isNonEmptyString(name)) {
      throw new PluginError('MAK-L3-PLUGIN-003', 'registerExtensionPoint() requires a non-empty name');
    }
    this._extensionPoints.set(name, Object.freeze({ name, ...metadata }));
  }

  /** @param {string} name */
  getExtensionPoint(name) {
    if (!this._extensionPoints.has(name)) {
      throw new PluginError('MAK-L3-PLUGIN-004', `Unknown extension point: ${name}`);
    }
    return /** @type {import('../../types/plugin.js').ExtensionPoint} */ (this._extensionPoints.get(name));
  }

  /**
   * Binds the actual behavior for a plugin capability. Handlers are always
   * host-supplied functions — never derived from plugin manifest data,
   * never `eval`'d, never dynamically imported.
   * @param {string} pluginId
   * @param {string} capability
   * @param {(payload: unknown, ctx: unknown, plugin: import('../../types/plugin.js').IPlugin) => unknown} handler
   */
  registerHandler(pluginId, capability, handler) {
    if (!isNonEmptyString(pluginId) || !isNonEmptyString(capability)) {
      throw new PluginError('MAK-L3-PLUGIN-003', 'registerHandler() requires a non-empty pluginId and capability');
    }
    if (typeof handler !== 'function') {
      throw new PluginError('MAK-L3-PLUGIN-003', `Handler for plugin "${pluginId}" capability "${capability}" must be a function`);
    }
    this._handlers.set(handlerKey(pluginId, capability), handler);
  }

  /**
   * Executes a capability for a resolved/loaded plugin. Structural
   * conditions (unknown plugin, invalid manifest, unknown extension point)
   * throw `PluginError`; business/operational outcomes (disabled plugin,
   * capability not permitted, missing dependency, permission denied,
   * handler failure) are returned as a `PluginResult` — never thrown.
   * @param {string} pluginId
   * @param {string} capability
   * @param {unknown} payload
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} [ctx]
   * @returns {Promise<import('../../types/plugin.js').PluginResult>}
   */
  async execute(pluginId, capability, payload, ctx) {
    if (!isNonEmptyString(capability)) {
      throw new PluginError('MAK-L3-PLUGIN-004', 'execute() requires a non-empty capability name');
    }
    this.getExtensionPoint(capability); // throws MAK-L3-PLUGIN-004 if unknown

    const plugin = this._loaded.get(pluginId) ?? (await this.resolve(pluginId));

    if (!plugin.enabled) {
      return errorResult('MAK-L3-PLUGIN-005', `Plugin "${pluginId}" is disabled`);
    }
    if (!plugin.capabilities.includes(capability)) {
      return errorResult('MAK-L3-PLUGIN-006', `Plugin "${pluginId}" is not permitted to use capability "${capability}"`);
    }

    if (plugin.permission) {
      if (!this._permissionEngine) {
        return errorResult('MAK-L3-PLUGIN-007', `Plugin "${pluginId}" requires the Permission Engine but none is wired`);
      }
      const allowed = await this._checkPermission(plugin.permission, ctx);
      if (!allowed) {
        return errorResult('MAK-L3-PLUGIN-008', `Plugin "${pluginId}" capability "${capability}" denied by Permission Engine`);
      }
    }

    const handler = this._handlers.get(handlerKey(pluginId, capability));
    if (!handler) {
      return errorResult('MAK-L3-PLUGIN-007', `No handler bound for plugin "${pluginId}" capability "${capability}"`);
    }

    try {
      const data = await handler(payload, ctx, plugin);
      return { success: true, data };
    } catch (err) {
      return errorResult('MAK-L3-PLUGIN-009', err instanceof Error ? err.message : 'Plugin handler failed');
    }
  }

  /**
   * @param {string} code Permission code, e.g. "empresas_plugin.export".
   * @param {unknown} ctx
   */
  async _checkPermission(code, ctx) {
    if (!this._permissionEngine) return false;
    const idx = code.lastIndexOf('.');
    const resource = idx === -1 ? code : code.slice(0, idx);
    const action = idx === -1 ? 'execute' : code.slice(idx + 1);
    try {
      return await this._permissionEngine.can(action, resource, ctx);
    } catch {
      return false;
    }
  }
}

/**
 * @param {import('./errors.js').PluginErrorCode} code
 * @param {string} message
 * @returns {import('../../types/plugin.js').PluginResult}
 */
function errorResult(code, message) {
  return { success: false, error: { code, message } };
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @param {string[]} [options.extensionPoints]
 * @returns {PluginEngine}
 */
export function createPluginEngine(options) {
  return new PluginEngine(options);
}

export { PluginError };
