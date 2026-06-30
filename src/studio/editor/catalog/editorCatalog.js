/** Editor Catalog — designers register tools, panels, commands, objects, behaviors, renderers */

export const EDITOR_CATALOG_VERSION = "mak-editor-catalog-v1";

/** @deprecated alias — use EDITOR_CATALOG_VERSION */
export const EDITOR_REGISTRY_VERSION = EDITOR_CATALOG_VERSION;

export function createEditorCatalog() {
  /** @type {Map<string, object>} */
  const designers = new Map();

  const registerDesigner = (definition) => {
    const designerId = definition.designerId;
    if (!designerId) throw new Error("Editor registration requires designerId.");
    if (typeof definition.mount !== "function") {
      throw new Error(`Editor registration for "${designerId}" requires mount().`);
    }
    designers.set(
      designerId,
      Object.freeze({
        ...definition,
        tools: Object.freeze(definition.tools ?? []),
        panels: Object.freeze(definition.panels ?? []),
        commands: Object.freeze(definition.commands ?? []),
        objects: Object.freeze(definition.objects ?? []),
        behaviors: Object.freeze(definition.behaviors ?? []),
        renderers: Object.freeze(definition.renderers ?? []),
        bridge: Object.freeze(definition.bridge ?? {}),
      })
    );
    return designerId;
  };

  const getDesigner = (designerId) => designers.get(designerId) ?? null;

  const hasDesigner = (designerId) => designers.has(designerId);

  const mount = (designerId, context) => {
    const def = designers.get(designerId);
    if (!def) return null;
    return def.mount(context);
  };

  const listDesigners = () => [...designers.keys()];

  const registerTool = (designerId, tool) => {
    const def = designers.get(designerId);
    if (!def) throw new Error(`Designer not registered: ${designerId}`);
    designers.set(designerId, Object.freeze({ ...def, tools: Object.freeze([...def.tools, tool]) }));
  };

  const registerPanel = (designerId, panel) => registerTool(designerId, panel);

  return Object.freeze({
    version: EDITOR_CATALOG_VERSION,
    registerDesigner,
    getDesigner,
    hasDesigner,
    mount,
    listDesigners,
    registerTool,
    registerPanel,
  });
}

let sharedCatalog = null;

export function getEditorCatalog() {
  if (!sharedCatalog) sharedCatalog = createEditorCatalog();
  return sharedCatalog;
}

/** @deprecated alias — use getEditorCatalog */
export const getEditorRegistry = getEditorCatalog;

/** @deprecated alias — use createEditorCatalog */
export const createEditorRegistry = createEditorCatalog;

export default createEditorCatalog;
