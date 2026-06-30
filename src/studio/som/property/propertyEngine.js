/** Property Engine — registrable properties independent of components (Program 2.2.6) */

export const PROPERTY_ENGINE_VERSION = "mak-som-property-v1";

export function createPropertyEngine() {
  /** @type {Map<string, { id: string, kind: string, defaultValue?: unknown, validate?: Function }>} */
  const schemas = new Map();

  const registerPropertySchema = ({ id, kind = "string", defaultValue, validate }) => {
    if (!id) throw new Error("Property schema requires id.");
    schemas.set(id, { id, kind, defaultValue, validate });
    return id;
  };

  const getSchema = (id) => schemas.get(id) ?? null;

  const resolveProperties = (object, extraSchemas = {}) => {
    const resolved = { ...(object.properties ?? object.props ?? {}) };
    schemas.forEach((schema, id) => {
      if (resolved[id] === undefined && schema.defaultValue !== undefined) {
        resolved[id] = schema.defaultValue;
      }
    });
    Object.entries(extraSchemas).forEach(([id, value]) => {
      if (resolved[id] === undefined) resolved[id] = value;
    });
    return Object.freeze(resolved);
  };

  const setValue = (object, propertyId, value) => {
    const schema = schemas.get(propertyId);
    if (schema?.validate) {
      const errors = schema.validate(value, object) ?? [];
      if (errors.length) throw new Error(errors.join(" "));
    }
    const props = { ...(object.properties ?? object.props ?? {}), [propertyId]: value };
    return Object.freeze({ ...object, properties: props, props });
  };

  const validateProperty = (propertyId, value, object = {}) => {
    const schema = schemas.get(propertyId);
    if (!schema?.validate) return { ok: true, errors: [] };
    const errors = schema.validate(value, object) ?? [];
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  };

  return Object.freeze({
    version: PROPERTY_ENGINE_VERSION,
    registerPropertySchema,
    getSchema,
    resolveProperties,
    setValue,
    validateProperty,
    listSchemas: () => [...schemas.keys()],
  });
}

export default createPropertyEngine;
