import { validateStudioPlugin } from "../studioPluginContract.js";

/**
 * Plugin API — designer plugin registration contract.
 */
export function createPluginApi() {
  const plugins = new Map();

  return Object.freeze({
    register: (plugin) => {
      const validation = validateStudioPlugin(plugin);
      if (!validation.valid) {
        throw new Error(`Invalid studio plugin: ${validation.errors.join(" ")}`);
      }
      plugins.set(plugin.pluginId, Object.freeze({ ...plugin }));
      return plugin.pluginId;
    },
    unregister: (pluginId) => plugins.delete(pluginId),
    get: (pluginId) => plugins.get(pluginId) ?? null,
    list: () => [...plugins.values()],
    listByDesigner: (designerId) =>
      [...plugins.values()].filter((plugin) => plugin.designerId === designerId),
  });
}

export default createPluginApi;
