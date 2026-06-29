/** Object Identity System — semantic stable IDs for editable objects (Program 2.2.6) */

export const OBJECT_IDENTITY_VERSION = "mak-som-identity-v1";

const ID_PATTERN = /^([a-z][a-z0-9]*)\.([a-z][a-z0-9-]*)\.([a-zA-Z0-9._-]+)$/;

export function createObjectIdentitySystem(options = {}) {
  const separator = options.separator ?? ".";
  /** @type {Map<string, string>} */
  const aliasMap = new Map();

  const generateId = ({ namespace, kind, semanticKey, suffix = null }) => {
    if (!namespace || !kind || !semanticKey) {
      throw new Error("generateId requires namespace, kind, and semanticKey.");
    }
    const safeNamespace = String(namespace).replace(/[^a-z0-9]/gi, "").toLowerCase();
    const safeKind = String(kind).replace(/[^a-z0-9]/gi, "").toLowerCase();
    const safeKey = String(semanticKey).replace(/[^a-zA-Z0-9._-]/g, "");
    const base = [safeNamespace, safeKind, safeKey].join(separator);
    if (suffix != null) return `${base}${separator}${suffix}`;
    return base;
  };

  const generateUniqueId = ({ namespace, kind, semanticKey }) =>
    generateId({ namespace, kind, semanticKey, suffix: Date.now() });

  const parseId = (objectId) => {
    const match = String(objectId).match(ID_PATTERN);
    if (!match) {
      return Object.freeze({ valid: false, namespace: null, kind: null, semanticKey: objectId });
    }
    return Object.freeze({
      valid: true,
      namespace: match[1],
      kind: match[2],
      semanticKey: match[3],
    });
  };

  const isStableId = (objectId) => {
    const parsed = parseId(objectId);
    return parsed.valid && !parsed.semanticKey.includes(String(Date.now()).slice(0, 8));
  };

  const registerAlias = (alias, canonicalId) => {
    aliasMap.set(alias, canonicalId);
    return canonicalId;
  };

  const resolveId = (objectId) => aliasMap.get(objectId) ?? objectId;

  const renameId = (oldId, newId) => {
    registerAlias(oldId, newId);
    return Object.freeze({ oldId, newId, ok: true });
  };

  return Object.freeze({
    version: OBJECT_IDENTITY_VERSION,
    generateId,
    generateUniqueId,
    parseId,
    isStableId,
    registerAlias,
    resolveId,
    renameId,
  });
}

export default createObjectIdentitySystem;
