/**
 * Registro global de tipos de campo do motor corporativo.
 */

/** @type {Map<string, object>} */
const registry = new Map();

/**
 * @param {string} type
 * @param {{
 *   id: string,
 *   type: string,
 *   renderer?: string,
 *   editor?: string,
 *   validator?: Function,
 *   formatter?: Function,
 *   parser?: Function,
 *   layoutBehavior?: 'compact'|'expansive'|'inline-media',
 *   aliases?: string[],
 * }} definition
 */
export function registerFieldType(type, definition) {
  const key = String(type || "").toLowerCase();
  registry.set(key, { ...definition, type: key });
  (definition.aliases || []).forEach((alias) => {
    registry.set(String(alias).toLowerCase(), { ...definition, type: key });
  });
}

export function getFieldTypeDefinition(type) {
  return registry.get(String(type || "text").toLowerCase()) || registry.get("text");
}

export function listFieldTypes() {
  const seen = new Set();
  const list = [];
  registry.forEach((def, key) => {
    if (seen.has(def.type)) return;
    seen.add(def.type);
    list.push(def);
  });
  return list;
}

export function inferRegisteredLayoutBehavior(field) {
  const def = getFieldTypeDefinition(field?.type);
  if (def?.layoutBehavior) return def.layoutBehavior;
  if (field?.wide || field?.layoutExpand) return "expansive";
  return "compact";
}
