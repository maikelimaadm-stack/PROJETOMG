/**
 * @typedef {Object} PluginManifest
 * @property {string} pluginId
 * @property {string} [version]
 * @property {boolean} [enabled] Defaults to true when omitted.
 * @property {string[]} capabilities Capability/extension-point names this plugin is allowed to use.
 * @property {string} [permission] Permission code delegated to M09 before any capability executes.
 */

/**
 * @typedef {Object} IPlugin Loaded, frozen, normalized plugin — never the raw manifest.
 * @property {string} pluginId
 * @property {string} [version]
 * @property {boolean} enabled
 * @property {string[]} capabilities
 * @property {string} [permission]
 */

/**
 * @typedef {Object} ExtensionPoint
 * @property {string} name
 */

/**
 * @typedef {Object} PluginError_
 * @property {string} code
 * @property {string} message
 */

/**
 * @typedef {Object} PluginResult
 * @property {boolean} success
 * @property {unknown} [data]
 * @property {{code: string, message: string}} [error]
 */

/**
 * Plugin Engine (M18) — registry-driven, deterministic extension layer.
 * Never executes arbitrary external code: manifests are declarative data
 * (capabilities + permission), and every capability's actual behavior is a
 * host-registered function (`registerHandler`) — never loaded dynamically,
 * never `eval`'d, never imported at runtime from plugin-supplied code.
 * @typedef {Object} IPluginEngine
 * @property {(manifest: PluginManifest) => Promise<IPlugin>} load
 * @property {(pluginId: string) => Promise<void>} unload
 * @property {(name: string) => ExtensionPoint} getExtensionPoint
 */

export {};
