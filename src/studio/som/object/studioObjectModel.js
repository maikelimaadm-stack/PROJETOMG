/** Studio Object Model — official representation of editable elements (Program 2.2.6) */

export const OBJECT_MODEL_VERSION = "mak-som-object-v1";

/**
 * @typedef {object} SomObject
 * @property {string} objectId
 * @property {string} kind
 * @property {string} [label]
 * @property {Record<string, unknown>} attrs
 * @property {Record<string, unknown>} properties
 * @property {Array<object>} bindings
 * @property {Array<object>} behaviors
 * @property {Array<SomObject>} [children]
 */

export function createSomObject(partial = {}) {
  if (!partial.objectId || !partial.kind) {
    throw new Error("SomObject requires objectId and kind.");
  }
  return Object.freeze({
    objectVersion: OBJECT_MODEL_VERSION,
    objectId: partial.objectId,
    kind: partial.kind,
    label: partial.label ?? partial.objectId,
    attrs: Object.freeze({ ...(partial.attrs ?? {}) }),
    properties: Object.freeze({ ...(partial.properties ?? {}) }),
    bindings: Object.freeze((partial.bindings ?? []).map((b) => Object.freeze({ ...b }))),
    behaviors: Object.freeze((partial.behaviors ?? []).map((b) => Object.freeze({ ...b }))),
    children: Object.freeze((partial.children ?? []).map((c) => createSomObject(c))),
  });
}

export function createStudioObjectModel() {
  /** @type {Map<string, { kind: string, validate?: Function, toSom?: Function }>} */
  const schemas = new Map();

  const registerObjectSchema = ({ kind, validate, toSom }) => {
    if (!kind) throw new Error("Object schema requires kind.");
    schemas.set(kind, { kind, validate, toSom });
    return kind;
  };

  const toSomObject = (source, kind, overrides = {}) => {
    const schema = schemas.get(kind);
    const base = schema?.toSom ? schema.toSom(source) : source;
    return createSomObject({
      objectId: base.objectId ?? base.id ?? overrides.objectId,
      kind,
      label: base.label ?? overrides.label,
      attrs: base.attrs ?? base,
      properties: base.properties ?? base.props ?? {},
      bindings: base.bindings ?? [],
      behaviors: base.behaviors ?? [],
      children: base.children,
      ...overrides,
    });
  };

  const mapDocument = (document, mapper) => {
    if (typeof mapper !== "function") throw new Error("mapDocument requires mapper function.");
    return Object.freeze(mapper(document).map((obj) => (obj.objectVersion ? obj : createSomObject(obj))));
  };

  const validateObject = (object) => {
    const schema = schemas.get(object.kind);
    if (!schema?.validate) return { ok: true, errors: [] };
    const errors = schema.validate(object) ?? [];
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  };

  return Object.freeze({
    version: OBJECT_MODEL_VERSION,
    registerObjectSchema,
    createSomObject,
    toSomObject,
    mapDocument,
    validateObject,
    listSchemas: () => [...schemas.keys()],
  });
}

export default createStudioObjectModel;
