/** Document Engine — creation, serialization, migration, versioning (Program 2.2.5) */

export const DOCUMENT_ENGINE_VERSION = "mak-document-engine-v1";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {{ version: string, validate?: Function, freeze?: Function, migrations?: Record<string, Function> }} schema
 */
export function createDocumentEngine(schema) {
  const { version, validate, freeze, migrations = {} } = schema;

  const serialize = (document) => JSON.stringify(document);
  const deserialize = (json) => {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    return parsed;
  };

  const migrate = (document, targetVersion = version) => {
    let current = deepClone(document);
    let currentVersion = current.documentVersion ?? current.version ?? "unknown";
    const chain = [];
    while (currentVersion !== targetVersion && migrations[`${currentVersion}->${targetVersion}`]) {
      const key = `${currentVersion}->${targetVersion}`;
      chain.push(key);
      current = migrations[key](current);
      currentVersion = current.documentVersion ?? current.version ?? targetVersion;
    }
    if (currentVersion !== targetVersion && current.documentVersion !== targetVersion) {
      current = { ...current, documentVersion: targetVersion };
    }
    return Object.freeze({ document: current, migrated: chain.length > 0, chain });
  };

  const create = (partial = {}) => {
    const doc = {
      documentVersion: version,
      ...partial,
    };
    if (validate) {
      const result = validate(doc);
      if (!result.valid) throw new Error(result.errors.join(" "));
    }
    return freeze ? freeze(doc) : Object.freeze(doc);
  };

  return Object.freeze({
    version: DOCUMENT_ENGINE_VERSION,
    schemaVersion: version,
    create,
    serialize,
    deserialize,
    migrate,
    validate: validate ?? (() => ({ valid: true, errors: [] })),
  });
}

export function createDocumentStore(documentEngine, initialDocument = null) {
  let state = initialDocument ?? documentEngine.create();
  const listeners = new Set();
  const notify = () => listeners.forEach((cb) => cb(state));

  return Object.freeze({
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    replace(nextDocument) {
      const result = documentEngine.validate(nextDocument);
      if (!result.valid) throw new Error(result.errors.join(" "));
      state = documentEngine.create(nextDocument);
      notify();
      return state;
    },
    serialize: () => documentEngine.serialize(state),
    deserialize: (json) => {
      const doc = documentEngine.deserialize(json);
      const migrated = documentEngine.migrate(doc);
      state = documentEngine.create(migrated.document);
      notify();
      return state;
    },
  });
}

export default createDocumentEngine;
