import { isOfficialBusEvent, registerBusEvent } from "../registry/eventBusRegistry.js";
import { validateEventManifest } from "../contracts/eventManifestContract.js";

/**
 * Plugin Event Contract — plugins may publish/listen but cannot override official events.
 * @param {object} plugin
 * @param {string} plugin.pluginId
 * @param {string} plugin.designerId
 */

export function validatePluginEventRegistration(eventId, manifest) {
  const errors = [];
  if (isOfficialBusEvent(eventId)) {
    errors.push(`Official event "${eventId}" cannot be re-registered by plugins.`);
  }
  const validation = validateEventManifest({ eventId, ...manifest });
  if (!validation.valid) errors.push(...validation.errors);
  if (manifest?.origin && !manifest.origin.startsWith("plugin:")) {
    errors.push('Plugin event origin must start with "plugin:".');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * @param {ReturnType<import("../hub/studioEventHub.js").createStudioEventHub>} hub
 * @param {object} plugin
 */
export function createPluginEventBridge(hub, plugin) {
  if (!plugin?.pluginId) throw new Error("createPluginEventBridge: pluginId required.");

  const pluginOrigin = `plugin:${plugin.pluginId}`;

  return Object.freeze({
    pluginId: plugin.pluginId,
    designerId: plugin.designerId,
    publish: (eventId, payload, options = {}) =>
      hub.publish(eventId, payload, { ...options, origin: options.origin ?? pluginOrigin }),
    subscribe: (eventId, handler, options = {}) => hub.subscribe(eventId, handler, options),
    once: (eventId, handler, options = {}) => hub.once(eventId, handler, options),
    unsubscribe: (subscriptionId) => hub.unsubscribe(subscriptionId),
    registerExtensionEvent: (eventId, manifest) => {
      const validation = validatePluginEventRegistration(eventId, {
        ...manifest,
        origin: manifest.origin ?? pluginOrigin,
        category: manifest.category ?? "plugin",
      });
      if (!validation.valid) {
        throw new Error(`registerExtensionEvent: ${validation.errors.join(" ")}`);
      }
      registerBusEvent(eventId, { eventId, ...manifest, origin: manifest.origin ?? pluginOrigin }, {
        official: false,
      });
      return eventId;
    },
  });
}

export default createPluginEventBridge;
