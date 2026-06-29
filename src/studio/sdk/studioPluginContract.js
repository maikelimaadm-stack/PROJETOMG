/**
 * Studio Plugin Contract — extension contract for Studio plugins (panels, editors, commands).
 */

/**
 * @typedef {object} StudioPluginContract
 * @property {string} pluginId
 * @property {string} designerId
 * @property {string} label
 * @property {string} [version]
 * @property {string[]} [entryTypes]
 * @property {object} [capabilities]
 */

/**
 * @param {StudioPluginContract} plugin
 */
export function validateStudioPlugin(plugin) {
  const errors = [];

  if (!plugin || typeof plugin !== "object") {
    return { valid: false, errors: ["Plugin contract must be an object."] };
  }
  if (!plugin.pluginId || typeof plugin.pluginId !== "string") {
    errors.push("pluginId is required.");
  }
  if (!plugin.designerId || typeof plugin.designerId !== "string") {
    errors.push("designerId is required.");
  }
  if (!plugin.label || typeof plugin.label !== "string") {
    errors.push("label is required.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * @param {StudioPluginContract} plugin
 */
export function defineStudioPlugin(plugin) {
  const validation = validateStudioPlugin(plugin);
  if (!validation.valid) {
    throw new Error(`defineStudioPlugin: ${validation.errors.join(" ")}`);
  }
  return Object.freeze({ ...plugin });
}

export default validateStudioPlugin;
